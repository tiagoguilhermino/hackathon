"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import type { Prominence, TextRole } from "@/types/a11y";
import { useBank } from "./BankContext";

/**
 * Primitivas "acessíveis como dado": todo elemento interativo expõe
 * data-action-id, data-a11y-role e data-prominence, que o extrator da
 * árvore de acessibilidade lê diretamente do DOM (posição via getBoundingClientRect).
 */

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-itau-orange text-white font-semibold shadow-sm active:bg-itau-orange-dark",
  secondary: "border border-itau-navy text-itau-navy font-semibold bg-white",
  ghost: "text-itau-orange font-semibold",
  // Baixo contraste intencional (defeito de UX para o simulador encontrar)
  subtle: "bg-neutral-100 text-neutral-400 text-sm",
};

interface ActionButtonProps {
  actionId: string;
  children: ReactNode;
  variant?: ButtonVariant;
  prominence?: Prominence;
  role?: "button" | "link" | "tab";
  ariaLabel?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
}

export function ActionButton({
  actionId,
  children,
  variant = "primary",
  prominence,
  role = "button",
  ariaLabel,
  className,
  value,
  disabled,
}: ActionButtonProps) {
  const { dispatch } = useBank();
  return (
    <button
      type="button"
      data-action-id={actionId}
      data-a11y-role={role}
      data-prominence={prominence ?? (variant === "primary" ? "high" : variant === "subtle" ? "low" : "normal")}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => dispatch({ actionId, value })}
      className={cx(
        "rounded-xl px-4 py-3 transition-colors disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

interface ActionInputProps {
  actionId: string;
  label: string;
  value: string;
  placeholder?: string;
  inputMode?: "numeric" | "text" | "decimal";
  prefix?: string;
}

export function ActionInput({ actionId, label, value, placeholder, inputMode = "text", prefix }: ActionInputProps) {
  const { dispatch } = useBank();
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-neutral-600" data-a11y-role="text">
        {label}
      </span>
      <span className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-3 focus-within:border-itau-orange">
        {prefix && <span className="text-neutral-500">{prefix}</span>}
        <input
          data-action-id={actionId}
          data-a11y-role="input"
          data-prominence="normal"
          aria-label={label}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(e) => dispatch({ actionId, value: e.target.value })}
          className="w-full bg-transparent text-lg text-itau-navy outline-none placeholder:text-neutral-400"
        />
      </span>
    </label>
  );
}

interface ActionToggleProps {
  actionId: string;
  checked: boolean;
  children: ReactNode;
  ariaLabel?: string;
  kind?: "checkbox" | "radio";
  prominence?: Prominence;
  className?: string;
}

export function ActionCheckbox({ actionId, checked, children, ariaLabel, prominence = "normal", className }: ActionToggleProps) {
  const { dispatch } = useBank();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-action-id={actionId}
      data-a11y-role="checkbox"
      data-prominence={prominence}
      onClick={() => dispatch({ actionId })}
      className={cx("flex w-full items-start gap-3 text-left", className)}
    >
      <span
        className={cx(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
          checked ? "border-itau-orange bg-itau-orange text-white" : "border-neutral-400 bg-white",
        )}
      >
        {checked && <Check size={14} strokeWidth={3} />}
      </span>
      <span className="text-sm text-neutral-700">{children}</span>
    </button>
  );
}

export function ActionChip({ actionId, checked, children, ariaLabel }: ActionToggleProps) {
  const { dispatch } = useBank();
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-action-id={actionId}
      data-a11y-role="radio"
      data-prominence="normal"
      onClick={() => dispatch({ actionId })}
      className={cx(
        "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
        checked ? "border-itau-orange bg-itau-orange/10 text-itau-orange" : "border-neutral-300 bg-white text-neutral-700",
      )}
    >
      {children}
    </button>
  );
}

interface TextProps {
  role?: TextRole;
  children: ReactNode;
  className?: string;
  as?: "p" | "h1" | "h2" | "h3" | "span" | "div";
}

/** Texto legível pelo agente (entra na árvore de acessibilidade). */
export function A11yText({ role = "text", children, className, as }: TextProps) {
  const Tag = as ?? (role === "heading" ? "h2" : "p");
  return (
    <Tag data-a11y-role={role} role={role === "alert" ? "alert" : undefined} className={className}>
      {children}
    </Tag>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl bg-white p-4 shadow-sm", className)}>{children}</div>;
}

export function ErrorAlert() {
  const { state } = useBank();
  if (!state.error) return null;
  return (
    <A11yText role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {state.error}
    </A11yText>
  );
}
