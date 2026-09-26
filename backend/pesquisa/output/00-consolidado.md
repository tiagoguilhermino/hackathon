# 00-consolidado

### [1] A IA acha problemas de detalhe em telas estáticas, mas perde a maioria dos problemas que especialistas acham
- Tipo: EVIDÊNCIA · origem: `01-usuarios-sinteticos-limites.md`, item 01.1
- Fonte: Peitong Duan, Jeremy Warner, Yang Li, Bjoern Hartmann (UC Berkeley e Google Research), "Generating Automatic Feedback on UI Mockups with Large Language Models", CHI 2024. https://people.eecs.berkeley.edu/~bjoern/papers/duan-heuristic-chi2024.pdf (DOI: https://doi.org/10.1145/3613904.3642782)
- O que NÃO sustenta: Não é simulação de usuário: não há persona e ninguém "usa" a tela. É inspeção por regras. O estudo usou telas estáticas, uma de cada vez, e não um fluxo com várias telas como "agendar um Pix". O modelo foi o GPT-4 de 2023–2024, e modelos atuais podem se sair de outro jeito. Nada ali trata de apps de banco. O estudo também não mostra que a IA acha os problemas mais graves.

### [2] Em apps reais, cerca de 6 em 10 apontamentos da IA estavam certos, mas ela achou só pouco mais de um terço dos problemas conhecidos
- Tipo: EVIDÊNCIA · origem: `01-usuarios-sinteticos-limites.md`, item 01.2
- Fonte: Ali Ebrahimi Pourasad e Walid Maalej (Universität Hamburg), "Does GenAI Make Usability Testing Obsolete?", ICSE 2025 (arXiv 2411.00634). https://arxiv.org/abs/2411.00634
- O que NÃO sustenta: Também não é persona simulada: é uma análise que depende do código-fonte. A amostra é pequena (2 apps simples e 10 participantes por app). Segundo os autores, nenhum participante tinha deficiência. A cobertura supõe que a lista de 110 problemas está completa, e os próprios autores dizem que isso é quase impossível. O estudo não diz se a IA acha os problemas mais graves.

### [3] Agentes simulados acharam 9 de 17 problemas plantados num site, contra 11 de 17 num relatório de pessoas leigas
- Tipo: EVIDÊNCIA (estudo pequeno) · origem: `01-usuarios-sinteticos-limites.md`, item 01.3
- Fonte: Steffen Holter (ETH Zurich), Eunyee Koh, Mustafa Doga Dogan, Gromit Yeuk-Yin Chan (Adobe Research), "UXCascade: Scalable Usability Testing with Simulated User Agents", UIST 2026 (arXiv 2601.15777). https://arxiv.org/html/2601.15777
- O que NÃO sustenta: Problemas plantados não são a mesma coisa que problemas que surgem no uso real. O estudo cobre só 1 protótipo de loja virtual, 8 profissionais e 10 leigos. A base de comparação foi um relatório escrito por leigos, e não um teste de usabilidade moderado. O estudo não mede tempo (minutos contra dias) nem trata de banco.

### [4] CONTRA a ideia do time: usuários simulados por IA dão uma nota errada ao produto e erram mais para certos grupos
- Tipo: EVIDÊNCIA · origem: `01-usuarios-sinteticos-limites.md`, item 01.6
- Fonte: Preethi Seshadri, Samuel Cahyawijaya, Ayomide Odumakinde, Sameer Singh, Seraphina Goldfarb-Tarrant (UC Irvine e Cohere), "Lost in Simulation: LLM-Simulated Users are Unreliable Proxies for Human Users in Agentic Evaluations", ACL 2026 (anais, volume 1, páginas 47423–47439). https://aclanthology.org/2026.acl-long.2192/ (texto: https://arxiv.org/html/2601.17087v1)
- O que NÃO sustenta: O estudo avalia um chatbot, numa conversa, e não telas de app. Foi feito só em inglês e num único tipo de serviço. Não testou português nem o Brasil.

