"use client";

import { useMemo } from "react";
import { descreverPersona, distribuirProfissoes, gerarBase, PROFISSOES, ROTULO_PROFISSAO } from "@/lib/personas";
import type { ConfigSimulacao } from "@/lib/tipos";

/** Módulo 1 visível: como a base sintética fica com a proporção escolhida. */
export function PainelBase({ config }: { config: ConfigSimulacao }) {
  const { contagem, amostra, erro } = useMemo(() => {
    try {
      return {
        contagem: distribuirProfissoes(config.agentes, config.proporcao),
        amostra: gerarBase({ quantidade: config.agentes, semente: config.semente, proporcao: config.proporcao }).slice(0, 5),
        erro: null,
      };
    } catch (e) {
      return { contagem: null, amostra: [], erro: e instanceof Error ? e.message : String(e) };
    }
  }, [config.agentes, config.proporcao, config.semente]);

  return (
    <section className="space-y-3 rounded-2xl border border-borda bg-cartao p-4">
      <h2 className="text-base font-bold text-azul">Base sintética</h2>
      {erro ? (
        <p className="text-sm text-erro">{erro}</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {PROFISSOES.map((p) => (
              <li key={p} className="flex justify-between">
                <span className="text-texto-suave">{ROTULO_PROFISSAO[p]}</span>
                <strong className="tabular-nums text-texto">{contagem?.[p] ?? 0}</strong>
              </li>
            ))}
          </ul>
          <ul className="space-y-1 border-t border-borda pt-2 text-xs text-texto-suave">
            {amostra.map((p) => (
              <li key={p.id}>
                {p.id} · {descreverPersona(p)} · {p.seguranca.sistema} {p.seguranca.gama} · {p.seguranca.uf}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-texto-suave">
            Perfis fictícios. As relações entre idade, renda e literacia digital são hipóteses de modelagem, não dados reais.
          </p>
        </>
      )}
    </section>
  );
}
