"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import type { DecisionOption, DesignProposal, HumanDecision } from "@/types/analytics";
import { formatBrasilia } from "@/lib/time";

export const DECISION_LABELS: Record<DecisionOption, string> = {
  aprovar_para_teste: "Levar ao teste com pessoas",
  recusar: "Recusar",
  precisa_de_dados: "Precisa de mais dados",
};

export type NewDecision = Omit<HumanDecision, "at">;

interface HumanReviewProps {
  proposal: DesignProposal;
  runId: string;
  previous?: HumanDecision;
  onDecide: (decision: NewDecision) => void;
}

/** Ponto de revisão humana: o agente propõe, o designer ou o PO decide e explica por quê. */
export function HumanReview({ proposal, runId, previous, onDecide }: HumanReviewProps) {
  const [role, setRole] = useState<HumanDecision["role"]>("designer");
  const [decision, setDecision] = useState<DecisionOption | "">("");
  const [comment, setComment] = useState("");
  const [warning, setWarning] = useState<string | null>(null);

  if (previous) {
    return (
      <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-neutral-50 p-2 text-xs text-neutral-700">
        <UserCheck size={14} className="mt-0.5 shrink-0 text-green-700" />
        <span>
          <b>{DECISION_LABELS[previous.decision]}</b> · {previous.role} · {formatBrasilia(previous.at)}
          {previous.comment && <> · “{previous.comment}”</>}
        </span>
      </p>
    );
  }

  const save = () => {
    if (!decision) return setWarning("Escolha uma decisão.");
    if (decision !== "aprovar_para_teste" && !comment.trim()) return setWarning("Explique o motivo em uma frase.");
    setWarning(null);
    onDecide({ role, runId, proposalId: proposal.id, proposal: proposal.change, decision, comment: comment.trim() });
  };

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-dashed border-neutral-300 p-2 text-xs">
      <p className="font-semibold text-itau-navy">Revisão humana: a proposta só vale depois de uma pessoa decidir</p>
      <div className="flex flex-wrap items-center gap-3">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Quem decide</legend>
          {(["designer", "PO"] as const).map((r) => (
            <label key={r} className="flex items-center gap-1">
              <input type="radio" name={`role-${runId}-${proposal.id}`} checked={role === r} onChange={() => setRole(r)} />
              {r}
            </label>
          ))}
        </fieldset>
        <select
          aria-label="Decisão"
          value={decision}
          onChange={(e) => setDecision(e.target.value as DecisionOption)}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1"
        >
          <option value="">Decisão…</option>
          {(Object.keys(DECISION_LABELS) as DecisionOption[]).map((d) => (
            <option key={d} value={d}>
              {DECISION_LABELS[d]}
            </option>
          ))}
        </select>
      </div>
      <input
        aria-label="Por quê?"
        placeholder="Por quê? (obrigatório para recusar ou pedir dados)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1"
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} className="rounded-md bg-itau-navy px-3 py-1 font-semibold text-white">
          Registrar decisão
        </button>
        {warning && <span className="text-red-700">{warning}</span>}
      </div>
    </div>
  );
}
