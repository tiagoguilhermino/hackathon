# Pendências do time e plano da gravação

> Escrito em 26/09/2026, por volta das 21h30 (horário de Brasília), depois de o Claude fazer a parte de M1, M2, M3 e M4 que não depende de pessoas. Tudo abaixo depende de **vocês**: gente real, contas de vocês ou decisões do time.

## 1. O que já está pronto no repositório

| Quem | O que | Onde |
|---|---|---|
| M1 | Vila com a IA de verdade, prompt `v-final` congelado, simulação oficial (36 tentativas, 0 falhas, 1.195 s) salva como `demo.json` | `vila-de-personas/resultados/demo.json` |
| M1 | Comparação com pessoas testada com o `demo.json` real. Corrigido: a vila escreve o mesmo problema com várias frases (13 frases nas telas A e B), e cada frase virava um "alarme falso". Agora dá para marcar `repetida` na conferência | `vila/comparacao.py`, Passo 9 do `STATUS-E-PASSO-A-PASSO.md` |
| M1 | Contrato de dados 1.1 conferido contra o código: modelos, campos e `simular_vila` batem | `vila-de-personas/docs/contrato-de-dados.md` |
| M2 | Painel testado de ponta a ponta num navegador: carregar o `demo.json`, A × B, B × C e salvar uma decisão. Horário do registro fixado em Brasília (o Streamlit Cloud roda em UTC e mostraria 3h a mais no vídeo) | `app.py`, `painel/decisoes.py` |
| M2/M4 | Roteiro do vídeo (2:00) e da demo ao vivo (75 s) com o resultado **real**. O roteiro antigo falava de "persona que piorou na B", o que não aconteceu | `vila-de-personas/docs/roteiro-demo.md` |
| M3 | Rascunho da Ficha do Produto: press release com 144 palavras (o Guia pede 100 a 150), 5 perguntas e respostas e 10 fontes do consolidado. Cabe em 2 páginas. Faltam só os números do teste com pessoas | `vila-de-personas/docs/ficha-do-produto.md` |
| M4 | Protocolo do teste com pessoas (1 página), com a mesma regra de "concluiu" da vila, e o cabeçalho exato da planilha | `vila-de-personas/docs/protocolo-teste-pessoas.md` |

### Novo (26/09, ~23h): laboratório multiagentes em Next.js

A especificação "sistema multiagentes para testes de usabilidade" foi implementada em `vila-lab/`, com os 4 módulos testados no navegador:
- `/lab`: base sintética com proporção configurável e agentes navegando no app do banco fictício, com `data-action-id` e árvore de acessibilidade;
- `/dashboard`: gráficos por segmento, agente analista, agente designer e revisão humana registrada.

**Atualização (27/09, manhã):** o time escolheu o app do Victor (`victor-llm`, com a IA de verdade) como base do laboratório. Ele foi juntado à vila em `itau-ux-lab/`: banco fictício Lume, Pix que se repete todo mês nas versões A/B/C, comparação antes × depois, decisão humana registrada e `npm run verificar`. Como rodar: [itau-ux-lab/README.md](itau-ux-lab/README.md). O `vila-lab/` fica como referência.

A IA está **simulada** por padrão; a Groq está pronta, mas não foi testada aqui. Como rodar e como adaptar ao frontend novo: `vila-lab/README.md`. A avaliação completa (case, dicas dos mentores e qual motor usar no vídeo) está em [AVALIACAO-E-PLANO-FINAL.md](AVALIACAO-E-PLANO-FINAL.md). **Antes de gravar, decidam o motor do vídeo (seção 5 da avaliação).**

## 2. O que só vocês podem fazer (em ordem)

