import type { SegmentDimension } from "./persona";

export interface SegmentStat {
  dimension: SegmentDimension;
  segment: string;
  agents: number;
  successRate: number;
  abandonRate: number;
  /** Tempo médio (s) entre os que concluíram */
  avgCompletionSec: number | null;
  avgSteps: number;
}

export interface ScreenStat {
  screenId: string;
  title: string;
  reached: number;
  abandoned: number;
  /** abandonos / alcançados */
  dropOffRate: number;
  /** Proporção de ações sub-ótimas ou com erro nesta tela */
  errorRate: number;
  avgThinkSec: number;
  cognitiveLoad: number;
}

export interface SegmentScreenStat {
  dimension: SegmentDimension;
  segment: string;
  screenId: string;
  actions: number;
  errorRate: number;
  dropOffRate: number;
}

export interface SimulationStats {
  runId: string;
  flowId: string;
  totalAgents: number;
  successRate: number;
  abandonRate: number;
  timeoutRate: number;
  avgCompletionSec: number | null;
  avgSteps: number;
  bySegment: Record<SegmentDimension, SegmentStat[]>;
  byScreen: ScreenStat[];
  segmentScreen: SegmentScreenStat[];
}

export type Severity = "alta" | "média" | "baixa";

export interface Anomaly {
  id: string;
  severity: Severity;
  screenId?: string;
  segment?: string;
  metric: string;
  message: string;
}

export interface AnalystReport {
  summary: string;
  anomalies: Anomaly[];
  mode: "mock" | "live";
}

/** Evidência qualitativa extraída dos logs (falas e desvios reais dos agentes). */
export interface SimulationEvidence {
  abandonments: { agent: string; screenId: string; reasoning: string; recentSteps: string[] }[];
  frequentDeviations: { screenId: string; actionId: string; count: number; sampleReasoning: string }[];
}

export interface DesignProposal {
  id: string;
  screenId: string;
  problem: string;
  change: string;
  rationale: string;
  impact: Severity;
  effort: Severity;
  relatedAnomalies: string[];
}

export interface DesignerReport {
  proposals: DesignProposal[];
  mode: "mock" | "live";
}
