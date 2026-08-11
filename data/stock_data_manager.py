import datetime
import hashlib
import json
import math
import os
import random
from typing import Any, Dict, List, Optional

import pandas as pd


CONTROLLED_MARKET_MODEL_VERSION = "CSP-v1"
CONTROLLED_MARKET_ANCHOR = datetime.date(2020, 1, 1)

try:
    import akshare as ak

    AKSHARE_AVAILABLE = True
except (ImportError, ModuleNotFoundError):
    ak = None  # type: ignore[assignment]
    AKSHARE_AVAILABLE = False


class StockDataManager:
    """Extracted from mock.py so it can be reused independently.

    NOTE: For now this keeps exactly the same behaviour as the inline version in mock.py
    to avoid breaking existing logic. Later we can switch mock.py to import this class.
    """

    def __init__(self, data_file: str = "stock_data.json", use_mock_data: Optional[bool] = None) -> None:
        # Get the directory of the current file
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_file = os.path.join(self.base_dir, data_file)
        self.events_file = os.path.join(self.base_dir, "stock_events.json")
        self.data: Dict[str, Dict[str, Dict[str, Any]]] = self._load_data()
        self.events: List[Dict[str, Any]] = self._load_events()
        self.stock_list: Dict[str, str] = self._get_default_stock_list()
        self.use_mock_data: bool = self._determine_mock_mode(use_mock_data)

    def _load_data(self) -> Dict[str, Dict[str, Dict[str, Any]]]:
        """Load stored data."""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError, OSError) as e:
                print(f"Failed to load data file {self.data_file}: {e}")
                return {}
        return {}

    def _save_data(self) -> None:
        """Save data to file."""
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def _load_events(self) -> List[Dict[str, Any]]:
        """Load stock event data (good/bad news that affect mock returns)."""
        if os.path.exists(self.events_file):
            try:
                with open(self.events_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # 期望结构：list[{"code":..., "start":"YYYY-MM-DD", "days":N, "impact_pct":+/-x}]
                    if isinstance(data, list):
                        return data
            except (json.JSONDecodeError, IOError, OSError) as e:
                print(f"Failed to load stock_events.json: {e}")
        return []

    def _save_events(self) -> None:
        """Save event list to file."""
        try:
            with open(self.events_file, "w", encoding="utf-8") as f:
                json.dump(self.events, f, ensure_ascii=False, indent=2)
        except (IOError, OSError) as e:
            print(f"Failed to save stock_events.json: {e}")

    def _determine_mock_mode(self, explicit_flag: Optional[bool]) -> bool:
        """Determine whether to enable mock mode."""
        if explicit_flag is not None:
            if explicit_flag:
                return True
            if not AKSHARE_AVAILABLE:
                print("akshare unavailable, forcing mock data mode.")
                return True
            return False
        env_flag = os.environ.get("STOCK_SIM_USE_MOCK", "").strip().lower()
        if env_flag in {"1", "true", "yes", "on"}:
            return True
        return not AKSHARE_AVAILABLE

    def _get_default_stock_list(self) -> Dict[str, str]:
        """Return stock list (load from file if available, otherwise use built-in defaults)."""
        # Allow user to customize stock universe via stock_list.json in the same directory.
        custom_path = os.path.join(self.base_dir, "stock_list.json")
        if os.path.exists(custom_path):
            try:
                with open(custom_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                # Expecting a dict: {"AAPL": "Apple", ...}
                if isinstance(data, dict) and data:
                    return data
            except Exception as e:
                print(f"Failed to load custom stock_list.json, using built-in list: {e}")

        # Built-in default list
        return {
            "AAPL": "Apple",
            "MSFT": "Microsoft",
            "GOOGL": "Google",
            "AMZN": "Amazon",
            "META": "Meta",
            "TSLA": "Tesla",
            "NVDA": "NVIDIA",
            "JPM": "JPMorgan Chase",
            "JNJ": "Johnson & Johnson",
            "V": "Visa",
            "WMT": "Walmart",
            "PG": "Procter & Gamble",
            "MA": "Mastercard",
            "HD": "Home Depot",
            "BAC": "Bank of America",
        }

    def get_stock_list(self) -> Dict[str, str]:
        """Get stock list."""
        return self.stock_list

    @staticmethod
    def _stable_code_value(code: str) -> int:
        """Return a cross-process stable integer for a stock code."""
        digest = hashlib.sha256(code.encode("utf-8")).digest()
        return int.from_bytes(digest[:8], "big")

    def get_stock_data(self, code: str, date: datetime.date) -> Optional[Dict[str, Any]]:
        """Get data for specified date and stock code."""
        date_str = date.strftime("%Y-%m-%d")

        # Check if data for this date already exists
        if date_str in self.data and code in self.data[date_str]:
            print(f"Getting {code} data for {date_str} from local cache")
            return self.data[date_str][code]

        if self.use_mock_data:
            stock_data = self._generate_mock_stock_data(code, date)
            self._cache_stock_data(date_str, code, stock_data)
            return stock_data

        print(f"Getting {code} data for {date_str} from network")
        # If no data exists, fetch from network
        try:
            # Get historical data
            hist_data = ak.stock_us_daily(symbol=code, adjust="qfq")  # type: ignore[union-attr]

            if hist_data.empty:
                print(f"Stock {code} has no historical data")
                return None

            # Ensure data is sorted by date
            hist_data = hist_data.sort_values("date")

            # Get target date data
            target_price_data = hist_data[hist_data["date"] <= date_str]
            if target_price_data.empty:
                print(f"Stock {code} has no data for {date_str}")
                # Try to get the latest available data
                target_price_data = hist_data.iloc[-1]
            else:
                target_price_data = target_price_data.iloc[-1]

            target_price = target_price_data["close"]

            # Get previous day's closing price
            previous_date = date - datetime.timedelta(days=1)
            previous_date_str = previous_date.strftime("%Y-%m-%d")
            previous_price_data = hist_data[hist_data["date"] <= previous_date_str]

            if previous_price_data.empty:
                print(f"Stock {code} has no data for {previous_date_str}")
                # If no previous day data, use target date data
                previous_price = target_price
            else:
                previous_price = previous_price_data.iloc[-1]["close"]

            # Calculate price change percentage
            change_percent = ((target_price - previous_price) / previous_price) * 100

            # Build return data
            stock_data = {
                "price": float(target_price),
                "change_percent": float(change_percent),
            }

            # Save to local
            self._cache_stock_data(date_str, code, stock_data)

            return stock_data

        except Exception as e:
            print(f"Failed to get stock {code} data: {str(e)}")
            return None

    def get_stock_history(
        self,
        code: str,
        end_date: datetime.date,
        window_days: int = 60,
    ) -> Optional[pd.DataFrame]:
        """Get a deterministic, continuous synthetic OHLC history.

        The controlled path is anchored before the requested range and evolves
        from the previous close. This keeps the demo offline and reproducible
        without pretending that it is historical market validation.
        """
        return self._generate_controlled_history(code, end_date, window_days)

    def _generate_controlled_history(
        self,
        code: str,
        end_date: datetime.date,
        window_days: int,
    ) -> Optional[pd.DataFrame]:
        target_start = end_date - datetime.timedelta(days=max(window_days, 1))
        all_dates = [
            CONTROLLED_MARKET_ANCHOR + datetime.timedelta(days=offset)
            for offset in range((end_date - CONTROLLED_MARKET_ANCHOR).days + 1)
            if (CONTROLLED_MARKET_ANCHOR + datetime.timedelta(days=offset)).weekday() < 5
            and CONTROLLED_MARKET_ANCHOR + datetime.timedelta(days=offset) <= end_date
        ]
        if not all_dates:
            return None

        stable_value = self._stable_code_value(code)
        base_price = 50.0 + (stable_value % 250)
        drift = ((stable_value % 900) - 450) / 10_000_000
        close_price = base_price
        records: List[Dict[str, Any]] = []

        for date in all_dates:
            date_key = date.strftime("%Y-%m-%d")
            gap_rng = random.Random(f"{CONTROLLED_MARKET_MODEL_VERSION}:{code}:{date_key}:gap")
            return_rng = random.Random(f"{CONTROLLED_MARKET_MODEL_VERSION}:{code}:{date_key}:return")
            range_rng = random.Random(f"{CONTROLLED_MARKET_MODEL_VERSION}:{code}:{date_key}:range")
            volume_rng = random.Random(f"{CONTROLLED_MARKET_MODEL_VERSION}:{code}:{date_key}:volume")

            open_price = close_price * math.exp(gap_rng.uniform(-0.003, 0.003))
            daily_return = drift + return_rng.uniform(-0.018, 0.018)
            next_close = open_price * math.exp(daily_return)
            intraday_spread = max(open_price, next_close) * range_rng.uniform(0.002, 0.012)
            high_price = max(open_price, next_close) + intraday_spread
            low_price = max(0.01, min(open_price, next_close) - intraday_spread)
            base_volume = 1_000_000 + (stable_value % 500_000)
            volume = int(base_volume * volume_rng.uniform(0.75, 1.25))

            if date >= target_start:
                records.append({
                    "date": date_key,
                    "open": round(open_price, 2),
                    "high": round(high_price, 2),
                    "low": round(low_price, 2),
                    "close": round(next_close, 2),
                    "volume": volume,
                })
            close_price = next_close

        return pd.DataFrame(records, columns=["date", "open", "high", "low", "close", "volume"])

    def _generate_mock_stock_data(self, code: str, date: datetime.date) -> Dict[str, Any]:
        """Generate deterministic mock stock data."""
        date_str = date.strftime("%Y-%m-%d")
        rng = random.Random(f"{code}-{date_str}")
        base_price = 50 + (self._stable_code_value(code) % 250)
        change_percent = round(rng.uniform(-4.5, 4.5), 2)

        # 应用事件脚本：在事件持续期间对日涨跌幅做偏移
        if self.events:
            for ev in self.events:
                if ev.get("code") != code:
                    continue
                try:
                    start = datetime.datetime.strptime(ev.get("start", ""), "%Y-%m-%d").date()
                except Exception:
                    continue
                days = int(ev.get("days", 0))
                if days <= 0:
                    continue
                end = start + datetime.timedelta(days=days - 1)
                if start <= date <= end:
                    impact = float(ev.get("impact_pct", 0.0))
                    change_percent += impact

        price = round(base_price * (1 + change_percent / 100), 2)
        price = max(price, 5.0)
        return {
            "price": price,
            "change_percent": change_percent,
        }

    def _cache_stock_data(self, date_str: str, code: str, stock_data: Dict[str, Any]) -> None:
        """Cache stock data locally."""
        if date_str not in self.data:
            self.data[date_str] = {}
        self.data[date_str][code] = stock_data
        self._save_data()

    def add_event(self, code: str, start_date: datetime.date, days: int, impact_pct: float) -> None:
        """Add a good/bad news event for a stock.

        impact_pct: 正数表示在原有日涨跌幅基础上增加（利好），负数表示减少（利空）。
        """
        if days <= 0:
            return
        start_str = start_date.strftime("%Y-%m-%d")
        event = {
            "code": code,
            "start": start_str,
            "days": int(days),
            "impact_pct": float(impact_pct),
        }
        self.events.append(event)
        self._save_events()

        # 为了让事件立即生效，清除该股票在事件区间内的本地价格缓存
        try:
            for i in range(days):
                d = start_date + datetime.timedelta(days=i)
                d_str = d.strftime("%Y-%m-%d")
                if d_str in self.data and code in self.data[d_str]:
                    del self.data[d_str][code]
                    if not self.data[d_str]:
                        del self.data[d_str]
            self._save_data()
        except Exception as e:
            print(f"Failed to clear cached prices for event on {code}: {e}")
