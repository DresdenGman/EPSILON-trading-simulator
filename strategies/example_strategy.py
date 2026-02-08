"""Example trading strategies for demonstration and testing."""

import pandas as pd
from typing import Dict, List, Tuple
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from strategies.base_strategy import BaseStrategy
except ImportError:
    # Fallback for direct execution
    from base_strategy import BaseStrategy


class BuyAndHoldStrategy(BaseStrategy):
    """Simple buy-and-hold strategy: buy equal amounts of all stocks on first day."""
    
    def init(self):
        """Initialize strategy."""
        self.initialized = False
    
    def next(self, current_data: Dict, portfolio: Dict[str, int]) -> List[Tuple[str, str, int]]:
        """Buy and hold: buy all stocks on first day, then hold."""
        if self.initialized:
            return []  # Hold after initial buy
        
        actions = []
        available_stocks = current_data.get('available_stocks', [])
        prices = current_data.get('prices', {})
        cash = current_data.get('cash', 0)
        
        if not available_stocks or cash <= 0:
            return []
        
        # Buy equal amounts of each stock
        num_stocks = len(available_stocks)
        cash_per_stock = cash / num_stocks
        
        for code in available_stocks:
            if code in prices and prices[code] > 0:
                shares = int(cash_per_stock / prices[code])
                if shares > 0:
                    actions.append(('buy', code, shares))
        
        self.initialized = True
        return actions


class MovingAverageStrategy(BaseStrategy):
    """Simple moving average crossover strategy: buy when price > MA, sell when price < MA."""
    
    def init(self):
        """Initialize strategy parameters."""
        self.lookback = 20  # Moving average period
        self.min_shares = 1  # Minimum shares to trade
    
    def next(self, current_data: Dict, portfolio: Dict[str, int]) -> List[Tuple[str, str, int]]:
        """Generate signals based on moving average."""
        actions = []
        prices = current_data.get('prices', {})
        history = current_data.get('history', {})
        cash = current_data.get('cash', 0)
        
        for code, price in prices.items():
            if code not in history:
                continue
            
            df = history[code]
            if len(df) < self.lookback:
                continue
            
            # Calculate moving average
            closes = df['close'].values
            ma = closes[-self.lookback:].mean()
            
            # Current position
            current_shares = portfolio.get(code, 0)
            
            # Trading logic
            if price > ma and current_shares == 0:
                # Buy signal: price above MA and no position
                if cash > price * self.min_shares:
                    shares = int(cash * 0.1 / price)  # Use 10% of cash
                    if shares >= self.min_shares:
                        actions.append(('buy', code, shares))
            
            elif price < ma and current_shares > 0:
                # Sell signal: price below MA and have position
                actions.append(('sell', code, current_shares))
        
        return actions


class MomentumStrategy(BaseStrategy):
    """Momentum strategy: buy stocks with positive momentum, sell those with negative."""
    
    def init(self):
        """Initialize strategy parameters."""
        self.lookback = 10  # Days to look back for momentum
        self.momentum_threshold = 0.02  # 2% minimum momentum
    
    def next(self, current_data: Dict, portfolio: Dict[str, int]) -> List[Tuple[str, str, int]]:
        """Generate signals based on momentum."""
        actions = []
        prices = current_data.get('prices', {})
        history = current_data.get('history', {})
        cash = current_data.get('cash', 0)
        
        for code, price in prices.items():
            if code not in history:
                continue
            
            df = history[code]
            if len(df) < self.lookback + 1:
                continue
            
            # Calculate momentum (price change over lookback period)
            closes = df['close'].values
            past_price = closes[-self.lookback - 1]
            momentum = (price - past_price) / past_price if past_price > 0 else 0
            
            current_shares = portfolio.get(code, 0)
            
            # Trading logic
            if momentum > self.momentum_threshold and current_shares == 0:
                # Buy: positive momentum and no position
                if cash > price:
                    shares = int(cash * 0.15 / price)  # Use 15% of cash
                    if shares > 0:
                        actions.append(('buy', code, shares))
            
            elif momentum < -self.momentum_threshold and current_shares > 0:
                # Sell: negative momentum and have position
                actions.append(('sell', code, current_shares))
        
        return actions
