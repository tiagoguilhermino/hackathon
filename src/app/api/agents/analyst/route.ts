import { runAnalyst, type AnalystRequest } from "@/lib/agents/analyst";

export async function POST(request: Request) {
  const body = (await request.json()) as AnalystRequest;
  if (!body?.stats || !body.screens) {
    return Response.json({ error: "stats e screens são obrigatórios." }, { status: 400 });
  }
  try {
    return Response.json(await runAnalyst(body));
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
