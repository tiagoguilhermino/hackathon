# Vila de personas · onde estamos e o que falta

> Hackathon Itaú 2026 · Case C · Jornada de agentes.
> Avaliação feita em **26/09/2026, por volta das 17h40**, olhando o que está no repositório (até o commit `c2b8a90`, que já traz as correções desta revisão).
> Base: o **Guia dos Participantes** (as 4 entregas e o checklist "Confiram antes de enviar"), o **plano do time** (2 pessoas online, 2 offline, tarefas H1 a H10) e o guia **"Como montar seus agentes"** (apêndice no fim).

**Legenda:** ✅ feito · ⚠️ feito em parte · ❌ não feito · ❓ não está no repositório. O M3 e o M4 trabalham sem internet no computador, então o que eles fizeram pode existir fora daqui: confirme com eles.

---

## Atualização de 26/09/2026, ~21h: M1 e M2 feitos

O que mudou desde a avaliação abaixo:

| Item | Situação |
|---|---|
| Telas oficiais A, B e C | ✅ tiradas do frontend Lume, em `vila-de-personas/telas/` (veja o `LEIA-ME.md` de lá) |
| A vila roda com a IA de verdade | ✅ `qwen/qwen3.8-27b` pela Groq, ajustado ao limite do plano gratuito (1.000 tokens de resposta por minuto) |
| Prompt congelado | ✅ `v-final`, antes do teste com pessoas |
| Simulação oficial e `demo.json` real | ✅ 36 chamadas, 0 falhas, cerca de 20 min. A e B: 0 de 3 para as 4 personas; C: 3 de 3 para todas |
| Números fictícios | ✅ removidos; o texto técnico só tem números medidos, e o resto fica entre [colchetes] |
| Painel: decisão humana por persona (quem, simulação, leitura, apontamento, porquê) e histórico | ✅ |
| Painel: escolher personas e usar as telas prontas; "Como ler este resultado" | ✅ |
| Contrato de dados 1.1 e README da vila | ✅ descrevem o código atual (falta o "de acordo" do M1) |
| Pesquisa consolidada e revisada (`backend/pesquisa/output/00-*.md`) | ✅ 26 evidências conferidas contra os originais |
| **Falta** | teste com 3 a 5 pessoas nas mesmas telas (Passo 8) → comparação e números (Passo 9) → ficha (Passo 10) → link público (Passo 11) → vídeo e slides |

**Para a apresentação:** na vila, as 4 personas se comportaram igual. Nem a Ana, que "costuma tentar ícones", achou o ⋯ da A ou o ícone da B. Isso bate com a evidência [5] da pesquisa consolidada (a IA "achata" diferenças entre perfis). O teste com pessoas vai mostrar se é uma dificuldade real ou um ponto cego da vila. Nos dois casos, é resultado para contar.

**Para o frontend (Iury):**
- no botão "Repetir este Pix" (versão B), trocar `text-accent-foreground` por `text-accent`: hoje o ícone está branco sobre branco;
- tirar "Itaú Unibanco" e "Nubank" dos contatos de teste antes do vídeo.

---

## 0. Urgente: fazer antes de qualquer outra coisa

1. **Revogar a chave do Devin que vazou.** Ela estava escrita em `docs/publicacao.md` e foi para o GitHub no commit `b1c7a03` ("H9: Adicionado roteiro demo…"). Esta revisão tirou a chave do arquivo, mas ela continua no histórico do git. O repositório é privado, mas quem tem acesso a ele consegue ver a chave.
   - Entre na conta do Devin, vá à área de chaves de API ("API keys"), **revogue** a chave que começa com `cog_` e crie outra.
   - A chave nova só pode ficar no arquivo `.env` do seu computador ou no campo Secrets do Streamlit. Nunca em arquivo do repositório, chat, print ou vídeo.
2. **Não usar os "números finais" que estão no repositório.** São todos fictícios:
   - `vila-de-personas/resultados/demo.json` foi gerado no **modo offline**, com respostas falsas de teste ("[OFFLINE] elemento X", duração de 0,2 s);
   - `vila-de-personas/dados/notas_teste.csv` é **cópia do arquivo de exemplo** do autoteste, com participantes "EX1" e "EX2" marcados "EXEMPLO FICTÍCIO";
   - por isso, "0 acertos, 2 pontos cegos, 6 alarmes falsos", "levaram 0 s" e "22 min (medido)", em `resultados/numeros-finais.md` e `vila/texto_tecnico.md`, **não foram medidos**.

   Se isso entrar nos slides ou na ficha, o time estaria apresentando resultado inventado, que é justamente o que o guia proíbe ("Não inventem resultados") e o que a banca avalia na competência **Dados**. O Passo 4 explica como limpar.

---

## 1. Resumo em 1 minuto

