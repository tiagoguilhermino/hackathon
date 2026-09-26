# Pesquisa de evidências · Vila de personas (Case C)

Instruções para quem (pessoa ou agente de IA) rodar a pesquisa desta pasta.

## Recorte do time

> **Frase-guia (PROVISÓRIA, escrita pelo M1 até o M3 mandar a versão aprovada):**
> Queremos ajudar **designers e POs de apps de banco** a **escolher qual versão de uma tela levar ao teste com pessoas reais**,
> quando **precisam comparar alternativas de tela em poucas horas**, porque hoje **cada rodada de teste com usuários leva dias
> e muitos problemas de uso só aparecem depois do lançamento**. Saberemos que ajudamos se **a vila apontar, antes do teste com
> pessoas, parte das dificuldades que as pessoas reais encontram, em minutos em vez de dias, sem esconder o que ela erra**.

Tarefa usada no protótipo: "agendar um Pix que se repete todo mês" (telas fictícias A, B e C do M4).

### Temas desta rodada (sugeridos no plano do time)

| # | Tema (slug) | Pergunta de pesquisa |
|---|---|---|
| 01 | `usuarios-sinteticos-limites` | O que se sabe sobre usar IA (LLMs) como usuários sintéticos ou personas simuladas para avaliar interfaces? Onde acertam e onde falham? |
| 02 | `teste-usabilidade-tempo-custo` | Quanto tempo e quanto custa uma rodada de teste de usabilidade com pessoas? Quantos participantes bastam? Quanto custa achar um problema de uso depois do lançamento? |
| 03 | `personas-no-produto` | Como times de produto usam personas no design? Funcionam? Quais as críticas (estereótipo)? Como considerar idosos, baixa visão e baixa familiaridade digital em apps de banco? |
| 04 | `teste-primeiro-clique` | O que a pesquisa diz sobre o teste do primeiro clique, funções escondidas em menus ("Mais opções") e ícones sem texto × ícones com texto? |
| 05 | `governanca-agentes` | Como governar ferramentas de IA/agentes: humano no controle, rastreabilidade, rotular conteúdo simulado; diretrizes relevantes no Brasil e fora? |

## Regras

1. **Nada inventado.** Toda afirmação tem fonte com link que foi aberto e lido. Se não conseguiu abrir, não entra.
2. **Tipo de cada item** (só `EVIDÊNCIA` vira fato no slide):
   - `EVIDÊNCIA`: resultado de estudo com método descrito (artigo revisado por pares, relatório com amostra e metodologia, dado oficial), conferido na fonte primária.
   - `INDÍCIO`: dado sem método claro, estudo de caso, relato de empresa ou fornecedor, preprint ainda não revisado.
   - `OPINIÃO`: texto de opinião, post de blog, guia de boas práticas sem dados.
3. **Paráfrase, não cópia.** Citação literal só se indispensável, com menos de 15 palavras e entre aspas.
4. **Diga o que a fonte não sustenta.** Todo item tem a linha "O que NÃO sustenta".
5. **Sem dado interno** de banco nenhum, nem nomes de pessoas entrevistadas.
6. **Números como estão na fonte**, com unidade, ano e amostra. Sem arredondar a favor.

## Saídas

- `output/0N-<tema>.md`: um arquivo por tema (itens numerados, tipo, fonte, o que sustenta e o que não sustenta).
- `output/00-consolidado.md`: as evidências mais fortes de todos os temas, numeradas `[n]`, para o M3 ler no celular.
- `output/00-revisao.md`: revisão independente do consolidado. Termina com `Veredito: APROVADO` ou `Veredito: REPROVADO`.

Antes de rodar uma nova rodada, arquive a anterior (senão o consolidador mistura os temas):

```bash
mkdir -p output/rodada-1 && mv output/0*.md output/rodada-1/
```
