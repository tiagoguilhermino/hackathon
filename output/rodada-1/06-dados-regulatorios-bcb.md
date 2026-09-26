# Estruturas de dados que um banco reporta ao Banco Central

> Pergunta: Que estruturas de dados um banco no Brasil é obrigado a manter e reportar ao Banco Central (plano de contas COSIF, SCR/documento 3040, CCS, cadastro e KYC de clientes, prevenção à lavagem de dinheiro, ouvidoria), e quais entidades e campos principais elas têm?

## Resumo executivo
Recorte do time ainda não definido.
- O SCR (documento 3040) organiza crédito por tipo de cliente (PF/PJ), modalidade, UF, CNAE/ocupação, porte, origem de recursos, indexador e faixas de vencimento/atraso [1] (evidência).
- A escala de risco AA–H (com atraso e provisão associados) veio da Resolução CMN 2.682/1999 e está reproduzida no Cosif; desde 1º/1/2025 foi substituída, para fins de perda esperada, pela Resolução CMN 4.966/2021 (estágios 1-2-3) [3][4][10][11] (evidência, com transição em curso).
- O Cosif codifica contas em 5 níveis + dígito verificador (grupo·subgrupo·desdobramento·título·subtítulo-DV) [5] (evidência).
- O CCS (Resolução BCB 179/2022) guarda só o vínculo cliente-instituição (CPF/CNPJ, CNPJ da IF, datas de início/fim, tipo de conta em 6 grupos, tipo de vínculo), sem saldo ou movimentação explícitos no texto [8] (evidência).
- A Circular 3.978/2020 fixa os campos mínimos de KYC/PLD-FT: identificação (nome+CPF ou razão social+CNPJ), qualificação (residência/sede, renda/faturamento), classificação de risco, PEP e beneficiário final [2] (evidência).
- A ouvidoria (Resolução CMN 4.860/2020) exige protocolo, prazo de resposta de até 10 dias úteis, histórico guardado por 5 anos e nota de satisfação de 1 a 5 [7] (evidência); a Resolução CMN 5.182/2024 alterou essa norma, mas não li o texto integral da alteração [9] (lacuna).

## Achados

### SCR / documento 3040 (Sistema de Informações de Crédito) · EVIDÊNCIA
- O Banco Central publica mensalmente dados agregados do documento 3040, que reúne toda operação de crédito acima de R$ 200 (a partir de maio/2016), aberta por tipo de cliente (PF/PJ), modalidade, UF (pelo CEP), CNAE (PJ, até 7 dígitos) ou natureza da ocupação (PF), porte (PF por faixa de salário mínimo; PJ micro/pequeno/médio/grande), origem de recursos (com/sem destinação específica) e indexador (prefixado, pós-fixado, flutuante, índice de preços, TCR/TRFC).
- As operações são somadas por faixa de vencimento (até 90 dias; 91-360; 361-1080; 1081-1800; 1801-5400; acima de 5400 dias) e por valor vencido acima de 15 dias; "carteira inadimplida arrastada" soma tudo com parcela vencida há mais de 90 dias.
- Trecho decisivo: "documento 3040 (SCR), com informações detalhadas de todas as operações de crédito" [1]
- Não sustenta: não obtive a lista completa das submodalidades do Anexo 3 nem o leiaute campo a campo do doc 3040 (o arquivo Excel do leiaute não pôde ser lido como texto); não confirmei se, após a mudança de regra de risco em 2025, o doc 3040 ainda pede o rótulo AA-H ou passou a pedir o estágio de perda esperada.

### Classificação de risco de crédito (AA a H) e provisionamento · EVIDÊNCIA
- A Resolução CMN 2.682/1999 mandava classificar toda operação de crédito em 9 níveis crescentes de risco (AA, A, B, C, D, E, F, G, H), com faixa de atraso associada (B: 15-30 dias; C: 31-60; D: 61-90; E: 91-120; F: 121-150; G: 151-180; H: acima de 180 dias) e provisão mínima por nível (A 0,5% até H 100%). O mesmo texto está reproduzido no capítulo 1 do Cosif.
- Essa tabela deixou de valer para fins de perda esperada a partir de 1º/1/2025: a Resolução CMN 4.966/2021 trocou o modelo de "perda incorrida" por "perda esperada" em 3 estágios, alinhado ao IFRS 9, segundo fontes de consultoria e imprensa especializada.
- Trecho decisivo: "atraso superior a 180 (cento e oitenta) dias" define o nível H [3][4]
- Não sustenta: não li o texto integral da Resolução CMN 4.966/2021 (só resumos de consultoria/imprensa), não confirmei o novo leiaute de campo nem se o cronograma de adoção varia por segmento de porte (S1-S5); a página do Cosif que reproduz a tabela AA-H pode estar desatualizada em relação à nova regra — não verifiquei a data da última revisão dessa página.

