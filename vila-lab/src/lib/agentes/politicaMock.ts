/**
 * Política simulada π(a|s, persona) usada enquanto a IA de verdade não está ligada.
 *
 * Não é IA: é uma regra estocástica com as MESMAS restrições do prompt do navegador
 * (literacia baixa + carga alta → erra, demora ou desiste; ícone sem texto, item fora da
 * tela e contraste baixo são difíceis de notar). Serve para testar o encanamento e a
 * transição de estados da interface. Os números que ela gera refletem estas regras, não
 * pessoas reais: nunca apresente como evidência.
 */

import { criarAleatorio, derivarSemente, limitar, normal } from "../rng";
import { ABANDONAR, type NoAcessivel, type PedidoNavegacao } from "../tipos";
import {
  normalizar,
  palavras,
  PALAVRAS_DE_AVANCO,
  PALAVRAS_DE_MENU,
  PALAVRAS_DE_RECORRENCIA,
  PALAVRAS_DE_RECUO,
  vocabularioDoObjetivo,
} from "./texto";

export const MODELO_MOCK = "politica-mock-v1";
const PALAVRAS_DE_ACEITE = ["concordo", "aceito", "declaro"];

interface Candidato {
  no: NoAcessivel;
  pontos: number;
  motivo: "avanco" | "objetivo" | "aceite" | "menu" | "recuo" | "desconhecido" | "outro";
}

export interface DecisaoMock {
  action_id: string;
  justificativa: string;
  tempo_s: number;
}

const contem = (texto: string, lista: string[]) => lista.some((w) => texto.includes(w));

