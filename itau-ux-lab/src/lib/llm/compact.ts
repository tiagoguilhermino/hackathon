/** JSON compacto para prompts: arredonda números para 2 casas (menos tokens, mesma informação). */
export function compactJson(value: unknown): string {
  return JSON.stringify(value, (_key, v) => (typeof v === "number" && !Number.isInteger(v) ? Math.round(v * 100) / 100 : v));
}
