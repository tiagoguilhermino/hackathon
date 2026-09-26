#!/usr/bin/env python3
"""Gera os agentes e skills do Claude Code e do Antigravity a partir de compartilhado/.

Fonte única (você edita):
    compartilhado/agentes/<nome>.md    seções: --- comum / --- claude / --- antigravity / --- corpo
    compartilhado/skills/<nome>/       pasta com SKILL.md (formato igual nas duas ferramentas)

Gerado (não edite):
    .claude/agents/<nome>.md    e   .agents/agents/<nome>.md
    .claude/skills/<nome>/      e   .agents/skills/<nome>/

Uso:
    python3 scripts/sincronizar_agentes.py              gera tudo
    python3 scripts/sincronizar_agentes.py --verificar  só confere; sai com código 1 se algo estiver fora de sincronia
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FONTE_AGENTES = RAIZ / "compartilhado" / "agentes"
FONTE_SKILLS = RAIZ / "compartilhado" / "skills"
DESTINOS = {
    "claude": {"agentes": RAIZ / ".claude" / "agents", "skills": RAIZ / ".claude" / "skills"},
    "antigravity": {"agentes": RAIZ / ".agents" / "agents", "skills": RAIZ / ".agents" / "skills"},
}
SECOES = ("comum", "claude", "antigravity", "corpo")
ASSINATURA = "GERADO por scripts/sincronizar_agentes.py"
AVISO = "<!-- " + ASSINATURA + " a partir de compartilhado/agentes/{nome}.md. Edite lá e rode o script de novo. -->"

# Nomes conhecidos. Nome errado no Antigravity pode travar o subagente sem erro nenhum.
FERRAMENTAS = {
    "claude": {"Read", "Write", "Edit", "Glob", "Grep", "Bash", "WebSearch", "WebFetch", "NotebookEdit", "TodoWrite"},
    "antigravity": {
        "view_file", "list_dir", "find_by_name", "grep_search", "write_to_file", "replace_file_content",
        "multi_replace_file_content", "run_command", "search_web", "read_url_content", "manage_task",
    },
}
# Passo 7 e passo 12 do guia: revisor sem busca e sem escrita.
PROIBIDAS_REVISOR = {
    "WebSearch", "WebFetch", "Write", "Edit", "Bash", "NotebookEdit",
    "search_web", "read_url_content", "write_to_file", "replace_file_content",
    "multi_replace_file_content", "run_command",
}
LIMITE_REGRA_ANTIGRAVITY = 12_000


class ErroFonte(Exception):
    pass


def ler_fonte(caminho):
    secoes, atual = {}, None
    for n, linha in enumerate(caminho.read_text(encoding="utf-8").splitlines(), 1):
        marcador = re.fullmatch(r"--- (\w+)", linha.strip()) if atual != "corpo" else None
        if marcador:
            atual = marcador.group(1)
            if atual not in SECOES:
                raise ErroFonte(f"{caminho.name}:{n}: seção '{atual}' desconhecida (use {', '.join(SECOES)})")
            if atual in secoes:
                raise ErroFonte(f"{caminho.name}:{n}: seção '{atual}' repetida")
            secoes[atual] = []
        elif atual is None:
            if linha.strip():
                raise ErroFonte(f"{caminho.name}:{n}: texto antes de '--- comum'")
        else:
            secoes[atual].append(linha)
    faltando = [s for s in SECOES if s not in secoes]
    if faltando:
        raise ErroFonte(f"{caminho.name}: faltam as seções {', '.join(faltando)}")
    return secoes


def sem_bordas_vazias(linhas):
    texto = "\n".join(linhas).strip("\n")
    return texto.splitlines() if texto else []


def campo(linhas, chave):
    for linha in linhas:
        if linha.startswith(chave + ":"):
            return linha[len(chave) + 1:].strip()
    return None


def ferramentas(linhas):
    """Lê `tools:` em linha única (A, B) ou em lista YAML (- a)."""
    lista, dentro = [], False
    for linha in linhas:
        if linha.startswith("tools:"):
            resto = linha[len("tools:"):].strip()
            if resto:
                return [t.strip() for t in resto.strip("[]").split(",") if t.strip()]
            dentro = True
        elif dentro:
            item = re.match(r"\s+-\s*(\S+)", linha)
            if not item:
                break
            lista.append(item.group(1))
    return lista


def validar(nome, secoes):
    erros, avisos = [], []
    if campo(secoes["comum"], "name") != nome:
        erros.append(f"{nome}: 'name' em --- comum precisa ser igual ao nome do arquivo ({nome})")
    if campo(secoes["comum"], "description") is None:
        erros.append(f"{nome}: falta 'description' em --- comum")
    for ferramenta in ("claude", "antigravity"):
        lista = ferramentas(secoes[ferramenta])
        if not lista:
            avisos.append(f"{nome} [{ferramenta}]: sem 'tools' explícito, o agente herda ferramentas demais")
        desconhecidas = sorted(set(lista) - FERRAMENTAS[ferramenta])
        if desconhecidas:
            avisos.append(f"{nome} [{ferramenta}]: ferramenta(s) fora da lista conhecida: {', '.join(desconhecidas)}")
        if nome.startswith("revisor"):
            proibidas = sorted(set(lista) & PROIBIDAS_REVISOR)
            if proibidas:
                erros.append(f"{nome} [{ferramenta}]: revisor não pode ter busca nem escrita: {', '.join(proibidas)}")
    if campo(secoes["antigravity"], "subagent") != "true":
        avisos.append(f"{nome} [antigravity]: sem 'subagent: true' o agente existe mas ninguém chama")
    return erros, avisos


def montar(nome, secoes, ferramenta):
    cabecalho = sem_bordas_vazias(secoes["comum"]) + sem_bordas_vazias(secoes[ferramenta])
    corpo = "\n".join(sem_bordas_vazias(secoes["corpo"]))
    return "---\n" + "\n".join(cabecalho) + "\n---\n\n" + AVISO.format(nome=nome) + "\n\n" + corpo + "\n"


def arquivos_da_pasta(pasta):
    if not pasta.is_dir():
        return {}
    return {p.relative_to(pasta).as_posix(): p.read_bytes() for p in sorted(pasta.rglob("*")) if p.is_file()}


def conferir_regras(avisos):
    agents_md = RAIZ / "AGENTS.md"
    regras = [agents_md] + sorted((RAIZ / ".agents" / "rules").glob("*.md"))
    for regra in regras:
        if regra.exists():
            tamanho = len(regra.read_text(encoding="utf-8"))
            if tamanho > LIMITE_REGRA_ANTIGRAVITY:
                avisos.append(f"{regra.relative_to(RAIZ)}: {tamanho} caracteres, acima do teto de "
                              f"{LIMITE_REGRA_ANTIGRAVITY} do Antigravity. Quebre em .agents/rules/")
    claude_md = RAIZ / "CLAUDE.md"
    if not claude_md.exists() or "@AGENTS.md" not in claude_md.read_text(encoding="utf-8"):
        avisos.append("CLAUDE.md não importa @AGENTS.md: o Claude Code não vai ler a constituição")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--verificar", action="store_true", help="só confere, não escreve nada")
    args = parser.parse_args()

    erros, avisos, pendencias = [], [], []

    fontes = {}
    for caminho in sorted(FONTE_AGENTES.glob("*.md")):
        try:
            fontes[caminho.stem] = ler_fonte(caminho)
        except ErroFonte as e:
            erros.append(str(e))
    for nome, secoes in fontes.items():
        e, a = validar(nome, secoes)
        erros += e
        avisos += a
    conferir_regras(avisos)

    if erros:
        for e in erros:
            print(f"ERRO   {e}")
        print("Nada foi gerado. Corrija a fonte em compartilhado/ e rode de novo.")
        return 1

    skills = sorted(p for p in FONTE_SKILLS.iterdir() if p.is_dir()) if FONTE_SKILLS.is_dir() else []

    for ferramenta, destino in DESTINOS.items():
        pasta_agentes, pasta_skills = destino["agentes"], destino["skills"]

        for nome, secoes in fontes.items():
            alvo = pasta_agentes / f"{nome}.md"
            conteudo = montar(nome, secoes, ferramenta)
            if not alvo.exists() or alvo.read_text(encoding="utf-8") != conteudo:
                pendencias.append(f"agente  {alvo.relative_to(RAIZ)}")
                if not args.verificar:
                    alvo.parent.mkdir(parents=True, exist_ok=True)
                    alvo.write_text(conteudo, encoding="utf-8")

        # Agente gerado cuja fonte sumiu continua invocável: apaga (só os que têm a assinatura do script).
        for alvo in sorted(pasta_agentes.glob("*.md")) if pasta_agentes.is_dir() else []:
            if alvo.stem in fontes:
                continue
            if ASSINATURA in alvo.read_text(encoding="utf-8"):
                pendencias.append(f"remover {alvo.relative_to(RAIZ)} (a fonte não existe mais)")
                if not args.verificar:
                    alvo.unlink()
            else:
                avisos.append(f"{alvo.relative_to(RAIZ)} não vem de compartilhado/: mova para lá ou apague")

        for skill in skills:
            alvo = pasta_skills / skill.name
            if arquivos_da_pasta(skill) != arquivos_da_pasta(alvo):
                pendencias.append(f"skill   {alvo.relative_to(RAIZ)}/")
                if not args.verificar:
                    if alvo.exists():
                        shutil.rmtree(alvo)
                    shutil.copytree(skill, alvo)

        nomes_skills = {s.name for s in skills}
        for alvo in sorted(p for p in pasta_skills.iterdir() if p.is_dir()) if pasta_skills.is_dir() else []:
            if alvo.name not in nomes_skills:
                avisos.append(f"{alvo.relative_to(RAIZ)}/ não vem de compartilhado/skills/: mova para lá ou apague")

    for a in avisos:
        print(f"AVISO  {a}")
    if args.verificar:
        for p in pendencias:
            print(f"FORA   {p}")
        print("Tudo sincronizado." if not pendencias else f"{len(pendencias)} item(ns) fora de sincronia. "
              "Rode: python3 scripts/sincronizar_agentes.py")
        return 1 if pendencias else 0
    for p in pendencias:
        print(f"OK     {p}")
    print(f"{len(fontes)} agente(s) e {len(skills)} skill(s) em dia no Claude Code e no Antigravity.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
