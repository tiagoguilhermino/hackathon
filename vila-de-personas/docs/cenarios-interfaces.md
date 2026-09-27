# Cenários para a vila: combinações das interfaces do Lume

> Proposta para o time decidir. Tudo aqui é desenho de teste: nenhum resultado. Base: o código do frontend Lume (`Frontend/itau-hackathon-bank-main/src/routes/index.tsx`, commit `fc8cb45`), conferido em 26/09/2026.

## 1. As variações que existem hoje no app

| Fator | Versões | O que muda | Onde fica no código |
|---|---|---|---|
| **D · Dashboard** | V1, V2, V3 | Os atalhos da tela inicial | `shortcuts`, linhas 156-181 |
| **F · Fluxo do Pix** | Fluxo 1, Fluxo 2 | A primeira tela dentro do Pix | linhas 766 e 860 |
| **R · Recorrência** | A, B, C | Como aparece "Repetir todo mês" na tela Confirmar Pix | linhas 1154-1230 |

### D · Dashboard (celular: só os 4 primeiros atalhos aparecem, linha 443)

| | Atalhos visíveis no celular | Pix | TED | Minhas chaves / QR (receber) | Boleto |
|---|---|---|---|---|---|
| **V1** | Pix · Pagar · TED/DOC · Depositar | atalho próprio | atalho próprio | Depositar → Pix | Depositar → Boleto |
| **V2** | Pix · Pagar · TED/DOC · Boleto | atalho próprio | atalho próprio | dentro do Pix | atalho próprio |
| **V3** | Transferir · Pagar · Depositar · Recarga | Transferir → Pix | Transferir → TED | dentro do Pix | **não dá para chegar** (ver 1.1) |

Nas três versões, o botão laranja "Pix" da barra de baixo abre o Pix direto (linha 2023). Ou seja, na V3 o Pix **não** fica só dentro de "Transferir": existe um atalho paralelo.

### F · Fluxo do Pix (tela inicial do Pix)

| | O que tem | O que não tem |
|---|---|---|
| **Fluxo 1 (Contatos)** | Chave Pix · Ler QR Code · lista de contatos salvos com busca · (V2 e V3: Minhas Chaves & QR) | **Copia e Cola** |
| **Fluxo 2 (Manual e Copia e Cola)** | Pix Copia e Cola em destaque · campo de chave manual · câmera QR · (V2 e V3: Minhas Chaves & QR) | **lista de contatos** |

### R · Recorrência (tela Confirmar Pix): as telas oficiais A, B e C que a vila já usou

### 1.1 Incoerências que o time precisa decidir antes de testar

| # | O quê | Efeito no teste | Sugestão |
|---|---|---|---|
| I1 | Na V3, "Depositar" abre uma janela com título "Boletos Bancários" e **sem conteúdo** (o bloco de opções só existe na V1, linha 1785) | Tarefas de depósito e boleto na V3 viram tela vazia: a persona trava por defeito, não por design | Corrigir no frontend antes, ou usar a V3 + boleto só como **caso incorreto** declarado |
| I2 | Na V3, o botão Pix da barra de baixo convive com "Transferir" | A V3 não testa só "Pix dentro de Transferir": o caminho curto continua lá | Decidir se a V3 esconde o botão Pix da barra, ou dizer isso nos resultados |
| I3 | O selo "Pix Instantâneo" é quase invisível (linha 1205, mesmo defeito de cor do ícone da B) e foi onde as personas mais travaram em A e B | Afeta as três versões de recorrência igualmente (confunde a comparação) | Corrigir a cor (`text-accent-foreground` → `text-accent`) e recapturar, ou manter e declarar |
| I4 | A barra "Modo de Teste da Vila (Hackathon Itaú)" mostra "Versão A/B/C" e "Fluxo 1/2" | Entrega o experimento para a IA e para as pessoas | Esconder em todo print (o `telas/capturar_telas.py` já faz isso para a tela de confirmação) |

## 2. As tarefas

Cada tarefa é o que se pede à persona, com a mesma frase para todas.

