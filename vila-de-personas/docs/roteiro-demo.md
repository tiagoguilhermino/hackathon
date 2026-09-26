# Roteiro da Demo e Gravação

## 1. Sequência da demo (75 s)

| Passo | O que clicar | O que a tela deve mostrar | O que falar | Tempo (s) |
|---|---|---|---|---|
| 1. Início | [CONFERIR NO APP] | Tela inicial do painel com o aviso "Protótipo de hackathon". | "Nossa solução ajuda a equipe a testar fluxos com personas de IA para validar opções de tela." | 10 |
| 2. Escolher telas | [CONFERIR NO APP] para A e B | Preview das telas A e B e as personas listadas. | "Vamos comparar a versão atual A com a nova B. Para a demo, carregarei um resultado salvo." | 10 |
| 3. Simular / Carregar | [CONFERIR NO APP] (modo demo) | Resultados com o rótulo SIMULAÇÃO. Mostrar que o Seu Jorge piorou na B. | "A simulação rodou. Note que o Seu Jorge piorou na versão B e não concluiu a tarefa." | 15 |
| 4. Decisão | [CONFERIR NO APP] no card do Seu Jorge | Formulário de decisão preenchido marcando "levar ao teste real" e comentário. | "Como PO, marco 'levar ao teste real' para investigar o porquê com humanos, e salvo." | 15 |
| 5. Subir tela C | [CONFERIR NO APP] | Área para fazer upload e preview da versão C substituindo a A. | "Baseado no erro, o designer desenha a versão C. Subimos e comparamos a B com a C." | 10 |
| 6. Nova simulação | [CONFERIR NO APP] (modo demo) | Resultados de B × C mostrando a melhora geral. | "A nova simulação confirma que a versão C melhorou a experiência para todos." | 10 |
| 7. Fim | [CONFERIR NO APP] para salvar registro | Confirmação de registro salvo. | "Salvamos a decisão final. Lembrando que isso é uma simulação e não substitui os testes reais." | 5 |

**Tempo total:** 75 segundos.

## 2. Plano B

| Cenário | O que fazer |
|---|---|
| Internet cair | Usar o vídeo da demo (deixe-o previamente aberto em segundo plano como contingência). |
| Erro 429 na API | Clicar para usar os resultados salvos (modo demo) sem tentar re-rodar ao vivo. |
| O app não abrir | Tentar reiniciar, mas, se demorar, alternar imediatamente para o vídeo da gravação. |

## 3. Prints para o M4

| Nome do arquivo | Qual tela | O que precisa aparecer |
|---|---|---|
| `print-01-inicio.png` | Tela inicial de escolha A e B | Aviso de protótipo, telas e personas escolhidas. Zoom 110% a 125%. |
| `print-02-resultado-ab.png` | Tela de resultados A × B | Rótulo SIMULAÇÃO, resumo antes × depois e piora do Seu Jorge. Zoom 110% a 125%. |
| `print-03-decisao.png` | Formulário de decisão do PO | A marcação "levar ao teste real" e o comentário preenchidos. Zoom 110% a 125%. |
| `print-04-resultado-bc.png` | Tela de resultados B × C | Melhoria da tela C e botões para salvar o registro. Zoom 110% a 125%. |

## 4. Gravação

| Passo | O que fazer |
|---|---|
| 1. Gravar | Abrir QuickTime (Arquivo → Nova Gravação de Tela, ativar microfone). |
| 2. Editar | Importar no iMovie, fazer um corte simples nas pontas para remover pausas e ruídos. |
| 3. Exportar | Exportar o vídeo na resolução de 1080p. |
| 4. Publicar | Subir no YouTube, configurar a privacidade como Público. |
| 5. Testar | Copiar o link do vídeo e abrir em uma janela anônima para validar o acesso. |

## 5. Checklist antes de publicar

- [ ] **Tempo:** O vídeo deve ter, no máximo, 2:00 de duração.
- [ ] **Avisos:** "Protótipo de hackathon · resultados simulados · telas fictícias" está visível na tela inicial.
- [ ] **Rótulo SIMULAÇÃO:** Fica visível no painel durante a exibição dos resultados.
- [ ] **Segurança de dados:** `.env`, terminal e console da API fechados. Não há senhas, chaves, e-mails ou dados reais visíveis.
- [ ] **Marca:** Não aparece nenhuma logo ou marca oficial do Itaú nas telas.
- [ ] **Fechamento:** O final da fala deixa claro que o que foi visto é simulado (hipótese) e possui limitações.
