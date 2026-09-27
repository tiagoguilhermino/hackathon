import type { FlowDefinition, FlowId, ScreenId } from "@/types/simulation";

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
};

export const SCREEN_TITLES: Record<ScreenId, string> = {
  home: "Início",
  "loan-1": "Empréstimo · 1/3 Simulação",
  "loan-2": "Empréstimo · 2/3 Condições",
  "loan-3": "Empréstimo · 3/3 Confirmação",
  "loan-success": "Empréstimo contratado",
  pix: "Pix · Dados",
  "pix-confirm": "Pix · Confirmação",
  "pix-success": "Pix enviado",
  payments: "Pagamentos",
  cards: "Cartões",
  investments: "Investimentos",
};
