# Stock Trading Simulator

A comprehensive stock trading simulation platform with advanced features including equity curve analysis, limit orders, stop-loss/take-profit orders, and real-time performance metrics.

## Screenshots

### Main Interface
![Main Interface](screenshots/main_interface.png)

*The main trading interface showing stock selection, portfolio management, K-line charts, and performance metrics*

## Features

### Core Trading Features
- **Real-time Stock Data**: Support for both real market data (via akshare) and mock data generation
- **Buy/Sell Operations**: Execute trades with configurable transaction costs (fees, slippage)
- **Portfolio Management**: Track holdings, costs, and profit/loss in real-time
- **Trade History**: Complete record of all transactions with detailed information

### Advanced Order Types
- **Limit Orders**: Place buy/sell orders at specific price levels
- **Stop-Loss Orders**: Automatically sell when price drops below threshold
- **Take-Profit Orders**: Automatically sell when price reaches target profit
- **Pending Orders Management**: View and cancel pending orders

### Performance Analytics
- **Equity Curve**: Visual representation of portfolio value over time
- **Performance Metrics**:
  - Total Return & CAGR (Compound Annual Growth Rate)
  - Sharpe Ratio (risk-adjusted returns)
  - Maximum Drawdown
  - Win Rate & Profit Factor
- **Real-time Updates**: Metrics update automatically as trades are executed

### Risk Management
- **Auto Trading Rules**:
  - Stop-loss protection (automatic sell on loss threshold)
  - Scale in/out (gradual position adjustment)
- **Configurable Trading Costs**: Customize fee rates, minimum fees, and slippage
- **Portfolio Diversification**: Manage multiple stocks simultaneously

### Data & Visualization
- **K-line Charts**: 60-day candlestick charts with volume indicators
- **Historical Data**: Synthetic OHLC data generation for offline use
- **News Events**: Simulate market events (good/bad news) affecting stock prices
- **Date Navigation**: Backtest by navigating through historical dates

### User Interface
- **Modern UI**: Clean, intuitive interface with organized panels
- **Stock Universe Management**: Customize the list of tradable stocks
- **Calendar Integration**: Easy date selection for historical trading
- **Responsive Layout**: Efficient use of screen space with organized panels

### The Quant Arena: Algorithmic Trading Tournament
- **Strategy Interface**: Standardized base class for implementing trading strategies
- **Automated Backtesting**: Run strategies on historical data with configurable parameters
- **Tournament Engine**: Batch test multiple strategies and generate rankings
- **Performance Ranking**: Strategies ranked by risk-adjusted metrics (Sharpe Ratio, CAGR, Max Drawdown)
- **Example Strategies**: Included examples (Buy & Hold, Moving Average, Momentum)
- **Extensible Design**: Easy to add custom strategies by inheriting from `BaseStrategy`

### Spectral Analysis (频谱分析)
- **FFT-Based Frequency Analysis**: Analyze price time series in frequency domain using Fast Fourier Transform
- **Cycle Detection**: Automatically identify dominant trading cycles (e.g., 30-day cycle, 7-day cycle)
- **Visual Spectrum Chart**: Interactive power spectrum visualization showing frequency components
- **Period Identification**: Human-readable period descriptions (days, weeks, months, years)
- **Easy Access**: Click 📈 button in main interface to analyze current stock

### Stress Testing (压力测试) - Complete Implementation
- **Stage 1 - Jump Diffusion Model**: Randomly introduces extreme price movements (black swan events)
- **Stage 2 - Extreme Value Distribution**: Uses statistical methods (GEV/Pareto) to generate tail risk
- **Stage 3 - Quantile Regression**: Machine learning-based prediction of extreme quantiles
- **Configurable Parameters**: Adjustable jump probability, sizes, distribution types, and ML settings
- **Realistic Stress Scenarios**: Simulates flash crashes, market panics, and sudden shocks
- **Easy Configuration**: Access via Trading Settings → Stress Test Settings
- **Strategy Testing**: Test how strategies perform under extreme market conditions

## Installation

