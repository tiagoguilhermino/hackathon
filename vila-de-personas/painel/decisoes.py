"""Registro das decisões humanas (classe Decisao da seção 6 de docs/contrato-de-dados.md).

resultados/decisoes.json é uma lista que só cresce: o painel acrescenta e nunca reescreve o que já
está lá. Se o arquivo estiver ilegível, o painel avisa e não grava por cima.
"""

import json
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Literal

from pydantic import BaseModel

ARQ_DECISOES = Path(__file__).resolve().parent.parent / "resultados" / "decisoes.json"

QUEM = ("designer", "PO")
OPCOES = ("levar ao teste real", "descartar", "já corrigido")


class Decisao(BaseModel):
    horario: datetime
    quem: Literal["designer", "PO"]  # papel, nunca nome
    simulacao_id: str
    persona_id: str
    comparacao: str  # "A → B"
    leitura: Literal["melhorou", "piorou", "sinal fraco", "incompleto"]
    apontamento: str  # o que a vila apontou (onde travou)
    decisao: Literal["levar ao teste real", "descartar", "já corrigido"]
    comentario: str


class RegistroIlegivel(Exception):
    """decisoes.json existe mas não é uma lista JSON."""


def ler_decisoes(caminho: Path = ARQ_DECISOES) -> list[dict]:
    if not caminho.exists():
        return []
    try:
        dados = json.loads(caminho.read_text(encoding="utf-8"))
    except ValueError as erro:
        raise RegistroIlegivel(str(erro)) from erro
    if not isinstance(dados, list):
        raise RegistroIlegivel("o arquivo precisa ser uma lista")
    return dados


def acrescentar(novas: list[Decisao], caminho: Path = ARQ_DECISOES) -> int:
    """Acrescenta ao fim do registro e devolve o total de decisões. Grava num arquivo temporário e
    troca de uma vez, para uma queda no meio não corromper o registro."""
    registros = ler_decisoes(caminho) + [json.loads(d.model_dump_json()) for d in novas]
    caminho.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=caminho.parent, delete=False, suffix=".tmp") as tmp:
        json.dump(registros, tmp, ensure_ascii=False, indent=2)
    os.replace(tmp.name, caminho)
    return len(registros)


def agora() -> datetime:
    return datetime.now().astimezone()
