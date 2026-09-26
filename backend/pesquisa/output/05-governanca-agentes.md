# 05 · governanca-agentes · rodada 1
Pergunta: Como governar ferramentas de IA/agentes usadas em apoio a decisões de produto: humano no controle (human-in-the-loop/oversight), rastreabilidade e registro (logs, versão do modelo e do prompt), rotular claramente conteúdo simulado/gerado por IA. Diretrizes relevantes: NIST AI RMF, EU AI Act (transparência), ISO/IEC 42001, e no Brasil PL 2338/2023, LGPD/ANPD, e o que o Banco Central diz sobre IA/gestão de risco quando houver. Foco no que se aplica a uma ferramenta interna de apoio a design que NÃO decide sozinha e NÃO usa dado real de cliente.
Data da busca: 2026-09-26

## Resumo em 3 linhas
As diretrizes lidas (NIST, ISO/IEC 42001, lei europeia de IA e PL 2338/2023) apontam na mesma direção: supervisão humana proporcional ao risco, registro do que foi usado e decidido, e aviso claro de que um conteúdo foi gerado por IA. Para uma ferramenta interna que não decide sozinha e não usa dado de cliente, quase tudo isso é boa prática voluntária, não obrigação: no Brasil o PL 2338 ainda não é lei e o Banco Central ainda está estudando o tema.
As pesquisas mostram que "um humano aprova" e "um rótulo de IA" não bastam sozinhos. Existe o viés de automação (confiar demais na máquina), e o rótulo "gerado por IA" reduz a confiança até em conteúdo verdadeiro.
Há duas medidas com algum apoio em estudos: mostrar a incerteza da IA em linguagem simples e explicar o que o rótulo quer dizer, incluindo o papel do humano.

## Itens

### [05.1] O guia do NIST pede que fique escrito quem supervisiona a IA e como, mas ele é voluntário e não traz dados
- Tipo: OPINIÃO (guia oficial de boas práticas, voluntário, sem dados empíricos)
- Fonte: NIST (National Institute of Standards and Technology, EUA), "Artificial Intelligence Risk Management Framework (AI RMF 1.0)", NIST AI 100-1, janeiro de 2023. https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf
- O que diz (paráfrase): É um guia de uso voluntário para qualquer setor e porte de organização, organizado em quatro funções: Governar, Mapear, Medir e Gerenciar riscos de IA.
  - A organização deve ter políticas que definam papéis e responsabilidades na relação humano-IA e na supervisão dos sistemas (item GOVERN 3.2).
  - Os processos de supervisão humana devem ser definidos, avaliados e documentados (item MAP 3.5).
  - O guia avisa que as ações sugeridas "do not constitute a checklist", ou seja, não são uma lista de verificação a cumprir item por item.
  - O Apêndice C diz que a relação humano-IA vai do totalmente automático ao totalmente manual, e que a IA pode servir como opinião adicional para quem decide. Alerta que, em certas tarefas, a IA pode aumentar os vieses humanos. Sugere coletar dados sobre com que frequência e por que as pessoas contrariam o que a IA sugere.
  - Sobre transparência, o guia lembra que um sistema transparente não é, por isso, preciso nem justo.
- O que sustenta para o time: A vila se encaixa no modelo "IA como opinião adicional para um humano decidir". Vale deixar escrito quem decide qual tela vai para o teste e registrar quando o designer discorda da vila, com o motivo. Esse registro é justamente o dado que o NIST sugere coletar.
- O que NÃO sustenta: Não é lei nem obrigação, nem nos EUA nem no Brasil. O guia não traz dados de que segui-lo reduz erros. Também não diz quais registros mínimos guardar (por exemplo, a versão do prompt) e não trata de personas simuladas.
- Verificação: pendente

