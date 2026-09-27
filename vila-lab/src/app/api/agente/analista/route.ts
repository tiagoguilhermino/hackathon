import { gerarAchados, sumarioMock } from "@/lib/agentes/analista";
import { chamarGroq, configLLM, ErroLLM, esperar } from "@/lib/agentes/llm";
import { promptAnalista, VERSAO_PROMPT_ANALISTA } from "@/lib/agentes/prompts";
import { FLUXOS } from "@/lib/banco/fluxos";
import { calcularEstatisticas } from "@/lib/estatisticas";
import type { RelatorioAnalista, Simulacao } from "@/lib/tipos";

/** Agente analista: estatísticas e achados por código; o texto do sumário, pela IA (ou mock). */
export async function POST(request: Request) {
  let sim: Simulacao;
  try {
    sim = (await request.json()) as Simulacao;
  } catch {
    return Response.json({ erro: "Pedido inválido: envie a simulação em JSON." }, { status: 400 });
  }
  if (!Array.isArray(sim?.resultados) || sim.resultados.length === 0) {
    return Response.json({ erro: "A simulação não tem resultados para analisar." }, { status: 400 });
  }

  const estatisticas = calcularEstatisticas(sim);
  const achados = gerarAchados(estatisticas, sim.resultados);
  const nomeFluxo = FLUXOS[sim.config.fluxo]?.nome ?? sim.config.fluxo;
  const { modo, modelo } = configLLM();

  let sumario: string;
  try {
    if (modo === "groq") {
      const bruto = (await chamarGroq(promptAnalista(estatisticas, achados, nomeFluxo), 600)) as { sumario?: string };
      sumario = String(bruto.sumario ?? "").trim() || sumarioMock(estatisticas, achados, nomeFluxo);
    } else {
      await esperar(600);
      sumario = sumarioMock(estatisticas, achados, nomeFluxo);
    }
  } catch (erro) {
    const mensagem = erro instanceof ErroLLM ? erro.message : "Falha inesperada ao chamar a IA.";
    return Response.json({ erro: mensagem }, { status: 502 });
  }

  const relatorio: RelatorioAnalista = {
    sumario,
    achados,
    modelo: modo === "groq" ? modelo : "analista-mock-v1",
    versao_prompt: VERSAO_PROMPT_ANALISTA,
  };
  return Response.json({ estatisticas, relatorio });
}
