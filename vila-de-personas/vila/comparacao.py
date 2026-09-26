"""H8/H9: compara a vila com o teste com pessoas e gera os números finais.

Passo 1, parear (a cada sessão que o M3 manda, ou no fim do teste):

    python -m vila.comparacao parear --sim resultados/sim-XXXX.json --notas dados/notas_teste.csv [--ia]

Gera resultados/pareamento-<sim>.csv com uma linha por dificuldade e uma SUGESTÃO de
classificação: acerto (vila e pessoas acharam), ponto cego (só as pessoas) ou alarme
falso (só a vila). Com --ia, o Claude sugere o pareamento; sem, uma regra simples de
palavras em comum. Em qualquer caso, o time confere CADA linha: abra o CSV, corrija
a coluna classificacao_final se preciso e escreva "ok" na coluna conferido.

Passo 2, resumo (depois de conferir):

    python -m vila.comparacao resumo --sim resultados/sim-XXXX.json --notas dados/notas_teste.csv

Conta só as linhas conferidas e grava resultados/numeros-finais.md, com o texto curto
para mandar ao M3 e ao M4 no WhatsApp. Os números saem como foram medidos.
"""

from __future__ import annotations

import argparse
import csv
import io
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal, Optional

from pydantic import BaseModel

from .contrato import Simulacao
from .motor import (
    MODELO,
    PASTA_RESULTADOS,
    RAIZ,
    USAR_FALLBACK,
    ErroVila,
    _cliente_api,
    _normalizar,
    carregar_simulacao,
    mensagem_de_erro,
)

CLASSES = ("acerto", "ponto cego", "alarme falso")
COLUNAS_NOTAS = ("participante", "versao", "achou", "primeiro_toque", "tempo_s", "dificuldade", "comentario")
COLUNAS_PAREAMENTO = (
    "versao",
    "dificuldade_vila",
    "tentativas_vila",
    "personas_vila",
    "dificuldade_pessoas",
    "participantes",
    "sugestao",
    "motivo_sugestao",
    "classificacao_final",
    "conferido",
    "observacao",
)
PALAVRAS_VAZIAS = {
    "a", "o", "as", "os", "de", "da", "do", "das", "dos", "e", "em", "no", "na", "nos", "nas",
    "um", "uma", "para", "pra", "por", "com", "que", "se", "eu", "me", "ao", "tela", "botao",
}


# --------------------------------------------------------------------------- leitura


@dataclass
class Nota:
    participante: str
    versao: str
    achou: bool
    primeiro_toque: str
    tempo_s: Optional[float]
    dificuldade: str
    comentario: str
    duracao_sessao_min: Optional[float] = None


def _numero(texto: str) -> Optional[float]:
    texto = (texto or "").strip().replace(",", ".")
    if not texto:
        return None
    try:
        return float(texto)
    except ValueError:
        raise ErroVila(f"Número inválido nas notas: {texto!r}")


def _sim_nao(texto: str) -> bool:
    valor = _normalizar(texto or "")
    if valor in {"sim", "s", "1", "true", "achou", "x"}:
        return True
    if valor in {"nao", "n", "0", "false", "nao achou", ""}:
        return False
    raise ErroVila(f"Na coluna 'achou' use sim ou não (veio {texto!r}).")


def _abrir_csv(caminho: Path) -> list[dict[str, str]]:
    texto = Path(caminho).read_text(encoding="utf-8-sig")
    primeira = texto.splitlines()[0] if texto.strip() else ""
    delimitador = ";" if primeira.count(";") >= primeira.count(",") else ","
    return list(csv.DictReader(io.StringIO(texto), delimiter=delimitador))


def ler_notas(caminho: Path) -> list[Nota]:
    """Notas do teste com pessoas (M3/M4). Uma linha por participante e versão vista."""
    linhas = _abrir_csv(caminho)
    if linhas:
        faltando = [c for c in COLUNAS_NOTAS if c not in linhas[0]]
        if faltando:
            raise ErroVila(f"Faltam colunas nas notas: {', '.join(faltando)}")
    notas = []
    for linha in linhas:
        if not (linha.get("participante") or "").strip():
            continue
        notas.append(
            Nota(
                participante=linha["participante"].strip(),
                versao=linha["versao"].strip().upper(),
                achou=_sim_nao(linha["achou"]),
                primeiro_toque=(linha.get("primeiro_toque") or "").strip(),
                tempo_s=_numero(linha.get("tempo_s", "")),
                dificuldade=(linha.get("dificuldade") or "").strip(),
                comentario=(linha.get("comentario") or "").strip(),
                duracao_sessao_min=_numero(linha.get("duracao_sessao_min", "")),
            )
        )
    if not notas:
        raise ErroVila("As notas do teste estão vazias.")
    return notas


