# 03 · personas-no-produto · rodada 1
Pergunta: Como times de produto usam personas no design? Há evidência de que funcionam? Quais as críticas (estereótipos, personas fictícias sem dados)? Personas baseadas em comportamento. Como considerar pessoas idosas, baixa visão e baixa familiaridade digital em apps bancários/Pix no Brasil?
Data da busca: 2026-09-26

## Resumo em 3 linhas
A evidência de que personas melhoram o produto final é pequena: há um experimento controlado a favor (com estudantes) e estudos com profissionais mostrando que personas servem mais para comunicar do que para decidir o design.
As críticas mais sólidas são: personas feitas sem dados repetem as suposições do time, e a imagem de "idoso" usada em pesquisa de tecnologia costuma ser estereotipada (declínio, dependência). Revisões pedem personas baseadas em dados de comportamento, mas também apontam falta de métodos de avaliação.
No Brasil, dados oficiais mostram que o público 60+ é bem diferente da média: só 54% usam internet, 52% dos que usam fizeram Pix e 57% dos que usam não marcaram nenhuma das habilidades digitais medidas. Isso justifica ter personas idosas e de baixa visão, mas não substitui testar com essas pessoas.

## Itens

### [03.1] Profissionais experientes usam personas quase só para comunicar, e não para desenhar
- Tipo: INDÍCIO
- Fonte: Tara Matthews, Tejinder K. Judge e Steve Whittaker (CHI 2012), "How do designers and user experience professionals actually perceive and use personas?", 2012. https://research.ibm.com/publications/how-do-designers-and-user-experience-professionals-actually-perceive-and-use-personas (DOI: https://doi.org/10.1145/2207676.2208573)
- O que diz (paráfrase): estudo com profissionais de design centrado no usuário que já tinham usado personas na indústria de software. Eles usavam personas quase só para comunicação com outras áreas, e não para tomar decisões de design. Os participantes acharam as personas abstratas, impessoais, enganosas e dispersivas. Os autores concluem que personas não substituem o contato direto com dados reais de usuários e que é mais importante evitar atributos que enganam do que caprichar para a persona parecer "viva".
- O que sustenta para o time: é um ponto CONTRA a ideia de apoiar decisões de tela só em personas. Reforça que a vila deve ser apresentada como apoio para priorizar o que levar ao teste, e não como substituta de dados de pessoas reais. Também alerta que detalhes "decorativos" de persona (nome, hobby, foto) podem distrair.
- O que NÃO sustenta: não li o texto completo (a página da ACM retornou erro 403); li só o resumo publicado pela IBM Research. Por isso não conferi o número de participantes, como foram escolhidos nem o método de análise. O estudo é de 2012 e trata de personas escritas por pessoas, não de personas simuladas por IA. Não mede efeito no produto. Classificado como INDÍCIO só porque o método não pôde ser conferido; pode virar EVIDÊNCIA se alguém ler o artigo completo.
- Verificação: pendente

### [03.2] Em experimento controlado, personas fizeram estudantes darem menos prioridade a funções prejudiciais
- Tipo: EVIDÊNCIA
- Fonte: Bimpe Ayoola, Miikka Kuutila, Rina R. Wehbe e Paul Ralph, "User Personas Improve Social Sustainability by Encouraging Software Developers to Deprioritize Antisocial Features", 2024 (arXiv; aceito no ICSE 2025, segundo a página do arXiv). https://arxiv.org/abs/2412.10672 (texto completo lido em https://arxiv.org/html/2412.10672)
- O que diz (paráfrase): experimento randomizado com 79 estudantes de graduação em computação, divididos em 4 grupos (controle: 20; só mapa de partes interessadas: 19; só personas: 16; os dois: 24). Cada pessoa ordenava por prioridade uma lista de histórias de usuário de um sistema de reconhecimento facial para shopping. Quem recebeu personas deu prioridade significativamente menor às histórias "antissociais" (coeficiente −0,8672, p = 0,009; razão de chances 0,42, ou seja, chance 58% menor de dar prioridade alta a essas histórias). O mapa de partes interessadas não teve efeito significativo. Não houve diferença relevante para histórias "pró-sociais".
- O que sustenta para o time: é um dos poucos resultados experimentais de que personas mudam decisões de priorização, e não só a "empatia" declarada. Apoia a ideia de que colocar pessoas concretas na frente do time muda o que ele escolhe.
- O que NÃO sustenta: os participantes eram estudantes, não designers ou POs de banco; foi um caso só (reconhecimento facial), um conjunto só de personas e uma amostra de conveniência (os próprios autores citam esses limites). O estudo mede priorização de histórias, não a qualidade de telas nem se problemas de uso foram encontrados. O texto não deixa claro de que dados as personas foram feitas. Não diz nada sobre personas simuladas por IA.
- Verificação: pendente

