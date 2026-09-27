# Hackathon Itaú: pipeline de agentes

> **Avaliação da solução (case e dicas dos mentores) e plano final:** [AVALIACAO-E-PLANO-FINAL.md](AVALIACAO-E-PLANO-FINAL.md).
>
> **O que falta fazer e como gravar o vídeo:** [PLANO-GRAVACAO-E-PENDENCIAS.md](PLANO-GRAVACAO-E-PENDENCIAS.md).
>
> **Onde estamos e o que falta:** [STATUS-E-PASSO-A-PASSO.md](STATUS-E-PASSO-A-PASSO.md) (avaliação das entregas e passo a passo das tarefas restantes, para quem não programa).

Pasta montada seguindo o guia *Como montar seus agentes — passo a passo* (o PDF aqui na raiz). Ela funciona igual no **Claude Code** e no **Antigravity**: mesma constituição, mesmos três agentes (pesquisador, consolidador, revisor), mesmas pastas de dados.

## Estrutura

```
Hackathon Itau/
├── AGENTS.md                 constituição: fonte única das regras (Antigravity lê direto)
├── CLAUDE.md                 só importa @AGENTS.md (é assim que o Claude Code lê)
├── compartilhado/            FONTE ÚNICA dos agentes e skills: você edita aqui
│   ├── agentes/              pesquisador.md · consolidador.md · revisor.md
│   └── skills/               <nome>/SKILL.md (vazio por enquanto; passo 15)
├── .claude/                  Claude Code
│   ├── settings.json         a trava: deny/allow
│   ├── agents/               GERADO a partir de compartilhado/agentes
│   └── skills/               GERADO a partir de compartilhado/skills
├── .agents/                  Antigravity
│   ├── rules/                regras extras, só se o AGENTS.md passar de 12 mil caracteres
│   ├── agents/               GERADO a partir de compartilhado/agentes
│   └── skills/               GERADO a partir de compartilhado/skills
├── input/                    o que você RECEBEU: guia do evento, anotações de conversas e testes do time
├── pdf/                      fontes que você BAIXOU
├── scripts/                  suas ferramentas (sincronizar_agentes.py)
└── output/                   tudo que os agentes ESCREVEM
```

| Pasta | Quem escreve | Trava de verdade |
|---|---|---|
| `input/`, `pdf/`, `scripts/` | só você | Claude: `.claude/settings.json`. Antigravity: permissões (veja abaixo) |
| `output/` | só os agentes | liberado sem pedir aprovação no Claude |
| `compartilhado/`, `AGENTS.md` | você, ou o agente principal quando você pedir | — |
| `.claude/agents`, `.agents/agents`, `…/skills` | só o script | edição à mão bloqueada nas duas ferramentas |

## Regra de ouro: uma fonte, dois destinos

As duas ferramentas querem os agentes em pastas diferentes e com cabeçalhos diferentes (nomes de ferramenta e de modelo mudam). Copiar à mão é o erro nº 6 do guia: muda em um, esquece o outro. Então:

1. Você edita **só** `compartilhado/agentes/<nome>.md`. Cada arquivo tem quatro seções:
   - `--- comum`: `name` e `description`, iguais nas duas;
   - `--- claude`: `tools`, `model` (sonnet/opus), `color`;
   - `--- antigravity`: `tools` (nomes nativos), `model` (flash/pro), `subagent: true`, `commandExecutionPolicy`;
   - `--- corpo`: o prompt, com as 5 seções do passo 5.
2. Roda o script, que gera as duas versões e confere os erros clássicos:

```bash
python3 scripts/sincronizar_agentes.py
```

O script **se recusa a gerar** se o `name` não bater com o nome do arquivo ou se um agente `revisor*` tiver ferramenta de busca ou de escrita. Ele **avisa** quando uma ferramenta tem nome desconhecido (no Antigravity isso pode travar o subagente sem mensagem de erro), quando falta `subagent: true` ou quando o `AGENTS.md` passa de 12 mil caracteres. Se você renomear ou apagar um agente, a versão velha some das duas pastas.

Para conferir sem escrever nada: `python3 scripts/sincronizar_agentes.py --verificar`.

Você também pode pedir ao agente: *"muda o método do pesquisador para … e sincroniza"*. Ele edita `compartilhado/` e roda o script, que já está liberado no Claude.

## Primeiros passos (uma vez)

1. **Guia do evento em `input/`.** O case C já está resumido na seção 01 do `AGENTS.md`. O PDF é a fonte das regras do evento, e o `input/enunciado.md` não é mais usado. Rode no terminal (o agente está travado para não mexer em `input/`):

```bash
mv Guia_dos_Participantes_Hackathon_Itau_2026.pdf input/ && rm input/enunciado.md
```

2. **Recorte do time.** Quando o time fechar a frase "Queremos ajudar [pessoa] a [tarefa]…", troque o `PREENCHA` da linha "Recorte do time" no `AGENTS.md`. Dá para pesquisar antes disso: os pesquisadores usam o case C como contexto e avisam que o recorte ainda não foi definido.
3. **Permissões do Antigravity.** Ele não lê arquivo de permissão de dentro da pasta. Cole o bloco abaixo em *Settings → Projects* (vale só para este projeto) ou em `~/.gemini/antigravity-cli/settings.json` (CLI, vale para todos os projetos):