### [5] CONTRA a ideia do time: a IA "fazendo papel" de um grupo tende a retratar o estereótipo visto de fora e a achatar as diferenças
- Tipo: EVIDÊNCIA · origem: `01-usuarios-sinteticos-limites.md`, item 01.7
- Fonte: Angelina Wang, Jamie Morgenstern, John P. Dickerson, "Large language models that replace human participants can harmfully misportray and flatten identity groups", Nature Machine Intelligence, 2025 (versão lida: arXiv 2402.01908, v3 de 03/02/2025). https://arxiv.org/abs/2402.01908
- O que NÃO sustenta: O estudo mede opiniões e respostas a perguntas, não o uso de telas. Os modelos são de 2023–2024. Não houve teste em português, nem medição de efeito num teste de usabilidade.

### [6] Analisar 5 sessões levou em média 22 horas por especialista, e especialistas diferentes acharam problemas bem diferentes nos mesmos vídeos
- Tipo: EVIDÊNCIA · origem: `02-teste-usabilidade-tempo-custo.md`, item 02.4
- Fonte: Morten Hertzum, Rolf Molich e Niels Ebbe Jacobsen, "What You Get Is What You See: Revisiting the Evaluator Effect in Usability Tests", Behaviour & Information Technology, v. 33, n. 2, 2014 (versão preprint do autor). https://mortenhertzum.dk/publ/BIT2014.pdf
- O que NÃO sustenta: foi testado um site de comércio eletrônico em inglês, não um app de banco. O estudo não mede custo em dinheiro e não fala de IA. Os próprios autores dizem que agrupar relatos como "o mesmo problema" envolve julgamento e pode mudar o tamanho do efeito. Também não mostra que o teste com pessoas seja inútil: os autores citam casos de melhora real com testes repetidos.

### [7] Com 60 participantes, grupos sorteados de 5 acharam de 55% a 99% dos problemas; com 20, o pior grupo achou 95%
- Tipo: EVIDÊNCIA · origem: `02-teste-usabilidade-tempo-custo.md`, item 02.7
- Fonte: Laura Faulkner, "Beyond the five-user assumption: Benefits of increased sample sizes in usability testing", Behavior Research Methods, Instruments, & Computers, v. 35, 2003. https://link.springer.com/article/10.3758/BF03195514
- O que NÃO sustenta: só o resumo foi lido, na página da editora. Foi testado um único sistema, não um app de banco. "Problemas" aqui são os que as 60 pessoas acharam juntas, não todos os que existem. O estudo não diz quantas pessoas bastam para o caso do time nem fala de custo.

### [8] (Ponto contra) Em 171 projetos recentes, corrigir mais tarde não custou consistentemente mais
- Tipo: EVIDÊNCIA · origem: `02-teste-usabilidade-tempo-custo.md`, item 02.9
- Fonte: Tim Menzies, William Nichols, Forrest Shull e Lucas Layman, "Are delayed issues harder to resolve? Revisiting cost-to-fix of defects throughout the lifecycle", Empirical Software Engineering, v. 22, n. 4, 2017 (preprint arXiv). https://arxiv.org/abs/1609.04886
- O que NÃO sustenta: os dados **não vão até depois do lançamento** (os autores dizem isso), então o estudo não compara antes e depois de lançar. Só inclui projetos com um processo maduro, e os autores não generalizam para outros contextos. Mede defeitos de software, não problemas de usabilidade. Não mede o custo para quem usa o app (erros, desistência, ligações ao atendimento). Não prova que corrigir tarde nunca custa mais.

### [9] Em experimento controlado, personas fizeram estudantes darem menos prioridade a funções prejudiciais
- Tipo: EVIDÊNCIA · origem: `03-personas-no-produto.md`, item 03.2
- Fonte: Bimpe Ayoola, Miikka Kuutila, Rina R. Wehbe e Paul Ralph, "User Personas Improve Social Sustainability by Encouraging Software Developers to Deprioritize Antisocial Features", 2024 (arXiv; aceito no ICSE 2025, segundo a página do arXiv). https://arxiv.org/abs/2412.10672 (texto completo lido em https://arxiv.org/html/2412.10672)
- O que NÃO sustenta: os participantes eram estudantes, não designers ou POs de banco; foi um caso só (reconhecimento facial), um conjunto só de personas e uma amostra de conveniência (os próprios autores citam esses limites). O estudo mede priorização de histórias, não a qualidade de telas nem se problemas de uso foram encontrados. O texto não deixa claro de que dados as personas foram feitas. Não diz nada sobre personas simuladas por IA.

