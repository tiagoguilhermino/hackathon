# Estrutura de dados de Pix e pagamentos no Brasil (BCB e Open Finance)

> Pergunta: Como são estruturados os dados de Pix e de pagamentos no Brasil (chaves e DICT, identificador EndToEndId, tipos e status de transação, devolução, Pix Automático, dados de iniciação de pagamento no Open Finance), segundo o Banco Central e o Open Finance?

## Resumo executivo
Recorte do time ainda não definido.
- O DICT define 5 tipos de chave Pix (telefone, e-mail, CPF, CNPJ, aleatória/EVP), com formato e limites (5 chaves/CPF, 20/CNPJ por conta) [1] (evidência).
- O EndToEndId é o identificador de 32 caracteres de cada liquidação, obrigatório na mensagem pacs.008; a composição exata (E+ISPB+timestamp+sequencial) não foi confirmada literalmente nos dois manuais BCB lidos, só em fonte secundária e no schema do Open Finance [1][4][5] (evidência).
- A cobrança Pix (imediata/com vencimento) tem status enum de 4 valores e dezenas de campos definidos no payload JSON [2] (evidência).
- A devolução é uma entidade própria com 3 estados e usa códigos de motivo na pacs.004 (ex.: MD06, BE08) [2][3] (evidência).
- O Pix Automático usa 3 entidades (Rec, SolicRec, CobR), cada uma com ID de 29 caracteres e máquina de estados própria [2] (evidência).
- A API de Pagamentos do Open Finance Brasil usa o mesmo formato de endToEndId, mas um enum de status de pagamento distinto do status de cobrança do Pix nativo [4] (evidência).
- Não localizei o catálogo completo de códigos de devolução nem o texto literal da composição do EndToEndId dentro dos manuais BCB (lacuna).

## Achados

### Chaves Pix e Diretório de Identificadores de Contas Transacionais (DICT) · EVIDÊNCIA
- O Manual Operacional do DICT (BCB, v8.5) define 5 tipos de chave com formato: telefone celular (+XXXXXXXXXXXXX, padrão E.164), e-mail (até 77 caracteres, validado por regex da API do DICT), CPF (11 dígitos numéricos, sem pontuação), CNPJ (14 caracteres alfanuméricos, sem pontuação) e chave aleatória/EVP (UUID gerado pelo DICT conforme RFC 4122, formato XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX) [1].
- Limite: usuário final com CPF pode vincular até 5 chaves por conta transacional; com CNPJ, até 20 chaves por conta, independentemente do número de titulares [1].
- A consulta de chave no DICT retorna: chave, tipo da chave, ISPB do participante, número de agência, número e tipo da conta, data de abertura da conta, natureza jurídica e identificação (CPF/CNPJ) do titular, nome (civil/social ou razão social), nome fantasia, data de registro da chave no DICT e no participante atual, e data de abertura de portabilidade/reivindicação em curso, se houver. Ao usuário final só podem ser exibidos: nome, nome fantasia, CPF mascarado (***.777.888-**) ou CNPJ, a própria chave e, opcionalmente, o nome do PSP do recebedor [1].
- O tipo de conta (accountType) segue o domínio ISO 20022/pacs.008 usado pelo SPI: CACC (conta corrente), SVGS (poupança), SLRY (conta-salário), TRAN (conta de pagamento pré-paga), conforme o schema oficial da API pix-dict-api no GitHub do Bacen [6].
- Trecho decisivo: "usuário final com número de inscrição no CPF pode vincular até cinco chaves" [1].
- Não sustenta: descreve o desenho normativo/técnico do DICT; não indica volumes reais de chaves cadastradas nem o comportamento efetivo de uso pelos bancos; o domínio accountType não aparece no texto do manual em si, só no schema da API.

