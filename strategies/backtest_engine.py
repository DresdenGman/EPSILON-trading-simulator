"""Backtest engine for running trading strategies on historical data."""

import datetime
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

from trading.trade_manager import TradeManager
from data.stock_data_manager import StockDataManager
from strategies.base_strategy import BaseStrategy


class BacktestEngine:
    """Engine for backtesting trading strategies on historical data."""
    
    def __init__(
        self,
        strategy: BaseStrategy,
        initial_cash: float = 100000.0,
        fee_rate: float = 0.0001,
        min_fee: float = 1.0,
        slippage_per_share: float = 0.0,
        use_mock_data: Optional[bool] = None
    ):
        """Initialize backtest engine.
        
        Args:
            strategy: Strategy instance to backtest
            initial_cash: Starting capital
            fee_rate: Trading fee rate (as fraction of trade value)
            min_fee: Minimum fee per trade
            slippage_per_share: Slippage per share
            use_mock_data: Force mock data mode if True
        """
        self.strategy = strategy
        # Create a fresh TradeManager for each backtest to avoid state pollution
        self.trade_manager = TradeManager(initial_cash=initial_cash)
        self.trade_manager.fee_rate = fee_rate
        self.trade_manager.min_fee = min_fee
        self.trade_manager.slippage_per_share = slippage_per_share
        
        self.data_manager = StockDataManager(use_mock_data=use_mock_data)
        self.stock_list = self.data_manager.stock_list
        
        # Store equity curve (reset for each run)
        self.equity_curve: List[Tuple[datetime.date, float]] = []
    
    def run(
        self,
        start_date: datetime.date,
        end_date: datetime.date,
        stock_codes: Optional[List[str]] = None
    ) -> Dict:
        """Run backtest on historical data.
        
        Args:
            start_date: Start date for backtest
            end_date: End date for backtest
            stock_codes: List of stock codes to trade (None = all available)
        
        Returns:
            Dictionary with backtest results:
            - equity_curve: List of (date, equity) tuples
            - trades: List of trade records
            - performance: Performance metrics dict
        """
        # Reset state for fresh run - create new TradeManager to avoid state pollution
        self.equity_curve = []
        initial_cash = self.trade_manager.initial_cash
        fee_rate = self.trade_manager.fee_rate
        min_fee = self.trade_manager.min_fee
        slippage = self.trade_manager.slippage_per_share
        
        # Create fresh TradeManager for this run
        self.trade_manager = TradeManager(initial_cash=initial_cash)
        self.trade_manager.fee_rate = fee_rate
        self.trade_manager.min_fee = min_fee
        self.trade_manager.slippage_per_share = slippage
        
        if stock_codes is None:
            stock_codes = list(self.stock_list.keys())
        
        # Get date range
        current_date = start_date
        all_dates = []
        
        # Generate list of trading dates (weekdays only)
        while current_date <= end_date:
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                all_dates.append(current_date)
            current_date += datetime.timedelta(days=1)
        
        if not all_dates:
            return self._empty_results()
        
        # Load historical data for all stocks
        # Calculate window: need enough history for technical indicators (e.g., 20-day MA)
        # But limit to reasonable amount to avoid excessive data fetching
        days_needed = (end_date - start_date).days
        # Strategy needs lookback period (typically 20-30 days), so add buffer
        # But cap at 90 days to avoid fetching too much data
        window_days = min(days_needed + 60, 90)
        
        history_data = {}
        for code in stock_codes:
            hist = self.data_manager.get_stock_history(
                code, end_date, window_days=window_days
            )
            if hist is not None:
                history_data[code] = hist
        
        if not history_data:
            return self._empty_results()
        
        # Run backtest day by day
        for date in all_dates:
            # Get current prices and history up to this date
            current_prices = {}
            current_history = {}
            
            for code in stock_codes:
                if code not in history_data:
                    continue
                
                df = history_data[code]
                # Filter data up to current date
                df_filtered = df[df['date'] <= date.strftime('%Y-%m-%d')]
                
                if len(df_filtered) == 0:
                    continue
                
                # Get current price (last close price)
                last_row = df_filtered.iloc[-1]
                current_prices[code] = float(last_row['close'])
                
                # Store history for strategy
                current_history[code] = df_filtered.copy()
            
            if not current_prices:
                continue
            
            # Get current portfolio
            portfolio = self.trade_manager.get_portfolio()
            portfolio_shares = {code: int(info['shares']) for code, info in portfolio.items()}
            
            # Get current cash
            cash = self.trade_manager.get_cash()
            
            # Prepare data for strategy
            strategy_data = {
                'date': date,
                'prices': current_prices,
                'history': current_history,
                'available_stocks': list(current_prices.keys()),
                'cash': cash
            }
            
            # Get trading signals from strategy
            try:
                signals = self.strategy.next(strategy_data, portfolio_shares)
            except Exception as e:
                print(f"Warning: Strategy {self.strategy.name} raised error on {date}: {e}")
                signals = []
            
            # Execute trades
            for action, code, shares in signals:
                if code not in current_prices:
                    continue
                
                price = current_prices[code]
                shares = int(shares)
                
                if shares <= 0:
                    continue
                
                if action == 'buy':
                    self._execute_buy(date, code, shares, price)
                elif action == 'sell':
                    self._execute_sell(date, code, shares, price)
                # 'hold' action is ignored (no trade)
            
            # Record equity at end of day
            equity = self._calculate_equity(date, current_prices)
            self.equity_curve.append((date, equity))
        
        # Calculate performance metrics
        performance = self._calculate_performance()
        
        return {
            'equity_curve': self.equity_curve,
            'trades': self.trade_manager.get_trade_records(),
            'performance': performance,
            'strategy_name': self.strategy.get_name()
        }
    
    def _execute_buy(self, date: datetime.date, code: str, shares: int, price: float):
        """Execute buy order."""
        exec_price, gross, fee = self.trade_manager.calculate_trade_costs(price, shares, 'Buy')
        
        if gross + fee > self.trade_manager.get_cash():
            return  # Insufficient cash
        
        stock_name = self.stock_list.get(code, code)
        self.trade_manager.add_trade_record(
            date.strftime('%Y-%m-%d'),
            code,
            stock_name,
            'Buy',
            shares,
            exec_price,
            gross
        )
        self.trade_manager.update_portfolio(code, shares, exec_price, 'Buy')
        self.trade_manager.update_cash(gross, 'Buy', fee=fee)
    
    def _execute_sell(self, date: datetime.date, code: str, shares: int, price: float):
        """Execute sell order."""
        portfolio = self.trade_manager.get_portfolio()
        if code not in portfolio:
            return  # No position
        
        available_shares = int(portfolio[code]['shares'])
        if shares > available_shares:
            shares = available_shares  # Sell all available
        
        if shares <= 0:
            return
        
        exec_price, gross, fee = self.trade_manager.calculate_trade_costs(price, shares, 'Sell')
        
        stock_name = self.stock_list.get(code, code)
        self.trade_manager.add_trade_record(
            date.strftime('%Y-%m-%d'),
            code,
            stock_name,
            'Sell',
            shares,
            exec_price,
            gross
        )
        self.trade_manager.update_portfolio(code, shares, exec_price, 'Sell')
        self.trade_manager.update_cash(gross, 'Sell', fee=fee)
    
    def _calculate_equity(self, date: datetime.date, prices: Dict[str, float]) -> float:
        """Calculate total portfolio equity."""
        equity = self.trade_manager.get_cash()
        portfolio = self.trade_manager.get_portfolio()
        
        for code, info in portfolio.items():
            shares = int(info['shares'])
            if code in prices:
                equity += shares * prices[code]
            else:
                # Use cost basis if price not available
                equity += info.get('total_cost', 0)
        
        return equity
    
    def _calculate_performance(self) -> Dict[str, float]:
        """Calculate performance metrics from equity curve."""
        if not self.equity_curve:
            return {
                'total_return': 0.0,
                'cagr': 0.0,
                'sharpe': 0.0,
                'max_drawdown': 0.0,
                'win_rate': 0.0,
                'profit_factor': 0.0
            }
        
        # Sort by date
        curve = sorted(self.equity_curve, key=lambda x: x[0])
        dates = [c[0] for c in curve]
        values = np.array([c[1] for c in curve], dtype=float)
        
        if len(values) == 0 or values[0] <= 0:
            return {
                'total_return': 0.0,
                'cagr': 0.0,
                'sharpe': 0.0,
                'max_drawdown': 0.0,
                'win_rate': 0.0,
                'profit_factor': 0.0
            }
        
        # Total return
        total_return = (values[-1] / values[0] - 1) if values[0] != 0 else 0.0
        
        # CAGR
        span_days = max(1, (dates[-1] - dates[0]).days)
        years = span_days / 365.25
        cagr = ((values[-1] / values[0]) ** (1 / years) - 1) if years > 0 and values[0] > 0 else 0.0
        
        # Sharpe ratio (annualized)
        if len(values) > 1 and np.all(values[:-1] > 0):
            rets = np.diff(values) / values[:-1]
            avg_ret = rets.mean()
            vol = rets.std(ddof=1) if len(rets) > 1 else 0.0
            sharpe = (avg_ret / vol * np.sqrt(252)) if vol > 1e-9 else 0.0
        else:
            sharpe = 0.0
        
        # Maximum drawdown
        cum_max = np.maximum.accumulate(values)
        drawdowns = (cum_max - values) / cum_max
        max_dd = abs(drawdowns.max()) if len(drawdowns) > 0 else 0.0
        
        # Win rate and profit factor from trades
        trades = self.trade_manager.get_trade_records()
        win_count = 0
        loss_count = 0
        profit_sum = 0.0
        loss_sum = 0.0
        
        # Track positions to calculate P&L
        positions = {}  # {code: [(shares, price, date), ...]}
        
        for trade in trades:
            code = trade['stock_code']
            trade_type = trade['trade_type']
            shares = int(trade['shares'])
            price = float(trade['price'])
            date_str = trade['date']
            
            if code not in positions:
                positions[code] = []
            
            if trade_type == 'Buy':
                positions[code].append((shares, price, date_str))
            else:  # Sell
                # Match with buy orders (FIFO)
                remaining = shares
                while remaining > 0 and positions[code]:
                    buy_shares, buy_price, buy_date = positions[code][0]
                    
                    if buy_shares <= remaining:
                        # Close entire position
                        pnl = (price - buy_price) * buy_shares
                        if pnl > 0:
                            win_count += 1
                            profit_sum += pnl
                        elif pnl < 0:
                            loss_count += 1
                            loss_sum += abs(pnl)
                        remaining -= buy_shares
                        positions[code].pop(0)
                    else:
                        # Partial close
                        pnl = (price - buy_price) * remaining
                        if pnl > 0:
                            win_count += 1
                            profit_sum += pnl
                        elif pnl < 0:
                            loss_count += 1
                            loss_sum += abs(pnl)
                        positions[code][0] = (buy_shares - remaining, buy_price, buy_date)
                        remaining = 0
        
        total_trades = win_count + loss_count
        win_rate = (win_count / total_trades) if total_trades > 0 else 0.0
        profit_factor = (profit_sum / loss_sum) if loss_sum > 0 else (profit_sum if profit_sum > 0 else 0.0)
        
        return {
            'total_return': float(total_return),
            'cagr': float(cagr),
            'sharpe': float(sharpe),
            'max_drawdown': float(max_dd),
            'win_rate': float(win_rate),
            'profit_factor': float(profit_factor)
        }
    
    def _empty_results(self) -> Dict:
        """Return empty results when backtest cannot run."""
        return {
            'equity_curve': [],
            'trades': [],
            'performance': {
                'total_return': 0.0,
                'cagr': 0.0,
                'sharpe': 0.0,
                'max_drawdown': 0.0,
                'win_rate': 0.0,
                'profit_factor': 0.0
            },
            'strategy_name': self.strategy.get_name()
        }
