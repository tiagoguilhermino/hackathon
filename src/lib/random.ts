/** PRNG determinístico (mulberry32) para simulações reprodutíveis. */
export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Combina inteiros em uma nova seed (usado para derivar seeds por agente/passo). */
export function hashSeed(...parts: number[]): number {
  let h = 2166136261;
  for (const p of parts) {
    h ^= p >>> 0;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function uniform(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(uniform(rng, min, max + 1));
}

/** Box–Muller */
export function normal(rng: Rng, mean = 0, std = 1): number {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function logNormal(rng: Rng, median: number, sigma: number): number {
  return median * Math.exp(normal(rng, 0, sigma));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function weightedPick<K extends string>(rng: Rng, weights: Partial<Record<K, number>>): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((s, [, w]) => s + Math.max(0, w), 0);
  let r = rng() * total;
  for (const [key, w] of entries) {
    r -= Math.max(0, w);
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

export function shuffle<T>(rng: Rng, items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
