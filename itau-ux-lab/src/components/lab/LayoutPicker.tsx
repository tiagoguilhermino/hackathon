"use client";

import { LAYOUT_PIECES, LAYOUT_PRESETS, PRESET_IDS, PRESET_NAMES, presetOf, type AppLayout } from "@/lib/design/variations";

/**
 * Escolha do layout do app: as Dash V1, V2 e V3 do Iury ou peça por peça. Usado no Laboratório
 * (o layout em que os agentes navegam) e na página do app (para uma pessoa experimentar).
 */
export function LayoutPicker({ layout, onChange, compact }: { layout: AppLayout; onChange: (layout: AppLayout) => void; compact?: boolean }) {
  const preset = presetOf(layout);
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1">
        {PRESET_IDS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={preset === id}
            onClick={() => onChange({ ...LAYOUT_PRESETS[id], pixStart: layout.pixStart })}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold ${preset === id ? "bg-itau-orange text-white" : "bg-neutral-100 text-itau-navy hover:bg-neutral-200"}`}
          >
            {PRESET_NAMES[id]}
          </button>
        ))}
        {!preset && <span className="text-xs text-neutral-500">combinação própria</span>}
      </div>
      <div className={compact ? "flex flex-wrap gap-2" : "grid grid-cols-1 gap-1.5"}>
        {LAYOUT_PIECES.map((piece) => (
          <label key={piece.key} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-neutral-600">{piece.label}</span>
            <select
              value={layout[piece.key]}
              onChange={(e) => onChange({ ...layout, [piece.key]: e.target.value })}
              className="rounded-md border border-neutral-300 bg-white px-1.5 py-1"
            >
              {piece.options.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}
