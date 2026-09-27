# Cenários para a vila: combinações das interfaces do Lume

> Proposta para o time decidir. Tudo aqui é desenho de teste: nenhum resultado. A fonte dos cenários é o código do frontend Lume: `Frontend/itau-hackathon-bank-main/src/lib/cenarios.ts`. Este documento e o "Laboratório de cenários" do app saem dessa mesma lista. Conferido em 26/09/2026.

## 1. As peças que se combinam

A dashboard do Lume foi separada em peças. Cada combinação de peças é uma versão do app.

| Peça | Opções | O que muda |
|---|---|---|
| **Transferências** | Pix e TED separados · Em Transferir | Atalhos "Pix" e "TED/DOC" na tela inicial, ou um atalho "Transferir" que abre Pix ou TED |
| **Boleto** | No Depositar · Atalho próprio | O boleto fica dentro do menu "Depositar" ou tem atalho "Boleto" na tela inicial |
| **Minhas chaves** (receber por Pix) | No Depositar · Dentro do Pix | "Minhas Chaves & QR Code" fica no menu "Depositar" ou na tela inicial do Pix |
| **Tela inicial do Pix** | Fluxo 1 · Fluxo 2 | Fluxo 1: contatos salvos, sem Copia e Cola. Fluxo 2: Copia e Cola e chave digitada, sem contatos |
| **Repetir todo mês** (tela Confirmar Pix) | A · B · C | A: dentro do ⋯ · B: só um ícone · C: cartão com o texto "Repetir todo mês" |

As Dash V1, V2 e V3 são combinações prontas:

| | Transferências | Boleto | Minhas chaves |
|---|---|---|---|
| **Dash V1** | separadas | no Depositar | no Depositar |
| **Dash V2** | separadas | atalho próprio | dentro do Pix |
| **Dash V3** | em Transferir | no Depositar | dentro do Pix |

A **Dash V3 mudou num ponto**: antes, "Depositar" abria uma janela vazia. Agora ele leva ao boleto e à portabilidade, como na V1, e as chaves continuam dentro do Pix, como antes.

### As 8 dashboards possíveis

No celular, a tela inicial mostra só os 4 primeiros atalhos.

| Transferências | Boleto | Minhas chaves | Atalhos no celular | Situação |
|---|---|---|---|---|
| separadas | no Depositar | no Depositar | Pix · Pagar · TED/DOC · Depositar | **Dash V1** |
| separadas | no Depositar | dentro do Pix | Pix · Pagar · TED/DOC · Depositar | nova (C38, C41) |
| separadas | atalho | dentro do Pix | Pix · Pagar · TED/DOC · Boleto | **Dash V2** |
| separadas | atalho | no Depositar | Pix · Pagar · TED/DOC · Depositar | **incoerente**: "Boleto" é o 5º atalho e some no celular |
| em Transferir | no Depositar | dentro do Pix | Transferir · Pagar · Depositar · Recarga | **Dash V3** |
| em Transferir | no Depositar | no Depositar | Transferir · Pagar · Depositar · Recarga | nova (C39) |
| em Transferir | atalho | dentro do Pix | Transferir · Pagar · Boleto · Recarga | nova (C40) |
| em Transferir | atalho | no Depositar | Transferir · Pagar · Depositar · Boleto | nova (sem cenário ainda) |

Sete são coerentes. A incoerente fica fora dos cenários, e o laboratório avisa quando alguém a monta.

Atenção: algumas dashboards têm a **mesma tela inicial**. A nova de C38 e C41 é igual à V1, e a nova de C39 é igual à V3. A diferença só aparece depois do primeiro toque, no menu Depositar ou na tela do Pix. Avaliar só a tela inicial não distingue essas versões.

### 1.1 Incoerências e o que foi feito

