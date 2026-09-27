import type {
  A11yActionNode,
  A11yTextNode,
  AccessibilityTree,
  ActionRole,
  Bounds,
  Prominence,
  TextRole,
} from "@/types/a11y";

export const SCROLL_DOWN = "scroll-down";
export const SCROLL_UP = "scroll-up";

const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

function relativeBounds(el: Element, origin: DOMRect): Bounds {
  const r = el.getBoundingClientRect();
  return {
    x: Math.round(r.left - origin.left),
    y: Math.round(r.top - origin.top),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
}

/** Um elemento está "visível" se seu centro estiver dentro do seu container de rolagem (ou do app). */
function isInViewport(el: Element, appRect: DOMRect): boolean {
  const r = el.getBoundingClientRect();
  const container = el.closest("[data-scroll-container]");
  const view = container ? container.getBoundingClientRect() : appRect;
  const cy = r.top + r.height / 2;
  const cx = r.left + r.width / 2;
  return cy >= view.top && cy <= view.bottom && cx >= view.left && cx <= view.right;
}

/**
 * Exporta o estado atual da UI como Árvore de Acessibilidade simplificada.
 * `root` deve ser o elemento marcado com [data-bank-root].
 */
export function extractAccessibilityTree(root: HTMLElement): AccessibilityTree {
  const appRect = root.getBoundingClientRect();
  const screen = root.querySelector<HTMLElement>("[data-screen-id]");
  const scroller = screen?.querySelector<HTMLElement>("[data-scroll-container]") ?? null;

  const texts: A11yTextNode[] = [];
  root.querySelectorAll<HTMLElement>("[data-a11y-role='heading'],[data-a11y-role='text'],[data-a11y-role='alert']").forEach(
    (el) => {
      const text = clean(el.innerText || el.textContent);
      if (!text) return;
      texts.push({ role: el.dataset.a11yRole as TextRole, text, inViewport: isInViewport(el, appRect) });
    },
  );

  const actions: A11yActionNode[] = [];
  root.querySelectorAll<HTMLElement>("[data-action-id]").forEach((el) => {
    const role = (el.dataset.a11yRole ?? "button") as ActionRole;
    const node: A11yActionNode = {
      id: el.dataset.actionId!,
      role,
      label: clean(el.getAttribute("aria-label") || el.innerText || el.textContent),
      bounds: relativeBounds(el, appRect),
      inViewport: isInViewport(el, appRect),
      prominence: (el.dataset.prominence ?? "normal") as Prominence,
      disabled: el.hasAttribute("disabled"),
    };
    if (el instanceof HTMLInputElement) {
      node.value = el.value;
      node.placeholder = el.placeholder || undefined;
      node.inputMode = (el.inputMode as A11yActionNode["inputMode"]) || "text";
    }
    const checked = el.getAttribute("aria-checked");
    if (checked !== null) node.checked = checked === "true";
    actions.push(node);
  });

  const scrollTop = scroller?.scrollTop ?? 0;
  const scrollHeight = scroller?.scrollHeight ?? 0;
  const clientHeight = scroller?.clientHeight ?? 0;
  const canScrollDown = scrollTop + clientHeight < scrollHeight - 4;

  const synthetic = (id: string, label: string): A11yActionNode => ({
    id,
    role: "scroll",
    label,
    bounds: { x: 0, y: 0, width: Math.round(appRect.width), height: Math.round(appRect.height) },
    inViewport: true,
    prominence: "normal",
    disabled: false,
  });
  if (canScrollDown) actions.push(synthetic(SCROLL_DOWN, "Rolar a tela para baixo"));
  if (scrollTop > 4) actions.push(synthetic(SCROLL_UP, "Rolar a tela para cima"));

  return {
    screenId: screen?.dataset.screenId ?? "unknown",
    screenTitle: screen?.dataset.screenTitle ?? "",
    viewport: {
      width: Math.round(appRect.width),
      height: Math.round(appRect.height),
      scrollTop: Math.round(scrollTop),
      scrollHeight: Math.round(scrollHeight),
    },
    canScrollDown,
    texts,
    actions,
    capturedAt: Date.now(),
  };
}

/** Aplica uma rolagem sintética no container da tela atual. */
export function applyScroll(root: HTMLElement, direction: "down" | "up"): void {
  const scroller = root.querySelector<HTMLElement>("[data-scroll-container]");
  if (!scroller) return;
  const delta = scroller.clientHeight * 0.7 * (direction === "down" ? 1 : -1);
  scroller.scrollBy({ top: delta, behavior: "instant" as ScrollBehavior });
}
