"use client";

interface WeightEditorProps<K extends string> {
  title: string;
  weights: Record<K, number>;
  labels: Record<K, string>;
  onChange: (weights: Record<K, number>) => void;
  disabled?: boolean;
}

/** Editor de pesos relativos (ex.: servidor = 2, CLT = 1 ⇒ 2x mais servidores). */
export function WeightEditor<K extends string>({ title, weights, labels, onChange, disabled }: WeightEditorProps<K>) {
  const keys = Object.keys(weights) as K[];
  const total = keys.reduce((s, k) => s + Math.max(0, weights[k]), 0) || 1;

  return (
    <fieldset disabled={disabled} className="space-y-1.5">
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</legend>
      {keys.map((k) => {
        const pct = (Math.max(0, weights[k]) / total) * 100;
        return (
          <div key={k} className="grid grid-cols-[1fr_56px_40px] items-center gap-2 text-sm">
            <div>
              <div className="text-neutral-700">{labels[k]}</div>
              <div className="h-1 rounded-full bg-neutral-100">
                <div className="h-1 rounded-full bg-itau-orange" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <input
              type="number"
              min={0}
              step={0.5}
              value={weights[k]}
              aria-label={`Peso ${labels[k]}`}
              onChange={(e) => onChange({ ...weights, [k]: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full rounded-md border border-neutral-300 px-2 py-1 text-right"
            />
            <span className="text-right text-xs tabular-nums text-neutral-500">{pct.toFixed(0)}%</span>
          </div>
        );
      })}
    </fieldset>
  );
}
