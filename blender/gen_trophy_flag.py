"""Generate a CLEAN, FLAT Arizona-flag + DECA-diamond texture for the trophy award.
Crisp flat colors (supersampled → LANCZOS downscale for smooth edges). No grunge, no cracks.
Run: python3 blender/gen_trophy_flag.py
"""
from PIL import Image, ImageDraw
import math, os

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "textures", "trophy_flag.png"))
os.makedirs(os.path.dirname(OUT), exist_ok=True)

SS = 3                      # supersample factor
N = 1100
W = H = N * SS

BLUE = (0, 40, 104)        # AZ "liberty blue" #002868
RED = (206, 17, 38)        # "old glory red" #CE1126
YEL = (255, 199, 44)       # "weld yellow"  #FFC72C
COP = (176, 123, 40)       # copper star    #B07B28
WHT = (255, 255, 255)

img = Image.new("RGB", (W, H), BLUE)
d = ImageDraw.Draw(img)

cx = W // 2
hy = int(0.52 * H)         # sun apex / horizon line (blue below, rays above)

# ── 13-ray sunburst fanning UP from the apex (alternating yellow/red, outer = yellow) ──
R = int(1.7 * H)           # long enough to run off the top edge
n = 13
for i in range(n):
    a0 = math.pi + (i / n) * math.pi          # 180° (left) → 360° (right), sweeping through up
    a1 = math.pi + ((i + 1) / n) * math.pi
    p0 = (cx + R * math.cos(a0), hy + R * math.sin(a0))
    p1 = (cx + R * math.cos(a1), hy + R * math.sin(a1))
    d.polygon([(cx, hy), p0, p1], fill=(YEL if i % 2 == 0 else RED))


def star(scx, scy, rO, rI, pts=5, rot=-math.pi / 2):
    poly = []
    for k in range(pts * 2):
        ang = rot + k * math.pi / pts
        r = rO if k % 2 == 0 else rI
        poly.append((scx + r * math.cos(ang), scy + r * math.sin(ang)))
    return poly


# copper 5-point star at the convergence
d.polygon(star(cx, hy, 0.12 * W, 0.05 * W), fill=COP)

# ── DECA white pinwheel diamond, centered ──
dcx, dcy = cx, int(0.49 * H)
dr = int(0.23 * W)
top = (dcx, dcy - dr); right = (dcx + dr, dcy); bot = (dcx, dcy + dr); left = (dcx - dr, dcy)
mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
ctr = (dcx, dcy)
# 4 pinwheel blades (vertex → next-edge-midpoint → center), leaving gaps that show the flag
d.polygon([top, mid(top, right), ctr], fill=WHT)
d.polygon([right, mid(right, bot), ctr], fill=WHT)
d.polygon([bot, mid(bot, left), ctr], fill=WHT)
d.polygon([left, mid(left, top), ctr], fill=WHT)
# crisp diamond outline framing the pinwheel
d.line([top, right, bot, left, top], fill=WHT, width=int(0.02 * W), joint="curve")

img = img.resize((N, N), Image.LANCZOS)
img.save(OUT)
print("WROTE", OUT, img.size)
