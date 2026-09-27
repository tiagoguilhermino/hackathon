/**
 * Acessibilidade como dado: transforma a tela renderizada numa árvore JSON simples,
 * que é tudo o que o agente "vê". A carga cognitiva e o contraste são calculados por
 * regra (código), não pela IA.
 */

import type { ArvoreAcessibilidade, NoAcessivel, TelaId, TipoElemento } from "./tipos";

/** Termos técnicos que pesam para quem tem pouca familiaridade com banco e tecnologia. */
export const JARGOES = [
  "CET", "IOF", "Selic", "spread", "amortização", "Price", "SCR", "CCB", "pós-fixada", "nominal",
  "a.m.", "a.a.", "a.d.", "indexad", "encargos", "Sistema de Informações de Crédito",
];

export function encontrarJargoes(textos: string[]): string[] {
  const tudo = textos.join(" \n ");
  return JARGOES.filter((termo) => {
    const escapado = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const sensivel = /^[A-Z][A-Za-z]*$/.test(termo); // siglas e nomes próprios: CET, IOF, Selic, Price
    return new RegExp(sensivel ? `\\b${escapado}\\b` : escapado, sensivel ? "" : "i").test(tudo);
  });
}

function contarPalavras(textos: string[]): number {
  return textos.join(" ").split(/\s+/).filter(Boolean).length;
}

/**
 * Carga cognitiva de 0 a 1 (regra fixa, versão 1):
 * 35% volume de texto, 25% jargão, 15% número de opções,
 * 15% elementos escondidos (só ícone ou fora da tela) e 10% contraste baixo.
 */
export function calcularCargaCognitiva(a: Omit<ArvoreAcessibilidade, "carga_cognitiva">): number {
  const palavras = contarPalavras([a.titulo, ...a.textos, ...a.elementos.map((e) => e.rotulo)]);
  const escondidos = a.elementos.filter((e) => !e.texto_visivel || !e.visivel_sem_rolar).length;
  const carga =
    0.35 * Math.min(1, palavras / 150) +
    0.25 * Math.min(1, a.jargoes.length / 4) +
    0.15 * Math.min(1, a.elementos.length / 12) +
    0.15 * Math.min(1, escondidos / 3) +
    0.1 * (a.elementos.some((e) => e.contraste_baixo) ? 1 : 0);
  return Math.round(carga * 100) / 100;
}

// --------------------------------------------------------------------------- contraste (WCAG 2)

type RGBA = [number, number, number, number];

let contexto: CanvasRenderingContext2D | null = null;

/** Converte qualquer cor CSS (rgb, hex, oklch…) em RGBA usando um canvas de 1 pixel. */
function paraRGBA(cor: string): RGBA {
  if (!contexto) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    contexto = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!contexto) return [0, 0, 0, 1];
  contexto.clearRect(0, 0, 1, 1);
  contexto.fillStyle = "#000";
  contexto.fillStyle = cor;
  contexto.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = contexto.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

function misturar(frente: RGBA, fundo: RGBA): RGBA {
  const a = frente[3];
  return [
    frente[0] * a + fundo[0] * (1 - a),
    frente[1] * a + fundo[1] * (1 - a),
    frente[2] * a + fundo[2] * (1 - a),
    1,
  ];
}

function fundoEfetivo(el: Element): RGBA {
  const camadas: RGBA[] = [];
  for (let atual: Element | null = el; atual; atual = atual.parentElement) {
    const cor = paraRGBA(getComputedStyle(atual).backgroundColor);
    if (cor[3] > 0) camadas.push(cor);
    if (cor[3] >= 1) break;
  }
  return camadas.reduceRight<RGBA>((fundo, camada) => misturar(camada, fundo), [255, 255, 255, 1]);
}

function luminancia([r, g, b]: RGBA): number {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

export function razaoContraste(a: RGBA, b: RGBA): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Contraste abaixo do mínimo WCAG AA: 4,5 para texto comum, 3 para texto grande e ícones. */
function contrasteBaixo(el: HTMLElement, temTexto: boolean): boolean {
  const estilo = getComputedStyle(el);
  const fundo = fundoEfetivo(el);
  const frente = misturar(paraRGBA(estilo.color), fundo);
  const tamanho = parseFloat(estilo.fontSize);
  const peso = Number(estilo.fontWeight) || 400;
  const grande = tamanho >= 24 || (tamanho >= 18.66 && peso >= 700);
  const minimo = temTexto && !grande ? 4.5 : 3;
  return razaoContraste(frente, fundo) < minimo;
}

// --------------------------------------------------------------------------- exportação

function textoDe(el: HTMLElement): string {
  return (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
}

/**
 * Lê a tela renderizada dentro de `raiz` (a área rolável do celular) e devolve a árvore.
 * Só roda no navegador.
 */
export function exportarArvore(raiz: HTMLElement): ArvoreAcessibilidade {
  const areaTela = raiz.querySelector<HTMLElement>("[data-tela]");
  const tela = (areaTela?.dataset.tela ?? "home") as TelaId;
  const titulo = textoDe(raiz.querySelector<HTMLElement>("h1") ?? raiz);
  const caixa = raiz.getBoundingClientRect();
  const alturaVisivel = raiz.clientHeight;

  const textos = Array.from(raiz.querySelectorAll<HTMLElement>("[data-leitura]"))
    .map(textoDe)
    .filter(Boolean);

  const elementos: NoAcessivel[] = Array.from(raiz.querySelectorAll<HTMLElement>("[data-action-id]")).map((el) => {
    const r = el.getBoundingClientRect();
    const texto = textoDe(el);
    const somenteIcone = el.dataset.somenteIcone === "true" || texto.length === 0;
    const rotulo = somenteIcone ? el.getAttribute("aria-label") ?? texto : texto;
    const topoNaArea = r.top - caixa.top;
    const alvo = somenteIcone ? (el.querySelector<HTMLElement>("svg") as unknown as HTMLElement) ?? el : el;
    return {
      action_id: el.dataset.actionId!,
      tipo: (el.dataset.tipo as TipoElemento) ?? "botao",
      rotulo,
      texto_visivel: !somenteIcone,
      posicao: {
        x: Math.round(r.left - caixa.left),
        y: Math.round(topoNaArea + raiz.scrollTop),
        largura: Math.round(r.width),
        altura: Math.round(r.height),
      },
      visivel_sem_rolar: topoNaArea + r.height <= alturaVisivel && topoNaArea >= 0,
      habilitado: !(el as HTMLButtonElement).disabled && el.getAttribute("aria-disabled") !== "true",
      selecionado:
        el.getAttribute("aria-pressed") === "true" || el.getAttribute("aria-checked") === "true" || undefined,
      contraste_baixo: contrasteBaixo(alvo, !somenteIcone),
    };
  });

  const jargoes = encontrarJargoes([titulo, ...textos, ...elementos.map((e) => e.rotulo)]);
  const parcial = {
    tela,
    titulo,
    textos,
    elementos,
    jargoes,
    viewport: { largura: raiz.clientWidth, altura: alturaVisivel },
  };
  return { ...parcial, carga_cognitiva: calcularCargaCognitiva(parcial) };
}
