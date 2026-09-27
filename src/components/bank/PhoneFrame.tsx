import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";

/**
 * Moldura mobile-first: tela cheia em celulares; em telas maiores, um
 * "aparelho" centralizado de 390×780.
 */
export function PhoneFrame({ children, overlay }: { children: ReactNode; overlay?: ReactNode }) {
  return (
    <div className="relative mx-auto flex h-dvh w-full flex-col overflow-hidden bg-black sm:h-[780px] sm:w-[390px] sm:rounded-[2.5rem] sm:border-[10px] sm:border-neutral-900 sm:shadow-2xl">
      <div className="flex h-7 shrink-0 items-center justify-between bg-itau-orange px-5 text-[11px] font-semibold text-white">
        <span>9:41</span>
        <span className="flex items-center gap-1">
          <Signal size={12} /> <Wifi size={12} /> <BatteryFull size={14} />
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        {children}
        {overlay}
      </div>
    </div>
  );
}
