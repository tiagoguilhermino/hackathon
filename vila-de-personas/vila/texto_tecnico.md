# Texto técnico para a ficha e os slides (H9)

Rascunho do M1 para o M3 (ficha) e o M4 (slides). Escrito para quem não é técnico.
Os trechos entre colchetes são números que **só entram depois de medidos** (saem de
`python -m vila.comparacao resumo`, em `resultados/numeros-finais.md`). Não arredondar a favor.

## Como a IA funciona (bloco 3, P2)

A vila usa um modelo de IA que entende imagens (Qwen3.8 27B, acessado pela API da Groq; o nome
exato fica gravado em cada simulação). Para cada persona, o
sistema junta o cartão dela (idade, familiaridade com tecnologia, onde usa o celular, acessibilidade,
objetivo e medo) com a imagem de uma tela e uma tarefa, como "agendar um Pix que se repete todo mês".
No papel dessa persona, a IA diz onde tocaria, passo a passo, onde hesitaria ou desistiria e qual
texto da tela guiou cada decisão, sempre no mesmo formato. Ela vê só a imagem, não o aplicativo, e
não recebe a resposta certa. Como as respostas variam, cada persona tenta 3 vezes cada versão; o
painel mostra quantas vezes ela concluiu (por exemplo, "concluiu 2 de 3") e onde mais travou. As
[NÚMERO DE TENTATIVAS] tentativas rodam uma de cada vez (limite do plano gratuito da Groq) e levaram
[TEMPO MEDIDO].

## Principal risco e controle (bloco 5, P4)

O principal risco é tratar a vila como se fosse gente de verdade: a IA pode apontar problemas que as
pessoas não têm (alarmes falsos), deixar passar problemas reais (pontos cegos) e reduzir pessoas a
estereótipos. Os controles: todo resultado leva o rótulo SIMULAÇÃO e a vila só sugere; quem decide o
que vai ao teste com pessoas é o designer ou o PO, e a decisão fica registrada. Medimos a vila contra
um teste com [N] pessoas: [X] acertos, [Y] pontos cegos e [Z] alarmes falsos. O prompt foi congelado
antes desse teste e nunca ajustado para acertar o resultado esperado. Cada simulação registra modelo,
versão do prompt, horário, telas e personas, para poder ser auditada e refeita. Usamos só telas
fictícias, nenhum dado de cliente, e a chave da IA fica fora do código.

## O que a vila não faz

- Não substitui o teste com pessoas: ajuda a escolher o que levar a ele.
- Não aprova design: quem decide é o designer ou o PO.
- Não vê dado real: só imagens de telas fictícias e personas fictícias.

## Versão curta para o WhatsApp

*Como a IA funciona:* a vila mostra a imagem da tela e a tarefa para uma IA que entende imagens
(Qwen3.8 27B, pela API da Groq), no papel de cada persona. Ela diz onde tocaria, onde hesitaria e qual texto da tela
guiou a decisão. Cada persona tenta 3 vezes cada versão; o painel mostra "concluiu X de 3" e onde
travou. A simulação completa levou [TEMPO MEDIDO]. A IA não recebe a resposta certa.

*Risco e controle:* o risco é confiar na vila como se fosse gente. Por isso: rótulo SIMULAÇÃO em tudo,
decisão sempre humana e registrada, prompt congelado antes do teste com pessoas, comparação medida
com [N] pessoas ([X] acertos, [Y] pontos cegos, [Z] alarmes falsos), registro de modelo, prompt,
horário, telas e personas, e nenhum dado real.
