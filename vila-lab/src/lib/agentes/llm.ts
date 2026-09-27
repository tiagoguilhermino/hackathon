/**
 * Adaptador de IA (só no servidor). Padrão: modo simulado, com atraso de setTimeout e
 * respostas por regra. Com LLM_PROVEDOR=groq e GROQ_API_KEY no .env.local, as rotas
 * chamam a API da Groq (a mesma usada pela vila em Python).
 */

import type { Prompt } from "./prompts";

export interface ConfigLLM {
  modo: "mock" | "groq";
  modelo: string;
}

export function configLLM(): ConfigLLM {
  if (process.env.LLM_PROVEDOR === "groq" && process.env.GROQ_API_KEY) {
    return { modo: "groq", modelo: process.env.LLM_MODELO ?? "qwen/qwen3.8-27b" };
  }
  return { modo: "mock", modelo: "mock" };
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class ErroLLM extends Error {}

/**
 * Chama a Groq pedindo JSON. Repete em 429 respeitando o retry-after (o plano gratuito
 * limita a 1.000 tokens de resposta por minuto neste modelo).
 */
export async function chamarGroq(prompt: Prompt, maxTokens: number): Promise<unknown> {
  const { modelo } = configLLM();
  const corpo: Record<string, unknown> = {
    model: modelo,
    messages: [
      { role: "system", content: prompt.sistema },
      { role: "user", content: prompt.usuario },
    ],
    max_tokens: maxTokens,
    temperature: Number(process.env.LLM_TEMPERATURA ?? 0.6),
    response_format: { type: "json_object" },
  };
  if (modelo.startsWith("qwen/") || modelo.startsWith("openai/gpt-oss")) {
    corpo.reasoning_format = "hidden";
    corpo.reasoning_effort = process.env.LLM_ESFORCO ?? "none";
  }

  for (let tentativa = 1; tentativa <= 5; tentativa++) {
    const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify(corpo),
    });
    if (resposta.status === 429) {
      const segundos = Math.min(60, Number(resposta.headers.get("retry-after") ?? 10));
      await esperar(segundos * 1000);
      continue;
    }
    if (!resposta.ok) {
      throw new ErroLLM(`A API da Groq respondeu ${resposta.status}. Confira a chave e o modelo (LLM_MODELO).`);
    }
    const dados = (await resposta.json()) as { choices?: { message?: { content?: string } }[] };
    const texto = dados.choices?.[0]?.message?.content;
    if (!texto) throw new ErroLLM("A IA devolveu uma resposta vazia.");
    try {
      return JSON.parse(texto);
    } catch {
      throw new ErroLLM("A IA devolveu algo que não é JSON.");
    }
  }
  throw new ErroLLM("Limite de uso da Groq atingido várias vezes seguidas. Espere um minuto.");
}
