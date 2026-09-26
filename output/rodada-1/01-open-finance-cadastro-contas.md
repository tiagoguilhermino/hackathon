# Open Finance Brasil — entidades e campos de Dados Cadastrais e Contas

> Pergunta: Quais entidades, campos, tipos e domínios (enums) as especificações públicas do Open Finance Brasil definem para dados cadastrais de clientes (PF e PJ) e para contas (depósito à vista, poupança, pagamento pré-paga), incluindo saldos, limites e transações de conta?

## Resumo executivo
Recorte do time ainda não definido.
- A especificação oficial (API Customers) define entidades separadas para Pessoa Natural (PF) e Pessoa Jurídica (PJ): identificação, qualificação e relacionamento financeiro, cada uma com sub-objetos e enums fechados [1][3] (evidência).
- A API Accounts define 5 grupos de dados: lista de contas, identificação da conta, saldos, limites de cheque especial/adiantamento e transações, cada um com enum próprio para tipo de conta, subtipo, indicador crédito/débito e tipo de transação [2][4] (evidência).
- Tipo de conta (`CONTA_DEPOSITO_A_VISTA`, `CONTA_POUPANCA`, `CONTA_PAGAMENTO_PRE_PAGA`) é o mesmo enum usado tanto em Contas quanto no relacionamento financeiro de Dados Cadastrais, o que liga as duas entidades pelo campo `type` [1][2][3][4] (evidência).
- Saldos e limites usam sempre um sub-objeto `{amount, currency}`; o enum de tipo de transação em Contas tem 17 valores, incluindo PIX, TED, DOC, boleto e saque [2][4] (evidência).
- Encontrei duas gerações de especificação com pequenas divergências de nome de campo e de tamanho de enum entre uma versão legada (GitHub Pages) e a versão corrente do repositório `openapi` — time deve validar contra a versão vigente antes de fixar o esquema do banco simulado [5][6][7] (evidência).
- Não confirmei a data exata de publicação das versões usadas (accounts 2.4.2, customers 2.2.1) nem o número de versão "oficialmente vigente" hoje segundo o Manual de Escopo do Open Finance — ficou como lacuna [7][8].

## Achados

### Estrutura da especificação e onde ela vive · EVIDÊNCIA
- O Open Finance Brasil publica as especificações OpenAPI/Swagger no GitHub da organização `OpenBanking-Brasil`, repositório `openapi`, pasta `swagger-apis`, com uma subpasta por API (`accounts`, `customers`, `resources`, `loans`, etc.) e um arquivo YAML versionado por release dentro de cada subpasta [1].
- A pasta `swagger-apis/accounts` lista 26 arquivos de versão, de `1.0.0-rc6.5` até `2.5.0-beta.2`; a última versão estável sem sufixo `beta`/`rc` é `2.4.2.yml` [2].
- A pasta `swagger-apis/customers` lista 17 arquivos de versão, de `1.0.0-rc6.5` até `2.3.0-beta.1`; a última versão estável é `2.2.1.yml` [3].
- O portal oficial "Área do Desenvolvedor" hoje roda em Confluence (`openfinancebrasil.atlassian.net`), mantido pela estrutura de governança do Open Finance Brasil (Febraban, ABBC, ACREFI, ABBI, OCB, Abecs, Abipag, Abranet, Câmara e-net, ABCD, ABFintechs), e organiza as versões de API segundo uma "Política de Versionamento" com ciclo de vida — não consegui abrir a tabela de versões vigentes dentro dessa página [8].
- Trecho decisivo: "hosted at openfinancebrasil.atlassian.net on the Atlassian Confluence platform" [8]
- Não sustenta: não confirma qual versão específica está "em produção obrigatória" para os participantes agora; não é uma tabela de datas de publicação, é a estrutura do portal.

### Dados Cadastrais — Pessoa Natural (PF) · EVIDÊNCIA
Fonte: YAML `customers/2.2.1.yml`, repositório oficial `OpenBanking-Brasil/openapi` [3].

