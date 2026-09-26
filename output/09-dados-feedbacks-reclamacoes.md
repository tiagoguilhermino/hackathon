# Dados públicos de reclamações e feedbacks sobre bancos

> Pergunta: Que dados públicos de reclamações e feedbacks de clientes sobre o Itaú existem (Ranking de Reclamações do BCB, consumidor.gov.br, Reclame Aqui) e com que estrutura de campos e categorias eles são publicados?

## Resumo executivo
Recorte do time ainda não definido.
- O BCB publica trimestralmente (bancos) um índice de reclamações por milhão de clientes, com campos como índice, quantidade de reclamações reguladas procedentes/outras/não reguladas e quantidade de clientes (CCS/SCR/FGC) [1][3] (evidência).
- O índice usa amostragem estatística (Estimativa Estatística de Procedentes) e conta só reclamações consideradas procedentes após análise do BC, não o total recebido [1] (evidência).
- O BC também publica "Motivo da reclamação" com ranking de assuntos mais frequentes, hoje liderado por irregularidades em cartão de crédito, crédito consignado e atendimento de SAC [4] (evidência).
- No 1º tri/2026 o Itaú apareceu em 7º lugar no ranking Top 15, índice 34,12, com 3.442 reclamações procedentes sobre uma base de 100.863.694 clientes [5] (evidência).
- O consumidor.gov.br tem dicionário de dados oficial com campos como Área, Assunto, Grupo Problema, Problema, Nome Fantasia, UF, Como Comprou/Contratou [6] (evidência).
- O perfil público de cada empresa no consumidor.gov.br expõe Índice de Solução, Satisfação (1 a 5), % Reclamações Respondidas e Prazo Médio de Resposta, filtráveis por 30 dias/6 meses/ano/todo o período [8][9] (evidência).
- Em 2026, serviços financeiros concentraram 61,8% das reclamações do 1º semestre no consumidor.gov.br; o Itaú foi a 12ª empresa mais reclamada em junho/2026, com índice de resolução de 24,2% [10] (evidência).
- O Reclame Aqui calcula o "Índice RA" combinando índice de resposta, nota do consumidor, índice de solução e recompra; é indicador de plataforma privada, sem auditoria externa documentada nas fontes consultadas [11] (evidência).

## Achados

### Metodologia do índice de reclamações do Banco Central · EVIDÊNCIA
- O índice mede a Estimativa Estatística de Procedentes (EEP) multiplicada por 1.000.000 e dividida pelo número de clientes da instituição; a EEP extrapola, por amostragem, o total de reclamações procedentes a partir de uma amostra analisada no trimestre.
- Trecho decisivo: "representa a estimativa de reclamações procedentes por milhão de clientes" [1]
- Não sustenta: descreve só o índice de bancos/financeiras/instituições de pagamento (Top 15 e "Demais"); consórcios têm cálculo à parte, sem amostragem, pois todas as reclamações são analisadas. Metodologia vigente desde abril/2024 (nota técnica de 30/07/2024); períodos anteriores usavam amostra aleatória sem extrapolação estatística.

### Estrutura de campos do dataset aberto do BCB (CSV) · EVIDÊNCIA
- A documentação oficial do conjunto de dados descreve os campos exatos do CSV "Bancos e Financeiras": Ano; Mês/Bimestre/Trimestre/Semestre; Categoria (porte por nº de clientes); Tipo (Conglomerado/Banco-Financeira); CNPJ IF; Instituição financeira; Índice; Quantidade de reclamações reguladas procedentes; Quantidade de reclamações reguladas – outras; Quantidade de reclamações não reguladas; Quantidade total de reclamações; Quantidade total de clientes (CCS e SCR); Quantidade de clientes CCS; Quantidade de clientes SCR; Quantidade de clientes FGC.
- Trecho decisivo: "Instituição financeira ... Índice ... Quantidade de reclamações reguladas procedentes" [3]
- Não sustenta: é o schema do recurso "Bancos e Financeiras"; o recurso "Consórcios" tem campos parecidos mas sem CCS/SCR/FGC (usa "Quantidade de clientes – Consorciados"). Documento é v1.0, sem data de revisão visível no PDF.

### Categorias ("motivo da reclamação") e posição do Itaú no ranking do BC · EVIDÊNCIA
- A página pública do ranking (www3.bcb.gov.br/ranking) tem uma seção "Reclamações mais frequentes por assunto" com campos Posição e Motivo da reclamação; no período consultado (set/2026) as três primeiras eram irregularidades em cartão de crédito, operações de crédito consignado e insatisfação com atendimento de SAC/central de relacionamento.
- Trecho decisivo: "insatisfação com o serviço prestado pelo SAC ou central de relacionamento" [4]
- Não sustenta: a lista completa de motivos (além do Top 3 exibido na home) não foi verificada; é preciso abrir "lista completa" no site para o rol inteiro. Dado do Itaú no 1º tri/2026 (índice 34,12; 7º lugar; 3.442 procedentes; 100.863.694 clientes) vem de reportagem que cita o BC, não de leitura direta do CSV daquele trimestre [5].

