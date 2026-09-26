# Roteiro Final: H8 a H10

O código cobre até a H7: o motor da vila integrado ao painel, a leitura antes × depois e o botão "Carregar resultado salvo" (plano B). As etapas H8, H9 e H10 são ações do time:

## Antes de tudo: o plano B
1. Com as telas oficiais do M4 em `telas/`, rode uma simulação real e grave o plano B:
   `python -m vila.motor --vila --telas A=telas/A.png B=telas/B.png C=telas/C.png --salvar-demo`
2. Confira no painel: "Ou carregue um resultado salvo" → `demo.json` → "Carregar resultado salvo".
3. Faça commit do `resultados/demo.json`: é ele que o link publicado e a demo ao vivo vão mostrar se a API falhar.

## H8: Publicar o link no Streamlit Community Cloud
1. Suba o projeto `vila-de-personas` (motor do M1 e painel) para o repositório no GitHub, com o `resultados/demo.json`.
2. Acesse [share.streamlit.io](https://share.streamlit.io/) e faça login.
3. Clique em **New app** e selecione o repositório, a branch e o arquivo `app.py`.
4. **Não coloque a chave no link público.** Sem chave, o painel abre normalmente e a banca vê o resultado salvo pelo botão "Carregar resultado salvo"; ninguém gasta o limite da Groq do time. A simulação ao vivo roda só no notebook de vocês, com a chave no `.env`.
   - Se o time decidir pôr a simulação ao vivo no link, a chave vai em **Advanced settings → Secrets** como `GROQ_API_KEY = "..."`, nunca no código.
5. Clique em **Deploy**.
6. **Teste:** abra o link numa janela anônima e no celular. Confira o aviso fixo e o botão "Carregar resultado salvo".

## H9: Prints e Vídeo (com o M4)
1. **Prints:** tire 4 a 6 capturas da tela. Sugestões de momentos:
   - Tela de Entrada (upload das imagens A e B e tarefa preenchida).
   - Tela 2 com a Vila de IA processando.
   - Os resultados comparando o "Antes" e o "Depois".
   - A tela de "Revisão Humana e registro".
2. **Vídeo:** grave a tela demonstrando a simulação em até 2 minutos.
   - *Atenção:* a chave da API e qualquer dado real **não** podem aparecer.
   - Publique no YouTube como **Público** (o guia exige vídeo público) e teste o link sem estar logado.

## H10: Ensaio para a Apresentação
1. Ensaie o pitch completo: **4 minutos**, com cerca de **75 segundos de demo** dentro dele (roteiro da demo em `docs/roteiro-demo.md`).
2. *Contingência:* deixe o vídeo aberto numa aba e o `demo.json` pronto no botão "Carregar resultado salvo". Se a internet ou a API falharem, use um dos dois.

**Fala da demo (sugestão, cerca de 75 s; os números entre colchetes só entram depois de medidos):**
> "Queremos ajudar designers e POs a avaliar uma mudança de tela antes de levá-la a clientes. A Vila de Personas usa IA para simular como perfis diferentes de cliente tentariam a mesma tarefa em duas versões da tela. Aqui, comparamos as versões A e B da tarefa 'agendar um Pix que se repete todo mês'. A vila aponta que [PERSONA] travaria na B, em [ONDE TRAVOU, como saiu na simulação oficial]. Isso é uma hipótese, não um resultado: o PO decide levar esse ponto ao teste com pessoas reais, e a decisão fica registrada. No teste com [N] pessoas, a vila acertou [X] dificuldades, deixou passar [Y] e apontou [Z] que as pessoas não tiveram. Uma rodada da vila levou [TEMPO DA VILA]."
