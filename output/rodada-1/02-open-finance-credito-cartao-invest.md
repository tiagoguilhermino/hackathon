# Open Finance Brasil: entidades e campos — cartão de crédito, crédito e investimentos

> Pergunta: Quais entidades, campos e domínios as especificações públicas do Open Finance Brasil definem para cartão de crédito (contas, faturas, transações, limites), operações de crédito (empréstimos, financiamentos, adiantamento a depositantes, direitos creditórios descontados) e investimentos?

## Resumo executivo
Recorte do time ainda não definido.
- A API pública "Credit Cards Accounts" (v2.3.1) define 4 entidades centrais — conta, fatura, transação, limite — com endpoints REST versionados [1] (evidência).
- Loans, Financings, Unarranged Accounts Overdraft e Invoice Financings compartilham o mesmo modelo de "Contrato" (taxas, tarifas, encargos, garantias, parcelas, pagamentos), variando principalmente em `productType`/`productSubType` [2][3][4][5] (evidência).
- "Adiantamento a depositantes" e "direitos creditórios descontados" (cheque especial/desconto de duplicatas) são, no Open Finance, produtos com `productType` fixo dentro das APIs Unarranged Accounts Overdraft e Invoice Financings, não APIs à parte com nome literal [4][5] (evidência).
- Investimentos têm duas famílias de API distintas: um catálogo público sem consentimento (renda fixa bancária, crédito, fundos, tesouro, renda variável, nível instituição) [6] e cinco APIs por produto com consentimento que trazem posição e movimentação do cliente (`/investments`, `/balances`, `/transactions`) [7][8][9][10][11] (evidência).
- Todas as APIs (exceto o catálogo aberto de investimentos) exigem consentimento do cliente e retornam também uma lista paginada antes do detalhe — relevante para modelar relacionamento 1‑N no banco simulado [1][2][6] (evidência).
- A extração de campos e enums foi feita por resumo automático do YAML bruto, não por leitura literal byte a byte — listas de enum muito longas (ex.: `warrantySubType`, `productType` de cartão) podem estar incompletas (hipótese sobre a própria extração, não sobre a fonte).

## Achados

### Cartão de crédito: contas, faturas, transações e limites · EVIDÊNCIA
- A API "Credit Cards Accounts" v2.3.1 define 7 endpoints GET: `/accounts`, `/accounts/{id}`, `/accounts/{id}/bills`, `/accounts/{id}/bills/{billId}/transactions`, `/accounts/{id}/limits`, `/accounts/{id}/transactions`, `/accounts/{id}/transactions-current` [1].
- Entidades principais: `CreditCardAccountsData` (lista de contas), `CreditCardsAccountsIdentificationData` (identificação), `CreditCardAccountsBillsData` (fatura), `CreditCardAccountsBillsFinanceCharge` e `CreditCardAccountsBillsPayment` (encargos e pagamentos da fatura), `CreditCardAccountsTransaction`/`CreditCardAccountsBillsTransactions` (transações), `CreditCardAccountsLimitsData` (limites) [1].
- Relação: 1 conta → N faturas → N transações da fatura; 1 conta → N transações (histórico e "current"); 1 conta → N limites (um registro por `creditLineLimitType`, ex. limite total vs. por modalidade) [1].
- Trecho decisivo: "returns information about investment operations... product information, quantity, client position balances" [7] — nota: este trecho é do resumo das APIs de investimento, citado aqui só para ilustrar o padrão de resposta "posição do cliente" também presente nas APIs de crédito.
- Não sustenta: extração feita via resumo automático de um LLM sobre o YAML bruto de uma única versão (2.3.1, a mais recente estável em 26/09/2026); não cobre a versão beta 2.4.0-beta.2 nem valida caractere a caractere a lista completa do enum `productType` (bandeiras/categorias de cartão), que pode ter mais valores do que os listados.

