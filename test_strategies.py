#!/usr/bin/env python3
"""Quick test script to verify strategies are working."""

import datetime
from strategies.example_strategy import BuyAndHoldStrategy, MovingAverageStrategy, MomentumStrategy
from strategies.backtest_engine import BacktestEngine

def test_strategy(strategy_class, name):
    """Test a single strategy."""
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print('='*60)
    
    strategy = strategy_class()
    engine = BacktestEngine(strategy, initial_cash=100000.0, use_mock_data=True)
    
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=30)
    
    result = engine.run(start_date, end_date, stock_codes=['AAPL', 'MSFT', 'GOOGL'])
    
    perf = result['performance']
    print(f"Strategy: {result['strategy_name']}")
    print(f"Trades: {len(result['trades'])}")
    print(f"Total Return: {perf['total_return']*100:.2f}%")
    print(f"Sharpe Ratio: {perf['sharpe']:.2f}")
    print(f"Max Drawdown: {perf['max_drawdown']*100:.2f}%")
    print("✓ Test passed!")

if __name__ == '__main__':
    print("Testing Strategy System")
    print("="*60)
    
    test_strategy(BuyAndHoldStrategy, "Buy and Hold")
    test_strategy(MovingAverageStrategy, "Moving Average")
    test_strategy(MomentumStrategy, "Momentum")
    
    print("\n" + "="*60)
    print("All tests completed!")
