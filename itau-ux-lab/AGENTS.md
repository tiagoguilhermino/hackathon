<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# itau-ux-lab · laboratório da Vila de Personas

App Next.js do Victor (branch `victor-llm`) juntado à vila de personas em 27/09/2026. Agentes de IA com perfis sintéticos navegam no app de um banco fictício (**Lume**), e o time compara versões de uma tela antes de levá-la ao teste com pessoas. Como rodar e o que cada parte faz: `README.md`.

## Regras

- Valem as regras do produto da seção 03 de `../vila-de-personas/AGENTS.md`: aviso fixo, rótulo SIMULAÇÃO, tudo fictício, a vila não decide, sinal fraco não vira conclusão, prompt não calibrado para acertar, textos em português, números como medidos. Não copie essas regras para cá: mude lá.
- O nome do Itaú só aparece no aviso fixo (`src/components/common/PrototypeNotice.tsx`). As classes de cor `itau-*` são só nomes internos das cores do Lume; não use o nome em texto de tela, prompt ou dado.
- Chave da Groq só em `.env.local`, que o git ignora. Agentes não leem `.env.local`.
- Mudou o texto de um prompt? Suba a versão em `src/lib/agents/versions.ts` e acrescente a linha na tabela "Versões do prompt" do `README.md`.
- O agente navegador só vê a árvore de acessibilidade. Estado do app (`getState`) serve só para o avaliador saber se a tarefa foi cumprida.
- Antes de cada commit: `npm run verificar`, `npm run lint` e `npm run build`, todos sem erro.
