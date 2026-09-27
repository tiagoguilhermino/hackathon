"use client";

import { FileJson, FlaskConical } from "lucide-react";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { BancoApp } from "@/components/banco/BancoApp";
import { AvisoPrototipo } from "@/components/comum/AvisoPrototipo";
import { exportarArvore } from "@/lib/acessibilidade";
import { aplicarAcao, estadoInicial } from "@/lib/banco/estado";
import type { EstadoBanco, VersaoEmprestimo, VersaoPix } from "@/lib/tipos";
import { baixarJson } from "@/lib/uteis";

type Evento = { tipo: "acao"; actionId: string } | { tipo: "versoes"; pix: VersaoPix; emprestimo: VersaoEmprestimo };

function reduzir(estado: EstadoBanco, evento: Evento): EstadoBanco {
  if (evento.tipo === "acao") return aplicarAcao(estado, evento.actionId);
  return { ...estadoInicial("pix_recorrente", evento.pix), versoes: { pix: evento.pix, emprestimo: evento.emprestimo } };
}

/** O ambiente usado por uma pessoa: o app do banco fictício, sem agente nenhum. */
export default function Inicio() {
  const [estado, despachar] = useReducer(reduzir, estadoInicial("pix_recorrente", "C"));
  const raiz = useRef<HTMLDivElement>(null);
  const [celularDeVerdade, setCelularDeVerdade] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia("(max-width: 460px)");
    const atualizar = () => setCelularDeVerdade(consulta.matches);
    atualizar();
    consulta.addEventListener("change", atualizar);
    // Para depuração: window.__exportarArvore() devolve a árvore da tela atual.
    (window as unknown as { __exportarArvore: () => unknown }).__exportarArvore = () =>
      raiz.current ? exportarArvore(raiz.current) : null;
    return () => consulta.removeEventListener("change", atualizar);
  }, []);

  const trocarVersoes = (pix: VersaoPix, emprestimo: VersaoEmprestimo) => despachar({ tipo: "versoes", pix, emprestimo });

  const app = (
    <BancoApp
      ref={raiz}
      estado={estado}
      agir={(actionId) => despachar({ tipo: "acao", actionId })}
      moldura={!celularDeVerdade}
    />
  );

  return (
    <main className="flex min-h-dvh flex-col">
      <AvisoPrototipo compacto={celularDeVerdade} />
      {celularDeVerdade ? (
        app
      ) : (
        <div className="flex flex-1 flex-col items-center gap-4 px-4 py-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-texto-suave">
            <label className="flex items-center gap-2">
              Versão da tela do Pix
              <select
                className="rounded-md border border-borda bg-cartao px-2 py-1 text-texto"
                value={estado.versoes.pix}
                onChange={(e) => trocarVersoes(e.target.value as VersaoPix, estado.versoes.emprestimo)}
              >
                <option value="A">A · Repetir em Mais opções</option>
                <option value="B">B · só ícone</option>
                <option value="C">C · ícone e texto</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Empréstimo
              <select
                className="rounded-md border border-borda bg-cartao px-2 py-1 text-texto"
                value={estado.versoes.emprestimo}
                onChange={(e) => trocarVersoes(estado.versoes.pix, e.target.value as VersaoEmprestimo)}
              >
                <option value="original">original (com jargão)</option>
                <option value="simplificada">simplificada</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => raiz.current && baixarJson(`arvore-${estado.tela}.json`, exportarArvore(raiz.current))}
              className="inline-flex items-center gap-1.5 rounded-md border border-borda bg-cartao px-3 py-1 text-texto hover:border-azul"
            >
              <FileJson aria-hidden size={16} /> Exportar árvore (JSON)
            </button>
          </div>
          {app}
        </div>
      )}

      {/* Botão flutuante discreto para o modo laboratório. */}
      <Link
        href="/lab"
        aria-label="Abrir o laboratório de simulação"
        title="Laboratório"
        className="fixed bottom-4 right-4 grid size-11 place-items-center rounded-full bg-azul text-marca opacity-30 shadow-lg transition hover:opacity-100 focus-visible:opacity-100"
      >
        <FlaskConical aria-hidden size={20} />
      </Link>
    </main>
  );
}