### [03.3] Trocar a foto da persona muda pouco o estereótipo; quem lê a persona pesa mais
- Tipo: EVIDÊNCIA
- Fonte: Monika Pröbster, Julia Hermann e Nicola Marsden (Mensch und Computer 2019), "Personas und Personen – Eine empirische Studie zur Stereotypisierung von Personas" (versão em inglês do título: "Personas and Persons – An Empirical Study on Stereotyping of Personas"), 2019. https://dl.gi.de/handle/20.500.12116/24651
- O que diz (paráfrase): estudo com rastreamento do olhar (eye tracking) com 93 estudantes de cursos de informática. Todos receberam a mesma descrição de persona, mudando só a imagem: foto de mulher negra, foto de mulher branca, desenho ou nenhuma imagem. O tipo de imagem teve influência limitada na forma como a persona foi percebida e, em parte, reduziu estereótipos. O gênero e a origem cultural de quem lia a persona tiveram influência importante.
- O que sustenta para o time: o risco de estereótipo não se resolve só trocando a foto ou o avatar. Quem monta e quem lê as personas (a própria equipe) também gera viés. Isso vale para a vila: revisar como as personas idosas ou de baixa visão são descritas, não só como aparecem.
- O que NÃO sustenta: li só o resumo (em alemão) na biblioteca digital da GI; não vi as tabelas, os tamanhos de efeito nem as medidas exatas. A amostra é de estudantes alemães de informática. O estudo não testou personas idosas nem personas usadas para avaliar telas.
- Verificação: pendente

### [03.4] A pesquisa em tecnologia costuma retratar pessoas idosas pelo declínio, o que repete estereótipos
- Tipo: EVIDÊNCIA
- Fonte: John Vines, Gary Pritchard, Peter Wright, Patrick Olivier e Katie Brittain, "An Age-Old Problem: Examining the Discourses of Ageing in HCI and Strategies for Future Research", ACM TOCHI 22(1), 2015. https://eprints.ncl.ac.uk/211976 (versão dos autores lida em https://eprints.ncl.ac.uk/fulltext.aspx?url=211976%2f0C7E5FEB-21C0-45DC-97CD-F83A01F2C342.pdf)
- O que diz (paráfrase): análise de discurso de 644 artigos de conferências e revistas da comunidade ACM SIGCHI (busca feita em 22/03/2013, cobrindo cerca de 30 anos; 162 artigos tinham o envelhecimento como tema principal). O envelhecimento aparece quase sempre como um "problema" a ser resolvido por tecnologia: custos de saúde, isolamento social e perda de capacidades e de desempenho com tecnologia. Os autores mostram que isso repete estereótipos já criticados na gerontologia e propõem tratar a pessoa idosa como agente ativo, de um grupo diverso e com experiência.
- O que sustenta para o time: é um alerta CONTRA criar a persona "idosa" como alguém lento, frágil e confuso por definição. Para o Pix, faz sentido separar as dificuldades (enxergar pouco, não conhecer o app, medo de golpe) em vez de juntar tudo na idade.
- O que NÃO sustenta: analisa como artigos acadêmicos falam de idosos, não mede o efeito disso em produtos ou em personas de times reais. A busca exclui a conferência ASSETS (acessibilidade) e vai só até 2012. Não traz dados do Brasil nem de bancos.
- Verificação: pendente

