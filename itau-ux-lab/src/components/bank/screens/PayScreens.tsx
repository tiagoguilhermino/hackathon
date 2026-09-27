"use client";

import { Barcode, CheckCircle2, ClipboardPaste, CreditCard, Smartphone, Zap } from "lucide-react";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import { BILLS, formatBRL } from "@/lib/bank/state";
import { useBank } from "../BankContext";
import { A11yText, ActionButton, Card, ErrorAlert } from "../primitives";
import { ScreenLayout } from "../ScreenLayout";
import { MenuOption } from "./MenuOption";

/** Layout "Um atalho Pagar": o menu reúne boleto, fatura e as contas a vencer. */
export function PaymentsScreen() {
  return (
    <ScreenLayout screenId="payments" title={SCREEN_TITLES.payments}>
      <div className="space-y-3 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          O que você quer pagar?
        </A11yText>
        <MenuOption actionId="pay-bill-option" icon={<Barcode size={20} />} title="Pagar boleto" hint="Com o código de barras" />
        <MenuOption actionId="pay-invoice-option" icon={<CreditCard size={20} />} title="Fatura do cartão" hint={`${formatBRL(BILLS.fatura.amount)} · ${BILLS.fatura.due}`} />
        <A11yText className="pt-2 text-sm text-neutral-600">Contas a vencer</A11yText>
        <MenuOption actionId="pay-upcoming-energy" icon={<Zap size={20} />} title={BILLS.energia.name} hint={`${formatBRL(BILLS.energia.amount)} · ${BILLS.energia.due}`} />
        <MenuOption actionId="pay-upcoming-phone" icon={<Smartphone size={20} />} title={BILLS.celular.name} hint={`${formatBRL(BILLS.celular.amount)} · ${BILLS.celular.due}`} />
      </div>
    </ScreenLayout>
  );
}

/** Pagar boleto: "Colar código recebido" faz o papel da área de transferência do celular. */
export function PayBillScreen() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="pay-bill"
      title={SCREEN_TITLES["pay-bill"]}
      footer={
        <ActionButton actionId="pay-bill-continue" className="w-full">
          Continuar
        </ActionButton>
      }
    >
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Cole o código do boleto
        </A11yText>
        <ActionButton actionId="pay-bill-paste" variant="secondary" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <ClipboardPaste size={16} /> Colar código recebido
          </span>
        </ActionButton>
        {state.billPasted && (
          <Card className="text-xs text-neutral-600">
            <A11yText>Código colado (fictício): 34191.79001 01043.510047 91020.150008 8 99990000035000</A11yText>
          </Card>
        )}
        <ErrorAlert />
      </div>
    </ScreenLayout>
  );
}

export function PayBillConfirm() {
  const { state } = useBank();
  const bill = state.bill ? BILLS[state.bill] : null;
  return (
    <ScreenLayout
      screenId="pay-bill-confirm"
      title={SCREEN_TITLES["pay-bill-confirm"]}
      footer={
        <ActionButton actionId="pay-bill-pay" className="w-full">
          Pagar {bill ? formatBRL(bill.amount) : ""}
        </ActionButton>
      }
    >
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Confira o pagamento
        </A11yText>
        <Card className="space-y-2 text-sm">
          <A11yText>Beneficiário: {bill?.name ?? "—"}</A11yText>
          <A11yText>Valor: {bill ? formatBRL(bill.amount) : "—"}</A11yText>
          <A11yText>Vencimento: {bill?.due ?? "—"}</A11yText>
        </Card>
        <A11yText className="text-center text-xs text-neutral-500">Pagamento fictício de teste</A11yText>
      </div>
    </ScreenLayout>
  );
}

export function PaySuccess() {
  const { state } = useBank();
  const bill = state.bill ? BILLS[state.bill] : null;
  return (
    <ScreenLayout
      screenId="pay-success"
      title={SCREEN_TITLES["pay-success"]}
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
          Pagamento realizado!
        </A11yText>
        <A11yText className="text-neutral-600">
          {bill ? `${bill.name} · ${formatBRL(bill.amount)}` : ""}. Operação fictícia.
        </A11yText>
      </div>
    </ScreenLayout>
  );
}

export function InvoiceScreen() {
  return (
    <ScreenLayout
      screenId="invoice"
      title={SCREEN_TITLES.invoice}
      footer={
        <ActionButton actionId="invoice-pay" className="w-full">
          Pagar fatura
        </ActionButton>
      }
    >
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          {BILLS.fatura.name}
        </A11yText>
        <Card className="space-y-1">
          <A11yText className="text-sm text-neutral-500">Fatura atual</A11yText>
          <A11yText className="text-2xl font-bold text-itau-navy">{formatBRL(BILLS.fatura.amount)}</A11yText>
          <A11yText className="text-xs text-neutral-500">{BILLS.fatura.due}</A11yText>
        </Card>
        <ErrorAlert />
      </div>
    </ScreenLayout>
  );
}
