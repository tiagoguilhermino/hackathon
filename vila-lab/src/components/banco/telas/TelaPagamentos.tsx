"use client";

import { Cabecalho, Cartao } from "../partes";

/** Caminho que não leva ao objetivo de nenhum fluxo: serve para ver se o agente se perde. */
export function TelaPagamentos() {
  return (
    <div>
      <Cabecalho voltar="pagamentos.voltar" titulo="Pagamentos" subtitulo="Boletos e contas de consumo" />
      <div className="p-4">
        <Cartao>
          <p data-leitura className="text-sm text-texto">
            Pagamento de boletos ainda não está disponível neste protótipo.
          </p>
        </Cartao>
      </div>
    </div>
  );
}
