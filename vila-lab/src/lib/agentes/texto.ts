/** Normalização de texto para comparar rótulos e objetivos sem acento, caixa ou pontuação. */

const VAZIAS = new Set([
  "a", "o", "as", "os", "de", "da", "do", "das", "dos", "e", "em", "no", "na", "para", "por", "com",
  "um", "uma", "que", "se", "r", "me", "meu", "minha", "este", "esta", "deixar", "todo", "pagar",
]);

/** Sinônimos que uma pessoa associaria ao objetivo. Não aponta a resposta: só amplia o vocabulário. */
const SINONIMOS: Record<string, string[]> = {
  repetindo: ["repetir", "repita", "repete", "automatizar", "mensal", "recorrente"],
  mes: ["mensal", "meses"],
  emprestimo: ["credito", "emprestimo"],
  parcelas: ["parcelas", "12x", "vezes"],
};

export function normalizar(texto: string): string {
  return texto
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/(\d)\.(\d{3})/g, "$1$2") // 3.000 → 3000
    .replace(/,00\b/g, "")
    .replace(/(\d+)([a-z]+)/g, "$1 $2") // 12x → 12 x
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function palavras(texto: string): string[] {
  return normalizar(texto)
    .split(" ")
    .filter((p) => p.length > 1 && !VAZIAS.has(p));
}

export function vocabularioDoObjetivo(objetivo: string): Set<string> {
  const base = palavras(objetivo);
  const extra = base.flatMap((p) => SINONIMOS[p] ?? []);
  return new Set([...base, ...extra]);
}

export const PALAVRAS_DE_AVANCO = ["continuar", "confirmar", "enviar", "contratar", "proximo", "concluir"];
export const PALAVRAS_DE_RECUO = ["voltar", "fechar", "cancelar", "sair"];
export const PALAVRAS_DE_MENU = ["mais opcoes", "opcoes", "menu", "ver mais"];
export const PALAVRAS_DE_RECORRENCIA = ["repetir", "repita", "repetindo", "automatizar", "mensal", "recorrente", "todo mes"];
