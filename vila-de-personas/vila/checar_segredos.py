"""H10: procura chaves de API no repositório antes de publicar ou enviar.

    python -m vila.checar_segredos              # arquivos atuais
    python -m vila.checar_segredos --historico  # também todo o histórico do git

Mostra só o começo de cada chave encontrada. Sai com código 1 se achar algo.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
PADROES = {
    "Anthropic": re.compile(r"sk-ant-[A-Za-z0-9_\-]{10,}"),
    "Groq": re.compile(r"gsk_[A-Za-z0-9]{20,}"),
    "OpenAI": re.compile(r"sk-(?:proj-)?[A-Za-z0-9]{32,}"),
}
PULAR_PASTAS = {".git", "venv", ".venv", "node_modules", "__pycache__", ".next", "dist", "build"}
PULAR_ARQUIVOS = {".env"}  # o .env é o lugar certo da chave; ele precisa estar no .gitignore
LIMITE_BYTES = 2 * 1024 * 1024


def _mascarar(chave: str) -> str:
    return chave[:7] + "…" + f"({len(chave)} caracteres)"


def varrer_arquivos() -> list[str]:
    achados = []
    for caminho in REPO.rglob("*"):
        if any(parte in PULAR_PASTAS for parte in caminho.relative_to(REPO).parts):
            continue
        if not caminho.is_file() or caminho.name in PULAR_ARQUIVOS or caminho.stat().st_size > LIMITE_BYTES:
            continue
        try:
            texto = caminho.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for numero, linha in enumerate(texto.splitlines(), start=1):
            for tipo, padrao in PADROES.items():
                for achado in padrao.findall(linha):
                    achados.append(f"{caminho.relative_to(REPO)}:{numero}: chave {tipo} {_mascarar(achado)}")
    return achados


def varrer_historico() -> list[str]:
    try:
        log = subprocess.run(
            ["git", "-C", str(REPO), "log", "--all", "-p", "--no-color", "--format=commit %h"],
            capture_output=True, text=True, encoding="utf-8", errors="ignore", check=True,
        ).stdout
    except (OSError, subprocess.CalledProcessError) as erro:
        return [f"não consegui ler o histórico do git: {erro}"]
    achados, commit = [], "?"
    for linha in log.splitlines():
        if linha.startswith("commit "):
            commit = linha.split()[1]
        elif linha.startswith("+"):
            for tipo, padrao in PADROES.items():
                for achado in padrao.findall(linha):
                    achados.append(f"commit {commit}: chave {tipo} {_mascarar(achado)}")
    return achados


def env_ignorado() -> list[str]:
    avisos = []
    for env in REPO.rglob(".env"):
        if any(parte in PULAR_PASTAS for parte in env.relative_to(REPO).parts):
            continue
        resultado = subprocess.run(
            ["git", "-C", str(REPO), "check-ignore", "-q", str(env)], capture_output=True
        )
        if resultado.returncode != 0:
            avisos.append(f"{env.relative_to(REPO)} NÃO está no .gitignore")
    return avisos


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(prog="python -m vila.checar_segredos")
    parser.add_argument("--historico", action="store_true", help="varre também o histórico do git")
    args = parser.parse_args(argv)

    problemas = varrer_arquivos() + env_ignorado()
    if args.historico:
        problemas += varrer_historico()
    if problemas:
        print("ATENÇÃO, possível vazamento:")
        for problema in problemas:
            print(f"- {problema}")
        print("Tire a chave do arquivo, troque a chave no console da API e confira o histórico do git.")
        return 1
    print(f"Nenhuma chave encontrada em {REPO.name}" + (" (arquivos e histórico)." if args.historico else " (arquivos)."))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
