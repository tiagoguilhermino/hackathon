# Roteiro da demo e da gravação

Tudo aqui usa o resultado **real** da simulação oficial (`resultados/demo.json`, 26/09/2026 20:37, 36 tentativas, 0 falhas):

| Comparação | O que o painel mostra | Leitura |
|---|---|---|
| A × B | as 4 personas concluíram 0 de 3 na A **e** 0 de 3 na B | 🟡 sinal fraco para todas (as duas versões escondem a opção) |
| B × C | 0 de 3 na B, 3 de 3 na C, para as 4 | 🟢 melhorou para todas |

Ninguém "piorou" na B. Não diga que piorou: a história é "nem A nem B funcionaram; a C, sim, **na simulação**".

## 1. Vídeo narrado (até 2:00, público no YouTube)

O Guia pede: começar dizendo quem usa e o que quer fazer, percorrer o fluxo principal, mostrar o resultado e terminar com uma limitação ou com o que foi simulado. Alvo: **1:50**, para sobrar folga.

| Tempo | Na tela (quem grava clica) | Narração (quem fala lê) |
|---|---|---|
| 0:00–0:15 | Topo do painel, com o aviso "Protótipo de hackathon · resultados simulados · telas fictícias" | "Esta é a Vila de Personas, um protótipo de hackathon. Quem usa é o designer ou o PO de uma squad que mudou a tela de agendar um Pix que se repete todo mês e quer saber, antes do teste com pessoas, onde o cliente pode travar." |
| 0:15–0:30 | Seção "1 · Entrada": a tarefa, as 4 personas marcadas e as telas A e B lado a lado | "Escolhemos a tarefa, quatro personas de IA, descritas pelo jeito de usar o celular, e duas versões da tela. Na A, 'Repetir' fica escondido em 'Mais opções'. Na B, vira um ícone sem texto." |
| 0:30–0:45 | Abrir "Ou carregue um resultado salvo" → `demo.json · … · rodou com a IA` → "Carregar resultado salvo". Parar no aviso "Resultado salvo, não é ao vivo" e no rótulo SIMULAÇÃO | "Cada persona tenta três vezes cada versão. Para não esperar os 20 minutos, carregamos a simulação real que rodamos antes com a mesma IA: 36 tentativas." |
| 0:45–1:05 | Antes = A, Depois = B. Rolar pelas 4 personas: "concluiu 0 de 3" dos dois lados, "Travou em…" e 🟡 Sinal fraco | "Nenhuma persona concluiu em nenhuma das duas versões. Por isso o painel não diz que a B melhorou: é sinal fraco. As duas escondem a opção." |
| 1:05–1:25 | Seção "3 & 4": marcar **PO**, na Ana escolher "levar ao teste real", escrever o porquê e clicar "Salvar decisões". Mostrar o histórico | "A vila não decide. Como PO, levo esse ponto ao teste com pessoas e explico por quê. A decisão fica registrada: quem decidiu, qual simulação e o que a vila apontou." |
| 1:25–1:40 | Antes = B, Depois = C: "concluiu 3 de 3" e 🟢 Melhorou para as 4 | "O designer fez a versão C, com ícone e o texto 'Repetir todo mês'. Na simulação, as quatro personas concluíram as três vezes." |
| 1:40–1:55 | Voltar ao rótulo SIMULAÇÃO (ou abrir "Como ler este resultado") | Com o teste feito: "Isso é simulação, não evidência. No teste com [N] pessoas, a vila acertou [X] dificuldades, deixou passar [Y] e apontou [Z] que as pessoas não tiveram." Sem o teste: "Isso é simulação, não evidência: as quatro personas agiram igual, e o botão da C repete as palavras da tarefa. O próximo passo é conferir com pessoas reais." |

**Regras:** nenhum número que não esteja no `demo.json` ou no `numeros-finais.md`. Nenhuma chave, terminal ou `.env` na tela. Nada de marca do Itaú.

## 2. Demo ao vivo na banca (75 s, dentro do pitch de 4 min)

A mesma sequência, mais curta: pule a entrada (0:15–0:30) e fale só uma frase em cada passo. Deixe o painel aberto com o `demo.json` já carregado e o vídeo numa aba, como contingência.

| Passo | Tempo (s) |
|---|---|
| Quem usa e qual tarefa, com o aviso fixo na tela | 10 |
| Carregar resultado salvo e mostrar o rótulo SIMULAÇÃO | 10 |
| A × B: 0 de 3 nos dois, sinal fraco | 15 |
| Decisão do PO salva e o histórico | 15 |
| B × C: 3 de 3, melhorou | 10 |
| Limitação e o teste com pessoas | 15 |

## 3. Plano B

| Cenário | O que fazer |
|---|---|
| Internet cair | Com o app rodando no notebook, carregar o `demo.json` (funciona sem internet). Sem o app, usar o vídeo. |
| Erro 429 (limite da Groq) | Não tentar de novo ao vivo: carregar o `demo.json`. |
| Link público "dormindo" | Clicar em "Yes, get this app back up!" e esperar 1 a 2 minutos. Abra o link uns 10 minutos antes da banca. |
| O app não abrir | Ir direto para o vídeo. |

## 4. Prints (4 a 6, para os slides)

Navegador em tela cheia, zoom de 110% a 125%, sem abas, favoritos nem notificações.

| Arquivo | Tela | O que precisa aparecer |
|---|---|---|
| `print-01-entrada.png` | Seção 1 · Entrada | aviso fixo, tarefa, personas marcadas e telas A e B lado a lado |
| `print-02-a-b.png` | Seção 2, Antes = A, Depois = B | rótulo SIMULAÇÃO, "Resultado salvo, não é ao vivo", "concluiu 0 de 3" nos dois lados e 🟡 Sinal fraco |
| `print-03-decisao.png` | Seção 3 & 4 | PO marcado, "levar ao teste real", o comentário e o histórico com a decisão |
| `print-04-b-c.png` | Seção 2, Antes = B, Depois = C | "concluiu 3 de 3" e 🟢 Melhorou |
| `print-05-telas.png` (opcional) | `telas/A.png`, `B.png` e `C.png` lado a lado | as três versões, sem marca do Itaú |

## 5. Gravação

| Passo | Mac | Windows |
|---|---|---|
| Gravar | QuickTime → Arquivo → Nova Gravação de Tela, com o microfone ligado | Win+Alt+R (Xbox Game Bar) ou Clipchamp |
| Editar | iMovie: cortar só o começo e o fim | Clipchamp: cortar só o começo e o fim |
| Exportar | 1080p | 1080p |
| Publicar | YouTube → Criar → Enviar vídeo → visibilidade **Público** | igual |
| Testar | abrir o link numa janela anônima, sem login | igual |

Título sugerido: "Vila de Personas · protótipo de hackathon (Hackathon Itaú 2026, Case C)".

## 6. Checklist antes de publicar o vídeo

- [ ] Duração de 2:00 ou menos.
- [ ] Começa dizendo quem usa e o que quer fazer; termina dizendo o que é simulado.
- [ ] Aviso "Protótipo de hackathon · resultados simulados · telas fictícias" e rótulo SIMULAÇÃO visíveis.
- [ ] Nenhuma chave, `.env`, terminal, e-mail ou dado real na tela.
- [ ] Nenhum nome, logo ou cor do Itaú nas telas mostradas.
- [ ] Todo número dito está no `demo.json` ou no `numeros-finais.md`.
- [ ] Vídeo **público**, abrindo numa janela anônima.