| # | O quê | Situação |
|---|---|---|
| I1 | Na V3, "Depositar" abria uma janela vazia | **Corrigido no app**: leva ao boleto e à portabilidade |
| I2 | Na V3, o botão Pix da barra de baixo convive com "Transferir" | **Continua**. O laboratório mostra o aviso. Decisão do time: esconder ou declarar |
| I3 | O selo "Pix Instantâneo" é quase invisível (mesmo defeito de cor do ícone da B) e foi onde as personas mais travaram | **Continua**. Afeta A, B e C igualmente. Decisão do time: corrigir a cor ou declarar |
| I4 | As barras de teste mostram "Versão A/B/C", "Fluxo 1/2" e "Hackathon Itaú" | **Resolvido pelo modo limpo** (`&limpo=sim`), que esconde as duas barras |
| I5 | No Fluxo 2, digitar o celular da Ana Paula levava a "Contato Consultado da Base" na confirmação | **Corrigido no app**: a chave de um contato salvo mostra o nome dele |
| I6 | A combinação "separadas + boleto com atalho + chaves no Depositar" esconde o Boleto no celular | Fica fora dos cenários; o laboratório avisa |
| I7 | Dados de teste com bancos reais: "Itaú Unibanco" é o 2º contato do Pix (Fluxo 1) e o banco padrão da TED ("341") | **Continua**. Aparece nas telas de T1, T2 (Fluxo 1) e T4. Trocar antes de capturar ou mostrar a pessoas |
| I8 | O `telas/capturar_telas.py` procura um botão "Pix", mas o app agora abre na V3, que não tem esse atalho | Abrir o script com `/?dash=v1&fluxo=f1`, sem modo limpo, porque o script esconde a barra ele mesmo |

## 2. As tarefas

A frase é a mesma para todas as personas e para as pessoas do teste.

| Tarefa | Frase |
|---|---|
| **T1 · Pix para contato** | "Mande R$ 250 por Pix para Ana Paula Souza, celular (11) 98765-4321." |
| **T2 · Pix recorrente** | "Deixe um Pix de R$ 250 para Ana Paula Souza, celular (11) 98765-4321, se repetindo todo mês." |
| **T3 · Pagar com Copia e Cola** | "Pague esta conta com o código Pix Copia e Cola que você recebeu." |
| **T4 · TED** | "Transfira R$ 300 para Marcos Oliveira, agência 1234, conta 56789-0." |
| **T5 · Receber (minha chave)** | "Mostre sua chave Pix para alguém te pagar." |
| **T6 · Boleto de depósito** | "Gere um boleto para colocar R$ 100 na sua conta." |

T1 e T2 trazem o celular de propósito: no Fluxo 2 não há lista de contatos, então a persona precisa digitar a chave. Sem o número, a tarefa seria impossível no Fluxo 2, e isso mediria a frase, não a tela.

## 3. Os 41 cenários

Um cenário é **tarefa + combinação**. Só entram as peças que mudam o caminho da tarefa. A recorrência, por exemplo, não muda nada numa TED.

| Tarefa | Cenários | Quantos |
|---|---|---|
| T1 · Pix para contato | 3 Dash × 2 fluxos | 6 (C01–C06) |
| T2 · Pix recorrente | 3 Dash × 2 fluxos × 3 versões de "Repetir" | 18 (C07–C24) |
| T3 · Copia e Cola | 3 Dash no Fluxo 2 + 1 caso incorreto | 4 (C25–C28) |
| T4 · TED | 3 Dash | 3 (C29–C31) |
| T5 · Receber | 3 Dash + 2 combinações novas | 5 (C32–C34, C38, C39) |
| T6 · Boleto | 3 Dash + 2 combinações novas | 5 (C35–C37, C40, C41) |

**Tipo:** `normal` = a tarefa tem caminho · `incorreto` = a tarefa não tem caminho nessa interface; o esperado é a persona desistir, não "achar" algo que não existe. O guia do Case C pede os dois: "Testem um caso normal e outro incompleto ou incorreto".

**Link:** o endereço abre o app já no cenário, por exemplo `http://localhost:8082/?cenario=C05`. Acrescente `&limpo=sim` para abrir sem as barras de teste.

