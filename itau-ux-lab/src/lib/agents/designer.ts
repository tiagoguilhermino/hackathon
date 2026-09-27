import * as z from "zod/v4";
import type { AnalystReport, DesignProposal, DesignerReport, LayoutRecommendation, SimulationStats } from "@/types/analytics";
import type { SegmentDimension } from "@/types/persona";
import type { ScreenSnapshot } from "@/types/simulation";
import { JARGON_GLOSSARY } from "../a11y/cognitive-load";
import { DIMENSION_LABELS } from "../analytics/stats";
import { SCREEN_TITLES } from "../bank/flows";
import { VARIATIONS, VARIATION_IDS, VARIATION_REASONS, variationsForScreen } from "../design/variations";
import { DEFAULT_MOCK_LATENCY_MS, callLLM, resolveLlmMode, simulateLatency, type LlmPrompt, type LlmUsage } from "../llm/client";
import { compactJson } from "../llm/compact";

export interface DesignerRequest {
  analyst: AnalystReport;
  stats: SimulationStats;
  screens: Record<string, ScreenSnapshot>;
  mode?: "mock" | "live";
  /** Versão da tela testada (A/B/C), para não recomendar a mesma */
  screenVersion?: string;
}

const title = (id: string) => SCREEN_TITLES[id as keyof typeof SCREEN_TITLES] ?? id;

const DESIGNER_SYSTEM = `Você é o Agente Designer de UX/UI de um banco (identidade visual: laranja #EC7000, azul escuro #1E2A4F). Você recebe o relatório do Agente Analista sobre uma simulação de usabilidade e o conteúdo real de cada tela (textos, botões, destaque visual e se estão visíveis sem rolagem).

Proponha mudanças de interface ACIONÁVEIS e específicas para os atritos encontrados. Bons exemplos: "Substituir o jargão 'Taxa Selic' por 'Juros anuais'", "Fixar o botão 'Continuar' no rodapé, laranja com texto branco". Cada proposta deve ter:
- screenId: a tela afetada, exatamente como nos dados;
- problem: o atrito observado, citando o dado ou a anomalia que o evidencia;
- change: a mudança concreta (texto novo, componente, posição, cor), usando o conteúdo real da tela;
- rationale: por que resolve, com base em princípios de UX (heurísticas de Nielsen, WCAG, linguagem simples) e no segmento mais afetado;
- impact e effort: "alta", "média" ou "baixa";
- relatedAnomalies: ids das anomalias do Analista que a proposta ataca.
Regras:
- Proponha apenas mudanças sustentadas pelos dados recebidos (métricas, anomalias, falas dos agentes ou conteúdo da tela). Não invente problemas que os dados não mostram (ex.: tamanho de fonte) nem proponha algo que a tela já tem.
- Escreva para o time de produto, em português, sem nomes de campos técnicos dos dados (use "botão pouco destacado", não "prominence low").
- Priorize pelo impacto no segmento mais prejudicado. No máximo 8 propostas, ids curtos e únicos (ex.: "p1").

Além das propostas, você recebe o catálogo de variações de tela já desenhadas pelo time no app Lume. Em layouts, para cada perfil de cliente que ficou bem abaixo da média (use os segmentos das anomalias, no formato "Dimensão: valor"), escolha no catálogo as variações que atacam a tela onde esse perfil parou:
- variationIds: só ids do catálogo; não repita a versão que já foi testada nesta simulação;
- rationale: 1 a 2 frases citando os números do perfil e por que a variação pode ajudar; cite a variação pelo nome (ex.: "Repetir C · com texto"), nunca pelo id;
- se nenhuma variação do catálogo serve para um perfil, deixe o perfil de fora. No máximo 4 perfis.
- Os dados vêm de uma simulação com clientes sintéticos: cada proposta é uma hipótese para testar com pessoas, e quem decide se aplica é o designer ou o PO. Não prometa ganho medido.`;

