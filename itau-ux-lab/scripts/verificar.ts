/**
 * Checagens sem navegador nem IA: `npm run verificar`.
 * Confere as regras que não dependem da tela (a tela é conferida no navegador).
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { PROMPT_VERSIONS } from "../src/lib/agents/versions";
import { buildAnalystPrompt, mockAnalyst } from "../src/lib/agents/analyst";
import { buildDesignerPrompt, cleanLayouts, mockDesigner, mockLayouts } from "../src/lib/agents/designer";
import { VARIATIONS, VARIATION_GROUPS, VARIATION_IDS } from "../src/lib/design/variations";
import { buildNavigatorPrompt, mockNavigatorPolicy, sanitizeDecision } from "../src/lib/agents/navigator";
import { analyzeCognitiveLoad } from "../src/lib/a11y/cognitive-load";
import { computeStats } from "../src/lib/analytics/stats";
import { FLOWS, terminalOutcome } from "../src/lib/bank/flows";
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

// ------------------------------------------------------------------ variações de tela do Lume (Iury) no Agente Designer

{
  check(new Set(VARIATION_IDS).size === VARIATION_IDS.length && VARIATION_IDS.every((id) => VARIATIONS[id]?.id === id), "catálogo de variações sem id repetido");
  const missing = VARIATION_IDS.filter((id) => !existsSync(join(__dirname, "..", "public", VARIATIONS[id].preview)));
  check(missing.length === 0, `toda variação tem prévia em public/previas${missing.length ? `: faltam ${missing.join(", ")}` : ""}`);
  check(VARIATION_GROUPS.every((g) => VARIATION_IDS.some((id) => VARIATIONS[id].group === g)), "tela inicial, início do Pix e repetir têm prévias");

  // 4 clientes de literacia alta concluem; 4 de literacia baixa terminam errado na confirmação do Pix.
  const low = byLiteracy.slice(0, 4);
  const high = byLiteracy.slice(-4);
  const layoutRun = (flowId: FlowId, screen: string, version?: "A" | "B" | "C"): SimulationRun => ({
    id: "sim-variacoes",
    createdAt: 0,
    config: { flowId, agentCount: 8, base: DEFAULT_PERSONA_CONFIG, visualDelayMs: 0, mockLatencyMs: 0, concurrency: 1, llmMode: "mock", version },
    agents: [
      ...high.map((p, i) => ({ ...agent(i, p, "success", FLOWS[flowId].successScreen), steps: [{ ...agent(i, p, "success", "").steps[0], screenId: screen, optimal: true }] })),
      ...low.map((p, i) => ({ ...agent(4 + i, p, flowId === "pix_recorrente" ? "wrong" : "abandoned", screen), steps: [{ ...agent(4 + i, p, "wrong", "").steps[0], screenId: screen, optimal: false }] })),
    ],
    screens: {},
    sampleComposition: {},
    ageComposition: {},
    llm: { mode: "mock", model: null, usage: { inputTokens: 0, outputTokens: 0 } },
  });
  const pixStats = computeStats(layoutRun("pix_recorrente", "pix-confirm", "B"));
  const analyst = mockAnalyst({ stats: pixStats, screens: {}, evidence: { abandonments: [], frequentDeviations: [] } });
  const forB = mockLayouts({ analyst, stats: pixStats, screens: {}, screenVersion: "B" });
  const lowLit = forB.find((l) => l.segment === "Literacia digital: baixa");
  check(Boolean(lowLit?.variationIds.includes("rec-c")), "literacia baixa parou na confirmação (versão B) → designer indica o Repetir C");
  check(forB.every((l) => !l.segment.includes("alta")), "perfil que concluiu não recebe variação");
  check(Boolean(lowLit?.rationale.includes("0 de 4 concluíram") && lowLit.rationale.includes("hipótese")), "a indicação cita os números do perfil e diz que é hipótese");
  check(mockLayouts({ analyst, stats: pixStats, screens: {}, screenVersion: "C" }).every((l) => !l.variationIds.includes("rec-c")), "não indica a versão que já foi testada");

  const loanStats = computeStats(layoutRun("emprestimo", "home"));
  const loan = mockLayouts({ analyst, stats: loanStats, screens: {} });
  check(loan.some((l) => l.variationIds.includes("dash-v3")), "empréstimo: quem parou na tela inicial → Dash V3 (Empréstimos na 1ª linha)");

  const prompt = buildDesignerPrompt({ analyst, stats: pixStats, screens: {}, screenVersion: "B" });
  check(VARIATION_IDS.every((id) => prompt.user.includes(id)) && prompt.user.includes("versão testada nesta simulação: B"), "o designer com LLM recebe o catálogo e a versão testada");
  check(prompt.system.includes("layouts") && PROMPT_VERSIONS.designer === "des-v2", "prompt do designer pede as variações por perfil (des-v2)");
  const cleaned = cleanLayouts(
    [
      { segment: "Faixa etária: 40-59", variationIds: ["rec-b"], rationale: "x" },
      { segment: "Literacia digital: baixa", variationIds: ["rec-c", "rec-c", "rec-b"], rationale: "y" },
    ],
    "B",
  );
  check(cleaned.length === 1 && cleaned[0].variationIds.join() === "rec-c" && cleaned[0].id === "l1", "resposta do LLM: tira a versão testada, repetições e perfis vazios");
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
