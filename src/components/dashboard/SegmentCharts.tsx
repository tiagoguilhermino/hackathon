"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SegmentStat } from "@/types/analytics";
import { CHART, pct, tooltipStyle } from "./chartTheme";

/** Taxa de sucesso por segmento (uma série, sem legenda: o título a nomeia). */
export function SegmentSuccessChart({ data }: { data: SegmentStat[] }) {
  const rows = data.map((s) => ({ segment: s.segment, success: s.successRate, n: s.agents }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 20, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={CHART.grid} />
        <XAxis dataKey="segment" tick={{ fontSize: 12, fill: CHART.axis }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 1]} tickFormatter={pct} tick={{ fontSize: 12, fill: CHART.axis }} axisLine={false} tickLine={false} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: "rgba(30,42,79,0.06)" }}
          formatter={(v, _n, item) => [`${pct(Number(v))} (n=${item.payload.n})`, "Sucesso"]}
        />
        <Bar dataKey="success" fill={CHART.primary} radius={[4, 4, 0, 0]} maxBarSize={48}>
          <LabelList dataKey="success" position="top" formatter={(v) => pct(Number(v))} style={{ fontSize: 11, fill: CHART.text }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Tempo médio de conclusão (s) por segmento, apenas agentes que concluíram. */
export function CompletionTimeChart({ data }: { data: SegmentStat[] }) {
  const rows = data.filter((s) => s.avgCompletionSec !== null).map((s) => ({ segment: s.segment, sec: Math.round(s.avgCompletionSec!) }));
  if (!rows.length) return <p className="py-16 text-center text-sm text-neutral-500">Nenhum agente deste corte concluiu o fluxo.</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke={CHART.grid} />
        <XAxis type="number" tick={{ fontSize: 12, fill: CHART.axis }} axisLine={false} tickLine={false} unit="s" />
        <YAxis type="category" dataKey="segment" width={110} tick={{ fontSize: 12, fill: CHART.axis }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(30,42,79,0.06)" }} formatter={(v) => [`${v}s`, "Tempo médio"]} />
        <Bar dataKey="sec" fill={CHART.accent} radius={[0, 4, 4, 0]} maxBarSize={28}>
          <LabelList dataKey="sec" position="right" formatter={(v) => `${v}s`} style={{ fontSize: 11, fill: CHART.text }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