| Entrega do guia | Situação | O que falta |
|---|---|---|
| **Protótipo funcional** | ⚠️ | O painel funciona e foi testado sem internet. A simulação **nunca rodou com a IA de verdade**: o modelo antigo tinha saído do ar, e esta revisão corrigiu isso. Falta rodar ao vivo, gravar um resultado salvo **real** e publicar o link. |
| **Apresentação (até 10 slides)** | ❓ | Não está no repositório. |
| **Demo narrada (até 2 min, YouTube público)** | ❌ | O roteiro está pronto em `vila-de-personas/docs/roteiro-demo.md`. Falta gravar e publicar. |
| **Ficha do Produto (até 2 páginas)** | ❓ | Não está no repositório. O texto técnico (`vila/texto_tecnico.md`) está pronto, mas com números fictícios. |
| Teste com pessoas | ❌ | As notas atuais são o arquivo de exemplo. |
| Evidências (pesquisa) | ⚠️ | São 5 pesquisas muito boas em `backend/pesquisa/output/`, com fonte em cada item e evidências **contra** a ideia do time. Não foram consolidadas nem revisadas. |

**Ordem do que falta:** Passos 1 a 9 (seção 4) põem o protótipo de pé com dados reais. Passos 10 a 13 são as entregas (slides, ficha, vídeo, link). Passos 14 e 15 são o envio e o ensaio.

---

## 2. Avaliação pelo Guia dos Participantes

### 2.1 As quatro entregas

**Protótipo funcional ou MVP.** O guia pede uma tarefa completa, com entrada, ação e resultado, mais o link ou as instruções para rodar.
- ✅ Entrada: tarefa, duas telas e botão "Simular com a IA".
- ✅ Resultado: tabela antes × depois por persona, com "concluiu X de 3", onde travou e leitura (melhorou, piorou, sinal fraco ou incompleto). O rótulo SIMULAÇÃO e o aviso fixo aparecem sempre.
- ✅ Plano B: botão "Carregar resultado salvo", que mostra uma simulação gravada sem chamar a IA. Se o arquivo for de teste offline, a tela mostra um alerta vermelho.
- ✅ Instruções para rodar: `vila-de-personas/README.md`.
- ⚠️ Revisão humana: existe, mas é uma decisão só para tudo e não grava **quem** decidiu (designer ou PO) nem **qual simulação**.
- ❌ Nunca rodou com a IA de verdade, não há resultado salvo real e o link não foi publicado.

**Apresentação de até 10 slides**, com os 6 blocos: equipe, case e dor · evidências · solução e jornada · o que foi construído e testado · métrica, risco e escala · próximos passos.
- ❓ Não está no repositório (é tarefa do M3, conteúdo, e do M4, visual).
- Material pronto para usar: a pesquisa em `backend/pesquisa/output/` (bloco 2), o `vila/texto_tecnico.md` (blocos 3 e 5, depois de trocar os números) e o `roteiro-demo.md` (bloco 4).

**Demo narrada de até 2 minutos** (vídeo público no YouTube).
- ⚠️ Roteiro: `vila-de-personas/docs/roteiro-demo.md` e `docs/roteiro_final.md`.
- ❌ Gravação e publicação.

**Ficha do Produto de até 2 páginas** (mini press release de 100 a 150 palavras + 5 perguntas e respostas).
- ❓ Não está no repositório (tarefa do M3).

### 2.2 Checklist "Confiram antes de enviar" do guia

| Item do guia | Situação |
|---|---|
| Equipe e case identificados; quatro entregas presentes e dentro dos limites | ❌ faltam slides, vídeo e ficha |
| Fluxo principal testado; resultados, limitações e simulações explicados | ⚠️ testado só sem internet; falta rodar com a IA e testar com pessoas |
| Apresentação com até 10 slides e vídeo com até 2 min | ❓ / ❌ |
| Ficha com até 2 páginas, com press release e 5 perguntas e respostas | ❓ |
| Links abrem; Canva com visualização; vídeo público; solução demonstrável | ❌ |
| Sem segredos, informação interna do banco ou dado pessoal real nos materiais públicos | ⚠️ chave do Devin vazou no repositório privado (item 0.1); ver também o `Frontend/` na seção 5 |
| Arquivos e links salvos na plataforma, com confirmação de recebimento, antes do prazo | ❌ |

### 2.3 As 8 competências da banca: o que já sustenta cada uma

| Competência | Temos | Falta |
|---|---|---|
| Resolução de Problemas | dor e recorte escritos; a tarefa do Pix que se repete | frase-guia final do M3 e confirmação da dor com os itubers |
| Centralidade no Cliente | 4 personas por comportamento | teste com pessoas reais |
| Uso Crítico de IA | rótulo SIMULAÇÃO, prompt que não entrega a resposta, pesquisa com evidências contra a ideia | comparação **real** vila × pessoas |
| Dados | registro completo de cada simulação (modelo, prompt, telas, horário) | números medidos, e não os fictícios de agora |
| Escalabilidade | limites da Groq documentados em `docs/contrato-de-dados.md` | dizer no slide 5 o que muda para operar com mais gente (plano pago, custo) |
| Gestão de Risco | decisão humana registrada; plano B | gravar **quem** decidiu (seção 5) |
| Colaboração | plano com dono para cada parte | cada pessoa saber explicar sua parte no ensaio |
| Storytelling | roteiros de demo e pitch | slides e vídeo |

