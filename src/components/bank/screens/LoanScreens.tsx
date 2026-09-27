"use client";

import { CheckCircle2, Info } from "lucide-react";
import {
  INSTALLMENT_OPTIONS,
  LOAN_LIMITS,
  LOAN_MONTHLY_RATE,
  formatBRL,
  parseCurrency,
  priceInstallment,
} from "@/lib/bank/state";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import { useBank } from "../BankContext";
import { A11yText, ActionButton, ActionCheckbox, ActionChip, ActionInput, Card, ErrorAlert } from "../primitives";
import { ScreenLayout, StepIndicator } from "../ScreenLayout";

function useLoanNumbers() {
  const { state } = useBank();
  const amount = parseCurrency(state.loan.amount);
  const n = state.loan.installments ?? 24;
  const principal = Number.isFinite(amount) ? amount : 0;
  const installment = principal > 0 ? priceInstallment(principal, n) : 0;
  return { amount: principal, n, installment, total: installment * n };
}

/** Etapa 1 — Simulação: carga cognitiva baixa, CTA fixo e evidente. */
export function LoanStep1() {
  const { state } = useBank();
  const { installment } = useLoanNumbers();

  return (
    <ScreenLayout
      screenId="loan-1"
      title={SCREEN_TITLES["loan-1"]}
      footer={
        <ActionButton actionId="loan-1-continue" className="w-full">
          Continuar
        </ActionButton>
      }
    >
      <StepIndicator current={1} total={3} />
      <div className="space-y-5 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Quanto você precisa?
        </A11yText>
        <ActionInput
          actionId="loan-amount"
          label={`Valor do empréstimo (de ${formatBRL(LOAN_LIMITS.min)} a ${formatBRL(LOAN_LIMITS.max)})`}
          value={state.loan.amount}
          placeholder="0,00"
          inputMode="decimal"
          prefix="R$"
        />
        <div>
          <A11yText className="mb-2 text-sm text-neutral-600">Em quantas parcelas?</A11yText>
          <div role="radiogroup" className="grid grid-cols-4 gap-2">
            {INSTALLMENT_OPTIONS.map((n) => (
              <ActionChip
                key={n}
                actionId={`loan-installments-${n}`}
                checked={state.loan.installments === n}
                ariaLabel={`${n} parcelas`}
              >
                {n}x
              </ActionChip>
            ))}
          </div>
        </div>
        {installment > 0 && state.loan.installments && (
          <Card>
            <A11yText className="text-sm text-neutral-500">Parcela estimada</A11yText>
            <A11yText className="text-2xl font-bold text-itau-navy">
              {state.loan.installments}x de {formatBRL(installment)}
            </A11yText>
          </Card>
        )}
        <ErrorAlert />
      </div>
    </ScreenLayout>
  );
}

/**
 * Etapa 2 — Condições. Contém atritos deliberados para o simulador medir:
 * jargão financeiro denso, seguro pré-marcado, aceite obrigatório pouco
 * destacado e CTA de baixo contraste posicionado abaixo da dobra.
 */
