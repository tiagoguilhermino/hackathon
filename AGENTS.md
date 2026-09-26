# Constituição do projeto

> Fonte única das regras. O Antigravity lê este arquivo direto; o Claude Code lê via `CLAUDE.md`, que só importa este aqui.
> Limite do Antigravity: 12.000 caracteres por arquivo de regra. Se crescer, mova um bloco para `.agents/rules/<nome>.md` e importe o mesmo arquivo no `CLAUDE.md` (`@.agents/rules/<nome>.md`). Nunca copie a mesma regra para dois arquivos.

## 01 · Projeto e objetivo

- **Projeto:** Hackathon Itaú 2026 (Programa de Estágio, 26 e 27/09/2026), time de 4 pessoas, **Case C · Jornada de agentes**: como uma squad orientada por IA entrega valor ao cliente mais rápido sem perder qualidade, governança e as decisões humanas que importam.
- **Objetivo dos agentes:** levantar e conferir evidências (dados, estudos, benchmarks, regras) que sustentem o recorte, a solução e os riscos do time. É matéria-prima para a apresentação e a Ficha do Produto. Os agentes não escolhem o recorte nem a solução.
- **Entregas do time:** protótipo ou MVP com uma tarefa completa (entrada, ação, resultado); até 10 slides; demo narrada de até 2 min no YouTube; Ficha do Produto de até 2 páginas (mini press release + 5 perguntas e respostas).
- **Recorte do time:** PREENCHA quando o time decidir, no formato "Queremos ajudar [pessoa] a [tarefa], quando [situação], porque hoje [dificuldade]. Saberemos que ajudamos se [mudança observável]."
- **Referência:** Guia dos Participantes, em `input/` (é a fonte `[PRIMÁRIA]` para regras do evento).

## 02 · Escopo

- **É nosso:** o Case C, focado em **um** ponto da passagem de uma demanda na squad (entendimento, priorização, construção, teste ou aprovação), não no fluxo inteiro.
- **Não é nosso:** Cases A e B; conectar a solução a sistemas reais do banco; aprovar mudança de produção automaticamente.
- **Decisão do time, nunca dos agentes:** escolher pessoa, dor, tarefa e solução; o que entra nos slides e na ficha; o que se afirma como resultado.
- Assunto fora do escopo vira uma linha em Lacunas ("fora do escopo") e o trabalho segue.

## 03 · Regras de diretório

| Pasta | Quem escreve | Regra |
|---|---|---|
| `input/` | só o usuário | guia do evento, anotações de conversas e testes do time, insumos dos colegas. Agente só lê. |
| `pdf/` | só o usuário | fontes que o agente não conseguiu baixar e o usuário pôs aqui. É fonte, não cache. |
| `scripts/` | só o usuário | agente executa, nunca edita. |
| `output/` | só agentes | um arquivo por agente, nome fixo (seção 05). |
| `compartilhado/` | usuário, ou agente principal quando o usuário pedir | fonte única dos agentes e skills das duas ferramentas. |
| `.claude/`, `.agents/` | só o script de sincronização | gerados a partir de `compartilhado/`. Nunca editar à mão. |

- ESCRITA: durante o pipeline, exclusivamente em `./output/`.
- LEITURA: livre no repositório.
- `./input/` e `./pdf/` são só leitura. Precisa transformar um arquivo de `input/`? O resultado vai para `output/` e o original fica intacto.
- Downloads vão para a pasta temporária do sistema, nunca para dentro deste repositório.
- Fora do pipeline, o agente principal só edita `AGENTS.md` e `compartilhado/` quando o usuário pedir, e em seguida roda `python3 scripts/sincronizar_agentes.py`.

## 04 · Regras de rigor

1. Toda afirmação carrega fonte.
2. Citação: `[n]` no texto + lista numerada em `## Fontes`.
3. Níveis de fonte, marcados em cada item de `## Fontes`:
   - `[PRIMÁRIA]` documento original: regulador ou órgão oficial, norma, estudo com dados próprios e método descrito, documentação oficial de uma ferramenta (para o que ela faz, não para o ganho que promete), o Guia dos Participantes (para regras do evento).
   - `[RELATÓRIO]` consultoria, estudo setorial, pesquisa de mercado, revisão que resume outros estudos.
   - `[IMPRENSA]` veículo jornalístico.
   - `[FORNECEDOR]` material de quem vende a solução, **inclusive empresa de IA falando de ganho com IA**, mesmo em formato de estudo. Nunca sustenta uma afirmação sozinho.
4. **Lacuna é resultado válido.** Não achou? Registre em `## Lacunas de verificação` o que falta e o que você tentou. Nunca invente, estime ou complete um dado para ter algo a entregar.
5. Trecho citado literalmente: no máximo 15 palavras, entre aspas.
6. Todo output de conteúdo (pesquisador e consolidador) tem `## Lacunas de verificação` e `## Fontes`. Sem exceção.
7. **Tipo de todo achado**, porque a banca avalia essa distinção:
   - `EVIDÊNCIA`: uma fonte verificável sustenta.
   - `HIPÓTESE`: suposição ainda não testada, inclusive opinião de especialista e previsão.
   - `SIMULAÇÃO`: vem de dado fictício ou de resultado simulado.
   Nunca promova hipótese ou simulação a evidência.
8. **Registre o limite:** o que a fonte realmente sustenta e o que ela não sustenta (amostra, país, setor, data, quem mediu).
9. Conversas e testes do time (anotações em `input/`): diga quantas pessoas participaram. Uma opinião ajuda a aprender, mas não representa todo o público.
10. Tudo aqui pode acabar em material público: só fontes públicas. Nada de informação interna do Itaú, dado pessoal real, senha ou chave.

