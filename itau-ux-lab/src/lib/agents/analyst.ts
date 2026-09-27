import * as z from "zod/v4";
import type { Anomaly, AnalystReport, Severity, SimulationEvidence, SimulationStats } from "@/types/analytics";
import type { ScreenSnapshot } from "@/types/simulation";
import { FLOWS, SCREEN_TITLES } from "../bank/flows";
import { DIMENSION_LABELS } from "../analytics/stats";
import { DEFAULT_MOCK_LATENCY_MS, callLLM, resolveLlmMode, simulateLatency, type LlmPrompt, type LlmUsage } from "../llm/client";
import { compactJson } from "../llm/compact";

export interface AnalystRequest {
  stats: SimulationStats;
  screens: Record<string, ScreenSnapshot>;
  evidence: SimulationEvidence;
  mode?: "mock" | "live";
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
const title = (id: string) => SCREEN_TITLES[id as keyof typeof SCREEN_TITLES] ?? id;
const SEVERITY_RANK: Record<Severity, number> = { alta: 0, média: 1, baixa: 2 };

const ANALYST_SYSTEM = `Você é o Agente Analista de um laboratório de pesquisa de UX de um banco. Agentes de IA, cada um interpretando um cliente sintético com perfil demográfico próprio, navegaram por um fluxo do aplicativo. Você recebe as estatísticas agregadas dessa simulação e evidências qualitativas (o que os agentes "disseram" ao abandonar e os desvios mais frequentes).

Sua tarefa é interpretar os dados para o time de produto:
1. summary: 3 a 5 frases em português sobre o desempenho do fluxo, os principais pontos de atrito e quem é mais afetado. Cite números.
2. anomalies: os padrões que merecem atenção — segmentos com desempenho muito abaixo da média, telas com drop-off ou taxa de erro altos, relação entre carga cognitiva e abandono, e temas recorrentes nas falas dos agentes. Cada anomalia deve citar a métrica e o valor (ex.: "Idosos 60+ tiveram 70% de ações erradas na etapa 2/3 Condições").

Regras:
- Segmentos com menos de 3 agentes têm amostra insuficiente: só mencione se o efeito for extremo, e deixe isso explícito.
- Não proponha soluções de design; isso é papel de outro agente.
- Taxa de erro = proporção de ações que não avançaram o fluxo ou que dispararam alerta.
- metric deve ser um nome curto em português (ex.: "taxa de erro", "drop-off", "tempo de conclusão"), e as mensagens não devem citar nomes de campos técnicos dos dados.
- Use screenId exatamente como aparece nos dados (string vazia se a anomalia não for de uma tela), segment no formato "Dimensão: valor" (vazio se não for de um segmento) e ids curtos e únicos (ex.: "a1").`;

const AnalystSchema = z.object({
  summary: z.string(),
  anomalies: z.array(
    z.object({
      id: z.string(),
      severity: z.enum(["alta", "média", "baixa"]),
      screenId: z.string(),
      segment: z.string(),
      metric: z.string(),
      message: z.string(),
    }),
  ),
});

export function buildAnalystPrompt(req: AnalystRequest): LlmPrompt {
  const { stats } = req;
  const screens = Object.values(req.screens).map((s) => ({
    screenId: s.screenId,
    title: s.title,
    cognitiveLoad: s.cognitiveLoad.score,
    reasons: s.cognitiveLoad.reasons,
  }));
  return {
    system: ANALYST_SYSTEM,
    user: `Fluxo testado: ${FLOWS[stats.flowId as keyof typeof FLOWS]?.name ?? stats.flowId}

## Estatísticas
${compactJson({ ...stats, segmentScreen: stats.segmentScreen.filter((s) => s.actions >= 3) })}

## Carga cognitiva por tela
${compactJson(screens)}

## Falas dos agentes no momento do abandono
${compactJson(req.evidence.abandonments)}

## Desvios mais frequentes (ações que não avançaram o fluxo)
${compactJson(req.evidence.frequentDeviations)}`,
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

export async function runAnalyst(req: AnalystRequest): Promise<AnalystReport & { prompt: LlmPrompt; usage: LlmUsage | null }> {
  const prompt = buildAnalystPrompt(req);
  if (resolveLlmMode(req.mode) === "mock") {
    await simulateLatency(DEFAULT_MOCK_LATENCY_MS * 4);
    return { ...mockAnalyst(req), prompt, usage: null };
  }
  const { data, usage } = await callLLM({ prompt, schema: AnalystSchema, schemaName: "analyst_report", effort: "high" });
  const anomalies: Anomaly[] = data.anomalies.map((a) => ({
    ...a,
    screenId: a.screenId || undefined,
    segment: a.segment || undefined,
  }));
  return { summary: data.summary, anomalies, mode: "live", prompt, usage };
}
