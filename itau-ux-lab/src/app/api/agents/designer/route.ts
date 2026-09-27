import { runDesigner, type DesignerRequest } from "@/lib/agents/designer";

export async function POST(request: Request) {
  const body = (await request.json()) as DesignerRequest;
  if (!body?.analyst || !body.stats || !body.screens) {
    return Response.json({ error: "analyst, stats e screens são obrigatórios." }, { status: 400 });
  }
  try {
    return Response.json(await runDesigner(body));
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 502 });
  }
}