### Dicionário de dados do consumidor.gov.br (campos do CSV "Base Completa") · EVIDÊNCIA
- O Dicionário de Dados oficial (Senacon/Ministério da Justiça, versão 3.0) define campos como Nome Fantasia (empresa reclamada), Área (ex.: "Serviços Financeiros"), Assunto (ex.: "Atendimento Bancário"), Grupo Problema (ex.: "Atendimento/SAC", "Contrato/Oferta"), Problema (ex.: "Portabilidade não efetivada"), Como Comprou/Contratou, UF, além de Gestor, Canal de Origem, Região e Cidade.
- Trecho decisivo: "Área ... representa a área a que pertence o assunto da reclamação" [6]
- Não sustenta: não consegui abrir o PDF diretamente (falha de DNS em dados.mj.gov.br pelo WebFetch); os nomes de campo vieram de indexação/snippet do próprio documento via busca, não de leitura integral — lista pode estar incompleta (faltam, por exemplo, campos de data e status confirmados por leitura direta).

### Indicadores públicos por empresa e por segmento no consumidor.gov.br · EVIDÊNCIA
- O perfil público de cada empresa (ex.: Banco Itaú Unibanco) mostra quatro indicadores — Índice de Solução (0-100%), Satisfação com o Atendimento (nota 1 a 5), Reclamações Respondidas (%) e Prazo Médio de Respostas (dias) — filtráveis por 30 dias, 6 meses, ano corrente e "Todas"; a API REST usa campos como codigoArea, codigoAssunto, codigoProblema, codigoSituacaoReclamacao, numAvaliacao (1-3), notaConsumidor (1-5) e codigoGrupoEconomico.
- Trecho decisivo: "Consideram-se apenas as reclamações finalizadas" (prazo de resposta de até 10 dias) [8]
- Não sustenta: no momento da consulta o perfil do Itaú aparecia com "S/R: Sem Registros" nos campos numéricos, então não confirma valores atuais de nota/índice do banco; confirma só a estrutura dos campos. Segmento "Bancos, Financeiras e Administradoras de Cartão" é filtro oficial da plataforma, mas a lista completa de assuntos/problemas desse segmento não foi obtida linha a linha.

### Volume de reclamações do setor financeiro no consumidor.gov.br em 2026 · EVIDÊNCIA
- Reportagem baseada em dados da plataforma mostra que serviços financeiros somaram 61,8% de todas as reclamações do 1º semestre de 2026 (1.243.770 de 2.012.697); cartão de crédito (378.529) e empréstimo pessoal (250.300) foram os assuntos mais comuns; em junho/2026 o Itaú foi a 12ª empresa mais reclamada, com 12.206 casos, 24,2% de resolução e nota média 2,05/5.
- Trecho decisivo: "responder a uma reclamação não significa necessariamente resolver o problema" [10]
- Não sustenta: é matéria jornalística que processa dados abertos, não o CSV bruto lido diretamente; números são nacionais/por segmento, não exclusivos do Itaú (exceto onde indicado); não há detalhamento de metodologia de coleta da matéria além do que a plataforma disponibiliza.

### Metodologia do "Índice RA" do Reclame Aqui · EVIDÊNCIA
- O manual oficial da ferramenta descreve o Índice RA como combinação de quatro indicadores — Índice de Reclamações Respondidas, Nota do Consumidor (0-10), Índice de Solução e Índice de "voltaria a fazer negócio" — com fórmula de média ponderada (pesos 2, 3, 3, 2) e atualização mensal (rolling 6/12 meses) e diária para status de reclamações.
- Trecho decisivo: "((IR × 2) + (MA × 10 × 3) + (IS × 3) + (IN × 2)) / 100" [11]
- Não sustenta: é documentação da própria ferramenta sobre como ela calcula seu indicador (uso permitido como PRIMÁRIA para "o que a ferramenta faz"); não valida a exatidão do índice nem foi auditada por terceiro nas fontes consultadas. Reclame Aqui é plataforma privada com modelo de negócio para empresas (ex.: selo "Empresa Confia"), o que pode influenciar incentivos de exibição de dados.

