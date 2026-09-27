"use client";

import { HandCoins, QrCode, Receipt } from "lucide-react";
import { Clicavel } from "../Clicavel";
import { formatarReais, useBanco } from "../contexto";
import { Cartao } from "../partes";

const ATALHOS = [
  { id: "home.atalho.pix", rotulo: "Pix", Icone: QrCode },
  { id: "home.atalho.pagamentos", rotulo: "Pagamentos", Icone: Receipt },
  { id: "home.atalho.emprestimo", rotulo: "Empréstimo", Icone: HandCoins },
];

export function TelaHome() {
  const { estado } = useBanco();
  return (
    <div className="min-h-full">
      <header className="bg-azul px-5 pb-16 pt-5 text-white">
        <p className="text-sm font-semibold tracking-wide text-marca-clara">banco lume · fictício</p>
        <h1 className="mt-3 text-2xl font-bold">Olá!</h1>
        <p data-leitura className="mt-1 text-sm text-azul-claro">
          O que você quer fazer hoje?
        </p>
      </header>

      <div className="-mt-12 space-y-4 px-4 pb-6">
        <Cartao>
          <p data-leitura className="text-sm text-texto-suave">
            Saldo em conta
          </p>
          <p data-leitura className="mt-1 text-3xl font-bold text-azul">
            {formatarReais(estado.saldo)}
          </p>
        </Cartao>

        <Cartao>
          <h2 className="mb-3 text-sm font-bold text-azul">Atalhos</h2>
          <div className="grid grid-cols-3 gap-2">
            {ATALHOS.map(({ id, rotulo, Icone }) => (
              <Clicavel
                key={id}
                actionId={id}
                className="flex flex-col items-center gap-2 rounded-xl bg-fundo px-2 py-4 text-sm font-semibold text-azul transition hover:bg-marca-clara"
              >
                <Icone aria-hidden size={26} className="text-marca-escura" />
                {rotulo}
              </Clicavel>
            ))}
          </div>
        </Cartao>

        <Cartao className="border-marca/40 bg-marca-clara">
          <p data-leitura className="text-sm font-bold text-azul">
            Crédito pessoal
          </p>
          <p data-leitura className="mt-1 text-sm text-texto">
            Simule um empréstimo em 3 passos. Valores fictícios deste protótipo.
          </p>
        </Cartao>
      </div>
    </div>
  );
}
