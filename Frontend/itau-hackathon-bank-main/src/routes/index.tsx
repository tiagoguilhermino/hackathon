import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Gift,
  HandCoins,
  Home,
  Lightbulb,
  MessageCircle,
  MoreHorizontal,
  PiggyBank,
  QrCode,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lume — Sua vida financeira em um só lugar" },
      {
        name: "description",
        content: "Acompanhe sua conta, faça Pix, pague contas e cuide do seu cartão pelo app Lume.",
      },
      { property: "og:title", content: "Lume — Banco digital do seu jeito" },
      {
        property: "og:description",
        content: "Conta, Pix, cartões e investimentos em uma experiência simples e segura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Shortcut = {
  label: string;
  icon: LucideIcon;
  tone?: "primary" | "neutral";
};

const shortcuts: Shortcut[] = [
  { label: "Pix", icon: QrCode, tone: "primary" },
  { label: "Pagar", icon: ReceiptText },
  { label: "Transferir", icon: Send },
  { label: "Depositar", icon: ArrowDownLeft },
  { label: "Recarga", icon: Smartphone },
  { label: "Empréstimos", icon: HandCoins },
];

const navItems = [
  { label: "Início", icon: Home },
  { label: "Extrato", icon: FileText },
  { label: "Cartões", icon: CreditCard },
  { label: "Benefícios", icon: Gift },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function Index() {
  const [showBalance, setShowBalance] = useState(true);
  const [activeNav, setActiveNav] = useState("Início");
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  return (
    <main className="min-h-screen bg-canvas pb-28 text-foreground lg:pb-10">
      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-6 sm:px-8 lg:pb-20 lg:pt-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Abrir perfil"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary-foreground/25 bg-primary-strong transition hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
              >
                <UserRound size={21} strokeWidth={2.2} />
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary-foreground/75">Boa tarde</p>
                <p className="truncate text-base font-bold">Raphael</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Pesquisar"
                onClick={() => setShowSearch((open) => !open)}
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
              >
                {showSearch ? <X size={21} /> : <Search size={21} />}
              </button>
              <button
                type="button"
                aria-label="Ajuda"
                className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
              >
                <CircleHelp size={21} />
              </button>
              <button
                type="button"
                aria-label="Notificações"
                onClick={() => setShowNotice((open) => !open)}
                className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
              >
                <Bell size={21} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-highlight ring-2 ring-primary" />
              </button>
            </div>
          </div>

          {showSearch && (
            <label className="mt-5 flex items-center gap-3 rounded-md bg-surface px-4 py-3 text-foreground shadow-lg">
              <Search size={19} className="text-muted-foreground" />
              <input
                autoFocus
                type="search"
                placeholder="O que você procura?"
                className="min-w-0 flex-1 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
              />
            </label>
          )}

          {showNotice && (
            <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md bg-primary-foreground/10 p-4 text-sm">
              <ShieldCheck size={20} className="mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold">Tudo certo por aqui</p>
                <p className="mt-0.5 text-primary-foreground/75">Sua conta está protegida e sem alertas.</p>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-end">
            <section aria-labelledby="balance-heading">
              <div className="flex items-center gap-2">
                <h1 id="balance-heading" className="text-sm font-semibold text-primary-foreground/80">
                  Saldo em conta
                </h1>
                <button
                  type="button"
                  onClick={() => setShowBalance((visible) => !visible)}
                  aria-label={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
                  className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-primary-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
                >
                  {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <div className="mt-1 flex items-end gap-2">
                <p className="font-display text-3xl font-bold tracking-normal sm:text-4xl">
                  {showBalance ? formatCurrency(8247.53) : "R$ ••••••"}
                </p>
                <ChevronDown size={20} className="mb-1.5 text-primary-foreground/75" />
              </div>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-foreground"
              >
                Ver extrato <ArrowRight size={17} />
              </button>
            </section>

            <div className="hidden rounded-md border border-primary-foreground/15 bg-primary-foreground/10 p-5 lg:block">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/65">Conta rendendo</p>
                  <p className="mt-2 text-lg font-bold">Seu dinheiro não fica parado</p>
                  <p className="mt-1 text-sm text-primary-foreground/75">Rendimento automático todos os dias.</p>
                </div>
                <Sparkles size={24} className="shrink-0 text-highlight" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <section className="relative -mt-7 lg:-mt-11" aria-label="Acessos rápidos">
          <div className="overflow-hidden rounded-lg bg-surface shadow-card">
            <div className="grid grid-cols-4 lg:grid-cols-6">
              {shortcuts.map(({ label, icon: Icon, tone }, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedShortcut(label)}
                  className={`group flex min-h-24 flex-col items-center justify-center gap-2 border-border px-2 py-4 text-xs font-semibold transition hover:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-primary ${index > 3 ? "hidden lg:flex" : ""}`}
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full transition group-hover:-translate-y-0.5 ${tone === "primary" ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"}`}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {selectedShortcut && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm shadow-sm">
              <p className="min-w-0 truncate">
                <span className="font-bold">{selectedShortcut}</span> selecionado
              </p>
              <button
                type="button"
                onClick={() => setSelectedShortcut(null)}
                aria-label="Fechar aviso"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
              >
                <X size={17} />
              </button>
            </div>
          )}
        </section>

        <div className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:gap-6 lg:py-8">
          <div className="space-y-5">
            <section className="rounded-lg bg-surface p-5 shadow-card sm:p-6" aria-labelledby="card-heading">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                    <CreditCard size={21} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Cartão final 4821</p>
                    <h2 id="card-heading" className="truncate text-lg font-bold">Cartão de crédito</h2>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Mais opções do cartão"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <MoreHorizontal size={21} />
                </button>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Fatura atual</p>
                  <p className="mt-1 font-display text-2xl font-bold">{showBalance ? formatCurrency(1893.42) : "R$ •••••"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Fecha em 8 dias</p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Ver fatura <ChevronRight size={17} />
                </button>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                  <span className="font-medium">Limite utilizado</span>
                  <span className="text-muted-foreground">R$ 1.893 de R$ 7.500</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/4 rounded-full bg-secondary" />
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-surface p-5 shadow-card sm:p-6" aria-labelledby="payments-heading">
              <div className="flex items-center justify-between gap-3">
                <h2 id="payments-heading" className="text-lg font-bold">Próximos pagamentos</h2>
                <button type="button" className="text-sm font-bold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-primary">
                  Ver todos
                </button>
              </div>
              <div className="mt-5 divide-y divide-border">
                <PaymentRow icon={Zap} title="Energia" date="Vence amanhã" value="R$ 184,70" />
                <PaymentRow icon={Smartphone} title="Celular" date="Vence 02 out" value="R$ 69,90" />
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="overflow-hidden rounded-lg bg-secondary text-secondary-foreground shadow-card">
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-secondary-foreground/10">
                    <PiggyBank size={22} />
                  </span>
                  <span className="rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground">Novo</span>
                </div>
                <h2 className="mt-5 text-xl font-bold">Comece sua reserva</h2>
                <p className="mt-2 text-sm leading-6 text-secondary-foreground/75">
                  Guarde um pouco todo mês e acompanhe seus objetivos.
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-foreground"
                >
                  Conhecer opções <ArrowRight size={17} />
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 sm:p-6" aria-labelledby="tip-heading">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Lightbulb size={19} />
                </span>
                <div>
                  <h2 id="tip-heading" className="font-bold">Dica para você</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Você gastou 12% menos com alimentação neste mês.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="Navegação principal">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
          {navItems.slice(0, 2).map((item) => (
            <NavButton key={item.label} {...item} active={activeNav === item.label} onClick={() => setActiveNav(item.label)} />
          ))}
          <button
            type="button"
            onClick={() => setSelectedShortcut("Pix")}
            className="mx-auto -mt-7 flex h-14 w-14 flex-col items-center justify-center rounded-full bg-accent text-accent-foreground shadow-float transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Abrir Pix"
          >
            <QrCode size={23} />
            <span className="mt-0.5 text-[10px] font-bold">Pix</span>
          </button>
          {navItems.slice(2).map((item) => (
            <NavButton key={item.label} {...item} active={activeNav === item.label} onClick={() => setActiveNav(item.label)} />
          ))}
        </div>
      </nav>

      <button
        type="button"
        aria-label="Falar no chat"
        className="fixed bottom-7 right-7 hidden h-13 w-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-float transition hover:-translate-y-1 lg:grid"
      >
        <MessageCircle size={23} />
      </button>
    </main>
  );
}

function PaymentRow({ icon: Icon, title, date, value }: { icon: LucideIcon; title: string; date: string; value: string }) {
  return (
    <button type="button" className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-4 text-left first:pt-0 last:pb-0 focus-visible:outline-2 focus-visible:outline-primary">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-muted text-foreground">
        <Icon size={19} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">{title}</span>
        <span className="block text-xs text-muted-foreground">{date}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold">{value}</span>
    </button>
  );
}

function NavButton({ label, icon: Icon, active, onClick }: { label: string; icon: LucideIcon; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition focus-visible:outline-2 focus-visible:outline-primary ${active ? "text-primary" : "text-muted-foreground"}`}
    >
      {active && <span className="absolute top-0 h-0.5 w-5 rounded-full bg-primary" />}
      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      {label}
    </button>
  );
}