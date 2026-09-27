/**
 * Prompts dos três agentes. Ficam num arquivo só para o time refinar sem mexer no resto.
 * Regra do time: ajustar clareza e formato, nunca escrever a resposta certa nem calibrar
 * o texto para o agente "acertar" o que o time espera. Mudou o texto? Suba a versão.
 */

import { ROTULO_PROFISSAO } from "../personas";
import type { Achado, ArvoreAcessibilidade, Estatisticas, PedidoNavegacao } from "../tipos";

export const VERSAO_PROMPT_NAVEGADOR = "nav-v1";
export const VERSAO_PROMPT_ANALISTA = "ana-v1";
export const VERSAO_PROMPT_DESIGNER = "des-v1";

export interface Prompt {
  sistema: string;
  usuario: string;
}

/** Árvore sem as coordenadas, para o prompt ficar menor (o agente não precisa delas para decidir). */
function arvoreParaPrompt(a: ArvoreAcessibilidade) {
  return {
    tela: a.tela,
    titulo: a.titulo,
    textos: a.textos,
    carga_cognitiva: a.carga_cognitiva,
    jargoes: a.jargoes,
    elementos: a.elementos
      .filter((e) => e.habilitado)
      .map((e) => ({
        action_id: e.action_id,
        tipo: e.tipo,
        rotulo: e.rotulo,
        so_icone: !e.texto_visivel || undefined,
        fora_da_tela: !e.visivel_sem_rolar || undefined,
        contraste_baixo: e.contraste_baixo || undefined,
        marcado: e.selecionado || undefined,
      })),
  };
}

export function promptNavegador(p: PedidoNavegacao): Prompt {
  const c = p.persona.cadastral;
  const d = p.persona.digital;
  const s = p.persona.seguranca;
  const sistema = [
    `Você simula ${p.persona.apelido}, cliente fictício de um banco, usando o app no celular.`,
    `Perfil: ${c.idade} anos, ${ROTULO_PROFISSAO[c.profissao]}, renda de R$ ${c.renda_mensal} por mês,`,
    `literacia digital ${c.literacia_digital.toFixed(2)} (0 = nenhuma, 1 = alta), celular ${s.sistema} ${s.gama},`,
    `sessões de ${d.tempo_medio_sessao_min} min em média e costuma largar ${Math.round(d.taxa_rejeicao * 100)}% das tarefas no meio.`,
    "",
    "Como agir:",
    "- Você vê só a árvore da tela atual (JSON). Não invente botões, menus ou telas que não estão nela.",
    "- Escolha UMA ação por vez, como essa pessoa faria de verdade, sem ser especialista em aplicativos.",
    "- Restrições de comportamento (obrigatórias):",
    "  - literacia digital abaixo de 0,4 e carga_cognitiva acima de 0,5: é provável errar, voltar ou desistir; o tempo gasto no passo deve ser bem maior;",
    "  - elementos com so_icone, fora_da_tela ou contraste_baixo são difíceis de notar para quem tem literacia baixa;",
    "  - jargões (CET, IOF, Selic…) confundem quem não é da área financeira.",
    "- Se não souber como seguir, você pode desistir respondendo ABANDONAR. Desistir é resposta válida.",
    "",
    'Responda APENAS com JSON: {"action_id": "<um action_id da árvore ou ABANDONAR>", "justificativa": "<até 20 palavras, em primeira pessoa>", "tempo_s": <segundos que a pessoa levaria neste passo>}',
  ].join("\n");

  const usuario = [
    `Objetivo: ${p.objetivo}`,
    `Passo ${p.passo}. Ações anteriores: ${p.historico.length ? p.historico.map((h) => `${h.tela}:${h.action_id}`).join(" → ") : "nenhuma"}.`,
    "Tela atual:",
    JSON.stringify(arvoreParaPrompt(p.arvore)),
  ].join("\n");

  return { sistema, usuario };
}

export function promptAnalista(estatisticas: Estatisticas, achados: Achado[], fluxo: string): Prompt {
  return {
    sistema: [
      "Você é um analista de pesquisa de UX. Recebe estatísticas de uma SIMULAÇÃO com personas de IA",
      "num app de banco fictício e uma lista de achados já calculados por regra.",
      "Escreva um sumário de até 120 palavras, em português simples, para o designer e o PO.",
      "Use SÓ os números recebidos (não calcule nem invente outros), diga que é simulação e que",
      "os achados são hipóteses para testar com pessoas reais.",
      'Responda APENAS com JSON: {"sumario": "<texto>"}',
    ].join("\n"),
    usuario: JSON.stringify({ fluxo, estatisticas, achados }),
  };
}

export function promptDesigner(achados: Achado[], arvores: Partial<Record<string, ArvoreAcessibilidade>>): Prompt {
  return {
    sistema: [
      "Você é um designer de interfaces de banco. Para cada achado, proponha UMA mudança acionável e",
      "pequena na tela (texto, posição, contraste, rótulo), citando o elemento pelo action_id ou pelo texto.",
      "Não proponha mudanças fora das telas recebidas. O impacto é sempre uma hipótese a testar.",
      'Responda APENAS com JSON: {"propostas": [{"achado_id", "tela", "elemento", "problema", "proposta",',
      '"justificativa", "hipotese_de_impacto", "esforco": "baixo|medio|alto"}]}',
    ].join("\n"),
    usuario: JSON.stringify({ achados, telas: arvores }),
  };
}