#### Campos principais — Cartão de crédito
| Entidade | Campo | Tipo | Domínio (enum) / nota |
|---|---|---|---|
| CreditCardAccountsData | creditCardAccountId, brandName, companyCnpj, name | string | — |
| CreditCardAccountsData | productType | enum | CLASSIC_NACIONAL, GOLD, PLATINUM, INFINITE (lista incompleta, ver Lacunas) |
| CreditCardAccountsData | creditCardNetwork | enum | VISA, MASTERCARD, AMERICAN_EXPRESS, ELO, OUTRAS |
| CreditCardAccountsBillsData | billId, dueDate | string/date | — |
| CreditCardAccountsBillsData | billTotalAmount, billMinimumAmount | objeto {amount, currency} | currency ISO‑4217 |
| CreditCardAccountsBillsData | isInstalment | boolean | — |
| CreditCardAccountsBillsFinanceCharge | type | enum | JUROS_REMUNERATORIOS_ATRASO_PAGAMENTO_FATURA, MULTA_ATRASO_PAGAMENTO_FATURA, JUROS_MORA_ATRASO_PAGAMENTO_FATURA, IOF, OUTROS |
| CreditCardAccountsBillsPayment | valueType | enum | VALOR_PAGAMENTO_FATURA_PARCELADO, VALOR_PAGAMENTO_FATURA_REALIZADO, OUTRO_VALOR_PAGO_FATURA |
| CreditCardAccountsBillsPayment | paymentMode | enum | DEBITO_CONTA_CORRENTE, BOLETO_BANCARIO, AVERBACAO_FOLHA, PIX |
| CreditCardAccountsTransaction | transactionId, identificationNumber, transactionName, billId | string | — |
| CreditCardAccountsTransaction | creditDebitType | enum | CREDITO, DEBITO |
| CreditCardAccountsTransaction | transactionType | enum | PAGAMENTO, TARIFA, OPERACOES_CREDITO_CONTRATADAS_CARTAO, ESTORNO, CASHBACK, OUTROS |
| CreditCardAccountsTransaction | paymentType | enum | A_VISTA, A_PRAZO |
| CreditCardAccountsTransaction | feeType | enum | ANUIDADE, SAQUE_CARTAO_BRASIL, SAQUE_CARTAO_EXTERIOR, AVALIACAO_EMERGENCIAL_CREDITO, EMISSAO_SEGUNDA_VIA, TARIFA_PAGAMENTO_CONTAS, SMS, OUTRA |
| CreditCardAccountsTransaction | otherCreditsType | enum | CREDITO_ROTATIVO, PARCELAMENTO_FATURA, EMPRESTIMO, OUTROS |
| CreditCardAccountsTransaction | chargeIdentificator, chargeNumber | integer | número da parcela / total de parcelas |
| CreditCardAccountsTransaction | amount, brazilianAmount | objeto {amount, currency} | — |
| CreditCardAccountsTransaction | transactionDateTime, billPostDate | date-time/date | ISO‑8601 UTC |
| CreditCardAccountsTransaction | payeeMCC | integer | Merchant Category Code |
| CreditCardAccountsLimitsData | creditLineLimitType | enum | LIMITE_CREDITO_TOTAL, LIMITE_CREDITO_MODALIDADE_OPERACAO |
| CreditCardAccountsLimitsData | consolidationType | enum | CONSOLIDADO, INDIVIDUAL |
| CreditCardAccountsLimitsData | lineName | enum | CREDITO_A_VISTA, CREDITO_PARCELADO, SAQUE_CREDITO_BRASIL, SAQUE_CREDITO_EXTERIOR, EMPRESTIMO_CARTAO_CONSIGNADO, OUTROS |
| CreditCardAccountsLimitsData | isLimitFlexible | boolean | — |
| CreditCardAccountsLimitsData | limitAmount, usedAmount, availableAmount, customizedLimitAmount | objeto {amount, currency} | — |

