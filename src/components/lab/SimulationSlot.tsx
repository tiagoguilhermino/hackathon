"use client";

import { useImperativeHandle, useReducer, useRef, type Ref } from "react";
import { flushSync } from "react-dom";
import { BankApp } from "@/components/bank/BankApp";
import { PhoneFrame } from "@/components/bank/PhoneFrame";
import { TreeExportButton } from "@/components/bank/TreeExportButton";
import { bankReducer, initialBankState } from "@/lib/bank/state";
import { PROFESSION_LABELS } from "@/lib/personas/config";
import type { AppSlot } from "@/lib/simulation/runner";
import type { Persona } from "@/types/persona";
import { AgentCursor, type CursorState } from "./AgentCursor";

const PHONE_W = 390;
const PHONE_H = 780;

export interface SlotView {
  persona: Persona | null;
  agentIndex: number | null;
  cursor: CursorState | null;
}

interface SimulationSlotProps {
  ref: Ref<AppSlot>;
  view: SlotView;
  scale: number;
  showExport?: boolean;
}

/** Uma instância independente do app bancário onde um agente navega. */
export function SimulationSlot({ ref, view, scale, showExport }: SimulationSlotProps) {
  const [state, dispatch] = useReducer(bankReducer, initialBankState);
  const rootRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getRoot: () => rootRef.current,
    dispatch: (action) => flushSync(() => dispatch(action)),
  }));

  const p = view.persona;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-9 w-full max-w-[390px] text-center text-xs leading-tight text-neutral-600" style={{ width: PHONE_W * scale }}>
        {p ? (
          <>
            <div className="truncate font-semibold text-itau-navy">
              #{(view.agentIndex ?? 0) + 1} {p.name}
            </div>
            <div className="truncate">
              {p.demographics.age} anos · {PROFESSION_LABELS[p.demographics.profession]} · literacia{" "}
              {p.demographics.digitalLiteracy.toFixed(2)}
            </div>
          </>
        ) : (
          <div className="pt-2 text-neutral-400">livre</div>
        )}
      </div>
      <div style={{ width: PHONE_W * scale, height: PHONE_H * scale }}>
        <div style={{ width: PHONE_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <PhoneFrame overlay={<AgentCursor cursor={view.cursor} />}>
            <BankApp ref={rootRef} state={state} dispatch={dispatch} />
          </PhoneFrame>
        </div>
      </div>
      {showExport && <TreeExportButton rootRef={rootRef} />}
    </div>
  );
}
