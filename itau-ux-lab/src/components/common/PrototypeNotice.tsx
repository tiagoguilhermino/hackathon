import { FlaskConical } from "lucide-react";

/**
 * Aviso fixo no topo de toda página. O Guia do hackathon pede que o vídeo e o link deixem
 * claro que é protótipo e não produto oficial; a regra 3 da vila pede o aviso em toda tela.
 */
export function PrototypeNotice() {
  return (
    <div
      role="note"
      className="flex items-center justify-center gap-2 bg-itau-navy px-3 py-1.5 text-center text-[11px] font-semibold text-white sm:text-xs"
    >
      <FlaskConical aria-hidden size={13} className="shrink-0 text-itau-orange" />
      Protótipo de hackathon · banco fictício · dados sintéticos · resultados simulados · não é o app oficial do Itaú
    </div>
  );
}

/** Rótulo SIMULAÇÃO: todo resultado dos agentes é hipótese para o teste com pessoas, não evidência. */
export function SimulationBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-amber-800">
      SIMULAÇÃO
    </span>
  );
}
