"use client";

import { Info, Sparkles, TriangleAlert } from "lucide-react";
import { SeloSimulacao } from "@/components/comum/AvisoPrototipo";
import { ROTULO_TELA } from "@/lib/estatisticas";
import type { RelatorioAnalista, Severidade } from "@/lib/tipos";

const STATUS: Record<Severidade, { cor: string; rotulo: string }> = {
  alta: { cor: "#d03b3b", rotulo: "Alta" },
  media: { cor: "#ec835a", rotulo: "Média" },
  baixa: { cor: "#898781", rotulo: "Baixa" },
};

export function SeloSeveridade({ s }: { s: Severidade }) {
  const Icone = s === "baixa" ? Info : TriangleAlert;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-texto">
      <Icone aria-hidden size={14} style={{ color: STATUS[s].cor }} />
      {STATUS[s].rotulo}
    </span>
  );
}

interface Props {
  relatorio: RelatorioAnalista | null;
  carregando: boolean;
  erro: string | null;
  aoPedir: () => void;
}

/** Agente analista: lê os logs e as estatísticas e escreve o que chamou atenção. */
export function SecaoAnalista({ relatorio, carregando, erro, aoPedir }: Props) {
  return (
    <section className="min-w-0 space-y-3 break-words rounded-2xl border border-borda bg-cartao p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-azul">Agente analista · insights</h2>
        <SeloSimulacao />
      </div>
      <p className="text-xs text-texto-suave">
        Os números e os achados são calculados por regra no código. O agente só escreve o sumário a partir deles.
      </p>
      {!relatorio && (
        <button
          type="button"
          onClick={aoPedir}
          disabled={carregando}
          className="inline-flex items-center gap-2 rounded-xl bg-azul px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          <Sparkles aria-hidden size={16} /> {carregando ? "Analisando…" : "Pedir análise"}
        </button>
      )}
      {erro && <p className="text-sm text-erro">{erro}</p>}
      {relatorio && (
        <div className="space-y-3">
          <p className="rounded-xl bg-fundo p-3 text-sm leading-relaxed text-texto">{relatorio.sumario}</p>
          {relatorio.achados.length === 0 ? (
            <p className="text-sm text-texto-suave">Nenhum achado pelas regras atuais.</p>
          ) : (
            <ol className="space-y-2">
              {relatorio.achados.map((a) => (
                <li key={a.id} className="rounded-xl border border-borda p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-azul">{a.id}</strong>
                    <SeloSeveridade s={a.severidade} />
                    {a.tela && <span className="text-xs text-texto-suave">· {ROTULO_TELA[a.tela]}</span>}
                  </div>
                  <p className="mt-1 text-sm text-texto">{a.descricao}</p>
                  <p className="mt-0.5 text-xs text-texto-suave">{a.evidencia}</p>
                </li>
              ))}
            </ol>
          )}
          <p className="text-[11px] text-texto-suave">
            Modelo {relatorio.modelo} · prompt {relatorio.versao_prompt}
          </p>
        </div>
      )}
    </section>
  );
}
