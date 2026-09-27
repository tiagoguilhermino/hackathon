import type { AnalystReport, DesignerReport, HumanDecision } from "@/types/analytics";
import type { SimulationRun } from "@/types/simulation";

const KEY = "itau-ux-lab:runs:v2";
// Lotes de layouts geram 3 simulações de uma vez: guardamos as 12 mais recentes.
const MAX_RUNS = 12;

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

// ---------------------------------------------------------------------------
// Registro de decisões humanas: só cresce (acrescenta no fim, nunca reescreve).
// ---------------------------------------------------------------------------

const DECISIONS_KEY = "ux-lab:decisions:v1";

/** null = o registro existe mas está ilegível (não pode ser sobrescrito). */
function readDecisions(): HumanDecision[] | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(DECISIONS_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as HumanDecision[]) : null;
  } catch {
    return null;
  }
}

export function loadDecisions(): HumanDecision[] {
  return readDecisions() ?? [];
}

/**
 * Acrescenta a decisão e devolve o registro inteiro. Devolve false se o navegador não deixou
 * gravar ou se o registro guardado está ilegível: nesse caso não grava por cima dele.
 */
export function appendDecision(decision: HumanDecision): HumanDecision[] | false {
  const current = readDecisions();
  if (current === null) return false;
  const all = [...current, decision];
  try {
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(all));
    return all;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Relatórios dos agentes Analista e Designer por simulação: abrir o Dashboard de novo
// mostra os mesmos (as decisões continuam valendo) e não gasta a cota da Groq.
// ---------------------------------------------------------------------------

const REPORTS_KEY = "ux-lab:reports:v1";

export interface StoredReports {
  analyst: AnalystReport;
  designer: DesignerReport;
}

function loadAllReports(): Record<string, StoredReports> {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredReports>) : {};
  } catch {
    return {};
  }
}

export function loadReports(runId: string): StoredReports | null {
  return loadAllReports()[runId] ?? null;
}

/** Guarda (ou apaga, com null) os relatórios de uma simulação; só mantém os das simulações guardadas. */
export function saveReports(runId: string, reports: StoredReports | null): void {
  const keep = new Set(loadRuns().map((r) => r.id));
  const all = Object.fromEntries(Object.entries(loadAllReports()).filter(([id]) => keep.has(id) && id !== runId));
  if (reports) all[runId] = reports;
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
  } catch {
    /* sem espaço: segue sem cache */
  }
}
