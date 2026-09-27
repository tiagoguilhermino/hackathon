"use client";

import { Lightbulb } from "lucide-react";
import { SeloSimulacao } from "@/components/comum/AvisoPrototipo";
import { ROTULO_TELA } from "@/lib/estatisticas";
import type { DecisaoHumana, RelatorioDesigner } from "@/lib/tipos";
import { RevisaoHumana } from "./RevisaoHumana";

interface Props {
  relatorio: RelatorioDesigner | null;
  podePedir: boolean;
  carregando: boolean;
  erro: string | null;
  aoPedir: () => void;
  simulacaoId: string;
  decisoes: DecisaoHumana[];
  aoDecidir: (d: Omit<DecisaoHumana, "horario">) => void;
}

/** Agente designer: propõe mudanças a partir dos achados. Nada muda sem revisão humana. */
export function SecaoDesigner({ relatorio, podePedir, carregando, erro, aoPedir, simulacaoId, decisoes, aoDecidir }: Props) {
  return (
    <section className="min-w-0 space-y-3 break-words rounded-2xl border border-borda bg-cartao p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-azul">Agente designer · propostas</h2>
        <SeloSimulacao />
      </div>
      <p className="text-xs text-texto-suave">
        Cada proposta é uma hipótese. O agente não altera a tela: o designer ou o PO aprova, recusa ou pede dados, e fica registrado.
      </p>
      {!relatorio && (
        <button
          type="button"
          onClick={aoPedir}
          disabled={!podePedir || carregando}
          className="inline-flex items-center gap-2 rounded-xl bg-azul px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          <Lightbulb aria-hidden size={16} /> {carregando ? "Pensando…" : podePedir ? "Pedir propostas" : "Peça a análise antes"}
        </button>
      )}
      {erro && <p className="text-sm text-erro">{erro}</p>}
      {relatorio && (
        <ol className="space-y-3">
          {relatorio.propostas.length === 0 && <p className="text-sm text-texto-suave">Nenhuma proposta para os achados atuais.</p>}
          {relatorio.propostas.map((p) => (
            <li key={p.id} className="space-y-2 rounded-xl border border-borda p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-texto-suave">
                <strong className="text-sm text-azul">{p.id}</strong>
                <span>responde a {p.achado_id}</span>
                <span>· {ROTULO_TELA[p.tela] ?? p.tela}</span>
                {p.elemento && <code className="rounded bg-fundo px-1">{p.elemento}</code>}
                <span>· esforço {p.esforco}</span>
              </div>
              <p className="text-sm text-texto">
                <strong>Problema:</strong> {p.problema}
              </p>
              <p className="text-sm text-texto">
                <strong>Proposta:</strong> {p.proposta}
              </p>
              <p className="text-xs text-texto-suave">{p.justificativa}</p>
              <p className="text-xs italic text-texto-suave">{p.hipotese_de_impacto}</p>
              <RevisaoHumana
                proposta={p}
                simulacaoId={simulacaoId}
                aoDecidir={aoDecidir}
                decisaoAnterior={decisoes.find((d) => d.simulacao_id === simulacaoId && d.proposta_id === p.id)}
              />
            </li>
          ))}
        </ol>
      )}
      {relatorio && (
        <p className="text-[11px] text-texto-suave">
          Modelo {relatorio.modelo} · prompt {relatorio.versao_prompt}
        </p>
      )}
    </section>
  );
}
