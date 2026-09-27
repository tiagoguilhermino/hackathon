/**
 * Pagamentos do Lume (tudo fictício): boleto, contas de consumo e fatura do cartão.
 *
 * As opções seguem categorias do padrão público do Open Finance Brasil que a pesquisa do time
 * levantou (output/rodada-1/00-consolidado.md): os tipos de transação BOLETO e
 * CONVENIO_ARRECADACAO (U13) e a fatura do cartão com valor total (U21).
 * Os códigos são montados com os dígitos verificadores do padrão de boletos (módulo 10 e 11),
 * mas usam o banco "999", que não é de nenhuma instituição real.
 */

/** "Hoje" do protótipo, igual ao usado nos comprovantes do app. */
export const HOJE_FICTICIO = "2026-09-26";
export const SALDO_FICTICIO = 8247.53;
export const BANCO_FICTICIO = "999";

const DIA_MS = 86_400_000;
/** O fator de vencimento dos boletos recomeçou em 1000 em 22/02/2025. */
const BASE_DO_FATOR = Date.UTC(2025, 1, 22);

export function somenteDigitos(texto: string): string {
  return texto.replace(/\D/g, "");
}

export function formatarReais(valor: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

/** Valor digitado do jeito brasileiro: "3.000", "1.234,56", "250" ou "R$ 99,90". Inválido → NaN. */
export function lerValorEmReais(texto: string): number {
  const limpo = texto.replace(/[^\d,.]/g, "");
  if (!limpo) return Number.NaN;
  if (limpo.includes(",")) return Number(limpo.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) return Number(limpo.replace(/\./g, ""));
  return Number(limpo);
}

/** "2026-10-05" → "05/10/2026" (sem fuso horário). */
export function formatarData(iso: string): string {
  const [ano = "", mes = "", dia = ""] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function paraUtc(iso: string): number {
  const [ano = 0, mes = 1, dia = 1] = iso.split("-").map(Number);
  return Date.UTC(ano, mes - 1, dia);
}

export function somarDias(iso: string, dias: number): string {
  return new Date(paraUtc(iso) + dias * DIA_MS).toISOString().slice(0, 10);
}

// --------------------------------------------------------------------------- dígitos verificadores

/** Módulo 10: dígito de cada campo da linha digitável (pesos 2 e 1, da direita para a esquerda). */
export function modulo10(numero: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = numero.length - 1; i >= 0; i -= 1) {
    let parcial = Number(numero.charAt(i)) * peso;
    if (parcial > 9) parcial = Math.floor(parcial / 10) + (parcial % 10);
    soma += parcial;
    peso = peso === 2 ? 1 : 2;
  }
  return (10 - (soma % 10)) % 10;
}

/** Módulo 11: dígito geral do código de barras do boleto (pesos 2 a 9). */
export function modulo11Boleto(numero: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = numero.length - 1; i >= 0; i -= 1) {
    soma += Number(numero.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const digito = 11 - (soma % 11);
  return digito === 0 || digito === 10 || digito === 11 ? 1 : digito;
}

export function fatorDeVencimento(iso: string): string {
  const dias = Math.round((paraUtc(iso) - BASE_DO_FATOR) / DIA_MS);
  return String(1000 + dias).padStart(4, "0");
}

export function dataDoFator(fator: number): string | null {
  if (fator < 1000) return null;
  return new Date(BASE_DO_FATOR + (fator - 1000) * DIA_MS).toISOString().slice(0, 10);
}

// --------------------------------------------------------------------------- montar códigos

/** Linha digitável de boleto bancário (47 números). campoLivre tem 25 números. */
export function montarLinhaDigitavel(
  banco: string,
  vencimento: string,
  valorEmCentavos: number,
  campoLivre: string,
): string {
  const fator = fatorDeVencimento(vencimento);
  const valor = String(valorEmCentavos).padStart(10, "0");
  const digitoGeral = modulo11Boleto(`${banco}9${fator}${valor}${campoLivre}`);
  const campo1 = `${banco}9${campoLivre.slice(0, 5)}`;
  const campo2 = campoLivre.slice(5, 15);
  const campo3 = campoLivre.slice(15, 25);
  return (
    `${campo1}${modulo10(campo1)}${campo2}${modulo10(campo2)}${campo3}${modulo10(campo3)}` +
    `${digitoGeral}${fator}${valor}`
  );
}

/**
 * Código de conta de consumo (arrecadação, 48 números, começa com 8). segmento: 3 = energia e
 * gás, 4 = telecomunicações. O "6" diz que o valor é real e que os dígitos usam módulo 10.
 */
export function montarCodigoDeConta(
  segmento: string,
  valorEmCentavos: number,
  empresa: string,
  campoLivre: string,
): string {
  const valor = String(valorEmCentavos).padStart(11, "0");
  const digitoGeral = modulo10(`8${segmento}6${valor}${empresa}${campoLivre}`);
  const barras = `8${segmento}6${digitoGeral}${valor}${empresa}${campoLivre}`;
  return [0, 11, 22, 33]
    .map((inicio) => {
      const bloco = barras.slice(inicio, inicio + 11);
      return `${bloco}${modulo10(bloco)}`;
    })
    .join("");
}

export function formatarCodigo(digitos: string): string {
  if (digitos.length === 47) {
    const d = digitos;
    return `${d.slice(0, 5)}.${d.slice(5, 10)} ${d.slice(10, 15)}.${d.slice(15, 21)} ${d.slice(21, 26)}.${d.slice(26, 32)} ${d.slice(32, 33)} ${d.slice(33)}`;
  }
  if (digitos.length === 48) {
    return [0, 12, 24, 36]
      .map((inicio) => `${digitos.slice(inicio, inicio + 11)}-${digitos.charAt(inicio + 11)}`)
      .join(" ");
  }
  return digitos;
}

// --------------------------------------------------------------------------- ler códigos

export type CodigoLido =
  | {
      ok: true;
      tipo: "boleto";
      digitos: string;
      banco: string;
      valor: number;
      vencimento: string | null;
    }
  | { ok: true; tipo: "conta"; digitos: string; segmento: string; valor: number | null }
  | { ok: false; erro: string };

/** Confere o código digitado ou colado, como um app de banco faz antes de mostrar o pagamento. */
export function lerCodigo(texto: string): CodigoLido {
  const d = somenteDigitos(texto);
  if (d.length === 0) return { ok: false, erro: "Digite, cole ou leia o código de barras." };

  if (d.startsWith("8")) {
    if (d.length !== 48) {
      return { ok: false, erro: `Código de conta tem 48 números, e este tem ${d.length}.` };
    }
    const blocos = [0, 12, 24, 36].map((inicio) => d.slice(inicio, inicio + 11));
    const digitos = [11, 23, 35, 47].map((posicao) => Number(d.charAt(posicao)));
    const modo = d.charAt(2);
    if (modo === "6" || modo === "8") {
      const errado = blocos.findIndex((bloco, i) => modulo10(bloco) !== digitos[i]);
      if (errado >= 0) {
        return {
          ok: false,
          erro: `O ${errado + 1}º bloco do código não confere. Confira os números.`,
        };
      }
    }
    const barras = blocos.join("");
    const valor = modo === "6" || modo === "7" ? Number(barras.slice(4, 15)) / 100 : null;
    return { ok: true, tipo: "conta", digitos: d, segmento: d.charAt(1), valor };
  }

  if (d.length !== 47) {
    return { ok: false, erro: `Código de boleto tem 47 números, e este tem ${d.length}.` };
  }
  const campo1 = d.slice(0, 9);
  const campo2 = d.slice(10, 20);
  const campo3 = d.slice(21, 31);
  const camposConferem =
    modulo10(campo1) === Number(d.charAt(9)) &&
    modulo10(campo2) === Number(d.charAt(20)) &&
    modulo10(campo3) === Number(d.charAt(31));
  if (!camposConferem) {
    return { ok: false, erro: "Algum número do código não confere. Confira e digite de novo." };
  }
  const banco = d.slice(0, 3);
  const fator = d.slice(33, 37);
  const valor = d.slice(37, 47);
  const campoLivre = `${d.slice(4, 9)}${campo2}${campo3}`;
  if (
    modulo11Boleto(`${banco}${d.charAt(3)}${fator}${valor}${campoLivre}`) !== Number(d.charAt(32))
  ) {
    return { ok: false, erro: "O dígito verificador do boleto não confere. Confira os números." };
  }
  return {
    ok: true,
    tipo: "boleto",
    digitos: d,
    banco,
    valor: Number(valor) / 100,
    vencimento: dataDoFator(Number(fator)),
  };
}

// --------------------------------------------------------------------------- dados do protótipo

export type BoletoConhecido = { beneficiario: string; descricao: string; digitos: string };

/** O boleto "recebido" que o botão "Colar código recebido" cola (tarefa T7 do laboratório). */
export const BOLETO_DA_ESCOLA: BoletoConhecido = {
  beneficiario: "Escola Aprender Mais",
  descricao: "Mensalidade de outubro",
  digitos: montarLinhaDigitavel(BANCO_FICTICIO, "2026-10-05", 35000, "1234567890123456789012345"),
};

export type ContaAVencer = {
  id: string;
  nome: string;
  empresa: string;
  valor: number;
  vencimento: string;
  vencimentoTexto: string;
  icone: "energia" | "celular";
  digitos: string;
};

/** Contas no CPF do cliente (as mesmas de "Próximos pagamentos" na tela inicial). */
export const CONTAS_A_VENCER: readonly ContaAVencer[] = [
  {
    id: "energia",
    nome: "Energia",
    empresa: "Energia Clara Distribuidora",
    valor: 184.7,
    vencimento: "2026-09-27",
    vencimentoTexto: "Vence amanhã",
    icone: "energia",
    digitos: montarCodigoDeConta("3", 18470, "0123", "2026092700000000000456789"),
  },
  {
    id: "celular",
    nome: "Celular",
    empresa: "Conecta Telecom",
    valor: 69.9,
    vencimento: "2026-10-02",
    vencimentoTexto: "Vence 02 out",
    icone: "celular",
    digitos: montarCodigoDeConta("4", 6990, "0456", "2026100200000000000123456"),
  },
];

export const FATURA_DO_CARTAO = {
  cartao: "Cartão final 4821",
  valor: 1893.42,
  limite: 7500,
  fechamento: "Fecha em 8 dias",
};

/** Quem recebe: nome conhecido do protótipo, ou um nome genérico (como a consulta do banco faria). */
export function beneficiarioDoCodigo(digitos: string): string {
  if (digitos === BOLETO_DA_ESCOLA.digitos) return BOLETO_DA_ESCOLA.beneficiario;
  const conta = CONTAS_A_VENCER.find((c) => c.digitos === digitos);
  if (conta) return conta.empresa;
  return digitos.startsWith("8") ? "Empresa conveniada (consultada)" : "Beneficiário Exemplo LTDA";
}

/** Autenticação fictícia do comprovante, estável para o mesmo pagamento. */
export function autenticacao(prefixo: string, semente: string): string {
  let soma = 0;
  for (const caractere of semente) soma = (soma * 31 + caractere.charCodeAt(0)) % 1_000_000;
  return `${prefixo}-${HOJE_FICTICIO.replaceAll("-", "")}-${String(soma).padStart(6, "0")}`;
}
