"use client";

import { forwardRef, type ReactNode } from "react";
import type { EstadoBanco, TelaId } from "@/lib/tipos";
import { ContextoBanco } from "./contexto";
import { TelaHome } from "./telas/TelaHome";
import { TelaPagamentos } from "./telas/TelaPagamentos";
import {
  TelaEmprestimoCondicoes,
  TelaEmprestimoConfirmacao,
  TelaEmprestimoSucesso,
  TelaEmprestimoValor,
} from "./telas/TelasEmprestimo";
import { TelaPixConfirmar, TelaPixContatos, TelaPixSucesso, TelaPixValor } from "./telas/TelasPix";

const TELAS: Record<TelaId, () => ReactNode> = {
  home: TelaHome,
  pagamentos: TelaPagamentos,
  emprestimo_1: TelaEmprestimoValor,
  emprestimo_2: TelaEmprestimoCondicoes,
  emprestimo_3: TelaEmprestimoConfirmacao,
  emprestimo_sucesso: TelaEmprestimoSucesso,
  pix_contatos: TelaPixContatos,
  pix_valor: TelaPixValor,
  pix_confirmar: TelaPixConfirmar,
  pix_sucesso: TelaPixSucesso,
};

interface Props {
  estado: EstadoBanco;
  agir: (actionId: string) => void;
  destaque?: string | null;
  interativo?: boolean;
  /** Moldura de celular (desktop). Sem moldura, ocupa a tela toda (celular de verdade). */
  moldura?: boolean;
}

/**
 * O ambiente: um app de banco fictício, controlado de fora pelo estado do MDP.
 * A ref aponta para a área rolável da tela, de onde sai a árvore de acessibilidade.
 */
export const BancoApp = forwardRef<HTMLDivElement, Props>(function BancoApp(
  { estado, agir, destaque = null, interativo = true, moldura = true },
  ref,
) {
  const Tela = TELAS[estado.tela];
  const tela = (
    <div ref={ref} className="h-full overflow-y-auto bg-fundo" data-raiz-banco>
      <div data-tela={estado.tela} className="min-h-full">
        <Tela />
      </div>
    </div>
  );
  return (
    <ContextoBanco.Provider value={{ estado, agir, destaque, interativo }}>
      {moldura ? (
        <div className="relative h-[844px] w-[390px] shrink-0 overflow-hidden rounded-[2.75rem] border-[10px] border-azul bg-azul shadow-2xl">
          <div className="flex h-7 items-center justify-between bg-azul px-6 text-[11px] font-semibold text-white" aria-hidden>
            <span>9:41</span>
            <span>protótipo</span>
          </div>
          <div className="h-[calc(100%-1.75rem)] overflow-hidden rounded-b-[2rem]">{tela}</div>
        </div>
      ) : (
        <div className="h-dvh w-full">{tela}</div>
      )}
    </ContextoBanco.Provider>
  );
});