const DesignerSchema = z.object({
  proposals: z.array(
    z.object({
      id: z.string(),
      screenId: z.string(),
      problem: z.string(),
      change: z.string(),
      rationale: z.string(),
      impact: z.enum(["alta", "média", "baixa"]),
      effort: z.enum(["alta", "média", "baixa"]),
      relatedAnomalies: z.array(z.string()),
    }),
  ),
  layouts: z.array(
    z.object({
      segment: z.string(),
      variationIds: z.array(z.enum(VARIATION_IDS)),
      rationale: z.string(),
    }),
  ),
});

/** Catálogo como o agente lê: o que cada variação muda e em que tela atua. */
const catalogForPrompt = () => Object.values(VARIATIONS).map((v) => ({ id: v.id, nome: v.name, muda: v.change, tela: v.screen }));

/**
 * Resumo enxuto por perfil (literacia e idade): quantos, quantos concluíram e onde mais pararam.
 * Enxuto de propósito: o plano gratuito da Groq aceita 8.000 tokens por minuto por chave.
 */
function profilesForPrompt(stats: SimulationStats) {
  return (["literacyBand", "ageBand"] as SegmentDimension[]).flatMap((dim) =>
    (stats.bySegment[dim] ?? []).map((s) => {
      const worst = stats.segmentScreen
        .filter((x) => x.dimension === dim && x.segment === s.segment)
        .sort((a, b) => b.dropOffRate - a.dropOffRate)[0];
      return { perfil: `${DIMENSION_LABELS[dim]}: ${s.segment}`, agentes: s.agents, concluiram: s.successes, parouMaisEm: worst?.dropOffRate ? worst.screenId : "" };
    }),
  );
}

export function buildDesignerPrompt(req: DesignerRequest): LlmPrompt {
  const screens = Object.values(req.screens).map((s) => ({
    screenId: s.screenId,
    title: s.title,
    cognitiveLoad: { score: s.cognitiveLoad.score, reasons: s.cognitiveLoad.reasons },
    texts: s.tree.texts.map((t) => t.text),
    actions: s.tree.actions
      .filter((a) => a.role !== "scroll")
      .map((a) => ({ id: a.id, label: a.label, prominence: a.prominence, visibleWithoutScroll: a.inViewport })),
  }));
  return {
    system: DESIGNER_SYSTEM,
    user: `## Relatório do Analista
${req.analyst.summary}

Anomalias: ${compactJson(req.analyst.anomalies)}

## Métricas por tela
${compactJson(req.stats.byScreen)}

## Conteúdo das telas
${compactJson(screens)}

## Desempenho por perfil (quem concluiu e onde mais parou)
${compactJson(profilesForPrompt(req.stats))}

## Catálogo de variações de tela do Lume${req.screenVersion ? ` (versão testada nesta simulação: ${req.screenVersion})` : ""}
${compactJson(catalogForPrompt())}`,
  };
}

