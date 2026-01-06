# EPSILON – Stock Trading & Analytics Simulator

**EPSILON** (or **EPSILON TRADE**) is a quantitative stock trading simulator focused on precision, risk management, and post‑trade analytics.  
It combines realistic order execution, equity‑curve analysis, and optional AI‑assisted review into a single desktop application.

> Motto: **“Epsilon small, precision maximal.”**

## Screenshots

### Main Interface

![Main Interface](screenshots/main_interface.png)

*The main trading interface showing stock selection, portfolio management, K‑line charts, and performance metrics.*

## Feature Overview

### Core Trading Features

- **Real‑time / Mock Stock Data**: Supports both real market data (via `akshare`) and fully offline mock data generation.  
- **Buy / Sell Operations**: Execute trades with configurable transaction costs (fees and slippage).  
- **Portfolio Management**: Track holdings, cost basis, and P&L in real time.  
- **Trade History**: Complete record of all transactions with detailed fields.

### Advanced Order Types

- **Limit Orders**: Place buy/sell orders at specific price levels.  
- **Stop‑Loss Orders**: Automatically sell when price drops below a defined threshold.  
- **Take‑Profit Orders**: Automatically sell when price reaches a target profit.  
- **Pending Orders Management**: View and cancel outstanding orders in a dedicated panel.

### Performance Analytics

- **Equity Curve**: Visual representation of portfolio value over time.  
- **Performance Metrics** (via `analysis/performance.py`):  
  - Total Return & CAGR (Compound Annual Growth Rate)  
  - Sharpe Ratio (risk‑adjusted returns)  
  - Maximum Drawdown  
  - Win Rate & Profit Factor  
- **Real‑time Updates**: Metrics update automatically as trades are executed.

### Risk Management

- **Auto Trading Rules**:  
  - Stop‑loss protection (automatic liquidate when loss exceeds threshold)  
  - Scale in / scale out (gradual position adjustment around thresholds)  
- **Configurable Trading Costs**: Customize fee rates, minimum fee per trade, and slippage.  
- **Portfolio Diversification**: Manage multiple symbols simultaneously.

### Data & Visualization

- **K‑line Charts**: 60‑day candlestick charts with volume indicators.  
- **Historical Data**: Synthetic OHLC data generation for offline / mock‑only mode.  
- **News Events**: Simulate good/bad news events that affect stock prices.  
- **Date Navigation**: Step through historical dates to backtest behaviour.

### User Interface

- **Modern UI Option**: Optional CustomTkinter‑based components (via `ui/modern_ui.py`) for a more polished look.  
- **Stock Universe Management**: Customize the list of tradable symbols.  
- **Calendar Integration**: Quickly pick trading dates.  
- **Efficient Layout**: Panels organized for fast, keyboard‑and‑mouse driven workflows.

## Installation

### Prerequisites

- Python **3.12** (recommended) or Python 3.10+  
- `tkinter` (usually bundled with Python; on macOS, prefer the official installer from `python.org` if missing).

### Install Dependencies

Make sure `pip` matches the Python you intend to run:

```bash
python3.12 -m pip install -r requirements.txt
```

### Optional Dependencies

For real market data (instead of pure mock data):

```bash
pip install akshare
```

If `akshare` is not available, EPSILON will automatically fall back to **mock data mode**.

## Getting Started

### Run the Simulator

Recommended modern entry point:

```bash
python main.py
```

Legacy entry point (kept for backward compatibility):

```bash
python mock.py
```

On first launch you will be prompted to set your initial capital.

### Basic Workflow

1. **Select a date** using the calendar (defaults to today).  
2. **Choose a stock** from the universe list.  
3. **Enter shares** and click **Buy** or **Sell**.  
4. Observe updates in:  
   - Portfolio table  
   - Performance metrics panel  
   - Equity curve chart

### Placing Advanced Orders

