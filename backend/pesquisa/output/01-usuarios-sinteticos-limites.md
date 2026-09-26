# 01 · usuarios-sinteticos-limites · rodada 1
Pergunta: O que se sabe sobre usar IA (LLMs) como usuários sintéticos ou personas simuladas para avaliar interfaces e produtos? Onde acertam (ex.: achar problemas óbvios de usabilidade rápido) e onde falham (homogeneidade, viés de "usuário ideal", não reproduzem emoção/contexto/limitação física, alucinação)?
Data da busca: 2026-09-26

## Resumo em 3 linhas
Nos estudos que compararam a IA com pessoas reais ou com especialistas, ela encontrou só uma parte dos problemas de uso. Essa parte ficou entre um terço e cerca de metade, conforme o estudo. Foi melhor em detalhes de texto, rótulos e alinhamento, e às vezes achou problemas que as pessoas não viram.
As falhas se repetem de um estudo para outro. A IA age de forma mais uniforme, mais direta e mais "educada" que gente de verdade, erra mais para idosos, pessoas com baixa visão e quem fala de outro jeito, perde problemas de contexto e navegação e às vezes inventa elementos que a tela não tem.
Pesquisadores e a NN/g concordam num ponto: dá para usar como triagem antes do teste com pessoas, sempre marcada como simulação, e nunca como substituta do teste.

## Itens

### [01.1] A IA acha problemas de detalhe em telas estáticas, mas perde a maioria dos problemas que especialistas acham
- Tipo: EVIDÊNCIA
- Fonte: Peitong Duan, Jeremy Warner, Yang Li, Bjoern Hartmann (UC Berkeley e Google Research), "Generating Automatic Feedback on UI Mockups with Large Language Models", CHI 2024. https://people.eecs.berkeley.edu/~bjoern/papers/duan-heuristic-chi2024.pdf (DOI: https://doi.org/10.1145/3613904.3642782)
- O que diz (paráfrase): Os autores criaram um plugin do Figma que usa o GPT-4 para fazer avaliação heurística, isto é, conferir uma tela contra uma lista de regras de usabilidade. Ele analisa uma tela estática por vez. Foram três estudos:
  - Três designers avaliaram as sugestões feitas para 51 telas. Das sugestões, 52% foram consideradas corretas, 19% parcialmente corretas e 29% incorretas. Quanto à utilidade, 49% foram vistas como úteis ou muito úteis.
  - 12 especialistas avaliaram 12 telas à mão. No conjunto de 100 violações encontradas, 62% foram achadas só pelos humanos, 29% pelos humanos e pela IA e 9% só pela IA. A IA ficou com nota geral (F1) parecida com a de um avaliador humano sozinho, mas acertou menos (menor precisão). Os humanos acharam mais problemas "globais", que exigem entender o propósito e o contexto da tela, e mais problemas visuais.
  - Outros 12 designers usaram o plugin em rodadas seguidas. Depois que a tela foi melhorada, a qualidade das sugestões caiu: 39% corretas e 35% incorretas.

  Os participantes elogiaram a ferramenta por achar erros sutis e melhorar textos. 8 de 12 não a viram como perigosa, porque há um humano revisando. Alguns avisaram que um designer iniciante pode confiar 100% nela.
- O que sustenta para o time: Uma IA pode varrer uma tela rápido atrás de problemas de detalhe, como rótulos, textos confusos, alinhamento e contraste, antes do teste com pessoas. Mesmo assim, uma pessoa precisa filtrar o resultado, porque cerca de 3 em 10 sugestões estavam erradas.
- O que NÃO sustenta: Não é simulação de usuário: não há persona e ninguém "usa" a tela. É inspeção por regras. O estudo usou telas estáticas, uma de cada vez, e não um fluxo com várias telas como "agendar um Pix". O modelo foi o GPT-4 de 2023–2024, e modelos atuais podem se sair de outro jeito. Nada ali trata de apps de banco. O estudo também não mostra que a IA acha os problemas mais graves.
- Verificação: pendente

