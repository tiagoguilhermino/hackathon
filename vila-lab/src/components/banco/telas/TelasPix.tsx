"use client";

import { CircleCheck, Ellipsis, Repeat, User } from "lucide-react";
import { Clicavel } from "../Clicavel";
import { formatarReais, useBanco } from "../contexto";
import { BotaoPrincipal, Cabecalho, Cartao, Opcao } from "../partes";

const CONTATOS = [
  { id: "ana", nome: "Ana Paula Souza", detalhe: "Celular (11) 9•••• -4321 · Banco Lume" },
  { id: "marcos", nome: "Marcos Lima", detalhe: "E-mail m••••@exemplo.com · Banco Aurora" },
];
const VALORES = [50, 100, 250];

export function TelaPixContatos() {
  return (
    <div>
      <Cabecalho voltar="pix.voltar" titulo="Pix" subtitulo="Para quem você quer enviar?" />
      <div className="space-y-2 p-4">
        {CONTATOS.map((c) => (
          <Clicavel
            key={c.id}
            actionId={`pix.contato.${c.id}`}
            className="flex w-full items-center gap-3 rounded-2xl border border-borda bg-cartao p-4 text-left hover:border-azul"
          >
            <span aria-hidden className="grid size-10 place-items-center rounded-full bg-azul-claro text-azul">
              <User size={20} />
            </span>
            <span>
              <span className="block font-semibold text-azul">{c.nome}</span>
              <span className="block text-xs text-texto-suave">{c.detalhe}</span>
            </span>
          </Clicavel>
        ))}
        <p data-leitura className="pt-2 text-xs text-texto-suave">
          Contatos fictícios de demonstração.
        </p>
      </div>
    </div>
  );
}

export function TelaPixValor() {
  const { estado } = useBanco();
  const contato = CONTATOS.find((c) => c.id === estado.pix.contato);
  return (
    <div>
      <Cabecalho voltar="pixvalor.voltar" titulo="Quanto enviar?" subtitulo={`Para ${contato?.nome ?? "—"}`} />
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2">
          {VALORES.map((v) => (
            <Opcao key={v} actionId={`pixvalor.opcao.${v}`} selecionado={estado.pix.valor === v}>
              {formatarReais(v).replace(",00", "")}
            </Opcao>
          ))}
        </div>
        <BotaoPrincipal actionId="pixvalor.continuar" desabilitado={estado.pix.valor === null}>
          Continuar
        </BotaoPrincipal>
      </div>
    </div>
  );
}

/** A tela testada na vila: muda só o jeito de oferecer "repetir todo mês" (A, B ou C). */
export function TelaPixConfirmar() {
  const { estado } = useBanco();
  const contato = CONTATOS.find((c) => c.id === estado.pix.contato);
  const valor = estado.pix.valor ?? 0;
  const versao = estado.versoes.pix;
  const repetir = estado.pix.repetir_mensal;
  return (
    <div>
      <Cabecalho voltar="pixconfirmar.voltar" titulo="Confirmar Pix" subtitulo="Confira os dados antes de enviar" />
      <div className="space-y-4 p-4">
        <Cartao className="bg-fundo">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p data-leitura className="text-xs text-texto-suave">
                Destinatário
              </p>
              <p data-leitura className="text-lg font-bold text-azul">
                {contato?.nome ?? "—"}
              </p>
            </div>
            {versao === "A" && (
              <Clicavel
                actionId="pixconfirmar.mais_opcoes"
                rotuloAcessivel="Mais opções"
                somenteIcone
                selecionado={estado.pix.mais_opcoes_aberto}
                className="rounded-full p-1.5 text-texto-suave hover:bg-borda"
              >
                <Ellipsis aria-hidden size={22} />
              </Clicavel>
            )}
            {versao === "B" && (
              <Clicavel
                actionId="pixconfirmar.repetir"
                tipo="alternador"
                rotuloAcessivel="Repetir este Pix"
                somenteIcone
                selecionado={repetir}
                className={`grid size-11 place-items-center rounded-full border ${
                  repetir ? "border-marca bg-marca-clara text-marca-escura" : "border-borda bg-cartao text-marca-escura"
                }`}
              >
                <Repeat aria-hidden size={20} />
              </Clicavel>
            )}
          </div>
          {versao === "A" && estado.pix.mais_opcoes_aberto && (
            <div className="mt-3 rounded-xl border border-borda bg-cartao p-2">
              <Clicavel
                actionId="pixconfirmar.repetir"
                tipo="alternador"
                selecionado={repetir}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-azul hover:bg-fundo"
              >
                Repetir todo mês
                <span aria-hidden className={`h-5 w-9 rounded-full p-0.5 ${repetir ? "bg-marca" : "bg-borda"}`}>
                  <span className={`block size-4 rounded-full bg-white transition ${repetir ? "translate-x-4" : ""}`} />
                </span>
              </Clicavel>
            </div>
          )}
          <hr className="my-3 border-borda" />
          <p data-leitura className="text-xs text-texto-suave">
            Valor a transferir
          </p>
          <p data-leitura className="text-3xl font-bold text-azul">
            {formatarReais(valor)}
          </p>
          <p data-leitura className="mt-1 text-xs font-semibold text-marca-escura">
            Pix Instantâneo
          </p>
        </Cartao>

        {versao === "C" && (
          <Cartao className="flex items-center gap-3 border-marca/50 bg-marca-clara">
            <Repeat aria-hidden size={26} className="shrink-0 text-marca-escura" />
            <p data-leitura className="flex-1 text-sm text-texto">
              <strong className="block text-azul">Deseja automatizar?</strong>
              Repita este mesmo valor todos os meses.
            </p>
            <Clicavel
              actionId="pixconfirmar.repetir"
              tipo="alternador"
              selecionado={repetir}
              className={`rounded-lg px-3 py-2 text-sm font-bold ${
                repetir ? "bg-azul text-white" : "bg-marca text-azul"
              }`}
            >
              {repetir ? "Repetindo todo mês" : "Repetir todo mês"}
            </Clicavel>
          </Cartao>
        )}

        <BotaoPrincipal actionId="pixconfirmar.enviar">Confirmar e enviar {formatarReais(valor)}</BotaoPrincipal>
        <p data-leitura className="text-center text-xs text-texto-suave">
          Transação fictícia de teste
        </p>
      </div>
    </div>
  );
}

export function TelaPixSucesso() {
  const { estado } = useBanco();
  const recorrente = estado.pix.repetir_mensal;
  return (
    <div className="grid min-h-full place-items-center p-6 text-center">
      <div className="space-y-3">
        <CircleCheck aria-hidden size={56} className="mx-auto text-sucesso" />
        <h1 className="text-xl font-bold text-azul">{recorrente ? "Pix agendado todo mês" : "Pix enviado"}</h1>
        <p data-leitura className="text-sm text-texto">
          {formatarReais(estado.pix.valor ?? 0)}
          {recorrente ? ", repetindo todo mês no mesmo dia." : ", uma vez só."} Operação fictícia.
        </p>
        <BotaoPrincipal actionId="sucesso.inicio">Voltar ao início</BotaoPrincipal>
      </div>
    </div>
  );
}
