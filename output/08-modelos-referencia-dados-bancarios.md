# Modelos de referência de dados bancários (BIAN, FIBO, ISO 20022)

> Pergunta: Que modelos de referência públicos da indústria bancária (como BIAN, FIBO e ISO 20022) definem entidades e relacionamentos típicos dos dados de um banco, e há evidência pública de que o Itaú usa algum deles?

## Resumo executivo
Recorte do time ainda não definido.
- BIAN organiza o banco em Business Areas > Business Domains > Service Domains, com um Business Object Model conectado a cada domínio [1][2] (evidência).
- Documentação de terceiros (blog técnico, não confirmável por leitura direta) descreve que no modelo BIAN a Account não se liga direto à Party: é a Agreement que faz essa ponte, e a Arrangement vive dentro de um Agreement [3] (hipótese).
- FIBO é uma ontologia mantida pelo EDM Council e padronizada pela OMG, com módulos Foundations (Party, Agreement), Business Entities e Financial Business & Commerce (contas, produtos, acordos) [4][5] (evidência).
- ISO 20022 define um "business model" central com componentes de negócio (Party, Account, Transaction, Agreement) usados para gerar as mensagens (pain, pacs, camt) [6][7][8] (evidência).
- No Brasil, o Banco Central adotou ISO 20022 como base de mensageria do Pix/SPI desde a concepção, e todos os PSPs, inclusive Itaú, trocam mensagens nesse padrão com o Banco Central [8][9][10] (evidência).
- Não encontrei o Itaú nas listas públicas de membros do BIAN nem do EDM Council/FIBO, nem qualquer material público onde o próprio Itaú declare usar BIAN ou FIBO [11][12] (evidência de ausência, com limite explicado abaixo).

## Achados

### BIAN: estrutura do Service Landscape e Business Object Model · EVIDÊNCIA
- BIAN organiza o setor bancário em três camadas hierárquicas: Business Areas (nível mais alto), Business Domains e Service Domains (bloco elementar de capacidade) [1][2].
- A versão mais recente do Service Landscape (v14) organiza 322 Service Domains, cada um ligado a elementos do Business Object Model (objeto de negócio, tipo de dado ou enumeração) [2].
- BIAN se descreve como "the banking innovation standard", com 113 membros (40 bancos, 59 parceiros de software, 18 grupos de trabalho ativos) [1].
- Trecho decisivo: "create best practice architecture that the world's banks can rely upon" [1]
- Não sustenta: a lista completa de bancos-membro não é pública em detalhe na página consultada; não confirma que algum banco específico implementou o modelo em produção, só que participa da associação.

### BIAN: relação entre Party, Account, Agreement, Arrangement e Product · HIPÓTESE
- Segundo resumo de um blog técnico de uma fornecedora de software bancário (Zafin) sobre adoção do BIAN, a Account não se relaciona diretamente com a Party: é o Agreement que faz essa ligação, associando um Product a uma Party via "Agreement Involvement"; o Arrangement, por sua vez, só existe dentro do contexto de um Agreement (definindo, por exemplo, taxa de juros ou plano de tarifa) [3].
- Não consegui abrir a página original (bloqueio HTTP 403 em duas tentativas); a descrição vem de um resumo gerado a partir do conteúdo indexado, não de leitura direta do texto-fonte.
- Trecho decisivo: "An Account is not directly related to a Party; Agreement links the two" [3]
- Não sustenta: fonte é de uma empresa que vende software de precificação/produtos bancários baseado em BIAN ([FORNECEDOR]), não a documentação oficial do BIAN (que exige portal/licença para o Business Object Model completo); não há confirmação cruzada com uma segunda fonte independente e verificável. Trate como pista a validar, não como definição oficial fechada.

