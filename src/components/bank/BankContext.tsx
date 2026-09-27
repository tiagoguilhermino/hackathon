"use client";

import { createContext, useContext, type Dispatch } from "react";
import type { BankState } from "@/lib/bank/state";
import type { AgentAction } from "@/types/simulation";

interface BankContextValue {
  state: BankState;
  dispatch: Dispatch<AgentAction>;
}

export const BankContext = createContext<BankContextValue | null>(null);

export function useBank(): BankContextValue {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error("useBank precisa estar dentro de <BankApp>");
  return ctx;
}
