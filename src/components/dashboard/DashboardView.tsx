"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, FlaskConical } from "lucide-react";
import type { AnalystReport, DesignerReport } from "@/types/analytics";
import type { SegmentDimension } from "@/types/persona";
import type { SimulationRun } from "@/types/simulation";
import { buildEvidence } from "@/lib/analytics/evidence";
import { DIMENSION_LABELS, computeStats } from "@/lib/analytics/stats";
import { FLOWS } from "@/lib/bank/flows";
import { loadRuns } from "@/lib/simulation/storage";
import { AnalystPanel, DesignerPanel } from "./AgentPanels";
import { ErrorHeatmap } from "./ErrorHeatmap";
import { FunnelChart } from "./FunnelChart";
import { KpiTiles } from "./KpiTiles";
import { CompletionTimeChart, SegmentSuccessChart } from "./SegmentCharts";

interface AgentReports {
  runId: string;
  analyst?: AnalystReport;
  designer?: DesignerReport;
  error?: string;
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl bg-white p-4 shadow-sm ${className ?? ""}`}>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function DashboardView() {
  const [runs] = useState<SimulationRun[]>(() => loadRuns());
  const [runId, setRunId] = useState(runs[0]?.id);
  const [dimension, setDimension] = useState<SegmentDimension>("profession");
  const [reports, setReports] = useState<AgentReports | null>(null);

  const run = runs.find((r) => r.id === runId);
  const stats = useMemo(() => (run ? computeStats(run) : null), [run]);

  // Pipeline de agentes consultivos: Analista → Designer
  useEffect(() => {
    if (!run || !stats) return;
    let cancelled = false;
    (async () => {
      try {
        const analyst = await postJson<AnalystReport>("/api/agents/analyst", {
          stats,
          screens: run.screens,
          evidence: buildEvidence(run),
        });
        if (cancelled) return;
        setReports({ runId: run.id, analyst });
        const designer = await postJson<DesignerReport>("/api/agents/designer", { analyst, stats, screens: run.screens });
        if (!cancelled) setReports({ runId: run.id, analyst, designer });
      } catch (err) {
        if (!cancelled) setReports({ runId: run.id, error: (err as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [run, stats]);

  if (!run || !stats) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <BarChart3 size={48} className="text-itau-orange" />
        <h1 className="text-xl font-semibold">Nenhuma simulação encontrada</h1>
        <p className="max-w-sm text-sm text-neutral-600">Execute uma simulação no Modo Laboratório para gerar o relatório.</p>
        <Link href="/lab" className="flex items-center gap-2 rounded-lg bg-itau-orange px-4 py-2 font-semibold text-white">
          <FlaskConical size={16} /> Abrir Laboratório
        </Link>
      </div>
    );
  }

  const current = reports?.runId === run.id ? reports : null;
  const flow = FLOWS[run.config.flowId];
  const segments = stats.bySegment[dimension];

  return (
    <div className="min-h-dvh bg-neutral-100 text-itau-navy">
      <header className="flex flex-wrap items-center gap-3 bg-itau-navy px-4 py-3 text-white">
        <BarChart3 size={22} className="text-itau-orange" />
        <h1 className="font-semibold">Relatório de Usabilidade · {flow.name}</h1>
        <select
          value={run.id}
          onChange={(e) => setRunId(e.target.value)}
          aria-label="Simulação"
          className="ml-auto rounded-md bg-white/10 px-2 py-1.5 text-sm"
        >
          {runs.map((r) => (
            <option key={r.id} value={r.id} className="text-itau-navy">
              {new Date(r.createdAt).toLocaleString("pt-BR")} · {FLOWS[r.config.flowId].name} · {r.agents.length} agentes
            </option>
          ))}
        </select>
        <Link href="/lab" className="flex items-center gap-1 rounded-md bg-itau-orange px-3 py-1.5 text-sm font-medium">
          <FlaskConical size={16} /> Laboratório
        </Link>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 p-4">
        <KpiTiles stats={stats} />

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-neutral-500">Segmentar por:</span>
          {(Object.keys(DIMENSION_LABELS) as SegmentDimension[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDimension(d)}
              className={`rounded-full px-3 py-1 font-medium ${d === dimension ? "bg-itau-navy text-white" : "bg-white text-itau-navy shadow-sm"}`}
            >
              {DIMENSION_LABELS[d]}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title={`Taxa de sucesso por ${DIMENSION_LABELS[dimension].toLowerCase()}`}>
            <SegmentSuccessChart data={segments} />
          </Panel>
          <Panel title={`Tempo médio de conclusão por ${DIMENSION_LABELS[dimension].toLowerCase()}`}>
            <CompletionTimeChart data={segments} />
          </Panel>
          <Panel title="Funil e pontos de abandono (drop-off)">
            <FunnelChart screens={stats.byScreen} funnel={flow.funnel} />
          </Panel>
          <Panel title={`Taxa de erro por etapa × ${DIMENSION_LABELS[dimension].toLowerCase()}`}>
            <ErrorHeatmap data={stats.segmentScreen} dimension={dimension} segments={segments.map((s) => s.segment)} funnel={flow.funnel} />
            <p className="mt-2 text-xs text-neutral-500">
              Erro = ação sub-ótima em relação ao caminho ideal ou que disparou alerta na tela. Passe o mouse para ver n e drop-off.
            </p>
          </Panel>
        </div>

        <AnalystPanel report={current?.analyst} error={current?.error} />
        <DesignerPanel report={current?.designer} error={current?.error} waiting={!current?.analyst} />
      </main>
    </div>
  );
}
