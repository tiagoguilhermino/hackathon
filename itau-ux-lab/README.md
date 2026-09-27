# Vila de Personas · Laboratório (`itau-ux-lab`)

> Protótipo de hackathon (Hackathon Itaú 2026, Case C). Banco fictício, clientes sintéticos, resultados simulados. Não é o app oficial do Itaú.

Agentes de IA, cada um com o perfil de um cliente sintético, navegam no app de um banco fictício (**Lume**) tentando cumprir uma tarefa. O time vê onde eles travam, compara duas versões de uma tela e decide o que levar ao teste com pessoas. A IA sugere; quem decide é o designer ou o PO, e a decisão fica registrada.

Base: o app do Victor (branch `victor-llm`), com a IA de verdade pela Groq. Do lado da vila de personas vieram as regras do produto, o Pix que se repete todo mês nas versões A, B e C, a comparação antes × depois, o registro de decisões humanas e as checagens.

## Rodar

Precisa do Node 20 ou mais novo.

```bash
cd itau-ux-lab
npm install
npm run dev
```

Abra http://localhost:3000.

| Página | O que tem |
|---|---|
| `/` | O app do banco Lume, para uma pessoa usar. Embaixo do celular: a versão da confirmação do Pix (original, A, B ou C) e o botão que mostra a árvore de acessibilidade que o agente lê. |
| `/lab` | Laboratório: escolhe o fluxo, a versão da tela, quantos agentes e as proporções da base sintética, e roda. Mostra cada toque dos agentes e o que cada um "pensou". |
| `/dashboard` | Relatório: taxa de sucesso por segmento, tempo, funil, erros por etapa, comparação antes × depois, o Agente Analista, o Agente Designer e o registro de decisões humanas. |

## IA simulada ou de verdade

No topo do Laboratório há o seletor **Simulado** / **LLM real**.

- **Simulado** (padrão, sem custo): os agentes seguem regras escritas no código (`mockNavigatorPolicy`). Os números refletem essas regras, não pessoas, e o Dashboard avisa isso.
- **LLM real**: funciona sem configurar nada. As chaves gratuitas da Groq do projeto (7, em 27/09) ficam em `src/lib/llm/keys.ts`, por decisão do time (o repositório é privado). Se uma for recusada ou esgotar o limite, entra a próxima; depois da última, volta à primeira (no máximo uma volta por chamada). Um `GROQ_API_KEY` no `.env.local` tem prioridade. O modelo padrão é `openai/gpt-oss-120b` (troque em `LLM_MODEL`).
  - **Antes de deixar o repositório público ou mandar o link do código para a banca:** apague as chaves de `keys.ts` e revogue todas em console.groq.com. O Guia pede materiais públicos sem chaves.
  - O plano gratuito limita os tokens por minuto. O código espera o saldo antes de cada chamada, e cada agente gasta cerca de 8 a 12 mil tokens de entrada. Uma simulação com muitos agentes demora, então comece com poucos.
  - Testado em 27/09: 1 agente na versão B (uma vez concluiu, outra concluiu errado) e 2 agentes na versão C (os dois concluíram, em 110 s); Analista e Designer responderam no Dashboard em cerca de 90 s.

## Fluxos

| Fluxo | Tarefa dada ao agente | Conta como sucesso |
|---|---|---|
| Solicitação de Empréstimo | contratar um empréstimo pessoal com valor e parcelas adequados | chegar a "Empréstimo contratado" |
| Transferência via Pix | fazer um Pix pequeno para um familiar | chegar a "Pix enviado" |
| T1 · Pix para contato | "Mande R$ 250 por Pix para Ana Paula Souza, celular (11) 98765-4321." | Pix de R$ 250 para a Ana |
| **T2 · Pix que se repete todo mês** | "Deixe um Pix de R$ 250 para Ana Paula Souza, celular (11) 98765-4321, se repetindo todo mês." | chegar a "Pix agendado todo mês" com a Ana, R$ 250 e o repetir ligado |
| T3 · Pix Copia e Cola | "Pague esta conta com o código Pix Copia e Cola que você recebeu." | pagar pelo Copia e Cola (só existe com o Pix abrindo no Copia e Cola) |
| T4 · TED | "Transfira R$ 300 para Marcos Oliveira, agência 1234, conta 56789-0." | TED com esses dados |
| T5 · Minha chave Pix | "Mostre sua chave Pix para alguém te pagar." | chegar a "Minhas chaves e QR Code" |
| T6 · Boleto de depósito | "Gere um boleto para colocar R$ 100 na sua conta." | boleto de R$ 100 gerado |
| T7 · Pagar boleto | "Pague o boleto da escola, de R$ 350,00, com o código que você recebeu." | pagar o boleto da escola |
| T8 · Conta de luz | "Pague a conta de luz que vence amanhã." | pagar a conta de energia |

T1 a T8 são as tarefas do Iury (`Frontend/itau-hackathon-bank-main/src/lib/cenarios.ts`), com a mesma frase para personas e pessoas. Terminar outra operação com dinheiro (outro Pix, outra conta, outro valor) conta como **concluiu errado**.

As versões da confirmação do Pix são as mesmas das telas oficiais da vila (`vila-de-personas/telas/`):

| Versão | Como aparece o "repetir todo mês" |
|---|---|
| A | escondido no botão ⋯ (Mais opções) |
| B | só um ícone de duas setas em círculo, sem texto |
| C | cartão "Deseja automatizar?" com o botão "Repetir todo mês" |

Nos botões só com desenho, o agente lê a descrição do desenho ("ícone sem texto: duas setas em círculo"), não o texto escondido para leitor de tela. Quem enxerga a tela também não vê esse texto.

