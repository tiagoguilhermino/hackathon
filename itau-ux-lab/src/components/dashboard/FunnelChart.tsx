"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ScreenStat } from "@/types/analytics";
import { CHART, pct, tooltipStyle } from "./chartTheme";

/** Funil: agentes que alcançaram cada etapa vs. os que pararam nela sem concluir (abandono, limite ou fim errado). */
export function FunnelChart({ screens, funnel }: { screens: ScreenStat[]; funnel: string[] }) {
  const rows = funnel
    .map((id) => screens.find((s) => s.screenId === id))
    .filter((s): s is ScreenStat => Boolean(s))
    .map((s) => ({
      step: s.title.replace("Empréstimo · ", "").replace("Pix · ", ""),
      reached: s.reached,
      abandoned: s.abandoned,
      drop: s.dropOffRate,
    }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barGap={2}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="step" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} interval={0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: CHART.axis }} axisLine={false} tickLine={false} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: "rgba(30,42,79,0.06)" }}
          formatter={(v, name, item) =>
            name === "Não concluíram aqui" ? [`${v} (${pct(item.payload.drop)} de drop-off)`, name] : [String(v), name]
          }
        />
        <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="reached" name="Alcançaram" fill={CHART.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
        <Bar dataKey="abandoned" name="Não concluíram aqui" fill={CHART.critical} radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
