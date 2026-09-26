"""Vila de personas · painel (M2). Rode com: streamlit run app.py"""

import streamlit as st
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

from painel import textos
from painel.diagnostico import diagnosticar
from painel.leitura import ler_persona
from vila.motor import ARQ_DEMO, carregar_demo, listar_simulacoes, mensagem_de_erro, simular_vila

load_dotenv()

st.set_page_config(page_title=textos.TITULO_PAGINA, page_icon="🏘️", layout="wide")


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


st.info(textos.AVISO_FIXO, icon="🧪")
st.title(textos.TITULO)
st.write(textos.SUBTITULO)

st.header("1 · Entrada")
tarefa = st.text_input("Qual tarefa o cliente quer fazer?", value="agendar um Pix que se repete todo mês")

col_a, col_b = st.columns(2)
with col_a:
    nome_a = st.text_input("Nome da 1ª versão", value="A")
    img_a = st.file_uploader(f"Imagem da versão {nome_a}", type=["png", "jpg", "jpeg"], key="img_a")
    if img_a:
        st.image(img_a, caption=f"Versão {nome_a}")

with col_b:
    nome_b = st.text_input("Nome da 2ª versão", value="B")
    img_b = st.file_uploader(f"Imagem da versão {nome_b}", type=["png", "jpg", "jpeg"], key="img_b")
    if img_b:
        st.image(img_b, caption=f"Versão {nome_b}")

if st.button("Simular com a IA"):
    if not (img_a and img_b):
        st.error("Faça o upload das duas versões para simular.")
    elif nome_a == nome_b:
        st.error("As versões precisam ter nomes diferentes.")
    else:
        progress_bar = st.progress(0, text="Iniciando a simulação...")

        def update_progress(feitas, total):
            progress_bar.progress(feitas / total, text=f"Simulando rodadas ({feitas}/{total})...")

        try:
            sim = simular_vila(img_a, img_b, tarefa=tarefa, rodadas=3, versoes=(nome_a, nome_b), progresso=update_progress, offline=False)
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

    st.header("3 & 4 · Revisão humana e registro")
    with st.form("form_decisao"):
        decisao = st.selectbox("O que fazer com estes apontamentos?", ["levar ao teste real", "descartar", "já corrigido"])
        comentario = st.text_area("Comentário")

        if st.form_submit_button("Salvar decisão"):
            decisoes_file = Path(__file__).parent / "resultados" / "decisoes.json"
            decisoes_file.parent.mkdir(parents=True, exist_ok=True)

            nova_decisao = {
                "timestamp": datetime.now().isoformat(),
                "decisao": decisao,
                "comentario": comentario,
                "tarefa": tarefa,
                "versoes": f"{antes} -> {depois}"
            }

            lista_decisoes = []
            if decisoes_file.exists():
                try:
                    lista_decisoes = json.loads(decisoes_file.read_text())
                except:
                    pass

            lista_decisoes.append(nova_decisao)
            decisoes_file.write_text(json.dumps(lista_decisoes, indent=2))
            st.success("Decisão salva com sucesso!")

            with st.expander("Histórico de decisões", expanded=True):
                for d in reversed(lista_decisoes):
                    st.write(f"**{d['timestamp']}** - {d['decisao']} ({d.get('versoes', '')})")
                    st.write(f"_{d['comentario']}_")

with st.sidebar:
    st.caption(textos.AVISO_FIXO)
    st.header(textos.DIAGNOSTICO_TITULO, help=textos.DIAGNOSTICO_AJUDA)
    for item in diagnosticar():
        st.markdown(f"{'✅' if item.ok else '⬜'} **{item.nome}**  \n{item.detalhe}")
