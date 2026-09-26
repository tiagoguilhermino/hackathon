"""Vila de personas · painel (M2). Rode com: streamlit run app.py"""

import streamlit as st
import json
from pathlib import Path
from dotenv import load_dotenv

from painel import textos
from painel.decisoes import OPCOES, QUEM, Decisao, RegistroIlegivel, acrescentar, agora, ler_decisoes
from painel.diagnostico import diagnosticar
from painel.leitura import ler_persona
from vila.motor import ARQ_DEMO, carregar_demo, carregar_personas, listar_simulacoes, mensagem_de_erro, simular_vila

load_dotenv()

st.set_page_config(page_title=textos.TITULO_PAGINA, page_icon="🏘️", layout="wide")

PASTA_TELAS = Path(__file__).parent / "telas"
ROTULO_LEITURA = {
    "melhorou": textos.LEITURA_MELHOROU,
    "piorou": textos.LEITURA_PIOROU,
    "sinal fraco": textos.LEITURA_SINAL_FRACO,
    "incompleto": textos.LEITURA_INCOMPLETO,
}


def guardar_resultado(sim):
    """Vale para simulação ao vivo e para resultado salvo: o painel lê as versões do próprio JSON."""
    st.session_state["sim_resultado"] = sim.model_dump()
    st.session_state["simulando"] = True


def rotulo_salvo(caminho: Path) -> str:
    try:
        meta = json.loads(caminho.read_text(encoding="utf-8"))["metadados"]
    except (OSError, ValueError, KeyError):
        return f"{caminho.name} (não consegui ler)"
    versoes = ", ".join(t["versao"] for t in meta.get("telas", []))
    horario = meta.get("horario_inicio", "")[:16].replace("T", " ")
    modo = "FALSO, teste offline" if meta.get("modo") == "offline-teste" else "rodou com a IA"
    return f"{caminho.name} · telas {versoes} · {horario} · {modo}"


def apontamento(data, antes, depois) -> str:
    """O que a vila apontou para uma persona nas duas versões (vai para o registro da decisão)."""
    partes = [
        f"{versao}: travou em {agg['trava_mais_frequente']}"
        for versao, agg in ((antes, data["A"]), (depois, data["B"]))
        if agg and agg["trava_mais_frequente"]
    ]
    return " · ".join(partes) or textos.APONTAMENTO_NENHUM


st.info(textos.AVISO_FIXO, icon="🧪")
st.title(textos.TITULO)
st.write(textos.SUBTITULO)

try:
    todas_personas = carregar_personas()
except Exception as e:
    st.error(textos.PERSONAS_ERRO.format(erro=mensagem_de_erro(e)))
    todas_personas = []
nomes_personas = {p.id: p.nome for p in todas_personas}

st.header("1 · Entrada")
tarefa = st.text_input("Qual tarefa o cliente quer fazer?", value="agendar um Pix que se repete todo mês")
ids_personas = st.multiselect(
    textos.ENTRADA_PERSONAS, list(nomes_personas), default=list(nomes_personas), format_func=nomes_personas.get
)

telas_prontas = sorted(p.stem for p in PASTA_TELAS.glob("*.png"))
origens = [textos.ORIGEM_PRONTAS, textos.ORIGEM_UPLOAD] if len(telas_prontas) >= 2 else [textos.ORIGEM_UPLOAD]
origem = st.radio(textos.ENTRADA_ORIGEM, origens, horizontal=True)

col_a, col_b = st.columns(2)
if origem == textos.ORIGEM_PRONTAS:
    with col_a:
        nome_a = st.selectbox(textos.TELA_ANTES, telas_prontas, index=0)
        tela_a = PASTA_TELAS / f"{nome_a}.png"
        st.image(str(tela_a), caption=f"Versão {nome_a}", width=260)
    with col_b:
        nome_b = st.selectbox(textos.TELA_DEPOIS, telas_prontas, index=1)
        tela_b = PASTA_TELAS / f"{nome_b}.png"
        st.image(str(tela_b), caption=f"Versão {nome_b}", width=260)
