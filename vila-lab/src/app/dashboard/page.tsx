"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AvisoPrototipo, SeloSimulacao } from "@/components/comum/AvisoPrototipo";
import { Navegacao } from "@/components/comum/Navegacao";
import { GraficoBarras, type LinhaGrafico } from "@/components/dashboard/GraficoBarras";
import { Indicadores } from "@/components/dashboard/Indicadores";
import { ROTULO_DECISAO } from "@/components/dashboard/RevisaoHumana";
import { SecaoAnalista } from "@/components/dashboard/SecaoAnalista";
import { SecaoDesigner } from "@/components/dashboard/SecaoDesigner";
import { listarDecisoes, listarSimulacoes, registrarDecisao } from "@/lib/armazenamento";
import { FLUXOS } from "@/lib/banco/fluxos";
import { calcularEstatisticas, funil, ROTULO_SEGMENTACAO, ROTULO_TELA } from "@/lib/estatisticas";
import type { DecisaoHumana, RelatorioAnalista, RelatorioDesigner, Segmentacao, Simulacao, TelaId } from "@/lib/tipos";
import { agoraBrasilia, baixarJson, formatarPercentual } from "@/lib/uteis";

const TELAS_DO_FUNIL: Record<Simulacao["config"]["fluxo"], TelaId[]> = {
  emprestimo: ["home", "emprestimo_1", "emprestimo_2", "emprestimo_3", "emprestimo_sucesso"],
  pix_recorrente: ["home", "pix_contatos", "pix_valor", "pix_confirmar", "pix_sucesso"],
};

const nomeSimulacao = (s: Simulacao) =>
  `${s.id.startsWith("exemplo") ? "Exemplo · " : ""}${FLUXOS[s.config.fluxo].nome} · versão ${s.config.versao} · ${s.resultados.length} agentes`;

async function carregarExemplos(): Promise<Simulacao[]> {
  try {
    const indice = (await fetch("/exemplos/indice.json").then((r) => r.json())) as string[];
    return await Promise.all(indice.map((arquivo) => fetch(`/exemplos/${arquivo}`).then((r) => r.json() as Promise<Simulacao>)));
  } catch {
    return [];
  }
}