# --------------------------------------------------------------------------- dificuldades


@dataclass
class Dificuldade:
    versao: str
    texto: str
    ocorrencias: int = 0
    quem: set[str] = field(default_factory=set)


def _agrupar(itens: list[tuple[str, str, str]]) -> list[Dificuldade]:
    """itens = (versao, texto, quem). Junta textos iguais (sem acento/maiúscula)."""
    grupos: dict[tuple[str, str], Dificuldade] = {}
    for versao, texto, quem in itens:
        if not texto.strip():
            continue
        chave = (versao, _normalizar(texto))
        dif = grupos.setdefault(chave, Dificuldade(versao=versao, texto=texto.strip()))
        dif.ocorrencias += 1
        dif.quem.add(quem)
    return list(grupos.values())


def dificuldades_da_vila(sim: Simulacao) -> list[Dificuldade]:
    """Onde a vila travou (uma dificuldade por elemento/etapa, por versão)."""
    nomes = {a.persona_id: a.persona_nome for a in sim.agregados}
    return _agrupar(
        [(r.versao, r.onde_travou or "", nomes.get(r.persona_id, r.persona_id)) for r in sim.resultados]
    )


def dificuldades_das_pessoas(notas: list[Nota]) -> list[Dificuldade]:
    return _agrupar([(n.versao, n.dificuldade, n.participante) for n in notas])


def _palavras(texto: str) -> set[str]:
    return {p for p in _normalizar(texto).split() if p not in PALAVRAS_VAZIAS and len(p) > 1}


def _parecido(a: str, b: str) -> float:
    pa, pb = _palavras(a), _palavras(b)
    if not pa or not pb:
        return 0.0
    return len(pa & pb) / min(len(pa), len(pb))


@dataclass
class Linha:
    versao: str
    vila: Optional[Dificuldade]
    pessoas: Optional[Dificuldade]
    sugestao: str
    motivo: str


def parear_por_regra(vila: list[Dificuldade], pessoas: list[Dificuldade]) -> list[Linha]:
    """Pareamento guloso por palavras em comum (limiar 0,5), dentro da mesma versão."""
    candidatos = sorted(
        (
            (_parecido(v.texto, p.texto), iv, ip)
            for iv, v in enumerate(vila)
            for ip, p in enumerate(pessoas)
            if v.versao == p.versao
        ),
        reverse=True,
    )
    usados_v: set[int] = set()
    usados_p: set[int] = set()
    linhas = []
    for nota, iv, ip in candidatos:
        if nota < 0.5 or iv in usados_v or ip in usados_p:
            continue
        usados_v.add(iv)
        usados_p.add(ip)
        linhas.append(Linha(vila[iv].versao, vila[iv], pessoas[ip], "acerto", f"palavras em comum ({nota:.0%})"))
    linhas += [Linha(v.versao, v, None, "alarme falso", "só a vila apontou") for i, v in enumerate(vila) if i not in usados_v]
    linhas += [Linha(p.versao, None, p, "ponto cego", "só as pessoas tiveram") for i, p in enumerate(pessoas) if i not in usados_p]
    return sorted(linhas, key=lambda l: (l.versao, CLASSES.index(l.sugestao)))


class _Par(BaseModel):
    indice_vila: Optional[int]
    indice_pessoas: Optional[int]
    classificacao: Literal["acerto", "ponto cego", "alarme falso"]
    motivo: str


class _Pareamento(BaseModel):
    pares: list[_Par]