### [03.5] Personas "baseadas em dados" de comportamento cresceram, mas ainda faltam formas de avaliá-las e de incluir diversidade
- Tipo: EVIDÊNCIA
- Fonte: Joni Salminen, Kathleen W. Guan, Soon-gyo Jung e Bernard J. Jansen, "A Survey of 15 Years of Data-Driven Persona Development", International Journal of Human-Computer Interaction, 2021. https://doi.org/10.1080/10447318.2021.1908670 (a editora retornou erro 403; resumo lido em https://api.semanticscholar.org/graph/v1/paper/DOI:10.1080/10447318.2021.1908670?fields=title,abstract,year,authors,openAccessPdf,venue)
- O que diz (paráfrase): revisão de 77 artigos de pesquisa sobre personas feitas a partir de dados (comportamento e dados demográficos de segmentos de usuários), publicados de 2005 a 2020. Os autores veem três fases (primeiros testes quantitativos; mais variedade de dados e algoritmos; uso de muitos dados online e ciência de dados). Apontam lacunas em: recursos compartilhados, métodos de avaliação, padronização, atenção à inclusão e risco de perder o entendimento profundo das pessoas.
- O que sustenta para o time: existe uma linha de pesquisa estabelecida de personas feitas de dados de comportamento, que é o caminho recomendado para fugir da persona "inventada". Também mostra que até essa linha tem pouca avaliação e pouca atenção à inclusão, então a vila precisa dizer de onde vem cada persona e como foi checada.
- O que NÃO sustenta: li só o resumo. A revisão não mostra que personas baseadas em dados geram produtos melhores; ela diz o contrário, que a avaliação ainda é uma lacuna. Não trata de personas simuladas por IA de forma específica nem de bancos.
- Verificação: pendente

### [03.6] Persona montada só com suposições do time tende a ser imprecisa e a confirmar o que o time já acha
- Tipo: OPINIÃO
- Fonte: Page Laubheimer (Nielsen Norman Group), "3 Persona Types: Lightweight, Qualitative, and Statistical", 2020. https://www.nngroup.com/articles/persona-types/
- O que diz (paráfrase): descreve três tipos. (1) "Proto-personas": feitas em oficina de 2 a 4 horas, sem pesquisa nova; são rápidas e baratas, mas muitas vezes imprecisas e podem virar uma "câmara de eco" das suposições erradas do time. (2) Qualitativas: a partir de entrevistas com 5 a 30 usuários, recomendadas para a maioria dos times. (3) Estatísticas: questionário com pelo menos 100 respondentes (idealmente 500 ou mais) e análise de agrupamento; mais caras, e muitas vezes chegam a resultados parecidos com as qualitativas.
- O que sustenta para o time: dá uma régua simples para rotular cada persona da vila (suposição, entrevista ou dado estatístico) e mostra o risco de personas fictícias sem dados. Ajuda a responder "de onde veio essa persona?" na apresentação.
- O que NÃO sustenta: é um guia de consultoria, sem estudo próprio que compare os três tipos. Os números (5 a 30 entrevistas; 100 a 500 respondentes) são recomendações, não resultados medidos. Não fala de idosos, acessibilidade nem de IA.
- Verificação: pendente

