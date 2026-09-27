"use client";

import { Briefcase, Copy, FileText, KeyRound, QrCode } from "lucide-react";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import { formatBRL, parseCurrency } from "@/lib/bank/state";
import { useBank } from "../BankContext";
import { A11yText, ActionButton, ActionInput, Card, ErrorAlert } from "../primitives";
import { ScreenLayout } from "../ScreenLayout";
import { MenuOption } from "./MenuOption";

/** Menu Depositar: o que aparece depende do layout (boleto e chaves podem morar aqui ou não). */
export function DepositScreen() {
  const { state } = useBank();
  const { boleto, keys } = state.layout;
  return (
    <ScreenLayout screenId="deposit" title={SCREEN_TITLES.deposit}>
      <div className="space-y-3 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Como você quer colocar dinheiro na conta?
        </A11yText>
        {boleto === "deposito" && (
          <MenuOption actionId="deposit-boleto" icon={<FileText size={20} />} title="Depositar via boleto" hint="Gere um boleto para pagar em qualquer banco" />
        )}
        {keys === "deposito" && (
          <MenuOption actionId="deposit-keys" icon={<KeyRound size={20} />} title="Depositar via Pix (Minhas chaves e QR Code)" hint="Mostre sua chave para receber" />
        )}
        <MenuOption actionId="deposit-portability" icon={<Briefcase size={20} />} title="Portabilidade de salário" hint="Receba o salário nesta conta" />
      </div>
    </ScreenLayout>
  );
}

export function BoletoDepositScreen() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="boleto-deposit"
      title={SCREEN_TITLES["boleto-deposit"]}
      footer={
        <ActionButton actionId="boleto-generate" className="w-full">
          Gerar boleto
        </ActionButton>
      }
    >
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Quanto você quer depositar?
        </A11yText>
        <ActionInput actionId="boleto-amount" label="Valor do depósito" value={state.deposit.amount} placeholder="0,00" inputMode="decimal" prefix="R$" />
        <A11yText className="text-xs text-neutral-500">O valor cai na conta até 1 dia útil depois do pagamento.</A11yText>
        <ErrorAlert />
      </div>
    </ScreenLayout>
  );
}

export function BoletoGenerated() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="boleto-generated"
      title={SCREEN_TITLES["boleto-generated"]}
      showBack={false}
      footer={
        <ActionButton actionId="success-home" className="w-full">
          Voltar ao início
        </ActionButton>
      }
    >
      <div className="space-y-4 p-6 text-center">
        <FileText size={56} className="mx-auto text-green-600" />
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Boleto de {formatBRL(parseCurrency(state.deposit.amount) || 0)} gerado
        </A11yText>
        <Card className="text-xs text-neutral-600">
          <A11yText>Código do boleto (fictício): 00190.00009 01234.567891 23456.789012 3 00000000010000</A11yText>
        </Card>
      </div>
    </ScreenLayout>
  );
}

/** Minhas chaves e QR Code: fica em Depositar ou dentro do Pix, conforme o layout. */
export function MyKeysScreen() {
  return (
    <ScreenLayout screenId="my-keys" title={SCREEN_TITLES["my-keys"]}>
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Suas chaves Pix
        </A11yText>
        <Card className="space-y-2 text-sm">
          <A11yText>Celular: (11) 9••••-1234</A11yText>
          <A11yText>E-mail: cl•••@exemplo.com</A11yText>
          <A11yText>Chave aleatória: 7f3c••••-••••-4b21</A11yText>
        </Card>
        <Card className="flex flex-col items-center gap-2">
          <QrCode size={96} className="text-itau-navy" aria-hidden />
          <A11yText className="text-xs text-neutral-500">QR Code para receber (fictício)</A11yText>
        </Card>
        <ActionButton actionId="my-keys-copy" variant="secondary" className="w-full">
          <span className="flex items-center justify-center gap-2">
            <Copy size={16} /> Copiar chave
          </span>
        </ActionButton>
      </div>
    </ScreenLayout>
  );
}
