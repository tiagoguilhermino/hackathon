import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Barcode,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardPaste,
  CreditCard,
  ScanLine,
  Smartphone,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { ModoPagar } from "@/lib/cenarios";
import {
  BOLETO_DA_ESCOLA,
  CONTAS_A_VENCER,
  FATURA_DO_CARTAO,
  HOJE_FICTICIO,
  SALDO_FICTICIO,
  autenticacao,
  beneficiarioDoCodigo,
  formatarCodigo,
  formatarData,
  formatarReais,
  lerCodigo,
  lerValorEmReais,
  type ContaAVencer,
} from "@/lib/pagamentos";

// Pagamentos fictícios do Lume: boleto (código de barras), contas a vencer no CPF e fatura do
// cartão. Mesmo desenho das janelas do Pix: entrada → revisão → confirmação → comprovante.

export type InicioPagar =
  { tela: "menu" } | { tela: "conta"; contaId: string } | { tela: "fatura" } | { tela: "codigo" };
export type SituacaoDaConta = "paga" | "agendada";

type Tela = "menu" | "codigo" | "fatura" | "revisar" | "feito";

type Pagamento = {
  tipo: "boleto" | "conta" | "fatura";
  titulo: string;
  beneficiario: string;
  valor: number;
  vencimento: string | null;
  digitos: string | null;
  contaId: string | null;
};

type Comprovante = Pagamento & { agendadoPara: string | null; autenticacao: string };

type Props = {
  inicio: InicioPagar;
  /** "separadas": aberto pelos atalhos Pagar boleto ou Fatura, sem voltar para o menu do Pagar. */
  modo: ModoPagar;
  situacaoDasContas: Readonly<Record<string, SituacaoDaConta>>;
  valorDaFaturaEmAberto: number;
  onContaPaga: (contaId: string, situacao: SituacaoDaConta) => void;
  onFaturaPaga: (valor: number) => void;
  onFechar: () => void;
};

const ICONES_DAS_CONTAS: Record<ContaAVencer["icone"], LucideIcon> = {
  energia: Zap,
  celular: Smartphone,
};

const TITULOS: Record<Tela, [string, string]> = {
  menu: ["Pagar", "Boletos, contas e fatura do cartão"],
  codigo: ["Pagar boleto", "Digite, cole ou leia o código de barras"],
  fatura: ["Fatura do cartão", FATURA_DO_CARTAO.cartao],
  revisar: ["Revisar pagamento", "Confira os dados antes de pagar"],
  feito: ["Comprovante", "Pagamento fictício de teste no Banco Lume"],
};

function pagamentoDaConta(conta: ContaAVencer): Pagamento {
  return {
    tipo: "conta",
    titulo: `Conta de ${conta.nome.toLowerCase()}`,
    beneficiario: conta.empresa,
    valor: conta.valor,
    vencimento: conta.vencimento,
    digitos: conta.digitos,
    contaId: conta.id,
  };
}

