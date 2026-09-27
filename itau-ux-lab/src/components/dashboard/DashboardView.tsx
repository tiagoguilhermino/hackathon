"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, FlaskConical, RefreshCw } from "lucide-react";
import type { AnalystReport, DesignerReport, HumanDecision } from "@/types/analytics";
import type { SegmentDimension } from "@/types/persona";
import type { SimulationRun } from "@/types/simulation";
import { buildEvidence } from "@/lib/analytics/evidence";
import { DIMENSION_LABELS, computeStats } from "@/lib/analytics/stats";
import { FLOWS, flowFunnel } from "@/lib/bank/flows";
import { runLabel, versionLabel } from "@/lib/simulation/label";
import { appendDecision, loadDecisions, loadReports, loadRuns, saveReports } from "@/lib/simulation/storage";
import { nowBrasilia } from "@/lib/time";
import { SimulationBadge } from "../common/PrototypeNotice";
import { AnalystPanel, DesignerPanel } from "./AgentPanels";
import { DecisionRegister } from "./DecisionRegister";
import { LayoutVariations } from "./LayoutVariations";
import type { NewDecision } from "./HumanReview";
import { VersionComparison } from "./VersionComparison";
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
  const [refresh, setRefresh] = useState(0);
  const [compareId, setCompareId] = useState("");
  const [decisions, setDecisions] = useState<HumanDecision[]>(() => loadDecisions());
  const [saveError, setSaveError] = useState<string | null>(null);

  const run = runs.find((r) => r.id === runId);
  const stats = useMemo(() => (run ? computeStats(run) : null), [run]);
  // Antes × depois: outra simulação do mesmo fluxo (ex.: versão A contra versão C)
  const comparable = useMemo(() => (run ? runs.filter((r) => r.id !== run.id && r.config.flowId === run.config.flowId) : []), [runs, run]);
  const other = comparable.find((r) => r.id === compareId);
  const otherStats = useMemo(() => {
    const o = comparable.find((r) => r.id === compareId);
    return o ? computeStats(o) : null;
  }, [comparable, compareId]);

  // Pipeline de agentes consultivos: Analista → Designer (guardado por simulação, para não repetir)
  useEffect(() => {
    if (!run || !stats) return;
    let cancelled = false;
    (async () => {
      const cached = loadReports(run.id);
      if (cached) {
        setReports({ runId: run.id, ...cached });
        return;
      }
      try {
        const analyst = await postJson<AnalystReport>("/api/agents/analyst", {
          stats,
          screens: run.screens,
          evidence: buildEvidence(run),
          mode: run.config.llmMode,
        });
        if (cancelled) return;
        setReports({ runId: run.id, analyst });
        const designer = await postJson<DesignerReport>("/api/agents/designer", {
          analyst,
          stats,
          screens: run.screens,
          mode: run.config.llmMode,
        });
        if (!cancelled) {
          setReports({ runId: run.id, analyst, designer });
          saveReports(run.id, { analyst, designer });
        }
      } catch (err) {
        if (!cancelled) setReports({ runId: run.id, error: (err as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [run, stats, refresh]);

  const regenerate = () => {
    if (!run) return;
    saveReports(run.id, null);
    setReports(null);
    setRefresh((n) => n + 1);
  };

  const decide = (decision: NewDecision) => {
    const saved = appendDecision({ ...decision, at: nowBrasilia() });
    if (saved) {
      setDecisions(saved);
      setSaveError(null);
    } else {
      setSaveError("O navegador não deixou gravar a decisão (janela anônima ou sem espaço). Baixe o registro e tente em outra janela.");
    }
  };

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
        <h1 className="font-semibold">
          Relatório de Usabilidade · {flow.name}
          {versionLabel(run) && ` · ${versionLabel(run)}`}
        </h1>
        <SimulationBadge />
        <select
          value={run.id}
          onChange={(e) => setRunId(e.target.value)}
          aria-label="Simulação"
          className="ml-auto rounded-md bg-white/10 px-2 py-1.5 text-sm"
        >
          {runs.map((r) => (
            <option key={r.id} value={r.id} className="text-itau-navy">
              {runLabel(r)}
            </option>
          ))}
        </select>
        <Link href="/lab" className="flex items-center gap-1 rounded-md bg-itau-orange px-3 py-1.5 text-sm font-medium">
          <FlaskConical size={16} /> Laboratório
        </Link>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 p-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
          <span>
            {run.llm.mode === "live"
              ? `Agentes com LLM real (${run.llm.model ?? "modelo não informado"})`
              : "Agentes simulados por regras, sem LLM: os números refletem as regras do modelo, não pessoas"}
            {run.llm.promptVersion && ` · prompt ${run.llm.promptVersion}`} · seed {run.config.base.seed} · simulação {run.id}
          </span>
          <button type="button" onClick={regenerate} className="flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-2 py-1">
            <RefreshCw size={12} /> Gerar análise de novo
          </button>
        </p>

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
          <label className="ml-auto flex items-center gap-2">
            <span className="text-neutral-500">Comparar com:</span>
            <select
              value={other?.id ?? ""}
              onChange={(e) => setCompareId(e.target.value)}
              disabled={!comparable.length}
              className="max-w-80 rounded-md border border-neutral-300 bg-white px-2 py-1"
            >
              <option value="">{comparable.length ? "nenhuma" : "nenhuma outra simulação deste fluxo"}</option>
              {comparable.map((r) => (
                <option key={r.id} value={r.id}>
                  {runLabel(r)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {other && otherStats && <VersionComparison current={{ run, stats }} other={{ run: other, stats: otherStats }} dimension={dimension} />}

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title={`Taxa de sucesso por ${DIMENSION_LABELS[dimension].toLowerCase()}`}>
            <SegmentSuccessChart data={segments} />
          </Panel>
          <Panel title={`Tempo médio de conclusão por ${DIMENSION_LABELS[dimension].toLowerCase()}`}>
            <CompletionTimeChart data={segments} />
          </Panel>
          <Panel title="Funil e pontos de abandono (drop-off)">
            <FunnelChart screens={stats.byScreen} funnel={flowFunnel(run.config.flowId, run.config.layout)} />
          </Panel>
          <Panel title={`Taxa de erro por etapa × ${DIMENSION_LABELS[dimension].toLowerCase()}`}>
            <ErrorHeatmap data={stats.segmentScreen} dimension={dimension} segments={segments.map((s) => s.segment)} funnel={flowFunnel(run.config.flowId, run.config.layout)} />
            <p className="mt-2 text-xs text-neutral-500">
              Erro = ação sub-ótima em relação ao caminho ideal ou que disparou alerta na tela. Passe o mouse para ver n e drop-off.
            </p>
          </Panel>
        </div>

        <AnalystPanel report={current?.analyst} error={current?.error} />
        <DesignerPanel
          report={current?.designer}
          error={current?.error}
          waiting={!current?.analyst}
          runId={run.id}
          decisions={decisions}
          onDecide={decide}
          footer={<LayoutVariations runs={runs} run={run} decisions={decisions} onDecide={decide} />}
        />
        {saveError && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{saveError}</p>}
        <DecisionRegister decisions={decisions} />
      </main>
    </div>
  );
}
