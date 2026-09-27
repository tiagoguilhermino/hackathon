import { LLM_MODEL, getLlmMode } from "@/lib/llm/client";

/** GET: informa ao Laboratório se os agentes estão em modo real (Groq) ou mock. */
export async function GET() {
  const mode = getLlmMode();
  return Response.json({ mode, model: mode === "live" ? LLM_MODEL : null, hasKey: Boolean(process.env.GROQ_API_KEY) });
}
