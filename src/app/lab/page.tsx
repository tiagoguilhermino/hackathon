"use client";

import Link from "next/link";
import { useMemo, useReducer, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { BarChart3, FlaskConical, Play, Smartphone, Square } from "lucide-react";
import { BankApp } from "@/components/bank/BankApp";
import { PhoneFrame } from "@/components/bank/PhoneFrame";
import { TreeExportButton } from "@/components/bank/TreeExportButton";
import { AgentCursor, type CursorState } from "@/components/lab/AgentCursor";
import { ConfigPanel } from "@/components/lab/ConfigPanel";
import { DecisionLog, type LogEntry } from "@/components/lab/DecisionLog";
import { PersonaCard } from "@/components/lab/PersonaCard";
import { SCROLL_DOWN, SCROLL_UP } from "@/lib/a11y/extract";
import { bankReducer, initialBankState } from "@/lib/bank/state";
import { DEFAULT_PERSONA_CONFIG } from "@/lib/personas/config";
import { generatePersonaBase } from "@/lib/personas/generator";
import { stratifiedSample } from "@/lib/personas/sampling";
import { runSimulation, type SimulationEnvironment } from "@/lib/simulation/runner";
import { saveRun } from "@/lib/simulation/storage";
import type { Persona } from "@/types/persona";
import type { AgentOutcome, NavigatorResponse, SimulationConfig } from "@/types/simulation";

const DEFAULT_CONFIG: SimulationConfig = {
  flowId: "emprestimo",
  agentCount: 20,
  base: DEFAULT_PERSONA_CONFIG,
  visualDelayMs: 200,
  mockLatencyMs: 120,
};

type Status = "idle" | "running" | "done";
const EMPTY_OUTCOMES: Record<AgentOutcome, number> = { success: 0, abandoned: 0, timeout: 0, error: 0 };

export default function LabPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [bankState, dispatch] = useReducer(bankReducer, initialBankState);
  const rootRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [current, setCurrent] = useState<{ persona: Persona; index: number } | null>(null);
  const [outcomes, setOutcomes] = useState(EMPTY_OUTCOMES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<CursorState | null>(null);
  const [lastResponse, setLastResponse] = useState<NavigatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const base = useMemo(() => generatePersonaBase(config.base), [config.base]);

  const start = async () => {
    const personas = stratifiedSample(base, config.agentCount, config.base.seed);
    stopRef.current = false;
    setStatus("running");
    setOutcomes(EMPTY_OUTCOMES);
    setLogs([]);
    setError(null);

    const env: SimulationEnvironment = {
      getRoot: () => rootRef.current,
      dispatch: (action) => flushSync(() => dispatch(action)),
      shouldStop: () => stopRef.current,
      onAgentStart: (index, persona) => {
        setCurrent({ index, persona });
        setCursor(null);
      },
      onDecision: ({ agentIndex, persona, tree, response, target }) => {
        const { decision, cognitiveLoad, optimalActionId } = response;
        setLastResponse(response);
        setCursor(
          decision.action_id === "ABANDONAR"
            ? { kind: "abandon", label: "ABANDONOU" }
            : decision.action_id === SCROLL_DOWN || decision.action_id === SCROLL_UP
              ? { kind: "scroll", label: "Rolando a tela" }
              : { kind: "target", bounds: target?.bounds, label: decision.value ? `digita "${decision.value}"` : target?.label ?? decision.action_id },
        );
        setLogs((prev) =>
          [
            {
              key: `${agentIndex}-${prev.length}-${Date.now()}`,
              agentIndex,
              personaName: persona.name,
              screenId: tree.screenId,
              actionId: decision.action_id,
              value: decision.value,
              reasoning: decision.reasoning,
              thinkTimeMs: decision.think_time_ms,
              load: cognitiveLoad.score,
              optimal: decision.action_id === optimalActionId,
            },
            ...prev,
          ].slice(0, 120),
        );
      },
      onAgentEnd: (run) => setOutcomes((o) => ({ ...o, [run.outcome]: o[run.outcome] + 1 })),
    };

    try {
      const run = await runSimulation(config, personas, env);
      saveRun(run);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCursor(null);
      setStatus("done");
    }
  };

  const doneCount = Object.values(outcomes).reduce((a, b) => a + b, 0);
  const total = Math.min(config.agentCount, base.length);

  return (
    <div className="min-h-dvh bg-neutral-100 text-itau-navy">
      <header className="flex items-center gap-3 border-b bg-itau-navy px-4 py-3 text-white">
        <FlaskConical size={22} className="text-itau-orange" />
        <h1 className="font-semibold">Modo Laboratório · Simulação Multiagente</h1>
        <nav className="ml-auto flex gap-2 text-sm">
          <Link href="/" className="flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-white/10">
            <Smartphone size={16} /> App
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1 rounded-md bg-itau-orange px-3 py-1.5 font-medium hover:bg-itau-orange-dark">
            <BarChart3 size={16} /> Dashboard
          </Link>
        </nav>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[320px_auto_1fr]">
        <aside className="h-fit space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <ConfigPanel config={config} onChange={setConfig} base={base} disabled={status === "running"} />
          {status === "running" ? (
            <button
              type="button"
              onClick={() => (stopRef.current = true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 font-semibold text-white"
            >
              <Square size={16} /> Parar
            </button>
          ) : (
            <button
              type="button"
              onClick={start}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-itau-orange py-2.5 font-semibold text-white hover:bg-itau-orange-dark"
            >
              <Play size={16} /> Executar simulação
            </button>
          )}
        </aside>

        <section className="flex flex-col items-center gap-3">
          <PhoneFrame overlay={<AgentCursor cursor={cursor} />}>
            <BankApp ref={rootRef} state={bankState} dispatch={dispatch} />
          </PhoneFrame>
          <TreeExportButton rootRef={rootRef} />
        </section>

        <section className="flex min-h-0 flex-col gap-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">Progresso</span>
              <span className="tabular-nums text-neutral-500">
                {doneCount}/{total} agentes
              </span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100">
              <div className="h-2 rounded-full bg-itau-orange transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              {(
                [
                  ["success", "Sucesso", "text-green-700"],
                  ["abandoned", "Abandono", "text-red-600"],
                  ["timeout", "Limite", "text-amber-600"],
                  ["error", "Erro", "text-neutral-500"],
                ] as const
              ).map(([k, label, color]) => (
                <div key={k} className="rounded-lg bg-neutral-50 py-2">
                  <div className={`text-lg font-bold tabular-nums ${color}`}>{outcomes[k]}</div>
                  {label}
                </div>
              ))}
            </div>
            {status === "done" && !error && (
              <Link href="/dashboard" className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-itau-navy py-2 text-sm font-semibold text-white">
                <BarChart3 size={16} /> Ver relatório no Dashboard
              </Link>
            )}
            {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          </div>

          {current && <PersonaCard persona={current.persona} index={current.index} total={total} />}

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b px-3 py-2 text-sm font-semibold">Log de decisões</div>
            <div className="max-h-[420px] overflow-y-auto">
              <DecisionLog entries={logs} />
            </div>
          </div>

          {lastResponse && (
            <details className="rounded-xl bg-white p-3 text-xs shadow-sm">
              <summary className="cursor-pointer font-semibold">
                Último prompt do Agente Navegador <span className="font-normal text-neutral-500">(modo {lastResponse.mode})</span>
              </summary>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded bg-neutral-50 p-2">
                {lastResponse.prompt.system}
                {"\n\n---\n\n"}
                {lastResponse.prompt.user}
              </pre>
            </details>
          )}
        </section>
      </div>
    </div>
  );
}

