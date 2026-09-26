# 04 · teste-primeiro-clique · rodada 1
Pergunta: O que a pesquisa diz sobre o teste do primeiro clique (first-click testing; ex.: Bob Bailey e Cari Wolfson sobre a relação entre acertar o primeiro clique e concluir a tarefa)? E sobre funções escondidas em menus ("Mais opções", menus hambúrguer, descoberta de funcionalidades) e ícones sem texto versus ícones com rótulo de texto (NN/g, estudos de reconhecimento de ícones)?
Data da busca: 2026-09-26

## Resumo em 3 linhas
Quem acerta o primeiro clique conclui a tarefa com muito mais frequência: 0,87 contra 0,46 em 12 estudos de Bailey e Wolfson, e 70% contra 24% em dados de uma fornecedora. Isso é associação, não causa, e o método dessas fontes é pouco detalhado.
Esconder funções em menus (hambúrguer, "Mais opções") reduziu a descoberta de conteúdo e aumentou o tempo das tarefas (NN/g, 179 pessoas). Idosos falharam ao procurar a entrada do menu (22 idosos, 29,0% de falhas). Com rótulo de texto, o acerto na interpretação de ícones foi de 45% para 78% (36 pessoas).
Limites importantes: teste de clique em imagem parada diverge do app real justamente nos menus que abrem (até 40%); o ícone hambúrguer hoje é mais reconhecido; e, numa busca visual rápida, ícone sem texto pode ser mais eficiente.

## Itens

### [04.1] Acertar o primeiro clique veio junto com cerca de 2 vezes mais chance de concluir a tarefa (Bailey e Wolfson)
- Tipo: INDÍCIO
- Fonte: Bob Bailey, "FirstClick Usability Testing" (post no site Web Usability), 2013. Lido em cópia do Internet Archive, porque o site original está fora do ar: http://web.archive.org/web/20160104004642/http://webusability.com/firstclick-usability-testing/
- O que diz (paráfrase): Bailey conta que ele e Cari Wolfson criaram o teste em 2006, no redesenho do site do CDC (órgão de saúde dos EUA). De 2007 a 2009 aplicaram o teste em outras agências do governo americano. Juntaram dados de 12 estudos de usabilidade, cada um num site diferente e com participantes diferentes. Com o primeiro clique certo, a probabilidade de acertar a tarefa inteira foi de 0,87, variando de 0,72 a 1,00 entre os estudos. Com o primeiro clique errado, foi de 0,46, variando de 0,29 a 0,70. Os autores resumem que acertar o primeiro clique deixava a pessoa cerca de 2 vezes mais propensa a ter sucesso. Cada cenário levava menos de 30 segundos. Num dos testes, cada participante fez 136 cenários em 1 hora.
- O que sustenta para o time: o local do primeiro clique é um sinal barato e rápido que anda junto com o sucesso na tarefa. Isso justifica usar o "primeiro clique" como métrica ao comparar as telas A, B e C do protótipo ("agendar um Pix que se repete todo mês").
- O que NÃO sustenta: o post não diz o total de participantes nem como o "sucesso" foi definido em cada estudo. Mostra uma associação, não uma causa: errar o primeiro clique não provoca a falha, e 46% ainda concluíram a tarefa. Os dados vêm de sites do governo dos EUA entre 2006 e 2009, no computador, e não de apps de banco no celular. Não fala de IA nem de personas simuladas. Não consegui abrir o artigo revisado por pares sobre o tema (Bailey, Wolfson, Nall e Koyani, HCI International 2009): Springer e ACM bloquearam o acesso.
- Verificação: pendente

