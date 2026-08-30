import json
import os
import subprocess
import sys
import unittest
from datetime import date

import pandas as pd

from data.stock_data_manager import CONTROLLED_MARKET_MODEL_VERSION, StockDataManager


class ControlledHistoryTests(unittest.TestCase):
    def setUp(self):
        self.manager = StockDataManager(data_file="controlled-history-test.json", use_mock_data=True)

    def test_path_is_continuous_and_ohlc_is_coherent(self):
        history = self.manager.get_stock_history("AAPL", date(2026, 7, 1), window_days=90)
        self.assertIsNotNone(history)
        assert history is not None

        dates = [date.fromisoformat(value) for value in history["date"]]
        self.assertTrue(all(day.weekday() < 5 for day in dates))
        self.assertTrue(all(history["open"] > 0))
        self.assertTrue(all(history["close"] > 0))
        self.assertTrue(all(history["low"] <= history["open"]))
        self.assertTrue(all(history["low"] <= history["close"]))
        self.assertTrue(all(history["high"] >= history["open"]))
        self.assertTrue(all(history["high"] >= history["close"]))

        for index in range(1, len(history)):
            previous_close = float(history.iloc[index - 1]["close"])
            current_open = float(history.iloc[index]["open"])
            self.assertLess(abs(current_open / previous_close - 1), 0.01)

    def test_same_path_is_exactly_reproducible(self):
        first = self.manager.get_stock_history("MSFT", date(2026, 7, 1), window_days=90)
        second = self.manager.get_stock_history("MSFT", date(2026, 7, 1), window_days=90)
        pd.testing.assert_frame_equal(first, second)

    def test_path_is_independent_of_python_hash_seed(self):
        script = (
            "import json; from datetime import date; "
            "from data.stock_data_manager import StockDataManager, CONTROLLED_MARKET_MODEL_VERSION; "
            "df=StockDataManager(data_file='controlled-history-subprocess.json', use_mock_data=True).get_stock_history('NVDA', date(2026,7,1), 90); "
            "print(json.dumps({'version': CONTROLLED_MARKET_MODEL_VERSION, 'data': df.to_dict('records')}, sort_keys=True))"
        )
        outputs = []
        for seed in ("1", "98765"):
            env = {**os.environ, "PYTHONHASHSEED": seed}
            result = subprocess.run([sys.executable, "-c", script], check=True, capture_output=True, text=True, env=env)
            outputs.append(json.loads(result.stdout))
        self.assertEqual(outputs[0], outputs[1])
        self.assertEqual(outputs[0]["version"], CONTROLLED_MARKET_MODEL_VERSION)


if __name__ == "__main__":
    unittest.main()
