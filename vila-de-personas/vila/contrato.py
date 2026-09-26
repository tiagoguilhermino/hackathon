"""Contrato de dados entre a vila (M1) e o painel (M2).

Regra do time: o painel só depende destes modelos. Se algum campo mudar,
M1 e M2 combinam antes e atualizam este arquivo juntos.

Fluxo: o motor pede ao modelo uma `RespostaPersona` (só o que a persona
"viveu" na tela) e completa com persona_id, versao e rodada, que o código já
sabe, formando o `ResultadoPersona`. Assim o modelo não tem como trocar a
versão ou a rodada de lugar.
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field

ROTULO = "SIMULAÇÃO"
AVISO = (
    "SIMULAÇÃO com personas de IA · protótipo de hackathon · telas fictícias. "
    "Não substitui teste com pessoas, não aprova design e não usa dado real."
)


class Persona(BaseModel):
    """Cartão de persona escrito pelo M3 (dados/personas.json)."""

    id: str
    nome: str
    idade: int
    resumo: str
    familiaridade_digital: str
    contexto_de_uso: str
    acessibilidade: str
    objetivo: str
    medo: str


class RespostaPersona(BaseModel):
    """O que o modelo devolve em cada tentativa (saída estruturada)."""

    concluiu: bool = Field(
        description="true só se, olhando esta tela, a persona chegaria com confiança "
        "à opção que realiza a tarefa."
    )
    passos: list[str] = Field(
        description="Onde a persona tocaria, na ordem, um passo por item, citando o "
        "elemento da tela. Inclui hesitações."
    )
    primeiro_toque: str = Field(
        description="O primeiro elemento da tela em que a persona tocaria, com o texto "
        "exato da tela quando houver."
    )
    hesitou: bool = Field(description="true se a persona ficou em dúvida em algum passo.")
    desistiu: bool = Field(description="true se a persona desistiria da tarefa.")
    onde_travou: Optional[str] = Field(
        description="Nome curto do elemento ou etapa onde travou, com o texto exato da "
        "tela quando houver. null se não travou."
    )
    o_que_nao_entendeu: list[str] = Field(
        description="O que a persona não entendeu na tela. Lista vazia se entendeu tudo."
    )
    texto_da_tela_que_motivou: list[str] = Field(
        description="Trechos de texto exatos da tela que fizeram a persona decidir."
    )
    facilidade: int = Field(
        ge=1, le=5, description="1 = muito difícil, 5 = muito fácil, do ponto de vista da persona."
    )


class ResultadoPersona(RespostaPersona):
    """Uma tentativa de uma persona em uma versão de tela (contrato com o M2)."""

    persona_id: str
    versao: str
    rodada: int = Field(ge=1)


class Falha(BaseModel):
    """Tentativa que não voltou (erro de rede, limite da API etc.)."""

    persona_id: str
    versao: str
    rodada: int
    erro: str


class AgregadoPersonaVersao(BaseModel):
    """Linha da tabela persona × versão que o painel mostra."""

    persona_id: str
    persona_nome: str
    versao: str
    rodadas_validas: int
    concluiu: int
    texto: str = Field(description='Ex.: "concluiu 2 de 3"')
    trava_mais_frequente: Optional[str]
    primeiro_toque_mais_frequente: Optional[str]
    facilidade_media: Optional[float]
    desistencias: int
    hesitacoes: int
    falhas: int


class TelaInfo(BaseModel):
    versao: str
    arquivo: str
    sha256: str


class Metadados(BaseModel):
    """Rastreabilidade (H7): o suficiente para refazer e auditar a simulação."""

    modo: Literal["api", "offline-teste"]
    modelo: str
    modelos_que_responderam: list[str] = Field(
        default_factory=list,
        description="Modelos que de fato responderam (difere de `modelo` se o reserva entrou).",
    )
    esforco: str
    temperatura: Optional[float] = None
    max_tokens: Optional[int] = None
    versao_prompt: str
    sha256_prompt: str
    horario_inicio: str
    horario_fim: str
    duracao_s: float
    tarefa: str
    rodadas: int
    telas: list[TelaInfo]
    personas: list[str]
    chamadas: int
    falhas: int
    tokens_entrada: int = 0
    tokens_saida: int = 0
    custo_estimado_usd: Optional[float] = None
    versao_vila: str


class Simulacao(BaseModel):
    """Tudo o que uma execução da vila produz; é o JSON salvo em resultados/."""

    id: str
    rotulo: str = ROTULO
    aviso: str = AVISO
    carregado_de: Optional[str] = Field(
        default=None,
        description="Preenchido quando o resultado veio de um arquivo salvo (modo demo), "
        "não de uma execução ao vivo.",
    )
    metadados: Metadados
    resultados: list[ResultadoPersona]
    falhas: list[Falha]
    agregados: list[AgregadoPersonaVersao]

    def agregado(self, persona_id: str, versao: str) -> Optional[AgregadoPersonaVersao]:
        return next(
            (a for a in self.agregados if a.persona_id == persona_id and a.versao == versao),
            None,
        )


Leitura = Literal["melhorou", "piorou", "sinal fraco"]


def leitura(concluiu_antes: int, concluiu_depois: int) -> Leitura:
    """Regra combinada com o M2 (H3): diferença de 2 rodadas ou mais é melhora
    ou piora; de 1 ou menos é sinal fraco."""
    diferenca = concluiu_depois - concluiu_antes
    if diferenca >= 2:
        return "melhorou"
    if diferenca <= -2:
        return "piorou"
    return "sinal fraco"
