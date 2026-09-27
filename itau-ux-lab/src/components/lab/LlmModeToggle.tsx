import { Bot, Dices } from "lucide-react";

type LlmMode = "mock" | "live";

interface LlmModeToggleProps {
  mode: LlmMode;
  onChange: (mode: LlmMode) => void;
  hasKey: boolean;
  model: string | null;
  disabled?: boolean;
}

/** Alterna os agentes entre LLM real (Groq) e a política simulada por regras. */
export function LlmModeToggle({ mode, onChange, hasKey, model, disabled }: LlmModeToggleProps) {
  const option = (value: LlmMode, label: string, icon: React.ReactNode, title: string, unavailable = false) => {
    const active = mode === value;
    return (
      <button
        type="button"
        role="radio"
        aria-checked={active}
        title={title}
        disabled={disabled || unavailable}
        onClick={() => onChange(value)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
          active
            ? value === "live"
              ? "bg-green-600 text-white"
              : "bg-amber-400 text-itau-navy"
            : "text-white/70 hover:text-white disabled:opacity-40 disabled:hover:text-white/70"
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div role="radiogroup" aria-label="Modo dos agentes" className="flex items-center gap-0.5 rounded-full bg-white/10 p-0.5">
      {option("mock", "Simulado", <Dices size={14} />, "Política por regras, sem chamadas à API (custo zero)")}
      {option(
        "live",
        mode === "live" && model ? `LLM real · ${model}` : "LLM real",
        <Bot size={14} />,
        hasKey ? "Agentes chamam o LLM da Groq" : "Sem chave da Groq: preencha GROQ_API_KEY no .env.local",
        !hasKey,
      )}
    </div>
  );
}
