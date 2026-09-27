import type { SimulationRun } from "@/types/simulation";

const KEY = "itau-ux-lab:runs";
const MAX_RUNS = 5;

export function loadRuns(): SimulationRun[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SimulationRun[]) : [];
  } catch {
    return [];
  }
}

export function saveRun(run: SimulationRun): void {
  const runs = [run, ...loadRuns().filter((r) => r.id !== run.id)].slice(0, MAX_RUNS);
  // Em caso de cota excedida, descarta as execuções mais antigas.
  for (let keep = runs.length; keep > 0; keep--) {
    try {
      localStorage.setItem(KEY, JSON.stringify(runs.slice(0, keep)));
      return;
    } catch {
      /* tenta com menos execuções */
    }
  }
}
