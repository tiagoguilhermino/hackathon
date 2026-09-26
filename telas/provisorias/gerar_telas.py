import os
from PIL import Image, ImageDraw, ImageFont, ImageChops

def get_font(size):
    try:
        return ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', size)
    except IOError:
        try:
            return ImageFont.truetype('Helvetica', size)
        except IOError:
            return ImageFont.load_default()

def draw_screen(variant):
    width, height = 780, 1688
    img = Image.new('RGB', (width, height), color='#F5F5F7')
    draw = ImageDraw.Draw(img)
    
    font_small = get_font(30)
    font_normal = get_font(42)
    font_bold = get_font(54)
    font_title = get_font(72)
    font_icon = get_font(60)
    
    # Top badge
    draw.rectangle([0, 0, width, 80], fill='#e9ecef')
    draw.text((width/2, 40), "TELA FICTÍCIA · protótipo de hackathon", fill='#495057', font=font_small, anchor="mm")
    
    # Header (Green-petroleum)
    draw.rectangle([0, 80, width, 240], fill='#005f73')
    draw.text((width/2, 160), "Banco Exemplo", fill='#ffffff', font=font_title, anchor="mm")
    
    # Title
    draw.text((60, 300), "Agendar Pix", fill='#333333', font=font_bold)
    
    # Fields
    y = 440
    draw.text((60, y), "Chave Pix", fill='#666666', font=font_small)
    draw.text((60, y + 40), "joana@exemplo.com", fill='#333333', font=font_normal)
    
    y = 560
    draw.text((60, y), "Valor", fill='#666666', font=font_small)
    draw.text((60, y + 40), "R$ 150,00", fill='#333333', font=font_normal)
    
    y = 680
    draw.text((60, y), "Data", fill='#666666', font=font_small)
    draw.text((60, y + 40), "05/10/2026", fill='#333333', font=font_normal)
    
    # Separator
    draw.line([(60, 820), (width - 60, 820)], fill='#dddddd', width=3)
    
    # Variant specific block
    # Block area: Y = 860
    y_block = 860
    if variant == 'A':
        draw.text((60, y_block), "Mais opções ›", fill='#005f73', font=font_normal)
    elif variant == 'B':
        draw.text((60, y_block), "↻", fill='#005f73', font=font_icon)
    elif variant == 'C':
        draw.text((60, y_block), "↻", fill='#005f73', font=font_icon)
        draw.text((120, y_block + 5), "Repetir todo mês", fill='#333333', font=font_normal)
        
    # Button
    button_y = height - 200
    draw.rounded_rectangle([60, button_y, width - 60, button_y + 120], fill='#005f73', radius=20)
    draw.text((width/2, button_y + 60), "Continuar", fill='#ffffff', font=font_bold, anchor="mm")
    
    return img

def main():
    os.makedirs('telas/provisorias', exist_ok=True)
    
    img_a = draw_screen('A')
    img_b = draw_screen('B')
    img_c = draw_screen('C')
    
    img_a.save('telas/provisorias/A.png')
    img_b.save('telas/provisorias/B.png')
    img_c.save('telas/provisorias/C.png')
    
    diff_ab = ImageChops.difference(img_a, img_b)
    diff_bc = ImageChops.difference(img_b, img_c)
    
    print(f"Diferença A vs B (bbox): {diff_ab.getbbox()}")
    print(f"Diferença B vs C (bbox): {diff_bc.getbbox()}")

if __name__ == '__main__':
    main()
