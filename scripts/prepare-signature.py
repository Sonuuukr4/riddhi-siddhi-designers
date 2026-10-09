"""
Prepares Neeraj Ji's handwritten signature for the website.

The supplied scan is an opaque RGB PNG (black ink on white). The About page
sits on a beige background, so the white is turned into transparency: each
pixel keeps the original ink colour and its darkness becomes its opacity,
which preserves the stroke edges (anti-aliasing) exactly. Empty margins are
then trimmed so the image box matches the signature itself.

    python scripts/prepare-signature.py
    (reads design/neeraj-signature-original.png, writes public/images/neeraj-signature.png)
"""
import pathlib
import statistics

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design" / "neeraj-signature-original.png"
OUTPUT = ROOT / "public" / "images" / "neeraj-signature.png"

PAPER = 240  # anything lighter than this is background
INK = 40     # anything darker than this is solid ink

src = Image.open(SOURCE).convert("RGB")
gray = src.convert("L")

# The ink colour of the original, taken from its solid strokes.
pixels = src.get_flattened_data() if hasattr(src, "get_flattened_data") else src.getdata()
grays = gray.get_flattened_data() if hasattr(gray, "get_flattened_data") else gray.getdata()
solid = [p for p, g in zip(pixels, grays) if g < INK]
ink = tuple(round(statistics.median(c[i] for c in solid)) for i in range(3))

alpha = gray.point(lambda g: 0 if g >= PAPER else 255 if g <= INK else round((PAPER - g) * 255 / (PAPER - INK)))
out = Image.new("RGBA", src.size, ink + (0,))
out.putalpha(alpha)

left, top, right, bottom = alpha.point(lambda a: 255 if a > 8 else 0).getbbox()
pad = round(max(src.size) * 0.012)
out = out.crop((max(0, left - pad), max(0, top - pad), min(src.width, right + pad), min(src.height, bottom + pad)))

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
out.save(OUTPUT, optimize=True)
print(f"ink colour {ink}; {src.size} -> {out.size}; wrote {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size // 1024} KB)")
