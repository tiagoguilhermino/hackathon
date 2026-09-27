# Ficha do Produto · Vila de Personas

> **RASCUNHO do M3.** Os campos entre colchetes (**[N]**, **[X]**, **[Y]**, **[Z]**, **[TEMPO MEDIDO]**, **[N CONVERSAS]**) só entram depois de medidos: saem do `resultados/numeros-finais.md` (Passo 9) e do `input/conversas.md`. Se o teste com pessoas contrariar a vila, a ficha muda para contar isso; não force a história. Para entregar: cole no Google Docs, confira que cabe em **2 páginas**, exporte em PDF e salve como `docs/ficha-do-produto.pdf`. Apague este bloco antes.

## Vila de Personas ajuda designers e POs a ver onde o cliente pode travar numa tela antes do teste com pessoas

Quando uma squad muda uma tela do app, ela só descobre se o cliente vai se perder na próxima rodada de teste com usuários, que leva tempo para marcar, conduzir e analisar. A Vila de Personas quer encurtar esse caminho. O designer sobe duas versões da tela, e personas de IA, descritas pelo jeito de usar o celular, tentam a mesma tarefa três vezes em cada versão e dizem onde travariam. O designer ou o PO compara o antes e o depois, decide o que levar ao teste com pessoas e deixa essa decisão registrada. A vila não aprova design nem substitui gente: ajuda a chegar ao teste com as perguntas certas. No protótipo do hackathon, já dá para comparar versões de uma tela de Pix, ver onde cada persona travou e registrar a decisão. Usar telas reais do banco fica para um piloto.

*Exercício fictício de lançamento desenvolvido no hackathon. Não é um comunicado oficial do Itaú.*

## Perguntas e respostas

**1. Para quem é e por que usariam em vez da alternativa atual?**
Para o designer e o PO de uma squad que está mudando uma tela do app. Hoje, a alternativa é esperar a rodada de teste com usuários para achar os problemas, inclusive os óbvios. Num estudo, analisar 5 sessões levou em média 22 horas por especialista [4]. A vila roda antes (a simulação completa levou cerca de 20 minutos, medido) e ajuda a escolher o que levar a essas sessões. No fim, quem ganha é o cliente que tem mais dificuldade com o app: no Brasil, só 54% das pessoas com 60 anos ou mais usam internet, e 52% delas fizeram Pix [5]. *Hipótese a confirmar: a dor "cada rodada de teste leva tempo" vem de [N CONVERSAS] conversas com itubers (cargo, sem nome, em `input/conversas.md`).*

**2. Como funciona e onde a IA participa?**
Para cada persona, um modelo de IA que lê imagens recebe o cartão da persona, a imagem da tela e a tarefa. No papel dela, ele diz onde tocaria, onde hesitaria e se concluiria, sempre no mesmo formato. Cada persona tenta 3 vezes cada versão. O painel mostra "concluiu X de 3" e só chama de melhora uma diferença de 2 rodadas ou mais; abaixo disso, é "sinal fraco". A IA não recebe a resposta certa, e o texto que ela recebe (o prompt) foi congelado antes do teste com pessoas. Também usamos IA para escrever o código e para a pesquisa. Conferimos as saídas com um autoteste automático (que confere, entre outras coisas, que o prompt não entrega a resposta), com um teste de ponta a ponta no navegador e conferindo as 26 evidências da pesquisa contra as fontes originais.

