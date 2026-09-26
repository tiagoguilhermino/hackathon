
# Categorias de dados pessoais na política de privacidade do Itaú (LGPD)

> Pergunta: Que categorias de dados pessoais o Itaú declara coletar e tratar, com que finalidades, bases legais, compartilhamentos e prazos de retenção, segundo sua política de privacidade e documentos públicos de LGPD?

## Resumo executivo
Recorte do time ainda não definido.
- A política de privacidade do Itaú declara coletar 6 blocos de dados: cadastrais/contato, financeiros/transacionais, biometria (sensível), dispositivo/conexão, navegação/cookies e geolocalização [1][2][5] (evidência).
- O Itaú cita como bases legais LGPD (Art. 7º): obrigação legal/regulatória, execução de contrato, proteção do crédito, legítimo interesse, proteção da vida e consentimento [1][6] (evidência).
- Compartilhamento declarado inclui empresas do conglomerado, parceiros estratégicos, bureaus de crédito (cadastro positivo/negativação) e autoridades judiciais/reguladoras [3][4] (evidência).
- Prazo de retenção numérico só foi confirmado para um caso específico: mínimo de 6 meses para registros de acesso a aplicações, por força do Marco Civil da Internet (Lei 12.965/14); para os demais dados, a política só fala em manter "por período maior" quando há obrigação legal/auditoria, sem número (evidência parcial).
- Não consegui abrir diretamente (fetch) as páginas oficiais de privacidade do Itaú nem o texto da LGPD no Planalto: os dois domínios bloquearam a ferramenta de leitura automática (HTTP 403 e falha de handshake/conexão), então os achados abaixo vêm de buscas cruzadas, não de leitura integral do documento (limite metodológico) (evidência sobre o limite, não sobre o conteúdo).
- A LGPD (Art. 5º, I e II) define dado pessoal como "informação relacionada a pessoa natural identificada ou identificável" e dado pessoal sensível como origem racial/étnica, convicção religiosa, opinião política, filiação sindical, saúde, vida sexual, dado genético e biométrico [7] (evidência).
- O Itaú, na definição de dado sensível que usa, cita biometria explicitamente como dado que trata; não achei confirmação de que a política geral (para clientes pessoa física) liste, como dado efetivamente coletado, as demais subcategorias sensíveis (saúde, religião, etnia, sindicato) além da definição legal genérica (lacuna).

## Achados

