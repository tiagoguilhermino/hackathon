import type { Persona, Profession } from "@/types/persona";
import { createRng, hashSeed, shuffle } from "../random";

/**
 * Amostragem estratificada por profissão: o grupo de agentes preserva a
 * proporção observada na base sintética (método dos maiores restos).
 */
export function stratifiedSample(base: Persona[], count: number, seed: number): Persona[] {
  const rng = createRng(hashSeed(seed, 7919));
  const strata = new Map<Profession, Persona[]>();
  for (const p of base) {
    const key = p.demographics.profession;
    strata.set(key, [...(strata.get(key) ?? []), p]);
  }

  const n = Math.min(count, base.length);
  const quotas = [...strata.entries()].map(([key, members]) => {
    const exact = (members.length / base.length) * n;
    return { key, members, quota: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });

  let missing = n - quotas.reduce((s, q) => s + q.quota, 0);
  for (const q of [...quotas].sort((a, b) => b.remainder - a.remainder)) {
    if (missing <= 0) break;
    q.quota += 1;
    missing -= 1;
  }

  const sample = quotas.flatMap((q) => shuffle(rng, q.members).slice(0, q.quota));
  return shuffle(rng, sample);
}

export function countBy<T, K extends string>(items: T[], key: (item: T) => K): Partial<Record<K, number>> {
  const out: Partial<Record<K, number>> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
