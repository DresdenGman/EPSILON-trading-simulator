"""Correctness checks for isolated, next-bar backtests."""

import datetime
import tempfile
from pathlib import Path

import pandas as pd

from strategies.backtest_engine import BacktestEngine
from strategies.base_strategy import BaseStrategy
from trading.trade_manager import TradeManager


class BuyOnceStrategy(BaseStrategy):
    def init(self):
        self.has_signalled = False

    def next(self, current_data, portfolio):
        if self.has_signalled:
            return []
        self.has_signalled = True
        return [("buy", "AAPL", 1)]


def test_non_persistent_trade_manager_ignores_disk_state():
    with tempfile.TemporaryDirectory() as directory:
        manager = TradeManager(initial_cash=1234.0, persist=False)
        manager.data_file = str(Path(directory) / "trade_data.json")

        assert manager.get_cash() == 1234.0
        assert manager.get_trade_records() == []
        assert manager.get_portfolio() == {}

        manager.add_trade_record("2026-01-01", "AAPL", "Apple", "Buy", 1, 10.0, 10.0)
        assert manager.get_trade_records()
        assert not Path(manager.data_file).exists()


def test_backtest_uses_next_bar_price_and_isolated_manager():
    dates = pd.date_range("2026-01-05", periods=3, freq="B")
    prices = pd.DataFrame({
        "date": dates.strftime("%Y-%m-%d"),
        "open": [10.0, 20.0, 30.0],
        "high": [10.0, 20.0, 30.0],
        "low": [10.0, 20.0, 30.0],
        "close": [10.0, 20.0, 30.0],
        "volume": [1000, 1000, 1000],
    })

    class FakeDataManager:
        stock_list = {"AAPL": "Apple"}

        def __init__(self, use_mock_data=None):
            pass

        def get_stock_history(self, code, end_date, window_days=90):
            return prices

    import strategies.backtest_engine as backtest_module
    original_manager = backtest_module.StockDataManager
    backtest_module.StockDataManager = FakeDataManager
    try:
        engine = BacktestEngine(
            BuyOnceStrategy(), initial_cash=100.0, fee_rate=0.0, min_fee=0.0, use_mock_data=True
        )
        result = engine.run(datetime.date(2026, 1, 5), datetime.date(2026, 1, 7), ["AAPL"])
    finally:
        backtest_module.StockDataManager = original_manager

    assert engine.trade_manager.persist is False
    assert len(result["trades"]) == 1
    assert result["trades"][0]["date"] == "2026-01-06"
    assert result["trades"][0]["price"] == 20.0
