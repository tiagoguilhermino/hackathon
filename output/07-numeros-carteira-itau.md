# Números públicos da base de clientes e produtos do Itaú Unibanco

> Pergunta: Que números públicos descrevem a base de clientes e produtos do Itaú (quantidade de clientes, segmentos como Personnalité, Uniclass, Private e empresas, uso de canais digitais, Pix, cartões, carteira de crédito por produto, inadimplência) para calibrar distribuições realistas numa simulação?

## Resumo executivo
Recorte do time ainda não definido.
- Carteira de crédito total do Itaú fechou o 2T26 em R$ 1.522,4 bi, com quebra por PF, PME e grandes empresas e por produto (cartão, imobiliário, consignado, veículos) [1] (evidência).
- Inadimplência acima de 90 dias ficou em 1,9% no 2T26, estável há seis trimestres; NPL 15-90 dias foi a 1,8% [1] (evidência).
- O Itaú define Retail (renda até R$ 7 mil/mês), Uniclass (R$ 7 mil a R$ 15 mil) e Personnalité (renda alta/investimentos altos) no seu próprio 20-F; fontes secundárias em português usam faixas levemente diferentes [4][evidência divergente de secundárias] (evidência, com ressalva).
- O número total de clientes do Itaú no Brasil aparece com dois valores que não bateram nas buscas: "70 milhões" (matéria de recapitulação de 2025, sem citar a fonte primária) e "100,2-100,9 milhões", este citando dados do Banco Central e crescendo ao longo de 2025-2026 [5][6] (evidência, mas conflitante — ver Achados).
- Estrutura operacional (2T26): 90.429 colaboradores, 2.210 agências, 11.822 caixas eletrônicos, todos em queda frente ao 1T26 [1] (evidência).
- Interação digital chegou a 97% para pessoa física e 100% para o segmento corporate no 1T26, segundo apresentação institucional [2] (evidência).
- Migração de clientes para o "Super App" (projeto Um Só Itaú/OneItaú): 15 milhões de clientes até o fim de 2025, autodeclarado pelo banco [8] (evidência, fonte autodeclarada).
- Cartão de crédito: 24% de participação de mercado em volume de compras no 4T25, segundo material institucional do Itaú que cita a Abecs [9] (evidência, fonte autodeclarada).

## Achados

### Carteira de crédito total e por produto (2T26) · EVIDÊNCIA
- Constatação: carteira de crédito consolidada em R$ 1.522,4 bilhões no 2T26 (+2,7% vs. 1T26): Brasil R$ 1.269,4 bi, América Latina R$ 253,0 bi. Por segmento: Pessoas Físicas R$ 487,1 bi (cartão de crédito R$ 150,4 bi, crédito imobiliário R$ 152,2 bi, consignado R$ 81,3 bi, veículos R$ 35,1 bi), PME/pequenas empresas R$ 307,4 bi, grandes empresas R$ 474,9 bi.
- Trecho decisivo: "Total consolidado R$ 1.522,4 bilhões (2T26, +2,7% vs 1T26)" [1]
- Não sustenta: é a carteira consolidada (Brasil + América Latina) do conglomerado Itaú Unibanco, dado gerencial de balanço trimestral (2T26/junho de 2026), não é o número de clientes por produto nem distribuição individual de ticket — para simular distribuição de valores por cliente seria preciso outro nível de detalhe que o release não abre.

### Inadimplência (2T26) · EVIDÊNCIA
- Constatação: NPL acima de 90 dias em 1,9% pelo sexto trimestre consecutivo; NPL entre 15 e 90 dias subiu 0,1 p.p. no trimestre, fechando em 1,8%. Guidance do próprio banco para 2026 prevê carteira de crédito total crescendo entre 5,5% e 9,5% no ano.
- Trecho decisivo: "inadimplência acima de 90 dias permaneceu em 1,9%" [1]
- Não sustenta: é taxa agregada do conglomerado, sem quebra por segmento de renda (Retail/Uniclass/Personnalité) ou por produto — não dá para calibrar inadimplência específica de cartão vs. imobiliário vs. PME com este número isolado.

