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
- Exceção à regra 1 da vila (chave só no `.env`): por decisão do time (27/09/2026, repositório privado), as chaves gratuitas da Groq ficam em `src/lib/llm/keys.ts`. Só `src/lib/llm/client.ts` (servidor) importa esse arquivo; `npm run verificar` confere que a chave não vai para o navegador. Nunca escreva a chave em outro arquivo, em log, na tela ou no vídeo. Antes de o repositório ficar público: apagar as chaves e revogá-las. Agentes não leem `.env.local`.
- Mudou o texto de um prompt? Suba a versão em `src/lib/agents/versions.ts` e acrescente a linha na tabela "Versões do prompt" do `README.md`.
- O agente navegador só vê a árvore de acessibilidade. Estado do app (`getState`) serve só para o avaliador saber se a tarefa foi cumprida.
- Layouts do app (peças do Iury): o modelo fica em `src/lib/design/variations.ts`. Peça ou tela nova precisa aparecer no reducer (`state.ts`), no oráculo (`oracle.ts`), no funil (`flowFunnel`) e em `npm run verificar`. O layout vai para o oráculo, nunca para o prompt do agente.
- Antes de cada commit: `npm run verificar`, `npm run lint` e `npm run build`, todos sem erro.
