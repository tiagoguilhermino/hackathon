import type {
  AgeBand,
  LiteracyBand,
  PersonaGenerationConfig,
  Profession,
  UF,
} from "@/types/persona";

export const PROFESSION_LABELS: Record<Profession, string> = {
  servidor_publico: "Servidor Público",
  clt: "CLT",
  autonomo: "Autônomo",
  empresario: "Empresário",
  aposentado: "Aposentado",
  estudante: "Estudante",
};

/** Faixas etárias permitidas por profissão (restrições de plausibilidade). */
export const PROFESSION_AGE_BANDS: Record<Profession, AgeBand[]> = {
  servidor_publico: ["25-39", "40-59", "60+"],
  clt: ["18-24", "25-39", "40-59", "60+"],
  autonomo: ["18-24", "25-39", "40-59", "60+"],
  empresario: ["25-39", "40-59", "60+"],
  aposentado: ["60+"],
  estudante: ["18-24"],
};

export const AGE_BAND_RANGES: Record<AgeBand, [number, number]> = {
  "18-24": [18, 24],
  "25-39": [25, 39],
  "40-59": [40, 59],
  "60+": [60, 85],
};

/** Renda mediana (BRL) e dispersão log-normal por profissão. */
export const INCOME_PARAMS: Record<Profession, { median: number; sigma: number }> = {
  servidor_publico: { median: 7500, sigma: 0.45 },
  clt: { median: 3400, sigma: 0.5 },
  autonomo: { median: 3000, sigma: 0.75 },
  empresario: { median: 12000, sigma: 0.8 },
  aposentado: { median: 2600, sigma: 0.55 },
  estudante: { median: 1200, sigma: 0.5 },
};

/** Ajuste aditivo de literacia digital por profissão. */
export const LITERACY_BIAS: Record<Profession, number> = {
  servidor_publico: 0,
  clt: 0,
  autonomo: -0.03,
  empresario: 0.05,
  aposentado: -0.08,
  estudante: 0.08,
};

/** Distribuição aproximada da população por UF (peso relativo). */
export const UF_WEIGHTS: Record<UF, number> = {
  SP: 22, MG: 10, RJ: 8, BA: 7, PR: 5.6, RS: 5.3, PE: 4.5, CE: 4.3, PA: 4, SC: 3.7,
  GO: 3.4, MA: 3.3, AM: 1.9, ES: 1.9, PB: 1.9, RN: 1.6, MT: 1.8, AL: 1.5, PI: 1.6, DF: 1.4,
  MS: 1.3, SE: 1.1, RO: 0.8, TO: 0.7, AC: 0.4, AP: 0.4, RR: 0.3,
};

export const DEFAULT_PERSONA_CONFIG: PersonaGenerationConfig = {
  size: 500,
  seed: 42,
  professionWeights: {
    servidor_publico: 2,
    clt: 1,
    autonomo: 1,
    empresario: 0.5,
    aposentado: 1,
    estudante: 0.5,
  },
  ageBandWeights: {
    "18-24": 1,
    "25-39": 2,
    "40-59": 2,
    "60+": 1.5,
  },
};

export function literacyBand(value: number): LiteracyBand {
  if (value < 0.4) return "baixa";
  if (value < 0.7) return "média";
  return "alta";
}

export const FIRST_NAMES = [
  "Ana", "João", "Maria", "José", "Francisca", "Antônio", "Luiza", "Carlos", "Juliana", "Paulo",
  "Fernanda", "Lucas", "Beatriz", "Rafael", "Camila", "Pedro", "Aline", "Marcos", "Patrícia", "Gabriel",
  "Sônia", "Raimundo", "Tereza", "Sebastião", "Larissa", "Matheus", "Vanessa", "Diego", "Helena", "Bruno",
];

export const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
  "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
];
