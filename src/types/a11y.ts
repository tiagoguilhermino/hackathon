/**
 * Árvore de Acessibilidade simplificada — a "observação" s que o agente recebe.
 */

export type ActionRole = "button" | "link" | "input" | "checkbox" | "radio" | "tab" | "scroll";
export type TextRole = "heading" | "text" | "alert";
export type Prominence = "low" | "normal" | "high";

export interface Bounds {
  /** Coordenadas relativas ao topo visível da viewport do app (px) */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface A11yActionNode {
  id: string;
  role: ActionRole;
  label: string;
  value?: string;
  checked?: boolean;
  placeholder?: string;
  inputMode?: "numeric" | "text" | "decimal";
  bounds: Bounds;
  /** Elemento visível sem rolagem */
  inViewport: boolean;
  prominence: Prominence;
  disabled: boolean;
}

export interface A11yTextNode {
  role: TextRole;
  text: string;
  inViewport: boolean;
}

export interface AccessibilityTree {
  screenId: string;
  screenTitle: string;
  viewport: { width: number; height: number; scrollTop: number; scrollHeight: number };
  canScrollDown: boolean;
  texts: A11yTextNode[];
  actions: A11yActionNode[];
  capturedAt: number;
}

export interface CognitiveLoadReport {
  /** Score normalizado [0, 1] */
  score: number;
  level: "baixa" | "média" | "alta";
  wordCount: number;
  jargonTerms: string[];
  actionCount: number;
  /** Ações relevantes fora da dobra ou com baixa proeminência */
  hiddenActions: string[];
  lowProminenceActions: string[];
  reasons: string[];
}
