# Contrato de dados · vila ↔ painel

| Versão | Status | Quem propôs | De acordo |
|---|---|---|---|
| 1.0 | **PROPOSTA**, aguardando o M1 | M2, 26/09/2026 (H1) | M1: ☐ · M2: ☑ |

Quando o M1 der o OK: troque o status para **FECHADO**, marque o ☐ e faça um commit só com esse arquivo (`H1: contrato de dados fechado`). Mudança depois disso: os dois concordam, a versão sobe (1.1, 1.2…) e a linha nova entra nesta tabela.

## 1. Quem chama quem

```
painel (app.py, M2) ──simular_vila(...)──▶ vila (vila/motor.py, M1) ──▶ API da Groq
        ▲                                        │
        └────────── Simulacao ◀──────────────────┘   e grava resultados/<id>.json
```

- O painel **só** fala com a vila por `simular_vila` e pelos modelos de `vila/contrato.py`. O painel nunca chama a Groq.
- A vila **não importa** `streamlit` e não mostra nada na tela: devolve dados ou levanta `ErroVila`.
- Enquanto `simular_vila` não existe, o painel usa `painel/mock_resultados.json`, que segue o mesmo formato (`Simulacao`).

## 2. Os modelos: `vila/contrato.py` (arquivo do M1)

O M1 cria o arquivo com este conteúdo (pedido pronto: *"Crie vila/contrato.py exatamente como na seção 2 de docs/contrato-de-dados.md"*). O M2 importa e não edita.

```python
"""Contrato de dados entre a vila (M1) e o painel (M2).

Fonte: docs/contrato-de-dados.md. Mudou algo aqui? Os dois concordam, VERSAO_CONTRATO sobe
e o documento muda junto, no mesmo commit.
"""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, model_validator

VERSAO_CONTRATO = "1.0"
ROTULO = "SIMULAÇÃO"


class Persona(BaseModel):
    """Um cartão de persona do M3. dados/personas.json é uma lista destes."""

    id: str  # estável e sem espaço: "ana", "seu-jorge", "carla", "marcos"
    nome: str
    idade: int
    resumo: str
    familiaridade_digital: str
    contexto_de_uso: str
    acessibilidade: str
    objetivo: str
    medo: str


class Tela(BaseModel):
    """Uma versão de tela que o painel entrega à vila. Não vai para o JSON salvo."""

    versao: str  # rótulo curto que aparece no painel: "A", "B", "C"
    arquivo: str  # de onde veio: "telas/A.png" ou "upload:minha-tela.png"
    imagem: bytes  # conteúdo do arquivo
    media_type: Literal["image/png", "image/jpeg"] = "image/png"


class RespostaPersona(BaseModel):
    """O que o modelo preenche em UMA tentativa. É o schema pedido à API."""

    concluiu: bool  # deixou o Pix repetindo todo mês e tocaria em Continuar
    passos: list[str]  # onde tocaria, em ordem, nas palavras da persona
    onde_travou: str | None  # obrigatório quando concluiu é false
    o_que_nao_entendeu: str | None
    texto_da_tela_que_motivou: str  # texto visível na tela que levou à decisão
    facilidade: int = Field(ge=1, le=5)  # 1 = muito difícil · 5 = muito fácil

    @model_validator(mode="after")
    def _travou_quando_nao_concluiu(self):
        if not self.concluiu and not (self.onde_travou or "").strip():
            raise ValueError("quando concluiu é false, onde_travou precisa dizer onde")
        return self


class ResultadoPersona(RespostaPersona):
    """Uma tentativa identificada. Os 3 campos abaixo são preenchidos pelo código da vila, nunca pelo modelo."""

    persona_id: str
    versao: str
    rodada: int = Field(ge=1)


class ResumoPersonaVersao(BaseModel):
    """Agregado de uma persona numa versão: é o "concluiu X de N" do painel."""

    persona_id: str
    versao: str
    rodadas: int  # N: tentativas que voltaram sem falha
    concluiu: int  # X: em quantas delas concluiu
    trava_mais_frequente: str | None
    facilidade_media: float | None


class FalhaChamada(BaseModel):
    """Uma tentativa que falhou mesmo depois das repetições automáticas do SDK."""

    persona_id: str
    versao: str
    rodada: int
    mensagem: str  # em português, sem chave nem dado sensível


class TelaRegistro(BaseModel):
    versao: str
    arquivo: str
    sha256: str  # impressão digital da imagem: prova qual tela foi avaliada


class Metadados(BaseModel):
    versao_contrato: str = VERSAO_CONTRATO
    rotulo: Literal["SIMULAÇÃO"] = ROTULO
    modo: Literal["ao_vivo", "demo"]
    provedor: str  # "groq"
    modelo: str  # ID exato do modelo usado
    versao_prompt: str  # "v1", "v2", ..., "v-final"
    inicio: datetime  # com fuso, ex.: 2026-09-26T16:30:00-03:00
    duracao_segundos: float  # medido do início ao fim de simular_vila
    tarefa: str
    rodadas: int
    telas: list[TelaRegistro]
    personas: list[str]  # ids, na ordem escolhida no painel
    chamadas: int  # total pedido: personas × 2 telas × rodadas
    tokens_entrada: int | None = None
    tokens_saida: int | None = None


class Simulacao(BaseModel):
    """O que simular_vila devolve e o que vai para resultados/<id>.json."""

    id: str  # "simulacao-20260926-163000"; o arquivo é resultados/<id>.json
    metadados: Metadados
    resultados: list[ResultadoPersona]
    resumo: list[ResumoPersonaVersao]
    falhas: list[FalhaChamada]


class ErroVila(Exception):
    """Falha que impede a simulação inteira. A mensagem é em português e o painel mostra como está."""
```

