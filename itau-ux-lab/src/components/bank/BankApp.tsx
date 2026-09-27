"use client";

import type { Dispatch, Ref } from "react";
import type { BankState } from "@/lib/bank/state";
import type { AgentAction } from "@/types/simulation";
import { BankContext } from "./BankContext";
import { HomeScreen } from "./screens/HomeScreen";
import { LoanStep1, LoanStep2, LoanStep3, LoanSuccess } from "./screens/LoanScreens";
import { BoletoDepositScreen, BoletoGenerated, DepositScreen, MyKeysScreen } from "./screens/DepositScreens";
import { InvoiceScreen, PayBillConfirm, PayBillScreen, PaySuccess, PaymentsScreen } from "./screens/PayScreens";
import { PixConfirm, PixScheduled, PixScreen, PixSuccess } from "./screens/PixScreens";
import { PlaceholderScreen } from "./screens/PlaceholderScreen";
import { TedConfirm, TedScreen, TedSuccess, TransferScreen } from "./screens/TransferScreens";

interface BankAppProps {
  state: BankState;
  dispatch: Dispatch<AgentAction>;
  ref?: Ref<HTMLDivElement>;
}

function CurrentScreen({ screen }: { screen: BankState["screen"] }) {
  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "loan-1":
      return <LoanStep1 />;
    case "loan-2":
      return <LoanStep2 />;
    case "loan-3":
      return <LoanStep3 />;
    case "loan-success":
      return <LoanSuccess />;
    case "pix":
      return <PixScreen />;
    case "pix-confirm":
      return <PixConfirm />;
    case "pix-success":
      return <PixSuccess />;
    case "pix-scheduled":
      return <PixScheduled />;
    case "transfer":
      return <TransferScreen />;
    case "ted":
      return <TedScreen />;
    case "ted-confirm":
      return <TedConfirm />;
    case "ted-success":
      return <TedSuccess />;
    case "deposit":
      return <DepositScreen />;
    case "boleto-deposit":
      return <BoletoDepositScreen />;
    case "boleto-generated":
      return <BoletoGenerated />;
    case "my-keys":
      return <MyKeysScreen />;
    case "payments":
      return <PaymentsScreen />;
    case "pay-bill":
      return <PayBillScreen />;
    case "pay-bill-confirm":
      return <PayBillConfirm />;
    case "pay-success":
      return <PaySuccess />;
    case "invoice":
      return <InvoiceScreen />;
    default:
      return <PlaceholderScreen screenId={screen} />;
  }
}

/** Ambiente controlado: estado + dispatch vêm de fora (humano ou agente). */
export function BankApp({ state, dispatch, ref }: BankAppProps) {
  return (
    <BankContext.Provider value={{ state, dispatch }}>
      <div ref={ref} data-bank-root className="relative h-full w-full overflow-hidden bg-itau-bg">
        {/* key força remontagem por tela (scroll volta ao topo) */}
        <CurrentScreen key={state.screen} screen={state.screen} />
      </div>
    </BankContext.Provider>
  );
}
