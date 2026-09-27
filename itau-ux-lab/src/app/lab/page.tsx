"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Bot, FlaskConical, Play, Smartphone, Square } from "lucide-react";
import { ConfigPanel } from "@/components/lab/ConfigPanel";
import { DecisionLog, type LogEntry } from "@/components/lab/DecisionLog";
import { SimulationSlot, type SlotView } from "@/components/lab/SimulationSlot";
import { SCROLL_DOWN, SCROLL_UP } from "@/lib/a11y/extract";
import { estimateCostUsd } from "@/lib/llm/pricing";
import { DEFAULT_PERSONA_CONFIG } from "@/lib/personas/config";
import { generatePersonaBase } from "@/lib/personas/generator";
import { stratifiedSample } from "@/lib/personas/sampling";
import { runSimulation, type AppSlot } from "@/lib/simulation/runner";
import { saveRun } from "@/lib/simulation/storage";
import type { AgentOutcome, NavigatorResponse, SimulationConfig, TokenUsage } from "@/types/simulation";

const DEFAULT_CONFIG: SimulationConfig = {
  flowId: "emprestimo",
  agentCount: 12,
  base: DEFAULT_PERSONA_CONFIG,
  visualDelayMs: 150,
  mockLatencyMs: 120,
  concurrency: 3,
};

type Status = "idle" | "running" | "done";
interface LlmStatus {
  mode: "mock" | "live";
  model: string | null;
  hasKey: boolean;
}

const EMPTY_OUTCOMES: Record<AgentOutcome, number> = { success: 0, abandoned: 0, timeout: 0, error: 0 };
const EMPTY_VIEW: SlotView = { persona: null, agentIndex: null, cursor: null };
const slotScale = (n: number) => (n <= 1 ? 1 : n === 2 ? 0.8 : 0.62);

