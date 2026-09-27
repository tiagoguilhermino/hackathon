"use client";

import { useState } from "react";
import type { DecisaoHumana, OpcaoDecisao, Proposta } from "@/lib/tipos";

export const ROTULO_DECISAO: Record<OpcaoDecisao, string> = {
  aprovar_para_teste: "Aprovar para testar com pessoas",
  recusar: "Recusar",
  precisa_de_dados: "Precisa de mais dados",
};

interface Props {
  proposta: Proposta;
  simulacaoId: string;
  aoDecidir: (d: Omit<DecisaoHumana, "horario">) => void;
  decisaoAnterior?: DecisaoHumana;
}

/** O ponto de revisão humana: a IA propõe, uma pessoa decide e explica por quê. */
export function RevisaoHumana({ proposta, simulacaoId, aoDecidir, decisaoAnterior }: Props) {
  const [papel, setPapel] = useState<"designer" | "PO">("designer");
  const [decisao, setDecisao] = useState<OpcaoDecisao | "">("");
  const [comentario, setComentario] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  if (decisaoAnterior) {
    return (
      <p className="rounded-lg bg-fundo p-2 text-xs text-texto">
        <strong>{ROTULO_DECISAO[decisaoAnterior.decisao]}</strong> · {decisaoAnterior.papel} ·{" "}
        {decisaoAnterior.horario.slice(0, 16).replace("T", " ")}
        {decisaoAnterior.comentario && <> · “{decisaoAnterior.comentario}”</>}
      </p>
    );
  }

  const salvar = () => {
    if (!decisao) return setAviso("Escolha uma decisão.");
    if (decisao !== "aprovar_para_teste" && !comentario.trim()) return setAviso("Explique o motivo em uma frase.");
    setAviso(null);
    aoDecidir({ papel, simulacao_id: simulacaoId, proposta_id: proposta.id, proposta: proposta.proposta, decisao, comentario: comentario.trim() });
  };

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-borda p-2">
      <p className="text-xs font-semibold text-azul">Revisão humana (obrigatória antes de qualquer mudança)</p>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <fieldset className="flex items-center gap-2">
          <legend className="sr-only">Quem decide</legend>
          {(["designer", "PO"] as const).map((p) => (
            <label key={p} className="flex items-center gap-1">
              <input type="radio" name={`papel-${proposta.id}`} checked={papel === p} onChange={() => setPapel(p)} />
              {p}
            </label>
          ))}
        </fieldset>
        <select
          aria-label="Decisão"
          className="rounded-md border border-borda bg-cartao px-2 py-1"
          value={decisao}
          onChange={(e) => setDecisao(e.target.value as OpcaoDecisao)}
        >
          <option value="">Decisão…</option>
          {(Object.keys(ROTULO_DECISAO) as OpcaoDecisao[]).map((d) => (
            <option key={d} value={d}>
              {ROTULO_DECISAO[d]}
            </option>
          ))}
        </select>
      </div>
      <input
        aria-label="Por quê?"
        placeholder="Por quê? (obrigatório para recusar ou pedir dados)"
        className="w-full rounded-md border border-borda bg-cartao px-2 py-1 text-xs"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <button type="button" onClick={salvar} className="rounded-md bg-azul px-3 py-1 text-xs font-bold text-white">
          Registrar decisão
        </button>
        {aviso && <span className="text-xs text-erro">{aviso}</span>}
      </div>
    </div>
  );
}