### [04.2] Dados de uma fornecedora de ferramentas repetem a direção do achado, com números mais baixos
- Tipo: INDÍCIO
- Fonte: Optimal Workshop, "First Click Testing Data: Correct First Click Lead to 3X Higher Task Success", 2015 (página revista depois). https://www.optimalworkshop.com/blog/correct-first-click-lead-to-3x-higher-task-success
- O que diz (paráfrase): em 2015, a empresa, que vende ferramentas de teste, analisou "milhões" de respostas de tarefas feitas em testes de árvore (tree testing). Nesse tipo de teste a pessoa navega por um menu só de texto, sem o visual da tela. Quem acertou o primeiro clique concluiu a tarefa em 70% dos casos. Quem errou concluiu em 24%, ou seja, quase 3 vezes menos.
- O que sustenta para o time: a relação entre primeiro clique e sucesso aparece de novo em outra base e em outro tipo de teste. Também mostra que o tamanho do efeito muda bastante conforme o contexto (87%/46% contra 70%/24%).
- O que NÃO sustenta: o método é pouco descrito, sem número exato de estudos ou de participantes e sem teste estatístico. A autora é uma empresa que vende a ferramenta, o que é um conflito de interesse. O teste de árvore mede só a estrutura do menu em texto, sem ícones, cores ou layout. Os dados são de 2015, e a própria empresa admite que são anteriores às tendências recentes de interface.
- Verificação: pendente

### [04.3] Limite: teste de clique em imagem parada se parece com o site real, menos quando há menus que abrem
- Tipo: EVIDÊNCIA (relatório com amostra e método descritos; não revisado por pares)
- Fonte: Jeff Sauro, Will Schiavone, David Du e Jim Lewis (MeasuringU), "Do Click Tests Predict Live Site Clicks?", 2023. https://measuringu.com/do-click-tests-predict-live-site-clicks/
- O que diz (paráfrase): em fevereiro de 2023, 130 participantes de um painel online dos EUA foram sorteados para fazer 5 tarefas em 5 sites. Um grupo usou o site real (68 pessoas) e o outro, uma imagem parada da página (62 pessoas). Em média, o local do primeiro clique diferiu cerca de 6% entre os grupos pela contagem flexível e 7% pela estrita. Das 28 regiões da tela analisadas, só 4 tiveram diferença estatisticamente significativa na contagem flexível. A maior diferença, porém, foi de 23% (flexível) e chegou a 40% (estrita), no menu "About" do site da NASA. No site real, muita gente passou o mouse ou clicou nesse menu e abriu um submenu que não existia na imagem. Os autores dizem que os cerca de 6% são o melhor cenário possível, porque as tarefas eram simples e feitas na página inicial.
- O que sustenta para o time: comparar telas paradas pelo primeiro clique é razoável em tarefas simples. Serve também de ALERTA: telas paradas (como as telas A, B e C) não mostram bem menus que abrem, "Mais opções" e submenus. É justamente aí que ficam as funções escondidas, e nesses pontos o resultado pode divergir do app real.
- O que NÃO sustenta: testou sites no computador, não apps de celular. Mede só onde foi o primeiro clique, não se a pessoa concluiu a tarefa. Os participantes são pessoas reais, não personas simuladas por IA. O relatório não foi revisado por pares.
- Verificação: pendente

### [04.4] Esconder a navegação principal (menu hambúrguer) piorou a descoberta de conteúdo, o tempo e a dificuldade percebida
- Tipo: EVIDÊNCIA (relatório com metodologia publicada à parte; não revisado por pares)
- Fonte: Kara Pernice e Raluca Budiu (Nielsen Norman Group), "Hamburger Menus and Hidden Navigation Hurt UX Metrics", 2016. https://www.nngroup.com/articles/hamburger-menus/ e o documento de método "Hidden- and Visible-Navigation Study: Methodology", https://www.nngroup.com/articles/hidden-navigation-methodology/
- O que diz (paráfrase): estudo quantitativo remoto feito em dezembro de 2015 pela plataforma WhatUsersDo, no Reino Unido. Foram 179 participantes (80 no celular e 99 no computador) em 6 sites, sem pedir que pensassem em voz alta. Com a navegação escondida, a descoberta de conteúdo caiu mais de 20%, com diferença estatisticamente significativa no celular e no computador.
  - No computador, o menu escondido foi usado em 27% dos casos, contra 48% da navegação visível e 50% da combinada (parte visível, parte escondida). As pessoas foram pelo menos 39% mais lentas.
  - No celular, o menu escondido foi usado em 57% dos casos, contra 86% da navegação combinada. As pessoas foram 15% mais lentas.
  - A dificuldade relatada subiu 21% em relação à navegação visível e 11% em relação à combinada.
  - Motivos apontados: o ícone pequeno chama pouca atenção, não diz o que tem dentro e obriga a pessoa a abri-lo para descobrir.
