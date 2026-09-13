"""Check tracked UTF-8 text for Han characters, including escaped literals.

Run from any directory: python3 utils/check_english.py
This is a text guard, not OCR or a check of Git history/external comments.
"""

import html
from pathlib import Path
import re
import subprocess
import sys


HAN_RANGES = (
    (0x3400, 0x4DBF), (0x4E00, 0x9FFF), (0xF900, 0xFAFF),
    (0x20000, 0x2FA1F), (0x30000, 0x3347F),
)
ESCAPE = re.compile(r"\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{8})")


def decode_escape(match):
    value = int(next(part for part in match.groups() if part is not None), 16)
    return chr(value) if value <= 0x10FFFF else match.group(0)


def contains_han(text):
    decoded = ESCAPE.sub(decode_escape, html.unescape(text))
    return any(low <= ord(char) <= high
               for char in decoded for low, high in HAN_RANGES)


def check_repository(root):
    names = subprocess.check_output(
        ["git", "ls-files", "-z"], cwd=root
    ).decode("utf-8").split("\0")
    findings = []
    checked = 0
    skipped = 0
    for name in filter(None, names):
        if contains_han(name):
            findings.append(f"{name}: filename contains Han characters")
        path = root / name
        if not path.is_file():
            continue  # A staged or working-tree deletion has no current content.
        raw = path.read_bytes()
        if b"\0" in raw:
            skipped += 1
            continue
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            skipped += 1
            continue
        checked += 1
        for number, line in enumerate(text.splitlines(), 1):
            if contains_han(line):
                findings.append(f"{name}:{number}: Han text requires English translation")
    return findings, checked, skipped


def main():
    root = Path(__file__).resolve().parents[1]
    findings, checked, skipped = check_repository(root)
    for finding in findings:
        print(finding)
    print(f"Checked {checked} tracked UTF-8 files; skipped {skipped} binary/non-UTF-8 files.")
    print(f"Han-text findings: {len(findings)}")
    return 1 if findings else 0


if __name__ == "__main__":
    sys.exit(main())
