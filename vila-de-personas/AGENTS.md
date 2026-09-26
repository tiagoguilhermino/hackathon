# Constituição do repositório vila-de-personas

> Fonte única das regras deste repositório. O Antigravity lê este arquivo direto; o Claude Code lê via `CLAUDE.md`, que só importa este aqui.
> Limite do Antigravity: 12.000 caracteres por arquivo de regra. Se crescer, mova um bloco para `.agents/rules/<nome>.md` e importe o mesmo arquivo no `CLAUDE.md`. Nunca escreva a mesma regra em dois arquivos.

## 01 · Projeto

- **Hackathon Itaú 2026 · Case C · Vila de personas.** O designer sobe duas versões de uma tela; cada persona de IA tenta a tarefa 3 vezes; o painel mostra antes × depois; o designer ou o PO decide o que levar ao teste com pessoas reais, e tudo fica registrado.
- **Recorte (versão da proposta; o M3 fecha a frase final na H1, troque aqui quando chegar):** "Queremos ajudar o designer e o PO de uma squad a avaliar uma mudança de design antes de levá-la a clientes, quando a squad está iterando uma tela do app, porque hoje cada rodada de teste com usuários leva tempo e problemas óbvios só aparecem nela. Saberemos que ajudamos se a vila apontar os mesmos pontos de fricção que pessoas reais apontam, em muito menos tempo."
- **Tarefa da demo:** agendar um Pix que se repete todo mês. Tela A: "Repetir" escondido em "Mais opções". B: ícone sem texto. C: ícone com "Repetir todo mês".
- **Stack:** Python + Streamlit + API da Groq (chave `GROQ_API_KEY`). O modelo é escolha do M1 e precisa ler imagem.
- **Quem usa este repositório:** M1 (motor da vila) e M2 (painel, publicação e vídeo), cada um no seu computador. M3 e M4 trabalham offline e mandam arquivos por WhatsApp, pen drive ou AirDrop.

## 02 · Quem mexe em quê

| Caminho | Dono | Regra |
|---|---|---|
| `app.py`, `painel/` | M2 | o painel só fala com a vila por `simular_vila` e pelos modelos de `vila/contrato.py` |
| `vila/` (`contrato.py`, `motor.py`, `prompt_persona.md`) | M1 | M2 só lê e importa |
| `dados/personas.json` | M1 (texto vem do M3) | o painel só lê |
| `telas/A.png`, `B.png`, `C.png` | M4 (M1 ou M2 copia para cá) | ninguém edita imagem; versão nova é arquivo novo |
| `telas/provisorias/` | M2 | só até as telas do M4 chegarem |
| `resultados/simulacao-*.json`, `resultados/demo.json` | M1 (a vila grava) | é o registro: nunca editar à mão |
| `resultados/decisoes.json` | M2 (o painel grava) | só o botão "Salvar decisão" escreve, e só acrescenta |
| `docs/contrato-de-dados.md` | M1 e M2 juntos | mudou? os dois concordam e a versão sobe |
| `README.md`, `requirements.txt`, `.gitignore`, `.env.example`, `scripts/` | M2 | M1 pede a inclusão de dependência; a seção "Versões do prompt" do README é do M1 |
| `compartilhado/`, `AGENTS.md` | quem pediu, via agente principal | depois de editar, rode `python3 scripts/sincronizar_agentes.py` |
| `.claude/agents/`, `.agents/agents/`, `…/skills/` | só o script | gerados a partir de `compartilhado/`; nunca editar à mão |

- Um agente trabalhando para uma pessoa nunca escreve nos arquivos de outra. Precisa de mudança num arquivo alheio? Pare e diga o que pedir a quem é o dono.
- Agentes não leem `.env` nem `.streamlit/secrets.toml`.

## 03 · Regras fixas do produto

Valem para todo código, texto de tela, JSON salvo, print e vídeo.

1. **Chave só no `.env`** (local) ou em Secrets (Streamlit Cloud). Nunca no código, no chat, em `print`, em log, na tela ou no vídeo. Antes de cada commit, `python3 scripts/checar.py` procura `gsk_` e `sk-`.
2. **Rótulo SIMULAÇÃO** em todo resultado da vila, visível na tela e gravado no JSON.
3. **Aviso fixo** no topo de toda página: "Protótipo de hackathon · resultados simulados · telas fictícias".
4. **Tudo fictício:** banco fictício, sem logo, nome ou cores do Itaú; nenhum dado pessoal real; nada interno do Itaú. O vídeo e o link são públicos.
5. **A vila não decide.** Quem decide é o designer ou o PO, e a decisão fica em `resultados/decisoes.json` com quem, quando e por quê. O painel nunca marca uma decisão sozinho.
6. **Sinal fraco não vira conclusão.** Diferença de 2 rodadas ou mais entre versões: "melhorou" (verde) ou "piorou" (vermelho). De 1 ou menos: "sinal fraco" (amarelo). Toda linha mostra "concluiu X de N".
7. **Prompt não é calibrado para acertar** o resultado que o time espera. Cada versão (v1, v2… v-final) vai para o README, e a versão usada fica gravada em cada JSON.
8. **Textos em português**, para uma pessoa não técnica entender em 10 segundos. Mensagem de erro diz o que aconteceu e o que fazer.
9. **Números como foram medidos**, sem arredondar a favor. Não chame simulação de evidência: a vila gera hipóteses para o teste com pessoas.
10. **O contrato manda.** Nomes de campo, arquivos e a assinatura de `simular_vila` estão em `docs/contrato-de-dados.md`. Código que foge dele está errado, mesmo funcionando.

