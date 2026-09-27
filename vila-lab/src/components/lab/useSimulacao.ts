"use client";

import { useCallback, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { exportarArvore } from "@/lib/acessibilidade";
import { aplicarAcao, estadoInicial } from "@/lib/banco/estado";
import { FLUXOS, tarefaConcluida, telaFinal } from "@/lib/banco/fluxos";
import { gerarBase } from "@/lib/personas";
import {
  ABANDONAR,
  type ArvoreAcessibilidade,
  type ConfigSimulacao,
  type DesfechoAgente,
  type EstadoBanco,
  type PassoLog,
  type Persona,
  type ResultadoAgente,
  type RespostaNavegacao,
  type Simulacao,
  type TelaId,
} from "@/lib/tipos";
import { agoraBrasilia } from "@/lib/uteis";

export type Velocidade = "demonstracao" | "rapida";

export interface Progresso {
  feitos: number;
  total: number;
  personaAtual: Persona | null;
  passosAtuais: PassoLog[];
  resultados: ResultadoAgente[];
  ultimoPrompt: string | null;
  erro: string | null;
}

const PROGRESSO_VAZIO: Progresso = {
  feitos: 0,
  total: 0,
  personaAtual: null,
  passosAtuais: [],
  resultados: [],
  ultimoPrompt: null,
  erro: null,
};

const proximoQuadro = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const pausa = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const habilitados = (a: ArvoreAcessibilidade) => a.elementos.filter((e) => e.habilitado).length;

/**
 * O loop estocástico do laboratório. Para cada persona: a tela renderiza, a árvore é
 * exportada do DOM, a API devolve UMA ação, a ação é aplicada (mesma transição de um
 * clique humano) e repete até concluir, desistir ou bater o limite de passos.
 */
export function useSimulacao(raiz: React.RefObject<HTMLDivElement | null>) {
  const [estado, setEstado] = useState<EstadoBanco>(() => estadoInicial("emprestimo", "original"));
  const [destaque, setDestaque] = useState<string | null>(null);
  const [rodando, setRodando] = useState(false);
  const [progresso, setProgresso] = useState<Progresso>(PROGRESSO_VAZIO);
  const cancelar = useRef(false);

  const agirManual = useCallback((actionId: string) => setEstado((s) => aplicarAcao(s, actionId)), []);
  const reiniciarTela = useCallback((config: Pick<ConfigSimulacao, "fluxo" | "versao">) => {
    setEstado(estadoInicial(config.fluxo, config.versao));
  }, []);

  const parar = useCallback(() => {
    cancelar.current = true;
  }, []);

  const rodar = useCallback(
    async (config: ConfigSimulacao, velocidade: Velocidade): Promise<Simulacao | null> => {
      const fluxo = FLUXOS[config.fluxo];
      const personas = gerarBase({ quantidade: config.agentes, semente: config.semente, proporcao: config.proporcao });
      const inicio = performance.now();
      const resultados: ResultadoAgente[] = [];
      const arvores: Partial<Record<TelaId, ArvoreAcessibilidade>> = {};
      let modelo = "";
      let versaoPrompt = "";
      cancelar.current = false;
      setRodando(true);
      setProgresso({ ...PROGRESSO_VAZIO, total: personas.length });

      try {
        for (const persona of personas) {
          if (cancelar.current) break;
          let s = estadoInicial(config.fluxo, config.versao, persona.financeiro.saldo);
          flushSync(() => setEstado(s));
          const passos: PassoLog[] = [];
          const historico: { tela: TelaId; action_id: string }[] = [];
          let invalidas = 0;
          let desfecho: DesfechoAgente | null = null;
          setProgresso((p) => ({ ...p, personaAtual: persona, passosAtuais: [] }));

          for (let passo = 1; passo <= fluxo.max_passos && !desfecho; ) {
            if (cancelar.current) break;
            await proximoQuadro();
            const arvore = exportarArvore(raiz.current!);
            const anterior = arvores[arvore.tela];
            if (!anterior || habilitados(arvore) > habilitados(anterior)) arvores[arvore.tela] = arvore;

            const resposta = await fetch("/api/agente/navegar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                persona,
                fluxo: config.fluxo,
                objetivo: fluxo.objetivo,
                arvore,
                historico,
                passo,
                semente: config.semente,
                tentativa: invalidas,
                taxa_resposta_invalida: config.taxa_resposta_invalida,
                atraso_mock_ms: velocidade === "rapida" ? 10 : 250,
                incluir_prompt: resultados.length === 0,
              }),
            });
            const r = (await resposta.json()) as RespostaNavegacao & { erro?: string };
            if (!resposta.ok) throw new Error(r.erro ?? `A API respondeu ${resposta.status}.`);
            modelo = r.modelo;
            versaoPrompt = r.versao_prompt;
            if (r.prompt) setProgresso((p) => ({ ...p, ultimoPrompt: r.prompt ?? null }));

            if (!r.valida) {
              // Proteção: ação que não existe na tela é recusada e registrada; uma nova chance, depois encerra.
              invalidas += 1;
              passos.push({ passo, tela: s.tela, action_id: r.action_id, justificativa: `Recusada: ${r.justificativa}`, tempo_s: 0, carga_cognitiva: arvore.carga_cognitiva, valida: false });
              if (invalidas >= 2) desfecho = "erro_agente";
              continue;
            }

            const no = arvore.elementos.find((e) => e.action_id === r.action_id);
            if (velocidade === "demonstracao" && no) {
              flushSync(() => setDestaque(r.action_id));
              await pausa(450);
            }
            passos.push({
              passo,
              tela: s.tela,
              action_id: r.action_id,
              justificativa: r.justificativa,
              tempo_s: r.tempo_s,
              carga_cognitiva: arvore.carga_cognitiva,
              valida: true,
              posicao: no?.posicao,
            });
            historico.push({ tela: s.tela, action_id: r.action_id });
            setProgresso((p) => ({ ...p, passosAtuais: [...passos] }));

            if (r.action_id === ABANDONAR) {
              desfecho = "abandono";
              break;
            }
            s = aplicarAcao(s, r.action_id);
            flushSync(() => {
              setEstado(s);
              setDestaque(null);
            });
            if (telaFinal(s)) desfecho = tarefaConcluida(s) ? "sucesso" : "falha_tarefa";
            passo += 1;
          }
          if (cancelar.current) break;

          resultados.push({
            persona,
            desfecho: desfecho ?? "limite_passos",
            tela_final: s.tela,
            passos,
            tempo_total_s: Math.round(passos.reduce((t, p) => t + p.tempo_s, 0) * 10) / 10,
            respostas_invalidas: invalidas,
          });
          setProgresso((p) => ({ ...p, feitos: resultados.length, resultados: [...resultados] }));
          if (velocidade === "demonstracao") await pausa(300);
        }
      } catch (e) {
        setProgresso((p) => ({ ...p, erro: e instanceof Error ? e.message : String(e) }));
        setRodando(false);
        return null;
      }

      setRodando(false);
      setDestaque(null);
      if (resultados.length === 0) return null;
      const id = `lab-${agoraBrasilia().slice(0, 19).replace(/[-:T]/g, "").replace(/^(\d{8})/, "$1-")}`;
      return {
        id,
        rotulo: "SIMULAÇÃO",
        aviso: "Personas e agentes simulados sobre um banco fictício. Não substitui teste com pessoas.",
        criada_em: agoraBrasilia(),
        config: { ...config, agentes: resultados.length },
        modelo,
        versao_prompt: versaoPrompt,
        duracao_real_s: Math.round((performance.now() - inicio) / 100) / 10,
        resultados,
        arvores,
      };
    },
    [raiz],
  );

  return { estado, destaque, rodando, progresso, rodar, parar, agirManual, reiniciarTela };
}
