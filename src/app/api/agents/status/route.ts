import { LLM_MODEL, getLlmMode } from "@/lib/llm/client";

/** GET: modo padrão do servidor, modelo configurado e se há chave da Groq (o Laboratório pode alternar o modo). */
export async function GET() {
  return Response.json({ mode: getLlmMode(), model: LLM_MODEL, hasKey: Boolean(process.env.GROQ_API_KEY) });
}