### Cosif · plano de contas · EVIDÊNCIA
- O código de conta do Cosif tem 5 níveis de agregação mais um dígito de controle (grupo contábil, 1 dígito; subgrupo contábil, 1 dígito; desdobramento de subgrupo, 1 dígito; título contábil, 2 dígitos; subtítulo de 1º grau, 2 dígitos; DV calculado), no formato X.X.X.XX.XX-X. Exemplos de grupo: 1 = Ativo Realizável; 2 = Ativo Permanente; 3 = Compensação Ativa; 4 = Passivo Exigível; 6 = Patrimônio Líquido.
- O Cosif é regido pela Resolução CMN 4.858/2020 e se aplica às instituições autorizadas a funcionar pelo BCB; para conglomerado prudencial, o capítulo 16.3 do manual fixa prazo de envio das demonstrações financeiras de até 60 dias (base 30/6) ou 90 dias (base 31/12), com exceção expressa de administradoras de consórcio e cooperativas de crédito nessa regra específica de conglomerado.
- Trecho decisivo: "denominado grupo contábil, de um dígito" ... "dígito de controle" [5]
- Não sustenta: não obtive a lista completa dos 8 grupos contábeis (faltam 5, 7 e 8) nem a periodicidade de todos os documentos que uma instituição deve enviar (ex.: balancete mensal, IF.data); a isenção de administradoras de consórcio vista no capítulo 16.3 vale para a regra de conglomerado prudencial, não necessariamente para o Cosif como um todo — não reconciliei essa diferença de escopo.

### CCS · Cadastro de Clientes do Sistema Financeiro Nacional · EVIDÊNCIA
- A Resolução BCB 179/2022 (texto integral lido) define que o CCS guarda, por cliente e por representante legal/convencional: CPF ou CNPJ do cliente; CNPJ da instituição com quem mantém relacionamento; e datas de início e (se houver) término do relacionamento.
- Quando autoridade legítima pede detalhamento, a instituição deve informar, por conta: o grupo de natureza do ativo (Grupo 1 depósito à vista; 2 poupança; 3 investimento; 4 outros bens/direitos/valores; 5 depósito em moeda nacional de não residente; 6 conta de pagamento pré-paga), número da conta e agência (quando houver), data de abertura/encerramento, tipo de vínculo (titular, representante legal ou convencional) e nome completo/razão social. A remessa ao BCB é diária (até o 2º dia útil após a data-base) e a base deve ser mantida por 10 anos após o fim do relacionamento.
- Trecho decisivo: "armazenar... número de inscrição no Cadastro de Pessoas Físicas (CPF)... datas de início e... de término" [8]
- Não sustenta: o texto da resolução não lista nenhum campo de saldo, valor ou movimentação entre as informações armazenadas — isso é uma leitura por ausência (o que o artigo não pede), não uma frase da norma dizendo "não contém saldo"; não testei o Dicionário de Domínios do Catálogo de Serviços do SFN citado no art. 6º, que teria o leiaute técnico exato.

### PLD/FT e KYC · Circular 3.978/2020 · EVIDÊNCIA
- Identificação mínima do cliente: nome completo + CPF (pessoa natural) ou razão/denominação social + CNPJ (pessoa jurídica); para estrangeiro sem CPF, país emissor, número e tipo do documento de viagem; para pessoa jurídica no exterior sem CNPJ, nome da empresa, endereço da sede e número de registro no país de origem.
- Qualificação do cliente: identificar local de residência (PF) ou sede/filial (PJ) e avaliar capacidade financeira (renda para PF, faturamento para PJ) — campo incluído pela Resolução BCB 119/2021, que também retirou a exigência de coletar endereço já no art. 16.
- Classificação em categorias de risco (definidas pela avaliação interna de risco da instituição, revista a cada 2 anos); verificação de Pessoa Exposta Politicamente (PEP: mandatos eletivos federais, cargos de Ministro/DAS-6 ou equivalente, membros de tribunais superiores, entre outros) e de familiar (parentesco até 2º grau, cônjuge/companheiro) ou colaborador estreito de PEP; identificação de beneficiário final por cadeia societária, com valor de referência de participação que não pode passar de 25%.
- Trecho decisivo: "o nome completo e o número de registro no Cadastro de Pessoas Físicas (CPF)" [2]
- Não sustenta: vale para instituições autorizadas a funcionar pelo BCB (não é regra geral de mercado); define obrigação regulatória, não o leiaute técnico de um banco de dados; não confirmei se há redações posteriores a 2021 além da Resolução BCB 119/2021, que já está incorporada ao texto lido.