### FIBO: ontologia mantida pelo EDM Council, estrutura modular · EVIDÊNCIA
- FIBO é definida como ontologia que "define os conjuntos de coisas de interesse em aplicações de negócio financeiras e as formas como essas coisas podem se relacionar" [4].
- É mantida pelo EDM Council e padronizada pela OMG (Object Management Group); construída em OWL (Web Ontology Language, padrão W3C) [4][5].
- Estrutura modular: FND (Foundations, inclui Parties e Agreements, base para os demais módulos), BE (Business Entities: entidades legais e organizações formais, ~252 entidades), FBC (Financial Business and Commerce: contas, acordos/contratos, produtos e serviços financeiros, instrumentos financeiros, ~594 entidades) [5].
- Revisão por membros de instituições como Goldman Sachs, Wells Fargo, Deutsche Bank, Citigroup e State Street [4].
- Trecho decisivo: "FIBO defines the sets of things that are of interest in financial business applications" [4]
- Não sustenta: a lista de revisores citada é de bancos globais, não inclui bancos brasileiros; não há evidência de adoção por reguladores brasileiros.

### FIBO: modelo derivado "House of Finance" com 15 conceitos fundamentais · EVIDÊNCIA (com ressalva de origem)
- Um modelo de dados corporativo derivado da ontologia FIBO (fib-dm.com, mantido pelo arquiteto original do FIBO) descreve 15 "supertypes" que não derivam de nenhuma outra entidade: Situation, Role, Agent, Designation, Constituent, Collection, Aspect, Specification, Arrangement, Temporal Entity, Document, Occurrence, Measure, Scalar Quantity e Legal Construct; e conceitos "menores" complementares como Account, Product, Service, Facility, Reference e Location [13].
- Relações centrais: Agents desempenham Roles em Situations (que incluem acordos e contratos); Designations identificam entidades; Documents evidenciam transações; Occurrences (eventos/transações) alteram o estado de Situations e Accounts [13].
- Não sustenta: este é um modelo derivado (Financial Industry Business Data Model), não o FIBO oficial do EDM Council/OMG; a terminologia (15 supertypes) não aparece nas páginas oficiais do EDM Council consultadas.

### ISO 20022: business model central e famílias de mensagens · EVIDÊNCIA
- O ISO 20022 define uma metodologia de modelagem que parte de um "business model" — um dicionário central de itens de negócio combinados entre participantes — organizado em domínios de negócio: Common, Securities, Payments, Trade Services, Forex e Cards and Related Services [6].
- As mensagens (ex.: pain.001 — iniciação de transferência de crédito do cliente; camt.053 — extrato do banco ao cliente) são derivadas desse modelo de negócio; papéis de Party incluem Creditor e Debtor, com identificadores como o "End-to-End Identification" preservados entre mensagens para permitir rastreamento [7].
- Trecho decisivo: "message model defines how these business model elements are grouped into messages" [6]
- Não sustenta: não obtive acesso direto (HTTP 403) à página iso20022.org/iso20022-repository/business-model; a descrição das entidades vem de resumo de busca sobre o conteúdo da página, não de leitura completa do texto original.

### BIAN e ISO 20022: alinhamento de metamodelo · EVIDÊNCIA
- O metamodelo do BIAN incorpora e se alinha com partes do metamodelo do ISO 20022 para aspectos definicionais; mensagens BIAN são especializações de "ISO20022 MessageDefinition" e componentes de mensagem BIAN são especializações de "ISO20022 MessageComponent" [14].
- Não sustenta: não localizei, nas páginas oficiais do BIAN consultadas diretamente (ex.: "BIAN and other standards bodies"), texto que confirme esse alinhamento; a descrição vem de conteúdo indexado (ex.: Wikipedia e páginas técnicas de terceiros) sobre o Common Object Model do BIAN, não de leitura direta e completa da fonte primária.

### Banco Central do Brasil: ISO 20022 como base de mensageria do Pix/SPI · EVIDÊNCIA
- O Banco Central do Brasil publicou o estudo "Estudo de utilização do Padrão ISO 20022 para Transferência de Fundos no âmbito do SPB" (2017), que fundamentou a adoção do padrão na infraestrutura de liquidação de pagamentos instantâneos (SPI), ou seja, o Pix [9].
- O documento descreve entidades centrais do modelo de negócio ISO 20022 — Party, Account, Transaction, Agreement — como base da modelagem, mas o trecho acessado não cita bancos específicos (incluindo o Itaú) nem prazos obrigatórios detalhados [9].
- As mensagens trocadas entre PSPs (bancos, fintechs, instituições de pagamento) e o Banco Central no Pix já nascem no padrão ISO 20022, segundo o Manual de Padrões para Iniciação do Pix [10][8].
- Não sustenta: o PDF consultado (1,8 MB) não foi lido por completo, apenas resumido por ferramenta automática; não confirma versão exata do padrão nem cronograma de implementação linha a linha.