### Prerequisites
- Python 3.12 (recommended)
- tkinter (usually included with Python; on macOS prefer the official python.org installer if tkinter is missing)

### Dependencies

Install required packages (make sure pip matches the Python you will run):

```bash
python3.12 -m pip install -r requirements.txt
```

This will install the following packages:
- **pandas** (>=1.3.0) - Data manipulation and analysis
- **numpy** (>=1.20.0) - Numerical computing
- **tkcalendar** (>=1.6.0) - Calendar widget for date selection
- **matplotlib** (>=3.3.0) - Chart visualization (optional but recommended)
- **mplfinance** (>=0.12.0) - Professional candlestick charts for K-line visualization (optional but recommended)

### Optional Dependencies

For real market data (optional):
```bash
pip install akshare
```

**Note**: `akshare` is not included in `requirements.txt` by default. If `akshare` is not available, the simulator will automatically use mock data mode.

### Complete Installation Command

To install all dependencies including optional ones:

```bash
# Install core dependencies
python3.12 -m pip install -r requirements.txt

# Install real market data support (optional)
pip install akshare
```

## Usage

### Basic Usage

1. Run the simulator:
```bash
python3.12 mock.py
```

2. On first launch, you'll be prompted to set your initial capital.

3. Select a date using the calendar (defaults to today).

4. Choose a stock from the list.

5. Enter the number of shares and click "Buy" or "Sell".

### Placing Orders

1. Select a stock from the list.
2. In the "Orders" panel:
   - Choose **Side**: Buy or Sell
   - Choose **Type**: Limit, Stop Loss, or Take Profit
   - Enter **Price/Trigger**: Target price for limit orders, trigger price for stop/take-profit
   - Enter **Shares**: Number of shares
   - Click **Place Order**

3. Orders will execute automatically when conditions are met (price reaches limit/trigger).

### Managing Risk

Access **Trading Settings** to configure:
- Fee rate (as fraction of trade value)
- Minimum fee per trade
- Slippage per share
- Stop-loss threshold (%)
- Scale in/out thresholds and fractions

### Performance Tracking

View your performance metrics in the left panel:
- **Total Return**: Overall portfolio return percentage
- **CAGR**: Annualized return rate
- **Sharpe Ratio**: Risk-adjusted performance
- **Max Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Ratio of gross profit to gross loss

The equity curve chart shows your portfolio value over time.

## The Quant Arena: Strategy Tournament

### Overview

The Quant Arena is a platform for algorithmic trading strategy competitions. It allows you to:
- Implement custom trading strategies using a standardized interface
- Backtest strategies on historical data
- Run tournaments to compare multiple strategies
- Rank strategies by risk-adjusted performance metrics (Sharpe Ratio)

### Creating a Strategy

To create your own strategy, create a Python file in the `strategies/` directory and inherit from `BaseStrategy`:

```python
from strategies.base_strategy import BaseStrategy
from typing import Dict, List, Tuple

class MyStrategy(BaseStrategy):
    def init(self):
        """Initialize your strategy parameters."""
        self.lookback = 20
        self.threshold = 0.02
    
    def next(self, current_data: Dict, portfolio: Dict[str, int]) -> List[Tuple[str, str, int]]:
        """Generate trading signals.
        
        Args:
            current_data: Contains 'date', 'prices', 'history', 'available_stocks', 'cash'
            portfolio: Current holdings {stock_code: shares}
        
        Returns:
            List of (action, stock_code, shares) tuples
            - action: 'buy', 'sell', or 'hold'
            - stock_code: Stock code (e.g., 'AAPL')
            - shares: Number of shares (positive integer)
        """
        actions = []
        prices = current_data.get('prices', {})
        history = current_data.get('history', {})
        
        for code, price in prices.items():
            if code not in history:
                continue
            
            # Your trading logic here
            df = history[code]
            # ... analyze data and generate signals ...
            
            if should_buy:
                actions.append(('buy', code, 10))
            elif should_sell:
                current_shares = portfolio.get(code, 0)
                if current_shares > 0:
                    actions.append(('sell', code, current_shares))
        
        return actions
```

### Running a Tournament