| Entidade | Campo | Tipo/formato | Domínio (enum) |
|---|---|---|---|
| PersonalIdentificationData | updateDateTime | string, date-time | — |
| | personalId | string (id do recurso) | — |
| | civilName / socialName | string | — |
| | birthDate | string, date | — |
| | maritalStatusCode | string | SOLTEIRO, CASADO, VIUVO, SEPARADO_JUDICIALMENTE, DIVORCIADO, UNIAO_ESTAVEL, OUTRO |
| | sex | string | FEMININO, MASCULINO, OUTRO |
| | companiesCnpj | array de string | — |
| | hasBrazilianNationality | boolean | — |
| | documents.cpfNumber | string | — |
| | documents.passport | objeto (number, country, expirationDate, issueDate) | — |
| | otherDocuments[].type | string | CNH, RG, NIF, RNE, OUTROS |
| | filiation[].type | string | MAE, PAI |
| | contacts.postalAddresses[].countrySubDivision | string | siglas de UF (AC…TO) |
| | contacts.phones[].type | string | FIXO, MOVEL, OUTRO |
| PersonalQualificationData | occupationCode | string | RECEITA_FEDERAL, CBO, OUTRO |
| | informedIncome.frequency | string | DIARIA, SEMANAL, QUINZENAL, MENSAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL, ANUAL, OUTROS |
| | informedIncome.amount.{amount,currency} | string/string | — |
| | informedPatrimony.year | number | — |
| PersonalFinancialRelationData | productsServicesType[] | array de string | CONTA_DEPOSITO_A_VISTA, CONTA_POUPANCA, CONTA_PAGAMENTO_PRE_PAGA, CARTAO_CREDITO, OPERACAO_CREDITO, SEGURO, PREVIDENCIA, INVESTIMENTO, OPERACOES_CAMBIO, CONTA_SALARIO, CREDENCIAMENTO, OUTROS |
| | procurators[].type | string | REPRESENTANTE_LEGAL, PROCURADOR |
| | accounts[].type / subtype | string/string | mesmo enum de tipo de conta; subtipo: INDIVIDUAL, CONJUNTA_SIMPLES, CONJUNTA_SOLIDARIA |
| | portabilitiesReceived[] / paychecksBankLink[] | objetos | dados de portabilidade de salário |

- Trecho decisivo: "sex: enum [FEMININO, MASCULINO, OUTRO]" [3]
- Não sustenta: extração feita a partir de um YAML processado por ferramenta automática de leitura, não é cópia manual linha a linha; o time deve abrir o YAML original antes de fixar o esquema do banco simulado. Vale só para a versão 2.2.1; versões beta mais novas (2.3.0-beta.1) podem já ter mudado campos.

### Dados Cadastrais — Pessoa Jurídica (PJ) · EVIDÊNCIA
Fonte: mesmo YAML `customers/2.2.1.yml` [3].

| Entidade | Campo | Tipo/formato | Domínio (enum) |
|---|---|---|---|
| BusinessIdentificationData | businessId | string | — |
| | companyName / tradeName | string | — |
| | incorporationDate | string, date-time | — |
| | cnpjNumber | string | — |
| | companiesCnpj[] | array de string | — |
| | otherDocuments[].type | string | livre (não fechado nesta versão) |
| | parties[].personType | string | PESSOA_NATURAL, PESSOA_JURIDICA |
| | parties[].type | string | SOCIO, ADMINISTRADOR |
| | parties[].documentType | string | CPF, PASSAPORTE, OUTRO_DOCUMENTO_VIAGEM, CNPJ |
| | parties[].shareholding | string (percentual, tamanho fixo) | — |
| BusinessQualificationData | economicActivities[].code | string | código CNAE |
| | economicActivities[].isMain | boolean | — |
| | informedRevenue.frequency | string | DIARIA, SEMANAL, QUINZENAL, MENSAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL, ANUAL, OUTROS |
| | informedPatrimony.date | string, date | — |
| BusinessFinancialRelationData | productsServicesType[] | array de string | mesmo enum de PF (12 valores) |
| | procurators[].type | string | REPRESENTANTE_LEGAL, PROCURADOR |
| | accounts[].type | string | CONTA_DEPOSITO_A_VISTA, CONTA_POUPANCA, CONTA_PAGAMENTO_PRE_PAGA |

