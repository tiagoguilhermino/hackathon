"use client";

import { useReducer, useRef } from "react";
import { BankApp } from "@/components/bank/BankApp";
import { PhoneFrame } from "@/components/bank/PhoneFrame";
import { TreeExportButton } from "@/components/bank/TreeExportButton";
import { LabFab } from "@/components/lab/LabFab";
import { FLOWS } from "@/lib/bank/flows";
import { bankReducer, initialBankState } from "@/lib/bank/state";

export default function HomePage() {
  const [state, dispatch] = useReducer(bankReducer, initialBankState);
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 sm:py-8">
      <PhoneFrame>
        <BankApp ref={rootRef} state={state} dispatch={dispatch} />
      </PhoneFrame>
      <div className="hidden items-center gap-3 sm:flex">
        <label className="flex items-center gap-2 text-sm text-itau-navy">
          Confirmação do Pix
          <select
            value={state.pixVersion ?? ""}
            onChange={(e) => dispatch({ actionId: "__reset", value: e.target.value })}
            className="rounded-md border border-neutral-300 bg-white px-2 py-1.5"
          >
            <option value="">original (sem repetir)</option>
            {FLOWS.pix_recorrente.versions?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <TreeExportButton rootRef={rootRef} />
      </div>
      <LabFab />
    </main>
  );
}