### [01.2] Em apps reais, cerca de 6 em 10 apontamentos da IA estavam certos, mas ela achou só pouco mais de um terço dos problemas conhecidos
- Tipo: EVIDÊNCIA
- Fonte: Ali Ebrahimi Pourasad e Walid Maalej (Universität Hamburg), "Does GenAI Make Usability Testing Obsolete?", ICSE 2025 (arXiv 2411.00634). https://arxiv.org/abs/2411.00634
- O que diz (paráfrase): Os autores criaram a ferramenta UX-LLM, que usa o GPT-4 Turbo with Vision. Ela recebe uma descrição do app, o código-fonte e a imagem de cada tela. Os resultados foram comparados com os de um teste de usabilidade (10 participantes por app) e de uma revisão feita por 2 especialistas. Foram usados 2 apps de iOS de código aberto e complexidade média: um de quiz e um de lista de tarefas.
  - De tudo o que a IA apontou, entre 61% e 66% estava certo (precisão de 0,61 a 0,66).
  - Do total de problemas conhecidos, ela achou entre 35% e 38% (cobertura, ou recall, de 0,35 a 0,38).
  - Ao todo apareceram 110 problemas. O teste com usuários achou 26 (8 só dele), os especialistas 55 (31 só deles) e a IA 29 (8 só dela). Só 9 problemas foram achados pelos três métodos.
  - A IA não achou problemas de navegação nem de contexto mais amplo, porque analisa uma tela por vez. Por outro lado, achou problemas em caminhos pouco usados do app.

  A conclusão dos autores é que a ferramenta complementa o teste, mas não o substitui.
- O que sustenta para o time: A IA pode achar problemas que os outros métodos não acham, e também erra cerca de 1 em cada 3 apontamentos. Isso reforça a meta de mostrar "o que ela erra". O estudo mostra ainda que cada método acha problemas diferentes: só 9 de 110 apareceram nos três.
- O que NÃO sustenta: Também não é persona simulada: é uma análise que depende do código-fonte. A amostra é pequena (2 apps simples e 10 participantes por app). Segundo os autores, nenhum participante tinha deficiência. A cobertura supõe que a lista de 110 problemas está completa, e os próprios autores dizem que isso é quase impossível. O estudo não diz se a IA acha os problemas mais graves.
- Verificação: pendente

### [01.3] Agentes simulados acharam 9 de 17 problemas plantados num site, contra 11 de 17 num relatório de pessoas leigas
- Tipo: EVIDÊNCIA (estudo pequeno)
- Fonte: Steffen Holter (ETH Zurich), Eunyee Koh, Mustafa Doga Dogan, Gromit Yeuk-Yin Chan (Adobe Research), "UXCascade: Scalable Usability Testing with Simulated User Agents", UIST 2026 (arXiv 2601.15777). https://arxiv.org/html/2601.15777
- O que diz (paráfrase): O sistema cria agentes de IA com personas que navegam num protótipo de loja de camisetas. A loja tinha 17 problemas de usabilidade colocados de propósito.
  - Pelo menos um agente apontou 9 dos 17 problemas. Os agentes acharam sempre os de devolução, moeda, frete e botão de adicionar ao carrinho.
  - Um relatório montado a partir de 10 usuários leigos, que preencheram um formulário, continha 11 dos 17.
  - Os autores descrevem as duas coberturas como complementares.
  - 8 profissionais de UX testaram o sistema. Em média, identificaram 2,875 problemas com o sistema e 2,625 com o relatório de base, uma diferença sem significância estatística (p = .813).

  Os autores também relatam que, em comparações preliminares, os agentes variaram bem menos que os humanos nos cliques e nos elementos explorados, e que o agente de navegação tem dificuldade com percepção visual.
- O que sustenta para o time: É plausível que uma "vila" aponte parte das dificuldades antes do teste: neste caso, cerca de metade dos problemas plantados. O estudo também confirma que a variedade de comportamento é menor que a de pessoas reais.
- O que NÃO sustenta: Problemas plantados não são a mesma coisa que problemas que surgem no uso real. O estudo cobre só 1 protótipo de loja virtual, 8 profissionais e 10 leigos. A base de comparação foi um relatório escrito por leigos, e não um teste de usabilidade moderado. O estudo não mede tempo (minutos contra dias) nem trata de banco.
- Verificação: pendente

