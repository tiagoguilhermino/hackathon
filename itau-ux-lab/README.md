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
- **LLM real**: funciona sem configurar nada. As chaves gratuitas da Groq do projeto (3, em 27/09) ficam em `src/lib/llm/keys.ts`, por decisão do time (o repositório é privado). Se uma for recusada ou esgotar o limite, entra a próxima. Um `GROQ_API_KEY` no `.env.local` tem prioridade. O modelo padrão é `openai/gpt-oss-120b` (troque em `LLM_MODEL`).
  - **Antes de deixar o repositório público ou mandar o link do código para a banca:** apague as chaves de `keys.ts` e revogue todas em console.groq.com. O Guia pede materiais públicos sem chaves.
  - O plano gratuito limita os tokens por minuto. O código espera o saldo antes de cada chamada, e cada agente gasta cerca de 8 a 12 mil tokens de entrada. Uma simulação com muitos agentes demora, então comece com poucos.
  - Testado em 27/09: 1 agente na versão B (uma vez concluiu, outra concluiu errado) e 2 agentes na versão C (os dois concluíram, em 110 s); Analista e Designer responderam no Dashboard em cerca de 90 s.

## Fluxos

| Fluxo | Tarefa dada ao agente | Conta como sucesso |
|---|---|---|
| Solicitação de Empréstimo | contratar um empréstimo pessoal com valor e parcelas adequados | chegar a "Empréstimo contratado" |
| Transferência via Pix | fazer um Pix pequeno para um familiar | chegar a "Pix enviado" |
| **Agendar Pix que se repete todo mês** | "Agendar um Pix que se repete todo mês: R$ 250 do aluguel para Ana Paula Souza." | chegar a "Pix agendado todo mês" com a Ana, R$ 250 e o repetir ligado. Enviar uma vez só, para outra pessoa ou com outro valor conta como **concluiu errado**. |

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

## Variações de tela do Lume no Agente Designer

No Dashboard, embaixo das propostas do Agente Designer, fica a seção **"Variações de tela por perfil de cliente"**. Ela usa as telas que o Iury desenhou no frontend Lume (`Frontend/itau-hackathon-bank-main`, "Laboratório de cenários"):

| Grupo | Variações (prévias em `public/previas/`) |
|---|---|
| Tela inicial | Dash V1 (Pix com atalho próprio), Dash V2 (Boleto com atalho), Dash V3 (Transferir agrupado), Pagar boleto e Fatura separados |
| Início do Pix | Fluxo 1 (contatos salvos), Fluxo 2 (Copia e Cola e chave) |
| Repetir todo mês | A (dentro do ⋯), B (só ícone), C (com texto) |

Para cada perfil de cliente que ficou bem abaixo da média, o agente escolhe no catálogo as variações que atacam a tela onde esse perfil mais parou. Cada indicação mostra a prévia, os números do perfil e o porquê, e passa pela revisão humana, como as propostas.

- **Simulado:** uma regra no código escolhe a variação pela tela onde o perfil parou (literacia e idade). Confirmação do Pix → Repetir C; início do Pix → Fluxo 1; tela inicial → Dash V1 no Pix e Dash V3 no empréstimo. A regra está em `variationsForScreen`, em `src/lib/design/variations.ts`.
- **LLM real:** o agente recebe o catálogo e escolhe sozinho, só entre os ids do catálogo. O código tira a versão já testada e as repetições. Testado em 27/09: cerca de 7 s e 2.500 + 2.700 tokens por análise.
- O catálogo inteiro fica em "Catálogo de variações do Lume (9 prévias)". Clicar numa prévia abre a imagem em tamanho real. Com `NEXT_PUBLIC_LUME_URL` no `.env.local` (ex.: `http://localhost:5174`), cada prévia ganha o link "abrir no Lume", com o app do Iury rodando.

**Refazer as prévias** (depois de o Iury mudar as telas): suba o frontend Lume (`cd Frontend/itau-hackathon-bank-main && npm run dev -- --port 5174 --host 127.0.0.1`) e rode `python itau-ux-lab/scripts/capturar_previas.py`.
- O script usa o modo limpo do app e não altera o código dele. Só na página que ele abre, troca os bancos reais da lista de contatos por fictícios e o nome da saudação por "Cliente", e pinta o ícone da versão B, que no app está branco sobre branco.
- Se sobrar algum termo proibido na tela, ele para com erro.

## Versões do prompt

A versão usada fica gravada em cada simulação e aparece no Dashboard. Mudou o texto de um prompt? Suba a versão em `src/lib/agents/versions.ts` e acrescente uma linha aqui.

| Versão | O que mudou |
|---|---|
| `nav-v1` | Prompt do Agente Navegador do Victor, com duas mudanças: o banco passa a ser o Lume (fictício) e há uma linha explicando os botões "ícone sem texto". |
| `ana-v1` | Prompt do Agente Analista do Victor, mais: o que é "concluiu errado" e a instrução de escrever achados como hipóteses. |
| `des-v1` | Prompt do Agente Designer do Victor, mais: cada proposta é uma hipótese e quem decide é o designer ou o PO. |
| `des-v2` | `des-v1` mais as variações de tela do Lume por perfil (catálogo, desempenho por perfil e a versão testada); esforço de raciocínio "médio", porque no "alto" a resposta às vezes estourava o limite antes de fechar o JSON. |

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
- **Política Simulada.** No modo Simulado, as diferenças entre versões vêm das regras (botão apagado ou só com ícone é mais difícil para quem tem pouca familiaridade digital). Não diga que isso foi medido.

## Para o Victor

A branch `victor-llm` tem o app na raiz do repositório; na `main` ele está nesta pasta. Daqui para frente, o mais simples é trabalhar direto aqui (`itau-ux-lab/`, na `main` ou numa branch criada a partir dela). Se ainda precisar trazer commits novos da `victor-llm`, rode:

```bash
git merge -X subtree=itau-ux-lab/ origin/victor-llm
```