- Trecho decisivo: "parties[].documentType: enum [CPF, PASSAPORTE, OUTRO_DOCUMENTO_VIAGEM, CNPJ]" [3]
- Não sustenta: BusinessAccount, ao contrário de PersonalAccount, não trouxe campo `subtype` na extração desta versão — não confirmei se ele existe e foi omitido ou se realmente não existe nesta versão; ficou como lacuna.

### Contas — identificação, saldos e limites · EVIDÊNCIA
Fonte: YAML `accounts/2.4.2.yml`, repositório oficial `OpenBanking-Brasil/openapi` [2].

| Entidade | Campo | Tipo/formato | Domínio (enum) |
|---|---|---|---|
| AccountData (item de lista) | brandName, companyCnpj | string | — |
| | type | string, enum | CONTA_DEPOSITO_A_VISTA, CONTA_POUPANCA, CONTA_PAGAMENTO_PRE_PAGA |
| | compeCode / branchCode / number / checkDigit | string (tamanhos fixos: 3/4/20/1) | — |
| | accountId | string, até 100 caracteres | identificador do recurso, usado nos demais endpoints |
| AccountIdentificationData | subtype | string, enum | INDIVIDUAL, CONJUNTA_SIMPLES, CONJUNTA_SOLIDARIA |
| | currency | string, 3 caracteres | código ISO 4217 |
| AccountBalancesData | availableAmount.{amount,currency} | string(double)/string | saldo disponível |
| | blockedAmount.{amount,currency} | string(double)/string | saldo bloqueado |
| | automaticallyInvestedAmount.{amount,currency} | string(double)/string | valor investido automaticamente |
| | updateDateTime | string, date-time | — |
| AccountOverdraftLimitsData | overdraftContractedLimit.{amount,currency} | string(double)/string | limite de cheque especial contratado |
| | overdraftUsedLimit.{amount,currency} | string(double)/string | limite de cheque especial usado |
| | unarrangedOverdraftAmount.{amount,currency} | string(double)/string | valor de adiantamento a depositante não pactuado |

- Trecho decisivo: "overdraftContractedLimit, overdraftUsedLimit, unarrangedOverdraftAmount" [2]
- Não sustenta: valores monetários vêm como `string` com formato `double` (não `number` puro) na versão 2.4.2 — atenção ao tipar o banco simulado; não cobre a API separada "Unarranged Accounts Overdraft" (limite de cheque especial não pactuado), que existe como API própria e não foi lida em detalhe aqui.

### Contas — transações · EVIDÊNCIA
Fonte: mesmo YAML `accounts/2.4.2.yml` [2].

| Campo | Tipo/formato | Domínio (enum) |
|---|---|---|
| transactionId | string, até 100 caracteres | — |
| completedAuthorisedPaymentType | string, enum | TRANSACAO_EFETIVADA, LANCAMENTO_FUTURO, TRANSACAO_PROCESSANDO |
| creditDebitType | string, enum | CREDITO, DEBITO |
| transactionName | string, até 200 caracteres | — |
| type | string, enum (17 valores) | TED, DOC, PIX, TRANSFERENCIA_MESMA_INSTITUICAO, BOLETO, CONVENIO_ARRECADACAO, PACOTE_TARIFA_SERVICOS, TARIFA_SERVICOS_AVULSOS, FOLHA_PAGAMENTO, DEPOSITO, SAQUE, CARTAO, ENCARGOS_JUROS_CHEQUE_ESPECIAL, RENDIMENTO_APLIC_FINANCEIRA, PORTABILIDADE_SALARIO, RESGATE_APLIC_FINANCEIRA, OPERACAO_CREDITO, OUTROS |
| transactionAmount.{amount,currency} | string(double)/string | valor da transação |
| transactionDateTime | string, até 24 caracteres | data/hora da transação |
| partieCnpjCpf, partiePersonType, partieCompeCode, partieBranchCode, partieNumber, partieCheckDigit | string / string(enum) | partiePersonType: PESSOA_NATURAL, PESSOA_JURIDICA |

- Trecho decisivo: "type: enum [TED, DOC, PIX, ... , OUTROS]" (17 valores) [2]
- Não sustenta: não verifiquei se a API de transações também expõe parâmetros de paginação/filtro por data no mesmo detalhe — não estava no escopo desta pergunta (é comportamento de endpoint, não entidade de dado).

