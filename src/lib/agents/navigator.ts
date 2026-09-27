import type { A11yActionNode, AccessibilityTree, CognitiveLoadReport } from "@/types/a11y";
import type { Persona } from "@/types/persona";
import {
  ABANDON,
  type AgentAction,
  type NavigatorDecision,
  type NavigatorRequest,
  type NavigatorResponse,
} from "@/types/simulation";
import { analyzeCognitiveLoad } from "../a11y/cognitive-load";
import { SCROLL_DOWN, SCROLL_UP } from "../a11y/extract";
import { FLOWS } from "../bank/flows";
import { optimalAction } from "../bank/oracle";
import { PROFESSION_LABELS, literacyBand } from "../personas/config";
import { clamp, createRng, hashSeed, logNormal, pick, type Rng } from "../random";
import { DEFAULT_MOCK_LATENCY_MS, callLLM, getLlmMode, parseJsonResponse, simulateLatency, type LlmPrompt } from "../llm/client";

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const NAVIGATOR_SYSTEM = `Você é um agente de simulação de usabilidade. Você NÃO é um assistente: você interpreta um cliente real do Itaú navegando no aplicativo do banco pelo celular.

Modelo: a navegação é um Processo de Decisão de Markov. O estado s é a Árvore de Acessibilidade da tela atual; as ações A são os elementos com "id". Você amostra a próxima ação a ~ π(a|s) de acordo com o perfil da persona — não de acordo com o que seria ótimo.

Regras de comportamento (obrigatórias):
1. Aja estritamente com o conhecimento, a paciência e a habilidade digital da persona.
2. Literacia digital baixa (< 0.4) + carga cognitiva alta da tela ⇒ a persona lê devagar, não entende jargões (CET, IOF, Selic, amortização, CCB…), tende a não perceber elementos de baixo destaque ("prominence": "low") ou fora da área visível ("inViewport": false) e pode tocar no lugar errado, voltar ou ABANDONAR.
3. Elementos com "inViewport": false só podem ser usados após "scroll-down". Personas com baixa literacia frequentemente não sabem que precisam rolar.
4. Mensagens de erro ("role": "alert") e repetição de telas aumentam a frustração e a chance de abandono, proporcionalmente à taxa de rejeição da persona.
5. "think_time_ms" é o tempo humano simulado para ler a tela e decidir: aumente-o com a quantidade de texto, jargões, idade avançada e baixa literacia.
6. Para inputs, forneça "value" como a persona digitaria (ela pode digitar em formato inválido).

Responda SOMENTE com JSON:
{"action_id": "<id de uma ação existente> | ABANDONAR", "value": "<texto, só para inputs>", "reasoning": "<1-2 frases em 1ª pessoa, na voz da persona>", "think_time_ms": <inteiro>, "confidence": <0..1>}`;

function describePersona(p: Persona): string {
  const d = p.demographics;
  return [
    `Nome: ${p.name} | Idade: ${d.age} | Profissão: ${PROFESSION_LABELS[d.profession]} | UF: ${p.security.uf}`,
    `Renda mensal: R$ ${d.income} | Saldo: R$ ${p.financial.balance.toFixed(2)} | Produtos: ${p.financial.products.join(", ") || "nenhum"}`,
    `Literacia digital: ${d.digitalLiteracy} (${literacyBand(d.digitalLiteracy)}) | Transações/mês: ${p.financial.monthlyTransactions}`,
    `Sessão média: ${p.digital.avgSessionSec}s | Taxa de rejeição típica: ${p.digital.bounceRate}`,
    `Dispositivo: ${p.security.os} ${p.security.deviceTier}`,
  ].join("\n");
}

function compactTree(tree: AccessibilityTree) {
  return {
    screenId: tree.screenId,
    title: tree.screenTitle,
    canScrollDown: tree.canScrollDown,
    texts: tree.texts.map((t) => ({ role: t.role, text: t.text, inViewport: t.inViewport })),
    actions: tree.actions.map((a) => ({
      id: a.id,
      role: a.role,
      label: a.label,
      ...(a.value !== undefined && { value: a.value }),
      ...(a.checked !== undefined && { checked: a.checked }),
      inViewport: a.inViewport,
      prominence: a.prominence,
      y: a.bounds.y,
    })),
  };
}

