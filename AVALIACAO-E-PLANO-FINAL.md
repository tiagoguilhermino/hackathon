# Vila de Personas · avaliação da solução e plano final

Hackathon Itaú 2026 · Case C · Jornada de agentes · 26/09/2026, por volta das 22h30 (Brasília)

> Base da avaliação: Guia dos Participantes [1], Guia de Dicas dos Mentores [2], pesquisa consolidada do time [3] e o que está no repositório (branch `claude/magical-pasteur-pcmsly`). O que depende de pessoas (teste, decisões, contas) está marcado como pendência do time.

## Veredito em cinco linhas

1. **A solução responde ao Case C.** Ela atua num ponto só da passagem da squad (o teste) e tem entrada, trabalho da IA, revisão humana e resultado registrado, que é o que a banca precisa enxergar [1].
2. **Falta a evidência central: o teste com 3 a 5 pessoas.** Sem ele não existe a comparação "vila × pessoas", e a ficha e o vídeo ficam só com simulação.
3. **Hoje existem dois motores.** A vila em Python/Streamlit já rodou com IA de verdade (36 tentativas medidas). O laboratório em Next.js, novo, tem o fluxo completo e é bom de demonstrar, mas usa IA **simulada**. Duas versões na apresentação confundem [2, dica 10].
4. **A especificação multiagentes aumenta o escopo.** O próprio guia diz que "criar mais agentes não significa criar mais valor" [1], e os mentores pedem para evitar funcionalidades que não testam a hipótese [2, dica 3]. Os números vêm de código e as decisões são humanas, o que ajuda, mas é preciso justificar na fala.
5. **Decisões que só o time pode tomar:** qual motor aparece no vídeo, se as telas usam as cores do Itaú (a regra do próprio time proíbe) e a frase-guia final.

## 1. O que está pronto

| Parte | Situação | Onde |
|---|---|---|
| Vila (Python/Streamlit), IA real | ✅ simulação oficial: 4 personas × 3 telas × 3 rodadas = 36 tentativas, 0 falhas, 1.195 s. A e B: 0 de 3 para todas; C: 3 de 3 | `vila-de-personas/resultados/demo.json` |
| Painel Streamlit com decisão humana | ✅ testado de ponta a ponta no navegador | `vila-de-personas/app.py` |
| Comparação vila × pessoas | ✅ pronta para receber as notas (com "repetida" para frases diferentes do mesmo problema) | `vila-de-personas/vila/comparacao.py` |
| Laboratório multiagentes (Next.js) | ✅ os 4 módulos pedidos, testados no navegador; IA simulada por padrão, Groq opcional (não testada aqui) | `vila-lab/` |
| Pesquisa consolidada e revisada | ✅ 26 evidências conferidas, incluindo as que vão **contra** a ideia | `backend/pesquisa/output/00-consolidado.md` |
| Roteiro do vídeo e da demo ao vivo | ✅ com o resultado real da vila | `vila-de-personas/docs/roteiro-demo.md` |
| Ficha do Produto | ⚠️ rascunho: 144 palavras no press release, 5 perguntas, 10 fontes; faltam os números do teste | `vila-de-personas/docs/ficha-do-produto.md` |
| Protocolo do teste com pessoas | ✅ 1 página, mesma regra de "concluiu" da vila | `vila-de-personas/docs/protocolo-teste-pessoas.md` |
| Link público, vídeo, slides, teste com pessoas | ❌ dependem do time | — |

## 2. Aderência ao Case C

| O que o guia pede [1] | Como a solução atende | Situação |
|---|---|---|
| Investigar **um** ponto da passagem, "em vez de tentar automatizar tudo" | O ponto é o teste: antes da rodada com usuários, a vila aponta onde cada perfil trava | ✅ |
| Um fluxo com "entrada definida, saída útil e um ponto claro de revisão" | Entrada: versões da tela, tarefa e personas. Saída: onde cada perfil trava, por quê e com que frequência. Revisão: designer ou PO decide, e fica registrado | ✅ |
| "Mostrem a entrada, o trabalho realizado, a revisão humana e o resultado registrado" | Os dois motores mostram as quatro etapas; o registro de decisões só cresce | ✅ |
| "Testem um caso normal e outro incompleto ou incorreto" | Streamlit: chamada que falha vira "Incompleto". Lab: resposta do agente fora da tela é recusada e registrada (teste com 15% de respostas inválidas: 14 recusadas, 4 agentes encerrados e fora das taxas) | ✅ mostrar na demo |
| Comparar tempo, qualidade ou retrabalho com a forma atual, "indicando o que foi medido e o que foi estimado" | Tempo da vila medido (1.195 s). Falta o lado das pessoas: acertos, pontos cegos, alarmes falsos e duração das sessões | ❌ depende do teste |
| "Criar mais agentes não significa criar mais valor"; "um fluxo com um agente pode ser suficiente" | A vila usa um agente. O Lab usa três, mas os números vêm de código e o analista e o designer são opcionais | ⚠️ justificar |
| Não conectar a sistemas reais nem aprovar mudança de produção automaticamente | Banco fictício e dados sintéticos; o designer só propõe | ✅ |
| Quatro entregas: protótipo com link, até 10 slides, vídeo público de até 2 min, ficha de até 2 páginas | Protótipo ✅ sem link público; ficha em rascunho; slides e vídeo por fazer | ⚠️ |