### Itaú como participante do Pix, sujeito à mensageria ISO 20022 · EVIDÊNCIA
- O Portal de Dados Abertos do Banco Central lista "ITAU UNIBANCO S.A." como instituição com pontos de atendimento de Pix Saque e Pix Troco, confirmando sua condição de Prestador de Serviço de Pagamento (PSP) participante do Pix [15].
- Como todo PSP participante do Pix troca mensagens em ISO 20022 com o Banco Central desde a concepção do sistema [8][10], isso implica que o Itaú usa esse padrão nessa interface regulatória — mas não encontrei uma declaração pública do próprio Itaú afirmando isso nesses termos.
- Não sustenta: é uma inferência a partir de duas fontes do Banco Central (regra geral do Pix + listagem de participante), não uma declaração direta do Itaú sobre arquitetura de dados interna.

### Ausência de evidência pública de Itaú como membro de BIAN ou EDM Council/FIBO · EVIDÊNCIA (de ausência)
- A lista pública de membros do BIAN (bian.org/our-members/) não traz nenhum banco brasileiro (Itaú, Bradesco, Banco do Brasil, Santander) entre os bancos listados; aparecem bancos latino-americanos como BCP (Peru), Banco Pichincha (Equador), CAF e Grupo Promerica [11].
- A lista pública de membros do EDM Council (edmcouncil.org/membership/members-list/), com 370 membros, não traz Itaú nem outros grandes bancos brasileiros na parte consultada; o único registro latino-americano visível foi o Banco Invex (México) [12].
- Uma reportagem sobre uma rede de pagamentos instantâneos internacionais da Swift menciona integração com redes locais "como Pix no Brasil via Bradesco e Itaú" em um piloto, mas a página não pôde ser aberta diretamente (bloqueio HTTP 403) para verificar o trecho exato; tratado como não confirmado [16].
- Não sustenta: as listas de membros usam filtros e paginação; a checagem não percorreu manualmente todas as páginas/filtros, então a ausência pode refletir limite da checagem, não necessariamente ausência real de vínculo. Também não descarta que o Itaú use BIAN ou FIBO internamente sem ser membro pagante — isso não é verificável por fontes públicas.

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| BIAN Service Landscape | Business Areas > Business Domains > Service Domains; 322 Service Domains na v14 | Evidência | Não confirma implementação por banco específico | 2025 (release v13/v14) | [1][2] |
| BIAN membros | 113 membros: 40 bancos, 59 parceiros de software | Evidência | Lista detalhada de bancos-membro não é pública na página | 2026 (consulta) | [1] |
| BIAN BOM (Party/Account/Agreement/Arrangement) | Account não liga direto a Party; Agreement conecta Party-Product; Arrangement vive dentro de Agreement | Hipótese | Fonte é fornecedor de software (Zafin), sem confirmação cruzada; página original não pôde ser lida diretamente | não datado na fonte consultada | [3] |
| FIBO | Ontologia mantida por EDM Council, padronizada pela OMG, módulos FND/BE/FBC | Evidência | Não evidencia adoção por bancos brasileiros | 2026 (consulta) | [4][5] |
| FIBO — House of Finance | Modelo derivado com 15 "supertypes" (Situation, Role, Agent, etc.) + Account/Product/Location | Evidência (com ressalva) | É modelo derivado, não o FIBO oficial do EDM Council | não datado na fonte consultada | [13] |
| ISO 20022 business model | Dicionário central de componentes de negócio por domínio (Common, Securities, Payments, Trade Services, Forex, Cards) | Evidência | Página original não pôde ser lida por completo (bloqueio 403) | 2026 (consulta) | [6][7] |
| BIAN x ISO 20022 | Metamodelo BIAN alinhado ao metamodelo ISO 20022; mensagens BIAN especializam MessageDefinition do ISO 20022 | Evidência | Não confirmado por leitura direta da página oficial "BIAN and other standards bodies" | não datado na fonte consultada | [14] |
| BCB — Pix/SPI | Estudo de 2017 fundamentou uso de ISO 20022 na infraestrutura do Pix/SPI | Evidência | Não cita bancos específicos no trecho acessado | 2017 (estudo) / 2026 (consulta) | [9][10] |
| Itaú no Pix | Itaú Unibanco S.A. listado como PSP com pontos de atendimento Pix Saque/Troco | Evidência | Não é declaração do Itaú sobre arquitetura de dados interna | 2026 (consulta) | [15] |
| Itaú e BIAN/EDM Council | Itaú não aparece nas listas públicas de membros de nenhum dos dois | Evidência (ausência) | Checagem não percorreu todos os filtros/páginas; não descarta uso interno não divulgado | 2026 (consulta) | [11][12] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| BIAN Service Landscape e Business Object Model | slide bloco 3 (solução e jornada) · ficha P2 (como funciona e onde entra a IA) — vocabulário para nomear entidades do banco de dados simulado |
| Relação Party/Account/Agreement/Arrangement (hipótese) | ficha P2 · demo — modelo de referência para desenhar tabelas do protótipo, citando a ressalva de confiança |
| FIBO módulos FND/BE/FBC | slide bloco 3 · ficha P2 — alternativa de vocabulário de entidades (Party, Agreement, Product) para o dado simulado |
| ISO 20022 business model e mensagens | slide bloco 2 (evidências) · ficha P2 — mostra que há um padrão internacional de dados de pagamento que pode inspirar campos do protótipo (ex.: Party, Account, EndToEndId) |
| BCB e ISO 20022 no Pix | slide bloco 2 · ficha P4 (risco) — mostra que no Brasil já existe um padrão obrigatório de mensageria regulatória, útil para justificar realismo do dado simulado |
| Itaú como PSP do Pix | slide bloco 1/2 (contexto do case) — ajuda a justificar que dados fictícios podem seguir convenções já usadas no setor bancário brasileiro |
| Ausência de Itaú em BIAN/EDM Council | slide bloco 2 · ficha P3 (o que foi testado) — evita a equipe afirmar que o Itaú "usa BIAN/FIBO"; reforça que o protótipo deve tratar isso como referência genérica de mercado, não como fato sobre o Itaú |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Confirmação direta (texto lido, não resumo de busca) do Business Object Model completo do BIAN (diagramas de Party/Account/Arrangement) | Tentei abrir bian.org/servicelandscape-9-0/object_18.html e a página de views; conteúdo requer portal/JS ou acesso restrito, só retornou "InSite" | Alta |
| Leitura direta da página iso20022.org/iso20022-repository/business-model | Tentei WebFetch duas vezes; retornou HTTP 403 nas duas | Média |
| Confirmação ou desmentido da menção "Pix via Bradesco e Itaú" num piloto de rede internacional da Swift | Tentei abrir a reportagem do Mixvale; bloqueio HTTP 403; não encontrei a mesma informação em outra fonte independente | Alta |
| Declaração pública do próprio Itaú sobre uso (ou não uso) de BIAN, FIBO ou ISO 20022 em arquitetura interna de dados | Busquei "Itaú" + BIAN, + FIBO, + EDM Council; nenhum resultado direto do Itaú, só ausência nas listas de membros de terceiros | Alta |
| Leitura completa (não resumida por ferramenta) do estudo do Banco Central sobre ISO 20022 no SPB | Abri o PDF via WebFetch, mas o resumo automático não detalhou todas as seções (60+ páginas prováveis) | Média |
| Verificação de todas as páginas/filtros das listas de membros do BIAN e do EDM Council (LATAM) | Abri só a primeira página/visão de cada lista; não naveguei por todos os filtros geográficos | Média |
| Comparação formal entre entidades do BIAN BOM, FIBO e ISO 20022 (mapeamento campo a campo) | Fora do escopo desta pesquisa (não pedido pela pergunta); ficaria como próximo passo se o time for modelar o banco simulado | Baixa |