## 04 · Rodar e conferir

- Rodar: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`, copie `.env.example` para `.env`, preencha a chave e rode `streamlit run app.py`.
- Conferir: `python3 scripts/checar.py`. Ele abre o app sem navegador, confere as pastas, o `.gitignore`, o aviso fixo e procura chave vazada. Só faça commit com tudo OK.
- Commit pequeno no fim de cada hora, com a hora na mensagem (ex.: `H2: tela de entrada`). O `git push` é feito pela pessoa, nunca pelo agente.

## 05 · Pipeline do painel (M2)

Três papéis. Eles não conversam entre si: o agente principal passa o texto de um para o outro.

| Agente | Faz | Não faz |
|---|---|---|
| `construtor-painel` | implementa UMA tarefa do plano em `app.py` e `painel/` e roda `scripts/checar.py` | não mexe em arquivo de outro dono, não muda o contrato |
| `revisor-painel` | confere a tarefa contra o "pronto quando", o contrato e a seção 03; devolve placar e encaminhamento | não edita, não roda nada |
| `revisor-textos` | lista trocas de texto de tela (H7 e sempre que mudar texto) | não edita |

**Fase 1 · construir.** Invoque o `construtor-painel` com:

```
TAREFA: Hn · <título do plano>
PRONTO QUANDO: <critério do plano, literal>
FOCO: <opcional>
```

**Fase 2 · conferir.** Rode `python3 scripts/checar.py`. Falhou? Volte ao construtor com a saída do script.

**Fase 3 · revisar.** Invoque o `revisor-painel` com `TAREFA`, `PRONTO QUANDO` e `RODADA: N` (1 na primeira vez). Salve a resposta sem alterar em `docs/revisoes/Hn.md` (rodada nova é acrescentada embaixo). Leia só a linha `ENCAMINHAMENTO:`.

| Primeira palavra | O que fazer |
|---|---|
| `APROVADO` | avisar a pessoa e sugerir a mensagem de commit |
| `CONSTRUTOR` | reinvocar o construtor com `CORREÇÃO: itens <lista>`; depois o revisor com `RODADA: N+1` |
| `HUMANO` | parar e mostrar o motivo: falta decisão ou arquivo de outra pessoa |

- Teto de 3 rodadas; na rodada 3 com falha, o revisor encaminha `HUMANO`.
- Anti-regressão: a correção mexe só no item apontado.
- O agente principal não corrige código dentro do loop; quem corrige é o construtor. Fora do loop, só quando a pessoa pedir.
- Textos (H7): o `revisor-textos` devolve a tabela, a pessoa escolhe as linhas e o construtor aplica só essas.

**Plano do M2 (resumo; o "pronto quando" completo está no plano do time):**

| Hora | Tarefa | Pronto quando |
|---|---|---|
| H1 | Repositório e esqueleto | repo no GitHub com as 6 pastas, README, `.env` no `.gitignore`, `streamlit run app.py` abre |
| H2 | Tela de entrada | tarefa, versões A e B (upload ou `telas/`), personas marcadas, telas lado a lado, botão Simular |
| H3 | Antes × depois com dados falsos | com `painel/mock_resultados.json` no formato do contrato: tabela persona × versão e leitura melhorou/piorou/sinal fraco |
| H4 | Revisão humana e registro | por apontamento: "levar ao teste real", "descartar" ou "já corrigido" + comentário; "Salvar decisão" grava `resultados/decisoes.json`; histórico na tela |
| H5 | Integrar com a vila (com o M1) | Simular chama `simular_vila` de verdade, com progresso e erro em português |
| H6 | Ciclo A → B → C | sobe a C e compara sem perder o histórico, escolhendo quais duas versões |
| H7 | Polimento com o M3 | ajustes do M3 aplicados; aviso fixo; "3 de 3 rodadas" explicado na tela |
| H8 | Publicar o link | Streamlit Community Cloud no ar, modo demo público, ao vivo atrás de senha; testado em janela anônima e no celular |
| H9 | Prints e vídeo (com o M4) | 4 a 6 prints entregues; vídeo de até 2:00 público no YouTube, sem chave nem dado real |
| H10 | Ensaio | demo ensaiada 3 vezes em até 75 s, com o vídeo aberto como contingência |

## 06 · Glossário

| Termo | Significado |
|---|---|
| Vila | as personas de IA rodando juntas sobre as mesmas telas |
| Persona | perfil fictício de cliente, descrito por comportamento, não por estereótipo |
| Rodada | uma tentativa de uma persona numa versão; são 3 por persona e versão |
| Versão | uma imagem de tela (A, B, C…) |
| Apontamento | o que a vila diz que travou ou confundiu uma persona numa versão |
| Revisão humana | ponto em que designer ou PO decide o que fazer com um apontamento |
| Modo demo | o painel carrega `resultados/demo.json` sem chamar a API |
| Acerto · ponto cego · alarme falso | a vila e as pessoas acharam · só as pessoas acharam · só a vila apontou (teste da H8) |
