"use client";

import { CheckCircle2 } from "lucide-react";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import { ACCOUNT, formatBRL, parseCurrency } from "@/lib/bank/state";
import { useBank } from "../BankContext";
import { A11yText, ActionButton, ActionInput, Card, ErrorAlert } from "../primitives";
import { ScreenLayout } from "../ScreenLayout";

export function PixScreen() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="pix"
      title={SCREEN_TITLES.pix}
      footer={
        <ActionButton actionId="pix-continue" className="w-full">
          Continuar
        </ActionButton>
      }
    >
      <div className="space-y-5 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Para quem você quer transferir?
        </A11yText>
        <ActionInput
          actionId="pix-key"
          label="Chave Pix (CPF, celular, e-mail ou aleatória)"
          value={state.pix.key}
          placeholder="Digite a chave"
        />
        <ActionInput
          actionId="pix-amount"
          label={`Valor (saldo disponível ${formatBRL(ACCOUNT.balance)})`}
          value={state.pix.amount}
          placeholder="0,00"
          inputMode="decimal"
          prefix="R$"
        />
        <ErrorAlert />
      </div>
    </ScreenLayout>
  );
}

export function PixConfirm() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="pix-confirm"
      title={SCREEN_TITLES["pix-confirm"]}
      footer={
        <ActionButton actionId="pix-confirm" className="w-full">
          Confirmar Pix
        </ActionButton>
      }
    >
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Revise a transferência
        </A11yText>
        <Card className="space-y-2 text-sm">
          <A11yText>Chave: {state.pix.key}</A11yText>
          <A11yText>Valor: {formatBRL(parseCurrency(state.pix.amount) || 0)}</A11yText>
          <A11yText>Quando: agora</A11yText>
        </Card>
      </div>
    </ScreenLayout>
  );
}

export function PixSuccess() {
  return (
    <ScreenLayout
      screenId="pix-success"
      title={SCREEN_TITLES["pix-success"]}
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
          Pix enviado!
        </A11yText>
      </div>
    </ScreenLayout>
  );
}
