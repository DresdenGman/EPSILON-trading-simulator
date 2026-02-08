import tkinter as tk  # Import tkinter module and rename it as tk
import random  # Import random module for generating random numbers
from tkinter import messagebox  # Import messagebox from tkinter for displaying message boxes
from tkinter import simpledialog  # Import simpledialog for user input dialogs
import datetime  # Import datetime module for date manipulation
from tkcalendar import Calendar, DateEntry  # Import Calendar and DateEntry from tkcalendar
from tkinter import ttk  # Import ttk for Combobox
import threading
import time
import json
import os

# Note: ttkbootstrap is disabled due to incompatibility with tkcalendar.Calendar
# The Calendar widget requires standard tkinter.ttk, which ttkbootstrap replaces
# Since the visual changes from ttkbootstrap are minimal, we use standard ttk with custom styling
TTKBOOTSTRAP_AVAILABLE = False
ttkb = None

try:
    import matplotlib
    from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
    from matplotlib.figure import Figure
    MATPLOTLIB_AVAILABLE = True
except Exception:
    matplotlib = None
    FigureCanvasTkAgg = None
    Figure = None
    MATPLOTLIB_AVAILABLE = False

try:
    import mplfinance as mpf
    MPLFINANCE_AVAILABLE = True
except Exception:
    mpf = None
    MPLFINANCE_AVAILABLE = False
try:
    import akshare as ak
    AKSHARE_AVAILABLE = True
except Exception:
    ak = None
    AKSHARE_AVAILABLE = False
import pandas as pd
import numpy as np
import csv
from tkinter import filedialog
try:
    from analysis.export_analysis import ExportAnalyzer
    EXPORT_ANALYSIS_AVAILABLE = True
except Exception:
    ExportAnalyzer = None
    EXPORT_ANALYSIS_AVAILABLE = False

# Modern UI components (CustomTkinter wrapper)
try:
    from ui.modern_ui import ModernUI, configure_matplotlib_theme
    MODERN_UI_AVAILABLE = True
except Exception:
    ModernUI = None
    configure_matplotlib_theme = None
    MODERN_UI_AVAILABLE = False

# Path utilities for handling resource paths and user data directories
try:
    from path_utils import (
        resource_path,
        get_user_data_dir,
        get_user_data_file,
        get_config_file,
        ensure_user_data_dir
    )
    PATH_UTILS_AVAILABLE = True
except Exception:
    # Fallback if path_utils is not available
    PATH_UTILS_AVAILABLE = False
    def resource_path(relative_path):
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), relative_path)
    def get_user_data_file(filename):
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    def get_config_file(filename):
        base = os.path.dirname(os.path.abspath(__file__))
        return os.path.join(base, filename), os.path.join(base, filename)

# Version information
try:
    from version import VERSION, VERSION_INFO, get_version_string, get_full_version_info, DISCLAIMER_TEXT
    VERSION_AVAILABLE = True
except Exception:
    VERSION = "1.0.0"
    VERSION_INFO = {"app_name": "Stock Trading Simulator", "version": VERSION}
    def get_version_string():
        return f"v{VERSION}"
    def get_full_version_info():
        return f"Stock Trading Simulator {get_version_string()}"
    DISCLAIMER_TEXT = "This software is for educational purposes only. Use at your own risk."
    VERSION_AVAILABLE = False

# Challenge scoring - implemented directly in the class


class StockDataManager:
    def __init__(self, data_file="stock_data.json", use_mock_data=None):
        # Ensure user data directory exists
        if PATH_UTILS_AVAILABLE:
            ensure_user_data_dir()
            # Use user data directory for cache data (stock_data.json)
            self.data_file = get_user_data_file(data_file)
            # For config files, check user data first, then default location
            self.events_file_user, self.events_file_default = get_config_file("stock_events.json")
            self.base_dir = os.path.dirname(os.path.abspath(__file__))  # Keep for compatibility
        else:
            # Fallback to old behavior
            self.base_dir = os.path.dirname(os.path.abspath(__file__))
            self.data_file = os.path.join(self.base_dir, data_file)
            self.events_file_user = os.path.join(self.base_dir, "stock_events.json")
            self.events_file_default = self.events_file_user
        
        self.data = self._load_data()
        self.events = self._load_events()
        self.stock_list = self._get_default_stock_list()
        self.use_mock_data = self._determine_mock_mode(use_mock_data)
        
        # Initialize stress testing (stage 1: jump diffusion)
        try:
            from analysis.stress_test import StressTestConfig, JumpDiffusionModel, create_default_config
            self.stress_config = create_default_config()
            self.jump_model = JumpDiffusionModel(self.stress_config)
        except ImportError:
            # If stress test module not available, disable it
            self.stress_config = None
            self.jump_model = None
        
    def _load_data(self):
        """Load stored data"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return {}
        return {}
    
    def _save_data(self):
        """Save data to file"""
        with open(self.data_file, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def _load_events(self):
        """Load stock event data (good/bad news that affect mock returns)."""
        # Try user config first, then default
        for events_file in [self.events_file_user, self.events_file_default]:
            if os.path.exists(events_file):
                try:
                    with open(events_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        # Expected structure: list[{"code":..., "start":"YYYY-MM-DD", "days":N, "impact_pct":+/-x}]
                        if isinstance(data, list):
                            return data
                except Exception as e:
                    print(f"Failed to load stock_events.json from {events_file}: {e}")
        return []

    def _save_events(self):
        """Save event list to file."""
        try:
            # Save to user data directory
            with open(self.events_file_user, 'w', encoding='utf-8') as f:
                json.dump(self.events, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save stock_events.json: {e}")
    
    def _determine_mock_mode(self, explicit_flag):
        """Determine whether to enable mock mode"""
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
    
    def _get_default_stock_list(self):
        """Return stock list (load from file if available, otherwise use built-in defaults)"""
        # Allow user to customize stock universe via stock_list.json
        # Check user data directory first, then default location
        if PATH_UTILS_AVAILABLE:
            custom_path_user, custom_path_default = get_config_file("stock_list.json")
            custom_paths = [custom_path_user, custom_path_default]
        else:
            custom_paths = [os.path.join(self.base_dir, "stock_list.json")]
        
        for custom_path in custom_paths:
            if os.path.exists(custom_path):
                try:
                    with open(custom_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    # Expecting a dict: {"AAPL": "Apple", ...}
                    if isinstance(data, dict) and data:
                        return data
                except Exception as e:
                    print(f"Failed to load custom stock_list.json from {custom_path}, trying next: {e}")
                    continue

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
            "BAC": "Bank of America"
        }
    
    def get_stock_list(self):
        """Get stock list"""
        return self.stock_list
    
    def get_stock_data(self, code, date):
        """Get data for specified date and stock code"""
        date_str = date.strftime("%Y-%m-%d")
        today = datetime.date.today()
        
        # Validate date: if using real data and date is in the future, reject it
        if not self.use_mock_data and date > today:
            print(f"Warning: Cannot get real stock data for future date {date_str}. Real data is only available for historical dates up to today ({today.strftime('%Y-%m-%d')}).")
            # Remove invalid cache entry if exists
            if date_str in self.data and code in self.data[date_str]:
                del self.data[date_str][code]
                if not self.data[date_str]:
                    del self.data[date_str]
                    self._save_data()
            return None
        
        # Check if data for this date already exists
        if date_str in self.data and code in self.data[date_str]:
            cached_data = self.data[date_str][code]
            # Check data source marker
            data_source = cached_data.get('_data_source', None)
            
            # Validate cached data: if using real data and date is in the future, don't use cache
            if not self.use_mock_data and date > today:
                print(f"Warning: Cached data for future date {date_str} ignored (real data mode)")
                # Remove invalid cache entry
                del self.data[date_str][code]
                if not self.data[date_str]:
                    del self.data[date_str]
                    self._save_data()
                return None
            
            # If we're in real data mode but cache contains mock data, don't use it
            if not self.use_mock_data and data_source == 'mock':
                print(f"Warning: Cached mock data for {code} on {date_str} ignored (real data mode). Fetching real data...")
                # Remove mock data from cache
                del self.data[date_str][code]
                if not self.data[date_str]:
                    del self.data[date_str]
                    self._save_data()
                # Continue to fetch real data below
            else:
                print(f"Getting {code} data for {date_str} from local cache (source: {data_source or 'unknown'})")
                # Remove internal marker before returning
                result = cached_data.copy()
                result.pop('_data_source', None)
                return result
        
        if self.use_mock_data:
            # Mock data mode: can generate data for any date including future
            stock_data = self._generate_mock_stock_data(code, date)
            self._cache_stock_data(date_str, code, stock_data, is_mock_data=True)
            return stock_data
        
        # If no data exists, fetch from network
        if not AKSHARE_AVAILABLE:
            print("akshare not available, cannot fetch real stock data")
            return None

        print(f"Getting {code} data for {date_str} from network")

            # Get historical data
        try:
            hist_data = ak.stock_us_daily(symbol=code, adjust='qfq')
        except Exception as e:
            print(f"Failed to fetch real data for {code}: {e}")
            return None
            
        if hist_data is None or hist_data.empty:
            print(f"Stock {code} has no historical data")
            return None
            
        # Ensure data is sorted by date
        hist_data = hist_data.sort_values('date')
            
        # Get the latest available date from the data
        latest_date_str = hist_data.iloc[-1]['date']
        try:
            latest_date = datetime.datetime.strptime(latest_date_str, '%Y-%m-%d').date()
        except Exception:
            # Try other date formats
            try:
                latest_date = pd.to_datetime(latest_date_str).date()
            except Exception:
                latest_date = today
        
        # Check if requested date is in the future
        if date > today:
            print(f"Warning: Requested date {date_str} is in the future. Real stock data is not available for future dates.")
            return None
        
        # Check if requested date is after latest available data
        if date > latest_date:
            print(
                f"Warning: Requested date {date_str} is after latest available data ({latest_date_str}). "
                f"Real stock data is not available for that date."
            )
            return None
        
        # Get target date data (date is valid and within available range)
            target_price_data = hist_data[hist_data['date'] <= date_str]

            if target_price_data.empty:

                print(f"Stock {code} has no data for {date_str} (may be weekend/holiday)")
                return None
            else:

                target_price_data = target_price_data.iloc[-1]
                
            target_price = target_price_data['close']

            
            # Get previous day's closing price
            previous_date = date - datetime.timedelta(days=1)

            previous_date_str = previous_date.strftime("%Y-%m-%d")

            previous_price_data = hist_data[hist_data['date'] <= previous_date_str]

            
            if previous_price_data.empty:

                print(f"Stock {code} has no data for {previous_date_str}")
                # If no previous day data, use target date data
                previous_price = target_price
            else:

                previous_price = previous_price_data.iloc[-1]['close']
            
            # Calculate price change percentage

            change_percent = ((target_price - previous_price) / previous_price) * 100

            
            # Build return data

            stock_data = {

                "price": target_price,

                "change_percent": change_percent

        }

            
        # Save to local (only cache valid historical dates)

        if date <= today:

            self._cache_stock_data(date_str, code, stock_data, is_mock_data=False)

            
        return stock_data

    def get_stock_history(self, code, end_date, window_days=60):
        """Get historical OHLC data for k-line chart.
        Returns a pandas DataFrame with columns: date, open, high, low, close, volume.
        
        IMPORTANT: In real data mode, this method uses akshare to fetch REAL historical data.
        Only in mock data mode will it generate synthetic data.
        """
        # Real data mode: use akshare to fetch real historical data
        if not self.use_mock_data and AKSHARE_AVAILABLE:
            max_retries = 3
            retry_delay = 1  # seconds
            
            for attempt in range(max_retries):
                try:
                    # Add small delay to avoid API rate limiting (except first attempt)
                    if attempt > 0:
                        time.sleep(retry_delay * attempt)
                    
                    print(f"Fetching REAL historical data for {code} from akshare... (attempt {attempt + 1}/{max_retries})")
                # Fetch historical data
                    hist_data = ak.stock_us_daily(symbol=code, adjust='qfq')
                
                    if hist_data.empty:
                        print(f"Warning: No real historical data available for {code}. Falling back to mock data.")
                        return self._generate_mock_history(code, end_date, window_days)
                
                # Ensure data is sorted by date
                    hist_data = hist_data.sort_values('date')
                
                # Convert date format
                    if 'date' in hist_data.columns:
                        hist_data['date'] = pd.to_datetime(hist_data['date']).dt.date
                    elif hist_data.index.name == 'date' or isinstance(hist_data.index, pd.DatetimeIndex):
                        hist_data = hist_data.reset_index()
                    if 'date' in hist_data.columns:
                        hist_data['date'] = pd.to_datetime(hist_data['date']).dt.date
                
                        # Calculate start date (window_days days before end_date)
                        end_date_obj = end_date.date() if isinstance(end_date, datetime.datetime) else end_date
                        start_date = end_date_obj - datetime.timedelta(days=window_days)
                
                # Filter date range
                    hist_data = hist_data[hist_data['date'] <= end_date_obj]
                    hist_data = hist_data[hist_data['date'] >= start_date]
                
                    if hist_data.empty:
                        print(f"Warning: No real data in date range for {code}. Falling back to mock data.")
                        return self._generate_mock_history(code, end_date, window_days)
                
                        # Keep only the last window_days days of data
                        hist_data = hist_data.tail(window_days)
                
                        # Standardize column names (akshare may use different column names)
                        column_mapping = {
                        'open': 'open',
                        'high': 'high',
                    'low': 'low',
                    'close': 'close',
                    'volume': 'volume',
                    'Open': 'open',
                    'High': 'high',
                    'Low': 'low',
                    'Close': 'close',
                    'Volume': 'volume',
                    'open_price': 'open',
                    'high_price': 'high',
                    'low_price': 'low',
                    'close_price': 'close',
                    'volume': 'volume'
                    }
                
                # Rename columns
                    for old_name, new_name in column_mapping.items():
                        if old_name in hist_data.columns:
                            hist_data = hist_data.rename(columns={old_name: new_name})
                
                            # Ensure required columns exist
                    required_columns = ['date', 'open', 'high', 'low', 'close']
                    missing_columns = [col for col in required_columns if col not in hist_data.columns]
                    if missing_columns:
                        print(f"Warning: Missing columns {missing_columns} in real data for {code}. Falling back to mock data.")
                        return self._generate_mock_history(code, end_date, window_days)
                
                    # Ensure data types are correct
                    for col in ['open', 'high', 'low', 'close']:
                        hist_data[col] = pd.to_numeric(hist_data[col], errors='coerce')
                
                # Handle volume (may not exist)
                    if 'volume' not in hist_data.columns:
                        hist_data['volume'] = 0
                    else:
                        hist_data['volume'] = pd.to_numeric(hist_data['volume'], errors='coerce').fillna(0)
                
                        # Remove invalid data
                        hist_data = hist_data.dropna(subset=['open', 'high', 'low', 'close'])
                
                        # Ensure dates are in string format
                        hist_data['date'] = hist_data['date'].apply(lambda x: x.strftime('%Y-%m-%d') if isinstance(x, datetime.date) else str(x))
                
                        # Select and reorder columns
                        result_df = hist_data[['date', 'open', 'high', 'low', 'close', 'volume']].copy()
                
                # Ensure data is sorted by date
                    result_df = result_df.sort_values('date')
                
                    print(f"Successfully fetched {len(result_df)} days of REAL data for {code}")
                    return result_df
                except Exception as e:
                    print(f"Error fetching real historical data for {code}: {e}")
                    return self._generate_mock_history(code, end_date, window_days)

                
                except (ConnectionError, TimeoutError, OSError) as e:
                    # Network-related errors - retry
                    error_msg = str(e)
                    print(f"Network error fetching history for {code} (attempt {attempt + 1}/{max_retries}): {error_msg}")
                    if attempt < max_retries - 1:
                        continue
                    else:
                        print(f"Failed to fetch history for {code} after {max_retries} attempts: {error_msg}")
                        print(f"Falling back to mock data for K-line chart.")
                        return self._generate_mock_history(code, end_date, window_days)
                except KeyError as e:
                    # Data format error - likely API response changed
                    error_msg = str(e)
                    print(f"Data format error for {code}: {error_msg}. API response may have changed.")
                    print(f"Falling back to mock data for K-line chart.")
                    return self._generate_mock_history(code, end_date, window_days)
                except Exception as e:
                    # Other errors - check if it's a retryable error
                    error_msg = str(e).lower()
                    if any(keyword in error_msg for keyword in ['timeout', 'connection', 'network', 'temporarily', 'rate limit']):
                        print(f"Retryable error fetching history for {code} (attempt {attempt + 1}/{max_retries}): {str(e)}")
                        if attempt < max_retries - 1:
                            continue
                    
                    # Non-retryable error or max retries reached
                print(f"Error fetching real historical data for {code}: {str(e)}")
                print(f"Falling back to mock data for K-line chart.")
                return self._generate_mock_history(code, end_date, window_days)
        
        # Mock data mode: generate synthetic data
        return self._generate_mock_history(code, end_date, window_days)
    
    def _generate_mock_history(self, code, end_date, window_days=60):
        """Generate mock historical OHLC data (only used in mock mode or as fallback).
        Returns a pandas DataFrame with columns: date, open, high, low, close, volume.
        """
        dates = []
        opens = []
        highs = []
        lows = []
        closes = []
        
        # Base price for this stock (deterministic)
        base_price = 50 + (abs(hash(code)) % 250)
        current_price = base_price  # Start with base price
        
        for i in range(window_days, 0, -1):
            d = end_date - datetime.timedelta(days=i) if isinstance(end_date, datetime.datetime) else end_date - datetime.timedelta(days=i)
            d = d.date() if isinstance(d, datetime.datetime) else d
            
            # Generate price based on previous day's price for continuity
            date_str = d.strftime("%Y-%m-%d")
            seed = f"{code}-{date_str}"
            rng = random.Random(seed)
            
            # Calculate daily change percentage (deterministic)
            change_percent = rng.uniform(-4.5, 4.5)
            
            # Apply events if any
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
                    if start <= d <= end:
                        impact = float(ev.get("impact_pct", 0.0))
                        change_percent += impact
            
            # Apply stress testing (jump diffusion) - Stage 1
            if self.jump_model:
                seed_jump = f"{code}-{date_str}-jump"
                change_percent, jump_occurred = self.jump_model.apply_jump(change_percent, seed_jump)
                
                # Apply extreme value distribution - Stage 2
                # Only apply if jump didn't occur (to avoid double-counting)
                if not jump_occurred:
                    seed_extreme = f"{code}-{date_str}-extreme"
                    change_percent, extreme_occurred = self.jump_model.apply_extreme_value(change_percent, seed_extreme)
            
            # Calculate close price based on previous day
            close_price = round(current_price * (1 + change_percent / 100), 2)
            close_price = max(close_price, 5.0)  # Minimum price
            
            # Update current_price for next iteration
            current_price = close_price
            
            # Generate OHLC with intraday variation
            seed_ohlc = f"{code}-{date_str}-ohlc"
            rng_ohlc = random.Random(seed_ohlc)
            spread = close_price * 0.02  # 2% intraday range baseline
            open_price = close_price + rng_ohlc.uniform(-0.5, 0.5) * spread
            high_price = max(open_price, close_price) + rng_ohlc.uniform(0.1, 0.6) * spread
            low_price = min(open_price, close_price) - rng_ohlc.uniform(0.1, 0.6) * spread

            dates.append(date_str)
            opens.append(round(open_price, 2))
            highs.append(round(high_price, 2))
            lows.append(round(low_price, 2))
            closes.append(round(close_price, 2))

        if not dates:
            return None

        # Generate synthetic volume corresponding to prices (weakly correlated with volatility and price level, for display purposes)
        volumes = []
        for i, cp in enumerate(closes):
            # Use the same deterministic random source as K-line, ensuring repeatability for the same date/stock
            d = datetime.datetime.strptime(dates[i], "%Y-%m-%d").date()
            seed = f"{code}-{d.strftime('%Y-%m-%d')}-vol"
            rng = random.Random(seed)
            base_vol = 1_000_000 + (abs(hash(code)) % 500_000)
            # Make volume slightly higher on high volatility days
            intraday_range = highs[i] - lows[i]
            vol_scale = 1.0 + min(intraday_range / max(cp, 1.0), 0.5)
            volume = int(base_vol * vol_scale * rng.uniform(0.7, 1.3))
            volumes.append(volume)

        df = pd.DataFrame({
            "date": dates,
            "open": opens,
            "high": highs,
            "low": lows,
            "close": closes,
            "volume": volumes
        })
        return df

    def _generate_mock_stock_data(self, code, date):
        """Generate deterministic mock stock data.
        
        Note: For continuous price sequences in K-line charts, use get_stock_history()
        which generates prices based on previous day's price. This method is used
        for single date lookups and may not maintain continuity.
            """
        date_str = date.strftime("%Y-%m-%d")
        rng = random.Random(f"{code}-{date_str}")
        base_price = 50 + (abs(hash(code)) % 250)
        
        # Try to get previous day's price from cache for continuity
        previous_date = date - datetime.timedelta(days=1)
        previous_date_str = previous_date.strftime("%Y-%m-%d")
        previous_price = None
        
        # Check cache for previous day's price
        if previous_date_str in self.data and code in self.data[previous_date_str]:
            previous_price = float(self.data[previous_date_str][code]["price"])
        
        # Use previous price if available, otherwise use base_price
        if previous_price is not None and previous_price > 0:
            reference_price = previous_price
        else:
            reference_price = base_price
        
        # Generate daily change percentage (deterministic based on code+date)
        change_percent = round(rng.uniform(-4.5, 4.5), 2)

        # Apply event scripts: offset daily price changes during event periods
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
        
        # Apply stress testing (jump diffusion) - Stage 1
        if self.jump_model:
            seed_jump = f"{code}-{date_str}-jump"
            change_percent, jump_occurred = self.jump_model.apply_jump(change_percent, seed_jump)
            
            # Apply extreme value distribution - Stage 2
            # Only apply if jump didn't occur (to avoid double-counting)
            if not jump_occurred:
                seed_extreme = f"{code}-{date_str}-extreme"
                change_percent, extreme_occurred = self.jump_model.apply_extreme_value(change_percent, seed_extreme)
            
            change_percent = round(change_percent, 2)  # Round after stress testing

        # Calculate price based on reference price (previous day or base)
        price = round(reference_price * (1 + change_percent / 100), 2)
        price = max(price, 5.0)  # Ensure minimum price
        
        return {
            "price": price,
            "change_percent": change_percent
        }

    def _cache_stock_data(self, date_str, code, stock_data, is_mock_data=None):
        """Cache stock data locally with data source marker"""
        if date_str not in self.data:
            self.data[date_str] = {}
        # Add data source marker
        if is_mock_data is None:
            is_mock_data = self.use_mock_data
        stock_data_with_source = stock_data.copy()
        stock_data_with_source['_data_source'] = 'mock' if is_mock_data else 'real'
        self.data[date_str][code] = stock_data_with_source
        self._save_data()

    def add_event(self, code, start_date, days, impact_pct):
        """Add a good/bad news event for a stock.

        impact_pct: Positive value means increase on top of original daily change (positive news), negative means decrease (negative news).
        """
        if days <= 0:
            return
        start_str = start_date.strftime("%Y-%m-%d")
        event = {
            "code": code,
            "start": start_str,
            "days": int(days),
            "impact_pct": float(impact_pct)
        }
        self.events.append(event)
        self._save_events()

        # To make events take effect immediately, clear local price cache for this stock during the event period
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
    
    def set_stress_test_config(
        self,
        enabled: bool = None,
        jump_probability: float = None,
        jump_sizes = None,  # List[float]
        jump_direction: str = None,
        extreme_probability: float = None,
        extreme_threshold: float = None,
        extreme_distribution: str = None,
        use_quantile_regression: bool = None,
        quantile_level: float = None
    ):
        """Configure stress testing parameters.
        
        Args:
            enabled: Enable/disable stress testing
            jump_probability: Probability of jump event (0.0 to 1.0)
            jump_sizes: List of jump sizes (as fractions, e.g., -0.20 for -20%)
            jump_direction: "down", "up", or "both"
            extreme_probability: Probability of extreme value event (0.0 to 1.0)
            extreme_threshold: Threshold for extreme events (negative for crashes)
            extreme_distribution: Distribution type ("gev", "pareto", or "simple")
            use_quantile_regression: Enable quantile regression (Stage 3)
            quantile_level: Quantile level for prediction (e.g., 0.01 for 1% tail)
        """
        if self.stress_config is None or self.jump_model is None:
            # Try to initialize if not already done
            try:
                from analysis.stress_test import StressTestConfig, JumpDiffusionModel, create_default_config
                self.stress_config = create_default_config()
                self.jump_model = JumpDiffusionModel(self.stress_config)
            except ImportError:
                print("Warning: Stress test module not available")
                return
        
        # Update configuration
        if enabled is not None:
            self.stress_config.enabled = enabled
        if jump_probability is not None:
            self.stress_config.jump_probability = max(0.0, min(1.0, jump_probability))
        if jump_sizes is not None:
            self.stress_config.jump_sizes = jump_sizes
        if jump_direction is not None:
            self.stress_config.jump_direction = jump_direction
        if extreme_probability is not None:
            self.stress_config.extreme_probability = max(0.0, min(1.0, extreme_probability))
        if extreme_threshold is not None:
            self.stress_config.extreme_threshold = extreme_threshold
        if extreme_distribution is not None:
            self.stress_config.extreme_distribution = extreme_distribution
        if use_quantile_regression is not None:
            self.stress_config.use_quantile_regression = use_quantile_regression
        if quantile_level is not None:
            self.stress_config.quantile_level = max(0.0, min(1.0, quantile_level))
        
        # Recreate model with new config
        self.jump_model = JumpDiffusionModel(self.stress_config)
    
    def get_stress_test_config(self):
        """Get current stress test configuration."""
        if self.stress_config is None:
            return None
        return self.stress_config.to_dict()

class TradeManager:
    def __init__(self, initial_cash=100000.0):
        # Use user data directory for trade data (important user data)
        if PATH_UTILS_AVAILABLE:
            ensure_user_data_dir()
            self.base_dir = get_user_data_dir()  # User data directory
            self.data_file = get_user_data_file("trade_data.json")
        else:
            # Fallback to old behavior
            self.base_dir = os.path.dirname(os.path.abspath(__file__))
            self.data_file = os.path.join(self.base_dir, "trade_data.json")
        self.trade_records = []
        self.pending_orders = []
        # Allow customizable starting cash; this may be overridden by saved data in load_data().
        self.initial_cash = float(initial_cash)
        self.cash = float(initial_cash)
        self.portfolio = {}

        # Trading cost settings (default: 0.01% fee rate, $1 minimum fee, no slippage)
        self.fee_rate = 0.0001          # Proportional fee (relative to trade amount)
        self.min_fee = 1.0              # Minimum fee per trade
        self.slippage_per_share = 0.0   # Slippage per share (price offset)

        # Risk & auto-trading settings
        self.stop_loss_pct = 0.0        # Stop-loss threshold for individual stock (loss percentage, e.g., 10 means auto-sell at -10%)
        self.scale_step_pct = 0.0       # Scale in/out trigger threshold (profit/loss percentage)
        self.scale_fraction_pct = 0.0   # Scale in/out fraction when triggered (percentage of current position)

        self.load_data()

    def load_data(self):
        """Load trade data from file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.trade_records = data.get('trade_records', [])
                    self.cash = data.get('cash', self.cash)
                    self.initial_cash = data.get('initial_cash', self.initial_cash)
                    self.portfolio = data.get('portfolio', {})
                    self.pending_orders = data.get('pending_orders', [])

                    # Load trading cost settings (keep defaults if not in old file)
                    self.fee_rate = data.get('fee_rate', self.fee_rate)
                    self.min_fee = data.get('min_fee', self.min_fee)
                    self.slippage_per_share = data.get('slippage_per_share', self.slippage_per_share)
                    # Load risk and auto-trading settings
                    self.stop_loss_pct = data.get('stop_loss_pct', self.stop_loss_pct)
                    self.scale_step_pct = data.get('scale_step_pct', self.scale_step_pct)
                    self.scale_fraction_pct = data.get('scale_fraction_pct', self.scale_fraction_pct)
            except Exception as e:
                print(f"Failed to load data: {str(e)}")
                self.trade_records = []
                self.cash = 100000.0
                self.portfolio = {}

    def save_data(self):
        """Save trade data to file"""
        try:
            data = {
                'trade_records': self.trade_records,
                'cash': self.cash,
                'initial_cash': self.initial_cash,
                'portfolio': self.portfolio,
                'pending_orders': self.pending_orders,
                'fee_rate': self.fee_rate,
                'min_fee': self.min_fee,
                'slippage_per_share': self.slippage_per_share,
                'stop_loss_pct': self.stop_loss_pct,
                'scale_step_pct': self.scale_step_pct,
                'scale_fraction_pct': self.scale_fraction_pct
            }
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save data: {str(e)}")

    def add_trade_record(self, date, stock_code, stock_name, trade_type, shares, price, total_amount):
        """Add trade record"""
        record = {
            'date': date,
            'stock_code': stock_code,
            'stock_name': stock_name,
            'trade_type': trade_type,
            'shares': shares,
            'price': price,
            'total_amount': total_amount
        }
        self.trade_records.append(record)
        self.save_data()

    def update_portfolio(self, stock_code, shares, price, trade_type):
        """Update portfolio information"""
        if trade_type == 'Buy':
            if stock_code in self.portfolio:
                self.portfolio[stock_code]['shares'] += shares
                self.portfolio[stock_code]['total_cost'] += shares * price
            else:
                self.portfolio[stock_code] = {
                    'shares': shares,
                    'total_cost': shares * price
                }
        else:  # Sell
            if stock_code in self.portfolio:
                self.portfolio[stock_code]['shares'] -= shares
                self.portfolio[stock_code]['total_cost'] -= shares * price
                if self.portfolio[stock_code]['shares'] == 0:
                    del self.portfolio[stock_code]

    def get_trade_records(self):
        """Get all trade records"""
        return self.trade_records

    def get_portfolio(self):
        """Get current portfolio"""
        return self.portfolio

    def get_pending_orders(self):
        return self.pending_orders

    def add_pending_order(self, order):
        self.pending_orders.append(order)
        self.save_data()

    def remove_pending_order(self, order_id):
        self.pending_orders = [o for o in self.pending_orders if o.get('id') != order_id]
        self.save_data()

    def get_cash(self):
        """Get current cash"""
        return self.cash

    def update_cash(self, amount, trade_type, fee=0.0):
        """Update cash

        amount: Trade amount (price × shares), excluding fees
        fee: Trading fee (positive number)
        """
        if trade_type == 'Buy':
            self.cash -= (amount + fee)
        else:  # Sell
            self.cash += (amount - fee)
        self.save_data()

    def calculate_trade_costs(self, price, shares, trade_type):
        """Calculate actual execution price, gross amount, and fee based on current trading cost settings.

        Returns: execution_price, gross_amount, fee
        """
        # Slippage: buy price shifts up, sell price shifts down
        if trade_type == 'Buy':
            exec_price = price + self.slippage_per_share
        else:
            exec_price = max(0.01, price - self.slippage_per_share)

        gross = exec_price * shares
        fee = max(self.min_fee, abs(gross) * self.fee_rate) if gross > 0 else 0.0
        return exec_price, gross, fee

