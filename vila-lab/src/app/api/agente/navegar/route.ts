import { chamarGroq, configLLM, ErroLLM, esperar } from "@/lib/agentes/llm";
import { MODELO_MOCK, navegarMock } from "@/lib/agentes/politicaMock";
import { promptNavegador, VERSAO_PROMPT_NAVEGADOR } from "@/lib/agentes/prompts";
import { ABANDONAR, type PedidoNavegacao, type RespostaNavegacao } from "@/lib/tipos";

type Corpo = PedidoNavegacao & { tentativa?: number; atraso_mock_ms?: number };

/**
 * Um passo do agente navegador: recebe a árvore da tela e o perfil, devolve UMA ação.
 * O servidor confere a resposta: action_id fora da árvore (ou desabilitado) é inválido.
 */
export async function POST(request: Request) {
  const inicio = Date.now();
  let pedido: Corpo;
  try {
    pedido = (await request.json()) as Corpo;
  } catch {
    return Response.json({ erro: "Pedido inválido: o corpo precisa ser JSON." }, { status: 400 });
  }
  if (!pedido?.persona || !pedido?.arvore?.elementos) {
    return Response.json({ erro: "Faltam a persona ou a árvore da tela." }, { status: 400 });
  }

  const prompt = promptNavegador(pedido);
  const { modo, modelo } = configLLM();
  let decisao: { action_id: string; justificativa: string; tempo_s: number };
  try {
    if (modo === "groq") {
      const bruto = (await chamarGroq(prompt, 300)) as Partial<typeof decisao>;
      decisao = {
        action_id: String(bruto.action_id ?? ""),
        justificativa: String(bruto.justificativa ?? ""),
        tempo_s: Number(bruto.tempo_s) || 0,
      };
    } else {
      // Primeira iteração: IA simulada com setTimeout e resposta por regra.
      await esperar(Math.min(2000, Math.max(0, pedido.atraso_mock_ms ?? 250)));
      decisao = navegarMock(pedido);
    }
  } catch (erro) {
    const mensagem = erro instanceof ErroLLM ? erro.message : "Falha inesperada ao chamar a IA.";
    return Response.json({ erro: mensagem }, { status: 502 });
  }

  const permitidos = new Set(pedido.arvore.elementos.filter((e) => e.habilitado).map((e) => e.action_id));
  const valida = decisao.action_id === ABANDONAR || permitidos.has(decisao.action_id);
  const resposta: RespostaNavegacao = {
    ...decisao,
    tempo_s: Math.max(0.5, Math.min(300, decisao.tempo_s || 1)),
    valida,
    modelo: modo === "groq" ? modelo : MODELO_MOCK,
    versao_prompt: VERSAO_PROMPT_NAVEGADOR,
    latencia_ms: Date.now() - inicio,
    prompt: pedido.incluir_prompt ? `${prompt.sistema}\n\n---\n\n${prompt.usuario}` : undefined,
  };
  return Response.json(resposta);
}
