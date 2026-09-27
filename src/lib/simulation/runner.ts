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
import { FLOWS } from "../bank/flows";
import { countBy } from "../personas/sampling";
import { hashSeed } from "../random";

/** Ponte entre o loop de simulação e o ambiente renderizado (DOM do app). */
export interface SimulationEnvironment {
  getRoot(): HTMLElement | null;
  /** Deve aplicar a ação e renderizar de forma síncrona (flushSync). */
  dispatch(action: AgentAction | { actionId: "__reset" }): void;
  shouldStop(): boolean;
  onDecision?(event: { agentIndex: number; persona: Persona; tree: AccessibilityTree; response: NavigatorResponse; target?: A11yActionNode }): void;
  onAgentStart?(agentIndex: number, persona: Persona): void;
  onAgentEnd?(run: AgentRun): void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function askNavigator(req: NavigatorRequest): Promise<NavigatorResponse> {
  const res = await fetch("/api/agents/navigator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`Navigator ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function runAgent(
  agentIndex: number,
  persona: Persona,
  config: SimulationConfig,
  env: SimulationEnvironment,
  screens: SimulationRun["screens"],
): Promise<AgentRun> {
  const flow = FLOWS[config.flowId];
  const seed = hashSeed(config.base.seed, agentIndex, 0xa11ce);
  const steps: StepLog[] = [];
  let outcome: AgentOutcome = "timeout";
  let exitScreen: string = flow.startScreen;

  env.dispatch({ actionId: "__reset" });
  await nextFrame();
  env.onAgentStart?.(agentIndex, persona);

  for (let step = 0; step < flow.maxSteps; step++) {
    if (env.shouldStop()) break;
    const root = env.getRoot();
    if (!root) {
      outcome = "error";
      break;
    }
    const tree = extractAccessibilityTree(root);
    exitScreen = tree.screenId;
    if (tree.screenId === flow.successScreen) {
      outcome = "success";
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
      });
    } catch (err) {
      console.error(err);
      outcome = "error";
      break;
    }

    const { decision, cognitiveLoad } = response;
    screens[tree.screenId] = { screenId: tree.screenId, title: tree.screenTitle, cognitiveLoad };
    const target = tree.actions.find((a) => a.id === decision.action_id);
    env.onDecision?.({ agentIndex, persona, tree, response, target });

    const log: StepLog = {
      step,
      screenId: tree.screenId,
      actionId: decision.action_id,
      value: decision.value,
      reasoning: decision.reasoning,
      thinkTimeMs: decision.think_time_ms,
      cognitiveLoad: cognitiveLoad.score,
      errorShown: false,
      optimal: decision.action_id === response.optimalActionId,
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
      env.dispatch({ actionId: decision.action_id, value: decision.value });
    }
    await nextFrame();

    const after = env.getRoot();
    if (after) {
      const next = extractAccessibilityTree(after);
      log.errorShown = next.texts.some((t) => t.role === "alert");
      exitScreen = next.screenId;
      if (next.screenId === flow.successScreen) {
        outcome = "success";
        break;
      }
    }
  }

  const run: AgentRun = {
    agentIndex,
    persona,
    outcome,
    steps,
    totalTimeMs: steps.reduce((s, x) => s + x.thinkTimeMs, 0),
    exitScreen,
  };
  env.onAgentEnd?.(run);
  return run;
}

/** Executa os agentes sequencialmente sobre o mesmo ambiente renderizado. */
export async function runSimulation(
  config: SimulationConfig,
  personas: Persona[],
  env: SimulationEnvironment,
): Promise<SimulationRun> {
  const run: SimulationRun = {
    id: `sim-${Date.now().toString(36)}`,
    createdAt: Date.now(),
    config,
    agents: [],
    screens: {},
    sampleComposition: countBy(personas, (p) => p.demographics.profession),
    ageComposition: countBy(personas, (p) => p.demographics.ageBand),
  };

  for (let i = 0; i < personas.length; i++) {
    if (env.shouldStop()) break;
    run.agents.push(await runAgent(i, personas[i], config, env, run.screens));
  }
  run.finishedAt = Date.now();
  return run;
}
