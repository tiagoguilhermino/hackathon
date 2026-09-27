"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import type { ScreenId } from "@/types/simulation";
import { ActionButton, A11yText } from "./primitives";

interface ScreenLayoutProps {
  screenId: ScreenId;
  title: string;
  children: ReactNode;
  /** Conteúdo fixo no rodapé (sempre visível, fora da área de rolagem) */
  footer?: ReactNode;
  showBack?: boolean;
  header?: ReactNode;
}

export function ScreenLayout({ screenId, title, children, footer, showBack = true, header }: ScreenLayoutProps) {
  return (
    <section data-screen-id={screenId} data-screen-title={title} className="flex h-full min-h-0 flex-col bg-itau-bg">
      {header ?? (
        <header className="flex items-center gap-2 bg-white px-2 py-3 shadow-sm">
          {showBack ? (
            <ActionButton actionId="back" variant="ghost" ariaLabel="Voltar" className="!px-2 !py-1">
              <ChevronLeft size={24} />
            </ActionButton>
          ) : (
            <span className="w-10" />
          )}
          <A11yText role="heading" as="h1" className="flex-1 truncate text-base font-semibold text-itau-navy">
            {title}
          </A11yText>
        </header>
      )}
      <div data-scroll-container className="min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>
      {footer && <div className="border-t border-neutral-200 bg-white p-4">{footer}</div>}
    </section>
  );
}

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-4" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 flex-1 rounded-full ${i < current ? "bg-itau-orange" : "bg-neutral-300"}`} />
      ))}
    </div>
  );
}