Este código foi testado: o exemplo da seção 5 é gerado a partir destes modelos e volta idêntico ao ser lido de novo; o validador recusa `concluiu: false` sem `onde_travou` e `facilidade` fora de 1 a 5.

## 3. A função: `simular_vila` em `vila/motor.py` (M1)

```python
def simular_vila(
    tela_a: Tela,
    tela_b: Tela,
    tarefa: str,
    personas: list[Persona],
    rodadas: int = 3,
    ao_progredir: Callable[[int, int], None] | None = None,
) -> Simulacao: ...
```

| # | Regra | Por quê |
|---|---|---|
| 1 | Faz `len(personas) × 2 × rodadas` chamadas em paralelo (4 × 2 × 3 = 24). | "Pronto quando" da H4 do M1 |
| 2 | `persona_id`, `versao` e `rodada` são preenchidos pelo código, nunca pelo modelo. O modelo responde só `RespostaPersona`. | rastreabilidade: o modelo pode errar um id |
| 3 | `ao_progredir(feitas, total)` é chamado **na thread que chamou `simular_vila`** (no laço de `as_completed`), depois de cada chamada terminar, com ou sem falha. Nunca de dentro das threads de trabalho. | o Streamlit só atualiza a barra de progresso a partir da thread do script |
| 4 | Chamada que falha depois das repetições automáticas do SDK vira uma `FalhaChamada` e as outras seguem. | uma falha não derruba a demo |
| 5 | Levanta `ErroVila` com mensagem em português que diz o que fazer quando: falta a chave; todas as chamadas falharam; entrada inválida (nenhuma persona, `rodadas < 1`, imagem que não é PNG nem JPEG). | o painel mostra `st.error(str(erro))` sem traduzir nada |
| 6 | Antes de devolver, grava `resultados/<id>.json` com `simulacao.model_dump_json(indent=2)`. `id = "simulacao-" + AAAAMMDD-HHMMSS`; se já existir, acrescenta `-2`, `-3`… Nunca sobrescreve. | é o registro e o plano B da demo |
| 7 | `metadados.modo = "ao_vivo"`. O `resultados/demo.json` é a cópia de uma simulação real boa, com `modo = "demo"` (M1, H7). | a banca vê de onde veio cada número |
| 8 | `metadados.duracao_segundos` mede do início ao fim da função. `sha256` é calculado sobre `Tela.imagem`. | H8 do M1 compara o tempo da vila com o das pessoas |
| 9 | A chave vem de `os.getenv("GROQ_API_KEY")`. Nunca aparece em `print`, log, mensagem de erro ou JSON. | regra 1 da constituição |
| 10 | `trava_mais_frequente`: o texto de `onde_travou` que mais se repete; empate, o da menor rodada; nenhum, `None`. | o painel mostra sem recalcular |

