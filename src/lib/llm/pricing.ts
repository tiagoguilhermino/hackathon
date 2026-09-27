/** US$ por milhão de tokens (entrada, saída) na Groq — usado só para estimar custo no Laboratório. */
export const MODEL_PRICING: Record<string, [number, number]> = {
  "openai/gpt-oss-120b": [0.15, 0.6],
  "openai/gpt-oss-20b": [0.075, 0.3],
  "qwen/qwen3.8-27b": [0.8, 4],
};

export function estimateCostUsd(model: string | null, inputTokens: number, outputTokens: number): number | null {
  const price = model ? MODEL_PRICING[model] : undefined;
  if (!price) return null;
  return (inputTokens * price[0] + outputTokens * price[1]) / 1_000_000;
}
