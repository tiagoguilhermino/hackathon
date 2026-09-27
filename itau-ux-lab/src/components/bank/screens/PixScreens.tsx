"use client";

import { CalendarClock, CheckCircle2, Ellipsis, Repeat, User } from "lucide-react";
import { SCREEN_TITLES } from "@/lib/bank/flows";
import { ACCOUNT, PIX_CONTACTS, formatBRL, parseCurrency, pixRecipient } from "@/lib/bank/state";
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
        {state.pixVersion && <RecentContacts />}
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

/** Contatos recentes (só no fluxo da vila): tocar preenche a chave. */
function RecentContacts() {
  return (
    <div className="space-y-2">
      <A11yText className="text-sm text-neutral-600">Contatos recentes</A11yText>
      {PIX_CONTACTS.map((c) => (
        <ActionButton key={c.id} actionId={`pix-contact-${c.id}`} variant="secondary" prominence="normal" className="w-full !border-neutral-200 !p-3 text-left !font-normal">
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-itau-orange/10 text-itau-orange">
              <User size={18} aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-itau-navy">{c.name}</span>
              <span className="block text-xs text-neutral-500">{c.detail}</span>
            </span>
          </span>
        </ActionButton>
      ))}
      <A11yText className="text-xs text-neutral-500">Contatos fictícios de demonstração.</A11yText>
    </div>
  );
}

/**
 * A tela testada na vila de personas: muda só o jeito de oferecer "repetir todo mês".
 * A: escondido no botão ⋯ (Mais opções) · B: só um ícone · C: ícone com o texto.
 */
function RepeatOption() {
  const { state } = useBank();
  const { pixVersion: version, pix } = state;
  if (version === "C") {
    return (
      <Card className="flex items-center gap-3 border border-itau-orange/40 bg-itau-orange/5">
        <Repeat size={26} aria-hidden className="shrink-0 text-itau-orange" />
        <div className="flex-1 text-sm">
          <A11yText className="font-semibold text-itau-navy">Deseja automatizar?</A11yText>
          <A11yText className="text-neutral-600">Repita este mesmo valor todos os meses.</A11yText>
        </div>
        <ActionButton actionId="pix-repeat" pressed={pix.recurring} prominence="high" className="!px-3 !py-2 text-sm">
          {pix.recurring ? "Repetindo todo mês" : "Repetir todo mês"}
        </ActionButton>
      </Card>
    );
  }
  if (version === "A" && pix.moreOpen) {
    return (
      <Card className="!p-2">
        <ActionButton actionId="pix-repeat" variant="ghost" pressed={pix.recurring} className="flex w-full items-center justify-between !px-2 !py-2 text-sm">
          <span className="text-itau-navy">Repetir todo mês</span>
          <span aria-hidden className={`h-5 w-9 rounded-full p-0.5 ${pix.recurring ? "bg-itau-orange" : "bg-neutral-300"}`}>
            <span className={`block h-4 w-4 rounded-full bg-white transition ${pix.recurring ? "translate-x-4" : ""}`} />
          </span>
        </ActionButton>
      </Card>
    );
  }
  return null;
}

export function PixConfirm() {
  const { state } = useBank();
  const recipient = pixRecipient(state.pix.key);
  const version = state.pixVersion;
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
          {version && (
            <div className="flex items-start justify-between gap-2">
              <div>
                <A11yText className="text-xs text-neutral-500">Destinatário</A11yText>
                <A11yText className="text-lg font-semibold text-itau-navy">{recipient?.name ?? state.pix.key}</A11yText>
              </div>
              {version === "A" && (
                <ActionButton
                  actionId="pix-more"
                  variant="ghost"
                  prominence="low"
                  ariaLabel="Mais opções"
                  iconOnly="ícone sem texto: três pontinhos"
                  pressed={state.pix.moreOpen}
                  className="!rounded-full !p-1.5 !text-neutral-500"
                >
                  <Ellipsis size={22} aria-hidden />
                </ActionButton>
              )}
              {version === "B" && (
                <ActionButton
                  actionId="pix-repeat"
                  variant="ghost"
                  prominence="low"
                  ariaLabel="Repetir este Pix"
                  iconOnly="ícone sem texto: duas setas em círculo"
                  pressed={state.pix.recurring}
                  className={`!rounded-full border !p-2.5 ${state.pix.recurring ? "border-itau-orange bg-itau-orange/10" : "border-neutral-200"}`}
                >
                  <Repeat size={20} aria-hidden />
                </ActionButton>
              )}
            </div>
          )}
          <A11yText>Chave: {state.pix.key}</A11yText>
          <A11yText>Valor: {formatBRL(parseCurrency(state.pix.amount) || 0)}</A11yText>
          <A11yText>Quando: agora</A11yText>
          {version && <A11yText className="text-xs font-semibold text-itau-orange">Pix Instantâneo</A11yText>}
        </Card>
        {version && <RepeatOption />}
        {version && <A11yText className="text-center text-xs text-neutral-500">Transação fictícia de teste</A11yText>}
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

/** Fim do fluxo da vila quando o "repetir todo mês" estava ligado. */
export function PixScheduled() {
  const { state } = useBank();
  const recipient = pixRecipient(state.pix.key);
  return (
    <ScreenLayout
      screenId="pix-scheduled"
      title={SCREEN_TITLES["pix-scheduled"]}
      showBack={false}
      footer={
        <ActionButton actionId="success-home" className="w-full">
          Voltar ao início
        </ActionButton>
      }
    >
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <CalendarClock size={64} className="text-green-600" />
        <A11yText role="heading" className="text-xl font-semibold text-itau-navy">
          Pix agendado todo mês
        </A11yText>
        <A11yText className="text-neutral-600">
          {formatBRL(parseCurrency(state.pix.amount) || 0)} para {recipient?.name ?? state.pix.key}, repetindo todo mês no mesmo dia. Operação
          fictícia.
        </A11yText>
      </div>
    </ScreenLayout>
  );
}