def parear_com_ia(vila: list[Dificuldade], pessoas: list[Dificuldade]) -> list[Linha]:
    """O Claude SUGERE o pareamento; o time confere cada linha depois."""
    linhas: list[Linha] = []
    for versao in sorted({d.versao for d in vila} | {d.versao for d in pessoas}):
        v = [d for d in vila if d.versao == versao]
        p = [d for d in pessoas if d.versao == versao]
        if not v or not p:
            linhas += parear_por_regra(v, p)
            continue
        lista_v = "\n".join(f"V{i}: {d.texto}" for i, d in enumerate(v))
        lista_p = "\n".join(f"P{i}: {d.texto}" for i, d in enumerate(p))
        pedido = dict(
            model=MODELO,
            max_tokens=8000,
            system=(
                "Você ajuda a comparar dificuldades de uso de uma tela. Pareie uma dificuldade da "
                "simulação (V) com uma das pessoas (P) só quando tratam do mesmo elemento ou do "
                "mesmo problema. Cada item aparece no máximo uma vez. Itens sem par: V vira "
                "'alarme falso', P vira 'ponto cego'. Na dúvida, não pareie."
            ),
            messages=[{
                "role": "user",
                "content": f"Versão {versao}.\n\nDificuldades da simulação:\n{lista_v}\n\n"
                f"Dificuldades das pessoas:\n{lista_p}",
            }],
            output_format=_Pareamento,
        )
        cliente = _cliente_api()
        if USAR_FALLBACK:
            resposta = cliente.beta.messages.parse(
                **pedido, betas=["server-side-fallback-2026-07-01"], fallbacks="default"
            )
        else:
            resposta = cliente.messages.parse(**pedido)
        if resposta.parsed_output is None:
            raise ErroVila("A IA não devolveu o pareamento no formato combinado.")
        usados_v: set[int] = set()
        usados_p: set[int] = set()
        for par in resposta.parsed_output.pares:
            iv = par.indice_vila if par.indice_vila is not None and 0 <= par.indice_vila < len(v) else None
            ip = par.indice_pessoas if par.indice_pessoas is not None and 0 <= par.indice_pessoas < len(p) else None
            if (iv is not None and iv in usados_v) or (ip is not None and ip in usados_p) or (iv is None and ip is None):
                continue
            classe = "acerto" if iv is not None and ip is not None else ("alarme falso" if iv is not None else "ponto cego")
            linhas.append(Linha(versao, v[iv] if iv is not None else None, p[ip] if ip is not None else None,
                                classe, f"IA: {par.motivo}"))
            if iv is not None:
                usados_v.add(iv)
            if ip is not None:
                usados_p.add(ip)
        linhas += [Linha(versao, d, None, "alarme falso", "só a vila apontou") for i, d in enumerate(v) if i not in usados_v]
        linhas += [Linha(versao, None, d, "ponto cego", "só as pessoas tiveram") for i, d in enumerate(p) if i not in usados_p]
    return sorted(linhas, key=lambda l: (l.versao, CLASSES.index(l.sugestao)))


def gravar_pareamento(linhas: list[Linha], caminho: Path) -> Path:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with caminho.open("w", encoding="utf-8-sig", newline="") as arquivo:  # utf-8-sig: abre certo no Excel
        escritor = csv.DictWriter(arquivo, fieldnames=COLUNAS_PAREAMENTO, delimiter=";")
        escritor.writeheader()
        for l in linhas:
            escritor.writerow({
                "versao": l.versao,
                "dificuldade_vila": l.vila.texto if l.vila else "",
                "tentativas_vila": l.vila.ocorrencias if l.vila else 0,
                "personas_vila": ", ".join(sorted(l.vila.quem)) if l.vila else "",
                "dificuldade_pessoas": l.pessoas.texto if l.pessoas else "",
                "participantes": ", ".join(sorted(l.pessoas.quem)) if l.pessoas else "",
                "sugestao": l.sugestao,
                "motivo_sugestao": l.motivo,
                "classificacao_final": l.sugestao,
                "conferido": "",
                "observacao": "",
            })
    return caminho


# --------------------------------------------------------------------------- números finais


def _formatar_tempo(segundos: float) -> str:
    minutos, seg = divmod(round(segundos), 60)
    return f"{minutos} min {seg} s" if minutos else f"{seg} s"


def _pct(parte: int, total: int) -> str:
    return f"{parte} de {total}" + (f" ({100 * parte / total:.0f}%)" if total else "")