### [03.7] Personas de acessibilidade do governo britânico incluem baixa visão e pessoa idosa, mas avisam que não substituem testes com pessoas reais
- Tipo: OPINIÃO
- Fonte: Government Digital Service (GDS), governo do Reino Unido, "Accessibility personas", sem data na página (a página cita um post de blog de 2019). https://alphagov.github.io/accessibility-personas/ (também lidas https://alphagov.github.io/accessibility-personas/claudia/ e https://alphagov.github.io/accessibility-personas/ron/)
- O que diz (paráfrase): conjunto de 7 personas de acessibilidade para a equipe simular a experiência de uso. Entre elas: Claudia, 54 anos, com visão parcial, que usa ampliador de tela e muda as cores para aumentar o contraste; e Ron, 82 anos, com artrite, perda auditiva, catarata e próteses de quadril, que não usa nenhuma tecnologia assistiva e é descrito como pouco familiarizado com tecnologia (não sabe, por exemplo, que pode dar zoom). A página avisa que isso não substitui incluir pessoas com necessidades de acesso nos testes e que uma simulação nunca representa de verdade uma deficiência.
- O que sustenta para o time: é um modelo prático, de órgão público, de como descrever personas por necessidade de acesso e comportamento (usa ampliador, não conhece recursos de acessibilidade), e não só por idade. O caso de Ron ajuda a separar "idade" de "baixa familiaridade digital". O aviso oficial também é um ponto CONTRA usar personas simuladas como resposta final.
- O que NÃO sustenta: é material de treinamento, sem dados sobre quanto essas personas ajudam a achar problemas. É do Reino Unido, não do Brasil, e não trata de apps de banco ou Pix.
- Verificação: pendente

### [03.8] No Brasil, só 54% das pessoas com 60 anos ou mais usam internet, e 52% dessas fizeram Pix
- Tipo: EVIDÊNCIA
- Fonte: CGI.br / Cetic.br (NIC.br), "TIC Domicílios 2025", tabelas C2 e C6 (indivíduos), 2025. https://cetic.br/pt/tics/domicilios/2025/individuos/C2/ e https://cetic.br/pt/tics/domicilios/2025/individuos/C6/ (método e não usuários em https://cetic.br/media/analises/tic_domicilios_2025_principais_resultados.pdf)
- O que diz (paráfrase): pesquisa nacional com entrevistas presenciais (27.177 domicílios e 24.535 indivíduos, coleta de março a agosto de 2025). Na população com 60 anos ou mais, 54% são usuários de internet (acesso há menos de 3 meses) e 38% nunca acessaram (na população total: 85% e 10%). Entre os usuários de internet com 60 anos ou mais, 52% fizeram pagamento ou transferência por Pix e 35% fizeram consultas, pagamentos ou outras transações financeiras; no total de usuários, 75% e 58%; na faixa de 45 a 59 anos, 73% e 57%. A apresentação dos resultados mostra 28 milhões de não usuários de internet, dos quais 16 milhões têm 60 anos ou mais.
- O que sustenta para o time: dado oficial de que o público 60+ é bem diferente da média no uso de internet e de Pix, o que justifica ter na vila personas idosas com pouca prática. Também mostra que "idoso" não é um grupo único: metade dos idosos que usam internet já faz Pix.
- O que NÃO sustenta: não mede dificuldade de uso de telas, erros nem abandono de tarefa; mede se a pessoa declarou ter feito a atividade. Não traz dados de Pix agendado ou recorrente. Os números da tabela são arredondados e têm margem de erro (não conferi a margem de cada célula). Não é dado de nenhum banco.
- Verificação: pendente

### [03.9] Mais da metade dos idosos que usam internet não marcou nenhuma das habilidades digitais medidas
- Tipo: EVIDÊNCIA
- Fonte: CGI.br / Cetic.br (NIC.br), "TIC Domicílios 2025", tabela I1A – Usuários de Internet, por tipo de habilidade digital, 2025. https://cetic.br/pt/tics/domicilios/2025/individuos/I1A/
- O que diz (paráfrase): entre os usuários de internet com 60 anos ou mais, 57% responderam "nenhuma das opções" da lista de habilidades digitais (no total de usuários, 29%; de 45 a 59 anos, 36%). Na mesma faixa 60+: 23% adotaram medidas de segurança (total: 46%), 27% verificaram informação na internet (total: 50%), 18% anexaram documento, imagem ou vídeo (total: 34%) e 12% instalaram programas ou aplicativos (total: 37%). Mesma amostra e método do item 03.8.
- O que sustenta para o time: dá base oficial para uma persona de "baixa familiaridade digital" que não é rara no 60+: muitos usam internet sem dominar tarefas básicas como anexar arquivo ou instalar aplicativo. Ajuda a justificar telas com passos explícitos e sem funções escondidas.
- O que NÃO sustenta: habilidade é declarada pela pessoa, não observada. A lista não inclui tarefas bancárias nem Pix. Não conferi na tabela o período de referência exato das habilidades. Não mostra relação direta entre essas habilidades e erro em app de banco.
- Verificação: pendente