### Ouvidoria · Resolução CMN 4.860/2020 · EVIDÊNCIA
- Toda demanda deve ter número de protocolo, atendimento gravado (telefone) ou documentado (escrito/eletrônico); prazo de resposta de até 10 dias úteis, prorrogável uma única vez por igual período, limitado a 10% do total de demandas do mês.
- A instituição deve manter sistema de informações com histórico de atendimento, informações usadas na análise e providências adotadas, guardado por no mínimo 5 anos; deve elaborar relatório semestral (bases 30/6 e 31/12) enviado à auditoria interna, comitê de auditoria e conselho de administração; deve aplicar avaliação de qualidade do atendimento em nota de 1 a 5, disponível ao cliente em até 1 dia útil após a resposta.
- Trecho decisivo: "o prazo de resposta para as demandas não pode ultrapassar dez dias úteis" [7]
- Não sustenta: dispensa constituição de ouvidoria própria para bancos comerciais sob controle de bolsa que só fazem liquidação/custódia; a Resolução CMN 5.182/2024, que alterou essa norma em outubro/2024, não foi lida na íntegra — só resumida por fonte secundária [9], então não sei exatamente o que mudou no texto de 2020.

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| SCR / doc. 3040 | Crédito >R$200 aberto por cliente PF/PJ, modalidade, UF, CNAE/ocupação, porte, origem de recursos, indexador, faixas de vencimento/atraso | Evidência | Leiaute campo a campo e submodalidades completas (Anexo 3) | Metodologia sem data explícita, refere regra vigente a partir de junho/2016 | [1] |
| Risco de crédito AA-H | 9 níveis, faixa de atraso e provisão mínima por nível (A 0,5% a H 100%) | Evidência | Vigência atual pós-2025 (substituído por perda esperada) | 21/12/1999 (regra); status até 31/12/2024 | [3][4] |
| Perda esperada (estágios) | Substitui AA-H desde 1º/1/2025, 3 estágios, alinhado a IFRS 9 | Evidência (via fonte secundária) | Texto integral da norma e leiaute de campo | Vigência 1º/1/2025 | [10][11] |
| Cosif · plano de contas | Código com 5 níveis + DV; grupos 1,2,3,4,6 identificados | Evidência | Lista completa dos 8 grupos e periodicidade de todos os documentos | Acesso set/2026 (norma-base de 23/10/2020) | [5][6] |
| CCS | Guarda CPF/CNPJ do cliente, CNPJ da IF, datas de início/fim; detalhamento por 6 grupos de conta, tipo de vínculo | Evidência | Confirmação literal de "não contém saldo"; leiaute técnico do Dicionário de Domínios | 19/01/2022 | [8] |
| KYC / PLD-FT | Identificação (nome+CPF ou razão+CNPJ), qualificação (renda/faturamento), classificação de risco, PEP, beneficiário final (≤25%) | Evidência | Regra geral de KYC de mercado (só vale p/ instituições autorizadas pelo BCB) | 23/01/2020, com redação de 27/07/2021 | [2] |
| Ouvidoria | Protocolo, resposta em até 10 dias úteis, histórico guardado 5 anos, relatório semestral, nota 1-5 | Evidência | Texto da alteração de 2024 (Resolução 5.182) | 23/10/2020 (base); alterada 31/10/2024 | [7][9] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Campos e domínios do SCR (modalidade, risco, faixas de atraso) | bloco 3 (solução e jornada) · bloco 4 (o que foi construído) · demo — desenho do banco de dados simulado de crédito |
| Escala AA-H e a transição para perda esperada (2025) | bloco 5 (métrica, risco e escala) · P4 (principal risco) — mostra que um campo "realista" pode já estar desatualizado se copiado sem checar a norma vigente |
| Estrutura de código de conta do Cosif | bloco 4 (o que foi construído) · demo — se o protótipo simular lançamentos contábeis |
| Campos do CCS (vínculo cliente-instituição) | bloco 3 · demo — se a jornada tocar em cadastro/relacionamento de cliente |
| Campos de KYC/PLD-FT (identificação, PEP, beneficiário final) | bloco 2 (evidências) · P2 (como funciona e onde entra a IA) — se a IA tocar em dado cadastral sensível, mesmo que fictício |
| Regras de ouvidoria (protocolo, prazo, nota) | bloco 3 · P2 · demo — se a tarefa escolhida tocar em reclamação/feedback de cliente |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Leiaute campo a campo do documento 3040 (todos os anexos, inclusive Anexo 3 de submodalidades) | Tentei abrir o PDF de instruções de preenchimento e o Excel de leiaute; ambos vieram como binário não legível pela ferramenta de busca web | Alta |
| Se o doc 3040 hoje pede o rótulo AA-H ou o estágio de perda esperada (pós Resolução CMN 4.966/2021, vigente desde 1/1/2025) | Busquei o texto da 4.966/2021 diretamente; só encontrei resumos de consultoria e imprensa, não o normativo primário | Alta |
| Lista completa dos 8 grupos contábeis do Cosif (faltam grupos 5, 7 e 8) e periodicidade de todos os documentos exigidos (ex.: balancete mensal) | Li a página de "Elenco de Contas" e o capítulo sobre conglomerado prudencial; nenhuma trouxe a lista completa | Média |
| Dicionário de Domínios do Catálogo de Serviços do Sistema Financeiro Nacional (leiaute técnico exato do CCS, citado no art. 6º da Resolução BCB 179/2022) | Não encontrei link público direto durante a busca | Média |
| Texto integral da Resolução CMN 5.182/2024 (o que exatamente mudou na ouvidoria em outubro/2024) | Só obtive resumos via LegisWeb e imprensa local; não confirmei o normativo primário | Média |
| Confirmação de que a coleta de dados aqui descrita não esbarra em informação interna do Itaú | Usei só normas públicas do BCB/CMN e manuais oficiais; nenhuma fonte veio de material que parecesse vazamento ou documento interno | Baixa |