| Tarefa | Frase para a persona | Fatores que importam |
|---|---|---|
| **T1 · Pix para contato** | "Mande R$ 250 por Pix para Ana Paula Souza, celular (11) 98765-4321." | D, F |
| **T2 · Pix recorrente** | "Deixe um Pix de R$ 250 para Ana Paula Souza se repetindo todo mês." | D, F, R |
| **T3 · Pagar Copia e Cola** | "Pague esta conta com o código Pix Copia e Cola que você recebeu." | D, F |
| **T4 · TED** | "Transfira R$ 300 para Marcos Oliveira, agência 1234, conta 56789-0." | D |
| **T5 · Receber** | "Mostre sua chave Pix para alguém te pagar." | D (e F na V2 e na V3) |
| **T6 · Boleto de depósito** | "Gere um boleto para colocar R$ 100 na sua conta." | D |

A frase de T1 e T2 traz o celular de propósito: no Fluxo 2 não há lista de contatos, então a persona precisa digitar a chave. Sem o número, a tarefa seria impossível no Fluxo 2, e isso mediria a frase, não a tela.

## 3. Os cenários (combinações coerentes)

Cada cenário é **tarefa + combinação de fatores**. Só entram fatores que mudam o caminho da tarefa. Por exemplo, R não muda nada numa TED, então a TED não se multiplica por A, B e C.

**Tipo:** `normal` = a tarefa tem caminho · `incorreto` = a tarefa não tem caminho nessa interface; o esperado é a persona desistir ou pedir ajuda, não "achar" algo que não existe. O guia do Case C pede os dois: "Testem um caso normal e outro incompleto ou incorreto".

| ID | Tarefa | D | F | R | Tipo | Caminho mínimo (toques) |
|---|---|---|---|---|---|---|
| C01 | T1 | V1 | F1 | — | normal | Pix → contato Ana Paula → valor → Revisar → Confirmar |
| C02 | T1 | V1 | F2 | — | normal | Pix → digitar chave → Consultar → valor → Revisar → Confirmar |
| C03 | T1 | V2 | F1 | — | normal | igual a C01 |
| C04 | T1 | V2 | F2 | — | normal | igual a C02 |
| C05 | T1 | V3 | F1 | — | normal | Transferir → Transferência via Pix → contato → valor → Revisar → Confirmar (ou o botão Pix da barra, ver I2) |
| C06 | T1 | V3 | F2 | — | normal | Transferir → Transferência via Pix → chave → Consultar → valor → Revisar → Confirmar |
| C07–C12 | T2 | V1 · V2 · V3 | F1 | A · B · C | normal | caminho de T1 + opção de repetir na confirmação |
| C13–C18 | T2 | V1 · V2 · V3 | F2 | A · B · C | normal | idem, com chave digitada |
| C19 | T3 | V1 | F2 | — | normal | Pix → colar código → Continuar com Copia e Cola → Revisar → Confirmar |
| C20 | T3 | V2 | F2 | — | normal | igual a C19 |
| C21 | T3 | V3 | F2 | — | normal | Transferir → Pix → colar → Continuar → Revisar → Confirmar |
| C22 | T3 | V1 | F1 | — | **incorreto** | não há Copia e Cola no Fluxo 1 |
| C23 | T4 | V1 | — | — | normal | TED/DOC → agência e conta → Continuar → Confirmar |
| C24 | T4 | V2 | — | — | normal | igual a C23 |
| C25 | T4 | V3 | — | — | normal | Transferir → TED/DOC → agência e conta → Continuar → Confirmar |
| C26 | T5 | V1 | — | — | normal | Depositar → Depositar via Pix (Minhas Chaves) |
| C27 | T5 | V2 | F2 | — | normal | Pix → Minhas Chaves & QR |
| C28 | T5 | V3 | F2 | — | normal | Transferir → Pix → Minhas Chaves & QR (ou botão Pix da barra) |
| C29 | T6 | V1 | — | — | normal | Depositar → Depositar via Boleto → valor → Gerar |
| C30 | T6 | V2 | — | — | normal | Boleto → valor → Gerar |
| C31 | T6 | V3 | — | — | **incorreto** (hoje, por I1) | Depositar abre janela vazia |

São 31 cenários. Com 4 personas e 3 rodadas, dá 372 chamadas **por tela avaliada**. No plano gratuito da Groq, a simulação oficial fez 36 chamadas em cerca de 20 minutos, então o conjunto completo não cabe num dia. Ver a seção 5.

