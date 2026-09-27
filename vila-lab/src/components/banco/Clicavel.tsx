"use client";

import type { ReactNode } from "react";
import type { TipoElemento } from "@/lib/tipos";
import { useBanco } from "./contexto";

interface Props {
  actionId: string;
  children: ReactNode;
  tipo?: TipoElemento;
  /** Rótulo lido pelo agente e por leitores de tela quando o botão não tem texto. */
  rotuloAcessivel?: string;
  somenteIcone?: boolean;
  desabilitado?: boolean;
  /** Estado ligado/desligado (alternadores e opções escolhidas). */
  selecionado?: boolean;
  className?: string;
}

/**
 * Todo elemento clicável do banco passa por aqui: ganha o data-action-id que o agente
 * lê na árvore de acessibilidade e chama a mesma transição do MDP que um clique humano.
 */
export function Clicavel({
  actionId,
  children,
  tipo = "botao",
  rotuloAcessivel,
  somenteIcone = false,
  desabilitado = false,
  selecionado,
  className = "",
}: Props) {
  const { agir, destaque, interativo } = useBanco();
  const alternavel = tipo === "alternador" || tipo === "opcao";
  return (
    <button
      type="button"
      data-action-id={actionId}
      data-tipo={tipo}
      data-somente-icone={somenteIcone ? "true" : undefined}
      data-destaque={destaque === actionId ? "true" : undefined}
      aria-label={rotuloAcessivel}
      aria-pressed={alternavel ? Boolean(selecionado) : undefined}
      disabled={desabilitado}
      onClick={() => interativo && agir(actionId)}
      className={`cursor-pointer disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