### Operações de crédito: modelo comum de contrato (empréstimos, financiamentos, adiantamento a depositantes, direitos creditórios descontados) · EVIDÊNCIA
- Loans (2.5.0), Financings (2.4.0), Unarranged Accounts Overdraft (2.5.0) e Invoice Financings (2.4.0) expõem os mesmos 5 endpoints GET: `/contracts`, `/contracts/{id}`, `/contracts/{id}/warranties`, `/contracts/{id}/scheduled-instalments`, `/contracts/{id}/payments` [2][3][4][5].
- As quatro APIs reaproveitam a mesma estrutura de entidades — Contrato, Taxa de juros, Tarifa contratada, Encargo, Parcelas, Pagamentos/Lançamentos, Garantias — mudando o prefixo do nome (`Loans...`, `Financings...`, `UnarrangedAccountOverdraft...`, `InvoiceFinancings...`) e os enums de `productType`/`productSubType` [2][3][4][5].
- `productType` fixa a categoria de crédito: Loans = `EMPRESTIMOS`; Financings = `FINANCIAMENTOS`, `FINANCIAMENTOS_RURAIS`, `FINANCIAMENTOS_IMOBILIARIOS`; Unarranged Accounts Overdraft = `ADIANTAMENTO_A_DEPOSITANTES` (cheque especial/conta garantida); Invoice Financings = `DIREITOS_CREDITORIOS_DESCONTADOS` (desconto de duplicatas, cheques, antecipação de fatura de cartão) [2][3][4][5].
- Trecho decisivo: "productType | string | ADIANTAMENTO_A_DEPOSITANTES" [4].
- Não sustenta: as quatro APIs são catálogos de contrato já formalizado (histórico), não de decisão de crédito ou de score; não descrevem regras de aprovação, política de risco ou limites pré-aprovados — isso não está nesse conjunto de especificações.