### Dados públicos específicos do Itaú no Reclame Aqui · EVIDÊNCIA
- Páginas institucionais públicas separadas por marca (Banco Itaú, Itaú Empresas, Cartões Itaú, Itaú Seguros e Capitalização) mostram nota do consumidor, volume de reclamações no período, % de reclamações respondidas/resolvidas e tempo médio de resposta; exemplo: Banco Itaú com nota 8,1/10, 19.214 reclamações e 85,2% resolvidas no período 01/02/2026–31/07/2026, segundo consulta feita.
- Trecho decisivo: "tempo médio de resposta de 6 dias e 8 horas" [12]
- Não sustenta: não consegui confirmar esses números por leitura direta da página (reclameaqui.com.br bloqueou o WebFetch com erro 403); os valores vieram de um resumo de busca sobre o conteúdo indexado da página, por isso podem estar desatualizados ou imprecisos. A lista de categorias/assuntos específicos de reclamação contra o Itaú (ex.: "Cartão de Crédito", "Conta Corrente") não foi confirmada com números confiáveis nesta pesquisa.

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| Índice de reclamações BCB | Fórmula: EEP × 1.000.000 / nº de clientes; EEP é extrapolação estatística de reclamações procedentes | Evidência | Só bancos/financeiras/instituições de pagamento; consórcios têm cálculo diferente | 30/07/2024 (nota técnica) | [1] |
| Campos do CSV "Bancos e Financeiras" (BCB) | Ano, período, Categoria, Tipo, CNPJ IF, Instituição, Índice, qtd. reclamações (procedentes/outras/não reguladas/total), qtd. clientes CCS/SCR/FGC | Evidência | Schema v1.0; não cobre o recurso "Consórcios" | Documento sem data de revisão (v1.0) | [3] |
| Motivo da reclamação (BCB) | Top assuntos: cartão de crédito, crédito consignado, atendimento SAC | Evidência | Só top 3 exibidos na home; lista completa não verificada | Consulta em set/2026 | [4] |
| Posição do Itaú no ranking BCB | 7º lugar, índice 34,12, 3.442 procedentes, 100.863.694 clientes | Evidência | Dado do 1º tri/2026 via reportagem, não leitura direta do CSV do período | 23/04/2026 | [5] |
| Campos do dicionário consumidor.gov.br | Área, Assunto, Grupo Problema, Problema, Nome Fantasia, UF, Como Comprou/Contratou, Gestor, Canal de Origem | Evidência | PDF não lido por inteiro (falha de DNS); lista pode estar incompleta | Dicionário v3.0 (sem data exibida) | [6][7] |
| Indicadores por empresa (consumidor.gov.br) | Índice de Solução, Satisfação (1-5), % Respondidas, Prazo Médio de Resposta; períodos 30d/6m/ano/todas | Evidência | Perfil do Itaú consultado mostrou "S/R" nos valores; confirma só estrutura | Consulta em set/2026 | [8][9] |
| Campos da API REST (consumidor.gov.br) | codigoArea, codigoAssunto, codigoProblema, codigoSituacaoReclamacao, numAvaliacao, notaConsumidor, codigoGrupoEconomico, codigoMeioConsumo, numeroProtocolo | Evidência | Documentação da API, não do arquivo CSV em si | Consulta em set/2026 | [7] |
| Volume setor financeiro 2026 | 61,8% das reclamações do 1º sem/2026 no consumidor.gov.br; Itaú 12º lugar em jun/2026, 12.206 casos, resolução 24,2% | Evidência | Matéria jornalística sobre dado agregado; não é leitura direta do CSV bruto | 2026 (1º semestre) | [10] |
| Índice RA (Reclame Aqui) | Combinação de 4 indicadores com pesos (2,3,3,2); atualização mensal/diária | Evidência | Documentação da própria ferramenta sobre seu cálculo, sem auditoria externa | Consulta em set/2026 | [11] |
| Dados públicos Itaú no Reclame Aqui | Nota 8,1/10, 19.214 reclamações, 85,2% resolvidas, período 01/02/2026–31/07/2026 (Banco Itaú) | Evidência | Não confirmado por leitura direta (403 no fetch); pode estar desatualizado | Consulta em set/2026 | [12] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Campos do CSV do BCB (índice, motivos, quantidade de clientes/reclamações) | slide bloco 2 (evidências) · ficha P2 (onde entra a IA) · demo (schema do banco simulado) |
| Dicionário de dados do consumidor.gov.br (Área, Assunto, Grupo Problema, Problema) | demo (nomes de campo/categoria para o banco simulado) · ficha P2 |
| Indicadores por empresa e API do consumidor.gov.br | ficha P5 (como saber se ajudou — métricas já existentes de solução/satisfação/prazo) |
| Metodologia do Índice RA (pesos, componentes) | slide bloco 2 · ficha P4 (risco de usar indicador de terceiro sem auditoria) |
| Volume e panorama do setor financeiro 2026 | slide bloco 1 (dor/contexto do case) · slide bloco 2 |
| Posição do Itaú no ranking BCB | slide bloco 1/2 (contexto, sem citar como alvo de crítica ao Itaú) |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Lista completa (não só top 3) de "Motivo da reclamação" do BCB por trimestre | Abri www3.bcb.gov.br/ranking/, vi só os 3 primeiros da home; não abri "lista completa" | Média |
| Leitura integral do Dicionário de Dados v3.0 do consumidor.gov.br (todos os campos, tipos e domínios) | Tentei WebFetch direto em dados.mj.gov.br duas vezes; falhou por erro de DNS (ENOTFOUND); usei snippets de busca como substituto parcial | Alta |
| Confirmação direta (sem bloqueio) dos números do Reclame Aqui para as marcas Itaú | WebFetch em reclameaqui.com.br retornou HTTP 403; usei resumo de busca como fonte secundária | Alta |
| Categorias completas de "assunto/problema" específicas do segmento financeiro no consumidor.gov.br | Busquei mas só obtive exemplos parciais (ex.: "Atendimento Bancário"), sem a lista fechada do domínio de valores | Média |
| Amostra/volume real de reclamações do Itaú especificamente no consumidor.gov.br (não só do setor) | Não encontrei matéria ou dataset com o corte só-Itaú além da citação de 12º lugar em jun/2026 | Média |