## Fontes
1. [PRIMÁRIA] BIAN — página inicial (membros, missão) — bian.org — https://bian.org/ — consultado em 2026-09-26
2. [PRIMÁRIA] BIAN — Service Landscape (deliverable) — bian.org — https://bian.org/deliverables/service-landscape/ — consultado em 2026-09-26
3. [FORNECEDOR] Engineering at Zafin — "BIAN Adoption at Zafin (Part 1)" — Medium — https://medium.com/engineering-zafin/bian-adoption-at-zafin-6cb116c59796 — acesso indireto (403 no fetch direto), consultado em 2026-09-26
4. [PRIMÁRIA] EDM Council — "Financial Industry Business Ontology" — edmcouncil.org — https://edmcouncil.org/financial-industry-business-ontology/ — consultado em 2026-09-26
5. [PRIMÁRIA] EDM Council / OMG — estrutura modular FIBO (FND, BE, FBC) — via busca sobre spec.edmcouncil.org e omg.org — https://spec.edmcouncil.org/fibo/ — consultado em 2026-09-26
6. [PRIMÁRIA] ISO20022.org — "Business Model" — iso20022.org — https://www.iso20022.org/iso20022-repository/business-model — acesso indireto (403 no fetch direto), consultado em 2026-09-26
7. [RELATÓRIO] Diversos (Nacha, J.P. Morgan, Citibank) — guias de mensagens pain.001/camt.053 — via busca — https://www.nacha.org/system/files/2023-08/NACHA_ISO20022_Guide_pain.001_credit%2008-09-23.pdf — consultado em 2026-09-26
8. [PRIMÁRIA] Banco Central do Brasil — "Manual de Padrões para Iniciação do Pix" v2.10.0 — bcb.gov.br — https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf — consultado em 2026-09-26
9. [PRIMÁRIA] Banco Central do Brasil — "Estudo de utilização do Padrão ISO 20022 para Transferência de Fundos no âmbito do SPB" (SG-ISO20022-TF, 2017) — bcb.gov.br — https://www.bcb.gov.br/content/estabilidadefinanceira/ISO_20022/Documento_Final_SG_ISO20022-TF.pdf — 2017, consultado em 2026-09-26
10. [RELATÓRIO] Zup Innovation — "ISO 20022: padrão global que possibilitou a criação do PIX" — zup.com.br — https://zup.com.br/blog/iso-20022/ — consultado em 2026-09-26
11. [PRIMÁRIA] BIAN — "Our Members" — bian.org — https://bian.org/our-members/ — consultado em 2026-09-26
12. [PRIMÁRIA] EDM Council — "List of Members" — edmcouncil.org — https://edmcouncil.org/membership/members-list/ — consultado em 2026-09-26
13. [RELATÓRIO] Financial Industry Business Data Model (fib-dm.com) — "The House of Finance has 15 fundamental Business Concepts" — https://fib-dm.com/house-of-finance-15-business-concepts/ — consultado em 2026-09-26
14. [RELATÓRIO] Conteúdo técnico indexado sobre BIAN_ISO20022 package (via busca, incluindo Wikipedia "Banking Industry Architecture Network") — https://en.wikipedia.org/wiki/Banking_Industry_Architecture_Network — consultado em 2026-09-26
15. [PRIMÁRIA] Banco Central do Brasil — Portal de Dados Abertos — "Itau Unibanco S.A. — Pontos de Atendimento de Pix Saque e Pix Troco" — dadosabertos.bcb.gov.br — https://dadosabertos.bcb.gov.br/dataset/ir-60701190000104/resource/2bad8829-dc4d-4b3f-b1a1-501d41c8a509 — consultado em 2026-09-26
16. [IMPRENSA] Mixvale — "Swift une 32 bancos globais para rede de pagamentos internacionais instantâneos em 2026" — mixvale.com.br — https://www.mixvale.com.br/2026/01/02/swift-une-32-bancos-globais-para-rede-de-pagamentos-internacionais-instantaneos-em-2026/ — não verificado (403), consultado em 2026-09-26
