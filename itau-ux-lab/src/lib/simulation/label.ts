import type { SimulationRun } from "@/types/simulation";
import { FLOWS } from "../bank/flows";

/** Versão testada ("versão A") ou vazio, para títulos e colunas. */
export function versionLabel(run: SimulationRun): string {
  return FLOWS[run.config.flowId]?.versions && run.config.version ? `versão ${run.config.version}` : "";
}

/** Nome da simulação nas listas: quando, fluxo, versão, agentes e se o agente foi o LLM ou as regras. */
export function runLabel(run: SimulationRun): string {
  const when = new Date(run.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  const version = versionLabel(run);
  return [when, FLOWS[run.config.flowId]?.name ?? run.config.flowId, version, `${run.agents.length} agentes`, run.llm.mode === "live" ? "LLM" : "regras"]
    .filter(Boolean)
    .join(" · ");
}
