import type { AgentOutcome, FlowDefinition, FlowId, ScreenId } from "@/types/simulation";
import { type BankState, parseCurrency, pixRecipient } from "./state";

export const FLOWS: Record<FlowId, FlowDefinition> = {
  emprestimo: {
    id: "emprestimo",
    name: "Solicitação de Empréstimo",
    goal: "Contratar um empréstimo pessoal pelo aplicativo, escolhendo um valor e um número de parcelas adequados à sua realidade.",
    startScreen: "home",
    successScreen: "loan-success",
    funnel: ["home", "loan-1", "loan-2", "loan-3", "loan-success"],
    maxSteps: 25,
  },
  pix: {
    id: "pix",
    name: "Transferência via Pix",
    goal: "Fazer um Pix de um valor pequeno para um familiar usando a chave (CPF ou celular) dele.",
    startScreen: "home",
    successScreen: "pix-success",
    funnel: ["home", "pix", "pix-confirm", "pix-success"],
    maxSteps: 18,
  },
  // Tarefa da vila de personas: a confirmação muda entre as versões A, B e C (vila-de-personas/telas).
  pix_recorrente: {
    id: "pix_recorrente",
    name: "Agendar Pix que se repete todo mês",
    goal: "Agendar um Pix que se repete todo mês: R$ 250 do aluguel para Ana Paula Souza.",
    startScreen: "home",
    successScreen: "pix-scheduled",
    failureScreens: ["pix-success"],
    funnel: ["home", "pix", "pix-confirm", "pix-scheduled"],
    maxSteps: 18,
    versions: [
      { id: "A", label: "A · Repetir em Mais opções", description: "\"Repetir todo mês\" escondido no botão ⋯ (Mais opções)" },
      { id: "B", label: "B · só ícone", description: "Só um ícone de repetir, sem texto" },
      { id: "C", label: "C · ícone e texto", description: "Cartão \"Deseja automatizar?\" com o botão \"Repetir todo mês\"" },
    ],
  },
};

/** O que a tarefa pede além de chegar à tela final (fluxos sem entrada aqui: basta chegar). */
const TASK_CHECKS: Partial<Record<FlowId, (state: BankState) => boolean>> = {
  pix_recorrente: (s) => pixRecipient(s.pix.key)?.id === "ana" && parseCurrency(s.pix.amount) === 250 && s.pix.recurring,
};

/**
 * Resultado ao chegar a uma tela final: "success" se cumpriu a tarefa, "wrong" se terminou
 * sem cumprir (ex.: enviou o Pix sem repetir ou para outra pessoa), null se ainda não acabou.
 */
export function terminalOutcome(flowId: FlowId, state: BankState): Extract<AgentOutcome, "success" | "wrong"> | null {
  const flow = FLOWS[flowId];
  if (state.screen === flow.successScreen) return (TASK_CHECKS[flowId]?.(state) ?? true) ? "success" : "wrong";
  if (flow.failureScreens?.includes(state.screen)) return "wrong";
  return null;
}

export const SCREEN_TITLES: Record<ScreenId, string> = {
  home: "Início",
  "loan-1": "Empréstimo · 1/3 Simulação",
  "loan-2": "Empréstimo · 2/3 Condições",
  "loan-3": "Empréstimo · 3/3 Confirmação",
  "loan-success": "Empréstimo contratado",
  pix: "Pix · Dados",
  "pix-confirm": "Pix · Confirmação",
  "pix-success": "Pix enviado",
  "pix-scheduled": "Pix agendado",
  payments: "Pagamentos",
  cards: "Cartões",
  investments: "Investimentos",
};
