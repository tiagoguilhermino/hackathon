/**
 * Laboratório de cenários da vila de personas.
 *
 * A dashboard do Lume foi separada em quatro peças que se combinam: como ficam as transferências,
 * onde fica o boleto, onde ficam "minhas chaves" (receber por Pix) e se "Pagar boleto" e "Fatura"
 * têm atalhos próprios ou ficam dentro de "Pagar". Com o fluxo do Pix e a versão
 * da recorrência, elas formam uma combinação. As Dash V1, V2 e V3 são combinações prontas.
 * Um cenário é uma tarefa + uma combinação. Tudo aqui é fictício e serve para testar telas.
 *
 * O documento vila-de-personas/docs/cenarios-interfaces.md descreve os mesmos cenários.
 */

export type ModoTransferencias = "separadas" | "unificadas";
export type ModoBoleto = "deposito" | "atalho";
export type ModoChaves = "deposito" | "pix";
/**
 * "separadas": atalhos "Pagar boleto" e "Fatura" na tela inicial, sem atalho para as contas a
 * vencer, que já aparecem em "Próximos pagamentos". "unificadas": um atalho "Pagar" com tudo.
 */
export type ModoPagar = "separadas" | "unificadas";
export type FluxoPix = "fluxo1" | "fluxo2";
export type VersaoRecorrencia = "A" | "B" | "C";

/** As peças da dashboard. */
export type Dashboard = {
  transferencias: ModoTransferencias;
  boleto: ModoBoleto;
  chaves: ModoChaves;
  pagar: ModoPagar;
};

/** Uma combinação completa de interface. */
export type Combinacao = Dashboard & {
  fluxo: FluxoPix;
  recorrencia: VersaoRecorrencia;
};

export type PresetId = "v1" | "v2" | "v3";

export const IDS_DOS_PRESETS: readonly PresetId[] = ["v1", "v2", "v3"];

export const PRESETS: Record<PresetId, Dashboard> = {
  v1: { transferencias: "separadas", boleto: "deposito", chaves: "deposito", pagar: "unificadas" },
  v2: { transferencias: "separadas", boleto: "atalho", chaves: "pix", pagar: "unificadas" },
  // Na V3 original, "Depositar" abria uma janela vazia. Aqui ele leva ao boleto e à
  // portabilidade; "minhas chaves" continua dentro do Pix, como antes.
  v3: { transferencias: "unificadas", boleto: "deposito", chaves: "pix", pagar: "unificadas" },
};

export const NOMES_DOS_PRESETS: Record<PresetId, string> = {
  v1: "Dash V1",
  v2: "Dash V2",
  v3: "Dash V3",
};

export const COMBINACAO_PADRAO: Combinacao = { ...PRESETS.v3, fluxo: "fluxo2", recorrencia: "A" };

export function ehPreset(valor: string): valor is PresetId {
  return valor === "v1" || valor === "v2" || valor === "v3";
}

export function mesmaDashboard(a: Dashboard, b: Dashboard): boolean {
  return (
    a.transferencias === b.transferencias &&
    a.boleto === b.boleto &&
    a.chaves === b.chaves &&
    a.pagar === b.pagar
  );
}

export function mesmaCombinacao(a: Combinacao, b: Combinacao): boolean {
  return mesmaDashboard(a, b) && a.fluxo === b.fluxo && a.recorrencia === b.recorrencia;
}

export function presetDe(dashboard: Dashboard): PresetId | null {
  return IDS_DOS_PRESETS.find((id) => mesmaDashboard(PRESETS[id], dashboard)) ?? null;
}

// --------------------------------------------------------------------------- atalhos

export type RotuloAtalho =
  | "Pix"
  | "Transferir"
  | "Pagar"
  | "Pagar boleto"
  | "Fatura"
  | "TED/DOC"
  | "Depositar"
  | "Boleto"
  | "Empréstimos";

/** No celular a grade tem 4 atalhos por linha; a partir do 5º, eles vão para a 2ª linha. */
export const ATALHOS_POR_LINHA_NO_CELULAR = 4;

