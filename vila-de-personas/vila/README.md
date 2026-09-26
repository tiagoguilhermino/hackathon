# Vila de personas · motor (Membro 1)

Cada persona de IA "tenta" uma tarefa olhando só a imagem de uma tela e devolve um resultado
estruturado, consistente e rastreável. Com 4 personas, 3 telas (A, B e C) e 3 rodadas, são 36
tentativas. Todo resultado é **SIMULAÇÃO**: não substitui teste com gente, não aprova design e
não vê dado real.

## Como rodar

Na pasta `vila-de-personas/`, com o ambiente ativado (veja o `README.md` do app):

```bash
pip install -r requirements.txt
cp .env.example .env          # e cole a chave em GROQ_API_KEY
python -m vila.autoteste      # confere o encanamento sem gastar crédito
python -m vila.motor --telas B=telas/B.png --personas jorge   # 1 chamada: testa a IA
python -m vila.motor --vila --telas A=telas/A.png B=telas/B.png C=telas/C.png --salvar-demo
```

Outras opções do motor:

| Comando | O que faz |
|---|---|
| `--telas A=telas/A.png B=telas/B.png C=telas/C.png` | escolhe as telas (sem isso, procura `A.png` e `B.png` em `telas/` e, por último, em `vila/amostras/`) |
| `--personas ana,jorge` | ids ou nomes (padrão: todas) |
| `--rodadas 3` | tentativas por persona e versão |
| `--salvar-demo` | grava o resultado também como `resultados/demo.json` (só resultado real, do modo api) |
| `--demo` | mostra `resultados/demo.json` sem chamar a API |
| `--offline` | respostas **falsas**, sem API, só para testar o encanamento |

As telas oficiais estão em `telas/` (prints do frontend do banco fictício Lume; veja `telas/LEIA-ME.md`).
As de `vila/amostras/` são rascunhos antigos do M1 para teste.

## Modelo, plano gratuito da Groq e configuração congelada

O único modelo da Groq que lê imagem é o `qwen/qwen3.8-27b` (em prévia: pode sair do ar; por isso
existe o `demo.json`). O plano gratuito limita este modelo a **1.000 tokens de resposta por minuto**
(OTPM) e **recusa** qualquer pedido que espere mais que isso: tentar de novo não adianta. Medido em
26/09/2026: com raciocínio `medium`, uma resposta usou 1.386 tokens e os pedidos seguintes foram
recusados; sem raciocínio, 439 tokens.

Configuração congelada com o prompt `v-final` (fica gravada nos metadados de cada simulação):

| Variável | Valor | Por quê |
|---|---|---|
| `VILA_MODELO` | `qwen/qwen3.8-27b` | único modelo com imagem na Groq |
| `VILA_ESFORCO` | `none` | sem raciocínio, a resposta cabe no limite de 1.000 tokens por minuto |
| `VILA_TEMPERATURA` | `0.6` | faixa recomendada pela Groq (0,5 a 0,7); com 0,1 as 3 rodadas saíam quase iguais |
| `VILA_MAX_TOKENS` | `1000` | teto por pedido; acima disso o plano gratuito recusa |
| `VILA_PARALELO` | `1` | uma chamada de cada vez: cerca de 1 tentativa por minuto |
| `VILA_TENTATIVAS` | `10` | o SDK espera o tempo pedido pela Groq (retry-after) entre as tentativas |

No plano pago (Dev Tier) dá para subir o esforço, o teto e o paralelismo, mas isso muda os
resultados: registre na tabela de versões abaixo.

## Contrato com o painel (M2)

Arquivo: `vila/contrato.py`. O painel só depende destes modelos; se algo mudar, M1 e M2 combinam antes
e atualizam o `docs/contrato-de-dados.md`.

```python
from vila.motor import simular_vila, mensagem_de_erro

barra = st.progress(0.0, text="Simulando...")
try:
    sim = simular_vila(
        tela_a, tela_b, tarefa, ["ana", "jorge"], rodadas=3,   # telas: caminho, bytes ou upload
        versoes=("A", "B"),
        progresso=lambda feitas, total: barra.progress(feitas / total, text=f"{feitas} de {total}"),
    )
except Exception as erro:
    st.error(mensagem_de_erro(erro))          # mensagem pronta, em português
```