### [01.4] CONTRA a ideia do time: em testes de primeiro clique, o GPT errou a distribuição de cliques de pessoas reais em 53% das tarefas
- Tipo: INDÍCIO (preprint no arXiv, ainda não revisado por pares)
- Fonte: Eduard Kuric, Peter Demcak, Matus Krajcovic (Slovak University of Technology e UXtweak Research), "What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience", 2026. https://arxiv.org/abs/2605.18302 (texto completo: https://arxiv.org/html/2605.18302)
- O que diz (paráfrase): Os autores compararam respostas simuladas pelo GPT (GPT-4.1 e GPT-5.2) com as de 3.431 participantes reais. Os dados vieram de 12 testes de primeiro clique feitos na prática profissional (9 sites de computador, 2 apps de celular e 1 gráfico), num total de 45 tarefas.
  - Em 53% das tarefas, a distribuição de cliques do GPT foi diferente da humana, com significância estatística.
  - A área mais clicada pelo GPT coincidiu com a primeira escolha humana em 71% das tarefas.
  - Os cliques do GPT foram mais concentrados. Numa medida de espalhamento (entropia), ele teve média de 0,43, contra 0,61 dos humanos. Ele também clicou em menos áreas diferentes: média de 5,38, contra 9,00.
  - As explicações foram superficiais e parecidas entre si. Houve casos de alucinação, em que o GPT descreveu elementos que não existiam na tela. As notas dadas foram positivas demais.
  - Usar personas ou pedir raciocínio passo a passo deixou as respostas mais "críveis", mas não mais parecidas com as humanas. Quando se usou uma única persona, o espalhamento quase sumiu (entropia 0,02).
- O que sustenta para o time: A IA pode acertar onde a maioria clicaria em boa parte das tarefas (71%). Mas ela não reproduz a dispersão: some justamente a minoria que se perde, que é quem mais interessa num teste de usabilidade. Isso é um argumento forte para marcar os resultados como simulação e medir os erros da vila. O item também serve para o tema 04 (primeiro clique).
- O que NÃO sustenta: É preprint, sem revisão por pares. Os autores são ligados a uma empresa de plataforma de pesquisa UX, o que pode ser um interesse no resultado. O estudo cobre só o primeiro clique, e não um fluxo inteiro. Testou apenas modelos GPT, com uma rodada de simulação por condição. Não trata de banco nem de português.
- Verificação: pendente

### [01.5] No caso da Amazon, os agentes fizeram menos da metade das ações das pessoas e foram "direto ao ponto"
- Tipo: INDÍCIO (resumo estendido no CHI EA 2026, que é um formato mais curto; estudo de caso de autores ligados à Amazon)
- Fonte: Yuxuan Lu, Ting-Yao Hsu, Hansu Gu e outros (Northeastern University, Pennsylvania State University, Amazon), "Agent A/B: Automated and Scalable A/B Testing on Live Websites with Interactive LLM Agents", CHI EA 2026 (arXiv 2504.09723). https://arxiv.org/pdf/2504.09723
- O que diz (paráfrase): 1.000 agentes com o modelo Claude 3.5 Sonnet, 500 por versão, testaram dois desenhos do painel de filtros da Amazon. O resultado foi comparado com um teste A/B real com 2 milhões de pessoas.
  - Na versão atual do site, as pessoas (N = 1 milhão) fizeram por sessão, em média: 15,96 ações, 6,40 buscas, 6,96 cliques em produto, 0,33 cliques em filtro e 0,62 compras.
  - Na mesma versão, os agentes (N = 500) fizeram: 6,05 ações, 1,42 buscas, 1,87 cliques em produto, 0,58 cliques em filtro e 0,81 compras.
  - Os autores dizem que as pessoas exploram mais e os agentes seguem um caminho mais direto ao objetivo. Mesmo assim, chamam as taxas de compra de "comparáveis".
  - Com o filtro reduzido, os agentes compraram mais. Na tabela são 414 contra 403 compras; no texto, 414 contra 404. Segundo os autores, a direção desse resultado bateu com a do teste com pessoas.
  - Custo estimado pelos autores: cerca de 875 milhões de tokens e cerca de US$ 2.925 para os 1.000 agentes. Para comparar, citam uma estimativa de US$ 100 por pessoa, ou US$ 100.000 para 1.000 participantes num estudo de UX.
