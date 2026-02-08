# The Quant Arena: Strategy Tournament Guide

## Quick Start

### 1. Create Your Strategy

Create a new Python file in the `strategies/` directory:

```python
from strategies.base_strategy import BaseStrategy
from typing import Dict, List, Tuple

class MyStrategy(BaseStrategy):
    def init(self):
        """Initialize your strategy parameters."""
        self.lookback = 20
    
    def next(self, current_data: Dict, portfolio: Dict[str, int]) -> List[Tuple[str, str, int]]:
        """Generate trading signals."""
        actions = []
        prices = current_data.get('prices', {})
        history = current_data.get('history', {})
        
        # Your trading logic here
        for code, price in prices.items():
            if code in history:
                df = history[code]
                # Analyze data and generate signals
                if should_buy:
                    actions.append(('buy', code, 10))
                elif should_sell:
                    shares = portfolio.get(code, 0)
                    if shares > 0:
                        actions.append(('sell', code, shares))
        
        return actions
```

### 2. Run Tournament

```bash
# Run with default settings
python run_tournament.py

# Run for specific date range
python run_tournament.py --start-date 2024-01-01 --end-date 2024-03-31

# Use mock data (offline)
python run_tournament.py --use-mock-data
```

## Strategy Interface

### `init()` Method

Called once when strategy is instantiated. Use this to initialize parameters:

```python
def init(self):
    self.lookback = 20
    self.threshold = 0.02
    self.max_position_size = 0.1  # 10% of portfolio
```

### `next()` Method

Called for each trading day. Must return a list of trading actions.

**Input Parameters:**
- `current_data['date']`: Current date (datetime.date)
- `current_data['prices']`: Current prices {code: price}
- `current_data['history']`: Historical OHLC DataFrames {code: DataFrame}
- `current_data['available_stocks']`: List of available stock codes
- `current_data['cash']`: Available cash
- `portfolio`: Current holdings {stock_code: shares}

**Return Value:**
List of `(action, stock_code, shares)` tuples:
- `action`: 'buy', 'sell', or 'hold'
- `stock_code`: Stock code (e.g., 'AAPL')
- `shares`: Number of shares (positive integer)

**Example:**
```python
return [
    ('buy', 'AAPL', 10),   # Buy 10 shares of AAPL
    ('sell', 'MSFT', 5),   # Sell 5 shares of MSFT
]
```

## Example Strategies

Three example strategies are included:

1. **BuyAndHoldStrategy**: Buys all stocks equally on first day, then holds
2. **MovingAverageStrategy**: Uses MA crossover (buy when price > MA, sell when price < MA)
3. **MomentumStrategy**: Buys stocks with positive momentum, sells those with negative

## Performance Metrics

Strategies are ranked by:
1. **Sharpe Ratio** (primary): Risk-adjusted return
2. **Total Return** (secondary): Overall return percentage

Additional metrics displayed:
- **CAGR**: Compound Annual Growth Rate
- **Max Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Ratio of gross profit to gross loss

## Tips

1. **Use Historical Data**: Access historical OHLC data via `current_data['history'][code]`
2. **Check Cash**: Always verify `current_data['cash']` before buying
3. **Check Positions**: Use `portfolio.get(code, 0)` to check current holdings
4. **Error Handling**: Wrap your logic in try-except to avoid crashes
5. **Test First**: Use `test_strategies.py` to test your strategy before tournament

## Troubleshooting

**Strategy not loading?**
- Ensure class inherits from `BaseStrategy`
- Check that `init()` and `next()` methods are implemented
- Verify file is in `strategies/` directory

**No trades executed?**
- Check that you're returning actions in correct format
- Verify cash is sufficient for buy orders
- Verify shares are available for sell orders

**Poor performance?**
- Review your trading logic
- Check that signals are being generated correctly
- Consider adding risk management (position sizing, stop-loss)
