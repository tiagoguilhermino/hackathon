import { configLLM } from "@/lib/agentes/llm";

/** Diz ao painel se a IA está simulada ou ligada (nunca devolve a chave). */
export async function GET() {
  const { modo, modelo } = configLLM();
  return Response.json({ modo, modelo });
}
