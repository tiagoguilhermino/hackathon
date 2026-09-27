"use client";

import { useMemo } from "react";
import { LayoutTemplate } from "lucide-react";
import type { DesignProposal, HumanDecision } from "@/types/analytics";
import type { SimulationRun } from "@/types/simulation";
import { FLOWS } from "@/lib/bank/flows";
import { compareLayouts, layoutColumns, layoutSiblings, type ProfileRow } from "@/lib/analytics/layouts";
import { LayoutPreview } from "../bank/LayoutPreview";
import { SimulationBadge } from "../common/PrototypeNotice";
import { HumanReview, type NewDecision } from "./HumanReview";

interface LayoutVariationsProps {
  runs: SimulationRun[];
  run: SimulationRun;
  decisions: HumanDecision[];
  onDecide: (decision: NewDecision) => void;
}

const pct = (s: number, n: number) => (n ? `${Math.round((s / n) * 100)}%` : "—");

/**
 * Variações de tela por perfil de cliente: os agentes fizeram a mesma tarefa em cada layout do app
 * (peças do Iury, no app laranja), e aqui aparece em qual layout cada perfil mais concluiu.
 * É simulação: a indicação é hipótese para o teste com pessoas, e quem decide é o designer ou o PO.
 */
export function LayoutVariations({ runs, run, decisions, onDecide }: LayoutVariationsProps) {
  const columns = useMemo(() => layoutColumns(layoutSiblings(runs, run)), [runs, run]);
  const rows = useMemo(() => compareLayouts(columns), [columns]);
  const nameOf = (key: string) => columns.find((c) => c.key === key)?.name ?? key;
  const mixedModes = new Set(columns.map((c) => `${c.run.llm.mode}|${c.run.llm.promptVersion}`)).size > 1;

  const recommendation = (row: ProfileRow) => {
    const column = columns.find((c) => c.key === row.best);
    if (!column) return null;
    const cell = row.cells.find((c) => c.key === row.best)!;
    const others = row.cells
      .filter((c) => c.key !== row.best)
      .map((c) => `${c.successes} de ${c.agents}${c.avgSec !== null ? ` (${Math.round(c.avgSec)} s)` : ""} na ${nameOf(c.key)}`)
      .join(", ");
    const proposal: DesignProposal = {
      id: `layout-${row.id}`,
      screenId: "home",
      problem: "",
      change: `${row.segment}: ${column.name}`,
      rationale: "",
      impact: "média",
      effort: "média",
      relatedAnomalies: [],
    };
    return (
      <article key={row.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
        <div className="flex flex-wrap gap-3">
          {column.layout && <LayoutPreview layout={column.layout} width={120} />}
          <div className="min-w-48 flex-1 space-y-1">
            <div className="font-semibold text-itau-navy">Para: {row.segment}</div>
            <div className="font-medium text-itau-orange">Melhor na simulação: {column.name}</div>
            <p className="text-xs text-neutral-600">
              {cell.successes} de {cell.agents} concluíram ({pct(cell.successes, cell.agents)}
              {cell.avgSec !== null ? `, em ${Math.round(cell.avgSec)} s em média` : ""}), contra {others}. Hipótese para testar com pessoas desse
              perfil.
            </p>
          </div>
        </div>
        <HumanReview
          proposal={proposal}
          runId={run.id}
          onDecide={onDecide}
          previous={decisions.findLast((d) => d.runId === run.id && d.proposalId === proposal.id && d.proposal === proposal.change)}
        />
      </article>
    );
  };

  return (
    <div className="mt-5 border-t border-neutral-200 pt-4">
      <header className="mb-1 flex flex-wrap items-center gap-2">
        <LayoutTemplate size={18} className="text-itau-orange" />
        <h3 className="font-semibold">Variações de tela por perfil de cliente</h3>
        <SimulationBadge />
      </header>
      <p className="mb-3 text-xs text-neutral-500">
        Os mesmos agentes fizeram &quot;{FLOWS[run.config.flowId].name}&quot; em cada layout do app (Dash V1, V2, V3 e combinações das peças do
        Iury). A tabela mostra, por perfil, quantos concluíram e o tempo médio de quem concluiu (tempo humano simulado). É diferença clara
        quando o layout teve 2 agentes a mais concluindo ou foi 15% mais rápido; o resto é sinal fraco.
      </p>

      {columns.length < 2 ? (
        <p className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-600">
          Esta simulação rodou em um layout só. No Laboratório, use &quot;Testar nos layouts marcados&quot; para os mesmos agentes fazerem esta tarefa em
          cada layout e comparar aqui.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b align-bottom text-xs text-neutral-500">
                  <th className="py-2 font-medium">Perfil</th>
                  {columns.map((c) => (
                    <th key={c.key} className="py-2 font-medium">
                      {c.layout && <LayoutPreview layout={c.layout} width={96} />}
                      <span className="mt-1 block text-itau-navy">{c.name}</span>
                    </th>
                  ))}
                  <th className="py-2 font-medium">Melhor para o perfil</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {rows.map((row) => (
                  <tr key={row.id} className={`border-b border-neutral-100 ${row.id === "todos" ? "font-semibold" : ""}`}>
                    <td className="py-1.5">{row.segment}</td>
                    {row.cells.map((cell) => (
                      <td key={cell.key} className={`py-1.5 ${cell.key === row.best && !row.weak ? "font-semibold text-itau-orange" : ""}`}>
                        {cell.agents ? `${cell.successes} de ${cell.agents} (${pct(cell.successes, cell.agents)})` : "—"}
                        {cell.avgSec !== null && <span className="block text-[11px] font-normal text-neutral-500">{Math.round(cell.avgSec)} s em média</span>}
                      </td>
                    ))}
                    <td className="py-1.5 text-xs">
                      {!row.best ? "ninguém concluiu" : row.weak ? `sinal fraco (${nameOf(row.best)})` : nameOf(row.best)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mixedModes && (
            <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800">
              As simulações usaram agentes diferentes (regras × LLM, ou outra versão do prompt): a diferença pode vir daí, não do layout.
            </p>
          )}
          <div className="mt-4 space-y-3">
            <div className="text-sm font-semibold text-itau-navy">Indicação por perfil (só onde a diferença é clara)</div>
            {rows.filter((r) => r.best && !r.weak).map(recommendation)}
            {!rows.some((r) => r.best && !r.weak) && (
              <p className="text-sm text-neutral-500">Nenhum perfil teve diferença clara entre os layouts nesta simulação: todos os resultados são sinal fraco.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
