"""Generate the Arizona Wildcats jersey FRONT graphic (albedo) with PIL.
Run with system python3 (has Pillow). Output is loaded by build_jersey.py as the
cloth material's base-colour texture. Layout: image TOP = jersey shoulders (UV v=1),
image BOTTOM = hem (v=0), so it maps right-side-up on the draped cloth.
NUMBER + NAME live here — edit to change them.
"""
from PIL import Image, ImageDraw, ImageFont
import os, random

W, H = 720, 1024
NAVY = (12, 35, 75)    # #0C234B
RED = (171, 5, 32)     # #AB0520
WHITE = (245, 247, 250)
NUMBER = "05"
NAME = "KURU"

OUT = os.path.join(os.path.dirname(__file__), "tex", "jersey_front.png")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

img = Image.new("RGB", (W, H), NAVY)
d = ImageDraw.Draw(img)

# subtle heather noise so the fabric isn't a flat fill
random.seed(5)
px = img.load()
for _ in range(55000):
    x = random.randint(0, W - 1)
    y = random.randint(0, H - 1)
    base = px[x, y]
    j = random.randint(-9, 9)
    px[x, y] = tuple(max(0, min(255, c + j)) for c in base)

# red shoulder yoke band across the top (shoulders)
d.rectangle([0, 0, W, 132], fill=RED)

# white round collar framing the neck, with a navy inner cut
cx, cy = W // 2, 96
d.ellipse([cx - 150, cy - 30, cx + 150, cy + 190], fill=WHITE)
d.ellipse([cx - 112, cy - 2, cx + 112, cy + 168], fill=NAVY)

# red side stripes
d.rectangle([0, 132, 24, H], fill=RED)
d.rectangle([W - 24, 132, W, H], fill=RED)


def font(sz):
    return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", sz)


def centered(text, y, fnt, fill, outline=None, ow=0):
    tw = d.textlength(text, font=fnt)
    x = (W - tw) / 2
    if outline is not None:
        for dx in range(-ow, ow + 1, max(1, ow // 2 or 1)):
            for dy in range(-ow, ow + 1, max(1, ow // 2 or 1)):
                d.text((x + dx, y + dy), text, font=fnt, fill=outline)
    d.text((x, y), text, font=fnt, fill=fill)


# ARIZONA wordmark
centered("ARIZONA", 244, font(94), WHITE)
# big number with red outline
centered(NUMBER, 372, font(360), WHITE, outline=RED, ow=8)
# player name
centered(NAME, 824, font(68), WHITE)
# red hem stripe
d.rectangle([0, H - 34, W, H], fill=RED)

img.save(OUT)
print("wrote", OUT)
