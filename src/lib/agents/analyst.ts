import type { Anomaly, AnalystReport, Severity, SimulationStats } from "@/types/analytics";
import type { ScreenSnapshot } from "@/types/simulation";
import { FLOWS, SCREEN_TITLES } from "../bank/flows";
import { DIMENSION_LABELS } from "../analytics/stats";
import { DEFAULT_MOCK_LATENCY_MS, callLLM, getLlmMode, parseJsonResponse, simulateLatency, type LlmPrompt } from "../llm/client";

export interface AnalystRequest {
  stats: SimulationStats;
  screens: Record<string, ScreenSnapshot>;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
const title = (id: string) => SCREEN_TITLES[id as keyof typeof SCREEN_TITLES] ?? id;
const SEVERITY_RANK: Record<Severity, number> = { alta: 0, média: 1, baixa: 2 };

const ANALYST_SYSTEM = `Você é o Agente Analista de um laboratório de UX de um banco. Recebe estatísticas agregadas de uma simulação em que agentes-persona (LLM) navegaram por um fluxo do app.

Tarefas:
1. Escreva um sumário interpretativo (3-5 frases) sobre o desempenho do fluxo.
2. Identifique anomalias: segmentos demográficos com desempenho muito abaixo da média, telas com drop-off ou taxa de erro altos, e correlações com a carga cognitiva das telas. Cite números (ex.: "Idosos 60+ tiveram 70% de taxa de erro na etapa 2").
3. Não proponha soluções de design — isso é papel de outro agente.
Ignore segmentos com menos de 3 agentes (amostra insuficiente).

Responda SOMENTE com JSON: {"summary": string, "anomalies": [{"id": string, "severity": "alta"|"média"|"baixa", "screenId"?: string, "segment"?: string, "metric": string, "message": string}]}`;

export function buildAnalystPrompt(req: AnalystRequest): LlmPrompt {
  const { stats } = req;
  const screens = Object.values(req.screens).map((s) => ({
    screenId: s.screenId,
    cognitiveLoad: s.cognitiveLoad.score,
    reasons: s.cognitiveLoad.reasons,
  }));
  return {
    system: ANALYST_SYSTEM,
    user: `Fluxo: ${FLOWS[stats.flowId as keyof typeof FLOWS]?.name ?? stats.flowId}
Estatísticas: ${JSON.stringify({ ...stats, segmentScreen: stats.segmentScreen.filter((s) => s.actions >= 3) })}
Carga cognitiva por tela: ${JSON.stringify(screens)}`,
  };
}

/** Analista mockado: detecção de anomalias por regras sobre as estatísticas. */
export function mockAnalyst(req: AnalystRequest): AnalystReport {
  const { stats } = req;
  const anomalies: Anomaly[] = [];
  const minN = 3;

  // Segmentos com sucesso muito abaixo da média
  for (const segs of Object.values(stats.bySegment)) {
    for (const s of segs) {
      const gap = stats.successRate - s.successRate;
      if (s.agents < minN || gap < 0.15) continue;
      anomalies.push({
        id: `seg-${s.dimension}-${s.segment}`,
        severity: gap >= 0.3 ? "alta" : "média",
        segment: `${DIMENSION_LABELS[s.dimension]}: ${s.segment}`,
        metric: "taxa de sucesso",
        message: `${DIMENSION_LABELS[s.dimension]} "${s.segment}" concluiu apenas ${pct(s.successRate)} das vezes (média geral ${pct(stats.successRate)}, n=${s.agents}).`,
      });
    }
  }

  // Tempo de conclusão muito acima da média
  if (stats.avgCompletionSec) {
    for (const segs of Object.values(stats.bySegment)) {
      for (const s of segs) {
        if (s.agents < minN || !s.avgCompletionSec || s.avgCompletionSec < stats.avgCompletionSec * 1.5) continue;
        anomalies.push({
          id: `time-${s.dimension}-${s.segment}`,
          severity: "baixa",
          segment: `${DIMENSION_LABELS[s.dimension]}: ${s.segment}`,
          metric: "tempo de conclusão",
          message: `${DIMENSION_LABELS[s.dimension]} "${s.segment}" levou ${s.avgCompletionSec.toFixed(0)}s em média para concluir, ${(s.avgCompletionSec / stats.avgCompletionSec).toFixed(1)}x a média.`,
        });
      }
    }
  }

  // Pontos de abandono
  for (const sc of stats.byScreen) {
    if (sc.reached < minN || sc.dropOffRate < 0.2) continue;
    anomalies.push({
      id: `drop-${sc.screenId}`,
      severity: sc.dropOffRate >= 0.35 ? "alta" : "média",
      screenId: sc.screenId,
      metric: "drop-off",
      message: `${pct(sc.dropOffRate)} dos agentes que chegaram em "${sc.title}" abandonaram ali (${sc.abandoned}/${sc.reached}). Carga cognitiva da tela: ${sc.cognitiveLoad.toFixed(2)}.`,
    });
  }

  // Taxa de erro por segmento × tela (ex.: idosos na etapa 2)
  for (const ss of stats.segmentScreen) {
    if (ss.actions < 5 || ss.errorRate < 0.5 || ss.dimension === "deviceTier") continue;
    anomalies.push({
      id: `err-${ss.dimension}-${ss.segment}-${ss.screenId}`,
      severity: ss.errorRate >= 0.7 ? "alta" : "média",
      screenId: ss.screenId,
      segment: `${DIMENSION_LABELS[ss.dimension]}: ${ss.segment}`,
      metric: "taxa de erro",
      message: `${DIMENSION_LABELS[ss.dimension]} "${ss.segment}" teve ${pct(ss.errorRate)} de ações erradas/sub-ótimas em "${title(ss.screenId)}".`,
    });
  }

  anomalies.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const worstScreen = [...stats.byScreen].sort((a, b) => b.abandoned - a.abandoned)[0];
  const worstSegment = Object.values(stats.bySegment)
    .flat()
    .filter((s) => s.agents >= minN)
    .sort((a, b) => a.successRate - b.successRate)[0];

  const summary = [
    `Dos ${stats.totalAgents} agentes simulados, ${pct(stats.successRate)} concluíram o fluxo, ${pct(stats.abandonRate)} abandonaram e ${pct(stats.timeoutRate)} esgotaram o limite de passos.`,
    stats.avgCompletionSec ? `Quem concluiu levou em média ${stats.avgCompletionSec.toFixed(0)}s (tempo humano simulado) e ${stats.avgSteps.toFixed(1)} passos.` : "",
    worstScreen?.abandoned
      ? `O principal ponto de atrito é "${worstScreen.title}", onde ocorreram ${worstScreen.abandoned} abandonos e ${pct(worstScreen.errorRate)} das ações foram erradas ou sub-ótimas.`
      : "",
    worstSegment
      ? `O segmento mais afetado é ${DIMENSION_LABELS[worstSegment.dimension].toLowerCase()} "${worstSegment.segment}" (${pct(worstSegment.successRate)} de sucesso), o que sugere barreiras de compreensão e não de intenção.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return { summary, anomalies: anomalies.slice(0, 10), mode: "mock" };
}

export async function runAnalyst(req: AnalystRequest): Promise<AnalystReport & { prompt: LlmPrompt }> {
  const prompt = buildAnalystPrompt(req);
  if (getLlmMode() === "mock") {
    await simulateLatency(DEFAULT_MOCK_LATENCY_MS * 4);
    return { ...mockAnalyst(req), prompt };
  }
  const parsed = parseJsonResponse<Omit<AnalystReport, "mode">>(await callLLM(prompt));
  return { ...parsed, mode: "live", prompt };
}
