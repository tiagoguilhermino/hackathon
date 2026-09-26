#!/usr/bin/env python3
"""Confere o repositório antes de cada commit.

Uso:
    python3 scripts/checar.py

Confere: as 6 pastas, o .gitignore, o .env.example, o requirements.txt, chave vazada
(nos arquivos que iriam para o GitHub), agentes sincronizados e se o app abre sem erro
com o aviso fixo na tela. Nunca lê o .env. Sai com código 1 se algo falhar.
"""
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ))

PASTAS = ("vila", "painel", "telas", "dados", "resultados", "docs")
DEPENDENCIAS = ("streamlit", "pydantic", "python-dotenv", "groq")
# Formatos de chave: Groq (gsk_), Anthropic e OpenAI (sk-). Pede um trecho longo para não
# acusar a própria menção ao prefixo na documentação.
SEGREDOS = re.compile(r"gsk_[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{32,}")
NUNCA_LER = {".env", ".streamlit/secrets.toml"}
IGNORAR_PASTAS = {".git", ".venv", "venv", "__pycache__", "node_modules"}

resultados = []


def registrar(ok, nome, detalhe=""):
    resultados.append(ok)
    print(f"{'OK   ' if ok else 'FALHA'}  {nome}{': ' + detalhe if detalhe else ''}")


def arquivos_que_iriam_para_o_github():
    """Com git: rastreados + novos não ignorados. Sem git: tudo, menos pastas e segredos ignorados."""
    try:
        saida = subprocess.run(
            ["git", "ls-files", "-co", "--exclude-standard"],
            cwd=RAIZ, capture_output=True, text=True, check=True,
        ).stdout
        return [RAIZ / linha for linha in saida.splitlines() if linha]
    except (subprocess.CalledProcessError, FileNotFoundError):
        return [
            p for p in RAIZ.rglob("*")
            if p.is_file() and not IGNORAR_PASTAS & set(p.relative_to(RAIZ).parts)
            and p.relative_to(RAIZ).as_posix() not in NUNCA_LER
            and not p.relative_to(RAIZ).as_posix().startswith(".env.")
        ]


def checar_pastas():
    faltando = [p for p in PASTAS if not (RAIZ / p).is_dir()]
    registrar(not faltando, "6 pastas do plano", "faltam " + ", ".join(faltando) if faltando else "")


def checar_gitignore():
    linhas = (RAIZ / ".gitignore").read_text(encoding="utf-8").splitlines() if (RAIZ / ".gitignore").exists() else []
    registrar(".env" in [linha.strip() for linha in linhas], ".env no .gitignore")


def checar_env_example():
    exemplo = RAIZ / ".env.example"
    if not exemplo.exists():
        registrar(False, ".env.example", "arquivo não existe")
        return
    linha = next((l for l in exemplo.read_text(encoding="utf-8").splitlines() if l.startswith("GROQ_API_KEY=")), None)
    registrar(linha == "GROQ_API_KEY=", ".env.example sem chave", "" if linha == "GROQ_API_KEY=" else "GROQ_API_KEY precisa ficar vazio")


def checar_requirements():
    texto = (RAIZ / "requirements.txt").read_text(encoding="utf-8") if (RAIZ / "requirements.txt").exists() else ""
    faltando = [d for d in DEPENDENCIAS if not re.search(rf"^{re.escape(d)}\b", texto, re.MULTILINE)]
    registrar(not faltando, "requirements.txt", "faltam " + ", ".join(faltando) if faltando else "")


def checar_segredos():
    achados, env_rastreado = [], False
    for arquivo in arquivos_que_iriam_para_o_github():
        relativo = arquivo.relative_to(RAIZ).as_posix()
        if relativo in NUNCA_LER or relativo.startswith(".env."):
            env_rastreado = env_rastreado or relativo != ".env.example"
            continue
        try:
            texto = arquivo.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue  # imagem ou binário
        for n, linha in enumerate(texto.splitlines(), 1):
            if SEGREDOS.search(linha):
                achados.append(f"{relativo}:{n}")
    registrar(not env_rastreado, ".env e secrets.toml fora do GitHub",
              "um arquivo de segredo apareceu na lista do git: confira o .gitignore" if env_rastreado else "")
    registrar(not achados, "nenhuma chave vazada", "possível chave em " + ", ".join(achados) if achados else "")


def checar_agentes():
    proc = subprocess.run(
        [sys.executable, str(RAIZ / "scripts" / "sincronizar_agentes.py"), "--verificar"],
        cwd=RAIZ, capture_output=True, text=True,
    )
    ultima = proc.stdout.strip().splitlines()[-1] if proc.stdout.strip() else proc.stderr.strip()
    registrar(proc.returncode == 0, "agentes sincronizados", "" if proc.returncode == 0 else ultima)


def textos_na_tela(app):
    tipos = ("title", "header", "subheader", "markdown", "caption", "info", "warning", "error", "success", "text")
    return [str(elemento.value) for tipo in tipos for elemento in getattr(app, tipo, [])]


def checar_app():
    try:
        from streamlit.testing.v1 import AppTest
        from painel import textos
    except ImportError as erro:
        registrar(False, "app abre", f"falta instalar dependência ({erro}). Rode: pip install -r requirements.txt")
        return
    app = AppTest.from_file(str(RAIZ / "app.py"), default_timeout=60).run()
    if app.exception:
        registrar(False, "app abre", app.exception[0].message)
        return
    registrar(True, "app abre sem erro")
    registrar(any(textos.AVISO_FIXO in t for t in textos_na_tela(app)), "aviso fixo na tela", textos.AVISO_FIXO)


def main():
    print(f"Conferindo {RAIZ.name}/\n")
    checar_pastas()
    checar_gitignore()
    checar_env_example()
    checar_requirements()
    checar_segredos()
    checar_agentes()
    checar_app()
    falhas = resultados.count(False)
    print(f"\n{len(resultados) - falhas} OK · {falhas} FALHA")
    return 1 if falhas else 0


if __name__ == "__main__":
    sys.exit(main())