### Estrutura de canais físicos e digitais (1T26-2T26) · EVIDÊNCIA
- Constatação: no 1T26, o Itaú tinha 91,5 mil colaboradores, 2,4 mil agências no Brasil e América Latina e 12,9 mil caixas eletrônicos, com interações digitais em 97% para pessoa física e 100% para o segmento corporate. No 2T26, colaboradores caíram para 90.429 (-1,2%), agências para 2.210 (-6,6%) e caixas eletrônicos para 11.822 (-8,1%) frente ao trimestre anterior.
- Trecho decisivo: "Interações Digitais: 97% para pessoas físicas; 100% para corporativo em 1Q26" [2]
- Não sustenta: "interação digital" é uma métrica de canal (proporção de contatos/transações feitos por canal digital), não confirma percentual de clientes que usam exclusivamente o app nem separa por segmento de renda; a queda de agências e colaboradores é tendência do conglomerado, não abre por regional ou por segmento.

### Segmentação de clientes por renda · EVIDÊNCIA, com divergência entre fontes
- Constatação: o Formulário 20-F (ano fiscal 2025, arquivado na SEC) descreve três segmentos de pessoa física dentro do Retail Business: Retail (renda mensal até R$ 7 mil), Uniclass (renda entre R$ 7 mil e R$ 15 mil) e Personnalité (clientes de alta renda). O Retail Business (PF + PME) representou 61% da carteira de crédito em 2025 (60% em 2024, 62% em 2023). Fontes secundárias em português (sites de cartões/milhas, sem indicar metodologia) descrevem Uniclass como R$ 5 mil a R$ 15 mil e Personnalité a partir de R$ 15 mil ou R$ 250 mil em investimentos.
- Trecho decisivo: "Retail... income of up to R$7,000... Uniclass... between R$7,000 and R$15,000" [4]
- Não sustenta: o 20-F não divulga quantos clientes existem em cada uma das três faixas nem dá o corte de renda do Private Bank; as fontes secundárias com faixas diferentes não citam de onde tiraram o número, então ficou um conflito não resolvido entre um documento oficial e sites de terceiros — use o 20-F como referência e trate os demais como não confirmados.

### Base total de clientes: dois números que não conferem · EVIDÊNCIA (achado conflitante)
- Constatação: uma matéria de recapitulação do ano de 2025 cita "70 milhões" de clientes do Itaú, sem apontar a fonte primária desse número nem se é Brasil, América Latina ou global. Outra matéria, publicada já em 2025/2026, afirma que "segundo dados do BC (Banco Central), o Itaú já ganhou quase 1,75 milhão de novos clientes em 2025", chegando a 100,2 milhões no 3T25 e depois a 100,9 milhões em março de 2026 (1T26), tornando o Itaú o quarto banco em número de clientes no Brasil, atrás de Caixa, Bradesco e Nubank.
- Trecho decisivo: "totalizando 100,9 milhões" ao final de março de 2026 [6]
- Não sustenta: nenhuma das duas fontes é o release oficial do Itaú nem a página do Banco Central citada diretamente (não localizei o relatório do BC com esse número específico); os dois valores (70 milhões vs. ~100 milhões) provavelmente medem coisas diferentes — por exemplo, "clientes com relacionamento ativo" vs. "total de CPFs cadastrados em qualquer produto" — mas nenhuma matéria explica a diferença. Não dá para escolher um dos dois sem a fonte primária.

### Migração para o Super App / "Um Só Itaú" · EVIDÊNCIA (autodeclarada)
- Constatação: o Itaú unificou sete aplicativos num único app; a migração passou de 5,3 milhões de clientes em 2024 para 6 milhões em março de 2025, 10 milhões em julho de 2025 e mais de 15 milhões até o fim de 2025, batendo a meta que o próprio banco havia anunciado em fevereiro de 2025. Uma nota cita conversão de 99,3% e NPS de 80 para os mais de 10 milhões já migrados até aquele marco.
- Trecho decisivo: "mais de 15 milhões de clientes migraram... até o final de 2025" [8]
- Não sustenta: é número de clientes migrados para a plataforma, não de clientes ativos nela depois da migração; o NPS de 80 e a conversão de 99,3% vêm de comunicação do próprio banco sobre o próprio produto, sem metodologia de pesquisa publicada — trate como dado autodeclarado, não auditado externamente.

