/**
 * Agente analista. Os ACHADOS saem de regras fixas sobre as estatísticas (código):
 * assim os números não dependem da IA. A IA (ou o mock) só escreve o sumário.
 */

import { ROTULO_SEGMENTACAO, ROTULO_TELA, segmentoDe, telaDeParada } from "../estatisticas";
import type { Achado, Estatisticas, ResultadoAgente, Segmentacao, TelaId } from "../tipos";
import { formatarPercentual, formatarSegundos } from "../uteis";

const SEGMENTACOES: Segmentacao[] = ["faixa_etaria", "literacia", "profissao", "dispositivo"];

function telaMaisComumDeParada(grupo: ResultadoAgente[]): { tela: TelaId; vezes: number } | null {
  const contagem = new Map<TelaId, number>();
  for (const r of grupo) {
    if (r.desfecho === "sucesso") continue;
    const t = telaDeParada(r);
    contagem.set(t, (contagem.get(t) ?? 0) + 1);
  }
  const [tela, vezes] = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  return tela ? { tela, vezes: vezes! } : null;
}

/** Regras dos achados (versão 1). Limiares escolhidos pelo time; mude aqui e registre. */
export function gerarAchados(est: Estatisticas, resultados: ResultadoAgente[]): Achado[] {
  const achados: Achado[] = [];
  const minimo = Math.max(5, Math.ceil(est.total * 0.1));
  const validos = resultados.filter((r) => r.desfecho !== "erro_agente");

  for (const s of SEGMENTACOES) {
    for (const seg of est.por_segmento[s]) {
      const diferenca = est.taxa_sucesso - seg.taxa_sucesso;
      if (seg.n < minimo || diferenca < 0.2) continue;
      const grupo = validos.filter((r) => segmentoDe(r, s) === seg.segmento);
      const parada = telaMaisComumDeParada(grupo);
      const naoConcluiram = seg.n - seg.sucessos;
      achados.push({
        id: "",
        tipo: "segmento_abaixo",
        severidade: diferenca >= 0.35 ? "alta" : "media",
        segmento: `${ROTULO_SEGMENTACAO[s]}: ${seg.segmento}`,
        tela: parada?.tela,
        descricao:
          `${ROTULO_SEGMENTACAO[s]} ${seg.segmento}: ${formatarPercentual(1 - seg.taxa_sucesso)} não concluíram a tarefa` +
          (parada ? `; a maioria parou em "${ROTULO_TELA[parada.tela]}".` : "."),
        evidencia:
          `${seg.sucessos} de ${seg.n} concluíram (${formatarPercentual(seg.taxa_sucesso)}), contra ${formatarPercentual(est.taxa_sucesso)} no geral` +
          (parada ? `; ${parada.vezes} dos ${naoConcluiram} que não concluíram pararam nessa tela.` : "."),
      });
    }
  }

  // Ponto de abandono: pelo menos 3 agentes e 5% do total pararam na tela.
  for (const ponto of est.abandono_por_tela) {
    const parou = ponto.abandonos + ponto.falhas;
    const fracao = parou / Math.max(1, est.total);
    if (parou < 3 || fracao < 0.05) continue;
    achados.push({
      id: "",
      tipo: "tela_com_abandono",
      severidade: fracao >= 0.3 ? "alta" : fracao >= 0.15 ? "media" : "baixa",
      tela: ponto.tela,
      descricao: `"${ROTULO_TELA[ponto.tela]}" concentra ${formatarPercentual(fracao)} das paradas.`,
      evidencia: `${ponto.abandonos} desistências e ${ponto.falhas} erros de caminho em ${est.total} agentes.`,
    });
  }

  if (est.tempo_medio_s !== null) {
    for (const s of SEGMENTACOES) {
      for (const seg of est.por_segmento[s]) {
        if (seg.tempo_medio_s === null || seg.sucessos < 3 || seg.tempo_medio_s < 1.5 * est.tempo_medio_s) continue;
        achados.push({
          id: "",
          tipo: "tempo_alto",
          severidade: "media",
          segmento: `${ROTULO_SEGMENTACAO[s]}: ${seg.segmento}`,
          descricao: `${ROTULO_SEGMENTACAO[s]} ${seg.segmento} levou bem mais tempo para concluir.`,
          evidencia: `${formatarSegundos(seg.tempo_medio_s)} em média, contra ${formatarSegundos(est.tempo_medio_s)} no geral (tempo simulado).`,
        });
      }
    }
  }

  if (est.respostas_invalidas > 0) {
    achados.push({
      id: "",
      tipo: "qualidade_agente",
      severidade: est.erros_agente > 0 ? "media" : "baixa",
      descricao: "O agente devolveu ações que não existem na tela; o sistema recusou e registrou.",
      evidencia: `${est.respostas_invalidas} respostas inválidas; ${est.erros_agente} agentes encerrados por erro (fora das taxas acima).`,
    });
  }

  const ordem = { alta: 0, media: 1, baixa: 2 };
  return achados
    .sort((a, b) => ordem[a.severidade] - ordem[b.severidade])
    .map((a, i) => ({ ...a, id: `A${i + 1}` }));
}

/** Sumário escrito por regra (modo simulado). A IA de verdade recebe os mesmos números. */
export function sumarioMock(est: Estatisticas, achados: Achado[], nomeFluxo: string): string {
  const partes = [
    `Na simulação do fluxo "${nomeFluxo}", ${est.sucessos} de ${est.total} agentes concluíram a tarefa (${formatarPercentual(est.taxa_sucesso)}), em ${formatarSegundos(est.tempo_medio_s)} em média (tempo simulado).`,
  ];
  const principais = achados.filter((a) => a.tipo !== "qualidade_agente").slice(0, 3);
  if (principais.length) {
    partes.push(`Pontos de atrito: ${principais.map((a) => a.descricao.replace(/\.$/, "")).join("; ")}.`);
  } else {
    partes.push("Nenhum segmento ficou muito abaixo do geral pelas regras atuais.");
  }
  partes.push(
    "Isto é SIMULAÇÃO: os agentes seguem regras e perfis sintéticos. Trate cada ponto como hipótese para o teste com pessoas reais.",
  );
  return partes.join(" ");
}
