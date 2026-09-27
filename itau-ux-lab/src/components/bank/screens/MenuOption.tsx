"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { ActionButton } from "../primitives";

/** Opção de menu (Transferir, Depositar, Pagar): ícone laranja, título e uma linha de ajuda. */
export function MenuOption({ actionId, icon, title, hint }: { actionId: string; icon: ReactNode; title: string; hint: string }) {
  return (
    <ActionButton actionId={actionId} variant="secondary" prominence="normal" className="w-full !border-neutral-200 !p-3 text-left !font-normal">
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-itau-orange/10 text-itau-orange">{icon}</span>
        <span className="flex-1">
          <span className="block font-semibold text-itau-navy">{title}</span>
          <span className="block text-xs text-neutral-500">{hint}</span>
        </span>
        <ChevronRight size={18} className="text-neutral-400" />
      </span>
    </ActionButton>
  );
}
