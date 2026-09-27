"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Barcode,
  Bell,
  CreditCard,
  Eye,
  EyeOff,
  HandCoins,
  Home,
  LineChart,
  QrCode,
} from "lucide-react";
import type { ReactNode } from "react";
import { ACCOUNT, formatBRL } from "@/lib/bank/state";
import { useBank } from "../BankContext";
import { A11yText, ActionButton, Card } from "../primitives";
import { ScreenLayout } from "../ScreenLayout";

function Shortcut({ actionId, icon, label }: { actionId: string; icon: ReactNode; label: string }) {
  return (
    <ActionButton actionId={actionId} variant="ghost" prominence="normal" ariaLabel={label} className="!p-0">
      <span className="flex flex-col items-center gap-1.5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-itau-orange shadow-sm">
          {icon}
        </span>
        <span className="text-xs font-medium text-itau-navy">{label}</span>
      </span>
    </ActionButton>
  );
}

const TRANSACTIONS = [
  { label: "Pix recebido · Maria S.", value: 250, in: true },
  { label: "Mercado Bom Preço", value: -187.4, in: false },
  { label: "Conta de luz", value: -142.9, in: false },
];

export function HomeScreen() {
  const { state } = useBank();

  const header = (
    <header className="bg-itau-orange px-4 pb-6 pt-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-white px-2 text-sm font-black text-itau-orange">
            lume
          </span>
          <A11yText role="heading" as="h1" className="text-lg font-semibold">
            Olá, cliente
          </A11yText>
        </div>
        <Bell size={22} aria-hidden />
      </div>
      <p className="mt-1 text-xs text-white/80">
        Banco Lume (fictício) · Ag {ACCOUNT.agency} · Cc {ACCOUNT.account}
      </p>
    </header>
  );

  return (
    <ScreenLayout
      screenId="home"
      title="Início"
      header={header}
      footer={
        <nav className="-m-2 grid grid-cols-3 text-xs">
          <ActionButton actionId="nav-home" role="tab" variant="ghost" className="!py-1">
            <span className="flex flex-col items-center gap-0.5">
              <Home size={20} /> Início
            </span>
          </ActionButton>
          <ActionButton actionId="nav-pix" role="tab" variant="ghost" ariaLabel="Pix (menu)" className="!py-1 !text-neutral-500">
            <span className="flex flex-col items-center gap-0.5">
              <QrCode size={20} /> Pix
            </span>
          </ActionButton>
          <ActionButton actionId="nav-cards" role="tab" variant="ghost" ariaLabel="Cartões (menu)" className="!py-1 !text-neutral-500">
            <span className="flex flex-col items-center gap-0.5">
              <CreditCard size={20} /> Cartões
            </span>
          </ActionButton>
        </nav>
      }
    >
      <div className="space-y-4 px-4 py-4">
        <Card>
          <div className="flex items-center justify-between">
            <A11yText className="text-sm text-neutral-500">Saldo em conta</A11yText>
            <ActionButton
              actionId="home-toggle-balance"
              variant="ghost"
              ariaLabel={state.balanceVisible ? "Ocultar saldo" : "Mostrar saldo"}
              className="!p-1"
            >
              {state.balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
            </ActionButton>
          </div>
          <A11yText className="mt-1 text-2xl font-bold text-itau-navy">
            {state.balanceVisible ? formatBRL(ACCOUNT.balance) : "R$ •••••"}
          </A11yText>
        </Card>

        <div className="grid grid-cols-5 gap-1">
          <Shortcut actionId="home-pix" icon={<QrCode size={24} />} label="Pix" />
          <Shortcut actionId="home-pay" icon={<Barcode size={24} />} label="Pagar" />
          <Shortcut actionId="home-loan" icon={<HandCoins size={24} />} label="Empréstimo" />
          <Shortcut actionId="home-cards" icon={<CreditCard size={24} />} label="Cartões" />
          <Shortcut actionId="home-invest" icon={<LineChart size={24} />} label="Investir" />
        </div>

        <Card className="border-l-4 border-itau-orange">
          <A11yText role="heading" as="h3" className="font-semibold text-itau-navy">
            Crédito pré-aprovado
          </A11yText>
          <A11yText className="mt-1 text-sm text-neutral-600">
            Você tem até {formatBRL(ACCOUNT.preApprovedLimit)} disponíveis, com a 1ª parcela para daqui 60 dias.
          </A11yText>
          <ActionButton actionId="home-offer-loan" variant="ghost" className="!px-0 !pb-0">
            Simular agora
          </ActionButton>
        </Card>

        <Card>
          <A11yText role="heading" as="h3" className="mb-2 font-semibold text-itau-navy">
            Últimos lançamentos
          </A11yText>
          <ul className="divide-y divide-neutral-100">
            {TRANSACTIONS.map((t) => (
              <li key={t.label} className="flex items-center gap-3 py-2 text-sm">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${t.in ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-500"}`}
                >
                  {t.in ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <span className="flex-1 text-neutral-700">{t.label}</span>
                <span className={t.in ? "text-green-600" : "text-neutral-700"}>{formatBRL(t.value)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </ScreenLayout>
  );
}