---

## 3. Avaliação pelo plano do time (H1 a H10)

### Membro 1 · Motor da vila e pesquisa (computador com internet)

| Hora | Tarefa | Situação | Evidência |
|---|---|---|---|
| H1 | Pesquisa, contrato e ambiente | ⚠️ | 5 pesquisas em `backend/pesquisa/output/`; `vila/contrato.py` pronto. A pesquisa não foi consolidada nem revisada ("Verificação: pendente"). |
| H2 | Uma persona, uma tela, uma rodada | ✅ | O código existe. Nunca rodou com a IA (o modelo antigo saiu do ar; corrigido). |
| H3 | Personas em JSON e prompt | ⚠️ | Prompt v1 pronto; as personas ainda são as provisórias do M1 (`"versao": "provisoria-m1"`). |
| H4 | Vila completa, com consistência | ✅ | Testada sem internet: autoteste passa inteiro. |
| H5 | Integrar com o painel | ✅ | O painel chama `simular_vila`. |
| H6 | Calibrar e congelar o prompt | ❌ | O prompt nunca rodou com a IA. |
| H7 | Rastreabilidade e modo demo | ⚠️ | O código está pronto; o `demo.json` atual é **falso**. |
| H8 | Resultados oficiais e comparação | ❌ | Foi feita com dados falsos. |
| H9 | Números finais e texto técnico | ❌ | Os números são fictícios; o texto técnico foi corrigido nesta revisão para citar o modelo certo. |
| H10 | Congelar a demo, enviar, ensaiar | ❌ | A tag `v-demo` existe, mas aponta para uma versão antiga, sem as correções. |

### Membro 2 · Painel, publicação e vídeo (computador com internet)

| Hora | Tarefa | Situação | Evidência |
|---|---|---|---|
| H1 | Repositório e esqueleto | ✅ | `vila-de-personas/` com README, `.gitignore` e `checar.py`. |
| H2 | Tela de entrada | ⚠️ | Tem tarefa, upload das duas telas e botão. Faltam escolher personas e telas pré-carregadas. |
| H3 | Antes × depois com dados falsos | ✅ | `painel/mock_resultados.json`. |
| H4 | Revisão humana e registro | ⚠️ | Uma decisão só; não grava quem nem qual simulação; o histórico só aparece depois de salvar. |
| H5 | Integrar com a vila | ✅ | Com barra de progresso e erro em português. |
| H6 | Ciclo A → B → C | ⚠️ | Funciona escolhendo "Antes" e "Depois" num resultado salvo com A, B e C; não há linha do tempo. |
| H7 | Polimento com o M3 | ⚠️ | Aviso fixo ✅; ajustes do M3 ❓. |
| H8 | Publicar o link | ❌ | O README ainda diz "Link publicado: entra aqui na H8". |
| H9 | Prints e vídeo | ❌ | |
| H10 | Ensaio da demo | ❌ | |

### Membro 3 · Produto, pessoas e textos (computador sem internet + celular)

| Hora | Tarefa | Situação | Evidência |
|---|---|---|---|
| H1 | Frase-guia e temas | ❓ | O `vila-de-personas/AGENTS.md` ainda tem "a versão da proposta; o M3 fecha a frase final". Os temas foram pesquisados. |
| H2 | 4 cartões de persona | ❓ | O app usa as personas provisórias do M1. |
| H3 | Confirmar a dor com os itubers | ❓ | Não há `input/conversas.md`. |
| H4 | Evidências do bloco 2 | ❓ | |
| H5 | Roteiro dos slides | ❓ | |
| H6 | Rascunho da ficha | ❓ | |
| H7 | Usar o app como PO | ❓ | |
| H8 | Anotar o teste com pessoas | ❌ | As notas no repositório são o arquivo de exemplo. |
| H9 | Ficha com os números | ❌ | Ainda não há números reais. |
| H10 | Roteiro do pitch e ensaio | ❓ | |

### Membro 4 · Telas, teste com pessoas e visual (computador sem internet + celular)

| Hora | Tarefa | Situação | Evidência |
|---|---|---|---|
| H1 | Tarefa e as 3 versões | ✅ | Definidas no `vila-de-personas/AGENTS.md`: A com "Repetir" em "Mais opções", B com ícone sem texto, C com ícone e texto. |
| H2–H3 | Telas A, B e C | ❓ | `vila-de-personas/telas/` está vazia. Existem telas provisórias e o app `Frontend/` do banco fictício "Lume", que ainda não virou as PNGs A, B e C (seção 5). |
| H4 | Protocolo do teste | ❓ | |
| H5 | Recrutar e fazer piloto | ❓ | |
| H6 | Visual dos slides | ❓ | |
| H7 | Roteiro do vídeo | ⚠️ | `roteiro-demo.md` existe. |
| H8 | Conduzir o teste com pessoas | ❌ | |
| H9 | Narrar o vídeo | ❌ | |
| H10 | Slides finais, checklist e ensaio | ❌ | |