### [10] Trocar a foto da persona muda pouco o estereótipo; quem lê a persona pesa mais
- Tipo: EVIDÊNCIA · origem: `03-personas-no-produto.md`, item 03.3
- Fonte: Monika Pröbster, Julia Hermann e Nicola Marsden (Mensch und Computer 2019), "Personas und Personen – Eine empirische Studie zur Stereotypisierung von Personas" (versão em inglês do título: "Personas and Persons – An Empirical Study on Stereotyping of Personas"), 2019. https://dl.gi.de/handle/20.500.12116/24651
- O que NÃO sustenta: li só o resumo (em alemão) na biblioteca digital da GI; não vi as tabelas, os tamanhos de efeito nem as medidas exatas. A amostra é de estudantes alemães de informática. O estudo não testou personas idosas nem personas usadas para avaliar telas.

### [11] A pesquisa em tecnologia costuma retratar pessoas idosas pelo declínio, o que repete estereótipos
- Tipo: EVIDÊNCIA · origem: `03-personas-no-produto.md`, item 03.4
- Fonte: John Vines, Gary Pritchard, Peter Wright, Patrick Olivier e Katie Brittain, "An Age-Old Problem: Examining the Discourses of Ageing in HCI and Strategies for Future Research", ACM TOCHI 22(1), 2015. https://eprints.ncl.ac.uk/211976 (versão dos autores lida em https://eprints.ncl.ac.uk/fulltext.aspx?url=211976%2f0C7E5FEB-21C0-45DC-97CD-F83A01F2C342.pdf)
- O que NÃO sustenta: analisa como artigos acadêmicos falam de idosos, não mede o efeito disso em produtos ou em personas de times reais. A busca exclui a conferência ASSETS (acessibilidade) e vai só até 2012. Não traz dados do Brasil nem de bancos.

### [12] Personas "baseadas em dados" de comportamento cresceram, mas ainda faltam formas de avaliá-las e de incluir diversidade
- Tipo: EVIDÊNCIA · origem: `03-personas-no-produto.md`, item 03.5
- Fonte: Joni Salminen, Kathleen W. Guan, Soon-gyo Jung e Bernard J. Jansen, "A Survey of 15 Years of Data-Driven Persona Development", International Journal of Human-Computer Interaction, 2021. https://doi.org/10.1080/10447318.2021.1908670 (a editora retornou erro 403; resumo lido em https://api.semanticscholar.org/graph/v1/paper/DOI:10.1080/10447318.2021.1908670?fields=title,abstract,year,authors,openAccessPdf,venue)
- O que NÃO sustenta: li só o resumo. A revisão não mostra que personas baseadas em dados geram produtos melhores; ela diz o contrário, que a avaliação ainda é uma lacuna. Não trata de personas simuladas por IA de forma específica nem de bancos.

### [13] No Brasil, só 54% das pessoas com 60 anos ou mais usam internet, e 52% dessas fizeram Pix
- Tipo: EVIDÊNCIA · origem: `03-personas-no-produto.md`, item 03.8
- Fonte: CGI.br / Cetic.br (NIC.br), "TIC Domicílios 2025", tabelas C2 e C6 (indivíduos), 2025. https://cetic.br/pt/tics/domicilios/2025/individuos/C2/ e https://cetic.br/pt/tics/domicilios/2025/individuos/C6/ (método e não usuários em https://cetic.br/media/analises/tic_domicilios_2025_principais_resultados.pdf)
- O que NÃO sustenta: não mede dificuldade de uso de telas, erros nem abandono de tarefa; mede se a pessoa declarou ter feito a atividade. Não traz dados de Pix agendado ou recorrente. Os números da tabela são arredondados e têm margem de erro (não conferi a margem de cada célula). Não é dado de nenhum banco.