- O que sustenta para o time: Agentes podem simular tarefas com objetivo claro, como "agendar um Pix", e indicar qual de duas versões tende a ir melhor, com custo bem menor.
- O que NÃO sustenta: O artigo não mostra os números das pessoas na versão nova, só diz que a direção bateu. As pessoas exploram muito mais (buscam 6,40 vezes contra 1,42), e é nesse vaguear que muitos problemas de uso aparecem. Uma taxa de compra de 0,81 contra 0,62 não é igual. O caso é de loja virtual, não de banco. A comparação de custo é uma estimativa dos autores, não uma medição.
- Verificação: pendente

### [01.6] CONTRA a ideia do time: usuários simulados por IA dão uma nota errada ao produto e erram mais para certos grupos
- Tipo: EVIDÊNCIA
- Fonte: Preethi Seshadri, Samuel Cahyawijaya, Ayomide Odumakinde, Sameer Singh, Seraphina Goldfarb-Tarrant (UC Irvine e Cohere), "Lost in Simulation: LLM-Simulated Users are Unreliable Proxies for Human Users in Agentic Evaluations", ACL 2026 (anais, volume 1, páginas 47423–47439). https://aclanthology.org/2026.acl-long.2192/ (texto: https://arxiv.org/html/2601.17087v1)
- O que diz (paráfrase): Os autores avaliaram um chatbot de atendimento de loja (GPT-4o) de duas formas: com usuários simulados por 4 LLMs diferentes e com pessoas reais. Havia cerca de 40 pessoas por grupo. Nos EUA, os grupos eram divididos por idade e por modo de falar; os outros países foram Índia, Quênia e Nigéria.
  - Só de trocar o modelo que simula o usuário, a taxa de sucesso do chatbot mudou quase 9 pontos percentuais.
  - Com as pessoas dos EUA, o sucesso foi de 45,2%. A diferença média entre o resultado com humanos e o simulado (erro de calibração) foi de 15,1.
  - A simulação subestimou o sucesso nas tarefas difíceis e superestimou nas de dificuldade média.
  - Com falantes de inglês afro-americano, o sucesso foi de 39,4% (erro 20,3). Com falantes de inglês padrão, foi de 50,6% (erro 11,7). Na faixa de 55 anos ou mais, a diferença entre os dois grupos chegou a quase 19 pontos.
  - Os usuários simulados perguntaram mais (perguntas em 18,8% das falas, contra 9,8% das pessoas) e foram mais educados (39,2% das falas, contra 19,9%).
  - Quando a tarefa falhou, a culpa foi do chatbot em 48,9% dos casos com usuários simulados e em 24,5% com pessoas.
- O que sustenta para o time: É o argumento central contra usar a simulação como verdade. O usuário simulado parece um "usuário ideal": mais educado, completo e eficiente. Ele também erra mais justamente para grupos menos representados, sobretudo quando se somam idade e jeito de falar. Para um banco no Brasil, com clientes idosos e muitas variações regionais do português, isso é um alerta direto.
- O que NÃO sustenta: O estudo avalia um chatbot, numa conversa, e não telas de app. Foi feito só em inglês e num único tipo de serviço. Não testou português nem o Brasil.
- Verificação: pendente

### [01.7] CONTRA a ideia do time: a IA "fazendo papel" de um grupo tende a retratar o estereótipo visto de fora e a achatar as diferenças
- Tipo: EVIDÊNCIA
- Fonte: Angelina Wang, Jamie Morgenstern, John P. Dickerson, "Large language models that replace human participants can harmfully misportray and flatten identity groups", Nature Machine Intelligence, 2025 (versão lida: arXiv 2402.01908, v3 de 03/02/2025). https://arxiv.org/abs/2402.01908
- O que diz (paráfrase): O estudo comparou 3.200 pessoas, de 16 identidades (raça, gênero, geração e deficiência, incluindo TDAH e deficiência visual), com 4 LLMs: Llama-2-Chat 7B, Wizard Vicuna 7B, GPT-3.5-Turbo e GPT-4. Os autores apontam dois problemas:
  - Retrato errado. As respostas da IA se parecem mais com o que pessoas de fora imaginam sobre o grupo do que com o que o próprio grupo diz de si. Num exemplo, a IA fazendo o papel de alguém com deficiência visual puxou o assunto da deficiência ao falar de um tema sem relação com ela.
  - Achatamento. As respostas da IA variaram bem menos que as humanas, nas 4 medidas de diversidade usadas.

  Alguns ajustes ajudaram só em parte, como usar nomes em vez de rótulos do grupo ou deixar as respostas mais aleatórias. Os autores aceitam o uso da IA como complemento ou em estudos piloto, mas não como substituta quando a identidade da pessoa importa para a pergunta.