### O que esta revisão já corrigiu

Os itens 1 a 5 já estão no GitHub, no commit `c2b8a90` ("feat: atualizações nas telas, painel e roteiros"). O item 6 vai junto com este documento.

1. O modelo da IA agora é o `qwen/qwen3.8-27b`, o único da Groq que lê imagem (o anterior tinha saído do ar), com o raciocínio escondido para a resposta sair em JSON limpo.
2. O botão "Carregar resultado salvo" é o plano B da demo.
3. A leitura "Incompleto" aparece quando alguma chamada à IA falha, em vez de um "piorou" enganoso.
4. A barra lateral não acusa mais um erro falso nas personas.
5. Os textos da ficha, do roteiro e da demo passaram a citar o modelo certo, pedir vídeo público, separar o pitch de 4 min da demo de 75 s e não afirmar resultado sem medir.
6. A chave do Devin saiu do `docs/publicacao.md` (mas precisa ser revogada: item 0.1).

---

## 4. Passo a passo das tarefas restantes

Cada passo diz **quem faz**, **quanto tempo leva**, **se precisa de internet**, **como fazer**, **como saber que ficou pronto** e **o que fazer se der erro**. Os comandos vão num programa chamado **Terminal** (Mac) ou **Prompt de Comando** (Windows): você copia a linha, cola e aperta Enter.

> **Dica para quem não programa:** em qualquer passo, você pode abrir o Claude Code ou o Antigravity na pasta `vila-de-personas` e pedir em português, por exemplo: *"Me guie no Passo 4 do arquivo STATUS-E-PASSO-A-PASSO.md, um comando de cada vez, e explique o que cada um faz."* Nunca cole a chave da API no chat.

### Passo 1 · Preparar o computador para rodar o app (M1 e M2, uma vez, 15 min, com internet)

1. **Abra o terminal já dentro da pasta `vila-de-personas`:**
   - **Mac:** abra o app Terminal, digite `cd ` (com um espaço no fim), **arraste a pasta `vila-de-personas` do Finder para dentro da janela** e aperte Enter.
   - **Windows:** abra a pasta `vila-de-personas` no Explorador de Arquivos, clique na barra de endereço lá em cima, apague o que estiver escrito, digite `cmd` e aperte Enter.
2. Crie o ambiente do Python (só na primeira vez):
   - Mac: `python3 -m venv .venv`
   - Windows: `py -m venv .venv`
3. Ative o ambiente. **Isso é preciso toda vez que abrir um terminal novo:**
   - Mac: `source .venv/bin/activate`
   - Windows: `.venv\Scripts\activate`

   Vai aparecer `(.venv)` no começo da linha.
4. Instale o que o app precisa: `pip install -r requirements.txt` (leva 1 a 3 min).
5. Crie o arquivo da chave:
   - Mac: `cp .env.example .env` e depois `open -e .env`
   - Windows: `copy .env.example .env` e depois `notepad .env`
6. No arquivo que abriu, cole a chave da Groq logo depois de `GROQ_API_KEY=`, sem espaço, e salve. No Mac, arquivos que começam com ponto ficam escondidos no Finder; para vê-los, aperte Cmd+Shift+. (ponto).
7. Teste o painel: `streamlit run app.py`. O navegador abre em `http://localhost:8501`. Para parar, volte ao terminal e aperte Ctrl+C.

**Pronto quando:** o painel abre com o aviso "Protótipo de hackathon · resultados simulados · telas fictícias" e, na barra lateral, "Chave da Groq: Configurada".
**Se der erro:** `python3: command not found` quer dizer que falta instalar o Python (python.org → Downloads, versão 3.12). Um erro no `pip install` costuma ser internet ou Python antigo; peça ajuda ao Claude Code colando a mensagem de erro, **sem** a chave.

### Passo 2 · Trazer a versão mais nova do GitHub (M1 e M2, 2 min, com internet)

1. No terminal, vá para a pasta **acima** de `vila-de-personas` (a raiz do repositório). Mac: `cd ..`. Windows: `cd ..`.
2. Rode `git pull`.
3. Volte para a pasta do app: `cd vila-de-personas`.

**Pronto quando:** aparece "Already up to date" ou a lista de arquivos atualizados.
**Se der erro:** uma mensagem sobre "local changes" quer dizer que você tem mudanças não salvas no git. Peça ao Claude Code: *"Tenho mudanças locais e o git pull falhou. Me mostre o que mudou e me ajude a salvar sem perder nada."*

### Passo 3 · Testar a IA de verdade com 1 chamada só (M1, 5 min, com internet)

