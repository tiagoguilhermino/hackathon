/**
 * Checagens sem navegador nem IA: `npm run verificar`.
 * Confere as regras que não dependem da tela (a tela é conferida no navegador).
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PROMPT_VERSIONS } from "../src/lib/agents/versions";
import { buildAnalystPrompt, mockAnalyst } from "../src/lib/agents/analyst";
import { buildDesignerPrompt, mockDesigner } from "../src/lib/agents/designer";
import { compareLayouts, layoutColumns, layoutSiblings } from "../src/lib/analytics/layouts";
import { LAYOUT_PRESETS, homeShortcuts, layoutKey, layoutName, shortcutRow, type AppLayout } from "../src/lib/design/variations";
import { buildNavigatorPrompt, hasScent, mockNavigatorPolicy, sanitizeDecision } from "../src/lib/agents/navigator";
import { analyzeCognitiveLoad } from "../src/lib/a11y/cognitive-load";
import { computeStats } from "../src/lib/analytics/stats";
import { FLOWS, flowFunnel, terminalOutcome } from "../src/lib/bank/flows";
import { acceptableActionIds, optimalAction } from "../src/lib/bank/oracle";
import { bankReducer, initialBankState, pixRecipient, type BankState } from "../src/lib/bank/state";
import { DEFAULT_PERSONA_CONFIG } from "../src/lib/personas/config";
import { generatePersonaBase } from "../src/lib/personas/generator";
import { countBy, stratifiedSample } from "../src/lib/personas/sampling";
import { createRng } from "../src/lib/random";
import { appendDecision, loadDecisions } from "../src/lib/simulation/storage";
import type { A11yActionNode, AccessibilityTree } from "../src/types/a11y";
import type { HumanDecision } from "../src/types/analytics";
import type { Persona } from "../src/types/persona";
import { ABANDON, type AgentRun, type FlowId, type NavigatorRequest, type SimulationRun } from "../src/types/simulation";

let failures = 0;
function check(ok: boolean, description: string): void {
  console.log(`${ok ? "ok    " : "FALHA "} ${description}`);
  if (!ok) failures += 1;
}

// ------------------------------------------------------------------ utilitários

type NodeSpec = Pick<A11yActionNode, "id"> & Partial<A11yActionNode>;

function tree(screenId: string, actions: NodeSpec[], texts: string[] = []): AccessibilityTree {
  return {
    screenId,
    screenTitle: screenId,
    viewport: { width: 390, height: 780, scrollTop: 0, scrollHeight: 780 },
    canScrollDown: false,
    texts: texts.map((text) => ({ role: "text", text, inViewport: true })),
    actions: actions.map((a) => ({
      role: "button",
      label: a.id,
      bounds: { x: 0, y: 0, width: 40, height: 40 },
      inViewport: true,
      prominence: "normal",
      disabled: false,
      ...a,
    })),
    capturedAt: 0,
  };
}

const run = (state: BankState, ...actions: [string, string?][]) =>
  actions.reduce((s, [actionId, value]) => bankReducer(s, { actionId, value }), state);

const reset = (version = "") => bankReducer(initialBankState, { actionId: "__reset", value: version });

const base = generatePersonaBase(DEFAULT_PERSONA_CONFIG);
const byLiteracy = [...base].sort((a, b) => a.demographics.digitalLiteracy - b.demographics.digitalLiteracy);
const lowLiteracy = byLiteracy[0];
const highLiteracy = byLiteracy[byLiteracy.length - 1];

// ------------------------------------------------------------------ personas

{
  // Cada cliente é sorteado com os pesos: a proporção vale na média (base grande), não exata em bases pequenas.
  const big = countBy(generatePersonaBase({ ...DEFAULT_PERSONA_CONFIG, size: 20_000 }), (p) => p.demographics.profession);
  const ratio = (big.servidor_publico ?? 0) / (big.clt ?? 1);
  check(base.length === DEFAULT_PERSONA_CONFIG.size, `base tem ${DEFAULT_PERSONA_CONFIG.size} clientes`);
  check(ratio > 1.9 && ratio < 2.1, `peso 2 × 1 dá 2× mais servidores que CLT numa base grande (${ratio.toFixed(2)})`);
  check(JSON.stringify(generatePersonaBase(DEFAULT_PERSONA_CONFIG)) === JSON.stringify(base), "mesma seed gera a mesma base");
  check(base.every((p) => p.demographics.digitalLiteracy >= 0 && p.demographics.digitalLiteracy <= 1), "literacia digital entre 0 e 1");
  const sample = stratifiedSample(base, 30, 42);
  check(sample.length === 30 && new Set(sample.map((p) => p.id)).size === 30, "amostra de 30 agentes sem repetir ninguém");
}

// ------------------------------------------------------------------ banco: Pix que se repete todo mês

{
  check(reset("A").pixVersion === "A" && reset("").pixVersion === null, "reset liga a versão A/B/C (vazio = tela original)");
  check(pixRecipient("11987654321")?.id === "ana" && pixRecipient("(11) 98765-4321")?.id === "ana", "a chave digitada da Ana é reconhecida");

  const toConfirm = (version: string) => run(reset(version), ["home-pix"], ["pix-contact-ana"], ["pix-amount", "250"], ["pix-continue"]);
  check(toConfirm("A").screen === "pix-confirm", "contato + R$ 250 + continuar chega à confirmação");

  const aDone = run(toConfirm("A"), ["pix-more"], ["pix-repeat"], ["pix-confirm"]);
  check(aDone.screen === "pix-scheduled" && terminalOutcome("pix_recorrente", aDone) === "success", "A: abrindo Mais opções e repetindo conclui");

  const sentOnce = run(toConfirm("C"), ["pix-confirm"]);
  check(sentOnce.screen === "pix-success" && terminalOutcome("pix_recorrente", sentOnce) === "wrong", "enviar sem repetir termina errado");

  const wrongAmount = run(reset("C"), ["home-pix"], ["pix-contact-ana"], ["pix-amount", "100"], ["pix-continue"], ["pix-repeat"], ["pix-confirm"]);
  check(terminalOutcome("pix_recorrente", wrongAmount) === "wrong", "repetir com outro valor termina errado");

  const wrongPerson = run(reset("B"), ["home-pix"], ["pix-contact-marcos"], ["pix-amount", "250"], ["pix-continue"], ["pix-repeat"], ["pix-confirm"]);
  check(terminalOutcome("pix_recorrente", wrongPerson) === "wrong", "repetir para outra pessoa termina errado");

  check(terminalOutcome("pix_recorrente", toConfirm("C")) === null, "na confirmação a tarefa ainda não acabou");
  check(run(aDone, ["success-home"]).pixVersion === "A", "voltar ao início mantém a versão da tela");

  // Os fluxos do Victor continuam iguais: sem versão, o Pix termina em pix-success e conta como sucesso.
  const victorPix = run(reset(), ["home-pix"], ["pix-key", "11987654321"], ["pix-amount", "50"], ["pix-continue"], ["pix-confirm"]);
  check(victorPix.screen === "pix-success" && terminalOutcome("pix", victorPix) === "success", "fluxo Pix original: enviar conclui");
  check(terminalOutcome("emprestimo", { ...initialBankState, screen: "loan-success" }) === "success", "fluxo empréstimo: contratar conclui");
}

// ------------------------------------------------------------------ oráculo (caminho certo)

{
  const persona = base[0];
  const rng = createRng(1);
  const best = (flow: FlowId, t: AccessibilityTree) => optimalAction(flow, t, persona, rng);

  check(best("pix_recorrente", tree("home", [{ id: "home-pix" }, { id: "home-loan" }]))?.actionId === "home-pix", "início → Pix");
  check(
    best("pix_recorrente", tree("pix", [{ id: "pix-contact-ana" }, { id: "pix-key", role: "input", value: "" }, { id: "pix-amount", role: "input", value: "" }, { id: "pix-continue" }]))?.actionId ===
      "pix-contact-ana",
    "tela Pix sem chave → escolher a Ana",
  );
  const amount = best("pix_recorrente", tree("pix", [{ id: "pix-key", role: "input", value: "(11) 98765-4321" }, { id: "pix-amount", role: "input", value: "" }, { id: "pix-continue" }]));
  check(amount?.actionId === "pix-amount" && amount.value === "250", "com a chave da Ana → digitar 250");
  check(
    best("pix_recorrente", tree("pix-confirm", [{ id: "pix-more", prominence: "low" }, { id: "pix-confirm" }]))?.actionId === "pix-more",
    "A fechado → abrir Mais opções",
  );
  check(
    best("pix_recorrente", tree("pix-confirm", [{ id: "pix-more" }, { id: "pix-repeat", checked: false }, { id: "pix-confirm" }]))?.actionId === "pix-repeat",
    "A aberto → ligar Repetir",
  );
  check(
    best("pix_recorrente", tree("pix-confirm", [{ id: "pix-repeat", checked: true }, { id: "pix-confirm" }]))?.actionId === "pix-confirm",
    "Repetir ligado → confirmar",
  );
  const pixScreen = tree("pix", [{ id: "pix-contact-ana" }, { id: "pix-key", role: "input", value: "" }, { id: "pix-amount", role: "input", value: "" }, { id: "pix-continue" }]);
  const ok = acceptableActionIds("pix_recorrente", pixScreen, best("pix_recorrente", pixScreen));
  check(ok.includes("pix-contact-ana") && ok.includes("pix-key") && ok.includes("pix-amount"), "escolher a Ana ou digitar a chave: os dois caminhos valem");
  check(
    best("pix", tree("pix", [{ id: "pix-key", role: "input", value: "" }, { id: "pix-amount", role: "input", value: "" }, { id: "pix-continue" }]))?.actionId === "pix-key",
    "fluxo Pix original continua digitando a chave",
  );
}

// ------------------------------------------------------------------ agente navegador (política por regras e proteção)

function request(persona: Persona, t: AccessibilityTree, seed: number): NavigatorRequest {
  return { persona, flowId: "pix_recorrente", tree: t, history: [], seed, step: 3 };
}

function repeatRate(persona: Persona, t: AccessibilityTree): number {
  let hits = 0;
  for (let seed = 0; seed < 400; seed++) {
    const r = request(persona, t, seed);
    const load = analyzeCognitiveLoad(t);
    const d = mockNavigatorPolicy(r, load, optimalAction("pix_recorrente", t, persona, createRng(seed)));
    if (d.action_id === "pix-repeat") hits++;
  }
  return hits / 400;
}

{
  const screenB = tree("pix-confirm", [{ id: "back" }, { id: "pix-repeat", checked: false, prominence: "low", label: "ícone sem texto: duas setas em círculo" }, { id: "pix-confirm", prominence: "high" }]);
  const screenC = tree("pix-confirm", [{ id: "back" }, { id: "pix-repeat", checked: false, prominence: "high", label: "Repetir todo mês" }, { id: "pix-confirm", prominence: "high" }]);

  const ids = new Set([ABANDON, ...screenB.actions.map((a) => a.id)]);
  let valid = true;
  for (let seed = 0; seed < 300; seed++) {
    const r = request(lowLiteracy, screenB, seed);
    const d = mockNavigatorPolicy(r, analyzeCognitiveLoad(screenB), optimalAction("pix_recorrente", screenB, lowLiteracy, createRng(seed)));
    valid &&= ids.has(d.action_id);
  }
  check(valid, "a política por regras só devolve ações da tela ou ABANDONAR");

  const lowB = repeatRate(lowLiteracy, screenB);
  const highB = repeatRate(highLiteracy, screenB);
  const lowC = repeatRate(lowLiteracy, screenC);
  check(lowB < highB, `B (só ícone): literacia baixa acha o repetir menos que a alta (${Math.round(lowB * 100)}% < ${Math.round(highB * 100)}%)`);
  check(lowB < lowC, `literacia baixa acha mais na C que na B (${Math.round(lowC * 100)}% > ${Math.round(lowB * 100)}%)`);

  const fixed = sanitizeDecision({ action_id: "botao-inventado", reasoning: "x", think_time_ms: 1000, confidence: 0.5 }, screenB);
  check(fixed.action_id === ABANDON && fixed.reasoning.includes("ação inválida"), "ação que não existe na tela vira ABANDONAR marcada");

  const prompt = buildNavigatorPrompt(request(lowLiteracy, screenB, 1), analyzeCognitiveLoad(screenB));
  const text = prompt.system + prompt.user;
  check(!/ita[uú]/i.test(text) && text.includes("Lume"), "prompt do navegador fala do banco fictício Lume, sem o nome do Itaú");
  check(text.includes(FLOWS.pix_recorrente.goal) && text.includes("ícone sem texto"), "prompt traz o objetivo e o botão só com ícone");
  check(!text.includes("Repetir este Pix"), "prompt não entrega o texto escondido do botão da B");
}

// ------------------------------------------------------------------ estatísticas, analista e designer

function agent(index: number, persona: Persona, outcome: AgentRun["outcome"], exitScreen: string): AgentRun {
  return {
    agentIndex: index,
    persona,
    outcome,
    steps: [{ step: 0, screenId: "pix-confirm", actionId: "pix-confirm", reasoning: "vou enviar", thinkTimeMs: 3000, cognitiveLoad: 0.2, errorShown: false, optimal: outcome === "success" }],
    totalTimeMs: 3000,
    exitScreen,
  };
}

{
  const sim: SimulationRun = {
    id: "sim-teste",
    createdAt: 0,
    config: { flowId: "pix_recorrente", agentCount: 4, base: DEFAULT_PERSONA_CONFIG, visualDelayMs: 0, mockLatencyMs: 0, concurrency: 1, llmMode: "mock", version: "B" },
    agents: [
      agent(0, highLiteracy, "success", "pix-scheduled"),
      agent(1, lowLiteracy, "wrong", "pix-confirm"),
      agent(2, lowLiteracy, "wrong", "pix-confirm"),
      agent(3, base[5], "abandoned", "pix-confirm"),
    ],
    screens: {},
    sampleComposition: {},
    ageComposition: {},
    llm: { mode: "mock", model: null, usage: { inputTokens: 0, outputTokens: 0 }, promptVersion: PROMPT_VERSIONS.navigator },
  };
  const stats = computeStats(sim);
  check(stats.successRate === 0.25 && stats.wrongRate === 0.5, "1 de 4 concluiu e 2 de 4 terminaram errado");
  const lit = stats.bySegment.literacyBand;
  check(lit.reduce((s, x) => s + x.successes, 0) === 1 && lit.reduce((s, x) => s + x.agents, 0) === 4, "por segmento: 'concluiu X de N' soma certo");
  const confirm = stats.byScreen.find((s) => s.screenId === "pix-confirm");
  check(confirm?.abandoned === 3, "quem terminou errado conta como parada na confirmação");

  const analyst = mockAnalyst({ stats, screens: {}, evidence: { abandonments: [], frequentDeviations: [] } });
  check(analyst.summary.includes("sem cumpri-la"), "resumo do analista cita quem terminou sem cumprir a tarefa");
  const designer = mockDesigner({ analyst, stats, screens: {} });
  check(Array.isArray(designer.proposals), "designer responde mesmo sem telas");

  const confirmB = tree("pix-confirm", [{ id: "pix-repeat", prominence: "low", label: "ícone sem texto: duas setas em círculo" }, { id: "pix-confirm", prominence: "high" }]);
  const screens = { "pix-confirm": { screenId: "pix-confirm", title: "Pix · Confirmação", cognitiveLoad: analyzeCognitiveLoad(confirmB), tree: confirmB } };
  const proposals = mockDesigner({ analyst, stats, screens }).proposals;
  const icon = proposals.find((x) => x.problem.includes("sem texto"));
  check(Boolean(icon) && icon!.change.includes("texto curto e visível"), "designer (regras) propõe texto visível para botão só com ícone");
  check(proposals.every((x) => !x.change.includes("Repetir todo mês")), "a proposta não copia a resposta da versão C");
  check(proposals.every((x) => x.screenId !== "loan-1"), "num fluxo de Pix, o designer não propõe mudar o empréstimo");
  const prompts = [buildAnalystPrompt({ stats, screens: {}, evidence: { abandonments: [], frequentDeviations: [] } }), buildDesignerPrompt({ analyst, stats, screens: {} })];
  check(prompts.every((p) => !/ita[uú]/i.test(p.system + p.user)), "prompts do analista e do designer sem o nome do Itaú");
  check(prompts.every((p) => /hip[óo]tese/i.test(p.system)), "analista e designer são instruídos a tratar achados como hipótese");
}

// ------------------------------------------------------------------ layouts do app (peças do Iury no app laranja)

{
  const labels = (l: AppLayout) => homeShortcuts(l).map((s) => s.label).join(", ");
  check(labels(LAYOUT_PRESETS.v1) === "Pix, Pagar, TED/DOC, Depositar, Empréstimos", `Dash V1: ${labels(LAYOUT_PRESETS.v1)}`);
  check(labels(LAYOUT_PRESETS.v2) === "Pix, Pagar, TED/DOC, Boleto, Empréstimos", `Dash V2: ${labels(LAYOUT_PRESETS.v2)}`);
  check(labels(LAYOUT_PRESETS.v3) === "Transferir, Pagar, Depositar, Empréstimos", `Dash V3: ${labels(LAYOUT_PRESETS.v3)}`);
  check(labels({ ...LAYOUT_PRESETS.v1, pay: "separadas" }).startsWith("Pix, Pagar boleto, Fatura"), "peça Pagar separada: Pagar boleto e Fatura na tela inicial");
  check(shortcutRow("home-loan", LAYOUT_PRESETS.v1) === 2 && shortcutRow("home-loan", LAYOUT_PRESETS.v3) === 1, "Empréstimos na 2ª linha do celular na V1 e na 1ª na V3");
  check(layoutName(LAYOUT_PRESETS.v2) === "Dash V2" && layoutName({ ...LAYOUT_PRESETS.v2, pixStart: "copia_e_cola" }).includes("Copia e Cola"), "nome do layout");
  check(flowFunnel("ted", LAYOUT_PRESETS.v3).includes("transfer") && !flowFunnel("ted", LAYOUT_PRESETS.v1).includes("transfer"), "o funil da TED passa por Transferir só na V3");

  const start = (layout: AppLayout, version = "") => bankReducer(initialBankState, { actionId: "__reset", value: version, layout });
  const ends = (flow: FlowId, layout: AppLayout, steps: [string, string?][], version = "") => terminalOutcome(flow, run(start(layout, version), ...steps));
  const { v1, v2, v3 } = LAYOUT_PRESETS;
  const copia: AppLayout = { ...v1, pixStart: "copia_e_cola" };
  const tedFill: [string, string?][] = [["ted-name", "Marcos Oliveira"], ["ted-agency", "1234"], ["ted-account", "56789-0"], ["ted-amount", "300"], ["ted-continue"], ["ted-send"]];

  check(ends("pix_contato", v3, [["home-transfer"], ["transfer-pix"], ["pix-contact-ana"], ["pix-amount", "250"], ["pix-continue"], ["pix-confirm"]]) === "success", "T1 na V3: Transferir → Pix → Ana → 250 conclui");
  check(ends("pix_contato", copia, [["home-pix"], ["pix-key", "(11) 98765-4321"], ["pix-amount", "250"], ["pix-continue"], ["pix-confirm"]]) === "success", "T1 com Copia e Cola: digitando a chave da Ana conclui");
  check(ends("pix_recorrente", v2, [["home-pix"], ["pix-contact-ana"], ["pix-amount", "250"], ["pix-continue"], ["pix-repeat"], ["pix-confirm"]], "C") === "success", "T2 na V2, versão C: conclui");
  check(ends("copia_e_cola", copia, [["home-pix"], ["pix-paste"], ["pix-cc-continue"], ["pix-confirm"]]) === "success", "T3: colar o código e pagar conclui");
  check(ends("copia_e_cola", v1, [["home-pix"], ["pix-contact-ana"], ["pix-amount", "250"], ["pix-continue"], ["pix-confirm"]]) === "wrong", "T3 sem Copia e Cola: fazer outro Pix é concluir errado");
  check(ends("ted", v1, [["home-ted"], ...tedFill]) === "success" && ends("ted", v3, [["home-transfer"], ["transfer-ted"], ...tedFill]) === "success", "T4: TED pelo atalho (V1) e por Transferir (V3)");
  check(ends("ted", v1, [["home-ted"], ["ted-name", "Marcos Oliveira"], ["ted-agency", "1234"], ["ted-account", "56789-0"], ["ted-amount", "30"], ["ted-continue"], ["ted-send"]]) === "wrong", "T4 com o valor errado conclui errado");
  check(ends("minhas_chaves", v1, [["home-deposit"], ["deposit-keys"]]) === "success" && ends("minhas_chaves", v3, [["home-transfer"], ["transfer-pix"], ["pix-my-keys"]]) === "success", "T5: chaves em Depositar (V1) e dentro do Pix (V3)");
  const depositV3 = run(start(v3), ["home-deposit"]);
  check(depositV3.screen === "deposit" && depositV3.layout.keys === "pix", "na V3 o Depositar existe, mas sem as chaves");
  check(ends("boleto_deposito", v2, [["home-boleto"], ["boleto-amount", "100"], ["boleto-generate"]]) === "success" && ends("boleto_deposito", v1, [["home-deposit"], ["deposit-boleto"], ["boleto-amount", "100"], ["boleto-generate"]]) === "success", "T6: boleto pelo atalho (V2) e por Depositar (V1)");
  check(ends("pagar_boleto", v1, [["home-pay"], ["pay-bill-option"], ["pay-bill-paste"], ["pay-bill-continue"], ["pay-bill-pay"]]) === "success" && ends("pagar_boleto", { ...v1, pay: "separadas" }, [["home-pay-bill"], ["pay-bill-paste"], ["pay-bill-continue"], ["pay-bill-pay"]]) === "success", "T7: boleto por Pagar e pelo atalho Pagar boleto");
  check(run(start(v1), ["home-pay"], ["pay-bill-option"], ["pay-bill-continue"]).error !== null, "T7: continuar sem colar o código mostra erro");
  check(ends("conta_luz", v1, [["home-upcoming-energy"], ["pay-bill-pay"]]) === "success" && ends("conta_luz", v1, [["home-upcoming-phone"], ["pay-bill-pay"]]) === "wrong", "T8: pagar a luz conclui; pagar o celular conclui errado");
  check(ends("ted", v1, [["home-pix"], ["pix-contact-ana"], ["pix-amount", "250"], ["pix-continue"], ["pix-confirm"]]) === "wrong", "fazer um Pix na tarefa da TED é concluir errado");
  check(run(start(v3), ["home-transfer"], ["back"]).screen === "home" && run(start(v3), ["home-transfer"], ["nav-home"]).layout === v3, "voltar mantém o layout");

  // Comparação: os mesmos 8 agentes em V1 e V3; os de literacia baixa só concluem na V1.
  const people = [...byLiteracy.slice(0, 4), ...byLiteracy.slice(-4)];
  const layoutRun = (layout: AppLayout, lowOk: boolean): SimulationRun => ({
    id: `sim-${layoutName(layout)}`,
    createdAt: 0,
    config: { flowId: "ted", agentCount: 8, base: DEFAULT_PERSONA_CONFIG, visualDelayMs: 0, mockLatencyMs: 0, concurrency: 1, llmMode: "mock", layout, batchId: "lote-teste" },
    agents: people.map((p, i) => agent(i, p, i < 4 && !lowOk ? "abandoned" : "success", i < 4 && !lowOk ? "transfer" : "ted-success")),
    screens: {},
    sampleComposition: {},
    ageComposition: {},
    llm: { mode: "mock", model: null, usage: { inputTokens: 0, outputTokens: 0 }, promptVersion: PROMPT_VERSIONS.navigator },
  });
  const runV1 = layoutRun(v1, true);
  const runV3 = layoutRun(v3, false);
  const other = { ...layoutRun(v2, true), config: { ...layoutRun(v2, true).config, batchId: "outro-lote" } };
  const siblings = layoutSiblings([runV3, other], runV1);
  check(siblings.length === 2 && siblings.every((r) => r.config.batchId === "lote-teste"), "a comparação junta só as simulações do mesmo lote");
  const rows = compareLayouts(layoutColumns(siblings));
  const low = rows.find((r) => r.segment === "Literacia digital: baixa");
  check(low?.best === "separadas.deposito.deposito.unificadas.contatos" && low.weak === false, "literacia baixa: a Dash V1 é a melhor, com diferença clara");
  const high = rows.find((r) => r.segment === "Literacia digital: alta");
  check(Boolean(high && high.weak), "literacia alta: V1 e V3 empatam → sinal fraco");
  const slow = { ...runV3, agents: runV3.agents.map((a) => ({ ...a, outcome: "success" as const, totalTimeMs: 6000 })) };
  const fast = { ...runV1, agents: runV1.agents.map((a) => ({ ...a, outcome: "success" as const, totalTimeMs: 3000 })) };
  const byTime = compareLayouts(layoutColumns([fast, slow]))[0];
  check(byTime.best === "separadas.deposito.deposito.unificadas.contatos" && !byTime.weak, "mesmo número de conclusões, mas 2× mais rápido: diferença clara pelo tempo");
  const fewDone = compareLayouts(layoutColumns([{ ...fast, agents: fast.agents.map((a, i) => ({ ...a, outcome: i < 2 ? ("success" as const) : ("abandoned" as const) })) }, { ...slow, agents: slow.agents.map((a, i) => ({ ...a, outcome: i < 2 ? ("success" as const) : ("abandoned" as const) })) }]))[0];
  check(fewDone.weak, "só 2 concluíram em cada layout: tempo não decide, é sinal fraco");
  // V2 conclui 1 a mais que a V1, mas a V1 é mais rápida (a V3 é bem mais lenta): não é claro.
  const nine = runV1.agents.concat(runV1.agents.slice(0, 1));
  const withResults = (id: string, successes: number, sec: number): SimulationRun => ({
    ...runV1,
    id,
    config: { ...runV1.config, layout: id === "v1" ? v1 : id === "v2" ? v2 : v3 },
    agents: nine.map((a, j) => ({ ...a, outcome: j < successes ? ("success" as const) : ("abandoned" as const), totalTimeMs: sec * 1000 })),
  });
  const close = compareLayouts(layoutColumns([withResults("v1", 8, 19), withResults("v2", 9, 21), withResults("v3", 9, 36)]))[0];
  check(close.best === layoutKey(v2) && close.weak, "o melhor precisa ganhar de todos: 9 de 9 (21 s) contra 8 de 9 mais rápido (19 s) é sinal fraco");
  check(rows[0].segment === "Todos" && rows[0].cells.every((c) => c.agents === 8), "linha Todos com os 8 agentes em cada layout");

  // Cheiro de informação (só no modo Simulado): na V3 o Pix está em "Transferir", sem a palavra "Pix".
  const homeV1 = tree("home", [{ id: "home-pix", label: "Pix" }, { id: "home-pay", label: "Pagar" }, { id: "home-ted", label: "TED/DOC" }, { id: "home-deposit", label: "Depositar" }]);
  const homeV3 = tree("home", [{ id: "home-transfer", label: "Transferir" }, { id: "home-pay", label: "Pagar" }, { id: "home-deposit", label: "Depositar" }, { id: "home-loan", label: "Empréstimos" }]);
  const firstTap = (t: AccessibilityTree, persona: Persona, want: string) => {
    let hits = 0;
    for (let seed = 0; seed < 400; seed++) {
      const r: NavigatorRequest = { persona, flowId: "pix_contato", tree: t, history: [], seed, step: 0, layout: t === homeV1 ? v1 : v3 };
      if (mockNavigatorPolicy(r, analyzeCognitiveLoad(t), optimalAction("pix_contato", t, persona, createRng(seed), r.layout)).action_id === want) hits++;
    }
    return hits / 400;
  };
  const lowV1 = firstTap(homeV1, lowLiteracy, "home-pix");
  const lowV3 = firstTap(homeV3, lowLiteracy, "home-transfer");
  const highV3 = firstTap(homeV3, highLiteracy, "home-transfer");
  check(hasScent("Transferir", FLOWS.ted.scent) && !hasScent("Transferir", FLOWS.pix_contato.scent) && hasScent("Energia · Luz Brasil", FLOWS.conta_luz.scent), "palavras de cada tarefa (Transferir serve para TED, não para Pix)");
  check(lowV3 < lowV1, `Pix com pouca familiaridade digital: acha "Transferir" (V3) menos que "Pix" (V1): ${Math.round(lowV3 * 100)}% < ${Math.round(lowV1 * 100)}%`);
  check(highV3 > lowV3, `quem tem muita familiaridade acha "Transferir" mais: ${Math.round(highV3 * 100)}% > ${Math.round(lowV3 * 100)}%`);

  const prompt = buildDesignerPrompt({ analyst: mockAnalyst({ stats: computeStats(runV1), screens: {}, evidence: { abandonments: [], frequentDeviations: [] } }), stats: computeStats(runV1), screens: {} });
  check(!prompt.user.includes("Catálogo") && PROMPT_VERSIONS.designer === "des-v3", "designer sem o catálogo de imagens (des-v3)");
}

// ------------------------------------------------------------------ registro de decisões humanas

{
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  });
  const decision = (comment: string): HumanDecision => ({
    at: "2026-09-27T10:00:00.000-03:00",
    role: "PO",
    runId: "sim-teste",
    proposalId: "p1",
    proposal: "Trocar o ícone por 'Repetir todo mês'",
    decision: "aprovar_para_teste",
    comment,
  });
  appendDecision(decision("primeira"));
  const after = appendDecision(decision("segunda"));
  check(after !== false && after.length === 2 && after[0].comment === "primeira", "registro só cresce: a segunda decisão entra depois da primeira");
  store.set("ux-lab:decisions:v1", "{quebrado");
  check(appendDecision(decision("terceira")) === false && store.get("ux-lab:decisions:v1") === "{quebrado", "registro ilegível: avisa e não grava por cima");
  check(loadDecisions().length === 0, "registro ilegível aparece vazio, sem quebrar a tela");
}

// ------------------------------------------------------------------ regras do produto no código

{
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(tsx?|css)$/.test(name)) files.push(path);
    }
  };
  walk(join(__dirname, "..", "src"));
  // O nome só pode aparecer no aviso "não é o app oficial do Itaú".
  const brand = files.filter((f) => !f.endsWith("PrototypeNotice.tsx") && /Ita[uú]|ita[uú]/.test(readFileSync(f, "utf8").replace(/itau-[a-z-]+/g, "")));
  check(brand.length === 0, `nome do Itaú só no aviso fixo${brand.length ? `: ${brand.join(", ")}` : ""}`);
  const notice = readFileSync(join(__dirname, "..", "src", "components", "common", "PrototypeNotice.tsx"), "utf8");
  const layout = readFileSync(join(__dirname, "..", "src", "app", "layout.tsx"), "utf8");
  check(notice.includes("Protótipo de hackathon") && notice.includes("não é o app oficial do Itaú"), "aviso fixo diz que é protótipo e não é o app oficial");
  check(layout.includes("<PrototypeNotice />"), "aviso fixo está no layout (aparece em toda página)");

  // Chaves da Groq no código (decisão do time): só o servidor pode enxergá-las.
  const importers = files.filter((f) => /from ["'][^"']*llm\/keys["']|from ["']\.\/keys["']/.test(readFileSync(f, "utf8")));
  check(importers.length === 1 && importers[0].endsWith(join("llm", "client.ts")), "só o cliente da Groq (servidor) importa as chaves");
  const serverOnly = /from ["'][^"']*(llm\/client|llm\/keys|agents\/(navigator|analyst|designer))["']/;
  const leaks = files.filter((f) => readFileSync(f, "utf8").includes('"use client"') && serverOnly.test(readFileSync(f, "utf8")));
  check(leaks.length === 0, `nenhuma tela ("use client") importa o código que tem a chave${leaks.length ? `: ${leaks.join(", ")}` : ""}`);
  const keyLines = files.filter((f) => !f.endsWith(join("llm", "keys.ts")) && /gsk_[A-Za-z0-9]{10}/.test(readFileSync(f, "utf8")));
  check(keyLines.length === 0, `chave escrita só em src/lib/llm/keys.ts${keyLines.length ? `: ${keyLines.join(", ")}` : ""}`);
  const browserBundle = join(__dirname, "..", ".next", "static");
  if (existsSync(browserBundle)) {
    const bundled: string[] = [];
    const scan = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) scan(path);
        else if (/\.(js|css|html|json)$/.test(name) && readFileSync(path, "utf8").includes("gsk_")) bundled.push(path);
      }
    };
    scan(browserBundle);
    check(bundled.length === 0, `o pacote do navegador (.next/static) não tem chave${bundled.length ? `: ${bundled.join(", ")}` : ""}`);
  }
}

console.log(failures ? `\n${failures} falha(s).` : "\nTudo certo.");
process.exit(failures ? 1 : 0);