export function temMenuDepositar(dashboard: Dashboard): boolean {
  return dashboard.boleto === "deposito" || dashboard.chaves === "deposito";
}

/**
 * Atalhos da tela inicial, na ordem. Mantém a ordem das Dash V1, V2 e V3 originais, sem a
 * Recarga (retirada a pedido do time). Todos têm função: nenhum fica escondido no celular.
 */
export function atalhosDaDashboard(dashboard: Dashboard): RotuloAtalho[] {
  const pagar: RotuloAtalho[] =
    dashboard.pagar === "separadas" ? ["Pagar boleto", "Fatura"] : ["Pagar"];
  const atalhos: RotuloAtalho[] =
    dashboard.transferencias === "separadas"
      ? ["Pix", ...pagar, "TED/DOC"]
      : ["Transferir", ...pagar];
  if (temMenuDepositar(dashboard)) atalhos.push("Depositar");
  if (dashboard.boleto === "atalho") atalhos.push("Boleto");
  atalhos.push("Empréstimos");
  return atalhos;
}

/** Em que linha de atalhos do celular fica um atalho (1 ou 2), ou null se não existir. */
export function linhaNoCelular(rotulo: RotuloAtalho, dashboard: Dashboard): number | null {
  const posicao = atalhosDaDashboard(dashboard).indexOf(rotulo);
  return posicao < 0 ? null : Math.floor(posicao / ATALHOS_POR_LINHA_NO_CELULAR) + 1;
}

export type Aviso = { tipo: "incoerente" | "observacao"; texto: string };

export function avisosDaDashboard(dashboard: Dashboard): Aviso[] {
  const avisos: Aviso[] = [];
  const segundaLinha = atalhosDaDashboard(dashboard).slice(ATALHOS_POR_LINHA_NO_CELULAR);
  if (segundaLinha.length > 0) {
    avisos.push({
      tipo: "observacao",
      texto: `no celular, os atalhos ocupam 2 linhas; na 2ª ficam "${segundaLinha.join('" e "')}".`,
    });
  }
  if (!temMenuDepositar(dashboard)) {
    avisos.push({
      tipo: "observacao",
      texto:
        "sem o atalho Depositar, a portabilidade de salário fica sem acesso (como na Dash V2).",
    });
  }
  if (dashboard.transferencias === "unificadas") {
    avisos.push({
      tipo: "observacao",
      texto:
        "o botão Pix da barra de baixo continua abrindo o Pix direto, sem passar por Transferir.",
    });
  }
  return avisos;
}

export function dashboardCoerente(dashboard: Dashboard): boolean {
  return avisosDaDashboard(dashboard).every((aviso) => aviso.tipo !== "incoerente");
}

export function descreverDashboard(dashboard: Dashboard): string {
  const preset = presetDe(dashboard);
  const partes = [
    dashboard.transferencias === "separadas" ? "Pix e TED separados" : "Pix e TED em Transferir",
    dashboard.boleto === "atalho" ? "Boleto com atalho próprio" : "Boleto no Depositar",
    dashboard.chaves === "pix" ? "Minhas chaves dentro do Pix" : "Minhas chaves no Depositar",
    dashboard.pagar === "separadas"
      ? "Pagar boleto e Fatura separados"
      : "Boleto e fatura em Pagar",
  ].join(" · ");
  return preset ? `${NOMES_DOS_PRESETS[preset]}: ${partes}` : `Combinação nova: ${partes}`;
}

// --------------------------------------------------------------------------- tarefas e cenários

export type TarefaId = "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8" | "T9";

export const TAREFAS_EM_ORDEM: readonly TarefaId[] = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
];

