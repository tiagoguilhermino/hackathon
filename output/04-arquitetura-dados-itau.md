# Arquitetura e plataforma de dados do Itaú: o que é público

> Pergunta: O que o Itaú divulgou publicamente sobre como organiza sua arquitetura e plataforma de dados (data mesh, domínios de dados, nuvem, lakehouse, mainframe, catálogo, governança e qualidade de dados, tecnologias de banco de dados)?

## Resumo executivo
- Itaú diz ter migrado de Data Lake centralizado para arquitetura Data Mesh, dados tratados como produto e domínios por área de negócio [1] (evidência).
- Nuvem pública é a base declarada: parceria estratégica de 10 anos com a AWS desde 2020, Azure também citada, mainframe rumo à desativação até 2028 [7][6][9] (evidência).
- Os percentuais de "quanto já está na nuvem" variam por fonte e data e não dá para reconciliá-los com o material público [6][9][8] (evidência, mas inconsistente entre si).
- Bancos de dados nativos em nuvem citados publicamente: Amazon Aurora, Amazon DynamoDB e Amazon OpenSearch [7][11] (evidência).
- Projetos publicados mostram arquitetura orientada a eventos com Kafka e domínios de negócio nomeados (Contas Correntes, Transferências, Tarifas, Juros, Contábil) [10] (evidência).
- Itaú declara usar o catálogo de dados Atlan e lançou um Glossário de Negócios corporativo em dezembro de 2024 [3] (evidência).
- Escala da plataforma (mais de 26 TB, 65 milhões de clientes) aparece só em um podcast, sem confirmação em outra fonte [5] (evidência, fonte única).
- Uma plataforma interna de orquestração de IA, chamada "Iara", é citada como camada sobre a infraestrutura de nuvem/dados [8] (evidência).
- Não achei confirmação pública de "lakehouse"/Databricks no Itaú; um blog de terceiro mencionava isso, mas não pôde ser verificado (lacuna).

## Achados

### Migração de Data Lake centralizado para Data Mesh · EVIDÊNCIA
- O CDO do Itaú descreve a virada de um Data Lake único (onde "todas as demandas dos produtores e consumidores de dados ficam concentradas em um único time") para uma arquitetura Data Mesh, com dados tratados como produto e domínios orientados a negócio.
- Trecho decisivo: "arquitetura é descentralizada e orientada ao domínio de negócio" [1]
- Não sustenta: é autodeclaração do próprio CDO em blog institucional do banco (11/10/2022); não há auditoria externa, nem lista pública de quantos domínios existem hoje ou quais áreas já migraram de fato.

### Nuvem pública como base da infraestrutura, mainframe em desativação · EVIDÊNCIA
- AWS é provedora estratégica desde um contrato de 10 anos fechado em novembro/dezembro de 2020; Microsoft Azure também é citada como parte do ambiente multi-cloud em 2024.
- CIO do banco (dez/2024) afirma meta de migrar 100% dos sistemas, incluindo o mainframe, até 2028, com processo iniciado em 2017.
- Trecho decisivo: "migrará de bancos de dados legados para os bancos nativos em nuvem da AWS" [7]
- Não sustenta: são anúncios e entrevistas de executivos (CEO, CIO) em eventos (Febraban Tech, AWS re:Invent) e press release conjunta com a AWS; não há relatório técnico do Itaú com metodologia de medição do que está "na nuvem".

### Percentuais de adoção de nuvem divergem entre fontes e datas · EVIDÊNCIA (mas inconsistente)
- Jun/2024 (CEO, Febraban Tech): 100% dos dados já na nuvem, modernização geral 70% concluída.
- Dez/2024 (CIO, evento AWS): 65% das aplicações já na nuvem, mainframe restante até 2028.
- Mai/2026 (matéria de imprensa): "aproximadamente 60% a 70% das cargas da companhia já operam em cloud".
- Trecho decisivo: "aproximadamente 60% a 70% das cargas da companhia já operam em cloud" [8]
- Não sustenta: os três números medem coisas diferentes (dados, aplicações, cargas de trabalho) em momentos diferentes, citados por porta-vozes diferentes; nenhuma fonte pública reconcilia essas métricas nem publica uma definição comum.

### Bancos de dados nativos em nuvem citados publicamente · EVIDÊNCIA
- Desde o anúncio da parceria com a AWS (2020), o Itaú cita migração para Amazon Aurora (banco relacional) e Amazon DynamoDB (banco chave-valor).
- Em 2025, um projeto de plataforma de extratos usa Amazon OpenSearch (1 milhão de buscas/seg. e 2 milhões de inserções/seg., segundo o fornecedor).
- Trecho decisivo: "migrará de bancos de dados legados para os bancos nativos em nuvem da AWS" [7]
- Não sustenta: é comunicado de parceria (2020) e press release de projeto específico de GFT/AWS (2025) — não há um inventário público e atual de quais sistemas já rodam em cada banco de dados, nem se sistemas legados (ex. mainframe, bancos on-premise) ainda coexistem.

