"""Leitura antes × depois de uma persona (seção 6 de docs/contrato-de-dados.md).

Só compara quando as duas versões têm o mesmo número de rodadas que voltaram. Se alguma
chamada falhou (por exemplo, limite da API), a leitura é "incompleto", nunca melhorou ou piorou.
"""

from typing import Literal, Mapping, Optional

from vila.contrato import leitura

LeituraPainel = Literal["melhorou", "piorou", "sinal fraco", "incompleto"]


def ler_persona(antes: Optional[Mapping], depois: Optional[Mapping]) -> LeituraPainel:
    """`antes` e `depois` são agregados da simulação (dicts de AgregadoPersonaVersao)."""
    if not antes or not depois:
        return "incompleto"
    n_antes, n_depois = antes["rodadas_validas"], depois["rodadas_validas"]
    if n_antes == 0 or n_antes != n_depois:
        return "incompleto"
    return leitura(antes["concluiu"], depois["concluiu"])