Use the command-line tool to run a tournament:

```bash
# Run with default settings (last 60 days)
python run_tournament.py

# Run for specific date range
python run_tournament.py --start-date 2024-01-01 --end-date 2024-03-31

# Use mock data (for offline testing)
python run_tournament.py --use-mock-data

# Custom strategies directory
python run_tournament.py --strategies-dir my_strategies
```

The tournament will:
1. Discover all strategy classes in the strategies directory
2. Run each strategy on the same historical data
3. Calculate performance metrics (Sharpe Ratio, CAGR, Max Drawdown, etc.)
4. Rank strategies by Sharpe Ratio (primary) and Total Return (secondary)
5. Display results in a formatted table

### Example Strategies

The project includes three example strategies in `strategies/example_strategy.py`:

1. **BuyAndHoldStrategy**: Buys equal amounts of all stocks on the first day and holds
2. **MovingAverageStrategy**: Uses moving average crossover (buy when price > MA, sell when price < MA)
3. **MomentumStrategy**: Buys stocks with positive momentum, sells those with negative momentum

### Performance Metrics

Strategies are ranked using the following metrics:

- **Sharpe Ratio**: Risk-adjusted return (annualized). Higher is better. Primary ranking metric.
- **Total Return**: Overall return percentage. Secondary ranking metric.
- **CAGR**: Compound Annual Growth Rate
- **Max Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Ratio of gross profit to gross loss

### Strategy Interface Details

The `next()` method receives:

- `current_data['date']`: Current trading date (datetime.date)
- `current_data['prices']`: Current prices for all stocks {code: price}
- `current_data['history']`: Historical OHLC DataFrames {code: DataFrame}
- `current_data['available_stocks']`: List of available stock codes
- `current_data['cash']`: Current available cash
- `portfolio`: Current holdings {stock_code: number_of_shares}

The method should return a list of trading actions. Each action is a tuple:
- `('buy', 'AAPL', 10)`: Buy 10 shares of AAPL
- `('sell', 'MSFT', 5)`: Sell 5 shares of MSFT
- `[]`: Hold (no action)

## Spectral Analysis (频谱分析)

### Overview

Spectral analysis uses Fast Fourier Transform (FFT) to analyze stock price time series in the frequency domain, identifying dominant trading cycles and periodic patterns.

### Using Spectral Analysis

1. **Open the Analysis Window**:
   - Select a stock from the stock list
   - Click the 📈 button in the main interface toolbar
   - The spectral analysis window will open

2. **Run Analysis**:
   - Click "🔍 开始分析" (Start Analysis) button
   - The system will analyze the last 365 days of price data
   - Results will show dominant cycles and display a power spectrum chart

3. **Understanding Results**:
   - **主要交易周期** (Dominant Cycles): Top 5 most significant cycles identified
   - **周期描述**: Human-readable format (e.g., "30天周期", "2.5周周期")
   - **频率**: Frequency in cycles per day
   - **功率占比**: Percentage of total power in the spectrum
   - **频谱图**: Visual representation of power spectrum with marked dominant cycles

### Example Output

```
🎯 主要交易周期:

1. 30天周期 (30.00天)
   频率: 0.033333 周期/天
   功率占比: 15.23%

2. 7天周期 (7.00天)
   频率: 0.142857 周期/天
   功率占比: 8.45%
```

### Technical Details

- **Data Window**: Uses 365 days of historical data for better frequency resolution
- **Period Range**: Analyzes cycles from 2 days to 365 days
- **Window Function**: Applies Hanning window to reduce spectral leakage
- **Detrending**: Removes DC component (mean) before FFT analysis

### Use Cases

- **Cycle Detection**: Identify recurring patterns in stock prices
- **Strategy Development**: Use cycle information to time entries/exits
- **Market Research**: Understand periodic behavior in different stocks
- **Risk Management**: Identify potential cyclical risks

## Stress Testing (压力测试)

### Overview

Stress testing generates extreme market scenarios (black swan events) to test how trading strategies perform under adverse conditions. This is essential for evaluating strategy robustness and risk tolerance.

