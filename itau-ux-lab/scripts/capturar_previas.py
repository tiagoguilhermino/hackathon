"""Tira as prévias das variações de tela do frontend Lume (Iury) para o Agente Designer do laboratório.

As variações vêm de Frontend/itau-hackathon-bank-main/src/lib/cenarios.ts (Dash V1/V2/V3, a peça
Pagar, o Fluxo 1/2 do Pix e o Repetir A/B/C). O catálogo que usa estas imagens fica em
src/lib/design/variations.ts.

Como rodar (com o Playwright instalado: pip install playwright && python -m playwright install chromium):
    cd Frontend/itau-hackathon-bank-main && npm run dev -- --port 5174 --host 127.0.0.1
    python itau-ux-lab/scripts/capturar_previas.py

O print usa o modo limpo do app (&limpo=sim, sem as barras de teste) e NÃO altera o código do
frontend. Antes do print, só na página aberta pelo script:
- bancos reais da lista de contatos viram bancos fictícios, e o nome da saudação vira "Cliente"
  (regra da vila: nada de marca ou dado real no que vai para vídeo e slides);
- a janela do Pix ocupa a tela inteira, como num celular;
- na versão B, o ícone de repetir usa a cor de destaque do app (no frontend ele está branco
  sobre branco; a B testa "ícone sem texto", não "ícone invisível").
Se algum termo proibido sobrar na tela, o script para com erro.
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:5174/"
DESTINO = Path(__file__).resolve().parent.parent / "public" / "previas"

TROCAS = {
    "Itaú Unibanco": "Banco Aurora",
    "Nubank": "Banco Horizonte",
    "Bradesco": "Banco Estrela",
    "Banco do Brasil": "Banco Norte",
    "Santander": "Banco Sol",
    "Raphael": "Cliente",
}
PROIBIDOS = ["Itaú", "Itau", "Unibanco", "Nubank", "Bradesco", "Santander", "Banco do Brasil", "Hackathon", "Versão", "Modo de Teste", "Raphael"]

PREPARAR = """
(trocas) => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    for (const [de, para] of Object.entries(trocas)) n.nodeValue = n.nodeValue.split(de).join(para);
  }
  const overlay = document.querySelector('div.fixed.inset-0.z-50');
  if (overlay) {
    overlay.style.padding = '0';
    overlay.style.alignItems = 'stretch';
    const janela = overlay.firstElementChild;
    janela.style.maxWidth = 'none';
    janela.style.borderRadius = '0';
    janela.style.minHeight = '100%';
  }
  const iconeB = document.querySelector('button[aria-label="Repetir este Pix"]');
  if (iconeB) iconeB.style.color = 'var(--accent)';
}
"""


def abrir_pix(pagina):
    pagina.get_by_role("button", name="Pix", exact=True).first.click()
    pagina.wait_for_timeout(300)


def ate_confirmar(pagina):
    abrir_pix(pagina)
    pagina.get_by_text("Ana Paula Souza").first.click()
    pagina.get_by_role("button", name="Revisar Transação").click()
    pagina.wait_for_timeout(400)


# id da prévia → (parâmetros do endereço, passos até a tela)
PREVIAS = {
    "dash-v1": ("dash=v1&fluxo=f1&rec=a", None),
    "dash-v2": ("dash=v2&fluxo=f1&rec=a", None),
    "dash-v3": ("dash=v3&fluxo=f1&rec=a", None),
    "dash-pagar-separadas": ("transf=separadas&boleto=deposito&chaves=deposito&pagar=separadas&fluxo=f1&rec=a", None),
    "pix-f1": ("dash=v1&fluxo=f1&rec=a", abrir_pix),
    "pix-f2": ("dash=v1&fluxo=f2&rec=a", abrir_pix),
    "rec-a": ("dash=v1&fluxo=f1&rec=a", ate_confirmar),
    "rec-b": ("dash=v1&fluxo=f1&rec=b", ate_confirmar),
    "rec-c": ("dash=v1&fluxo=f1&rec=c", ate_confirmar),
}

DESTINO.mkdir(parents=True, exist_ok=True)
falhas = 0
with sync_playwright() as p:
    navegador = p.chromium.launch()
    for nome, (busca, passos) in PREVIAS.items():
        pagina = navegador.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1.5)
        pagina.goto(f"{URL}?{busca}&limpo=sim", wait_until="networkidle")
        if passos:
            passos(pagina)
        pagina.evaluate(PREPARAR, TROCAS)
        visivel = pagina.locator("body").inner_text()
        achados = [t for t in PROIBIDOS if t in visivel]
        arquivo = DESTINO / f"{nome}.png"
        pagina.screenshot(path=str(arquivo))
        print(f"{nome}: {arquivo.name} · termos proibidos: {achados or 'nenhum'}")
        falhas += bool(achados)
        pagina.close()
    navegador.close()
sys.exit(1 if falhas else 0)
