import { Clock, Footprints, LogOut, Target, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { SimulationStats } from "@/types/analytics";
import { pct } from "./chartTheme";

function Tile({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
        {icon} {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-itau-navy">{value}</div>
      {hint && <div className="text-xs text-neutral-500">{hint}</div>}
    </div>
  );
}

export function KpiTiles({ stats }: { stats: SimulationStats }) {
  const worst = [...stats.byScreen].sort((a, b) => b.abandoned - a.abandoned)[0];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Tile icon={<Users size={14} />} label="Agentes" value={String(stats.totalAgents)} />
      <Tile icon={<Target size={14} />} label="Taxa de sucesso" value={pct(stats.successRate)} hint={`${pct(stats.abandonRate)} abandono · ${pct(stats.timeoutRate)} limite`} />
      <Tile
        icon={<Clock size={14} />}
        label="Tempo médio de conclusão"
        value={stats.avgCompletionSec ? `${stats.avgCompletionSec.toFixed(0)}s` : "—"}
        hint="tempo humano simulado"
      />
      <Tile icon={<Footprints size={14} />} label="Passos médios" value={stats.avgSteps.toFixed(1)} />
      <Tile
        icon={<LogOut size={14} />}
        label="Maior drop-off"
        value={worst?.abandoned ? pct(worst.dropOffRate) : "—"}
        hint={worst?.abandoned ? worst.title : "sem abandonos"}
      />
    </div>
  );
}
