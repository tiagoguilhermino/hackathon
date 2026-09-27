"use client";

import { Play, Square } from "lucide-react";
import { FLUXOS } from "@/lib/banco/fluxos";
import { PROFISSOES, ROTULO_PROFISSAO } from "@/lib/personas";
import type { ConfigSimulacao, FluxoId, Profissao } from "@/lib/tipos";
import type { Velocidade } from "./useSimulacao";

interface Props {
  config: ConfigSimulacao;
  aoMudar: (c: ConfigSimulacao) => void;
  velocidade: Velocidade;
  aoMudarVelocidade: (v: Velocidade) => void;
  rodando: boolean;
  aoRodar: () => void;
  aoParar: () => void;
  modoIA: { modo: string; modelo: string } | null;
}

const campo = "w-full rounded-lg border border-borda bg-cartao px-3 py-2 text-sm text-texto";

/** Configuração da demanda: qual fluxo, qual versão, quantos agentes e em que proporção. */
export function PainelConfig({ config, aoMudar, velocidade, aoMudarVelocidade, rodando, aoRodar, aoParar, modoIA }: Props) {
  const fluxo = FLUXOS[config.fluxo];
  const mudar = (parcial: Partial<ConfigSimulacao>) => aoMudar({ ...config, ...parcial });

  return (
    <section className="space-y-4 rounded-2xl border border-borda bg-cartao p-4">
      <h2 className="text-base font-bold text-azul">1 · Configurar a demanda</h2>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-texto">Fluxo a testar</span>
        <select
          className={campo}
          value={config.fluxo}
          disabled={rodando}
          onChange={(e) => {
            const id = e.target.value as FluxoId;
            mudar({ fluxo: id, versao: FLUXOS[id].versoes[0].id });
          }}
        >
          {Object.values(FLUXOS).map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </select>
        <span className="block text-xs text-texto-suave">Objetivo dado aos agentes: {fluxo.objetivo}</span>
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-semibold text-texto">Versão da tela</span>
        <select className={campo} value={config.versao} disabled={rodando} onChange={(e) => mudar({ versao: e.target.value as ConfigSimulacao["versao"] })}>
          {fluxo.versoes.map((v) => (
            <option key={v.id} value={v.id}>
              {v.id} · {v.descricao}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-texto">Agentes</span>
          <input
            type="number"
            min={1}
            max={200}
            className={campo}
            value={config.agentes}
            disabled={rodando}
            onChange={(e) => mudar({ agentes: Math.max(1, Math.min(200, Number(e.target.value) || 1)) })}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-texto">Semente</span>
          <input
            type="number"
            className={campo}
            value={config.semente}
            disabled={rodando}
            onChange={(e) => mudar({ semente: Number(e.target.value) || 0 })}
          />
        </label>
      </div>

      <fieldset className="space-y-2" disabled={rodando}>
        <legend className="text-sm font-semibold text-texto">Proporção da base sintética (pesos)</legend>
        <p className="text-xs text-texto-suave">Ex.: servidor público 2 e CLT 1 = duas vezes mais servidores que CLT.</p>
        {PROFISSOES.map((p: Profissao) => (
          <label key={p} className="flex items-center justify-between gap-3 text-sm">
            <span>{ROTULO_PROFISSAO[p]}</span>
            <input
              type="number"
              min={0}
              max={10}
              className="w-20 rounded-lg border border-borda bg-cartao px-2 py-1 text-right"
              value={config.proporcao[p]}
              onChange={(e) => mudar({ proporcao: { ...config.proporcao, [p]: Math.max(0, Number(e.target.value) || 0) } })}
            />
          </label>
        ))}
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-texto">Velocidade</span>
          <select className={campo} value={velocidade} disabled={rodando} onChange={(e) => aoMudarVelocidade(e.target.value as Velocidade)}>
            <option value="demonstracao">Demonstração (mostra cada toque)</option>
            <option value="rapida">Rápida</option>
          </select>
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-semibold text-texto">Respostas inválidas</span>
          <select
            className={campo}
            value={config.taxa_resposta_invalida}
            disabled={rodando}
            onChange={(e) => mudar({ taxa_resposta_invalida: Number(e.target.value) })}
          >
            <option value={0}>0% (normal)</option>
            <option value={0.05}>5% (testar a proteção)</option>
            <option value={0.15}>15% (testar a proteção)</option>
          </select>
        </label>
      </div>

      <p className="rounded-lg bg-fundo px-3 py-2 text-xs text-texto-suave">
        IA:{" "}
        {modoIA === null ? (
          "conferindo…"
        ) : modoIA.modo === "mock" ? (
          <strong className="text-alerta">simulada (regras + setTimeout)</strong>
        ) : (
          <strong className="text-sucesso">ligada · {modoIA.modelo}</strong>
        )}
      </p>

      {rodando ? (
        <button
          type="button"
          onClick={aoParar}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-erro px-4 py-3 font-bold text-erro"
        >
          <Square aria-hidden size={18} /> Parar
        </button>
      ) : (
        <button
          type="button"
          onClick={aoRodar}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-marca px-4 py-3 font-bold text-azul hover:bg-marca-escura"
        >
          <Play aria-hidden size={18} /> Rodar simulação
        </button>
      )}
    </section>
  );
}
