"""
Stock data service — generates mock stock prices and K-line data.
"""
import sys
import os
import datetime
import random
import hashlib
from typing import Dict, List, Optional

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from data.stock_data_manager import StockDataManager

STOCK_UNIVERSE = {
    "AAPL": {"name": "Apple", "exchange": "NASDAQ"},
    "MSFT": {"name": "Microsoft", "exchange": "NASDAQ"},
    "GOOGL": {"name": "Alphabet", "exchange": "NASDAQ"},
    "AMZN": {"name": "Amazon", "exchange": "NASDAQ"},
    "META": {"name": "Meta", "exchange": "NASDAQ"},
    "TSLA": {"name": "Tesla", "exchange": "NASDAQ"},
    "NVDA": {"name": "NVIDIA", "exchange": "NASDAQ"},
    "JPM": {"name": "JPMorgan Chase", "exchange": "NYSE"},
    "JNJ": {"name": "Johnson & Johnson", "exchange": "NYSE"},
    "V": {"name": "Visa", "exchange": "NYSE"},
    "WMT": {"name": "Walmart", "exchange": "NYSE"},
    "PG": {"name": "Procter & Gamble", "exchange": "NYSE"},
    "MA": {"name": "Mastercard", "exchange": "NYSE"},
    "HD": {"name": "Home Depot", "exchange": "NYSE"},
    "BAC": {"name": "Bank of America", "exchange": "NYSE"},
}

_data_manager: Optional[StockDataManager] = None


def get_data_manager() -> StockDataManager:
    global _data_manager
    if _data_manager is None:
        _data_manager = StockDataManager(use_mock_data=True)
    return _data_manager


def get_stock_universe() -> List[dict]:
    return [{"code": k, "name": v["name"], "exchange": v["exchange"]} for k, v in STOCK_UNIVERSE.items()]


def get_stock_prices(codes: Optional[List[str]] = None) -> List[dict]:
    dm = get_data_manager()
    today = datetime.date.today()
    if codes is None:
        codes = list(STOCK_UNIVERSE.keys())[:10]

    results = []
    for code in codes:
        data = dm.get_stock_data(code, today)
        if data:
            results.append({
                "code": code,
                "name": STOCK_UNIVERSE.get(code, {}).get("name", code),
                "price": round(data["price"], 2),
                "change_percent": round(data["change_percent"], 2),
            })
    return results


def get_kline_data(code: str, days: int = 60) -> Optional[dict]:
    dm = get_data_manager()
    end_date = datetime.date.today()
    df = dm.get_stock_history(code, end_date, window_days=days)
    if df is None:
        return None

    return {
        "dates": df["date"].tolist(),
        "open": df["open"].tolist(),
        "high": df["high"].tolist(),
        "low": df["low"].tolist(),
        "close": df["close"].tolist(),
        "volume": df["volume"].tolist(),
        "code": code,
        "name": STOCK_UNIVERSE.get(code, {}).get("name", code),
    }
