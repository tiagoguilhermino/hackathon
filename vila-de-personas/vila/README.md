# Vila de personas · motor (Membro 1)

Cada persona de IA "tenta" uma tarefa olhando só a imagem de uma tela e devolve um resultado
estruturado, consistente e rastreável. Com 4 personas, 2 versões e 3 rodadas, são 24 tentativas
em paralelo. Todo resultado é **SIMULAÇÃO**: não substitui teste com gente, não aprova design e
não vê dado real.

## Como rodar

Na pasta `backend/`, com o venv do repositório (`..\venv\Scripts\python.exe` no Windows):

```bash
pip install -r requirements.txt
cp .env.example .env          # e preencha ANTHROPIC_API_KEY
python -m vila.autoteste      # confere o encanamento sem gastar crédito
python -m vila.motor          # H2: 1 persona, tela A, 1 rodada, imprime o JSON
python -m vila.motor --vila   # H4: vila completa (A × B), salva em resultados/
```

Outras opções do motor:

| Comando | O que faz |
|---|---|
| `--telas A=telas/A.png B=telas/B.png C=telas/C.png` | escolhe as telas (sem isso, procura `A.png`, `B.png` em `backend/telas/`, `telas/` e por último `vila/amostras/`) |
| `--personas ana,jorge` | ids ou nomes (padrão: todas) |
| `--rodadas 3` | tentativas por persona e versão |
| `--salvar-demo` | grava o resultado também como `resultados/demo.json` |
| `--demo` | mostra `resultados/demo.json` sem chamar a API |
| `--offline` | respostas **falsas**, sem API, só para testar o encanamento |

As telas em `vila/amostras/` são rascunhos do M1 para teste (geradas por `gerar_amostras.py`).
As oficiais são as do M4: coloque `A.png`, `B.png` e `C.png` em `backend/telas/`.

## Contrato com o painel (M2)

Arquivo: `vila/contrato.py`. O painel só depende destes modelos; se algo mudar, M1 e M2 combinam antes.

```python
from vila import simular_vila, mensagem_de_erro, leitura

barra = st.progress(0.0, text="Simulando...")
try:
    sim = simular_vila(
        upload_a, upload_b, tarefa, personas_escolhidas, rodadas=3,   # uploads, caminhos ou bytes
        progresso=lambda feitas, total: barra.progress(feitas / total, text=f"{feitas} de {total}"),
    )
except Exception as erro:
    st.error(mensagem_de_erro(erro))          # mensagem pronta, em português
else:
    for ag in sim.agregados:                  # uma linha por persona × versão
        ...  # ag.persona_nome, ag.versao, ag.texto ("concluiu 2 de 3"), ag.trava_mais_frequente
    antes, depois = sim.agregado("jorge", "A"), sim.agregado("jorge", "B")
    leitura(antes.concluiu, depois.concluiu)  # "melhorou" | "piorou" | "sinal fraco"
```

- Para comparar B × C: `simular_vila(tela_b, tela_c, ..., versoes=("B", "C"))`.
- `personas` aceita `None` (todas), ids (`"jorge"`), nomes (`"Seu Jorge"`) ou dicts.
- `progresso` é chamado na mesma thread de quem chamou, então pode atualizar o Streamlit.
- Toda chamada salva `resultados/<sim.id>.json` (use `salvar=False` para não salvar).
- `sim.rotulo` e `sim.aviso` trazem o texto SIMULAÇÃO para ficar sempre visível.
- Se o app ficar fora de `backend/`, acrescente `backend` ao `sys.path` antes do import.

Campos principais:

| Modelo | Campos |
|---|---|
| `ResultadoPersona` (uma tentativa) | `persona_id`, `versao`, `rodada`, `concluiu`, `passos`, `primeiro_toque`, `hesitou`, `desistiu`, `onde_travou`, `o_que_nao_entendeu`, `texto_da_tela_que_motivou`, `facilidade` (1 a 5) |
| `AgregadoPersonaVersao` (linha da tabela) | `persona_nome`, `versao`, `concluiu`, `rodadas_validas`, `texto`, `trava_mais_frequente`, `primeiro_toque_mais_frequente`, `facilidade_media`, `desistencias`, `hesitacoes`, `falhas` |
| `Simulacao` (o JSON salvo) | `id`, `rotulo`, `aviso`, `carregado_de`, `metadados`, `resultados`, `falhas`, `agregados` |

`primeiro_toque`, `hesitou` e `desistiu` foram acrescentados aos campos do plano para comparar com o
teste do primeiro clique das pessoas (H8).

## Rastreabilidade e modo demo (H7)

Cada simulação registra em `metadados`: modo (`api` ou `offline-teste`), modelo pedido e modelos que
responderam, esforço, versão e hash do prompt, horário de início e fim, duração, tarefa, rodadas,
telas (nome e hash de cada imagem), personas, número de chamadas e falhas, tokens e custo estimado.

Modo demo: com `VILA_MODO_DEMO=1` (ou `carregar_demo()`), o painel carrega `resultados/demo.json` sem
chamar a API; `sim.carregado_de` diz que veio de arquivo. Só resultado real (modo `api`) pode virar
demo: `python -m vila.motor --vila --telas ... --salvar-demo`.

## Versões do prompt (H6)

O prompt fica em `vila/prompt_persona.md`; a primeira linha (`versao: vN`) vai para todo resultado.
Regra: ajustar só clareza e formato. Nunca ajustar para a vila "acertar" o resultado esperado, e
nunca escrever a resposta certa no prompt (o autoteste confere). Congelar como `v-final` antes do
teste com pessoas (H8), junto com o modelo e o esforço.

| Versão | Data | O que mudou | Testada em |
|---|---|---|---|
| v1 | 2026-09-26 | Primeira versão: persona pelo cartão, olhar só a imagem, passo a passo, pode hesitar e desistir, citar o texto da tela, critério de "concluiu". | Encanamento (offline). Falta rodar com a API nas telas do M4. |

## Comparação com as pessoas (H8) e números finais (H9)

1. A cada sessão, passe as notas do M3 para `dados/notas_teste.csv` (separador `;`): `participante`
   (P1…), `versao`, `ordem`, `achou` (sim/não), `primeiro_toque`, `tempo_s`, `dificuldade` (onde
   travou, com o texto da tela; vazio se não travou), `comentario`, `duracao_sessao_min`.
2. `python -m vila.comparacao parear --sim resultados/<sim oficial>.json` (ou `--ia` para o Claude
   sugerir). Abra `resultados/pareamento-<sim>.csv`, confira **cada linha**, corrija
   `classificacao_final` se preciso e escreva `ok` em `conferido`.
3. `python -m vila.comparacao resumo --sim resultados/<sim oficial>.json` grava
   `resultados/numeros-finais.md`, o texto curto para o WhatsApp do M3 e do M4.

Os textos "como a IA funciona" e "principal risco e controle" estão em `vila/texto_tecnico.md`.

## Antes de enviar (H10)

```bash
python -m vila.checar_segredos --historico   # procura sk-ant (e outras chaves) nos arquivos e no git
git tag v-demo && git push origin v-demo     # só depois de congelar a demo
```

## Variáveis de ambiente

Veja `backend/.env.example`. Padrões: `VILA_MODELO=claude-opus-5`, `VILA_ESFORCO=medium`,
`VILA_PARALELO=12`, `VILA_FALLBACK=1` (se a IA recusar, a API refaz no modelo reserva recomendado;
o modelo que respondeu fica nos metadados).