- O que sustenta para o time: funções importantes guardadas atrás de menus tendem a ser menos encontradas. Esse é um critério concreto para a vila apontar. O efeito também aparece no celular, embora menor que no computador.
- O que NÃO sustenta: o estudo trata da navegação geral de sites de notícias e de comércio, não de uma ação dentro de um app de banco, como agendar um Pix recorrente. No celular, a navegação totalmente visível não foi testada por completo. A amostra é britânica e de 2015, quando o ícone hambúrguer era menos conhecido (ver 04.10). A própria NN/g aceita esconder parte dos itens no celular quando há mais de 4 itens principais.
- Verificação: pendente

### [04.5] Idosos tiveram dificuldade para achar e entender o botão hambúrguer, mas usaram bem o menu depois de abri-lo
- Tipo: EVIDÊNCIA
- Fonte: Qingchuan Li e Yan Luximon, "Older adults' use of mobile device: usability challenges while navigating various interfaces", Behaviour & Information Technology, 2020 (online em 2019), v. 39, n. 8, p. 837-861. Versão aceita do artigo: https://ira.lib.polyu.edu.hk/bitstream/10397/105044/1/Li_Older_Adults_Use.pdf
- O que diz (paráfrase): teste de usabilidade individual e entrevistas com 22 idosos de Hong Kong, de 60 a 84 anos (média de 71,05). Eles fizeram 19 tarefas em apps reais (WhatsApp, myTV SUPER e Flipboard).
  - Ao procurar a entrada do menu lateral (o botão hambúrguer), 29,0% das ações tiveram "quebras" (a pessoa travou e mudou de rumo) e 29,0% falharam de vez. 11 participantes não entenderam o que o ícone significava, e 9 não acharam a entrada na primeira tentativa.
  - Depois de abrir o menu, escolheram os itens bem: 96,4% de acerto ao tocar nos itens da lista.
  - No geral, navegaram melhor tocando no conteúdo do que em menus e botões. Também tiveram problemas com outros ícones: 9 pessoas não entenderam o ícone de busca (a lupa).
  - Mesmo assim, no fim a maioria disse preferir o menu lateral, porque ele mostra todas as opções de uma vez.
- O que sustenta para o time: para a persona idosa, o gargalo é achar a entrada do menu escondido e entender ícones sem texto, e a vila pode checar os dois pontos. Mostra também que a preferência declarada pode divergir do desempenho real.
- O que NÃO sustenta: a amostra é pequena e tem escolaridade e familiaridade digital altas; os próprios autores pedem cautela ao aplicar os resultados a iniciantes ou a idosos com baixo letramento. Os apps não são de banco, o estudo foi feito em Hong Kong com apps de 2018-2019 e não houve grupo de jovens para comparar.
- Verificação: pendente

### [04.6] O ícone de "Mais opções" (três pontinhos) é reconhecido, mas as pessoas não sabem o que tem dentro
- Tipo: INDÍCIO
- Fonte: Kate Kaplan (Nielsen Norman Group), "Designing Effective Contextual Menus: 10 Guidelines", 2025. https://www.nngroup.com/articles/contextual-menus-guidelines/
- O que diz (paráfrase): o texto cita uma pesquisa da autora para o livro "Digital Icons That Work", em que participantes viam interfaces e diziam o que cada ícone faria. Os três pontos na vertical (kebab) e na horizontal (meatball) costumavam ser entendidos como "mais opções", mas as pessoas tinham pouca ideia de quais opções ficavam escondidas ali. O texto aponta três riscos: a função fica mais difícil de achar, o ícone não indica o conteúdo e ele passa despercebido quando é pequeno, está mal posicionado ou tem pouco contraste. Recomenda rótulo de texto ou dica visual.
- O que sustenta para o time: reconhecer o ícone não basta. A pessoa ainda precisa adivinhar que a função que procura (por exemplo, "repetir todo mês") está lá dentro. É um ponto que a vila pode sinalizar quando uma função da tarefa depende de "Mais opções".
- O que NÃO sustenta: o artigo não informa número de participantes, método nem percentuais, e não mede sucesso em tarefas. Não é revisado por pares.
- Verificação: pendente

