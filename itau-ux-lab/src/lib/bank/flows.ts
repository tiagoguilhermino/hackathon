import type { AgentOutcome, FlowDefinition, FlowId, ScreenId } from "@/types/simulation";
import { DEFAULT_LAYOUT, type AppLayout } from "../design/variations";
import { type BankState, parseCurrency, pixRecipient } from "./state";

const PIX_VERSIONS: FlowDefinition["versions"] = [
  { id: "A", label: "A · Repetir em Mais opções", description: "\"Repetir todo mês\" escondido no botão ⋯ (Mais opções)" },
  { id: "B", label: "B · só ícone", description: "Só um ícone de repetir, sem texto" },
  { id: "C", label: "C · ícone e texto", description: "Cartão \"Deseja automatizar?\" com o botão \"Repetir todo mês\"" },
];

/**
 * Fluxos testáveis. `emprestimo` e `pix` são do Victor; os demais são as tarefas T1 a T8 do Iury
 * (Frontend/itau-hackathon-bank-main/src/lib/cenarios.ts), com a mesma frase para personas e pessoas.
 * `funnel` é o caminho no layout padrão; o caminho em cada layout sai de flowFunnel().
 */
export const FLOWS: Record<FlowId, FlowDefinition> = {
  emprestimo: {
    id: "emprestimo",
    name: "Solicitação de Empréstimo",
    scent: ["emprest", "credito"],
    goal: "Contratar um empréstimo pessoal pelo aplicativo, escolhendo um valor e um número de parcelas adequados à sua realidade.",
    startScreen: "home",
    successScreen: "loan-success",
    funnel: ["home", "loan-1", "loan-2", "loan-3", "loan-success"],
    maxSteps: 25,
  },
  pix: {
    id: "pix",
    name: "Transferência via Pix",
    scent: ["pix"],
    goal: "Fazer um Pix de um valor pequeno para um familiar usando a chave (CPF ou celular) dele.",
    startScreen: "home",
    successScreen: "pix-success",
    funnel: ["home", "pix", "pix-confirm", "pix-success"],
    maxSteps: 18,
  },
  pix_contato: {
    id: "pix_contato",
    name: "T1 · Pix para contato",
    scent: ["pix"],
    goal: "Mande R$ 250 por Pix para Ana Paula Souza, celular (11) 98765-4321.",
    startScreen: "home",
    successScreen: "pix-success",
    funnel: ["home", "pix", "pix-confirm", "pix-success"],
    maxSteps: 18,
  },
  // Tarefa da vila de personas: a confirmação muda entre as versões A, B e C (vila-de-personas/telas).
  pix_recorrente: {
    id: "pix_recorrente",
    name: "T2 · Agendar Pix que se repete todo mês",
    scent: ["pix"],
    goal: "Deixe um Pix de R$ 250 para Ana Paula Souza, celular (11) 98765-4321, se repetindo todo mês.",
    startScreen: "home",
    successScreen: "pix-scheduled",
    funnel: ["home", "pix", "pix-confirm", "pix-scheduled"],
    maxSteps: 18,
    versions: PIX_VERSIONS,
  },
  copia_e_cola: {
    id: "copia_e_cola",
    name: "T3 · Pagar com Pix Copia e Cola",
    scent: ["pix", "copia"],
    goal: "Pague esta conta com o código Pix Copia e Cola que você recebeu.",
    startScreen: "home",
    successScreen: "pix-success",
    funnel: ["home", "pix", "pix-confirm", "pix-success"],
    maxSteps: 16,
  },
  ted: {
    id: "ted",
    name: "T4 · TED",
    scent: ["ted", "transfer"],
    goal: "Transfira R$ 300 para Marcos Oliveira, agência 1234, conta 56789-0.",
    startScreen: "home",
    successScreen: "ted-success",
    funnel: ["home", "ted", "ted-confirm", "ted-success"],
    maxSteps: 20,
  },
  minhas_chaves: {
    id: "minhas_chaves",
    name: "T5 · Receber (minha chave Pix)",
    scent: ["chave", "pix", "receb"],
    goal: "Mostre sua chave Pix para alguém te pagar.",
    startScreen: "home",
    successScreen: "my-keys",
    funnel: ["home", "deposit", "my-keys"],
    maxSteps: 14,
  },
  boleto_deposito: {
    id: "boleto_deposito",
    name: "T6 · Boleto de depósito",
    // "colocar dinheiro na conta" = depositar
    scent: ["boleto", "deposit"],
    goal: "Gere um boleto para colocar R$ 100 na sua conta.",
    startScreen: "home",
    successScreen: "boleto-generated",
    funnel: ["home", "deposit", "boleto-deposit", "boleto-generated"],
    maxSteps: 16,
  },
  pagar_boleto: {
    id: "pagar_boleto",
    name: "T7 · Pagar boleto",
    scent: ["pagar", "boleto"],
    goal: "Pague o boleto da escola, de R$ 350,00, com o código que você recebeu.",
    startScreen: "home",
    successScreen: "pay-success",
    funnel: ["home", "payments", "pay-bill", "pay-bill-confirm", "pay-success"],
    maxSteps: 16,
  },
  conta_luz: {
    id: "conta_luz",
    name: "T8 · Pagar conta de luz",
    scent: ["luz", "energia", "pagar"],
    goal: "Pague a conta de luz que vence amanhã.",
    startScreen: "home",
    successScreen: "pay-success",
    funnel: ["home", "pay-bill-confirm", "pay-success"],
    maxSteps: 14,
  },
};