```json
{
  "permissions": {
    "deny": [
      "command(rm)",
      "command(mv)",
      "command(curl)",
      "command(wget)",
      "command(sudo)",
      "command(git push)",
      "write_file(input/)",
      "write_file(pdf/)",
      "write_file(scripts/)",
      "write_file(.claude/)",
      "write_file(.agents/)"
    ],
    "allow": ["command(python3 scripts/sincronizar_agentes.py)"],
    "ask": ["command(*)"]
  }
}
```

4. **Testes rápidos**, nas duas ferramentas (seção abaixo).

## Rodar o pipeline

Você não roda comando nenhum: pede em português, e o agente principal segue a seção 05 do `AGENTS.md`.

- Usando os temas de partida do case C (seção 05 do `AGENTS.md`):
  > Rode o pipeline com os temas gargalos-squad, governanca-agentes e medir-ganho-ia.
- Deixando o agente propor a partir do recorte:
  > Leia o recorte do time, proponha até 5 temas de pesquisa e, quando eu aprovar, rode o pipeline completo.
- Um agente só:
  > Use o agente revisor com RODADA: 1.

O guia reserva cerca de 1 hora para "recorte, evidências e rascunho da ficha". Três a cinco temas cabem nesse tempo. Os sete temas de partida juntos, não.

**O que sai para o hackathon.** O `00-consolidado.md` traz cada achado marcado como EVIDÊNCIA, HIPÓTESE ou SIMULAÇÃO (a banca avalia essa distinção na competência "Dados"), uma lista de **hipóteses a testar** (vai para o bloco 4 dos slides e para a P3 da ficha) e um **mapa para a entrega**, que diz qual achado serve para qual bloco dos slides e qual pergunta da ficha.

O que acontece: **fase 1**, os pesquisadores rodam em paralelo, cada um grava `output/NN-<slug>.md`. **Fase 2**, o consolidador junta tudo em `output/00-consolidado.md`. **Fase 3**, o revisor devolve o placar e o agente principal salva em `output/00-revisao.md`. Pela linha `ENCAMINHAMENTO:`, o agente segue (`APROVADO`), manda o consolidador corrigir só os itens apontados (`CONSOLIDADOR`, até 3 rodadas) ou para e te chama (`HUMANO`).

## Testes rápidos

| Teste | Esperado |
|---|---|
| Claude Code: `/agents` | aparecem `pesquisador`, `consolidador`, `revisor` |
| Antigravity: `/agents` ou Agent Manager | os mesmos três |
| *"Use o agente revisor para buscar na web a cotação do dólar hoje."* | ele **não consegue**. Se conseguir, o campo `tools` está errado (teste do slide 28) |
| *"Escreva 'teste' em input/teste.md."* | **bloqueado** |
| *"Use o agente pesquisador"* sem ARQUIVO e PERGUNTA | ele para e reporta o que falta |

No Antigravity, se um subagente ficar travado sem resposta, a causa mais provável é um nome de ferramenta que não existe na sua versão. Pergunte ao agente principal *"liste os nomes exatos das ferramentas nativas que você tem"*, corrija a lista em `compartilhado/agentes/` e rode o script de novo.

## O que muda entre as ferramentas (já resolvido aqui)

| | Claude Code | Antigravity |
|---|---|---|
| Constituição | `CLAUDE.md` → `@AGENTS.md` | `AGENTS.md` (teto de 12 mil caracteres por arquivo) |
| Agentes | `.claude/agents/<nome>.md` | `.agents/agents/<nome>.md` + `subagent: true` explícito |
| Busca / leitura de URL | `WebSearch`, `WebFetch` | `search_web`, `read_url_content` |
| Ler / listar / procurar | `Read`, `Glob`, `Grep` | `view_file`, `list_dir` + `find_by_name`, `grep_search` |
| Escrever / editar | `Write`, `Edit` | `write_to_file`, `replace_file_content` |
| Modelo: critério fechado | `sonnet` | `flash` |
| Modelo: ambiguidade e risco | `opus` | `pro` |
| Permissões | `.claude/settings.json`, na pasta | Settings → Projects, ou settings da CLI |
| Chamar subagente | ferramenta Agent | `invoke_subagent` |

## Checklist do guia

- [x] seis pastas criadas
- [x] input / pdf / output separados
- [x] constituição escrita antes do 1º agente (case C; **falta só o recorte do time**)
- [x] deny no arquivo de permissões (Claude) · [ ] colado no Antigravity
- [x] cada agente cabe numa pergunta só
- [x] esqueleto de saída colado no prompt
- [x] toda tabela com colunas nomeadas
- [x] `## Lacunas` e `## Fontes` em todo output de conteúdo
- [x] revisor sem ferramenta de busca
- [x] nomes de arquivo definidos antes dos prompts
- [x] quem revisa não edita
- [x] loop com contador e teto
- [x] encaminhamento em formato fechado
- [x] nenhuma regra escrita em dois lugares