### [04.7] Com rótulo de texto, o acerto na interpretação de ícones quase dobrou, tanto em jovens quanto em idosos
- Tipo: EVIDÊNCIA
- Fonte: Rock Leung, Joanna McGrenere e Peter Graf, "Age-related differences in the initial usability of mobile device icons", Behaviour & Information Technology, 2011, v. 30, n. 5, p. 629-642. https://www.cs.ubc.ca/labs/edapt/papers/leung2011.pdf
- O que diz (paráfrase): experimento controlado com 36 pessoas. Metade tinha de 20 a 37 anos (média de 30,7) e metade tinha 65 anos ou mais (média de 71,5). Elas avaliaram 60 ícones reais de celulares e PDAs da época (iPhone, Nokia, BlackBerry e outros) em três versões: só ícone, ícone com texto e só texto.
  - Acerto ao interpretar o significado: 45% com só ícone, 78% com ícone e texto e 79% com só texto, uma diferença estatisticamente significativa.
  - Idosos: 38% sem rótulo e 71% com rótulo. Jovens: 52% sem rótulo e 86% com rótulo.
  - O rótulo ajudou os dois grupos, mas não ajudou os idosos significativamente mais que os jovens.
  - Ícones cuja imagem tem ligação pouco natural com a função foram especialmente difíceis para os idosos.
  - Os autores sugerem rotular os ícones para idosos, ao menos no começo do uso.
- O que sustenta para o time: é a base mais forte deste tema para a vila apontar ícone sem texto como risco, principalmente para a persona idosa.
- O que NÃO sustenta: os ícones foram mostrados ampliados e impressos em papel; os próprios autores dizem que isso limita a validade para o uso real. O estudo mede o primeiro contato, não o uso repetido. Os ícones são de 2007-2008, e não foram testados apps de banco nem uma tarefa completa.
- Verificação: pendente

### [04.8] Poucos ícones são universais, e o rótulo deve ficar sempre visível (guia da NN/g)
- Tipo: OPINIÃO
- Fonte: Aurora Harley (Nielsen Norman Group), "Icon Usability", 2014. https://www.nngroup.com/articles/icon-usability/
- O que diz (paráfrase): guia de boas práticas. Diz que só poucos ícones são reconhecidos quase por todos (casa, impressora e lupa de busca) e que um rótulo de texto deve acompanhar o ícone para tirar a dúvida. Esse rótulo deve ficar sempre visível: mostrá-lo só quando o mouse passa por cima aumenta o esforço e não funciona em tela de toque. Cita o ícone hambúrguer como exemplo de uso inconsistente entre produtos.
- O que sustenta para o time: serve de regra prática para a vila: ícone sem rótulo é sinal de alerta.
- O que NÃO sustenta: o guia não apresenta dados nem amostra; é uma recomendação de consultoria, de 2014. Mesmo a lupa, dada como universal, não foi entendida por 9 dos 22 idosos do item 04.5.
- Verificação: pendente

### [04.9] Contra: numa busca visual rápida por um ícone, a versão sem texto pode ser mais eficiente
- Tipo: INDÍCIO (li só o resumo do artigo revisado por pares)
- Fonte: Li Deng e Ruiying Liu, "The effects of layout types, visual features and text labels on icon visual search performance", Ergonomics, 2025 (online em dezembro de 2024), v. 68, n. 11, p. 1863-1881, DOI 10.1080/00140139.2024.2440767. Resumo lido pela Europe PMC: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:39673422%20AND%20SRC:MED&resultType=core&format=json
- O que diz (paráfrase): experimento com rastreamento do olhar que variou a disposição dos ícones (fileira simples, fileira dupla, grade e círculo), o formato e a presença de rótulo de texto. Mediu o tempo da tarefa e as fixações do olhar. Segundo o resumo, a combinação de ícones sem rótulo, dispostos em grade e em formato quadrado com cantos cortados foi a que mais ajudou na eficiência.
- O que sustenta para o time: "sempre pôr rótulo" não é regra absoluta. Quando a tarefa é achar com os olhos um alvo que a pessoa já conhece, o texto pode poluir a tela. A vila não deve tratar todo ícone sem rótulo como erro automático.
- O que NÃO sustenta: não li o texto completo, e o resumo não informa quantos participantes havia nem se eles já sabiam qual ícone procurar. O estudo mede a rapidez da busca visual, não se a pessoa entende o que o ícone faz. A indexação lista adultos e jovens adultos, sem idosos. Não é um app de banco.
- Verificação: pendente