/** Designer mockado: mapeia os fatores de carga cognitiva das telas problemáticas em propostas. */
export function mockDesigner(req: DesignerRequest): DesignerReport {
  const proposals: DesignProposal[] = [];
  const related = (screenId: string) => req.analyst.anomalies.filter((a) => a.screenId === screenId).map((a) => a.id);
  const affectedSegments = [...new Set(req.analyst.anomalies.map((a) => a.segment).filter(Boolean))].slice(0, 2).join(" e ");

  // Botões só com desenho (sem texto visível): o agente os lê como "ícone sem texto: …".
  const iconOnly = (s: ScreenSnapshot) => s.tree.actions.filter((a) => a.label.startsWith("ícone sem texto"));
  const stoppedHere = (id: string) => (req.stats.byScreen.find((b) => b.screenId === id)?.abandoned ?? 0) > 0;

  // Telas com anomalias, carga cognitiva alta ou botão só com ícone onde alguém parou, da pior para a melhor.
  const targets = Object.values(req.screens)
    .filter((s) => related(s.screenId).length || s.cognitiveLoad.score >= 0.4 || (iconOnly(s).length && stoppedHere(s.screenId)))
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

    const icons = iconOnly(screen);
    if (icons.length) {
      push({
        problem: `Em "${title(screen.screenId)}", ${icons.length === 1 ? "uma ação aparece" : `${icons.length} ações aparecem`} só como desenho, sem texto (${icons.map((a) => a.label.replace("ícone sem texto: ", "")).join("; ")}). Quem não reconhece o desenho não sabe o que o botão faz.`,
        change: "Mostrar a ação com o ícone e um texto curto e visível dizendo o que ela faz, fora de menus escondidos.",
        rationale: "Heurística de Nielsen #6 (reconhecer em vez de lembrar) e WCAG 2.5.3 (rótulo visível). É uma hipótese: confirme no teste com pessoas.",
        impact: "alta",
        effort: "baixa",
      });
    }

    const iconIds = new Set(icons.map((a) => a.id));
    const unclear = [...new Set([...load.lowProminenceActions, ...load.hiddenActions])].filter((id) => !iconIds.has(id));
    if (unclear.length) {
      const ids = unclear;
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

  // Erros de digitação de valor na etapa 1 (só no fluxo de empréstimo: em outro fluxo, é agente perdido)
  const loan1Errors = req.stats.byScreen.find((s) => s.screenId === "loan-1");
  if (req.stats.flowId === "emprestimo" && loan1Errors && loan1Errors.errorRate >= 0.2) {
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

  return { proposals: proposals.slice(0, 8), layouts: mockLayouts(req), mode: "mock" };
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

/**
 * Variações por perfil (modo Simulado): para cada faixa de literacia ou de idade bem abaixo da
 * média, a tela onde esse perfil mais parou decide a variação do catálogo (variationsForScreen).
 */
export function mockLayouts(req: DesignerRequest): LayoutRecommendation[] {
  const { stats } = req;
  const out: LayoutRecommendation[] = [];
  for (const dim of ["literacyBand", "ageBand"] as SegmentDimension[]) {
    for (const seg of stats.bySegment[dim] ?? []) {
      if (seg.agents < 3 || stats.successRate - seg.successRate < 0.15) continue;
      const worst = stats.segmentScreen
        .filter((s) => s.dimension === dim && s.segment === seg.segment)
        .sort((a, b) => b.dropOffRate - a.dropOffRate || b.errorRate - a.errorRate)[0];
      if (!worst) continue;
      const ids = variationsForScreen(worst.screenId, stats.flowId, req.screenVersion);
      if (!ids.length) continue;
      out.push({
        id: `l${out.length + 1}`,
        segment: `${DIMENSION_LABELS[dim]}: ${seg.segment}`,
        variationIds: ids,
        rationale: `${seg.successes} de ${seg.agents} concluíram (${pct(seg.successRate)}), contra ${pct(stats.successRate)} no geral; a maior parada foi em "${title(worst.screenId)}". ${ids.map((id) => VARIATION_REASONS[id] ?? "").join(" ")} É hipótese: teste com pessoas desse perfil.`,
      });
    }
  }
  return out.slice(0, 4);
}

export async function runDesigner(req: DesignerRequest): Promise<DesignerReport & { prompt: LlmPrompt; usage: LlmUsage | null }> {
  const prompt = buildDesignerPrompt(req);
  if (resolveLlmMode(req.mode) === "mock") {
    await simulateLatency(DEFAULT_MOCK_LATENCY_MS * 4);
    return { ...mockDesigner(req), prompt, usage: null };
  }
  const { data, usage } = await callLLM({ prompt, schema: DesignerSchema, schemaName: "designer_report", effort: "medium" });
  return { proposals: data.proposals.slice(0, 8), layouts: cleanLayouts(data.layouts, req.screenVersion), mode: "live", prompt, usage };
}

/**
 * Regras que o código garante na resposta do LLM (o prompt pede, mas o modelo às vezes esquece):
 * sem repetir a versão já testada, sem id duplicado, sem perfil vazio, no máximo 4 perfis.
 */
export function cleanLayouts(
  raw: { segment: string; variationIds: string[]; rationale: string }[],
  screenVersion?: string,
): LayoutRecommendation[] {
  const tested = screenVersion ? `rec-${screenVersion.toLowerCase()}` : null;
  return raw
    .map((l) => ({ ...l, variationIds: [...new Set(l.variationIds)].filter((id) => id !== tested) }))
    .filter((l) => l.variationIds.length)
    .slice(0, 4)
    .map((l, i) => ({ id: `l${i + 1}`, segment: l.segment, variationIds: l.variationIds, rationale: l.rationale }));
}
