import type { SimulationStats } from "@/types/analytics";
import type { SegmentDimension } from "@/types/persona";
import type { SimulationRun } from "@/types/simulation";
import { layoutKey, layoutName, type AppLayout } from "../design/variations";
import { DIMENSION_LABELS, computeStats } from "./stats";

/** Uma coluna da comparação: a simulação da tarefa num layout. */
export interface LayoutColumn {
  key: string;
  name: string;
  layout?: AppLayout;
  run: SimulationRun;
  stats: SimulationStats;
}

export interface LayoutCell {
  key: string;
  successes: number;
  agents: number;
  avgSec: number | null;
}

/** Uma linha: um perfil de cliente, quantos concluíram em cada layout e o melhor para ele. */
export interface ProfileRow {
  id: string;
  segment: string;
  cells: LayoutCell[];
  /** Layout em que mais agentes desse perfil concluíram (empate: o mais rápido) */
  best: string | null;
  /**
   * Sinal fraco: perfil com menos de 3 agentes, ou algum outro layout ficou a 1 agente ou menos E
   * levou menos de 15% a mais de tempo para concluir (tempo só conta com 3 ou mais concluindo em cada).
   */
  weak: boolean;
}

/** Os perfis que mais mudam o uso do app: literacia digital e idade (e "Todos"). */
const DIMENSIONS: SegmentDimension[] = ["literacyBand", "ageBand"];

/**
 * Simulações que dá para comparar com `run`: o mesmo lote ("Testar nos layouts marcados") ou,
 * sem lote, a mesma tarefa, versão, agentes, seed e modo em layouts diferentes. Uma por layout.
 */
export function layoutSiblings(runs: SimulationRun[], run: SimulationRun): SimulationRun[] {
  const c = run.config;
  const same = (r: SimulationRun) =>
    c.batchId
      ? r.config.batchId === c.batchId
      : r.config.flowId === c.flowId &&
        r.config.version === c.version &&
        r.config.agentCount === c.agentCount &&
        r.config.base.seed === c.base.seed &&
        r.config.llmMode === c.llmMode;
  const byLayout = new Map<string, SimulationRun>();
  for (const r of [run, ...runs.filter((r) => r.id !== run.id && same(r))]) {
    const key = layoutKey(r.config.layout);
    if (!byLayout.has(key)) byLayout.set(key, r);
  }
  return [...byLayout.values()].sort((a, b) => layoutName(a.config.layout).localeCompare(layoutName(b.config.layout)));
}

export function layoutColumns(runs: SimulationRun[]): LayoutColumn[] {
  return runs.map((run) => ({
    key: layoutKey(run.config.layout),
    name: layoutName(run.config.layout),
    layout: run.config.layout,
    run,
    stats: computeStats(run),
  }));
}

/** Diferença de tempo que conta como clara: o segundo levou 15% a mais (ou mais) para concluir. */
const CLEAR_TIME_GAP = 0.15;

function pickBest(cells: LayoutCell[]): { best: string | null; weak: boolean } {
  const rate = (c: LayoutCell) => (c.agents ? c.successes / c.agents : 0);
  const ranked = [...cells].sort((a, b) => rate(b) - rate(a) || (a.avgSec ?? Infinity) - (b.avgSec ?? Infinity));
  const [first, ...others] = ranked;
  if (!first || !first.successes) return { best: null, weak: true };
  if (first.agents < 3 || !others.length) return { best: first.key, weak: true };
  // Claro só se o melhor ganha de TODOS os outros: 2 agentes a mais concluindo ou 15% mais rápido.
  const clearlyBetter = (other: LayoutCell) => {
    const moreDone = first.successes - other.successes >= 2;
    // Tempo médio só conta com pelo menos 3 agentes concluindo nos dois layouts (média de 1 ou 2 é ruído).
    const timed = first.successes >= 3 && other.successes >= 3 && first.avgSec !== null && other.avgSec !== null;
    const faster = timed && other.avgSec! >= first.avgSec! * (1 + CLEAR_TIME_GAP) && rate(first) >= rate(other);
    return moreDone || faster;
  };
  return { best: first.key, weak: !others.every(clearlyBetter) };
}

/** Linhas da comparação: "Todos" e cada faixa de literacia e de idade presentes nas simulações. */
export function compareLayouts(columns: LayoutColumn[]): ProfileRow[] {
  if (columns.length < 2) return [];
  const all: LayoutCell[] = columns.map((c) => ({
    key: c.key,
    successes: c.run.agents.filter((a) => a.outcome === "success").length,
    agents: c.stats.totalAgents,
    avgSec: c.stats.avgCompletionSec,
  }));
  const rows: ProfileRow[] = [{ id: "todos", segment: "Todos", cells: all, ...pickBest(all) }];
  for (const dim of DIMENSIONS) {
    const segments = [...new Set(columns.flatMap((c) => c.stats.bySegment[dim].map((s) => s.segment)))];
    for (const segment of segments) {
      const cells = columns.map((c) => {
        const s = c.stats.bySegment[dim].find((x) => x.segment === segment);
        return { key: c.key, successes: s?.successes ?? 0, agents: s?.agents ?? 0, avgSec: s?.avgCompletionSec ?? null };
      });
      rows.push({ id: `${dim}:${segment}`, segment: `${DIMENSION_LABELS[dim]}: ${segment}`, cells, ...pickBest(cells) });
    }
  }
  return rows;
}
