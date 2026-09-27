"use client";

import { CircleCheck } from "lucide-react";
import { custoTotal, valorParcela } from "@/lib/banco/credito";
import { emprestimoPodeContinuar } from "@/lib/banco/estado";
import { Clicavel } from "../Clicavel";
import { formatarReais, useBanco } from "../contexto";
import { BotaoPrincipal, Cabecalho, Cartao, Etapas, Opcao } from "../partes";

const VALORES = [1000, 3000, 5000];
const PARCELAS = [6, 12, 24];

/** Etapa 1: quanto e em quantas vezes. */
export function TelaEmprestimoValor() {
  const { estado } = useBanco();
  const { valor, parcelas } = estado.emprestimo;
  return (
    <div>
      <Cabecalho voltar="emprestimo1.voltar" titulo="Empréstimo pessoal" subtitulo="Escolha o valor e as parcelas" />
      <Etapas atual={1} total={3} />
      <div className="space-y-4 p-4">
        <Cartao>
          <h2 className="mb-3 text-sm font-bold text-azul">Quanto você precisa?</h2>
          <div className="grid grid-cols-3 gap-2">
            {VALORES.map((v) => (
              <Opcao key={v} actionId={`emprestimo1.valor.${v}`} selecionado={valor === v}>
                {formatarReais(v).replace(",00", "")}
              </Opcao>
            ))}
          </div>
        </Cartao>
        <Cartao>
          <h2 className="mb-3 text-sm font-bold text-azul">Em quantas parcelas?</h2>
          <div className="grid grid-cols-3 gap-2">
            {PARCELAS.map((n) => (
              <Opcao key={n} actionId={`emprestimo1.parcelas.${n}`} selecionado={parcelas === n}>
                {n}x
              </Opcao>
            ))}
          </div>
        </Cartao>
        <BotaoPrincipal actionId="emprestimo1.continuar" desabilitado={!emprestimoPodeContinuar(estado)}>
          Continuar
        </BotaoPrincipal>
      </div>
    </div>
  );
}

/** Etapa 2: condições. A versão original usa jargão; a simplificada, linguagem de cliente. */
export function TelaEmprestimoCondicoes() {
  const { estado } = useBanco();
  const valor = estado.emprestimo.valor ?? 0;
  const n = estado.emprestimo.parcelas ?? 1;
  const parcela = formatarReais(valorParcela(valor, n));
  const total = formatarReais(custoTotal(valor, n));
  const simplificada = estado.versoes.emprestimo === "simplificada";
  return (
    <div>
      <Cabecalho
        voltar="emprestimo2.voltar"
        titulo={simplificada ? "Resumo do seu empréstimo" : "Condições da operação"}
      />
      <Etapas atual={2} total={3} />
      <div className="space-y-4 p-4">
        {simplificada ? (
          <Cartao className="space-y-2">
            <p data-leitura className="text-base text-texto">
              Você recebe <strong>{formatarReais(valor)}</strong> hoje.
            </p>
            <p data-leitura className="text-base text-texto">
              Paga <strong>{n} parcelas de {parcela}</strong> por mês.
            </p>
            <p data-leitura className="text-base text-texto">
              Juros de 1,99% por mês. No total você paga {total}, já com impostos.
            </p>
          </Cartao>
        ) : (
          <Cartao className="space-y-2">
            <p data-leitura className="text-sm text-texto">
              Taxa de juros nominal pós-fixada: 1,99% a.m. (Selic + spread de 0,93% a.m.).
            </p>
            <p data-leitura className="text-sm text-texto">
              CET: 29,90% a.a. · IOF: 0,38% + 0,0082% a.d. sobre o valor financiado.
            </p>
            <p data-leitura className="text-sm text-texto">
              Sistema de amortização: Price, com {n} parcelas mensais e sucessivas de {parcela}.
            </p>
            <p data-leitura className="text-sm text-texto">
              Os encargos incidem a partir da data da contratação, conforme a regulamentação vigente.
            </p>
          </Cartao>
        )}
        <BotaoPrincipal actionId="emprestimo2.continuar">Continuar</BotaoPrincipal>
      </div>
    </div>
  );
}

/** Etapa 3: aceite e contratação. Na original, o botão final é pequeno e de baixo contraste. */
export function TelaEmprestimoConfirmacao() {
  const { estado } = useBanco();
  const { aceite } = estado.emprestimo;
  const simplificada = estado.versoes.emprestimo === "simplificada";
  const valor = estado.emprestimo.valor ?? 0;
  const n = estado.emprestimo.parcelas ?? 1;
  return (
    <div>
      <Cabecalho voltar="emprestimo3.voltar" titulo="Confirmação" />
      <Etapas atual={3} total={3} />
      <div className="space-y-4 p-4">
        {simplificada ? (
          <Cartao>
            <p data-leitura className="text-base text-texto">
              Confira: {formatarReais(valor)} em {n}x de {formatarReais(valorParcela(valor, n))}.
            </p>
          </Cartao>
        ) : (
          <Cartao>
            <p data-leitura className="text-xs leading-relaxed text-texto-suave">
              Ao prosseguir, o CLIENTE declara ter ciência das Condições Gerais da Cédula de Crédito
              Bancário (CCB), do Custo Efetivo Total (CET) e dos encargos incidentes, bem como autoriza a
              consulta e o registro de informações no Sistema de Informações de Crédito (SCR) do Banco
              Central, nos termos da regulamentação vigente, e reconhece que a liberação do crédito está
              sujeita à análise cadastral e à disponibilidade de limite na data da operação, podendo as
              condições ofertadas ser alteradas sem aviso prévio até a efetiva contratação.
            </p>
          </Cartao>
        )}

        <Clicavel
          actionId="emprestimo3.aceite"
          tipo="alternador"
          selecionado={aceite}
          className="flex w-full items-start gap-3 rounded-xl border border-borda bg-cartao p-3 text-left text-sm text-texto"
        >
          <span
            aria-hidden
            className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border-2 ${
              aceite ? "border-marca bg-marca text-azul" : "border-texto-suave"
            }`}
          >
            {aceite && <CircleCheck size={14} />}
          </span>
          {simplificada
            ? "Li e concordo com o contrato"
            : "Declaro que li e concordo com as Condições Gerais da CCB e autorizo a consulta ao SCR"}
        </Clicavel>

        {simplificada ? (
          <BotaoPrincipal actionId="emprestimo3.contratar" desabilitado={!aceite}>
            Contratar empréstimo
          </BotaoPrincipal>
        ) : (
          <div className="pt-24 text-right">
            <Clicavel
              actionId="emprestimo3.contratar"
              desabilitado={!aceite}
              className="px-2 py-1 text-xs text-texto-apagado underline"
            >
              contratar
            </Clicavel>
          </div>
        )}
      </div>
    </div>
  );
}

export function TelaEmprestimoSucesso() {
  const { estado } = useBanco();
  const valor = estado.emprestimo.valor ?? 0;
  const n = estado.emprestimo.parcelas ?? 1;
  return (
    <div className="grid min-h-full place-items-center p-6 text-center">
      <div className="space-y-3">
        <CircleCheck aria-hidden size={56} className="mx-auto text-sucesso" />
        <h1 className="text-xl font-bold text-azul">Empréstimo solicitado</h1>
        <p data-leitura className="text-sm text-texto">
          {formatarReais(valor)} em {n} parcelas. Operação fictícia de demonstração.
        </p>
        <BotaoPrincipal actionId="sucesso.inicio">Voltar ao início</BotaoPrincipal>
      </div>
    </div>
  );
}
