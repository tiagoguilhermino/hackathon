"use client";

import { useMemo } from "react";
import { initialBankState } from "@/lib/bank/state";
import type { AppLayout } from "@/lib/design/variations";
import { BankApp } from "./BankApp";

const W = 390;
const H = 780;
const noop = () => undefined;

/**
 * Prévia ao vivo da tela inicial do app laranja num layout: é o mesmo componente em que os
 * agentes navegam, em miniatura e sem interação.
 */
export function LayoutPreview({ layout, width = 150 }: { layout: AppLayout; width?: number }) {
  const state = useMemo(() => ({ ...initialBankState, layout, balanceVisible: true }), [layout]);
  const scale = width / W;
  return (
    <div inert aria-hidden className="shrink-0 overflow-hidden rounded-xl border-4 border-neutral-900 bg-black shadow-sm" style={{ width, height: H * scale }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <div className="h-7 bg-itau-orange" />
        <div style={{ height: H - 28 }}>
          <BankApp state={state} dispatch={noop} />
        </div>
      </div>
    </div>
  );
}