#### Campos principais — Contrato de crédito (comum às 4 APIs)
| Entidade | Campo | Tipo | Domínio (enum) / nota |
|---|---|---|---|
| Contract | contractNumber, ipocCode, productName | string | ipocCode = identificador único da operação de crédito no país |
| Contract | productType / productSubType | enum | ver por API acima; ex. Loans: `HOME_EQUITY, CHEQUE_ESPECIAL, CONTA_GARANTIDA, CAPITAL_GIRO_TETO_ROTATIVO, CREDITO_PESSOAL_SEM_CONSIGNACAO, CREDITO_PESSOAL_COM_CONSIGNACAO, MICROCREDITO_PRODUTIVO_ORIENTADO,...`; Financings: `AQUISICAO_BENS_VEICULOS_AUTOMOTORES, AQUISICAO_BENS_OUTROS_BENS, MICROCREDITO, CUSTEIO, INVESTIMENTO, INDUSTRIALIZACAO, COMERCIALIZACAO, FINANCIAMENTO_HABITACIONAL_SFH, FINANCIAMENTO_HABITACIONAL_EXCETO_SFH`; Invoice Financings: `DESCONTO_DUPLICATAS, DESCONTO_CHEQUES, ANTECIPACAO_FATURA_CARTAO_CREDITO, OUTROS_DIREITOS_CREDITORIOS_DESCONTADOS, OUTROS_TITULOS_DESCONTADOS` |
| Contract | contractDate, settlementDate, dueDate, firstInstalmentDueDate | date | RFC‑3339 |
| Contract | disbursementDates | array[date] | — |
| Contract | contractAmount, currency | double/string + ISO‑4217 | tipo varia entre "double" e "string" conforme a API no resumo extraído (ver Lacunas) |
| Contract | instalmentPeriodicity | enum | SEM_PERIODICIDADE_REGULAR, SEMANAL, QUINZENAL, MENSAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL, ANUAL, OUTROS |
| Contract | CET | double | custo efetivo total, percentual, 6 casas decimais |
| Contract | amortizationScheduled | enum | SAC, PRICE, SAM, SEM_SISTEMA_AMORTIZACAO, OUTROS |
| Contract | hasInsuranceContracted | boolean | — |
| ContractInterestRate | taxType | enum | NOMINAL, EFETIVA |
| ContractInterestRate | interestRateType | enum | SIMPLES, COMPOSTO |
| ContractInterestRate | taxPeriodicity | enum | AM, AA |
| ContractInterestRate | calculation | enum | 21/252, 30/360, 30/365 |
| ContractInterestRate | referentialRateIndexerType | enum | SEM_TIPO_INDEXADOR, PRE_FIXADO, POS_FIXADO, FLUTUANTES, INDICES_PRECOS, CREDITO_RURAL, OUTROS_INDEXADORES |
| ContractInterestRate | referentialRateIndexerSubType | enum | CDI, SELIC, TR_TBF, TJLP, LIBOR, TLP, IGPM, IPCA, IPCC, TCR_PRE, TCR_POS, TRFC_PRE, TRFC_POS e outros (18+ valores) |
| ContractInterestRate | preFixedRate, postFixedRate | double | percentual, 6 casas decimais |
| ContractedFee | feeName, feeCode | string | — |
| ContractedFee | feeChargeType | enum | UNICA, POR_PARCELA |
| ContractedFee | feeCharge | enum | MINIMO, MAXIMO, FIXO, PERCENTUAL |
| FinanceCharge | chargeType | enum | JUROS_REMUNERATORIOS_POR_ATRASO, MULTA_ATRASO_PAGAMENTO, JUROS_MORA_ATRASO, IOF_CONTRATACAO, IOF_POR_ATRASO, SEM_ENCARGO, OUTROS |
| Instalments | typeNumberOfInstalments / typeContractRemaining | enum | DIA, SEMANA, MES, ANO, SEM_PRAZO_TOTAL / SEM_PRAZO_REMANESCENTE |
| Instalments | totalNumberOfInstalments, paidInstalments, dueInstalments, pastDueInstalments, contractRemainingNumber | number | — |
| Instalments | balloonPayments | array | pagamentos não regulares (data + valor) |
| Payments | paidInstalments, contractOutstandingBalance | number/double | saldo devedor atual |
| Payments.releases | paymentId, instalmentId, isOverParcelPayment, paidDate, paidAmount | string/bool/date/double | isOverParcelPayment: true = pagamento extraordinário |
| Warranties | warrantyType | enum | CESSAO_DIREITOS_CREDITORIOS, CAUCAO, PENHOR, ALIENACAO_FIDUCIARIA, HIPOTECA, OPERACOES_GARANTIDAS_PELO_GOVERNO, OUTRAS_GARANTIAS_NAO_FIDEJUSSORIAS, SEGUROS_ASSEMELHADOS, GARANTIA_FIDEJUSSORIA, BENS_ARRENDADOS, GARANTIAS_INTERNACIONAIS, OPERACOES_GARANTIDAS_OUTRAS_ENTIDADES, ACORDOS_COMPENSACAO |
| Warranties | warrantySubType | enum | 30 a 44+ valores conforme a API (ex.: IMOVEIS, VEICULOS, ACOES_DEBENTURES, PESSOA_FISICA, PESSOA_JURIDICA); lista completa não extraída literalmente (ver Lacunas) |
| Warranties | warrantyAmount, currency | double/string + ISO‑4217 | — |

### Investimentos: catálogo público (opendata) vs. posição do cliente por produto · EVIDÊNCIA
- Existem duas famílias de API de investimento com propósitos diferentes: (a) "Investments" v1.0.1, um catálogo aberto sem consentimento, com endpoints `/funds`, `/bank-fixed-incomes`, `/credit-fixed-incomes`, `/variable-incomes`, `/treasure-titles`, retornando características de produtos ofertados pela instituição (taxas, indexador, público-alvo), sem posição de cliente [6].
- (b) Cinco APIs por produto que exigem consentimento — Funds (1.1.0), Bank Fixed Incomes (1.1.0), Credit Fixed Incomes (1.1.0), Variable Incomes (1.3.0), Treasure Titles (1.1.0) — todas com o mesmo padrão de endpoints `/investments`, `/investments/{id}`, `/investments/{id}/balances`, `/investments/{id}/transactions`, `/investments/{id}/transactions-current`; Variable Incomes adiciona `/broker-notes/{brokerNoteId}` [7][8][9][10][11].
- As 5 APIs de consentimento retornam três blocos por produto: identificação (características do ativo), saldo/posição (quantidade, valor bruto/líquido, impostos provisionados, saldo bloqueado) e transações/movimentações (compra, venda, resgate, amortização, transferência etc.) [7][8][9][10][11].
- Trecho decisivo: "quotaQuantity... client position balances and financial movements" [7].
- Não sustenta: o catálogo aberto (a) não traz dado de cliente nenhum — é só oferta institucional; nenhuma das 5 APIs de posição publica preço de mercado em tempo real (Variable Incomes usa fechamento do pregão anterior, D‑1); nenhuma cobre previdência (`pension`) ou títulos de capitalização (`capitalization-bonds`), que são pastas separadas no mesmo repositório e ficaram fora do escopo desta pergunta.

