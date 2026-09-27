/**
 * Módulo 1 · Persona Engine: base SINTÉTICA de clientes de um banco fictício.
 *
 * Nenhum dado aqui é real nem calibrado com dados de clientes. As relações entre as
 * variáveis (idade → literacia digital, renda → aparelho, etc.) são HIPÓTESES de
 * modelagem, escolhidas para gerar variedade plausível. A proporção entre profissões
 * é configurável e respeitada exatamente (método dos maiores restos).
 */

import type { ConfigBase, Persona, Profissao, ProporcaoProfissoes, UF } from "./tipos";
import { criarAleatorio, embaralhar, entre, escolherPonderado, limitar, normal, type Aleatorio } from "./rng";

export const PROFISSOES: Profissao[] = ["servidor_publico", "clt", "autonomo", "aposentado", "estudante"];

export const ROTULO_PROFISSAO: Record<Profissao, string> = {
  servidor_publico: "Servidor público",
  clt: "CLT",
  autonomo: "Autônomo",
  aposentado: "Aposentado",
  estudante: "Estudante",
};

export const PROPORCAO_PADRAO: ProporcaoProfissoes = {
  servidor_publico: 2,
  clt: 1,
  autonomo: 1,
  aposentado: 1,
  estudante: 1,
};

// Idade (média, desvio, mínimo, máximo) e renda mediana por profissão. Hipóteses de modelagem.
const PERFIL_PROFISSAO: Record<Profissao, { idade: [number, number, number, number]; renda: number }> = {
  servidor_publico: { idade: [44, 10, 23, 68], renda: 7000 },
  clt: { idade: [35, 9, 18, 64], renda: 3200 },
  autonomo: { idade: [41, 11, 18, 72], renda: 3500 },
  aposentado: { idade: [69, 6, 56, 90], renda: 2600 },
  estudante: { idade: [21, 3, 17, 30], renda: 1200 },
};

// Pesos aproximados por UF, só para variar a amostra (não calibrados).
const PESOS_UF: [UF, number][] = [
  ["SP", 22], ["MG", 10], ["RJ", 8], ["BA", 7], ["PR", 5.5], ["RS", 5.3], ["PE", 4.5], ["CE", 4.3],
  ["PA", 4], ["SC", 3.7], ["GO", 3.4], ["MA", 3.2], ["AM", 1.9], ["ES", 1.9], ["PB", 1.9], ["MT", 1.8],
  ["RN", 1.6], ["PI", 1.6], ["AL", 1.5], ["DF", 1.4], ["MS", 1.4], ["SE", 1.1], ["RO", 0.8], ["TO", 0.7],
  ["AC", 0.4], ["AP", 0.4], ["RR", 0.3],
];

const NOMES = [
  "Ana", "Bruno", "Carla", "Diego", "Elisa", "Fábio", "Gabriela", "Heitor", "Irene", "João",
  "Karina", "Lucas", "Marta", "Nelson", "Olívia", "Paulo", "Quitéria", "Rafael", "Sônia", "Tiago",
  "Úrsula", "Vítor", "Wanda", "Yara", "Zeca",
];

/** Divide `total` entre as profissões na proporção pedida, com contagens inteiras exatas. */
export function distribuirProfissoes(total: number, proporcao: ProporcaoProfissoes): Record<Profissao, number> {
  const soma = PROFISSOES.reduce((s, p) => s + Math.max(0, proporcao[p] ?? 0), 0);
  if (total < 0 || !Number.isInteger(total)) throw new Error("A quantidade de personas precisa ser um inteiro ≥ 0.");
  if (soma <= 0) throw new Error("Defina pelo menos uma profissão com peso maior que zero.");
  const cotas = PROFISSOES.map((p) => ({ p, exata: (total * Math.max(0, proporcao[p] ?? 0)) / soma }));
  const contagem = Object.fromEntries(cotas.map(({ p, exata }) => [p, Math.floor(exata)])) as Record<Profissao, number>;
  let faltam = total - Object.values(contagem).reduce((s, n) => s + n, 0);
  const porResto = [...cotas].sort((a, b) => b.exata - Math.floor(b.exata) - (a.exata - Math.floor(a.exata)));
  for (const { p } of porResto) {
    if (faltam <= 0) break;
    if ((proporcao[p] ?? 0) > 0) {
      contagem[p] += 1;
      faltam -= 1;
    }
  }
  return contagem;
}