1. Com o ambiente ativado, na pasta `vila-de-personas`, rode `python -m vila.motor`.
2. Deve aparecer um bloco de texto em JSON (a resposta da persona Ana para a tela A) e, no fim, uma linha como `(modelo qwen/qwen3.8-27b · 3000 tokens de entrada · 800 de saída)`.
3. **Anote os dois números de tokens.** Some os dois e multiplique por 36: é quanto a simulação oficial do Passo 7 vai gastar (4 personas × 3 telas × 3 rodadas). O plano gratuito da Groq dá cerca de **200.000 tokens por dia** para a conta toda, segundo o `docs/contrato-de-dados.md`. Se a conta passar disso, veja as opções no Passo 7.

**Se der erro:**

| Mensagem | O que fazer |
|---|---|
| "Chave da API não encontrada" | Refaça o Passo 1, itens 5 e 6. |
| "Chave da API inválida" | Gere uma chave nova no site da Groq (console.groq.com) e troque no `.env`. |
| "Modelo não encontrado" | A Groq trocou de modelo. Veja em console.groq.com/docs/vision qual lê imagem e ponha `VILA_MODELO=<nome>` numa linha nova do `.env`. |
| "Limite de uso da API atingido" | Espere 1 minuto e tente de novo. |
| "A resposta da IA foi cortada" | Ponha `VILA_ESFORCO=low` numa linha nova do `.env`. |

### Passo 4 · Limpar os números fictícios (M1, 10 min, sem internet)

1. No Finder ou no Explorador, entre em `vila-de-personas/resultados/` e **apague** estes quatro arquivos:
   - `demo.json`
   - `sim-20260926-172050-18c330.json`
   - `pareamento-sim-20260926-172050-18c330.csv`
   - `numeros-finais.md`
2. Abra `vila-de-personas/dados/notas_teste.csv` num editor de texto (TextEdit ou Bloco de Notas) e **deixe só a primeira linha** (o cabeçalho, que começa com `participante;versao;...`). Salve.
3. No `vila-de-personas/vila/texto_tecnico.md`, troque os números inventados pelos espaços a preencher. Ou peça ao Claude Code: *"No vila/texto_tecnico.md, troque '24 tentativas rodam ao mesmo tempo e levaram 0 s' por '[NÚMERO DE TENTATIVAS] tentativas rodam ao mesmo tempo e levaram [TEMPO MEDIDO]', troque '2 pessoas: 0 acertos, 2 pontos cegos e 6 alarmes falsos' por '[N] pessoas: [X] acertos, [Y] pontos cegos e [Z] alarmes falsos', e faça o mesmo na versão curta para o WhatsApp."*

**Pronto quando:** a pasta `resultados/` só tem o `.gitkeep`, e o texto técnico não tem número que ninguém mediu.

### Passo 5 · Colocar as telas oficiais e as personas finais (M4 e M3 entregam, M1 coloca, 20 min, sem internet)

1. **M4** exporta as telas do PowerPoint ou Keynote como PNG com os nomes exatos `A.png`, `B.png` e `C.png` e passa por pen drive ou AirDrop.
   - Regra do time: **banco fictício**, sem logo, nome ou cores do Itaú, e o selo "tela fictícia". O vídeo é público.
   - Cada versão muda **uma coisa só**: A com "Repetir" escondido em "Mais opções"; B com ícone sem texto; C com ícone e "Repetir todo mês".
2. **M1** copia os três arquivos para `vila-de-personas/telas/`.
3. **M3** manda o texto final das 4 personas pelo WhatsApp. O M1 abre o Claude Code na pasta `vila-de-personas` e pede: *"Converta estas personas em dados/personas.json, com exatamente os campos id, nome, idade, resumo, familiaridade_digital, contexto_de_uso, acessibilidade, objetivo e medo, e mantenha a chave 'personas'. Descreva por comportamento, não por estereótipo: [cole o texto]."* Se o texto do M3 não chegar a tempo, as personas provisórias servem: já são descritas por comportamento.
4. Confira com `python -m vila.autoteste`.

**Pronto quando:** o autoteste termina com "Tudo certo", e a barra lateral do painel mostra "Telas: Oficiais: A.png, B.png, C.png".

### Passo 6 · Olhar as respostas e congelar o prompt (M1 com o time, 15 min, com internet)

1. Teste 2 personas bem diferentes na tela B:
   - `python -m vila.motor --telas B=telas/B.png --personas jorge`
   - `python -m vila.motor --telas B=telas/B.png --personas ana`
2. Leiam as respostas. Os passos fazem sentido para aquela pessoa? A persona cita o texto que está **de verdade** na tela?
3. **Regra do time:** pode ajustar só clareza e formato do prompt (`vila/prompt_persona.md`). **Nunca** ajustem o prompt para a vila "acertar" o que o time espera; isso vicia o teste com pessoas e a banca vai perguntar.
4. **Decisão do time sobre a temperatura.** Hoje ela está em 0,1, o que deixa as 3 rodadas quase iguais. A Groq recomenda de 0,5 a 0,7 para este modelo. Para mudar, peça ao Claude Code: *"No vila/motor.py, troque temperature=0.1 por temperature=0.6."*
5. Congelem: troque a primeira linha do `vila/prompt_persona.md` para `versao: v-final` e anote a mudança na tabela "Versões do prompt" do `vila/README.md`.

