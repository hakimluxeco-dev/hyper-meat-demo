from PIL import Image
from collections import Counter

def get_dominant_colors(image_path, num_colors=5):
    try:
        image = Image.open(image_path)
        image = image.resize((150, 150))
        result = image.convert('P', palette=Image.ADAPTIVE, colors=num_colors)
        result = result.convert('RGB')
        colors = result.getcolors(150*150)
        sorted_colors = sorted(colors, key=lambda t: t[0], reverse=True)
        return [c[1] for c in sorted_colors]
    except Exception as e:
        print(f"Error: {e}")
        return []

colors = get_dominant_colors('images/logo.jpg')
print("Dominant Colors (RGB):")
for color in colors:
    print(f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}")