### EndToEndId · EVIDÊNCIA
- O Manual Operacional do DICT (v8.5) confirma, em três fluxos de consulta distintos, que o EndToEndId é "campo obrigatório da mensagem de liquidação PACS.008", gerado pelo PSP (ou pelo prestador de serviço de iniciação de pagamento) no momento da consulta ao DICT e reenviado na pacs.008 [1].
- A composição de 32 caracteres — E + ISPB do participante direto/indireto ou 8 primeiros dígitos do CNPJ do iniciador (8) + ano(4) + mês(2) + dia(2) + hora(2) + minuto(2), tudo em UTC, + sequencial alfanumérico (11) — não foi encontrada de forma literal nos dois manuais BCB consultados (DICT v8.5 e MPI v2.10.0); vem de fonte secundária técnica [5].
- O schema da API de Pagamentos do Open Finance Brasil usa a mesma estrutura via regex `^([E])([0-9]{8})([0-9]{4})(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])(2[0-3]|[01][0-9])([0-5][0-9])([a-zA-Z0-9]{11})$`, o que corrobora o padrão de 32 caracteres [4].
- Trecho decisivo: "identificador único (...) corresponde ao campo EndToEndId, que é um campo obrigatório" [1].
- Não sustenta: a composição exata não está confirmada em texto literal de manual primário do BCB dentro do escopo lido nesta pesquisa; ver lacuna.

### txid — identificador de conciliação da cobrança · EVIDÊNCIA
- O Manual de Padrões para Iniciação do Pix (MPI, v2.10.0) define txid como campo obrigatório da cobrança, único por CPF/CNPJ do usuário recebedor e por PSP, com 26 a 35 caracteres alfanuméricos (A-Z, a-z, 0-9) [2].
- No pacs.008, o txid é referenciado como TransactionIdentification <TxId> ou idConciliacaoRecebedor [2].
- Trecho decisivo: "txid deve ter, no mínimo, 26 caracteres e, no máximo, 35 caracteres" [2].
- Não sustenta: regras de geração e unicidade são de responsabilidade do PSP recebedor; o BCB não audita duplicidade entre instituições diferentes; em QR Codes estáticos a consistência do txid fica totalmente a cargo do usuário recebedor.

### Cobrança Pix — payload e status · EVIDÊNCIA
- O payload JSON de cobrança imediata tem os campos: revisao, calendario.criacao/apresentacao/expiracao, devedor.cpf/cnpj/nome, valor.original/modalidadeAlteracao/retirada.saque.*/retirada.troco.*, chave, txid, solicitacaoPagador, infoAdicionais[], assinatura e status [2].
- A cobrança com vencimento adiciona calendario.dataDeVencimento, calendario.validadeAposVencimento, valor.abatimento/desconto/juros/multa/final e o objeto recebedor completo (cpf/cnpj, nome, nomeFantasia, logradouro, cidade, uf, cep) [2].
- O campo status da cobrança assume 4 valores possíveis: ATIVA, CONCLUÍDA, REMOVIDO_PELO_USUARIO_RECEBEDOR, REMOVIDO_PELO_PSP [2].
- Cardinalidade documentada: uma Cobrança pode estar associada a um ou mais Pix (mesmo txid); um Pix pode ter uma ou mais Devoluções; uma Cobrança só pode estar associada a um PayloadLocation por vez [2].
- Trecho decisivo: "podendo assumir os seguintes estados: 'ATIVA', 'CONCLUÍDA'..." [2].
- Não sustenta: é a especificação funcional nacional da API Pix; não define como cada banco implementa telas ou regras adicionais de conciliação internas.

### Devolução do Pix e Mecanismo Especial de Devolução (MED) · EVIDÊNCIA
- A entidade Devolução (/devolucao) tem 3 estados: EM_PROCESSAMENTO (solicitada, em processamento no SPI), DEVOLVIDO (liquidada pelo SPI) e NAO_REALIZADO (erro na liquidação, ex. saldo insuficiente) [2].
- Toda devolução é enviada ao SPI via mensagem pacs.004 com um campo codigoDevolucao; o Guia de implementação dos procedimentos de devolução (MED, v4.3) mostra, em exemplo de fluxo, "MD06" para devolução por iniciativa própria do usuário recebedor e "BE08" para devolução por falha operacional dentro do MED [3].
- O MED permite ao PSP debitar a conta do cliente sem autorização prévia a cada caso, mediante notificação de infração, bloqueio cautelar (até 72h) e marcação de fraude no DICT; o resultado da análise do PSP do recebedor é um enum: totally_accepted, partially_accepted ou rejected (com motivo no_balance, account_closure ou other) [3].
- Trecho decisivo: "o MED é o conjunto de regras que permite (...) debite recursos (...) sem que o cliente precise autorizar" [3].
- Não sustenta: o guia lido (v4.3) tem vigência anterior a 01/09/2026; a capa do documento indica uma versão 4.4 com vigências a partir de 01/09/2026 e 26/10/2026, já parcialmente em vigor na data desta pesquisa (26/09/2026) e não consultada aqui; não há, nesta pesquisa, o catálogo fechado de todos os códigos de motivo de devolução (só os dois exemplos citados).

