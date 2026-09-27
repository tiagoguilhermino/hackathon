import { FlaskConical } from "lucide-react";

/** Aviso fixo em todas as páginas: o guia pede que fique claro que é protótipo e o que é simulado. */
export function AvisoPrototipo({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      role="note"
      className={`flex items-center justify-center gap-2 bg-azul text-center font-semibold text-white ${
        compacto ? "px-3 py-1 text-[11px]" : "px-4 py-2 text-xs"
      }`}
    >
      <FlaskConical aria-hidden size={compacto ? 12 : 14} className="shrink-0 text-marca" />
      Protótipo de hackathon · banco fictício · dados sintéticos · resultados simulados · não é o app oficial do Itaú
    </div>
  );
}

export function SeloSimulacao({ texto = "SIMULAÇÃO" }: { texto?: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-alerta/40 bg-marca-clara px-2 py-0.5 text-[11px] font-bold tracking-wide text-alerta">
      {texto}
    </span>
  );
}
