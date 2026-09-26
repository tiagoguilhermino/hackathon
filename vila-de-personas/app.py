"""Vila de personas · painel (M2). Rode com: streamlit run app.py"""

import streamlit as st
import json
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

from painel import textos
from painel.diagnostico import diagnosticar
from vila.motor import simular_vila, carregar_demo

load_dotenv()

st.set_page_config(page_title=textos.TITULO_PAGINA, page_icon="🏘️", layout="wide")

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

if st.button("Simular (ao vivo ou offline)"):
    if not (img_a and img_b):
        st.error("Faça o upload das duas versões para simular.")
    elif nome_a == nome_b:
        st.error("As versões precisam ter nomes diferentes.")
    else:
        st.session_state["simulando"] = True
        st.session_state["nome_a"] = nome_a
        st.session_state["nome_b"] = nome_b
        
        progress_bar = st.progress(0, text="Iniciando a simulação...")
        def update_progress(feitas, total):
            progress_bar.progress(feitas / total, text=f"Simulando rodadas ({feitas}/{total})...")
            
        try:
            # Chama a simulação (usa API se a chave estiver configurada, senão offline se modificado no motor, ou demo)
            # Mas vamos chamar o modo offline_teste=True se não tiver GROQ_API_KEY no caso de erro? 
            # O próprio motor decide como lidar se não tiver chave (lança exceção ou usa anthropic key).
            # Vamos usar offline=True provisoriamente se quiser apenas testar sem gastar
            sim = simular_vila(img_a, img_b, tarefa=tarefa, rodadas=3, versoes=(nome_a, nome_b), progresso=update_progress, offline=False)
            st.session_state["sim_resultado"] = sim.model_dump()
            progress_bar.empty()
        except Exception as e:
            st.error(f"Erro na simulação: {e}")
            progress_bar.empty()

if st.session_state.get("simulando") and "sim_resultado" in st.session_state:
    st.header("2 · Vila de IA")
    sim_data = st.session_state["sim_resultado"]
    st.warning(sim_data.get("aviso", textos.AVISO_FIXO))
    
    agregados = sim_data.get("agregados", [])
    
    nome_a = st.session_state["nome_a"]
    nome_b = st.session_state["nome_b"]
    
    # Agrupar por persona
    personas = {}
    for agg in agregados:
        pid = agg["persona_id"]
        if pid not in personas:
            personas[pid] = {"nome": agg["persona_nome"], "A": None, "B": None}
        if agg["versao"] == nome_a:
            personas[pid]["A"] = agg
        elif agg["versao"] == nome_b:
            personas[pid]["B"] = agg
            
    for pid, data in personas.items():
        st.subheader(f"Persona: {data['nome']}")
        c1, c2, c3 = st.columns([2, 2, 1])
        
        with c1:
            st.write(f"**Antes ({nome_a})**")
            a_data = data["A"]
            if a_data:
                st.write(a_data["texto"])
                st.write(f"Hesitações: {a_data['hesitacoes']} | Desistências: {a_data['desistencias']}")
                if a_data["trava_mais_frequente"]:
                    st.write(f"- Travou em: {a_data['trava_mais_frequente']}")
            else:
                st.write("Sem dados.")
                
        with c2:
            st.write(f"**Depois ({nome_b})**")
            b_data = data["B"]
            if b_data:
                st.write(b_data["texto"])
                st.write(f"Hesitações: {b_data['hesitacoes']} | Desistências: {b_data['desistencias']}")
                if b_data["trava_mais_frequente"]:
                    st.write(f"- Travou em: {b_data['trava_mais_frequente']}")
            else:
                st.write("Sem dados.")
                
        with c3:
            if a_data and b_data:
                from vila.contrato import leitura
                sinal = leitura(a_data["concluiu"], b_data["concluiu"])
                if sinal == 'melhorou':
                    st.success("🟢 Melhorou")
                elif sinal == 'piorou':
                    st.error("🔴 Piorou")
                else:
                    st.warning("🟡 Sinal fraco")
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
                "versoes": f"{nome_a} -> {nome_b}"
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
