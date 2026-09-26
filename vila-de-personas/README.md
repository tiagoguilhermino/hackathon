# Vila de personas

> **Protótipo de hackathon · resultados simulados · telas fictícias.**
> Exercício do Hackathon Itaú 2026 (Case C · Jornada de agentes). Não é produto oficial do Itaú.

O designer sobe duas versões de uma tela. Cada persona de IA (perfis fictícios de cliente) tenta a mesma tarefa 3 vezes em cada versão e diz onde travaria. O painel mostra antes × depois por persona. **Quem decide é o designer ou o PO**: o que levar ao teste com pessoas reais, o que descartar. Tudo fica registrado.

A vila gera hipóteses para o teste com pessoas. Ela não substitui esse teste, não aprova design e não vê dado real.

## Como rodar

Precisa de Python 3.10 ou mais novo e de uma chave da API da Groq (só para a simulação ao vivo).

```bash
git clone https://github.com/<usuario>/vila-de-personas.git
cd vila-de-personas
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
streamlit run app.py
```

No Windows, troque a linha do `source` por `.venv\Scripts\activate`.

Abra o `.env` num editor e cole a chave da Groq depois de `GROQ_API_KEY=`. O app abre em http://localhost:8501. Sem chave, o painel abre do mesmo jeito; só a simulação ao vivo precisa dela.

**Link publicado:** entra aqui na H8.

## Conferir antes de cada commit

```bash
python3 scripts/checar.py
```

Ele confere as pastas, o `.gitignore`, se o app abre sem erro e com o aviso fixo, se os agentes estão sincronizados e se tem chave vazada nos arquivos que iriam para o GitHub. Só faça commit com tudo OK. Commit pequeno no fim de cada hora, com a hora na mensagem (`H2: tela de entrada`).

## Estrutura

| Pasta ou arquivo | O que tem | Dono |
|---|---|---|
| `app.py`, `painel/` | o painel que a banca vê | M2 |
| `vila/` | contrato, motor e prompt da persona | M1 |
| `dados/` | `personas.json` (texto do M3) | M1 |
| `telas/` | telas A, B e C (PNG); `telas/provisorias/` até as do M4 chegarem | M4 (M2 nas provisórias) |
| `resultados/` | cada simulação salva, `demo.json` e `decisoes.json` | a vila e o painel gravam |
| `docs/` | contrato de dados, exemplo, revisões dos agentes | M1 e M2 |
| `compartilhado/` | fonte única dos agentes das duas ferramentas | quem pediu |
| `scripts/` | `checar.py` e `sincronizar_agentes.py` | M2 |

As regras completas (quem mexe em quê, regras fixas do produto) estão no [AGENTS.md](AGENTS.md).

## Contrato de dados

O painel e a vila só conversam pelo que está em [docs/contrato-de-dados.md](docs/contrato-de-dados.md): os modelos de `vila/contrato.py`, a função `simular_vila` e os arquivos de `resultados/`. Exemplo de formato em [docs/exemplo-simulacao.json](docs/exemplo-simulacao.json).

## Agentes (Claude Code e Antigravity)

Os agentes ficam em `compartilhado/agentes/`, e um script gera a versão de cada ferramenta:

```bash
python3 scripts/sincronizar_agentes.py
```

| Agente | Quando usar |
|---|---|
| `construtor-painel` | implementar uma tarefa do plano do M2 (H2 a H8) em `app.py` e `painel/` |
| `revisor-painel` | conferir a tarefa contra o "pronto quando", o contrato e as regras fixas; não edita |
| `revisor-textos` | revisar os textos de tela para uma pessoa não técnica (H7); não edita |

Para usar, peça em português ao agente principal, por exemplo: *"Rode o pipeline do painel para a H2."* Ele segue a seção 05 do `AGENTS.md`: constrói, confere com o `checar.py`, revisa, e corrige em até 3 rodadas. As revisões ficam em `docs/revisoes/`.

**Permissões.** No Claude Code, a trava do time está em `.claude/settings.json`; a de cada pessoa, em `.claude/settings.local.json`, que não vai para o GitHub (o do M2 bloqueia `vila/` e `dados/`). O Antigravity não lê permissão de dentro da pasta: cole isto em *Settings → Projects*. O M1 troca as linhas de `vila/` e `dados/` por `app.py` e `painel/`.

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
      "write_file(.env)",
      "write_file(.claude/)",
      "write_file(.agents/)",
      "write_file(vila/)",
      "write_file(dados/)",
      "write_file(docs/contrato-de-dados.md)"
    ],
    "allow": [
      "command(python3 scripts/sincronizar_agentes.py)",
      "command(python3 scripts/checar.py)"
    ],
    "ask": ["command(*)"]
  }
}
```

## Segurança

- A chave só fica no `.env` (local) ou em Secrets (Streamlit Cloud). Nunca no código, no chat, num print ou no vídeo.
- Telas, personas e banco são fictícios. Nada de logo ou marca do Itaú, dado pessoal real ou informação interna.
- Todo resultado da vila leva o rótulo **SIMULAÇÃO**.

## Versões do prompt (M1 preenche)

| Versão | Data e hora | O que mudou | Por quê |
|---|---|---|---|
| v1 | | | |
