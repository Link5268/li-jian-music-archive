"""Create smaller WebP copies of the large images used on the site."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "source-media" / "images"
ASSETS = ROOT / "site" / "assets"
IMAGES = {
    "lijian-intro-cover.png": 86,
    "tour-poster-wanwu.png": 84,
    "tour-poster-buzhi.png": 84,
    "tour-poster-kanjian.png": 84,
    "tour-poster-xiangwang.png": 84,
}


for name, quality in IMAGES.items():
    source = SOURCES / name
    destination = ASSETS / Path(name).with_suffix(".webp")
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        image.save(destination, "WEBP", quality=quality, method=6)
    print(f"{name}: {source.stat().st_size:,} -> {destination.stat().st_size:,} bytes")