| # | Quem | Tarefa | Tempo | Pronto quando |
|---|---|---|---|---|
| 1 | Raphael | **Frontend novo: decidir se as telas mudam.** Veja o quadro "Frontend novo" logo abaixo | 10 min | decisão tomada |
| 2 | M3 + time | **Frase-guia.** Aprovar ou trocar a da proposta (está no `vila-de-personas/AGENTS.md`, linha "Recorte"). Depois peçam ao Claude: "troque o Recorte por: <frase>" | 10 min | frase no AGENTS.md |
| 3 | M3 + time | **Personas.** Aprovar as 4 atuais (`dados/personas.json`, marcadas `provisoria-m1`). Recomendo aprovar como estão: a simulação oficial usou estas. Mudar = rodar a simulação de novo | 5 min | aprovadas |
| 4 | M3 | **Conversas com itubers.** Criar `input/conversas.md` com quantas pessoas, o cargo (sem nome) e o que disseram, principalmente "quanto tempo leva uma rodada de teste com usuários". Sustenta a P1 da ficha. Se não houver conversa, a ficha diz que é hipótese | 15 min | arquivo criado |
| 5 | M4 conduz, M3 anota | **Teste com 3 a 5 pessoas** de fora do time, seguindo `docs/protocolo-teste-pessoas.md`. Antes, 1 piloto que não conta | 1 h | notas na planilha |
| 6 | M1 | **Comparar** (Passo 9): baixe a planilha como CSV sobre `dados/notas_teste.csv`, rode `python -m vila.comparacao parear --sim resultados/demo.json`, confira **cada linha** com M3 e M4 (use `repetida` para frases diferentes do mesmo problema) e rode `python -m vila.comparacao resumo --sim resultados/demo.json`. O Claude pode montar o CSV e sugerir a conferência, mas quem marca `ok` são vocês | 30 min | `resultados/numeros-finais.md` |
| 7 | M1 + M3 | **Números nos textos:** trocar [N], [X], [Y], [Z] e [TEMPO MEDIDO] no `vila/texto_tecnico.md`, na ficha e no roteiro. Pode pedir ao Claude: "preencha com o numeros-finais.md" | 15 min | nenhum colchete sobrando |
| 8 | M2 | **Publicar o link** no Streamlit Community Cloud (conta de vocês): passo a passo em `docs/publicacao.md`. Antes, esta branch (`claude/magical-pasteur-pcmsly`) precisa ir para a `main` do repositório de onde o app publica (hoje o passo a passo aponta `tiagoguilhermino/hackathon`) | 20 min | link abre numa janela anônima e no celular |
| 9 | M2 grava, M4 narra | **Gravar o vídeo** (seção 3 abaixo) e publicar no YouTube como **Público** | 45 min | link abre sem login |
| 10 | M3 | **Ficha final:** colar `docs/ficha-do-produto.md` no Google Docs, apagar o bloco de rascunho, conferir 2 páginas, exportar para `vila-de-personas/docs/ficha-do-produto.pdf` | 20 min | PDF no GitHub |
| 11 | M4 | **Slides** (até 10, os 6 blocos do Guia) com os prints da seção 4 do roteiro | 1 h | PDF |
| 12 | Todos | **Checklist e envio** (Passo 14 do STATUS), `git tag v-final` e ensaio do pitch (Passo 15) | 40 min | confirmação de recebimento |

### Frontend novo: o que muda

As telas `telas/A.png`, `B.png` e `C.png` saíram do frontend atual, e a simulação oficial e o teste com pessoas precisam usar **as mesmas** imagens.

- **Se a tela "Confirmar Pix" não mudar:** mantenham as telas atuais. Nada a refazer.
- **Se mudar** (cores, textos, posição): refazer os prints (`python telas/capturar_telas.py telas`, veja `telas/LEIA-ME.md`) e rodar a simulação oficial de novo **no computador de vocês**, com a chave no `.env`: `python -m vila.motor --vila --telas A=telas/A.png B=telas/B.png C=telas/C.png --salvar-demo` (cerca de 20 min e 96 mil tokens). Façam isso **antes** do teste com pessoas.
- **Conferir na versão nova:**
  - as telas usam laranja com azul-marinho, que lembra as cores do Itaú, e a regra do time proíbe as cores. Decidam se trocam;
  - a lista de contatos traz bancos reais (Itaú Unibanco, Nubank, Bradesco, Santander) e existe a barra "Modo de Teste da Vila (Hackathon Itaú)". Não aparecem nas telas A, B e C, mas não podem aparecer em print nem no vídeo.

## 3. Amanhã: gravação do vídeo

**Antes de gravar (15 min)**
- [ ] Decidir onde gravar. O link público, se já estiver no ar, mostra que o app funciona. Se não estiver, use o app no notebook (`streamlit run app.py`).
- [ ] Navegador em tela cheia, zoom de 110% a 125%, sem abas, favoritos nem notificações. Nenhum terminal nem `.env` aberto.
- [ ] Ler o roteiro (`vila-de-personas/docs/roteiro-demo.md`, seção 1) em voz alta uma vez, com cronômetro. Alvo: 1:50.
- [ ] Escolher a fala final: com o teste com pessoas feito, use os números do `numeros-finais.md`. Sem o teste, use a frase da limitação. Nenhum número inventado.

**Gravar (20 min):** duas ou três tomadas; fica a melhor. Siga a tabela do roteiro: entrada → carregar resultado salvo → A × B (sinal fraco) → decisão do PO → B × C (melhorou) → limitação.

**Publicar (10 min):** cortar só as pontas, exportar em 1080p e subir no YouTube como **Público**, com o título "Vila de Personas · protótipo de hackathon (Hackathon Itaú 2026, Case C)". Testar numa janela anônima.

**Checklist do vídeo:** seção 6 do `roteiro-demo.md`.

## 4. Segurança

- **27/09: chaves da Groq no código do laboratório.** Por decisão do time, as chaves gratuitas (3) ficam em `itau-ux-lab/src/lib/llm/keys.ts`, porque o repositório é privado. **Antes de deixar o repositório público ou mandar o link do código para a banca, apaguem as chaves desse arquivo e revoguem todas** em console.groq.com (o Guia pede "sem segredos" nos materiais públicos). A chave não aparece no vídeo nem nos prints: só o servidor a usa.

- **Chave da Groq colada no chat:** ela não foi gravada em nenhum arquivo do repositório. Como passou pelo chat, **revoguem e gerem outra** em console.groq.com depois do hackathon. A nova fica só no `.env`.
- **Chave do Devin** (item 0.1 do STATUS): confirmem se já foi revogada. Ela continua no histórico do git.
- **Ambiente do Claude na nuvem:** a rede deste ambiente bloqueia `api.groq.com`. Para o Claude rodar simulações aqui, adicionem esse domínio em *Network access* nas configurações do ambiente. Para a demo não faz falta: ela usa o `demo.json`.