## 4. Arquivos

| Arquivo | Quem grava | Formato | Quando |
|---|---|---|---|
| `dados/personas.json` | M1 (texto do M3) | lista de `Persona` | H3 |
| `telas/A.png`, `B.png`, `C.png` | M4 (M1 ou M2 copia) | PNG, proporção 390 × 844 | H2 e H3 |
| `resultados/simulacao-*.json` | a vila | `Simulacao` (`modo: "ao_vivo"`) | a cada simulação |
| `resultados/demo.json` | M1 | `Simulacao` (`modo: "demo"`) | H7 |
| `resultados/decisoes.json` | o painel | lista de `Decisao` (seção 6) | a cada "Salvar decisão"; só acrescenta |
| `painel/mock_resultados.json` | M2 | `Simulacao` (`modo: "demo"`) | H3, até a H5 |

Como ler no painel: `Simulacao.model_validate_json(caminho.read_text(encoding="utf-8"))` e `TypeAdapter(list[Persona]).validate_json(...)`.

## 5. Exemplo

`docs/exemplo-simulacao.json`: 2 personas × 2 versões × 3 rodadas, gerado a partir dos modelos acima. É um **exemplo de formato com dados inventados**, não um resultado da vila (`modelo: "exemplo-sem-modelo"`). Resumo dele:

| Persona | A | B | Leitura pela regra da seção 6 |
|---|---|---|---|
| ana | concluiu 0 de 3 | concluiu 3 de 3 | melhorou (+3) |
| seu-jorge | concluiu 2 de 3 | concluiu 0 de 3 | piorou (−2) |

Uma falha aparece assim em `falhas`:

```json
{"persona_id": "carla", "versao": "B", "rodada": 3, "mensagem": "A Groq recusou por excesso de pedidos. Espere 1 minuto e simule de novo."}
```

## 6. O que é do painel (M2), para o M1 saber

- **Leitura antes × depois**, por persona: `d = concluiu(depois) − concluiu(antes)`, só quando as duas versões têm o mesmo `rodadas` (N). `d ≥ 2`: **melhorou** (verde). `d ≤ −2`: **piorou** (vermelho). Senão: **sinal fraco** (amarelo). N diferente por causa de falha: **incompleto** (cinza), com o convite para simular de novo.
- **Decisão humana** (`painel/`, H4), gravada em `resultados/decisoes.json`:

```python
class Decisao(BaseModel):
    horario: datetime
    quem: Literal["designer", "PO"]  # papel, nunca nome
    simulacao_id: str
    persona_id: str
    comparacao: str  # "A → B"
    leitura: Literal["melhorou", "piorou", "sinal fraco", "incompleto"]
    apontamento: str  # o que a vila apontou (onde travou ou o que não entendeu)
    decisao: Literal["levar ao teste real", "descartar", "já corrigido"]
    comentario: str
```

## 7. Notas para o motor (Groq)

Conferido na documentação oficial da Groq em 26/09/2026. Os itens 1, 3 e 4 foram conferidos duas vezes; os outros, uma vez. A Groq muda rápido: confira de novo antes da H4.