const digits = (s: string) => s.replace(/\D/g, "");

/** O que a tarefa pede além de chegar à tela final (fluxos sem entrada aqui: basta chegar). */
const TASK_CHECKS: Partial<Record<FlowId, (state: BankState) => boolean>> = {
  pix_contato: (s) => s.pix.mode === "chave" && pixRecipient(s.pix.key)?.id === "ana" && parseCurrency(s.pix.amount) === 250,
  pix_recorrente: (s) => pixRecipient(s.pix.key)?.id === "ana" && parseCurrency(s.pix.amount) === 250 && s.pix.recurring,
  copia_e_cola: (s) => s.pix.mode === "copia",
  ted: (s) =>
    /marcos/i.test(s.ted.name) && digits(s.ted.agency) === "1234" && digits(s.ted.account) === "567890" && parseCurrency(s.ted.amount) === 300,
  boleto_deposito: (s) => parseCurrency(s.deposit.amount) === 100,
  pagar_boleto: (s) => s.bill === "escola",
  conta_luz: (s) => s.bill === "energia",
};

/** Telas em que uma operação com dinheiro terminou: chegar a uma que não é a da tarefa é concluir errado. */
const MONEY_ENDS: ScreenId[] = ["pix-success", "pix-scheduled", "ted-success", "boleto-generated", "pay-success", "loan-success"];

/**
 * Resultado ao chegar a uma tela final: "success" se cumpriu a tarefa, "wrong" se terminou
 * sem cumprir (ex.: enviou o Pix sem repetir, pagou outra conta), null se ainda não acabou.
 */
export function terminalOutcome(flowId: FlowId, state: BankState): Extract<AgentOutcome, "success" | "wrong"> | null {
  const flow = FLOWS[flowId];
  if (state.screen === flow.successScreen) return (TASK_CHECKS[flowId]?.(state) ?? true) ? "success" : "wrong";
  if (MONEY_ENDS.includes(state.screen) || flow.failureScreens?.includes(state.screen)) return "wrong";
  return null;
}

/** Caminho da tarefa no layout: o funil do Dashboard muda com as peças (ex.: Transferir antes do Pix). */
export function flowFunnel(flowId: FlowId, layout: AppLayout = DEFAULT_LAYOUT): ScreenId[] {
  const flow = FLOWS[flowId];
  const viaTransfer: ScreenId[] = layout.transfers === "unificadas" ? ["transfer"] : [];
  switch (flowId) {
    case "pix":
    case "pix_contato":
    case "pix_recorrente":
    case "copia_e_cola":
      return ["home", ...viaTransfer, "pix", "pix-confirm", flow.successScreen];
    case "ted":
      return ["home", ...viaTransfer, "ted", "ted-confirm", "ted-success"];
    case "minhas_chaves":
      return layout.keys === "deposito" ? ["home", "deposit", "my-keys"] : ["home", ...viaTransfer, "pix", "my-keys"];
    case "boleto_deposito":
      return layout.boleto === "atalho" ? ["home", "boleto-deposit", "boleto-generated"] : ["home", "deposit", "boleto-deposit", "boleto-generated"];
    case "pagar_boleto":
      return layout.pay === "separadas" ? ["home", "pay-bill", "pay-bill-confirm", "pay-success"] : ["home", "payments", "pay-bill", "pay-bill-confirm", "pay-success"];
    default:
      return flow.funnel;
  }
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
  transfer: "Transferir",
  ted: "TED · Dados",
  "ted-confirm": "TED · Confirmação",
  "ted-success": "TED enviada",
  deposit: "Depositar",
  "boleto-deposit": "Boleto de depósito",
  "boleto-generated": "Boleto gerado",
  "my-keys": "Minhas chaves e QR Code",
  portability: "Portabilidade de salário",
  payments: "Pagar",
  "pay-bill": "Pagar boleto",
  "pay-bill-confirm": "Pagamento · Confirmação",
  "pay-success": "Pagamento realizado",
  invoice: "Fatura do cartão",
  cards: "Cartões",
  investments: "Investimentos",
};