#### Campos principais — Investimentos (posição do cliente, comum às 5 APIs)
| Entidade | Campo | Tipo | Domínio (enum) / nota |
|---|---|---|---|
| ProductIdentification (Funds) | name, cnpjNumber, isinCode, anbimaCategory, anbimaClass, anbimaSubclass | string/enum | anbimaCategory: RENDA_FIXA, ACOES, MULTIMERCADO, CAMBIAL |
| ProductIdentification (Bank Fixed Income) | issuerInstitutionCnpjNumber, isinCode, investmentType | string/enum | investmentType: CDB, RDB, LCI, LCA |
| ProductIdentification (Credit Fixed Income) | investmentType, debtorCnpjNumber, debtorName, taxExemptProduct | string/enum | investmentType: DEBENTURES, CRI, CRA; taxExemptProduct: SIM, NAO |
| ProductIdentification (Variable Income) | issuerInstitutionCnpjNumber, isinCode, ticker | string | ticker = código de negociação em bolsa |
| ProductIdentification (Treasure Titles) | isinCode, productName, voucherPaymentIndicator, voucherPaymentPeriodicity | string/enum | voucherPaymentPeriodicity: MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL, IRREGULAR, OUTROS |
| Remuneration (comum a renda fixa) | indexer | enum | CDI, DI, TR, IPCA, IGP_M, IGP_DI, INPC, BCP, TLC, SELIC, PRE_FIXADO, OUTROS |
| Remuneration | rateType | enum | LINEAR, EXPONENCIAL |
| Remuneration | ratePeriodicity | enum | MENSAL, ANUAL, DIARIO, SEMESTRAL |
| Remuneration | calculation | enum | DIAS_UTEIS, DIAS_CORRIDOS |
| Balances (comum) | referenceDate/DateTime, quantity, grossAmount, netAmount, incomeTax, financialTransactionTax, blockedBalance, purchaseUnitPrice, updatedUnitPrice | date/double/objeto{amount,currency} | — |
| Transactions (Funds) | type, transactionType | enum | type: ENTRADA, SAIDA; transactionType: AMORTIZACAO, TRANSFERENCIA_COTAS, APLICACAO, RESGATE, COME_COTAS, OUTROS |
| Transactions (Bank/Credit Fixed Income) | transactionType | enum | APLICACAO, RESGATE, CANCELAMENTO, VENCIMENTO, PAGAMENTO_JUROS, AMORTIZACAO, TRANSFERENCIA_TITULARIDADE, TRANSFERENCIA_CUSTODIA, (PREMIO, MULTA, MORA só em Credit Fixed Income), OUTROS |
| Transactions (Variable Income) | transactionType | enum | COMPRA, VENDA, DIVIDENDOS, JCP, ALUGUEIS, TRANSFERENCIA_CUSTODIA, TRANSFERENCIA_TITULARIDADE, OUTROS |
| Transactions (Treasure Titles) | transactionType | enum | COMPRA, VENDA, CANCELAMENTO, VENCIMENTO, PAGAMENTO_JUROS, AMORTIZACAO, TRANSFERENCIA_TITULARIDADE, TRANSFERENCIA_CUSTODIA, OUTROS |
| BrokerNote (só Variable Income) | brokerNoteNumber, grossValue, brokerageFee, clearingSettlementFee, clearingRegistrationFee, stockExchangeFee, incomeTax, netValue | string/objeto{amount,currency} | nota de corretagem, obrigatória em COMPRA/VENDA |
| Investments (catálogo opendata) | anbimaCategory, taxation (fundos) | enum | taxation: CURTO_PRAZO, LONGO_PRAZO, VARIAVEL |
| Investments (catálogo opendata) | targetAudience | enum | PESSOA_NATURAL, PESSOA_JURIDICA |

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| Credit Cards Accounts API | Define conta, fatura, transação e limite de cartão, 7 endpoints GET | Evidência | Versão 2.3.1; não cobre beta 2.4.0-beta.2 nem regras de aprovação de crédito | consultado 26/09/2026 (spec sem data de publicação explícita no arquivo) | [1] |
| Loans API | Modelo de contrato de empréstimo: taxas, tarifas, encargos, garantias, parcelas, pagamentos | Evidência | Versão 2.5.0; não cobre versão beta 2.6.0-beta.1 | consultado 26/09/2026 | [2] |
| Financings API | Mesmo modelo de contrato, com productType/Subtype de financiamento (veículo, imóvel, rural) | Evidência | Versão 2.4.0; não descreve política de crédito | consultado 26/09/2026 | [3] |
| Unarranged Accounts Overdraft API | "Adiantamento a depositantes" é productType fixo dessa API (cheque especial/conta garantida) | Evidência | Versão 2.5.0; não é uma API separada chamada "adiantamento" | consultado 26/09/2026 | [4] |
| Invoice Financings API | "Direitos creditórios descontados" é productType fixo (desconto de duplicatas/cheques, antecipação de fatura) | Evidência | Versão 2.4.0; não cobre factoring fora do desenho do Open Finance | consultado 26/09/2026 | [5] |
| Investments (opendata) | Catálogo público de produtos de investimento por instituição, sem posição de cliente | Evidência | Versão 1.0.1; não tem dado de cliente | consultado 26/09/2026 | [6] |
| Funds API | Posição e movimentação de cotas do cliente em fundos | Evidência | Versão 1.1.0; não tem beta 1.1.0-beta.1 revisado | consultado 26/09/2026 | [7] |
| Bank Fixed Incomes API | Posição e movimentação do cliente em CDB/RDB/LCI/LCA | Evidência | Versão 1.1.0 | consultado 26/09/2026 | [8] |
| Credit Fixed Incomes API | Posição e movimentação do cliente em debêntures/CRI/CRA | Evidência | Versão 1.1.0 | consultado 26/09/2026 | [9] |
| Variable Incomes API | Posição, movimentação e nota de corretagem do cliente em ações/ETF, saldo D‑1 | Evidência | Versão 1.3.0; preço é do pregão anterior, não tempo real | consultado 26/09/2026 | [10] |
| Treasure Titles API | Posição e movimentação do cliente em Tesouro Direto | Evidência | Versão 1.1.0 | consultado 26/09/2026 | [11] |
| Estrutura de pastas do repositório | 39 pastas de API no repositório oficial, confirmando escopo de produtos cobertos | Evidência | Lista de pastas obtida via GitHub API em 26/09/2026; pode mudar com novas versões | consultado 26/09/2026 | [12] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Campos de cartão de crédito (contas, faturas, transações, limites) | demo · bloco 4 (o que foi construído e testado) · P2 (como funciona e onde entra a IA) |
| Modelo comum de contrato de crédito (Loans/Financings/Unarranged/Invoice Financings) | demo · bloco 4 · P2 |
| Campos de investimentos (catálogo vs. posição do cliente) | demo · bloco 4 · P2 |
| Relacionamentos 1‑N (conta→fatura→transação; contrato→parcelas/pagamentos/garantias; produto→saldo→transações) | bloco 3 (solução e jornada) · demo |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Lista literal completa dos enums longos (ex.: `warrantySubType` com 30–44 valores, `productType` de cartão de crédito, `referentialRateIndexerSubType`) | Fetch do YAML bruto via raw.githubusercontent.com com prompt pedindo lista completa; a ferramenta processa o conteúdo com um modelo de resumo, não devolve o arquivo literal — risco de valores omitidos ou truncados | Alta |
| Confirmar tipo exato do campo de valores monetários (`contractAmount`, `feeAmount`, `warrantyAmount`) — "double" ou "string" com padrão regex — pois os resumos automáticos divergiram entre APIs que deveriam ser idênticas | Comparei os resumos de Loans, Financings, Unarranged Accounts Overdraft e Invoice Financings; não abri o YAML linha a linha para conferir | Média |
| Conteúdo das versões beta mais recentes (Loans 2.6.0-beta.1, Credit Cards 2.4.0-beta.2, Unarranged Accounts Overdraft 2.5.0-beta.1, Variable Incomes 1.3.0-beta.1, Funds 1.1.0-beta.1) que podem antecipar campos/enums novos | Só listei os nomes dos arquivos via GitHub API, não abri o conteúdo dos betas | Baixa |
| API "accounts" (conta corrente/poupança) e demais produtos do repositório (seguros, capitalização, previdência, câmbio, portabilidade) | Fora do recorte da pergunta; identifiquei as pastas via GitHub API mas não abri as specs | Baixa (fora do escopo) |
| Dicionário de dados oficial em português (Confluence/Atlassian do Open Finance Brasil) para checar nomes/traduções de campo contra o OpenAPI | Localizei os links via busca, mas não abri o wiki porque as specs OpenAPI já respondiam à pergunta central; útil para uma segunda conferência | Média |
| Regras de aprovação/score de crédito, políticas de limite pré-aprovado ou de concessão | Não existe isso nas APIs de dados (Loans/Financings/Unarranged/Invoice Financings): elas só expõem contratos já formalizados | Baixa (não é objeto do Open Finance de dados) |

