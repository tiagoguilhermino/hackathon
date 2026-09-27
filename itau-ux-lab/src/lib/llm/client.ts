import Groq from "groq-sdk";
import * as z from "zod/v4";
import { PROJECT_GROQ_KEYS } from "./keys";

/**
 * Camada de acesso ao LLM (Groq, via SDK oficial `groq-sdk`).
 *
 * Modo:
 * - `LLM_MODE=live`  → sempre chama a API (exige uma chave)
 * - `LLM_MODE=mock`  → respostas simuladas (setTimeout), sem custo
 * - não definido     → live se houver chave, senão mock
 *
 * Chave: a GROQ_API_KEY do .env.local, se houver; senão as chaves do projeto (keys.ts).
 */
export type LlmMode = "mock" | "live";

export interface LlmPrompt {
  system: string;
  user: string;
}

export interface LlmUsage {
  inputTokens: number;
  outputTokens: number;
}

export const LLM_MODEL = process.env.LLM_MODEL ?? "openai/gpt-oss-120b";

/** Modelos com Structured Outputs estrito (decodificação restrita ao schema) na Groq. */
const STRICT_SCHEMA_MODELS = new Set(["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]);

/** Modo padrão do servidor (usado quando o cliente não escolhe um). */
export function getLlmMode(): LlmMode {
  if (process.env.LLM_MODE === "mock") return "mock";
  if (process.env.LLM_MODE === "live") return "live";
  return hasApiKey() ? "live" : "mock";
}

/** Chaves em uso, na ordem de preferência: a do .env.local ou as do projeto. */
const API_KEYS: readonly string[] = process.env.GROQ_API_KEY ? [process.env.GROQ_API_KEY] : PROJECT_GROQ_KEYS;

export function hasApiKey(): boolean {
  return API_KEYS.length > 0;
}

/** Modo efetivo de uma requisição: a escolha do usuário no Laboratório prevalece. */
export function resolveLlmMode(requested?: LlmMode): LlmMode {
  return requested === "mock" || requested === "live" ? requested : getLlmMode();
}

export function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

export const DEFAULT_MOCK_LATENCY_MS = Number(process.env.MOCK_LLM_LATENCY_MS ?? 350);

const clients: (Groq | undefined)[] = [];
let keyIndex = 0;
function getClient(): Groq {
  // Retentativas cobrem 429/5xx residuais; o controle de vazão abaixo evita a maioria dos 429.
  clients[keyIndex] ??= new Groq({ apiKey: API_KEYS[keyIndex], maxRetries: 6 });
  return clients[keyIndex]!;
}

/**
 * Chave recusada (revogada), limite esgotado mesmo depois das retentativas, ou pedido maior que o
 * saldo de tokens do minuto (413): passa para a próxima chave, se houver, e zera o controle de
 * vazão (o limite é por chave).
 */
function switchKey(err: unknown): boolean {
  const keyProblem =
    err instanceof Groq.AuthenticationError || err instanceof Groq.RateLimitError || (err instanceof Groq.APIError && err.status === 413);
  if (!keyProblem || keyIndex >= API_KEYS.length - 1) return false;
  keyIndex += 1;
  tpm.limit = 0;
  return true;
}

// ---------------------------------------------------------------------------
// Controle de vazão por tokens/minuto (TPM)
// A Groq devolve o limite e o saldo em headers; o saldo recarrega linearmente
// (limite/60 por segundo). Antes de cada chamada, esperamos até haver saldo
// para a estimativa da requisição, em fila, para não disparar 429 em cascata.
// ---------------------------------------------------------------------------

const tpm = { limit: 0, remaining: 0, at: 0 };
let queue: Promise<void> = Promise.resolve();

function availableTokens(now: number): number {
  const refill = ((now - tpm.at) / 60_000) * tpm.limit;
  return Math.min(tpm.limit, tpm.remaining + refill);
}

function acquireTokens(estimate: number): Promise<void> {
  const turn = queue.then(async () => {
    if (!tpm.limit) return; // ainda sem headers: a primeira chamada passa direto
    const needed = Math.min(estimate, tpm.limit);
    for (;;) {
      const now = Date.now();
      const available = availableTokens(now);
      if (available >= needed) {
        tpm.remaining = available - needed;
        tpm.at = now;
        return;
      }
      await simulateLatency(((needed - available) / tpm.limit) * 60_000 + 100);
    }
  });
  queue = turn.catch(() => undefined);
  return turn;
}

function recordRateLimit(headers: Headers): void {
  const limit = Number(headers.get("x-ratelimit-limit-tokens"));
  const remaining = Number(headers.get("x-ratelimit-remaining-tokens"));
  if (!limit || Number.isNaN(remaining)) return;
  tpm.limit = limit;
  tpm.remaining = remaining;
  tpm.at = Date.now();
}

/** Estimativa grosseira de tokens (PT-BR + JSON ≈ 3 caracteres por token) + saída esperada. */
const estimateTokens = (text: string, effort: CallOptions<z.ZodType>["effort"]) =>
  Math.ceil(text.length / 3) + (effort === "low" ? 300 : 2500);

export class LlmError extends Error {}

const MAX_SCHEMA_RETRIES = 2;

/**
 * Converte o schema Zod em JSON Schema no formato exigido pelo modo estrito:
 * todo objeto com `additionalProperties: false` e todas as chaves em `required`.
 */
export function toStrictJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema) as Record<string, unknown>;
  delete json.$schema;
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (obj.type === "object" && obj.properties) {
      obj.additionalProperties = false;
      obj.required = Object.keys(obj.properties as object);
    }
    Object.values(obj).forEach(walk);
  };
  walk(json);
  return json;
}

