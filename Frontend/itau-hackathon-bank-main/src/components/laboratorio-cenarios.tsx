import type { ReactNode } from "react";

import {
  IDS_DOS_PRESETS,
  NOMES_DOS_PRESETS,
  PRESETS,
  buscaDaCombinacao,
  descreverDashboard,
  presetDe,
  type BuscaLaboratorio,
  type Combinacao,
} from "@/lib/cenarios";

// Os nomes dos botões desta barra evitam "Pix", "Fluxo 1" e "Versão A", que o script de
// captura das telas da vila (vila-de-personas/telas/capturar_telas.py) procura na página.

type Props = {
  combinacao: Combinacao;
  /** Abre outra combinação do começo (troca o endereço da página). */
  irPara: (busca: BuscaLaboratorio) => void;
};

function Opcao({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativa}
      onClick={onClick}
      className={`rounded px-2 py-1 font-bold transition ${ativa ? "bg-accent text-accent-foreground shadow-xs" : "text-gray-300 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function Fator({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="w-28 shrink-0 text-gray-400">{titulo}</span>
      <div className="flex flex-wrap gap-1 rounded-md bg-white/10 p-1">{children}</div>
    </div>
  );
}

export function LaboratorioCenarios({ combinacao, irPara }: Props) {
  const preset = presetDe(combinacao);

  const mudar = (mudanca: Partial<Combinacao>) =>
    irPara(buscaDaCombinacao({ ...combinacao, ...mudanca }, null));

  return (
    <div className="space-y-2 bg-black/90 px-5 py-3 text-xs text-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-bold uppercase tracking-wider text-highlight">
          Laboratório de cenários
        </span>
        <div className="flex items-center gap-1 rounded-md bg-white/10 p-1">
          {IDS_DOS_PRESETS.map((id) => (
            <Opcao key={id} ativa={preset === id} onClick={() => mudar(PRESETS[id])}>
              {NOMES_DOS_PRESETS[id]}
            </Opcao>
          ))}
        </div>
      </div>

      <p className="text-gray-300">{descreverDashboard(combinacao)}</p>

      <details open>
        <summary className="cursor-pointer select-none font-bold text-gray-200">
          Montar combinação
        </summary>
        <div className="mt-2 space-y-1.5">
          <Fator titulo="Transferências">
            <Opcao
              ativa={combinacao.transferencias === "separadas"}
              onClick={() => mudar({ transferencias: "separadas" })}
            >
              Pix e TED separados
            </Opcao>
            <Opcao
              ativa={combinacao.transferencias === "unificadas"}
              onClick={() => mudar({ transferencias: "unificadas" })}
            >
              Em Transferir
            </Opcao>
          </Fator>
          <Fator titulo="Boleto">
            <Opcao
              ativa={combinacao.boleto === "deposito"}
              onClick={() => mudar({ boleto: "deposito" })}
            >
              No Depositar
            </Opcao>
            <Opcao
              ativa={combinacao.boleto === "atalho"}
              onClick={() => mudar({ boleto: "atalho" })}
            >
              Atalho próprio
            </Opcao>
          </Fator>
          <Fator titulo="Minhas chaves">
            <Opcao
              ativa={combinacao.chaves === "deposito"}
              onClick={() => mudar({ chaves: "deposito" })}
            >
              No Depositar
            </Opcao>
            <Opcao ativa={combinacao.chaves === "pix"} onClick={() => mudar({ chaves: "pix" })}>
              Dentro do Pix
            </Opcao>
          </Fator>
          <Fator titulo="Pagar">
            <Opcao
              ativa={combinacao.pagar === "separadas"}
              onClick={() => mudar({ pagar: "separadas" })}
            >
              Boleto e fatura separados
            </Opcao>
            <Opcao
              ativa={combinacao.pagar === "unificadas"}
              onClick={() => mudar({ pagar: "unificadas" })}
            >
              Em Pagar
            </Opcao>
          </Fator>
          <Fator titulo="Tela inicial do Pix">
            <Opcao ativa={combinacao.fluxo === "fluxo1"} onClick={() => mudar({ fluxo: "fluxo1" })}>
              F1 · Contatos
            </Opcao>
            <Opcao ativa={combinacao.fluxo === "fluxo2"} onClick={() => mudar({ fluxo: "fluxo2" })}>
              F2 · Copia e Cola
            </Opcao>
          </Fator>
          <Fator titulo="Repetir todo mês">
            <Opcao
              ativa={combinacao.recorrencia === "A"}
              onClick={() => mudar({ recorrencia: "A" })}
            >
              A · no ⋯
            </Opcao>
            <Opcao
              ativa={combinacao.recorrencia === "B"}
              onClick={() => mudar({ recorrencia: "B" })}
            >
              B · só ícone
            </Opcao>
            <Opcao
              ativa={combinacao.recorrencia === "C"}
              onClick={() => mudar({ recorrencia: "C" })}
            >
              C · com texto
            </Opcao>
          </Fator>
        </div>
      </details>
    </div>
  );
}