/** A frase é a mesma para todas as personas e para as pessoas do teste. */
export const TAREFAS: Record<TarefaId, { nome: string; frase: string }> = {
  T1: {
    nome: "Pix para contato",
    frase: "Mande R$ 250 por Pix para Ana Paula Souza, celular (11) 98765-4321.",
  },
  T2: {
    nome: "Pix recorrente",
    frase:
      "Deixe um Pix de R$ 250 para Ana Paula Souza, celular (11) 98765-4321, se repetindo todo mês.",
  },
  T3: {
    nome: "Pagar com Copia e Cola",
    frase: "Pague esta conta com o código Pix Copia e Cola que você recebeu.",
  },
  T4: {
    nome: "TED",
    frase: "Transfira R$ 300 para Marcos Oliveira, agência 1234, conta 56789-0.",
  },
  T5: { nome: "Receber (minha chave)", frase: "Mostre sua chave Pix para alguém te pagar." },
  T6: { nome: "Boleto de depósito", frase: "Gere um boleto para colocar R$ 100 na sua conta." },
  T7: {
    nome: "Pagar boleto",
    frase: "Pague o boleto da escola, de R$ 350,00, com o código que você recebeu.",
  },
  T8: { nome: "Pagar conta de luz", frase: "Pague a conta de luz que vence amanhã." },
  T9: {
    nome: "Simular empréstimo",
    frase: "Veja de quanto fica a parcela de um empréstimo de R$ 3.000 em 12 vezes.",
  },
};

export type TipoDeCenario = "normal" | "incorreto";

export type Cenario = {
  id: string;
  tarefa: TarefaId;
  combinacao: Combinacao;
  tipo: TipoDeCenario;
  /** Toques do caminho mais curto, com os textos da tela. */
  caminho: string;
  /** A comparação que o cenário ajuda a fazer. */
  compara: string;
};

const PASSO_DA_RECORRENCIA: Record<VersaoRecorrencia, string> = {
  A: "⋯ (Mais opções) → Repetir todo mês",
  B: "ícone de repetir, sem texto",
  C: "Repetir todo mês",
};

function entradaDoPix(dashboard: Dashboard): string {
  return dashboard.transferencias === "separadas"
    ? "Pix"
    : "Transferir (ou o Pix da barra de baixo) → Transferência via Pix";
}

export function caminhoMinimo(tarefa: TarefaId, combinacao: Combinacao): string {
  const pix = entradaDoPix(combinacao);
  const destinatario =
    combinacao.fluxo === "fluxo1" ? "Ana Paula Souza" : "digitar a chave → Consultar";
  switch (tarefa) {
    case "T1":
      return `${pix} → ${destinatario} → valor → Revisar Transação → Confirmar`;
    case "T2":
      return `${pix} → ${destinatario} → valor → Revisar Transação → ${PASSO_DA_RECORRENCIA[combinacao.recorrencia]}`;
    case "T3":
      return combinacao.fluxo === "fluxo1"
        ? "não há caminho: o Fluxo 1 não tem Copia e Cola"
        : `${pix} → colar o código → Continuar com Copia e Cola → Revisar Transação → Confirmar`;
    case "T4":
      return combinacao.transferencias === "separadas"
        ? "TED/DOC → agência e conta → Continuar para Confirmação → Confirmar"
        : "Transferir → Transferência via TED / DOC → agência e conta → Continuar para Confirmação → Confirmar";
    case "T5":
      return combinacao.chaves === "deposito"
        ? "Depositar → Depositar via Pix (Minhas Chaves & QR Code)"
        : `${pix} → Minhas Chaves & QR`;
    case "T6":
      return combinacao.boleto === "atalho"
        ? "Boleto → valor → Gerar Boleto"
        : "Depositar → Depositar via Boleto → valor → Gerar Boleto";
    case "T7":
      return combinacao.pagar === "separadas"
        ? "Pagar boleto → Colar código recebido → Continuar → Pagar"
        : "Pagar → Pagar boleto → Colar código recebido → Continuar → Pagar";
    case "T8":
      return combinacao.pagar === "separadas"
        ? "Próximos pagamentos (tela inicial) → Energia → Pagar"
        : "Pagar → Energia (Contas a vencer) → Pagar (ou, na tela inicial: Próximos pagamentos → Energia)";
    case "T9": {
      const linha = linhaNoCelular("Empréstimos", combinacao) === 2 ? " (2ª linha no celular)" : "";
      return `Empréstimos${linha} → Empréstimo pessoal → R$ 3.000 → 12x → Simular`;
    }
  }
}

export function tipoDoCenario(tarefa: TarefaId, combinacao: Combinacao): TipoDeCenario {
  return tarefa === "T3" && combinacao.fluxo === "fluxo1" ? "incorreto" : "normal";
}