### [05.2] O perfil do NIST para IA generativa sugere registrar a versão do modelo, documentar incidentes e ficar de olho em personas "humanas demais"
- Tipo: OPINIÃO (guia oficial de boas práticas, voluntário, sem dados empíricos)
- Fonte: NIST, "Artificial Intelligence Risk Management Framework: Generative Artificial Intelligence Profile", NIST AI 600-1, julho de 2024. https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf
- O que diz (paráfrase): É um complemento do guia 05.1 específico para IA generativa, também de uso voluntário.
  - Entre os riscos listados está a "configuração humano-IA". Com o tempo, as pessoas podem confiar demais na IA generativa (viés de automação) ou achar o conteúdo gerado melhor do que é. Também podem antropomorfizar o sistema, isto é, tratá-lo como se fosse gente.
  - O inventário de sistemas de IA deve registrar os modelos de base usados, suas versões e forma de acesso, os papéis de supervisão humana e a origem dos dados (ação GV-1.6-003).
  - Não se deve tirar conclusões sobre o desempenho da IA a partir de avaliações estreitas, não sistemáticas ou baseadas em poucos casos (MS-2.5-001).
  - Deve-se acompanhar e documentar a antropomorfização nas interfaces, como imagens de pessoas e menções a sentimentos (MS-2.5-004).
  - Deve-se considerar avisar o usuário de que há IA generativa em uso, conforme o contexto, o risco e o público (MP-5.1-003).
  - Registrar incidentes, manter histórico de versões e metadados ajuda a responder a problemas.
- O que sustenta para o time: Faz sentido guardar em cada rodada da vila qual modelo e qual versão foram usados. Personas com foto e "sentimentos" são exatamente o tipo de antropomorfização que o guia manda acompanhar, então é preciso cuidado para a persona não parecer gente de verdade. E não vale "vender" a vila com base em poucos exemplos bons.
- O que NÃO sustenta: Nada disso é obrigatório. O texto fala em versões de modelos, histórico de versões e metadados em geral, sem citar a versão do prompt. Não há dados de eficácia, e o documento foi feito para o contexto dos EUA.
- Verificação: pendente

### [05.3] A ISO/IEC 42001 é uma norma de gestão de IA que vale também para quem só USA IA, com controles escolhidos conforme o caso
- Tipo: OPINIÃO (norma técnica voluntária, sem dados empíricos)
- Fonte: ISO/IEC, "ISO/IEC 42001:2023 Information technology — Artificial intelligence — Management system", 2023 (amostra oficial de pré-visualização). https://cdn.standards.iteh.ai/samples/81230/4c1911ebc9a641fcb6ee21aa09c28ad3/ISO-IEC-42001-2023.pdf (ficha na loja da IEC: https://webstore.iec.ch/en/publication/90574)
- O que diz (paráfrase): A norma traz requisitos para criar, manter e melhorar um "sistema de gestão de IA" dentro da organização. Ela vale para qualquer organização, de qualquer porte, que forneça ou use produtos e serviços com IA.
  - A norma pede foco no que é próprio da IA, como a falta de transparência. Pede também que a gestão da IA se integre aos processos que a organização já tem, como riscos, fornecedores e qualidade de dados.
  - Ela define "avaliação de impacto de sistema de IA" e "declaração de aplicabilidade", que é o documento em que a organização diz quais controles do Anexo A adota e justifica os que deixa de fora.
  - Segundo a norma, quem cumpre os requisitos consegue gerar evidência de responsabilidade e de prestação de contas.
  - A ficha da IEC indica publicação em 18/12/2023, 1ª edição, 51 páginas.
- O que sustenta para o time: Se um banco usasse a vila internamente, ela poderia entrar no sistema de gestão de IA que o banco já tiver (inventário, avaliação de impacto e controles proporcionais), sem exigir uma estrutura nova só para ela.
- O que NÃO sustenta: Lemos só a amostra pública, com escopo, introdução e definições. Os controles do Anexo A (por exemplo, sobre registro de eventos ou supervisão humana) não foram lidos, e por isso não dizemos o que exigem. O site iso.org bloqueou o acesso com verificação anti-robô. A norma é voluntária, não informa quais organizações a adotam e não traz evidência de que a certificação reduza danos.
- Verificação: pendente