### Cartões: participação de mercado e volume · EVIDÊNCIA (autodeclarada, citando Abecs)
- Constatação: material institucional do Itaú (arquivado como 6-K na SEC) aponta 24% de participação de mercado em volume de compras com cartão de crédito no 4T25, posição de liderança no segmento no Brasil. Receita de "cartões emissor" foi de R$ 3,3 bi no 2T26 e R$ 3,3 bi no 1T26 (R$ 6,5 bi no 1S26, estável frente ao 1S25). No 2T26, o volume de cartão de crédito somou R$ 245,7 bi (+4,1% vs. 1T26) e adquirência R$ 298,7 bi (+5,4% vs. 1T26).
- Trecho decisivo: "market share em termos de volume de compras de 24% no quarto trimestre de 2025" [9]
- Não sustenta: não encontrei o número absoluto e atual de cartões emitidos/ativos do Itaú (o dado mais recente localizado, de 32,5 milhões para 38,2 milhões de contas de cartão, é do 3T20-3T21, mais de 4 anos desatualizado); o market share de 24% é autodeclarado pelo banco citando a Abecs, não o relatório da Abecs em si.

### Pix no Itaú · EVIDÊNCIA parcial (só variação percentual, sem volume absoluto)
- Constatação: segundo reportagem que cita dados do Itaú, o volume financeiro do Pix Automático no banco cresceu 281% no primeiro semestre de 2026 frente ao semestre anterior, o número de pagadores que ativaram a recorrência automática cresceu 185%, e 90% das cobranças recorrentes via Pix Automático foram liquidadas (22 p.p. acima do antigo débito automático). O Banco Central, por sua vez, registrou no Pix geral do país mais de 7 bilhões de transações e R$ 3 trilhões movimentados só em maio de 2026, com base de chaves cadastradas superando 170 milhões de pessoas físicas.
- Trecho decisivo: "volume financeiro... saltou 281% na primeira metade de 2026" [7]
- Não sustenta: são variações percentuais do Itaú, não volumes absolutos (não dá para saber quantas transações ou quantos reais em termos absolutos o Itaú processa em Pix); os dados nacionais do BCB não abrem por instituição participante nos recursos públicos consultados (ver Lacunas), então não foi possível estimar a fatia do Itaú no Pix nacional.

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| Carteira de crédito total | R$ 1.522,4 bi consolidado (Brasil R$ 1.269,4 bi + LatAm R$ 253,0 bi) | Evidência | Distribuição de ticket por cliente | 2T26 (jun/2026) | [1] |
| Carteira PF por produto | Cartão R$ 150,4 bi · imobiliário R$ 152,2 bi · consignado R$ 81,3 bi · veículos R$ 35,1 bi | Evidência | Número de clientes por produto | 2T26 (jun/2026) | [1] |
| Carteira PME e grandes empresas | PME/pequenas R$ 307,4 bi · grandes empresas R$ 474,9 bi | Evidência | Segmentação por porte dentro de "grandes empresas" | 2T26 (jun/2026) | [1] |
| Inadimplência 90 dias | 1,9%, estável há 6 trimestres | Evidência | Quebra por segmento/produto | 2T26 (jun/2026) | [1] |
| Inadimplência 15-90 dias | 1,8% (+0,1 p.p. no trimestre) | Evidência | Quebra por segmento/produto | 2T26 (jun/2026) | [1] |
| Colaboradores | 90.429 (-1,2% vs. 1T26); 91,5 mil no 1T26 | Evidência | Distribuição por área/squad | 1T26-2T26 (2026) | [1][2] |
| Agências | 2.210 (-6,6% vs. 1T26); 2,4 mil no 1T26 | Evidência | Distribuição geográfica | 1T26-2T26 (2026) | [1][2] |
| Caixas eletrônicos | 11.822 (-8,1% vs. 1T26); 12,9 mil no 1T26 | Evidência | — | 1T26-2T26 (2026) | [1][2] |
| Ativos totais | R$ 3.200 bi | Evidência | Detalhe por linha de negócio | 1T26 (mar/2026) | [2] |
| Interação digital | 97% (PF) e 100% (corporate) | Evidência | % de clientes exclusivamente digitais | 1T26 (mar/2026) | [2] |
| Segmentos de renda (PF) | Retail até R$ 7 mil/mês · Uniclass R$ 7-15 mil/mês · Personnalité alta renda | Evidência (oficial) | Nº de clientes por faixa; corte exato do Private | FY2025 (20-F) | [4] |
| Retail Business no total da carteira | 61% em 2025 (60% em 2024, 62% em 2023) | Evidência | Quebra Retail PF vs. PME dentro desse 61% | FY2025 (20-F) | [4] |
| Base total de clientes (versão A) | "70 milhões" de clientes | Evidência (fonte não explicitada) | Escopo (Brasil/LatAm), metodologia | 2025 (matéria de recapitulação) | [5] |
| Base total de clientes (versão B) | 100,2 milhões (3T25) → 100,9 milhões (mar/2026), citando dados do BC | Evidência (fonte secundária citando BC) | Definição de "cliente" usada pelo BC | 3T25-1T26 (2025-2026) | [6] |
| Clientes migrados ao Super App | 15 milhões até fim de 2025 (meta batida) | Evidência (autodeclarada) | Uso ativo pós-migração | Dez/2025 | [8] |
| Market share cartão de crédito | 24% do volume de compras, 4T25 | Evidência (autodeclarada, cita Abecs) | Nº absoluto de cartões ativos do Itaú | 4T25 | [9] |
| Volume/receita de cartões | Receita emissor R$ 3,3 bi (2T26); volume cartão R$ 245,7 bi (2T26); adquirência R$ 298,7 bi (2T26) | Evidência | Ticket médio por cliente/cartão | 2T26 (jun/2026) | [1] |
| Pix Automático no Itaú | Volume +281% no 1S26 vs. 2S25; pagadores ativados +185%; liquidação 90% | Evidência (variação %, sem volume absoluto) | Volume absoluto de Pix do Itaú; fatia no Pix nacional | 1S26 (jan-jun/2026) | [7] |
| Pix Brasil (agregado, BCB) | +7 bi transações e R$ 3 tri movimentados só em maio/2026; +170 milhões de chaves PF | Evidência | Fatia por instituição/banco | Maio/2026 | fonte secundária, ver Lacunas |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Carteira de crédito total e por produto (2T26) | demo (calibrar volumes/valores simulados por produto) · slide bloco 2 |
| Inadimplência 90 dias e 15-90 dias | slide bloco 2 (evidências) · ficha P4 (risco) |
| Estrutura de canais físicos e digitais | slide bloco 1 (contexto do case) · ficha P1 |
| Segmentação de clientes por renda (Retail/Uniclass/Personnalité) | demo (personas simuladas) · ficha P1 |
| Base total de clientes (divergência 70M vs. ~100M) | slide bloco 2 (mostrar escala, com ressalva de fonte) · ficha P1 |
| Migração para o Super App | slide bloco 5 (escala) · slide bloco 6 (próximos passos) |
| Market share e volume de cartões | demo (calibrar volumes de transações simuladas) |
| Pix Automático no Itaú | slide bloco 6 (próximos passos, tendência de produto) |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Número exato de clientes do Itaú (reconciliar 70 milhões vs. 100,9 milhões) | Busquei o release oficial e o relatório do BC citado pelas matérias; não achei a página/relatório primário do Banco Central com esse número nem release do Itaú que afirme "70 milhões" ou "100,9 milhões" diretamente | Alta |
| Número de clientes por segmento (quantos em Retail, Uniclass, Personnalité, Private, PJ) | Consultei o 20-F (FY2025) e a apresentação institucional; nenhum dos dois abre a contagem de clientes por faixa, só define os critérios de renda | Alta |
| Número absoluto e atual de cartões de crédito emitidos/ativos do Itaú | Busquei dados recentes (2025-2026); só achei números de 2020-2021 (32,5 a 38,2 milhões de contas), desatualizados | Média |
| Fatia do Itaú no volume/quantidade total de transações Pix do Brasil | Consultei o portal de dados abertos do BCB (dadosabertos.bcb.gov.br/dataset/pix); os recursos localizados nas buscas não mostraram quebra por instituição participante, só agregado nacional | Média |
| Corte de renda/investimento oficial para entrar no Private Bank | Busquei no 20-F e em material institucional; não encontrei o critério declarado pelo próprio banco, só menções de terceiros sem fonte | Média |
| Total de ativos e detalhamento de canais digitais no 2T26 (mais recente) | O MD&A do 2T26 (SEC 6-K) não trouxe esses dois números; só constavam na apresentação institucional do 1T26 | Baixa |
| IF.data do Banco Central (nº de clientes/agências por conglomerado, fonte regulatória direta) | Tentei localizar a página específica do Itaú Unibanco no IF.data; as buscas não retornaram o relatório/página com os números, só referências genéricas ao sistema | Média |