class StockTradeSimulator:
    def __init__(self, root, use_mock_data=None):
        self.root = root  # Save root window reference
        # Set window title with version (EPSILON branding)
        if VERSION_AVAILABLE:
            app_name = VERSION_INFO.get('app_name', 'EPSILON')
            version_str = get_version_string()
            self.root.title(f"{app_name} {version_str}")
        else:
            self.root.title("EPSILON")  # Fallback to EPSILON brand name
        self.root.geometry("1200x800")  # Set window size to 1200x800
        self.bg_color = "#f0f0f0"  # Set background color
        self.root.configure(bg=self.bg_color)

        # Initialize ttkbootstrap if available (but don't use it for Calendar compatibility)
        self.use_ttkbootstrap = TTKBOOTSTRAP_AVAILABLE
        
        if self.use_ttkbootstrap:
            # Use ttkbootstrap style with light theme
            self.style = ttkb.Style(theme='flatly')  # Light theme
        else:
            # Fallback to default tkinter
            self.style = None
        
        # Set light theme colors
        self.primary_color = '#FFFFFF'
        self.secondary_color = '#F5F7FB'
        self.accent_color = '#2563EB'
        self.success_color = '#16A34A'
        self.danger_color = '#DC2626'
        self.text_color = '#111827'
        self.bg_color = self.secondary_color
        self.panel_bg = self.primary_color
        self.border_color = '#E5E7EB'
        self.header_bg = '#EFF3FB'
        self.hover_color = '#E0ECFF'
        
        self.cell_padding = 6  # Reduced padding
        self.base_font_size = 9  # Base font size (reduced from 11-14)

        # Initialize modern UI theme (CustomTkinter)
        if MODERN_UI_AVAILABLE and ModernUI:
            try:
                ModernUI.setup_theme(mode="light", color_theme="blue")
            except Exception as e:
                print(f"Warning: Failed to setup modern UI theme: {e}")

        # Initialize data managers
        self.data_manager = StockDataManager(use_mock_data=use_mock_data)
        self.use_mock_data = self.data_manager.use_mock_data
        
        # Check akshare availability and show warning if needed
        self._check_akshare_availability()
        
        if self.use_mock_data:
            print("Running in mock data mode. Set STOCK_SIM_USE_MOCK=0 to disable.")

        # Show disclaimer on first launch (check if user has seen it)
        self._show_disclaimer_if_needed()

        # Ask user for initial cash only when no existing trade data file is present
        initial_cash = 100000.0
        # Check if trade data exists in user data directory
        if PATH_UTILS_AVAILABLE:
            trade_data_path = get_user_data_file("trade_data.json")
        else:
            trade_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trade_data.json")
        if not os.path.exists(trade_data_path):
            try:
                value = simpledialog.askfloat(
                    "Initial Capital",
                    "Please enter your initial research capital (USD):",
                    minvalue=0.0,
                    initialvalue=100000.0,
                    parent=self.root
                )
                if value is not None and value >= 0:
                    initial_cash = float(value)
            except Exception as e:
                print(f"Failed to get initial cash from user, using default 100000.0: {e}")

        self.trade_manager = TradeManager(initial_cash=initial_cash)
        
        # Initialize export and analysis module
        if EXPORT_ANALYSIS_AVAILABLE:
            self.export_analyzer = ExportAnalyzer(self.trade_manager, self)
        else:
            self.export_analyzer = None
        
        # Challenge scoring - simple implementation
        self.current_score_result = None
        if PATH_UTILS_AVAILABLE:
            self.scores_history_file = get_user_data_file("challenge_scores.json")
        else:
            self.scores_history_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "challenge_scores.json")
        
        # Challenge mode state
        self.challenge_mode = False
        self.challenge_info = None  # Will store: {'name', 'start_date', 'end_date', 'initial_cash', 'events'}
        self.challenge_start_date = None
        self.challenge_end_date = None
        
        # Initialize variables
        self.cash = self.trade_manager.get_cash()
        self.portfolio = self.trade_manager.get_portfolio()
        self.pending_orders = self.trade_manager.get_pending_orders()
        self.current_date = datetime.datetime.now().date()
        
        # Initialize stock data dictionary
        self.stocks = {}
        
        # Create UI components first
        self.create_widgets()
        
        # Update data mode display after UI is created
        self._update_data_mode_display()
        
        # Check if local data exists for current date
        current_date = datetime.datetime.now()
        date_str = current_date.strftime("%Y-%m-%d")
        if date_str in self.data_manager.data:
            # Load data from local
            self.stocks = {}
            stock_list = self.data_manager.get_stock_list()
            for code, name in stock_list.items():
                if code in self.data_manager.data[date_str]:
                    stock_data = self.data_manager.data[date_str][code]
                    self.stocks[code] = {
                        "name": name,
                        "price": stock_data["price"],
                        "change_percent": stock_data["change_percent"]
                    }
            self.update_stock_listbox()
            # Automatically select first stock
            self.select_first_stock()
        else:
            # If no local data, load from network
            self.show_loading(self._loading_message())
            self.load_stocks()

        # Update portfolio and asset display
        self.update_assets()

    def _check_akshare_availability(self):
        """Check if akshare is available and show warning if not"""
        if not AKSHARE_AVAILABLE:
            # Show warning dialog
            warning_msg = (
                "⚠️ akshare library not installed!\n\n"
                "The program will run in mock data mode.\n\n"
                "To use real stock data, please install akshare:\n"
                "pip install akshare\n\n"
                "After installation, restart the program to use real data."
            )
            messagebox.showwarning("akshare Unavailable", warning_msg)
        elif self.use_mock_data:
            # akshare is available but using mock mode (user choice or env var)
            info_msg = (
                "Currently using mock data mode.\n\n"
                "akshare is installed, but the program is running in mock mode.\n"
                "To switch to real data mode, please:\n"
                "1. Set environment variable STOCK_SIM_USE_MOCK=0\n"
                "2. Or modify the use_mock_data parameter in code"
            )
            messagebox.showinfo("Mock Data Mode", info_msg)
    
    def _update_data_mode_display(self):
        """Update data mode indicator in the UI"""
        if not hasattr(self, 'data_mode_label'):
            return  # UI not created yet
        
        if not AKSHARE_AVAILABLE:
            # akshare unavailable
            self.data_mode_label.config(
                text="❌ akshare not installed",
                fg='#DC2626'  # Red color
            )
        elif self.use_mock_data:
            # Using mock data
            self.data_mode_label.config(
                text="⚠️ Mock Data Mode",
                fg='#F59E0B'  # Orange/Amber color
            )
        else:
            # Using real data
            self.data_mode_label.config(
                text="📊 Real Data Mode",
                fg='#16A34A'  # Green color
            )

    def _loading_message(self, action="Loading", current=None, total=None):
        """Build contextual loading text"""
        source = "mock stock data" if self.use_mock_data else "stock data from network"
        message = f"{action} {source}"
        if current is not None and total is not None:
            message += f" ({current}/{total})"
        return message + "..."

    def show_loading(self, message):
        """Show loading window"""
        self.loading_window = tk.Toplevel(self.root)
        self.loading_window.title("Network Request")
        self.loading_window.geometry("300x100")
        self.loading_window.transient(self.root)  # Set as temporary window
        self.loading_window.grab_set()  # Set as modal window
        
        # Create progress bar
        self.progress = ttk.Progressbar(
            self.loading_window,
            length=200,
            mode='indeterminate'
        )
        self.progress.pack(pady=20)
        self.progress.start()
        
        # Create label
        self.loading_label = tk.Label(
            self.loading_window,
            text=message,
            font=('Arial', 12)
        )
        self.loading_label.pack()

    def hide_loading(self):
        """Hide loading window"""
        if hasattr(self, 'loading_window'):
            self.progress.stop()
            self.loading_window.destroy()

    def load_stocks(self, target_date=None):
        """Load stock data"""
        def load_data(target_date):
            try:
                # Ensure valid target date
                if target_date is None:
                    target_date = datetime.datetime.now()
                
                # Convert to date object
                target_date_obj = target_date.date() if isinstance(target_date, datetime.datetime) else target_date
                today = datetime.date.today()
                
                # CRITICAL: Check for future date BEFORE doing anything else
                if not self.use_mock_data and target_date_obj > today:
                    date_str = target_date_obj.strftime("%Y-%m-%d")
                    print(f"ERROR: Attempted to load future date {date_str} in real data mode. This should have been prevented.")
                    self.root.after(0, lambda: messagebox.showwarning(
                        "Future Date Not Allowed",
                        f"The selected date ({date_str}) is in the future.\n\n"
                        f"Real stock data is only available for historical dates up to today ({today.strftime('%Y-%m-%d')}).\n\n"
                        f"Please select a date on or before today, or switch to mock data mode to simulate future dates."
                    ))
                    # Reset to current date
                    self.root.after(0, lambda: self.calendar.selection_set(today))
                    self.root.after(0, lambda: setattr(self, 'current_date', today))
                    self.root.after(0, lambda: self.date_label.config(text=f"Current Date: {today.strftime('%Y-%m-%d')}"))
                    return
                
                # Update loading message
                self.loading_label.config(text=self._loading_message("Loading"))
                
                # Get stock list
                self.stocks = {}
                stock_list = self.data_manager.get_stock_list()
                
                # Check if local data exists for this date
                date_str = target_date_obj.strftime("%Y-%m-%d")
                if date_str in self.data_manager.data:
                    # Load data from local
                    for code, name in stock_list.items():
                        if code in self.data_manager.data[date_str]:
                            stock_data = self.data_manager.data[date_str][code]
                            self.stocks[code] = {
                                "name": name,
                                "price": stock_data["price"],
                                "change_percent": stock_data["change_percent"]
                            }
                    self.root.after(0, self.update_stock_listbox)
                    # Automatically select first stock
                    self.root.after(0, self.select_first_stock)
                    return
                
                # If no local data, fetch from network
                self.loading_label.config(text=self._loading_message("Fetching"))
                total_stocks = len(stock_list)
                failed_stocks = []
                
                for i, (code, name) in enumerate(stock_list.items()):
                    # Update loading message
                    self.loading_label.config(text=self._loading_message("Fetching", current=i+1, total=total_stocks))
                    
                    # Get stock data
                    stock_data = self.data_manager.get_stock_data(code, target_date_obj)
                    
                    if stock_data is not None:
                        self.stocks[code] = {
                            "name": name,
                            "price": stock_data["price"],
                            "change_percent": stock_data["change_percent"]
                        }
                    else:
                        # If fetch fails, only use random data in mock mode
                        # In real data mode, skip the stock to avoid showing fake data
                        if self.use_mock_data:
                            self.stocks[code] = {
                                "name": name,
                                "price": random.uniform(100, 500),
                                "change_percent": random.uniform(-5, 5)
                            }
                        else:
                            failed_stocks.append(code)
                
                # Show warning if some stocks failed to load in real data mode
                if failed_stocks and not self.use_mock_data:
                    date_str = target_date_obj.strftime("%Y-%m-%d")
                    # Double-check: this should never happen if the early check worked, but just in case
                    if target_date_obj > today:
                        # Future date - this should have been caught earlier, but handle it anyway
                        self.root.after(0, lambda: messagebox.showwarning(
                            "Future Date Not Allowed",
                            f"Selected date ({date_str}) is in the future.\n\n"
                            f"Real stock data is only available for historical dates up to today ({today.strftime('%Y-%m-%d')}).\n\n"
                            f"Please select a date on or before today."
                        ))
                    else:
                        # Some stocks failed to load for valid historical date
                        if len(failed_stocks) == len(stock_list):
                            # All stocks failed - use mock data as fallback
                            print(f"All stocks failed to load for {date_str}, using mock data as fallback")
                            self.stocks = {}
                            for code, name in stock_list.items():
                                self.stocks[code] = {
                                    "name": name,
                                    "price": random.uniform(100, 500),
                                    "change_percent": random.uniform(-5, 5)
                                }
                            self.root.after(0, lambda: messagebox.showwarning(
                                "Data Unavailable - Using Mock Data",
                                f"Unable to fetch stock data for {date_str}.\n\n"
                                f"This may be due to:\n"
                                f"- Network connection issues\n"
                                f"- Market was closed on this date\n"
                                f"- Data source temporarily unavailable\n"
                                f"- akshare API error\n\n"
                                f"Using mock data for simulation. You can switch to mock data mode in settings."
                            ))
                        else:
                            # Some stocks failed
                            self.root.after(0, lambda: messagebox.showwarning(
                                "Partial Data",
                                f"Unable to fetch data for {len(failed_stocks)} stock(s): {', '.join(failed_stocks[:5])}{'...' if len(failed_stocks) > 5 else ''}\n\n"
                                f"These stocks will not be displayed."
                            ))
                
                # Only update UI if we have stocks
                if self.stocks:
                    # Update listbox
                    self.root.after(0, self.update_stock_listbox)
                    # Automatically select first stock
                    self.root.after(0, self.select_first_stock)
                    self.root.after(0, self.process_pending_orders)
                else:
                    # No stocks available - show message
                    self.root.after(0, lambda: messagebox.showwarning(
                        "No Data Available",
                        "No stock data is available. Please try:\n"
                        "- Selecting a different date\n"
                        "- Checking your network connection\n"
                        "- Switching to mock data mode"
                    ))
                
            except Exception as e:
                print(f"Failed to load stock data: {str(e)}")
                # If all fetches fail, use default mock data
                self.stocks = {
                    "AAPL": {"name": "Apple", "price": 185.0, "change_percent": 2.5},
                    "GOOGL": {"name": "Google", "price": 135.0, "change_percent": -1.2},
                    "TSLA": {"name": "Tesla", "price": 250.0, "change_percent": 3.8},
                    "MSFT": {"name": "Microsoft", "price": 330.0, "change_percent": 1.5},
                    "NVDA": {"name": "NVIDIA", "price": 450.0, "change_percent": -2.1}
                }
                self.root.after(0, self.update_stock_listbox)
                # Automatically select first stock
                self.root.after(0, self.select_first_stock)
                self.root.after(0, self.process_pending_orders)
            
            finally:
                # Hide loading window
                self.root.after(0, self.hide_loading)
        
        # Load data in new thread
        thread = threading.Thread(target=load_data, args=(target_date,))
        thread.start()

    def select_first_stock(self):
        """Select first stock and show its information"""
        if self.stocks:
            # Clear current selection
            self.stock_listbox.selection_clear(0, tk.END)
            # Select first stock
            self.stock_listbox.selection_set(0)
            # Show stock information
            self.show_stock_details()

    def update_stock_listbox(self):
        """Update stock listbox"""
        self.stock_listbox.delete(0, tk.END)
        for code in self.stocks:
            name = self.stocks[code]['name']
            # Use tab for alignment
            display_text = f"{code:<6} | {name}"
            self.stock_listbox.insert(tk.END, display_text)

    # ----------------------- Auto trading rules -----------------------
    def apply_auto_trading_rules(self):
        """Apply stop-loss and scale in/out rules when date changes."""
        tm = self.trade_manager
        # If no rules are enabled, return directly
        if (tm.stop_loss_pct <= 0) and (tm.scale_step_pct <= 0 or tm.scale_fraction_pct <= 0):
            return

        if not self.stocks or not self.portfolio:
            return

        actions = []
        date_str = self.current_date.strftime('%Y-%m-%d')

        for stock_code, info in list(self.portfolio.items()):
            if stock_code not in self.stocks:
                continue
            shares = info['shares']
            if shares <= 0:
                continue

            cost = info['total_cost']
            if cost <= 0:
                continue

            current_price = self.stocks[stock_code]['price']
            current_value = current_price * shares
            pnl_pct = (current_value - cost) / cost * 100.0

            # Stop-loss rule: if loss exceeds threshold, sell entire position
            if tm.stop_loss_pct > 0 and pnl_pct <= -tm.stop_loss_pct:
                actions.append(('Sell', stock_code, shares, current_price, 'Auto Stop-Loss'))
                # Once stop-loss is triggered, no further scaling adjustments for this stock
                continue

            # Scale in/out rules
            if tm.scale_step_pct > 0 and tm.scale_fraction_pct > 0:
                step = tm.scale_step_pct
                frac = tm.scale_fraction_pct / 100.0
                scale_shares = max(1, int(shares * frac))

                if pnl_pct >= step and shares - scale_shares > 0:
                    # Profit exceeds threshold → scale out
                    actions.append(('Sell', stock_code, scale_shares, current_price, 'Auto Scale-Out'))
                elif pnl_pct <= -step:
                    # Loss but stop-loss not triggered → scale in
                    actions.append(('Buy', stock_code, scale_shares, current_price, 'Auto Scale-In'))

        executed = 0
        for trade_type, code, shares, base_price, reason in actions:
            stock_name = self.stocks[code]['name']
            # Calculate trading costs
            exec_price, gross, fee = tm.calculate_trade_costs(base_price, shares, trade_type)

            if trade_type == 'Buy':
                # Check if cash is sufficient
                if gross + fee > self.cash:
                    continue
                # Record
                tm.add_trade_record(
                    date_str,
                    code,
                    stock_name,
                    'Buy',
                    shares,
                    exec_price,
                    gross
                )
                tm.update_portfolio(code, shares, exec_price, 'Buy')
                tm.update_cash(gross, 'Buy', fee=fee)
            else:
                # Check if position is sufficient
                if code not in self.portfolio or self.portfolio[code]['shares'] < shares:
                    continue
                tm.add_trade_record(
                    date_str,
                    code,
                    stock_name,
                    'Sell',
                    shares,
                    exec_price,
                    gross
                )
                tm.update_portfolio(code, shares, exec_price, 'Sell')
                tm.update_cash(gross, 'Sell', fee=fee)

            executed += 1

        if executed > 0:
            # Sync latest account status and refresh interface
            self.cash = self.trade_manager.get_cash()
            self.portfolio = self.trade_manager.get_portfolio()
            self.update_assets()
            self.load_trade_records()
            self.update_portfolio_table()
            messagebox.showinfo("Auto Trading", f"{executed} auto trade(s) executed on {date_str} based on your rules.")

    def manage_stock_universe(self):
        """Open a dialog window to let user customize the stock universe (portfolio universe)."""
        manager = tk.Toplevel(self.root)
        manager.title("Manage Portfolio Universe")
        manager.geometry("420x360")
        manager.transient(self.root)
        manager.grab_set()

        frame = tk.Frame(manager, bg=self.bg_color)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        tk.Label(
            frame,
            text="Configured Stocks (code | name)",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 2, 'bold')
        ).pack(anchor='w', pady=(0, 5))

        list_frame = tk.Frame(frame, bg=self.bg_color)
        list_frame.pack(fill=tk.BOTH, expand=True)

        stock_listbox = tk.Listbox(
            list_frame,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 1),
            selectbackground=self.hover_color,
            selectforeground=self.text_color,
            activestyle='none',
            highlightthickness=0,
            relief='flat',
            borderwidth=0
        )
        stock_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, pady=5)

        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=stock_listbox.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, pady=5)
        stock_listbox.config(yscrollcommand=scrollbar.set)

        # Load current stock universe from data_manager.stock_list
        def refresh_dialog_list():
            stock_listbox.delete(0, tk.END)
            for code, name in sorted(self.data_manager.stock_list.items()):
                stock_listbox.insert(tk.END, f"{code:<6} | {name}")

        refresh_dialog_list()

        # Form for adding/editing stocks
        form_frame = tk.Frame(frame, bg=self.bg_color)
        form_frame.pack(fill=tk.X, pady=(10, 5))

        tk.Label(
            form_frame,
            text="Code:",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=0, column=0, padx=(0, 5), pady=2, sticky='e')

        code_entry = tk.Entry(form_frame, width=10, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        code_entry.grid(row=0, column=1, padx=(0, 10), pady=2, sticky='w')

        tk.Label(
            form_frame,
            text="Name:",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=1, column=0, padx=(0, 5), pady=2, sticky='e')

        name_entry = tk.Entry(form_frame, width=20, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        name_entry.grid(row=1, column=1, padx=(0, 10), pady=2, sticky='w')

        def on_select(event=None):
            selection = stock_listbox.curselection()
            if not selection:
                return
            text = stock_listbox.get(selection[0])
            code = text.split("|")[0].strip()
            name = self.data_manager.stock_list.get(code, "")
            code_entry.delete(0, tk.END)
            code_entry.insert(0, code)
            name_entry.delete(0, tk.END)
            name_entry.insert(0, name)

        stock_listbox.bind("<<ListboxSelect>>", on_select)

        def save_universe_to_file():
            """Persist current stock_list to stock_list.json and reload stocks."""
            if PATH_UTILS_AVAILABLE:
                path, _ = get_config_file("stock_list.json")
            else:
                path = os.path.join(self.data_manager.base_dir, "stock_list.json")
            try:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(self.data_manager.stock_list, f, ensure_ascii=False, indent=2)
                messagebox.showinfo("Success", "Stock universe saved. Reloading stock data...")
                # After updating universe, reload stocks for current date
                self.show_loading(self._loading_message())
                self.load_stocks(datetime.datetime.combine(self.current_date, datetime.time()))
            except Exception as e:
                messagebox.showerror("Error", f"Failed to save stock_list.json: {e}")

        def add_or_update_stock():
            code = code_entry.get().strip().upper()
            name = name_entry.get().strip()
            if not code or not name:
                messagebox.showerror("Error", "Please enter both stock code and name.")
                return
            self.data_manager.stock_list[code] = name
            refresh_dialog_list()
            code_entry.delete(0, tk.END)
            name_entry.delete(0, tk.END)

        def delete_selected_stock():
            selection = stock_listbox.curselection()
            if not selection:
                messagebox.showerror("Error", "Please select a stock to delete.")
                return
            text = stock_listbox.get(selection[0])
            code = text.split("|")[0].strip()
            if code in self.data_manager.stock_list:
                if messagebox.askyesno("Confirm", f"Remove {code} from portfolio universe?"):
                    del self.data_manager.stock_list[code]
                    refresh_dialog_list()

        btn_frame = tk.Frame(frame, bg=self.bg_color)
        btn_frame.pack(fill=tk.X, pady=(5, 0))

        tk.Button(
            btn_frame,
            text="Add / Update",
            command=add_or_update_stock,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            padx=10,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 5))

        tk.Button(
            btn_frame,
            text="Delete Selected",
            command=delete_selected_stock,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            padx=10,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 5))

        tk.Button(
            btn_frame,
            text="Save & Reload",
            command=lambda: (save_universe_to_file(), manager.destroy()),
            bg=self.accent_color,
            fg='white',
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            padx=10,
            pady=4
        ).pack(side=tk.RIGHT, padx=(5, 0))

    def create_widgets(self):
        # Configure ttk style using standard ttk
        if self.use_ttkbootstrap:
            # Use ttkbootstrap style
            style = self.style
        else:
            # Use default ttk style
            style = ttk.Style()
            style.theme_use('default')
        
        style.configure("Treeview",
            background=self.panel_bg,
            foreground=self.text_color,
            fieldbackground=self.panel_bg,
            borderwidth=0,
            font=('Segoe UI', self.base_font_size + 1),  # Reduced from 11
            rowheight=26  # Reduced from 30
        )
        style.configure("Treeview.Heading",
            background=self.header_bg,
            foreground=self.text_color,
            borderwidth=0,
            relief='flat',
            font=('Segoe UI', self.base_font_size + 1, 'bold'),  # Reduced from 11
            padding=(self.cell_padding, self.cell_padding)
        )
        style.map("Treeview",
            background=[('selected', self.hover_color)],
            foreground=[('selected', self.text_color)]
        )

        # Create left frame
        left_frame = tk.Frame(self.root, width=280, bg=self.bg_color)
        left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=10)

        # Create date selection frame
        date_frame = tk.Frame(left_frame, bg=self.bg_color)
        date_frame.pack(fill=tk.X, pady=(0, 10))

        # Date label and export buttons in one row
        date_header_frame = tk.Frame(date_frame, bg=self.bg_color)
        date_header_frame.pack(fill=tk.X, pady=(0, 5))

        # Display current date label
        self.date_label = tk.Label(
            date_header_frame,
            text=f"Current Date: {self.current_date.strftime('%Y-%m-%d')}",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 3, 'bold')  # Reduced from 14
        )
        self.date_label.pack(side=tk.LEFT, pady=5, padx=5)
        
        # Data mode indicator (display data mode)
        self.data_mode_label = tk.Label(
            date_header_frame,
            text="",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 1, 'bold')
        )
        self.data_mode_label.pack(side=tk.LEFT, pady=5, padx=(10, 5))
        self._update_data_mode_display()  # Initialize display
        
        # Export and AI Analysis buttons on the right
        export_btn_frame = tk.Frame(date_header_frame, bg=self.bg_color)
        export_btn_frame.pack(side=tk.RIGHT, padx=5)
        
        # Export button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            export_btn = ModernUI.Button(
                export_btn_frame,
                text="📊",
                command=self.export_data,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color=self.accent_color,
                hover_color="#1d4ed8",
                text_color='white',
                corner_radius=6,
                width=35,
                height=30
            )
            export_btn.pack(side=tk.LEFT, padx=2)
        else:
            tk.Button(
                export_btn_frame,
                text="📊",
                command=self.export_data,
                bg=self.accent_color,
                fg='white',
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=6,
                pady=3,
                width=2
            ).pack(side=tk.LEFT, padx=2)
        
        # AI Analysis button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            ai_btn = ModernUI.Button(
                export_btn_frame,
                text="🤖",
                command=self.generate_ai_analysis,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color=self.success_color,
                hover_color="#15803d",
                text_color='white',
                corner_radius=6,
                width=35,
                height=30
            )
            ai_btn.pack(side=tk.LEFT, padx=2)
        else:
            tk.Button(
                export_btn_frame,
                text="🤖",
                command=self.generate_ai_analysis,
                bg=self.success_color,
                fg='white',
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=6,
                pady=3,
                width=2
            ).pack(side=tk.LEFT, padx=2)
        
        # Strategy Tournament button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            tournament_btn = ModernUI.Button(
                export_btn_frame,
                text="⚔️",
                command=self.open_strategy_tournament,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color="#9333EA",  # Purple color for tournament
                hover_color="#7C3AED",
                text_color='white',
                corner_radius=6,
                width=35,
                height=30
            )
            tournament_btn.pack(side=tk.LEFT, padx=2)
        else:
            tk.Button(
                export_btn_frame,
                text="⚔️",
                command=self.open_strategy_tournament,
                bg="#9333EA",
                fg='white',
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=6,
                pady=3,
                width=2
            ).pack(side=tk.LEFT, padx=2)
        
        # Spectral Analysis button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            spectral_btn = ModernUI.Button(
                export_btn_frame,
                text="📈",
                command=self.open_spectral_analysis,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color="#F59E0B",  # Amber color for spectral analysis
                hover_color="#D97706",
                text_color='white',
                corner_radius=6,
                width=35,
                height=30
            )
            spectral_btn.pack(side=tk.LEFT, padx=2)
        else:
            tk.Button(
                export_btn_frame,
                text="📈",
                command=self.open_spectral_analysis,
                bg="#F59E0B",
                fg='white',
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=6,
                pady=3,
                width=2
            ).pack(side=tk.LEFT, padx=2)
        
        # About button - Show version and info
        if MODERN_UI_AVAILABLE and ModernUI:
            about_btn = ModernUI.Button(
                export_btn_frame,
                text="ℹ️",
                command=self.show_about_dialog,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color="#6B7280",
                hover_color="#4B5563",
                text_color='white',
                corner_radius=6,
                width=35,
                height=30
            )
            about_btn.pack(side=tk.LEFT, padx=2)
        else:
            tk.Button(
                export_btn_frame,
                text="ℹ️",
                command=self.show_about_dialog,
                bg="#6B7280",
                fg='white',
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=6,
            pady=3,
            width=2
        ).pack(side=tk.LEFT, padx=2)

        # Create calendar widget
        # Note: ttkbootstrap is disabled to avoid compatibility issues with Calendar
        self.calendar = Calendar(
            date_frame,
            selectmode='day',
            year=int(self.current_date.strftime("%Y")),
            month=int(self.current_date.strftime("%m")),
            day=int(self.current_date.strftime("%d")),
            date_pattern='yyyy-mm-dd',
            background=self.panel_bg,
            foreground=self.text_color,
            headersbackground=self.header_bg,
            normalbackground=self.panel_bg,
            weekendbackground=self.panel_bg,
            selectbackground=self.hover_color,
            selectforeground=self.text_color,
            font=('Segoe UI', self.base_font_size + 2),
            borderwidth=0,
            showweeknumbers=False,
            width=280,
            height=300
        )
        self.calendar.pack(padx=5, pady=5)

        # Update current date
        self.calendar.bind("<<CalendarSelected>>", self.update_date)

        # Create navigation button frames (two rows)
        nav_frame = tk.Frame(date_frame, bg=self.bg_color)
        nav_frame.pack(pady=5)
        
        # First row: Previous day and Next day buttons
        nav_row1 = tk.Frame(nav_frame, bg=self.bg_color)
        nav_row1.pack(pady=2)
        
        # Previous day button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.prev_day_btn = ModernUI.Button(
                nav_row1,
                text="Previous Day",
                command=self.previous_day,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color=self.panel_bg,
                hover_color=self.hover_color,
                text_color=self.text_color,
                border_color=self.border_color,
                border_width=1,
                corner_radius=6,
                height=35
            )
            self.prev_day_btn.pack(side=tk.LEFT, padx=2)
        else:
            self.prev_day_btn = tk.Button(
            nav_row1,
            text="Previous Day",
            command=self.previous_day,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            width=6,
            relief='solid',
            borderwidth=1,
            highlightbackground=self.border_color,
            highlightthickness=0,
            cursor='hand2',
            padx=10,
            pady=5
        )
        self.prev_day_btn.pack(side=tk.LEFT, padx=2)
        
        # Next day button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.next_day_btn = ModernUI.Button(
                nav_row1,
                text="Next Day",
                command=self.next_day,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color=self.panel_bg,
                hover_color=self.hover_color,
                text_color=self.text_color,
                border_color=self.border_color,
                border_width=1,
                corner_radius=6,
                height=35
            )
            self.next_day_btn.pack(side=tk.LEFT, padx=2)
        else:
            self.next_day_btn = tk.Button(
            nav_row1,
            text="Next Day",
            command=self.next_day,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            width=6,
            relief='solid',
            borderwidth=1,
            highlightbackground=self.border_color,
            highlightthickness=0,
            cursor='hand2',
            padx=10,
            pady=5
        )
        self.next_day_btn.pack(side=tk.LEFT, padx=2)
        
        # Second row: Challenge mode button and Exit Challenge button
        nav_row2 = tk.Frame(nav_frame, bg=self.bg_color)
        nav_row2.pack(pady=2)
        
        # Challenge mode button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.challenge_btn = ModernUI.Button(
                nav_row2,
                text="🎯 Start Challenge",
                command=self.start_challenge_mode,
                font=('Segoe UI', self.base_font_size + 1, 'bold'),
                fg_color=self.success_color,
                hover_color="#15803d",
                text_color='white',
                corner_radius=6,
                height=35
            )
            self.challenge_btn.pack(side=tk.LEFT, padx=5)
        else:
            self.challenge_btn = tk.Button(
            nav_row2,
            text="🎯 Start Challenge",
            command=self.start_challenge_mode,
            bg=self.success_color,
            fg='white',
            font=('Segoe UI', self.base_font_size + 1, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=10,
            pady=5
        )
        self.challenge_btn.pack(side=tk.LEFT, padx=5)
        
        # Exit Challenge button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.exit_challenge_btn = ModernUI.Button(
                nav_row2,
                text="Exit Challenge",
                command=self.exit_challenge,
                font=('Segoe UI', self.base_font_size + 1, 'bold'),
                fg_color=self.danger_color,
                hover_color="#b91c1c",
                text_color='white',
                corner_radius=6,
                height=35,
                state='disabled'
            )
            self.exit_challenge_btn.pack(side=tk.LEFT, padx=5)
        else:
            self.exit_challenge_btn = tk.Button(
            nav_row2,
            text="Exit Challenge",
            command=self.exit_challenge,
            bg=self.danger_color,
            fg='white',
            font=('Segoe UI', self.base_font_size + 1, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=10,
            pady=5,
            state='disabled'
        )
        self.exit_challenge_btn.pack(side=tk.LEFT, padx=5)
        
        # Challenge status label (below buttons, initially hidden)
        self.challenge_status_label = tk.Label(
            date_frame,
            text="",
            font=('Segoe UI', self.base_font_size, 'bold'),
            bg=self.bg_color,
            fg=self.success_color
        )
        # Don't pack it yet - it will be packed when challenge starts

        # Create stock list frame
        list_frame = tk.Frame(left_frame, bg=self.bg_color)
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        # Header row: title + manage button
        header_frame = tk.Frame(list_frame, bg=self.bg_color)
        header_frame.pack(fill=tk.X, pady=(0, 5))

        tk.Label(
            header_frame,
            text="Stock List",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 4, 'bold')
        ).pack(side=tk.LEFT, padx=5)

        tk.Button(
            header_frame,
            text="Manage Portfolio Universe",
            command=self.manage_stock_universe,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            padx=8,
            pady=2
        ).pack(side=tk.RIGHT, padx=5)

        # Create stock list
        self.stock_listbox = tk.Listbox(
            list_frame,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 2),
            selectbackground=self.hover_color,
            selectforeground=self.text_color,
            activestyle='none',
            highlightthickness=0,
            relief='flat',
            borderwidth=0,
            height=10,
            selectmode='single'
        )
        self.stock_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        self.stock_listbox.bind("<<ListboxSelect>>", self.show_stock_details)

        # Add scrollbar
        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, pady=5)
        self.stock_listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.stock_listbox.yview)

        # Create trade frame
        trade_frame = tk.Frame(left_frame, bg=self.bg_color)
        trade_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 0))

        # Trade shares label and entry
        shares_frame = tk.Frame(trade_frame, bg=self.bg_color)
        shares_frame.pack(fill=tk.X, padx=5, pady=5)

        shares_label = tk.Label(
            shares_frame,
            text="Trade Shares",
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            bg=self.bg_color,
            fg=self.text_color
        )
        shares_label.pack(side=tk.LEFT, padx=(5, 10))

        # Shares entry - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.shares_entry = ModernUI.Entry(
                shares_frame,
                width=120,
                height=32,
                font=('Segoe UI', self.base_font_size + 2),
                placeholder_text="Enter shares",
                corner_radius=6
            )
            self.shares_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))
        else:
            self.shares_entry = tk.Entry(
            shares_frame,
            width=10,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 2),
            relief='solid',
            borderwidth=1,
            highlightthickness=0
        )
        self.shares_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))

        # Trade button frame
        btn_frame = tk.Frame(trade_frame, bg=self.bg_color)
        btn_frame.pack(fill=tk.X, padx=5, pady=(0, 5))

        # Buy button - Use ModernUI if available, fallback to standard tkinter
        if MODERN_UI_AVAILABLE and ModernUI:
            buy_btn = ModernUI.Button(
                btn_frame,
                text="Buy",
                command=self.buy_stock,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color=self.accent_color,
                hover_color="#1d4ed8",  # Deeper blue on hover
                text_color='white',
                corner_radius=8,
                height=40
                # width not specified - CustomTkinter will use default and pack will handle expansion
            )
            buy_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 2))
        else:
            # Fallback to standard tkinter button
            tk.Button(
                btn_frame,
                text="Buy",
                command=self.buy_stock,
                bg=self.accent_color,
                fg='white',
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            height=2,
            padx=20,
            pady=5
        ).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 2))

        # Sell button - Use ModernUI if available, fallback to standard tkinter
        if MODERN_UI_AVAILABLE and ModernUI:
            sell_btn = ModernUI.Button(
                btn_frame,
                text="Sell",
                command=self.sell_stock,
                font=('Segoe UI', self.base_font_size + 2, 'bold'),
                fg_color=self.danger_color,
                hover_color="#b91c1c",  # Deeper red on hover
                text_color='white',
                corner_radius=8,
                height=40
                # width not specified - CustomTkinter will use default and pack will handle expansion
            )
            sell_btn.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2, 0))
        else:
            # Fallback to standard tkinter button
            tk.Button(
                btn_frame,
                text="Sell",
                command=self.sell_stock,
                bg=self.danger_color,
                fg='white',
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            height=2,
            padx=20,
            pady=5
        ).pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(2, 0))

        # Trading settings & news events buttons
        settings_frame = tk.Frame(trade_frame, bg=self.bg_color)
        settings_frame.pack(fill=tk.X, padx=5, pady=(0, 5))

        # Trading Settings button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            ModernUI.Button(
                settings_frame,
                text="Trading Settings",
                command=self.open_trading_settings,
                font=('Segoe UI', self.base_font_size, 'bold'),
                fg_color=self.panel_bg,
                hover_color=self.hover_color,
                text_color=self.text_color,
                border_color=self.border_color,
                border_width=1,
                corner_radius=6,
                height=32
            ).pack(side=tk.LEFT, padx=(5, 4))
        else:
            tk.Button(
                settings_frame,
                text="Trading Settings",
            command=self.open_trading_settings,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='solid',
            borderwidth=1,
            highlightbackground=self.border_color,
            highlightthickness=0,
            cursor='hand2',
            padx=10,
            pady=4
        ).pack(side=tk.LEFT, padx=(5, 4))

        # Add Good News button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            ModernUI.Button(
                settings_frame,
                text="Add Good News",
                command=lambda: self.add_news_event(event_type='good'),
                font=('Segoe UI', self.base_font_size, 'bold'),
                fg_color=self.panel_bg,
                hover_color=self.hover_color,
                text_color=self.success_color,
                border_color=self.success_color,
                border_width=1,
                corner_radius=6,
                height=32
            ).pack(side=tk.LEFT, padx=(0, 4))
        else:
            tk.Button(
                settings_frame,
                text="Add Good News",
            command=lambda: self.add_news_event(event_type='good'),
            bg=self.panel_bg,
            fg=self.success_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='solid',
            borderwidth=1,
            highlightbackground=self.success_color,
            highlightthickness=0,
            cursor='hand2',
            padx=8,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 4))

        # Add Bad News button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            ModernUI.Button(
                settings_frame,
                text="Add Bad News",
                command=lambda: self.add_news_event(event_type='bad'),
                font=('Segoe UI', self.base_font_size, 'bold'),
                fg_color=self.panel_bg,
                hover_color=self.hover_color,
                text_color=self.danger_color,
                border_color=self.danger_color,
                border_width=1,
                corner_radius=6,
                height=32
            ).pack(side=tk.LEFT, padx=(0, 0))
        else:
            tk.Button(
                settings_frame,
                text="Add Bad News",
            command=lambda: self.add_news_event(event_type='bad'),
            bg=self.panel_bg,
            fg=self.danger_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='solid',
            borderwidth=1,
            highlightbackground=self.danger_color,
            highlightthickness=0,
            cursor='hand2',
            padx=8,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 0))

        # Performance metrics panel (left column, under Trade Shares)
        perf_panel = tk.Frame(left_frame, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
        perf_panel.pack(fill=tk.BOTH, expand=False, pady=(8, 10), padx=0)

        tk.Label(
            perf_panel,
            text="Performance Metrics",
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        ).pack(anchor='w', padx=10, pady=(8, 2))

        metrics_frame = tk.Frame(perf_panel, bg=self.panel_bg)
        metrics_frame.pack(fill=tk.X, padx=10, pady=(0, 6))

        self.metric_total_return = tk.Label(
            metrics_frame, text="Total Return: --", font=('Segoe UI', self.base_font_size + 1),
            bg=self.panel_bg, fg=self.text_color, anchor='w'
        )
        self.metric_total_return.pack(anchor='w')

        self.metric_max_dd = tk.Label(
            metrics_frame, text="Max Drawdown: --", font=('Segoe UI', self.base_font_size + 1),
            bg=self.panel_bg, fg=self.text_color, anchor='w'
        )
        self.metric_max_dd.pack(anchor='w')

        self.metric_sharpe = tk.Label(
            metrics_frame, text="Sharpe (daily): --", font=('Segoe UI', self.base_font_size + 1),
            bg=self.panel_bg, fg=self.text_color, anchor='w'
        )
        self.metric_sharpe.pack(anchor='w')

        self.metric_win_rate = tk.Label(
            metrics_frame, text="Win Rate / PF: --", font=('Segoe UI', self.base_font_size + 1),
            bg=self.panel_bg, fg=self.text_color, anchor='w'
        )
        self.metric_win_rate.pack(anchor='w')

        # Score display (separator line)
        separator = tk.Frame(metrics_frame, bg=self.border_color, height=1)
        separator.pack(fill=tk.X, pady=(6, 6))

        # Score label
        score_label_frame = tk.Frame(metrics_frame, bg=self.panel_bg)
        score_label_frame.pack(fill=tk.X, pady=(0, 2))
        
        tk.Label(
            score_label_frame,
            text="📊 Performance Score",
            font=('Segoe UI', self.base_font_size + 1, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        ).pack(side=tk.LEFT)

        # Score value and grade
        self.metric_score = tk.Label(
            metrics_frame,
            text="Score: -- | Grade: --",
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            bg=self.panel_bg,
            fg=self.accent_color,
            anchor='w'
        )
        self.metric_score.pack(anchor='w', pady=(0, 2))

        # Score detail button
        self.score_detail_btn = tk.Button(
            metrics_frame,
            text="📈 View Details",
            command=self.show_score_details,
            bg=self.accent_color,
            fg='white',
            font=('Segoe UI', self.base_font_size),
            relief='flat',
            cursor='hand2',
            padx=8,
            pady=2
        )
        self.score_detail_btn.pack(anchor='w', pady=(0, 4))
        
        # Clear data button (separator)
        separator2 = tk.Frame(metrics_frame, bg=self.border_color, height=1)
        separator2.pack(fill=tk.X, pady=(4, 4))
        
        tk.Button(
            metrics_frame,
            text="🗑️ Clear Trade Data",
            command=self.clear_trade_data,
            bg=self.danger_color,
            fg='white',
            font=('Segoe UI', self.base_font_size),
            relief='flat',
            cursor='hand2',
            padx=8,
            pady=2
        ).pack(anchor='w', pady=(0, 4))

        # Equity curve chart (compact)
        self.equity_canvas = None
        if MATPLOTLIB_AVAILABLE:
            self.equity_fig = Figure(figsize=(3.6, 1.8), dpi=100)
            self.equity_ax = self.equity_fig.add_subplot(111)
            self.equity_ax.set_title("Equity Curve", fontsize=10)
            self.equity_ax.grid(True, linestyle='--', alpha=0.3)
            self.equity_ax.tick_params(axis='x', labelrotation=30, labelsize=8)
            self.equity_ax.tick_params(axis='y', labelsize=8)

            equity_container = tk.Frame(perf_panel, bg=self.panel_bg)
            equity_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=(0, 8))
            self.equity_canvas = FigureCanvasTkAgg(self.equity_fig, master=equity_container)
            self.equity_canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        else:
            tk.Label(
                perf_panel,
                text="Install matplotlib to view equity curve.",
                font=('Segoe UI', self.base_font_size),
                bg=self.panel_bg,
                fg=self.text_color,
                anchor='w'
            ).pack(anchor='w', padx=10, pady=(0, 8))

        # Create right frame
        right_frame = tk.Frame(self.root, bg=self.bg_color)
        right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Create top info frame (horizontal: left column = stock info + assets stacked; right = orders)
        top_info_frame = tk.Frame(right_frame, bg=self.bg_color)
        top_info_frame.pack(fill=tk.X, pady=(5, 10))

        left_info_column = tk.Frame(top_info_frame, bg=self.bg_color)
        left_info_column.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 6))

        # Stock info frame (multi-row vertical)
        stock_info_frame = tk.Frame(left_info_column, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
        stock_info_frame.pack(fill=tk.X, padx=0, pady=(0, 6))

        self.info_name_label = tk.Label(
            stock_info_frame,
            text="Select stock to view details",
            font=('Segoe UI', self.base_font_size + 3, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        )
        self.info_name_label.pack(fill=tk.X, padx=10, pady=(8, 2))

        self.info_price_label = tk.Label(
            stock_info_frame,
            text="Price: --",
            font=('Segoe UI', self.base_font_size + 2),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        )
        self.info_price_label.pack(fill=tk.X, padx=10, pady=2)

        self.info_change_label = tk.Label(
            stock_info_frame,
            text="Change: --",
            font=('Segoe UI', self.base_font_size + 2),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        )
        self.info_change_label.pack(fill=tk.X, padx=10, pady=(2, 8))

        # Asset info frame (below stock info, same column)
        asset_info_frame = tk.Frame(left_info_column, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
        asset_info_frame.pack(fill=tk.X, padx=0, pady=(0, 0))

        # Order entry / pending orders frame (right of stock+asset column)
        order_frame = tk.Frame(top_info_frame, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
        order_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(5, 0))

        # Header
        tk.Label(
            order_frame,
            text="Orders (Limit / Stop)",
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        ).pack(anchor='w', padx=10, pady=(8, 4))

        # Inner frame: left = form, right = table
        order_content_frame = tk.Frame(order_frame, bg=self.panel_bg)
        order_content_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=(0, 8))

        # Left side: order form
        order_form = tk.Frame(order_content_frame, bg=self.panel_bg)
        order_form.pack(side=tk.LEFT, fill=tk.BOTH, expand=False, padx=(0, 6))

        # Side selection
        side_frame = tk.Frame(order_form, bg=self.panel_bg)
        side_frame.pack(fill=tk.X, pady=(0, 4))
        tk.Label(side_frame, text="Side:", bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size, 'bold')).pack(side=tk.LEFT)
        self.order_side_var = tk.StringVar(value="Buy")
        tk.Radiobutton(side_frame, text="Buy", variable=self.order_side_var, value="Buy", bg=self.panel_bg, fg=self.text_color, selectcolor=self.hover_color, font=('Segoe UI', self.base_font_size)).pack(side=tk.LEFT, padx=(6, 8))
        tk.Radiobutton(side_frame, text="Sell", variable=self.order_side_var, value="Sell", bg=self.panel_bg, fg=self.text_color, selectcolor=self.hover_color, font=('Segoe UI', self.base_font_size)).pack(side=tk.LEFT)

        # Type selection
        type_frame = tk.Frame(order_form, bg=self.panel_bg)
        type_frame.pack(fill=tk.X, pady=(0, 4))
        tk.Label(type_frame, text="Type:", bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size, 'bold')).pack(side=tk.LEFT)
        self.order_type_var = tk.StringVar(value="limit")
        tk.Radiobutton(type_frame, text="Limit", variable=self.order_type_var, value="limit", bg=self.panel_bg, fg=self.text_color, selectcolor=self.hover_color, font=('Segoe UI', self.base_font_size)).pack(side=tk.LEFT, padx=(6, 4))
        tk.Radiobutton(type_frame, text="Stop Loss", variable=self.order_type_var, value="stop_loss", bg=self.panel_bg, fg=self.text_color, selectcolor=self.hover_color, font=('Segoe UI', self.base_font_size)).pack(side=tk.LEFT, padx=(4, 4))
        tk.Radiobutton(type_frame, text="Take Profit", variable=self.order_type_var, value="take_profit", bg=self.panel_bg, fg=self.text_color, selectcolor=self.hover_color, font=('Segoe UI', self.base_font_size)).pack(side=tk.LEFT, padx=(4, 0))

        # Price and shares inputs
        order_price_frame = tk.Frame(order_form, bg=self.panel_bg)
        order_price_frame.pack(fill=tk.X, pady=(2, 2))
        tk.Label(order_price_frame, text="Price/Trigger:", bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size, 'bold')).pack(side=tk.LEFT)
        # Order price entry - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.order_price_entry = ModernUI.Entry(
                order_price_frame,
                width=120,
                height=28,
                font=('Segoe UI', self.base_font_size + 1),
                placeholder_text="Enter price",
                corner_radius=6
            )
            self.order_price_entry.pack(side=tk.LEFT, padx=(6, 10))
        else:
            self.order_price_entry = tk.Entry(order_price_frame, width=12, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1), relief='solid', borderwidth=1)
        self.order_price_entry.pack(side=tk.LEFT, padx=(6, 10))

        order_shares_frame = tk.Frame(order_form, bg=self.panel_bg)
        order_shares_frame.pack(fill=tk.X, pady=(0, 4))
        tk.Label(order_shares_frame, text="Shares:", bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size, 'bold')).pack(side=tk.LEFT)
        # Order shares entry - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.order_shares_entry = ModernUI.Entry(
                order_shares_frame,
                width=100,
                height=28,
                font=('Segoe UI', self.base_font_size + 1),
                placeholder_text="Enter shares",
                corner_radius=6
            )
            self.order_shares_entry.pack(side=tk.LEFT, padx=(6, 0))
        else:
            self.order_shares_entry = tk.Entry(order_shares_frame, width=10, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1), relief='solid', borderwidth=1)
        self.order_shares_entry.pack(side=tk.LEFT, padx=(6, 0))

        # Order buttons
        order_btns = tk.Frame(order_form, bg=self.panel_bg)
        order_btns.pack(fill=tk.X, pady=(2, 6))
        
        # Place Order button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            ModernUI.Button(
                order_btns,
                text="Place Order",
                command=self.place_pending_order,
                font=('Segoe UI', self.base_font_size, 'bold'),
                fg_color=self.accent_color,
                hover_color="#1d4ed8",
                text_color='white',
                corner_radius=6,
                height=32
            ).pack(side=tk.LEFT, padx=(0, 6))
        else:
            tk.Button(
                order_btns,
                text="Place Order",
            command=self.place_pending_order,
            bg=self.accent_color,
            fg='white',
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            padx=10,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 6))

        # Cancel Selected button - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            ModernUI.Button(
                order_btns,
                text="Cancel Selected",
                command=self.cancel_selected_order,
                font=('Segoe UI', self.base_font_size, 'bold'),
                fg_color=self.panel_bg,
                hover_color=self.hover_color,
                text_color=self.text_color,
                border_color=self.border_color,
                border_width=1,
                corner_radius=6,
                height=32
            ).pack(side=tk.LEFT, padx=(0, 0))
        else:
            tk.Button(
                order_btns,
                text="Cancel Selected",
            command=self.cancel_selected_order,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='solid',
            borderwidth=1,
            highlightbackground=self.border_color,
            highlightthickness=0,
            cursor='hand2',
            padx=10,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 0))

        # Right side: pending orders table
        order_table_frame = tk.Frame(order_content_frame, bg=self.panel_bg)
        order_table_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 0))

        columns_orders = ("code", "side", "otype", "price", "shares", "status")
        self.order_tree = ttk.Treeview(order_table_frame, columns=columns_orders, show='headings', style="Treeview", height=5)
        self.order_tree.heading("code", text="Code")
        self.order_tree.heading("side", text="Side")
        self.order_tree.heading("otype", text="Type")
        self.order_tree.heading("price", text="Price")
        self.order_tree.heading("shares", text="Shares")
        self.order_tree.heading("status", text="Status")
        for c, w in zip(columns_orders, (80, 60, 90, 80, 70, 80)):
            self.order_tree.column(c, width=w, anchor='center')

        order_scroll = ttk.Scrollbar(order_table_frame, orient=tk.VERTICAL, command=self.order_tree.yview)
        self.order_tree.configure(yscrollcommand=order_scroll.set)
        self.order_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        order_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        # Load existing pending orders into table
        self.refresh_pending_orders_table()

        # Asset title - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.asset_label = ModernUI.Label(
                asset_info_frame,
                text="Account Assets",
                font=('Segoe UI', self.base_font_size + 4, 'bold'),
                text_color=self.text_color,
                bg_color=self.panel_bg
            )
            self.asset_label.pack(anchor='w', padx=10, pady=5)
        else:
            self.asset_label = tk.Label(
            asset_info_frame,
            text="Account Assets",
            font=('Segoe UI', self.base_font_size + 4, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        )
        self.asset_label.pack(anchor='w', padx=10, pady=5)

        # Cash balance - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.cash_label = ModernUI.Label(
                asset_info_frame,
                text=f"Cash: ${self.cash:.2f}",
                font=('Segoe UI', self.base_font_size + 2),
                text_color=self.text_color,
                bg_color=self.panel_bg
            )
            self.cash_label.pack(anchor='w', padx=10, pady=2)
        else:
            self.cash_label = tk.Label(
            asset_info_frame,
            text=f"Cash: ${self.cash:.2f}",
            font=('Segoe UI', self.base_font_size + 2),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        )
        self.cash_label.pack(anchor='w', padx=10, pady=2)

        # Button to reset account and set a new initial cash amount - Use ModernUI if available
        if MODERN_UI_AVAILABLE and ModernUI:
            self.reset_button = ModernUI.Button(
                asset_info_frame,
                text="Reset Account / Set Initial Cash",
                command=self.reset_account,
                font=('Segoe UI', self.base_font_size + 1, 'bold'),
                fg_color=self.panel_bg,
                hover_color=self.hover_color,
                text_color=self.text_color,
                border_color=self.border_color,
                border_width=1,
                corner_radius=6,
                height=32
            )
            self.reset_button.pack(anchor='w', padx=10, pady=(4, 8))
        else:
            self.reset_button = tk.Button(
            asset_info_frame,
            text="Reset Account / Set Initial Cash",
            command=self.reset_account,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size + 1, 'bold'),
            relief='solid',
            borderwidth=1,
            highlightbackground=self.border_color,
            highlightthickness=0,
            cursor='hand2',
            padx=10,
            pady=5
        )
        self.reset_button.pack(anchor='w', padx=10, pady=(4, 8))

        # Performance metrics moved to left column under Trade Shares

        # K-line (candlestick) chart frame
        chart_frame = tk.Frame(right_frame, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
        # Let K-line area occupy more vertical space
        chart_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))

        tk.Label(
            chart_frame,
            text="Price K-line (Candlestick) Chart",
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color,
            anchor='w'
        ).pack(anchor='w', padx=10, pady=5)

        self.chart_container = tk.Frame(chart_frame, bg=self.panel_bg)
        self.chart_container.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        self.kline_canvas = None

        if MATPLOTLIB_AVAILABLE:
            # Initialize a figure with two subplots: upper for price K-line (higher), lower for volume bars (lower)
            # Dark theme background
            self.kline_figure = Figure(figsize=(6, 4), dpi=100, facecolor='#1a1a1a')
            # Use GridSpec to control height ratio: price chart : volume chart = 3 : 1
            gs = self.kline_figure.add_gridspec(4, 1, hspace=0.05)
            self.kline_ax = self.kline_figure.add_subplot(gs[:3, 0], facecolor='#1a1a1a')
            self.volume_ax = self.kline_figure.add_subplot(gs[3, 0], sharex=self.kline_ax, facecolor='#1a1a1a')

            # Initial setup with dark theme (will be updated in _draw_kline_manual)
            self.kline_ax.set_ylabel("Price", color='#e0e0e0')
            self.kline_ax.grid(True, linestyle='--', alpha=0.2, color='#2a2a2a', linewidth=0.5)
            # Only show date ticks on bottom subplot
            self.kline_ax.tick_params(labelbottom=False, colors='#e0e0e0')

            self.volume_ax.set_ylabel("Volume", color='#e0e0e0')
            self.volume_ax.grid(True, linestyle='--', alpha=0.2, color='#2a2a2a', linewidth=0.5)
            self.volume_ax.tick_params(colors='#e0e0e0')

            self.kline_canvas = FigureCanvasTkAgg(self.kline_figure, master=self.chart_container)
            self.kline_canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True)
        else:
            tk.Label(
                self.chart_container,
                text="matplotlib not installed. Install it to enable K-line chart.",
                font=('Segoe UI', self.base_font_size + 1),
                bg=self.bg_color,
                fg=self.text_color
            ).pack(expand=True)

        # Bottom frame for portfolio and trade records side by side
        bottom_frame = tk.Frame(right_frame, bg=self.bg_color)
        # Don't let bottom area expand, so K-line chart can be taller
        bottom_frame.pack(fill=tk.X, expand=False)

        # Portfolio details table (no longer expands vertically, leaving more height for charts above)
        portfolio_frame = tk.Frame(bottom_frame, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
        portfolio_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=False, pady=(0, 0), padx=(0, 5))

        tk.Label(
            portfolio_frame,
            text="Portfolio Details",
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color
        ).pack(pady=5)
        
        # Create portfolio table
        columns = ('stock_code', 'stock_name', 'shares', 'cost', 'current_value', 'profit')
        self.portfolio_tree = ttk.Treeview(portfolio_frame, columns=columns, show='headings', style="Treeview")
        
        # Set column headings
        self.portfolio_tree.heading('stock_code', text='Stock Code')
        self.portfolio_tree.heading('stock_name', text='Stock Name')
        self.portfolio_tree.heading('shares', text='Shares')
        self.portfolio_tree.heading('cost', text='Cost')
        self.portfolio_tree.heading('current_value', text='Current Value')
        self.portfolio_tree.heading('profit', text='Profit/Loss')
        
        # Set column widths
        self.portfolio_tree.column('stock_code', width=100)
        self.portfolio_tree.column('stock_name', width=100)
        self.portfolio_tree.column('shares', width=80)
        self.portfolio_tree.column('cost', width=100)
        self.portfolio_tree.column('current_value', width=100)
        self.portfolio_tree.column('profit', width=120)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(portfolio_frame, orient=tk.VERTICAL, command=self.portfolio_tree.yview)
        self.portfolio_tree.configure(yscrollcommand=scrollbar.set)
        
        # Layout
        self.portfolio_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, pady=5)

        # Trade records table (also doesn't expand)
        records_frame = tk.Frame(bottom_frame, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
        records_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=False, pady=(0, 0), padx=(5, 0))
        
        tk.Label(
            records_frame,
            text="Trade Records",
            font=('Segoe UI', self.base_font_size + 2, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color
        ).pack(pady=5)
        
        # Create table
        columns = ('date', 'stock_code', 'stock_name', 'trade_type', 'shares', 'price', 'total_amount')
        self.records_tree = ttk.Treeview(records_frame, columns=columns, show='headings', style="Treeview")
        
        # Set column headings
        self.records_tree.heading('date', text='Date')
        self.records_tree.heading('stock_code', text='Stock Code')
        self.records_tree.heading('stock_name', text='Stock Name')
        self.records_tree.heading('trade_type', text='Trade Type')
        self.records_tree.heading('shares', text='Shares')
        self.records_tree.heading('price', text='Price')
        self.records_tree.heading('total_amount', text='Total Amount')
        
        # Set column widths
        self.records_tree.column('date', width=100)
        self.records_tree.column('stock_code', width=100)
        self.records_tree.column('stock_name', width=100)
        self.records_tree.column('trade_type', width=80)
        self.records_tree.column('shares', width=80)
        self.records_tree.column('price', width=100)
        self.records_tree.column('total_amount', width=100)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(records_frame, orient=tk.VERTICAL, command=self.records_tree.yview)
        self.records_tree.configure(yscrollcommand=scrollbar.set)
        
        # Layout
        self.records_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5, pady=5)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y, pady=5)
        
        # Load trade records
        self.load_trade_records()
        self.update_portfolio_table()

    def update_portfolio_table(self):
        """Update portfolio table"""
        # Clear existing records
        for item in self.portfolio_tree.get_children():
            self.portfolio_tree.delete(item)
        
        # Add new records
        for stock_code, info in self.portfolio.items():
            shares = info['shares']
            cost = info['total_cost']
            
            # Try to get stock data from current stocks list
            if stock_code in self.stocks:
                stock = self.stocks[stock_code]
                stock_name = stock['name']
                current_price = stock['price']
            else:
                # Stock not in current list (maybe data fetch failed for this date)
                # Try to get stock name from stock list
                stock_list = self.data_manager.get_stock_list()
                stock_name = stock_list.get(stock_code, stock_code)
                
                # Try to get price from data manager for current date
                try:
                    stock_data = self.data_manager.get_stock_data(stock_code, self.current_date)
                    if stock_data is not None:
                        current_price = stock_data['price']
                    else:
                        # If still no data, try to get from cache or use last known price
                        # Check if we have cached data for this date
                        date_str = self.current_date.strftime("%Y-%m-%d")
                        if date_str in self.data_manager.data and stock_code in self.data_manager.data[date_str]:
                            cached_data = self.data_manager.data[date_str][stock_code]
                            current_price = cached_data.get('price', 0.0)
                        else:
                            # No data available - use cost basis as fallback
                            current_price = (cost / shares) if shares > 0 else 0.0
                except Exception as e:
                    print(f"Error getting price for {stock_code}: {e}")
                    # Use cost basis as fallback
                    current_price = (cost / shares) if shares > 0 else 0.0
            
                current_value = current_price * shares
                profit = current_value - cost
                profit_percent = (profit / cost * 100) if cost > 0 else 0
                
                self.portfolio_tree.insert('', 'end', values=(
                    stock_code,
                stock_name,
                    shares,
                    f"${cost:.2f}",
                    f"${current_value:.2f}",
                    f"${profit:.2f} ({profit_percent:.2f}%)"
                ))

    def show_stock_details(self, event=None):
        """Show selected stock details"""
        selection = self.stock_listbox.curselection()
        if selection:
            index = selection[0]
            code = self.stock_listbox.get(index).split()[0]
            stock = self.stocks[code]

            # Update stock info labels
            change_percent = stock['change_percent']
            color = self.danger_color if change_percent >= 0 else self.success_color
            self.info_name_label.config(text=f"{stock['name']} ({code})")
            self.info_price_label.config(text=f"Price: ${stock['price']:.2f}")
            self.info_change_label.config(text=f"Change: {change_percent:+.2f}%", fg=color)
            
            # Update portfolio table
            self.update_portfolio_table()

            # Update K-line chart
            self.update_kline_chart(code)

    # ----------------------- Pending orders (limit / stop) -----------------------
    def refresh_pending_orders_table(self):
        if not hasattr(self, "order_tree"):
            return
        for item in self.order_tree.get_children():
            self.order_tree.delete(item)
        for order in self.pending_orders:
            oid = order.get("id", "")
            self.order_tree.insert(
                '',
                'end',
                iid=oid,
                values=(
                    order.get("code", ""),
                    order.get("side", ""),
                    order.get("type", ""),
                    f"${order.get('price', 0):.2f}",
                    order.get("shares", 0),
                    order.get("status", "open")
                )
            )

    def place_pending_order(self):
        try:
            selection = self.stock_listbox.curselection()
            if not selection:
                messagebox.showerror("Error", "Please select a stock first.")
                return
            code = self.stock_listbox.get(selection[0]).split()[0]
            stock = self.stocks.get(code)
            if not stock:
                messagebox.showerror("Error", "Stock data not available.")
                return

            side = self.order_side_var.get()
            otype = self.order_type_var.get()
            price_str = self.order_price_entry.get().strip()
            shares_str = self.order_shares_entry.get().strip()
            if not price_str or not shares_str:
                messagebox.showerror("Error", "Please input price and shares for the order.")
                return
            try:
                price = float(price_str)
                shares = int(shares_str)
            except Exception:
                messagebox.showerror("Error", "Invalid price or shares.")
                return
            if price <= 0 or shares <= 0:
                messagebox.showerror("Error", "Price and shares must be positive.")
                return

            # Restrict stop-loss / take-profit to Sell side to keep logic simple
            if otype in {"stop_loss", "take_profit"} and side != "Sell":
                messagebox.showerror("Error", "Stop Loss / Take Profit currently support Sell side only.")
                return

            order = {
                "id": f"{int(time.time()*1000)}",
                "code": code,
                "name": stock.get("name", ""),
                "side": side,
                "type": otype,
                "price": price,
                "shares": shares,
                "status": "open",
                "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            self.pending_orders.append(order)
            self.trade_manager.pending_orders = self.pending_orders
            self.trade_manager.save_data()
            self.refresh_pending_orders_table()
            messagebox.showinfo("Order Placed", f"{otype.replace('_', ' ').title()} {side} order placed for {code}.")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to place order: {e}")

    def cancel_selected_order(self):
        try:
            selection = self.order_tree.selection()
            if not selection:
                return
            oid = selection[0]
            self.pending_orders = [o for o in self.pending_orders if o.get("id") != oid]
            self.trade_manager.pending_orders = self.pending_orders
            self.trade_manager.save_data()
            self.refresh_pending_orders_table()
        except Exception as e:
            print(f"Failed to cancel order: {e}")

    def process_pending_orders(self):
        """Process open limit/stop orders based on current prices."""
        if not self.pending_orders or not self.stocks:
            return
        updated = False
        executed = 0
        remaining = []
        for order in list(self.pending_orders):
            code = order.get("code")
            if code not in self.stocks:
                remaining.append(order)
                continue
            current_price = self.stocks[code]["price"]
            trigger_price = float(order.get("price", 0))
            shares = int(order.get("shares", 0))
            side = order.get("side", "Buy")
            otype = order.get("type", "limit")

            should_exec = False
            if otype == "limit":
                if side == "Buy" and current_price <= trigger_price:
                    should_exec = True
                if side == "Sell" and current_price >= trigger_price:
                    should_exec = True
            elif otype == "stop_loss":
                if side == "Sell" and current_price <= trigger_price:
                    should_exec = True
            elif otype == "take_profit":
                if side == "Sell" and current_price >= trigger_price:
                    should_exec = True

            if not should_exec:
                remaining.append(order)
                continue

            # Execute
            try:
                exec_price, gross, fee = self.trade_manager.calculate_trade_costs(current_price, shares, side)
                if side == "Buy":
                    if gross + fee > self.cash:
                        remaining.append(order)  # keep pending if insufficient cash
                        continue
                    self.trade_manager.add_trade_record(
                        self.current_date.strftime('%Y-%m-%d'),
                        code,
                        order.get("name", code),
                        'Buy',
                        shares,
                        exec_price,
                        gross
                    )
                    self.trade_manager.update_portfolio(code, shares, exec_price, 'Buy')
                    self.trade_manager.update_cash(gross, 'Buy', fee=fee)
                else:  # Sell
                    if code not in self.portfolio or self.portfolio[code]['shares'] < shares:
                        remaining.append(order)  # keep pending if not enough shares
                        continue
                    self.trade_manager.add_trade_record(
                        self.current_date.strftime('%Y-%m-%d'),
                        code,
                        order.get("name", code),
                        'Sell',
                        shares,
                        exec_price,
                        gross
                    )
                    self.trade_manager.update_portfolio(code, shares, exec_price, 'Sell')
                    self.trade_manager.update_cash(gross, 'Sell', fee=fee)

                executed += 1
                updated = True
            except Exception as e:
                print(f"Failed to execute order {order.get('id')}: {e}")
                remaining.append(order)

        if updated:
            self.pending_orders = remaining
            self.trade_manager.pending_orders = self.pending_orders
            self.trade_manager.save_data()
            self.cash = self.trade_manager.get_cash()
            self.portfolio = self.trade_manager.get_portfolio()
            self.update_assets()
            self.load_trade_records()
            self.update_portfolio_table()
            self.refresh_pending_orders_table()
            if executed > 0:
                messagebox.showinfo("Orders Executed", f"{executed} order(s) executed based on current prices.")

    def open_trading_settings(self):
        """Open a dialog to configure trading cost settings (fee rate, min fee, slippage)."""
        manager = tk.Toplevel(self.root)
        manager.title("Trading Settings")
        manager.geometry("360x220")
        manager.transient(self.root)
        manager.grab_set()

        frame = tk.Frame(manager, bg=self.bg_color)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        tk.Label(
            frame,
            text="Fee rate (as a fraction of trade value, e.g., 0.001 = 0.1%)",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size)
        ).grid(row=0, column=0, columnspan=2, sticky='w', pady=(0, 2))

        tk.Label(
            frame,
            text="Fee rate:",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=1, column=0, sticky='e', pady=2, padx=(0, 5))

        fee_rate_var = tk.StringVar(value=f"{self.trade_manager.fee_rate:.6f}")
        fee_rate_entry = tk.Entry(frame, textvariable=fee_rate_var, width=12, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        fee_rate_entry.grid(row=1, column=1, sticky='w', pady=2)

        tk.Label(
            frame,
            text="Minimum fee (USD):",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=2, column=0, sticky='e', pady=2, padx=(0, 5))

        min_fee_var = tk.StringVar(value=f"{self.trade_manager.min_fee:.2f}")
        min_fee_entry = tk.Entry(frame, textvariable=min_fee_var, width=12, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        min_fee_entry.grid(row=2, column=1, sticky='w', pady=2)

        tk.Label(
            frame,
            text="Slippage per share (USD):",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=3, column=0, sticky='e', pady=2, padx=(0, 5))

        slippage_var = tk.StringVar(value=f"{self.trade_manager.slippage_per_share:.4f}")
        slippage_entry = tk.Entry(frame, textvariable=slippage_var, width=12, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        slippage_entry.grid(row=3, column=1, sticky='w', pady=2)

        # Risk & auto-trading settings
        tk.Label(
            frame,
            text="Stop-loss threshold (% loss, e.g., 10 means -10%):",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size)
        ).grid(row=4, column=0, columnspan=2, sticky='w', pady=(8, 2))

        tk.Label(
            frame,
            text="Stop-loss %:",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=5, column=0, sticky='e', pady=2, padx=(0, 5))

        stop_loss_var = tk.StringVar(value=f"{self.trade_manager.stop_loss_pct:.2f}")
        stop_loss_entry = tk.Entry(frame, textvariable=stop_loss_var, width=12, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        stop_loss_entry.grid(row=5, column=1, sticky='w', pady=2)

        tk.Label(
            frame,
            text="Scale step % (gain/loss to trigger scale in/out):",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size)
        ).grid(row=6, column=0, columnspan=2, sticky='w', pady=(8, 2))

        tk.Label(
            frame,
            text="Scale step %:",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=7, column=0, sticky='e', pady=2, padx=(0, 5))

        scale_step_var = tk.StringVar(value=f"{self.trade_manager.scale_step_pct:.2f}")
        scale_step_entry = tk.Entry(frame, textvariable=scale_step_var, width=12, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        scale_step_entry.grid(row=7, column=1, sticky='w', pady=2)

        tk.Label(
            frame,
            text="Scale fraction % (portion of current position to adjust):",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size)
        ).grid(row=8, column=0, columnspan=2, sticky='w', pady=(2, 2))

        tk.Label(
            frame,
            text="Scale fraction %:",
            bg=self.bg_color,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold')
        ).grid(row=9, column=0, sticky='e', pady=2, padx=(0, 5))

        scale_fraction_var = tk.StringVar(value=f"{self.trade_manager.scale_fraction_pct:.2f}")
        scale_fraction_entry = tk.Entry(frame, textvariable=scale_fraction_var, width=12, bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', self.base_font_size + 1))
        scale_fraction_entry.grid(row=9, column=1, sticky='w', pady=2)

        def save_settings():
            try:
                fee_rate = float(fee_rate_var.get())
                min_fee = float(min_fee_var.get())
                slippage = float(slippage_var.get())
                stop_loss = float(stop_loss_var.get())
                scale_step = float(scale_step_var.get())
                scale_fraction = float(scale_fraction_var.get())

                if fee_rate < 0 or min_fee < 0 or slippage < 0 or stop_loss < 0 or scale_step < 0 or scale_fraction < 0:
                    messagebox.showerror("Error", "All values must be non-negative.")
                    return

                self.trade_manager.fee_rate = fee_rate
                self.trade_manager.min_fee = min_fee
                self.trade_manager.slippage_per_share = slippage
                self.trade_manager.stop_loss_pct = stop_loss
                self.trade_manager.scale_step_pct = scale_step
                self.trade_manager.scale_fraction_pct = scale_fraction
                self.trade_manager.save_data()

                messagebox.showinfo("Success", "Trading settings updated successfully.")
                manager.destroy()
            except ValueError:
                messagebox.showerror("Error", "Please enter valid numeric values.")

        btn_frame = tk.Frame(frame, bg=self.bg_color)
        btn_frame.grid(row=10, column=0, columnspan=2, pady=(12, 0))

        tk.Button(
            btn_frame,
            text="Save",
            command=save_settings,
            bg=self.accent_color,
            fg='white',
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            padx=16,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 8))
        
        tk.Button(
            btn_frame,
            text="Stress Test Settings",
            command=self.open_stress_test_settings,
            bg="#F59E0B",
            fg='white',
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=10,
            pady=4
        ).pack(side=tk.LEFT, padx=(0, 8))

        tk.Button(
            btn_frame,
            text="Cancel",
            command=manager.destroy,
            bg=self.panel_bg,
            fg=self.text_color,
            font=('Segoe UI', self.base_font_size, 'bold'),
            relief='flat',
            borderwidth=0,
            cursor='hand2',
            padx=16,
            pady=4
        ).pack(side=tk.LEFT)

    # ----------------------- News / sentiment events -----------------------
    def add_news_event(self, event_type='good'):
        """Add a good/bad news event for the currently selected stock starting from current date."""
        selection = self.stock_listbox.curselection()
        if not selection:
            messagebox.showerror("Error", "Please select a stock in the list first.")
            return

        index = selection[0]
        stock_code = self.stock_listbox.get(index).split()[0]
        stock_name = self.stocks[stock_code]['name']

        # Default settings: good news +3%, bad news -3%, duration 5 days
        default_impact = 3.0 if event_type == 'good' else -3.0
        title = "Add Good News Event" if event_type == 'good' else "Add Bad News Event"

        # Ask user for impact and duration
        impact = simpledialog.askfloat(
            title,
            f"Set daily impact percentage for {stock_name} ({stock_code}).\n"
            f"Positive for good news, negative for bad news.\n\n"
            f"Example: 3 means +3% extra per day.",
            initialvalue=default_impact,
            parent=self.root
        )
        if impact is None:
            return

        days = simpledialog.askinteger(
            title,
            "How many days should this event last?",
            initialvalue=5,
            minvalue=1,
            maxvalue=365,
            parent=self.root
        )
        if days is None or days <= 0:
            return

        # Add event to data manager
        self.data_manager.add_event(stock_code, self.current_date, days, impact)

        # Reload current date prices so effect is visible immediately
        self.show_loading(self._loading_message("Loading"))
        self.load_stocks(datetime.datetime.combine(self.current_date, datetime.time()))

        messagebox.showinfo(
            "News Event Added",
            f"{'Good' if impact >= 0 else 'Bad'} news event added for {stock_name} ({stock_code}) "
            f"from {self.current_date.strftime('%Y-%m-%d')} for {days} day(s), "
            f"impact {impact:+.2f}% per day."
        )

    def load_trade_records(self):
        """Load trade records to table"""
        # Clear existing records
        for item in self.records_tree.get_children():
            self.records_tree.delete(item)
        
        # Add new records
        records = self.trade_manager.get_trade_records()
        for record in records:
            self.records_tree.insert('', 'end', values=(
                record['date'],
                record['stock_code'],
                record['stock_name'],
                record['trade_type'],
                record['shares'],
                f"${record['price']:.2f}",
                f"${record['total_amount']:.2f}"
            ))

    def update_assets(self):
        """Update asset display"""
        total_value = self.cash
        portfolio_text = "Portfolio Details:\n"
        
        for stock_code, info in self.portfolio.items():
            if stock_code in self.stocks:
                current_price = self.stocks[stock_code]['price']
                shares = info['shares']
                cost = info['total_cost']
                profit = (current_price * shares - cost)
                profit_percent = (profit / cost * 100) if cost > 0 else 0
                
                portfolio_text += f"{self.stocks[stock_code]['name']} ({stock_code}): {shares} shares\n"
                portfolio_text += f"  Cost: ${cost:.2f}\n"
                portfolio_text += f"  Current Value: ${current_price * shares:.2f}\n"
                portfolio_text += f"  Profit/Loss: ${profit:.2f} ({profit_percent:.2f}%)\n\n"
                
                total_value += current_price * shares
        # Update portfolio details and total asset display
        # ModernUI.Label now supports both config() and configure()
        self.asset_label.config(text=f"Total Assets: ${total_value:.2f}")
        self.cash_label.config(text=f"Cash: ${self.cash:.2f}")

        # Update performance metrics & equity curve
        self.update_equity_metrics(total_value)

    def _build_equity_curve(self, include_current=True):
        """Replay trade records to build equity curve (date, equity)."""
        records = self.trade_manager.get_trade_records()
        if not records:
            current_equity = self.cash
            for code, info in self.portfolio.items():
                price = self.stocks.get(code, {}).get('price', 0)
                current_equity += price * info['shares']
            return [(self.current_date, current_equity)]

        # Sort by date then insertion order
        def _parse_date(rec):
            try:
                return datetime.datetime.strptime(rec['date'], "%Y-%m-%d").date()
            except Exception:
                return self.current_date

        sorted_records = sorted(enumerate(records), key=lambda x: (_parse_date(x[1]), x[0]))

        cash = float(self.trade_manager.initial_cash)
        holdings = {}
        last_price = {}
        curve = []

        for _, rec in sorted_records:
            date = _parse_date(rec)
            code = rec['stock_code']
            price = float(rec['price'])
            shares = int(rec['shares'])
            trade_type = rec['trade_type']

            if trade_type == 'Buy':
                cash -= float(rec['total_amount'])
                holdings[code] = holdings.get(code, 0) + shares
            else:  # Sell
                cash += float(rec['total_amount'])
                holdings[code] = holdings.get(code, 0) - shares
                if holdings.get(code, 0) <= 0:
                    holdings.pop(code, None)

            last_price[code] = price
            equity = cash + sum(holdings[c] * last_price.get(c, 0) for c in holdings)
            curve.append((date, equity))

        if include_current:
            current_equity = self.cash
            for code, info in self.portfolio.items():
                px = self.stocks.get(code, {}).get('price', last_price.get(code, 0))
                current_equity += px * info['shares']
            curve.append((self.current_date, current_equity))

        return curve

    def _compute_performance_stats(self, curve):
        """Compute basic performance stats from equity curve."""
        if not curve:
            return {}
        # Sort by date
        curve = sorted(curve, key=lambda x: x[0])
        dates = [c[0] for c in curve]
        values = np.array([c[1] for c in curve], dtype=float)
        if len(values) == 0:
            return {}

        total_return = values[-1] / values[0] - 1 if values[0] != 0 else 0.0

        # Daily returns
        if len(values) > 1 and np.all(values[:-1] > 0):
            rets = np.diff(values) / values[:-1]
            avg_ret = rets.mean()
            vol = rets.std(ddof=1) if len(rets) > 1 else 0.0
            sharpe = (avg_ret / vol * np.sqrt(252)) if vol > 1e-9 else 0.0
        else:
            sharpe = 0.0

        cum_max = np.maximum.accumulate(values)
        drawdowns = (cum_max - values) / cum_max
        max_dd = drawdowns.max() if len(drawdowns) else 0.0

        # CAGR based on days
        span_days = max(1, (dates[-1] - dates[0]).days or 1)
        cagr = (values[-1] / values[0]) ** (365 / span_days) - 1 if values[0] > 0 else 0.0

        # Win rate / profit factor from realized trades
        win_count = 0
        loss_count = 0
        profit_sum = 0.0
        loss_sum = 0.0
        holdings = {}
        avg_cost = {}
        records = self.trade_manager.get_trade_records()
        for rec in records:
            code = rec['stock_code']
            shares = int(rec['shares'])
            price = float(rec['price'])
            if rec['trade_type'] == 'Buy':
                prev_shares = holdings.get(code, 0)
                prev_cost = avg_cost.get(code, 0.0) * prev_shares
                new_total_shares = prev_shares + shares
                new_total_cost = prev_cost + shares * price
                holdings[code] = new_total_shares
                avg_cost[code] = new_total_cost / new_total_shares if new_total_shares > 0 else 0.0
            else:
                if holdings.get(code, 0) <= 0:
                    continue
                cost_basis = avg_cost.get(code, 0.0)
                pnl = (price - cost_basis) * shares
                if pnl >= 0:
                    win_count += 1
                    profit_sum += pnl
                else:
                    loss_count += 1
                    loss_sum += pnl
                holdings[code] = holdings.get(code, 0) - shares
                if holdings[code] <= 0:
                    holdings.pop(code, None)
                    avg_cost.pop(code, None)

        total_trades = win_count + loss_count
        win_rate = (win_count / total_trades * 100) if total_trades > 0 else 0.0
        profit_factor = (profit_sum / abs(loss_sum)) if loss_sum < 0 else (profit_sum if profit_sum > 0 else 0.0)

        return {
            "total_return": total_return,
            "cagr": cagr,
            "sharpe": sharpe,
            "max_dd": max_dd,
            "win_rate": win_rate,
            "profit_factor": profit_factor,
            "curve": curve
        }

    def update_equity_metrics(self, latest_total_value):
        """Update equity metrics labels and plot."""
        try:
            curve = self._build_equity_curve(include_current=True)
            stats = self._compute_performance_stats(curve)
            if not stats:
                msg = "Total Return: --"
                self.metric_total_return.config(text=msg)
                self.metric_max_dd.config(text="Max Drawdown: --")
                self.metric_sharpe.config(text="Sharpe (daily): --")
                self.metric_win_rate.config(text="Win Rate / PF: --")
                self.metric_score.config(text="Score: -- | Grade: -- (Need trades)", fg=self.text_color)
                return

            self.metric_total_return.config(
                text=f"Total Return: {stats['total_return']*100:.2f}% | CAGR: {stats['cagr']*100:.2f}%"
            )
            self.metric_max_dd.config(text=f"Max Drawdown: {stats['max_dd']*100:.2f}%")
            self.metric_sharpe.config(text=f"Sharpe (daily): {stats['sharpe']:.2f}")
            self.metric_win_rate.config(
                text=f"Win Rate: {stats['win_rate']:.1f}% | PF: {stats['profit_factor']:.2f}"
            )
            
            # Calculate and update score (only if there are trades)
            records = self.trade_manager.get_trade_records()
            has_trades = len(records) > 0
            
            if has_trades:
                try:
                    score_result = self._calculate_score(stats)
                    grade_color = self._get_grade_color(score_result['grade'])
                    
                    # Update score display
                    self.metric_score.config(
                        text=f"Score: {score_result['total_score']:.1f} | Grade: {score_result['grade']}",
                        fg=grade_color
                    )
                    
                    # Store current score result for detail view
                    self.current_score_result = score_result
                except Exception as e:
                    print(f"Failed to calculate score: {e}")
                    import traceback
                    traceback.print_exc()
                    self.metric_score.config(text="Score: -- | Grade: --", fg=self.text_color)
            else:
                # No trades yet, don't show score
                self.metric_score.config(text="Score: -- | Grade: -- (Need trades)", fg=self.text_color)
                self.current_score_result = None

            if MATPLOTLIB_AVAILABLE and self.equity_canvas is not None:
                self.equity_ax.clear()
                dates = [d for d, _ in stats['curve']]
                values = [v for _, v in stats['curve']]
                self.equity_ax.plot(dates, values, color=self.accent_color, linewidth=2.0)
                self.equity_ax.set_title("Equity Curve", fontsize=10, fontweight='bold')
                self.equity_ax.tick_params(axis='x', labelrotation=30, labelsize=8)
                self.equity_ax.tick_params(axis='y', labelsize=8)
                self.equity_ax.set_ylabel("USD", fontsize=8)
                self.equity_ax.grid(True, linestyle='--', alpha=0.3, color=self.border_color)
                
                # Apply modern matplotlib theme if available
                if MODERN_UI_AVAILABLE and configure_matplotlib_theme:
                    try:
                        configure_matplotlib_theme(
                            self.equity_fig,
                            [self.equity_ax],
                            theme="light"
                        )
                    except Exception:
                        pass
                
                self.equity_fig.tight_layout()
                self.equity_canvas.draw()
        except Exception as e:
            print(f"Failed to update equity metrics: {e}")

    def update_kline_chart(self, stock_code):
        """Update K-line chart for the selected stock using mplfinance."""
        if not MATPLOTLIB_AVAILABLE or self.kline_canvas is None:
            return
        try:
            end_date = datetime.datetime.combine(self.current_date, datetime.time())
            history = self.data_manager.get_stock_history(stock_code, end_date, window_days=60)
            
            # If no history data, try to use mock data as fallback
            if history is None or history.empty:
                print(f"No history data for {stock_code}, trying mock data fallback")
                # Force use mock data temporarily
                original_mock_mode = self.data_manager.use_mock_data
                try:
                    self.data_manager.use_mock_data = True
                    history = self.data_manager.get_stock_history(stock_code, end_date, window_days=60)
                except Exception as e:
                    print(f"Failed to generate mock history: {e}")
                finally:
                    self.data_manager.use_mock_data = original_mock_mode
            
            if history is None or history.empty:
                self.kline_ax.clear()
                self.volume_ax.clear()
                self.kline_ax.set_title(f"{stock_code} - No historical data available")
                self.kline_ax.set_ylabel("Price")
                self.kline_ax.grid(True, linestyle='--', alpha=0.3)
                self.volume_ax.set_ylabel("Volume")
                self.volume_ax.grid(True, linestyle='--', alpha=0.3)
                self.kline_canvas.draw()
                return

            # Prepare data for mplfinance
            # mplfinance requires: index as DatetimeIndex, columns: Open, High, Low, Close, Volume
            df = history.copy()
            
            # Convert date column to DatetimeIndex
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
            
            # Select and rename columns to mplfinance format
            df = df[['open', 'high', 'low', 'close', 'volume']]
            df.columns = ['Open', 'High', 'Low', 'Close', 'Volume']
            
            # Ensure data is sorted by date (ascending)
            df = df.sort_index()
            
            # Remove any duplicate dates (keep last occurrence)
            df = df[~df.index.duplicated(keep='last')]
            
            # Ensure all required columns are numeric
            for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Remove any rows with NaN values (invalid data)
            df = df.dropna()
            
            # Final check: ensure we have data
            if df.empty:
                self.kline_ax.clear()
                self.volume_ax.clear()
                self.kline_ax.set_title(f"{stock_code} - No valid data")
                self.kline_canvas.draw()
                return

            # Clear existing plots
            self.kline_ax.clear()
            self.volume_ax.clear()

            # Use mplfinance for better date handling and professional candlestick drawing
            if MPLFINANCE_AVAILABLE and mpf is not None:
                try:
                    # Use mplfinance's internal plotting function with our custom axes
                    # This approach uses mplfinance's data processing but draws to our axes
                    self._draw_kline_with_mplfinance(df, stock_code)
                except Exception as e:
                    print(f"mplfinance plot failed, using manual drawing: {e}")
                    import traceback
                    traceback.print_exc()
                    # Fallback to manual drawing
                    self._draw_kline_manual(df, stock_code)
            else:
                # Fallback to manual drawing if mplfinance not available
                self._draw_kline_manual(df, stock_code)

            self.kline_canvas.draw()
        except Exception as e:
            print(f"Failed to update K-line chart for {stock_code}: {e}")
            import traceback
            traceback.print_exc()

    def _draw_kline_with_mplfinance(self, df, stock_code):
        """Draw K-line chart using mplfinance's data processing and styling.
        
        Since mplfinance doesn't support drawing to existing axes directly,
        we use its data processing capabilities and draw manually with its styling.
        This ensures proper date alignment and professional appearance.
        """
        try:
            # mplfinance handles date alignment well, so we use the processed DataFrame
            # and draw manually with mplfinance's color scheme
            self._draw_kline_manual(df, stock_code, use_mplfinance_colors=True)
            
        except Exception as e:
            print(f"mplfinance drawing failed: {e}")
            import traceback
            traceback.print_exc()
            raise

    def _draw_kline_manual(self, df, stock_code, use_mplfinance_colors=False):
        """Draw K-line chart manually with improved date handling and light theme.
        
        This method uses the properly formatted DataFrame (with DatetimeIndex)
        to ensure dates are correctly aligned, fixing the "random jumping" issue.
        Features light theme with white background and colored candlesticks and moving averages.
        """
        try:
            # Get data from DataFrame (already sorted and with DatetimeIndex)
            dates = df.index
            opens = df['Open'].values
            highs = df['High'].values
            lows = df['Low'].values
            closes = df['Close'].values
            volumes = df['Volume'].values

            # Clear axes
            self.kline_ax.clear()
            self.volume_ax.clear()
            
            # Light theme colors (white background)
            bg_color = '#FFFFFF'  # White background
            grid_color = '#E5E7EB'  # Light gray grid lines
            text_color = '#111827'  # Dark text
            up_color = '#DC2626'  # Red for up
            down_color = '#16A34A'  # Green for down
            volume_bg = '#F3F4F6'  # Light gray for volume bars
            
            # Set light theme background (white)
            self.kline_figure.patch.set_facecolor(bg_color)
            self.kline_ax.set_facecolor(bg_color)
            self.volume_ax.set_facecolor(bg_color)
            
            # Calculate price statistics
            latest_price = closes[-1]
            highest_price = np.max(highs)
            lowest_price = np.min(lows)
            price_change = closes[-1] - closes[0] if len(closes) > 1 else 0
            price_change_pct = (price_change / closes[0] * 100) if len(closes) > 1 and closes[0] > 0 else 0
            
            # Get date range for title
            start_date_str = dates[0].strftime("%Y-%m-%d") if hasattr(dates[0], 'strftime') else str(dates[0])
            end_date_str = dates[-1].strftime("%Y-%m-%d") if hasattr(dates[-1], 'strftime') else str(dates[-1])
            
            # Set up axes with light theme
            self.kline_ax.grid(True, linestyle='--', alpha=0.4, color=grid_color, linewidth=0.5)
            self.kline_ax.set_title(f"{stock_code} - {start_date_str} to {end_date_str}", 
                                   fontsize=11, fontweight='bold', color=text_color, pad=10)
            self.kline_ax.set_ylabel("Price", fontsize=10, color=text_color)
            self.kline_ax.tick_params(colors=text_color, labelsize=9)
            self.volume_ax.set_ylabel("Volume", fontsize=10, color=text_color)
            self.volume_ax.grid(True, linestyle='--', alpha=0.4, color=grid_color, linewidth=0.5)
            self.volume_ax.tick_params(colors=text_color, labelsize=9)

            # Use integer positions for x-axis (dates are already sorted)
            # This ensures proper alignment even if some dates are missing
            num_candles = len(dates)
            if num_candles == 0:
                return
                
            # Dynamic K-line width based on number of candles
            if num_candles <= 30:
                width = 0.7
            elif num_candles <= 60:
                width = 0.5
            else:
                width = 0.4
            x_positions = range(num_candles)

            # Calculate moving averages using pandas rolling (more efficient and accurate)
            close_series = pd.Series(closes)
            ma5 = close_series.rolling(window=5, min_periods=1).mean().values
            ma10 = close_series.rolling(window=10, min_periods=1).mean().values
            ma20 = close_series.rolling(window=20, min_periods=1).mean().values
            
            # Calculate volume moving average
            volume_series = pd.Series(volumes)
            volume_ma5 = volume_series.rolling(window=5, min_periods=1).mean().values
            
            # Draw moving averages
            self.kline_ax.plot(x_positions, ma5, color='#FFD93D', linewidth=1.2, alpha=0.8, label='MA5', zorder=3)
            self.kline_ax.plot(x_positions, ma10, color='#6BCF7F', linewidth=1.2, alpha=0.8, label='MA10', zorder=3)
            self.kline_ax.plot(x_positions, ma20, color='#4D96FF', linewidth=1.2, alpha=0.8, label='MA20', zorder=3)
            
            # Add legend for moving averages (moved to upper right to avoid blocking K-lines)
            # bbox_to_anchor=(x, y
            legend = self.kline_ax.legend(loc='upper right', bbox_to_anchor=(0.98, 0.915), 
                                         fontsize=8, framealpha=0.3, 
                                         facecolor=bg_color, edgecolor=grid_color, labelcolor=text_color)
            for text in legend.get_texts():
                text.set_color(text_color)

            # Draw candlesticks with hollow style
            for i, (date_idx, row) in enumerate(df.iterrows()):
                o = float(row['Open'])
                h = float(row['High'])
                l = float(row['Low'])
                c = float(row['Close'])
                v = float(row['Volume'])
                
                # Determine color: bright red for up, bright green for down
                is_up = c >= o
                color = up_color if is_up else down_color
                
                # Draw high-low line (wick) with brighter color
                self.kline_ax.vlines(i, l, h, color=color, linewidth=1.2, alpha=0.9, zorder=1)
                
                # Draw open-close box (body) with hollow style
                lower = min(o, c)
                height = abs(c - o)
                if height < 1e-6:  # If open == close, draw a small line
                    height = (h - l) * 0.1 if (h - l) > 1e-6 else 0.01
                
                # Hollow candlestick: filled with semi-transparent color, darker border
                body_alpha = 0.6 if is_up else 0.5
                self.kline_ax.add_patch(
                    matplotlib.patches.Rectangle(
                        (i - width / 2, lower),
                        width,
                        height,
                        edgecolor=color,
                        facecolor=color,
                        linewidth=1.5,
                        alpha=body_alpha,
                        zorder=2
                    )
                )

                # Draw volume bars: gray background with colored border
                volume_color = up_color if is_up else down_color
                self.volume_ax.bar(i, v, color=volume_bg, width=width, alpha=0.6, 
                                  edgecolor=volume_color, linewidth=0.8, zorder=1)
            
            # Draw volume moving average line
            self.volume_ax.plot(x_positions, volume_ma5, color='#FFD93D', linewidth=1.0, 
                               alpha=0.6, linestyle='--', label='Vol MA5', zorder=2)

            # Set x-axis limits
            self.kline_ax.set_xlim(-0.5, num_candles - 0.5)
            self.volume_ax.set_xlim(-0.5, num_candles - 0.5)
            
            # Configure x-axis labels with proper date formatting
            # Show approximately 8 date labels
            num_ticks = min(8, num_candles)
            if num_ticks > 0:
                step = max(1, num_candles // num_ticks)
                xticks = list(range(0, num_candles, step))
                # Always include the last date
                if xticks[-1] != num_candles - 1:
                    xticks.append(num_candles - 1)
                
                # Set ticks with dark theme colors
            self.kline_ax.set_xticks(xticks)
            self.kline_ax.tick_params(labelbottom=False, colors=text_color)  # Hide labels on price chart
            self.volume_ax.set_xticks(xticks)
                
                # Format date labels from actual dates in index (improved format)
            date_labels = []
            for tick_pos in xticks:
                    if tick_pos < len(dates):
                        date_obj = dates[tick_pos]
                        if hasattr(date_obj, 'strftime'):
                            # Show year for first and last date, month/day for others
                            if tick_pos == 0 or tick_pos == len(xticks) - 1:
                                date_labels.append(date_obj.strftime("%Y-%m-%d"))
                            else:
                                date_labels.append(date_obj.strftime("%m/%d"))
                        else:
                            date_labels.append(str(date_obj))
                    else:
                        date_labels.append("")
                
            self.volume_ax.set_xticklabels(date_labels, rotation=45, ha='right',
                                               fontsize=9, color=text_color)
            
            # Set y-axis formatting with dark theme
            self.kline_ax.tick_params(axis='y', labelsize=9, colors=text_color)
            self.volume_ax.tick_params(axis='y', labelsize=9, colors=text_color)
            
            # Set spine colors (axes borders) to match light theme
            for spine in self.kline_ax.spines.values():
                spine.set_color(grid_color)
                spine.set_alpha(0.8)
            for spine in self.volume_ax.spines.values():
                spine.set_color(grid_color)
                spine.set_alpha(0.8)
            
            # Add current price label in top right corner
            price_color = up_color if price_change >= 0 else down_color
            price_sign = "+" if price_change >= 0 else ""
            price_text = f"${latest_price:.2f} ({price_sign}{price_change_pct:.2f}%)"
            self.kline_ax.text(0.98, 1, price_text, transform=self.kline_ax.transAxes,
                             fontsize=10, fontweight='bold', color=price_color,
                             verticalalignment='top', horizontalalignment='right',
                             bbox=dict(boxstyle='round,pad=0.5', facecolor=bg_color, 
                                     edgecolor=price_color, alpha=0.7, linewidth=1.5),
                             zorder=10)
            
            # Add price statistics in bottom left corner
            stats_text = f"High: ${highest_price:.2f}\nLow: ${lowest_price:.2f}"
            self.kline_ax.text(0.02, 0.02, stats_text, transform=self.kline_ax.transAxes,
                             fontsize=8, color=text_color,
                             verticalalignment='bottom', horizontalalignment='left',
                             bbox=dict(boxstyle='round,pad=0.4', facecolor=bg_color, 
                                     edgecolor=grid_color, alpha=0.6, linewidth=0.8),
                             zorder=10)
            
            # Apply modern matplotlib theme if available
            if MODERN_UI_AVAILABLE and configure_matplotlib_theme:
                try:
                    configure_matplotlib_theme(
                        self.kline_figure,
                        [self.kline_ax, self.volume_ax],
                        theme="light"
                    )
                except Exception as theme_error:
                    # If theme configuration fails, continue with existing styling
                    pass
            
        except Exception as e:
            print(f"Manual K-line drawing failed: {e}")
            import traceback
            traceback.print_exc()

    def reset_account(self):
        """Reset account: set a new initial cash amount and clear portfolio & trade records"""
        try:
            value = simpledialog.askfloat(
                "Reset Account",
                "Enter new initial cash amount (USD):",
                minvalue=0.0,
                initialvalue=self.cash,
                parent=self.root
            )
            if value is None:
                return
            if value < 0:
                messagebox.showerror("Error", "Initial cash must be non-negative.")
                return

            # Reset trade data
            self.trade_manager.trade_records = []
            self.trade_manager.portfolio = {}
            self.trade_manager.pending_orders = []
            self.trade_manager.initial_cash = float(value)
            self.trade_manager.cash = float(value)
            self.trade_manager.save_data()

            # Sync UI state
            self.cash = self.trade_manager.get_cash()
            self.portfolio = self.trade_manager.get_portfolio()
            self.load_trade_records()
            self.update_portfolio_table()
            self.update_assets()
            self.update_equity_metrics(self.cash)

            messagebox.showinfo("Success", f"Account has been reset with initial cash ${self.cash:.2f}.")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to reset account: {e}")

    def buy_stock(self):
        """Buy stock"""
        try:
            shares = int(self.shares_entry.get())
            if shares <= 0:
                messagebox.showerror("Error", "Please enter a valid number of shares")
                return

            selected_index = self.stock_listbox.curselection()
            if not selected_index:
                messagebox.showerror("Error", "Please select a stock to buy")
                return

            stock_code = self.stock_listbox.get(selected_index).split()[0]
            stock_name = self.stocks[stock_code]['name']
            price = self.stocks[stock_code]['price']

            # Calculate actual execution price, trade amount, and fee
            exec_price, total_amount, fee = self.trade_manager.calculate_trade_costs(price, shares, 'Buy')
            
            if total_amount + fee > self.cash:
                messagebox.showerror("Error", "Insufficient cash (including fees)")
                return

            # Update trade record
            self.trade_manager.add_trade_record(
                self.current_date.strftime('%Y-%m-%d'),
                stock_code,
                stock_name,
                'Buy',
                shares,
                exec_price,
                total_amount
            )
            
            # Update portfolio
            self.trade_manager.update_portfolio(stock_code, shares, price, 'Buy')
            
            # Update cash
            self.trade_manager.update_cash(total_amount, 'Buy', fee=fee)
            
            # Update display
            self.cash = self.trade_manager.get_cash()
            self.portfolio = self.trade_manager.get_portfolio()
            self.update_assets()
            self.load_trade_records()
            self.update_portfolio_table()
            
            messagebox.showinfo("Success", f"Successfully bought {shares} shares of {stock_name}")
            
        except ValueError:
            messagebox.showerror("Error", "Please enter a valid number of shares")

    def sell_stock(self):
        """Sell stock"""
        try:
            shares = int(self.shares_entry.get())
            if shares <= 0:
                messagebox.showerror("Error", "Please enter a valid number of shares")
                return

            selected_index = self.stock_listbox.curselection()
            if not selected_index:
                messagebox.showerror("Error", "Please select a stock to sell")
                return

            stock_code = self.stock_listbox.get(selected_index).split()[0]
            stock_name = self.stocks[stock_code]['name']

            if stock_code not in self.portfolio:
                messagebox.showerror("Error", "You don't have this stock in your portfolio")
                return

            if shares > self.portfolio[stock_code]['shares']:
                messagebox.showerror("Error", "Sell quantity exceeds portfolio quantity")
                return

            price = self.stocks[stock_code]['price']

            # Calculate actual execution price, trade amount, and fee
            exec_price, total_amount, fee = self.trade_manager.calculate_trade_costs(price, shares, 'Sell')
            
            # Update trade record
            self.trade_manager.add_trade_record(
                self.current_date.strftime('%Y-%m-%d'),
                stock_code,
                stock_name,
                'Sell',
                shares,
                exec_price,
                total_amount
            )
            
            # Update portfolio
            self.trade_manager.update_portfolio(stock_code, shares, price, 'Sell')
            
            # Update cash
            self.trade_manager.update_cash(total_amount, 'Sell', fee=fee)
            
            # Update display
            self.cash = self.trade_manager.get_cash()
            self.portfolio = self.trade_manager.get_portfolio()
            self.update_assets()
            self.load_trade_records()
            self.update_portfolio_table()
            
            messagebox.showinfo("Success", f"Successfully sold {shares} shares of {stock_name}")
            
        except ValueError:
            messagebox.showerror("Error", "Please enter a valid number of shares")

    def update_date(self, event):
        """Update date and reload data"""
        # In challenge mode, prevent direct date selection via calendar
        if self.challenge_mode:
            messagebox.showinfo("Challenge Mode", "Cannot select dates directly during challenge! Please use 'Next Day' button to proceed forward.")
            # Reset calendar to current date
            self.calendar.selection_set(self.current_date)
            return
        
        selected_date = datetime.datetime.strptime(self.calendar.get_date(), "%Y-%m-%d")
        selected_date_obj = selected_date.date()
        today = datetime.date.today()
        
        # Validate date: if using real data and date is in the future, show warning
        if not self.use_mock_data and selected_date_obj > today:
            messagebox.showwarning(
                "Future Date Selected",
                f"The selected date ({selected_date_obj.strftime('%Y-%m-%d')}) is in the future.\n\n"
                f"Real stock data is only available for historical dates up to today ({today.strftime('%Y-%m-%d')}).\n\n"
                f"Please select a date on or before today, or switch to mock data mode to simulate future dates."
            )
            # Reset calendar to current date
            self.calendar.selection_set(self.current_date)
            return
        
        # Save current selected stock index
        current_selection = self.stock_listbox.curselection()
        selected_index = current_selection[0] if current_selection else 0

        self.current_date = selected_date_obj
        self.date_label.config(text=f"Current Date: {self.current_date}")
        self.show_loading(self._loading_message())
        
        def after_load():
            # Restore previous selection or select first item
            self.stock_listbox.selection_clear(0, tk.END)
            if selected_index < self.stock_listbox.size():
                self.stock_listbox.selection_set(selected_index)
                self.stock_listbox.see(selected_index)
            else:
                self.stock_listbox.selection_set(0)
                self.stock_listbox.see(0)
            self.show_stock_details()
            # Apply auto-trading rules
            self.apply_auto_trading_rules()

        self.load_stocks(selected_date)
        self.root.after(100, after_load)  # Wait for data loading to complete before restoring selection

    def previous_day(self):
        """Navigate to previous day and reload data"""
        # In challenge mode, prevent going back
        if self.challenge_mode:
            messagebox.showinfo("Challenge Mode", "Cannot go back during challenge! Please use 'Next Day' to proceed forward.")
            return
        
        # Save current selected stock index
        current_selection = self.stock_listbox.curselection()
        selected_index = current_selection[0] if current_selection else 0

        current_date = datetime.datetime.strptime(self.calendar.get_date(), "%Y-%m-%d")
        previous_date = current_date - datetime.timedelta(days=1)
        self.current_date = previous_date.date()
        self.calendar.selection_set(previous_date.date())
        self.date_label.config(text=f"Current Date: {self.calendar.get_date()}")
        self.show_loading(self._loading_message())
        
        def after_load():
            # Restore previous selection or select first item
            self.stock_listbox.selection_clear(0, tk.END)
            if selected_index < self.stock_listbox.size():
                self.stock_listbox.selection_set(selected_index)
                self.stock_listbox.see(selected_index)
            else:
                self.stock_listbox.selection_set(0)
                self.stock_listbox.see(0)
            self.show_stock_details()
            # Apply auto trading rules
            self.apply_auto_trading_rules()

        self.load_stocks(previous_date)
        self.root.after(100, after_load)  # Wait for data loading to complete before restoring selection

    def next_day(self):
        """Navigate to next day and reload data"""
        # In challenge mode, use self.current_date directly (calendar is disabled)
        if self.challenge_mode:
            current_date = self.current_date
        else:
            current_date = datetime.datetime.strptime(self.calendar.get_date(), "%Y-%m-%d").date()
        
        next_date = current_date + datetime.timedelta(days=1)
        
        # Check if challenge has ended
        if self.challenge_mode and self.challenge_end_date:
            if next_date > self.challenge_end_date:
                # Challenge ended, show results
                self.end_challenge()
                return
        
        # Update current_date
        self.current_date = next_date
        
        # Save current selected stock index
        current_selection = self.stock_listbox.curselection()
        selected_index = current_selection[0] if current_selection else 0

        # Update calendar selection and display
        # In challenge mode, update calendar display but keep it disabled (user can't click to change)
        try:
            # Temporarily enable calendar to update selection, then disable again
            if self.challenge_mode:
                # Save current disabled state
                was_disabled = self.calendar.cget('state') == 'disabled'
                if was_disabled:
                    # Temporarily enable to allow selection update
                    self.calendar.config(state='normal')
                # Update selection and display
                self.calendar.selection_set(next_date)
                self.calendar.see(next_date)
                # Restore disabled state
                if was_disabled:
                    self.calendar.config(state='disabled')
            else:
                # Normal mode: just update selection
                self.calendar.selection_set(next_date)
                self.calendar.see(next_date)
        except Exception as e:
            # If calendar update fails, continue anyway - the date is still updated
            print(f"Warning: Failed to update calendar display: {e}")
        self.date_label.config(text=f"Current Date: {next_date.strftime('%Y-%m-%d')}" + (" (Challenge Mode)" if self.challenge_mode else ""))
        self.show_loading(self._loading_message())
        
        def after_load():
            # Restore previous selection or select first item
            self.stock_listbox.selection_clear(0, tk.END)
            if selected_index < self.stock_listbox.size():
                self.stock_listbox.selection_set(selected_index)
                self.stock_listbox.see(selected_index)
            else:
                self.stock_listbox.selection_set(0)
                self.stock_listbox.see(0)
            self.show_stock_details()
            # Apply auto trading rules
            self.apply_auto_trading_rules()

            # Update challenge status
            if self.challenge_mode:
                self._update_challenge_status()

        self.load_stocks(datetime.datetime.combine(next_date, datetime.time()))
        self.root.after(100, after_load)  # Wait for data loading to complete before restoring selection

    def export_data(self):
        """Export trade data to CSV files and generate reports"""
        if self.export_analyzer:
            self.export_analyzer.export_data()
        else:
            messagebox.showerror("Feature Unavailable", "Export feature module not loaded. Please check if export_analysis.py file exists.")

    def generate_ai_analysis(self):
        """Generate AI-powered trading analysis and suggestions"""
        if self.export_analyzer:
            self.export_analyzer.generate_ai_analysis()
        else:
            messagebox.showerror("Feature Unavailable", "AI analysis feature module not loaded. Please check if export_analysis.py file exists.")
    
    def open_stress_test_settings(self):
        """Open stress test configuration dialog."""
        try:
            from analysis.stress_test import StressTestConfig
            
            # Get current config
            current_config = self.data_manager.get_stress_test_config()
            if current_config is None:
                # Initialize if not available
                self.data_manager.set_stress_test_config(enabled=False)
                current_config = self.data_manager.get_stress_test_config()
            
            # Create settings window
            settings_window = tk.Toplevel(self.root)
            settings_window.title("压力测试设置 (Stress Test Settings)")
            settings_window.geometry("550x750")
            settings_window.transient(self.root)
            settings_window.configure(bg=self.bg_color)
            
            # Header
            header_frame = tk.Frame(settings_window, bg=self.header_bg, height=50)
            header_frame.pack(fill=tk.X, padx=0, pady=0)
            header_frame.pack_propagate(False)
            
            tk.Label(
                header_frame,
                text="⚡ 压力测试设置 - 跳跃扩散模型",
                font=('Segoe UI', 12, 'bold'),
                bg=self.header_bg,
                fg=self.text_color
            ).pack(pady=12)
            
            # Main frame
            main_frame = tk.Frame(settings_window, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
            main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            content_frame = tk.Frame(main_frame, bg=self.panel_bg)
            content_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
            
            # Enable/Disable checkbox
            enabled_var = tk.BooleanVar(value=current_config.get('enabled', False))
            enabled_check = tk.Checkbutton(
                content_frame,
                text="启用压力测试 (Enable Stress Testing)",
                variable=enabled_var,
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold'),
                selectcolor=self.panel_bg
            )
            enabled_check.grid(row=0, column=0, columnspan=2, sticky='w', pady=(0, 15))
            
            # Jump probability
            tk.Label(
                content_frame,
                text="跳跃概率 (Jump Probability):",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=1, column=0, sticky='w', pady=5)
            
            jump_prob_var = tk.StringVar(value=f"{current_config.get('jump_probability', 0.02):.4f}")
            jump_prob_entry = tk.Entry(
                content_frame,
                textvariable=jump_prob_var,
                width=15,
                bg='#F5F5F5',
                fg=self.text_color,
                font=('Segoe UI', 10)
            )
            jump_prob_entry.grid(row=1, column=1, sticky='w', pady=5, padx=(10, 0))
            
            tk.Label(
                content_frame,
                text="(例如: 0.02 = 2% 概率触发跳跃)",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 8)
            ).grid(row=2, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Jump sizes
            tk.Label(
                content_frame,
                text="跳跃幅度 (Jump Sizes):",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=3, column=0, sticky='w', pady=5)
            
            jump_sizes_var = tk.StringVar(
                value=', '.join([f"{x:.2f}" for x in current_config.get('jump_sizes', [-0.20, -0.15, -0.10])])
            )
            jump_sizes_entry = tk.Entry(
                content_frame,
                textvariable=jump_sizes_var,
                width=20,
                bg='#F5F5F5',
                fg=self.text_color,
                font=('Segoe UI', 10)
            )
            jump_sizes_entry.grid(row=3, column=1, sticky='w', pady=5, padx=(10, 0))
            
            tk.Label(
                content_frame,
                text="(例如: -0.20, -0.15, -0.10 表示 -20%, -15%, -10% 暴跌)",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 8)
            ).grid(row=4, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Jump direction
            tk.Label(
                content_frame,
                text="跳跃方向 (Jump Direction):",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=5, column=0, sticky='w', pady=5)
            
            direction_var = tk.StringVar(value=current_config.get('jump_direction', 'down'))
            direction_frame = tk.Frame(content_frame, bg=self.panel_bg)
            direction_frame.grid(row=5, column=1, sticky='w', pady=5, padx=(10, 0))
            
            tk.Radiobutton(
                direction_frame,
                text="下跌 (Down)",
                variable=direction_var,
                value='down',
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 9),
                selectcolor=self.panel_bg
            ).pack(side=tk.LEFT, padx=(0, 10))
            
            tk.Radiobutton(
                direction_frame,
                text="上涨 (Up)",
                variable=direction_var,
                value='up',
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 9),
                selectcolor=self.panel_bg
            ).pack(side=tk.LEFT, padx=(0, 10))
            
            tk.Radiobutton(
                direction_frame,
                text="双向 (Both)",
                variable=direction_var,
                value='both',
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 9),
                selectcolor=self.panel_bg
            ).pack(side=tk.LEFT)
            
            # Separator for extreme value distribution (Stage 2)
            separator = tk.Frame(content_frame, bg='#CCCCCC', height=1)
            separator.grid(row=6, column=0, columnspan=2, sticky='ew', pady=(20, 10))
            
            tk.Label(
                content_frame,
                text="极值分布 (Extreme Value Distribution) - Stage 2",
                bg=self.panel_bg,
                fg=self.accent_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=7, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Extreme probability
            tk.Label(
                content_frame,
                text="极值事件概率 (Extreme Probability):",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=8, column=0, sticky='w', pady=5)
            
            extreme_prob_var = tk.StringVar(value=f"{current_config.get('extreme_probability', 0.01):.4f}")
            extreme_prob_entry = tk.Entry(
                content_frame,
                textvariable=extreme_prob_var,
                width=15,
                bg='#F5F5F5',
                fg=self.text_color,
                font=('Segoe UI', 10)
            )
            extreme_prob_entry.grid(row=8, column=1, sticky='w', pady=5, padx=(10, 0))
            
            tk.Label(
                content_frame,
                text="(例如: 0.01 = 1% 概率触发极值事件)",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 8)
            ).grid(row=9, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Extreme distribution type
            tk.Label(
                content_frame,
                text="分布类型 (Distribution Type):",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=10, column=0, sticky='w', pady=5)
            
            dist_type_var = tk.StringVar(value=current_config.get('extreme_distribution', 'gev'))
            dist_frame = tk.Frame(content_frame, bg=self.panel_bg)
            dist_frame.grid(row=10, column=1, sticky='w', pady=5, padx=(10, 0))
            
            tk.Radiobutton(
                dist_frame,
                text="GEV",
                variable=dist_type_var,
                value='gev',
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 9),
                selectcolor=self.panel_bg
            ).pack(side=tk.LEFT, padx=(0, 10))
            
            tk.Radiobutton(
                dist_frame,
                text="Pareto",
                variable=dist_type_var,
                value='pareto',
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 9),
                selectcolor=self.panel_bg
            ).pack(side=tk.LEFT, padx=(0, 10))
            
            tk.Radiobutton(
                dist_frame,
                text="Simple",
                variable=dist_type_var,
                value='simple',
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 9),
                selectcolor=self.panel_bg
            ).pack(side=tk.LEFT)
            
            tk.Label(
                content_frame,
                text="(GEV: 广义极值分布, Pareto: 帕累托分布, Simple: 简单阈值)",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 8)
            ).grid(row=11, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Extreme threshold
            tk.Label(
                content_frame,
                text="极值阈值 (Extreme Threshold):",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=12, column=0, sticky='w', pady=5)
            
            extreme_threshold_var = tk.StringVar(value=f"{current_config.get('extreme_threshold', -0.15):.3f}")
            extreme_threshold_entry = tk.Entry(
                content_frame,
                textvariable=extreme_threshold_var,
                width=15,
                bg='#F5F5F5',
                fg=self.text_color,
                font=('Segoe UI', 10)
            )
            extreme_threshold_entry.grid(row=12, column=1, sticky='w', pady=5, padx=(10, 0))
            
            tk.Label(
                content_frame,
                text="(例如: -0.15 表示 -15% 的极值阈值)",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 8)
            ).grid(row=13, column=0, columnspan=2, sticky='w', pady=(0, 15))
            
            # Separator for Quantile Regression (Stage 3)
            separator2 = tk.Frame(content_frame, bg='#CCCCCC', height=1)
            separator2.grid(row=14, column=0, columnspan=2, sticky='ew', pady=(10, 10))
            
            tk.Label(
                content_frame,
                text="分位数回归 (Quantile Regression) - Stage 3",
                bg=self.panel_bg,
                fg=self.accent_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=15, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Use Quantile Regression checkbox
            use_qr_var = tk.BooleanVar(value=current_config.get('use_quantile_regression', False))
            use_qr_check = tk.Checkbutton(
                content_frame,
                text="启用分位数回归 (Enable Quantile Regression)",
                variable=use_qr_var,
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold'),
                selectcolor=self.panel_bg
            )
            use_qr_check.grid(row=16, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Quantile level
            tk.Label(
                content_frame,
                text="分位数水平 (Quantile Level):",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).grid(row=17, column=0, sticky='w', pady=5)
            
            quantile_level_var = tk.StringVar(value=f"{current_config.get('quantile_level', 0.01):.4f}")
            quantile_level_entry = tk.Entry(
                content_frame,
                textvariable=quantile_level_var,
                width=15,
                bg='#F5F5F5',
                fg=self.text_color,
                font=('Segoe UI', 10)
            )
            quantile_level_entry.grid(row=17, column=1, sticky='w', pady=5, padx=(10, 0))
            
            tk.Label(
                content_frame,
                text="(例如: 0.01 = 1% 尾部风险, 0.05 = 5% 尾部风险)",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 8)
            ).grid(row=18, column=0, columnspan=2, sticky='w', pady=(0, 10))
            
            # Info text
            info_text = (
                "压力测试包含三个阶段：\n"
                "阶段1 (跳跃扩散): 随机添加大幅价格跳跃\n"
                "阶段2 (极值分布): 使用统计分布生成尾部风险\n"
                "阶段3 (分位数回归): 使用机器学习预测极端分位数\n\n"
                "注意：启用后需要重新生成数据才能看到效果。\n"
                "阶段3需要 scikit-learn (可选，有回退方法)。"
            )
            tk.Label(
                content_frame,
                text=info_text,
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 9),
                justify=tk.LEFT
            ).grid(row=19, column=0, columnspan=2, sticky='w', pady=(15, 0))
            
            # Buttons
            btn_frame = tk.Frame(main_frame, bg=self.panel_bg)
            btn_frame.pack(fill=tk.X, padx=15, pady=15)
            
            def save_stress_settings():
                try:
                    enabled = enabled_var.get()
                    jump_prob = float(jump_prob_var.get())
                    
                    # Parse jump sizes
                    jump_sizes_str = jump_sizes_var.get().strip()
                    jump_sizes = [float(x.strip()) for x in jump_sizes_str.split(',')]
                    
                    direction = direction_var.get()
                    
                    # Validate
                    if jump_prob < 0 or jump_prob > 1:
                        messagebox.showerror("错误", "跳跃概率必须在 0 到 1 之间")
                        return
                    
                    if not jump_sizes:
                        messagebox.showerror("错误", "至少需要指定一个跳跃幅度")
                        return
                    
                    # Parse extreme value settings
                    extreme_prob = float(extreme_prob_var.get())
                    extreme_threshold = float(extreme_threshold_var.get())
                    extreme_dist = dist_type_var.get()
                    
                    # Parse quantile regression settings
                    use_qr = use_qr_var.get()
                    quantile_level = float(quantile_level_var.get())
                    
                    # Validate extreme settings
                    if extreme_prob < 0 or extreme_prob > 1:
                        messagebox.showerror("错误", "极值概率必须在 0 到 1 之间")
                        return
                    
                    # Validate quantile level
                    if quantile_level < 0 or quantile_level > 1:
                        messagebox.showerror("错误", "分位数水平必须在 0 到 1 之间")
                        return
                    
                    # Apply settings
                    self.data_manager.set_stress_test_config(
                        enabled=enabled,
                        jump_probability=jump_prob,
                        jump_sizes=jump_sizes,
                        jump_direction=direction,
                        extreme_probability=extreme_prob,
                        extreme_threshold=extreme_threshold,
                        extreme_distribution=extreme_dist,
                        use_quantile_regression=use_qr,
                        quantile_level=quantile_level
                    )
                    
                    messagebox.showinfo("成功", "压力测试设置已保存！\n\n注意：需要重新加载股票数据才能看到效果。")
                    settings_window.destroy()
                except ValueError as e:
                    messagebox.showerror("错误", f"请输入有效的数值：\n{str(e)}")
                except Exception as e:
                    messagebox.showerror("错误", f"保存设置失败：\n{str(e)}")
            
            tk.Button(
                btn_frame,
                text="保存 (Save)",
                command=save_stress_settings,
                bg=self.accent_color,
                fg='white',
                font=('Segoe UI', 10, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=20,
                pady=8
            ).pack(side=tk.LEFT, padx=(0, 10))
            
            tk.Button(
                btn_frame,
                text="取消 (Cancel)",
                command=settings_window.destroy,
                bg='#6B7280',
                fg='white',
                font=('Segoe UI', 10),
                relief='flat',
                cursor='hand2',
                padx=20,
                pady=8
            ).pack(side=tk.LEFT)
            
        except ImportError as e:
            messagebox.showerror("模块未找到", f"压力测试模块未找到：\n{str(e)}\n\n请确保 analysis/stress_test.py 文件存在。")
        except Exception as e:
            messagebox.showerror("错误", f"打开压力测试设置失败：\n{str(e)}")
    
    def open_spectral_analysis(self):
        """Open spectral analysis window for current stock"""
        try:
            from analysis.spectral import analyze_stock_spectrum, format_period_description
            
            # Check if a stock is selected
            selected_indices = self.stock_listbox.curselection()
            if not selected_indices:
                messagebox.showwarning("No Stock Selected", "请先选择一个股票进行分析。")
                return
            
            # Get selected stock code
            selected_index = selected_indices[0]
            stock_code = self.stock_listbox.get(selected_index).split(' - ')[0]
            
            # Get stock name
            stock_name = self.stocks.get(stock_code, {}).get('name', stock_code)
            
            # Create spectral analysis window
            spectral_window = tk.Toplevel(self.root)
            spectral_window.title(f"频谱分析 - {stock_code} ({stock_name})")
            spectral_window.geometry("1000x700")
            spectral_window.transient(self.root)
            spectral_window.configure(bg=self.bg_color)
            
            # Header
            header_frame = tk.Frame(spectral_window, bg=self.header_bg, height=60)
            header_frame.pack(fill=tk.X, padx=0, pady=0)
            header_frame.pack_propagate(False)
            
            tk.Label(
                header_frame,
                text=f"📈 频谱分析 - {stock_code} ({stock_name})",
                font=('Segoe UI', 14, 'bold'),
                bg=self.header_bg,
                fg=self.text_color
            ).pack(pady=15)
            
            # Control panel
            control_frame = tk.Frame(spectral_window, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
            control_frame.pack(fill=tk.X, padx=10, pady=10)
            
            # Analysis button
            analyze_btn_frame = tk.Frame(control_frame, bg=self.panel_bg)
            analyze_btn_frame.pack(fill=tk.X, padx=10, pady=10)
            
            def run_analysis():
                try:
                    # Get historical data (use longer window for better FFT analysis)
                    hist_data = self.data_manager.get_stock_history(
                        stock_code, 
                        self.current_date, 
                        window_days=365  # Use 1 year of data for better frequency resolution
                    )
                    
                    if hist_data is None or len(hist_data) < 10:
                        messagebox.showerror("数据不足", f"无法获取足够的股票数据进行分析。\n需要至少10天的数据，当前数据量：{len(hist_data) if hist_data is not None else 0}")
                        return
                    
                    # Show loading
                    results_text.config(state=tk.NORMAL)
                    results_text.delete(1.0, tk.END)
                    results_text.insert(tk.END, "正在分析...\n")
                    results_text.insert(tk.END, f"数据量: {len(hist_data)} 天\n")
                    results_text.config(state=tk.DISABLED)
                    analyze_btn.config(state=tk.DISABLED)
                    
                    # Run analysis in thread to avoid blocking UI
                    def analyze_in_thread():
                        try:
                            # Perform spectral analysis
                            result = analyze_stock_spectrum(
                                hist_data,
                                price_column='close',
                                min_period_days=2.0,
                                max_period_days=365.0,
                                top_n=5
                            )
                            
                            # Update UI in main thread
                            self.root.after(0, lambda r=result: display_results(r))
                        except Exception as e:
                            error_msg = str(e)
                            self.root.after(0, lambda msg=error_msg: show_error(msg))
                    
                    def display_results(result):
                        try:
                            # Clear previous chart
                            for widget in chart_frame.winfo_children():
                                widget.destroy()
                            
                            # Display dominant cycles
                            results_text.config(state=tk.NORMAL)
                            results_text.delete(1.0, tk.END)
                            
                            results_text.insert(tk.END, f"📊 频谱分析结果 - {stock_code}\n", "header")
                            results_text.insert(tk.END, "=" * 60 + "\n\n")
                            
                            if result['dominant_cycles']:
                                results_text.insert(tk.END, "🎯 主要交易周期:\n\n", "subheader")
                                for i, (period, freq, power) in enumerate(result['dominant_cycles'], 1):
                                    period_desc = format_period_description(period)
                                    power_pct = (power / result['total_power'] * 100) if result['total_power'] > 0 else 0
                                    results_text.insert(tk.END, f"{i}. {period_desc} ({period:.2f}天)\n")
                                    results_text.insert(tk.END, f"   频率: {freq:.6f} 周期/天\n")
                                    results_text.insert(tk.END, f"   功率占比: {power_pct:.2f}%\n\n")
                            else:
                                results_text.insert(tk.END, "⚠️ 未检测到明显的周期性模式\n\n")
                            
                            results_text.insert(tk.END, f"总功率: {result['total_power']:.2f}\n")
                            if result['dominant_period']:
                                results_text.insert(tk.END, f"主导周期: {format_period_description(result['dominant_period'])}\n")
                            
                            results_text.config(state=tk.DISABLED)
                            
                            # Create spectrum chart
                            if MATPLOTLIB_AVAILABLE and len(result['frequencies']) > 0:
                                fig = Figure(figsize=(10, 6), dpi=100)
                                ax = fig.add_subplot(111)
                                
                                # Convert frequencies to periods for x-axis
                                non_zero_freq = result['frequencies'] > 0
                                periods = np.zeros_like(result['frequencies'])
                                periods[non_zero_freq] = 1.0 / result['frequencies'][non_zero_freq]
                                
                                # Filter to reasonable range
                                valid_range = (periods >= 2) & (periods <= 365)
                                periods_display = periods[valid_range]
                                power_display = result['power_spectrum'][valid_range]
                                
                                # Plot power spectrum
                                ax.plot(periods_display, power_display, 'b-', linewidth=1.5, label='功率谱')
                                
                                # Mark dominant cycles
                                for period, freq, power in result['dominant_cycles']:
                                    if 2 <= period <= 365:
                                        # Find closest point in spectrum
                                        idx = np.argmin(np.abs(periods_display - period))
                                        ax.plot(periods_display[idx], power_display[idx], 'ro', markersize=10, label='主要周期' if period == result['dominant_cycles'][0][0] else '')
                                        ax.annotate(
                                            format_period_description(period),
                                            xy=(periods_display[idx], power_display[idx]),
                                            xytext=(10, 10),
                                            textcoords='offset points',
                                            fontsize=9,
                                            bbox=dict(boxstyle='round,pad=0.3', facecolor='yellow', alpha=0.7),
                                            arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0')
                                        )
                                
                                ax.set_xlabel('周期 (天)', fontsize=11)
                                ax.set_ylabel('功率', fontsize=11)
                                ax.set_title(f'{stock_code} 价格频谱分析', fontsize=13, fontweight='bold')
                                ax.grid(True, alpha=0.3)
                                ax.legend()
                                
                                # Set x-axis to show periods in days
                                ax.set_xlim(2, 365)
                                
                                canvas = FigureCanvasTkAgg(fig, chart_frame)
                                canvas.draw()
                                canvas.get_tk_widget().pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
                            else:
                                tk.Label(
                                    chart_frame,
                                    text="需要 matplotlib 来显示频谱图",
                                    bg=self.panel_bg,
                                    fg=self.text_color,
                                    font=('Segoe UI', 10)
                                ).pack(pady=20)
                            
                            analyze_btn.config(state=tk.NORMAL)
                        except Exception as e:
                            show_error(str(e))
                            analyze_btn.config(state=tk.NORMAL)
                    
                    def show_error(error_msg):
                        results_text.config(state=tk.NORMAL)
                        results_text.delete(1.0, tk.END)
                        results_text.insert(tk.END, f"❌ 分析失败:\n{error_msg}\n", "error")
                        results_text.config(state=tk.DISABLED)
                        analyze_btn.config(state=tk.NORMAL)
                    
                    # Start analysis thread
                    analysis_thread = threading.Thread(target=analyze_in_thread, daemon=True)
                    analysis_thread.start()
                    
                except Exception as e:
                    messagebox.showerror("错误", f"频谱分析失败:\n{str(e)}")
            
            analyze_btn = tk.Button(
                analyze_btn_frame,
                text="🔍 开始分析",
                command=run_analysis,
                bg=self.accent_color,
                fg='white',
                font=('Segoe UI', 11, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=20,
                pady=8
            )
            analyze_btn.pack(side=tk.LEFT, padx=5)
            
            tk.Label(
                analyze_btn_frame,
                text="使用FFT分析价格序列，识别主要交易周期",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 9)
            ).pack(side=tk.LEFT, padx=10)
            
            # Results area
            results_frame = tk.Frame(spectral_window, bg=self.bg_color)
            results_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
            
            # Left: Text results
            left_frame = tk.Frame(results_frame, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
            left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))
            
            tk.Label(
                left_frame,
                text="分析结果",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 11, 'bold')
            ).pack(pady=5)
            
            results_text = tk.Text(
                left_frame,
                wrap=tk.WORD,
                font=('Consolas', 10),
                bg='#F5F5F5',
                fg=self.text_color,
                padx=10,
                pady=10,
                state=tk.DISABLED
            )
            results_text.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
            
            # Configure text tags for formatting
            results_text.tag_config("header", font=('Segoe UI', 12, 'bold'), foreground=self.accent_color)
            results_text.tag_config("subheader", font=('Segoe UI', 10, 'bold'), foreground='#333333')
            results_text.tag_config("error", foreground=self.danger_color)
            
            # Right: Chart
            right_frame = tk.Frame(results_frame, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
            right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=(5, 0))
            
            tk.Label(
                right_frame,
                text="频谱图",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 11, 'bold')
            ).pack(pady=5)
            
            chart_frame = tk.Frame(right_frame, bg=self.panel_bg)
            chart_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
            
            # Initial message
            results_text.config(state=tk.NORMAL)
            results_text.insert(tk.END, "点击「开始分析」按钮进行频谱分析\n\n")
            results_text.insert(tk.END, "分析将使用最近365天的价格数据\n")
            results_text.insert(tk.END, "识别主要交易周期（如30天周期、7天周期等）\n")
            results_text.config(state=tk.DISABLED)
            
        except ImportError as e:
            messagebox.showerror("模块未找到", f"频谱分析模块未找到:\n{str(e)}\n\n请确保 analysis/spectral.py 文件存在。")
        except Exception as e:
            messagebox.showerror("错误", f"打开频谱分析窗口失败:\n{str(e)}")
    
    def open_strategy_tournament(self):
        """Open strategy tournament window"""
        try:
            from strategies.tournament_engine import TournamentEngine
            import datetime
            import threading
            
            # Create tournament window
            tournament_window = tk.Toplevel(self.root)
            tournament_window.title("The Quant Arena: Strategy Tournament")
            tournament_window.geometry("900x700")
            tournament_window.transient(self.root)
            tournament_window.configure(bg=self.bg_color)
            
            # Header
            header_frame = tk.Frame(tournament_window, bg=self.header_bg, height=60)
            header_frame.pack(fill=tk.X, padx=0, pady=0)
            header_frame.pack_propagate(False)
            
            tk.Label(
                header_frame,
                text="⚔️ The Quant Arena: Algorithmic Trading Tournament",
                font=('Segoe UI', 14, 'bold'),
                bg=self.header_bg,
                fg=self.text_color
            ).pack(pady=15)
            
            # Control panel
            control_frame = tk.Frame(tournament_window, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
            control_frame.pack(fill=tk.X, padx=10, pady=10)
            
            # Date selection
            date_frame = tk.Frame(control_frame, bg=self.panel_bg)
            date_frame.pack(fill=tk.X, padx=10, pady=10)
            
            tk.Label(date_frame, text="Start Date:", bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', 10)).pack(side=tk.LEFT, padx=5)
            start_date_entry = DateEntry(date_frame, width=12, background='darkblue', foreground='white', borderwidth=2, year=2024, month=1, day=1)
            start_date_entry.pack(side=tk.LEFT, padx=5)
            
            tk.Label(date_frame, text="End Date:", bg=self.panel_bg, fg=self.text_color, font=('Segoe UI', 10)).pack(side=tk.LEFT, padx=5)
            end_date_entry = DateEntry(date_frame, width=12, background='darkblue', foreground='white', borderwidth=2)
            end_date_entry.pack(side=tk.LEFT, padx=5)
            
            # Use mock data checkbox
            use_mock_var = tk.BooleanVar(value=self.use_mock_data)
            mock_checkbox = tk.Checkbutton(
                date_frame,
                text="Use Mock Data",
                variable=use_mock_var,
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10)
            )
            mock_checkbox.pack(side=tk.LEFT, padx=10)
            
            # Strategy file selection
            strategy_frame = tk.Frame(control_frame, bg=self.panel_bg)
            strategy_frame.pack(fill=tk.X, padx=10, pady=5)
            
            tk.Label(
                strategy_frame,
                text="Strategy Files:",
                bg=self.panel_bg,
                fg=self.text_color,
                font=('Segoe UI', 10, 'bold')
            ).pack(side=tk.LEFT, padx=5)
            
            # Listbox for selected strategy files
            strategy_list_frame = tk.Frame(strategy_frame, bg=self.panel_bg)
            strategy_list_frame.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
            
            strategy_listbox = tk.Listbox(
                strategy_list_frame,
                height=3,
                font=('Consolas', 9),
                bg='#F5F5F5',
                fg=self.text_color,
                selectmode=tk.EXTENDED
            )
            strategy_listbox.pack(side=tk.LEFT, fill=tk.X, expand=True)
            
            strategy_scrollbar = tk.Scrollbar(strategy_list_frame, orient=tk.VERTICAL, command=strategy_listbox.yview)
            strategy_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            strategy_listbox.config(yscrollcommand=strategy_scrollbar.set)
            
            # Load default strategies from strategies directory
            # Only show files that actually contain strategy classes
            def load_default_strategies():
                strategies_dir = "strategies"
                if os.path.exists(strategies_dir):
                    try:
                        from strategies.tournament_engine import TournamentEngine
                        temp_engine = TournamentEngine(strategies_dir=strategies_dir)
                        # Get all strategy files that contain actual strategies
                        all_files = temp_engine._discover_strategy_files()
                        for file_path in all_files:
                            # Check if file actually contains strategy classes
                            strategy_classes = temp_engine._load_strategy_from_file(file_path)
                            if strategy_classes and len(strategy_classes) > 0:
                                strategy_listbox.insert(tk.END, file_path)
                    except Exception as e:
                        # Fallback: just show example_strategy.py
                        example_file = os.path.join(strategies_dir, "example_strategy.py")
                        if os.path.exists(example_file):
                            strategy_listbox.insert(tk.END, example_file)
            
            load_default_strategies()
            
            # Buttons for strategy management
            strategy_btn_frame = tk.Frame(strategy_frame, bg=self.panel_bg)
            strategy_btn_frame.pack(side=tk.LEFT, padx=5)
            
            def import_strategy_file():
                """Import a strategy file from external location"""
                file_path = filedialog.askopenfilename(
                    title="Select Strategy File",
                    filetypes=[("Python files", "*.py"), ("All files", "*.*")]
                )
                if file_path:
                    # Copy to strategies directory
                    import shutil
                    filename = os.path.basename(file_path)
                    dest_path = os.path.join("strategies", filename)
                    try:
                        shutil.copy2(file_path, dest_path)
                        strategy_listbox.insert(tk.END, dest_path)
                        messagebox.showinfo("Success", f"Strategy file imported: {filename}")
                    except Exception as e:
                        messagebox.showerror("Error", f"Failed to import file: {e}")
            
            def remove_strategy():
                """Remove selected strategy files from list"""
                selected = strategy_listbox.curselection()
                if selected:
                    # Remove in reverse order to maintain indices
                    for index in reversed(selected):
                        strategy_listbox.delete(index)
                else:
                    messagebox.showinfo("Info", "Please select strategy files to remove")
            
            import_btn = tk.Button(
                strategy_btn_frame,
                text="📁 Import",
                command=import_strategy_file,
                bg=self.accent_color,
                fg='white',
                font=('Segoe UI', 9),
                relief='flat',
                cursor='hand2',
                padx=10,
                pady=3
            )
            import_btn.pack(side=tk.TOP, pady=2)
            
            remove_btn = tk.Button(
                strategy_btn_frame,
                text="🗑️ Remove",
                command=remove_strategy,
                bg=self.danger_color,
                fg='white',
                font=('Segoe UI', 9),
                relief='flat',
                cursor='hand2',
                padx=10,
                pady=3
            )
            remove_btn.pack(side=tk.TOP, pady=2)
            
            tk.Label(
                strategy_frame,
                text="(Leave empty to use all strategies in strategies/ directory)",
                bg=self.panel_bg,
                fg='#666666',
                font=('Segoe UI', 8)
            ).pack(side=tk.BOTTOM, pady=2)
            
            # Run button
            def run_tournament():
                try:
                    start_date = start_date_entry.get_date()
                    end_date = end_date_entry.get_date()
                    use_mock = use_mock_var.get()
                    
                    if start_date >= end_date:
                        messagebox.showerror("Error", "Start date must be before end date")
                        return
                    
                    # Clear results completely
                    results_text.config(state=tk.NORMAL)
                    results_text.delete(1.0, tk.END)
                    results_text.insert(tk.END, "Running tournament...\n")
                    results_text.insert(tk.END, f"Date range: {start_date} to {end_date}\n")
                    results_text.insert(tk.END, f"Use Mock Data: {use_mock}\n\n")
                    results_text.config(state=tk.DISABLED)
                    run_btn.config(state=tk.DISABLED)
                    
                    def run_in_thread():
                        try:
                            # Get selected strategy files
                            selected_files = []
                            for i in range(strategy_listbox.size()):
                                file_path = strategy_listbox.get(i)
                                # Only include files that actually exist
                                if os.path.exists(file_path):
                                    selected_files.append(file_path)
                            
                            # Log which files will be used
                            log_msg = f"Loading strategies from {len(selected_files)} file(s)...\n"
                            if selected_files:
                                for f in selected_files:
                                    log_msg += f"  - {os.path.basename(f)}\n"
                            else:
                                log_msg += "  (Auto-discovering all strategies in strategies/ directory)\n"
                            
                            tournament_window.after(0, lambda msg=log_msg: update_status(msg))
                            
                            # Use selected files if any, otherwise auto-discover
                            # IMPORTANT: If listbox has files but they're invalid, we still pass them
                            # The tournament engine will filter out files without strategy classes
                            strategy_files = selected_files if selected_files else None
                            
                            engine = TournamentEngine(
                                strategies_dir="strategies",
                                initial_cash=100000.0,
                                fee_rate=0.0001,
                                min_fee=1.0,
                                slippage_per_share=0.0,
                                use_mock_data=use_mock
                            )
                            
                            # Run tournament - this will create fresh backtest engines for each strategy
                            results_df = engine.run_tournament(
                                start_date=start_date,
                                end_date=end_date,
                                stock_codes=None,
                                strategy_files=strategy_files
                            )
                            
                            # Update UI in main thread
                            tournament_window.after(0, lambda df=results_df: display_results(df))
                        except Exception as e:
                            import traceback
                            error_msg = f"{str(e)}\n\n{traceback.format_exc()}"
                            tournament_window.after(0, lambda msg=error_msg: show_error(msg))
                    
                    def update_status(msg):
                        results_text.config(state=tk.NORMAL)
                        results_text.insert(tk.END, msg)
                        results_text.config(state=tk.DISABLED)
                    
                    threading.Thread(target=run_in_thread, daemon=True).start()
                    
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to run tournament: {e}")
                    run_btn.config(state=tk.NORMAL)
            
            def display_results(results_df):
                results_text.config(state=tk.NORMAL)
                # Clear and show fresh results
                results_text.delete(1.0, tk.END)
                
                if len(results_df) == 0:
                    results_text.insert(tk.END, "No results generated.\n")
                    results_text.insert(tk.END, "Please check that selected files contain valid strategy classes.\n")
                else:
                    results_text.insert(tk.END, "Tournament Results:\n")
                    results_text.insert(tk.END, "=" * 80 + "\n\n")
                    results_text.insert(tk.END, results_df.to_string(index=True))
                    results_text.insert(tk.END, "\n\n" + "=" * 80 + "\n")
                    results_text.insert(tk.END, f"\nTotal Strategies: {len(results_df)}\n")
                    results_text.insert(tk.END, f"Period: {start_date_entry.get_date()} to {end_date_entry.get_date()}\n")
                    results_text.insert(tk.END, f"Data Source: {'Mock Data' if use_mock_var.get() else 'Real Data'}\n")
                    
                    # Show which strategy files were used
                    selected_count = strategy_listbox.size()
                    if selected_count > 0:
                        results_text.insert(tk.END, f"\nStrategy Files Used: {selected_count}\n")
                    else:
                        results_text.insert(tk.END, "\nStrategy Files Used: Auto-discovered all\n")
                
                results_text.config(state=tk.DISABLED)
                run_btn.config(state=tk.NORMAL)
            
            def show_error(error_msg):
                results_text.config(state=tk.NORMAL)
                results_text.delete(1.0, tk.END)
                results_text.insert(tk.END, f"Error: {error_msg}\n")
                results_text.config(state=tk.DISABLED)
                run_btn.config(state=tk.NORMAL)
                messagebox.showerror("Tournament Error", error_msg)
            
            run_btn = tk.Button(
                control_frame,
                text="Run Tournament",
                command=run_tournament,
                bg=self.accent_color,
                fg='white',
                font=('Segoe UI', 11, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=20,
                pady=8
            )
            run_btn.pack(pady=10)
            
            # Results area
            results_frame = tk.Frame(tournament_window, bg=self.panel_bg, highlightbackground=self.border_color, highlightthickness=1)
            results_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
            
            tk.Label(
                results_frame,
                text="Results",
                font=('Segoe UI', 11, 'bold'),
                bg=self.panel_bg,
                fg=self.text_color
            ).pack(anchor='w', padx=10, pady=5)
            
            # Text widget with scrollbar
            text_frame = tk.Frame(results_frame, bg=self.panel_bg)
            text_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
            
            scrollbar = tk.Scrollbar(text_frame)
            scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
            
            results_text = tk.Text(
                text_frame,
                wrap=tk.NONE,
                font=('Consolas', 9),
                bg='#1E1E1E',
                fg='#D4D4D4',
                yscrollcommand=scrollbar.set,
                state=tk.DISABLED
            )
            results_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
            scrollbar.config(command=results_text.yview)
            
            results_text.insert(tk.END, "Welcome to The Quant Arena!\n\n")
            results_text.insert(tk.END, "Select a date range and click 'Run Tournament' to compare strategies.\n")
            results_text.insert(tk.END, "Strategies will be ranked by Sharpe Ratio.\n\n")
            results_text.insert(tk.END, "Available strategies:\n")
            results_text.insert(tk.END, "- BuyAndHoldStrategy\n")
            results_text.insert(tk.END, "- MovingAverageStrategy\n")
            results_text.insert(tk.END, "- MomentumStrategy\n")
            
        except ImportError as e:
            messagebox.showerror(
                "Feature Unavailable",
                f"Strategy tournament feature not available.\n\nError: {e}\n\nPlease ensure strategies module is properly installed."
            )
        except Exception as e:
            messagebox.showerror("Error", f"Failed to open tournament window: {e}")
    
    def _calculate_score(self, stats):
        """Simple score calculation"""
        # Normalize each metric to 0-1 range
        total_return = stats.get('total_return', 0) * 100
        sharpe = stats.get('sharpe', 0)
        max_dd = stats.get('max_dd', 0) * 100
        win_rate = stats.get('win_rate', 0)
        profit_factor = stats.get('profit_factor', 0)
        
        # Normalization function
        def normalize(value, min_val, max_val, reverse=False):
            if reverse:
                return max(0, min(1, 1 - (value - min_val) / (max_val - min_val) if max_val > min_val else 0))
            return max(0, min(1, (value - min_val) / (max_val - min_val) if max_val > min_val else 0))
        
        norm_return = normalize(total_return, -50, 100)
        norm_sharpe = normalize(sharpe, -1, 3)
        norm_dd = normalize(max_dd, 0, 50, reverse=True)  # Lower drawdown is better
        norm_winrate = normalize(win_rate, 0, 100)
        norm_pf = normalize(profit_factor, 0, 5)
        
        # Calculate weighted total score
        total_score = (
            0.30 * norm_return +
            0.25 * norm_sharpe +
            0.20 * norm_dd +
            0.15 * norm_winrate +
            0.10 * norm_pf
        ) * 100
        
        # Determine grade
        if total_score >= 90:
            grade = 'S'
        elif total_score >= 80:
            grade = 'A'
        elif total_score >= 70:
            grade = 'B'
        elif total_score >= 60:
            grade = 'C'
        else:
            grade = 'D'
        
        return {
            'total_score': round(total_score, 2),
            'grade': grade,
            'breakdown': {
                'total_return': {'raw_value': total_return, 'normalized': norm_return},
                'sharpe_ratio': {'raw_value': sharpe, 'normalized': norm_sharpe},
                'max_drawdown': {'raw_value': max_dd, 'normalized': norm_dd},
                'win_rate': {'raw_value': win_rate, 'normalized': norm_winrate},
                'profit_factor': {'raw_value': profit_factor, 'normalized': norm_pf}
            }
        }
    
    def _get_grade_color(self, grade):
        """Get grade color"""
        colors = {'S': '#FFD700', 'A': '#00FF00', 'B': '#00BFFF', 'C': '#FFA500', 'D': '#FF4500'}
        return colors.get(grade, '#808080')
    
    def show_score_details(self):
        """Show score details window"""
        if not hasattr(self, 'current_score_result') or self.current_score_result is None:
            messagebox.showinfo("Score Details", "No score data available. Please make some trades first.")
            return
        
        # Create details window
        detail_window = tk.Toplevel(self.root)
        detail_window.title("📊 Score Details")
        detail_window.geometry("600x500")
        detail_window.transient(self.root)
        detail_window.configure(bg=self.bg_color)
        
        # Title
        title_frame = tk.Frame(detail_window, bg=self.header_bg)
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        
        score_result = self.current_score_result
        grade_color = self._get_grade_color(score_result['grade'])
        
        tk.Label(
            title_frame,
            text=f"Total Score: {score_result['total_score']:.2f}",
            font=('Segoe UI', 18, 'bold'),
            bg=self.header_bg,
            fg=grade_color
        ).pack(pady=10)
        
        tk.Label(
            title_frame,
            text=f"Grade: {score_result['grade']}",
            font=('Segoe UI', 14, 'bold'),
            bg=self.header_bg,
            fg=grade_color
        ).pack(pady=(0, 10))
        
        # Score details
        detail_frame = tk.Frame(detail_window, bg=self.panel_bg, relief=tk.RAISED, borderwidth=1)
        detail_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=(0, 10))
        
        # Create scrollable area
        canvas = tk.Canvas(detail_frame, bg=self.panel_bg, highlightthickness=0)
        scrollbar = tk.Scrollbar(detail_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg=self.panel_bg)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # Metric details
        tk.Label(
            scrollable_frame,
            text="Metric Score Details:",
            font=('Segoe UI', 12, 'bold'),
            bg=self.panel_bg,
            fg=self.text_color
        ).pack(anchor='w', padx=15, pady=(15, 10))
        
        breakdown = score_result['breakdown']
        metrics_info = {
            'total_return': ('Total Return', '%'),
            'sharpe_ratio': ('Sharpe Ratio', ''),
            'max_drawdown': ('Max Drawdown', '%'),
            'win_rate': ('Win Rate', '%'),
            'profit_factor': ('Profit Factor', '')
        }
        
        for metric_key, (metric_name, unit) in metrics_info.items():
            if metric_key in breakdown:
                detail = breakdown[metric_key]
                metric_frame = tk.Frame(scrollable_frame, bg=self.panel_bg)
                metric_frame.pack(fill=tk.X, padx=15, pady=5)
                
                # Metric name and raw value
                tk.Label(
                    metric_frame,
                    text=f"{metric_name}: {detail['raw_value']:.2f}{unit}",
                    font=('Segoe UI', 10, 'bold'),
                    bg=self.panel_bg,
                    fg=self.text_color,
                    anchor='w'
                ).pack(anchor='w')
                
                # Normalized value and weighted score
                info_text = f"  Normalized: {detail['normalized']:.3f} | "
                info_text += f"Weight: {detail['weight']*100:.0f}% | "
                info_text += f"Score: {detail['weighted_score']:.2f}"
                
                tk.Label(
                    metric_frame,
                    text=info_text,
                    font=('Segoe UI', 9),
                    bg=self.panel_bg,
                    fg=self.text_color,
                    anchor='w'
                ).pack(anchor='w', padx=(10, 0))
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Button area
        button_frame = tk.Frame(detail_window, bg=self.bg_color)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        # Save score button
        tk.Button(
            button_frame,
            text="💾 Save Score",
            command=lambda: self._save_current_score(),
            bg=self.accent_color,
            fg='white',
            font=('Segoe UI', 10, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        # View history button
        tk.Button(
            button_frame,
            text="📜 View History",
            command=lambda: self._show_score_history(),
            bg=self.success_color,
            fg='white',
            font=('Segoe UI', 10, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        # Close button
        tk.Button(
            button_frame,
            text="Close",
            command=detail_window.destroy,
            bg=self.danger_color,
            fg='white',
            font=('Segoe UI', 10),
            relief='flat',
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.RIGHT, padx=5)
    
    def _save_current_score(self):
        """Save current score to history"""
        if not hasattr(self, 'current_score_result') or self.current_score_result is None:
            messagebox.showwarning("Save Failed", "No score data to save.")
            return
        
        # Load history
        history = []
        if os.path.exists(self.scores_history_file):
            try:
                with open(self.scores_history_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            except:
                history = []
        
        # Add timestamp and challenge name
        score_to_save = self.current_score_result.copy()
        score_to_save['timestamp'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        if self.challenge_mode and self.challenge_info:
            score_to_save['challenge_name'] = self.challenge_info['name']
        else:
            score_to_save['challenge_name'] = None
        
        history.append(score_to_save)
        
        # Save
        try:
            with open(self.scores_history_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, ensure_ascii=False, indent=2)
            messagebox.showinfo("Save Success", f"Score saved!\n\nScore: {self.current_score_result['total_score']:.2f}\nGrade: {self.current_score_result['grade']}")
        except Exception as e:
            messagebox.showerror("Save Failed", f"Error saving score: {e}")
    
    def _show_score_history(self):
        """Display scoring history"""
        history = []
        if os.path.exists(self.scores_history_file):
            try:
                with open(self.scores_history_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            except:
                history = []
        
        if not history:
            messagebox.showinfo("Scoring History", "No scoring history records found.")
            return
        
        # Create history record window
        history_window = tk.Toplevel(self.root)
        history_window.title("📜 Scoring History")
        history_window.geometry("700x500")
        history_window.transient(self.root)
        history_window.configure(bg=self.bg_color)
        
        # Title
        tk.Label(
            history_window,
            text="Scoring History Records",
            font=('Segoe UI', 16, 'bold'),
            bg=self.bg_color,
            fg=self.text_color
        ).pack(pady=10)
        
        # History list
        list_frame = tk.Frame(history_window, bg=self.panel_bg, relief=tk.RAISED, borderwidth=1)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Table header
        header_frame = tk.Frame(list_frame, bg=self.header_bg)
        header_frame.pack(fill=tk.X, padx=5, pady=5)
        
        headers = ["Time", "Score", "Grade", "Challenge"]
        for i, header in enumerate(headers):
            tk.Label(
                header_frame,
                text=header,
                font=('Segoe UI', 10, 'bold'),
                bg=self.header_bg,
                fg=self.text_color,
                width=15 if i == 0 else 10
            ).grid(row=0, column=i, padx=5, pady=5, sticky='w')
        
        # Record list (using Canvas for scrolling)
        canvas = tk.Canvas(list_frame, bg=self.panel_bg, highlightthickness=0)
        scrollbar = tk.Scrollbar(list_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg=self.panel_bg)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # Display records (newest to oldest)
        for idx, record in enumerate(reversed(history)):
            row_frame = tk.Frame(scrollable_frame, bg=self.panel_bg if idx % 2 == 0 else self.bg_color)
            row_frame.pack(fill=tk.X, padx=5, pady=2)
            
            timestamp = record.get('timestamp', 'N/A')
            score = record.get('total_score', 0)
            grade = record.get('grade', '--')
            challenge = record.get('challenge_name', 'Free Play')
            
            grade_color = self._get_grade_color(grade)
            
            tk.Label(row_frame, text=timestamp, font=('Segoe UI', 9), bg=row_frame['bg'], fg=self.text_color, width=20).grid(row=0, column=0, padx=5, sticky='w')
            tk.Label(row_frame, text=f"{score:.2f}", font=('Segoe UI', 9, 'bold'), bg=row_frame['bg'], fg=grade_color, width=10).grid(row=0, column=1, padx=5, sticky='w')
            tk.Label(row_frame, text=grade, font=('Segoe UI', 9, 'bold'), bg=row_frame['bg'], fg=grade_color, width=10).grid(row=0, column=2, padx=5, sticky='w')
            tk.Label(row_frame, text=challenge, font=('Segoe UI', 9), bg=row_frame['bg'], fg=self.text_color, width=15).grid(row=0, column=3, padx=5, sticky='w')
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Close button
        tk.Button(
            history_window,
            text="Close",
            command=history_window.destroy,
            bg=self.danger_color,
            fg='white',
            font=('Segoe UI', 10),
            relief='flat',
            cursor='hand2',
            padx=20,
            pady=5
        ).pack(pady=10)
    
    def start_challenge_mode(self):
        """Start challenge mode"""
        # Create challenge selection dialog
        challenge_window = tk.Toplevel(self.root)
        challenge_window.title("🎯 Select Challenge")
        challenge_window.geometry("500x400")
        challenge_window.transient(self.root)
        challenge_window.configure(bg=self.bg_color)
        
        tk.Label(
            challenge_window,
            text="Select Challenge Scenario",
            font=('Segoe UI', 16, 'bold'),
            bg=self.bg_color,
            fg=self.text_color
        ).pack(pady=15)
        
        # Preset challenge list
        challenges = [
            {
                'id': 'crisis_2008',
                'name': '2008 Financial Crisis',
                'description': 'Simulate market volatility during the 2008 financial crisis\nPeriod: 2008-09-15 to 2009-03-09\nInitial Capital: $100,000',
                'start_date': '2008-09-15',
                'end_date': '2009-03-09',
                'initial_cash': 100000,
                'events': [
                    {'code': 'ALL', 'start': '2008-09-15', 'days': 30, 'impact_pct': -15},
                    {'code': 'ALL', 'start': '2008-10-01', 'days': 20, 'impact_pct': -20}
                ]
            },
            {
                'id': 'covid_2020',
                'name': '2020 COVID-19 Impact',
                'description': 'Simulate the impact of COVID-19 pandemic on the market in 2020\nPeriod: 2020-02-20 to 2020-04-30\nInitial Capital: $100,000',
                'start_date': '2020-02-20',
                'end_date': '2020-04-30',
                'initial_cash': 100000,
                'events': [
                    {'code': 'ALL', 'start': '2020-02-20', 'days': 15, 'impact_pct': -25},
                    {'code': 'ALL', 'start': '2020-03-15', 'days': 10, 'impact_pct': -30}
                ]
            },
            {
                'id': 'tech_crash_2021',
                'name': '2021 Tech Stock Correction',
                'description': 'Simulate the major tech stock correction in 2021\nPeriod: 2021-02-15 to 2021-03-31\nInitial Capital: $100,000',
                'start_date': '2021-02-15',
                'end_date': '2021-03-31',
                'initial_cash': 100000,
                'events': [
                    {'code': 'ALL', 'start': '2021-02-15', 'days': 20, 'impact_pct': -12}
                ]
            }
        ]
        
        selected_challenge = {'value': None}
        
        # Challenge list
        list_frame = tk.Frame(challenge_window, bg=self.panel_bg, relief=tk.RAISED, borderwidth=1)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        canvas = tk.Canvas(list_frame, bg=self.panel_bg, highlightthickness=0)
        scrollbar = tk.Scrollbar(list_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg=self.panel_bg)
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        for challenge in challenges:
            challenge_frame = tk.Frame(scrollable_frame, bg=self.panel_bg, relief=tk.RAISED, borderwidth=1)
            challenge_frame.pack(fill=tk.X, padx=10, pady=5)
            
            def select_challenge(ch=challenge):
                selected_challenge['value'] = ch
                challenge_window.destroy()
            
            tk.Button(
                challenge_frame,
                text=challenge['name'],
                command=select_challenge,
                bg=self.accent_color,
                fg='white',
                font=('Segoe UI', 11, 'bold'),
                relief='flat',
                cursor='hand2',
                padx=15,
                pady=8,
                width=25
            ).pack(pady=5)
            
            tk.Label(
                challenge_frame,
                text=challenge['description'],
                font=('Segoe UI', 9),
                bg=self.panel_bg,
                fg=self.text_color,
                justify=tk.LEFT
            ).pack(padx=10, pady=(0, 5))
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Cancel button
        tk.Button(
            challenge_window,
            text="Cancel",
            command=challenge_window.destroy,
            bg=self.danger_color,
            fg='white',
            font=('Segoe UI', 10),
            relief='flat',
            cursor='hand2',
            padx=20,
            pady=5
        ).pack(pady=10)
        
        challenge_window.wait_window()
        
        if selected_challenge['value']:
            self._activate_challenge(selected_challenge['value'])
    
    def _activate_challenge(self, challenge):
        """Activate challenge mode"""
        # Ask for password
        password = simpledialog.askstring(
            "Challenge Password",
            f"Enter password to start challenge:\n{challenge['name']}",
            show='*'
        )
        
        if password is None:
            return  # User cancelled
        
        # Simple password validation (you can customize this)
        # For now, we'll use a simple check - you can enhance this later
        if not password or len(password) < 3:
            messagebox.showerror("Invalid Password", "Password must be at least 3 characters long.")
            return
        
        # Confirm clearing existing data
        if messagebox.askyesno(
            "Start Challenge",
            f"Start Challenge: {challenge['name']}\n\n"
            f"This will clear all existing trade data and reset the account.\n"
            f"Are you sure you want to continue?"
        ):
            # Clear trade data
            self.clear_trade_data(silent=True)
            
            # Set challenge info
            self.challenge_mode = True
            self.challenge_info = challenge
            self.challenge_start_date = datetime.datetime.strptime(challenge['start_date'], '%Y-%m-%d').date()
            self.challenge_end_date = datetime.datetime.strptime(challenge['end_date'], '%Y-%m-%d').date()
            
            # Set initial capital
            self.trade_manager.initial_cash = challenge['initial_cash']
            self.trade_manager.cash = challenge['initial_cash']
            self.cash = challenge['initial_cash']
            
            # Apply challenge events
            self.data_manager.events = challenge.get('events', [])
            self.data_manager._save_events()
            
            # Jump to challenge start date
            self.current_date = self.challenge_start_date
            self.calendar.selection_set(self.challenge_start_date)
            self.date_label.config(text=f"Current Date: {self.current_date.strftime('%Y-%m-%d')} (Challenge Mode)")
            
            # Update UI
            self.challenge_btn.config(text="🎯 Challenge Active", bg=self.danger_color, state='disabled')
            self.exit_challenge_btn.config(state='normal')  # Enable Exit Challenge button
            self.prev_day_btn.config(state='disabled')  # Disable previous day button
            self._update_challenge_status()
            
            # Disable calendar direct selection (only Next Day allowed)
            self.calendar.config(state='disabled')
            
            # Reload stock data
            self.load_stocks(datetime.datetime.combine(self.current_date, datetime.time()))
            
            messagebox.showinfo(
                "Challenge Started",
                f"Challenge: {challenge['name']}\n\n"
                f"Start Date: {challenge['start_date']}\n"
                f"End Date: {challenge['end_date']}\n"
                f"Initial Capital: ${challenge['initial_cash']:,.2f}\n\n"
                f"Note: During challenge, you can only move forward, not backward!"
            )
    
    def _update_challenge_status(self):
        """Update challenge status display"""
        if self.challenge_mode and self.challenge_info:
            days_passed = (self.current_date - self.challenge_start_date).days
            total_days = (self.challenge_end_date - self.challenge_start_date).days
            days_remaining = (self.challenge_end_date - self.current_date).days
            
            status_text = f"Challenge Active | Days Passed: {days_passed}/{total_days} | Remaining: {days_remaining} days"
            self.challenge_status_label.config(text=status_text)
            # Pack below buttons if not already packed
            if not self.challenge_status_label.winfo_manager():
                self.challenge_status_label.pack(pady=(5, 0))
    
    def exit_challenge(self):
        """Exit challenge mode with user options"""
        if not self.challenge_mode:
            return
        
        # Confirm exit
        if not messagebox.askyesno(
            "Exit Challenge",
            "Are you sure you want to exit the challenge?\n\n"
            "You will be asked about:\n"
            "- Whether to keep trade records\n"
            "- Whether to perform AI analysis"
        ):
            return
        
        # Ask user about keeping trade records
        keep_records = messagebox.askyesno(
            "Keep Trade Records?",
            "Do you want to keep the trade records from this challenge?"
        )
        
        # Ask user about AI analysis
        perform_ai_analysis = False
        if EXPORT_ANALYSIS_AVAILABLE:
            perform_ai_analysis = messagebox.askyesno(
                "AI Analysis",
                "Do you want to perform AI analysis on your trading performance?"
            )
        
        # Calculate final score before clearing (if needed)
        curve = None
        stats = None
        score_result = None
        challenge_name = self.challenge_info['name'] if self.challenge_info else "Unknown Challenge"
        
        if keep_records or perform_ai_analysis:
            curve = self._build_equity_curve(include_current=True)
            stats = self._compute_performance_stats(curve)
        
        if stats:
                score_result = self._calculate_score(stats)
                score_result['challenge_name'] = challenge_name
                score_result['timestamp'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                # Save score to history
                self._save_score_to_history(score_result)
        
        # Clear trade data if user chose not to keep records
        if not keep_records:
            self.clear_trade_data(silent=True)
        
        # Perform AI analysis if requested
        if perform_ai_analysis and EXPORT_ANALYSIS_AVAILABLE and self.export_analyzer:
            try:
                self.export_analyzer.generate_ai_analysis()
                messagebox.showinfo(
                    "AI Analysis Complete",
                    "AI analysis has been generated. Check the analysis file for details."
                )
            except Exception as e:
                messagebox.showerror("AI Analysis Error", f"Failed to generate AI analysis: {str(e)}")
        
        # Exit challenge mode
        self.challenge_mode = False
        self.challenge_info = None
        
        # Restore UI
        self.challenge_btn.config(text="🎯 Start Challenge", bg=self.success_color, state='normal')
        self.exit_challenge_btn.config(state='disabled')  # Disable Exit Challenge button
        self.prev_day_btn.config(state='normal')
        self.calendar.config(state='normal')
        self.challenge_status_label.config(text="")
        # Hide challenge status label
        if self.challenge_status_label.winfo_manager():
            self.challenge_status_label.pack_forget()
        
        # Update date label
        self.date_label.config(text=f"Current Date: {self.current_date.strftime('%Y-%m-%d')}")
        
        # Show result if available
        if score_result:
            self._show_challenge_result(score_result)
        else:
            messagebox.showinfo(
                "Challenge Exited",
                "Challenge has been exited.\n\n" +
                ("Trade records have been kept." if keep_records else "Trade records have been cleared.")
            )
    
    def end_challenge(self):
        """End challenge and show score"""
        if not self.challenge_mode:
            return
        
        self.challenge_mode = False
        
        # Restore UI
        self.challenge_btn.config(text="🎯 Start Challenge", bg=self.success_color, state='normal')
        self.exit_challenge_btn.config(state='disabled')  # Disable Exit Challenge button
        self.prev_day_btn.config(state='normal')
        self.calendar.config(state='normal')
        self.challenge_status_label.config(text="")
        # Hide challenge status label
        if self.challenge_status_label.winfo_manager():
            self.challenge_status_label.pack_forget()
        
        # Calculate final score
        curve = self._build_equity_curve(include_current=True)
        stats = self._compute_performance_stats(curve)
        
        if stats:
            score_result = self._calculate_score(stats)
            score_result['challenge_name'] = self.challenge_info['name']
            score_result['timestamp'] = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Save score
            self._save_score_to_history(score_result)
            
            # Show challenge result window
            self._show_challenge_result(score_result)
        else:
            messagebox.showinfo("Challenge Ended", "Challenge has ended, but no trade data available.")
    
    def _save_score_to_history(self, score_result):
        """Save score to history"""
        history = []
        if os.path.exists(self.scores_history_file):
            try:
                with open(self.scores_history_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            except:
                history = []
        
        history.append(score_result)
        
        try:
            with open(self.scores_history_file, 'w', encoding='utf-8') as f:
                json.dump(history, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save score: {e}")
    
    def _show_challenge_result(self, score_result):
        """Show challenge result"""
        result_window = tk.Toplevel(self.root)
        result_window.title("🎯 Challenge Result")
        result_window.geometry("600x500")
        result_window.transient(self.root)
        result_window.configure(bg=self.bg_color)
        
        # Title
        title_frame = tk.Frame(result_window, bg=self.header_bg)
        title_frame.pack(fill=tk.X, padx=10, pady=10)
        
        grade_color = self._get_grade_color(score_result['grade'])
        
        challenge_name = score_result.get('challenge_name', self.challenge_info['name'] if self.challenge_info else "Unknown Challenge")
        tk.Label(
            title_frame,
            text=f"Challenge: {challenge_name}",
            font=('Segoe UI', 16, 'bold'),
            bg=self.header_bg,
            fg=self.text_color
        ).pack(pady=10)
        
        tk.Label(
            title_frame,
            text=f"Final Score: {score_result['total_score']:.2f}",
            font=('Segoe UI', 20, 'bold'),
            bg=self.header_bg,
            fg=grade_color
        ).pack(pady=5)
        
        tk.Label(
            title_frame,
            text=f"Grade: {score_result['grade']}",
            font=('Segoe UI', 16, 'bold'),
            bg=self.header_bg,
            fg=grade_color
        ).pack(pady=(0, 10))
        
        # Performance summary
        curve = self._build_equity_curve(include_current=True)
        stats = self._compute_performance_stats(curve)
        
        summary_frame = tk.Frame(result_window, bg=self.panel_bg, relief=tk.RAISED, borderwidth=1)
        summary_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        final_value = self.trade_manager.get_cash() + sum(
            self.stocks.get(code, {}).get('price', 0) * info['shares']
            for code, info in self.portfolio.items()
                )
        
        initial_cash = self.challenge_info['initial_cash'] if self.challenge_info else self.trade_manager.initial_cash
        summary_text = f"""
Initial Capital: ${initial_cash:,.2f}
Final Assets: ${final_value:,.2f}

Total Return: {stats.get('total_return', 0)*100:.2f}%
Sharpe Ratio: {stats.get('sharpe', 0):.2f}
Max Drawdown: {stats.get('max_dd', 0)*100:.2f}%
Win Rate: {stats.get('win_rate', 0):.1f}%
Profit Factor: {stats.get('profit_factor', 0):.2f}
        """
        
        tk.Label(
            summary_frame,
            text=summary_text.strip(),
            font=('Segoe UI', 11),
            bg=self.panel_bg,
            fg=self.text_color,
            justify=tk.LEFT
        ).pack(padx=20, pady=20, anchor='w')
        
        # Button
        button_frame = tk.Frame(result_window, bg=self.bg_color)
        button_frame.pack(fill=tk.X, padx=10, pady=10)
        
        tk.Button(
            button_frame,
            text="View Detailed Score",
            command=lambda: self._show_score_details_from_result(score_result),
            bg=self.accent_color,
            fg='white',
            font=('Segoe UI', 10, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            button_frame,
            text="Close",
            command=result_window.destroy,
            bg=self.danger_color,
            fg='white',
            font=('Segoe UI', 10),
            relief='flat',
            cursor='hand2',
            padx=15,
            pady=5
        ).pack(side=tk.RIGHT, padx=5)
    
    def _show_score_details_from_result(self, score_result):
        """Show score details from challenge result"""
        self.current_score_result = score_result
        self.show_score_details()
    
    def clear_trade_data(self, silent=False):
        """Clear all trade data and reset account"""
        if not silent:
            if not messagebox.askyesno(
                "Clear Trade Data",
                "Are you sure you want to clear all trade data?\n\n"
                "This will delete:\n"
                "- All trade records\n"
                "- All positions\n"
                "- All pending orders\n\n"
                "Account will be reset to initial state."
            ):
                return
        
        # Clear trade records
        self.trade_manager.trade_records = []
        self.trade_manager.portfolio = {}
        self.trade_manager.pending_orders = []
        
        # Reset cash to initial capital
        self.trade_manager.cash = self.trade_manager.initial_cash
        self.cash = self.trade_manager.initial_cash
        
        # Save data
        self.trade_manager.save_data()
        
        # Update UI
        self.update_portfolio_table()
        self.load_trade_records()
        self.update_assets()
        self.update_equity_metrics(self.cash)
        
        if not silent:
            messagebox.showinfo("Clear Success", "All trade data has been cleared. Account has been reset.")
    
    def _show_disclaimer_if_needed(self):
        """Show disclaimer dialog on first launch."""
        # Check if user has already seen the disclaimer
        if PATH_UTILS_AVAILABLE:
            disclaimer_file = get_user_data_file(".disclaimer_accepted")
        else:
            disclaimer_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".disclaimer_accepted")
        
        if os.path.exists(disclaimer_file):
            return  # User has already accepted
        
        # Show disclaimer dialog
        disclaimer_window = tk.Toplevel(self.root)
        disclaimer_window.title("Disclaimer")
        disclaimer_window.geometry("600x500")
        disclaimer_window.transient(self.root)
        disclaimer_window.grab_set()
        disclaimer_window.resizable(False, False)
        
        # Center the window
        disclaimer_window.update_idletasks()
        x = (disclaimer_window.winfo_screenwidth() // 2) - (600 // 2)
        y = (disclaimer_window.winfo_screenheight() // 2) - (500 // 2)
        disclaimer_window.geometry(f"600x500+{x}+{y}")
        
        # Main frame
        main_frame = tk.Frame(disclaimer_window, bg=self.bg_color)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Title
        title_label = tk.Label(
            main_frame,
            text="⚠️ Important Disclaimer",
            font=('Segoe UI', 16, 'bold'),
            bg=self.bg_color,
            fg=self.danger_color
        )
        title_label.pack(pady=(0, 15))
        
        # Disclaimer text in scrollable text widget
        text_frame = tk.Frame(main_frame, bg=self.panel_bg, relief=tk.SOLID, borderwidth=1)
        text_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        text_widget = tk.Text(
            text_frame,
            wrap=tk.WORD,
            font=('Segoe UI', 10),
            bg=self.panel_bg,
            fg=self.text_color,
            padx=15,
            pady=15,
            relief=tk.FLAT,
            borderwidth=0
        )
        text_widget.pack(fill=tk.BOTH, expand=True)
        text_widget.insert('1.0', DISCLAIMER_TEXT)
        text_widget.config(state=tk.DISABLED)
        
        # Scrollbar
        scrollbar = tk.Scrollbar(text_frame, command=text_widget.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        text_widget.config(yscrollcommand=scrollbar.set)
        
        # Buttons frame
        button_frame = tk.Frame(main_frame, bg=self.bg_color)
        button_frame.pack(fill=tk.X)
        
        def accept_disclaimer():
            # Save acceptance
            try:
                with open(disclaimer_file, 'w') as f:
                    f.write("accepted")
            except Exception:
                pass  # If can't save, continue anyway
            disclaimer_window.destroy()
        
        def reject_disclaimer():
            messagebox.showinfo(
                "Disclaimer",
                "You must accept the disclaimer to use this software.\n\nThe application will now exit.",
                parent=disclaimer_window
            )
            self.root.quit()
        
        # I Understand button
        accept_btn = tk.Button(
            button_frame,
            text="I Understand",
            command=accept_disclaimer,
            bg=self.success_color,
            fg='white',
            font=('Segoe UI', 11, 'bold'),
            relief='flat',
            cursor='hand2',
            padx=20,
            pady=8
        )
        accept_btn.pack(side=tk.RIGHT, padx=(10, 0))
        
        # Exit button
        exit_btn = tk.Button(
            button_frame,
            text="Exit",
            command=reject_disclaimer,
            bg=self.danger_color,
            fg='white',
            font=('Segoe UI', 11),
            relief='flat',
            cursor='hand2',
            padx=20,
            pady=8
        )
        exit_btn.pack(side=tk.RIGHT)
        
        # Wait for user response
        disclaimer_window.wait_window()
    
    def show_about_dialog(self):
        """Show About dialog with version information."""
        about_window = tk.Toplevel(self.root)
        app_name = VERSION_INFO.get('app_name', 'EPSILON') if VERSION_AVAILABLE else 'EPSILON'
        about_window.title(f"About {app_name}")
        about_window.geometry("500x400")
        about_window.transient(self.root)
        about_window.grab_set()
        about_window.resizable(False, False)
        
        # Center the window
        about_window.update_idletasks()
        x = (about_window.winfo_screenwidth() // 2) - (500 // 2)
        y = (about_window.winfo_screenheight() // 2) - (400 // 2)
        about_window.geometry(f"500x400+{x}+{y}")
        
        # Main frame
        main_frame = tk.Frame(about_window, bg=self.bg_color)
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # App name and version
        app_name_label = tk.Label(
            main_frame,
            text=VERSION_INFO.get('app_name', 'Stock Trading Simulator'),
            font=('Segoe UI', 18, 'bold'),
            bg=self.bg_color,
            fg=self.accent_color
        )
        app_name_label.pack(pady=(0, 5))
        
        version_label = tk.Label(
            main_frame,
            text=get_version_string(),
            font=('Segoe UI', 12),
            bg=self.bg_color,
            fg=self.text_color
        )
        version_label.pack(pady=(0, 20))
        
        # Info text
        info_text = get_full_version_info() if VERSION_AVAILABLE else f"Stock Trading Simulator {get_version_string()}"
        
        info_label = tk.Label(
            main_frame,
            text=info_text,
            font=('Segoe UI', 10),
            bg=self.bg_color,
            fg=self.text_color,
            justify=tk.LEFT,
            wraplength=450
        )
        info_label.pack(pady=(0, 20))
        
        # Disclaimer reminder (use unified disclaimer from version.py)
        disclaimer_text = DISCLAIMER_TEXT if VERSION_AVAILABLE else "⚠️ This software is for educational and simulation purposes only.\nNot for real trading or investment advice."
        disclaimer_label = tk.Label(
            main_frame,
            text=disclaimer_text,
            font=('Segoe UI', 9),
            bg=self.bg_color,
            fg=self.danger_color,
            justify=tk.CENTER,
            wraplength=450
        )
        disclaimer_label.pack(pady=(0, 20))
        
        # Close button
        close_btn = tk.Button(
            main_frame,
            text="Close",
            command=about_window.destroy,
            bg=self.accent_color,
            fg='white',
            font=('Segoe UI', 11),
            relief='flat',
            cursor='hand2',
            padx=30,
            pady=8
        )
        close_btn.pack()
        
        # Bind Escape key
        about_window.bind('<Escape>', lambda e: about_window.destroy())


if __name__ == "__main__":
    root = tk.Tk()  # Create main window
    app = StockTradeSimulator(root)  # Instantiate stock trading simulator
    root.mainloop()  # Enter main event loop