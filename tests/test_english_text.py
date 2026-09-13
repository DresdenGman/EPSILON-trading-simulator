"""Regression tests for the repository's English text guard (standard library only)."""

import unittest

from utils.check_english import contains_han


class EnglishTextTests(unittest.TestCase):
    def test_plain_han(self):
        self.assertTrue(contains_han(chr(0x4E2D)))
        self.assertTrue(contains_han(chr(0x20000)))

    def test_escaped_han(self):
        self.assertTrue(contains_han("\\" + "u4e2d"))
        self.assertTrue(contains_han("\\" + "u{4e2d}"))
        self.assertTrue(contains_han("\\" + "U00020000"))
        self.assertTrue(contains_han("&" + "#20013;"))
        self.assertTrue(contains_han("&" + "#x4e2d;"))

    def test_english_symbols_and_invalid_escape(self):
        self.assertFalse(contains_han("EPSILON — 2.5-week cycle; ±4.5%; π"))
        self.assertFalse(contains_han("\\" + "UFFFFFFFF"))


if __name__ == "__main__":
    unittest.main()
