/**
 * Variações de layout do app (as peças do "Laboratório de cenários" do Iury, em
 * Frontend/itau-hackathon-bank-main/src/lib/cenarios.ts), no app laranja do laboratório.
 * Os agentes navegam em cada layout, e o Dashboard compara qual funciona melhor para cada perfil.
 */

/** Pix e TED com atalhos próprios, ou os dois dentro de "Transferir". */
export type Transfers = "separadas" | "unificadas";
/** Boleto de depósito dentro de "Depositar", ou com atalho próprio. */
export type BoletoPlace = "deposito" | "atalho";
/** "Minhas chaves" (receber por Pix) dentro de "Depositar", ou dentro do Pix. */
export type KeysPlace = "deposito" | "pix";
/** Um atalho "Pagar" com tudo, ou "Pagar boleto" e "Fatura" separados. */
export type PayMode = "unificadas" | "separadas";
/** O Pix abre com os contatos salvos (Fluxo 1) ou com Copia e Cola e chave digitada (Fluxo 2). */
export type PixStart = "contatos" | "copia_e_cola";

export interface AppLayout {
  transfers: Transfers;
  boleto: BoletoPlace;
  keys: KeysPlace;
  pay: PayMode;
  pixStart: PixStart;
}

export type PresetId = "v1" | "v2" | "v3";
export const PRESET_IDS: PresetId[] = ["v1", "v2", "v3"];

/** As Dash V1, V2 e V3 do Iury (com o Pix abrindo nos contatos). */
export const LAYOUT_PRESETS: Record<PresetId, AppLayout> = {
  v1: { transfers: "separadas", boleto: "deposito", keys: "deposito", pay: "unificadas", pixStart: "contatos" },
  v2: { transfers: "separadas", boleto: "atalho", keys: "pix", pay: "unificadas", pixStart: "contatos" },
  v3: { transfers: "unificadas", boleto: "deposito", keys: "pix", pay: "unificadas", pixStart: "contatos" },
};

export const PRESET_NAMES: Record<PresetId, string> = { v1: "Dash V1", v2: "Dash V2", v3: "Dash V3" };

export const DEFAULT_LAYOUT: AppLayout = LAYOUT_PRESETS.v1;

/** As peças e as opções de cada uma, com os nomes que aparecem no Laboratório. */
export const LAYOUT_PIECES = [
  { key: "transfers", label: "Transferências", options: [["separadas", "Pix e TED separados"], ["unificadas", "Dentro de Transferir"]] },
  { key: "boleto", label: "Boleto de depósito", options: [["deposito", "Dentro de Depositar"], ["atalho", "Atalho próprio"]] },
  { key: "keys", label: "Minhas chaves", options: [["deposito", "Dentro de Depositar"], ["pix", "Dentro do Pix"]] },
  { key: "pay", label: "Pagar", options: [["unificadas", "Um atalho Pagar"], ["separadas", "Pagar boleto e Fatura"]] },
  { key: "pixStart", label: "Início do Pix", options: [["contatos", "Contatos salvos"], ["copia_e_cola", "Copia e Cola e chave"]] },
] as const satisfies readonly { key: keyof AppLayout; label: string; options: readonly (readonly [string, string])[] }[];

export function sameLayout(a: AppLayout, b: AppLayout): boolean {
  return a.transfers === b.transfers && a.boleto === b.boleto && a.keys === b.keys && a.pay === b.pay && a.pixStart === b.pixStart;
}

/** Preset com as mesmas peças de tela inicial (o início do Pix pode variar). */
export function presetOf(layout: AppLayout): PresetId | null {
  return PRESET_IDS.find((id) => sameLayout({ ...LAYOUT_PRESETS[id], pixStart: layout.pixStart }, layout)) ?? null;
}

/** Nome curto: "Dash V3" (+ " · Pix por Copia e Cola"), ou as peças quando não é um preset. */
export function layoutName(layout: AppLayout | undefined): string {
  if (!layout) return "layout original";
  const preset = presetOf(layout);
  const pix = layout.pixStart === "copia_e_cola" ? " · Pix por Copia e Cola" : "";
  if (preset) return PRESET_NAMES[preset] + pix;
  return [
    layout.transfers === "separadas" ? "Pix e TED separados" : "Transferir",
    layout.boleto === "atalho" ? "boleto com atalho" : "boleto no Depositar",
    layout.keys === "pix" ? "chaves no Pix" : "chaves no Depositar",
    layout.pay === "separadas" ? "Pagar boleto e Fatura" : "um Pagar",
  ].join(" + ") + pix;
}

/** Chave estável do layout (para agrupar simulações e decisões). */
export function layoutKey(layout: AppLayout | undefined): string {
  return layout ? `${layout.transfers}.${layout.boleto}.${layout.keys}.${layout.pay}.${layout.pixStart}` : "original";
}

export function hasDepositMenu(layout: AppLayout): boolean {
  return layout.boleto === "deposito" || layout.keys === "deposito";
}

export interface Shortcut {
  actionId: string;
  label: string;
}

/** No celular a grade tem 4 atalhos por linha; do 5º em diante, eles vão para a 2ª linha. */
export const SHORTCUTS_PER_ROW = 4;

/** Atalhos da tela inicial, na ordem das Dash do Iury (a mesma regra de atalhosDaDashboard). */
export function homeShortcuts(layout: AppLayout): Shortcut[] {
  const pay: Shortcut[] =
    layout.pay === "separadas"
      ? [
          { actionId: "home-pay-bill", label: "Pagar boleto" },
          { actionId: "home-invoice", label: "Fatura" },
        ]
      : [{ actionId: "home-pay", label: "Pagar" }];
  const shortcuts: Shortcut[] =
    layout.transfers === "separadas"
      ? [{ actionId: "home-pix", label: "Pix" }, ...pay, { actionId: "home-ted", label: "TED/DOC" }]
      : [{ actionId: "home-transfer", label: "Transferir" }, ...pay];
  if (hasDepositMenu(layout)) shortcuts.push({ actionId: "home-deposit", label: "Depositar" });
  if (layout.boleto === "atalho") shortcuts.push({ actionId: "home-boleto", label: "Boleto" });
  shortcuts.push({ actionId: "home-loan", label: "Empréstimos" });
  return shortcuts;
}

/** Em que linha de atalhos do celular fica um atalho (1 ou 2), ou null se não existir. */
export function shortcutRow(actionId: string, layout: AppLayout): number | null {
  const i = homeShortcuts(layout).findIndex((s) => s.actionId === actionId);
  return i < 0 ? null : Math.floor(i / SHORTCUTS_PER_ROW) + 1;
}
