"use client";

import { useReducer, useRef } from "react";
import { BankApp } from "@/components/bank/BankApp";
import { PhoneFrame } from "@/components/bank/PhoneFrame";
import { TreeExportButton } from "@/components/bank/TreeExportButton";
import { LabFab } from "@/components/lab/LabFab";
import { bankReducer, initialBankState } from "@/lib/bank/state";

export default function HomePage() {
  const [state, dispatch] = useReducer(bankReducer, initialBankState);
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 sm:py-8">
      <PhoneFrame>
        <BankApp ref={rootRef} state={state} dispatch={dispatch} />
      </PhoneFrame>
      <div className="hidden sm:block">
        <TreeExportButton rootRef={rootRef} />
      </div>
      <LabFab />
    </main>
  );
}