### Pix Automático — entidades Rec, SolicRec e CobR · EVIDÊNCIA
- Rec (recorrência): idRec com 29 caracteres alfanuméricos no formato [R|C][R|N] + identificação do agente (8) + data de criação AAAAMMDD (8) + sequencial (11); estados: CRIADA → APROVADA/REJEITADA/EXPIRADA/CANCELADA [2].
- SolicRec (solicitação de confirmação de recorrência, exclusiva da Jornada 1 de autorização): idSolicRec com "SC" + ISPB do agente (8) + data (8) + sequencial (11) = 29 caracteres; estados: CRIADA → ENVIADA → RECEBIDA → ACEITA (ou REJEITADA/EXPIRADA/CANCELADA) [2].
- CobR (cobrança recorrente): tem status próprio da cobrança (CRIADA/ATIVA/CONCLUÍDA/EXPIRADA/REJEITADA/CANCELADA) mais um array "tentativas", cada uma com status independente (SOLICITADA → AGENDADA → PAGA/EXPIRADA/CANCELADA/REJEITADA), documentado em diagramas de estado por cenário (pagamento na 1ª tentativa, pagamento com retentativa, não pagamento, rejeição pelo PSP pagador, cancelamento) [2].
- politicaRetentativa da Rec admite só 2 valores: NAO_PERMITE ou PERMITE_3R_7D (até 3 retentativas, em dias diferentes, no intervalo de até 7 dias corridos) [2].
- Trecho decisivo: "R ou C – fixo (1 caractere)... R ou N – fixo (1 caractere)" [2].
- Não sustenta: o Pix Automático foi normatizado em 2024 (Resoluções BCB 402/403/406/407 e Instruções Normativas 491 e 513/2024); esta pesquisa não verificou dados de adoção real pelos bancos nem volume de uso.

### Open Finance Brasil — API de Pagamentos (iniciação via Pix) · EVIDÊNCIA
- O schema da API de Pagamentos (repositório oficial OpenBanking-Brasil/openapi, versão 2.0.0-rc1.0) define endToEndId (32 caracteres, mesmo padrão do Pix nativo), localInstrument como enum MANU|DICT|INIC|QRDN|QRES, proxy (chave Pix, até 77 caracteres), remittanceInformation (até 140 caracteres), ibgeTownCode (7 dígitos) e creditorAccount com ispb/issuer/number/accountType [4].
- O status do pagamento no Open Finance usa um enum próprio, diferente do status de cobrança do Pix nativo: RCVD, PATC, CANC, ACCP, ACPD, RJCT, ACSC, PDNG, SCHD [4].
- O consentimento de pagamento (Consent) tem loggedUser/businessEntity (CPF ou CNPJ), creditor (personType, cpfCnpj, nome), objeto payment (type=PIX, currency, amount, date ou schedule) e debtorAccount opcional [4].
- Trecho decisivo: "endToEndId (...) 32 chars (...) Format: ExxxxxxxxyyyyMMddHHmmkkkkkkkkkkk" [4].
- Não sustenta: extração feita a partir do arquivo YAML bruto do repositório oficial via processamento automatizado (não houve conferência campo a campo na wiki interativa do Open Finance Brasil, que pode conter versão mais atual do schema).

