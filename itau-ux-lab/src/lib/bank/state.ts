import type { AgentAction, ScreenId, ScreenVersion } from "@/types/simulation";

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
  };
  /** Versão da confirmação do Pix (A/B/C da vila); null = tela original, sem opção de repetir */
  pixVersion: ScreenVersion | null;
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
  pix: { key: "", amount: "", recurring: false, moreOpen: false },
  pixVersion: null,
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
/** Volta ao início mantendo o que não é da tarefa (saldo visível e versão da tela). */
const restart = (state: BankState): BankState => ({ ...initialBankState, balanceVisible: state.balanceVisible, pixVersion: state.pixVersion });

export function bankReducer(state: BankState, action: AgentAction | { actionId: "__reset"; value?: string }): BankState {
  const value = "value" in action ? action.value ?? "" : "";

  switch (action.actionId) {
    case "__reset":
      // value = versão da tela do Pix (A/B/C) que o Laboratório está testando
      return { ...initialBankState, pixVersion: VERSIONS.includes(value as ScreenVersion) ? (value as ScreenVersion) : null };

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
    case "pix-continue": {
      const amount = parseCurrency(state.pix.amount);
      if (state.pix.key.trim().length < 5) return { ...state, error: "Informe uma chave Pix válida." };
      if (!Number.isFinite(amount) || amount <= 0) return { ...state, error: "Informe o valor da transferência." };
      if (amount > ACCOUNT.balance) return { ...state, error: "Saldo insuficiente." };
      return navigate(state, "pix-confirm");
    }
    case "pix-confirm":
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
