import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  HandCoins,
  Info,
  Landmark,
  ListChecks,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  CONSIGNADO,
  EMPRESTIMO_PESSOAL,
  contratar,
  formatarTaxa,
  simularEmprestimo,
  validarPedido,
  type Contrato,
  type Simulacao,
} from "@/lib/emprestimos";
import { formatarData, formatarReais, lerValorEmReais } from "@/lib/pagamentos";

// Empréstimos fictícios do Lume: simular → ver parcela, IOF, taxa e CET → contratar → comprovante.
// O consignado aparece como indisponível para este cliente, como num app de banco de verdade.

type Tela = "menu" | "simular" | "resultado" | "revisar" | "feito" | "consignado" | "meus";

type Props = {
  contratos: readonly Contrato[];
  onContratado: (contrato: Contrato) => void;
  onFechar: () => void;
};

const TITULOS: Record<Tela, [string, string]> = {
  menu: ["Empréstimos", "Crédito com valores e taxas fictícios"],
  simular: ["Empréstimo pessoal", "Simule sem compromisso"],
  resultado: ["Sua simulação", "Confira as condições antes de contratar"],
  revisar: ["Contratar empréstimo", "Revise e confirme"],
  feito: ["Empréstimo contratado", "Contrato fictício de teste no Banco Lume"],
  consignado: [CONSIGNADO.nome, "Condições do produto"],
  meus: ["Meus empréstimos", "Contratos ativos"],
};

const VOLTAR: Partial<Record<Tela, Tela>> = {
  simular: "menu",
  resultado: "simular",
  revisar: "resultado",
  consignado: "menu",
  meus: "menu",
};

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

function Condicoes({ simulacao }: { simulacao: Simulacao }) {
  return (
    <div className="rounded-xl border border-border bg-canvas p-4 text-xs">
      <Linha rotulo="Valor pedido">{formatarReais(simulacao.valor)}</Linha>
      <Linha rotulo="IOF (estimativa)">{formatarReais(simulacao.iof)}</Linha>
      <Linha rotulo="Valor financiado">{formatarReais(simulacao.valorFinanciado)}</Linha>
      <Linha rotulo="Juros">
        {formatarTaxa(simulacao.taxaMensal)} a.m. · {formatarTaxa(simulacao.taxaAnual)} a.a.
      </Linha>
      <Linha rotulo="CET (custo efetivo total)">
        {formatarTaxa(simulacao.cetMensal)} a.m. · {formatarTaxa(simulacao.cetAnual)} a.a.
      </Linha>
      <Linha rotulo="Total a pagar">{formatarReais(simulacao.totalAPagar)}</Linha>
      <Linha rotulo="1ª parcela">{formatarData(simulacao.primeiroVencimento)}</Linha>
    </div>
  );
}

