import type { SegmentScreenStat } from "@/types/analytics";
import type { SegmentDimension } from "@/types/persona";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import { orangeRamp, pct } from "./chartTheme";

interface ErrorHeatmapProps {
  data: SegmentScreenStat[];
  dimension: SegmentDimension;
  segments: string[];
  funnel: string[];
}

/** Taxa de erro (ações sub-ótimas/alertas) por segmento × etapa do fluxo. */
export function ErrorHeatmap({ data, dimension, segments, funnel }: ErrorHeatmapProps) {
  const screens = funnel.filter((id) => data.some((d) => d.screenId === id));
  const cell = (segment: string, screenId: string) =>
    data.find((d) => d.dimension === dimension && d.segment === segment && d.screenId === screenId);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr>
            <th className="p-1.5 text-left font-medium text-neutral-500">Segmento</th>
            {screens.map((id) => (
              <th key={id} className="p-1.5 font-medium text-neutral-500">
                {(SCREEN_TITLES[id as keyof typeof SCREEN_TITLES] ?? id).replace("Empréstimo · ", "").replace("Pix · ", "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segments.map((seg) => (
            <tr key={seg}>
              <td className="whitespace-nowrap p-1.5 font-medium text-itau-navy">{seg}</td>
              {screens.map((id) => {
                const c = cell(seg, id);
                if (!c) return <td key={id} className="rounded bg-neutral-50 p-1.5 text-center text-neutral-300">—</td>;
                return (
                  <td
                    key={id}
                    title={`${c.actions} ações · ${pct(c.errorRate)} de erro · ${pct(c.dropOffRate)} de drop-off`}
                    className="rounded p-1.5 text-center tabular-nums"
                    style={{ background: orangeRamp(c.errorRate), color: c.errorRate > 0.55 ? "#fff" : "#1E2A4F" }}
                  >
                    {pct(c.errorRate)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