| ID | Tarefa | Dashboard | Fluxo | Repetir | Tipo | Caminho mínimo | Link |
|---|---|---|---|---|---|---|---|
| C01 | T1 · Pix para contato | Dash V1 | F1 | — | normal | Pix → Ana Paula Souza → valor → Revisar Transação → Confirmar | `/?cenario=C01` |
| C02 | T1 · Pix para contato | Dash V1 | F2 | — | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → Confirmar | `/?cenario=C02` |
| C03 | T1 · Pix para contato | Dash V2 | F1 | — | normal | Pix → Ana Paula Souza → valor → Revisar Transação → Confirmar | `/?cenario=C03` |
| C04 | T1 · Pix para contato | Dash V2 | F2 | — | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → Confirmar | `/?cenario=C04` |
| C05 | T1 · Pix para contato | Dash V3 | F1 | — | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → Ana Paula Souza → valor → Revisar Transação → Confirmar | `/?cenario=C05` |
| C06 | T1 · Pix para contato | Dash V3 | F2 | — | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → digitar a chave → Consultar → valor → Revisar Transação → Confirmar | `/?cenario=C06` |
| C07 | T2 · Pix recorrente | Dash V1 | F1 | A | normal | Pix → Ana Paula Souza → valor → Revisar Transação → ⋯ (Mais opções) → Repetir todo mês | `/?cenario=C07` |
| C08 | T2 · Pix recorrente | Dash V1 | F1 | B | normal | Pix → Ana Paula Souza → valor → Revisar Transação → ícone de repetir, sem texto | `/?cenario=C08` |
| C09 | T2 · Pix recorrente | Dash V1 | F1 | C | normal | Pix → Ana Paula Souza → valor → Revisar Transação → Repetir todo mês | `/?cenario=C09` |
| C10 | T2 · Pix recorrente | Dash V2 | F1 | A | normal | Pix → Ana Paula Souza → valor → Revisar Transação → ⋯ (Mais opções) → Repetir todo mês | `/?cenario=C10` |
| C11 | T2 · Pix recorrente | Dash V2 | F1 | B | normal | Pix → Ana Paula Souza → valor → Revisar Transação → ícone de repetir, sem texto | `/?cenario=C11` |
| C12 | T2 · Pix recorrente | Dash V2 | F1 | C | normal | Pix → Ana Paula Souza → valor → Revisar Transação → Repetir todo mês | `/?cenario=C12` |
| C13 | T2 · Pix recorrente | Dash V3 | F1 | A | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → Ana Paula Souza → valor → Revisar Transação → ⋯ (Mais opções) → Repetir todo mês | `/?cenario=C13` |
| C14 | T2 · Pix recorrente | Dash V3 | F1 | B | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → Ana Paula Souza → valor → Revisar Transação → ícone de repetir, sem texto | `/?cenario=C14` |
| C15 | T2 · Pix recorrente | Dash V3 | F1 | C | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → Ana Paula Souza → valor → Revisar Transação → Repetir todo mês | `/?cenario=C15` |
| C16 | T2 · Pix recorrente | Dash V1 | F2 | A | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → ⋯ (Mais opções) → Repetir todo mês | `/?cenario=C16` |
| C17 | T2 · Pix recorrente | Dash V1 | F2 | B | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → ícone de repetir, sem texto | `/?cenario=C17` |
| C18 | T2 · Pix recorrente | Dash V1 | F2 | C | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → Repetir todo mês | `/?cenario=C18` |
| C19 | T2 · Pix recorrente | Dash V2 | F2 | A | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → ⋯ (Mais opções) → Repetir todo mês | `/?cenario=C19` |
| C20 | T2 · Pix recorrente | Dash V2 | F2 | B | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → ícone de repetir, sem texto | `/?cenario=C20` |
| C21 | T2 · Pix recorrente | Dash V2 | F2 | C | normal | Pix → digitar a chave → Consultar → valor → Revisar Transação → Repetir todo mês | `/?cenario=C21` |
| C22 | T2 · Pix recorrente | Dash V3 | F2 | A | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → digitar a chave → Consultar → valor → Revisar Transação → ⋯ (Mais opções) → Repetir todo mês | `/?cenario=C22` |
| C23 | T2 · Pix recorrente | Dash V3 | F2 | B | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → digitar a chave → Consultar → valor → Revisar Transação → ícone de repetir, sem texto | `/?cenario=C23` |
| C24 | T2 · Pix recorrente | Dash V3 | F2 | C | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → digitar a chave → Consultar → valor → Revisar Transação → Repetir todo mês | `/?cenario=C24` |
| C25 | T3 · Pagar com Copia e Cola | Dash V1 | F2 | — | normal | Pix → colar o código → Continuar com Copia e Cola → Revisar Transação → Confirmar | `/?cenario=C25` |
| C26 | T3 · Pagar com Copia e Cola | Dash V2 | F2 | — | normal | Pix → colar o código → Continuar com Copia e Cola → Revisar Transação → Confirmar | `/?cenario=C26` |
| C27 | T3 · Pagar com Copia e Cola | Dash V3 | F2 | — | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → colar o código → Continuar com Copia e Cola → Revisar Transação → Confirmar | `/?cenario=C27` |
| C28 | T3 · Pagar com Copia e Cola | Dash V1 | F1 | — | **incorreto** | não há caminho: o Fluxo 1 não tem Copia e Cola | `/?cenario=C28` |
| C29 | T4 · TED | Dash V1 | — | — | normal | TED/DOC → agência e conta → Continuar para Confirmação → Confirmar | `/?cenario=C29` |
| C30 | T4 · TED | Dash V2 | — | — | normal | TED/DOC → agência e conta → Continuar para Confirmação → Confirmar | `/?cenario=C30` |
| C31 | T4 · TED | Dash V3 | — | — | normal | Transferir → Transferência via TED / DOC → agência e conta → Continuar para Confirmação → Confirmar | `/?cenario=C31` |
| C32 | T5 · Receber (minha chave) | Dash V1 | — | — | normal | Depositar → Depositar via Pix (Minhas Chaves & QR Code) | `/?cenario=C32` |
| C33 | T5 · Receber (minha chave) | Dash V2 | F2 | — | normal | Pix → Minhas Chaves & QR | `/?cenario=C33` |
| C34 | T5 · Receber (minha chave) | Dash V3 | F2 | — | normal | Transferir (ou o Pix da barra de baixo) → Transferência via Pix → Minhas Chaves & QR | `/?cenario=C34` |
| C35 | T6 · Boleto de depósito | Dash V1 | — | — | normal | Depositar → Depositar via Boleto → valor → Gerar Boleto | `/?cenario=C35` |
| C36 | T6 · Boleto de depósito | Dash V2 | — | — | normal | Boleto → valor → Gerar Boleto | `/?cenario=C36` |
| C37 | T6 · Boleto de depósito | Dash V3 | — | — | normal | Depositar → Depositar via Boleto → valor → Gerar Boleto | `/?cenario=C37` |
| C38 | T5 · Receber (minha chave) | Pix e TED separados + boleto no Depositar + chaves no Pix | F2 | — | normal | Pix → Minhas Chaves & QR | `/?cenario=C38` |
| C39 | T5 · Receber (minha chave) | Transferir + boleto no Depositar + chaves no Depositar | — | — | normal | Depositar → Depositar via Pix (Minhas Chaves & QR Code) | `/?cenario=C39` |
| C40 | T6 · Boleto de depósito | Transferir + boleto com atalho + chaves no Pix | — | — | normal | Boleto → valor → Gerar Boleto | `/?cenario=C40` |
| C41 | T6 · Boleto de depósito | Pix e TED separados + boleto no Depositar + chaves no Pix | — | — | normal | Depositar → Depositar via Boleto → valor → Gerar Boleto | `/?cenario=C41` |

