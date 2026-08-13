#!/usr/bin/env python3
"""Render the lower-third used by the EPSILON product video."""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def main() -> None:
    output = Path(sys.argv[1])
    kicker = sys.argv[2]
    message = sys.argv[3]
    message_size = int(sys.argv[4])
    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"

    canvas = Image.new("RGBA", (1920, 260), (7, 19, 35, 230))
    draw = ImageDraw.Draw(canvas)
    kicker_font = ImageFont.truetype(font_path, 31)
    message_font = ImageFont.truetype(font_path, message_size)

    draw.text((90, 34), kicker, font=kicker_font, fill=(62, 207, 185, 255))
    draw.text((90, 112), message, font=message_font, fill=(255, 255, 255, 255))
    canvas.save(output)


if __name__ == "__main__":
    main()
