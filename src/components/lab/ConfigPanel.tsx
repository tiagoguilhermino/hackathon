"use client";

import { AGE_BANDS, type AgeBand, type Persona } from "@/types/persona";
import type { FlowId, SimulationConfig } from "@/types/simulation";
import { FLOWS } from "@/lib/bank/flows";
import { PROFESSION_LABELS } from "@/lib/personas/config";
import { WeightEditor } from "./WeightEditor";

const AGE_LABELS = Object.fromEntries(AGE_BANDS.map((b) => [b, `${b} anos`])) as Record<AgeBand, string>;

interface ConfigPanelProps {
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
  base: Persona[];
  disabled: boolean;
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="text-neutral-600">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5"
      />
    </label>
  );
}

export function ConfigPanel({ config, onChange, base, disabled }: ConfigPanelProps) {
  const set = <K extends keyof SimulationConfig>(key: K, value: SimulationConfig[K]) => onChange({ ...config, [key]: value });
  const setBase = <K extends keyof SimulationConfig["base"]>(key: K, value: SimulationConfig["base"][K]) =>
    onChange({ ...config, base: { ...config.base, [key]: value } });

  const avgLiteracy = base.length ? base.reduce((s, p) => s + p.demographics.digitalLiteracy, 0) / base.length : 0;

  return (
    <fieldset disabled={disabled} className="space-y-5">
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Demanda</h2>
        <label className="block text-sm">
          <span className="text-neutral-600">Fluxo a testar</span>
          <select
            value={config.flowId}
            onChange={(e) => set("flowId", e.target.value as FlowId)}
            className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-2 py-1.5"
          >
            {Object.values(FLOWS).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Agentes" value={config.agentCount} min={1} max={200} onChange={(v) => set("agentCount", v)} />
          <NumberField label="Tamanho da base" value={config.base.size} min={10} max={5000} step={50} onChange={(v) => setBase("size", v)} />
          <NumberField label="Seed" value={config.base.seed} min={0} max={999999} onChange={(v) => setBase("seed", v)} />
          <NumberField label="Pausa visual (ms)" value={config.visualDelayMs} min={0} max={3000} step={50} onChange={(v) => set("visualDelayMs", v)} />
          <NumberField label="Latência LLM mock (ms)" value={config.mockLatencyMs} min={0} max={5000} step={50} onChange={(v) => set("mockLatencyMs", v)} />
        </div>
      </div>

      <WeightEditor
        title="Proporção por profissão"
        weights={config.base.professionWeights}
        labels={PROFESSION_LABELS}
        onChange={(w) => setBase("professionWeights", w)}
      />
      <WeightEditor
        title="Proporção por faixa etária"
        weights={config.base.ageBandWeights}
        labels={AGE_LABELS}
        onChange={(w) => setBase("ageBandWeights", w)}
      />

      <p className="rounded-md bg-neutral-50 p-2 text-xs text-neutral-600">
        Base sintética: <b>{base.length}</b> clientes · literacia digital média <b>{avgLiteracy.toFixed(2)}</b>. Os agentes são
        amostrados de forma estratificada por profissão.
      </p>
    </fieldset>
  );
}
