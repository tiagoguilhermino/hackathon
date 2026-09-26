# Telas oficiais A, B e C

Prints da tela **"Confirmar Pix"** do frontend do banco fictício **Lume** (`Frontend/itau-hackathon-bank-main`, commit `501b152` do Iury), no formato de celular: 390 × 844 pontos, em dobro de resolução (780 × 1688 px).

| Versão | O que muda (só a opção de repetir) |
|---|---|
| A | "Repetir todo mês" fica escondido no botão ⋯ ("Mais opções"), fechado |
| B | só um ícone de repetir, sem texto |
| C | cartão "Deseja automatizar? Repita este mesmo valor todos os meses." com o botão "Repetir todo mês" |

Tudo o mais é igual nas três: destinatário Ana Paula Souza (Banco Lume), R$ 250,00, botão "Confirmar e Enviar".

## Como foram geradas

`capturar_telas.py` abre o frontend (`npm run dev -- --port 5174`), segue Pix → Fluxo 1 → Ana Paula Souza → Revisar Transação → Versão A/B/C e tira o print. Antes do print, ele:

- **esconde a barra "Modo de Teste da Vila"**, que mostra "Versão A/B/C" e o nome do Itaú e entregaria o experimento para a IA e para as pessoas;
- **deixa a janela do Pix em tela cheia**, como num celular;
- **na versão B, pinta o ícone com a cor de destaque do app.** No frontend o ícone está branco sobre branco (`text-accent-foreground` em `bg-surface`), ou seja, invisível. **Para corrigir no frontend:** no botão com `aria-label="Repetir este Pix"`, trocar `text-accent-foreground` por `text-accent`.

O script confere que nenhum destes termos aparece na tela: "Versão", "Hackathon", "Itaú", "Modo de Teste", "Variação".

Para refazer, com o frontend rodando e o Playwright instalado (`pip install playwright` e depois `python -m playwright install chromium`):

```bash
python telas/capturar_telas.py telas
```

As mesmas imagens servem para a vila **e** para o teste com pessoas (teste do primeiro clique), para que as duas comparações usem exatamente as mesmas telas.
