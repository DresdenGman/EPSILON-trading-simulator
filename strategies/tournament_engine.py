"""Tournament engine for running multiple strategies and ranking them."""

import datetime
import importlib.util
import os
from typing import Dict, List, Optional
import pandas as pd

from strategies.backtest_engine import BacktestEngine
from strategies.base_strategy import BaseStrategy


class TournamentEngine:
    """Engine for running strategy tournaments and generating rankings."""
    
    def __init__(
        self,
        strategies_dir: str = "strategies",
        initial_cash: float = 100000.0,
        fee_rate: float = 0.0001,
        min_fee: float = 1.0,
        slippage_per_share: float = 0.0,
        use_mock_data: Optional[bool] = None
    ):
        """Initialize tournament engine.
        
        Args:
            strategies_dir: Directory containing strategy files
            initial_cash: Starting capital for each strategy
            fee_rate: Trading fee rate
            min_fee: Minimum fee per trade
            slippage_per_share: Slippage per share
            use_mock_data: Force mock data mode if True
        """
        self.strategies_dir = strategies_dir
        self.initial_cash = initial_cash
        self.fee_rate = fee_rate
        self.min_fee = min_fee
        self.slippage_per_share = slippage_per_share
        self.use_mock_data = use_mock_data
    
    def run_tournament(
        self,
        start_date: datetime.date,
        end_date: datetime.date,
        stock_codes: Optional[List[str]] = None,
        strategy_files: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """Run tournament with multiple strategies.
        
        Args:
            start_date: Start date for backtest
            end_date: End date for backtest
            stock_codes: List of stock codes to trade (None = all available)
            strategy_files: List of strategy file paths (None = auto-discover)
        
        Returns:
            DataFrame with rankings and performance metrics
        """
        # Load strategies
        strategies = self._load_strategies(strategy_files)
        
        if not strategies:
            print("Warning: No strategies found!")
            if strategy_files:
                print(f"Attempted to load from {len(strategy_files)} file(s):")
                for f in strategy_files:
                    print(f"  - {f}")
            return pd.DataFrame()
        
        print(f"Running tournament with {len(strategies)} strategies...")
        print(f"Period: {start_date} to {end_date}")
        print(f"Strategies loaded:")
        for s in strategies:
            print(f"  - {s.get_name()}")
        print("-" * 80)
        
        results = []
        
        for i, strategy in enumerate(strategies, 1):
            print(f"[{i}/{len(strategies)}] Backtesting: {strategy.get_name()}...", end=" ", flush=True)
            
            try:
                # Create backtest engine
                engine = BacktestEngine(
                    strategy=strategy,
                    initial_cash=self.initial_cash,
                    fee_rate=self.fee_rate,
                    min_fee=self.min_fee,
                    slippage_per_share=self.slippage_per_share,
                    use_mock_data=self.use_mock_data
                )
                
                # Run backtest
                result = engine.run(start_date, end_date, stock_codes)
                performance = result['performance']
                
                # Store results
                results.append({
                    'Strategy': strategy.get_name(),
                    'Total Return': f"{performance['total_return']*100:.2f}%",
                    'CAGR': f"{performance['cagr']*100:.2f}%",
                    'Sharpe Ratio': f"{performance['sharpe']:.2f}",
                    'Max Drawdown': f"{performance['max_drawdown']*100:.2f}%",
                    'Win Rate': f"{performance['win_rate']*100:.2f}%",
                    'Profit Factor': f"{performance['profit_factor']:.2f}",
                    'Num Trades': len(result['trades']),
                    '_sharpe_raw': performance['sharpe'],  # For sorting
                    '_total_return_raw': performance['total_return']  # For sorting
                })
                
                print(f"✓ Sharpe: {performance['sharpe']:.2f}, Return: {performance['total_return']*100:.2f}%")
            
            except Exception as e:
                print(f"✗ Error: {e}")
                results.append({
                    'Strategy': strategy.get_name(),
                    'Total Return': "Error",
                    'CAGR': "Error",
                    'Sharpe Ratio': "Error",
                    'Max Drawdown': "Error",
                    'Win Rate': "Error",
                    'Profit Factor': "Error",
                    'Num Trades': 0,
                    '_sharpe_raw': -999,
                    '_total_return_raw': -999
                })
        
        # Create DataFrame and sort by Sharpe ratio (primary) and total return (secondary)
        df = pd.DataFrame(results)
        if len(df) > 0:
            df = df.sort_values(
                by=['_sharpe_raw', '_total_return_raw'],
                ascending=[False, False]
            )
            df = df.drop(columns=['_sharpe_raw', '_total_return_raw'])
            df.index = range(1, len(df) + 1)  # Rank starting from 1
        
        print("-" * 80)
        print("Tournament Complete!")
        print("\nRankings (sorted by Sharpe Ratio):")
        print(df.to_string(index=True))
        
        return df
    
    def _load_strategies(self, strategy_files: Optional[List[str]] = None) -> List[BaseStrategy]:
        """Load strategy classes from files.
        
        Args:
            strategy_files: List of file paths (None = auto-discover)
        
        Returns:
            List of strategy instances
        """
        strategies = []
        
        if strategy_files is None:
            # Auto-discover strategy files
            strategy_files = self._discover_strategy_files()
        
        for file_path in strategy_files:
            try:
                # Verify file exists
                if not os.path.exists(file_path):
                    print(f"Warning: Strategy file not found: {file_path}")
                    continue
                
                strategy_classes = self._load_strategy_from_file(file_path)
                if strategy_classes:
                    # Load all strategy classes from the file
                    for strategy_class in strategy_classes:
                        strategy = strategy_class()
                        strategies.append(strategy)
                        print(f"  ✓ Loaded strategy: {strategy.get_name()} from {os.path.basename(file_path)}")
                else:
                    print(f"Warning: No strategy classes found in {file_path}")
            except Exception as e:
                print(f"Warning: Failed to load strategy from {file_path}: {e}")
                import traceback
                print(traceback.format_exc())
        
        return strategies
    
    def _discover_strategy_files(self) -> List[str]:
        """Discover strategy files in strategies directory.
        
        Looks for Python files that contain classes inheriting from BaseStrategy.
        """
        strategy_files = []
        
        if not os.path.exists(self.strategies_dir):
            return strategy_files
        
        for filename in os.listdir(self.strategies_dir):
            if filename.startswith('_') or not filename.endswith('.py'):
                continue
            
            file_path = os.path.join(self.strategies_dir, filename)
            if os.path.isfile(file_path):
                strategy_files.append(file_path)
        
        return strategy_files
    
    def _load_strategy_from_file(self, file_path: str) -> Optional[List[type]]:
        """Load strategy classes from a Python file.
        
        Args:
            file_path: Path to Python file containing strategy classes
        
        Returns:
            List of strategy classes (not instances) or None if not found
        """
        # Load module
        spec = importlib.util.spec_from_file_location("strategy_module", file_path)
        if spec is None or spec.loader is None:
            return None
        
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        # Find BaseStrategy subclasses
        strategy_classes = []
        for name in dir(module):
            obj = getattr(module, name)
            if (isinstance(obj, type) and 
                issubclass(obj, BaseStrategy) and 
                obj != BaseStrategy):
                strategy_classes.append(obj)
        
        return strategy_classes  # Return all found classes
