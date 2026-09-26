"""Autoteste da vila SEM chamar a API (respostas falsas do modo offline).

    python -m vila.autoteste

Confere o encanamento: entradas, paralelismo, agregação, gravação, modo demo,
comparação com pessoas e regra de leitura. Não diz nada sobre a qualidade do prompt:
isso só se vê rodando com a API nas telas do M4 (H3 e H6).
"""

from __future__ import annotations

import csv
import io
import os
import sys
import tempfile
from pathlib import Path

from . import motor
from .comparacao import (
    COLUNAS_PAREAMENTO,
    dificuldades_da_vila,
    dificuldades_das_pessoas,
    gravar_pareamento,
    ler_notas,
    parear_por_regra,
    resumo,
)
from .contrato import ROTULO, leitura

AMOSTRAS = motor.PASTA_AMOSTRAS


def checar(condicao: bool, descricao: str) -> None:
    if not condicao:
        raise AssertionError(descricao)
    print(f"ok  {descricao}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    # Regra de leitura combinada com o M2
    checar(leitura(0, 3) == "melhorou" and leitura(3, 1) == "piorou" and leitura(1, 2) == "sinal fraco",
           "regra melhorou/piorou/sinal fraco (diferença ≥ 2)")

    # Personas e prompt
    personas = motor.carregar_personas()
    checar(len(personas) == 4, "dados/personas.json tem 4 personas")
    checar([p.id for p in motor.resolver_personas(["Seu Jorge", "jorge", "ana"])] == ["jorge", "ana"],
           "personas por nome ou id, sem repetir")
    versao, corpo, _ = motor.carregar_prompt()
    checar(versao.startswith("v"), f"prompt tem versão ({versao})")
    for p in personas:
        texto = motor.montar_prompt(corpo, p)
        checar("{{" not in texto and p.nome in texto, f"prompt montado para {p.nome}, sem campos sobrando")
    proibidos = ["repetir", "mais opções", "mais opcoes", "recorrência", "recorrente"]
    checar(not any(t in corpo.lower() for t in proibidos), "prompt não entrega a resposta certa")

    # Entradas de tela
    png = (AMOSTRAS / "A.png").read_bytes()
    upload = io.BytesIO(png)
    upload.name = "A.png"
    checar(motor.preparar_tela("A", upload).media_type == "image/png", "aceita arquivo enviado (upload)")
    checar(motor.preparar_tela("A", png).sha256 == motor.preparar_tela("A", AMOSTRAS / "A.png").sha256,
           "bytes e caminho geram a mesma tela")
    try:
        motor.preparar_tela("X", b"isto nao e imagem")
        checar(False, "recusa arquivo que não é imagem")
    except motor.ErroVila:
        checar(True, "recusa arquivo que não é imagem")

    # Vila completa, offline
    avisos = []
    sim = motor.simular_vila(AMOSTRAS / "A.png", AMOSTRAS / "B.png", motor.TAREFA_PADRAO, None, 3,
                             salvar=False, offline=True, progresso=lambda f, t: avisos.append((f, t)))
    checar(sim.metadados.chamadas == 24 and len(sim.resultados) == 24 and not sim.falhas,
           "24 tentativas (4 personas × 2 versões × 3 rodadas)")
    checar(avisos[-1] == (24, 24) and len(avisos) == 24, "progresso avisado 24 vezes")
    checar(len(sim.agregados) == 8, "8 linhas persona × versão")
    for ag in sim.agregados:
        dele = [r for r in sim.resultados if r.persona_id == ag.persona_id and r.versao == ag.versao]
        assert ag.concluiu == sum(r.concluiu for r in dele) and ag.rodadas_validas == 3
        assert ag.texto == f"concluiu {ag.concluiu} de 3"
    checar(True, 'agregado "concluiu X de 3" confere com as tentativas')
    checar(sim.rotulo == ROTULO and "SIMULAÇÃO" in sim.aviso, "rótulo SIMULAÇÃO presente")
    m = sim.metadados
    checar(all([m.modelo, m.versao_prompt, m.sha256_prompt, m.horario_inicio, m.telas, m.personas]),
           "metadados de rastreabilidade (modelo, prompt, horário, telas, personas)")
    checar(motor._mais_frequente(["Mais opções", "mais opcoes!", "Continuar"]) == "Mais opções",
           "trava mais frequente ignora acento e maiúsculas")

    sim_bc = motor.simular_vila(AMOSTRAS / "B.png", AMOSTRAS / "C.png", versoes=("B", "C"),
                                personas=["marcos"], rodadas=2, salvar=False, offline=True)
    checar([t.versao for t in sim_bc.metadados.telas] == ["B", "C"] and len(sim_bc.resultados) == 4,
           "compara B × C com 1 persona e 2 rodadas")

    with tempfile.TemporaryDirectory() as pasta:
        pasta = Path(pasta)
        # Registro e modo demo
        caminho = motor.salvar_simulacao(sim, pasta)
        checar(motor.carregar_simulacao(caminho) == sim, "JSON salvo e relido sem perda")
        try:
            motor.salvar_como_demo(sim)
            checar(False, "offline não vira demo")
        except motor.ErroVila:
            checar(True, "resultado offline não pode virar demo.json")
        demo = motor.carregar_demo(caminho)
        checar(demo.carregado_de is not None and demo.resultados == sim.resultados,
               "modo demo carrega resultado salvo sem API")
        os.environ["VILA_MODO_DEMO"] = "1"
        original = motor.ARQ_DEMO
        try:
            motor.ARQ_DEMO = caminho
            via_simular = motor.simular_vila("nao-existe-A.png", "nao-existe-B.png")
            checar(via_simular.id == sim.id, "VILA_MODO_DEMO=1 faz simular_vila devolver o demo")
        finally:
            motor.ARQ_DEMO = original
            del os.environ["VILA_MODO_DEMO"]

        # Comparação com pessoas
        notas = ler_notas(AMOSTRAS / "notas_teste.exemplo.csv")
        checar(len(notas) == 4 and notas[0].achou is False, "lê notas do teste (CSV com ;)")
        linhas = parear_por_regra(dificuldades_da_vila(sim), dificuldades_das_pessoas(notas))
        checar({l.sugestao for l in linhas} <= {"acerto", "ponto cego", "alarme falso"}, "pareamento sugerido")
        arquivo = gravar_pareamento(linhas, pasta / "pareamento.csv")
        texto = resumo(sim, notas, arquivo)
        checar("ainda sem conferir" in texto and "Acertos (vila e pessoas acharam): 0" in texto,
               "resumo ignora linhas não conferidas")
        with arquivo.open(encoding="utf-8-sig", newline="") as f:
            linhas_csv = list(csv.DictReader(f, delimiter=";"))
        with arquivo.open("w", encoding="utf-8-sig", newline="") as f:
            escritor = csv.DictWriter(f, fieldnames=COLUNAS_PAREAMENTO, delimiter=";")
            escritor.writeheader()
            escritor.writerows({**l, "conferido": "ok"} for l in linhas_csv)
        texto = resumo(sim, notas, arquivo)
        total = sum(1 for _ in linhas)
        checar("sem conferir" not in texto and "22 min somando as 2 sessões" in texto,
               f"resumo conta as {total} linhas conferidas e o tempo das sessões")

    checar(motor.mensagem_de_erro(motor.ErroVila("x")) == "x", "erros viram mensagem clara")
    print("\nTudo certo (modo offline: não diz nada sobre a qualidade das respostas da IA).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