## 05 · O pipeline

Três papéis. Os agentes não conversam entre si: eles se encontram no sistema de arquivos, e o nome do arquivo é o contrato.

| Arquivo | Quem escreve | Fase |
|---|---|---|
| `output/NN-<slug>.md` (NN de 01 a 99; slug em minúsculas-com-hífen) | `pesquisador`, uma instância por tema | 1 |
| `output/00-consolidado.md` | `consolidador` | 2 |
| `output/00-revisao.md` | agente principal, salvando o texto que o `revisor` devolveu | 3 |

O agente principal é o orquestrador.

**Fase 0 · plano.** Leia a seção 01 e os materiais em `input/`. Se o usuário não deu os temas, proponha a lista (NN, slug, pergunta de uma frase) e espere o OK antes de disparar a pesquisa. Temas de partida para o Case C, a adaptar ao recorte:

| Slug | Pergunta |
|---|---|
| `gargalos-squad` | Em que etapas (entendimento, priorização, construção, teste, aprovação) squads de produto mais perdem tempo ou geram retrabalho, segundo dados? |
| `ia-criterios-aceitacao` | O que estudos mostram sobre IA transformando demandas em critérios de aceitação: qualidade obtida e erros típicos? |
| `ia-testes` | Que ganhos e limites medidos existem no uso de IA para preparar casos de teste? |
| `ia-feedbacks` | Como a IA vem sendo usada para organizar feedbacks de clientes para investigação, e com que taxa de erro? |
| `governanca-agentes` | Que práticas definem quem aprova, como rastrear e onde manter revisão humana em agentes de IA (ex.: NIST AI RMF, ISO/IEC 42001)? |
| `regulacao-ia-bancos-br` | O que reguladores brasileiros exigem ou recomendam sobre uso de IA em bancos? |
| `medir-ganho-ia` | Como medir tempo, qualidade e retrabalho de um fluxo com IA sem confundir percepção com medida? |

**Fase 1 · pesquisa, tudo em paralelo.** Invoque todos os `pesquisador` numa mensagem só. No Claude Code: várias chamadas da ferramenta Agent na mesma resposta. No Antigravity: várias chamadas `invoke_subagent` de uma vez. Um por vez faz eles rodarem em fila e o ganho se perde. Cada chamada leva exatamente:

```
ARQUIVO: output/NN-<slug>.md
PERGUNTA: <uma frase>
FOCO: <opcional: recorte, período, fontes a priorizar>
```

**Fase 2 · consolidação.** Só depois que todos os `output/NN-*.md` existirem: liste a pasta e confira antes de chamar. Invoque o `consolidador`.

**Fase 3 · revisão.** Invoque o `revisor` com `RODADA: N` (1 na primeira vez). Salve a resposta dele sem alterar nada em `output/00-revisao.md`. Leia uma linha só: a que começa com `ENCAMINHAMENTO:`.

**Loop de correção.** Decida pela primeira palavra depois de `ENCAMINHAMENTO:`.

| Primeira palavra | O que fazer |
|---|---|
| `APROVADO` | seguir para a próxima etapa do trabalho e avisar o usuário |
| `CONSOLIDADOR` | reinvocar o `consolidador` com `CORREÇÃO: itens <lista>`; depois, o `revisor` de novo com `RODADA: N+1` |
| `HUMANO` | parar e mostrar o motivo ao usuário: o dado não existe nos arquivos-base e precisa de pesquisa nova |

- Teto de três rodadas: na rodada 3 com falha não existe rodada 4. O revisor escala para `HUMANO`.
- Anti-regressão: a correção mexe só no que foi apontado. Reescrever o que já passou introduz erro novo.
- O agente principal nunca corrige o consolidado por conta própria, e o revisor nunca edita.

## 06 · Glossário

| Termo | Significado |
|---|---|
| Squad | equipe com competências diferentes trabalhando num mesmo objetivo de produto |
| Agente de IA | componente que recebe um objetivo e executa tarefas dentro de limites definidos, podendo usar ferramentas. Pode errar. |
| Governança | deixar claro quem pode fazer o quê, quem aprova e como verificar o que aconteceu |
| Revisão humana | ponto do fluxo em que uma pessoa aprova, corrige ou recusa a saída da IA antes de seguir |
| Critérios de aceitação | condições que ajudam a decidir se uma entrega atende ao pedido |
| Retrabalho | refazer algo por erro ou entendimento incompleto numa etapa anterior |
| MVP | versão pequena o bastante para construir no evento e útil o bastante para testar a hipótese central |
| Benchmark | comparação com alternativas que já existem |
| Evidência · Hipótese · Simulação | ver regra 7 da seção 04 |
| Ficha do Produto | PR/FAQ enxuto: mini press release (título + 100 a 150 palavras) e 5 perguntas e respostas |
| Banca | avaliadores. Competências: Resolução de Problemas, Centralidade no Cliente, Uso Crítico de IA, Dados, Escalabilidade, Gestão de Risco, Colaboração, Storytelling |
| Bloco 1–6 | os seis blocos da apresentação: 1 time, case e dor · 2 evidências · 3 solução e jornada · 4 o que foi construído e testado · 5 métrica, risco e escala · 6 próximos passos |
| P1–P5 | as cinco perguntas da Ficha: 1 para quem e por quê · 2 como funciona e onde entra a IA · 3 o que foi testado · 4 principal risco · 5 como saber se ajudou |