## Fontes
1. [PRIMÁRIA] Itaú Unibanco Holding S.A. — Management Discussion and Analysis, Form 6-K (2T26) — U.S. SEC EDGAR — https://www.sec.gov/Archives/edgar/data/0001132597/000113259726000223/managementdiscussionanal.htm — divulgado em 2026 (dados de junho/2026)
2. [PRIMÁRIA] Itaú Unibanco Holding S.A. — Institutional Presentation, Form 6-K (1T26) — U.S. SEC EDGAR — https://www.sec.gov/Archives/edgar/data/0001132597/000113259726000155/institutionalpresentatio.htm — divulgado em 2026 (dados de março/2026)
3. [PRIMÁRIA] Itaú Unibanco Holding S.A. — Press Release on the Results, Form 6-K (1T26) — U.S. SEC EDGAR — https://www.sec.gov/Archives/edgar/data/0001132597/000113259726000153/pressreleaseontheresults.htm — divulgado em 2026 (dados de março/2026)
4. [PRIMÁRIA] Itau Unibanco Holding S.A. — Form 20-F (ano fiscal 2025) — U.S. SEC EDGAR — https://www.sec.gov/Archives/edgar/data/0001132597/000113259726000132/itub-20251231.htm — arquivado em 2026 (dados de 2025/2024/2023)
5. [IMPRENSA] "Itaú Unibanco renova recorde e lucra R$ 46,8 bilhões em 2025" — FEEB-PR (sindicato dos bancários) — https://www.feebpr.org.br/noticia/s0eY-itau-unibanco-renova-recorde-e-lucra-r-468-bilhoes-em-2025 — 2026 (recapitulação de 2025)
6. [IMPRENSA] "Itaú chega aos 100 milhões de clientes no Brasil: Bom sinal para o 3º trimestre?" — FEEB-PR, citando dados do Banco Central — https://www.feebpr.org.br/noticia/Qngq-itau-chega-aos-100-milhoes-de-clientes-no-brasil-bom-sinal-para-o-3o-trimestre — 2025
7. [IMPRENSA] "Itaú vê volume do Pix Automático saltar 281% em 2026" — Let's Money, citando dados do Itaú — https://www.letsmoney.com.br/noticias/pix-automatico-itau-cresce-281/ — 2026 (dados do 1S26)
8. [IMPRENSA] "Itaú Unibanco Unifica Sete Apps em Super App Único" — ConexaoTC, citando comunicação do Itaú — https://www.conexaotc.com.br/post/2842 — 2025/2026 (marco de dez/2025)
9. [IMPRENSA] "Inside Itaú Unibanco (NYSE: ITUB) 2025 segment revenues and market share" — StockTitan, resumindo material institucional/6-K do Itaú — https://www.stocktitan.net/sec-filings/ITUB/6-k-itau-unibanco-holding-s-a-current-report-foreign-issuer-12564ae61b09.html — 2026 (dados do 4T25)