### [14] Mais da metade dos idosos que usam internet não marcou nenhuma das habilidades digitais medidas
- Tipo: EVIDÊNCIA · origem: `03-personas-no-produto.md`, item 03.9
- Fonte: CGI.br / Cetic.br (NIC.br), "TIC Domicílios 2025", tabela I1A – Usuários de Internet, por tipo de habilidade digital, 2025. https://cetic.br/pt/tics/domicilios/2025/individuos/I1A/
- O que NÃO sustenta: habilidade é declarada pela pessoa, não observada. A lista não inclui tarefas bancárias nem Pix. Não conferi na tabela o período de referência exato das habilidades. Não mostra relação direta entre essas habilidades e erro em app de banco.

### [15] 3,1% da população tem muita dificuldade para enxergar mesmo de óculos, e quase metade das pessoas com deficiência tem 60 anos ou mais
- Tipo: EVIDÊNCIA · origem: `03-personas-no-produto.md`, item 03.10
- Fonte: IBGE, "Pessoas com deficiência 2022 – PNAD Contínua" (informativo), 2023. https://biblioteca.ibge.gov.br/visualizacao/livros/liv102013_informativo.pdf
- O que NÃO sustenta: quem tem só "alguma dificuldade" para enxergar ficou fora dos 3,1%, então o número de pessoas com algum grau de baixa visão é maior e não está medido aqui. Não há dado sobre uso de celular, apps de banco ou Pix por pessoas com baixa visão. Os dados são de 2022 e vêm de uma pesquisa amostral; outras pesquisas do IBGE com perguntas diferentes podem dar números diferentes (não conferido nesta rodada).

### [16] Limite: teste de clique em imagem parada se parece com o site real, menos quando há menus que abrem
- Tipo: EVIDÊNCIA (relatório com amostra e método descritos; não revisado por pares) · origem: `04-teste-primeiro-clique.md`, item 04.3
- Fonte: Jeff Sauro, Will Schiavone, David Du e Jim Lewis (MeasuringU), "Do Click Tests Predict Live Site Clicks?", 2023. https://measuringu.com/do-click-tests-predict-live-site-clicks/
- O que NÃO sustenta: testou sites no computador, não apps de celular. Mede só onde foi o primeiro clique, não se a pessoa concluiu a tarefa. Os participantes são pessoas reais, não personas simuladas por IA. O relatório não foi revisado por pares.

### [17] Esconder a navegação principal (menu hambúrguer) piorou a descoberta de conteúdo, o tempo e a dificuldade percebida
- Tipo: EVIDÊNCIA (relatório com metodologia publicada à parte; não revisado por pares) · origem: `04-teste-primeiro-clique.md`, item 04.4
- Fonte: Kara Pernice e Raluca Budiu (Nielsen Norman Group), "Hamburger Menus and Hidden Navigation Hurt UX Metrics", 2016. https://www.nngroup.com/articles/hamburger-menus/ e o documento de método "Hidden- and Visible-Navigation Study: Methodology", https://www.nngroup.com/articles/hidden-navigation-methodology/
- O que NÃO sustenta: o estudo trata da navegação geral de sites de notícias e de comércio, não de uma ação dentro de um app de banco, como agendar um Pix recorrente. No celular, a navegação totalmente visível não foi testada por completo. A amostra é britânica e de 2015, quando o ícone hambúrguer era menos conhecido (ver `04-teste-primeiro-clique.md`, item 04.10). A própria NN/g aceita esconder parte dos itens no celular quando há mais de 4 itens principais.