São 41 cenários. Com 4 personas e 3 rodadas, dá 492 chamadas **por tela avaliada**. No plano gratuito da Groq, a simulação oficial fez 36 chamadas em cerca de 20 minutos, então o conjunto completo não cabe num dia. Ver a seção 5.

### Perguntas que cada grupo de cenários responde

| Comparação | Cenários | Pergunta |
|---|---|---|
| Onde começa a transferência | C01 · C03 · C05 (e C02 · C04 · C06) | "Transferir" (V3) ajuda ou atrapalha quem procura "Pix"? Por idade? |
| Contatos × digitar a chave | C01 × C02, C03 × C04, C05 × C06 | Qual tela inicial do Pix as personas mais velhas concluem? |
| Onde fica a recorrência | C07–C24 | A, B e C, agora com o caminho inteiro, e não só a tela de confirmação |
| TED dentro de Transferir | C29 · C30 × C31 | Juntar Pix e TED esconde a TED? |
| Onde ficam as chaves | C32 × C38 e C34 × C39 | Muda **só** onde ficam as chaves |
| Onde fica o boleto | C36 × C41 e C37 × C40 | Muda **só** onde fica o boleto |
| Caso incorreto | C28 | A persona desiste quando não há caminho, ou "inventa" um botão? |

Por que as combinações novas importam: da Dash V1 para a V2 mudam **duas** peças ao mesmo tempo (boleto e chaves). Se o resultado mudar, não dá para saber qual peça fez a diferença. As combinações novas mudam uma peça por vez, que é a regra do próprio time para as telas A, B e C.

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

