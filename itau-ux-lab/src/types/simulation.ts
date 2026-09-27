import type { AppLayout } from "@/lib/design/variations";
import type { AccessibilityTree, CognitiveLoadReport } from "./a11y";
import type { AgeBand, Persona, PersonaGenerationConfig, Profession } from "./persona";

export type ScreenId =
  | "home"
  | "loan-1"
  | "loan-2"
  | "loan-3"
  | "loan-success"
  | "pix"
  | "pix-confirm"
  | "pix-success"
  | "pix-scheduled"
  | "transfer"
  | "ted"
  | "ted-confirm"
  | "ted-success"
  | "deposit"
  | "boleto-deposit"
  | "boleto-generated"
  | "my-keys"
  | "portability"
  | "payments"
  | "pay-bill"
  | "pay-bill-confirm"
  | "pay-success"
  | "invoice"
  | "cards"
  | "investments";

/** Fluxos do Victor (emprestimo, pix) e as tarefas T1 a T8 do Iury (Frontend/.../cenarios.ts). */
export type FlowId =
  | "emprestimo"
  | "pix"
  | "pix_contato"
  | "pix_recorrente"
  | "copia_e_cola"
  | "ted"
  | "minhas_chaves"
  | "boleto_deposito"
  | "pagar_boleto"
  | "conta_luz";

/** Versão da tela testada (A/B/C da vila de personas). */
export type ScreenVersion = "A" | "B" | "C";

export interface FlowVersion {
  id: ScreenVersion;
  label: string;
  description: string;
}

export interface FlowDefinition {
  id: FlowId;
  name: string;
  /** Objetivo em linguagem natural entregue ao agente */
  goal: string;
  startScreen: ScreenId;
  successScreen: ScreenId;
  /** Telas finais em que a tarefa NÃO foi cumprida (ex.: Pix enviado sem repetir) */
  failureScreens?: ScreenId[];
  /** Etapas ordenadas usadas no funil de conversão */
  funnel: ScreenId[];
  maxSteps: number;
  /**
   * Palavras que a pessoa procura na tela para essa tarefa ("cheiro de informação"). Só a política
   * por regras (modo Simulado) usa: é uma hipótese de modelagem, não um dado.
   */
  scent?: string[];
  /** Versões da tela comparadas antes × depois (só nos fluxos da vila) */
  versions?: FlowVersion[];
}

/** a ∈ A: interação com a tela */
export interface AgentAction {
  actionId: string;
  value?: string;
}

export const ABANDON = "ABANDONAR" as const;

/** Saída do agente navegador: π(a|s) amostrada */
export interface NavigatorDecision {
  action_id: string | typeof ABANDON;
  value?: string;
  reasoning: string;
  /** Tempo simulado de reflexão humana (ms) */
  think_time_ms: number;
  confidence: number;
}

export interface NavigatorRequest {
  persona: Persona;
  flowId: FlowId;
  tree: AccessibilityTree;
  history: StepLog[];
  seed: number;
  step: number;
  mockLatencyMs?: number;
  /** Escolha do Laboratório: LLM real (Groq) ou política simulada */
  mode?: "mock" | "live";
  /** Layout do app: só o oráculo (caminho de referência) usa; o prompt do agente não recebe */
  layout?: AppLayout;
}

export interface NavigatorResponse {
  decision: NavigatorDecision;
  cognitiveLoad: CognitiveLoadReport;
  /** a* segundo o oráculo do fluxo (null em estados terminais) */
  optimalActionId: string | null;
  /** Ações que fazem progresso real (caminhos alternativos válidos) */
  acceptableActionIds: string[];
  prompt: { system: string; user: string };
  mode: "mock" | "live";
  model: string | null;
  usage: TokenUsage | null;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface StepLog {
  step: number;
  screenId: string;
  actionId: string;
  value?: string;
  reasoning: string;
  thinkTimeMs: number;
  cognitiveLoad: number;
  /** A tela exibiu um alerta de erro após a ação */
  errorShown: boolean;
  /** Ação coincide com o caminho ótimo (oráculo) */
  optimal: boolean;
}

/** "wrong": chegou ao fim sem cumprir a tarefa (ex.: enviou o Pix sem deixar repetindo). */
export type AgentOutcome = "success" | "wrong" | "abandoned" | "timeout" | "error";

export interface AgentRun {
  agentIndex: number;
  persona: Persona;
  outcome: AgentOutcome;
  steps: StepLog[];
  /** Soma dos think_time_ms (tempo humano simulado) */
  totalTimeMs: number;
  /** Tela onde o agente abandonou / estourou o limite */
  exitScreen: string;
  /** Mensagem de falha técnica (outcome = "error") */
  errorMessage?: string;
}

export interface SimulationConfig {
  flowId: FlowId;
  agentCount: number;
  base: PersonaGenerationConfig;
  /** Pausa visual entre passos no Laboratório (ms) */
  visualDelayMs: number;
  /** Latência artificial do LLM mockado (ms) */
  mockLatencyMs: number;
  /** Agentes com LLM real (Groq) ou política simulada por regras */
  llmMode: "mock" | "live";
  /** Versão da tela testada, quando o fluxo tem versões */
  version?: ScreenVersion;
  /** Layout do app (peças do Iury); ausente nas simulações antigas */
  layout?: AppLayout;
  /** Simulações rodadas juntas pelo "Testar nos layouts marcados" (mesmos agentes, layouts diferentes) */
  batchId?: string;
  /** Agentes executados em paralelo (cada um em sua própria instância do app) */
  concurrency: number;
}

export interface ScreenSnapshot {
  screenId: string;
  title: string;
  cognitiveLoad: CognitiveLoadReport;
  /** Última árvore observada (texto real da tela, usado pelo Agente Designer) */
  tree: AccessibilityTree;
}

export interface SimulationRun {
  id: string;
  createdAt: number;
  finishedAt?: number;
  config: SimulationConfig;
  agents: AgentRun[];
  /** Última análise de carga cognitiva observada por tela */
  screens: Record<string, ScreenSnapshot>;
  sampleComposition: Partial<Record<Profession, number>>;
  ageComposition: Partial<Record<AgeBand, number>>;
  llm: { mode: "mock" | "live"; model: string | null; usage: TokenUsage; promptVersion?: string };
}

export type { AccessibilityTree };