## Fontes
1. [PRIMÁRIA] Nota Técnica Ranking de Reclamações — Banco Central do Brasil — https://www.bcb.gov.br/content/meubc/Documents/nota-tecnica-reclamacoes-24.pdf — 30/07/2024
2. [PRIMÁRIA] Ranking de Instituições por Índice de Reclamações (conjunto de dados) — Banco Central do Brasil, Portal de Dados Abertos — https://dadosabertos.bcb.gov.br/dataset/ranking-de-instituicoes-por-indice-de-reclamacoes — consultado em set/2026
3. [PRIMÁRIA] Ranking de Instituições por Índice de Reclamações – v1.0 (documentação de campos) — Banco Central do Brasil — https://www.bcb.gov.br/conteudo/dadosabertos/BCBDeati/Documentacao%20do%20Conjunto%20de%20dados%20-%20Ranking.pdf — sem data de revisão visível
4. [PRIMÁRIA] Ranking de Reclamações — Banco Central do Brasil — https://www3.bcb.gov.br/ranking/ — consultado em set/2026
5. [IMPRENSA] Ranking de reclamações do BC: quem lidera no início de 2026 — Finsiders Brasil — https://finsidersbrasil.com.br/estudos-e-relatorios/c6-bradesco-e-btg-pan-lideram-queixas-contra-bancos-no-1o-tri-aponta-bc/ — 23/04/2026
6. [PRIMÁRIA] Dicionário de Dados Consumidor.gov.br — Versão 3.0 — Senacon/Ministério da Justiça e Segurança Pública — https://dados.mj.gov.br/dataset/0182f1bf-e73d-42b1-ae8c-fa94d9ce9451/resource/90aedbfe-3c91-4c18-86a5-f408d07e7210/download/dicionario-de-dados---consumidorgovbr-v3.pdf — acesso indireto via busca (DNS falhou no fetch direto)
7. [PRIMÁRIA] Documentação REST — Consumidor.gov.br — https://consumidor.gov.br/pages/principal/documentacao-rest — consultado em set/2026
8. [PRIMÁRIA] Perfil público — Banco Itaú Unibanco — Consumidor.gov.br — https://www.consumidor.gov.br/pages/empresa/20140206000001216/perfil — consultado em set/2026
9. [PRIMÁRIA] Página de indicadores/ranking geral — Consumidor.gov.br — https://www.consumidor.gov.br/pages/indicador/geral/abrir — consultado em set/2026
10. [IMPRENSA] Reclamações crescem 45% em 2026; bancos lideram ranking — Consumo em Pauta — https://www.consumoempauta.com.br/especiais/reclamacoes-crescem-45-em-2026-bancos-lideram-ranking/ — 2026
11. [PRIMÁRIA] Manual — Reputação no Reclame Aqui — Reclame Aqui — https://manual.reclameaqui.com.br/reputacao-no-reclame-aqui — consultado em set/2026
12. [PRIMÁRIA] Lista de reclamações: Banco Itaú / Itaú Empresas / Cartões Itaú / Itaú Seguros e Capitalização — Reclame Aqui — https://www.reclameaqui.com.br/empresa/itau/ (e páginas irmãs) — consultado em set/2026, sem confirmação por leitura direta (bloqueio 403)
