"use client";

import { Construction } from "lucide-react";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import type { ScreenId } from "@/types/simulation";
import { A11yText } from "../primitives";
import { ScreenLayout } from "../ScreenLayout";

/** Telas fora do escopo do MVP: servem como "desvios" possíveis no MDP. */
export function PlaceholderScreen({ screenId }: { screenId: ScreenId }) {
  return (
    <ScreenLayout screenId={screenId} title={SCREEN_TITLES[screenId]}>
      <div className="flex flex-col items-center gap-3 p-10 text-center text-neutral-500">
        <Construction size={48} />
        <A11yText>Esta área não faz parte do protótipo. Use o botão voltar.</A11yText>
      </div>
    </ScreenLayout>
  );
}