| # | Fato | Fonte | O que muda para nós |
|---|---|---|---|
| 1 | O único modelo com imagem é `qwen/qwen3.8-27b`, listado em "Preview Models", que "may be discontinued at short notice". O anterior, `qwen/qwen3.6-27b`, foi desligado em 14/09/2026. | [1] [2] [3] | `metadados.modelo` grava o ID exato; se o modelo sair do ar, o modo demo salva a apresentação |
| 2 | A imagem vai como `{"type": "image_url", "image_url": {"url": "data:image/png;base64,<...>"}}` dentro de `content`, junto do bloco de texto. Máximo de 3 imagens por requisição. | [1] | uma tela por chamada cabe |
| 3 | "Each image counts as 2048 input tokens." | [1] | 24 chamadas = 49.152 tokens só de imagem |
| 4 | Plano gratuito, `qwen/qwen3.8-27b`: 30 requisições/min, 1.000/dia, 8.000 tokens/min, 200.000 tokens/dia, para a organização inteira. Passou do limite: HTTP 429 com `retry-after`. | [4] | ver "Decisão do time" abaixo |
| 5 | `response_format={"type": "json_object"}` tem exemplo com imagem na doc de visão. `json_schema` com `strict: true` cita o `qwen/qwen3.8-27b`, mas a página se contradiz e não há exemplo com imagem. No strict, todo campo vai em `required`, todo objeto leva `additionalProperties: false`, e nulo vira `["string", "null"]`. Streaming e tools não funcionam com saída estruturada. | [1] [5] | use `json_object` + `RespostaPersona.model_validate_json(...)`; `json_schema` só depois de testar |
| 6 | O SDK `groq` repete sozinho 2 vezes (erro de conexão, 408, 409, 429, ≥500), espera de 0,5 s a 8 s e respeita `retry-after` de até 60 s; timeout padrão de 60 s. Muda com `client.with_options(max_retries=..., timeout=...)`. | [6] | com 24 chamadas de uma vez, muitas esgotam as tentativas |
| 7 | Chave em `GROQ_API_KEY`; o exemplo da doc usa o prefixo `gsk_`. | [7] | o `checar.py` procura `gsk_` |

**Decisão do time (M1 + M2).** Uma simulação completa tem 24 × 2.048 = 49.152 tokens só de imagem. No plano gratuito (8.000 tokens/min), isso leva **no mínimo 6 minutos**, e 200.000 tokens/dia dão **no máximo 4 simulações completas por dia** para a organização inteira (menos, somando o texto). O "pronto quando" da H4 do M1 ("24 chamadas em 1 a 2 min") não fecha no plano gratuito. Opções:

- **A · Plano Developer da Groq (pago):** limites maiores. Os números não foram conferidos, porque a tabela só aparece com login.
- **B · Menos chamadas por simulação:** por exemplo, 2 rodadas ou 3 personas. Mexe na regra de 2 rodadas da leitura.
- **C · Simulações oficiais rodadas antes:** a banca vê o modo demo (`resultados/demo.json`), e ao vivo roda só uma persona.

Em qualquer opção, a vila limita quantas chamadas rodam juntas e espera no 429, e o painel mostra o progresso e o tempo estimado.

Fontes:
1. Groq · Vision — https://console.groq.com/docs/vision
2. Groq · Models — https://console.groq.com/docs/models
3. Groq · Deprecations — https://console.groq.com/docs/deprecations
4. Groq · Rate Limits (aba "Free Plan Limits") — https://console.groq.com/docs/rate-limits
5. Groq · Structured Outputs — https://console.groq.com/docs/structured-outputs
6. groq-python (README e `_constants.py`) — https://github.com/groq/groq-python
7. Groq · Quickstart — https://console.groq.com/docs/quickstart

## 8. Para fechar com o M1 (10 min)

| # | Pergunta | Proposta do M2 |
|---|---|---|
| 1 | As telas chegam como bytes (`Tela.imagem`) ou como caminho? | bytes: upload do painel não tem caminho |
| 2 | O modelo responde só `RespostaPersona`, e o código põe `persona_id`, `versao` e `rodada`? | sim |
| 3 | Quem grava o JSON em `resultados/`? | a vila, antes de devolver |
| 4 | Dá para ter o `ao_progredir`? | sim, chamado na thread do script |
| 5 | `facilidade`: 1 = muito difícil, 5 = muito fácil? | sim |
| 6 | O que é `concluiu`? | deixou o Pix repetindo todo mês e tocaria em Continuar |
| 7 | Falha de uma chamada vai para `falhas` em vez de derrubar tudo? | sim |
| 8 | Mais algum campo que o M1 precise gravar (H7, H8)? | metadados da seção 2 |
