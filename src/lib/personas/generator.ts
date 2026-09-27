import type {
  AgeBand,
  FinancialProduct,
  Persona,
  PersonaGenerationConfig,
  Profession,
} from "@/types/persona";
import {
  AGE_BAND_RANGES,
  FIRST_NAMES,
  INCOME_PARAMS,
  LAST_NAMES,
  LITERACY_BIAS,
  PROFESSION_AGE_BANDS,
  UF_WEIGHTS,
} from "./config";
import { clamp, createRng, logNormal, normal, pick, randInt, weightedPick, type Rng } from "../random";

const round2 = (v: number) => Math.round(v * 100) / 100;
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

function sampleAgeBand(rng: Rng, profession: Profession, weights: Record<AgeBand, number>): AgeBand {
  const allowed = PROFESSION_AGE_BANDS[profession];
  const restricted: Partial<Record<AgeBand, number>> = {};
  for (const band of allowed) restricted[band] = weights[band];
  const total = Object.values(restricted).reduce((s, w) => s + (w ?? 0), 0);
  // Se o usuário zerou todas as faixas compatíveis, cai para distribuição uniforme nelas.
  if (total <= 0) return pick(rng, allowed);
  return weightedPick(rng, restricted);
}

function sampleProducts(rng: Rng, income: number, literacy: number, profession: Profession): FinancialProduct[] {
  const wealth = Math.log10(Math.max(income, 500)); // ~2.7 .. 4.5
  const products: FinancialProduct[] = [];
  const chance = (p: number) => rng() < clamp(p, 0, 1);
  if (chance(0.45 + 0.12 * (wealth - 3))) products.push("cartao_credito");
  if (chance(0.25 - 0.05 * (wealth - 3.5))) products.push("credito_pessoal");
  if ((profession === "servidor_publico" || profession === "aposentado") && chance(0.45)) products.push("consignado");
  if (chance(0.1 + 0.25 * (wealth - 3) + 0.1 * literacy)) products.push("cdb");
  if (chance(0.05 + 0.2 * (wealth - 3.3))) products.push("fundos");
  if (chance(0.05 + 0.15 * (wealth - 3.3))) products.push("previdencia");
  if (chance(0.2)) products.push("seguro");
  return products;
}

export function generatePersona(rng: Rng, index: number, config: PersonaGenerationConfig): Persona {
  // 1. Cadastral / Demográfico
  const profession = weightedPick(rng, config.professionWeights);
  const ageBand = sampleAgeBand(rng, profession, config.ageBandWeights);
  const [minAge, maxAge] = AGE_BAND_RANGES[ageBand];
  const age = randInt(rng, minAge, maxAge);

  const { median, sigma } = INCOME_PARAMS[profession];
  const income = Math.round(logNormal(rng, median, sigma) / 10) * 10;

  // 4. Dispositivo (correlacionado com renda)
  const highEnd = rng() < sigmoid((Math.log(income) - Math.log(4500)) * 1.6);
  const iOS = rng() < (highEnd ? 0.55 : 0.12);

  // Literacia: decai com a idade, ajustada por profissão e dispositivo, com ruído.
  const literacy = clamp(
    0.92 - 0.011 * Math.max(0, age - 25) + LITERACY_BIAS[profession] + (highEnd ? 0.05 : -0.03) + normal(rng, 0, 0.1),
    0.03,
    0.99,
  );

  // 2. Histórico Financeiro
  const balance = Math.round(income * logNormal(rng, 0.9, 0.9) * 100) / 100;
  const monthlyTransactions = Math.max(2, Math.round(8 + literacy * 55 + normal(rng, 0, 8)));

  // 3. Comportamento Digital
  const avgSessionSec = Math.round(clamp(90 + (1 - literacy) * 180 + normal(rng, 0, 30), 30, 600));
  const bounceRate = round2(clamp(0.55 - 0.4 * literacy + normal(rng, 0, 0.07), 0.03, 0.9));

  return {
    id: `P${String(index + 1).padStart(4, "0")}`,
    name: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
    demographics: { age, ageBand, income, profession, digitalLiteracy: round2(literacy) },
    financial: { balance, monthlyTransactions, products: sampleProducts(rng, income, literacy, profession) },
    digital: { avgSessionSec, bounceRate },
    security: {
      os: iOS ? "iOS" : "Android",
      deviceTier: highEnd ? "high-end" : "low-end",
      uf: weightedPick(rng, UF_WEIGHTS),
    },
  };
}

/** Gera a base de clientes sintética respeitando as proporções configuradas. */
export function generatePersonaBase(config: PersonaGenerationConfig): Persona[] {
  const rng = createRng(config.seed);
  return Array.from({ length: config.size }, (_, i) => generatePersona(rng, i, config));
}