**Pronto quando:** o prompt está marcado `v-final`, antes do teste com pessoas.

### Passo 7 · Rodar a simulação oficial e gravar o plano B (M1, 20 a 40 min, com internet)

1. Abra o `.env` e acrescente uma linha: `VILA_PARALELO=2`. Isso faz a vila mandar 2 pedidos de cada vez e reduz os erros de limite da Groq.
2. Rode (uma linha só):
   ```
   python -m vila.motor --vila --telas A=telas/A.png B=telas/B.png C=telas/C.png --salvar-demo
   ```
   São 36 chamadas. Vai aparecer um contador `x/36` e, no fim, a tabela com cada persona.
3. Confira: `python -m vila.motor --demo` mostra a mesma tabela lida do arquivo salvo.
4. No painel (`streamlit run app.py`), abra "Ou carregue um resultado salvo", escolha `demo.json` e clique em "Carregar resultado salvo".
   - A lista deve dizer **"rodou com a IA"**, **não** "FALSO, teste offline".
   - **Não** pode aparecer o alerta vermelho "Respostas FALSAS".

**Pronto quando:** existe um `resultados/demo.json` real, e o painel o mostra sem alerta vermelho.

**Se a conta do Passo 3 passar do limite diário, ou se muitas linhas saírem "Incompleto":** rodem em duas vezes em horários diferentes, primeiro A e B e depois B e C. Outras saídas: tirar uma persona com `--personas ana,jorge,marcos` ou contratar o plano pago da Groq. Seja qual for a escolha, contem na apresentação o que foi reduzido.

### Passo 8 · Teste com pessoas (M4 conduz, M3 anota, 1 hora, sem internet)

1. Chamem **3 a 5 pessoas de fora do time** (outros times, mentores). Peçam autorização e **não anotem nome**: use P1, P2, P3…
2. Mostrem a imagem da tela (no computador em tela cheia ou no celular) e digam **a mesma frase para todos**: *"Onde você tocaria para que este Pix se repita todo mês?"*
3. Alternem a ordem: metade começa pela A, metade pela B. Se der tempo, mostrem também a C.
4. Não ajudem, não apontem, não expliquem. Cronometrem pelo celular.
5. Para cada pessoa e cada tela vista, anotem numa tabela (papel ou Word) estas colunas, nesta ordem:
   `participante` (P1…), `versao` (A, B ou C), `ordem` (1, 2…), `achou` (sim ou não), `primeiro_toque` (onde tocou primeiro, com o texto da tela), `tempo_s` (segundos), `dificuldade` (onde travou; vazio se não travou), `comentario`, `duracao_sessao_min` (minutos da sessão inteira).

**Pronto quando:** há anotações **reais** de 3 a 5 pessoas.

### Passo 9 · Comparar a vila com as pessoas (M1, 20 min, sem internet)

1. Passe as notas para `vila-de-personas/dados/notas_teste.csv`. O jeito mais fácil é mandar a foto ou o texto das anotações para o Claude Code: *"Transforme estas notas em dados/notas_teste.csv, separador ponto e vírgula, com as colunas participante;versao;ordem;achou;primeiro_toque;tempo_s;dificuldade;comentario;duracao_sessao_min. Não invente nada que não esteja nas notas."* Confira o arquivo com seus próprios olhos.
2. Gere a sugestão de comparação: `python -m vila.comparacao parear --sim resultados/demo.json`. Não use a opção `--ia`, que está quebrada depois da troca para a Groq.
3. Abra o arquivo `resultados/pareamento-….csv` no Excel ou no Numbers. Para **cada linha**:
   - confira a classificação: **acerto** (a vila e as pessoas acharam o mesmo problema), **ponto cego** (só as pessoas acharam) ou **alarme falso** (só a vila apontou);
   - corrija a coluna `classificacao_final` se precisar;
   - escreva `ok` na coluna `conferido`.

   Salve como CSV, mantendo o ponto e vírgula.
4. Gere os números: `python -m vila.comparacao resumo --sim resultados/demo.json`. Eles ficam em `resultados/numeros-finais.md`.

**Pronto quando:** o `numeros-finais.md` diz quantas pessoas, os acertos, pontos cegos e alarmes falsos e o tempo, tudo **medido**. Se a vila errar muito, isso também é resultado, e bom de apresentar: o guia pede "pelo menos um teste e uma conclusão, inclusive quando o teste contrariar a ideia inicial".

### Passo 10 · Preencher os números no texto técnico, na ficha e nos slides (M1 passa, M3 e M4 usam, 30 min)