export function LoanStep2() {
  const { state } = useBank();
  const { amount, n, installment, total } = useLoanNumbers();
  const annual = (Math.pow(1 + LOAN_MONTHLY_RATE, 12) - 1) * 100;
  const iof = amount * 0.0038 + amount * 0.000082 * Math.min(n * 30, 365);

  return (
    <ScreenLayout screenId="loan-2" title={SCREEN_TITLES["loan-2"]}>
      <StepIndicator current={2} total={3} />
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-lg font-semibold text-itau-navy">
          Condições da operação de crédito
        </A11yText>

        <Card className="space-y-2 text-sm text-neutral-700">
          <A11yText>
            Taxa de juros nominal pós-fixada de {(LOAN_MONTHLY_RATE * 100).toFixed(2).replace(".", ",")}% a.m. (
            {annual.toFixed(2).replace(".", ",")}% a.a.), indexada à variação da Taxa Selic, capitalizada mensalmente.
          </A11yText>
          <A11yText>
            CET (Custo Efetivo Total) de {(annual + 4.3).toFixed(2).replace(".", ",")}% a.a., incluindo IOF de{" "}
            {formatBRL(iof)} e tarifa de cadastro (TAC) isenta.
          </A11yText>
          <A11yText>
            Valor liberado: {formatBRL(amount)} · {n} prestações de {formatBRL(installment)} · Montante: {formatBRL(total)}
          </A11yText>
        </Card>

        <ActionButton actionId="loan-details" variant="ghost" prominence="normal" className="!px-0 text-sm">
          <span className="flex items-center gap-1">
            <Info size={16} /> {state.loan.detailsOpen ? "Ocultar" : "Ver"} detalhamento do CET
          </span>
        </ActionButton>
        {state.loan.detailsOpen && (
          <Card className="text-xs text-neutral-600">
            <A11yText>
              Composição do CET conforme Resolução CMN nº 4.881: juros remuneratórios, IOF adicional diário de 0,0082% e
              IOF fixo de 0,38% sobre o valor principal, prêmio de seguro prestamista e encargos moratórios em caso de
              inadimplemento (multa de 2% e juros de mora de 1% a.m.). Carência de 60 dias com incidência de juros
              pro rata die.
            </A11yText>
          </Card>
        )}

        <div>
          <A11yText className="mb-2 text-sm text-neutral-600">Sistema de amortização</A11yText>
          <div role="radiogroup" className="grid grid-cols-2 gap-2">
            <ActionChip actionId="loan-amort-price" checked={state.loan.amortization === "price"}>
              Tabela Price
            </ActionChip>
            <ActionChip actionId="loan-amort-sac" checked={state.loan.amortization === "sac"}>
              SAC
            </ActionChip>
          </div>
        </div>

        <Card>
          <ActionCheckbox actionId="loan-insurance" checked={state.loan.insurance}>
            Contratar Seguro Prestamista (cobertura de saldo devedor em caso de morte ou invalidez permanente total)
          </ActionCheckbox>
        </Card>

        <ActionCheckbox actionId="loan-terms" checked={state.loan.termsAccepted} prominence="low" className="px-1">
          Declaro ciência das condições da Cédula de Crédito Bancário (CCB) e autorizo o débito das prestações em conta
          corrente.
        </ActionCheckbox>

        <ErrorAlert />

        <ActionButton actionId="loan-2-continue" variant="subtle" className="mt-6 w-full">
          Prosseguir
        </ActionButton>
      </div>
    </ScreenLayout>
  );
}

/** Etapa 3 — Confirmação */
export function LoanStep3() {
  const { state } = useBank();
  const { amount, n, installment } = useLoanNumbers();

  return (
    <ScreenLayout
      screenId="loan-3"
      title={SCREEN_TITLES["loan-3"]}
      footer={
        <div className="space-y-2">
          <ActionButton actionId="loan-3-confirm" className="w-full">
            Contratar empréstimo
          </ActionButton>
          <ActionButton actionId="loan-3-cancel" variant="ghost" className="w-full">
            Cancelar
          </ActionButton>
        </div>
      }
    >
      <StepIndicator current={3} total={3} />
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Confira o resumo
        </A11yText>
        <Card className="divide-y divide-neutral-100 text-sm">
          {[
            ["Você recebe", formatBRL(amount)],
            ["Parcelas", `${n}x de ${formatBRL(installment)}`],
            ["Amortização", state.loan.amortization === "price" ? "Tabela Price" : "SAC"],
            ["Seguro prestamista", state.loan.insurance ? "Sim" : "Não"],
            ["1ª parcela", "em 60 dias"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2">
              <A11yText as="span" className="text-neutral-500">
                {k}
              </A11yText>
              <A11yText as="span" className="font-semibold text-itau-navy">
                {v}
              </A11yText>
            </div>
          ))}
        </Card>
      </div>
    </ScreenLayout>
  );
}

export function LoanSuccess() {
  const { amount } = useLoanNumbers();
  return (
    <ScreenLayout
      screenId="loan-success"
      title={SCREEN_TITLES["loan-success"]}
      showBack={false}
      footer={
        <ActionButton actionId="success-home" className="w-full">
          Voltar ao início
        </ActionButton>
      }
    >
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 size={64} className="text-green-600" />
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Empréstimo contratado!
        </A11yText>
        <A11yText className="text-neutral-600">{formatBRL(amount)} serão creditados na sua conta em instantes.</A11yText>
      </div>
    </ScreenLayout>
  );
}
