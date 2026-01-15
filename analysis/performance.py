"""Performance metrics helpers.

This module is a fresh reconstruction intended to eventually replace
the inline `_build_equity_curve` and `_compute_performance_stats`
methods inside `StockTradeSimulator` in `mock.py`.
"""

import datetime
from typing import Dict, Iterable, List, Sequence, Tuple


def build_equity_curve(
    initial_cash: float,
    trades: Sequence[Dict],
    price_series: Dict[str, Dict[str, float]],
) -> List[Tuple[datetime.date, float]]:
    """Build a simple equity curve from trades and daily prices.

    This is intentionally conservative and may be refined later when we
    fully sync it with the implementation inside `mock.py`.
    """
    # Placeholder implementation – real app still uses mock.py's version.
    # We provide a minimal, consistent API for future extraction.
    curve: List[Tuple[datetime.date, float]] = []
    if not trades:
        today = datetime.date.today()
        curve.append((today, initial_cash))
        return curve

    # Very rough approximation: treat each trade date as a step in the curve.
    equity = initial_cash
    last_date: datetime.date | None = None
    for rec in trades:
        date_str = rec.get("date")
        try:
            d = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except Exception:
            continue
        amount = float(rec.get("total_amount", 0.0))
        if rec.get("trade_type") == "Buy":
            equity -= amount
        else:
            equity += amount
        last_date = d
        curve.append((d, equity))

    if not curve:
        today = datetime.date.today()
        curve.append((today, initial_cash))
    return curve


def compute_performance_stats(curve: Iterable[Tuple[datetime.date, float]]) -> Dict[str, float]:
    """Compute basic performance metrics from an equity curve.

    Returns keys compatible with `export_analysis.ExportAnalyzer`:
    - total_return
    - cagr
    - sharpe
    - max_dd
    - win_rate
    - profit_factor
    """
    points = list(curve)
    if not points:
        return {
            "total_return": 0.0,
            "cagr": 0.0,
            "sharpe": 0.0,
            "max_dd": 0.0,
            "win_rate": 0.0,
            "profit_factor": 0.0,
        }

    start_value = points[0][1]
    end_value = points[-1][1]
    if start_value <= 0:
        total_return = 0.0
    else:
        total_return = (end_value - start_value) / start_value

    # Approximate years
    days = max((points[-1][0] - points[0][0]).days, 1)
    years = days / 365.25
    cagr = (1 + total_return) ** (1 / years) - 1 if years > 0 else 0.0

    # Simple drawdown
    peak = start_value
    max_dd = 0.0
    for _, v in points:
        if v > peak:
            peak = v
        dd = (v - peak) / peak if peak > 0 else 0.0
        if dd < max_dd:
            max_dd = dd

    # For now we don't have trade-level PnL here, so we approximate
    sharpe = 0.0
    win_rate = 0.0
    profit_factor = 0.0

    return {
        "total_return": float(total_return),
        "cagr": float(cagr),
        "sharpe": float(sharpe),
        "max_dd": float(abs(max_dd)),
        "win_rate": float(win_rate),
        "profit_factor": float(profit_factor),
    }