interface CallOptions<S extends z.ZodType> {
  prompt: LlmPrompt;
  schema: S;
  schemaName: string;
  effort: "low" | "medium" | "high";
  maxTokens?: number;
}

/** Chamada única ao LLM com saída JSON validada pelo schema Zod. */
export async function callLLM<S extends z.ZodType>({
  prompt,
  schema,
  schemaName,
  effort,
  maxTokens = 8000,
}: CallOptions<S>): Promise<{ data: z.infer<S>; usage: LlmUsage; model: string }> {
  if (!hasApiKey()) throw new LlmError("Nenhuma chave da Groq: preencha GROQ_API_KEY no .env.local.");
  const jsonSchema = toStrictJsonSchema(schema);
  const strict = STRICT_SCHEMA_MODELS.has(LLM_MODEL);
  const system = strict
    ? prompt.system
    : `${prompt.system}\n\nResponda somente com um objeto JSON que siga este JSON Schema:\n${JSON.stringify(jsonSchema)}`;

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    { role: "user", content: prompt.user },
  ];

  // A Groq valida o schema após gerar: se o modelo sair do schema (ex.: uma ação
  // que não existe na tela), devolvemos o erro a ele e pedimos uma nova resposta.
  for (let attempt = 0; ; attempt++) {
    await acquireTokens(estimateTokens(messages.map((m) => m.content).join(""), effort));
    let completion;
    try {
      const { data, response } = await getClient()
        .chat.completions.create({
          model: LLM_MODEL,
          max_completion_tokens: maxTokens,
          messages,
          response_format: strict
            ? { type: "json_schema", json_schema: { name: schemaName, strict: true, schema: jsonSchema } }
            : { type: "json_object" },
          ...(LLM_MODEL.startsWith("openai/gpt-oss") && { reasoning_effort: effort }),
        })
        .withResponse();
      recordRateLimit(response.headers);
      completion = data;
    } catch (err) {
      if (switchKey(err)) {
        attempt -= 1; // trocar de chave não conta como tentativa de corrigir o schema
        continue;
      }
      if (err instanceof Groq.APIError && err.headers) recordRateLimit(err.headers);
      const body = err instanceof Groq.APIError ? (err.error as { error?: { code?: string; message?: string } } | undefined) : undefined;
      if (body?.error?.code === "json_validate_failed" && attempt < MAX_SCHEMA_RETRIES) {
        messages.push({ role: "user", content: `Sua resposta anterior foi rejeitada: ${body.error.message} Responda novamente respeitando o schema.` });
        continue;
      }
      // Às vezes o modelo escreve o raciocínio em texto solto em vez do JSON: pede de novo.
      if (body?.error?.code === "output_parse_failed" && attempt < MAX_SCHEMA_RETRIES) {
        messages.push({ role: "user", content: "Sua resposta anterior não veio no formato pedido. Responda somente com o objeto JSON, sem texto antes ou depois." });
        continue;
      }
      if (err instanceof Groq.AuthenticationError) throw new LlmError("Chave da Groq recusada (inválida ou revogada): confira src/lib/llm/keys.ts ou o .env.local.");
      if (err instanceof Groq.RateLimitError) throw new LlmError(`Limite da Groq atingido: ${err.message}`);
      if (err instanceof Groq.APIError && err.status === 413) throw new LlmError(`Prompt maior que o limite de tokens/minuto do plano Groq. (${err.message})`);
      if (err instanceof Groq.APIError) throw new LlmError(`Erro da API Groq (${err.status}): ${err.message}`);
      throw err;
    }

    const choice = completion.choices[0];
    if (choice?.finish_reason === "length") throw new LlmError("Resposta truncada (max_completion_tokens).");
    const content = choice?.message.content;
    if (!content) throw new LlmError("Resposta vazia do modelo.");

    const parsed = schema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      if (attempt < MAX_SCHEMA_RETRIES) {
        messages.push({ role: "assistant", content }, { role: "user", content: `Resposta fora do schema: ${parsed.error.message}. Corrija.` });
        continue;
      }
      throw new LlmError(`Resposta fora do schema: ${parsed.error.message}`);
    }

    return {
      data: parsed.data,
      usage: {
        inputTokens: completion.usage?.prompt_tokens ?? 0,
        outputTokens: completion.usage?.completion_tokens ?? 0,
      },
      model: completion.model,
    };
  }
}