/** Relatório da simulação: estatísticas por segmento, agentes analista e designer, e a decisão humana. */
export default function Dashboard() {
  const [sims, setSims] = useState<Simulacao[]>([]);
  const [idAtual, setIdAtual] = useState<string>("");
  const [idComparacao, setIdComparacao] = useState<string>("");
  const [segmentacao, setSegmentacao] = useState<Segmentacao>("faixa_etaria");
  const [analista, setAnalista] = useState<RelatorioAnalista | null>(null);
  const [designer, setDesigner] = useState<RelatorioDesigner | null>(null);
  const [carregando, setCarregando] = useState<"analista" | "designer" | null>(null);
  const [erro, setErro] = useState<{ analista?: string; designer?: string }>({});
  const [decisoes, setDecisoes] = useState<DecisaoHumana[]>([]);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    (async () => {
      const locais = listarSimulacoes();
      const exemplos = await carregarExemplos();
      const todas = [...locais, ...exemplos];
      setSims(todas);
      setDecisoes(listarDecisoes());
      const pedida = new URLSearchParams(window.location.search).get("sim");
      setIdAtual(todas.find((s) => s.id === pedida)?.id ?? todas[0]?.id ?? "");
      setPronto(true);
    })();
  }, []);

  const sim = sims.find((s) => s.id === idAtual) ?? null;
  const comparaveis = sims.filter((s) => sim && s.id !== sim.id && s.config.fluxo === sim.config.fluxo);
  const comparacao = comparaveis.find((s) => s.id === idComparacao) ?? null;
  const est = sim ? calcularEstatisticas(sim) : null;
  const estComparacao = comparacao ? calcularEstatisticas(comparacao) : null;

  const escolher = (id: string) => {
    setIdAtual(id);
    setIdComparacao("");
    setAnalista(null);
    setDesigner(null);
    setErro({});
  };

  const pedirAnalise = async () => {
    if (!sim) return;
    setCarregando("analista");
    setErro({});
    try {
      const r = await fetch("/api/agente/analista", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sim) });
      const dados = await r.json();
      if (!r.ok) throw new Error(dados.erro ?? `A API respondeu ${r.status}.`);
      setAnalista(dados.relatorio as RelatorioAnalista);
    } catch (e) {
      setErro({ analista: e instanceof Error ? e.message : String(e) });
    }
    setCarregando(null);
  };

  const pedirPropostas = async () => {
    if (!sim || !analista) return;
    setCarregando("designer");
    try {
      const r = await fetch("/api/agente/designer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achados: analista.achados, arvores: sim.arvores }),
      });
      const dados = await r.json();
      if (!r.ok) throw new Error(dados.erro ?? `A API respondeu ${r.status}.`);
      setDesigner(dados as RelatorioDesigner);
    } catch (e) {
      setErro({ designer: e instanceof Error ? e.message : String(e) });
    }
    setCarregando(null);
  };

  const decidir = (d: Omit<DecisaoHumana, "horario">) => {
    registrarDecisao({ ...d, horario: agoraBrasilia() });
    setDecisoes(listarDecisoes());
  };

  // Cálculos baratos (no máximo 200 agentes): refeitos a cada renderização, sem memoização.
  const porSegmentoOutra = new Map((estComparacao?.por_segmento[segmentacao] ?? []).map((s) => [s.segmento, s]));
  const porSegmento: LinhaGrafico[] = (est?.por_segmento[segmentacao] ?? []).map((s) => {
    const outra = porSegmentoOutra.get(s.segmento);
    return {
      rotulo: s.segmento,
      valor: s.taxa_sucesso,
      valor2: estComparacao ? (outra?.taxa_sucesso ?? null) : undefined,
      detalhe: `${s.sucessos} de ${s.n} nesta simulação${outra ? ` · ${outra.sucessos} de ${outra.n} na comparação` : ""}`,
    };
  });

  const tempos: LinhaGrafico[] = (est?.por_segmento[segmentacao] ?? []).map((s) => ({
    rotulo: s.segmento,
    valor: s.tempo_medio_s,
    detalhe: `${s.sucessos} concluíram`,
  }));

  const chegaram: LinhaGrafico[] =
    sim && est
      ? funil(sim, TELAS_DO_FUNIL[sim.config.fluxo]).map((f) => ({
          rotulo: ROTULO_TELA[f.tela],
          valor: f.chegaram,
          detalhe: `de ${est.total} agentes`,
        }))
      : [];

  const pararam: LinhaGrafico[] = (est?.abandono_por_tela ?? []).map((p) => ({
    rotulo: ROTULO_TELA[p.tela],
    valor: p.abandonos,
    valor2: p.falhas,
  }));

  return (
    <main className="flex min-h-dvh flex-col">
      <AvisoPrototipo />
      <Navegacao atual="/dashboard" />
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 p-4">
        <header className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-azul">Relatório da simulação</h1>
          <SeloSimulacao />
        </header>

        {pronto && !sim && (
          <div className="space-y-3 rounded-2xl border border-borda bg-cartao p-6 text-sm text-texto">
            <p>
              Nenhuma simulação neste navegador ainda. Rode uma no{" "}
              <Link href="/lab" className="font-semibold text-azul underline">
                laboratório
              </Link>{" "}
              ou gere um exemplo (40 agentes simulados, cerca de 15 segundos):
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ["emprestimo.original", "Empréstimo · versão original"],
                ["emprestimo.simplificada", "Empréstimo · versão simplificada"],
                ["pix_recorrente.A", "Pix · versão A"],
                ["pix_recorrente.C", "Pix · versão C"],
              ].map(([auto, rotulo]) => (
                <Link key={auto} href={`/lab?auto=${auto}`} className="rounded-xl bg-azul px-3 py-2 font-semibold text-white">
                  Gerar exemplo: {rotulo}
                </Link>
              ))}
            </div>
          </div>
        )}

        {sim && est && (
          <>
            {/* Filtros numa linha só, acima dos gráficos. */}
            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-borda bg-cartao p-3 text-sm">
              <label className="flex min-w-64 flex-1 flex-col gap-1">
                <span className="text-xs font-semibold text-texto-suave">Simulação</span>
                <select className="rounded-lg border border-borda bg-cartao px-2 py-1.5" value={sim.id} onChange={(e) => escolher(e.target.value)}>
                  {sims.map((s) => (
                    <option key={s.id} value={s.id}>
                      {nomeSimulacao(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-56 flex-col gap-1">
                <span className="text-xs font-semibold text-texto-suave">Comparar com (antes × depois)</span>
                <select
                  className="rounded-lg border border-borda bg-cartao px-2 py-1.5"
                  value={idComparacao}
                  onChange={(e) => setIdComparacao(e.target.value)}
                  disabled={comparaveis.length === 0}
                >
                  <option value="">{comparaveis.length ? "Sem comparação" : "Nenhuma outra do mesmo fluxo"}</option>
                  {comparaveis.map((s) => (
                    <option key={s.id} value={s.id}>
                      {nomeSimulacao(s)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-texto-suave">Segmentar por</span>
                <select className="rounded-lg border border-borda bg-cartao px-2 py-1.5" value={segmentacao} onChange={(e) => setSegmentacao(e.target.value as Segmentacao)}>
                  {(Object.keys(ROTULO_SEGMENTACAO) as Segmentacao[]).map((s) => (
                    <option key={s} value={s}>
                      {ROTULO_SEGMENTACAO[s]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => baixarJson(`${sim.id}.json`, sim)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-borda px-3 py-1.5 text-texto hover:border-azul"
              >
                <Download aria-hidden size={16} /> JSON
              </button>
            </div>

            <p className="text-xs text-texto-suave">
              {sim.aviso} Modelo {sim.modelo} · prompt {sim.versao_prompt} · semente {sim.config.semente} · {sim.criada_em.slice(0, 16).replace("T", " ")}.
              {sim.modelo.includes("mock") && " Agentes simulados por regra: os números refletem as regras do modelo, não pessoas."}
            </p>

            <Indicadores est={est} sim={sim} />

            <div className="grid gap-4 lg:grid-cols-2">
              <GraficoBarras
                titulo={`Taxa de conclusão por ${ROTULO_SEGMENTACAO[segmentacao].toLowerCase()}`}
                descricao={comparacao ? `Versão ${sim.config.versao} × versão ${comparacao.config.versao}` : "Fração de agentes que concluíram a tarefa"}
                dados={porSegmento}
                formatar={formatarPercentual}
                maximo={1}
                nomeSerie1={`Versão ${sim.config.versao}`}
                nomeSerie2={comparacao ? `Versão ${comparacao.config.versao}` : undefined}
              />
              <GraficoBarras
                titulo={`Tempo médio para concluir por ${ROTULO_SEGMENTACAO[segmentacao].toLowerCase()}`}
                descricao="Só de quem concluiu · segundos simulados"
                dados={tempos}
                formatar={(v) => `${Math.round(v)} s`}
                nomeSerie1="Tempo médio"
              />
              <GraficoBarras
                titulo="Funil: quantos agentes chegaram a cada tela"
                descricao="Na ordem do fluxo"
                dados={chegaram}
                formatar={(v) => String(Math.round(v))}
                nomeSerie1="Agentes"
              />
              <GraficoBarras
                titulo="Pontos de abandono (drop-off): onde os agentes pararam"
                descricao="Desistiram na tela ou tomaram a ação errada nela"
                dados={pararam}
                formatar={(v) => String(Math.round(v))}
                nomeSerie1="Desistiram"
                nomeSerie2="Erraram o caminho"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <SecaoAnalista relatorio={analista} carregando={carregando === "analista"} erro={erro.analista ?? null} aoPedir={pedirAnalise} />
              <SecaoDesigner
                relatorio={designer}
                podePedir={Boolean(analista)}
                carregando={carregando === "designer"}
                erro={erro.designer ?? null}
                aoPedir={pedirPropostas}
                simulacaoId={sim.id}
                decisoes={decisoes}
                aoDecidir={decidir}
              />
            </div>

            <section className="space-y-2 rounded-2xl border border-borda bg-cartao p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-azul">Registro de decisões humanas</h2>
                <button
                  type="button"
                  disabled={decisoes.length === 0}
                  onClick={() => baixarJson("decisoes.json", decisoes)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-borda px-3 py-1.5 text-sm text-texto hover:border-azul disabled:opacity-50"
                >
                  <Download aria-hidden size={16} /> Baixar registro
                </button>
              </div>
              {decisoes.length === 0 ? (
                <p className="text-sm text-texto-suave">Nenhuma decisão registrada ainda. O registro só cresce: nada é apagado.</p>
              ) : (
                <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-borda text-texto-suave">
                      <th className="py-1 font-semibold">Quando</th>
                      <th className="py-1 font-semibold">Quem</th>
                      <th className="py-1 font-semibold">Simulação</th>
                      <th className="py-1 font-semibold">Proposta</th>
                      <th className="py-1 font-semibold">Decisão</th>
                      <th className="py-1 font-semibold">Por quê</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...decisoes].reverse().map((d) => (
                      <tr key={`${d.horario}-${d.proposta_id}`} className="border-b border-borda/60 align-top">
                        <td className="py-1 tabular-nums">{d.horario.slice(0, 16).replace("T", " ")}</td>
                        <td className="py-1">{d.papel}</td>
                        <td className="py-1">{d.simulacao_id}</td>
                        <td className="py-1">
                          {d.proposta_id}: {d.proposta}
                        </td>
                        <td className="py-1 font-semibold">{ROTULO_DECISAO[d.decisao]}</td>
                        <td className="py-1">{d.comentario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