### Arquitetura orientada a eventos e domínios de negócio em projeto publicado · EVIDÊNCIA
- O "core bancário internacional" foi modularizado em cinco domínios (Contas Correntes, Transferências, Tarifas, Juros, Contábil), com Kafka como broker de integração entre eles e stack serverless (Lambda, DynamoDB, Step Functions, API Gateway, SQS, S3/CloudFront).
- Prazo do projeto: 15 meses; resultado citado: custo "26 vezes menor" que soluções de mercado.
- Trecho decisivo: "é majoritariamente orientada a eventos" [10]
- Não sustenta: descreve um produto específico (core bancário internacional), não a arquitetura de dados corporativa inteira; publicado no blog da AWS (fornecedor), sem confirmação independente do "26 vezes menor".

### Catálogo de dados corporativo (Atlan) e Glossário de Negócios · EVIDÊNCIA
- Itaú declara usar o Atlan como "plataforma moderna de catálogo de dados", citando o reconhecimento da ferramenta no Quadrante Mágico do Gartner de 2024.
- Lançou em dezembro de 2024 um Glossário de Negócios corporativo, descrito como referência única de termos de negócio ligada aos ativos de dados (tabelas, APIs, dashboards, eventos).
- Trecho decisivo: "fonte oficial das definições de negócio do banco" [3]
- Não sustenta: artigo escrito por Team Members da própria comunidade de dados do banco (27/05/2025); não há dado de cobertura (quantos domínios/ativos já catalogados) nem de adoção real pelas áreas.

### Escala da plataforma de dados citada em podcast, sem confirmação cruzada · EVIDÊNCIA (fonte única)
- Em podcast com CDO, Superintendente de Gestão de Dados e Head de Engenharia da Plataforma de Dados do Itaú, é citado processamento de "mais de 26 terabytes de dados" vindos de "mais de 65 milhões de clientes".
- Não sustenta: fala em podcast (10/03/2023), sem unidade de tempo explícita para os "26 terabytes" (por dia, por mês, acumulado); não encontrei o mesmo número reproduzido em nenhuma outra fonte pública.

### Plataforma interna de orquestração de IA ("Iara") sobre a infraestrutura de nuvem/dados · EVIDÊNCIA
- Matéria recente (mai/2026) descreve uma plataforma interna, "Iara", que centraliza modelos de IA, bases de conhecimento e governança de agentes, apoiada no avanço da nuvem.
- Diretor de Tecnologia do Itaú é citado dizendo que a centralização evita retrabalho: pessoas especializadas cuidam da complexidade "e isso passa a ser reutilizado em todos os casos de uso".
- Trecho decisivo: "o banco afirma já registrar redução de 44% no custo unitário de processamento" [8]
- Não sustenta: é matéria de imprensa especializada baseada em entrevista com executivo do Itaú, sem relatório técnico com metodologia sobre como o "custo unitário de processamento" foi medido; não há detalhe público da arquitetura técnica da Iara (banco de dados, modelos usados, onde roda).