/** Nas combinações montadas à mão, o Pagar fica como nas Dash V1, V2 e V3: um atalho só. */
function combinar(
  base: PresetId | Omit<Dashboard, "pagar">,
  fluxo: FluxoPix = "fluxo2",
  recorrencia: VersaoRecorrencia = "A",
): Combinacao {
  const pecas =
    typeof base === "string" ? PRESETS[base] : { pagar: "unificadas" as const, ...base };
  return { ...pecas, fluxo, recorrencia };
}

type Definicao = { tarefa: TarefaId; combinacao: Combinacao; compara: string };

const FLUXOS: readonly FluxoPix[] = ["fluxo1", "fluxo2"];
const RECORRENCIAS: readonly VersaoRecorrencia[] = ["A", "B", "C"];

const DEFINICOES: Definicao[] = [
  // T1 · onde começa a transferência (V1/V2 × V3) e contatos × chave digitada (F1 × F2)
  ...IDS_DOS_PRESETS.flatMap((dash) =>
    FLUXOS.map((fluxo) => ({
      tarefa: "T1" as const,
      combinacao: combinar(dash, fluxo),
      compara: "Onde começa a transferência; contatos (Fluxo 1) × chave digitada (Fluxo 2).",
    })),
  ),
  // T2 · onde fica a opção de repetir, agora com o caminho inteiro
  ...FLUXOS.flatMap((fluxo) =>
    IDS_DOS_PRESETS.flatMap((dash) =>
      RECORRENCIAS.map((recorrencia) => ({
        tarefa: "T2" as const,
        combinacao: combinar(dash, fluxo, recorrencia),
        compara: "Onde fica a opção de repetir (A, B ou C), do começo ao fim do Pix.",
      })),
    ),
  ),
  // T3 · Copia e Cola; o Fluxo 1 não tem Copia e Cola (caso incorreto)
  ...IDS_DOS_PRESETS.map((dash) => ({
    tarefa: "T3" as const,
    combinacao: combinar(dash, "fluxo2"),
    compara: "Copia e Cola com Pix no início × dentro de Transferir.",
  })),
  {
    tarefa: "T3",
    combinacao: combinar("v1", "fluxo1"),
    compara: "Caso incorreto: sem caminho, a persona desiste ou inventa um botão?",
  },
  // T4 · TED com atalho próprio × dentro de Transferir
  ...IDS_DOS_PRESETS.map((dash) => ({
    tarefa: "T4" as const,
    combinacao: combinar(dash),
    compara: "TED com atalho próprio × dentro de Transferir.",
  })),
  // T5 · minhas chaves no Depositar × dentro do Pix
  ...IDS_DOS_PRESETS.map((dash) => ({
    tarefa: "T5" as const,
    combinacao: combinar(dash),
    compara: "Minhas chaves no Depositar × dentro do Pix.",
  })),
  // T6 · boleto no Depositar × atalho próprio
  ...IDS_DOS_PRESETS.map((dash) => ({
    tarefa: "T6" as const,
    combinacao: combinar(dash),
    compara: "Boleto no Depositar × atalho próprio.",
  })),
  // T7 a T9 (Pagar e Empréstimos) entram depois das combinações novas, para C01–C41 não mudarem.
  // Combinações novas: cada uma muda uma peça só em relação a uma Dash existente.
  {
    tarefa: "T5",
    combinacao: combinar({ transferencias: "separadas", boleto: "deposito", chaves: "pix" }),
    compara: "Compare com C32 (Dash V1): muda só onde ficam as chaves.",
  },
  {
    tarefa: "T5",
    combinacao: combinar({ transferencias: "unificadas", boleto: "deposito", chaves: "deposito" }),
    compara: "Compare com C34 (Dash V3): muda só onde ficam as chaves.",
  },
  {
    tarefa: "T6",
    combinacao: combinar({ transferencias: "unificadas", boleto: "atalho", chaves: "pix" }),
    compara: "Compare com C37 (Dash V3): muda só onde fica o boleto.",
  },
  {
    tarefa: "T6",
    combinacao: combinar({ transferencias: "separadas", boleto: "deposito", chaves: "pix" }),
    compara: "Compare com C36 (Dash V2): muda só onde fica o boleto.",
  },
  // T7 · pagar boleto: o atalho Pagar é igual nas 3 Dash, mas na V2 existe um "Boleto" de depósito
  ...IDS_DOS_PRESETS.map((dash) => ({
    tarefa: "T7" as const,
    combinacao: combinar(dash),
    compara: 'Na Dash V2, o atalho "Boleto" é de depósito e pode atrair quem quer pagar um boleto.',
  })),
  // T8 · conta de luz: pelo atalho Pagar ou pela lista "Próximos pagamentos" da tela inicial
  ...IDS_DOS_PRESETS.map((dash) => ({
    tarefa: "T8" as const,
    combinacao: combinar(dash),
    compara: 'Dois caminhos: o atalho Pagar ou a lista "Próximos pagamentos" da tela inicial.',
  })),
  // T9 · simular empréstimo: Empréstimos na 2ª linha de atalhos (V1 e V2) × na 1ª (V3)
  ...IDS_DOS_PRESETS.map((dash) => ({
    tarefa: "T9" as const,
    combinacao: combinar(dash),
    compara: "Empréstimos na 2ª linha de atalhos do celular (V1 e V2) × na 1ª linha (V3).",
  })),
];

