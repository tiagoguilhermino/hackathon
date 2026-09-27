import type { SegmentScreenStat, ScreenStat, SegmentStat, SimulationStats } from "@/types/analytics";
import type { SegmentDimension } from "@/types/persona";
import type { AgentRun, SimulationRun } from "@/types/simulation";
import { FLOWS, SCREEN_TITLES } from "../bank/flows";
import { PROFESSION_LABELS, literacyBand } from "../personas/config";

export const DIMENSION_LABELS: Record<SegmentDimension, string> = {
  profession: "Profissão",
  ageBand: "Faixa etária",
  literacyBand: "Literacia digital",
  deviceTier: "Dispositivo",
};

export function segmentOf(agent: AgentRun, dim: SegmentDimension): string {
  const p = agent.persona;
  switch (dim) {
    case "profession":
      return PROFESSION_LABELS[p.demographics.profession];
    case "ageBand":
      return p.demographics.ageBand;
    case "literacyBand":
      return literacyBand(p.demographics.digitalLiteracy);
    case "deviceTier":
      return p.security.deviceTier;
  }
}

const SEGMENT_ORDER: Partial<Record<SegmentDimension, string[]>> = {
  ageBand: ["18-24", "25-39", "40-59", "60+"],
  literacyBand: ["baixa", "média", "alta"],
};

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const ratio = (a: number, b: number) => (b ? a / b : 0);

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
  return map;
}

function segmentStats(agents: AgentRun[], dim: SegmentDimension): SegmentStat[] {
  const groups = groupBy(agents, (a) => segmentOf(a, dim));
  const order = SEGMENT_ORDER[dim];
  return [...groups.entries()]
    .map(([segment, list]) => {
      const successes = list.filter((a) => a.outcome === "success");
      return {
        dimension: dim,
        segment,
        agents: list.length,
        successRate: ratio(successes.length, list.length),
        abandonRate: ratio(list.filter((a) => a.outcome === "abandoned").length, list.length),
        avgCompletionSec: successes.length ? mean(successes.map((a) => a.totalTimeMs)) / 1000 : null,
        avgSteps: mean(list.map((a) => a.steps.length)),
      };
    })
    .sort((a, b) => (order ? order.indexOf(a.segment) - order.indexOf(b.segment) : b.agents - a.agents));
}

/** Uma ação "com erro" é sub-ótima, disparou alerta ou foi abandono. */
const isErrorStep = (s: AgentRun["steps"][number]) => !s.optimal || s.errorShown;

function screenStats(run: SimulationRun): ScreenStat[] {
  const flow = FLOWS[run.config.flowId];
  const ids = [...new Set([...flow.funnel, ...run.agents.flatMap((a) => a.steps.map((s) => s.screenId))])];
  return ids.map((screenId) => {
    const reached = run.agents.filter(
      (a) => a.steps.some((s) => s.screenId === screenId) || (a.outcome === "success" && screenId === flow.successScreen),
    ).length;
    const abandoned = run.agents.filter((a) => a.outcome !== "success" && a.exitScreen === screenId).length;
    const steps = run.agents.flatMap((a) => a.steps.filter((s) => s.screenId === screenId));
    return {
      screenId,
      title: SCREEN_TITLES[screenId as keyof typeof SCREEN_TITLES] ?? screenId,
      reached,
      abandoned,
      dropOffRate: ratio(abandoned, reached),
      errorRate: ratio(steps.filter(isErrorStep).length, steps.length),
      avgThinkSec: mean(steps.map((s) => s.thinkTimeMs)) / 1000,
      cognitiveLoad: run.screens[screenId]?.cognitiveLoad.score ?? 0,
    };
  });
}

function segmentScreenStats(run: SimulationRun, dims: SegmentDimension[]): SegmentScreenStat[] {
  const out: SegmentScreenStat[] = [];
  for (const dim of dims) {
    for (const [segment, agents] of groupBy(run.agents, (a) => segmentOf(a, dim))) {
      for (const screenId of FLOWS[run.config.flowId].funnel) {
        const steps = agents.flatMap((a) => a.steps.filter((s) => s.screenId === screenId));
        const reached = agents.filter((a) => a.steps.some((s) => s.screenId === screenId)).length;
        if (!steps.length) continue;
        out.push({
          dimension: dim,
          segment,
          screenId,
          actions: steps.length,
          errorRate: ratio(steps.filter(isErrorStep).length, steps.length),
          dropOffRate: ratio(agents.filter((a) => a.outcome !== "success" && a.exitScreen === screenId).length, reached),
        });
      }
    }
  }
  return out;
}

export function computeStats(run: SimulationRun): SimulationStats {
  const agents = run.agents;
  const successes = agents.filter((a) => a.outcome === "success");
  const dims: SegmentDimension[] = ["profession", "ageBand", "literacyBand", "deviceTier"];
  return {
    runId: run.id,
    flowId: run.config.flowId,
    totalAgents: agents.length,
    successRate: ratio(successes.length, agents.length),
    abandonRate: ratio(agents.filter((a) => a.outcome === "abandoned").length, agents.length),
    timeoutRate: ratio(agents.filter((a) => a.outcome === "timeout").length, agents.length),
    avgCompletionSec: successes.length ? mean(successes.map((a) => a.totalTimeMs)) / 1000 : null,
    avgSteps: mean(agents.map((a) => a.steps.length)),
    bySegment: Object.fromEntries(dims.map((d) => [d, segmentStats(agents, d)])) as SimulationStats["bySegment"],
    byScreen: screenStats(run),
    segmentScreen: segmentScreenStats(run, dims),
  };
}