### Framework interno de modernização do mainframe (os "8 Rs") · EVIDÊNCIA
- Analista sênior de arquitetura do Itaú descreve oito estratégias de modernização (rehost, replatform, refactor, rearchitect, rewrite, repurchase, retain, retire) aplicadas ao legado em mainframe Z/OS, na direção de containers, serverless e microsserviços.
- Trecho decisivo: "metade dela já operará na nuvem até o final de 2022" [4]
- Não sustenta: artigo de dez/2022 descreve o framework conceitual usado pelo banco, não diz quais sistemas específicos usam qual estratégia hoje, nem estado atual (2026) do avanço.

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| Modelo de arquitetura | Migração de Data Lake centralizado para Data Mesh, dado como produto, domínios por negócio | EVIDÊNCIA | Lista atual de domínios/áreas migradas | 11/10/2022 | [1] |
| Provedor de nuvem | AWS como provedor estratégico (contrato de 10 anos, 2020); Azure também citada em 2024 | EVIDÊNCIA | Reconciliação entre os dois provedores no mesmo período | 01/12/2020; 25/06/2024 | [7][6] |
| Meta de mainframe | 100% da infraestrutura, incl. mainframe, na nuvem até 2028; processo iniciado em 2017 | EVIDÊNCIA | Método de medição do "%" declarado | 09/12/2024 | [9] |
| % de nuvem hoje | Números divergentes: 100% dos dados (jun/2024), 65% dos apps (dez/2024), 60-70% das cargas (mai/2026) | EVIDÊNCIA (inconsistente) | Definição comum de "% na nuvem" entre as fontes | 2024–2026 | [6][9][8] |
| Bancos de dados citados | Amazon Aurora (relacional), Amazon DynamoDB (chave-valor), Amazon OpenSearch (busca) | EVIDÊNCIA | Inventário atual de quais sistemas usam cada banco | 01/12/2020; 02/06/2025 | [7][11] |
| Arquitetura de integração | Domínios de negócio (ex. Contas Correntes) comunicando-se via Kafka; stack serverless | EVIDÊNCIA | Extensão dessa arquitetura a outros sistemas além do core internacional | 20/08/2025 (republicação) | [10] |
| Catálogo de dados | Uso do Atlan como catálogo corporativo; Glossário de Negócios lançado dez/2024 | EVIDÊNCIA | Cobertura real (quantos ativos catalogados) | 27/05/2025 | [3] |
| Escala da plataforma | +26 TB de dados de +65 milhões de clientes | EVIDÊNCIA (fonte única) | Unidade de tempo do volume; confirmação cruzada | 10/03/2023 | [5] |
| Camada de IA sobre dados | Plataforma interna "Iara" centraliza modelos, bases de conhecimento e governança | EVIDÊNCIA | Detalhe técnico da arquitetura da Iara (banco, modelos) | 13/05/2026 | [8] |
| Framework de modernização | 8 estratégias (rehost a retire) aplicadas ao mainframe Z/OS | EVIDÊNCIA | Estado atual (2026) de quais sistemas já migraram | 13/12/2022 | [4] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Data Mesh / domínios de dados por negócio | demo (nomear domínios fictícios de forma realista) · bloco 4 |
| Nuvem pública (AWS/Azure) e desativação do mainframe | bloco 1 (contexto do banco) · demo (justificar escolha tecnológica simulada) |
| Percentuais de nuvem divergentes | bloco 5 (risco/limite de dado público) · ficha P4 (risco) |
| Bancos de dados citados (Aurora, DynamoDB, OpenSearch) | demo (escolher modelo de dado simulado: relacional, chave-valor ou busca) |
| Arquitetura orientada a eventos (Kafka) e domínios do core bancário | demo (desenhar fluxo de eventos fictício entre "domínios") · bloco 4 |
| Catálogo de dados (Atlan) e Glossário de Negócios | bloco 5 (governança e escala) · ficha P4 (risco) |
| Escala da plataforma (26 TB, 65 milhões de clientes) | bloco 1 (dimensionar o contexto do case) |
| Plataforma interna de IA ("Iara") | bloco 3 (solução e jornada) · ficha P2 (onde entra a IA) |
| Framework de modernização (8 Rs) | bloco 6 (próximos passos) |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Conteúdo completo da apresentação "Data Mesh na AWS" (AWS Summit SP, ago/2022) | WebFetch direto no PDF: retornou apenas imagem/stream binário, sem texto extraível; usei só título e contexto de busca | baixa |
| Lista pública atual e completa dos domínios de dados do Itaú | Busquei "domínios de dados" + Data Mesh em blogs e apresentações; só achei exemplos pontuais (ex.: 5 domínios do core bancário internacional), não um catálogo geral | média |
| Confirmação oficial de uso de "lakehouse" (ex. Databricks/Delta Lake) pelo Itaú | Achei um blog de terceiro (não Itaú) citando Teradata/Oracle/Azure/Databricks; tentei acessar via WebFetch direto e via proxy de leitura, ambos bloqueados por proteção anti-bot do Medium; não há outra fonte pública cruzando essa informação, então não usei | média |
| Stack técnico de dados em vaga pública ativa do Itaú | Tentei abrir vaga em carreiras.itau.com.br (404, vaga expirada) e no LinkedIn (404); fiquei só com resumo genérico de busca sobre requisitos típicos (Spark, Hadoop, AWS/GCP/Azure) | baixa |
| Reconciliação entre os diferentes percentuais de "adoção de nuvem" (dados vs. aplicações vs. cargas de trabalho) | Comparei diretamente as três fontes com os números; nenhuma explica a diferença de metodologia entre si | média |
| Detalhe técnico de qualidade de dados (regras, SLAs, métricas de qualidade) | Busquei "qualidade de dados" + Itaú; não achei artigo público específico sobre esse tema, só menções genéricas a governança e catálogo | média |