### Limite de acesso ao documento original · EVIDÊNCIA
- As tentativas de abrir diretamente itau.com.br/privacidade/* e planalto.gov.br retornaram HTTP 403 Forbidden, erro de handshake SSL e "connection reset" em repetidas tentativas.
- Trecho decisivo: "The server returned HTTP 403 Forbidden" [1]
- Não sustenta: não é evidência sobre o conteúdo da política, só sobre a dificuldade técnica de acesso automatizado; o time deve abrir os links manualmente no navegador antes de citar nos slides/ficha.

### Dados cadastrais e de contato · EVIDÊNCIA
- O Itaú declara coletar: nome, data de nascimento, gênero, RG, CPF e outros documentos de identificação (CNH), foto, endereço residencial e comercial, telefones (residencial, comercial, celular), e-mail, profissão/ocupação, estado civil, nacionalidade e naturalidade.
- Trecho decisivo: "nome, endereço, e-mail; biometria facial e/ou digital" [1]
- Não sustenta: lista vem de um resumo gerado a partir de busca sobre a página oficial, não de leitura integral do documento; não há confirmação de campos adicionais (ex.: nome da mãe, PIS) além dos citados.

### Dados financeiros e transacionais · EVIDÊNCIA
- O Itaú declara tratar dados de operações bancárias, financeiras e de pagamento, e produtos/serviços contratados ou pretendidos (crédito, financiamento, câmbio, investimento, seguro, previdência, capitalização, consórcio, cartão) e seu uso.
- Trecho decisivo: "operações e transações bancárias, financeiras ou de pagamento" [2]
- Não sustenta: não há detalhamento de campos específicos (ex.: saldo, limite, histórico de X anos) nem confirmação de quais desses dados alimentam quais sistemas.

### Dados biométricos, tratados como sensíveis · EVIDÊNCIA
- O Itaú declara coletar biometria facial e/ou digital (ou outra biometria) para prevenção a fraude, segurança e autenticação em processos de identificação em canais eletrônicos.
- Trecho decisivo: "biometria facial, digital ou outras, em processos de identificação" [2]
- Não sustenta: a política não detalha, nos trechos recuperados, prazo de retenção específico da biometria nem se há descarte automático após o fim do relacionamento.

### Dados de localização e de dispositivo/navegação · EVIDÊNCIA
- O Itaú declara coletar geolocalização (para prevenção a fraude, segurança, proteção de crédito, indicar dependências próximas e ofertas) e dados de dispositivo/conexão: Advertising ID, sistema operacional, tamanho de tela, IP, rede, data/hora de conexão, páginas e cliques, além de cookies próprios e de terceiros.
- Trecho decisivo: "geolocalização... para prevenção à fraude e segurança" [5]
- Não sustenta: não há, nos trechos recuperados, lista fechada de todos os provedores de cookies de terceiros nem opção técnica de opt-out descrita em detalhe.

### Bases legais citadas (LGPD Art. 7º e 11) · EVIDÊNCIA
- Para dados em geral, o Itaú cita as hipóteses do Art. 7º da LGPD: cumprimento de obrigação legal/regulatória, execução de contrato, proteção do crédito, interesse legítimo, proteção da vida/incolumidade física e consentimento.
- Para dados sensíveis, a LGPD (Art. 11) exige, em regra, consentimento específico e destacado, sem a hipótese de legítimo interesse; as exceções sem consentimento cobrem obrigação legal, políticas públicas, pesquisa (com anonimização quando possível), exercício de direitos, proteção da vida e tutela da saúde por profissional de saúde.
- Trecho decisivo: "quando o titular... consentir, de forma específica e destacada" [8]
- Não sustenta: os trechos recuperados não amarram, achado a achado, qual base legal exata o Itaú aplica a cada categoria de dado (ex.: qual base cobre biometria versus qual cobre dado de navegação).

### Compartilhamento com terceiros · EVIDÊNCIA
- O Itaú declara compartilhar dados com empresas do próprio conglomerado, parceiros estratégicos, bureaus de crédito (inclusive para cadastro positivo e negativação) e autoridades judiciais, administrativas, arbitrais ou reguladoras, para cumprir requisições e obrigações legais.
- Trecho decisivo: "compartilha dados com bureaus de crédito... cadastro positivo, nos casos de negativação" [4]
- Não sustenta: não há lista nominal de parceiros/terceiros nem percentual ou volume de dados compartilhados; texto fala em categorias, não em empresas específicas.

### Prazos de retenção · EVIDÊNCIA PARCIAL
- Para registros de acesso a aplicações/sites, a política cita retenção mínima de 6 meses, alinhada à Lei 12.965/2014 (Marco Civil da Internet).
- Para os demais dados (cadastrais, financeiros, biometria), a política só afirma que podem ser mantidos "por período maior" após o fim do relacionamento, por razões legais, regulatórias, judiciais, de auditoria, segurança, controle de fraude e preservação de direitos, sem indicar um número de anos.
- Trecho decisivo: "armazenados... por um período mínimo de 6 (seis) meses" [1]
- Não sustenta: não há confirmação de prazo específico (em anos) para dados financeiros/cadastrais gerais; a busca por regra complementar do Banco Central sobre prazo de guarda de registros bancários não trouxe um número verificável nesta rodada (ver Lacunas).

### Definição legal de dado pessoal e dado pessoal sensível (LGPD) · EVIDÊNCIA
- LGPD, Art. 5º, I: dado pessoal é "informação relacionada a pessoa natural identificada ou identificável".
- LGPD, Art. 5º, II: dado pessoal sensível cobre origem racial/étnica, convicção religiosa, opinião política, filiação a sindicato/organização religiosa-filosófica-política, dado de saúde ou vida sexual, dado genético e dado biométrico.
- Trecho decisivo: "informação relacionada a pessoa natural identificada ou identificável" [7]
- Não sustenta: não confirma se o Itaú, na prática, coleta as subcategorias sensíveis além de biometria (saúde, religião, etnia, sindicato); a política, nos trechos recuperados, define o conceito legal mas não lista essas subcategorias como dado efetivamente tratado no relacionamento bancário comum.

### Direitos do titular · EVIDÊNCIA
- O Itaú declara oferecer acesso, confirmação de existência de tratamento, atualização/correção, anonimização/bloqueio/eliminação de dados desnecessários ou tratados em desconformidade, portabilidade e revogação de consentimento, via canal do Encarregado de Proteção de Dados (e-mail dedicado).
- Trecho decisivo: "anonimização, bloqueio ou eliminação de dados desnecessários" [1]
- Não sustenta: não há prazo de resposta (SLA) confirmado para atendimento dessas solicitações nos trechos recuperados.

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| Dados cadastrais/contato | Nome, CPF, RG, CNH, foto, endereço, telefones, e-mail, profissão, estado civil, nacionalidade | Evidência | Lista completa de campos (via busca, não leitura integral) | busca em 26/09/2026 | [1][2] |
| Dados financeiros/transacionais | Operações bancárias, pagamento, crédito, investimento, seguro, previdência, consórcio, cartão | Evidência | Detalhe de campos e sistemas internos | busca em 26/09/2026 | [2] |
| Dados biométricos (sensíveis) | Biometria facial e/ou digital, para autenticação/antifraude | Evidência | Prazo de retenção específico da biometria | busca em 26/09/2026 | [1][2] |
| Localização/geolocalização | Coletada para antifraude, segurança, ofertas e indicar agências | Evidência | Frequência/precisão da coleta | busca em 26/09/2026 | [5] |
| Navegação/dispositivo/cookies | IP, Advertising ID, SO, cliques, páginas, cookies próprios/terceiros | Evidência | Lista de fornecedores de cookies de terceiros | busca em 26/09/2026 | [5] |
| Dado sensível — definição legal (LGPD Art. 5º II) | Origem racial/étnica, religião, opinião política, sindicato, saúde, vida sexual, genético, biométrico | Evidência | Se o Itaú coleta todas essas subcategorias na prática | Lei de 2018, consultada em 26/09/2026 | [7] |
| Bases legais gerais (LGPD Art. 7º) | Obrigação legal, contrato, proteção do crédito, legítimo interesse, proteção da vida, consentimento | Evidência | Qual base se aplica a cada categoria específica de dado | Lei de 2018, consultada em 26/09/2026 | [6][8] |
| Bases legais para dado sensível (LGPD Art. 11) | Consentimento específico e destacado; exceções taxativas sem legítimo interesse | Evidência | Qual exceção o Itaú usa para biometria (consentimento vs. exceção legal) | Lei de 2018, consultada em 26/09/2026 | [8] |
| Compartilhamento | Conglomerado, parceiros, bureaus de crédito, autoridades/reguladores | Evidência | Nomes de parceiros e volumes compartilhados | busca em 26/09/2026 | [3][4] |
| Retenção — registros de acesso | Mínimo de 6 meses (Marco Civil da Internet) | Evidência | Prazo para outras categorias de dado | busca em 26/09/2026 | [1] |
| Retenção — demais dados | "Período maior" após fim do relacionamento, sem número | Evidência parcial | Prazo numérico em anos | busca em 26/09/2026 | [1] |
| Direitos do titular | Acesso, correção, eliminação, portabilidade, revogação, via Encarregado | Evidência | SLA de resposta às solicitações | busca em 26/09/2026 | [1] |
| Data de última atualização da política ao cliente | Não confirmada; só achei data da política de colaborador (19/09/2025) | Lacuna | — | busca em 26/09/2026 | [1][9] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Categorias de dados cadastrais/contato/financeiros/biometria/localização/navegação | demo (modelagem do banco simulado com campos fictícios) · ficha P2 (como funciona e onde entra a IA) |
| Bases legais LGPD (Art. 7º e 11) | ficha P4 (principal risco) · bloco 5 (métrica, risco e escala) |
| Compartilhamento com terceiros/bureaus/reguladores | ficha P4 (principal risco) · bloco 5 |
| Prazos de retenção (parcial) | bloco 5 (risco e escala) · ficha P4 |
| Definição legal de dado sensível vs. dado comum | ficha P4 · bloco 5 (evitar usar categoria sensível real na simulação) |
| Direitos do titular | ficha P4 (risco/governança) |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Leitura integral e literal da Política de Privacidade e Cookies do Itaú (texto completo, não resumo de busca) | WebFetch direto na página e no PDF (ww70.itau.com.br/.../PoliticaDePrivacidade.pdf): recebi HTTP 403, falha de SSL handshake e connection reset em múltiplas tentativas | Alta |
| Data de última atualização/vigência da política de privacidade voltada a clientes (não a de colaboradores) | Busquei "última atualização" + "vigente desde" 2025/2026; só achei data para a política de colaborador (19/09/2025) e para Fundação Itaú (06/12/2024) | Alta |
| Prazo numérico (em anos) de retenção de dados financeiros/cadastrais após fim do relacionamento | Busquei LC 105/2001 e regulação do BACEN sobre prazo de guarda de registros; não encontrei número explícito nos resultados retornados | Média |
| Confirmação de que a política geral (cliente PF) lista dado de saúde/religião/etnia/sindicato como dado efetivamente coletado (não só na definição legal) | Busquei por produtos de seguro/previdência e dados sensíveis; só confirmei biometria como sensível explicitamente coletado | Média |
| Lista nominal de parceiros/terceiros com quem o Itaú compartilha dados | Busquei "terceiros" e "as informações podem ser compartilhadas"; só obtive categorias (bureaus, conglomerado, autoridades), sem nomes | Baixa |
| Texto literal do Art. 5º, 7º e 11 da LGPD direto do Planalto (fonte oficial) | WebFetch em planalto.gov.br (duas URLs) retornou "read ECONNRESET" repetidamente; usei fontes secundárias que citam o texto | Média |

## Fontes
1. [PRIMÁRIA] Política de Privacidade e Cookie — Itaú Unibanco — https://www.itau.com.br/privacidade/politica-de-privacidade-e-cookies — acessado em 26/09/2026 (conteúdo obtido via busca indexada; leitura direta bloqueada, ver Lacunas)
2. [PRIMÁRIA] Como obtemos dados pessoais — Itaú Unibanco — https://www.itau.com.br/privacidade/como-obtemos-dados-pessoais — acessado em 26/09/2026
3. [PRIMÁRIA] Política de Privacidade de Terceiros — Itaú Unibanco — https://www.itau.com.br/privacidade/terceiros — acessado em 26/09/2026
4. [PRIMÁRIA] As informações podem ser compartilhadas? — Itaú Unibanco — https://www.itau.com.br/privacidade/as-informacoes-podem-ser-compartilhadas — acessado em 26/09/2026
5. [PRIMÁRIA] Dados / Privacidade — Itaú Unibanco — https://www.itau.com.br/seguranca/privacidade/dados — acessado em 26/09/2026
6. [PRIMÁRIA] Privacidade (hub) — Itaú Unibanco — https://www.itau.com.br/privacidade — acessado em 26/09/2026
7. [PRIMÁRIA] Lei nº 13.709/2018 (LGPD), Art. 5º, incisos I e II — Presidência da República / Planalto — https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm — lei de 14/08/2018, consultada via busca em 26/09/2026 (fetch direto falhou, ver Lacunas)
8. [RELATÓRIO] Artigo 11: Tratamento de dados pessoais sensíveis — LGPD Brasil (lgpd-brasil.info) — https://lgpd-brasil.info/capitulo_02/artigo_11 — acessado em 26/09/2026
9. [PRIMÁRIA] Política de Privacidade e Proteção de Dados para Colaboradores — Itaú Unibanco — https://www.itau.com.br/privacidade/colaborador — última atualização declarada 19/09/2025, acessado em 26/09/2026 (escopo: colaboradores, não clientes)
