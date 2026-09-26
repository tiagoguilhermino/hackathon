"""Vila de personas: personas de IA tentam uma tarefa olhando a imagem de uma tela."""

from .contrato import (
    AVISO,
    ROTULO,
    AgregadoPersonaVersao,
    Persona,
    ResultadoPersona,
    Simulacao,
    leitura,
)

_DO_MOTOR = {
    "ErroVila",
    "carregar_demo",
    "carregar_personas",
    "carregar_simulacao",
    "listar_simulacoes",
    "mensagem_de_erro",
    "modo_demo",
    "salvar_como_demo",
    "simular_telas",
    "simular_vila",
}


def __getattr__(nome):
    # Import preguiçoso: assim `python -m vila.motor` não carrega o motor duas vezes.
    if nome in _DO_MOTOR:
        from . import motor

        return getattr(motor, nome)
    raise AttributeError(f"module 'vila' has no attribute {nome!r}")


__all__ = [
    "AVISO",
    "ROTULO",
    "AgregadoPersonaVersao",
    "ErroVila",
    "Persona",
    "ResultadoPersona",
    "Simulacao",
    "carregar_demo",
    "carregar_personas",
    "carregar_simulacao",
    "leitura",
    "listar_simulacoes",
    "mensagem_de_erro",
    "modo_demo",
    "salvar_como_demo",
    "simular_telas",
    "simular_vila",
]
