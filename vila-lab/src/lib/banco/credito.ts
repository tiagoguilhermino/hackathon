/** Conta do empréstimo fictício (tabela Price). Valores de demonstração, não é oferta. */

export const TAXA_MENSAL = 0.0199;

export function valorParcela(valor: number, parcelas: number, taxa = TAXA_MENSAL): number {
  return (valor * taxa) / (1 - (1 + taxa) ** -parcelas);
}

export function custoTotal(valor: number, parcelas: number, taxa = TAXA_MENSAL): number {
  return valorParcela(valor, parcelas, taxa) * parcelas;
}