### [03.10] 3,1% da população tem muita dificuldade para enxergar mesmo de óculos, e quase metade das pessoas com deficiência tem 60 anos ou mais
- Tipo: EVIDÊNCIA
- Fonte: IBGE, "Pessoas com deficiência 2022 – PNAD Contínua" (informativo), 2023. https://biblioteca.ibge.gov.br/visualizacao/livros/liv102013_informativo.pdf
- O que diz (paráfrase): em 2022, 18,6 milhões de pessoas de 2 anos ou mais tinham deficiência no Brasil (8,9% dessa faixa). Foi considerada com deficiência quem respondeu ter "muita dificuldade" ou "não conseguir de modo algum" em pelo menos uma função (perguntas do Grupo de Washington). 3,1% relataram essa dificuldade para enxergar, mesmo usando óculos ou lentes de contato. Entre as pessoas com deficiência, 47,2% tinham 60 anos ou mais (entre as sem deficiência, 12,5%). O IBGE diz que as dificuldades para enxergar ficam mais evidentes por volta dos 40 anos.
- O que sustenta para o time: dado oficial de que baixa visão e idade se sobrepõem, o que justifica uma persona com baixa visão (e não só "idosa") na vila, e testar contraste, tamanho de letra e zoom nas telas de Pix.
- O que NÃO sustenta: quem tem só "alguma dificuldade" para enxergar ficou fora dos 3,1%, então o número de pessoas com algum grau de baixa visão é maior e não está medido aqui. Não há dado sobre uso de celular, apps de banco ou Pix por pessoas com baixa visão. Os dados são de 2022 e vêm de uma pesquisa amostral; outras pesquisas do IBGE com perguntas diferentes podem dar números diferentes (não conferido nesta rodada).
- Verificação: pendente

## Lacunas
- Evidência de que personas funcionam é fraca: só um experimento controlado aberto nesta sessão (03.2), com estudantes e um único caso. Não achei estudo que mostre personas aumentando a quantidade de problemas de uso encontrados antes do teste com pessoas.
- Críticas clássicas não puderam ser lidas: Friess (CHI 2012, sobre personas quase não aparecerem nas discussões de decisão) e Chapman e Milham (2006, "The Personas' New Clothes") ficaram de fora porque ACM, SAGE e ResearchGate retornaram erro 403. Do Matthews et al. (03.1) li só o resumo.
- Personas baseadas em comportamento: só há uma revisão (03.5) e guias (03.6, 03.7). Não achei estudo que compare, com medida, personas de comportamento contra personas demográficas.
- Não achei nenhum estudo sobre personas em apps de banco ou Pix no Brasil.
- Banco Central: não abri dados oficiais do BCB sobre uso de Pix por idade nem sobre Pix Automático/agendado. Uma pesquisa Ipsos-Ipec (2026) citada na imprensa fala em 48% de uso de Pix entre pessoas com 60+, mas não abri a fonte primária, então não entrou.
- Baixa visão: não há dado oficial brasileiro sobre como pessoas com baixa visão usam celular ou app de banco; 03.10 dá só a prevalência.
- Todo o material sobre personas é sobre personas escritas por pessoas; a relação com personas simuladas por IA está no tema 01.
