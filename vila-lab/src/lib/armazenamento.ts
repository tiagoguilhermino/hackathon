/**
 * Guarda simulações e decisões no navegador (localStorage). É o registro local do
 * protótipo: para guardar de verdade, baixe o JSON. Tudo protegido por try/catch
 * (navegador anônimo ou armazenamento cheio não quebram a tela).
 */

import type { DecisaoHumana, Simulacao } from "./tipos";

const CHAVE_SIMULACOES = "vila-lab:simulacoes";
const CHAVE_DECISOES = "vila-lab:decisoes";
const MAX_SIMULACOES = 8;

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

export function listarSimulacoes(): Simulacao[] {
  return ler<Simulacao[]>(CHAVE_SIMULACOES, []);
}

/** Guarda a simulação no topo da lista; se não couber, vai descartando as mais antigas. */
export function salvarSimulacao(sim: Simulacao): boolean {
  let lista = [sim, ...listarSimulacoes().filter((s) => s.id !== sim.id)].slice(0, MAX_SIMULACOES);
  while (lista.length > 0) {
    if (gravar(CHAVE_SIMULACOES, lista)) return true;
    lista = lista.slice(0, -1);
  }
  return false;
}

export function obterSimulacao(id: string): Simulacao | undefined {
  return listarSimulacoes().find((s) => s.id === id);
}

export function listarDecisoes(): DecisaoHumana[] {
  return ler<DecisaoHumana[]>(CHAVE_DECISOES, []);
}

/** O registro de decisões só cresce: acrescenta no fim, nunca reescreve o que já está lá. */
export function registrarDecisao(decisao: DecisaoHumana): boolean {
  return gravar(CHAVE_DECISOES, [...listarDecisoes(), decisao]);
}
