/**
 * Empréstimos do Lume (tudo fictício: taxas, limite e contratos).
 *
 * Os produtos e os campos do contrato seguem o padrão público do Open Finance Brasil que a
 * pesquisa do time levantou (output/rodada-1/00-consolidado.md, U23 e U24): crédito pessoal
 * sem e com consignação, parcelas mensais, sistema PRICE, taxa ao mês e ao ano, IOF de
 * contratação e CET (custo efetivo total).
 */

// Com a extensão, para o Node também conseguir rodar os testes (o tsconfig permite).
import { HOJE_FICTICIO, somarDias } from "./pagamentos.ts";

export const EMPRESTIMO_PESSOAL = {
  nome: "Empréstimo pessoal",
  taxaMensal: 0.0349,
  valorMinimo: 500,
  /** Limite pré-aprovado do cliente fictício. */
  valorMaximo: 15000,
  parcelas: [6, 12, 18, 24, 36] as readonly number[],
  valoresRapidos: [1000, 3000, 5000, 10000] as readonly number[],
};

export const CONSIGNADO = {
  nome: "Empréstimo consignado",
  publico: "Para aposentados e pensionistas do INSS e servidores públicos com convênio.",
  motivoIndisponivel:
    "Não encontramos margem consignável no seu CPF. O consignado depende de um convênio com quem paga seu benefício ou salário.",
};

// IOF de crédito de pessoa física: 0,38% fixo + 0,0082% ao dia sobre cada amortização, até 365 dias.
// Aqui é só uma estimativa dentro de uma simulação fictícia.
const IOF_FIXO = 0.0038;
const IOF_POR_DIA = 0.000082;

export type Simulacao = {
  valor: number;
  parcelas: number;
  taxaMensal: number;
  taxaAnual: number;
  iof: number;
  valorFinanciado: number;
  parcela: number;
  totalAPagar: number;
  cetMensal: number;
  cetAnual: number;
  primeiroVencimento: string;
};

export type Contrato = Simulacao & { numero: string; contratadoEm: string };

const arredondar = (valor: number) => Math.round(valor * 100) / 100;

/** Parcela fixa do sistema PRICE. */
export function prestacao(valor: number, taxa: number, parcelas: number): number {
  return taxa === 0 ? valor / parcelas : (valor * taxa) / (1 - (1 + taxa) ** -parcelas);
}

/** Taxa mensal que iguala o valor recebido às parcelas pagas (é assim que se calcula o CET). */
export function taxaInterna(valor: number, parcela: number, parcelas: number): number {
  const valorPresente = (taxa: number) => (parcela * (1 - (1 + taxa) ** -parcelas)) / taxa;
  let baixa = 1e-9;
  let alta = 1;
  for (let i = 0; i < 200; i += 1) {
    const meio = (baixa + alta) / 2;
    if (valorPresente(meio) > valor) baixa = meio;
    else alta = meio;
  }
  return (baixa + alta) / 2;
}

export type ErroDeSimulacao = { erro: string };

export function validarPedido(valor: number, parcelas: number): ErroDeSimulacao | null {
  const { valorMinimo, valorMaximo } = EMPRESTIMO_PESSOAL;
  if (!Number.isFinite(valor) || valor <= 0) return { erro: "Digite quanto você quer pedir." };
  if (valor < valorMinimo)
    return { erro: `O valor mínimo é R$ ${valorMinimo.toLocaleString("pt-BR")}.` };
  if (valor > valorMaximo) {
    return { erro: `Seu limite pré-aprovado é R$ ${valorMaximo.toLocaleString("pt-BR")}.` };
  }
  if (!EMPRESTIMO_PESSOAL.parcelas.includes(parcelas)) return { erro: "Escolha em quantas vezes." };
  return null;
}

export function simularEmprestimo(
  valor: number,
  parcelas: number,
  taxaMensal: number = EMPRESTIMO_PESSOAL.taxaMensal,
): Simulacao {
  // IOF sobre a amortização de cada parcela do valor pedido (a parcela k vence em 30·k dias).
  const parcelaBase = prestacao(valor, taxaMensal, parcelas);
  let saldo = valor;
  let iofDiario = 0;
  for (let k = 1; k <= parcelas; k += 1) {
    const amortizacao = parcelaBase - saldo * taxaMensal;
    saldo -= amortizacao;
    iofDiario += amortizacao * IOF_POR_DIA * Math.min(30 * k, 365);
  }
  const iof = arredondar(valor * IOF_FIXO + iofDiario);
  const valorFinanciado = arredondar(valor + iof);
  const parcela = arredondar(prestacao(valorFinanciado, taxaMensal, parcelas));
  const cetMensal = taxaInterna(valor, parcela, parcelas);
  return {
    valor,
    parcelas,
    taxaMensal,
    taxaAnual: (1 + taxaMensal) ** 12 - 1,
    iof,
    valorFinanciado,
    parcela,
    totalAPagar: arredondar(parcela * parcelas),
    cetMensal,
    cetAnual: (1 + cetMensal) ** 12 - 1,
    primeiroVencimento: somarDias(HOJE_FICTICIO, 30),
  };
}

export function contratar(simulacao: Simulacao, contratosAnteriores: number): Contrato {
  return {
    ...simulacao,
    numero: `EP-2026-${String(1 + contratosAnteriores).padStart(4, "0")}`,
    contratadoEm: HOJE_FICTICIO,
  };
}

/** 0,0349 → "3,49%". */
export function formatarTaxa(taxa: number): string {
  return `${(taxa * 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}