### Stage 1: Jump Diffusion Model

The jump diffusion model adds random extreme price movements to normal price fluctuations, simulating events like flash crashes, sudden market shocks, or panic selling.

### Stage 2: Extreme Value Distribution

The extreme value distribution uses statistical methods (GEV or Pareto distributions) to generate realistic tail risk scenarios. This provides more accurate modeling of rare but possible extreme events compared to simple threshold-based approaches.

### Using Stress Testing

1. **Open Settings**:
   - Click "Trading Settings" button in the main interface
   - Click "Stress Test Settings" button in the settings dialog

2. **Configure Parameters**:
   - **Enable Stress Testing**: Toggle to enable/disable
   
   **Stage 1 - Jump Diffusion:**
   - **Jump Probability**: Probability of a jump event (e.g., 0.02 = 2%)
   - **Jump Sizes**: List of jump magnitudes (e.g., -0.20, -0.15, -0.10 for -20%, -15%, -10% crashes)
   - **Jump Direction**: Choose "down" (crashes), "up" (surges), or "both"
   
**Stage 2 - Extreme Value Distribution:**
- **Extreme Probability**: Probability of extreme value event (e.g., 0.01 = 1%)
- **Distribution Type**: Choose "GEV" (Generalized Extreme Value), "Pareto", or "Simple"
- **Extreme Threshold**: Threshold for extreme events (e.g., -0.15 for -15%)

**Stage 3 - Quantile Regression:**
- **Enable Quantile Regression**: Toggle to enable machine learning-based prediction
- **Quantile Level**: Quantile level to predict (e.g., 0.01 for 1% tail risk)

3. **Apply Settings**:
   - Click "Save" to apply settings
   - **Important**: You need to reload stock data for changes to take effect

### Example Configuration

- **Moderate Stress**: 2% probability, jumps of -15%, -10%, -5%
- **Aggressive Stress**: 5% probability, jumps of -25%, -20%, -15%, -10%
- **Custom**: Adjust based on your testing needs

### Use Cases

- **Strategy Robustness**: Test how strategies handle extreme market conditions
- **Risk Assessment**: Identify maximum potential losses under stress
- **Strategy Optimization**: Find and fix vulnerabilities before real trading
- **Educational**: Understand the impact of black swan events on portfolios

### Technical Details

**Stage 1 - Jump Diffusion:**
- **Model**: Jump diffusion (Merton model)
- **Method**: Random jumps added to normal price movements
- **Use Case**: Simulating flash crashes and sudden shocks

**Stage 2 - Extreme Value Distribution:**
- **Models**: 
  - **GEV (Generalized Extreme Value)**: Heavy-tailed distribution for extreme events
  - **Pareto**: Power-law distribution for tail risk
  - **Simple**: Threshold-based fallback (no scipy required)
- **Method**: Statistical distributions generate realistic tail scenarios
- **Use Case**: Modeling rare but possible extreme market conditions
- **Dependencies**: scipy optional (manual implementation available)

**Stage 3 - Quantile Regression:**
- **Model**: Machine learning-based quantile prediction
- **Method**: Uses technical indicators and market features to predict extreme quantiles
- **Features**: Mean return, volatility, momentum, price position, drawdown, volatility trend
- **Use Case**: Intelligent prediction of extreme scenarios based on current market state
- **Dependencies**: scikit-learn optional (simple statistical fallback available)
- **Training**: Can be trained on historical data for improved accuracy

**General:**
- **Integration**: Applied to both single-day data and historical series
- **Reproducibility**: Uses deterministic seeds for consistent results
- **Default**: Disabled by default (enable when needed)
- **Compatibility**: Works without scipy (uses manual implementations)

## Project Structure

