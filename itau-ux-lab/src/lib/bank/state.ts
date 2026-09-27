import type { AgentAction, ScreenId, ScreenVersion } from "@/types/simulation";
import { DEFAULT_LAYOUT, type AppLayout } from "../design/variations";

/**
 * Estado do ambiente (s ∈ S). A UI é uma função pura deste estado, e toda
 * interação — de humanos ou agentes — passa pelo mesmo reducer.
 */
export interface BankState {
  screen: ScreenId;
  history: ScreenId[];
  balanceVisible: boolean;
  error: string | null;
  loan: {
    amount: string;
    installments: number | null;
    amortization: "price" | "sac";
    insurance: boolean;
    termsAccepted: boolean;
    detailsOpen: boolean;
  };
  pix: {
    key: string;
    amount: string;
    /** "Repetir todo mês" ligado na confirmação */
    recurring: boolean;
    /** Menu "Mais opções" aberto (versão A) */
    moreOpen: boolean;
    /** Código Pix Copia e Cola colado */
    pasted: boolean;
    /** Como o Pix segue para a confirmação: pela chave digitada ou pelo Copia e Cola */
    mode: "chave" | "copia";
  };
  /** Versão da confirmação do Pix (A/B/C da vila); null = tela original, sem opção de repetir */
  pixVersion: ScreenVersion | null;
  /** Layout do app (peças do Iury): onde ficam Pix, TED, boleto, chaves e Pagar */
  layout: AppLayout;
  ted: { name: string; agency: string; account: string; amount: string };
  deposit: { amount: string };
  /** Conta escolhida para pagar (boleto colado, conta a vencer ou fatura) */
  bill: BillId | null;
  billPasted: boolean;
}

/** "__reset" leva a versão da confirmação do Pix (value) e o layout do app. */
export interface ResetAction {
  actionId: "__reset";
  value?: string;
  layout?: AppLayout;
}

export const ACCOUNT = {
  holder: "Cliente Lume",
  agency: "0421",
  account: "12345-6",
  balance: 4_832.17,
  preApprovedLimit: 25_000,
};

/** Contatos fictícios do fluxo da vila (os mesmos das telas A, B e C). */
export const PIX_CONTACTS = [
  { id: "ana", name: "Ana Paula Souza", key: "(11) 98765-4321", detail: "Celular · Banco Lume" },
  { id: "marcos", name: "Marcos Lima", key: "marcos.lima@exemplo.com", detail: "E-mail · Banco Aurora" },
] as const;

/** Cobrança fictícia que o botão "Colar código" do Pix Copia e Cola cola. */
export const COPY_PASTE_CHARGE = { payee: "Loja Exemplo (fictícia)", amount: 89.9 };

/** Contas fictícias: o boleto da escola (colado), as contas a vencer e a fatura do cartão. */
export const BILLS = {
  escola: { name: "Escola Aprender (fictícia)", amount: 350, due: "vence em 5 dias" },
  energia: { name: "Energia · Luz Brasil (fictícia)", amount: 184.7, due: "vence amanhã" },
  celular: { name: "Celular · Fala Mais (fictícia)", amount: 69.9, due: "vence 02 out" },
  fatura: { name: "Fatura do cartão final 4821", amount: 1893.42, due: "fecha em 8 dias" },
} as const;
export type BillId = keyof typeof BILLS;

const normalizeKey = (key: string) => (/\d/.test(key) && !key.includes("@") ? key.replace(/\D/g, "") : key.trim().toLowerCase());

/** Contato dono da chave digitada ou escolhida, se for um dos contatos. */
export function pixRecipient(key: string) {
  const k = normalizeKey(key);
  return k ? PIX_CONTACTS.find((c) => normalizeKey(c.key) === k) : undefined;
}

export const LOAN_LIMITS = { min: 500, max: 25_000 };
export const LOAN_MONTHLY_RATE = 0.0249;
export const INSTALLMENT_OPTIONS = [12, 24, 36, 48] as const;

