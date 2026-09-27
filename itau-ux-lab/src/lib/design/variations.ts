/**
 * Catálogo de variações de tela do frontend Lume (Iury): as peças do "Laboratório de cenários"
 * de Frontend/itau-hackathon-bank-main/src/lib/cenarios.ts (Dash V1/V2/V3, a peça Pagar, o
 * Fluxo 1/2 do Pix e o Repetir A/B/C). O Agente Designer escolhe entre estas telas já desenhadas
 * as que podem ajudar cada perfil de cliente que teve mais dificuldade.
 *
 * As prévias ficam em public/previas e saem de scripts/capturar_previas.py. `lume` é o endereço
 * da mesma variação no frontend Lume (ex.: http://localhost:5174/?dash=v1&fluxo=f1&rec=c&limpo=sim).
 */

export const VARIATION_IDS = [
  "dash-v1",
  "dash-v2",
  "dash-v3",
  "dash-pagar-separadas",
  "pix-f1",
  "pix-f2",
  "rec-a",
  "rec-b",
  "rec-c",
] as const;
export type VariationId = (typeof VARIATION_IDS)[number];

export type VariationGroup = "Tela inicial" | "Início do Pix" | "Repetir todo mês";

export interface ScreenVariation {
  id: VariationId;
  group: VariationGroup;
  name: string;
  /** O que muda nesta variação, em relação às outras do mesmo grupo */
  change: string;
  /** Tela do laboratório em que esta variação atua */
  screen: "home" | "pix" | "pix-confirm";
  preview: string;
  lume: string;
}

export const VARIATIONS: Record<VariationId, ScreenVariation> = {
  "dash-v1": {
    id: "dash-v1",
    group: "Tela inicial",
    name: "Dash V1 · Pix com atalho próprio",
    change: "Atalhos Pix, Pagar, TED/DOC e Depositar na 1ª linha; Empréstimos na 2ª linha do celular. Boleto e Minhas chaves ficam em Depositar.",
    screen: "home",
    preview: "/previas/dash-v1.png",
    lume: "dash=v1&fluxo=f1&rec=a",
  },
  "dash-v2": {
    id: "dash-v2",
    group: "Tela inicial",
    name: "Dash V2 · Boleto com atalho",
    change: "Atalhos Pix, Pagar, TED/DOC e Boleto; Minhas chaves dentro do Pix. Sem Depositar: a portabilidade de salário fica sem acesso.",
    screen: "home",
    preview: "/previas/dash-v2.png",
    lume: "dash=v2&fluxo=f1&rec=a",
  },
  "dash-v3": {
    id: "dash-v3",
    group: "Tela inicial",
    name: "Dash V3 · Transferir agrupado",
    change: "Atalhos Transferir, Pagar, Depositar e Empréstimos, todos na 1ª linha. Pix e TED ficam dentro de Transferir (o Pix da barra de baixo continua direto).",
    screen: "home",
    preview: "/previas/dash-v3.png",
    lume: "dash=v3&fluxo=f1&rec=a",
  },
  "dash-pagar-separadas": {
    id: "dash-pagar-separadas",
    group: "Tela inicial",
    name: "Pagar boleto e Fatura separados",
    change: "Na base da Dash V1, o atalho Pagar vira dois: Pagar boleto e Fatura. As contas a vencer ficam em Próximos pagamentos.",
    screen: "home",
    preview: "/previas/dash-pagar-separadas.png",
    lume: "transf=separadas&boleto=deposito&chaves=deposito&pagar=separadas&fluxo=f1&rec=a",
  },
  "pix-f1": {
    id: "pix-f1",
    group: "Início do Pix",
    name: "Pix · Fluxo 1 (contatos salvos)",
    change: "O Pix abre com a lista de contatos: basta tocar no nome, sem digitar a chave. Não tem Copia e Cola.",
    screen: "pix",
    preview: "/previas/pix-f1.png",
    lume: "dash=v1&fluxo=f1&rec=a",
  },
  "pix-f2": {
    id: "pix-f2",
    group: "Início do Pix",
    name: "Pix · Fluxo 2 (Copia e Cola e chave)",
    change: "O Pix abre com Copia e Cola e o campo da chave: é preciso digitar. Não tem lista de contatos.",
    screen: "pix",
    preview: "/previas/pix-f2.png",
    lume: "dash=v1&fluxo=f2&rec=a",
  },
  "rec-a": {
    id: "rec-a",
    group: "Repetir todo mês",
    name: "Repetir A · dentro do ⋯",
    change: "\"Repetir todo mês\" fica escondido no botão ⋯ (Mais opções).",
    screen: "pix-confirm",
    preview: "/previas/rec-a.png",
    lume: "dash=v1&fluxo=f1&rec=a",
  },
  "rec-b": {
    id: "rec-b",
    group: "Repetir todo mês",
    name: "Repetir B · só ícone",
    change: "Um ícone de repetir, sem texto, ao lado do destinatário.",
    screen: "pix-confirm",
    preview: "/previas/rec-b.png",
    lume: "dash=v1&fluxo=f1&rec=b",
  },
  "rec-c": {
    id: "rec-c",
    group: "Repetir todo mês",
    name: "Repetir C · com texto",
    change: "Cartão \"Deseja automatizar?\" com o botão \"Repetir todo mês\", fora de menus.",
    screen: "pix-confirm",
    preview: "/previas/rec-c.png",
    lume: "dash=v1&fluxo=f1&rec=c",
  },
};

export const VARIATION_GROUPS: VariationGroup[] = ["Tela inicial", "Início do Pix", "Repetir todo mês"];

/**
 * Regra do designer por regras (modo Simulado): que variação ataca a tela onde um perfil parou.
 * No modo LLM real, o Agente Designer escolhe sozinho no catálogo.
 */
export function variationsForScreen(screenId: string, flowId: string, testedVersion?: string): VariationId[] {
  switch (screenId) {
    case "home":
      // Empréstimo: na V3 o atalho Empréstimos fica na 1ª linha. Pix: na V1 o Pix tem atalho próprio.
      return flowId === "emprestimo" ? ["dash-v3"] : ["dash-v1"];
    case "pix":
      return ["pix-f1"];
    case "pix-confirm":
      return testedVersion === "C" ? [] : ["rec-c"];
    default:
      return [];
  }
}

/** Por que a variação pode ajudar (texto do designer por regras). */
export const VARIATION_REASONS: Partial<Record<VariationId, string>> = {
  "dash-v1": "Na Dash V1 o Pix tem atalho próprio na tela inicial: um toque a menos, sem passar por Transferir.",
  "dash-v3": "Na Dash V3 o atalho Empréstimos fica na 1ª linha do celular, sem rolar nem procurar.",
  "pix-f1": "No Fluxo 1 a pessoa toca no nome do contato, sem digitar a chave.",
  "rec-c": "Na versão C o repetir aparece com texto, sem abrir menu nem reconhecer um ícone.",
};

/** Endereço da variação no frontend Lume, se NEXT_PUBLIC_LUME_URL estiver configurado. */
export function lumeLink(variation: ScreenVariation): string | null {
  const base = process.env.NEXT_PUBLIC_LUME_URL;
  return base ? `${base.replace(/\/$/, "")}/?${variation.lume}&limpo=sim` : null;
}
