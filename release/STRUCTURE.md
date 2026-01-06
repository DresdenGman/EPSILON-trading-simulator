# EPSILON / EPSILON TRADE – Public Package Structure

This document describes the structure of the **Python desktop application** that is intended to be used by GitHub users.

EPSILON (or **EPSILON TRADE**) is a quant‑oriented stock trading simulator with advanced order types, equity‑curve analytics, and optional AI‑assisted review.

> The **website source code** (`website/` and its contents) is a separate, private marketing site and **is not part of the public release**. You can completely ignore it when running or modifying the simulator.

## Main Application Layout

At the repository root:

```text
project-root/
├── main.py
├── mock.py
├── export_analysis.py
├── stock_data.json
├── trade_data.json
├── stock_events.json
├── requirements.txt
├── stock_simulator.spec
├── analysis/
├── data/
├── trading/
├── ui/
├── utils/
├── tests/
└── docs/
```

### Core Entry Points

- `main.py`  
  Recommended modern entry point. Initializes logging and launches the GUI.

- `mock.py`  
  Original monolithic entry point, kept for backward compatibility. Still fully usable.

### Core Modules

- `data/` – Stock data loading and management  
  - `stock_data_manager.py`: Handles loading, caching, and serving stock price data.

- `trading/` – Trading logic  
  - `trade_manager.py`: Order execution, portfolio state, cash management, trade history.

- `analysis/` – Performance analytics  
  - `performance.py`: Equity curve construction and performance metrics (CAGR, Sharpe, max drawdown, win rate, profit factor, etc.).

- `ui/` – User interface helpers  
  - `modern_ui.py`: Optional CustomTkinter‑based modern UI wrapper and matplotlib theming.

- `utils/` – Utilities  
  - `logger.py`: Central logging configuration and helpers.  
  - `config.py`: Configuration management (defaults, UI config, trading config).

- `tests/` – Automated tests  
  - `test_trade_manager.py`  
  - `test_stock_data_manager.py`

### Data & Configuration Files

- `stock_data.json` – Cached stock prices (auto‑generated / updated).  
- `trade_data.json` – Trade records and account snapshot (auto‑generated).  
- `stock_events.json` – Optional simulated news events.  
- `requirements.txt` – Python dependencies for running the simulator.  
- `stock_simulator.spec` – PyInstaller spec for building standalone executables.

## Website Directory (Private / Not Part of Release)

- `website/`  
  Contains the marketing / documentation site (Next.js, React, Tailwind CSS, etc.).

This directory is **not required** to run the Python simulator and is **not part of the public "runtime package"**. You do not need it to:

- Run EPSILON locally  
- Build desktop executables  
- Use AI analysis or export features

If you only care about the trading simulator:

- Focus on: `main.py`, `mock.py`, `analysis/`, `data/`, `trading/`, `ui/`, `utils/`, `export_analysis.py`, `requirements.txt`, and the docs.  
- You can safely ignore `website/` entirely.

## Related Documentation

- `README.md` – High‑level overview, installation, and usage for EPSILON.  
- `AI_ANALYSIS_GUIDE.md` – How to use the AI analysis and export features.  
- `AI_PROVIDERS_GUIDE.md` – Choosing and configuring AI providers (Qwen, Gemini, OpenAI).  
- `BUILD_INSTRUCTIONS.md` – Building distributable executables with PyInstaller.  
- `DEVELOPMENT.md` – Project architecture and refactor notes.  
- `docs/UI_GUIDE.md` – Migrating the UI to a modern CustomTkinter‑based look.