### Divergência entre versões antigas e atuais da especificação · EVIDÊNCIA
- A versão legada, publicada em GitHub Pages (`areadesenvolvedor/swagger/...yaml`, sem número de versão explícito no arquivo lido), difere da versão corrente do repositório `openapi` em pelo menos três pontos: nome de campo (`companyCnpj` vs. `companiesCnpj`), tamanho do enum `sex` (4 valores incluindo `NAO_DISPONIVEL` na versão antiga vs. 3 valores na versão 2.2.1) e valores extras em `procurators[].type` (`NAO_APLICA`/`NAO_POSSUI` na versão antiga, ausentes na 2.2.1) [5][6][2][3].
- O enum de subtipo de conta também mudou: a versão antiga trazia `SEM_SUB_TIPO_CONTA` e `SEM_TIPO_CONTA`, ausentes na versão 2.4.2 lida [4][2].
- Trecho decisivo: "sex (enum: FEMININO, MASCULINO, OUTRO, NAO_DISPONIVEL)" [5] vs. "sex: enum [FEMININO, MASCULINO, OUTRO]" [3]
- Não sustenta: não dá para saber, só com essas duas leituras, se a divergência é porque o GitHub Pages ficou desatualizado (mais provável, dado que a pasta `swagger-apis` tem versões numeradas e é o repositório ativo) ou se é uma bifurcação de fase (Fase 1 vs. Fase 2). Recomendo o time usar a versão numerada do repositório `openapi` (accounts 2.4.2 / customers 2.2.1, ou a mais recente estável disponível na hora da leitura) como fonte única para o esquema simulado.

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| API Customers (PF) | Define PersonalIdentificationData, PersonalQualificationData, PersonalFinancialRelationData com enums fechados (sexo, estado civil, ocupação, frequência de renda, tipo de conta) | evidência | versão 2.2.1 especificamente; versões beta futuras podem alterar campos | não confirmada (arquivo versionado 2.2.1) | [3] |
| API Customers (PJ) | Define BusinessIdentificationData, BusinessQualificationData, BusinessFinancialRelationData, incluindo sócios/administradores e CNAE | evidência | campo `subtype` de conta não apareceu para PJ nesta extração | não confirmada (arquivo versionado 2.2.1) | [3] |
| API Accounts | Define AccountData, AccountIdentificationData, AccountBalancesData, AccountOverdraftLimitsData, AccountTransactionsData com enums de tipo/subtipo de conta e tipo de transação | evidência | não cobre API separada de "Unarranged Accounts Overdraft"; valores monetários são string formatada, não number | não confirmada (arquivo versionado 2.4.2) | [2] |
| Estrutura do repositório oficial | Especificações vivem em `github.com/OpenBanking-Brasil/openapi/swagger-apis/<api>/<versão>.yml`, uma pasta por API | evidência | não é o único canal; portal oficial roda em Confluence também | consultado em 2026-09-26 | [1][2][3] |
| Portal oficial "Área do Desenvolvedor" | Confluence mantido pela governança do Open Finance Brasil, organiza versões por política de ciclo de vida | evidência | não abriu a tabela de versões vigentes dentro da página | consultado em 2026-09-26 | [8] |
| Divergência de campos entre gerações da spec | Nomes de campo e tamanho de enum mudaram entre a versão legada (GitHub Pages) e a versão numerada atual do repositório `openapi` | evidência | não identifica a data exata da migração nem a motivação | não confirmada | [5][6][2][3] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Entidades e campos de Dados Cadastrais PF/PJ | demo (modelar o banco simulado de clientes) · ficha P2 (como funciona e onde entra a IA, se a IA ler/gerar esses campos) |
| Entidades e campos de Contas (identificação, saldos, limites, transações) | demo (modelar o banco simulado de contas) · slide bloco 4 (o que foi construído e testado) |
| Enums fechados (tipo de conta, tipo de transação, etc.) | demo (gerar dados fictícios plausíveis e consistentes com o padrão real do setor) |
| Divergência entre versões da spec | slide bloco 5 (risco: time deve documentar qual versão da spec usou) · ficha P4 (principal risco) |
| Estrutura oficial do repositório e do portal | ficha P2 (mostrar que a solução se baseia em padrão público real, não inventado) |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Confirmar qual é a versão "oficialmente vigente" hoje (obrigatória para participantes) das APIs Accounts e Customers, com data de publicação | Abri a página "Especificações de APIs" no Confluence oficial, mas a tabela de versões não carregou no conteúdo extraído | alta |
| Ler o YAML original linha a linha (sem passar por resumo automático) para confirmar 100% dos nomes de campo, `required`, `minItems`/`maxItems` e descrições oficiais antes de fixar o esquema do banco simulado | Fiz leitura via ferramenta de busca/fetch que processa o conteúdo com IA; não abri o arquivo bruto num visualizador de texto simples | alta |
| Confirmar se `subtype` existe em BusinessAccount (PJ) na versão 2.2.1/2.4.2 | Busquei no YAML de customers 2.2.1; não apareceu na extração, mas não é prova de ausência | média |
| Confirmar API "Unarranged Accounts Overdraft" (limite de cheque especial não pactuado) como entidade própria, citada como pasta separada no repositório | Só vi o nome da pasta na listagem de diretórios; não abri o YAML dela | média |
| Confirmar diretamente no site do Banco Central (bcb.gov.br) o conteúdo da Instrução Normativa BCB nº 615 (Manual de APIs v7.0) e nº 759 (Manual de Escopo v8.0) mencionadas por um blog de terceiro | Encontrei a menção só num blog de fornecedor de software (TecnoSpeed); não abri o normativo original do BCB | média |
| Fora do escopo desta pergunta: demais APIs do Open Finance (cartão de crédito, empréstimos, investimentos, pagamentos) | Não pesquisado, pergunta era restrita a Dados Cadastrais e Contas | baixa |

