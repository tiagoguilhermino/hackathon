<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Regras do time para este app (Vila de Personas · Lab)

- Protótipo de hackathon: banco fictício, dados sintéticos. O aviso fixo e o rótulo SIMULAÇÃO aparecem em todas as páginas e em todo resultado.
- Todo clicável tem `data-action-id`; a transição fica em `src/lib/banco/estado.ts` e vale para o clique humano e para o agente.
- Números vêm de código (`src/lib/estatisticas.ts`, `src/lib/agentes/analista.ts`); a IA só interpreta. Resultado do modo simulado nunca é evidência.
- O agente designer só propõe; quem decide é o designer ou o PO, e a decisão é registrada (só acrescenta).
- Prompts em `src/lib/agentes/prompts.ts`: nunca escrever a resposta certa; mudou o texto, suba a versão.
- Chave de API só em `.env.local`. Antes de commit: `npm run verificar`, `npx tsc --noEmit`, `npm run lint` e `npm run build`.

