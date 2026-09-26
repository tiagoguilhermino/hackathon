# Contrato de dados · vila ↔ painel

| Versão | Status | Quem propôs | De acordo |
|---|---|---|---|
| 1.0 | substituída pela 1.1 (o código seguiu outros nomes de campo) | M2, 26/09/2026 (H1) | M1: ☐ · M2: ☑ |
| 1.1 | **descreve o código atual**, aguardando o de acordo do M1 | Claude, a pedido do M2, 26/09/2026 | M1: ☐ · M2: ☑ |

A versão 1.1 foi escrita **a partir do código** (`vila/contrato.py`, `vila/motor.py`, `painel/leitura.py`, `painel/decisoes.py`), não o contrário. Quando o M1 conferir, marque o ☐ e troque o status para **FECHADO**. Mudança depois disso: os dois concordam, a versão sobe e a linha nova entra nesta tabela.

## 1. Quem chama quem

```
painel (app.py, M2) ──simular_vila(...)──▶ vila (vila/motor.py, M1) ──▶ API da Groq
        ▲                                        │
        └────────── Simulacao ◀──────────────────┘   e grava resultados/<id>.json
```

- O painel **só** fala com a vila por `simular_vila`, `carregar_demo`, `carregar_personas`, `listar_simulacoes`, `mensagem_de_erro` e pelos modelos de `vila/contrato.py`. O painel nunca chama a Groq.
- A vila **não importa** `streamlit` e não mostra nada na tela: devolve dados ou levanta `ErroVila`, com mensagem em português.

## 2. Os modelos: `vila/contrato.py` (M1)

| Modelo | Campos |
|---|---|
| `Persona` | `id`, `nome`, `idade`, `resumo`, `familiaridade_digital`, `contexto_de_uso`, `acessibilidade`, `objetivo`, `medo` |
| `RespostaPersona` (o que o modelo preenche, em JSON) | `concluiu` (bool), `passos` (lista), `primeiro_toque`, `hesitou` (bool), `desistiu` (bool), `onde_travou` (texto ou `null`), `o_que_nao_entendeu` (lista), `texto_da_tela_que_motivou` (lista), `facilidade` (1 a 5) |
| `ResultadoPersona` (uma tentativa) | tudo da `RespostaPersona` + `persona_id`, `versao`, `rodada`, **preenchidos pelo código, nunca pelo modelo** |
| `Falha` (tentativa que não voltou) | `persona_id`, `versao`, `rodada`, `erro` (em português, sem chave) |
| `AgregadoPersonaVersao` (uma linha persona × versão) | `persona_id`, `persona_nome`, `versao`, `rodadas_validas` (N), `concluiu` (X), `texto` ("concluiu X de N", com "(k tentativas falharam)" quando houver), `trava_mais_frequente`, `primeiro_toque_mais_frequente`, `facilidade_media`, `desistencias`, `hesitacoes`, `falhas` |
| `TelaInfo` | `versao`, `arquivo`, `sha256` (prova qual imagem foi avaliada) |
| `Metadados` | `modo` (`api` ou `offline-teste`), `modelo`, `modelos_que_responderam`, `esforco`, `temperatura`, `max_tokens`, `versao_prompt`, `sha256_prompt`, `horario_inicio`, `horario_fim`, `duracao_s`, `tarefa`, `rodadas`, `telas`, `personas`, `chamadas`, `falhas`, `tokens_entrada`, `tokens_saida`, `custo_estimado_usd`, `versao_vila` |
| `Simulacao` (o JSON salvo) | `id`, `rotulo` ("SIMULAÇÃO"), `aviso`, `carregado_de` (preenchido quando veio de arquivo), `metadados`, `resultados`, `falhas`, `agregados` |

`temperatura` e `max_tokens` entraram na 1.1 e são opcionais: JSON antigos continuam válidos.

## 3. A função: `simular_vila` em `vila/motor.py` (M1)

```python
def simular_vila(
    tela_a, tela_b,                       # caminho, bytes ou arquivo enviado (upload do Streamlit)
    tarefa: str = TAREFA_PADRAO,
    personas=None,                        # None = todas; ou ids, nomes, dicts ou Persona
    rodadas: int = 3,
    *,
    versoes: tuple[str, str] = ("A", "B"),
    salvar: bool = True,
    offline: bool = False,                # respostas FALSAS, só para testar o encanamento
    progresso=None,                       # progresso(feitas, total)
    modelo=None, esforco=None,
) -> Simulacao: ...
```