export const CENARIOS: readonly Cenario[] = DEFINICOES.map((definicao, indice) => ({
  id: `C${String(indice + 1).padStart(2, "0")}`,
  tarefa: definicao.tarefa,
  combinacao: definicao.combinacao,
  tipo: tipoDoCenario(definicao.tarefa, definicao.combinacao),
  caminho: caminhoMinimo(definicao.tarefa, definicao.combinacao),
  compara: definicao.compara,
}));

function fatoresQueImportam(tarefa: TarefaId, combinacao: Combinacao): string[] {
  const usaFluxo =
    tarefa === "T1" ||
    tarefa === "T2" ||
    tarefa === "T3" ||
    (tarefa === "T5" && combinacao.chaves === "pix");
  const fatores = usaFluxo ? [combinacao.fluxo === "fluxo1" ? "Fluxo 1" : "Fluxo 2"] : [];
  if (tarefa === "T2") fatores.push(`Repetir ${combinacao.recorrencia}`);
  return fatores;
}

export function nomeCurtoDaDashboard(dashboard: Dashboard): string {
  const preset = presetDe(dashboard);
  if (preset) return NOMES_DOS_PRESETS[preset];
  return [
    dashboard.transferencias === "separadas" ? "Pix e TED separados" : "Transferir",
    dashboard.boleto === "atalho" ? "boleto com atalho" : "boleto no Depositar",
    dashboard.chaves === "pix" ? "chaves no Pix" : "chaves no Depositar",
    dashboard.pagar === "separadas" ? "boleto e fatura separados" : "boleto e fatura em Pagar",
  ].join(" + ");
}

export function rotuloDoCenario(cenario: Cenario): string {
  const partes = [
    cenario.id,
    TAREFAS[cenario.tarefa].nome,
    nomeCurtoDaDashboard(cenario.combinacao),
    ...fatoresQueImportam(cenario.tarefa, cenario.combinacao),
  ];
  if (cenario.tipo === "incorreto") partes.push("caso incorreto");
  return partes.join(" · ");
}

// --------------------------------------------------------------------------- endereço (link)

/**
 * Parâmetros do endereço. Os valores evitam números ("f1", não "1") porque o roteador põe aspas
 * em valores que parecem número. Ex.: /?cenario=C05 ou /?dash=v1&fluxo=f1&rec=b&limpo=sim
 */
export const CHAVES_DA_BUSCA = [
  "cenario",
  "dash",
  "transf",
  "boleto",
  "chaves",
  "pagar",
  "fluxo",
  "rec",
  "limpo",
] as const;

export type ChaveDaBusca = (typeof CHAVES_DA_BUSCA)[number];
export type BuscaLaboratorio = Partial<Record<ChaveDaBusca, string>>;

