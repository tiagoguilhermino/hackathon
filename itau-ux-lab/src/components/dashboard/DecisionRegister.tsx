import { Download } from "lucide-react";
import type { HumanDecision } from "@/types/analytics";
import { downloadJson, formatBrasilia } from "@/lib/time";
import { DECISION_LABELS } from "./HumanReview";

/** Registro das decisões humanas (só cresce). Fica neste navegador: baixe o JSON para guardar. */
export function DecisionRegister({ decisions }: { decisions: HumanDecision[] }) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Registro de decisões humanas</h2>
        <button
          type="button"
          disabled={!decisions.length}
          onClick={() => downloadJson("decisoes.json", decisions)}
          className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          <Download size={16} /> Baixar registro (JSON)
        </button>
      </header>
      {!decisions.length ? (
        <p className="text-sm text-neutral-500">Nenhuma decisão registrada ainda. O registro só cresce: nada é apagado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="text-neutral-500">
              <tr className="border-b">
                <th className="py-1.5 font-medium">Quando (Brasília)</th>
                <th className="py-1.5 font-medium">Quem</th>
                <th className="py-1.5 font-medium">Simulação</th>
                <th className="py-1.5 font-medium">Proposta</th>
                <th className="py-1.5 font-medium">Decisão</th>
                <th className="py-1.5 font-medium">Por quê</th>
              </tr>
            </thead>
            <tbody>
              {[...decisions].reverse().map((d) => (
                <tr key={`${d.at}-${d.runId}-${d.proposalId}`} className="border-b border-neutral-100 align-top">
                  <td className="py-1.5 tabular-nums">{formatBrasilia(d.at)}</td>
                  <td className="py-1.5">{d.role}</td>
                  <td className="py-1.5">{d.runId}</td>
                  <td className="py-1.5">{d.proposal}</td>
                  <td className="py-1.5 font-semibold">{DECISION_LABELS[d.decision]}</td>
                  <td className="py-1.5">{d.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