| # | Regra | Por quê |
|---|---|---|
| 1 | Faz `len(personas) × 2 × rodadas` chamadas. No plano gratuito da Groq, uma de cada vez (`VILA_PARALELO=1`). | limite de 1.000 tokens de resposta por minuto (seção 7) |
| 2 | `persona_id`, `versao` e `rodada` são preenchidos pelo código; o modelo responde só `RespostaPersona`. | rastreabilidade |
| 3 | `progresso(feitas, total)` é chamado na thread de quem chamou, depois de cada tentativa, com ou sem falha. | o Streamlit só atualiza a barra da thread do script |
| 4 | Tentativa que falha depois das repetições do SDK vira uma `Falha`, e as outras seguem. Se **todas** falharem, levanta `ErroVila`. | uma falha não derruba a demo |
| 5 | Levanta `ErroVila` em português quando: falta a chave; todas as tentativas falharam; entrada inválida (nenhuma persona, `rodadas < 1`, imagem que não é PNG nem JPEG, maior que 5 MB). | o painel mostra `mensagem_de_erro(erro)` |
| 6 | Grava `resultados/<id>.json`, com `id = "sim-AAAAMMDD-HHMMSS-xxxxxx"`. | é o registro e o plano B |
| 7 | Com `VILA_MODO_DEMO=1`, devolve o `resultados/demo.json` sem chamar a API. | demo sem internet |
| 8 | O `demo.json` só pode vir de uma simulação real (`modo = "api"`): `python -m vila.motor --vila ... --salvar-demo`. | a banca vê de onde veio cada número |
| 9 | A chave vem de `GROQ_API_KEY` e nunca aparece em `print`, log, mensagem de erro ou JSON. | regra 1 da constituição |
| 10 | `trava_mais_frequente`: o `onde_travou` que mais se repete (sem diferenciar acento e maiúsculas); empate, o que apareceu primeiro; nenhum, `None`. | o painel mostra sem recalcular |

## 4. Arquivos

| Arquivo | Quem grava | Formato |
|---|---|---|
| `dados/personas.json` | M1 (texto do M3) | `{"versao", "origem", "aviso", "personas": [Persona, ...]}`; o motor também aceita a lista pura |
| `telas/A.png`, `B.png`, `C.png` | prints do frontend Lume (`telas/LEIA-ME.md`) | PNG 780 × 1688 (celular 390 × 844 em dobro) |
| `resultados/sim-*.json` | a vila | `Simulacao` |
| `resultados/demo.json` | a vila (`--salvar-demo`) | `Simulacao`, `modo: "api"` |
| `resultados/decisoes.json` | o painel ("Salvar decisões") | lista de `Decisao` (seção 6); só cresce |
| `resultados/pareamento-<id>.csv`, `resultados/numeros-finais.md` | `python -m vila.comparacao` | comparação com o teste com pessoas |
| `painel/mock_resultados.json` | M2 | exemplo antigo para montar o painel sem a vila |

## 5. Exemplo

O formato real está em `resultados/demo.json` (simulação oficial). O `docs/exemplo-simulacao.json` foi gerado com os modelos da versão 1.0 e está desatualizado.

## 6. O que é do painel (M2)

- **Leitura antes × depois** (`painel/leitura.py`), por persona:
  - se as duas versões **não têm o mesmo número de rodadas válidas** (alguma chamada falhou) ou têm zero, a leitura é **incompleto** (cinza), com o convite para simular de novo;
  - senão, com `d = concluiu(depois) − concluiu(antes)`: se `d ≥ 2`, **melhorou** (verde); se `d ≤ −2`, **piorou** (vermelho); senão, **sinal fraco** (amarelo).
- **Decisão humana** (`painel/decisoes.py`), gravada em `resultados/decisoes.json`:

```python
class Decisao(BaseModel):
    horario: datetime
    quem: Literal["designer", "PO"]  # papel, nunca nome
    simulacao_id: str
    persona_id: str
    comparacao: str  # "A → B"
    leitura: Literal["melhorou", "piorou", "sinal fraco", "incompleto"]
    apontamento: str  # o que a vila apontou (onde travou)
    decisao: Literal["levar ao teste real", "descartar", "já corrigido"]
    comentario: str
```

O painel só acrescenta ao arquivo (grava num temporário e troca de uma vez). Se o arquivo estiver ilegível, avisa e não grava por cima.

## 7. Notas para o motor (Groq)

| # | Fato | Fonte | O que muda para nós |
|---|---|---|---|
| 1 | O único modelo com imagem é `qwen/qwen3.8-27b`, em "Preview Models" (pode sair do ar). | [1] [2] [3] | `metadados.modelo` grava o ID; o `demo.json` salva a apresentação se o modelo sair |
| 2 | A imagem vai como `{"type": "image_url", "image_url": {"url": "data:image/png;base64,<...>"}}`, junto do texto. Cada imagem conta como 2.048 tokens de entrada. | [1] | uma tela por chamada |
| 3 | Modelos que raciocinam, com `response_format` JSON, exigem `reasoning_format` `hidden` ou `parsed`; senão o raciocínio vem no texto, entre `<think>`. | [4] | o motor manda `reasoning_format="hidden"` e `reasoning_effort` |
| 4 | **Medido em 26/09/2026, plano gratuito:** 8.000 tokens por minuto, 1.000 pedidos por dia e **1.000 tokens de resposta por minuto (OTPM)** para este modelo. Pedido que "espera" mais que o OTPM é recusado sempre ("Request too large"). | cabeçalhos e erro 429 da API | esforço `none`, teto de 1.000 tokens e uma chamada de cada vez: cerca de 1 a 1,5 tentativa por minuto |
| 5 | O SDK `groq` repete sozinho em 429 e respeita o `retry-after`. | [5] | `VILA_TENTATIVAS=10` |

**Decisão (opção C do plano):** a simulação oficial roda antes e vira `demo.json`; na apresentação, a banca vê o resultado salvo, e ao vivo roda no máximo uma persona.

Fontes:
1. Groq · Vision — https://console.groq.com/docs/vision
2. Groq · Models — https://console.groq.com/docs/models
3. Groq · Deprecations — https://console.groq.com/docs/deprecations
4. Groq · Reasoning — https://console.groq.com/docs/reasoning
5. groq-python — https://github.com/groq/groq-python