## 5. Como ver e como rodar

### Ver no app

Na pasta `Frontend/itau-hackathon-bank-main`, rode `npm run dev` e abra o endereço que o terminal mostrar. A barra **Laboratório de cenários**, no topo, permite:

- escolher um cenário (C01 a C41): o app abre na combinação certa e mostra a tarefa e o caminho mais curto;
- usar os atalhos Dash V1, V2 e V3, ou montar a combinação peça por peça;
- copiar o link da combinação, normal ou limpo.

Parâmetros do endereço (os valores evitam números de propósito: o roteador põe aspas em valores que parecem número):

| Parâmetro | Valores |
|---|---|
| `cenario` | `C01` a `C41` |
| `dash` | `v1` · `v2` · `v3` |
| `transf` | `separadas` · `unificadas` |
| `boleto` | `deposito` · `atalho` |
| `chaves` | `deposito` · `pix` |
| `fluxo` | `f1` · `f2` |
| `rec` | `a` · `b` · `c` |
| `limpo` | `sim` (esconde as barras de teste) |

Exemplos: `/?cenario=C05`, `/?dash=v1&fluxo=f1&rec=b`, `/?transf=unificadas&boleto=atalho&chaves=pix&limpo=sim`.

### Rodar com a vila

O motor da vila avalia **uma imagem por chamada**. Um cenário tem várias telas. Há dois caminhos:

**Caminho 1 · sem mudar o motor.** Avaliar, em cada cenário, só a **tela onde o caminho se decide**, com a tarefa inteira na frase. Os links em modo limpo servem para capturar cada tela.

| Tela a capturar | Serve para |
|---|---|
| Início: V1, V2, V3 e "Transferir + boleto com atalho" (4 telas) | onde começar cada tarefa (a tela inicial de C38 e C41 é igual à da V1; a de C39 é igual à da V3) |
| Transferir (Pix ou TED) | cenários da V3 que passam por Transferir: C05, C06, C13–C15, C22–C24, C27, C31, C34 |
| Tela inicial do Pix: Fluxo 1 e 2, com e sem "Minhas Chaves" (4 telas) | contato × chave × Copia e Cola × receber |
| Menu Depositar: "chaves + boleto + portabilidade" e "boleto + portabilidade" (2 telas) | receber e boleto |
| Confirmar Pix A, B e C (já existem) | recorrência |
| Formulário da TED | TED |

São 15 telas. Rodar primeiro as 4 telas iniciais com as 6 tarefas (6 × 4 × 4 personas × 3 rodadas = 288 chamadas) já responde à pergunta central da dashboard.

**Caminho 2 · mudar o motor (arquivo do M1).** Sessão em sequência: a persona vê a tela 1, diz onde toca e, se tocou no lugar certo, recebe a tela 2, até concluir ou desistir. Mede o caminho inteiro (passos, desvios, onde desiste), mas multiplica as chamadas e precisa de um mapa "toque → próxima tela" por cenário. Os links do laboratório ajudam a montar esse mapa.

## 6. Decisões do time

1. Na V3, esconder o botão Pix da barra de baixo (I2)?
2. Corrigir a cor do selo "Pix Instantâneo" antes de capturar (I3)?
3. Trocar "Itaú Unibanco" e o banco "341" dos dados de teste (I7)?
4. Caminho 1 (tela de decisão) ou caminho 2 (sequência)?
5. Criar a persona 75+?
6. Quais cenários entram primeiro, dado o limite da Groq?