function Opcao({
  icone: Icone,
  titulo,
  descricao,
  onClick,
  destaque = false,
}: {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
  onClick: () => void;
  destaque?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas p-4 text-left shadow-xs transition hover:border-primary/40 hover:bg-muted"
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`grid h-11 w-11 place-items-center rounded-full ${destaque ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}
        >
          <Icone size={21} />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">{titulo}</p>
          <p className="text-xs text-muted-foreground">{descricao}</p>
        </div>
      </div>
      <ChevronRight size={19} className="text-muted-foreground" />
    </button>
  );
}

function Linha({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-1.5 last:border-0">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="text-right font-semibold text-foreground">{children}</span>
    </div>
  );
}

export function FluxoPagar({
  inicio,
  modo,
  situacaoDasContas,
  valorDaFaturaEmAberto,
  onContaPaga,
  onFaturaPaga,
  onFechar,
}: Props) {
  const contaInicial =
    inicio.tela === "conta" ? (CONTAS_A_VENCER.find((c) => c.id === inicio.contaId) ?? null) : null;
  const telaInicial: Tela = contaInicial
    ? "revisar"
    : inicio.tela === "fatura" || inicio.tela === "codigo"
      ? inicio.tela
      : "menu";
  const [tela, setTela] = useState<Tela>(telaInicial);
  const [voltarPara, setVoltarPara] = useState<Tela>("menu");
  const [pagamento, setPagamento] = useState<Pagamento | null>(
    contaInicial ? pagamentoDaConta(contaInicial) : null,
  );
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [quando, setQuando] = useState<"hoje" | "vencimento">("hoje");
  const [opcaoFatura, setOpcaoFatura] = useState<"total" | "outro">("total");
  const [outroValor, setOutroValor] = useState("");
  const [comprovante, setComprovante] = useState<Comprovante | null>(null);

  const irPara = (proxima: Tela) => {
    setErro(null);
    setTela(proxima);
  };

  const voltar = () => {
    if (tela === "revisar") irPara(voltarPara);
    else irPara("menu");
  };

  const revisarConta = (conta: ContaAVencer) => {
    setPagamento(pagamentoDaConta(conta));
    setQuando("hoje");
    setVoltarPara("menu");
    irPara("revisar");
  };

  const continuarComCodigo = () => {
    const lido = lerCodigo(codigo);
    if (!lido.ok) {
      setErro(lido.erro);
      return;
    }
    const conta = CONTAS_A_VENCER.find((c) => c.digitos === lido.digitos) ?? null;
    if (conta && situacaoDasContas[conta.id]) {
      setErro(`Esta conta já está ${situacaoDasContas[conta.id]}.`);
      return;
    }
    if (lido.tipo === "conta" && lido.valor === null) {
      setErro("Este código não traz o valor. Pague pela lista de contas a vencer.");
      return;
    }
    setPagamento(
      lido.tipo === "boleto"
        ? {
            tipo: "boleto",
            titulo: "Boleto",
            beneficiario: beneficiarioDoCodigo(lido.digitos),
            valor: lido.valor,
            vencimento: lido.vencimento,
            digitos: lido.digitos,
            contaId: null,
          }
        : {
            ...(conta
              ? pagamentoDaConta(conta)
              : {
                  tipo: "conta" as const,
                  titulo: "Conta de consumo",
                  beneficiario: beneficiarioDoCodigo(lido.digitos),
                  vencimento: null,
                  digitos: lido.digitos,
                  contaId: null,
                }),
            valor: lido.valor ?? 0,
          },
    );
    setQuando("hoje");
    setVoltarPara("codigo");
    irPara("revisar");
  };

  const continuarComFatura = () => {
    const valor = opcaoFatura === "total" ? valorDaFaturaEmAberto : lerValorEmReais(outroValor);
    if (!Number.isFinite(valor) || valor <= 0) {
      setErro("Digite quanto você quer pagar.");
      return;
    }
    if (valor > valorDaFaturaEmAberto) {
      setErro(`O valor passa do total em aberto (${formatarReais(valorDaFaturaEmAberto)}).`);
      return;
    }
    setPagamento({
      tipo: "fatura",
      titulo: "Fatura do cartão",
      beneficiario: `Lume · ${FATURA_DO_CARTAO.cartao}`,
      valor: Math.round(valor * 100) / 100,
      vencimento: null,
      digitos: null,
      contaId: null,
    });
    setQuando("hoje");
    setVoltarPara("fatura");
    irPara("revisar");
  };

  const podeAgendar =
    pagamento !== null && pagamento.vencimento !== null && pagamento.vencimento > HOJE_FICTICIO;

  const pagar = () => {
    if (!pagamento) return;
    if (quando === "hoje" && pagamento.valor > SALDO_FICTICIO) {
      setErro("Saldo insuficiente para pagar hoje.");
      return;
    }
    const agendadoPara = quando === "vencimento" && podeAgendar ? pagamento.vencimento : null;
    setComprovante({
      ...pagamento,
      agendadoPara,
      autenticacao: autenticacao(
        pagamento.tipo === "fatura" ? "FAT" : "PAG",
        `${pagamento.digitos ?? pagamento.titulo}|${pagamento.valor}`,
      ),
    });
    if (pagamento.contaId) onContaPaga(pagamento.contaId, agendadoPara ? "agendada" : "paga");
    if (pagamento.tipo === "fatura") onFaturaPaga(pagamento.valor);
    irPara("feito");
  };

  const [titulo, subtitulo] =
    tela === "feito" && comprovante
      ? [comprovante.agendadoPara ? "Pagamento agendado" : "Pagamento realizado", TITULOS.feito[1]]
      : TITULOS[tela];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            {tela !== "menu" &&
              tela !== "feito" &&
              !(modo === "separadas" && tela === telaInicial) && (
                <button
                  type="button"
                  aria-label="Voltar"
                  onClick={voltar}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
            <div>
              <h2 className="text-lg font-bold">{titulo}</h2>
              <p className="text-xs text-muted-foreground">{subtitulo}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[80vh] space-y-5 overflow-y-auto p-6">
          {tela === "menu" && (
            <>
              <div className="space-y-3">
                <Opcao
                  icone={Barcode}
                  titulo="Pagar boleto"
                  descricao="Digite, cole ou leia o código de barras"
                  destaque
                  onClick={() => {
                    setCodigo("");
                    irPara("codigo");
                  }}
                />
                <Opcao
                  icone={CreditCard}
                  titulo="Fatura do cartão"
                  descricao={
                    valorDaFaturaEmAberto > 0
                      ? `${FATURA_DO_CARTAO.cartao} · ${formatarReais(valorDaFaturaEmAberto)} em aberto`
                      : `${FATURA_DO_CARTAO.cartao} · fatura paga`
                  }
                  onClick={() => irPara("fatura")}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Contas a vencer no seu CPF
                </p>
                <div className="divide-y divide-border rounded-lg border border-border bg-canvas">
                  {CONTAS_A_VENCER.map((conta) => {
                    const Icone = ICONES_DAS_CONTAS[conta.icone];
                    const situacao = situacaoDasContas[conta.id];
                    return (
                      <button
                        key={conta.id}
                        type="button"
                        disabled={Boolean(situacao)}
                        onClick={() => revisarConta(conta)}
                        className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-foreground">
                            <Icone size={19} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">
                              {conta.nome} · {formatarReais(conta.valor)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {conta.empresa} · {conta.vencimentoTexto}
                            </p>
                          </div>
                        </div>
                        {situacao ? (
                          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            {situacao === "paga" ? "Paga" : "Agendada"}
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs font-bold text-primary">Pagar</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {tela === "codigo" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="codigo-de-barras"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Código de barras
                </label>
                <textarea
                  id="codigo-de-barras"
                  rows={3}
                  inputMode="numeric"
                  value={codigo}
                  onChange={(evento) => {
                    setCodigo(evento.target.value);
                    setErro(null);
                  }}
                  placeholder="Digite os números do boleto ou da conta"
                  className="w-full rounded-md border border-border bg-canvas p-3 font-mono text-sm outline-hidden focus:border-primary"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCodigo(formatarCodigo(BOLETO_DA_ESCOLA.digitos));
                      setErro(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                  >
                    <ClipboardPaste size={14} /> Colar código recebido
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCodigo(formatarCodigo(BOLETO_DA_ESCOLA.digitos));
                      setErro(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-border"
                  >
                    <ScanLine size={14} /> Ler com a câmera (simulação)
                  </button>
                </div>
              </div>
              {erro && (
                <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {erro}
                </p>
              )}
              <button
                type="button"
                onClick={continuarComCodigo}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
              >
                Continuar
              </button>
            </div>
          )}

          {tela === "fatura" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-canvas p-5">
                <p className="text-xs text-muted-foreground">Fatura atual (aberta)</p>
                <p className="font-display text-2xl font-bold">
                  {formatarReais(valorDaFaturaEmAberto)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{FATURA_DO_CARTAO.fechamento}</p>
              </div>
              {valorDaFaturaEmAberto > 0 ? (
                <>
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Quanto você quer pagar?
                    </p>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm">
                      <input
                        type="radio"
                        name="valor-da-fatura"
                        checked={opcaoFatura === "total"}
                        onChange={() => setOpcaoFatura("total")}
                        className="accent-primary"
                      />
                      Valor total · {formatarReais(valorDaFaturaEmAberto)}
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm">
                      <input
                        type="radio"
                        name="valor-da-fatura"
                        checked={opcaoFatura === "outro"}
                        onChange={() => setOpcaoFatura("outro")}
                        className="accent-primary"
                      />
                      Outro valor (adiantar parte)
                    </label>
                    {opcaoFatura === "outro" && (
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 font-bold text-muted-foreground">
                          R$
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={outroValor}
                          onChange={(evento) => {
                            setOutroValor(evento.target.value);
                            setErro(null);
                          }}
                          placeholder="0,00"
                          className="w-full rounded-md border border-border bg-canvas py-2.5 pl-12 pr-4 text-lg font-bold outline-hidden focus:border-primary"
                        />
                      </div>
                    )}
                  </div>
                  {erro && (
                    <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" /> {erro}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={continuarComFatura}
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
                  >
                    Continuar
                  </button>
                </>
              ) : (
                <p className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={17} /> Não há valor em aberto nesta fatura.
                </p>
              )}
            </div>
          )}

          {tela === "revisar" && pagamento && (
            <div className="space-y-5">
              <div className="space-y-4 rounded-lg border border-border bg-canvas p-5">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{pagamento.titulo}</p>
                  <p className="text-base font-bold text-foreground">{pagamento.beneficiario}</p>
                  {pagamento.vencimento && (
                    <p className="text-xs text-muted-foreground">
                      Vencimento: {formatarData(pagamento.vencimento)}
                    </p>
                  )}
                </div>
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Valor a pagar</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {formatarReais(pagamento.valor)}
                  </p>
                </div>
                {pagamento.digitos && (
                  <p className="break-all font-mono text-[11px] text-muted-foreground">
                    {formatarCodigo(pagamento.digitos)}
                  </p>
                )}
              </div>

              {podeAgendar && pagamento.vencimento && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quando pagar?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      aria-pressed={quando === "hoje"}
                      onClick={() => setQuando("hoje")}
                      className={`rounded-lg border p-3 text-left text-xs font-bold transition ${quando === "hoje" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                    >
                      Hoje
                      <span className="block font-medium">{formatarData(HOJE_FICTICIO)}</span>
                    </button>
                    <button
                      type="button"
                      aria-pressed={quando === "vencimento"}
                      onClick={() => setQuando("vencimento")}
                      className={`rounded-lg border p-3 text-left text-xs font-bold transition ${quando === "vencimento" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                    >
                      No vencimento
                      <span className="block font-medium">
                        {formatarData(pagamento.vencimento)}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Saldo em conta: <strong>{formatarReais(SALDO_FICTICIO)}</strong>
              </p>
              {erro && (
                <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {erro}
                </p>
              )}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={pagar}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
                >
                  {quando === "vencimento" && podeAgendar && pagamento.vencimento ? (
                    <>
                      <CalendarClock size={20} /> Agendar para {formatarData(pagamento.vencimento)}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} /> Pagar {formatarReais(pagamento.valor)}
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-muted-foreground">
                  Pagamento fictício de teste no Banco Lume
                </p>
              </div>
            </div>
          )}

          {tela === "feito" && comprovante && (
            <div className="space-y-5 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {comprovante.agendadoPara ? (
                  <CalendarClock size={34} />
                ) : (
                  <CheckCircle2 size={36} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground">
                  {comprovante.agendadoPara ? "Pagamento agendado!" : "Pagamento realizado!"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatarReais(comprovante.valor)} para {comprovante.beneficiario}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-canvas p-4 text-left text-xs">
                <Linha rotulo="O que foi pago">{comprovante.titulo}</Linha>
                <Linha rotulo="Valor">{formatarReais(comprovante.valor)}</Linha>
                <Linha rotulo={comprovante.agendadoPara ? "Agendado para" : "Data"}>
                  {formatarData(comprovante.agendadoPara ?? HOJE_FICTICIO)}
                </Linha>
                <Linha rotulo="Autenticação">
                  <span className="font-mono">{comprovante.autenticacao}</span>
                </Linha>
              </div>
              <button
                type="button"
                onClick={onFechar}
                className="h-12 w-full rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
              >
                Concluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
