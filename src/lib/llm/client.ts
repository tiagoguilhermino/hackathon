/**
 * Camada de acesso ao LLM. Nesta iteração todas as chamadas são simuladas
 * (setTimeout + respostas mockadas); `LLM_MODE=live` será conectado depois.
 */
export type LlmMode = "mock" | "live";

export interface LlmPrompt {
  system: string;
  user: string;
}

export function getLlmMode(): LlmMode {
  return process.env.LLM_MODE === "live" ? "live" : "mock";
}

export function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export const DEFAULT_MOCK_LATENCY_MS = Number(process.env.MOCK_LLM_LATENCY_MS ?? 350);

export async function callLLM(prompt: LlmPrompt): Promise<string> {
  void prompt;
  throw new Error("LLM_MODE=live ainda não está conectado a um provedor. Use LLM_MODE=mock.");
}

/** Extrai o primeiro objeto JSON de uma resposta textual do modelo. */
export function parseJsonResponse<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Resposta do LLM sem JSON");
  return JSON.parse(text.slice(start, end + 1)) as T;
}
