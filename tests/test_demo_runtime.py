import contextlib
import io
import unittest

from backend.services.backtest_service import run_backtest


PRIMARY = ("2026-04-01", "2026-07-01")
REPLICATION = ("2026-01-01", "2026-03-31")
PAYLOAD = {
    "strategy_name": "momentum",
    "stock_codes": ["AAPL", "MSFT", "NVDA"],
    "initial_cash": 100000.0,
    "fee_rate": 0.0001,
    "min_fee": 1.0,
}


def run_window(window, slippage):
    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        return run_backtest(
            PAYLOAD["strategy_name"], window[0], window[1], PAYLOAD["stock_codes"],
            PAYLOAD["initial_cash"], PAYLOAD["fee_rate"], PAYLOAD["min_fee"], slippage,
        )


class DemoRuntimeTests(unittest.TestCase):
    def test_replication_window_is_fixed_and_non_overlapping(self):
        self.assertEqual(REPLICATION, ("2026-01-01", "2026-03-31"))
        self.assertLess(REPLICATION[1], PRIMARY[0])

    def test_identical_replication_payload_is_deterministic(self):
        first = run_window(REPLICATION, 0.01)
        second = run_window(REPLICATION, 0.01)
        self.assertEqual(first["performance"], second["performance"])
        self.assertEqual(first["trades"], second["trades"])
        self.assertEqual(first["equity_curve"], second["equity_curve"])


if __name__ == "__main__":
    unittest.main()
