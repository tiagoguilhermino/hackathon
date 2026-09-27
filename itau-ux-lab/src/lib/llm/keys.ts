/**
 * Chaves gratuitas da Groq deste projeto. Ficam no código por decisão do time (27/09/2026):
 * o repositório é privado e as chaves só servem para o hackathon.
 *
 * O servidor usa a GROQ_API_KEY do .env.local, se houver; senão, estas, na ordem. A segunda
 * entra quando a primeira é recusada (revogada) ou esgota o limite.
 *
 * ANTES de deixar o repositório público ou de mandar o link do código para a banca, apague as
 * chaves daqui e revogue as duas em console.groq.com (o Guia pede materiais públicos sem chaves).
 *
 * Só src/lib/llm/client.ts importa este arquivo, e só o servidor usa aquele. Nunca importe
 * isto num componente "use client": a chave iria para o navegador de quem abrir o app.
 */
export const PROJECT_GROQ_KEYS: readonly string[] = [
  "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",
  "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",
];