### [18] Idosos tiveram dificuldade para achar e entender o botão hambúrguer, mas usaram bem o menu depois de abri-lo
- Tipo: EVIDÊNCIA · origem: `04-teste-primeiro-clique.md`, item 04.5
- Fonte: Qingchuan Li e Yan Luximon, "Older adults' use of mobile device: usability challenges while navigating various interfaces", Behaviour & Information Technology, 2020 (online em 2019), v. 39, n. 8, p. 837-861. Versão aceita do artigo: https://ira.lib.polyu.edu.hk/bitstream/10397/105044/1/Li_Older_Adults_Use.pdf
- O que NÃO sustenta: a amostra é pequena e tem escolaridade e familiaridade digital altas; os próprios autores pedem cautela ao aplicar os resultados a iniciantes ou a idosos com baixo letramento. Os apps não são de banco, o estudo foi feito em Hong Kong com apps de 2018-2019 e não houve grupo de jovens para comparar.

### [19] Com rótulo de texto, o acerto na interpretação de ícones quase dobrou, tanto em jovens quanto em idosos
- Tipo: EVIDÊNCIA · origem: `04-teste-primeiro-clique.md`, item 04.7
- Fonte: Rock Leung, Joanna McGrenere e Peter Graf, "Age-related differences in the initial usability of mobile device icons", Behaviour & Information Technology, 2011, v. 30, n. 5, p. 629-642. https://www.cs.ubc.ca/labs/edapt/papers/leung2011.pdf
- O que NÃO sustenta: os ícones foram mostrados ampliados e impressos em papel; os próprios autores dizem que isso limita a validade para o uso real. O estudo mede o primeiro contato, não o uso repetido. Os ícones são de 2007-2008, e não foram testados apps de banco nem uma tarefa completa.

