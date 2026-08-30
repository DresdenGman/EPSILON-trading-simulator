"""
Backtest service — runs strategies on historical data.
"""
import sys
import os
import datetime
from typing import Dict, List, Optional

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from strategies.backtest_engine import BacktestEngine
from strategies.base_strategy import BaseStrategy
from trading.trade_manager import TradeManager
from data.stock_data_manager import StockDataManager


class StrategyRegistry:
    _strategies: Dict[str, type] = {}

    @classmethod
    def register(cls, name: str):
        def decorator(strategy_cls):
            cls._strategies[name] = strategy_cls
            return strategy_cls
        return decorator

    @classmethod
    def get(cls, name: str) -> Optional[type]:
        return cls._strategies.get(name)

    @classmethod
    def list_names(cls) -> List[str]:
        return list(cls._strategies.keys())


@StrategyRegistry.register("buy_and_hold")
class BuyAndHoldStrategy(BaseStrategy):
    def __init__(self):
        self.name = "Buy & Hold"
        self.bought = False

    def init(self):
        self.bought = False

    def get_name(self) -> str:
        return self.name

    def next(self, current_data: dict, portfolio: dict) -> list:
        if self.bought:
            return []
        available = current_data.get("available_stocks", [])
        if not available:
            return []
        code = available[0]
        price = current_data["prices"].get(code, 0)
        cash = current_data.get("cash", 0)
        if price <= 0 or cash <= 0:
            return []
        shares = int(cash * 0.95 / price)
        if shares > 0:
            self.bought = True
            return [("buy", code, shares)]
        return []


@StrategyRegistry.register("moving_average")
class MovingAverageStrategy(BaseStrategy):
    def __init__(self):
        self.name = "Moving Average (20-day)"

    def init(self):
        pass

    def get_name(self) -> str:
        return self.name

    def next(self, current_data: dict, portfolio: dict) -> list:
        signals = []
        prices = current_data.get("prices", {})
        history = current_data.get("history", {})
        cash = current_data.get("cash", 0)

        for code in current_data.get("available_stocks", []):
            df = history.get(code)
            if df is None or len(df) < 20:
                continue
            closes = df["close"].values
            ma_short = float(np.mean(closes[-5:]))
            ma_long = float(np.mean(closes[-20:]))
            current_price = float(prices.get(code, 0))
            if current_price <= 0:
                continue

            held = portfolio.get(code, 0)
            if ma_short > ma_long and held == 0 and cash > 0:
                shares = max(1, int(cash * 0.1 / current_price))
                signals.append(("buy", code, shares))
            elif ma_short < ma_long and held > 0:
                signals.append(("sell", code, held))

        return signals


import numpy as np


@StrategyRegistry.register("momentum")
class MomentumStrategy(BaseStrategy):
    def __init__(self):
        self.name = "Momentum (2%)"

    def init(self):
        pass

    def get_name(self) -> str:
        return self.name

    def next(self, current_data: dict, portfolio: dict) -> list:
        signals = []
        prices = current_data.get("prices", {})
        history = current_data.get("history", {})
        cash = current_data.get("cash", 0)

        for code in current_data.get("available_stocks", []):
            df = history.get(code)
            if df is None or len(df) < 5:
                continue
            closes = df["close"].values
            momentum = (closes[-1] - closes[-5]) / closes[-5]
            current_price = float(prices.get(code, 0))
            if current_price <= 0:
                continue

            held = portfolio.get(code, 0)
            if momentum > 0.02 and held == 0 and cash > 0:
                shares = max(1, int(cash * 0.15 / current_price))
                signals.append(("buy", code, shares))
            elif momentum < -0.02 and held > 0:
                signals.append(("sell", code, held))

        return signals


def run_backtest(strategy_name: str, start_date: str, end_date: str,
                 stock_codes: Optional[List[str]] = None,
                 initial_cash: float = 100000.0, fee_rate: float = 0.0001,
                 min_fee: float = 1.0, slippage_per_share: float = 0.0) -> dict:
    strategy_cls = StrategyRegistry.get(strategy_name)
    if not strategy_cls:
        return {"error": f"Unknown strategy: {strategy_name}"}

    strategy = strategy_cls()

    start = datetime.date.fromisoformat(start_date)
    end = datetime.date.fromisoformat(end_date)

    engine = BacktestEngine(
        strategy=strategy,
        initial_cash=initial_cash,
        fee_rate=fee_rate,
        min_fee=min_fee,
        slippage_per_share=slippage_per_share,
        use_mock_data=True,
    )

    result = engine.run(start, end, stock_codes)

    return {
        "strategy_name": result["strategy_name"],
        "performance": {
            "total_return": round(float(result["performance"]["total_return"]) * 100, 2),
            "cagr": round(float(result["performance"]["cagr"]) * 100, 2),
            "sharpe": round(float(result["performance"]["sharpe"]), 4),
            "max_drawdown": round(float(result["performance"]["max_drawdown"]) * 100, 2),
            "win_rate": round(float(result["performance"]["win_rate"]) * 100, 2),
            "profit_factor": round(float(result["performance"]["profit_factor"]), 2),
        },
        "trades": [
            {
                "date": str(t.get("date", "")),
                "stock_code": str(t.get("stock_code", "")),
                "stock_name": str(t.get("stock_name", "")),
                "trade_type": str(t.get("trade_type", "")),
                "shares": int(t.get("shares", 0)),
                "price": float(t.get("price", 0)),
                "total_amount": float(t.get("total_amount", 0)),
            }
            for t in result["trades"]
        ],
        "equity_curve": [
            {"date": str(d), "equity": float(v)}
            for d, v in result["equity_curve"]
        ],
    }


def list_strategies() -> List[dict]:
    return [{"name": name, "label": cls().get_name()} for name, cls in StrategyRegistry._strategies.items()]