- Para comparar B × C: `simular_vila(tela_b, tela_c, ..., versoes=("B", "C"))`.
- `personas` aceita `None` (todas), ids (`"jorge"`), nomes (`"Seu Jorge"`) ou dicts.
- `progresso` é chamado na mesma thread de quem chamou, então pode atualizar o Streamlit.
- Toda chamada salva `resultados/<sim.id>.json` (use `salvar=False` para não salvar).
- `sim.rotulo` e `sim.aviso` trazem o texto SIMULAÇÃO para ficar sempre visível.
- A leitura antes × depois com "incompleto" (quando alguma chamada falhou) fica no painel, em
  `painel/leitura.py`; `vila.contrato.leitura` só compara números de rodadas concluídas.

Campos principais:

| Modelo | Campos |
|---|---|
| `ResultadoPersona` (uma tentativa) | `persona_id`, `versao`, `rodada`, `concluiu`, `passos`, `primeiro_toque`, `hesitou`, `desistiu`, `onde_travou`, `o_que_nao_entendeu`, `texto_da_tela_que_motivou`, `facilidade` (1 a 5) |
| `AgregadoPersonaVersao` (linha da tabela) | `persona_nome`, `versao`, `concluiu`, `rodadas_validas`, `texto`, `trava_mais_frequente`, `primeiro_toque_mais_frequente`, `facilidade_media`, `desistencias`, `hesitacoes`, `falhas` |
| `Simulacao` (o JSON salvo) | `id`, `rotulo`, `aviso`, `carregado_de`, `metadados`, `resultados`, `falhas`, `agregados` |

`primeiro_toque`, `hesitou` e `desistiu` foram acrescentados aos campos do plano para comparar com o
teste do primeiro clique das pessoas.

## Rastreabilidade e resultado salvo

Cada simulação registra em `metadados`: modo (`api` ou `offline-teste`), modelo pedido e modelos que
responderam, esforço, temperatura, teto de tokens, versão e hash do prompt, horário de início e fim,
duração, tarefa, rodadas, telas (nome e hash de cada imagem), personas, número de chamadas e falhas e
tokens.

O painel carrega qualquer resultado salvo pelo botão "Carregar resultado salvo", sem chamar a API;
`sim.carregado_de` diz que veio de arquivo. Com `VILA_MODO_DEMO=1`, o botão "Simular com a IA"
também devolve o `demo.json` em vez de chamar a API. Só resultado real (modo `api`) pode virar
`demo.json`.

## Versões do prompt

O prompt fica em `vila/prompt_persona.md`; a primeira linha (`versao: ...`) vai para todo resultado.
Regra: ajustar só clareza e formato. Nunca ajustar para a vila "acertar" o resultado esperado, e
nunca escrever a resposta certa no prompt (o autoteste confere). O prompt congela **antes** do teste
com pessoas.

| Versão | Data | O que mudou | Testada em |
|---|---|---|---|
| v1 | 26/09/2026 | Primeira versão: persona pelo cartão, olhar só a imagem, passo a passo, pode hesitar e desistir, citar o texto da tela, critério de "concluiu". | Encanamento (offline). |
| v-final | 26/09/2026, ~20h35 | Texto igual ao v1. Congelado com `qwen/qwen3.8-27b`, esforço `none`, temperatura 0,6 e teto de 1.000 tokens (limites do plano gratuito da Groq). | API real, tela B oficial: Seu Jorge (esforço medium) e Ana (esforço none). Nos dois casos a persona não viu o ícone de repetir e não concluiu. |

## Comparação com as pessoas e números finais

1. Passe as notas do teste com pessoas para `dados/notas_teste.csv` (vírgula ou ponto e vírgula):
   `participante` (P1…), `versao`, `ordem`, `achou` (sim/não), `primeiro_toque`, `tempo_s`,
   `dificuldade` (onde travou, com o texto da tela; vazio se não travou), `comentario`,
   `duracao_sessao_min`.
2. `python -m vila.comparacao parear --sim resultados/demo.json`. Abra
   `resultados/pareamento-<sim>.csv`, confira **cada linha**, corrija `classificacao_final` se
   preciso e escreva `ok` em `conferido`. A opção `--ia` ainda usa a API da Anthropic e não funciona
   com a configuração da Groq: use a sugestão por regra.
3. `python -m vila.comparacao resumo --sim resultados/demo.json` grava `resultados/numeros-finais.md`,
   o texto curto para o WhatsApp do time.

Os textos "como a IA funciona" e "principal risco e controle" estão em `vila/texto_tecnico.md`.

## Antes de enviar

```bash
python -m vila.checar_segredos --historico   # procura chaves nos arquivos e no histórico do git
git tag v-final && git push origin v-final   # só depois de congelar a demo
```