function arredondar(valor: number, passo: number): number {
  return Math.round(valor / passo) * passo;
}

function gerarPersona(rnd: Aleatorio, indice: number, profissao: Profissao): Persona {
  const perfil = PERFIL_PROFISSAO[profissao];
  const [mediaIdade, desvioIdade, minIdade, maxIdade] = perfil.idade;
  const idade = Math.round(limitar(normal(rnd, mediaIdade, desvioIdade), minIdade, maxIdade));
  const renda = arredondar(perfil.renda * Math.exp(normal(rnd, 0, 0.45)), 50);

  // Hipótese: a literacia digital cai com a idade e sobe um pouco com a renda.
  const literacia = limitar(
    0.95 - 0.012 * Math.max(0, idade - 22) + 0.06 * Math.log10(renda / 2500) + normal(rnd, 0, 0.1),
    0.05,
    1,
  );

  const saldo = arredondar(renda * Math.exp(normal(rnd, 0, 0.8)) * 0.8, 10);
  const altaRenda = renda >= 6000;
  return {
    id: `P${String(indice + 1).padStart(3, "0")}`,
    apelido: `${NOMES[indice % NOMES.length]} ${String.fromCharCode(65 + ((indice * 7) % 26))}.`,
    cadastral: {
      idade,
      renda_mensal: renda,
      profissao,
      literacia_digital: Math.round(literacia * 100) / 100,
    },
    financeiro: {
      saldo,
      transacoes_mensais: Math.max(1, Math.round(8 + 55 * literacia * entre(rnd, 0.5, 1.4))),
      produtos: {
        cartao_credito: rnd() < (altaRenda ? 0.9 : 0.55),
        emprestimo_ativo: rnd() < 0.25,
        investimentos: rnd() < (altaRenda ? 0.7 : 0.2),
      },
    },
    digital: {
      tempo_medio_sessao_min: Math.round(limitar(2 + 6 * (1 - literacia) + normal(rnd, 0, 1), 1, 15) * 10) / 10,
      taxa_rejeicao: Math.round(limitar(0.1 + 0.4 * (1 - literacia) + normal(rnd, 0, 0.05), 0.02, 0.9) * 100) / 100,
    },
    seguranca: {
      sistema: rnd() < (altaRenda ? 0.55 : 0.15) ? "iOS" : "Android",
      gama: rnd() < (altaRenda ? 0.8 : 0.3) ? "high-end" : "low-end",
      uf: escolherPonderado(rnd, PESOS_UF.map(([uf]) => uf), PESOS_UF.map(([, peso]) => peso)),
    },
  };
}

/** Gera a base sintética. Mesma configuração e mesma semente → mesma base. */
export function gerarBase(config: ConfigBase): Persona[] {
  const rnd = criarAleatorio(config.semente);
  const contagem = distribuirProfissoes(config.quantidade, config.proporcao);
  const profissoes = embaralhar(
    rnd,
    PROFISSOES.flatMap((p) => Array.from({ length: contagem[p] }, () => p)),
  );
  return profissoes.map((p, i) => gerarPersona(rnd, i, p));
}

// --------------------------------------------------------------------------- segmentos

export function faixaEtaria(idade: number): string {
  if (idade < 30) return "18–29";
  if (idade < 45) return "30–44";
  if (idade < 60) return "45–59";
  return "60+";
}

export function faixaLiteracia(literacia: number): string {
  if (literacia < 0.4) return "Baixa (< 0,4)";
  if (literacia < 0.7) return "Média (0,4–0,7)";
  return "Alta (≥ 0,7)";
}

export function rotuloDispositivo(p: Persona): string {
  return `${p.seguranca.sistema} ${p.seguranca.gama}`;
}

export function descreverPersona(p: Persona): string {
  const c = p.cadastral;
  return `${p.apelido} · ${ROTULO_PROFISSAO[c.profissao]}, ${c.idade} anos, literacia digital ${c.literacia_digital.toFixed(2)}`;
}