export const initialBankState: BankState = {
  screen: "home",
  history: [],
  balanceVisible: false,
  error: null,
  loan: {
    amount: "",
    installments: null,
    amortization: "price",
    // Pré-marcado de propósito: dark pattern que o simulador deve detectar.
    insurance: true,
    termsAccepted: false,
    detailsOpen: false,
  },
  pix: { key: "", amount: "", recurring: false, moreOpen: false, pasted: false, mode: "chave" },
  pixVersion: null,
  layout: DEFAULT_LAYOUT,
  ted: { name: "", agency: "", account: "", amount: "" },
  deposit: { amount: "" },
  bill: null,
  billPasted: false,
};

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Parcela pelo sistema Price */
export function priceInstallment(principal: number, n: number, rate = LOAN_MONTHLY_RATE): number {
  return (principal * rate) / (1 - Math.pow(1 + rate, -n));
}

function navigate(state: BankState, screen: ScreenId): BankState {
  return { ...state, screen, history: [...state.history, state.screen], error: null };
}

function back(state: BankState): BankState {
  const history = [...state.history];
  const previous = history.pop() ?? "home";
  return { ...state, screen: previous, history, error: null };
}

const VERSIONS: ScreenVersion[] = ["A", "B", "C"];
/** Volta ao início mantendo o que não é da tarefa (saldo visível, versão da tela e layout). */
const restart = (state: BankState): BankState => ({
  ...initialBankState,
  balanceVisible: state.balanceVisible,
  pixVersion: state.pixVersion,
  layout: state.layout,
});

const pickBill = (state: BankState, bill: BillId): BankState => navigate({ ...state, bill }, "pay-bill-confirm");