export default function LabPage() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const slotRefs = useRef<(AppSlot | null)[]>([]);
  const stopRef = useRef(false);

  const [status, setStatus] = useState<Status>("idle");
  const [llm, setLlm] = useState<LlmStatus | null>(null);
  const [views, setViews] = useState<SlotView[]>([]);
  const [outcomes, setOutcomes] = useState(EMPTY_OUTCOMES);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [usage, setUsage] = useState<TokenUsage>({ inputTokens: 0, outputTokens: 0 });
  const [lastResponse, setLastResponse] = useState<NavigatorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const base = useMemo(() => generatePersonaBase(config.base), [config.base]);
  const slotCount = Math.max(1, Math.min(config.concurrency, config.agentCount));

  useEffect(() => {
    fetch("/api/agents/status")
      .then((r) => r.json())
      .then(setLlm)
      .catch(() => setLlm(null));
  }, []);

  const updateView = (slot: number, patch: Partial<SlotView>) =>
    setViews((prev) => prev.map((v, i) => (i === slot ? { ...v, ...patch } : v)));

  const start = async () => {
    const personas = stratifiedSample(base, config.agentCount, config.base.seed);
    stopRef.current = false;
    setStatus("running");
    setOutcomes(EMPTY_OUTCOMES);
    setLogs([]);
    setUsage({ inputTokens: 0, outputTokens: 0 });
    setError(null);
    setViews(Array.from({ length: slotCount }, () => EMPTY_VIEW));

    const slots = slotRefs.current.slice(0, slotCount).filter((s): s is AppSlot => Boolean(s));

    try {
      const run = await runSimulation(config, personas, slots, {
        shouldStop: () => stopRef.current,
        onAgentStart: (slot, agentIndex, persona) => updateView(slot, { persona, agentIndex, cursor: null }),
        onDecision: ({ slot, agentIndex, persona, tree, response, target }) => {
          const { decision, cognitiveLoad, acceptableActionIds } = response;
          setLastResponse(response);
          if (response.usage) {
            const u = response.usage;
            setUsage((prev) => ({ inputTokens: prev.inputTokens + u.inputTokens, outputTokens: prev.outputTokens + u.outputTokens }));
          }
          updateView(slot, {
            cursor:
              decision.action_id === "ABANDONAR"
                ? { kind: "abandon", label: "ABANDONOU" }
                : decision.action_id === SCROLL_DOWN || decision.action_id === SCROLL_UP
                  ? { kind: "scroll", label: "Rolando a tela" }
                  : {
                      kind: "target",
                      bounds: target?.bounds,
                      label: decision.value ? `digita "${decision.value}"` : target?.label ?? decision.action_id,
                    },
          });
          setLogs((prev) =>
            [
              {
                key: `${agentIndex}-${Date.now()}-${Math.random()}`,
                agentIndex,
                personaName: persona.name,
                screenId: tree.screenId,
                actionId: decision.action_id,
                value: decision.value,
                reasoning: decision.reasoning,
                thinkTimeMs: decision.think_time_ms,
                load: cognitiveLoad.score,
                optimal: acceptableActionIds.includes(decision.action_id),
              },
              ...prev,
            ].slice(0, 150),
          );
        },
        onAgentEnd: (slot, agentRun) => {
          setOutcomes((o) => ({ ...o, [agentRun.outcome]: o[agentRun.outcome] + 1 }));
          if (agentRun.outcome === "error") {
            // Falha técnica (chave, limite de requisições…): interrompe tudo em vez de gerar dados inválidos.
            stopRef.current = true;
            setError(agentRun.errorMessage ?? "Falha ao consultar o agente navegador.");
          }
          updateView(slot, { cursor: null });
        },
      });
      if (run.agents.some((a) => a.outcome !== "error")) saveRun(run);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatus("done");
    }
  };

  const doneCount = Object.values(outcomes).reduce((a, b) => a + b, 0);
  const total = Math.min(config.agentCount, base.length);
  const cost = estimateCostUsd(llm?.model ?? null, usage.inputTokens, usage.outputTokens);
  const scale = slotScale(slotCount);

  return (
    <div className="min-h-dvh bg-neutral-100 text-itau-navy">
      <header className="flex flex-wrap items-center gap-3 border-b bg-itau-navy px-4 py-3 text-white">
        <FlaskConical size={22} className="text-itau-orange" />
        <h1 className="font-semibold">Modo Laboratório · Simulação Multiagente</h1>
        {llm && (
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${llm.mode === "live" ? "bg-green-600" : "bg-amber-500 text-itau-navy"}`}
            title={llm.mode === "live" ? "Os agentes estão chamando o LLM de verdade" : "Sem GROQ_API_KEY: decisões simuladas por regras"}
          >
            <Bot size={14} />
            {llm.mode === "live" ? `LLM real · ${llm.model}` : "Modo mock (sem LLM)"}
          </span>
        )}
        <nav className="ml-auto flex gap-2 text-sm">
          <Link href="/" className="flex items-center gap-1 rounded-md px-3 py-1.5 hover:bg-white/10">
            <Smartphone size={16} /> App
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1 rounded-md bg-itau-orange px-3 py-1.5 font-medium hover:bg-itau-orange-dark">
            <BarChart3 size={16} /> Dashboard
          </Link>
        </nav>
      </header>

      <div className="grid gap-4 p-4 xl:grid-cols-[320px_auto_1fr]">
        <aside className="h-fit space-y-4 rounded-xl bg-white p-4 shadow-sm">
          <ConfigPanel config={config} onChange={setConfig} base={base} disabled={status === "running"} live={llm?.mode === "live"} />
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

        <section className={`grid h-fit justify-center gap-4 ${slotCount > 1 ? "sm:grid-cols-2" : ""}`}>
          {Array.from({ length: slotCount }, (_, i) => (
            <SimulationSlot
              key={i}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              view={views[i] ?? EMPTY_VIEW}
              scale={scale}
              showExport={i === 0 && status !== "running"}
            />
          ))}
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
            {llm?.mode === "live" && (
              <p className="mt-3 text-xs tabular-nums text-neutral-500">
                Tokens: {usage.inputTokens.toLocaleString("pt-BR")} entrada · {usage.outputTokens.toLocaleString("pt-BR")} saída
                {cost !== null && ` · ≈ US$ ${cost.toFixed(4)}`}
              </p>
            )}
            {status === "done" && !error && (
              <Link href="/dashboard" className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-itau-navy py-2 text-sm font-semibold text-white">
                <BarChart3 size={16} /> Ver relatório no Dashboard
              </Link>
            )}
            {error && <p className="mt-3 rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</p>}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="border-b px-3 py-2 text-sm font-semibold">Log de decisões</div>
            <div className="max-h-[520px] overflow-y-auto">
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