**3. O que foi testado, o que observamos e o que ainda é hipótese ou simulação?**
*Simulação, medida em 26/09/2026:* 4 personas × 3 versões × 3 rodadas = 36 tentativas, 0 falhas, 1.195 s. Com "Repetir" escondido em "Mais opções" (A) ou só um ícone sem texto (B), nenhuma persona concluiu (0 de 3 para as 4). Com ícone e texto "Repetir todo mês" (C), todas concluíram (3 de 3). Isso combina com estudos com pessoas sobre menus escondidos e ícones sem texto [6][7][8], mas continua hipótese. As 4 personas se comportaram igual, o que lembra o "achatamento" de grupos descrito em [3]. *Teste com pessoas:* [N] pessoas de fora do time, com as mesmas telas e a pergunta "Onde você tocaria para que este Pix se repita todo mês?": [X] acertos, [Y] pontos cegos e [Z] alarmes falsos da vila; as sessões somaram [TEMPO MEDIDO]. *Limite:* na C, o texto do botão repete as palavras da tarefa, o que pode facilitar para a IA e para as pessoas.

**4. Qual é o principal risco, como é tratado e o que a solução não deve fazer sozinha?**
O risco é tratar a vila como se fosse gente. Em apps reais, a IA achou pouco mais de um terço dos problemas conhecidos [1], e usuários simulados podem dar uma nota errada ao produto e retratar grupos por estereótipo [2][3]. Os controles:
- rótulo SIMULAÇÃO em todo resultado, e "sinal fraco" quando a diferença é pequena;
- decisão sempre de uma pessoa (designer ou PO), gravada com quem decidiu, qual simulação, o que a vila apontou e por quê;
- comparação medida com pessoas reais;
- personas descritas por comportamento e nenhum dado real de cliente [9].

Pessoas tendem a confiar demais na automação [10], por isso a tela mostra os limites ao lado do resultado. A vila não aprova design, não substitui o teste com pessoas e não vê dado de cliente.

**5. Como saberemos que ajudou e o que falta para um piloto com uso real?**
Três indicadores:
- a parte dos problemas das pessoas que a vila também apontou: acertos ÷ (acertos + pontos cegos), hoje [X] de [X+Y];
- os alarmes falsos, hoje [Z];
- o tempo da tela nova até a decisão de testar.

Para um piloto: uma squad real, várias telas e tarefas (não uma só), modelo e ambiente aprovados pelo banco, telas sem dado de cliente e um plano pago de API (a simulação oficial usou 95.598 tokens em 36 tentativas). Até lá, cada rodada da vila continua sendo comparada com teste com pessoas.

## Fontes

1. Pourasad e Maalej, "Does GenAI Make Usability Testing Obsolete?", ICSE 2025. arxiv.org/abs/2411.00634
2. Seshadri et al., "Lost in Simulation: LLM-Simulated Users are Unreliable Proxies for Human Users in Agentic Evaluations", ACL 2026. aclanthology.org/2026.acl-long.2192
3. Wang, Morgenstern e Dickerson, "Large language models that replace human participants can harmfully misportray and flatten identity groups", Nature Machine Intelligence, 2025. arxiv.org/abs/2402.01908
4. Hertzum, Molich e Jacobsen, "What You Get Is What You See: Revisiting the Evaluator Effect in Usability Tests", Behaviour & Information Technology, 2014. mortenhertzum.dk/publ/BIT2014.pdf
5. Cetic.br/NIC.br, "TIC Domicílios 2025", tabelas C2 e C6. cetic.br/pt/tics/domicilios/2025/individuos/C2/
6. Pernice e Budiu, "Hamburger Menus and Hidden Navigation Hurt UX Metrics", Nielsen Norman Group, 2016. nngroup.com/articles/hamburger-menus/
7. Li e Luximon, "Older adults' use of mobile device: usability challenges while navigating various interfaces", Behaviour & Information Technology, 2020.
8. Leung, McGrenere e Graf, "Age-related differences in the initial usability of mobile device icons", Behaviour & Information Technology, 2011.
9. Lei nº 13.709/2018 (LGPD). planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
10. Goddard, Roudsari e Wyatt, "Automation bias: a systematic review", JAMIA, 2012.

Limites de cada fonte: `backend/pesquisa/output/00-consolidado.md` (itens [2], [4], [5], [6], [13], [17], [18], [19], [22] e [24] de lá).
