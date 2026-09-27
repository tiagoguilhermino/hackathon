import type { A11yActionNode, AccessibilityTree } from "@/types/a11y";
import type { Persona } from "@/types/persona";
import type { AgentAction, FlowId } from "@/types/simulation";
import { SCROLL_DOWN } from "../a11y/extract";
import { DEFAULT_LAYOUT, type AppLayout } from "../design/variations";
import { clamp, type Rng, uniform } from "../random";
import { parseCurrency, pixRecipient } from "./state";

/** Valor e destinatário pedidos nas tarefas de Pix para a Ana (T1 e T2). */
const TASK_AMOUNT = 250;
const TASK_KEY = "(11) 98765-4321";
/** Dados da TED pedida em T4. */
const TED = { name: "Marcos Oliveira", agency: "1234", account: "56789-0", amount: "300" };

const PIX_FLOWS: FlowId[] = ["pix", "pix_contato", "pix_recorrente", "copia_e_cola"];
const digits = (s: string | undefined) => (s ?? "").replace(/\D/g, "");

/**
 * Oráculo do MDP: a ação ótima a* para (fluxo, estado). Serve de referência
 * para a política mockada (π desvia de a* conforme a persona) e para medir
 * a taxa de ações sub-ótimas por tela. Lê a árvore de acessibilidade e, como quem desenhou o
 * app, conhece o layout (ex.: na Dash V3 "Minhas chaves" fica dentro do Pix, o que a tela
 * inicial não mostra). O agente navegador não recebe o layout: só a árvore.
 */
export function optimalAction(
  flowId: FlowId,
  tree: AccessibilityTree,
  persona: Persona,
  rng: Rng,
  layout: AppLayout = DEFAULT_LAYOUT,
): AgentAction | null {
  const byId = new Map(tree.actions.map((a) => [a.id, a]));
  const has = (id: string) => byId.has(id);
  const node = (id: string) => byId.get(id);
  const hasAlert = tree.texts.some((t) => t.role === "alert");
  const shows = (text: string) => tree.texts.some((t) => t.text.includes(text));
  const back: AgentAction = { actionId: "back" };

  // Garante que o alvo está visível: senão, a ação ótima é rolar.
  const reach = (target: A11yActionNode | undefined): AgentAction | null => {
    if (!target) return null;
    if (!target.inViewport && has(SCROLL_DOWN)) return { actionId: SCROLL_DOWN };
    return { actionId: target.id };
  };
  // Pix: atalho próprio (Pix e TED separados) ou Transferir → Pix; a barra de baixo também abre o Pix.
  const toPix = () => reach(node("home-pix")) ?? reach(node("home-transfer")) ?? reach(node("nav-pix"));

  if (flowId === "emprestimo") {
    switch (tree.screenId) {
      case "home":
        return reach(node("home-loan") ?? node("home-offer-loan"));
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
        return back;
    }
  }

  if (PIX_FLOWS.includes(flowId)) {
    switch (tree.screenId) {
      case "home":
        return toPix();
      case "transfer":
        return reach(node("transfer-pix"));
      case "pix": {
        if (flowId === "copia_e_cola") {
          // No layout "Contatos salvos" não há Copia e Cola: não existe caminho (caso incorreto do Iury).
          if (has("pix-paste")) return reach(node("pix-paste"));
          return reach(node("pix-cc-continue"));
        }
        const key = node("pix-key");
        if (flowId === "pix") {
          if (key && key.value!.trim().length < 5) return { actionId: "pix-key", value: "11987654321" };
          const amount = node("pix-amount");
          if (amount && (!amount.value || hasAlert)) return { actionId: "pix-amount", value: String(Math.round(uniform(rng, 20, 200))) };
          return reach(node("pix-continue"));
        }
        if (key && pixRecipient(key.value ?? "")?.id !== "ana") return reach(node("pix-contact-ana")) ?? { actionId: "pix-key", value: TASK_KEY };
        const amount = node("pix-amount");
        if (amount && parseCurrency(amount.value ?? "") !== TASK_AMOUNT) return { actionId: "pix-amount", value: String(TASK_AMOUNT) };
        return reach(node("pix-continue"));
      }
      case "pix-confirm": {
        if (flowId === "pix_recorrente") {
          // A: "Repetir" só aparece depois de abrir Mais opções; B e C: está na tela.
          const repeat = node("pix-repeat");
          if (!repeat) return reach(node("pix-more")) ?? back;
          if (!repeat.checked) return reach(repeat);
        }
        return reach(node("pix-confirm"));
      }
      default:
        return back;
    }
  }

  switch (flowId) {
    case "ted":
      switch (tree.screenId) {
        case "home":
          return reach(node("home-ted")) ?? reach(node("home-transfer"));
        case "transfer":
          return reach(node("transfer-ted"));
        case "ted": {
          if (!/marcos/i.test(node("ted-name")?.value ?? "")) return { actionId: "ted-name", value: TED.name };
          if (digits(node("ted-agency")?.value) !== digits(TED.agency)) return { actionId: "ted-agency", value: TED.agency };
          if (digits(node("ted-account")?.value) !== digits(TED.account)) return { actionId: "ted-account", value: TED.account };
          if (parseCurrency(node("ted-amount")?.value ?? "") !== 300) return { actionId: "ted-amount", value: TED.amount };
          return reach(node("ted-continue"));
        }
        case "ted-confirm":
          return reach(node("ted-send"));
        default:
          return back;
      }

    case "minhas_chaves":
      if (layout.keys === "deposito") {
        if (tree.screenId === "home") return reach(node("home-deposit"));
        if (tree.screenId === "deposit") return reach(node("deposit-keys"));
        return back;
      }
      if (tree.screenId === "home") return toPix();
      if (tree.screenId === "transfer") return reach(node("transfer-pix"));
      if (tree.screenId === "pix") return reach(node("pix-my-keys"));
      return back;

    case "boleto_deposito":
      switch (tree.screenId) {
        case "home":
          return layout.boleto === "atalho" ? reach(node("home-boleto")) : reach(node("home-deposit"));
        case "deposit":
          return reach(node("deposit-boleto"));
        case "boleto-deposit":
          if (parseCurrency(node("boleto-amount")?.value ?? "") !== 100) return { actionId: "boleto-amount", value: "100" };
          return reach(node("boleto-generate"));
        default:
          return back;
      }

    case "pagar_boleto":
      switch (tree.screenId) {
        case "home":
          return layout.pay === "separadas" ? reach(node("home-pay-bill")) : reach(node("home-pay"));
        case "payments":
          return reach(node("pay-bill-option"));
        case "pay-bill":
          return shows("Código colado") ? reach(node("pay-bill-continue")) : reach(node("pay-bill-paste"));
        case "pay-bill-confirm":
          return shows("Escola") ? reach(node("pay-bill-pay")) : back;
        default:
          return back;
      }

    case "conta_luz":
      switch (tree.screenId) {
        case "home":
          return reach(node("home-upcoming-energy"));
        case "payments":
          return reach(node("pay-upcoming-energy"));
        case "pay-bill-confirm":
          return shows("Energia") ? reach(node("pay-bill-pay")) : back;
        default:
          return back;
      }

    default:
      return null;
  }
}

