/**
 * Transições do MDP: T(s, a) → s'. A interface chama `aplicarAcao` a cada clique, e o
 * agente usa a mesma função; por isso o action_id do botão na tela e o da transição
 * são sempre os mesmos.
 */

import type { EstadoBanco, FluxoId, Versao, VersaoEmprestimo, VersaoPix } from "../tipos";
import { FLUXOS } from "./fluxos";

export function estadoInicial(fluxo: FluxoId, versao: Versao, saldo = 4820.35): EstadoBanco {
  return {
    tela: FLUXOS[fluxo].tela_inicial,
    fluxo,
    versoes: {
      emprestimo: fluxo === "emprestimo" ? (versao as VersaoEmprestimo) : "original",
      pix: fluxo === "pix_recorrente" ? (versao as VersaoPix) : "C",
    },
    saldo,
    emprestimo: { valor: null, parcelas: null, aceite: false },
    pix: { contato: null, valor: null, repetir_mensal: false, mais_opcoes_aberto: false },
  };
}

const VALORES_EMPRESTIMO = [1000, 3000, 5000];
const PARCELAS = [6, 12, 24];
const VALORES_PIX = [50, 100, 250];
const CONTATOS = ["ana", "marcos"];

export function emprestimoPodeContinuar(e: EstadoBanco): boolean {
  return e.emprestimo.valor !== null && e.emprestimo.parcelas !== null;
}

/** Aplica a ação. Ação que não existe na tela atual não muda nada (e o agente vê isso). */
export function aplicarAcao(estado: EstadoBanco, actionId: string): EstadoBanco {
  const s: EstadoBanco = {
    ...estado,
    emprestimo: { ...estado.emprestimo },
    pix: { ...estado.pix },
  };
  if (!actionId.startsWith(prefixo(s.tela))) return estado; // action_id de outra tela: ignorado
  const [, acao, arg] = actionId.split(".");

  switch (s.tela) {
    case "home":
      if (actionId === "home.atalho.pix") s.tela = "pix_contatos";
      else if (actionId === "home.atalho.emprestimo") s.tela = "emprestimo_1";
      else if (actionId === "home.atalho.pagamentos") s.tela = "pagamentos";
      else return estado;
      return s;

    case "pagamentos":
      if (actionId === "pagamentos.voltar") s.tela = "home";
      else return estado;
      return s;

    case "emprestimo_1":
      if (actionId === "emprestimo1.voltar") s.tela = "home";
      else if (acao === "valor" && VALORES_EMPRESTIMO.includes(Number(arg))) s.emprestimo.valor = Number(arg);
      else if (acao === "parcelas" && PARCELAS.includes(Number(arg))) s.emprestimo.parcelas = Number(arg);
      else if (actionId === "emprestimo1.continuar" && emprestimoPodeContinuar(s)) s.tela = "emprestimo_2";
      else return estado;
      return s;

    case "emprestimo_2":
      if (actionId === "emprestimo2.voltar") s.tela = "emprestimo_1";
      else if (actionId === "emprestimo2.continuar") s.tela = "emprestimo_3";
      else return estado;
      return s;

    case "emprestimo_3":
      if (actionId === "emprestimo3.voltar") s.tela = "emprestimo_2";
      else if (actionId === "emprestimo3.aceite") s.emprestimo.aceite = !s.emprestimo.aceite;
      else if (actionId === "emprestimo3.contratar" && s.emprestimo.aceite) s.tela = "emprestimo_sucesso";
      else return estado;
      return s;

    case "pix_contatos":
      if (actionId === "pix.voltar") s.tela = "home";
      else if (acao === "contato" && CONTATOS.includes(arg)) {
        s.pix.contato = arg;
        s.tela = "pix_valor";
      } else return estado;
      return s;

    case "pix_valor":
      if (actionId === "pixvalor.voltar") s.tela = "pix_contatos";
      else if (acao === "opcao" && VALORES_PIX.includes(Number(arg))) s.pix.valor = Number(arg);
      else if (actionId === "pixvalor.continuar" && s.pix.valor !== null) s.tela = "pix_confirmar";
      else return estado;
      return s;

    case "pix_confirmar":
      if (actionId === "pixconfirmar.voltar") s.tela = "pix_valor";
      else if (actionId === "pixconfirmar.mais_opcoes" && s.versoes.pix === "A") s.pix.mais_opcoes_aberto = !s.pix.mais_opcoes_aberto;
      else if (actionId === "pixconfirmar.repetir" && (s.versoes.pix !== "A" || s.pix.mais_opcoes_aberto)) {
        s.pix.repetir_mensal = !s.pix.repetir_mensal;
      } else if (actionId === "pixconfirmar.enviar") s.tela = "pix_sucesso";
      else return estado;
      return s;

    case "emprestimo_sucesso":
    case "pix_sucesso":
      if (actionId === "sucesso.inicio") return { ...estadoInicial(s.fluxo, "original", s.saldo), versoes: s.versoes };
      return estado;

    default:
      return estado;
  }
}

/** Todo action_id começa pelo prefixo da tela em que o elemento aparece. */
export function prefixo(tela: EstadoBanco["tela"]): string {
  const mapa: Record<EstadoBanco["tela"], string> = {
    home: "home.",
    pagamentos: "pagamentos.",
    emprestimo_1: "emprestimo1.",
    emprestimo_2: "emprestimo2.",
    emprestimo_3: "emprestimo3.",
    emprestimo_sucesso: "sucesso.",
    pix_contatos: "pix.",
    pix_valor: "pixvalor.",
    pix_confirmar: "pixconfirmar.",
    pix_sucesso: "sucesso.",
  };
  return mapa[tela];
}
