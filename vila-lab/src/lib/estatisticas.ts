/**
 * Módulo 4 · Estatísticas calculadas por código a partir dos logs da simulação.
 * O agente analista só interpreta estes números; ele não calcula nem inventa outros.
 */

import { faixaEtaria, faixaLiteracia, ROTULO_PROFISSAO, rotuloDispositivo } from "./personas";
import type {
  DesfechoAgente,
  EstatisticaSegmento,
  Estatisticas,
  PontoAbandono,
  ResultadoAgente,
  Segmentacao,
  Simulacao,
  TelaId,
} from "./tipos";

export const ROTULO_SEGMENTACAO: Record<Segmentacao, string> = {
  profissao: "Profissão",
  faixa_etaria: "Faixa etária",
  literacia: "Literacia digital",
  dispositivo: "Dispositivo",
};

export const ROTULO_TELA: Record<TelaId, string> = {
  home: "Início",
  pagamentos: "Pagamentos",
  emprestimo_1: "Empréstimo · etapa 1 (valor)",
  emprestimo_2: "Empréstimo · etapa 2 (condições)",
  emprestimo_3: "Empréstimo · etapa 3 (confirmação)",
  emprestimo_sucesso: "Empréstimo · concluído",
  pix_contatos: "Pix · contato",
  pix_valor: "Pix · valor",
  pix_confirmar: "Pix · confirmar",
  pix_sucesso: "Pix · enviado",
};

export const ORDEM_TELAS: TelaId[] = [
  "home", "pagamentos", "emprestimo_1", "emprestimo_2", "emprestimo_3", "emprestimo_sucesso",
  "pix_contatos", "pix_valor", "pix_confirmar", "pix_sucesso",
];

export const ROTULO_DESFECHO: Record<DesfechoAgente, string> = {
  sucesso: "Concluiu a tarefa",
  falha_tarefa: "Chegou ao fim do jeito errado",
  abandono: "Desistiu",
  limite_passos: "Ficou rodando (limite de passos)",
  erro_agente: "Erro do agente (resposta inválida)",
};

export function segmentoDe(r: ResultadoAgente, s: Segmentacao): string {
  const c = r.persona.cadastral;
  switch (s) {
    case "profissao":
      return ROTULO_PROFISSAO[c.profissao];
    case "faixa_etaria":
      return faixaEtaria(c.idade);
    case "literacia":
      return faixaLiteracia(c.literacia_digital);
    case "dispositivo":
      return rotuloDispositivo(r.persona);
  }
}

/** Tela em que o agente estava quando decidiu parar (ou quando tomou a ação final). */
export function telaDeParada(r: ResultadoAgente): TelaId {
  return r.passos.length ? r.passos[r.passos.length - 1].tela : r.tela_final;
}

function media(valores: number[]): number | null {
  return valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : null;
}

function estatisticaDeGrupo(segmento: string, grupo: ResultadoAgente[]): EstatisticaSegmento {
  const ok = grupo.filter((r) => r.desfecho === "sucesso");
  return {
    segmento,
    n: grupo.length,
    sucessos: ok.length,
    taxa_sucesso: grupo.length ? ok.length / grupo.length : 0,
    tempo_medio_s: media(ok.map((r) => r.tempo_total_s)),
  };
}

export function agruparPor(resultados: ResultadoAgente[], s: Segmentacao): EstatisticaSegmento[] {
  const grupos = new Map<string, ResultadoAgente[]>();
  for (const r of resultados) {
    const chave = segmentoDe(r, s);
    grupos.set(chave, [...(grupos.get(chave) ?? []), r]);
  }
  return [...grupos.entries()]
    .map(([segmento, grupo]) => estatisticaDeGrupo(segmento, grupo))
    .sort((a, b) => a.segmento.localeCompare(b.segmento, "pt-BR"));
}

export function calcularEstatisticas(sim: Pick<Simulacao, "resultados">): Estatisticas {
  const rs = sim.resultados;
  const validos = rs.filter((r) => r.desfecho !== "erro_agente"); // erro do agente não é comportamento de cliente
  const geral = estatisticaDeGrupo("Geral", validos);

  const paradas = new Map<TelaId, PontoAbandono>();
  for (const r of validos) {
    if (r.desfecho === "sucesso") continue;
    const tela = telaDeParada(r);
    const ponto = paradas.get(tela) ?? { tela, abandonos: 0, falhas: 0 };
    if (r.desfecho === "abandono") ponto.abandonos += 1;
    else ponto.falhas += 1;
    paradas.set(tela, ponto);
  }

  const desfechos = { sucesso: 0, falha_tarefa: 0, abandono: 0, limite_passos: 0, erro_agente: 0 } as Record<DesfechoAgente, number>;
  for (const r of rs) desfechos[r.desfecho] += 1;

  return {
    total: validos.length,
    sucessos: geral.sucessos,
    taxa_sucesso: geral.taxa_sucesso,
    tempo_medio_s: geral.tempo_medio_s,
    respostas_invalidas: rs.reduce((s, r) => s + r.respostas_invalidas, 0),
    erros_agente: desfechos.erro_agente,
    por_segmento: {
      profissao: agruparPor(validos, "profissao"),
      faixa_etaria: agruparPor(validos, "faixa_etaria"),
      literacia: agruparPor(validos, "literacia"),
      dispositivo: agruparPor(validos, "dispositivo"),
    },
    abandono_por_tela: [...paradas.values()].sort((a, b) => ORDEM_TELAS.indexOf(a.tela) - ORDEM_TELAS.indexOf(b.tela)),
    desfechos,
  };
}

/** Quantos agentes chegaram a cada tela (funil), na ordem do fluxo. */
export function funil(sim: Pick<Simulacao, "resultados">, telas: TelaId[]): { tela: TelaId; chegaram: number }[] {
  const validos = sim.resultados.filter((r) => r.desfecho !== "erro_agente");
  return telas.map((tela) => ({
    tela,
    chegaram: validos.filter((r) => r.tela_final === tela || r.passos.some((p) => p.tela === tela)).length,
  }));
}
