"""Motor da vila: cada persona de IA "tenta" a tarefa olhando a imagem da tela.

Rode a partir da pasta vila-de-personas/:

    python -m vila.motor                  # H2: 1 persona, tela A, 1 rodada, imprime o JSON
    python -m vila.motor --vila           # H4: vila completa (A × B, todas as personas, 3 rodadas)
    python -m vila.motor --vila --telas A=telas/A.png B=telas/B.png C=telas/C.png
    python -m vila.motor --offline --vila # sem API: respostas falsas, só para testar o encanamento
    python -m vila.motor --demo           # carrega resultados/demo.json sem chamar a API

Para o painel (M2):

    from vila import simular_vila
    sim = simular_vila(tela_a, tela_b, tarefa, personas, rodadas=3, progresso=callback)
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import random
import re
import sys
import threading
import time
import unicodedata
import uuid
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Optional, Sequence

from dotenv import load_dotenv
from pydantic import ValidationError

from .contrato import (
    AgregadoPersonaVersao,
    Falha,
    Metadados,
    Persona,
    RespostaPersona,
    ResultadoPersona,
    Simulacao,
    TelaInfo,
)

VERSAO_VILA = "0.1.0"

RAIZ = Path(__file__).resolve().parent.parent  # vila-de-personas/
PASTA_VILA = RAIZ / "vila"
ARQ_PROMPT = PASTA_VILA / "prompt_persona.md"
ARQ_PERSONAS = RAIZ / "dados" / "personas.json"
PASTA_RESULTADOS = RAIZ / "resultados"
ARQ_DEMO = PASTA_RESULTADOS / "demo.json"
PASTA_AMOSTRAS = PASTA_VILA / "amostras"
# Onde procurar as telas do M4 quando o caminho não é informado (a primeira que existir).
PASTAS_TELAS = (RAIZ / "telas", RAIZ.parent / "telas", PASTA_AMOSTRAS)

load_dotenv(RAIZ / ".env")

# Único modelo da Groq que lê imagem (console.groq.com/docs/vision, conferido em 26/09/2026).
# Está em "Preview Models" e pode sair do ar sem aviso: por isso existe o modo demo.
MODELO = os.getenv("VILA_MODELO", "qwen/qwen3.8-27b")
# Vai para a API como reasoning_effort (none, default, low, medium, high) nos modelos que raciocinam.
# Congelado junto com o prompt na H6: mudar o esforço muda os resultados.
ESFORCO = os.getenv("VILA_ESFORCO", "medium")
# Modelos que raciocinam antes de responder. Com o modo JSON, a Groq exige esconder o raciocínio
# (reasoning_format "hidden" ou "parsed"); senão ele vem no texto, entre <think>, e quebra o JSON.
PREFIXOS_COM_RACIOCINIO = ("qwen/", "openai/gpt-oss")
PARALELO = int(os.getenv("VILA_PARALELO", "12"))
TENTATIVAS_SDK = int(os.getenv("VILA_TENTATIVAS", "3"))
USAR_FALLBACK = os.getenv("VILA_FALLBACK", "1") == "1"
TAREFA_PADRAO = "Agendar um Pix que se repete todo mês."

# US$ por milhão de tokens (entrada, saída). Só para a estimativa gravada nos metadados.
# Sem preço conferido para o modelo em uso, o custo fica vazio no JSON (não inventamos número).
PRECOS: dict[str, tuple[float, float]] = {}

LIMITE_IMAGEM_BYTES = 5 * 1024 * 1024


class ErroVila(Exception):
    """Erro com mensagem pronta para mostrar no painel, em português."""


# --------------------------------------------------------------------------- entradas


@dataclass(frozen=True)
class TelaPreparada:
    versao: str
    arquivo: str
    media_type: str
    sha256: str
    base64: str


def _tipo_imagem(dados: bytes) -> str:
    if dados.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if dados[:3] == b"\xff\xd8\xff":
        return "image/jpeg"
    if dados[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if dados[:4] == b"RIFF" and dados[8:12] == b"WEBP":
        return "image/webp"
    raise ErroVila("Formato de imagem não suportado: use PNG ou JPG.")


def _ler_tela(tela: Any) -> tuple[bytes, str]:
    """Aceita caminho, bytes ou arquivo aberto (inclusive o UploadedFile do Streamlit)."""
    if isinstance(tela, (str, Path)):
        caminho = Path(tela)
        if not caminho.exists():
            raise ErroVila(f"Tela não encontrada: {caminho}")
        return caminho.read_bytes(), caminho.name
    if isinstance(tela, (bytes, bytearray)):
        return bytes(tela), "upload"
    nome = Path(getattr(tela, "name", "upload")).name
    if hasattr(tela, "getvalue"):
        return tela.getvalue(), nome
    if hasattr(tela, "read"):
        dados = tela.read()
        if hasattr(tela, "seek"):
            tela.seek(0)
        return dados, nome
    raise ErroVila(f"Não sei ler a tela recebida ({type(tela).__name__}).")


def preparar_tela(versao: str, tela: Any) -> TelaPreparada:
    dados, nome = _ler_tela(tela)
    if not dados:
        raise ErroVila(f"A tela {versao} está vazia.")
    if len(dados) > LIMITE_IMAGEM_BYTES:
        raise ErroVila(f"A tela {versao} passa de 5 MB; exporte em tamanho menor.")
    return TelaPreparada(
        versao=versao,
        arquivo=nome,
        media_type=_tipo_imagem(dados),
        sha256=hashlib.sha256(dados).hexdigest(),
        base64=base64.standard_b64encode(dados).decode("ascii"),
    )


def achar_tela(versao: str) -> Path:
    """Procura <versao>.png nas pastas de telas (telas do M4 primeiro, amostras por último)."""
    for pasta in PASTAS_TELAS:
        for extensao in (".png", ".jpg", ".jpeg"):
            caminho = pasta / f"{versao}{extensao}"
            if caminho.exists():
                return caminho
    raise ErroVila(f"Não achei a tela {versao}.png em: " + ", ".join(str(p) for p in PASTAS_TELAS))


def carregar_personas(caminho: Path = ARQ_PERSONAS) -> list[Persona]:
    bruto = json.loads(Path(caminho).read_text(encoding="utf-8"))
    lista = bruto["personas"] if isinstance(bruto, dict) else bruto
    return [Persona.model_validate(p) for p in lista]


def resolver_personas(personas: Optional[Iterable[Any]]) -> list[Persona]:
    """Aceita None (todas), objetos Persona, dicts, ids ("jorge") ou nomes ("Seu Jorge")."""
    if personas is None:
        return carregar_personas()
    cadastro: Optional[dict[str, Persona]] = None
    escolhidas: dict[str, Persona] = {}
    for item in personas:
        if isinstance(item, Persona):
            persona = item
        elif isinstance(item, Mapping):
            persona = Persona.model_validate(item)
        elif isinstance(item, str):
            if cadastro is None:
                cadastro = {}
                for p in carregar_personas():
                    cadastro[_normalizar(p.id)] = p
                    cadastro[_normalizar(p.nome)] = p
            persona = cadastro.get(_normalizar(item))
            if persona is None:
                raise ErroVila(f"Persona desconhecida: {item}")
        else:
            raise ErroVila(f"Persona em formato inesperado: {item!r}")
        escolhidas.setdefault(persona.id, persona)
    if not escolhidas:
        raise ErroVila("Escolha pelo menos uma persona.")
    return list(escolhidas.values())


def carregar_prompt(caminho: Path = ARQ_PROMPT) -> tuple[str, str, str]:
    """Devolve (versão, corpo do prompt sem comentários, sha256 do arquivo)."""
    texto = Path(caminho).read_text(encoding="utf-8")
    primeira, _, resto = texto.partition("\n")
    achado = re.match(r"\s*versao:\s*(\S+)", primeira)
    if not achado:
        raise ErroVila("A primeira linha de prompt_persona.md deve ser 'versao: vN'.")
    corpo = re.sub(r"<!--.*?-->", "", resto, flags=re.S).strip()
    return achado.group(1), corpo, hashlib.sha256(texto.encode("utf-8")).hexdigest()


def montar_prompt(corpo: str, persona: Persona) -> str:
    def trocar(achado: re.Match[str]) -> str:
        campo = achado.group(1)
        if campo not in Persona.model_fields:
            raise ErroVila(f"O prompt usa o campo {{{{{campo}}}}}, que não existe no cartão da persona.")
        return str(getattr(persona, campo))

    return re.sub(r"\{\{\s*(\w+)\s*\}\}", trocar, corpo)


def _mensagem_usuario(tela: TelaPreparada, tarefa: str) -> list[dict[str, Any]]:
    # O texto vai antes da imagem, como no exemplo da documentação de visão da Groq.
    return [
        {
            "type": "text",
            "text": f"Tarefa: {tarefa}\n\nOlhe a tela abaixo e tente fazer a tarefa. Responda APENAS em JSON seguindo o schema.",
        },
        {
            "type": "image_url",
            "image_url": {"url": f"data:{tela.media_type};base64,{tela.base64}"},
        }
    ]


# --------------------------------------------------------------------------- chamadas


@dataclass
class Uso:
    entrada: int = 0
    saida: int = 0
    modelo: str = ""


_cliente = None
_trava_cliente = threading.Lock()


def _usar_certificados_do_sistema() -> None:
    # Redes com inspeção de TLS (comum em eventos e empresas) usam uma CA que só o
    # Windows/macOS conhece. O truststore faz o Python confiar no repositório do sistema.
    if os.getenv("VILA_TRUSTSTORE", "1") != "1":
        return
    try:
        import truststore

        truststore.inject_into_ssl()
    except Exception:
        pass


def _cliente_api():
    global _cliente
    with _trava_cliente:
        if _cliente is None:
            if not os.getenv("GROQ_API_KEY"):
                raise ErroVila(
                    "Chave da API não encontrada. Coloque GROQ_API_KEY=... no arquivo .env "
                    "(nunca no código) ou use “Carregar resultado salvo”."
                )
            import groq
            _cliente = groq.Groq(max_retries=TENTATIVAS_SDK)
    return _cliente


def _tentar_api(
    persona: Persona,
    tela: TelaPreparada,
    tarefa: str,
    rodada: int,
    corpo_prompt: str,
    modelo: str,
    esforco: str,
) -> tuple[ResultadoPersona, Uso]:
    cliente = _cliente_api()
    schema_json = json.dumps(RespostaPersona.model_json_schema(), indent=2)
    system_prompt = montar_prompt(corpo_prompt, persona) + f"\n\nResponda APENAS com um JSON válido que siga este schema:\n{schema_json}"
    
    pedido: dict[str, Any] = dict(
        model=modelo,
        max_tokens=4000,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": _mensagem_usuario(tela, tarefa)}
        ],
        response_format={"type": "json_object"},
        temperature=0.1
    )
    if modelo.startswith(PREFIXOS_COM_RACIOCINIO):
        pedido["reasoning_format"] = "hidden"
        pedido["reasoning_effort"] = esforco

    resposta = cliente.chat.completions.create(**pedido)
    escolha = resposta.choices[0]
    if escolha.finish_reason == "length":
        raise ErroVila(
            "A resposta da IA foi cortada no limite de tokens. Tente VILA_ESFORCO=low no .env."
        )
    conteudo = escolha.message.content
    if not conteudo:
        raise ErroVila("A resposta da IA veio vazia.")
    
    try:
        saida_dict = json.loads(conteudo)
        saida = RespostaPersona.model_validate(saida_dict)
    except Exception as e:
        raise ErroVila(f"A resposta da IA veio fora do formato combinado: {e}")

    uso = resposta.usage
    entrada = uso.prompt_tokens or 0
    saida_tok = uso.completion_tokens or 0
    resultado = ResultadoPersona(
        **saida.model_dump(), persona_id=persona.id, versao=tela.versao, rodada=rodada
    )
    return resultado, Uso(entrada=entrada, saida=saida_tok, modelo=resposta.model)


def _tentar_offline(
    persona: Persona,
    tela: TelaPreparada,
    tarefa: str,
    rodada: int,
    corpo_prompt: str,
    modelo: str,
    esforco: str,
) -> tuple[ResultadoPersona, Uso]:
    """Resposta FALSA e determinística, sem IA: serve só para testar o encanamento
    (paralelismo, agregação, gravação, painel). Nunca usar como resultado."""
    gerador = random.Random(f"{persona.id}|{tela.versao}|{tela.sha256}|{rodada}")
    time.sleep(gerador.uniform(0.02, 0.1))
    concluiu = gerador.random() < 0.6
    elemento = gerador.choice(["[OFFLINE] elemento X", "[OFFLINE] elemento Y", "[OFFLINE] botão Z"])
    resultado = ResultadoPersona(
        persona_id=persona.id,
        versao=tela.versao,
        rodada=rodada,
        concluiu=concluiu,
        passos=[f"[OFFLINE] passo fictício {i}" for i in range(1, gerador.randint(2, 4) + 1)],
        primeiro_toque=elemento,
        hesitou=not concluiu or gerador.random() < 0.3,
        desistiu=not concluiu and gerador.random() < 0.5,
        onde_travou=None if concluiu else elemento,
        o_que_nao_entendeu=[] if concluiu else ["[OFFLINE] dúvida fictícia"],
        texto_da_tela_que_motivou=["[OFFLINE] texto fictício"],
        facilidade=gerador.randint(3, 5) if concluiu else gerador.randint(1, 3),
    )
    return resultado, Uso(modelo="offline-teste")


def mensagem_de_erro(erro: BaseException) -> str:
    """Traduz qualquer erro em uma frase clara, em português, para o painel."""
    if isinstance(erro, ErroVila):
        return str(erro)
    if isinstance(erro, ValidationError):
        return "A resposta da IA veio fora do formato combinado."
    try:
        import groq
    except ImportError:
        return f"Erro inesperado: {erro}"
    if isinstance(erro, groq.AuthenticationError):
        return "Chave da API inválida. Confira GROQ_API_KEY no arquivo .env."
    if isinstance(erro, groq.PermissionDeniedError):
        return "A chave da API não tem permissão para usar este modelo."
    if isinstance(erro, groq.NotFoundError):
        return f"Modelo não encontrado ({MODELO}). Confira VILA_MODELO."
    if isinstance(erro, groq.RateLimitError):
        return "Limite de uso da API atingido. Espere um minuto ou diminua VILA_PARALELO."
    if isinstance(erro, groq.BadRequestError):
        return f"A API recusou o pedido: {erro.message}"
    if isinstance(erro, groq.APIStatusError):
        return f"O serviço da IA falhou ({erro.status_code}). Tente de novo em instantes."
    if isinstance(erro, groq.APIConnectionError):
        return "Sem conexão com a API da IA. Verifique a internet ou use o modo demo."
    return f"Erro inesperado: {erro}"


# --------------------------------------------------------------------------- agregação


def _normalizar(texto: str) -> str:
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", sem_acento.lower())).strip()


def _mais_frequente(valores: Iterable[Optional[str]]) -> Optional[str]:
    """Valor mais citado, comparando sem acento, maiúsculas e pontuação.
    Empate: vence o que apareceu primeiro."""
    grupos: dict[str, list[str]] = {}
    for valor in valores:
        if valor and valor.strip():
            grupos.setdefault(_normalizar(valor), []).append(valor.strip())
    if not grupos:
        return None
    maior = max(grupos.values(), key=len)  # max devolve o primeiro em caso de empate
    return Counter(maior).most_common(1)[0][0]


def agregar(
    resultados: Sequence[ResultadoPersona],
    falhas: Sequence[Falha],
    personas: Sequence[Persona],
    versoes: Sequence[str],
) -> list[AgregadoPersonaVersao]:
    """Por persona e versão: quantas rodadas concluíram e o ponto de trava mais frequente."""
    agregados = []
    for persona in personas:
        for versao in versoes:
            doses = [r for r in resultados if r.persona_id == persona.id and r.versao == versao]
            n_falhas = sum(1 for f in falhas if f.persona_id == persona.id and f.versao == versao)
            concluiu = sum(r.concluiu for r in doses)
            texto = f"concluiu {concluiu} de {len(doses)}"
            if n_falhas:
                texto += f" ({n_falhas} tentativa{'s falharam' if n_falhas > 1 else ' falhou'})"
            agregados.append(
                AgregadoPersonaVersao(
                    persona_id=persona.id,
                    persona_nome=persona.nome,
                    versao=versao,
                    rodadas_validas=len(doses),
                    concluiu=concluiu,
                    texto=texto,
                    trava_mais_frequente=_mais_frequente(r.onde_travou for r in doses),
                    primeiro_toque_mais_frequente=_mais_frequente(r.primeiro_toque for r in doses),
                    facilidade_media=(
                        round(sum(r.facilidade for r in doses) / len(doses), 1) if doses else None
                    ),
                    desistencias=sum(r.desistiu for r in doses),
                    hesitacoes=sum(r.hesitou for r in doses),
                    falhas=n_falhas,
                )
            )
    return agregados


# --------------------------------------------------------------------------- vila


def modo_demo() -> bool:
    return os.getenv("VILA_MODO_DEMO", "").strip().lower() in {"1", "true", "sim", "yes"}


def _agora() -> datetime:
    return datetime.now().astimezone()


def simular_telas(
    telas: Mapping[str, Any],
    tarefa: str = TAREFA_PADRAO,
    personas: Optional[Iterable[Any]] = None,
    rodadas: int = 3,
    *,
    salvar: bool = True,
    offline: bool = False,
    progresso: Optional[Callable[[int, int], None]] = None,
    modelo: Optional[str] = None,
    esforco: Optional[str] = None,
) -> Simulacao:
    """Roda todas as personas em todas as versões de tela, `rodadas` vezes cada, em paralelo.

    `telas` é {versão: tela}, por exemplo {"A": "telas/A.png", "B": upload_b}.
    `progresso(feitas, total)` é chamado na thread de quem chamou (seguro para Streamlit).
    Com VILA_MODO_DEMO=1, devolve resultados/demo.json sem chamar a API.
    """
    if modo_demo():
        return carregar_demo()
    if not telas:
        raise ErroVila("Envie pelo menos uma tela.")
    if not tarefa or not tarefa.strip():
        raise ErroVila("Escreva a tarefa que as personas devem tentar.")
    if rodadas < 1:
        raise ErroVila("O número de rodadas deve ser pelo menos 1.")

    modelo = "offline-teste" if offline else (modelo or MODELO)
    esforco = esforco or ESFORCO
    preparadas = [preparar_tela(versao, tela) for versao, tela in telas.items()]
    lista_personas = resolver_personas(personas)
    versao_prompt, corpo_prompt, sha_prompt = carregar_prompt()
    tentar = _tentar_offline if offline else _tentar_api
    if not offline:
        _cliente_api()  # falha logo, com mensagem clara, se não houver chave

    trabalhos = [
        (persona, tela, rodada)
        for persona in lista_personas
        for tela in preparadas
        for rodada in range(1, rodadas + 1)
    ]
    inicio = _agora()
    cronometro = time.perf_counter()
    resultados: list[ResultadoPersona] = []
    falhas: list[Falha] = []
    usos: list[Uso] = []

    with ThreadPoolExecutor(max_workers=max(1, min(PARALELO, len(trabalhos)))) as executor:
        futuros = {
            executor.submit(tentar, p, t, tarefa, r, corpo_prompt, modelo, esforco): (p, t, r)
            for p, t, r in trabalhos
        }
        for feitas, futuro in enumerate(as_completed(futuros), start=1):
            persona, tela, rodada = futuros[futuro]
            try:
                resultado, uso = futuro.result()
                resultados.append(resultado)
                usos.append(uso)
            except Exception as erro:  # uma tentativa ruim não derruba a vila inteira
                falhas.append(
                    Falha(
                        persona_id=persona.id,
                        versao=tela.versao,
                        rodada=rodada,
                        erro=mensagem_de_erro(erro),
                    )
                )
            if progresso:
                progresso(feitas, len(trabalhos))

    duracao = round(time.perf_counter() - cronometro, 1)
    if not resultados:
        raise ErroVila(f"Nenhuma tentativa funcionou. Primeiro erro: {falhas[0].erro}")

    ordem_persona = {p.id: i for i, p in enumerate(lista_personas)}
    ordem_versao = {t.versao: i for i, t in enumerate(preparadas)}
    resultados.sort(key=lambda r: (ordem_persona[r.persona_id], ordem_versao[r.versao], r.rodada))
    falhas.sort(key=lambda f: (ordem_persona[f.persona_id], ordem_versao[f.versao], f.rodada))

    tokens_entrada = sum(u.entrada for u in usos)
    tokens_saida = sum(u.saida for u in usos)
    preco = PRECOS.get(modelo)
    custo = (
        round((tokens_entrada * preco[0] + tokens_saida * preco[1]) / 1_000_000, 4)
        if preco and not offline
        else None
    )
    modelos_que_responderam = sorted({u.modelo for u in usos if u.modelo})

    sim = Simulacao(
        id=f"sim-{inicio:%Y%m%d-%H%M%S}-{uuid.uuid4().hex[:6]}",
        metadados=Metadados(
            modo="offline-teste" if offline else "api",
            modelo=modelo,
            modelos_que_responderam=modelos_que_responderam,
            esforco=esforco,
            versao_prompt=versao_prompt,
            sha256_prompt=sha_prompt,
            horario_inicio=inicio.isoformat(timespec="seconds"),
            horario_fim=_agora().isoformat(timespec="seconds"),
            duracao_s=duracao,
            tarefa=tarefa.strip(),
            rodadas=rodadas,
            telas=[TelaInfo(versao=t.versao, arquivo=t.arquivo, sha256=t.sha256) for t in preparadas],
            personas=[p.id for p in lista_personas],
            chamadas=len(trabalhos),
            falhas=len(falhas),
            tokens_entrada=tokens_entrada,
            tokens_saida=tokens_saida,
            custo_estimado_usd=custo,
            versao_vila=VERSAO_VILA,
        ),
        resultados=resultados,
        falhas=falhas,
        agregados=agregar(resultados, falhas, lista_personas, [t.versao for t in preparadas]),
    )
    if salvar:
        salvar_simulacao(sim)
    return sim


def simular_vila(
    tela_a: Any,
    tela_b: Any,
    tarefa: str = TAREFA_PADRAO,
    personas: Optional[Iterable[Any]] = None,
    rodadas: int = 3,
    *,
    versoes: tuple[str, str] = ("A", "B"),
    **opcoes: Any,
) -> Simulacao:
    """Contrato com o M2: compara duas versões de tela (antes × depois).

    Com 4 personas e 3 rodadas são 24 chamadas em paralelo. Para comparar B × C,
    passe versoes=("B", "C").
    """
    if versoes[0] == versoes[1]:
        raise ErroVila("As duas versões precisam ter nomes diferentes.")
    return simular_telas(
        {versoes[0]: tela_a, versoes[1]: tela_b}, tarefa, personas, rodadas, **opcoes
    )


# --------------------------------------------------------------------------- registro e demo


def _gravar(sim: Simulacao, caminho: Path) -> Path:
    caminho.parent.mkdir(parents=True, exist_ok=True)
    limpo = sim.model_copy(update={"carregado_de": None})
    caminho.write_text(limpo.model_dump_json(indent=2), encoding="utf-8")
    return caminho


def salvar_simulacao(sim: Simulacao, pasta: Path = PASTA_RESULTADOS) -> Path:
    """Toda simulação vira um JSON em resultados/: é o registro e o plano B da demo."""
    return _gravar(sim, pasta / f"{sim.id}.json")


def carregar_simulacao(caminho: Path) -> Simulacao:
    return Simulacao.model_validate_json(Path(caminho).read_text(encoding="utf-8"))


def carregar_demo(caminho: Optional[Path] = None) -> Simulacao:
    """Modo demo: carrega um resultado salvo sem chamar a API (salva a apresentação
    se a internet cair)."""
    caminho = Path(caminho or ARQ_DEMO)
    if not caminho.exists():
        raise ErroVila(
            "Modo demo: resultados/demo.json ainda não existe. Rode uma simulação real e "
            "salve com: python -m vila.motor --vila --salvar-demo"
        )
    sim = carregar_simulacao(caminho)
    sim.carregado_de = f"resultados/{Path(caminho).name}"
    return sim


def salvar_como_demo(sim: Simulacao, *, forcar: bool = False) -> Path:
    """Grava a simulação como resultados/demo.json (a que o modo demo carrega)."""
    if sim.metadados.modo != "api" and not forcar:
        raise ErroVila("Só resultados reais (modo api) podem virar o demo.json.")
    return _gravar(sim, ARQ_DEMO)


def listar_simulacoes(pasta: Path = PASTA_RESULTADOS) -> list[Path]:
    """Simulações salvas, da mais recente para a mais antiga."""
    return sorted(pasta.glob("sim-*.json"), reverse=True)


# --------------------------------------------------------------------------- linha de comando


def _tabela(sim: Simulacao) -> str:
    linhas = [f"{sim.rotulo} · {sim.id}", sim.aviso, ""]
    versoes = [t.versao for t in sim.metadados.telas]
    for pid in sim.metadados.personas:
        partes = []
        nome = pid
        for versao in versoes:
            ag = sim.agregado(pid, versao)
            if ag:
                nome = ag.persona_nome
                trava = f", travou em: {ag.trava_mais_frequente}" if ag.trava_mais_frequente else ""
                partes.append(f"{versao}: {ag.texto}{trava}")
        linhas.append(f"- {nome}: " + " | ".join(partes))
    m = sim.metadados
    custo = f" · custo estimado US$ {m.custo_estimado_usd:.2f}" if m.custo_estimado_usd is not None else ""
    linhas += [
        "",
        f"modo {m.modo} · modelo {m.modelo} · prompt {m.versao_prompt} · esforço {m.esforco}",
        f"{m.chamadas} chamadas, {m.falhas} falhas, {m.duracao_s} s{custo}",
    ]
    if sim.falhas:
        linhas.append("Falhas: " + "; ".join(f"{f.persona_id}/{f.versao}/r{f.rodada}: {f.erro}" for f in sim.falhas))
    return "\n".join(linhas)


def _ler_telas_cli(itens: Optional[list[str]], padrao: Sequence[str]) -> dict[str, Any]:
    if not itens:
        return {versao: achar_tela(versao) for versao in padrao}
    telas: dict[str, Any] = {}
    for item in itens:
        versao, sep, caminho = item.partition("=")
        telas[versao.strip()] = Path(caminho.strip()) if sep else achar_tela(versao.strip())
    return telas


def main(argv: Optional[list[str]] = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(prog="python -m vila.motor", description=__doc__.split("\n")[0])
    parser.add_argument("--vila", action="store_true", help="roda a vila completa (padrão: A e B)")
    parser.add_argument("--telas", nargs="+", metavar="VERSAO=CAMINHO", help="ex.: A=telas/A.png B=telas/B.png")
    parser.add_argument("--personas", help="ids ou nomes separados por vírgula (padrão: todas)")
    parser.add_argument("--rodadas", type=int, default=3)
    parser.add_argument("--tarefa", default=TAREFA_PADRAO)
    parser.add_argument("--offline", action="store_true", help="respostas FALSAS, sem API (teste de encanamento)")
    parser.add_argument("--demo", action="store_true", help="carrega resultados/demo.json sem chamar a API")
    parser.add_argument("--salvar-demo", action="store_true", help="grava o resultado também como resultados/demo.json")
    parser.add_argument("--nao-salvar", action="store_true", help="não grava o JSON em resultados/")
    args = parser.parse_args(argv)

    try:
        if args.demo:
            print(_tabela(carregar_demo()))
            return 0

        personas = [p.strip() for p in args.personas.split(",")] if args.personas else None

        if not args.vila:
            # H2: uma persona, uma tela, uma rodada.
            telas = _ler_telas_cli(args.telas, ["A"])
            versao, tela = next(iter(telas.items()))
            persona = resolver_personas(personas)[0]
            _, corpo, _ = carregar_prompt()
            tentar = _tentar_offline if args.offline else _tentar_api
            resultado, uso = tentar(
                persona, preparar_tela(versao, tela), args.tarefa, 1, corpo,
                "offline-teste" if args.offline else MODELO, ESFORCO,
            )
            print(resultado.model_dump_json(indent=2))
            if not args.offline:
                print(f"\n(modelo {uso.modelo} · {uso.entrada} tokens de entrada · {uso.saida} de saída)", file=sys.stderr)
            return 0

        telas = _ler_telas_cli(args.telas, ["A", "B"])
        total = len(telas) * args.rodadas * len(resolver_personas(personas))
        print(f"Rodando {total} tentativas em paralelo...", file=sys.stderr)

        def mostrar(feitas: int, total: int) -> None:
            print(f"\r{feitas}/{total}", end="", file=sys.stderr, flush=True)

        sim = simular_telas(
            telas, args.tarefa, personas, args.rodadas,
            salvar=not args.nao_salvar, offline=args.offline, progresso=mostrar,
        )
        print(file=sys.stderr)
        print(_tabela(sim))
        if not args.nao_salvar:
            print(f"\nSalvo em resultados/{sim.id}.json")
        if args.salvar_demo:
            print(f"Demo gravado em {salvar_como_demo(sim).relative_to(RAIZ)}")
        return 0
    except ErroVila as erro:
        print(f"Erro: {erro}", file=sys.stderr)
        return 1
    except Exception as erro:
        print(f"Erro: {mensagem_de_erro(erro)}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
