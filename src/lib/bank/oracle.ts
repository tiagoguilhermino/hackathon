import type { A11yActionNode, AccessibilityTree } from "@/types/a11y";
import type { Persona } from "@/types/persona";
import type { AgentAction, FlowId } from "@/types/simulation";
import { SCROLL_DOWN } from "../a11y/extract";
import { clamp, type Rng, uniform } from "../random";

/**
 * Oráculo do MDP: a ação ótima a* para (fluxo, estado). Serve de referência
 * para a política mockada (π desvia de a* conforme a persona) e para medir
 * a taxa de ações sub-ótimas por tela. Lê apenas a árvore de acessibilidade.
 */
export function optimalAction(flowId: FlowId, tree: AccessibilityTree, persona: Persona, rng: Rng): AgentAction | null {
  const byId = new Map(tree.actions.map((a) => [a.id, a]));
  const has = (id: string) => byId.has(id);
  const node = (id: string) => byId.get(id);
  const hasAlert = tree.texts.some((t) => t.role === "alert");

  // Garante que o alvo está visível: senão, a ação ótima é rolar.
  const reach = (target: A11yActionNode | undefined): AgentAction | null => {
    if (!target) return null;
    if (!target.inViewport && has(SCROLL_DOWN)) return { actionId: SCROLL_DOWN };
    return { actionId: target.id };
  };

  if (["payments", "cards", "investments"].includes(tree.screenId)) return { actionId: "back" };

  if (flowId === "emprestimo") {
    switch (tree.screenId) {
      case "home":
        return reach(node("home-loan") ?? node("home-offer-loan"));
      case "pix":
      case "pix-confirm":
        return { actionId: "back" };
      case "loan-1": {
        const amount = node("loan-amount");
        if (amount && (!amount.value || hasAlert)) {
          const desired = clamp(Math.round((persona.demographics.income * uniform(rng, 1.2, 4)) / 100) * 100, 500, 25_000);
          return { actionId: "loan-amount", value: String(desired) };
        }
        const chosen = tree.actions.some((a) => a.id.startsWith("loan-installments-") && a.checked);
        if (!chosen) {
          const n = persona.demographics.income < 3000 ? 48 : persona.demographics.income < 7000 ? 24 : 12;
          return reach(node(`loan-installments-${n}`));
        }
        return reach(node("loan-1-continue"));
      }
      case "loan-2": {
        const terms = node("loan-terms");
        if (terms && !terms.checked) return reach(terms);
        return reach(node("loan-2-continue"));
      }
      case "loan-3":
        return reach(node("loan-3-confirm"));
      default:
        return null;
    }
  }

  // Fluxo Pix
  switch (tree.screenId) {
    case "home":
      return reach(node("home-pix"));
    case "pix": {
      const key = node("pix-key");
      if (key && key.value!.trim().length < 5) return { actionId: "pix-key", value: "11987654321" };
      const amount = node("pix-amount");
      if (amount && (!amount.value || hasAlert)) {
        return { actionId: "pix-amount", value: String(Math.round(uniform(rng, 20, 200))) };
      }
      return reach(node("pix-continue"));
    }
    case "pix-confirm":
      return reach(node("pix-confirm"));
    default:
      return tree.screenId.startsWith("loan") ? { actionId: "back" } : null;
  }
}

/**
 * Conjunto de ações que fazem progresso real no fluxo (há mais de um caminho
 * válido, ex.: preencher valor antes ou depois das parcelas). Usado para medir
 * ações sub-ótimas sem penalizar ordens alternativas corretas.
 */
export function acceptableActionIds(flowId: FlowId, tree: AccessibilityTree, preferred: AgentAction | null): string[] {
  const ids = new Set<string>(preferred ? [preferred.actionId] : []);
  const node = (id: string) => tree.actions.find((a) => a.id === id);
  const visible = (id: string) => node(id)?.inViewport ?? false;

  if (flowId === "emprestimo" && tree.screenId === "home") {
    for (const id of ["home-loan", "home-offer-loan"]) if (visible(id)) ids.add(id);
  }
  if (tree.screenId === "loan-1") {
    const hasInstallment = tree.actions.some((a) => a.id.startsWith("loan-installments-") && a.checked);
    if (!node("loan-amount")?.value) ids.add("loan-amount");
    if (!hasInstallment) tree.actions.filter((a) => a.id.startsWith("loan-installments-")).forEach((a) => ids.add(a.id));
  }
  if (tree.screenId === "pix") {
    if ((node("pix-key")?.value ?? "").trim().length < 5) ids.add("pix-key");
    if (!node("pix-amount")?.value) ids.add("pix-amount");
  }
  if (flowId === "pix" && tree.screenId === "home" && visible("nav-pix")) ids.add("nav-pix");
  return [...ids];
}
