import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Barcode,
  Bell,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileText,
  Gift,
  HandCoins,
  Home,
  Lightbulb,
  Lock,
  MessageCircle,
  MoreHorizontal,
  PiggyBank,
  QrCode,
  ReceiptText,
  Repeat,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Users,
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

const navItems = [
  { label: "Início", icon: Home },
  { label: "Extrato", icon: FileText },
  { label: "Cartões", icon: CreditCard },
  { label: "Benefícios", icon: Gift },
];

// CONTATOS SALVOS PARA O FLUXO PIX
const mockContacts = [
  { name: "Ana Paula Souza", key: "(11) 98765-4321", bank: "Banco Lume" },
  { name: "Marcos Oliveira", key: "(11) 97654-3210", bank: "Itaú Unibanco" },
  { name: "Juliana Lima", key: "(21) 99876-5432", bank: "Nubank" },
  { name: "Carlos Eduardo", key: "(31) 98123-4567", bank: "Bradesco" },
  { name: "Fernanda Costa", key: "(41) 99112-2334", bank: "Banco do Brasil" },
  { name: "Roberto Santos", key: "(81) 98877-6655", bank: "Santander" },
];

// CONTATOS E FAVORECIDOS SALVOS PARA O FLUXO TED/DOC
const mockTedContacts = [
  { name: "Marcos Oliveira", cpf: "***.987.654-**", bank: "341 — Itaú Unibanco S.A.", agency: "1234", account: "56789-0" },
  { name: "Ana Paula Souza", cpf: "***.123.456-**", bank: "260 — Nu Pagamentos S.A. (Nubank)", agency: "0001", account: "98765-4" },
  { name: "Juliana Lima", cpf: "***.555.444-**", bank: "237 — Banco Bradesco S.A.", agency: "4321", account: "11223-3" },
  { name: "Carlos Eduardo", cpf: "***.888.777-**", bank: "001 — Banco do Brasil S.A.", agency: "3344", account: "44556-7" },
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

  // VERSÃO GERAL DA DASHBOARD (V1, V2 E V3)
  const [dashVersion, setDashVersion] = useState<"v1" | "v2" | "v3">("v3");

  // MODO DE FLUXO DO PIX (FLUXO 1 VS FLUXO 2)
  const [pixFlowMode, setPixFlowMode] = useState<"fluxo1" | "fluxo2">("fluxo2");

  // ESTADOS DO PIX
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixStep, setPixStep] = useState<"hub" | "qrcode" | "key_entry" | "form" | "confirm" | "my_key">("hub");
  const [pixVersion, setPixVersion] = useState<"A" | "B" | "C">("A");
  const [showMenuA, setShowMenuA] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");

  // DADOS DO DESTINATÁRIO DO PIX
  const [recipientName, setRecipientName] = useState("Ana Paula Souza");
  const [recipientKey, setRecipientKey] = useState("(11) 98765-4321");
  const [recipientBank, setRecipientBank] = useState("Banco Lume");

  // DADOS DA TRANSAÇÃO PIX
  const [manualKeyInput, setManualKeyInput] = useState("");
  const [copiaColaInput, setCopiaColaInput] = useState("");
  const [pixAmount, setPixAmount] = useState("250,00");
  const [pixDescription, setPixDescription] = useState("");

  // ESTADOS DE DEPÓSITO / BOLETO
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState<"options" | "pix_me" | "boleto_form" | "boleto_generated" | "portabilidade">("options");
  const [depositAmount, setDepositAmount] = useState("100,00");
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // ESTADOS DE TED/DOC
  const [showTedModal, setShowTedModal] = useState(false);
  const [tedStep, setTedStep] = useState<"form" | "confirm" | "success">("form");
  const [tedMode, setTedMode] = useState<"manual" | "contacts">("manual");
  const [tedBank, setTedBank] = useState("341 — Itaú Unibanco S.A.");
  const [tedAgency, setTedAgency] = useState("");
  const [tedAccount, setTedAccount] = useState("");
  const [tedName, setTedName] = useState("");
  const [tedCpf, setTedCpf] = useState("");
  const [tedAmount, setTedAmount] = useState("300,00");
  const [tedDescription, setTedDescription] = useState("");

  // ESTADO DE TRANSFERÊNCIA UNIFICADA (V3)
  const [showTransferHubModal, setShowTransferHubModal] = useState(false);

  // CONFIGURAÇÃO DOS ATALHOS RÁPIDOS CONFORME A VERSÃO DA DASHBOARD
  const shortcuts: Shortcut[] = dashVersion === "v1"
    ? [
        { label: "Pix", icon: QrCode, tone: "primary" },
        { label: "Pagar", icon: ReceiptText },
        { label: "TED/DOC", icon: Send },
        { label: "Depositar", icon: ArrowDownLeft },
        { label: "Recarga", icon: Smartphone },
        { label: "Empréstimos", icon: HandCoins },
      ]
    : dashVersion === "v2"
    ? [
        { label: "Pix", icon: QrCode, tone: "primary" },
        { label: "Pagar", icon: ReceiptText },
        { label: "TED/DOC", icon: Send },
        { label: "Boleto", icon: Barcode },
        { label: "Recarga", icon: Smartphone },
        { label: "Empréstimos", icon: HandCoins },
      ]
    : [
        // DASH V3: REÚNE PIX E TED/DOC DENTRO DE "TRANSFERIR"
        { label: "Transferir", icon: Send, tone: "primary" },
        { label: "Pagar", icon: ReceiptText },
        { label: "Depositar", icon: ArrowDownLeft },
        { label: "Recarga", icon: Smartphone },
        { label: "Empréstimos", icon: HandCoins },
      ];

  const openPixModal = () => {
    setSelectedShortcut("Pix");
    setPixStep("hub");
    setShowPixModal(true);
  };

  const openDepositModal = () => {
    setSelectedShortcut("Depositar");
    setDepositStep("options");
    setShowDepositModal(true);
  };

  const openBoletoModal = () => {
    setSelectedShortcut("Boleto");
    setDepositStep("boleto_form");
    setShowDepositModal(true);
  };

  const openTedModal = () => {
    setSelectedShortcut("TED/DOC");
    setTedStep("form");
    if (tedMode === "manual") {
      setTedAgency("");
      setTedAccount("");
      setTedName("");
      setTedCpf("");
    }
    setShowTedModal(true);
  };

  const openTransferHubModal = () => {
    setSelectedShortcut("Transferir");
    setShowTransferHubModal(true);
  };

  const selectContact = (contact: (typeof mockContacts)[0]) => {
    setRecipientName(contact.name);
    setRecipientKey(contact.key);
    setRecipientBank(contact.bank);
    setPixStep("form");
  };

  const handleManualKeySubmit = (keyText: string) => {
    if (!keyText || keyText.trim() === "") return;

    if (keyText.toLowerCase().includes("000201") || keyText.length > 25) {
      setRecipientName("Supermercado Exemplo LTDA");
      setRecipientKey(keyText.slice(0, 22) + "...");
      setRecipientBank("Banco Lume");
      setPixAmount("148,90");
    } else {
      setRecipientName("Contato Consultado da Base");
      setRecipientKey(keyText);
      setRecipientBank("Banco Lume");
    }
    setPixStep("form");
  };

  const handleCopyCode = (codeText: string, label: string) => {
    navigator.clipboard?.writeText?.(codeText);
    setCopiedNotification(label);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  const handleDownloadPdf = () => {
    const textContent = `================================================
BANCO LUME - BOLETO BANCÁRIO
================================================
Beneficiário: Raphael (Sua Conta Lume)
Valor: R$ ${depositAmount}
Vencimento: Em 3 dias úteis
Linha Digitável: 34191.09008 61234.567890 12345.678901 8 98760000010000
Status: Aguardando Pagamento
================================================`;
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Boleto_Lume_R$${depositAmount.replace(",", ".")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCopyCode("", "PDF_DOWNLOADED");
  };

  const filteredContacts = mockContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      c.key.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      c.bank.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-canvas pb-28 text-foreground lg:pb-10">
      {/* SELETOR DE VERSÃO DA DASHBOARD (V1, V2 E V3) */}
      <div className="bg-black/90 text-white px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider text-highlight">Versão do App:</span>
          <span className="text-gray-300">
            {dashVersion === "v1" && "Dash V1 (TED/DOC + Depositar)"}
            {dashVersion === "v2" && "Dash V2 (TED/DOC + Boleto)"}
            {dashVersion === "v3" && "Dash V3 (Transferir reunindo Pix e TED/DOC)"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1 rounded-md">
          <button
            type="button"
            onClick={() => setDashVersion("v1")}
            className={`px-3 py-1 rounded font-bold transition ${dashVersion === "v1" ? "bg-accent text-accent-foreground shadow-xs" : "text-gray-300 hover:text-white"}`}
          >
            Dash V1
          </button>
          <button
            type="button"
            onClick={() => setDashVersion("v2")}
            className={`px-3 py-1 rounded font-bold transition ${dashVersion === "v2" ? "bg-accent text-accent-foreground shadow-xs" : "text-gray-300 hover:text-white"}`}
          >
            Dash V2
          </button>
          <button
            type="button"
            onClick={() => setDashVersion("v3")}
            className={`px-3 py-1 rounded font-bold transition ${dashVersion === "v3" ? "bg-accent text-accent-foreground shadow-xs" : "text-gray-300 hover:text-white"}`}
          >
            Dash V3 (Unificada)
          </button>
        </div>
      </div>

      {/* HEADER PRINCIPAL */}
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

      {/* DASHBOARD PRINCIPAL */}
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <section className="relative -mt-7 lg:-mt-11" aria-label="Acessos rápidos">
          <div className="overflow-hidden rounded-lg bg-surface shadow-card">
            <div className="grid grid-cols-4 lg:grid-cols-6">
              {shortcuts.map(({ label, icon: Icon, tone }, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (label === "Pix") openPixModal();
                    else if (label === "Depositar") openDepositModal();
                    else if (label === "Boleto") openBoletoModal();
                    else if (label === "TED/DOC") openTedModal();
                    else if (label === "Transferir") openTransferHubModal();
                    else setSelectedShortcut(label);
                  }}
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
          {selectedShortcut && !showPixModal && !showDepositModal && !showTedModal && !showTransferHubModal && (
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

      {/* MODAL DE TRANSFERÊNCIA UNIFICADA (EXCLUSIVO DA DASH V3) */}
      {showTransferHubModal && dashVersion === "v3" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-bold">Transferir Dinheiro</h2>
                <p className="text-xs text-muted-foreground">Escolha o tipo de transferência desejado</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferHubModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={() => {
                  setShowTransferHubModal(false);
                  openPixModal();
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas p-4 text-left hover:bg-muted hover:border-primary/40 transition shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground">
                    <QrCode size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Transferência via Pix</p>
                    <p className="text-xs text-muted-foreground">Instantâneo 24h por Chave Pix, QR Code ou Copia e Cola</p>
                  </div>
                </div>
                <ChevronRight size={19} className="text-muted-foreground" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTransferHubModal(false);
                  openTedModal();
                }}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas p-4 text-left hover:bg-muted hover:border-primary/40 transition shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Send size={21} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">Transferência via TED / DOC</p>
                    <p className="text-xs text-muted-foreground">Transferência tradicional usando Banco, Agência e Conta</p>
                  </div>
                </div>
                <ChevronRight size={19} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AMBIENTE DE PIX */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* BARRA SUPERIOR DE CONTROLE DO HACKATHON */}
            <div className="bg-primary px-5 py-3 text-primary-foreground border-b border-primary-foreground/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80">
                    Modo de Teste da Vila (Hackathon Itaú)
                  </p>
                  <p className="text-[10px] text-primary-foreground/60">
                    {pixFlowMode === "fluxo1" ? "Fluxo 1: Com Contatos Frequentes" : "Fluxo 2: Entrada Manual e Copia e Cola Destacado"}
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-md bg-primary-strong p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setPixFlowMode("fluxo1");
                      setPixStep("hub");
                    }}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${pixFlowMode === "fluxo1" ? "bg-accent text-accent-foreground shadow-xs" : "text-primary-foreground/80 hover:bg-primary-soft"}`}
                  >
                    Fluxo 1 (Contatos)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPixFlowMode("fluxo2");
                      setPixStep("hub");
                    }}
                    className={`rounded px-2 py-1 text-[11px] font-bold transition ${pixFlowMode === "fluxo2" ? "bg-accent text-accent-foreground shadow-xs" : "text-primary-foreground/80 hover:bg-primary-soft"}`}
                  >
                    Fluxo 2 (Manual & Copia)
                  </button>
                </div>
              </div>

              {pixStep === "confirm" && (
                <div className="mt-3 pt-2 border-t border-primary-foreground/15 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary-foreground/75 uppercase">
                    Variação da Recorrência:
                  </span>
                  <div className="flex items-center gap-1 rounded bg-primary-strong p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPixVersion("A");
                        setShowMenuA(false);
                      }}
                      className={`rounded px-2 py-0.5 text-xs font-bold transition ${pixVersion === "A" ? "bg-accent text-accent-foreground shadow-xs" : "text-primary-foreground/80"}`}
                    >
                      Versão A
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPixVersion("B");
                        setShowMenuA(false);
                      }}
                      className={`rounded px-2 py-0.5 text-xs font-bold transition ${pixVersion === "B" ? "bg-accent text-accent-foreground shadow-xs" : "text-primary-foreground/80"}`}
                    >
                      Versão B
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPixVersion("C");
                        setShowMenuA(false);
                      }}
                      className={`rounded px-2 py-0.5 text-xs font-bold transition ${pixVersion === "C" ? "bg-accent text-accent-foreground shadow-xs" : "text-primary-foreground/80"}`}
                    >
                      Versão C
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* HEADER DO MODAL */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                {pixStep !== "hub" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (pixStep === "confirm") setPixStep("form");
                      else setPixStep("hub");
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold">
                    {pixStep === "hub" && "Área Pix"}
                    {pixStep === "qrcode" && "Leitor de QR Code"}
                    {pixStep === "key_entry" && "Digitar Chave Pix"}
                    {pixStep === "my_key" && "Minhas Chaves & QR Code (Receber)"}
                    {pixStep === "form" && "Valores da Transação"}
                    {pixStep === "confirm" && "Confirmar Pix"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {pixStep === "hub" && (pixFlowMode === "fluxo1" ? "Escolha a forma de transferência ou selecione um contato" : "Cole o código Pix Copia e Cola ou informe a chave manualmente")}
                    {pixStep === "qrcode" && "Aproxime a câmera do código QR"}
                    {pixStep === "key_entry" && "Digite o número de celular, CPF ou e-mail"}
                    {pixStep === "my_key" && "Consulte e compartilhe suas chaves ou QR Code para receber valores"}
                    {pixStep === "form" && "Informe o valor em R$ para a transferência"}
                    {pixStep === "confirm" && "Confirme os dados antes de enviar"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPixModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            {copiedNotification && (
              <div className="bg-accent text-accent-foreground px-4 py-2 text-center text-xs font-bold animate-in fade-in">
                ✓ {copiedNotification} copiado com sucesso!
              </div>
            )}

            {/* FLUXO 1: HUB DO PIX */}
            {pixStep === "hub" && pixFlowMode === "fluxo1" && (
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPixStep("key_entry")}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-canvas p-4 text-center hover:bg-muted hover:border-primary/40 transition shadow-xs"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground">
                      <Send size={20} />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-foreground">Chave Pix</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">Celular ou CPF</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPixStep("qrcode")}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-canvas p-4 text-center hover:bg-muted hover:border-primary/40 transition shadow-xs"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                      <QrCode size={20} />
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-foreground">Ler QR Code</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">Usar a câmera</span>
                    </div>
                  </button>

                  {/* NA DASH V2 E V3: EXIBIR BOTÃO "MINHAS CHAVES & QR CODE" DENTRO DO PIX */}
                  {(dashVersion === "v2" || dashVersion === "v3") && (
                    <button
                      type="button"
                      onClick={() => setPixStep("my_key")}
                      className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 p-4 text-center hover:bg-primary/10 transition shadow-xs"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Copy size={20} />
                      </span>
                      <div>
                        <span className="block text-xs font-bold text-foreground">Minhas Chaves & QR</span>
                        <span className="block text-[10px] text-muted-foreground mt-0.5">Receber na minha conta</span>
                      </div>
                    </button>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Users size={16} /> Contatos Guardados (Protegidos)
                    </span>
                    <span className="text-xs text-muted-foreground">{filteredContacts.length} encontrados</span>
                  </div>

                  <div className="relative">
                    <Search size={17} className="absolute left-3.5 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nome ou celular..."
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-border bg-canvas pl-10 pr-4 py-2 text-sm outline-hidden focus:border-primary"
                    />
                  </div>

                  <div className="divide-y divide-border rounded-lg border border-border bg-canvas max-h-56 overflow-y-auto">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.name}
                        type="button"
                        onClick={() => selectContact(contact)}
                        className="flex w-full items-center justify-between p-3.5 text-left hover:bg-muted transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                            {contact.name.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-foreground">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">Celular: {contact.key} • {contact.bank}</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FLUXO 2: PIX COPIA E COLA DESTACADO */}
            {pixStep === "hub" && pixFlowMode === "fluxo2" && (
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {(dashVersion === "v2" || dashVersion === "v3") && (
                  <button
                    type="button"
                    onClick={() => setPixStep("my_key")}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/15 transition text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                        <Copy size={20} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">Minhas Chaves & QR Code (Receber)</p>
                        <p className="text-xs text-muted-foreground">Ver chaves Pix (E-mail, Aleatória) e QR Code próprio</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-primary" />
                  </button>
                )}

                <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                      <Copy size={21} />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-foreground">Pix Copia e Cola</h3>
                      <p className="text-xs text-muted-foreground">Cole o código Pix fornecido para pagar diretamente</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={3}
                      placeholder="Cole aqui o código longo do Pix Copia e Cola (ex: 000201265800...)"
                      value={copiaColaInput}
                      onChange={(e) => setCopiaColaInput(e.target.value)}
                      className="w-full rounded-md border border-border bg-surface p-3 text-xs font-mono outline-hidden focus:border-primary"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setCopiaColaInput("00020126580014br.gov.bcb.pix.copiaecola.lojaexemplo.987")}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-md hover:bg-primary/20 transition"
                      >
                        <Copy size={13} /> Simular Colar Código
                      </button>

                      <button
                        type="button"
                        onClick={() => handleManualKeySubmit(copiaColaInput || "00020126580014br.gov.bcb.pix.copiaecola.lojaexemplo.987")}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition shadow-xs"
                      >
                        Continuar com Copia e Cola <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-canvas p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Send size={18} className="text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">Transferir por Chave Pix</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground">
                      Digite o número de celular, CPF ou e-mail manualmente:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: (11) 99999-8888 ou chave@email.com"
                        value={manualKeyInput}
                        onChange={(e) => setManualKeyInput(e.target.value)}
                        className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm outline-hidden focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleManualKeySubmit(manualKeyInput)}
                        className="rounded-md bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition"
                      >
                        Consultar
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPixStep("qrcode")}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-canvas hover:bg-muted transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <QrCode size={20} className="text-primary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Usar Câmera (QR Code)</p>
                      <p className="text-xs text-muted-foreground">Escanear código impresso ou em outra tela</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground" />
                </button>
              </div>
            )}

            {/* MINHAS CHAVES & GERADOR DE QR CODE */}
            {pixStep === "my_key" && (
              <div className="p-6 space-y-5 text-center max-h-[80vh] overflow-y-auto">
                <div className="rounded-xl border border-border bg-canvas p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Seu QR Code Pix (Conta Lume)
                  </p>
                  
                  <div className="mx-auto grid h-44 w-44 place-items-center rounded-xl border-4 border-primary bg-white p-2 shadow-md">
                    <QrCode size={140} className="text-primary" />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Mostre este QR Code para quem vai te pagar presencialmente.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Suas Chaves Pix para Compartilhar
                  </p>

                  <div className="rounded-lg bg-canvas border border-border p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">Chave E-mail</span>
                      <span className="font-mono text-xs font-bold text-foreground">raphael.lume@pix.com.br</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode("raphael.lume@pix.com.br", "Chave E-mail")}
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition"
                    >
                      <Copy size={13} /> Copiar
                    </button>
                  </div>

                  <div className="rounded-lg bg-canvas border border-border p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">Chave Aleatória (EVP)</span>
                      <span className="font-mono text-xs font-bold text-foreground truncate block max-w-[200px] sm:max-w-[280px]">
                        d83a9f12-4c2b-4e89-b701-9a2e3f456789
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode("d83a9f12-4c2b-4e89-b701-9a2e3f456789", "Chave Aleatória")}
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition"
                    >
                      <Copy size={13} /> Copiar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {pixStep === "qrcode" && (
              <div className="p-6 space-y-6 text-center">
                <div className="relative mx-auto flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-primary/60 bg-black/90 p-4 shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/20 animate-pulse" />
                  <div className="z-10 flex flex-col items-center gap-3 text-white">
                    <Camera size={38} className="text-highlight animate-bounce" />
                    <p className="text-xs font-semibold px-4">Aproxime o QR Code do centro do quadrado</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientName("Restaurante & Café Lume");
                      setRecipientKey("00020126580014br.gov.bcb.pix.qrcode.123");
                      setRecipientBank("Banco Lume");
                      setPixAmount("64,50");
                      setPixDescription("Almoço executivo");
                      setPixStep("form");
                    }}
                    className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card"
                  >
                    <CheckCircle2 size={18} /> Simular Leitura do QR Code (R$ 64,50)
                  </button>
                </div>
              </div>
            )}

            {pixStep === "key_entry" && (
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Informe a Chave Pix manualmente
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o celular (11) 9xxxx-xxxx, CPF ou e-mail..."
                    value={manualKeyInput}
                    onChange={(e) => setManualKeyInput(e.target.value)}
                    className="w-full rounded-md border border-border bg-canvas px-4 py-3 text-sm font-medium outline-hidden focus:border-primary"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Após informar a chave, consultaremos a base de dados para buscar o destinatário.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleManualKeySubmit(manualKeyInput)}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card"
                >
                  Consultar Dados <ArrowRight size={18} />
                </button>
              </div>
            )}

            {pixStep === "form" && (
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Lock size={13} /> Dados do Destinatário (Base Protegida)
                    </span>
                    <span className="text-[11px] text-primary font-semibold">Consultado</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nome completo</p>
                    <p className="text-sm font-bold text-foreground">{recipientName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Chave / Identificador</p>
                      <p className="font-semibold text-foreground truncate">{recipientKey}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Instituição</p>
                      <p className="font-semibold text-foreground">{recipientBank}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Valor da Transferência (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 font-bold text-muted-foreground">R$</span>
                      <input
                        type="text"
                        autoFocus
                        value={pixAmount}
                        onChange={(e) => setPixAmount(e.target.value)}
                        className="w-full rounded-md border border-border bg-canvas pl-12 pr-4 py-2.5 text-lg font-bold outline-hidden focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Mensagem / Descrição (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Aluguel, Almoço..."
                      value={pixDescription}
                      onChange={(e) => setPixDescription(e.target.value)}
                      className="w-full rounded-md border border-border bg-canvas px-4 py-2.5 text-sm outline-hidden focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPixStep("confirm")}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card"
                >
                  Revisar Transação <ArrowRight size={18} />
                </button>
              </div>
            )}

            {pixStep === "confirm" && (
              <div className="p-6 space-y-6">
                <div className="relative rounded-lg border border-border bg-canvas p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Destinatário</p>
                      <p className="text-base font-bold text-foreground">{recipientName}</p>
                      <p className="text-xs text-muted-foreground">Celular: {recipientKey} • {recipientBank}</p>
                    </div>

                    {pixVersion === "A" && (
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="Mais opções"
                          onClick={() => setShowMenuA((prev) => !prev)}
                          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted transition"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                        {showMenuA && (
                          <div className="absolute right-0 top-10 z-20 w-48 rounded-md border border-border bg-surface p-1 shadow-lg text-xs font-semibold animate-in fade-in">
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-muted"
                              onClick={() => alert("Pix agendado para repetir mensalmente!")}
                            >
                              <Repeat size={14} /> Repetir todo mês
                            </button>
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left hover:bg-muted text-muted-foreground"
                            >
                              Salvar contato
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {pixVersion === "B" && (
                      <button
                        type="button"
                        aria-label="Repetir este Pix"
                        title="Repetir este Pix"
                        onClick={() => alert("Pix agendado para repetir mensalmente!")}
                        className="grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-accent-foreground shadow-xs hover:bg-accent transition"
                      >
                        <Repeat size={19} />
                      </button>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border flex items-end justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Valor a transferir</p>
                      <p className="font-display text-2xl font-bold text-foreground">R$ {pixAmount}</p>
                      {pixDescription && (
                        <p className="text-xs text-muted-foreground mt-1">Obs: "{pixDescription}"</p>
                      )}
                    </div>
                    <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent-foreground">
                      Pix Instantâneo
                    </span>
                  </div>
                </div>

                {pixVersion === "C" && (
                  <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground">
                        <Repeat size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">Deseja automatizar?</p>
                        <p className="text-xs text-muted-foreground">Repita este mesmo valor todos os meses.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("Pix agendado para repetir mensalmente!")}
                      className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-xs font-bold text-accent-foreground shadow-xs hover:opacity-90 transition"
                    >
                      <Repeat size={14} /> Repetir todo mês
                    </button>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Pix de R$ ${pixAmount} para ${recipientName} realizado com sucesso!`);
                      setShowPixModal(false);
                    }}
                    className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card"
                  >
                    <CheckCircle2 size={20} /> Confirmar e Enviar R$ {pixAmount}
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    Transação fictícia de teste protegida pelo Banco Lume
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AMBIENTE DE TED/DOC (TRANSFERÊNCIA TRADICIONAL) */}
      {showTedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* HEADER DO MODAL */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                {tedStep !== "form" && (
                  <button
                    type="button"
                    onClick={() => {
                      if (tedStep === "confirm") setTedStep("form");
                      if (tedStep === "success") setShowTedModal(false);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold">
                    {tedStep === "form" && "Transferência TED / DOC"}
                    {tedStep === "confirm" && "Confirmação de TED"}
                    {tedStep === "success" && "TED Realizada com Sucesso!"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {tedStep === "form" && "Informe os dados bancários do destinatário"}
                    {tedStep === "confirm" && "Revise os dados abaixo. Os dados do favorecido foram travados para segurança."}
                    {tedStep === "success" && "Comprovante de transferência bancária"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTedModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            {/* PASSO 1: FORMULÁRIO DE TED (DIGITAR OU SELECIONAR CONTATO) */}
            {tedStep === "form" && (
              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* TABS DE SELEÇÃO DE MODO */}
                <div className="flex rounded-lg bg-canvas p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setTedMode("manual");
                      setTedAgency("");
                      setTedAccount("");
                      setTedName("");
                      setTedCpf("");
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition ${
                      tedMode === "manual"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ✏️ Digitar Agência e Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTedMode("contacts");
                      const first = mockTedContacts[0];
                      if (first) {
                        setTedName(first.name);
                        setTedCpf(first.cpf);
                        setTedBank(first.bank);
                        setTedAgency(first.agency);
                        setTedAccount(first.account);
                      }
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition ${
                      tedMode === "contacts"
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    👥 Meus Contatos Salvos
                  </button>
                </div>

                <div className="space-y-3">
                  {/* SELEÇÃO DO MODO CONTATOS */}
                  {tedMode === "contacts" && (
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                        Favorecido da Lista
                      </label>
                      <select
                        onChange={(e) => {
                          const contact = mockTedContacts[Number(e.target.value)];
                          if (contact) {
                            setTedName(contact.name);
                            setTedCpf(contact.cpf);
                            setTedBank(contact.bank);
                            setTedAgency(contact.agency);
                            setTedAccount(contact.account);
                          }
                        }}
                        className="w-full rounded-md border border-border bg-canvas px-4 py-2.5 text-sm font-bold outline-hidden focus:border-primary"
                      >
                        {mockTedContacts.map((contact, idx) => (
                          <option key={contact.name} value={idx}>
                            {contact.name} — {contact.bank.split("—")[1]?.trim() || contact.bank} ({contact.agency}/{contact.account})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* DIGITAÇÃO MANIFESTA DE BANCO, AGÊNCIA E CONTA */}
                  {tedMode === "manual" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                          Banco de Destino
                        </label>
                        <select
                          value={tedBank}
                          onChange={(e) => setTedBank(e.target.value)}
                          className="w-full rounded-md border border-border bg-canvas px-4 py-2.5 text-sm font-bold outline-hidden focus:border-primary"
                        >
                          <option value="341 — Itaú Unibanco S.A.">341 — Itaú Unibanco S.A.</option>
                          <option value="260 — Nu Pagamentos S.A. (Nubank)">260 — Nu Pagamentos S.A. (Nubank)</option>
                          <option value="237 — Banco Bradesco S.A.">237 — Banco Bradesco S.A.</option>
                          <option value="001 — Banco do Brasil S.A.">001 — Banco do Brasil S.A.</option>
                          <option value="033 — Banco Santander Brasil">033 — Banco Santander Brasil</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Agência (4 dígitos, sem dígito)
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            value={tedAgency}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setTedAgency(digits);
                            }}
                            placeholder="Ex: 1234"
                            className="w-full rounded-md border border-border bg-canvas px-4 py-2.5 text-sm font-bold outline-hidden focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                            Conta com Dígito
                          </label>
                          <input
                            type="text"
                            maxLength={10}
                            value={tedAccount}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9-]/g, "").slice(0, 10);
                              setTedAccount(val);
                            }}
                            placeholder="Ex: 56789-0"
                            className="w-full rounded-md border border-border bg-canvas px-4 py-2.5 text-sm font-bold outline-hidden focus:border-primary"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* DADOS DE TITULARIDADE RESOLVIDOS AUTOMATICAMENTE OU PLACEHOLDER DE CONSULTA */}
                  {(() => {
                    if (tedMode === "contacts") {
                      return (
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between border-b border-border/60 pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <Lock size={12} className="text-primary" /> Titularidade Consultada pelo Banco
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={10} /> Titular Encontrado
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                Nome do Favorecido
                              </label>
                              <input
                                type="text"
                                value={tedName}
                                readOnly
                                disabled
                                className="w-full rounded-md border border-border/80 bg-muted/60 px-3.5 py-2 text-sm font-medium text-muted-foreground cursor-not-allowed select-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                CPF / CNPJ
                              </label>
                              <input
                                type="text"
                                value={tedCpf}
                                readOnly
                                disabled
                                className="w-full rounded-md border border-border/80 bg-muted/60 px-3.5 py-2 text-sm font-mono font-medium text-muted-foreground cursor-not-allowed select-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const cleanAg = tedAgency.trim().replace(/\D/g, "");
                    const cleanAcc = tedAccount.trim().replace(/\D/g, "");
                    const isAgComplete = cleanAg.length === 4;
                    const isAccComplete = cleanAcc.length >= 5;

                    // Busca exata nos contatos simulados pela agência e conta
                    const matched = isAgComplete && isAccComplete
                      ? mockTedContacts.find(
                          (c) => c.agency.replace(/\D/g, "") === cleanAg && c.account.replace(/\D/g, "") === cleanAcc
                        )
                      : null;

                    if (matched) {
                      return (
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <Lock size={12} className="text-emerald-600 dark:text-emerald-400" /> Titularidade Confirmada
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={10} /> Titular Validação OK
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                Nome do Favorecido
                              </label>
                              <input
                                type="text"
                                value={matched.name}
                                readOnly
                                disabled
                                className="w-full rounded-md border border-border/80 bg-muted/60 px-3.5 py-2 text-sm font-bold text-foreground cursor-not-allowed select-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                CPF / CNPJ
                              </label>
                              <input
                                type="text"
                                value={matched.cpf}
                                readOnly
                                disabled
                                className="w-full rounded-md border border-border/80 bg-muted/60 px-3.5 py-2 text-sm font-mono font-bold text-foreground cursor-not-allowed select-none"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (isAgComplete && isAccComplete) {
                      return (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2.5 text-left animate-in fade-in duration-200">
                          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                            <AlertCircle size={15} />
                            <span>Titular não encontrado para esta Agência e Conta</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            No modo de teste, somente dados de exemplo cadastrados são validados. Escolha um favorecido de exemplo abaixo para preencher automaticamente:
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {mockTedContacts.map((c) => (
                              <button
                                key={c.name}
                                type="button"
                                onClick={() => {
                                  setTedBank(c.bank);
                                  setTedAgency(c.agency);
                                  setTedAccount(c.account);
                                  setTedName(c.name);
                                  setTedCpf(c.cpf);
                                }}
                                className="text-[10px] font-semibold bg-canvas hover:bg-muted border border-border px-2.5 py-1 rounded transition text-foreground flex items-center gap-1 shadow-2xs"
                              >
                                <span className="font-bold text-primary">{c.name.split(" ")[0]}:</span> Ag {c.agency} • Cc {c.account}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="rounded-xl border border-dashed border-border/80 bg-canvas p-4 text-center space-y-1.5 animate-in fade-in duration-200">
                        <div className="text-xs font-bold text-muted-foreground flex items-center justify-center gap-1.5">
                          <Search size={16} className="text-primary animate-pulse" />
                          <span>Aguardando digitação correta (Agência: 4 dígitos | Conta: 5+ dígitos)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground/80 max-w-sm mx-auto">
                          Digite a agência de 4 dígitos e a conta correspondentes ao favorecido para que o nome e CPF sejam consultados.
                        </p>
                      </div>
                    );
                  })()}

                  {/* CAMPO EDITÁVEL: VALOR DA TRANSFERÊNCIA */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                      Valor da Transferência (R$)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 font-bold text-muted-foreground">R$</span>
                      <input
                        type="text"
                        value={tedAmount}
                        onChange={(e) => setTedAmount(e.target.value)}
                        className="w-full rounded-md border border-border bg-canvas pl-12 pr-4 py-2.5 text-lg font-bold outline-hidden focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    tedMode === "manual"
                      ? !mockTedContacts.find(
                          (c) =>
                            c.agency.replace(/\D/g, "") === tedAgency.trim().replace(/\D/g, "") &&
                            c.account.replace(/\D/g, "") === tedAccount.trim().replace(/\D/g, "")
                        )
                      : false
                  }
                  onClick={() => {
                    if (tedMode === "manual") {
                      const cleanAg = tedAgency.trim().replace(/\D/g, "");
                      const cleanAcc = tedAccount.trim().replace(/\D/g, "");
                      const matched = mockTedContacts.find(
                        (c) => c.agency.replace(/\D/g, "") === cleanAg && c.account.replace(/\D/g, "") === cleanAcc
                      );
                      if (matched) {
                        setTedName(matched.name);
                        setTedCpf(matched.cpf);
                        setTedBank(matched.bank);
                      }
                    }
                    setTedStep("confirm");
                  }}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar para Confirmação <ArrowRight size={18} />
                </button>
              </div>
            )}

            {/* PASSO 2: TELA DE CONFIRMAÇÃO COM DADOS TRAVADOS (READ-ONLY) */}
            {tedStep === "confirm" && (
              <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                <div className="rounded-xl border border-border bg-canvas p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Lock size={14} className="text-primary" /> Dados do Destinatário (Travados)
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      ✓ Dados Validados
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Favorecido:</span>
                      <span className="font-bold text-foreground">{tedName}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">CPF / CNPJ:</span>
                      <span className="font-mono font-medium text-foreground">{tedCpf}</span>
                    </div>

                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Banco:</span>
                      <span className="font-medium text-foreground">{tedBank}</span>
                    </div>

                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">Agência / Conta:</span>
                      <span className="font-mono font-medium text-foreground">Ag {tedAgency} • Cc {tedAccount}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground">Valor a Transferir:</span>
                    <span className="text-2xl font-black text-primary">R$ {tedAmount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-primary/10 pt-2">
                    <span>Tarifa de transferência:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Gratuito (R$ 0,00)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Prazo de liquidação:</span>
                    <span>Até o fim do dia útil</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setTedStep("success")}
                    className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card"
                  >
                    <CheckCircle2 size={20} /> Confirmar e Enviar TED de R$ {tedAmount}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTedStep("form")}
                    className="w-full h-10 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
                  >
                    Voltar e alterar dados
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 3: COMPROVANTE DE SUCESSO DO TED */}
            {tedStep === "success" && (
              <div className="p-6 space-y-5 text-center max-h-[80vh] overflow-y-auto">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto">
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-foreground">Transferência realizada!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    TED de <strong>R$ {tedAmount}</strong> enviada com sucesso para <strong>{tedName}</strong>.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-canvas p-4 text-left space-y-2.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Autenticação bancária:</span>
                    <span className="font-mono text-foreground font-bold">TED-20260926-984321</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Data / Hora:</span>
                    <span className="text-foreground">26/09/2026 às 20:41</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Banco de Origem:</span>
                    <span className="text-foreground">Banco Lume S.A. (341)</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Favorecido:</span>
                    <span className="text-foreground font-semibold">{tedName}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Banco Favorecido:</span>
                    <span className="text-foreground">{tedBank}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowTedModal(false)}
                  className="w-full h-12 rounded-lg bg-primary text-base font-bold text-primary-foreground hover:bg-primary-strong transition shadow-card"
                >
                  Concluir e Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AMBIENTE DE DEPÓSITO OU BOLETO */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                {depositStep !== "options" && dashVersion === "v1" && (
                  <button
                    type="button"
                    onClick={() => setDepositStep("options")}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg font-bold">
                    {dashVersion === "v1" ? "Depositar na Conta Lume" : "Boletos Bancários (Conta Lume)"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {dashVersion === "v1" && depositStep === "options" && "Escolha como deseja colocar dinheiro na sua conta"}
                    {dashVersion === "v1" && depositStep === "pix_me" && "Ver chaves Pix (E-mail, Aleatória) e QR Code da conta"}
                    {depositStep === "boleto_form" && "Informe o valor para gerar o boleto sem taxas"}
                    {depositStep === "boleto_generated" && "Boleto bancário gerado com sucesso"}
                    {depositStep === "portabilidade" && "Traga seu salário para o Banco Lume"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X size={20} />
              </button>
            </div>

            {copiedNotification && (
              <div className="bg-accent text-accent-foreground px-4 py-2 text-center text-xs font-bold animate-in fade-in">
                {copiedNotification === "PDF_DOWNLOADED"
                  ? "✓ Download do Boleto em PDF iniciado!"
                  : `✓ ${copiedNotification} copiado com sucesso!`}
              </div>
            )}

            {depositStep === "options" && dashVersion === "v1" && (
              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setDepositStep("pix_me")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas p-4 text-left hover:bg-muted hover:border-primary/40 transition shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-accent-foreground">
                      <QrCode size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">Depositar via Pix (Minhas Chaves & QR Code)</p>
                      <p className="text-xs text-muted-foreground">Ver chaves Pix (E-mail, Aleatória) e QR Code próprio</p>
                    </div>
                  </div>
                  <ChevronRight size={19} className="text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setDepositStep("boleto_form")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas p-4 text-left hover:bg-muted hover:border-primary/40 transition shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                      <Barcode size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">Depositar via Boleto</p>
                      <p className="text-xs text-muted-foreground">Gere um boleto grátis e pague onde quiser (1 a 3 dias úteis)</p>
                    </div>
                  </div>
                  <ChevronRight size={19} className="text-muted-foreground" />
                </button>

                <button
                  type="button"
                  onClick={() => setDepositStep("portabilidade")}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-canvas p-4 text-left hover:bg-muted hover:border-primary/40 transition shadow-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary/20 text-secondary-foreground">
                      <Building2 size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">Trazer meu Salário</p>
                      <p className="text-xs text-muted-foreground">Solicite a portabilidade de salário sem sair de casa</p>
                    </div>
                  </div>
                  <ChevronRight size={19} className="text-muted-foreground" />
                </button>
              </div>
            )}

            {depositStep === "pix_me" && dashVersion === "v1" && (
              <div className="p-6 space-y-5 text-center max-h-[80vh] overflow-y-auto">
                <div className="rounded-xl border border-border bg-canvas p-5 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Seu QR Code Pix (Conta Lume)
                  </p>
                  
                  <div className="mx-auto grid h-44 w-44 place-items-center rounded-xl border-4 border-primary bg-white p-2 shadow-md">
                    <QrCode size={140} className="text-primary" />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Mostre este QR Code para quem vai te pagar presencialmente.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Suas Chaves Pix para Compartilhar
                  </p>

                  <div className="rounded-lg bg-canvas border border-border p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">Chave E-mail</span>
                      <span className="font-mono text-xs font-bold text-foreground">raphael.lume@pix.com.br</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode("raphael.lume@pix.com.br", "Chave E-mail")}
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition"
                    >
                      <Copy size={13} /> Copiar
                    </button>
                  </div>

                  <div className="rounded-lg bg-canvas border border-border p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">Chave Aleatória (EVP)</span>
                      <span className="font-mono text-xs font-bold text-foreground truncate block max-w-[200px] sm:max-w-[280px]">
                        d83a9f12-4c2b-4e89-b701-9a2e3f456789
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode("d83a9f12-4c2b-4e89-b701-9a2e3f456789", "Chave Aleatória")}
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition"
                    >
                      <Copy size={13} /> Copiar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {depositStep === "boleto_form" && (
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Qual o valor do boleto? (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 font-bold text-muted-foreground">R$</span>
                    <input
                      type="text"
                      autoFocus
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full rounded-md border border-border bg-canvas pl-12 pr-4 py-3 text-xl font-bold outline-hidden focus:border-primary"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Valor mínimo: R$ 20,00 • Sem qualquer taxa de emissão.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDepositStep("boleto_generated")}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card"
                >
                  Gerar Boleto de R$ {depositAmount} <ArrowRight size={18} />
                </button>
              </div>
            )}

            {depositStep === "boleto_generated" && (
              <div className="p-6 space-y-5 text-center">
                <div className="rounded-xl border border-border bg-canvas p-5 space-y-4">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent/20 text-accent-foreground">
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Boleto de R$ {depositAmount} Gerado</h3>
                    <p className="text-xs text-muted-foreground">Vencimento em 3 dias úteis • Banco Lume</p>
                  </div>

                  <div className="rounded-lg bg-surface border border-border p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <Barcode size={15} /> Código do Boleto
                      </span>
                      <span className="text-[10px] text-accent-foreground font-bold bg-accent/20 px-2 py-0.5 rounded">
                        Copia e Cola
                      </span>
                    </div>

                    <p className="font-mono text-xs font-bold text-foreground break-all bg-canvas p-2.5 rounded border border-border select-all">
                      34191.09008 61234.567890 12345.678901 8 98760000010000
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyCode("34191090086123456789012345678901898760000010000", "Código do Boleto")}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-strong transition shadow-xs"
                      >
                        <Copy size={14} /> Copiar Código
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-canvas px-3 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-xs"
                      >
                        <Download size={14} /> Baixar PDF
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="w-full flex h-11 items-center justify-center rounded-lg border border-border bg-canvas text-sm font-bold text-foreground hover:bg-muted transition"
                >
                  Concluir
                </button>
              </div>
            )}

            {depositStep === "portabilidade" && (
              <div className="p-6 space-y-5">
                <div className="rounded-xl border border-border bg-canvas p-5 space-y-3">
                  <h3 className="text-base font-bold text-foreground">Portabilidade de Salário</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Traga o recebimento do seu salário mensal para o Banco Lume sem pagar taxas adicionais.
                  </p>
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-muted-foreground">
                      CNPJ do seu Empregador:
                    </label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm outline-hidden focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    alert("Solicitação de portabilidade enviada!");
                    setShowDepositModal(false);
                  }}
                  className="w-full flex h-12 items-center justify-center gap-2 rounded-lg bg-primary text-base font-bold text-primary-foreground transition hover:bg-primary-strong shadow-card"
                >
                  Solicitar Portabilidade <CheckCircle2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE DE NAVEGAÇÃO MOBILE */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden" aria-label="Navegação principal">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
          {navItems.slice(0, 2).map((item) => (
            <NavButton key={item.label} {...item} active={activeNav === item.label} onClick={() => setActiveNav(item.label)} />
          ))}
          <button
            type="button"
            onClick={openPixModal}
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