else:
    with col_a:
        nome_a = st.text_input("Nome da 1ª versão", value="A")
        tela_a = st.file_uploader(f"Imagem da versão {nome_a}", type=["png", "jpg", "jpeg"], key="img_a")
        if tela_a:
            st.image(tela_a, caption=f"Versão {nome_a}", width=260)
    with col_b:
        nome_b = st.text_input("Nome da 2ª versão", value="B")
        tela_b = st.file_uploader(f"Imagem da versão {nome_b}", type=["png", "jpg", "jpeg"], key="img_b")
        if tela_b:
            st.image(tela_b, caption=f"Versão {nome_b}", width=260)

st.caption(textos.ESTIMATIVA.format(n=len(ids_personas) * 2 * 3, p=len(ids_personas)))

if st.button("Simular com a IA"):
    if not ids_personas:
        st.error(textos.SEM_PERSONAS)
    elif not (tela_a and tela_b):
        st.error("Faça o upload das duas versões para simular.")
    elif nome_a == nome_b:
        st.error("As versões precisam ter nomes diferentes.")
    else:
        progress_bar = st.progress(0, text="Iniciando a simulação...")

        def update_progress(feitas, total):
            progress_bar.progress(feitas / total, text=f"Simulando rodadas ({feitas}/{total})...")

        try:
            sim = simular_vila(
                tela_a, tela_b, tarefa=tarefa, personas=ids_personas, rodadas=3,
                versoes=(nome_a, nome_b), progresso=update_progress, offline=False,
            )
            guardar_resultado(sim)
        except Exception as e:
            st.error(mensagem_de_erro(e))
        progress_bar.empty()

with st.expander(textos.CARREGAR_TITULO, expanded=False):
    st.caption(textos.CARREGAR_AJUDA)
    salvos = ([ARQ_DEMO] if ARQ_DEMO.exists() else []) + listar_simulacoes()
    if not salvos:
        st.write(textos.CARREGAR_VAZIO)
    else:
        escolhido = st.selectbox(textos.CARREGAR_ESCOLHA, salvos, format_func=rotulo_salvo)
        if st.button(textos.CARREGAR_BOTAO):
            try:
                guardar_resultado(carregar_demo(escolhido))
            except Exception as e:
                st.error(mensagem_de_erro(e))

