"use client";

import type { Dispatch, Ref } from "react";
import type { BankState } from "@/lib/bank/state";
import type { AgentAction } from "@/types/simulation";
import { BankContext } from "./BankContext";
import { HomeScreen } from "./screens/HomeScreen";
import { LoanStep1, LoanStep2, LoanStep3, LoanSuccess } from "./screens/LoanScreens";
import { PixConfirm, PixScreen, PixSuccess } from "./screens/PixScreens";
import { PlaceholderScreen } from "./screens/PlaceholderScreen";

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
