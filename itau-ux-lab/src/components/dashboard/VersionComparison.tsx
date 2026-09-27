import type { SimulationStats } from "@/types/analytics";
import type { SegmentDimension } from "@/types/persona";
import type { SimulationRun } from "@/types/simulation";
import { DIMENSION_LABELS } from "@/lib/analytics/stats";
import { runLabel, versionLabel } from "@/lib/simulation/label";
import { SimulationBadge } from "../common/PrototypeNotice";
import { pct } from "./chartTheme";

interface Side {
  run: SimulationRun;
  stats: SimulationStats;
}

const cell = (successes: number, agents: number) => `${successes} de ${agents} (${pct(agents ? successes / agents : 0)})`;

/**
 * Antes × depois: quantos agentes concluíram a tarefa em cada simulação, no geral e por segmento.
 * Só mostra os números; quem decide o que eles significam é o time, com o teste com pessoas.
 */
export function VersionComparison({ current, other, dimension }: { current: Side; other: Side; dimension: SegmentDimension }) {
  const sides = [other, current];
  const title = (s: Side, i: number) => versionLabel(s.run) || (i === 0 ? "comparada" : "selecionada");
  const segments = [
    ...new Set([...current.stats.bySegment[dimension], ...other.stats.bySegment[dimension]].map((s) => s.segment)),
  ];
  const mismatch =
    current.run.llm.mode !== other.run.llm.mode || current.run.llm.promptVersion !== other.run.llm.promptVersion
      ? "As duas simulações usaram agentes diferentes (regras × LLM, ou outra versão do prompt): a diferença pode vir daí, não da tela."
      : null;

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="font-semibold">Antes × depois: concluíram a tarefa</h2>
        <SimulationBadge />
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="text-xs text-neutral-500">
            <tr className="border-b">
              <th className="py-1.5 font-medium">{DIMENSION_LABELS[dimension]}</th>
              {sides.map((s, i) => (
                <th key={s.run.id} className="py-1.5 font-medium" title={runLabel(s.run)}>
                  {title(s, i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-b font-semibold">
              <td className="py-1.5">Todos</td>
              {sides.map((s) => (
                <td key={s.run.id} className="py-1.5">
                  {cell(s.run.agents.filter((a) => a.outcome === "success").length, s.stats.totalAgents)}
                </td>
              ))}
            </tr>
            {segments.map((seg) => (
              <tr key={seg} className="border-b border-neutral-100">
                <td className="py-1.5">{seg}</td>
                {sides.map((s) => {
                  const st = s.stats.bySegment[dimension].find((x) => x.segment === seg);
                  return (
                    <td key={s.run.id} className="py-1.5">
                      {st ? cell(st.successes, st.agents) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mismatch && <p className="mt-3 rounded-md bg-amber-50 p-2 text-xs text-amber-800">{mismatch}</p>}
      <p className="mt-3 text-xs text-neutral-500">
        Clientes sintéticos: com poucos agentes por segmento, diferenças pequenas são sinal fraco. Use a comparação para escolher o que levar ao
        teste com pessoas, não como resultado.
      </p>
    </section>
  );
}