### [04.10] Ressalva: o ícone hambúrguer ficou mais reconhecido desde 2016, mas isso não mostra que a tarefa ficou mais fácil
- Tipo: INDÍCIO
- Fonte: Kate Kaplan (Nielsen Norman Group), "The Hamburger-Menu Icon Today: Is it Recognizable?", 2025. https://www.nngroup.com/articles/hamburger-menu-icon-recognizability/
- O que diz (paráfrase): com base na pesquisa feita para o livro "Digital Icons That Work", o artigo relata que os participantes identificaram corretamente o ícone hambúrguer como menu principal, sobretudo quando ele estava no lugar esperado e com o desenho padrão. A autora ressalva que, ao contrário dos estudos de 2015-2016, este não mediu tempo nem sucesso nas tarefas.
- O que sustenta para o time: os números do item 04.4, de 2015, podem exagerar o problema hoje para o público em geral. Reconhecer um ícone depende de ele estar no lugar e no estilo que as pessoas esperam.
- O que NÃO sustenta: o artigo não traz amostra, método nem percentuais. Reconhecer o ícone não é o mesmo que encontrar a função. Não traz dados sobre idosos; no item 04.5, 11 de 22 idosos não entenderam o ícone.
- Verificação: pendente

## Lacunas
- Não consegui abrir as fontes revisadas por pares de dois estudos clássicos: Bailey, Wolfson, Nall e Koyani (HCI International 2009) e Wiedenbeck (1999), sobre ícones com e sem rótulo. Os sites da Springer, ACM e Taylor & Francis bloquearam o acesso (erro 403). Por isso, o total de participantes dos estudos de primeiro clique de Bailey não foi confirmado, e o item 04.1 ficou como INDÍCIO. O resultado de Wiedenbeck só aparece descrito dentro do artigo do item 04.7, então não entrou como item próprio.
- Não achei estudo sobre primeiro clique, "Mais opções" ou ícones com e sem rótulo em apps de banco no Brasil. O artigo da UNESP que encontrei (Brandt e outros, Ergotrip Design n. 8, 2024: 10 idosos e 10 jovens, transferência TED em dois apps do Banco do Brasil) mede percepção de cores, identidade visual e confiança, não esses temas, e ficou de fora.
- Não achei nenhum estudo que teste se personas simuladas por IA reproduzem o padrão de primeiro clique de pessoas reais. Esse é o elo entre este tema e o tema 01.
- Sobre o menu "Mais opções" (três pontinhos) em si, há pouca pesquisa quantitativa com método publicado. O que achei da NN/g (04.6 e 04.10) não traz amostra.
- Os estudos de ícones medem quase sempre o primeiro contato. Faltam dados sobre uso repetido: sabemos que uma pessoa pode aprender o ícone com o tempo, mas não o quanto.
- Faltam dados sobre baixa visão e baixa familiaridade digital. O estudo com idosos (04.5) recrutou pessoas com alta escolaridade e bom letramento digital, e o de ícones (04.7) usou ícones ampliados em papel.
- Li, mas não incluí: (a) Jin, Liu e Luo, Frontiers in Psychology, 2026. Com 25 idosos na China, a tarefa com navegação mais profunda levou em média 35,10 s e teve 1,36 erro, contra 12,10 s e 0,20 erro na tarefa com navegação mais rasa; como foram usados apps reais, outros fatores podem ter influenciado o resultado. (b) Luke Wroblewski, "Obvious Always Wins", 2015: relatos de apps que trocaram o menu hambúrguer por barra de abas, sem números nem método no texto.