## Fontes
1. [PRIMÁRIA] SCR.data – Metodologia — Banco Central do Brasil — https://www.bcb.gov.br/content/estabilidadefinanceira/scr/scr.data/scr_data_metodologia.pdf — acesso set/2026
2. [PRIMÁRIA] Circular nº 3.978, de 23 de janeiro de 2020 (com redação da Resolução BCB nº 119/2021) — Banco Central do Brasil — https://normativos.bcb.gov.br/Lists/Normativos/Attachments/50905/Circ_3978_v3_P.pdf — 23/01/2020
3. [PRIMÁRIA] Resolução CMN nº 2.682, de 21 de dezembro de 1999 — Banco Central do Brasil — https://www.bcb.gov.br/pre/normativos/res/1999/pdf/res_2682_v2_l.pdf — 21/12/1999
4. [PRIMÁRIA] "1. Classificação das Operações de Crédito" (manual Cosif, capítulo 1) — Banco Central do Brasil — https://www3.bcb.gov.br/aplica/cosif/manual/09021771869a1c3e.htm — acesso set/2026
5. [PRIMÁRIA] "1. Do Elenco de Contas do Cosif" (manual Cosif, capítulo 1) — Banco Central do Brasil — https://www3.bcb.gov.br/aplica/cosif/manual/09021771869a0357.htm — acesso set/2026
6. [PRIMÁRIA] Manual Cosif, capítulo 16.3 (conglomerado prudencial) — Banco Central do Brasil — https://www3.bcb.gov.br/aplica/cosif/manual/0902177186a35624.htm — acesso set/2026
7. [PRIMÁRIA] Resolução CMN nº 4.860, de 23 de outubro de 2020 — Banco Central do Brasil — https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolução%20CMN&numero=4860 — 23/10/2020
8. [PRIMÁRIA] Resolução BCB nº 179, de 19 de janeiro de 2022 — Banco Central do Brasil — https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolução%20BCB&numero=179 — 19/01/2022
9. [RELATÓRIO] Resolução CMN Nº 5.182 DE 31/10/2024 — LegisWeb — https://www.legisweb.com.br/legislacao/?id=467879 — 31/10/2024
10. [RELATÓRIO] "Resolução 4966: entenda as mudanças e o que diz o Bacen" — RTM — https://rtm.net.br/resolucao-4966/ — acesso set/2026, refere vigência 1º/1/2025
11. [IMPRENSA] "CMN inaugura era de gestão de crédito e rigor de garantias" — ConJur — https://www.conjur.com.br/2026-jan-02/um-ano-de-resolucao-cmn-4-966-a-nova-era-da-gestao-de-credito-e-o-rigor-das-garantias/ — 02/01/2026