## 3. Aderência às 10 dicas dos mentores [2]

| Dica | Situação | O que fazer |
|---|---|---|
| 1 · Problema em uma frase | ⚠️ a frase está na proposta, mas não foi aprovada | Sugestão: "Ajudamos o designer e o PO de uma squad a descobrir onde clientes com perfis diferentes travam numa tela nova, porque hoje isso só aparece na rodada de teste com usuários." Abram o pitch com ela, não com "criamos agentes". |
| 2 · Conexão com o case | ✅ território "apoiar a preparação de testes" do Case C | Citar o território no slide 1. As conversas com itubers não foram registradas (`input/conversas.md`): sem elas, a dor é hipótese. |
| 3 · Entrega que caiba no tempo | ⚠️ o Lab novo aumentou o escopo | Congelar funcionalidades agora. Uma jornada: tela A × C do Pix recorrente. |
| 4 · Pesquisar o que já existe | ⚠️ há estudos acadêmicos comparando IA e pessoas [3, itens 1 a 5], mas não um benchmark de produtos | Um slide "o que já existe × o que fazemos diferente": governança, comparação medida com pessoas e rótulo de simulação. Só citar produto com fonte. |
| 5 · Valor para usuário e negócio | ⚠️ valor para a squad descrito; para o negócio, só hipótese | Ligar a menos retrabalho e rodadas de teste melhor aproveitadas; para o cliente, menos atrito em tarefas como o Pix recorrente. Tudo como hipótese. |
| 6 · Métrica de sucesso | ⚠️ proposta pronta, sem número | Métrica principal: parte dos problemas das pessoas que a vila também apontou. Limite que não pode piorar: alarmes falsos. Apoio: tempo da tela nova até a decisão de testar. |
| 7 · Justificar a IA | ✅ bom argumento | A IA entra onde precisa ler a tela e agir como um perfil. Onde uma regra resolve, usamos regra: contraste WCAG calculado, lista de jargões, estatísticas. Custo medido: 95.598 tokens na simulação oficial. |
| 8 · Experiência e dados | ✅ dados sintéticos declarados na tela | Dizer em uma frase de onde vêm os dados (fictícios), onde ficam (navegador/JSON) e o que é simulado. |
| 9 · Dividir e registrar decisões | ⚠️ | Registrar por que escolheram o motor do vídeo e as cores (tabela curta no `PLANO-GRAVACAO-E-PENDENCIAS.md`). |
| 10 · História clara | ⚠️ risco de jargão técnico (MDP, π(a\|s)) | Arquitetura só em apêndice. Na fala: "personas de IA tentam a tarefa; o designer decide o que levar ao teste com pessoas". |

## 4. A especificação multiagentes: o que foi feito

| Pedido | Situação | Observação |
|---|---|---|
| Next.js (App Router), React, Tailwind, Lucide, recharts | ✅ | Next 16.3.6, React 19.2, Tailwind 4.3, lucide-react 1.48, recharts 3.10 |
| Tipos em TypeScript primeiro; componentes granulares | ✅ | `src/lib/tipos.ts`; um componente por tela e por seção |
| M1 · base sintética com as 4 partições e proporção configurável | ✅ | Proporção exata (2× servidores = 20 e 10 em 60); mesma semente, mesma base |
| M2 · app mobile-first, Home, empréstimo em 3 etapas | ✅ | Mais o Pix recorrente A/B/C, para ligar com a vila e com o teste com pessoas |
| M2 · cores #EC7000 e #1E2A4F | ⚠️ feito como pedido | Conflita com a regra do time ("sem cores do Itaú"). As cores ficam num lugar só (`globals.css`). Decidam. |
| M2 · `data-action-id`, posição e árvore de acessibilidade em JSON | ✅ | Com contraste WCAG calculado de verdade e carga cognitiva por regra |
| M3 · `/lab` e botão flutuante discreto | ✅ | |
| M3 · loop via API: árvore → prompt com persona → próximo passo | ✅ | Resposta validada: ação fora da tela é recusada e registrada |
| M3 · restrição "literacia baixa + carga alta → falhar ou demorar"; saída `action_id` ou `ABANDONAR` | ✅ | No prompt e na política simulada |
| M3 · IA simulada com `setTimeout` na 1ª iteração | ✅ | Modo Groq pronto, mas **não testado** (a rede deste ambiente bloqueia a Groq) |
| M4 · `/dashboard` com sucesso por segmento, tempo e abandono | ✅ | Paleta validada para daltonismo; cada gráfico tem tabela |
| M4 · agente analista e agente designer | ✅ | Números e achados por código; a IA só redige |
| (acrescentado) revisão humana registrada | ✅ | O Case C exige; o designer não aplica nada sozinho |

