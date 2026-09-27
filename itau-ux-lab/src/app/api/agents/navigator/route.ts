import { runNavigator } from "@/lib/agents/navigator";
import { FLOWS } from "@/lib/bank/flows";
import type { NavigatorRequest } from "@/types/simulation";

/** POST: recebe a árvore da tela + persona e devolve a próxima ação (ou ABANDONAR). */
export async function POST(request: Request) {
  const body = (await request.json()) as NavigatorRequest;
  if (!body?.tree?.actions || !body.persona || !FLOWS[body.flowId]) {
    return Response.json({ error: "Requisição inválida: tree, persona e flowId são obrigatórios." }, { status: 400 });
  }
  try {
    return Response.json(await runNavigator(body));
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
