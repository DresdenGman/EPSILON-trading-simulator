#!/usr/bin/env python3
"""Build polished 16:9 scene cards for the EPSILON product film."""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


W, H = 1920, 1080
NAVY = (5, 17, 32)
INK = (241, 245, 247)
MUTED = (164, 180, 193)
TEAL = (62, 207, 185)
GOLD = (204, 178, 119)
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
SERIF = "/System/Library/Fonts/Supplemental/Georgia.ttf"


def font(size: int, bold: bool = False, serif: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(SERIF if serif else (BOLD if bold else FONT), size)


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    ratio = max(size[0] / image.width, size[1] / image.height)
    resized = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.Resampling.LANCZOS)
    left = (resized.width - size[0]) // 2
    top = (resized.height - size[1]) // 2
    return resized.crop((left, top, left + size[0], top + size[1]))


def backdrop(source: Image.Image, strength: int = 214) -> Image.Image:
    base = cover(source.convert("RGB"), (W, H)).filter(ImageFilter.GaussianBlur(26)).convert("RGBA")
    base.alpha_composite(Image.new("RGBA", (W, H), (*NAVY, strength)))
    return base


def add_brand(draw: ImageDraw.ImageDraw, step: str) -> None:
    draw.text((90, 62), "EPSILON", font=font(27, bold=True), fill=INK)
    draw.text((242, 65), "/  DECISION LAB", font=font(20), fill=MUTED)
    draw.text((1660, 65), step, font=font(20, bold=True), fill=TEAL)
    draw.line((90, 112, 1830, 112), fill=(71, 92, 110, 140), width=1)


def add_card(base: Image.Image, shot: Image.Image, crop_box=None) -> None:
    if crop_box:
        shot = shot.crop(crop_box)
    fitted = cover(shot.convert("RGB"), (1640, 700))
    mask = Image.new("L", fitted.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, fitted.width, fitted.height), radius=22, fill=255)
    shadow = Image.new("RGBA", (1700, 760), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((30, 28, 1670, 728), radius=24, fill=(0, 0, 0, 155))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    base.alpha_composite(shadow, (110, 246))
    card = Image.new("RGBA", fitted.size, (0, 0, 0, 0))
    card.paste(fitted, (0, 0), mask)
    ImageDraw.Draw(card).rounded_rectangle((0, 0, fitted.width - 1, fitted.height - 1), radius=22, outline=(93, 124, 143, 160), width=2)
    base.alpha_composite(card, (140, 235))


def product_scene(source: Image.Image, step: str, kicker: str, title: str, note: str, crop_box=None) -> Image.Image:
    base = backdrop(source)
    draw = ImageDraw.Draw(base)
    add_brand(draw, step)
    draw.text((140, 143), kicker.upper(), font=font(21, bold=True), fill=GOLD)
    draw.text((140, 178), title, font=font(48, bold=True), fill=INK)
    draw.text((140, 995), note, font=font(26), fill=MUTED)
    draw.ellipse((1608, 986, 1620, 998), fill=TEAL)
    draw.text((1634, 980), "REAL PRODUCT", font=font(17, bold=True), fill=MUTED)
    add_card(base, source, crop_box)
    return base


def title_scene(hero: Image.Image) -> Image.Image:
    base = cover(hero.convert("RGB"), (W, H)).convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (2, 12, 25, 0))
    od = ImageDraw.Draw(overlay)
    for x in range(W):
        alpha = int(230 * (1 - x / W) + 50)
        od.line((x, 0, x, H), fill=(2, 12, 25, min(alpha, 245)))
    base.alpha_composite(overlay)
    draw = ImageDraw.Draw(base)
    draw.text((110, 100), "QUANTITATIVE DECISION LAB", font=font(22, bold=True), fill=TEAL)
    draw.text((102, 255), "EPSILON", font=font(150), fill=INK)
    draw.line((112, 450, 720, 450), fill=GOLD, width=3)
    draw.text((110, 502), "Build a market idea.", font=font(55, serif=True), fill=INK)
    draw.text((110, 580), "Test it. Then try to break it.", font=font(55, serif=True), fill=INK)
    draw.text((110, 875), "OBSERVE  →  TEST  →  CHALLENGE", font=font(24, bold=True), fill=MUTED)
    return base


def statement_scene(hero: Image.Image) -> Image.Image:
    base = backdrop(hero, 226)
    draw = ImageDraw.Draw(base)
    add_brand(draw, "WHY IT EXISTS")
    draw.text((210, 275), "A result without its assumptions", font=font(61, serif=True), fill=INK)
    draw.text((210, 365), "is not evidence.", font=font(82, serif=True), fill=TEAL)
    draw.line((212, 505, 1640, 505), fill=(93, 124, 143, 150), width=2)
    draw.text((215, 565), "EPSILON keeps the question, configuration, provenance,", font=font(33), fill=MUTED)
    draw.text((215, 620), "metrics, and failure condition attached to every test.", font=font(33), fill=MUTED)
    draw.text((215, 820), "Not investment advice. A laboratory for disciplined reasoning.", font=font(22, bold=True), fill=GOLD)
    return base


def closing_scene(hero: Image.Image) -> Image.Image:
    base = cover(hero.convert("RGB"), (W, H)).filter(ImageFilter.GaussianBlur(3)).convert("RGBA")
    base.alpha_composite(Image.new("RGBA", (W, H), (3, 15, 29, 205)))
    draw = ImageDraw.Draw(base)
    draw.text((W // 2, 235), "EPSILON", anchor="mm", font=font(116), fill=INK)
    draw.text((W // 2, 350), "Quantitative Decision Lab", anchor="mm", font=font(40, serif=True), fill=GOLD)
    draw.text((W // 2, 500), "Observe. Test. Challenge. Retest.", anchor="mm", font=font(35, bold=True), fill=TEAL)
    draw.rounded_rectangle((450, 640, 1470, 730), radius=45, fill=(7, 28, 43, 230), outline=(62, 207, 185, 180), width=2)
    draw.text((W // 2, 685), "epsilon-livid.vercel.app", anchor="mm", font=font(31, bold=True), fill=INK)
    draw.text((W // 2, 845), "OPEN SOURCE  /  github.com/DresdenGman/EPSILON-trading-simulator", anchor="mm", font=font(21), fill=MUTED)
    return base


def main() -> None:
    repo = Path(sys.argv[1])
    output = Path(sys.argv[2])
    output.mkdir(parents=True, exist_ok=True)
    hero = Image.open(repo / "website/public/social/epsilon-social-preview-v1.jpg")
    landing = Image.open(repo / "docs/screenshots/landing.png")
    lab = Image.open(repo / "docs/screenshots/strategy-lab.png")

    scenes = [
        title_scene(hero),
        product_scene(landing, "01 / OBSERVE", "Start with a question", "Turn intuition into a falsifiable claim.", "One clear entry point. One research path."),
        product_scene(lab, "02 / DEFINE", "Make the setup explicit", "Fix the test before reading the result.", "Strategy, window, universe, and capital remain visible.", (0, 0, 650, 712)),
        product_scene(lab, "03 / TEST", "Inspect the whole result", "Metrics, trades, inputs, and boundaries stay together.", "A clean number never outranks its evidence."),
        statement_scene(hero),
        closing_scene(hero),
    ]
    for index, scene in enumerate(scenes, start=1):
        scene.convert("RGB").save(output / f"scene-{index:02d}.jpg", quality=94, subsampling=0)


if __name__ == "__main__":
    main()
