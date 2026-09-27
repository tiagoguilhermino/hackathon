import type { AnalystReport, DesignProposal, DesignerReport, SimulationStats } from "@/types/analytics";
import type { ScreenSnapshot } from "@/types/simulation";
import { JARGON_GLOSSARY } from "../a11y/cognitive-load";
import { SCREEN_TITLES } from "../bank/flows";
import { DEFAULT_MOCK_LATENCY_MS, callLLM, getLlmMode, parseJsonResponse, simulateLatency, type LlmPrompt } from "../llm/client";

export interface DesignerRequest {
  analyst: AnalystReport;
  stats: SimulationStats;
  screens: Record<string, ScreenSnapshot>;
}

const title = (id: string) => SCREEN_TITLES[id as keyof typeof SCREEN_TITLES] ?? id;

const DESIGNER_SYSTEM = `Você é o Agente Designer de UX/UI de um banco. Recebe as anomalias encontradas pelo Agente Analista e o diagnóstico de carga cognitiva de cada tela (jargões, ações escondidas, baixo contraste).

Proponha mudanças de interface ACIONÁVEIS e específicas (ex.: "Substituir o jargão 'Taxa Selic' por 'Juros anuais'", "Fixar o botão Continuar no rodapé com contraste AA"). Cada proposta deve:
- apontar a tela (screenId) e o problema observado, citando a anomalia relacionada;
- descrever a mudança concreta (texto, componente, posição, cor);
- justificar com princípios de UX (heurísticas de Nielsen, WCAG, linguagem simples) e com o segmento afetado;
- estimar impacto e esforço (alta|média|baixa).
Priorize por impacto no segmento mais prejudicado. Máximo 8 propostas.

Responda SOMENTE com JSON: {"proposals": [{"id", "screenId", "problem", "change", "rationale", "impact", "effort", "relatedAnomalies": string[]}]}`;

export function buildDesignerPrompt(req: DesignerRequest): LlmPrompt {
  return {
    system: DESIGNER_SYSTEM,
    user: `Relatório do Analista:
${req.analyst.summary}
Anomalias: ${JSON.stringify(req.analyst.anomalies)}

Diagnóstico das telas: ${JSON.stringify(Object.values(req.screens).map((s) => ({ screenId: s.screenId, title: s.title, ...s.cognitiveLoad })))}`,
  };
}

/** Designer mockado: mapeia os fatores de carga cognitiva das telas problemáticas em propostas. */
export function mockDesigner(req: DesignerRequest): DesignerReport {
  const proposals: DesignProposal[] = [];
  const related = (screenId: string) => req.analyst.anomalies.filter((a) => a.screenId === screenId).map((a) => a.id);
  const affectedSegments = [...new Set(req.analyst.anomalies.map((a) => a.segment).filter(Boolean))].slice(0, 2).join(" e ");

  // Telas com anomalias ou carga cognitiva alta, da pior para a melhor.
  const targets = Object.values(req.screens)
    .filter((s) => related(s.screenId).length || s.cognitiveLoad.score >= 0.4)
    .sort((a, b) => b.cognitiveLoad.score - a.cognitiveLoad.score);

  for (const screen of targets) {
    const load = screen.cognitiveLoad;
    const rel = related(screen.screenId);
    const push = (p: Omit<DesignProposal, "id" | "screenId" | "relatedAnomalies">) =>
      proposals.push({ ...p, id: `prop-${proposals.length + 1}`, screenId: screen.screenId, relatedAnomalies: rel });

    const jargon = load.jargonTerms.filter((t) => t !== "a.m." && t !== "a.a.");
    if (jargon.length) {
      push({
        problem: `"${title(screen.screenId)}" usa ${jargon.length} termos técnicos (${jargon.slice(0, 4).join(", ")}).`,
        change: jargon
          .slice(0, 4)
          .map((t) => `Substituir "${t}" por "${JARGON_GLOSSARY[t]}"`)
          .join("; ") + ". Manter o termo técnico apenas em um \"Saiba mais\".",
        rationale: `Linguagem simples (heurística de Nielsen #2: correspondência com o mundo real). Personas de baixa literacia${affectedSegments ? ` (${affectedSegments})` : ""} abandonaram citando palavras difíceis.`,
        impact: "alta",
        effort: "baixa",
      });
    }

    if (load.lowProminenceActions.length || load.hiddenActions.length) {
      const ids = [...new Set([...load.lowProminenceActions, ...load.hiddenActions])];
      push({
        problem: `Ações essenciais pouco visíveis: ${ids.join(", ")} (fora da dobra e/ou baixo contraste).`,
        change:
          "Fixar o botão principal no rodapé (sticky), com a cor laranja #EC7000 e texto branco (contraste ≥ 4.5:1), rótulo \"Continuar\" padronizado com as outras etapas; aumentar a área de toque do aceite para 44×44px.",
        rationale: "WCAG 1.4.3 (contraste) e 2.5.5 (área de toque). Agentes com baixa literacia não rolaram a tela até o botão.",
        impact: "alta",
        effort: "baixa",
      });
    }

    if (load.wordCount > 90) {
      push({
        problem: `Texto extenso (${load.wordCount} palavras) numa única tela.`,
        change:
          "Aplicar divulgação progressiva: mostrar só parcela, total a pagar e data da 1ª parcela; mover taxas, IOF e CET para um painel expansível \"Ver detalhes do custo\".",
        rationale: "Reduz a carga de leitura (heurística #8: design minimalista). O tempo de reflexão simulado nesta tela foi o maior do fluxo.",
        impact: "média",
        effort: "média",
      });
    }

    if (screen.screenId === "loan-2" && load.jargonTerms.includes("prestamista")) {
      push({
        problem: "Seguro prestamista vem pré-selecionado (padrão opt-out).",
        change: "Deixar o seguro desmarcado por padrão e exibir o custo mensal dele ao lado da opção (\"+ R$ X por mês\").",
        rationale: "Evita dark pattern de venda casada, alinhado ao CDC e às diretrizes do Bacen; aumenta a confiança de quem hesitou nesta etapa.",
        impact: "média",
        effort: "baixa",
      });
    }
  }

  // Erros de digitação de valor na etapa 1
  const loan1Errors = req.stats.byScreen.find((s) => s.screenId === "loan-1");
  if (loan1Errors && loan1Errors.errorRate >= 0.2) {
    proposals.push({
      id: `prop-${proposals.length + 1}`,
      screenId: "loan-1",
      problem: `${Math.round(loan1Errors.errorRate * 100)}% das ações em "${loan1Errors.title}" foram erradas (ex.: valor digitado por extenso).`,
      change: "Usar máscara monetária no campo de valor e oferecer atalhos de valor (R$ 1.000 · R$ 5.000 · R$ 10.000) ou um slider.",
      rationale: "Prevenção de erros (heurística #5): evita que o usuário digite formatos inválidos.",
      impact: "média",
      effort: "baixa",
      relatedAnomalies: req.analyst.anomalies.filter((a) => a.screenId === "loan-1").map((a) => a.id),
    });
  }

  return { proposals: proposals.slice(0, 8), mode: "mock" };
}

export async function runDesigner(req: DesignerRequest): Promise<DesignerReport & { prompt: LlmPrompt }> {
  const prompt = buildDesignerPrompt(req);
  if (getLlmMode() === "mock") {
    await simulateLatency(DEFAULT_MOCK_LATENCY_MS * 4);
    return { ...mockDesigner(req), prompt };
  }
  const parsed = parseJsonResponse<Omit<DesignerReport, "mode">>(await callLLM(prompt));
  return { ...parsed, mode: "live", prompt };
}
