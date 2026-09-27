"use client";

import { Bot, CircleCheck, LayoutDashboard, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SeloSimulacao } from "@/components/comum/AvisoPrototipo";
import { ROTULO_DESFECHO, ROTULO_TELA } from "@/lib/estatisticas";
import { descreverPersona } from "@/lib/personas";
import { ABANDONAR, type DesfechoAgente } from "@/lib/tipos";
import type { Progresso } from "./useSimulacao";

const COR_DESFECHO: Record<DesfechoAgente, string> = {
  sucesso: "text-sucesso",
  falha_tarefa: "text-alerta",
  abandono: "text-erro",
  limite_passos: "text-alerta",
  erro_agente: "text-texto-suave",
};

interface Props {
  progresso: Progresso;
  rodando: boolean;
  simulacaoSalva: string | null;
}

/** O que está acontecendo agora: agente da vez, cada passo com o porquê, e o placar. */
export function PainelExecucao({ progresso, rodando, simulacaoSalva }: Props) {
  const [verPrompt, setVerPrompt] = useState(false);
  const contagem = progresso.resultados.reduce<Record<string, number>>((acc, r) => {
    acc[r.desfecho] = (acc[r.desfecho] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="space-y-4 rounded-2xl border border-borda bg-cartao p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-azul">2 · Execução</h2>
        <SeloSimulacao />
      </div>

      <div>
        <div className="flex justify-between text-xs text-texto-suave">
          <span>
            {progresso.feitos} de {progresso.total || "—"} agentes
          </span>
          {rodando && <span className="font-semibold text-marca-escura">rodando…</span>}
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-fundo" aria-hidden>
          <div
            className="h-full bg-marca transition-all"
            style={{ width: `${progresso.total ? (100 * progresso.feitos) / progresso.total : 0}%` }}
          />
        </div>
      </div>

      {progresso.erro && (
        <p className="flex gap-2 rounded-lg bg-marca-clara p-3 text-sm text-erro">
          <TriangleAlert aria-hidden size={18} className="shrink-0" /> {progresso.erro}
        </p>
      )}

      {progresso.personaAtual && (
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-azul">
            <Bot aria-hidden size={18} className="text-marca-escura" />
            {descreverPersona(progresso.personaAtual)}
          </p>
          <ol className="max-h-72 space-y-1.5 overflow-y-auto pr-1 text-xs" aria-live="polite">
            {progresso.passosAtuais.map((p) => (
              <li key={`${p.passo}-${p.action_id}-${p.valida}`} className={`rounded-lg border px-2 py-1.5 ${p.valida ? "border-borda" : "border-erro/50 bg-marca-clara"}`}>
                <span className="font-semibold text-texto">
                  {p.passo}. {ROTULO_TELA[p.tela]} →{" "}
                  <code className={p.action_id === ABANDONAR ? "text-erro" : "text-azul"}>{p.action_id}</code>
                </span>
                <span className="block text-texto-suave">
                  “{p.justificativa}” · {p.tempo_s.toFixed(1)} s simulados · carga {p.carga_cognitiva.toFixed(2)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {progresso.resultados.length > 0 && (
        <ul className="space-y-1 border-t border-borda pt-3 text-sm">
          {(Object.keys(ROTULO_DESFECHO) as DesfechoAgente[])
            .filter((d) => contagem[d])
            .map((d) => (
              <li key={d} className="flex justify-between">
                <span className={COR_DESFECHO[d]}>{ROTULO_DESFECHO[d]}</span>
                <strong className="tabular-nums">{contagem[d]}</strong>
              </li>
            ))}
        </ul>
      )}

      {progresso.ultimoPrompt && (
        <div>
          <button type="button" className="text-xs font-semibold text-azul underline" onClick={() => setVerPrompt((v) => !v)}>
            {verPrompt ? "Esconder" : "Ver"} o prompt enviado ao agente (1º agente)
          </button>
          {verPrompt && (
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-fundo p-2 text-[11px] text-texto">
              {progresso.ultimoPrompt}
            </pre>
          )}
        </div>
      )}

      {simulacaoSalva && !rodando && (
        <div className="space-y-2 rounded-xl bg-fundo p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-sucesso">
            <CircleCheck aria-hidden size={18} /> Simulação salva: {simulacaoSalva}
          </p>
          <Link
            href={`/dashboard?sim=${simulacaoSalva}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-azul px-4 py-2.5 font-bold text-white"
          >
            <LayoutDashboard aria-hidden size={18} /> Abrir o dashboard
          </Link>
        </div>
      )}
    </section>
  );
}