### [20] Na União Europeia, o dever de avisar e rotular IA vale desde 2/8/2026, mas mira sobretudo conteúdo exposto a pessoas e ao público
- Tipo: EVIDÊNCIA (texto oficial da norma; mostra o que a lei exige, não que funciona) · origem: `05-governanca-agentes.md`, item 05.4
- Fonte: Comissão Europeia, "Transparency obligations under Article 50 of the AI Act" (perguntas e respostas oficiais), atualizado em 24/07/2026. https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act (texto do artigo reproduzido em https://artificialintelligenceact.eu/article/50/)
- O que NÃO sustenta: Pela letra da lei, nada obriga uma ferramenta interna, cujos textos não são publicados para o público, a rotular cada saída. A FAQ não trata de documentos internos; isso é interpretação nossa, não confirmação. A lei vale para quem atua no mercado europeu, não no Brasil. Ela também não mostra que rotular funciona (ver `05-governanca-agentes.md`, item 05.9).

### [21] No Brasil, o PL 2338/2023 prevê supervisão humana proporcional ao risco e identificação de conteúdo sintético, mas ainda não é lei
- Tipo: EVIDÊNCIA (texto oficial do projeto e ficha de tramitação; é projeto, não lei) · origem: `05-governanca-agentes.md`, item 05.5
- Fonte: Senado Federal / Câmara dos Deputados, "PL 2338/2023: texto aprovado pelo Senado e apresentado na Câmara", 17/03/2025. https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=2868197&filename=PL+2338%2F2023 (tramitação: https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262 e https://www25.senado.leg.br/web/atividade/materias/-/materia/157233)
- O que NÃO sustenta: O projeto não é lei e o texto ainda pode mudar na Câmara. Dizer que a vila não é de alto risco é interpretação nossa: a lista não fala em design de telas, e a classificação final depende de regulamento (art. 15). O texto também não define o formato do identificador.

### [22] Pela LGPD, dado anonimizado não é dado pessoal, mas persona feita a partir de gente real ou prompt com dado real volta a ser caso de LGPD
- Tipo: EVIDÊNCIA (texto legal oficial) · origem: `05-governanca-agentes.md`, item 05.6
- Fonte: Presidência da República, "Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais)", 2018. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- O que NÃO sustenta: A lei não garante que as personas estejam livres de dado pessoal. Se forem montadas a partir de entrevistas, gravações ou pesquisas com pessoas reais, ou se alguém colar dado real no prompt, a LGPD volta a valer. A ANPD alerta que conteúdo sintético pode parecer dado pessoal ou ser ligado por engano a uma pessoa real, que ele não foi feito para anonimizar e que dados pessoais colados em prompts também são tratamento de dados (ANPD, "Radar Tecnológico n. 3: Inteligência artificial generativa", nov. 2024, https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/radar_tecnologico_ia_generativa_anpd.pdf/@@download/file). A própria série diz que não firma posição institucional da ANPD. Nada disto é parecer jurídico.

### [23] Banco Central: pesquisa com 606 instituições mostra que a gestão de riscos de IA ainda é incipiente no setor, e o BC diz estudar o tema para uma possível regulação futura
- Tipo: EVIDÊNCIA (pesquisa oficial com amostra e período descritos; respostas autodeclaradas) · origem: `05-governanca-agentes.md`, item 05.7
- Fonte: Banco Central do Brasil, "Relatório de Estabilidade Financeira, v. 24, n. 2, seção 2.1: Pesquisa sobre o uso de inteligência artificial no Sistema Financeiro Nacional", novembro de 2025. https://www.bcb.gov.br/content/publicacoes/ref/202510/RELESTAB202510-refPub.pdf
- O que NÃO sustenta: O relatório não é uma norma e não cria obrigação. As respostas são autodeclaradas pelas instituições e os dados são de 2025. O relatório não trata de ferramentas de design nem de personas, e não mostra o que um banco específico faz. Não encontramos uma regra do BC específica sobre IA (ver as Lacunas de `05-governanca-agentes.md`).

### [24] Ter um humano no controle não basta: uma revisão sistemática mostra que as pessoas tendem a confiar demais na automação
- Tipo: EVIDÊNCIA (revisão sistemática revisada por pares; lemos só o resumo) · origem: `05-governanca-agentes.md`, item 05.8
- Fonte: Kate Goddard, Abdul Roudsari, Jeremy C. Wyatt, "Automation bias: a systematic review of frequency, effect mediators, and mitigators", Journal of the American Medical Informatics Association (JAMIA), 19(1):121-127, 2012. https://academic.oup.com/jamia/article-abstract/19/1/121/732254
- O que NÃO sustenta: Os estudos são da área da saúde e anteriores aos LLMs (a revisão é de 2012). Não medem designers nem personas simuladas. Lemos só o resumo, que não dá uma taxa única de ocorrência do viés.

### [25] O rótulo "gerado por IA" tem efeito colateral: reduz a confiança mesmo em conteúdo verdadeiro, porque as pessoas supõem que não houve humano
- Tipo: EVIDÊNCIA (dois experimentos pré-registrados, revisão por pares) · origem: `05-governanca-agentes.md`, item 05.9
- Fonte: Sacha Altay, Fabrizio Gilardi, "People are skeptical of headlines labeled as AI-generated, even if true or human-made, because they assume full AI automation", PNAS Nexus, 3(10), 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC11443540/
- O que NÃO sustenta: O estudo usou manchetes de notícias para o público geral, não uma ferramenta interna de design. Foi feito só nos EUA e no Reino Unido, e os autores dizem que as atitudes podem ser diferentes em outros países, citando Brasil e México. Não testou rótulos em relatórios de usabilidade.

### [26] Quando a IA diz "não tenho certeza, mas...", as pessoas confiam menos em respostas erradas e acertam mais
- Tipo: EVIDÊNCIA (experimento pré-registrado, conferência com revisão por pares; lemos só o resumo) · origem: `05-governanca-agentes.md`, item 05.10
- Fonte: Sunnie S. Y. Kim, Q. Vera Liao, Mihaela Vorvoreanu, Stephanie Ballard, Jennifer Wortman Vaughan, "'I'm Not Sure, But...': Examining the Impact of Large Language Models' Uncertainty Expression on User Reliance and Trust", ACM FAccT 2024. https://arxiv.org/abs/2405.00623
- O que NÃO sustenta: A tarefa foi responder perguntas médicas, não avaliar telas. Lemos só o resumo e não conferimos o tamanho dos efeitos. Não sabemos o efeito sobre a confiança nos achados corretos da vila.