export function buildNavigatorPrompt(req: NavigatorRequest, load: CognitiveLoadReport): LlmPrompt {
  const flow = FLOWS[req.flowId];
  const history = req.history
    .slice(-8)
    .map((h) => `#${h.step} [${h.screenId}] → ${h.actionId}${h.value ? ` "${h.value}"` : ""}${h.errorShown ? " (erro exibido)" : ""}`)
    .join("\n");

  const user = `## Persona
${describePersona(req.persona)}

## Objetivo
${flow.goal}

## Passo ${req.step + 1} de no máximo ${flow.maxSteps}
Histórico recente:
${history || "(início da sessão)"}

## Carga cognitiva estimada da tela: ${load.score} (${load.level})
${load.reasons.map((r) => `- ${r}`).join("\n") || "- Sem fatores relevantes."}

## Árvore de acessibilidade (estado s)
${JSON.stringify(compactTree(req.tree))}

Qual a próxima ação desta persona?`;

  return { system: NAVIGATOR_SYSTEM, user };
}

// ---------------------------------------------------------------------------
// Política mockada π(a|s): ε-greedy em torno do oráculo, com ε enviesado pela persona
// ---------------------------------------------------------------------------

const GARBLED_AMOUNTS = ["cinco mil", "R$ 3 mil", "dez mil reais"];

interface Frustration {
  errors: number;
  suboptimal: number;
  screenRepeats: number;
}

function frustrationOf(req: NavigatorRequest): Frustration {
  const h = req.history;
  const current = req.tree.screenId;
  let screenRepeats = 0;
  for (let i = h.length - 1; i >= 0 && h[i].screenId === current; i--) screenRepeats++;
  return {
    errors: h.filter((s) => s.errorShown).length,
    suboptimal: h.filter((s) => !s.optimal).length,
    screenRepeats,
  };
}

function thinkTime(rng: Rng, persona: Persona, load: CognitiveLoadReport, factor = 1): number {
  const d = persona.demographics.digitalLiteracy;
  const reading = (load.wordCount * 230) / (0.35 + d); // ~ms por palavra, mais lento com baixa literacia
  const decoding = load.score * 6000 * (1 - d) + load.jargonTerms.length * 700 * (1 - d);
  const ageFactor = persona.demographics.age >= 60 ? 1.35 : persona.demographics.age >= 45 ? 1.12 : 1;
  const base = (900 + reading * 0.35 + decoding) * ageFactor * factor;
  return Math.round(logNormal(rng, base, 0.25));
}

export function mockNavigatorPolicy(
  req: NavigatorRequest,
  load: CognitiveLoadReport,
  optimal: AgentAction | null,
): NavigatorDecision {
  const rng = createRng(hashSeed(req.seed, req.step, 0x9e37));
  const persona = req.persona;
  const d = persona.demographics.digitalLiteracy;
  const L = load.score;
  const flow = FLOWS[req.flowId];
  const fr = frustrationOf(req);
  const patience = 1 - persona.digital.bounceRate;

  if (!optimal) {
    return { action_id: ABANDON, reasoning: "Não sei mais o que fazer aqui.", think_time_ms: thinkTime(rng, persona, load, 0.5), confidence: 0.2 };
  }

  const target = req.tree.actions.find((a) => a.id === optimal.actionId);

  // Probabilidade de abandonar neste passo
  const gap = Math.max(0, L - d);
  const frustration = 0.12 * fr.errors + 0.02 * fr.suboptimal + 0.06 * Math.max(0, fr.screenRepeats - 4);
  const lateSession = req.step > flow.maxSteps * 0.6 ? 0.08 : 0;
  const pAbandon = clamp(0.004 + 0.3 * gap * gap + frustration * (1.2 - patience) + lateSession, 0, 0.85);

  // Probabilidade de escolher a ação ótima
  let pCorrect = 0.5 + 0.48 * d - 0.45 * L * (1 - d);
  if (optimal.actionId === SCROLL_DOWN) pCorrect *= 0.35 + 0.65 * d; // não percebe que precisa rolar
  if (target?.prominence === "low") pCorrect *= 0.45 + 0.55 * d; // não enxerga elemento apagado
  pCorrect = clamp(pCorrect, 0.05, 0.98);

  if (rng() < pAbandon) {
    const why =
      fr.errors > 0
        ? "Apareceu erro de novo e não entendi o que está errado. Vou desistir e ir na agência."
        : gap > 0.25
          ? `Tem muita palavra difícil aqui${load.jargonTerms.length ? ` (${load.jargonTerms.slice(0, 2).join(", ")})` : ""}. Não confio em continuar.`
          : "Está demorando demais, vou deixar para depois.";
    return { action_id: ABANDON, reasoning: why, think_time_ms: thinkTime(rng, persona, load, 0.8), confidence: round(1 - pAbandon) };
  }

  if (rng() < pCorrect) {
    let value = optimal.value;
    if (optimal.actionId === "loan-amount" && rng() < (1 - d) * 0.3) value = pick(rng, GARBLED_AMOUNTS);
    return {
      action_id: optimal.actionId,
      ...(value !== undefined && { value }),
      reasoning: reasonFor(optimal.actionId, target, true),
      think_time_ms: thinkTime(rng, persona, load),
      confidence: round(pCorrect),
    };
  }

  // Desvio: toca em outro elemento visível (ou não encontra nada e volta)
  const candidates = req.tree.actions.filter(
    (a) => a.id !== optimal.actionId && a.inViewport && !a.disabled && a.id !== SCROLL_UP,
  );
  const wrong = candidates.length ? pick(rng, candidates) : null;
  if (!wrong) {
    return { action_id: "back", reasoning: "Não achei o que procurava, vou voltar.", think_time_ms: thinkTime(rng, persona, load, 1.4), confidence: 0.3 };
  }
  return {
    action_id: wrong.id,
    ...(wrong.role === "input" && { value: wrong.id === "loan-amount" ? pick(rng, GARBLED_AMOUNTS) : "?" }),
    reasoning: reasonFor(wrong.id, wrong, false),
    think_time_ms: thinkTime(rng, persona, load, 1.5),
    confidence: round(1 - pCorrect),
  };
}

