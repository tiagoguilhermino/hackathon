"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, FlaskConical, Layers, Play, Smartphone, Square } from "lucide-react";
import { SimulationBadge } from "@/components/common/PrototypeNotice";
import { ConfigPanel } from "@/components/lab/ConfigPanel";
import { DecisionLog, type LogEntry } from "@/components/lab/DecisionLog";
import { LlmModeToggle } from "@/components/lab/LlmModeToggle";
import { SimulationSlot, type SlotView } from "@/components/lab/SimulationSlot";
import { SCROLL_DOWN, SCROLL_UP } from "@/lib/a11y/extract";
import { FLOWS } from "@/lib/bank/flows";
import { DEFAULT_LAYOUT, LAYOUT_PRESETS, PRESET_IDS, PRESET_NAMES, layoutName, type AppLayout, type PresetId } from "@/lib/design/variations";
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
  llmMode: "mock",
  layout: DEFAULT_LAYOUT,
};

const MODE_KEY = "itau-ux-lab:llm-mode";

/** Id do lote de "Testar nos layouts marcados": junta as simulações dos mesmos agentes em layouts diferentes. */
const newBatchId = () => `lote-${Date.now().toString(36)}`;

type Status = "idle" | "running" | "done";
interface LlmStatus {
  mode: "mock" | "live";
  model: string | null;
  hasKey: boolean;
}

const EMPTY_OUTCOMES: Record<AgentOutcome, number> = { success: 0, wrong: 0, abandoned: 0, timeout: 0, error: 0 };
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
      .then((status: LlmStatus) => {
        setLlm(status);
        let stored: string | null = null;
        try {
          stored = localStorage.getItem(MODE_KEY);
        } catch {
          /* armazenamento indisponível: usa o padrão */
        }
        // Padrão "Simulado": as chaves do projeto estão no código, e o LLM real gasta a cota
        // gratuita do time. Quem clicar em "LLM real" tem a escolha lembrada neste navegador.
        const preferred = stored === "live" || stored === "mock" ? stored : "mock";
        setConfig((c) => ({ ...c, llmMode: preferred === "live" && !status.hasKey ? "mock" : preferred }));
      })
      .catch(() => setLlm(null));
  }, []);

  const changeMode = (llmMode: SimulationConfig["llmMode"]) => {
    setConfig((c) => ({ ...c, llmMode }));
    try {
      localStorage.setItem(MODE_KEY, llmMode);
    } catch {
      /* ignora */
    }
  };

  const updateView = (slot: number, patch: Partial<SlotView>) =>
    setViews((prev) => prev.map((v, i) => (i === slot ? { ...v, ...patch } : v)));

  /**
   * Roda a simulação no layout escolhido ou, com vários layouts, os MESMOS agentes em cada um
   * (um lote): é isso que o Dashboard compara para dizer qual layout funciona melhor por perfil.
   */
  const start = async (layouts: AppLayout[] = [config.layout ?? DEFAULT_LAYOUT]) => {
    const personas = stratifiedSample(base, config.agentCount, config.base.seed);
    stopRef.current = false;
    setStatus("running");
    setUsage({ inputTokens: 0, outputTokens: 0 });
    setError(null);
    const batchId = layouts.length > 1 ? newBatchId() : undefined;
    const slots = slotRefs.current.slice(0, slotCount).filter((s): s is AppSlot => Boolean(s));

    try {
      for (const [i, layout] of layouts.entries()) {
        if (stopRef.current) break;
        setBatch(layouts.length > 1 ? `Layout ${i + 1} de ${layouts.length}: ${layoutName(layout)}` : null);
        setOutcomes(EMPTY_OUTCOMES);
        setLogs([]);
        setViews(Array.from({ length: slotCount }, () => EMPTY_VIEW));
        await runOne({ ...config, layout, batchId }, personas, slots);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setStatus("done");
    }
  };

  const runOne = async (runConfig: SimulationConfig, personas: typeof base, slots: AppSlot[]) => {
    {
      const run = await runSimulation(runConfig, personas, slots, {
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
    }
  };

  // Layouts marcados para o lote (os mesmos agentes em cada um), com o início do Pix escolhido acima.
  const [compareIds, setCompareIds] = useState<PresetId[]>(["v1", "v2", "v3"]);
  const [batch, setBatch] = useState<string | null>(null);
  const batchLayouts = compareIds.map((id) => ({ ...LAYOUT_PRESETS[id], pixStart: (config.layout ?? DEFAULT_LAYOUT).pixStart }));

  // Parado, o celular mostra o layout e a versão escolhidos (o agente começa assim).
  useEffect(() => {
    if (status === "running") return;
    const t = window.setTimeout(() => {
      slotRefs.current.forEach((s) =>
        s?.dispatch({ actionId: "__reset", value: FLOWS[config.flowId].versions ? config.version : undefined, layout: config.layout }),
      );
    }, 0);
    return () => window.clearTimeout(t);
  }, [config.layout, config.version, config.flowId, status, slotCount]);

  const doneCount = Object.values(outcomes).reduce((a, b) => a + b, 0);
  const total = Math.min(config.agentCount, base.length);
  const cost = estimateCostUsd(llm?.model ?? null, usage.inputTokens, usage.outputTokens);
  const scale = slotScale(slotCount);

  return (
    <div className="min-h-dvh bg-neutral-100 text-itau-navy">
      <header className="flex flex-wrap items-center gap-3 border-b bg-itau-navy px-4 py-3 text-white">
        <FlaskConical size={22} className="text-itau-orange" />
        <h1 className="font-semibold">Modo Laboratório · Simulação Multiagente</h1>
        <SimulationBadge />
        {llm && (
          <LlmModeToggle
            mode={config.llmMode}
            onChange={changeMode}
            hasKey={llm.hasKey}
            model={llm.model}
            disabled={status === "running"}
          />
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
          <ConfigPanel config={config} onChange={setConfig} base={base} disabled={status === "running"} live={config.llmMode === "live"} />
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
              onClick={() => void start()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-itau-orange py-2.5 font-semibold text-white hover:bg-itau-orange-dark"
            >
              <Play size={16} /> Executar simulação
            </button>
          )}
          <div className="space-y-2 rounded-lg border border-neutral-200 p-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Layers size={16} className="text-itau-orange" /> Comparar layouts
            </div>
            <p className="text-xs text-neutral-500">
              Os mesmos agentes fazem a mesma tarefa em cada layout marcado. O Dashboard mostra qual funcionou melhor para cada perfil.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {PRESET_IDS.map((id) => (
                <label key={id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={compareIds.includes(id)}
                    disabled={status === "running"}
                    onChange={(e) => setCompareIds((prev) => (e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)))}
                  />
                  {PRESET_NAMES[id]}
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={status === "running" || compareIds.length < 2}
              onClick={() => void start(batchLayouts)}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-itau-orange py-2 text-sm font-semibold text-itau-orange hover:bg-itau-orange/5 disabled:opacity-40"
            >
              <Layers size={16} /> Testar nos layouts marcados
            </button>
          </div>
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
            <p className="mb-2 text-xs text-neutral-500">
              {batch ?? `Layout: ${layoutName(config.layout)}`}
            </p>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">Progresso</span>
              <span className="tabular-nums text-neutral-500">
                {doneCount}/{total} agentes
              </span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100">
              <div className="h-2 rounded-full bg-itau-orange transition-all" style={{ width: `${(doneCount / total) * 100}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
              {(
                [
                  ["success", "Sucesso", "text-green-700"],
                  ["wrong", "Concluiu errado", "text-orange-700"],
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
            {config.llmMode === "live" && (
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
