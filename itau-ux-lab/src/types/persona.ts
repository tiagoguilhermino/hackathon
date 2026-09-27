/**
 * Módulo 1 — Persona Engine.
 * Esquema de um cliente sintético, particionado em 4 blocos estruturais.
 */

export const PROFESSIONS = [
  "servidor_publico",
  "clt",
  "autonomo",
  "empresario",
  "aposentado",
  "estudante",
] as const;
export type Profession = (typeof PROFESSIONS)[number];

export const AGE_BANDS = ["18-24", "25-39", "40-59", "60+"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const UFS = [
  "SP", "MG", "RJ", "BA", "PR", "RS", "PE", "CE", "PA", "SC",
  "GO", "MA", "AM", "ES", "PB", "RN", "MT", "AL", "PI", "DF",
  "MS", "SE", "RO", "TO", "AC", "AP", "RR",
] as const;
export type UF = (typeof UFS)[number];

export type FinancialProduct =
  | "cartao_credito"
  | "credito_pessoal"
  | "consignado"
  | "cdb"
  | "fundos"
  | "previdencia"
  | "seguro";

export type OperatingSystem = "iOS" | "Android";
export type DeviceTier = "low-end" | "high-end";

/** 1. Cadastral / Demográfico */
export interface DemographicProfile {
  age: number;
  ageBand: AgeBand;
  /** Renda mensal em BRL */
  income: number;
  profession: Profession;
  /** Literacia digital, escala contínua [0, 1] */
  digitalLiteracy: number;
}

/** 2. Histórico Financeiro */
export interface FinancialHistory {
  balance: number;
  monthlyTransactions: number;
  products: FinancialProduct[];
}

/** 3. Comportamento Digital */
export interface DigitalBehavior {
  /** Tempo médio de sessão em segundos */
  avgSessionSec: number;
  /** Taxa de rejeição típica [0, 1] */
  bounceRate: number;
}

/** 4. Segurança / Localização */
export interface SecurityProfile {
  os: OperatingSystem;
  deviceTier: DeviceTier;
  uf: UF;
}

export interface Persona {
  id: string;
  name: string;
  demographics: DemographicProfile;
  financial: FinancialHistory;
  digital: DigitalBehavior;
  security: SecurityProfile;
}

/**
 * Configuração da base sintética. Os pesos são relativos
 * (ex.: servidor_publico: 2, clt: 1 ⇒ 2x mais servidores que CLT).
 */
export interface PersonaGenerationConfig {
  size: number;
  seed: number;
  professionWeights: Record<Profession, number>;
  ageBandWeights: Record<AgeBand, number>;
}

export type SegmentDimension = "profession" | "ageBand" | "literacyBand" | "deviceTier";
export type LiteracyBand = "baixa" | "média" | "alta";