/** validateSearch da rota: guarda só os parâmetros conhecidos, sempre como texto. */
export function lerBusca(search: Record<string, unknown>): BuscaLaboratorio {
  const busca: BuscaLaboratorio = {};
  for (const chave of CHAVES_DA_BUSCA) {
    const valor = search[chave];
    if (typeof valor === "string" || typeof valor === "number" || typeof valor === "boolean") {
      busca[chave] = String(valor);
    }
  }
  return busca;
}

export type Inicio = { combinacao: Combinacao; cenario: Cenario | null };

/** Combinação pedida pelo endereço. Um cenário vale só se nenhum outro parâmetro o alterar. */
export function inicioDaBusca(busca: BuscaLaboratorio): Inicio {
  const idPedido = (busca.cenario ?? "").trim().toUpperCase();
  const cenario = CENARIOS.find((c) => c.id === idPedido) ?? null;
  let combinacao: Combinacao = { ...(cenario?.combinacao ?? COMBINACAO_PADRAO) };

  const dash = (busca.dash ?? "").trim().toLowerCase();
  if (ehPreset(dash)) combinacao = { ...combinacao, ...PRESETS[dash] };

  const transf = busca.transf;
  if (transf === "separadas" || transf === "unificadas") {
    combinacao = { ...combinacao, transferencias: transf };
  }
  const boleto = busca.boleto;
  if (boleto === "deposito" || boleto === "atalho") combinacao = { ...combinacao, boleto };
  const chaves = busca.chaves;
  if (chaves === "deposito" || chaves === "pix") combinacao = { ...combinacao, chaves };
  const pagar = busca.pagar;
  if (pagar === "separadas" || pagar === "unificadas") combinacao = { ...combinacao, pagar };

  const fluxo = (busca.fluxo ?? "").trim().toLowerCase();
  if (fluxo === "f1" || fluxo === "1" || fluxo === "fluxo1") {
    combinacao = { ...combinacao, fluxo: "fluxo1" };
  } else if (fluxo === "f2" || fluxo === "2" || fluxo === "fluxo2") {
    combinacao = { ...combinacao, fluxo: "fluxo2" };
  }

  const rec = (busca.rec ?? "").trim().toUpperCase();
  if (rec === "A" || rec === "B" || rec === "C") combinacao = { ...combinacao, recorrencia: rec };

  const valeOCenario = cenario !== null && mesmaCombinacao(cenario.combinacao, combinacao);
  return { combinacao, cenario: valeOCenario ? cenario : null };
}

/** Modo limpo: esconde as barras de teste, para mostrar a pessoas ou capturar telas para a vila. */
export function modoLimpo(busca: BuscaLaboratorio): boolean {
  const valor = (busca.limpo ?? "").trim().toLowerCase();
  return valor === "sim" || valor === "1" || valor === "true";
}

export function buscaDaCombinacao(
  combinacao: Combinacao,
  cenario: Cenario | null,
  limpo = false,
): BuscaLaboratorio {
  const extra: BuscaLaboratorio = limpo ? { limpo: "sim" } : {};
  if (cenario && mesmaCombinacao(cenario.combinacao, combinacao)) {
    return { cenario: cenario.id, ...extra };
  }
  const preset = presetDe(combinacao);
  const dashboard: BuscaLaboratorio = preset
    ? { dash: preset }
    : {
        transf: combinacao.transferencias,
        boleto: combinacao.boleto,
        chaves: combinacao.chaves,
        pagar: combinacao.pagar,
      };
  return {
    ...dashboard,
    fluxo: combinacao.fluxo === "fluxo1" ? "f1" : "f2",
    rec: combinacao.recorrencia.toLowerCase(),
    ...extra,
  };
}

/** Caminho relativo do link, ex.: "/?cenario=C05&limpo=sim". */
export function enderecoDaBusca(busca: BuscaLaboratorio): string {
  const partes = CHAVES_DA_BUSCA.flatMap((chave) => {
    const valor = busca[chave];
    return valor === undefined ? [] : [`${chave}=${encodeURIComponent(valor)}`];
  });
  return partes.length > 0 ? `/?${partes.join("&")}` : "/";
}
