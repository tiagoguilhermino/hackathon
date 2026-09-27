/** Aleatoriedade reprodutível: a mesma semente gera a mesma base e a mesma simulação. */

export type Aleatorio = () => number;

/** mulberry32: gerador pequeno e rápido, suficiente para simulação (não para segurança). */
export function criarAleatorio(semente: number): Aleatorio {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deriva uma semente estável a partir de várias partes (FNV-1a de 32 bits). */
export function derivarSemente(...partes: (string | number)[]): number {
  let h = 0x811c9dc5;
  for (const ch of partes.join("|")) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function entre(rnd: Aleatorio, min: number, max: number): number {
  return min + (max - min) * rnd();
}

/** Normal padrão (Box-Muller). */
export function normal(rnd: Aleatorio, media = 0, desvio = 1): number {
  const u = Math.max(rnd(), 1e-12);
  const v = rnd();
  return media + desvio * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function limitar(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

export function escolherPonderado<T>(rnd: Aleatorio, itens: readonly T[], pesos: readonly number[]): T {
  const total = pesos.reduce((s, p) => s + p, 0);
  let alvo = rnd() * total;
  for (let i = 0; i < itens.length; i++) {
    alvo -= pesos[i];
    if (alvo <= 0) return itens[i];
  }
  return itens[itens.length - 1];
}

export function embaralhar<T>(rnd: Aleatorio, itens: T[]): T[] {
  const copia = [...itens];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