## Fontes
1. [PRIMÁRIA] Open Finance Brasil · GitHub (organização OpenBanking-Brasil, repositório `openapi`) — OpenBanking-Brasil — https://github.com/OpenBanking-Brasil — consultado em 2026-09-26
2. [PRIMÁRIA] API Accounts - Open Finance Brasil, especificação OpenAPI versão 2.4.2 — OpenBanking-Brasil/openapi — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/accounts/2.4.2.yml — consultado em 2026-09-26
3. [PRIMÁRIA] API Customers - Open Finance Brasil, especificação OpenAPI versão 2.2.1 — OpenBanking-Brasil/openapi — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/customers/2.2.1.yml — consultado em 2026-09-26
4. [PRIMÁRIA] Diretório de versões da API Accounts — OpenBanking-Brasil/openapi — https://github.com/OpenBanking-Brasil/openapi/tree/main/swagger-apis/accounts — consultado em 2026-09-26
5. [PRIMÁRIA] Swagger legado de Dados Cadastrais (Customers), Área do Desenvolvedor (GitHub Pages) — OpenBanking-Brasil — https://openbanking-brasil.github.io/areadesenvolvedor/swagger/swagger_customers_apis.yaml — consultado em 2026-09-26
6. [PRIMÁRIA] Swagger legado de Contas (Accounts), Área do Desenvolvedor (GitHub Pages) — OpenBanking-Brasil — https://openbanking-brasil.github.io/areadesenvolvedor/swagger/swagger_accounts_apis.yaml — consultado em 2026-09-26
7. [PRIMÁRIA] Diretório de versões da API Customers — OpenBanking-Brasil/openapi — https://github.com/OpenBanking-Brasil/openapi/tree/main/swagger-apis/customers — consultado em 2026-09-26
8. [PRIMÁRIA] Área do Desenvolvedor — Especificações de APIs (portal oficial, Confluence) — Open Finance Brasil (governança: Febraban, ABBC, ACREFI, ABBI, OCB, Abecs, Abipag, Abranet, Câmara e-net, ABCD, ABFintechs) — https://openfinancebrasil.atlassian.net/wiki/spaces/OF/pages/17367659/Especifica+es+de+APIs — consultado em 2026-09-26
9. [IMPRENSA] Open Finance Brasil: o guia para Software Houses em 2026 (menção às fases do Open Finance e a Instruções Normativas BCB 615 e 759, não verificado na fonte primária do BCB) — TecnoSpeed (blog corporativo) — https://blog.tecnospeed.com.br/open-finance-brasil/ — consultado em 2026-09-26
