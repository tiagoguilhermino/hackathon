import type { AgentAction, ScreenId } from "@/types/simulation";

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
  pix: { key: string; amount: string };
}

export const ACCOUNT = {
  holder: "Cliente Itaú",
  agency: "0421",
  account: "12345-6",
  balance: 4_832.17,
  preApprovedLimit: 25_000,
};

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
  pix: { key: "", amount: "" },
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

export function bankReducer(state: BankState, action: AgentAction | { actionId: "__reset" }): BankState {
  const value = "value" in action ? action.value ?? "" : "";

  switch (action.actionId) {
    case "__reset":
      return initialBankState;

    // Navegação global
    case "back":
      return back(state);
    case "nav-home":
    case "success-home":
      return { ...initialBankState, balanceVisible: state.balanceVisible };

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
      return { ...initialBankState, balanceVisible: state.balanceVisible };

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
      return navigate(state, "pix-success");

    default:
      return state;
  }
}
