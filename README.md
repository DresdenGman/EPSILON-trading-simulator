<p align="center">
  <img src="https://img.shields.io/badge/status-live-success?style=flat" alt="Live">
  <img src="https://img.shields.io/github/license/DresdenGman/EPSILON-trading-simulator?style=flat" alt="License">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js&style=flat" alt="Next.js">
  <img src="https://img.shields.io/badge/Python-3.13-blue?logo=python&style=flat" alt="Python">
  <img src="https://img.shields.io/badge/daisyUI-4-5B0AD?logo=daisyui&style=flat" alt="daisyUI">
</p>

<h1 align="center">EPSILON — Stock Trading Simulator</h1>
<p align="center"><strong>Trade Smarter. Analyze Deeper.</strong></p>
<p align="center">Institutional-grade stock trading simulator and quantitative education platform — now on the web.</p>

<p align="center">
  <a href="https://epsilon-livid.vercel.app"><strong>🌐 Live Demo</strong></a> ·
  <a href="https://epsilon-livid.vercel.app/auth/register"><strong>🚀 Try It Free</strong></a> ·
  <a href="#features"><strong>📋 Features</strong></a> ·
  <a href="#quick-start"><strong>⚡ Quick Start</strong></a>
</p>

---

## 📖 What is EPSILON?

EPSILON is a full-stack stock trading simulator that brings the power of a desktop quant platform to the browser. Practice trading with **real-time simulated market data**, run **backtests**, get **AI-powered strategy analysis**, and learn quantitative trading — all without risking real money.

Originally a Python/Tkinter desktop application, EPSILON has been migrated to a modern web stack: **Next.js frontend** + **FastAPI backend** + **PostgreSQL**.

| | Desktop (v0) | Web (v1) |
|---|---|---|
| UI | Tkinter/CustomTkinter | Next.js + Tailwind + daisyUI + Framer Motion |
| Charts | mplfinance | lightweight-charts + recharts |
| AI | Ollama (local) | DeepSeek API (cloud) + Tavily Search |
| Database | SQLite | PostgreSQL (Railway) |
| Deployment | PyInstaller DMG | Vercel + Railway |
| Target | macOS desktop | Any device with a browser |

---

## ✨ Features

### 📊 Live Trading Simulator
- **15 US stocks** with real-time price simulation
- **Market / Limit / Stop Loss / Take Profit** order types
- **Portfolio tracking** with real-time P&L
- **Equity curve** visualization
- **Trade history** and performance metrics (CAGR, Sharpe, Win Rate, Drawdown)

### 📈 Advanced Analytics
- **Candlestick charts** via lightweight-charts (TradingView library)
- **FFT spectral analysis** for cycle detection
- **Backtesting engine** with 3 built-in strategies (Buy & Hold, Moving Average, Momentum)

### 🤖 AI Strategy Advisor
- **DeepSeek API** integration for real-time strategy analysis
- **Streaming chat** interface with markdown support
- **Tavily Search** for web evidence gathering (optional)

### 🎨 Professional Design
- Brittany Chiang-inspired **navy dark theme**
- **Canvas particle background** with mouse interaction
- **Framer Motion** mouse-tracking card effects
- **Neumorphic cards** + staggered entrance animations
- **Offset shadow buttons** for satisfying tactile feedback
- **Dark/Light theme** toggle
- **daisyUI** component system with custom theme

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                  User's Browser                   │
│         Next.js 14 (React + TypeScript)          │
│      Tailwind CSS + daisyUI + Framer Motion       │
└───────────────┬─────────────────────────────────┘
                │  REST API
                ▼
┌─────────────────────────────────────────────────┐
│         FastAPI Backend (Python 3.13)            │
│     Trade Engine / Backtest / Spectral Analysis  │
│         SQLAlchemy + Pydantic v2                 │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│       PostgreSQL (Railway) / SQLite (local)      │
│         User accounts, trades, orders            │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and pip
- PostgreSQL (optional for production; SQLite works locally)

### Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Frontend (Next.js)

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the frontend auto-connects to `localhost:8000`.

### Database Setup (optional)

```bash
cd website
createdb epsilon_web            # Create PostgreSQL database
npx prisma db push              # Apply schema
npx tsx prisma/seed.ts          # Seed demo data
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, React 18 |
| **Styling** | Tailwind CSS 3, daisyUI 4, Framer Motion |
| **Charts** | lightweight-charts 5, recharts 2 |
| **Auth** | NextAuth v5 (GitHub OAuth) + JWT |
| **ORM** | Prisma 5 |
| **Backend** | FastAPI, Python 3.13, SQLAlchemy |
| **Validation** | Pydantic v2, Zod 4 |
| **AI** | Vercel AI SDK, DeepSeek API, Tavily Search |
| **Database** | PostgreSQL (production), SQLite (development) |
| **Deployment** | Vercel (frontend), Railway (backend) |

---

## 📸 Screenshots

| Welcome Page | Trading Dashboard |
|:---:|:---:|
| ![Welcome](public/screenshots/main_interface.png) | ![Dashboard](public/screenshots/main_interface.png) |

---

## 🔗 Links

- **Live Website**: [epsilon-livid.vercel.app](https://epsilon-livid.vercel.app)
- **Backend API**: `https://api-production-2b871.up.railway.app`
- **API Docs**: `https://api-production-2b871.up.railway.app/docs`

---

## 📄 License

MIT © 2026 Dresden E. Goehner

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/DresdenGman">Dresden G</a></sub>
</p>
