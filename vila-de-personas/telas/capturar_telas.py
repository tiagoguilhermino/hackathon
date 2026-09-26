"""Tira as PNGs oficiais A, B e C da tela de confirmação do Pix no frontend (banco fictício Lume).

Esconde a barra "Modo de Teste da Vila" (ela diz "Versão A/B/C" e cita o Itaú) e deixa a janela do Pix
ocupando a tela inteira, como num celular. Não altera o código do frontend.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:5174/"
DESTINO = Path(sys.argv[1])
DESTINO.mkdir(parents=True, exist_ok=True)

ESCONDER_E_TELA_CHEIA = """
() => {
  const barra = [...document.querySelectorAll('p')].find(p => p.textContent.includes('Modo de Teste da Vila'));
  if (!barra) throw new Error('barra de teste não encontrada');
  barra.closest('div.bg-primary').style.display = 'none';
  const overlay = document.querySelector('div.fixed.inset-0.z-50');
  overlay.style.padding = '0';
  overlay.style.alignItems = 'stretch';
  const janela = overlay.firstElementChild;
  janela.style.maxWidth = 'none';
  janela.style.borderRadius = '0';
  janela.style.minHeight = '100%';
  // Versão B: no frontend o ícone está branco sobre branco (text-accent-foreground em bg-surface).
  // No print ele usa a cor de destaque do próprio app, para a B testar "ícone sem texto", não "ícone invisível".
  const iconeB = document.querySelector('button[aria-label="Repetir este Pix"]');
  if (iconeB) iconeB.style.color = 'var(--accent)';
  return document.body.innerText;
}
"""

PROIBIDOS = ["Versão", "Hackathon", "Itaú", "Modo de Teste", "Variação"]

with sync_playwright() as p:
    navegador = p.chromium.launch()
    for versao in ["A", "B", "C"]:
        pagina = navegador.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        pagina.goto(URL, wait_until="networkidle")
        pagina.get_by_role("button", name="Pix", exact=True).first.click()
        pagina.get_by_role("button", name="Fluxo 1", exact=False).first.click()
        pagina.get_by_text("Ana Paula Souza").first.click()
        pagina.get_by_role("button", name="Revisar Transação").click()
        pagina.get_by_role("button", name=f"Versão {versao}", exact=True).click()
        pagina.wait_for_timeout(400)
        texto = pagina.evaluate(ESCONDER_E_TELA_CHEIA)
        # confere só o que está dentro da janela do Pix (o que vai para a imagem)
        visivel = pagina.locator("div.fixed.inset-0.z-50").inner_text()
        achados = [t for t in PROIBIDOS if t in visivel]
        arquivo = DESTINO / f"{versao}.png"
        pagina.screenshot(path=str(arquivo))
        print(f"{versao}: {arquivo} · termos proibidos na tela: {achados or 'nenhum'}")
        print("   texto visível:", " | ".join(l.strip() for l in visivel.splitlines() if l.strip())[:300])
        pagina.close()
    navegador.close()
