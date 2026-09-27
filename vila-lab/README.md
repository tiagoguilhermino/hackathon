# Vila de Personas · Laboratório (Next.js)

> **Protótipo de hackathon · banco fictício · dados sintéticos · resultados simulados.**
> Hackathon Itaú 2026 · Case C. Não é o app oficial do Itaú nem produto do banco.

Personas de IA navegam por um app de banco fictício, o sistema mede onde cada perfil trava, um agente analista resume os números, um agente designer propõe mudanças e **uma pessoa (designer ou PO) decide** o que levar ao teste com pessoas reais. Tudo fica registrado.

A navegação é modelada como um processo de decisão de Markov (MDP): as telas são os estados S, os elementos clicáveis (cada um com um `data-action-id`) são as ações A e cada agente segue uma política π(a|s) enviesada pelo perfil da persona.

## Como rodar

Precisa de Node.js 20 ou mais novo.

```bash
cd vila-lab
npm install
npm run dev          # http://localhost:3000
npm run verificar    # checagens sem navegador (personas, MDP, agentes, estatísticas)
npm run build        # confere o build de produção
```

| Página | O que tem |
|---|---|
| `/` | o app do banco fictício (Home, Pix recorrente A/B/C, empréstimo em 3 etapas). Botão discreto no canto leva ao laboratório. |
| `/lab` | configurar a demanda (fluxo, versão, nº de agentes, proporção por profissão, semente) e rodar a simulação vendo cada toque |
| `/dashboard` | taxa de conclusão por segmento, tempo, funil, pontos de abandono, agente analista, agente designer e revisão humana |

Sem nenhuma simulação salva, o dashboard oferece "Gerar exemplo" (40 agentes, cerca de 15 s).

## Os quatro módulos

| Módulo | Onde | O que faz |
|---|---|---|
| 1 · Persona Engine | `src/lib/personas.ts` | base **sintética** com dados cadastrais, financeiros, comportamento digital e dispositivo/UF. A proporção entre profissões é configurável e respeitada exatamente (ex.: 2× mais servidores que CLT). Mesma semente, mesma base. |
| 2 · Ambiente | `src/components/banco/`, `src/lib/banco/` | app mobile-first. Todo clicável tem `data-action-id`; `exportarArvore()` (`src/lib/acessibilidade.ts`) transforma a tela em JSON com rótulo, posição, visibilidade, **contraste WCAG calculado**, jargões e **carga cognitiva** (0 a 1, por regra). |
| 3 · Motor de simulação | `src/app/lab/`, `src/app/api/agente/navegar/` | loop: a tela renderiza → a árvore sai do DOM → a API monta o prompt com a persona e devolve **um** `action_id` ou `ABANDONAR` → a ação é aplicada → repete. O servidor **recusa** ação que não existe na tela (registrada como resposta inválida; na 2ª, o agente é encerrado como "erro do agente", fora das taxas). |
| 4 · Analítica | `src/app/dashboard/`, `src/lib/estatisticas.ts`, `src/lib/agentes/analista.ts`, `designer.ts` | estatísticas e achados **calculados por código** (a IA não inventa números); o analista só escreve o sumário; o designer propõe mudanças; nada muda sem a **revisão humana** registrada. |

## IA simulada (padrão) ou de verdade

Nesta primeira iteração, como pedido, as chamadas de IA são **simuladas**: as rotas esperam com `setTimeout` e respondem por regra (`src/lib/agentes/politicaMock.ts`), com as mesmas restrições do prompt (literacia baixa + carga alta → erra, demora ou desiste; ícone sem texto, item fora da tela e contraste baixo são difíceis de notar).

**Os números do modo simulado refletem as regras que escrevemos, não pessoas.** Servem para testar o encanamento e a transição de estados, nunca como evidência.

Para ligar a IA de verdade (Groq, a mesma da vila em Python), crie `vila-lab/.env.local`:

```bash
LLM_PROVEDOR=groq
GROQ_API_KEY=cole_a_chave_aqui     # nunca no código, no chat, no print ou no vídeo
LLM_MODELO=qwen/qwen3.8-27b        # opcional
```

Reinicie o `npm run dev`; o painel do lab passa a mostrar "IA: ligada". O plano gratuito da Groq limita este modelo a 1.000 tokens de resposta por minuto: use **4 a 8 agentes** por rodada. O modo Groq foi escrito com a mesma chamada que funcionou na vila em Python, mas **não foi testado neste ambiente** (a rede daqui bloqueia a Groq): rode 1 agente antes da demo.

Os prompts dos três agentes ficam em `src/lib/agentes/prompts.ts` (versões `nav-v1`, `ana-v1`, `des-v1`). Regra do time: ajustar só clareza e formato; nunca escrever a resposta certa; mudou o texto, suba a versão.

## Para adaptar ao frontend novo (contrato)

O motor, o lab e o dashboard não dependem das telas deste repositório. Para plugar outra interface:

1. Todo elemento clicável leva `data-action-id="<tela>.<ação>"` (ex.: `pixconfirmar.repetir`) e `data-tipo` (`botao`, `opcao`, `alternador`, `campo`).
2. Botão só com ícone leva `aria-label` (é o que o agente lê) e `data-somente-icone="true"`.
3. Alternadores e opções usam `aria-pressed`.
4. A área de cada tela leva `data-tela="<id>"`; textos que a pessoa lê (não clicáveis) levam `data-leitura`.
5. As transições ficam numa função pura (`aplicarAcao(estado, actionId)` em `src/lib/banco/estado.ts`) usada pelo clique humano **e** pelo agente, e cada fluxo declara objetivo e condição de sucesso (`src/lib/banco/fluxos.ts`).

## Limites

- Personas sintéticas: as relações entre idade, renda e literacia digital são **hipóteses de modelagem**, não dados reais. Estudos mostram que IA "fazendo papel" de grupos tende a achatá-los e estereotipá-los (ver a pesquisa consolidada do time).
- Tempo "simulado" não é tempo medido.
- Simulações e decisões ficam no `localStorage` do navegador. Para guardar de verdade, baixe o JSON.
- As cores da marca ficam só em `src/app/globals.css`. A regra do time (`vila-de-personas/AGENTS.md`) pede banco fictício sem cores do Itaú: decidam antes do vídeo.