### [05.4] Na União Europeia, o dever de avisar e rotular IA vale desde 2/8/2026, mas mira sobretudo conteúdo exposto a pessoas e ao público
- Tipo: EVIDÊNCIA (texto oficial da norma; mostra o que a lei exige, não que funciona)
- Fonte: Comissão Europeia, "Transparency obligations under Article 50 of the AI Act" (perguntas e respostas oficiais), atualizado em 24/07/2026. https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act (texto do artigo reproduzido em https://artificialintelligenceact.eu/article/50/)
- O que diz (paráfrase): O artigo 50 do AI Act (a lei europeia de IA) vale desde 2 de agosto de 2026.
  - Quem fornece um sistema que conversa com pessoas deve avisar que é IA, a não ser que isso seja óbvio (50(1)). Segundo a Comissão, sistemas que funcionam só nos bastidores, entre máquinas ou sem contato direto com pessoas ficam fora desse dever de aviso.
  - Quem fornece IA generativa deve marcar o conteúdo sintético num formato que uma máquina consiga ler e detectar (50(2)). Sistemas que já estavam no mercado antes de 2/8/2026 têm até 2/12/2026 para isso.
  - Quem usa o sistema deve rotular deepfakes e textos gerados por IA publicados para informar o público sobre assuntos de interesse público (50(4)). Texto publicado que passou por revisão humana ou controle editorial não precisa de rótulo.
  - Uso profissional conta como "uso" pela lei. Só o uso pessoal e não profissional fica de fora.
  - O aviso deve ser claro e fácil de distinguir, e vir no máximo no primeiro contato.
- O que sustenta para o time: Rotular as saídas da vila como "simulado por IA" segue a direção da lei europeia. A ideia de que a revisão humana muda o tratamento do conteúdo também já está na lei.
- O que NÃO sustenta: Pela letra da lei, nada obriga uma ferramenta interna, cujos textos não são publicados para o público, a rotular cada saída. A FAQ não trata de documentos internos; isso é interpretação nossa, não confirmação. A lei vale para quem atua no mercado europeu, não no Brasil. Ela também não mostra que rotular funciona (ver 05.9).
- Verificação: pendente

### [05.5] No Brasil, o PL 2338/2023 prevê supervisão humana proporcional ao risco e identificação de conteúdo sintético, mas ainda não é lei
- Tipo: EVIDÊNCIA (texto oficial do projeto e ficha de tramitação; é projeto, não lei)
- Fonte: Senado Federal / Câmara dos Deputados, "PL 2338/2023: texto aprovado pelo Senado e apresentado na Câmara", 17/03/2025. https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=2868197&filename=PL+2338%2F2023 (tramitação: https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2487262 e https://www25.senado.leg.br/web/atividade/materias/-/materia/157233)
- O que diz (paráfrase): O Senado aprovou o texto em dezembro de 2024 e o enviou à Câmara em 17/03/2025.
  - Um dos princípios é a supervisão humana efetiva e adequada, considerando o grau de risco (art. 3º, III).
  - Regras detalhadas de supervisão humana valem para sistemas de alto risco (art. 8º). A lista de alto risco (art. 14) inclui usos como recrutamento, acesso a serviços essenciais, saúde e justiça. O mesmo artigo diz que não é alto risco a IA usada como tecnologia intermediária que não influencia nem determina o resultado ou a decisão.
  - Para sistemas de alto risco, o texto pede que se documente quanto de supervisão humana contribuiu para os resultados e que haja ferramentas de registro da operação (art. 18).
  - Todo sistema que gere conteúdo sintético deve incluir um identificador, conforme o estado da técnica, o contexto e o que o regulamento definir (art. 19).
  - A avaliação preliminar de risco é voluntária e conta como boa prática (art. 12).
  - A lei não se aplicaria a pesquisa, testes e desenvolvimento antes de o sistema entrar no mercado ou em serviço (art. 1º, §1º, III).
  - Na ficha da Câmara consultada em 26/09/2026, o projeto aguardava parecer do relator na Comissão Especial. A última movimentação era de 02/09/2026.
- O que sustenta para o time: O time pode fazer (e mostrar) uma avaliação preliminar de risco da vila e colocar um identificador de "conteúdo sintético" nas saídas. Pelo texto, um protótipo de hackathon estaria na fase de pesquisa e teste, fora do escopo da lei.
- O que NÃO sustenta: O projeto não é lei e o texto ainda pode mudar na Câmara. Dizer que a vila não é de alto risco é interpretação nossa: a lista não fala em design de telas, e a classificação final depende de regulamento (art. 15). O texto também não define o formato do identificador.
- Verificação: pendente

### [05.6] Pela LGPD, dado anonimizado não é dado pessoal, mas persona feita a partir de gente real ou prompt com dado real volta a ser caso de LGPD
- Tipo: EVIDÊNCIA (texto legal oficial)
- Fonte: Presidência da República, "Lei nº 13.709, de 14 de agosto de 2018 (Lei Geral de Proteção de Dados Pessoais)", 2018. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- O que diz (paráfrase): A LGPD protege dados pessoais, isto é, informação sobre pessoa identificada ou identificável (art. 5º, I).
  - Dado anonimizado não é dado pessoal, a não ser que a anonimização possa ser revertida com esforço razoável (art. 12).
  - Dados usados para montar o perfil de comportamento de uma pessoa identificada podem ser tratados como dados pessoais (art. 12, §2º).
  - O direito de pedir revisão (art. 20) vale para decisões tomadas só por tratamento automatizado de dados pessoais que afetem os interesses do titular.
- O que sustenta para o time: Se a vila usa só personas e telas fictícias, sem dado de cliente, em princípio a LGPD não incide sobre esse conteúdo. O art. 20 também não se aplica, porque a vila não decide nada sobre pessoas.
- O que NÃO sustenta: A lei não garante que as personas estejam livres de dado pessoal. Se forem montadas a partir de entrevistas, gravações ou pesquisas com pessoas reais, ou se alguém colar dado real no prompt, a LGPD volta a valer. A ANPD alerta que conteúdo sintético pode parecer dado pessoal ou ser ligado por engano a uma pessoa real, que ele não foi feito para anonimizar e que dados pessoais colados em prompts também são tratamento de dados (ANPD, "Radar Tecnológico n. 3: Inteligência artificial generativa", nov. 2024, https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/radar_tecnologico_ia_generativa_anpd.pdf/@@download/file). A própria série diz que não firma posição institucional da ANPD. Nada disto é parecer jurídico.
- Verificação: pendente

### [05.7] Banco Central: pesquisa com 606 instituições mostra que a gestão de riscos de IA ainda é incipiente no setor, e o BC diz estudar o tema para uma possível regulação futura
- Tipo: EVIDÊNCIA (pesquisa oficial com amostra e período descritos; respostas autodeclaradas)
- Fonte: Banco Central do Brasil, "Relatório de Estabilidade Financeira, v. 24, n. 2, seção 2.1: Pesquisa sobre o uso de inteligência artificial no Sistema Financeiro Nacional", novembro de 2025. https://www.bcb.gov.br/content/publicacoes/ref/202510/RELESTAB202510-refPub.pdf
- O que diz (paráfrase): A pesquisa foi feita entre fevereiro e março de 2025 com 606 instituições reguladas. Elas são cerca de 38% das instituições autorizadas pelo BC e 96% dos ativos do sistema financeiro, na data-base de dezembro de 2024.
  - 26,7% (162 de 606) usam soluções de TI com modelos de IA. Entre elas, a IA generativa é a abordagem mais citada: 62,3% das 162.
  - Das 162, 42,6% têm processos complementares para gerir os riscos da IA e 57,4% não têm.
  - O BC vê pouca adoção de gestão de riscos ao longo de todo o ciclo de vida e de reporte corporativo desses riscos. Vê também forte dependência de fornecedores externos.
  - Entre os riscos mais citados estão os legais e de conformidade, os operacionais e os de má qualidade de dados. O BC também cita falta de transparência e de explicabilidade, e vieses.
  - O BC diz que o estudo serve para antecipar práticas e riscos e apoiar eventuais regulamentações específicas. O relatório cita o PL 2338 como projeto em tramitação.
- O que sustenta para o time: Para o regulador, a governança de IA é uma lacuna no setor. Uma ferramenta que já nasce com registro, supervisão e rótulo responde a essa preocupação.
- O que NÃO sustenta: O relatório não é uma norma e não cria obrigação. As respostas são autodeclaradas pelas instituições e os dados são de 2025. O relatório não trata de ferramentas de design nem de personas, e não mostra o que um banco específico faz. Não encontramos uma regra do BC específica sobre IA (ver Lacunas).
- Verificação: pendente

### [05.8] Ter um humano no controle não basta: uma revisão sistemática mostra que as pessoas tendem a confiar demais na automação
- Tipo: EVIDÊNCIA (revisão sistemática revisada por pares; lemos só o resumo)
- Fonte: Kate Goddard, Abdul Roudsari, Jeremy C. Wyatt, "Automation bias: a systematic review of frequency, effect mediators, and mitigators", Journal of the American Medical Informatics Association (JAMIA), 19(1):121-127, 2012. https://academic.oup.com/jamia/article-abstract/19/1/121/732254
- O que diz (paráfrase): É uma revisão sistemática de estudos sobre sistemas de apoio à decisão, com foco em saúde. Dos 13.821 artigos encontrados, 74 atenderam aos critérios.
  - Viés de automação é a tendência de confiar demais na automação. A maioria das pesquisas mostra melhora geral de desempenho com o apoio do sistema, mas muitas vezes não se percebem os novos erros que ele introduz.
  - O viés aumenta conforme fatores da pessoa (estilo de raciocínio, experiência na tarefa), da atitude (confiança no sistema) e do ambiente (carga de trabalho, complexidade da tarefa, pressão de tempo).
  - O que ajuda a reduzir o viés: treinamento, deixar claro que a pessoa responde pela decisão, a posição do conselho na tela, mostrar níveis de confiança atualizados junto com a saída, e dar informação em vez de recomendação.
- O que sustenta para o time: Este é o item que vai CONTRA a ideia de que "o humano decide, então está seguro". Com pressa (a meta é comparar telas em poucas horas), o designer pode aceitar o que a vila diz sem questionar. Ajudam: mostrar a confiança de cada achado, apresentar os achados como informação e não como "tela vencedora", e deixar claro quem responde pela escolha.
- O que NÃO sustenta: Os estudos são da área da saúde e anteriores aos LLMs (a revisão é de 2012). Não medem designers nem personas simuladas. Lemos só o resumo, que não dá uma taxa única de ocorrência do viés.
- Verificação: pendente

### [05.9] O rótulo "gerado por IA" tem efeito colateral: reduz a confiança mesmo em conteúdo verdadeiro, porque as pessoas supõem que não houve humano
- Tipo: EVIDÊNCIA (dois experimentos pré-registrados, revisão por pares)
- Fonte: Sacha Altay, Fabrizio Gilardi, "People are skeptical of headlines labeled as AI-generated, even if true or human-made, because they assume full AI automation", PNAS Nexus, 3(10), 2024. https://pmc.ncbi.nlm.nih.gov/articles/PMC11443540/
- O que diz (paráfrase): Foram dois experimentos online pré-registrados com 4.976 participantes: 1.976 nos EUA (estudo 1) e 3.003 nos EUA e no Reino Unido (estudo 2).
  - Rotular manchetes como "geradas por IA" diminuiu o quanto as pessoas as achavam precisas e a vontade de compartilhá-las. Isso aconteceu com manchetes verdadeiras ou falsas, escritas por humanos ou por IA.
  - As pessoas não confundiram "gerado por IA" com "falso". O efeito do rótulo de IA foi três vezes menor que o do rótulo "falso".
  - O título do artigo resume a explicação: as pessoas supõem que houve automação total, sem supervisão humana. No estudo 2, quando a definição do rótulo descrevia uma participação limitada da IA, o ceticismo diminuiu.
- O que sustenta para o time: Este item também vai CONTRA uma ideia simples do time. Rotular é necessário, mas o rótulo sozinho pode fazer o time descartar achados úteis. O rótulo da vila deve explicar o que significa, por exemplo "achados de personas simuladas por IA, revisados por [papel do revisor]".
- O que NÃO sustenta: O estudo usou manchetes de notícias para o público geral, não uma ferramenta interna de design. Foi feito só nos EUA e no Reino Unido, e os autores dizem que as atitudes podem ser diferentes em outros países, citando Brasil e México. Não testou rótulos em relatórios de usabilidade.
- Verificação: pendente

### [05.10] Quando a IA diz "não tenho certeza, mas...", as pessoas confiam menos em respostas erradas e acertam mais
- Tipo: EVIDÊNCIA (experimento pré-registrado, conferência com revisão por pares; lemos só o resumo)
- Fonte: Sunnie S. Y. Kim, Q. Vera Liao, Mihaela Vorvoreanu, Stephanie Ballard, Jennifer Wortman Vaughan, "'I'm Not Sure, But...': Examining the Impact of Large Language Models' Uncertainty Expression on User Reliance and Trust", ACM FAccT 2024. https://arxiv.org/abs/2405.00623
- O que diz (paráfrase): Foi um experimento pré-registrado com 404 participantes. Eles respondiam perguntas médicas com ou sem a ajuda de um buscador com LLM.
  - Quando o sistema expressava incerteza em primeira pessoa ("não tenho certeza, mas..."), os participantes confiaram menos nele e concordaram menos com as respostas, e acertaram mais. A dependência excessiva de respostas erradas diminuiu, mas não sumiu.
  - Expressões impessoais ("não está claro, mas...") tiveram efeito parecido, porém mais fraco e sem significância estatística.
  - Os autores dizem que a formulação exata importa e deve ser testada com usuários antes de ser usada em larga escala.
- O que sustenta para o time: A vila pode mostrar a incerteza de cada achado em linguagem simples. Também vale testar com designers qual texto de aviso funciona melhor.
- O que NÃO sustenta: A tarefa foi responder perguntas médicas, não avaliar telas. Lemos só o resumo e não conferimos o tamanho dos efeitos. Não sabemos o efeito sobre a confiança nos achados corretos da vila.
- Verificação: pendente

## Lacunas
- **Personas simuladas:** nenhuma das fontes lidas trata de governança de personas sintéticas ou usuários simulados. Tudo aqui é transposto de IA em geral ou de IA generativa.
- **Versão do prompt:** nenhuma fonte primária lida exige, com essas palavras, registrar a versão do prompt. O NIST (05.2) fala em versões de modelos, histórico de versões e metadados. Registrar o prompt é uma extensão nossa, razoável, mas sem fonte direta.
- **Banco Central:** não encontramos uma norma do BC específica sobre IA. Não abrimos a Resolução CMN 4.557/2017 (gestão de riscos) nem outras normas gerais, e por isso não sabemos se ou como se aplicam a uma ferramenta interna de design. A agenda regulatória do BC para 2025-2026 só apareceu em fontes secundárias, e por isso não entrou. O Relatório de Estabilidade Financeira de maio de 2026 não repete a pesquisa de IA.
- **ISO/IEC 42001:** os controles do Anexo A não foram lidos, porque o texto é pago e o site da ISO bloqueou o acesso com verificação anti-robô.
- **Lei europeia, artigos 12 (registros automáticos) e 14 (supervisão humana):** estes artigos citam explicitamente o viés de automação e exigem registro de eventos, mas valem para sistemas de alto risco. Nós os lemos só no site artificialintelligenceact.eu, que não é oficial, e não conferimos no EUR-Lex. As datas de aplicação podem ter mudado com o acordo "Omnibus" de 2026. Por isso não viraram item.
- **Críticas à supervisão humana:** Ben Green (Computer Law & Security Review, 2022; resumo em https://arxiv.org/abs/2109.05067) analisou 41 políticas que exigem supervisão humana de algoritmos no governo. Ele argumenta que as pessoas não conseguem fazer bem essa supervisão e que a exigência dá uma falsa sensação de segurança. Propõe, no lugar, supervisão institucional. Lemos só o resumo e o texto ficou fora da lista por limite de itens. É mais um argumento CONTRA confiar só no "humano no controle".
- **Estudos só lidos pelo resumo:** dos estudos empíricos (05.8 e 05.10), lemos apenas os resumos. Os números de efeito não foram conferidos no texto completo.
- **Contexto brasileiro e de design:** não encontramos estudo com designers ou POs de bancos no Brasil sobre confiança excessiva em ferramentas de IA de apoio a design, nem sobre o efeito de rótulos nesse público.