1. O M1 manda o conteúdo de `numeros-finais.md` pelo WhatsApp.
2. O M1 preenche os espaços [N], [X], [Y], [Z] e [TEMPO MEDIDO] no `vila/texto_tecnico.md`.
3. **M3, ficha (Word, sem internet):**
   - título "[Nome] ajuda [público] a [benefício]";
   - press release de **100 a 150 palavras**;
   - o aviso "Exercício fictício de lançamento desenvolvido no hackathon. Não é um comunicado oficial do Itaú.";
   - as 5 perguntas do guia, respondidas de forma curta.

   Separe o que foi **medido** do que é **estimativa**. Salve como PDF (Arquivo → Salvar como → PDF) e confira: no máximo 2 páginas.
4. **M4, slides (PowerPoint ou Keynote):** no máximo 10, cobrindo os 6 blocos do guia. Pouco texto, prints do painel, números com fonte. As evidências **contra** a ideia (por exemplo, o item 01.4 da pesquisa, "o GPT errou o primeiro clique em 53% das tarefas") mostram uso crítico de IA: usem. Exporte em PDF.

### Passo 11 · Publicar o link do app (M2, 20 min, com internet)

1. Antes, os Passos 4 a 9 precisam estar salvos no GitHub (Passo 13), porque o link publica o que está lá.
2. Entre em **share.streamlit.io** e faça login com a conta do GitHub. Quando pedir, **dê acesso a repositórios privados**.
3. Clique em **Create app** e preencha:
   - repositório `tiagoguilhermino/hackathon`;
   - branch `main`;
   - arquivo principal `vila-de-personas/app.py`.
4. Em **Advanced settings**, escolha Python **3.12**. **Deixe Secrets vazio** (recomendado): sem chave, o link funciona com "Carregar resultado salvo" e ninguém gasta o limite da Groq do time.
5. Clique em **Deploy** e espere alguns minutos.
6. Nas configurações do app, aba **Sharing**, deixe o app **público**. App de repositório privado nasce privado.
7. Teste o link numa **janela anônima** e no celular: o aviso fixo aparece e "Carregar resultado salvo" mostra o `demo.json`.
8. Cole o link no `vila-de-personas/README.md`, na linha "Link publicado".

**Atenção:** o app "dorme" depois de 12 horas sem visitas. Abra o link antes da banca e, se aparecer "Yes, get this app back up!", clique.

### Passo 12 · Prints e vídeo (M2 grava, M4 narra, 45 min, com internet para publicar)

1. **Prints (M2):** siga a lista da seção 3 do `vila-de-personas/docs/roteiro-demo.md`. Zoom do navegador em 110% a 125%, sem abas nem notificações. Passe ao M4 por pen drive ou AirDrop.
2. **Gravação:**
   - Mac: QuickTime → Arquivo → Nova Gravação de Tela, com o microfone ligado.
   - Windows: Win+Alt+R (Xbox Game Bar) ou o Clipchamp.

   Siga o roteiro da seção 1 do `roteiro-demo.md`, usando **"Carregar resultado salvo"**. O M4 lê a narração enquanto o M2 conduz a tela.
3. **Regras:** até **2:00**; começar dizendo quem usa e o que quer fazer; terminar dizendo o que foi simulado. Nenhuma chave, terminal ou `.env` na tela, e nenhuma marca do Itaú.
4. **Edição simples:** cortar o começo e o fim no iMovie (Mac) ou no Clipchamp (Windows).
5. **YouTube:** youtube.com → Criar → Enviar vídeo. Título sugerido: "Vila de personas · protótipo de hackathon (Hackathon Itaú 2026)". Visibilidade **Público** (o guia exige). Teste o link numa janela anônima.

### Passo 13 · Salvar tudo no GitHub (M1 ou M2, 10 min, com internet)

1. Na pasta `vila-de-personas`, rode `python3 scripts/checar.py` (Windows: `python scripts\checar.py`). Só continue se aparecer "0 FALHA".
2. Vá para a raiz do repositório com `cd ..` e veja o que mudou: `git status`.
3. Adicione **só** os arquivos do projeto. Por exemplo:
   - `git add vila-de-personas/telas vila-de-personas/resultados vila-de-personas/dados vila-de-personas/vila vila-de-personas/README.md`
   - **Não** adicione `.env` nem arquivos `.DS_Store` (lixo do Mac).
4. `git commit -m "H10: simulação oficial, teste com pessoas e números reais"`
5. `git push`

**Se tiver dúvida no item 3,** peça ao Claude Code: *"Mostre o git status e me diga quais arquivos devo adicionar para salvar o trabalho do time, sem .env e sem .DS_Store."* O push é sempre feito por uma pessoa, não pelo agente.

### Passo 14 · Checklist final e envio (M1 e M4, 20 min, com internet)

