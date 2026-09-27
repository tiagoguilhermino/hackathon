import type { AccessibilityTree, CognitiveLoadReport } from "@/types/a11y";

/** Termos técnicos que elevam a carga cognitiva para público leigo. */
export const JARGON_GLOSSARY: Record<string, string> = {
  "cet": "custo total do empréstimo por ano",
  "custo efetivo total": "custo total do empréstimo por ano",
  "iof": "imposto do governo sobre o empréstimo",
  "selic": "taxa básica de juros do país",
  "a.m.": "ao mês",
  "a.a.": "ao ano",
  "pós-fixada": "que pode mudar ao longo do tempo",
  "capitalizada": "juros sobre juros",
  "amortização": "forma de pagar a dívida",
  "tabela price": "parcelas iguais",
  "sac": "parcelas que diminuem",
  "prestamista": "seguro que quita a dívida em caso de morte ou invalidez",
  "ccb": "contrato do empréstimo",
  "cédula de crédito bancário": "contrato do empréstimo",
  "tac": "tarifa de cadastro",
  "carência": "prazo até a primeira parcela",
  "pro rata die": "proporcional aos dias",
  "inadimplemento": "atraso no pagamento",
  "encargos moratórios": "multa e juros por atraso",
  "indexada": "atrelada",
  "saldo devedor": "quanto falta pagar",
  "montante": "total pago",
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Heurística determinística de carga cognitiva de uma tela, computada a partir
 * da árvore de acessibilidade (não depende de anotação manual das telas).
 */
export function analyzeCognitiveLoad(tree: AccessibilityTree): CognitiveLoadReport {
  const fullText = tree.texts.map((t) => t.text).join(" ") + " " + tree.actions.map((a) => a.label).join(" ");
  const lower = fullText.toLowerCase();
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const jargonTerms = Object.keys(JARGON_GLOSSARY).filter((term) => lower.includes(term));

  const meaningful = tree.actions.filter((a) => a.role !== "scroll" && a.id !== "back");
  const hiddenActions = meaningful.filter((a) => !a.inViewport).map((a) => a.id);
  const lowProminenceActions = meaningful.filter((a) => a.prominence === "low").map((a) => a.id);

  const textScore = clamp01((wordCount - 40) / 160);
  const jargonScore = clamp01(jargonTerms.length / 8);
  const choiceScore = clamp01((meaningful.length - 4) / 10);
  const hiddenScore = clamp01((hiddenActions.length + lowProminenceActions.length) / 3);

  const score = Math.round(clamp01(0.25 * textScore + 0.35 * jargonScore + 0.15 * choiceScore + 0.25 * hiddenScore) * 100) / 100;

  const reasons: string[] = [];
  if (textScore > 0.3) reasons.push(`Texto extenso (${wordCount} palavras visíveis).`);
  if (jargonTerms.length) reasons.push(`Jargão financeiro: ${jargonTerms.slice(0, 6).join(", ")}.`);
  if (hiddenActions.length) reasons.push(`${hiddenActions.length} ação(ões) fora da área visível sem rolagem.`);
  if (lowProminenceActions.length) reasons.push(`Ações com baixo contraste/destaque: ${lowProminenceActions.join(", ")}.`);
  if (choiceScore > 0.3) reasons.push(`Muitas opções simultâneas (${meaningful.length}).`);

  return {
    score,
    level: score < 0.3 ? "baixa" : score < 0.55 ? "média" : "alta",
    wordCount,
    jargonTerms,
    actionCount: meaningful.length,
    hiddenActions,
    lowProminenceActions,
    reasons,
  };
}