const round = (v: number) => Math.round(v * 100) / 100;

function reasonFor(actionId: string, node: A11yActionNode | undefined, confident: boolean): string {
  const label = node?.label ? `"${node.label}"` : actionId;
  if (actionId === SCROLL_DOWN) return confident ? "Deve ter mais coisa embaixo, vou rolar a tela." : "Vou rolar para ver se acho alguma coisa.";
  if (actionId === "back") return "Acho que entrei no lugar errado, vou voltar.";
  if (node?.role === "input") return `Vou preencher o campo ${label}.`;
  if (node?.role === "checkbox") return confident ? `Preciso marcar ${label} para seguir.` : `Não sei bem o que é ${label}, vou tocar para ver.`;
  return confident ? `Parece que ${label} é o caminho.` : `Talvez seja em ${label}? Vou tentar.`;
}

// ---------------------------------------------------------------------------
// Orquestração
// ---------------------------------------------------------------------------

/** Garante que a decisão referencia uma ação existente na árvore. */
export function sanitizeDecision(decision: NavigatorDecision, tree: AccessibilityTree): NavigatorDecision {
  const valid = decision.action_id === ABANDON || tree.actions.some((a) => a.id === decision.action_id);
  return {
    action_id: valid ? decision.action_id : ABANDON,
    value: decision.value,
    reasoning: valid ? decision.reasoning : `[ação inválida "${decision.action_id}"] ${decision.reasoning}`,
    think_time_ms: clamp(Math.round(Number(decision.think_time_ms) || 3000), 200, 120_000),
    confidence: clamp(Number(decision.confidence) || 0.5, 0, 1),
  };
}

export async function runNavigator(req: NavigatorRequest): Promise<NavigatorResponse> {
  const cognitiveLoad = analyzeCognitiveLoad(req.tree);
  const prompt = buildNavigatorPrompt(req, cognitiveLoad);
  const optimal = optimalAction(req.flowId, req.tree, req.persona, createRng(hashSeed(req.seed, req.step, 0x51ed)));
  const mode = getLlmMode();

  let decision: NavigatorDecision;
  if (mode === "mock") {
    await simulateLatency(req.mockLatencyMs ?? DEFAULT_MOCK_LATENCY_MS);
    decision = mockNavigatorPolicy(req, cognitiveLoad, optimal);
  } else {
    decision = parseJsonResponse<NavigatorDecision>(await callLLM(prompt));
  }

  return {
    decision: sanitizeDecision(decision, req.tree),
    cognitiveLoad,
    optimalActionId: optimal?.actionId ?? null,
    prompt,
    mode,
  };
}
