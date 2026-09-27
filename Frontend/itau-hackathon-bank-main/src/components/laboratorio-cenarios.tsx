import { useState, type ReactNode } from "react";

import {
  CENARIOS,
  IDS_DOS_PRESETS,
  NOMES_DOS_PRESETS,
  PRESETS,
  TAREFAS,
  TAREFAS_EM_ORDEM,
  avisosDaDashboard,
  buscaDaCombinacao,
  descreverDashboard,
  enderecoDaBusca,
  presetDe,
  rotuloDoCenario,
  type BuscaLaboratorio,
  type Cenario,
  type Combinacao,
} from "@/lib/cenarios";

// Os nomes dos botões desta barra evitam "Pix", "Fluxo 1" e "Versão A", que o script de
// captura das telas da vila (vila-de-personas/telas/capturar_telas.py) procura na página.

type Props = {
  combinacao: Combinacao;
  cenario: Cenario | null;
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

export function LaboratorioCenarios({ combinacao, cenario, irPara }: Props) {
  const [aviso, setAviso] = useState<string | null>(null);
  const preset = presetDe(combinacao);
  const avisos = avisosDaDashboard(combinacao);
  const endereco = enderecoDaBusca(buscaDaCombinacao(combinacao, cenario));

  const mudar = (mudanca: Partial<Combinacao>) =>
    irPara(buscaDaCombinacao({ ...combinacao, ...mudanca }, null));

  const copiar = async (limpo: boolean) => {
    const link =
      window.location.origin + enderecoDaBusca(buscaDaCombinacao(combinacao, cenario, limpo));
    try {
      await navigator.clipboard.writeText(link);
      setAviso(limpo ? "Link limpo copiado" : "Link copiado");
    } catch {
      setAviso(`Copie à mão: ${link}`);
    }
  };

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

      <label className="flex flex-wrap items-center gap-2">
        <span className="text-gray-400">Cenário</span>
        <select
          value={cenario?.id ?? ""}
          onChange={(evento) => {
            const escolhido = CENARIOS.find((c) => c.id === evento.target.value);
            irPara(escolhido ? { cenario: escolhido.id } : buscaDaCombinacao(combinacao, null));
          }}
          className="min-w-0 flex-1 rounded-md bg-white/10 px-2 py-1.5 font-semibold text-white outline-hidden"
        >
          <option value="" className="bg-surface text-foreground">
            Nenhum: combinação livre
          </option>
          {TAREFAS_EM_ORDEM.map((tarefa) => (
            <optgroup
              key={tarefa}
              label={`${tarefa} · ${TAREFAS[tarefa].nome}`}
              className="bg-surface text-foreground"
            >
              {CENARIOS.filter((c) => c.tarefa === tarefa).map((c) => (
                <option key={c.id} value={c.id} className="bg-surface text-foreground">
                  {rotuloDoCenario(c)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {cenario && (
        <div className="space-y-1 rounded-md bg-white/10 p-2">
          <p>
            <span className="font-bold text-highlight">Tarefa:</span>{" "}
            {TAREFAS[cenario.tarefa].frase}
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Caminho mais curto:</span> {cenario.caminho}
          </p>
          <p className="text-gray-400">
            {cenario.tipo === "incorreto" && (
              <span className="font-bold text-highlight">Caso incorreto: não há caminho. </span>
            )}
            {cenario.compara}
          </p>
        </div>
      )}

      {/* Com um cenário escolhido, as peças começam fechadas para a barra não empurrar o app */}
      <details open={!cenario}>
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

      {avisos.map((item) => (
        <p
          key={item.texto}
          className={item.tipo === "incoerente" ? "font-bold text-highlight" : "text-gray-400"}
        >
          {item.tipo === "incoerente" ? "⚠ Combinação incoerente: " : "Obs.: "}
          {item.texto}
        </p>
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <code className="min-w-0 max-w-full truncate rounded bg-white/10 px-2 py-1">
          {endereco}
        </code>
        <button
          type="button"
          onClick={() => void copiar(false)}
          className="rounded bg-white/10 px-2 py-1 font-bold hover:bg-white/20"
        >
          Copiar link
        </button>
        <button
          type="button"
          onClick={() => void copiar(true)}
          className="rounded bg-white/10 px-2 py-1 font-bold hover:bg-white/20"
        >
          Copiar link limpo
        </button>
        {aviso && <span className="text-highlight">{aviso}</span>}
      </div>
      <p className="text-gray-400">
        O link limpo abre sem as barras de teste: serve para mostrar a pessoas e para capturar as
        telas da vila.
      </p>
    </div>
  );
}