- O que sustenta para o time: Personas como "idoso" ou "baixa visão" na vila tendem a virar caricatura e a responder de forma parecida entre si. Isso reforça duas práticas: marcar a saída como simulação e não tratá-la como a voz do grupo.
- O que NÃO sustenta: O estudo mede opiniões e respostas a perguntas, não o uso de telas. Os modelos são de 2023–2024. Não houve teste em português, nem medição de efeito num teste de usabilidade.
- Verificação: pendente

### [01.8] Ao simular pessoas com baixa visão, a IA concordou de 59% a 70% com as respostas reais
- Tipo: INDÍCIO (preprint no arXiv, sem revisão por pares informada)
- Fonte: Rosiana Natalie, Wenqian Xu, Ruei-Che Chang, Rada Mihalcea, Anhong Guo (University of Michigan), "Not There Yet: Evaluating Vision Language Models in Simulating the Visual Perception of People with Low Vision", 2025. https://arxiv.org/abs/2508.10972
- O que diz (paráfrase): 40 pessoas com baixa visão responderam perguntas sobre 25 imagens. Depois, o GPT-4o foi instruído a simular cada uma delas.
  - Com uma instrução mínima, a IA concordou com a pessoa real em 0,59 das respostas.
  - Descrever a visão da pessoa, sozinho, não melhorou o resultado.
  - Descrever a visão e dar um exemplo de resposta daquela pessoa elevou a concordância para 0,70. Dar mais exemplos não trouxe ganho significativo.

  Os autores observam que o modelo tende a "enxergar além" da limitação descrita.
- O que sustenta para o time: Uma limitação física como a baixa visão não passa a ser reproduzida só porque foi descrita na persona. Mesmo no melhor cenário, cerca de 3 em cada 10 respostas discordaram das reais. Personas de "baixa visão" na vila devem ser marcadas como aproximação.
- O que NÃO sustenta: A tarefa era reconhecer imagens, não usar um app. É preprint, testou só o GPT-4o e não diz nada sobre telas de banco.
- Verificação: pendente

### [01.9] Personas idosas simuladas se comportaram quase como adultos de meia-idade
- Tipo: INDÍCIO (observação qualitativa dentro de um artigo de conferência, sem medição)
- Fonte: Man-Lin Chu, Lucian Terhorst, Kadin Reed, Tom Ni, Weiwei Chen, Rongyu Lin (Clark University e Quinnipiac University), "LLM-Based Multi-Agent System for Simulating and Analyzing Marketing and Consumer Behavior", IEEE ICEBE 2025 (arXiv 2510.18155). https://arxiv.org/pdf/2510.18155
- O que diz (paráfrase): Numa simulação de consumidores feita com LLM, os autores relatam, como observação e sem medição sistemática, que:
  - os agentes idosos quase não se diferenciaram de adultos de meia-idade;
  - raramente mencionaram saúde, pouca familiaridade com tecnologia ou valores tradicionais;
  - um agente que fazia o papel de uma criança de 7 anos pediu café quando estava cansado.

  A hipótese dos autores é que os dados usados para treinar a IA vêm sobretudo de usuários de internet de cerca de 18 a 45 anos. Eles citam o design de UX para consumidores idosos como uma das áreas prejudicadas.
- O que sustenta para o time: É um alerta direto para a persona "idoso com pouca familiaridade digital" num app de banco. Sem cuidado, ela pode agir como um adulto jovem e fluente em tecnologia.
- O que NÃO sustenta: É uma observação, sem números e sem comparação com idosos reais. O contexto é marketing, não teste de tela. A causa apontada, os dados de treino, é só hipótese dos autores.
- Verificação: pendente

