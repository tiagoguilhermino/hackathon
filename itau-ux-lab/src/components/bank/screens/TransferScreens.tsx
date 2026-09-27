"use client";

import { CheckCircle2, QrCode, Send } from "lucide-react";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import { ACCOUNT, formatBRL, parseCurrency } from "@/lib/bank/state";
import { useBank } from "../BankContext";
import { A11yText, ActionButton, ActionInput, Card, ErrorAlert } from "../primitives";
import { ScreenLayout } from "../ScreenLayout";
import { MenuOption } from "./MenuOption";

/** Layout "Dentro de Transferir": o atalho da tela inicial abre este menu com Pix e TED. */
export function TransferScreen() {
  return (
    <ScreenLayout screenId="transfer" title={SCREEN_TITLES.transfer}>
      <div className="space-y-3 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Como você quer transferir?
        </A11yText>
        <MenuOption actionId="transfer-pix" icon={<QrCode size={20} />} title="Transferência via Pix" hint="Na hora, com chave ou contato" />
        <MenuOption actionId="transfer-ted" icon={<Send size={20} />} title="Transferência via TED / DOC" hint="Com agência e conta" />
      </div>
    </ScreenLayout>
  );
}

export function TedScreen() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="ted"
      title={SCREEN_TITLES.ted}
      footer={
        <ActionButton actionId="ted-continue" className="w-full">
          Continuar
        </ActionButton>
      }
    >
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Para quem você quer transferir?
        </A11yText>
        <ActionInput actionId="ted-name" label="Nome do favorecido" value={state.ted.name} placeholder="Nome completo" />
        <div className="grid grid-cols-2 gap-3">
          <ActionInput actionId="ted-agency" label="Agência" value={state.ted.agency} placeholder="0000" inputMode="numeric" />
          <ActionInput actionId="ted-account" label="Conta" value={state.ted.account} placeholder="00000-0" inputMode="numeric" />
        </div>
        <ActionInput
          actionId="ted-amount"
          label={`Valor (saldo disponível ${formatBRL(ACCOUNT.balance)})`}
          value={state.ted.amount}
          placeholder="0,00"
          inputMode="decimal"
          prefix="R$"
        />
        <A11yText className="text-xs text-neutral-500">Banco do favorecido: Banco Aurora (fictício).</A11yText>
        <ErrorAlert />
      </div>
    </ScreenLayout>
  );
}

export function TedConfirm() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="ted-confirm"
      title={SCREEN_TITLES["ted-confirm"]}
      footer={
        <ActionButton actionId="ted-send" className="w-full">
          Confirmar TED
        </ActionButton>
      }
    >
      <div className="space-y-4 p-4">
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Revise a transferência
        </A11yText>
        <Card className="space-y-2 text-sm">
          <A11yText>Favorecido: {state.ted.name}</A11yText>
          <A11yText>
            Agência {state.ted.agency} · Conta {state.ted.account} · Banco Aurora
          </A11yText>
          <A11yText>Valor: {formatBRL(parseCurrency(state.ted.amount) || 0)}</A11yText>
        </Card>
        <A11yText className="text-center text-xs text-neutral-500">Transação fictícia de teste</A11yText>
      </div>
    </ScreenLayout>
  );
}

export function TedSuccess() {
  const { state } = useBank();
  return (
    <ScreenLayout
      screenId="ted-success"
      title={SCREEN_TITLES["ted-success"]}
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
          TED enviada!
        </A11yText>
        <A11yText className="text-neutral-600">
          {formatBRL(parseCurrency(state.ted.amount) || 0)} para {state.ted.name}. Operação fictícia.
        </A11yText>
      </div>
    </ScreenLayout>
  );
}
