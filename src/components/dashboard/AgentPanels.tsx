import { AlertOctagon, AlertTriangle, Info, Lightbulb, Loader2, Microscope, Palette } from "lucide-react";
import type { AnalystReport, DesignerReport, Severity } from "@/types/analytics";
import { SCREEN_TITLES } from "@/lib/bank/flows";

const SEVERITY_STYLE: Record<Severity, { icon: typeof Info; className: string; label: string }> = {
  alta: { icon: AlertOctagon, className: "bg-red-50 text-red-700 border-red-200", label: "Severidade alta" },
  média: { icon: AlertTriangle, className: "bg-amber-50 text-amber-800 border-amber-200", label: "Severidade média" },
  baixa: { icon: Info, className: "bg-sky-50 text-sky-800 border-sky-200", label: "Severidade baixa" },
};

const screenTitle = (id: string) => SCREEN_TITLES[id as keyof typeof SCREEN_TITLES] ?? id;

function Loading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-6 text-sm text-neutral-500">
      <Loader2 size={16} className="animate-spin" /> {label}
    </div>
  );
}

function ModeBadge({ mode }: { mode: "mock" | "live" }) {
  return <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-neutral-500">LLM {mode}</span>;
}

export function AnalystPanel({ report, error }: { report?: AnalystReport; error?: string }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <Microscope size={20} className="text-itau-orange" />
        <h2 className="font-semibold">Agente Analista · Insights</h2>
        {report && <ModeBadge mode={report.mode} />}
      </header>
      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : !report ? (
        <Loading label="Analisando os logs da simulação…" />
      ) : (
        <>
          <p className="text-sm leading-relaxed text-neutral-700">{report.summary}</p>
          <ul className="mt-4 space-y-2">
            {report.anomalies.map((a) => {
              const s = SEVERITY_STYLE[a.severity];
              return (
                <li key={a.id} className={`flex gap-2 rounded-lg border p-2.5 text-sm ${s.className}`}>
                  <s.icon size={16} className="mt-0.5 shrink-0" aria-label={s.label} />
                  <div>
                    <div>{a.message}</div>
                    <div className="mt-0.5 text-xs opacity-75">
                      {s.label} · {a.metric}
                      {a.screenId && ` · ${screenTitle(a.screenId)}`}
                    </div>
                  </div>
                </li>
              );
            })}
            {!report.anomalies.length && <li className="text-sm text-neutral-500">Nenhuma anomalia significativa.</li>}
          </ul>
        </>
      )}
    </section>
  );
}

const LEVEL_DOT: Record<Severity, string> = { alta: "bg-itau-orange", média: "bg-amber-400", baixa: "bg-neutral-300" };

export function DesignerPanel({ report, error, waiting }: { report?: DesignerReport; error?: string; waiting: boolean }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <header className="mb-3 flex items-center gap-2">
        <Palette size={20} className="text-itau-orange" />
        <h2 className="font-semibold">Agente Designer · Propostas</h2>
        {report && <ModeBadge mode={report.mode} />}
      </header>
      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : !report ? (
        <Loading label={waiting ? "Aguardando o Agente Analista…" : "Gerando propostas de interface…"} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {report.proposals.map((p) => (
            <article key={p.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
              <div className="mb-1 text-xs font-medium text-neutral-500">{screenTitle(p.screenId)}</div>
              <p className="text-neutral-600">{p.problem}</p>
              <p className="mt-2 flex gap-1.5 font-medium text-itau-navy">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-itau-orange" /> {p.change}
              </p>
              <p className="mt-2 text-xs text-neutral-500">{p.rationale}</p>
              <div className="mt-2 flex gap-3 text-xs text-neutral-600">
                <span className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${LEVEL_DOT[p.impact]}`} /> Impacto {p.impact}
                </span>
                <span className="flex items-center gap-1">
                  <span className={`h-2 w-2 rounded-full ${LEVEL_DOT[p.effort]}`} /> Esforço {p.effort}
                </span>
              </div>
            </article>
          ))}
          {!report.proposals.length && <p className="text-sm text-neutral-500">Nenhuma mudança necessária.</p>}
        </div>
      )}
    </section>
  );
}
