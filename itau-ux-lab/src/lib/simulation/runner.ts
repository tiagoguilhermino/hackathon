import type { A11yActionNode, AccessibilityTree } from "@/types/a11y";
import type { Persona } from "@/types/persona";
import {
  ABANDON,
  type AgentAction,
  type AgentOutcome,
  type AgentRun,
  type NavigatorRequest,
  type NavigatorResponse,
  type SimulationConfig,
  type SimulationRun,
  type StepLog,
} from "@/types/simulation";
import { SCROLL_DOWN, SCROLL_UP, applyScroll, extractAccessibilityTree } from "../a11y/extract";
import { PROMPT_VERSIONS } from "../agents/versions";
import { FLOWS, terminalOutcome } from "../bank/flows";
import type { BankState, ResetAction } from "../bank/state";
import { countBy } from "../personas/sampling";
import { hashSeed } from "../random";

/** Uma instância renderizada do app (um "slot") onde um agente navega. */
export interface AppSlot {
  getRoot(): HTMLElement | null;
  /** Deve aplicar a ação e renderizar de forma síncrona (flushSync). "__reset" leva a versão da tela e o layout. */
  dispatch(action: AgentAction | ResetAction): void;
  /** Estado atual do app: só o avaliador usa (para saber se a tarefa foi cumprida); o agente só vê a árvore. */
  getState(): BankState;
}

export interface SimulationHooks {
  shouldStop(): boolean;
  onAgentStart?(slot: number, agentIndex: number, persona: Persona): void;
  onDecision?(event: {
    slot: number;
    agentIndex: number;
    persona: Persona;
    tree: AccessibilityTree;
    response: NavigatorResponse;
    target?: A11yActionNode;
  }): void;
  onAgentEnd?(slot: number, run: AgentRun): void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function askNavigator(req: NavigatorRequest): Promise<NavigatorResponse> {
  const res = await fetch("/api/agents/navigator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Navigator HTTP ${res.status}`);
  return data;
}

async function runAgent(
  slotIndex: number,
  slot: AppSlot,
  agentIndex: number,
  persona: Persona,
  config: SimulationConfig,
  hooks: SimulationHooks,
  run: SimulationRun,
): Promise<AgentRun> {
  const flow = FLOWS[config.flowId];
  const seed = hashSeed(config.base.seed, agentIndex, 0xa11ce);
  const steps: StepLog[] = [];
  let outcome: AgentOutcome = "timeout";
  let exitScreen: string = flow.startScreen;
  let errorMessage: string | undefined;

  slot.dispatch({ actionId: "__reset", value: flow.versions ? config.version : undefined, layout: config.layout });
  await nextFrame();
  hooks.onAgentStart?.(slotIndex, agentIndex, persona);

  for (let step = 0; step < flow.maxSteps; step++) {
    if (hooks.shouldStop()) break;
    const root = slot.getRoot();
    if (!root) {
      outcome = "error";
      break;
    }
    const tree = extractAccessibilityTree(root);
    exitScreen = tree.screenId;
    const done = terminalOutcome(config.flowId, slot.getState());
    if (done) {
      outcome = done;
      break;
    }

    let response: NavigatorResponse;
    try {
      response = await askNavigator({
        persona,
        flowId: config.flowId,
        tree,
        history: steps,
        seed,
        step,
        mockLatencyMs: config.mockLatencyMs,
        mode: config.llmMode,
        layout: config.layout,
      });
    } catch (err) {
      errorMessage = (err as Error).message;
      outcome = "error";
      break;
    }

    const { decision, cognitiveLoad } = response;
    run.screens[tree.screenId] = { screenId: tree.screenId, title: tree.screenTitle, cognitiveLoad, tree };
    if (response.usage) {
      run.llm.usage.inputTokens += response.usage.inputTokens;
      run.llm.usage.outputTokens += response.usage.outputTokens;
    }
    run.llm.mode = response.mode;
    run.llm.model = response.model ?? run.llm.model;

    const target = tree.actions.find((a) => a.id === decision.action_id);
    hooks.onDecision?.({ slot: slotIndex, agentIndex, persona, tree, response, target });

    const log: StepLog = {
      step,
      screenId: tree.screenId,
      actionId: decision.action_id,
      value: decision.value,
      reasoning: decision.reasoning,
      thinkTimeMs: decision.think_time_ms,
      cognitiveLoad: cognitiveLoad.score,
      errorShown: false,
      optimal: response.acceptableActionIds.includes(decision.action_id),
    };
    steps.push(log);

    if (decision.action_id === ABANDON) {
      outcome = "abandoned";
      break;
    }

    await sleep(config.visualDelayMs);

    if (decision.action_id === SCROLL_DOWN || decision.action_id === SCROLL_UP) {
      applyScroll(root, decision.action_id === SCROLL_DOWN ? "down" : "up");
    } else {
      slot.dispatch({ actionId: decision.action_id, value: decision.value });
    }
    await nextFrame();

    const after = slot.getRoot();
    if (after) {
      const next = extractAccessibilityTree(after);
      log.errorShown = next.texts.some((t) => t.role === "alert");
      exitScreen = next.screenId;
      const done = terminalOutcome(config.flowId, slot.getState());
      if (done) {
        outcome = done;
        // Terminou sem cumprir: o problema está na tela onde a última ação foi tomada.
        if (done === "wrong") exitScreen = tree.screenId;
        break;
      }
    }
  }

  const agentRun: AgentRun = {
    agentIndex,
    persona,
    outcome,
    steps,
    totalTimeMs: steps.reduce((s, x) => s + x.thinkTimeMs, 0),
    exitScreen,
    ...(errorMessage && { errorMessage }),
  };
  hooks.onAgentEnd?.(slotIndex, agentRun);
  return agentRun;
}

/**
 * Executa os agentes em paralelo: cada slot (instância do app) consome a
 * fila de personas até esvaziá-la.
 */
export async function runSimulation(
  config: SimulationConfig,
  personas: Persona[],
  slots: AppSlot[],
  hooks: SimulationHooks,
): Promise<SimulationRun> {
  const run: SimulationRun = {
    id: `sim-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    config,
    agents: [],
    screens: {},
    sampleComposition: countBy(personas, (p) => p.demographics.profession),
    ageComposition: countBy(personas, (p) => p.demographics.ageBand),
    llm: { mode: "mock", model: null, usage: { inputTokens: 0, outputTokens: 0 }, promptVersion: PROMPT_VERSIONS.navigator },
  };

  let next = 0;
  const worker = async (slotIndex: number) => {
    while (next < personas.length && !hooks.shouldStop()) {
      const agentIndex = next++;
      run.agents.push(await runAgent(slotIndex, slots[slotIndex], agentIndex, personas[agentIndex], config, hooks, run));
    }
  };
  await Promise.all(slots.map((_, i) => worker(i)));

  run.agents.sort((a, b) => a.agentIndex - b.agentIndex);
  run.finishedAt = Date.now();
  return run;
}
