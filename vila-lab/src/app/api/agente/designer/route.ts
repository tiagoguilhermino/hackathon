import { proporMock } from "@/lib/agentes/designer";
import { chamarGroq, configLLM, ErroLLM, esperar } from "@/lib/agentes/llm";
import { promptDesigner, VERSAO_PROMPT_DESIGNER } from "@/lib/agentes/prompts";
import type { Achado, ArvoreAcessibilidade, Proposta, RelatorioDesigner, TelaId } from "@/lib/tipos";

interface Corpo {
  achados: Achado[];
  arvores: Partial<Record<TelaId, ArvoreAcessibilidade>>;
}

const ESFORCOS = new Set(["baixo", "medio", "alto"]);

/** Agente designer: propõe mudanças; nunca aplica. Quem decide é o designer ou o PO. */
export async function POST(request: Request) {
  let corpo: Corpo;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return Response.json({ erro: "Pedido inválido: envie achados e árvores em JSON." }, { status: 400 });
  }
  if (!Array.isArray(corpo?.achados)) {
    return Response.json({ erro: "Faltam os achados do analista." }, { status: 400 });
  }
  const { modo, modelo } = configLLM();

  let propostas: Proposta[];
  try {
    if (modo === "groq") {
      const bruto = (await chamarGroq(promptDesigner(corpo.achados, corpo.arvores ?? {}), 1000)) as {
        propostas?: Partial<Proposta>[];
      };
      const idsAchados = new Set(corpo.achados.map((a) => a.id));
      // Confere a saída da IA: descarta proposta sem achado conhecido ou sem texto.
      propostas = (bruto.propostas ?? [])
        .filter((p) => p.achado_id && idsAchados.has(p.achado_id) && p.proposta)
        .map((p, i) => ({
          id: `D${i + 1}`,
          achado_id: p.achado_id!,
          tela: (p.tela ?? corpo.achados.find((a) => a.id === p.achado_id)?.tela ?? "home") as TelaId,
          elemento: p.elemento,
          problema: String(p.problema ?? ""),
          proposta: String(p.proposta),
          justificativa: String(p.justificativa ?? ""),
          hipotese_de_impacto: String(p.hipotese_de_impacto ?? "Hipótese: precisa de teste com pessoas."),
          esforco: ESFORCOS.has(String(p.esforco)) ? (p.esforco as Proposta["esforco"]) : "medio",
        }));
    } else {
      await esperar(700);
      propostas = proporMock(corpo.achados, corpo.arvores ?? {});
    }
  } catch (erro) {
    const mensagem = erro instanceof ErroLLM ? erro.message : "Falha inesperada ao chamar a IA.";
    return Response.json({ erro: mensagem }, { status: 502 });
  }

  const relatorio: RelatorioDesigner = {
    propostas,
    modelo: modo === "groq" ? modelo : "designer-mock-v1",
    versao_prompt: VERSAO_PROMPT_DESIGNER,
  };
  return Response.json(relatorio);
}
