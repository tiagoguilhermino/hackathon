# Roteiro Final: H8 a H10

Como um agente de Inteligência Artificial, eu implementei e estruturei o código até a etapa H7 (incluindo o motor integrado para as etapas H5 a H7). As etapas finais H8, H9 e H10 envolvem ações externas que você, como usuário, precisará coordenar. Aqui está o plano de ação:

## H8: Publicar o link no Streamlit Community Cloud
1. Suba todo o projeto `vila-de-personas` (agora com o motor do M1 e o painel unificado) para o seu repositório no GitHub.
2. Acesse [share.streamlit.io](https://share.streamlit.io/) e faça login.
3. Clique em **New app** e selecione o repositório, branch e o arquivo `app.py`.
4. Em **Advanced settings**, adicione as variáveis de ambiente necessárias, como `ANTHROPIC_API_KEY` (se for rodar ao vivo) e defina `VILA_MODO_DEMO=1` caso queira rodar apenas com o JSON de contingência.
5. Clique em **Deploy**.
6. **Teste:** Abra o link em uma janela anônima e no celular para garantir que está funcionando.

## H9: Prints e Vídeo (com o M4)
1. **Prints:** Tire 4 a 6 screenshots da tela. Sugestões de momentos:
   - Tela de Entrada (upload das imagens A e B e tarefa preenchida).
   - Tela 2 com a Vila de IA processando.
   - Os resultados comparando o "Antes" e o "Depois".
   - A tela de "Revisão Humana e registro".
2. **Vídeo:** Grave a tela demonstrando a simulação em menos de 2 minutos. 
   - *Atenção:* Certifique-se de que a chave da API (ou qualquer dado real) **NÃO** apareça.
   - Envie o vídeo para o YouTube como não listado ou público.

## H10: Ensaio para a Apresentação
1. Ensaie sua apresentação ao vivo com base no vídeo gravado.
2. O pitch deve durar cerca de **75 segundos**.
3. *Contingência:* Deixe o vídeo já aberto numa aba; caso a internet ou o ambiente Streamlit falhem na hora, é só apertar play no vídeo!

**Roteiro do Pitch (Sugestão):**
> "Queremos ajudar designers e POs a avaliarem as mudanças de tela antes de levá-las para os clientes reais. Criamos a 'Vila de Personas', que usa IA para simular perfis usando a nova interface. Em vez de demorar dias, temos feedback apontando as fricções em minutos! Aqui, simulamos a versão atual contra a nova (B) para a tarefa 'Agendar Pix Mensal'. Nossa simulação mostra que a versão nova reduz as hesitações, então o PO aprova a mudança para o teste final com usuários reais. Isso poupa tempo, dinheiro e evita retrabalho desnecessário!"
