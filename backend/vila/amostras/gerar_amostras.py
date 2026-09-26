"""Gera prints FICTÍCIOS de rascunho (A, B, C) para testar o motor antes das telas do M4.

Seguem o combinado da H1 do M4: tarefa "agendar um Pix que se repete todo mês";
A = opção escondida em "Mais opções"; B = ícone sem texto; C = ícone com "Repetir todo mês".
Não são as telas oficiais: quando o M4 entregar A.png, B.png e C.png, elas têm prioridade.

    python vila/amostras/gerar_amostras.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

LARGURA, ALTURA = 390, 844
PASTA = Path(__file__).resolve().parent
FONTES = [Path("C:/Windows/Fonts/arial.ttf"), Path("/System/Library/Fonts/Supplemental/Arial.ttf"),
          Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")]
FONTES_NEGRITO = [Path("C:/Windows/Fonts/arialbd.ttf"), Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf"),
                  Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")]

AZUL = (32, 60, 140)
CINZA = (110, 110, 110)
CINZA_CLARO = (230, 232, 236)
PRETO = (25, 25, 25)
LARANJA = (200, 90, 20)


def fonte(tamanho: int, negrito: bool = False):
    for caminho in FONTES_NEGRITO if negrito else FONTES:
        if caminho.exists():
            return ImageFont.truetype(str(caminho), tamanho)
    return ImageFont.load_default()


def seta_circular(d: ImageDraw.ImageDraw, cx: int, cy: int, r: int = 11) -> None:
    d.arc([cx - r, cy - r, cx + r, cy + r], start=40, end=330, fill=AZUL, width=3)
    # ponta da seta no fim do arco
    d.polygon([(cx + r - 1, cy - 9), (cx + r + 6, cy - 1), (cx + r - 7, cy + 1)], fill=AZUL)


def campo(d: ImageDraw.ImageDraw, y: int, rotulo: str, valor: str) -> None:
    d.text((24, y), rotulo, font=fonte(13), fill=CINZA)
    d.rounded_rectangle([20, y + 20, LARGURA - 20, y + 64], radius=10, outline=CINZA_CLARO, width=2)
    d.text((34, y + 32), valor, font=fonte(17), fill=PRETO)


def tela(versao: str) -> Image.Image:
    img = Image.new("RGB", (LARGURA, ALTURA), "white")
    d = ImageDraw.Draw(img)

    d.text((20, 14), "9:41", font=fonte(14, True), fill=PRETO)
    d.rectangle([0, 44, LARGURA, 100], fill=AZUL)
    d.text((20, 58), "‹", font=fonte(28, True), fill="white")
    d.text((50, 62), "Banco Fictício", font=fonte(20, True), fill="white")
    d.rounded_rectangle([268, 58, 372, 86], radius=8, fill=LARANJA)
    d.text((278, 64), "tela fictícia", font=fonte(13, True), fill="white")

    d.text((20, 122), "Pix", font=fonte(26, True), fill=PRETO)
    d.text((20, 158), "Confira os dados antes de continuar", font=fonte(14), fill=CINZA)

    campo(d, 196, "Chave Pix", "maria.silva@email.com")
    campo(d, 280, "Valor", "R$ 150,00")
    campo(d, 364, "Data do pagamento", "05/10/2026")

    if versao == "A":
        d.rounded_rectangle([20, 452, LARGURA - 20, 496], radius=10, fill=CINZA_CLARO)
        d.text((34, 464), "Mais opções", font=fonte(16), fill=PRETO)
        d.text((LARGURA - 44, 460), "˅", font=fonte(20, True), fill=PRETO)
    elif versao == "B":
        seta_circular(d, LARGURA - 44, 408)
    elif versao == "C":
        d.rounded_rectangle([20, 452, LARGURA - 20, 496], radius=10, outline=AZUL, width=2)
        seta_circular(d, 44, 474)
        d.text((66, 464), "Repetir todo mês", font=fonte(16, True), fill=AZUL)

    d.rounded_rectangle([20, 744, LARGURA - 20, 796], radius=12, fill=AZUL)
    texto = "Continuar"
    largura_texto = d.textlength(texto, font=fonte(18, True))
    d.text(((LARGURA - largura_texto) / 2, 759), texto, font=fonte(18, True), fill="white")
    d.text((20, 812), "Rascunho do M1 para testes · não é a tela oficial", font=fonte(11), fill=CINZA)
    return img


if __name__ == "__main__":
    for versao in ("A", "B", "C"):
        caminho = PASTA / f"{versao}.png"
        tela(versao).save(caminho)
        print(f"gerado {caminho}")
