/**
 * Versão de cada prompt, gravada em toda simulação (regra 7 da vila: prompt não é calibrado
 * para acertar, e cada versão fica registrada). Mudou o texto de um prompt? Suba a versão
 * aqui e descreva a mudança na tabela "Versões do prompt" do README.
 */
export const PROMPT_VERSIONS = {
  navigator: "nav-v1",
  analyst: "ana-v1",
  designer: "des-v1",
} as const;