if st.session_state.get("simulando") and "sim_resultado" in st.session_state:
    st.header("2 · Vila de IA")
    sim_data = st.session_state["sim_resultado"]
    meta = sim_data["metadados"]
    st.warning(sim_data.get("aviso", textos.AVISO_FIXO))
    if meta["modo"] == "offline-teste":
        st.error(textos.AVISO_OFFLINE)
    if sim_data.get("carregado_de"):
        st.info(textos.CARREGADO_DE.format(
            arquivo=sim_data["carregado_de"],
            horario=meta["horario_inicio"][:16].replace("T", " "),
            modelo=meta["modelo"],
        ))
    with st.expander(textos.COMO_LER_TITULO):
        st.markdown(textos.COMO_LER)

    # As versões vêm do próprio resultado (um arquivo salvo pode ter A, B e C).
    versoes = [t["versao"] for t in meta["telas"]]
    if len(versoes) > 2:
        c_antes, c_depois = st.columns(2)
        antes = c_antes.selectbox(textos.COMPARAR_ANTES, versoes, index=0)
        depois = c_depois.selectbox(textos.COMPARAR_DEPOIS, versoes, index=1)
    else:
        antes, depois = versoes[0], versoes[-1]

    agregados = sim_data.get("agregados", [])

    # Agrupar por persona
    personas = {}
    for agg in agregados:
        pid = agg["persona_id"]
        if pid not in personas:
            personas[pid] = {"nome": agg["persona_nome"], "A": None, "B": None}
        if agg["versao"] == antes:
            personas[pid]["A"] = agg
        elif agg["versao"] == depois:
            personas[pid]["B"] = agg

    if antes == depois:
        st.warning(textos.COMPARAR_IGUAIS)
        personas = {}

    for pid, data in personas.items():
        st.subheader(f"Persona: {data['nome']}")
        c1, c2, c3 = st.columns([2, 2, 1])

        with c1:
            st.write(f"**Antes ({antes})**")
            a_data = data["A"]
            if a_data:
                st.write(a_data["texto"])
                st.write(f"Hesitações: {a_data['hesitacoes']} | Desistências: {a_data['desistencias']}")
                if a_data["trava_mais_frequente"]:
                    st.write(f"- Travou em: {a_data['trava_mais_frequente']}")
            else:
                st.write("Sem dados.")

        with c2:
            st.write(f"**Depois ({depois})**")
            b_data = data["B"]
            if b_data:
                st.write(b_data["texto"])
                st.write(f"Hesitações: {b_data['hesitacoes']} | Desistências: {b_data['desistencias']}")
                if b_data["trava_mais_frequente"]:
                    st.write(f"- Travou em: {b_data['trava_mais_frequente']}")
            else:
                st.write("Sem dados.")

        with c3:
            sinal = ler_persona(a_data, b_data)
            if sinal == "melhorou":
                st.success(textos.LEITURA_MELHOROU)
            elif sinal == "piorou":
                st.error(textos.LEITURA_PIOROU)
            elif sinal == "sinal fraco":
                st.warning(textos.LEITURA_SINAL_FRACO)
            else:
                st.info(textos.LEITURA_INCOMPLETO)
                st.caption(textos.LEITURA_INCOMPLETO_DETALHE)
        st.divider()

    if personas:
        st.header("3 & 4 · Revisão humana e registro")
        st.caption(textos.REVISAO_AJUDA)
        with st.form("form_decisao"):
            quem = st.radio(textos.DECISAO_QUEM, QUEM, horizontal=True)
            escolhas = {}
            for pid, data in personas.items():
                leitura_p = ler_persona(data["A"], data["B"])
                apontado = apontamento(data, antes, depois)
                st.markdown(f"**{data['nome']}** · {ROTULO_LEITURA[leitura_p]} · {apontado}")
                c_dec, c_com = st.columns([1, 2])
                decisao = c_dec.selectbox(textos.DECISAO_ESCOLHA, (textos.SEM_DECISAO, *OPCOES), key=f"decisao_{pid}")
                comentario = c_com.text_input(textos.DECISAO_COMENTARIO, key=f"comentario_{pid}")
                escolhas[pid] = (decisao, comentario, leitura_p, apontado)

            if st.form_submit_button(textos.DECISAO_BOTAO):
                novas = [
                    Decisao(
                        horario=agora(), quem=quem, simulacao_id=sim_data["id"], persona_id=pid,
                        comparacao=f"{antes} → {depois}", leitura=leitura_p, apontamento=apontado,
                        decisao=decisao, comentario=comentario.strip(),
                    )
                    for pid, (decisao, comentario, leitura_p, apontado) in escolhas.items()
                    if decisao != textos.SEM_DECISAO
                ]
                if not novas:
                    st.warning(textos.DECISAO_NENHUMA)
                else:
                    try:
                        total = acrescentar(novas)
                        st.success(textos.DECISAO_SALVA.format(n=len(novas), total=total))
                    except RegistroIlegivel as e:
                        st.error(textos.REGISTRO_ILEGIVEL.format(erro=e))

# O histórico aparece sempre, mesmo antes de simular.
st.header(textos.HISTORICO_TITULO)
try:
    registros = ler_decisoes()
except RegistroIlegivel as e:
    st.error(textos.REGISTRO_ILEGIVEL.format(erro=e))
    registros = []
if not registros:
    st.caption(textos.HISTORICO_VAZIO)
for r in reversed(registros[-50:]):
    horario = str(r.get("horario", r.get("timestamp", "")))[:16].replace("T", " ")
    persona = nomes_personas.get(r.get("persona_id"), r.get("persona_id", "—"))
    st.markdown(
        f"**{horario}** · {r.get('quem', '—')} · {persona} · {r.get('comparacao', r.get('versoes', ''))} · "
        f"{r.get('leitura', '')} → **{r.get('decisao', '')}**  \n"
        f"{r.get('comentario', '')}  \n`{r.get('simulacao_id', '')}`"
    )

with st.sidebar:
    st.caption(textos.AVISO_FIXO)
    st.header(textos.DIAGNOSTICO_TITULO, help=textos.DIAGNOSTICO_AJUDA)
    for item in diagnosticar():
        st.markdown(f"{'✅' if item.ok else '⬜'} **{item.nome}**  \n{item.detalhe}")
