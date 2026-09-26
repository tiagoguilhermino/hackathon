"""Confere o que já chegou ao repositório. Não depende do Streamlit e nunca lê o valor da chave."""

import json
import os
from dataclasses import dataclass
from pathlib import Path

from painel import textos

RAIZ = Path(__file__).resolve().parent.parent
EXTENSOES_TELA = {".png", ".jpg", ".jpeg"}


@dataclass(frozen=True)
class Item:
    nome: str
    ok: bool
    detalhe: str


def _telas(pasta: Path) -> list[str]:
    if not pasta.is_dir():
        return []
    return sorted(p.name for p in pasta.iterdir() if p.is_file() and p.suffix.lower() in EXTENSOES_TELA)


def _contrato(raiz: Path) -> Item:
    ok = (raiz / "vila" / "contrato.py").is_file()
    return Item(textos.DIAG_CONTRATO, ok, textos.DIAG_CONTRATO_OK if ok else textos.DIAG_CONTRATO_FALTA)


def _motor(raiz: Path) -> Item:
    # Lê o texto em vez de importar: importar o motor pode chamar a API.
    motor = raiz / "vila" / "motor.py"
    ok = motor.is_file() and "def simular_vila" in motor.read_text(encoding="utf-8")
    return Item(textos.DIAG_MOTOR, ok, textos.DIAG_MOTOR_OK if ok else textos.DIAG_MOTOR_FALTA)


def _personas(raiz: Path) -> Item:
    arquivo = raiz / "dados" / "personas.json"
    if not arquivo.is_file():
        return Item(textos.DIAG_PERSONAS, False, textos.DIAG_PERSONAS_FALTA)
    try:
        personas = json.loads(arquivo.read_text(encoding="utf-8"))
        if not isinstance(personas, list):
            raise ValueError("o arquivo precisa ser uma lista")
    except ValueError as erro:
        return Item(textos.DIAG_PERSONAS, False, textos.DIAG_PERSONAS_INVALIDO.format(erro=erro))
    return Item(textos.DIAG_PERSONAS, bool(personas), textos.DIAG_PERSONAS_OK.format(n=len(personas)))


def _telas_item(raiz: Path) -> Item:
    oficiais = _telas(raiz / "telas")
    if oficiais:
        return Item(textos.DIAG_TELAS, True, textos.DIAG_TELAS_OK.format(nomes=", ".join(oficiais)))
    provisorias = _telas(raiz / "telas" / "provisorias")
    if provisorias:
        return Item(textos.DIAG_TELAS, True, textos.DIAG_TELAS_PROVISORIAS.format(nomes=", ".join(provisorias)))
    return Item(textos.DIAG_TELAS, False, textos.DIAG_TELAS_FALTA)


def _chave() -> Item:
    ok = bool(os.getenv("GROQ_API_KEY"))
    return Item(textos.DIAG_CHAVE, ok, textos.DIAG_CHAVE_OK if ok else textos.DIAG_CHAVE_FALTA)


def diagnosticar(raiz: Path = RAIZ) -> list[Item]:
    return [_contrato(raiz), _motor(raiz), _personas(raiz), _telas_item(raiz), _chave()]
