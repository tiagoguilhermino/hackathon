import type { SimulationEvidence } from "@/types/analytics";
import { ABANDON, type SimulationRun } from "@/types/simulation";
import { PROFESSION_LABELS } from "../personas/config";

/** Extrai dos logs as falas e desvios reais dos agentes, para os agentes consultivos. */
export function buildEvidence(run: SimulationRun): SimulationEvidence {
  const abandonments = run.agents
    .filter((a) => a.outcome === "abandoned")
    .slice(0, 30)
    .map((a) => {
      const d = a.persona.demographics;
      const last = a.steps[a.steps.length - 1];
      return {
        agent: `${d.age} anos, ${PROFESSION_LABELS[d.profession]}, literacia ${d.digitalLiteracy}`,
        screenId: a.exitScreen,
        reasoning: last?.reasoning ?? "",
        recentSteps: a.steps.slice(-5, -1).map((s) => `${s.screenId}: ${s.actionId}${s.errorShown ? " (erro)" : ""}`),
      };
    });

  const groups = new Map<string, { screenId: string; actionId: string; count: number; sampleReasoning: string }>();
  for (const agent of run.agents) {
    for (const s of agent.steps) {
      if (s.optimal || s.actionId === ABANDON) continue;
      const key = `${s.screenId}|${s.actionId}`;
      const g = groups.get(key) ?? { screenId: s.screenId, actionId: s.actionId, count: 0, sampleReasoning: s.reasoning };
      g.count += 1;
      groups.set(key, g);
    }
  }
  const frequentDeviations = [...groups.values()].sort((a, b) => b.count - a.count).slice(0, 12);

  return { abandonments, frequentDeviations };
}