## Fontes
1. [PRIMÁRIA] Open Finance Brasil — API Credit Cards Accounts, especificação OpenAPI v2.3.1 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/credit-cards/2.3.1.yml — consultado 26/09/2026
2. [PRIMÁRIA] Open Finance Brasil — API Loans, especificação OpenAPI v2.5.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/loans/2.5.0.yml — consultado 26/09/2026
3. [PRIMÁRIA] Open Finance Brasil — API Financings, especificação OpenAPI v2.4.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/financings/2.4.0.yml — consultado 26/09/2026
4. [PRIMÁRIA] Open Finance Brasil — API Unarranged Accounts Overdraft, especificação OpenAPI v2.5.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/unarranged-accounts-overdraft/2.5.0.yml — consultado 26/09/2026
5. [PRIMÁRIA] Open Finance Brasil — API Invoice Financings, especificação OpenAPI v2.4.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/invoice-financings/2.4.0.yml — consultado 26/09/2026
6. [PRIMÁRIA] Open Finance Brasil — API Investments (catálogo opendata), especificação OpenAPI v1.0.1 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/investments/1.0.1.yml — consultado 26/09/2026
7. [PRIMÁRIA] Open Finance Brasil — API Funds (posição do cliente), especificação OpenAPI v1.1.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/funds/1.1.0.yml — consultado 26/09/2026
8. [PRIMÁRIA] Open Finance Brasil — API Bank Fixed Incomes (posição do cliente), especificação OpenAPI v1.1.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/bank-fixed-incomes/1.1.0.yml — consultado 26/09/2026
9. [PRIMÁRIA] Open Finance Brasil — API Credit Fixed Incomes (posição do cliente), especificação OpenAPI v1.1.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/credit-fixed-incomes/1.1.0.yml — consultado 26/09/2026
10. [PRIMÁRIA] Open Finance Brasil — API Variable Incomes (posição do cliente), especificação OpenAPI v1.3.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/variable-incomes/1.3.0.yml — consultado 26/09/2026
11. [PRIMÁRIA] Open Finance Brasil — API Treasure Titles (posição do cliente), especificação OpenAPI v1.1.0 — OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/treasure-titles/1.1.0.yml — consultado 26/09/2026
12. [PRIMÁRIA] Repositório oficial de especificações OpenAPI do Open Finance Brasil (estrutura de pastas swagger-apis) — OpenBanking-Brasil (GitHub) — https://github.com/OpenBanking-Brasil/openapi — consultado 26/09/2026
