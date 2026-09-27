import { Smartphone, User } from "lucide-react";
import type { Persona } from "@/types/persona";
import { PROFESSION_LABELS, literacyBand } from "@/lib/personas/config";
import { formatBRL } from "@/lib/bank/state";

export function PersonaCard({ persona, index, total }: { persona: Persona; index: number; total: number }) {
  const d = persona.demographics;
  const band = literacyBand(d.digitalLiteracy);
  const color = band === "baixa" ? "bg-red-500" : band === "média" ? "bg-amber-500" : "bg-green-600";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-semibold text-itau-navy">
          <User size={16} /> {persona.name}
        </span>
        <span className="text-xs text-neutral-500">
          agente {index + 1}/{total}
        </span>
      </div>
      <div className="mt-1 text-xs text-neutral-600">
        {d.age} anos · {PROFESSION_LABELS[d.profession]} · {persona.security.uf} · renda {formatBRL(d.income)}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span className="text-neutral-500">Literacia</span>
        <div className="h-1.5 flex-1 rounded-full bg-neutral-100">
          <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${d.digitalLiteracy * 100}%` }} />
        </div>
        <span className="tabular-nums">{d.digitalLiteracy.toFixed(2)}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
        <Smartphone size={12} /> {persona.security.os} {persona.security.deviceTier} · rejeição {Math.round(persona.digital.bounceRate * 100)}%
      </div>
    </div>
  );
}