export function navegarMock(p: PedidoNavegacao & { tentativa?: number }): DecisaoMock {
  const rnd = criarAleatorio(derivarSemente(p.semente, p.persona.id, p.passo, p.arvore.tela, p.tentativa ?? 0));
  const L = p.persona.cadastral.literacia_digital;
  const C = p.arvore.carga_cognitiva;
  const vocab = vocabularioDoObjetivo(p.objetivo);
  const querRecorrencia = contem(normalizar(p.objetivo), PALAVRAS_DE_RECORRENCIA);
  const palavrasNaTela = palavras([p.arvore.titulo, ...p.arvore.textos, ...p.arvore.elementos.map((e) => e.rotulo)].join(" ")).length;

  const tempo = (extra = 0) =>
    Math.round((1.2 + palavrasNaTela * (0.1 + 0.3 * (1 - L)) + 6 * C * (1 - L) + Math.abs(normal(rnd, 0, 1.2)) + extra) * 10) / 10;

  // Teste da proteção do sistema: às vezes o "modelo" devolve um botão que não existe.
  if (rnd() < p.taxa_resposta_invalida) {
    return { action_id: "ajuda.botao_inexistente", justificativa: "Toquei no botão de ajuda.", tempo_s: tempo() };
  }

  const candidatos: Candidato[] = [];
  for (const no of p.arvore.elementos) {
    if (!no.habilitado) continue;
    const rotulo = normalizar(no.rotulo);
    const recuo = contem(rotulo, PALAVRAS_DE_RECUO);
    // Notar: fora da tela e contraste baixo passam despercebidos para quem tem literacia baixa.
    let chanceDeNotar = 1;
    if (!no.visivel_sem_rolar) chanceDeNotar *= 0.5 + 0.5 * L;
    if (no.contraste_baixo) chanceDeNotar *= 0.35 + 0.55 * L;
    if (rnd() > chanceDeNotar) continue;
    // Entender: ícone sem texto só é entendido com familiaridade (a seta de voltar todo mundo conhece).
    const entende = no.texto_visivel || recuo || rnd() < 0.3 + 0.6 * L;

    const alternavel = no.tipo === "opcao" || no.tipo === "alternador";
    const casaComObjetivo =
      palavras(no.rotulo).some((w) => vocab.has(w)) || (querRecorrencia && contem(rotulo, PALAVRAS_DE_RECORRENCIA));

    let c: Candidato;
    if (!entende) c = { no, pontos: 0.08, motivo: "desconhecido" };
    else if (recuo) c = { no, pontos: 0.04, motivo: "recuo" };
    else if (alternavel && no.selecionado) c = { no, pontos: 0.02, motivo: "outro" };
    else if (contem(rotulo, PALAVRAS_DE_ACEITE)) c = { no, pontos: 0.6, motivo: "aceite" };
    else if (casaComObjetivo) c = { no, pontos: alternavel ? 0.9 : 0.7, motivo: "objetivo" };
    else if (contem(rotulo, PALAVRAS_DE_AVANCO)) c = { no, pontos: 0.5, motivo: "avanco" };
    else if (contem(rotulo, PALAVRAS_DE_MENU)) c = { no, pontos: 0.12, motivo: "menu" };
    else c = { no, pontos: 0.1, motivo: "outro" };
    candidatos.push(c);
  }

  // Ainda falta escolher algo que o objetivo pede? Então avançar agora é menos provável.
  const faltaEscolher = candidatos.some((c) => c.motivo === "objetivo" && (c.no.tipo === "opcao" || c.no.tipo === "alternador"));
  const recorrenciaFeita = candidatos.some(
    (c) => c.no.selecionado && contem(normalizar(c.no.rotulo), PALAVRAS_DE_RECORRENCIA),
  );
  for (const c of candidatos) {
    const rotulo = normalizar(c.no.rotulo);
    if (faltaEscolher && (c.motivo === "avanco" || (c.motivo === "objetivo" && rotulo.includes("enviar")))) c.pontos *= 0.3;
    // Quem entende do assunto não envia sem achar a opção de repetir; procura nos menus.
    if (querRecorrencia && !recorrenciaFeita && rotulo.includes("enviar")) c.pontos *= 1 - 0.7 * L;
    if (querRecorrencia && !recorrenciaFeita && c.motivo === "menu") c.pontos += 0.5 * L;
    const vezes = p.historico.filter((h) => h.action_id === c.no.action_id).length;
    if (vezes >= 2) c.pontos *= 0.3;
  }

  const semSaida = !candidatos.some((c) => c.motivo !== "recuo" && c.pontos >= 0.3);
  // Revisita = voltar a uma tela por onde já passou (escolher várias opções na mesma tela não conta).
  const entradas =
    p.historico.filter((h, i) => h.tela === p.arvore.tela && (i === 0 || p.historico[i - 1].tela !== h.tela)).length +
    (p.historico.at(-1)?.tela === p.arvore.tela ? 0 : 1);
  const revisitas = Math.max(0, entradas - 1);
  const chanceDeDesistir = limitar(
    (0.005 + 0.45 * C * (1 - L) ** 1.5 + (semSaida ? 0.3 + 0.2 * (1 - L) : 0) + 0.06 * revisitas) *
      (0.6 + p.persona.digital.taxa_rejeicao),
    0,
    0.95,
  );
  if (candidatos.length === 0 || rnd() < chanceDeDesistir) {
    const justificativa = semSaida
      ? "Não achei como fazer o que eu queria nesta tela. Vou desistir."
      : C > 0.5 && L < 0.5
        ? "Tem muita informação que eu não entendo. Prefiro desistir."
        : "Cansei, vou deixar para depois.";
    return { action_id: ABANDONAR, justificativa, tempo_s: tempo(3) };
  }

  // Escolha estocástica (softmax): quanto menor a literacia, mais aleatória a escolha.
  const temperatura = 0.08 + 0.25 * (1 - L);
  const pesos = candidatos.map((c) => Math.exp(c.pontos / temperatura));
  let alvo = rnd() * pesos.reduce((s, x) => s + x, 0);
  let escolhido = candidatos[candidatos.length - 1];
  for (let i = 0; i < candidatos.length; i++) {
    alvo -= pesos[i];
    if (alvo <= 0) {
      escolhido = candidatos[i];
      break;
    }
  }

  const r = escolhido.no.rotulo;
  const justificativa: Record<Candidato["motivo"], string> = {
    avanco: `Toquei em "${r}" porque parece o próximo passo.`,
    objetivo: `Escolhi "${r}" porque é o que eu quero fazer.`,
    aceite: "Marquei que concordo para poder continuar.",
    menu: `Abri "${r}" para procurar a opção.`,
    recuo: "Voltei porque achei que errei o caminho.",
    desconhecido: "Toquei nesse ícone para ver o que acontece.",
    outro: `Toquei em "${r}".`,
  };
  const extra = (!escolhido.no.visivel_sem_rolar ? 1.5 : 0) + (!escolhido.no.texto_visivel ? 1 : 0);
  return { action_id: escolhido.no.action_id, justificativa: justificativa[escolhido.motivo], tempo_s: tempo(extra) };
}