export function bankReducer(state: BankState, action: AgentAction | ResetAction): BankState {
  const value = "value" in action ? action.value ?? "" : "";

  switch (action.actionId) {
    case "__reset":
      // value = versão da tela do Pix (A/B/C) que o Laboratório está testando
      return {
        ...initialBankState,
        pixVersion: VERSIONS.includes(value as ScreenVersion) ? (value as ScreenVersion) : null,
        layout: ("layout" in action && action.layout) || DEFAULT_LAYOUT,
      };

    // Navegação global
    case "back":
      return back(state);
    case "nav-home":
    case "success-home":
      return restart(state);

    // Home
    case "home-toggle-balance":
      return { ...state, balanceVisible: !state.balanceVisible };
    case "home-pix":
    case "nav-pix":
      return navigate(state, "pix");
    case "home-pay":
      return navigate(state, "payments");
    case "home-cards":
    case "nav-cards":
      return navigate(state, "cards");
    case "home-invest":
      return navigate(state, "investments");
    case "home-loan":
    case "home-offer-loan":
      return navigate(state, "loan-1");

    // Empréstimo — etapa 1
    case "loan-amount":
      return { ...state, error: null, loan: { ...state.loan, amount: value } };
    case "loan-installments-12":
    case "loan-installments-24":
    case "loan-installments-36":
    case "loan-installments-48":
      return { ...state, loan: { ...state.loan, installments: Number(action.actionId.split("-").pop()) } };
    case "loan-1-continue": {
      const amount = parseCurrency(state.loan.amount);
      if (!Number.isFinite(amount) || amount < LOAN_LIMITS.min || amount > LOAN_LIMITS.max) {
        return {
          ...state,
          error: `Informe um valor entre ${formatBRL(LOAN_LIMITS.min)} e ${formatBRL(LOAN_LIMITS.max)}.`,
        };
      }
      if (!state.loan.installments) return { ...state, error: "Selecione a quantidade de parcelas." };
      return navigate(state, "loan-2");
    }

    // Empréstimo — etapa 2
    case "loan-amort-price":
      return { ...state, loan: { ...state.loan, amortization: "price" } };
    case "loan-amort-sac":
      return { ...state, loan: { ...state.loan, amortization: "sac" } };
    case "loan-insurance":
      return { ...state, loan: { ...state.loan, insurance: !state.loan.insurance } };
    case "loan-terms":
      return { ...state, error: null, loan: { ...state.loan, termsAccepted: !state.loan.termsAccepted } };
    case "loan-details":
      return { ...state, loan: { ...state.loan, detailsOpen: !state.loan.detailsOpen } };
    case "loan-2-continue":
      if (!state.loan.termsAccepted) {
        return { ...state, error: "É necessário declarar ciência das condições contratuais para prosseguir." };
      }
      return navigate(state, "loan-3");

    // Empréstimo — etapa 3
    case "loan-3-confirm":
      return navigate(state, "loan-success");
    case "loan-3-cancel":
      return restart(state);

    // PIX
    case "pix-key":
      return { ...state, error: null, pix: { ...state.pix, key: value } };
    case "pix-amount":
      return { ...state, error: null, pix: { ...state.pix, amount: value } };
    // Transferir (layout com Pix e TED dentro de Transferir)
    case "home-transfer":
      return navigate(state, "transfer");
    case "transfer-pix":
      return navigate(state, "pix");
    case "transfer-ted":
    case "home-ted":
      return navigate(state, "ted");

    // TED
    case "ted-name":
    case "ted-agency":
    case "ted-account":
    case "ted-amount":
      return { ...state, error: null, ted: { ...state.ted, [action.actionId.slice(4)]: value } };
    case "ted-continue": {
      const { name, agency, account, amount } = state.ted;
      if (!name.trim() || !agency.trim() || !account.trim()) return { ...state, error: "Preencha nome, agência e conta do favorecido." };
      const v = parseCurrency(amount);
      if (!Number.isFinite(v) || v <= 0) return { ...state, error: "Informe o valor da transferência." };
      if (v > ACCOUNT.balance) return { ...state, error: "Saldo insuficiente." };
      return navigate(state, "ted-confirm");
    }
    case "ted-send":
      return navigate(state, "ted-success");

    // Depositar: boleto de depósito, minhas chaves e portabilidade
    case "home-deposit":
      return navigate(state, "deposit");
    case "deposit-boleto":
    case "home-boleto":
      return navigate(state, "boleto-deposit");
    case "deposit-keys":
    case "pix-my-keys":
      return navigate(state, "my-keys");
    case "deposit-portability":
      return navigate(state, "portability");
    case "boleto-amount":
      return { ...state, error: null, deposit: { amount: value } };
    case "boleto-generate": {
      const v = parseCurrency(state.deposit.amount);
      if (!Number.isFinite(v) || v <= 0) return { ...state, error: "Informe o valor do depósito." };
      return navigate(state, "boleto-generated");
    }

    // Pagar: boleto (colar código), contas a vencer e fatura
    case "home-pay-bill":
    case "pay-bill-option":
      return navigate(state, "pay-bill");
    case "home-invoice":
    case "pay-invoice-option":
      return navigate(state, "invoice");
    case "pay-bill-paste":
      return { ...state, error: null, bill: "escola", billPasted: true };
    case "pay-bill-continue":
      if (!state.billPasted) return { ...state, error: "Cole o código do boleto para continuar." };
      return navigate(state, "pay-bill-confirm");
    case "home-upcoming-energy":
    case "pay-upcoming-energy":
      return pickBill(state, "energia");
    case "home-upcoming-phone":
    case "pay-upcoming-phone":
      return pickBill(state, "celular");
    case "pay-bill-pay":
      return navigate(state, "pay-success");
    case "invoice-pay":
      return navigate({ ...state, bill: "fatura" }, "pay-success");

    // Pix Copia e Cola (layout com o Pix abrindo no Copia e Cola)
    case "pix-paste":
      return { ...state, error: null, pix: { ...state.pix, pasted: true } };
    case "pix-cc-continue":
      if (!state.pix.pasted) return { ...state, error: "Cole o código Pix Copia e Cola para continuar." };
      return navigate({ ...state, pix: { ...state.pix, mode: "copia" } }, "pix-confirm");

    case "pix-continue": {
      const amount = parseCurrency(state.pix.amount);
      if (state.pix.key.trim().length < 5) return { ...state, error: "Informe uma chave Pix válida." };
      if (!Number.isFinite(amount) || amount <= 0) return { ...state, error: "Informe o valor da transferência." };
      if (amount > ACCOUNT.balance) return { ...state, error: "Saldo insuficiente." };
      return navigate({ ...state, pix: { ...state.pix, mode: "chave" } }, "pix-confirm");
    }
    case "pix-confirm":
      if (state.pix.mode === "copia") return navigate(state, "pix-success");
      return navigate(state, state.pix.recurring ? "pix-scheduled" : "pix-success");

    // PIX que se repete todo mês (versões A/B/C da vila)
    case "pix-more":
      return { ...state, pix: { ...state.pix, moreOpen: !state.pix.moreOpen } };
    case "pix-repeat":
      return { ...state, pix: { ...state.pix, recurring: !state.pix.recurring } };

    default: {
      const contact = PIX_CONTACTS.find((c) => action.actionId === `pix-contact-${c.id}`);
      if (contact) return { ...state, error: null, pix: { ...state.pix, key: contact.key } };
      return state;
    }
  }
}