def resumo(sim: Simulacao, notas: list[Nota], pareamento: Path) -> str:
    linhas = _abrir_csv(pareamento)
    conferidas = [l for l in linhas if (l.get("conferido") or "").strip()]
    pendentes = len(linhas) - len(conferidas)
    contagem = Counter((l.get("classificacao_final") or "").strip().lower() for l in conferidas)
    invalidas = [c for c in contagem if c not in CLASSES]
    if invalidas:
        raise ErroVila(f"classificacao_final inválida no pareamento: {', '.join(invalidas)}")

    versoes = [t.versao for t in sim.metadados.telas]
    taxa = []
    for versao in versoes:
        da_vila = [r for r in sim.resultados if r.versao == versao]
        das_pessoas = [n for n in notas if n.versao == versao]
        taxa.append(
            f"- Versão {versao}: vila concluiu {_pct(sum(r.concluiu for r in da_vila), len(da_vila))} tentativas"
            f" · pessoas acharam {_pct(sum(n.achou for n in das_pessoas), len(das_pessoas))}"
        )

    participantes = sorted({n.participante for n in notas})
    sessoes = {}
    for n in notas:
        if n.duracao_sessao_min is not None:
            sessoes[n.participante] = n.duracao_sessao_min
    if len(sessoes) == len(participantes):
        tempo_pessoas = (
            f"{sum(sessoes.values()):g} min somando as {len(participantes)} sessões "
            "(medido; sem contar recrutamento e preparo)"
        )
    else:
        tempos = [n.tempo_s for n in notas if n.tempo_s is not None]
        tempo_pessoas = (
            f"{_formatar_tempo(sum(tempos))} somando só o tempo de tarefa de {len(participantes)} pessoas "
            "(duração das sessões não anotada; sem recrutamento e preparo)"
        )
    m = sim.metadados
    tempo_vila = (
        f"{_formatar_tempo(m.duracao_s)} para {m.chamadas} tentativas "
        f"({len(m.personas)} personas × {len(versoes)} versões × {m.rodadas} rodadas)"
    )
    custo = f", custo estimado US$ {m.custo_estimado_usd:.2f}" if m.custo_estimado_usd is not None else ""

    texto = [
        f"*Números da vila × teste com pessoas* (vila = SIMULAÇÃO, {m.horario_inicio[:10]})",
        "",
        "*Dificuldades* (só linhas conferidas pelo time):",
        f"- Acertos (vila e pessoas acharam): {contagem['acerto']}",
        f"- Pontos cegos (só as pessoas): {contagem['ponto cego']}",
        f"- Alarmes falsos (só a vila): {contagem['alarme falso']}",
    ]
    if pendentes:
        texto.append(f"- Atenção: {pendentes} linha(s) ainda sem conferir, fora da conta.")
    texto += [
        "",
        "*Conclusão da tarefa*:",
        *taxa,
        "",
        "*Tempo*:",
        f"- Vila: {tempo_vila}{custo}",
        f"- Pessoas: {tempo_pessoas}",
        "",
        f"Participantes: {len(participantes)} ({', '.join(participantes)}). "
        f"Modelo {m.modelo}, prompt {m.versao_prompt}. Fonte: resultados/{sim.id}.json.",
        "A vila não substitui teste com gente, não aprova design e não vê dado real.",
    ]
    return "\n".join(texto)


# --------------------------------------------------------------------------- linha de comando


def main(argv: Optional[list[str]] = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(prog="python -m vila.comparacao", description="Vila × pessoas (H8/H9)")
    sub = parser.add_subparsers(dest="comando", required=True)
    for nome in ("parear", "resumo"):
        p = sub.add_parser(nome)
        p.add_argument("--sim", required=True, type=Path, help="JSON da simulação oficial (resultados/)")
        p.add_argument("--notas", type=Path, default=RAIZ / "dados" / "notas_teste.csv")
        p.add_argument("--pareamento", type=Path, help="padrão: resultados/pareamento-<sim>.csv")
        if nome == "parear":
            p.add_argument("--ia", action="store_true", help="o Claude sugere o pareamento")
    args = parser.parse_args(argv)

    try:
        sim = carregar_simulacao(args.sim)
        notas = ler_notas(args.notas)
        destino = args.pareamento or PASTA_RESULTADOS / f"pareamento-{sim.id}.csv"
        if args.comando == "parear":
            vila, pessoas = dificuldades_da_vila(sim), dificuldades_das_pessoas(notas)
            linhas = parear_com_ia(vila, pessoas) if args.ia else parear_por_regra(vila, pessoas)
            gravar_pareamento(linhas, destino)
            contagem = Counter(l.sugestao for l in linhas)
            print(f"Pareamento sugerido em {destino}")
            print("Sugestão (ainda NÃO conferida): " + ", ".join(f"{contagem[c]} {c}" for c in CLASSES))
            print("Confiram cada linha: corrijam classificacao_final se preciso e escrevam 'ok' em conferido.")
        else:
            if not destino.exists():
                raise ErroVila(f"Pareamento não encontrado: {destino}. Rode 'parear' antes.")
            texto = resumo(sim, notas, destino)
            saida = PASTA_RESULTADOS / "numeros-finais.md"
            saida.write_text(texto + "\n", encoding="utf-8")
            print(texto)
            print(f"\n(gravado em {saida})")
        return 0
    except Exception as erro:
        print(f"Erro: {mensagem_de_erro(erro)}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