## Fontes
1. [PRIMÁRIA] Os dados e a nuvem: uma nova arquitetura centrada no cliente — Moisés Nascimento (CDO Itaú), Itaú Tech (Medium) — https://medium.com/itautech/os-dados-e-a-nuvem-uma-nova-arquitetura-centrada-no-cliente-7d8fae6519f3 — 11/10/2022
2. [PRIMÁRIA] A jornada de dados no Itaú Unibanco: ciência de dados e engenharia de machine learning — Lucas Datilio Carderelli e Vinicius Naziozeno Santoro do Rio, Itaú Tech (Medium) — https://medium.com/itautech/a-jornada-de-dados-no-ita%C3%BA-unibanco-ci%C3%AAncia-de-dados-e-engenharia-de-machine-learning-d15311dbf38e — 14/08/2023
3. [PRIMÁRIA] Gestão de Dados no Itaú: como organizamos conhecimento no maior banco da América Latina — Fabiola Aparecida Vizentim e Leticia Maria Caetano, Itaú Tech (Medium) — https://medium.com/itautech/gest%C3%A3o-de-conhecimento-no-ita%C3%BA-uma-estrat%C3%A9gia-feita-de-futuro-f55922b2d9dc — 27/05/2025
4. [PRIMÁRIA] Modernização: oito estratégias para endereçar seus desafios — André Pereira dos Reis (Analista Sênior de Arquitetura de Tecnologia, Itaú), Itaú Tech (Medium) — https://medium.com/itautech/moderniza%C3%A7%C3%A3o-oito-estrat%C3%A9gias-para-endere%C3%A7ar-seus-desafios-22cd972eb656 — 13/12/2022
5. [IMPRENSA] A massiva Plataforma de Dados do Itaú — Data Hackers Podcast 64 — Data Hackers, com Moisés Nascimento, Priscila Cardoso e Roberto Figueira (Itaú) — https://medium.com/data-hackers/a-massiva-plataforma-de-dados-do-ita%C3%BA-data-hackers-podcast-64-db81df4a603b — 10/03/2023
6. [IMPRENSA] Itaú Unibanco já tem 100% dos seus dados na nuvem para avançar na IA — ConvergênciaDigital, declarações de Milton Maluhy Filho (CEO Itaú) na Febraban Tech 2024 — https://convergenciadigital.com.br/inovacao/itau-unibanco-ja-tem-100-dos-seus-dados-na-nuvem-para-avancar-na-ia/ — 25/06/2024
7. [IMPRENSA] AWS é o novo provedor estratégico de nuvem do Itaú Unibanco — IT Forum — https://itforum.com.br/aws-e-o-novo-provedor-estrategico-de-nuvem-do-itau-unibanco/ — 01/12/2020
8. [IMPRENSA] Itaú amplia em 88% uso de IA generativa, acelera digitalização e reduz custo de processamento em 44% com avanço da nuvem — TI Inside Online, com Fernando Kontopp (Diretor de Tecnologia, Itaú) — https://tiinside.com.br/13/05/2026/itau-amplia-em-88-uso-de-ia-generativa-acelera-digitalizacao-e-reduz-custo-de-processamento-em-44-com-avanco-da-nuvem/ — 13/05/2026
9. [FORNECEDOR] Itaú Unibanco vai migrar o coração do banco para a nuvem — About Amazon Brasil (AWS), declarações de Ricardo Guerra (CIO Itaú) — https://www.aboutamazon.com.br/noticias/aws/itau-unibanco-vai-migrar-o-coracao-do-banco-para-a-nuvem — 09/12/2024
10. [FORNECEDOR] Como o Itaú Unibanco modernizou seu core bancário internacional com serviços Serverless da AWS — AWS Blog Brasil — https://aws.amazon.com/pt/blogs/aws-brasil/como-o-itau-unibanco-modernizou-seu-core-bancario-internacional-com-servicos-serverless-da-aws/ — republicado 20/08/2025
11. [FORNECEDOR] Itaú Unibanco realiza migração de ambiente on-premise e implantação de nova plataforma de extrato com nuvem AWS — GFT Technologies, com Rodrigo Dantas (Diretor de Tecnologia, Itaú) — https://www.gft.com/br/pt/about-us/newsroom/press-and-news/2025/press-releases/itau-unibanco-realiza-migracao-de-ambiente-on-premise — 02/06/2025
12. [FORNECEDOR] Data Mesh na AWS e a Arquitetura de Dados do Itaú na nuvem (apresentação, AWS Summit São Paulo) — Moisés Nascimento (Itaú) — https://d1.awsstatic.com/events/Summits/awssaopaulosummit/DataMesh_E4_20220803_ANT301.pdf — 03/08/2022 (conteúdo não extraível diretamente; usado apenas título/contexto)