## Tabela do tema
| Item | O que a fonte afirma | Tipo | Não sustenta | Data da informação | Fonte |
|---|---|---|---|---|---|
| Chave Pix — tipos e formato | 5 tipos (telefone E.164, e-mail ≤77c, CPF 11 díg., CNPJ 14 alfanum., EVP UUID RFC4122) | evidência | volumes reais de uso | v8.5 (sem data de capa) | [1] |
| Limite de chaves | 5 por CPF / 20 por CNPJ por conta | evidência | comportamento efetivo dos usuários | v8.5 | [1] |
| Dados retornados na consulta DICT | chave, tipo, ISPB, agência, conta, tipo de conta, datas de registro/portabilidade, titular | evidência | só parte desses dados pode ir à tela do usuário final | v8.5 | [1] |
| accountType (domínio) | CACC / SVGS / SLRY / TRAN | evidência | não está no texto do Manual DICT; vem do schema da API pix-dict-api | schema atual GitHub bacen | [6] |
| EndToEndId — obrigatoriedade | campo obrigatório da pacs.008, gerado pelo PSP na consulta ao DICT | evidência | composição exata não citada literalmente nos manuais BCB lidos | v8.5 / v2.10.0 | [1][2] |
| EndToEndId — composição de 32 caracteres | E+ISPB/CNPJ(8)+AAAAMMDDHHmm(12)+sequencial(11) | evidência | fonte primária BCB não localizada; corroborado por fonte secundária e regex do Open Finance | fonte secundária + schema OF | [5][4] |
| txid | 26 a 35 caracteres alfanuméricos, único por CPF/CNPJ+PSP | evidência | não garante unicidade entre PSPs diferentes | v2.10.0 | [2] |
| Status da cobrança Pix | ATIVA / CONCLUÍDA / REMOVIDO_PELO_USUARIO_RECEBEDOR / REMOVIDO_PELO_PSP | evidência | é o status da cobrança, não da liquidação do Pix em si | v2.10.0 | [2] |
| Estados da Devolução | EM_PROCESSAMENTO / DEVOLVIDO / NAO_REALIZADO | evidência | não lista todos os motivos possíveis | v2.10.0 | [2] |
| Código de motivo de devolução | exemplos MD06 (voluntária) e BE08 (MED/falha operacional) | evidência | não é o catálogo completo de códigos; guia com versão mais nova (4.4) não consultada | v4.3 (vigência anterior a 01/09/2026) | [3] |
| Rec (Pix Automático) — idRec | 29 caracteres: [R\|C][R\|N]+agente(8)+data(8)+sequencial(11) | evidência | adoção real pelos bancos não verificada | v2.10.0 | [2] |
| Estados da Rec | CRIADA → APROVADA/REJEITADA/EXPIRADA/CANCELADA | evidência | jornadas de autorização não detalhadas nesta linha | v2.10.0 | [2] |
| Estados da SolicRec | CRIADA→ENVIADA→RECEBIDA→ACEITA (ou REJEITADA/EXPIRADA/CANCELADA) | evidência | só existe na Jornada 1 de autorização | v2.10.0 | [2] |
| Estados da CobR | CRIADA/ATIVA/CONCLUÍDA/EXPIRADA/REJEITADA/CANCELADA + tentativas.status | evidência | detalhamento completo de retentativas não repetido nesta linha | v2.10.0 | [2] |
| politicaRetentativa | NAO_PERMITE ou PERMITE_3R_7D | evidência | única regra vigente segundo o manual lido | v2.10.0 | [2] |
| endToEndId no Open Finance | mesmo padrão de 32 caracteres do Pix nativo | evidência | extraído por leitura automatizada do YAML | schema atual | [4] |
| localInstrument (Open Finance) | enum MANU / DICT / INIC / QRDN / QRES | evidência | idem acima | schema atual | [4] |
| Status de pagamento (Open Finance) | RCVD, PATC, CANC, ACCP, ACPD, RJCT, ACSC, PDNG, SCHD | evidência | enum distinto do status de cobrança do Pix nativo | schema atual | [4] |

## Onde isso ajuda na entrega
| Achado | Serve para (slide bloco 1–6 · ficha P1–P5 · demo) |
|---|---|
| Tipos e formato de chave Pix / DICT | demo (base simulada), ficha P2 |
| EndToEndId (identificador único de liquidação) | demo (base simulada), ficha P2 |
| txid (conciliação da cobrança) | demo (base simulada), ficha P2 |
| Status da cobrança Pix | demo (base simulada), slide bloco 3 |
| Devolução e códigos de motivo (MED) | demo (base simulada), slide bloco 5 (risco) |
| Entidades do Pix Automático (Rec/SolicRec/CobR) | demo (base simulada), slide bloco 3 |
| Schema de pagamento do Open Finance | demo (base simulada), ficha P2 |