### Perguntas que cada grupo de cenários responde

| Comparação | Cenários | Pergunta |
|---|---|---|
| Onde começa a transferência | C01 · C03 · C05 (e C02 · C04 · C06) | "Transferir" (V3) ajuda ou atrapalha quem procura "Pix"? Por idade? |
| Contatos × digitar a chave | C01 × C02, C03 × C04, C05 × C06 | Qual Fluxo do Pix as personas mais velhas concluem? |
| Onde fica a recorrência | C07–C18 | A · B · C, agora com o caminho inteiro e não só a tela de confirmação |
| TED dentro de Transferir | C23 · C24 × C25 | Juntar Pix e TED esconde a TED? |
| Onde fica "receber" | C26 × C27 × C28 | Chave própria em "Depositar" (V1) ou dentro do Pix (V2 e V3)? |
| Boleto solto × dentro de Depositar | C29 × C30 | Atalho próprio (V2) × menu (V1) |
| Casos incorretos | C22 · C31 | A persona desiste quando não há caminho, ou "inventa" um botão? |

## 4. Faixas etárias

As 4 personas atuais têm 19, 34, 45 e 67 anos (`dados/personas.json`). Para comparar por idade, a sugestão é **uma persona por faixa**, descrita por comportamento (a regra do time continua valendo):

| Faixa | Hoje | Sugestão |
|---|---|---|
| 18–24 | Ana (19) | manter |
| 25–39 | Carla (34) | manter |
| 40–59 | Marcos (45, baixa visão) | manter; ele mistura idade e baixa visão, então dizer isso ao ler o resultado |
| 60–74 | Seu Jorge (67) | manter |
| 75+ | não existe | **decisão do M3**: criar uma persona 75+ |

A pesquisa já mostra os limites: a IA tende a "achatar" diferenças entre perfis ([5] do `backend/pesquisa/output/00-consolidado.md`), personas idosas simuladas agiram quase como adultos de meia-idade (item 01.9) e, na simulação oficial, as 4 personas se comportaram igual. Diferença por idade na vila é **hipótese para o teste com pessoas**, nunca conclusão.

## 5. Como rodar com o motor atual

O motor da vila avalia **uma imagem por chamada**. Um cenário tem várias telas. Há dois caminhos:

**Caminho 1 · sem mudar o motor (dá para fazer já).** Avaliar, em cada cenário, só a **tela onde o caminho se decide**, com a tarefa inteira na frase. A pergunta vira "qual o primeiro toque certo?".

| Tela a capturar | Serve para | Cenários |
|---|---|---|
| Início V1, V2, V3 (3 telas) | onde começar cada tarefa | todos |
| Transferir (V3) | Pix × TED | C05, C06, C21, C25, C28 |
| Pix hub: F1 e F2, com e sem "Minhas Chaves" (4 telas) | contato × chave × Copia e Cola × receber | C01–C06, C19–C22, C27, C28 |
| Depositar V1 · V3 vazia (2 telas) | receber e boleto | C26, C29, C31 |
| Confirmar Pix A, B, C (já existem) | recorrência | C07–C18 |

São cerca de 13 telas. Rodar primeiro as 3 telas de início (6 tarefas × 3 telas × 4 personas × 3 rodadas = 216 chamadas) já responde à pergunta central da dashboard.

**Caminho 2 · mudar o motor (arquivo do M1).** Sessão em sequência: a persona vê a tela 1, diz onde toca e, se tocou no lugar certo, recebe a tela 2, até concluir ou desistir. Mede o caminho inteiro (passos, desvios, onde desiste), mas multiplica as chamadas e precisa de um mapa "toque → próxima tela" por cenário.

## 6. Decisões do time

1. Corrigir I1 (V3 Depositar vazia) e I3 (selo "Pix Instantâneo") antes de capturar, ou manter e declarar?
2. Na V3, esconder o botão Pix da barra (I2)?
3. Caminho 1 (tela de decisão) ou caminho 2 (sequência)?
4. Criar a persona 75+?
5. Quais cenários entram primeiro, dado o limite da Groq?