## Comparar duas versões

1. No Laboratório, escolha "Agendar Pix que se repete todo mês", a versão **A**, e rode.
2. Troque para a versão **C**, sem mudar mais nada (mesmos agentes, mesma seed), e rode de novo.
3. No Dashboard, em "Comparar com", escolha a simulação da versão A. A tabela mostra "concluiu X de N" em cada versão, no geral e por segmento.
4. Nas propostas do Agente Designer, o designer ou o PO escolhe "Levar ao teste com pessoas", "Recusar" ou "Precisa de mais dados". Para recusar ou pedir dados, o porquê é obrigatório.

As simulações, os relatórios dos agentes e as decisões ficam **só neste navegador** (localStorage). Guarde as decisões com o botão "Baixar registro (JSON)". O registro só cresce e, se estiver ilegível, o app não grava por cima.

## Layouts do app (peças do Iury) e o melhor layout por perfil

O app laranja em que os agentes navegam tem as peças do "Laboratório de cenários" do Iury. Tudo fica no mesmo visual:

| Peça | Opções |
|---|---|
| Transferências | Pix e TED com atalhos próprios, ou os dois dentro de "Transferir" |
| Boleto de depósito | dentro de "Depositar", ou com atalho "Boleto" |
| Minhas chaves | dentro de "Depositar", ou dentro do Pix |
| Pagar | um atalho "Pagar", ou "Pagar boleto" e "Fatura" separados |
| Início do Pix | contatos salvos, ou Copia e Cola e chave digitada |

Presets: **Dash V1** (Pix, Pagar, TED/DOC, Depositar, Empréstimos na 2ª linha), **Dash V2** (Pix, Pagar, TED/DOC, Boleto, Empréstimos na 2ª linha) e **Dash V3** (Transferir, Pagar, Depositar, Empréstimos). A tela inicial mostra 4 atalhos por linha, como no celular. O modelo fica em `src/lib/design/variations.ts`.

- **Na página do app (`/`):** escolha o layout embaixo do celular e experimente.
- **No Laboratório:** escolha o layout em "Layout do app", ou marque V1, V2 e V3 em "Comparar layouts" e clique em **"Testar nos layouts marcados"**. Os mesmos agentes (mesma seed) fazem a mesma tarefa em cada layout.
- **No Dashboard, dentro do Agente Designer,** a seção **"Variações de tela por perfil de cliente"** mostra:
  - a tabela com a prévia ao vivo de cada layout;
  - quantos concluíram e o tempo médio, no geral e por faixa de literacia digital e de idade;
  - o melhor layout de cada perfil.
- **É diferença clara** quando o melhor layout ganha de todos os outros por 2 agentes a mais concluindo, ou por ser 15% mais rápido (tempo só conta com 3 ou mais concluindo em cada). O resto é sinal fraco.
- **Cada indicação clara passa pela revisão humana,** como as propostas.

Use 24 agentes ou mais: com 12, cada faixa fica com poucos agentes e quase tudo é sinal fraco.

## Versões do prompt

A versão usada fica gravada em cada simulação e aparece no Dashboard. Mudou o texto de um prompt? Suba a versão em `src/lib/agents/versions.ts` e acrescente uma linha aqui.

| Versão | O que mudou |
|---|---|
| `nav-v1` | Prompt do Agente Navegador do Victor, com duas mudanças: o banco passa a ser o Lume (fictício) e há uma linha explicando os botões "ícone sem texto". |
| `ana-v1` | Prompt do Agente Analista do Victor, mais: o que é "concluiu errado" e a instrução de escrever achados como hipóteses. |
| `des-v1` | Prompt do Agente Designer do Victor, mais: cada proposta é uma hipótese e quem decide é o designer ou o PO. |
| `des-v2` | `des-v1` mais um catálogo de prints das telas do Iury (substituído pela `des-v3`). |
| `des-v3` | Volta ao texto da `des-v1`, sem o catálogo. O melhor layout por perfil sai das simulações nos layouts, não do LLM. Esforço de raciocínio "médio", porque no "alto" a resposta às vezes estourava o limite antes de fechar o JSON. |

## Checagens

```bash
npm run verificar   # regras sem navegador: personas, fluxos A/B/C, oráculo, agentes, prompts, registro, marca
npm run lint
npm run build
```

Rode as três antes de cada commit.

## Limitações

- **Tudo é simulação.** Clientes, perfis e números são sintéticos. Serve para escolher o que levar ao teste com pessoas, não como evidência sobre clientes.
- **Proporções da base.** A base sintética sorteia cada cliente com os pesos escolhidos: a proporção vale na média, mas numa base de 500 pode sair um pouco diferente (ex.: 2,5 servidores por CLT em vez de 2).
- **Política Simulada.** No modo Simulado, as diferenças entre versões e layouts vêm das regras, e não foram medidas:
  - botão apagado ou só com ícone é mais difícil para quem tem pouca familiaridade digital;
  - na tela inicial e nos menus, o botão certo sem nenhuma palavra da tarefa (ex.: "Transferir" para quem quer fazer um Pix) também. É o "cheiro de informação": as palavras de cada tarefa ficam em `scent`, em `src/lib/bank/flows.ts`.

  No modo LLM real, a IA lê a tela e decide sozinha, sem essas regras.

## Para o Victor

A branch `victor-llm` tem o app na raiz do repositório; na `main` ele está nesta pasta. Daqui para frente, o mais simples é trabalhar direto aqui (`itau-ux-lab/`, na `main` ou numa branch criada a partir dela). Se ainda precisar trazer commits novos da `victor-llm`, rode:

```bash
git merge -X subtree=itau-ux-lab/ origin/victor-llm
```
