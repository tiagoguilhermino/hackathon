import Image from "next/image";
import { ExternalLink, LayoutTemplate } from "lucide-react";
import type { DesignProposal, HumanDecision, LayoutRecommendation } from "@/types/analytics";
import { VARIATIONS, VARIATION_GROUPS, lumeLink, type ScreenVariation, type VariationId } from "@/lib/design/variations";
import { SimulationBadge } from "../common/PrototypeNotice";
import { HumanReview, type NewDecision } from "./HumanReview";

/** Prévia de uma variação do Lume (print do frontend do Iury), com o que ela muda. */
function Preview({ variation, compact }: { variation: ScreenVariation; compact?: boolean }) {
  const link = lumeLink(variation);
  return (
    <figure className={compact ? "w-28 shrink-0" : "w-32 shrink-0"}>
      <a href={variation.preview} target="_blank" rel="noreferrer" title="Abrir a prévia em tamanho real">
        <Image
          src={variation.preview}
          alt={`Prévia: ${variation.name}`}
          width={585}
          height={1266}
          className="h-auto w-full rounded-lg border border-neutral-200 shadow-sm"
        />
      </a>
      <figcaption className="mt-1 text-[11px] leading-tight text-neutral-600">
        <b className="block text-itau-navy">{variation.name}</b>
        {!compact && variation.change}
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="mt-0.5 flex items-center gap-0.5 text-itau-orange">
            <ExternalLink size={11} /> abrir no Lume
          </a>
        )}
      </figcaption>
    </figure>
  );
}

interface LayoutVariationsProps {
  layouts?: LayoutRecommendation[];
  runId: string;
  decisions: HumanDecision[];
  onDecide?: (decision: NewDecision) => void;
}

/**
 * Variações de tela por perfil de cliente: o Agente Designer escolhe, entre as telas já desenhadas
 * no Lume, as que podem ajudar quem teve mais dificuldade. Hipótese: quem decide é uma pessoa.
 */
export function LayoutVariations({ layouts, runId, decisions, onDecide }: LayoutVariationsProps) {
  const known = (id: string): id is VariationId => id in VARIATIONS;

  return (
    <div className="mt-5 border-t border-neutral-200 pt-4">
      <header className="mb-1 flex flex-wrap items-center gap-2">
        <LayoutTemplate size={18} className="text-itau-orange" />
        <h3 className="font-semibold">Variações de tela por perfil de cliente</h3>
        <SimulationBadge />
      </header>
      <p className="mb-3 text-xs text-neutral-500">
        Prévias do app Lume (variações desenhadas pelo Iury). Para cada perfil que ficou bem abaixo da média, o agente escolhe as telas
        que atacam onde esse perfil parou. É hipótese para o teste com pessoas desse perfil.
      </p>

      {layouts === undefined ? (
        <p className="text-sm text-neutral-500">Este relatório foi gerado antes das variações. Clique em &quot;Gerar análise de novo&quot;.</p>
      ) : !layouts.length ? (
        <p className="text-sm text-neutral-500">Nenhum perfil ficou bem abaixo da média nesta simulação: sem variação para recomendar.</p>
      ) : (
        <div className="space-y-3">
          {layouts.map((l) => {
            const variations = l.variationIds.filter(known).map((id) => VARIATIONS[id]);
            const asProposal: DesignProposal = {
              id: l.id,
              screenId: variations[0]?.screen ?? "",
              problem: l.rationale,
              change: `${l.segment}: ${variations.map((v) => v.name).join(" + ")}`,
              rationale: l.rationale,
              impact: "média",
              effort: "baixa",
              relatedAnomalies: [],
            };
            return (
              <article key={l.id} className="rounded-lg border border-neutral-200 p-3 text-sm">
                <div className="mb-2 font-semibold text-itau-navy">Para: {l.segment}</div>
                <div className="flex flex-wrap gap-3">
                  {variations.map((v) => (
                    <Preview key={v.id} variation={v} />
                  ))}
                  <p className="min-w-48 flex-1 text-xs text-neutral-600">{l.rationale}</p>
                </div>
                {onDecide && (
                  <HumanReview
                    proposal={asProposal}
                    runId={runId}
                    onDecide={onDecide}
                    previous={decisions.findLast((d) => d.runId === runId && d.proposalId === l.id && d.proposal === asProposal.change)}
                  />
                )}
              </article>
            );
          })}
        </div>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-itau-navy">
          Catálogo de variações do Lume ({Object.keys(VARIATIONS).length} prévias)
        </summary>
        <div className="mt-3 space-y-4">
          {VARIATION_GROUPS.map((group) => (
            <div key={group}>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{group}</div>
              <div className="flex flex-wrap gap-3">
                {Object.values(VARIATIONS)
                  .filter((v) => v.group === group)
                  .map((v) => (
                    <Preview key={v.id} variation={v} compact />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
