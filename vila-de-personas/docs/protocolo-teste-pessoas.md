# Protocolo do teste com pessoas (1 página)

**Objetivo:** ver onde pessoas reais travam nas **mesmas** telas A, B e C que a vila avaliou, para contar os acertos, os pontos cegos e os alarmes falsos da vila (Passo 9). O M4 conduz e o M3 anota.

**Quem:** de 3 a 5 pessoas **de fora do time** (outros times, mentores). Antes, faça 1 piloto com outra pessoa: o piloto **não entra** nas notas. Não anote nome, só P1, P2, P3…

**Material:** as imagens `telas/A.png`, `B.png` e `C.png` no celular, em tela cheia (abra a imagem e gire o brilho para o máximo), e um cronômetro no outro celular. **Não mostre a vila nem o resultado dela antes.**

## Roteiro (cerca de 5 minutos por pessoa)

1. **Combinar (fale assim):** "Estamos testando uma tela fictícia de um banco inventado, não você. Não existe resposta errada. Não vamos anotar seu nome. Pode parar quando quiser. Tudo bem?" Só siga com um sim.
2. **A frase, igual para todos, uma vez por tela:** *"Onde você tocaria para que este Pix se repita todo mês?"*
3. **Ordem:** P1, P3 e P5 veem A, depois B. P2 e P4 veem B, depois A. A **C** vem sempre por último, se der tempo, porque o botão dela entrega a resposta.
4. **Cronômetro:** comece quando terminar a frase. Pare no primeiro toque em que a pessoa diz "é aqui", ou quando ela desistir, ou aos 60 s.
5. **Depois do toque, pergunte:** *"O que você espera que aconteça agora?"*
6. **Não ajude, não aponte e não explique**, nem se a pessoa perguntar. Responda "faça como faria em casa".
7. No fim: "O que foi mais difícil?" Anote a resposta em `comentario`.

## O que anotar: uma linha por pessoa e tela

Use exatamente estas colunas, nesta ordem (é o cabeçalho de `dados/notas_teste.csv`):

`participante;versao;ordem;achou;primeiro_toque;tempo_s;dificuldade;comentario;duracao_sessao_min`

| Coluna | Como preencher |
|---|---|
| `participante` | P1, P2… (nunca o nome) |
| `versao` | A, B ou C |
| `ordem` | 1 para a primeira tela que a pessoa viu, 2 para a segunda… |
| `achou` | **sim** só se tocou no elemento certo (A: o ⋯; B: o ícone de setas; C: "Repetir todo mês") **e**, na pergunta do item 5, disse que espera repetir ou agendar. Tocou no certo "para ver o que tem"? Anote **não** e escreva "chute" no comentário. É a mesma regra da vila: "achar que deve estar em algum lugar não é concluir". |
| `primeiro_toque` | onde tocou primeiro, com o texto da tela ("Confirmar e Enviar R$ 250,00", "⋯", "seta de voltar") |
| `tempo_s` | segundos até o toque em que disse "é aqui" (ou até desistir; no máximo 60) |
| `dificuldade` | onde travou, com o texto da tela ("não viu o ⋯", "não entendeu o ícone de setas"); **vazio** se não travou |
| `comentario` | o que a pessoa disse, com as palavras dela, curto |
| `duracao_sessao_min` | minutos da sessão inteira da pessoa (igual em todas as linhas dela) |

**Planilha:** no Google Sheets, cole o cabeçalho acima na linha 1 (Dados → Dividir texto em colunas → ponto e vírgula) e compartilhe com o M1. No fim: Arquivo → Fazer download → CSV, salvando por cima de `dados/notas_teste.csv`.

## Regras

- Mesma frase, mesmas telas e mesmo prompt da vila (`v-final`) para todos. Nada muda no meio do teste.
- Nenhum dado pessoal: sem nome, telefone, e-mail ou foto do rosto.
- Um resultado contra a ideia do time **também é resultado**: anote como aconteceu.
- Na apresentação, diga quantas pessoas participaram: 3 a 5 pessoas ajudam a aprender, mas não representam todos os clientes.
