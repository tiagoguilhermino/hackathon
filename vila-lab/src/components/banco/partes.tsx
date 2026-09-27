"use client";

import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Clicavel } from "./Clicavel";

/** Cabeçalho de tela interna, com voltar e título. */
export function Cabecalho({ voltar, titulo, subtitulo }: { voltar: string; titulo: string; subtitulo?: string }) {
  return (
    <header className="flex items-start gap-3 border-b border-borda bg-cartao px-4 pb-4 pt-3">
      <Clicavel
        actionId={voltar}
        rotuloAcessivel="Voltar"
        somenteIcone
        className="mt-0.5 rounded-full p-1.5 text-azul hover:bg-azul-claro"
      >
        <ArrowLeft aria-hidden size={22} />
      </Clicavel>
      <div>
        <h1 className="text-lg font-bold text-azul">{titulo}</h1>
        {subtitulo && (
          <p data-leitura className="text-sm text-texto-suave">
            {subtitulo}
          </p>
        )}
      </div>
    </header>
  );
}

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-borda bg-cartao p-4 ${className}`}>{children}</section>;
}

/** Botão principal: laranja com texto azul-escuro (contraste 4,6:1, passa no WCAG AA). */
export function BotaoPrincipal({
  actionId,
  children,
  desabilitado,
}: {
  actionId: string;
  children: ReactNode;
  desabilitado?: boolean;
}) {
  return (
    <Clicavel
      actionId={actionId}
      desabilitado={desabilitado}
      className="w-full rounded-xl bg-marca px-4 py-3.5 text-base font-bold text-azul shadow-sm transition hover:bg-marca-escura disabled:bg-borda disabled:text-texto-suave"
    >
      {children}
    </Clicavel>
  );
}

export function Etapas({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="px-4 pt-4">
      <p data-leitura className="text-xs font-semibold uppercase tracking-wide text-texto-suave">
        Etapa {atual} de {total}
      </p>
      <div className="mt-2 flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < atual ? "bg-marca" : "bg-borda"}`} />
        ))}
      </div>
    </div>
  );
}

export function Opcao({
  actionId,
  selecionado,
  children,
}: {
  actionId: string;
  selecionado: boolean;
  children: ReactNode;
}) {
  return (
    <Clicavel
      actionId={actionId}
      tipo="opcao"
      selecionado={selecionado}
      className={`rounded-xl border-2 px-3 py-3 text-sm font-semibold transition ${
        selecionado ? "border-marca bg-marca-clara text-azul" : "border-borda bg-cartao text-texto hover:border-azul"
      }`}
    >
      {children}
    </Clicavel>
  );
}
