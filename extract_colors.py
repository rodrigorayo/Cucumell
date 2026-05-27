import sys
try:
    from PIL import Image
    from collections import Counter
except ImportError:
    print("PIL not installed")
    sys.exit(1)

try:
    img = Image.open('colorimetria.png').convert('RGB')
    # Resize for speed to 150x150
    img = img.resize((150, 150))
    pixels = list(img.getdata())
    counts = Counter(pixels)
    print("Dominant Colors:")
    for (r, g, b), count in counts.most_common(5):
        print(f"#{r:02x}{g:02x}{b:02x}")
except Exception as e:
    print(f"Error: {e}")