```
stock-trading-simulator/
├── mock.py                  # Main desktop application file
├── main.py                  # Alternative entry point
├── requirements.txt         # Python dependencies
├── README.md                # This file
│
├── analysis/                # Performance analysis modules
│   ├── __init__.py
│   ├── performance.py        # Performance metrics
│   └── spectral.py           # FFT-based spectral analysis
│
├── data/                    # Data management modules
│   ├── __init__.py
│   └── stock_data_manager.py
│
├── trading/                 # Trading logic modules
│   ├── __init__.py
│   └── trade_manager.py
│
├── strategies/              # Algorithmic trading strategies
│   ├── __init__.py
│   ├── base_strategy.py     # Base class for all strategies
│   ├── example_strategy.py  # Example strategies
│   ├── backtest_engine.py  # Backtest engine
│   └── tournament_engine.py # Tournament engine
│
├── run_tournament.py        # Command-line tournament runner
│
├── utils/                   # Utility modules
│   ├── __init__.py
│   ├── config.py
│   └── logger.py
│
├── website/                 # Next.js website (see website/README.md)
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── public/             # Static assets
│   ├── package.json        # Node.js dependencies
│   └── README.md           # Website-specific README
│
└── screenshots/            # Project screenshots
```

**Note**: JSON data files (`stock_data.json`, `trade_data.json`, etc.) are auto-generated and excluded from git.

## Configuration

### Mock Data Mode

By default, the simulator uses mock data if `akshare` is unavailable. To force mock mode:

```bash
export STOCK_SIM_USE_MOCK=1
python mock.py
```

### Custom Stock Universe

Create `stock_list.json` in the same directory:

```json
{
  "AAPL": "Apple Inc.",
  "MSFT": "Microsoft Corporation",
  "GOOGL": "Google LLC"
}
```

## Features in Detail

### Equity Curve Analysis
The equity curve tracks your portfolio value over time, allowing you to:
- Visualize performance trends
- Identify periods of drawdown
- Assess strategy effectiveness

### Order Execution Logic
- **Limit Orders**: Execute when market price reaches or exceeds your limit price
- **Stop-Loss**: Triggers when price falls to or below trigger price
- **Take-Profit**: Triggers when price rises to or above trigger price

Orders are checked automatically when:
- Stock data is loaded
- Date changes
- Manual refresh occurs

### Auto Trading Rules
Configure automatic trading based on:
- **Stop-Loss**: Sell entire position if loss exceeds threshold
- **Scale Out**: Sell portion of position when profit reaches threshold
- **Scale In**: Buy more shares when loss reaches threshold (but before stop-loss)

## Troubleshooting

### Matplotlib Not Available
If charts don't display, install matplotlib (should already be included via `requirements.txt`):
```bash
pip install matplotlib
```

**Note**: Matplotlib is listed in `requirements.txt` as an optional but recommended dependency. If you skipped installing it, you can install it separately using the command above.

### No Stock Data
- Check internet connection if using real data
- Mock data mode will work offline
- Verify stock codes are valid (for real data mode)

### Orders Not Executing
- Ensure current stock price has reached trigger/limit price
- Check that you have sufficient cash (for buy orders) or shares (for sell orders)
- Verify order status in the orders table

## Website Deployment

This project includes a Next.js website in the `website/` directory. To deploy the website:

### Prerequisites
- Node.js 18+ and npm
- A Vercel account (recommended) or other hosting platform

### Deploy to Vercel (Recommended)

1. **Connect to GitHub**:
   - Push your code to GitHub (if not already done)
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Root Directory: Set to `website`
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

3. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your site
   - Your site will be available at `your-project.vercel.app`

4. **Automatic Deployments**:
   - Every push to `main` branch will trigger a new deployment
   - Preview deployments are created for pull requests

### Manual Deployment

If you prefer to deploy manually:

```bash
cd website
npm install
npm run build
npm start
```

### Environment Variables

No environment variables are required for basic deployment. The website works out of the box.

### Custom Domain

To use a custom domain:
1. Go to your project settings in Vercel Dashboard
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

For more details, see `website/README.md`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Uses [akshare](https://github.com/akfamily/akshare) for real market data (optional)
- Built with Python, tkinter, and matplotlib

## Future Enhancements

Potential features for future versions:
- Technical indicators overlay (MA, MACD, RSI) on K-line charts
- Trade record export/import (CSV/JSON)
- Multiple account support
- Dark/light theme toggle
- Extended order types (trailing stops, OCO orders)

