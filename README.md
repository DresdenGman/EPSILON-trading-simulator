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

## Installation

### Prerequisites
- Python 3.12 (recommended)
- tkinter (usually included with Python; on macOS prefer the official python.org installer if tkinter is missing)

### Dependencies

Install required packages (make sure pip matches the Python you will run):

```bash
python3.12 -m pip install -r requirements.txt
```

### Optional Dependencies

For real market data (optional):
```bash
pip install akshare
```

If `akshare` is not available, the simulator will automatically use mock data mode.

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
│   └── performance.py
│
├── data/                    # Data management modules
│   ├── __init__.py
│   └── stock_data_manager.py
│
├── trading/                 # Trading logic modules
│   ├── __init__.py
│   └── trade_manager.py
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
If charts don't display, install matplotlib:
```bash
pip install matplotlib
```

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