1. Select a stock from the list.  
2. In the **Orders** panel:  
   - Choose **Side**: Buy or Sell  
   - Choose **Type**: Limit, Stop Loss, or Take Profit  
   - Enter **Price / Trigger**: target limit price or trigger price  
   - Enter **Shares**  
   - Click **Place Order**  
3. Orders will execute automatically when market price meets the specified conditions.

### Risk Configuration

Open **Trading Settings** to configure:

- Fee rate (fraction of trade value)  
- Minimum fee per trade  
- Slippage per share  
- Stop‑loss threshold (%)  
- Scale in / out thresholds and fractions

### Performance Tracking

The performance panel shows:

- **Total Return** – Overall portfolio return percentage  
- **CAGR** – Annualized return rate  
- **Sharpe Ratio** – Risk‑adjusted performance  
- **Max Drawdown** – Largest peak‑to‑trough decline  
- **Win Rate** – Percentage of profitable trades  
- **Profit Factor** – Gross profit / gross loss ratio  

The equity curve chart visualizes portfolio value over time.

## Configuration & Data Modes

### Mock Data Mode

By default, the simulator uses mock data if `akshare` is unavailable. To **force mock mode**:

```bash
export STOCK_SIM_USE_MOCK=1
python mock.py
```

### Custom Stock Universe

Create a `stock_list.json` in the project root:

```json
{
  "AAPL": "Apple Inc.",
  "MSFT": "Microsoft Corporation",
  "GOOGL": "Google LLC"
}
```

EPSILON will use this list as the tradable stock universe.

## AI Analysis & Export (EPSILON Review)

EPSILON includes an **AI‑assisted review pipeline** and export tools:

- **CSV exports** for trades, equity curve, and positions.  
- **Structured JSON** report with performance metrics.  
- **Human‑readable Markdown reports** summarizing your trading performance.  
- **AI Analysis** (via OpenAI / Google Gemini / Qwen) that turns statistics into actionable insights.

For detailed usage, see:

- `AI_ANALYSIS_GUIDE.md` – How to run exports and AI analysis, and what each report contains.  
- `AI_PROVIDERS_GUIDE.md` – How to choose and configure Qwen, Gemini, or OpenAI (with China‑friendly recommendations).

## Project Structure (Public Runtime)

The Python application is organized as follows:

```text
.
├── main.py                 # Recommended entry point
├── mock.py                 # Legacy entry point (still supported)
├── export_analysis.py      # Export & AI analysis helper
├── analysis/               # Performance metrics and equity curve logic
├── data/                   # Stock data management
├── trading/                # Trading and portfolio logic
├── ui/                     # UI helpers and modern UI wrapper
├── utils/                  # Logging, config, and shared utilities
├── tests/                  # Automated tests
└── docs/                   # Additional guides (UI migration, etc.)
```

For a more detailed breakdown intended specifically for GitHub users, see:

- `release/STRUCTURE.md`

> Note: The `website/` directory is a separate marketing/documentation site and **not required** to run EPSILON.

## Troubleshooting

### Matplotlib Not Available

If charts do not display:

```bash
pip install matplotlib
```

### No Stock Data

- Check internet connection if you expect live data via `akshare`.  
- Mock data mode works fully offline.  
- Verify that stock codes are valid for the selected mode.

### Orders Not Executing

- Ensure current price has actually reached your limit / trigger price.  
- Confirm you have sufficient **cash** (for buys) or **shares** (for sells).  
- Check order status in the orders table.

For AI‑related issues (API keys, regional restrictions, quotas), refer to:

- `AI_ANALYSIS_GUIDE.md`  
- `AI_PROVIDERS_GUIDE.md`

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for:

- New order types  
- New analytics or visualizations  
- UI/UX improvements  
- Documentation and examples

## License

This project is open source and available under the **MIT License**.

## Acknowledgments

- Uses [`akshare`](https://github.com/akfamily/akshare) for optional real market data.  
- Built with Python, Tkinter, Matplotlib, and optional CustomTkinter for modern UI components.
