"""Vila de personas · painel (M2). Rode com: streamlit run app.py"""

import streamlit as st
from dotenv import load_dotenv

from painel import textos
from painel.diagnostico import diagnosticar

load_dotenv()

st.set_page_config(page_title=textos.TITULO_PAGINA, page_icon="🏘️", layout="wide")

st.info(textos.AVISO_FIXO, icon="🧪")
st.title(textos.TITULO)
st.write(textos.SUBTITULO)

for coluna, (etapa, descricao, hora) in zip(st.columns(len(textos.ETAPAS)), textos.ETAPAS):
    with coluna.container(border=True):
        st.subheader(etapa)
        st.write(descricao)
        st.caption(textos.EM_CONSTRUCAO.format(hora=hora))

with st.sidebar:
    st.caption(textos.AVISO_FIXO)
    st.header(textos.DIAGNOSTICO_TITULO, help=textos.DIAGNOSTICO_AJUDA)
    for item in diagnosticar():
        st.markdown(f"{'✅' if item.ok else '⬜'} **{item.nome}**  \n{item.detalhe}")
