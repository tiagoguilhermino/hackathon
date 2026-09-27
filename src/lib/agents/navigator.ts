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
import { acceptableActionIds, optimalAction } from "../bank/oracle";
import { PROFESSION_LABELS, literacyBand } from "../personas/config";
import { clamp, createRng, hashSeed, logNormal, pick, type Rng } from "../random";
import * as z from "zod/v4";
import { DEFAULT_MOCK_LATENCY_MS, callLLM, getLlmMode, simulateLatency, type LlmPrompt } from "../llm/client";

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------

const NAVIGATOR_SYSTEM = `Você está participando de um teste de usabilidade simulado de um aplicativo bancário. Seu papel é interpretar, de forma fiel e realista, UM cliente específico (a persona descrita pelo usuário) usando o app do Itaú no celular pela primeira vez. Você não é um assistente e não conhece este app: você só sabe o que aparece na tela.

A cada passo você recebe o estado da tela como uma árvore de acessibilidade: "textos" é o que está escrito ("# " = título, "[ERRO]" = mensagem de erro, "[abaixo da dobra]" = fora da área visível) e "acoes" são os elementos que a pessoa pode tocar (identificados por "id"). Você escolhe UMA ação — exatamente o que essa pessoa faria agora — ou "ABANDONAR" se ela desistiria do objetivo.

O valor deste teste está em revelar onde pessoas reais têm dificuldade. Um agente que sempre acerta o caminho é inútil para o estudo. Portanto, simule a persona, não a resposta correta:
- Leia a tela como ela leria. Se ela não entende um termo (CET, IOF, Selic, amortização, prestamista, CCB…), ela não entende — pode hesitar, tocar em algo para "ver o que é", voltar ou desistir por insegurança.
- "rolagem" diz onde a pessoa está na página. Ações com "visivel": false estão fora da área visível e a pessoa não as vê. Ela só os alcança com "scroll-down", e só se imaginar que há mais conteúdo. Pessoas com pouca familiaridade digital muitas vezes não rolam.
- Ações com "destaque": "baixo" são apagadas/de baixo contraste. Isso as torna mais difíceis de perceber, não invisíveis: quem enxerga pior ou tem pouca prática pode demorar a notá-las ou achar que estão desabilitadas, mas quem procura com atenção acaba encontrando.
- Textos marcados com [ERRO] são mensagens de erro. Erros repetidos e voltas em círculo aumentam a frustração; pessoas impacientes (taxa de rejeição alta) desistem mais cedo.
- Pessoas reais não repetem a mesma ação indefinidamente. Se o histórico mostra que ela já tentou algo várias vezes sem progresso (ex.: rolar para cima e para baixo), ela tenta algo diferente (tocar no que parece mais provável, voltar) ou desiste — escolha o que for mais coerente com a paciência dela.
- Pessoas com alta literacia digital navegam com rapidez e confiança, mas também podem desistir se algo parecer arriscado ou confuso.
- Em campos de texto, escreva o que a pessoa digitaria de fato, inclusive formatos que o app pode não aceitar (ex.: "5 mil").

Campos da resposta:
- action_id: um "id" existente na lista de ações, ou "ABANDONAR".
- value: o texto digitado, somente se a ação for um campo de entrada; caso contrário, string vazia.
- reasoning: 1 a 2 frases em primeira pessoa, na voz e no vocabulário da persona, explicando a escolha. Descreva o que ela percebe ("não achei o botão", "não sei o que é isso"), nunca os metadados da árvore ("contraste", "destaque", "visível", "dobra").
- think_time_ms: tempo realista (ms) que essa pessoa levaria para ler a tela e agir. Referência: 2.000–5.000 para uma tela simples e alguém fluente; 15.000–60.000 ou mais para textos longos, jargão, idosos ou baixa literacia.
- confidence: de 0 a 1, o quão segura a pessoa está de que essa ação a aproxima do objetivo.`;

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

/**
 * Serialização enxuta da árvore (economiza tokens): textos como strings com
 * marcadores, ações só com os campos relevantes para a decisão.
 */