/**
 * Conjunto de ações que fazem progresso real no fluxo (há mais de um caminho
 * válido, ex.: preencher valor antes ou depois das parcelas). Usado para medir
 * ações sub-ótimas sem penalizar ordens alternativas corretas.
 */
export function acceptableActionIds(
  flowId: FlowId,
  tree: AccessibilityTree,
  preferred: AgentAction | null,
  layout: AppLayout = DEFAULT_LAYOUT,
): string[] {
  const ids = new Set<string>(preferred ? [preferred.actionId] : []);
  const node = (id: string) => tree.actions.find((a) => a.id === id);
  const visible = (id: string) => node(id)?.inViewport ?? false;
  const addVisible = (...list: string[]) => list.forEach((id) => visible(id) && ids.add(id));

  if (flowId === "emprestimo" && tree.screenId === "home") addVisible("home-loan", "home-offer-loan");
  if (tree.screenId === "loan-1") {
    const hasInstallment = tree.actions.some((a) => a.id.startsWith("loan-installments-") && a.checked);
    if (!node("loan-amount")?.value) ids.add("loan-amount");
    if (!hasInstallment) tree.actions.filter((a) => a.id.startsWith("loan-installments-")).forEach((a) => ids.add(a.id));
  }

  // Pix: pelo atalho, por Transferir ou pela barra de baixo; na tela do Pix, contato ou chave digitada.
  const pixFlow = PIX_FLOWS.includes(flowId) || (flowId === "minhas_chaves" && layout.keys === "pix");
  if (pixFlow && tree.screenId === "home") addVisible("home-pix", "home-transfer", "nav-pix");
  if (tree.screenId === "pix" && flowId !== "copia_e_cola" && PIX_FLOWS.includes(flowId)) {
    if ((node("pix-key")?.value ?? "").trim().length < 5) ids.add("pix-key");
    if (!node("pix-amount")?.value) ids.add("pix-amount");
    if (flowId !== "pix" && pixRecipient(node("pix-key")?.value ?? "")?.id !== "ana") {
      ids.add("pix-key");
      addVisible("pix-contact-ana");
    }
    if (flowId !== "pix" && parseCurrency(node("pix-amount")?.value ?? "") !== TASK_AMOUNT) ids.add("pix-amount");
  }

  if (flowId === "ted" && tree.screenId === "home") addVisible("home-ted", "home-transfer");
  if (flowId === "ted" && tree.screenId === "ted") {
    // Os campos podem ser preenchidos em qualquer ordem.
    for (const id of ["ted-name", "ted-agency", "ted-account", "ted-amount"]) if (!node(id)?.value) ids.add(id);
  }
  if (flowId === "conta_luz" && tree.screenId === "home") addVisible("home-upcoming-energy", ...(layout.pay === "unificadas" ? ["home-pay"] : []));
  return [...ids];
}
