"use client";

import { createContext, useContext } from "react";
import type { EstadoBanco } from "@/lib/tipos";

export interface ValorContextoBanco {
  estado: EstadoBanco;
  /** Aplica uma ação (clique de pessoa ou escolha do agente). */
  agir: (actionId: string) => void;
  /** action_id que o agente vai tocar agora (destaque visual durante a simulação). */
  destaque: string | null;
  /** false durante a simulação: cliques de pessoas são ignorados para não atrapalhar o agente. */
  interativo: boolean;
}

export const ContextoBanco = createContext<ValorContextoBanco | null>(null);

export function useBanco(): ValorContextoBanco {
  const valor = useContext(ContextoBanco);
  if (!valor) throw new Error("useBanco precisa estar dentro de <BancoApp>.");
  return valor;
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