**Riscos da especificação:**
- **Resultado circular.** No modo simulado, as taxas refletem as regras que escrevemos: a versão simplificada "ganha" porque a regra penaliza jargão. Serve para testar o sistema, nunca como evidência.
- **Personas por profissão e renda.** Segmentar por "servidor × CLT" pode virar estereótipo. A pesquisa mostra que a IA tende a achatar grupos [3, itens 4 e 5]. O comportamento no Lab depende da literacia digital e da carga da tela, não da profissão; digam isso.
- **Frontend novo.** O Lab foi feito para receber outra interface: basta seguir o contrato de `data-action-id`, `data-tela` e `data-leitura` (`vila-lab/README.md`).

## 5. Recomendação: uma história só

| Critério | Vila (Streamlit) | Lab (Next.js) |
|---|---|---|
| IA de verdade já rodou | ✅ 36 tentativas, 0 falhas | ❌ só simulada até agora |
| Resultado medido para citar | ✅ tempo e conclusões por versão | ❌ números circulares |
| Demonstração visual | ⚠️ tabelas | ✅ o agente navega na tela, dashboard com gráficos |
| Governança completa | ✅ decisão por persona | ✅ achados → propostas → decisão |
| Pronto para o frontend novo | ❌ lê imagens | ✅ contrato de `data-action-id` |

**Recomendação:** no vídeo e na demo, usem **o Lab** só se, antes de gravar, ele rodar com a Groq no computador de vocês (4 a 8 agentes) e com o frontend final. Se não der, usem **a vila em Streamlit**, que tem IA real e resultado medido, e mostrem o Lab no slide de próximos passos. Não mostrem os dois como produtos diferentes.

## 6. O que só vocês podem fazer (em ordem)

| # | Quem | Tarefa | Pronto quando |
|---|---|---|---|
| 1 | Time | Decidir o motor do vídeo (seção 5) e as cores (Itaú × banco fictício) e registrar o porquê | decisão escrita |
| 2 | M3 + time | Aprovar a frase-guia e as 4 personas | frase no `vila-de-personas/AGENTS.md` |
| 3 | Raphael | Mandar o frontend final. Eu adapto ao contrato do Lab e, se as telas A/B/C mudarem, refazemos a simulação oficial | frontend no repositório |
| 4 | M1 | Se for usar o Lab: `.env.local` com a chave da Groq e rodar 1 agente para validar o modo real | "IA: ligada" e 1 agente concluído |
| 5 | M4 e M3 | Teste com 3 a 5 pessoas pelo protocolo | notas na planilha |
| 6 | M1 | Comparação (Passo 9 do STATUS) e números nos textos | `numeros-finais.md` |
| 7 | M2 | Publicar o link (Streamlit Cloud para a vila; Vercel para o Lab, se for o escolhido) | link abre em janela anônima |
| 8 | M2 + M4 | Gravar e publicar o vídeo (roteiro pronto) | vídeo público no YouTube |
| 9 | M3 e M4 | Ficha final em PDF (até 2 páginas) e slides (até 10) | PDFs no GitHub |
| 10 | Todos | Checklist do guia, envio com confirmação de recebimento e ensaio de 4 min | confirmação recebida |

## 7. Perguntas prováveis da banca

| Pergunta | Resposta curta |
|---|---|
| Por que usar IA, e não só regras? | A IA lê a tela e age como um perfil. Onde a regra basta (contraste, jargão, contas), usamos regra. |
| A vila substitui o teste com pessoas? | Não. Ela escolhe o que levar ao teste; comparamos com [N] pessoas e mostramos onde errou. |
| Como vocês sabem que a IA não inventou? | Os números vêm do código; o agente só escolhe ações que existem na tela; ação inválida é recusada e registrada. |
| E o viés das personas? | Personas por comportamento; a própria pesquisa mostra o risco de estereótipo [3]; por isso a comparação com pessoas. |
| Quanto custa? | Simulação oficial: 95.598 tokens em 36 tentativas, cerca de 20 minutos no plano gratuito. |
| O que falta para um piloto? | Squad real, várias telas, modelo e ambiente aprovados pelo banco, sem dado de cliente. |

## Fontes

1. Hackathon Itaú 2026, "Guia dos Participantes", 2026 (PRIMÁRIA para as regras do evento; seção "Case C · Jornada de agentes" e "Preparem a apresentação e a demo").
2. Hackathon Itaú 2026, "Dicas dos mentores para a entrega final", 2026 (PRIMÁRIA; dicas 1 a 10 e "Checagem final da equipe").
3. Pesquisa consolidada do time, `backend/pesquisa/output/00-consolidado.md`, 26/09/2026 (itens 1 a 5 sobre limites de usuários simulados; fontes e limites de cada item estão lá).
