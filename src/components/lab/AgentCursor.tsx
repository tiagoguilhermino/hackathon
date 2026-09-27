import { ChevronsDown, LogOut } from "lucide-react";
import type { Bounds } from "@/types/a11y";

export interface CursorState {
  kind: "target" | "scroll" | "abandon";
  bounds?: Bounds;
  label: string;
}

/** Destaque visual da ação escolhida pelo agente, sobreposto ao app. */
export function AgentCursor({ cursor }: { cursor: CursorState | null }) {
  if (!cursor) return null;

  if (cursor.kind === "target" && cursor.bounds) {
    const { x, y, width, height } = cursor.bounds;
    return (
      <div className="pointer-events-none absolute inset-0 z-30">
        <div
          className="agent-target absolute rounded-xl border-2 border-itau-orange transition-all duration-200"
          style={{ left: x - 3, top: y - 3, width: width + 6, height: height + 6 }}
        />
        <div
          className="absolute max-w-[220px] truncate rounded-md bg-itau-navy px-2 py-0.5 text-[10px] font-medium text-white"
          style={{ left: Math.max(4, x), top: Math.max(4, y - 22) }}
        >
          {cursor.label}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center">
      <span
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-lg ${cursor.kind === "abandon" ? "bg-red-600" : "bg-itau-navy"}`}
      >
        {cursor.kind === "abandon" ? <LogOut size={14} /> : <ChevronsDown size={14} />}
        {cursor.label}
      </span>
    </div>
  );
}
