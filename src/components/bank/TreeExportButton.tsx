"use client";

import { useState, type RefObject } from "react";
import { Braces, Copy, X } from "lucide-react";
import { extractAccessibilityTree } from "@/lib/a11y/extract";
import { analyzeCognitiveLoad } from "@/lib/a11y/cognitive-load";

/** Exporta o estado atual da UI como Árvore de Acessibilidade (JSON). */
export function TreeExportButton({ rootRef }: { rootRef: RefObject<HTMLDivElement | null> }) {
  const [json, setJson] = useState<string | null>(null);

  const exportTree = () => {
    if (!rootRef.current) return;
    const tree = extractAccessibilityTree(rootRef.current);
    setJson(JSON.stringify({ tree, cognitiveLoad: analyzeCognitiveLoad(tree) }, null, 2));
  };

  return (
    <>
      <button
        type="button"
        onClick={exportTree}
        className="flex items-center gap-2 rounded-lg bg-itau-navy px-3 py-2 text-sm font-medium text-white shadow hover:bg-itau-navy/90"
      >
        <Braces size={16} /> Exportar árvore de acessibilidade
      </button>
      {json && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setJson(null)}>
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold text-itau-navy">Árvore de acessibilidade (estado s)</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(json)} className="rounded p-1 hover:bg-neutral-100" aria-label="Copiar">
                  <Copy size={18} />
                </button>
                <button type="button" onClick={() => setJson(null)} className="rounded p-1 hover:bg-neutral-100" aria-label="Fechar">
                  <X size={18} />
                </button>
              </div>
            </div>
            <pre className="overflow-auto p-4 text-xs leading-relaxed text-neutral-800">{json}</pre>
          </div>
        </div>
      )}
    </>
  );
}
