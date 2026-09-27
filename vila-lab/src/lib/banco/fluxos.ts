/** Os fluxos que o laboratório sabe testar. Cada um é uma tarefa com começo, meio e fim. */

import type { DefinicaoFluxo, EstadoBanco, FluxoId } from "../tipos";

export const FLUXOS: Record<FluxoId, DefinicaoFluxo> = {
  emprestimo: {
    id: "emprestimo",
    nome: "Solicitação de empréstimo (3 etapas)",
    objetivo: "Pedir um empréstimo de R$ 3.000 para pagar em 12 parcelas.",
    versoes: [
      { id: "original", descricao: "Condições com jargão (CET, IOF, Selic) e botão final de baixo contraste" },
      { id: "simplificada", descricao: "Condições em linguagem simples e botão final em destaque" },
    ],
    tela_inicial: "home",
    telas_sucesso: ["emprestimo_sucesso"],
    max_passos: 18,
  },
  pix_recorrente: {
    id: "pix_recorrente",
    nome: "Agendar Pix que se repete todo mês",
    objetivo: "Pagar R$ 250 do aluguel para Ana Paula Souza por Pix e deixar repetindo todo mês.",
    versoes: [
      { id: "A", descricao: "\"Repetir todo mês\" escondido em Mais opções (⋯)" },
      { id: "B", descricao: "Só um ícone de repetir, sem texto" },
      { id: "C", descricao: "Botão com ícone e o texto \"Repetir todo mês\"" },
    ],
    tela_inicial: "home",
    telas_sucesso: ["pix_sucesso"],
    max_passos: 16,
  },
};

/** A tarefa só conta como concluída se a pessoa chegou ao fim fazendo o que o objetivo pede. */
export function tarefaConcluida(estado: EstadoBanco): boolean {
  if (estado.fluxo === "emprestimo") {
    return estado.tela === "emprestimo_sucesso" && estado.emprestimo.valor === 3000 && estado.emprestimo.parcelas === 12;
  }
  return (
    estado.tela === "pix_sucesso" &&
    estado.pix.contato === "ana" &&
    estado.pix.valor === 250 &&
    estado.pix.repetir_mensal
  );
}

/** Chegou a uma tela final (certo ou errado): a simulação daquele agente para. */
export function telaFinal(estado: EstadoBanco): boolean {
  return FLUXOS[estado.fluxo].telas_sucesso.includes(estado.tela);
}