Marquem cada item antes de enviar:
- [ ] Equipe e case (C · Jornada de agentes) identificados.
- [ ] Protótipo: link público abrindo (ou instruções no README) e tarefa completa demonstrável.
- [ ] Slides em PDF, no máximo 10.
- [ ] Vídeo no YouTube, **público**, com até 2:00, abrindo sem login.
- [ ] Ficha em PDF, no máximo 2 páginas, com press release e 5 perguntas e respostas.
- [ ] Todo número dos materiais foi **medido** e separado do que é simulação ou estimativa.
- [ ] Nenhuma chave, informação interna do banco, dado pessoal real ou marca do Itaú.
- [ ] Arquivos e links enviados **na plataforma oficial**, com **confirmação de recebimento**, antes do prazo. O prazo e as regras estão nos canais oficiais; o guia não define horários.

### Passo 15 · Ensaio (todos, 30 min)

1. **Pitch de 4 minutos**, seguindo a tabela "Roteiro de pitch" do guia:
   - 0:00–0:40 pessoa e problema;
   - 0:40–1:15 proposta de valor;
   - 1:15–2:30 demonstração;
   - 2:30–3:15 teste e aprendizado;
   - 3:15–4:00 viabilidade e fechamento.
2. **Demo de 75 segundos** dentro do pitch, com o `roteiro-demo.md`. Ensaiem 3 vezes com cronômetro.
3. **Plano B aberto:** painel com "Carregar resultado salvo" pronto e o vídeo numa aba.
4. Cada integrante precisa saber explicar a própria parte e as escolhas do time.

---

## 5. Se sobrar tempo (melhorias, em ordem de valor)

1. **Revisão humana completa (M2).** Hoje o painel grava uma decisão só, sem quem decidiu. Peça ao Claude Code: *"No app.py, faça a decisão por persona, com o campo 'quem' (designer ou PO), o id da simulação, a leitura e o apontamento, como na classe Decisao da seção 6 do docs/contrato-de-dados.md. Mostre o histórico sempre, não só depois de salvar."* Isso fortalece a história de governança.
2. **Escolher personas e ter telas pré-carregadas** na tela de entrada (M2, H2).
3. **Consolidar e revisar a pesquisa:** rodar o consolidador e o revisor sobre `backend/pesquisa/output/`, para o bloco 2 usar só evidência conferida.
4. **Atualizar documentos desatualizados:**
   - o `vila/README.md` ainda fala em Anthropic e `backend/`;
   - o `docs/contrato-de-dados.md` ainda diz "PROPOSTA" e tem nomes de campo diferentes do código;
   - o `docs/publicacao.md` diz que o app chama a "API do Devin", mas o app usa a Groq.
5. **Tirar arquivos duplicados:**
   - `backend/vila/` é uma versão antiga do motor;
   - os 4 PDFs estão na raiz e em `output/`;
   - há dois conjuntos de telas provisórias.
6. **Decidir o papel da pasta `Frontend/`.** Ela entrou no git no commit `c2b8a90`: é um app de celular feito no Lovable, de um banco fictício chamado "Lume", o que respeita a regra.
   - A vila lê **imagens**, não esse app. Para usar o Lume na demo, o M4 tira prints das telas do Lume nas versões A, B e C e salva como `A.png`, `B.png` e `C.png` (Passo 5).
   - Confiram se as cores e ícones não copiam os do Itaú, já que o pedido ao Lovable foi "estilo Itaú".
   - Dá para tirar do repositório o `Frontend/itau-hackathon-bank-main.zip` (cópia da mesma pasta) e o `Frontend/.DS_Store`.
7. **Marcar a versão final:** `git tag v-final` e depois `git push origin v-final`. A tag `v-demo` atual aponta para uma versão antiga.

---

## 6. Apêndice · checklist do guia "Como montar seus agentes"

| Item do checklist | Situação |
|---|---|
| seis pastas criadas | ✅ `input/`, `pdf/`, `scripts/`, `output/`, `.claude/`, `.agents/` |
| input / pdf / output separados | ✅ |
| constituição escrita antes do 1º agente | ✅ `AGENTS.md`; o recorte do time na raiz ainda está "PREENCHA" (o do app está no `vila-de-personas/AGENTS.md`) |
| deny no arquivo de permissões | ✅ Claude Code (`.claude/settings.json`); ❓ Antigravity: colar o bloco do `README.md` em Settings → Projects |
| cada agente cabe numa pergunta só | ✅ |
| esqueleto de saída colado no prompt | ✅ |
| toda tabela com colunas nomeadas | ✅ |
| `## Lacunas` e `## Fontes` em todo output | ⚠️ a pesquisa nova (`backend/pesquisa/`) usa outro modelo: fonte dentro de cada item, sem `## Fontes` no fim |
| revisor sem ferramenta de busca | ✅ |
| nomes de arquivo definidos antes dos prompts | ✅ |
| quem revisa não edita | ✅ |
| loop com contador e teto | ✅ |
| encaminhamento em formato fechado | ✅ |
| nenhuma regra escrita em dois lugares | ⚠️ `backend/vila/` duplica `vila-de-personas/vila/`, e `backend/pesquisa/AGENTS.md` é uma constituição à parte |
