"use client";

import { Download, FileJson } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BancoApp } from "@/components/banco/BancoApp";
import { AvisoPrototipo } from "@/components/comum/AvisoPrototipo";
import { Navegacao } from "@/components/comum/Navegacao";
import { PainelBase } from "@/components/lab/PainelBase";
import { PainelConfig } from "@/components/lab/PainelConfig";
import { PainelExecucao } from "@/components/lab/PainelExecucao";
import { useSimulacao, type Velocidade } from "@/components/lab/useSimulacao";
import { exportarArvore } from "@/lib/acessibilidade";
import { salvarSimulacao } from "@/lib/armazenamento";
import { FLUXOS } from "@/lib/banco/fluxos";
import { PROPORCAO_PADRAO } from "@/lib/personas";
import type { ConfigSimulacao, Simulacao } from "@/lib/tipos";
import { baixarJson } from "@/lib/uteis";

const CONFIG_INICIAL: ConfigSimulacao = {
  fluxo: "emprestimo",
  versao: "original",
  agentes: 24,
  semente: 2026,
  proporcao: PROPORCAO_PADRAO,
  taxa_resposta_invalida: 0,
};

/** Modo laboratório: configura a demanda, roda os agentes na tela e salva o registro. */
export default function Laboratorio() {
  const raiz = useRef<HTMLDivElement>(null);
  const { estado, destaque, rodando, progresso, rodar, parar, agirManual, reiniciarTela } = useSimulacao(raiz);
  const [config, setConfig] = useState<ConfigSimulacao>(CONFIG_INICIAL);
  const [velocidade, setVelocidade] = useState<Velocidade>("demonstracao");
  const [modoIA, setModoIA] = useState<{ modo: string; modelo: string } | null>(null);
  const [ultima, setUltima] = useState<Simulacao | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/agente/status")
      .then((r) => r.json())
      .then(setModoIA)
      .catch(() => setModoIA({ modo: "mock", modelo: "mock" }));
  }, []);

  const mudarConfig = (c: ConfigSimulacao) => {
    setConfig(c);
    if (c.fluxo !== config.fluxo || c.versao !== config.versao) reiniciarTela(c);
  };

  const iniciar = async (c: ConfigSimulacao = config, v: Velocidade = velocidade) => {
    setAviso(null);
    setUltima(null);
    const sim = await rodar(c, v);
    if (!sim) return null;
    setUltima(sim);
    if (!salvarSimulacao(sim)) setAviso("Não deu para guardar no navegador (armazenamento cheio ou bloqueado). Baixe o JSON.");
    return sim;
  };

  // /lab?auto=<fluxo>.<versão>: roda um exemplo sozinho (rápido) e abre o dashboard.
  // É o que o botão "Gerar exemplo" do dashboard usa, para o link público funcionar sem dados salvos.
  const router = useRouter();
  const autoIniciado = useRef(false);
  useEffect(() => {
    if (autoIniciado.current) return;
    const auto = new URLSearchParams(window.location.search).get("auto");
    const [fluxo, versao] = (auto ?? "").split(".") as [ConfigSimulacao["fluxo"], ConfigSimulacao["versao"]];
    if (!FLUXOS[fluxo]?.versoes.some((x) => x.id === versao)) return;
    const c: ConfigSimulacao = { ...CONFIG_INICIAL, fluxo, versao, agentes: 40 };
    const espera = window.setTimeout(() => {
      autoIniciado.current = true;
      setConfig(c);
      setVelocidade("rapida");
      reiniciarTela(c);
      void iniciar(c, "rapida").then((sim) => sim && router.push(`/dashboard?sim=${sim.id}`));
    }, 0);
    return () => window.clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda uma vez só, na abertura
  }, []);

  return (
    <main className="flex min-h-dvh flex-col">
      <AvisoPrototipo />
      <Navegacao atual="/lab" />
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-4 p-4 lg:grid-cols-[320px_auto_1fr]">
        <div className="space-y-4">
          <PainelConfig
            config={config}
            aoMudar={mudarConfig}
            velocidade={velocidade}
            aoMudarVelocidade={setVelocidade}
            rodando={rodando}
            aoRodar={() => void iniciar()}
            aoParar={parar}
            modoIA={modoIA}
          />
          <PainelBase config={config} />
        </div>

        <div className="flex min-w-0 flex-col items-center gap-3 overflow-x-auto">
          <BancoApp ref={raiz} estado={estado} agir={agirManual} destaque={destaque} interativo={!rodando} />
          <button
            type="button"
            disabled={rodando}
            onClick={() => raiz.current && baixarJson(`arvore-${estado.tela}.json`, exportarArvore(raiz.current))}
            className="inline-flex items-center gap-1.5 rounded-lg border border-borda bg-cartao px-3 py-1.5 text-sm text-texto hover:border-azul disabled:opacity-50"
          >
            <FileJson aria-hidden size={16} /> Exportar árvore da tela atual (JSON)
          </button>
        </div>

        <div className="space-y-4">
          <PainelExecucao progresso={progresso} rodando={rodando} simulacaoSalva={ultima?.id ?? null} />
          {aviso && <p className="rounded-lg bg-marca-clara p-3 text-sm text-alerta">{aviso}</p>}
          {ultima && (
            <button
              type="button"
              onClick={() => baixarJson(`${ultima.id}.json`, ultima)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-borda bg-cartao px-3 py-1.5 text-sm text-texto hover:border-azul"
            >
              <Download aria-hidden size={16} /> Baixar o registro completo (JSON)
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