### [01.10] NN/g: usuários sintéticos são rasos e bajuladores e servem para preparar a pesquisa com pessoas, não para substituí-la
- Tipo: OPINIÃO (artigo de posição com comparação informal, sem método descrito)
- Fonte: Maria Rosala e Kate Moran, Nielsen Norman Group, "Synthetic Users: If, When, and How to Use AI-Generated 'Research'", 2024 (21/06/2024). https://www.nngroup.com/articles/synthetic-users/
- O que diz (paráfrase): As autoras testaram a plataforma Synthetic Users e o ChatGPT e compararam, de forma informal, as respostas com estudos anteriores feitos com pessoas reais. Um dos temas eram cursos online e o outro, representantes de propaganda médica.
  - Num exemplo, o usuário sintético disse ter terminado todos os cursos, enquanto pessoas reais contaram que abandonaram cursos no meio.
  - Os problemas que elas listam são: visão irreal do comportamento humano, necessidades e valores rasos e "experiências imaginadas" pouco confiáveis.
  - Elas afirmam que a IA não usa o produto como uma pessoa e, por isso, não gera dado de comportamento. Só consegue imitar entrevistas e questionários.
  - Usos aceitáveis, segundo elas: preparar um estudo, testar um roteiro de entrevista, criar proto-personas como hipóteses e resumir dados que já existem.
  - Elas pedem que o material nunca seja apresentado como pesquisa com usuários reais.
- O que sustenta para o time: É a posição de referência do mercado de UX. Ela apoia usar a vila como etapa anterior ao teste com pessoas, marcada como simulação, e não como substituta.
- O que NÃO sustenta: Não é um estudo com método. É de 2024, antes de agentes que navegam de verdade por interfaces, como os dos itens 01.3 e 01.5. Esses trabalhos contestam em parte a ideia de que a IA "não gera dado de comportamento", embora com os limites descritos nesses itens. O texto não traz números comparáveis.
- Verificação: pendente

## Lacunas
- **Nada em português, no Brasil ou em apps de banco.** Nenhum estudo encontrado testou personas simuladas em português, com clientes brasileiros ou em apps de banco. Nenhum usou uma tarefa parecida com agendar um Pix recorrente.
- **Tempo não medido.** Nenhum estudo mediu com método o ganho de tempo ("minutos em vez de dias"). O único dado de custo é uma estimativa dos próprios autores do Agent A/B (item 01.5).
- **Emoção fora dos estudos.** Nenhum estudo lido mediu se a IA reproduz emoção, como medo de errar com dinheiro, ansiedade ou frustração. Há só sinais indiretos: notas positivas demais (01.4), educação exagerada (01.6) e experiências "imaginadas" (01.10).
- **Limitação física pouco coberta.** Não achei estudo sobre simular limitação motora em interfaces. A baixa visão só aparece numa tarefa de reconhecer imagens (01.8), e os idosos só numa observação sem números (01.9).
- **Gravidade dos problemas.** Os estudos contam quantos problemas a IA acha, mas nenhum verificou se ela acha os mais graves ou os que mais atrapalham o usuário.
- **Fontes frágeis ou que envelhecem rápido.** Vários itens são preprints ou resumos estendidos (01.4, 01.5, 01.8). Os modelos de IA mudam rápido, e resultados com GPT-4 ou GPT-4o podem não valer para modelos novos, nem para melhor nem para pior.
- **Fontes que não consegui abrir** (por isso ficaram de fora):
  - SimUser (Xiang et al., CHI 2024), que compara personas simuladas com 48 usuários reais num app de relógio: a página da ACM devolveu erro 403.
  - Hämäläinen et al., CHI 2023, sobre dados sintéticos em pesquisa de interação humano-computador (IHC): também deu erro 403.
  - A página da Nature do item 01.7 pediu login, então usei a versão do arXiv.
- **Lidas mas sem uso como item.**
  - UXAgent (Lu et al., CHI EA 2025) foi lido, mas os próprios autores dizem que não compararam, em números, o comportamento dos agentes com o de pessoas. No estudo, 5 pesquisadores de UX acharam os dados úteis, mas "não parecidos com humanos reais".
  - A revisão da NN/g de 2025 sobre "gêmeos digitais" (Raluca Budiu, https://www.nngroup.com/articles/ai-simulations-studies/) também foi lida. Ela trata de questionários, não de interfaces. Um ponto útil dela: personas baseadas só em dados demográficos variam menos que as pessoas reais.