## Lacunas de verificação
| O que falta | O que tentei | Prioridade (alta/média/baixa) |
|---|---|---|
| Confirmar a composição exata do EndToEndId (E+ISPB+timestamp+sequencial) em texto literal de um manual BCB, não só em fonte secundária | Li DICT v8.5 (seções 1-22, trechos) e MPI v2.10.0 (seções 1-6, Anexos I e IV); ambos só dizem que o campo é obrigatório na pacs.008, sem detalhar a composição interna | média |
| Catálogo completo de códigos de motivo de devolução (MD01...MD06, SL01/SL02, BE08 etc.) | Li o Guia MED v4.3 (páginas iniciais e seção 4.1); só achei 2 exemplos (MD06, BE08) citados no fluxo, não a tabela cheia do "Catálogo de Mensagens do SPI" | média |
| Ler a versão 4.4 do Guia MED (parcialmente vigente desde 01/09/2026, já vigente na data desta pesquisa) | A capa do PDF v4.3 apenas sinaliza a existência da v4.4; não segui o link por não fazer parte do escopo desta busca | média |
| Domínio "tipo de conta" (accountType) dentro do texto do próprio Manual Operacional do DICT | Não encontrado nas páginas lidas do DICT (1-10, 51-59); usei o schema da API pix-dict-api no GitHub do Bacen como fonte alternativa | baixa |
| Conteúdo completo e atualizado da API de Pagamentos do Open Finance Brasil na wiki oficial (Atlassian) | WebFetch só retornou cabeçalho/menu da wiki (conteúdo dinâmico não veio no HTML estático); usei o YAML bruto do GitHub como alternativa | média |
| Guia de implementação do Pix Automático (documento próprio, v1.3) não pôde ser lido como texto (PDF retornou binário) | Tentei WebFetch direto no PDF; os dados de entidades do Pix Automático usados vêm do Anexo IV do Manual de Padrões (fonte [2]), não deste guia específico | baixa |
| Status/enum de transação Pix ao nível SPI (mensagens pacs.002/pacs.008 completas aplicadas ao Pix, ex. ACSC/RJCT) | Busquei "Pix status pagamento ISO 20022 pacs.002"; resultados só deram definição genérica ISO 20022, não a aplicação específica documentada pelo SPI brasileiro | média |

## Fontes
1. [PRIMÁRIA] Manual Operacional do Diretório de Identificadores de Contas Transacionais (DICT), versão 8.5 — Banco Central do Brasil — https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/X_ManualOperacionaldoDICT.pdf — consultado em 26/09/2026
2. [PRIMÁRIA] Manual de Padrões para Iniciação do Pix (MPI), versão 2.10.0 — Banco Central do Brasil — https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf — consultado em 26/09/2026
3. [PRIMÁRIA] Guia de implementação dos procedimentos de devolução no Pix, com ênfase no Mecanismo Especial de Devolução (MED), versão 4.3 — Banco Central do Brasil — https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Guia_MED.pdf — consultado em 26/09/2026 (nota: capa indica versão 4.4 com vigência a partir de 01/09/2026 e 26/10/2026, não consultada)
4. [PRIMÁRIA] Payments API — OpenAPI specification — Open Finance Brasil / OpenBanking-Brasil (GitHub) — https://raw.githubusercontent.com/OpenBanking-Brasil/openapi/main/swagger-apis/payments/2.0.0-rc1.0.yml — consultado em 26/09/2026
5. [RELATÓRIO] Validade do EndToEndId no Pix — Entendendo como funciona — StarkInfra (central de ajuda) — https://starkinfra.zendesk.com/hc/pt-br/articles/42184580226587-Validade-do-EndToEndId-no-Pix-Entendendo-como-funciona — consultado em 26/09/2026
6. [PRIMÁRIA] pix-dict-api — especificação OpenAPI da API do DICT — Banco Central do Brasil (repositório GitHub bacen) — https://github.com/bacen/pix-dict-api — consultado em 26/09/2026
