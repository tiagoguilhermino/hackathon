/**
 * Agente designer (modo simulado): para cada achado com tela, olha a árvore daquela tela
 * e propõe uma mudança pequena e acionável. Nada é aplicado sozinho: cada proposta passa
 * pela revisão de uma pessoa (designer ou PO), e a decisão fica registrada.
 */

import { ROTULO_TELA } from "../estatisticas";
import type { Achado, ArvoreAcessibilidade, Proposta, TelaId } from "../tipos";
import { normalizar, PALAVRAS_DE_MENU, PALAVRAS_DE_RECORRENCIA } from "./texto";

/** Troca de jargão por linguagem de cliente. */
export const TROCAS_DE_JARGAO: Record<string, string> = {
  CET: "Custo total do empréstimo",
  IOF: "imposto (já incluído)",
  Selic: "juros básicos do país",
  spread: "margem do banco",
  "a.m.": "por mês",
  "a.a.": "por ano",
  "a.d.": "por dia",
  amortização: "forma de pagar",
  Price: "parcelas iguais",
  "pós-fixada": "que pode mudar",
  nominal: "(tirar a palavra)",
  encargos: "custos",
  CCB: "contrato",
  SCR: "consulta ao Banco Central",
  "Sistema de Informações de Crédito": "consulta ao Banco Central",
  indexad: "que acompanha",
};

function contarPalavras(a: ArvoreAcessibilidade): number {
  return a.textos.join(" ").split(/\s+/).filter(Boolean).length;
}

function propostasParaTela(achado: Achado, tela: TelaId, a: ArvoreAcessibilidade): Omit<Proposta, "id">[] {
  const nome = ROTULO_TELA[tela];
  const quem = achado.segmento ? ` de ${achado.segmento.split(": ")[1]}` : "";
  const hipotese = (efeito: string) =>
    `Hipótese: ${efeito}${quem} em "${nome}". Precisa de teste com pessoas antes de adotar.`;
  const lista: Omit<Proposta, "id">[] = [];

  if (a.jargoes.length) {
    const trocas = a.jargoes
      .slice(0, 5)
      .map((j) => `"${j}" → "${TROCAS_DE_JARGAO[j] ?? "termo simples"}"`)
      .join("; ");
    lista.push({
      achado_id: achado.id,
      tela,
      elemento: "textos da tela",
      problema: `A tela usa ${a.jargoes.length} termos técnicos (${a.jargoes.slice(0, 4).join(", ")}…).`,
      proposta: `Trocar o jargão por linguagem de cliente: ${trocas}. Mostrar primeiro quanto recebe, quanto paga por mês e o total.`,
      justificativa: `Carga cognitiva da tela: ${a.carga_cognitiva.toFixed(2)} (0 a 1). ${achado.evidencia}`,
      hipotese_de_impacto: hipotese("deve reduzir desistências"),
      esforco: "baixo",
    });
  }

  for (const e of a.elementos.filter((x) => x.contraste_baixo && x.habilitado !== false)) {
    lista.push({
      achado_id: achado.id,
      tela,
      elemento: e.action_id,
      problema: `O botão "${e.rotulo}" tem contraste abaixo do mínimo WCAG AA e ${e.posicao.altura}px de altura.`,
      proposta: `Transformar "${e.rotulo}" em botão principal: fundo laranja, texto azul-escuro em negrito, altura mínima de 44px e largura total, logo abaixo do aceite.`,
      justificativa: `Contraste baixo e alvo pequeno fazem o botão passar despercebido. ${achado.evidencia}`,
      hipotese_de_impacto: hipotese("deve aumentar a conclusão"),
      esforco: "baixo",
    });
  }

  const recorrenciaSoIcone = a.elementos.find(
    (e) => !e.texto_visivel && PALAVRAS_DE_RECORRENCIA.some((w) => normalizar(e.rotulo).includes(w)),
  );
  if (recorrenciaSoIcone) {
    lista.push({
      achado_id: achado.id,
      tela,
      elemento: recorrenciaSoIcone.action_id,
      problema: `A opção "${recorrenciaSoIcone.rotulo}" é só um ícone, sem texto.`,
      proposta: `Colocar o texto "Repetir todo mês" ao lado do ícone (${recorrenciaSoIcone.action_id}).`,
      justificativa: `Ícone sem rótulo depende de familiaridade digital. ${achado.evidencia}`,
      hipotese_de_impacto: hipotese("deve aumentar quem acha a opção"),
      esforco: "baixo",
    });
  }

  const menu = a.elementos.find((e) => PALAVRAS_DE_MENU.some((w) => normalizar(e.rotulo).includes(w)));
  const recorrenciaVisivel = a.elementos.some((e) => PALAVRAS_DE_RECORRENCIA.some((w) => normalizar(e.rotulo).includes(w)));
  if (menu && !recorrenciaVisivel && tela === "pix_confirmar") {
    lista.push({
      achado_id: achado.id,
      tela,
      elemento: menu.action_id,
      problema: `"Repetir todo mês" fica escondido dentro de "${menu.rotulo}".`,
      proposta: "Mostrar \"Repetir todo mês\" direto na tela de confirmação, antes do botão de enviar.",
      justificativa: `Opção escondida em menu só é achada por quem explora a tela. ${achado.evidencia}`,
      hipotese_de_impacto: hipotese("deve aumentar quem agenda o Pix mensal"),
      esforco: "medio",
    });
  }

  if (!lista.length && contarPalavras(a) > 60) {
    lista.push({
      achado_id: achado.id,
      tela,
      elemento: "textos da tela",
      problema: `A tela tem ${contarPalavras(a)} palavras de texto corrido.`,
      proposta: "Resumir em até 3 frases curtas e mover o texto legal para \"Ver contrato completo\".",
      justificativa: achado.evidencia,
      hipotese_de_impacto: hipotese("deve reduzir o tempo e as desistências"),
      esforco: "baixo",
    });
  }
  return lista;
}

export function proporMock(achados: Achado[], arvores: Partial<Record<TelaId, ArvoreAcessibilidade>>): Proposta[] {
  const vistas = new Set<string>();
  const propostas: Omit<Proposta, "id">[] = [];
  for (const achado of achados) {
    if (!achado.tela) continue;
    const arvore = arvores[achado.tela];
    if (!arvore) continue;
    for (const p of propostasParaTela(achado, achado.tela, arvore)) {
      const chave = `${p.tela}|${p.elemento}|${p.proposta.slice(0, 30)}`;
      if (vistas.has(chave)) continue;
      vistas.add(chave);
      propostas.push(p);
    }
  }
  return propostas.map((p, i) => ({ ...p, id: `D${i + 1}` }));
}