export function FluxoEmprestimos({ contratos, onContratado, onFechar }: Props) {
  const [tela, setTela] = useState<Tela>("menu");
  const [valorTexto, setValorTexto] = useState("");
  const [parcelas, setParcelas] = useState(12);
  const [erro, setErro] = useState<string | null>(null);
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null);
  const [aceite, setAceite] = useState(false);
  const [contratoFeito, setContratoFeito] = useState<Contrato | null>(null);

  const irPara = (proxima: Tela) => {
    setErro(null);
    setTela(proxima);
  };

  const simular = () => {
    const valor = lerValorEmReais(valorTexto);
    const problema = validarPedido(valor, parcelas);
    if (problema) {
      setErro(problema.erro);
      return;
    }
    setSimulacao(simularEmprestimo(valor, parcelas));
    setAceite(false);
    irPara("resultado");
  };

  const confirmar = () => {
    if (!simulacao || !aceite) return;
    const contrato = contratar(simulacao, contratos.length);
    setContratoFeito(contrato);
    onContratado(contrato);
    irPara("feito");
  };

  const voltarPara = VOLTAR[tela];
  const [titulo, subtitulo] = TITULOS[tela];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            {voltarPara && (
              <button
                type="button"
                aria-label="Voltar"
                onClick={() => irPara(voltarPara)}
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
            <div className="space-y-3">
              <Opcao
                icone={HandCoins}
                titulo={EMPRESTIMO_PESSOAL.nome}
                descricao={`Até ${formatarReais(EMPRESTIMO_PESSOAL.valorMaximo)} pré-aprovados · a partir de ${formatarTaxa(EMPRESTIMO_PESSOAL.taxaMensal)} a.m.`}
                destaque
                onClick={() => irPara("simular")}
              />
              <Opcao
                icone={Landmark}
                titulo={CONSIGNADO.nome}
                descricao={CONSIGNADO.publico}
                onClick={() => irPara("consignado")}
              />
              <Opcao
                icone={ListChecks}
                titulo="Meus empréstimos"
                descricao={
                  contratos.length > 0
                    ? `${contratos.length} contrato(s) ativo(s)`
                    : "Nenhum empréstimo ativo"
                }
                onClick={() => irPara("meus")}
              />
            </div>
          )}

          {tela === "simular" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="valor-do-emprestimo"
                  className="block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Quanto você precisa?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 font-bold text-muted-foreground">
                    R$
                  </span>
                  <input
                    id="valor-do-emprestimo"
                    type="text"
                    inputMode="decimal"
                    value={valorTexto}
                    onChange={(evento) => {
                      setValorTexto(evento.target.value);
                      setErro(null);
                    }}
                    placeholder="0,00"
                    className="w-full rounded-md border border-border bg-canvas py-2.5 pl-12 pr-4 text-lg font-bold outline-hidden focus:border-primary"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {EMPRESTIMO_PESSOAL.valoresRapidos.map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => {
                        setValorTexto(valor.toLocaleString("pt-BR"));
                        setErro(null);
                      }}
                      className="rounded-full border border-border px-3 py-1 text-xs font-bold text-foreground transition hover:bg-muted"
                    >
                      {formatarReais(valor)}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Limite pré-aprovado: {formatarReais(EMPRESTIMO_PESSOAL.valorMaximo)}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Em quantas vezes?
                </p>
                <div className="flex flex-wrap gap-2">
                  {EMPRESTIMO_PESSOAL.parcelas.map((opcao) => (
                    <button
                      key={opcao}
                      type="button"
                      aria-pressed={parcelas === opcao}
                      onClick={() => setParcelas(opcao)}
                      className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${parcelas === opcao ? "border-primary bg-primary text-primary-foreground" : "border-border text-foreground hover:bg-muted"}`}
                    >
                      {opcao}x
                    </button>
                  ))}
                </div>
              </div>

              {erro && (
                <p className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {erro}
                </p>
              )}
              <button
                type="button"
                onClick={simular}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
              >
                Simular
              </button>
            </div>
          )}

          {tela === "resultado" && simulacao && (
            <div className="space-y-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 text-center">
                <p className="text-xs font-semibold text-muted-foreground">Você paga</p>
                <p className="font-display text-3xl font-bold text-primary">
                  {simulacao.parcelas}x de {formatarReais(simulacao.parcela)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  1ª parcela em {formatarData(simulacao.primeiroVencimento)}
                </p>
              </div>
              <Condicoes simulacao={simulacao} />
              <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <Info size={14} className="mt-0.5 shrink-0" /> Taxas e valores fictícios. O CET
                junta juros e IOF numa taxa só: é o que o empréstimo custa de verdade.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => irPara("revisar")}
                  className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
                >
                  Contratar
                </button>
                <button
                  type="button"
                  onClick={() => irPara("simular")}
                  className="h-10 w-full text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  Alterar valor ou parcelas
                </button>
              </div>
            </div>
          )}

          {tela === "revisar" && simulacao && (
            <div className="space-y-5">
              <Condicoes simulacao={simulacao} />
              <p className="text-xs text-muted-foreground">
                O valor pedido cai na sua conta Lume. As parcelas são debitadas todo mês.
              </p>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 text-xs">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(evento) => setAceite(evento.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                Li e concordo com as condições deste contrato (fictício, sem valor real).
              </label>
              <button
                type="button"
                disabled={!aceite}
                onClick={confirmar}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 size={20} /> Confirmar contratação
              </button>
            </div>
          )}

          {tela === "feito" && contratoFeito && (
            <div className="space-y-5 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground">Empréstimo contratado!</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatarReais(contratoFeito.valor)} na sua conta Lume (fictício)
                </p>
              </div>
              <div className="rounded-xl border border-border bg-canvas p-4 text-left text-xs">
                <Linha rotulo="Contrato">
                  <span className="font-mono">{contratoFeito.numero}</span>
                </Linha>
                <Linha rotulo="Parcelas">
                  {contratoFeito.parcelas}x de {formatarReais(contratoFeito.parcela)}
                </Linha>
                <Linha rotulo="1ª parcela">{formatarData(contratoFeito.primeiroVencimento)}</Linha>
                <Linha rotulo="CET">{formatarTaxa(contratoFeito.cetMensal)} a.m.</Linha>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onFechar}
                  className="h-12 w-full rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
                >
                  Concluir
                </button>
                <button
                  type="button"
                  onClick={() => irPara("meus")}
                  className="h-10 w-full text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  Ver meus empréstimos
                </button>
              </div>
            </div>
          )}

          {tela === "consignado" && (
            <div className="space-y-5">
              <p className="text-sm text-foreground">{CONSIGNADO.publico}</p>
              <p className="flex items-start gap-2 rounded-md bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> Não disponível para o seu
                perfil. {CONSIGNADO.motivoIndisponivel}
              </p>
              <button
                type="button"
                onClick={() => irPara("simular")}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
              >
                Simular empréstimo pessoal
              </button>
            </div>
          )}

          {tela === "meus" && (
            <div className="space-y-4">
              {contratos.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-canvas p-5 text-center text-sm text-muted-foreground">
                  Você não tem empréstimos ativos.
                </p>
              ) : (
                <div className="divide-y divide-border rounded-lg border border-border bg-canvas">
                  {contratos.map((contrato) => (
                    <div key={contrato.numero} className="p-4 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono font-bold text-foreground">
                          {contrato.numero}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          Ativo
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        {EMPRESTIMO_PESSOAL.nome} · {formatarReais(contrato.valor)} ·{" "}
                        {contrato.parcelas}x de {formatarReais(contrato.parcela)} · 1ª parcela{" "}
                        {formatarData(contrato.primeiroVencimento)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => irPara("simular")}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground shadow-card transition hover:bg-primary-strong"
              >
                Simular empréstimo pessoal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