function compactTree(tree: AccessibilityTree) {
  const { scrollTop } = tree.viewport;
  return {
    tela: tree.screenTitle,
    rolagem: !tree.canScrollDown && scrollTop < 5 ? "tela inteira visível" : !tree.canScrollDown ? "no fim da tela" : scrollTop < 5 ? "no topo" : "no meio",
    textos: tree.texts.map(
      (t) => `${t.role === "alert" ? "[ERRO] " : t.role === "heading" ? "# " : ""}${t.inViewport ? "" : "[abaixo da dobra] "}${t.text}`,
    ),
    acoes: tree.actions.map((a) => ({
      id: a.id,
      tipo: a.role,
      rotulo: a.label,
      ...(a.value !== undefined && { valor: a.value }),
      ...(a.checked !== undefined && { marcado: a.checked }),
      ...(!a.inViewport && { visivel: false }),
      ...(a.prominence === "low" && { destaque: "baixo" }),
    })),
  };
}

export function buildNavigatorPrompt(req: NavigatorRequest, load: CognitiveLoadReport): LlmPrompt {
  const flow = FLOWS[req.flowId];
  let stepsOnScreen = 0;
  for (let i = req.history.length - 1; i >= 0 && req.history[i].screenId === req.tree.screenId; i--) stepsOnScreen++;
  const history = req.history
    .slice(-8)
    .map(
      (h) =>
        `${h.step + 1}. [${h.screenId}] ${h.actionId}${h.value ? ` "${h.value}"` : ""}${h.errorShown ? " → apareceu erro" : ""} — "${h.reasoning}"`,
    )
    .join("\n");

  const user = `## Persona
${describePersona(req.persona)}

## Objetivo
${flow.goal}

## O que você já fez nesta sessão (${req.history.length} ações até agora; ${stepsOnScreen} nesta tela)
${history || "(acabou de abrir o app)"}

## Tela atual (árvore de acessibilidade)
${JSON.stringify(compactTree(req.tree))}

## Observação do laboratório sobre esta tela
Carga cognitiva estimada: ${load.score} (${load.level}). ${load.reasons.join(" ")}

Qual é a próxima ação de ${req.persona.name.split(" ")[0]}?`;

  return { system: NAVIGATOR_SYSTEM, user };
}

// ---------------------------------------------------------------------------
// Política mockada (LLM_MODE=mock): ε-greedy em torno do oráculo, com ε enviesado
// pela persona. Serve só para testar o pipeline sem custo; não é um agente.
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

/** Schema de saída com enum dinâmico: o modelo só pode escolher ações existentes na tela. */
function decisionSchema(tree: AccessibilityTree) {
  const ids: [string, ...string[]] = [ABANDON, ...new Set(tree.actions.map((a) => a.id))];
  return z.object({
    action_id: z.enum(ids),
    value: z.string(),
    reasoning: z.string(),
    think_time_ms: z.number().int(),
    confidence: z.number(),
  });
}

export async function runNavigator(req: NavigatorRequest): Promise<NavigatorResponse> {
  const cognitiveLoad = analyzeCognitiveLoad(req.tree);
  const prompt = buildNavigatorPrompt(req, cognitiveLoad);
  const optimal = optimalAction(req.flowId, req.tree, req.persona, createRng(hashSeed(req.seed, req.step, 0x51ed)));
  const mode = getLlmMode();

  let decision: NavigatorDecision;
  let usage: NavigatorResponse["usage"] = null;
  let model: string | null = null;
  if (mode === "mock") {
    await simulateLatency(req.mockLatencyMs ?? DEFAULT_MOCK_LATENCY_MS);
    decision = mockNavigatorPolicy(req, cognitiveLoad, optimal);
  } else {
    // Muitas chamadas curtas por simulação: esforço baixo mantém latência e custo sob controle.
    const result = await callLLM({ prompt, schema: decisionSchema(req.tree), schemaName: "navigator_decision", effort: "low", maxTokens: 4000 });
    decision = { ...result.data, value: result.data.value || undefined };
    usage = result.usage;
    model = result.model;
  }

  return {
    decision: sanitizeDecision(decision, req.tree),
    cognitiveLoad,
    optimalActionId: optimal?.actionId ?? null,
    acceptableActionIds: acceptableActionIds(req.flowId, req.tree, optimal),
    prompt,
    mode,
    model,
    usage,
  };
}
