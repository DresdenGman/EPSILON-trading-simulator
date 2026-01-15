"""Standalone entrypoint for the trading simulator.

For now this simply reuses the StockTradeSimulator defined in mock.py
to stay backward compatible, but it gives us a clean main entry for
future modularization and branding (EPSILON).
"""

import tkinter as tk

from mock import StockTradeSimulator


def main() -> None:
    root = tk.Tk()
    app = StockTradeSimulator(root)  # noqa: F841
    root.mainloop()


if __name__ == "__main__":
    main()


