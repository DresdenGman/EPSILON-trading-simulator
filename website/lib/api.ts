const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("epsilon_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; username: string; password: string }) =>
    request<{ id: number; email: string; username: string }>("/api/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string }>("/api/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () =>
    request<{ id: number; email: string; username: string }>("/api/me"),

  // Account & Portfolio
  getAccount: () =>
    request<{ id: number; cash: number; initial_capital: number; total_value: number; total_pnl: number }>("/api/account"),
  getPortfolio: () =>
    request<PortfolioPosition[]>("/api/portfolio"),
  getPerformance: () =>
    request<PerformanceData>("/api/portfolio/performance"),
  getEquityCurve: () =>
    request<{ dates: string[]; equity: number[]; initial_capital: number }>("/api/portfolio/equity"),
  getTradeHistory: () =>
    request<TradeRecord[]>("/api/trades/history"),

  // Trading
  buy: (data: { stock_code: string; shares: number; price: number }) =>
    request<{ success: boolean; message: string }>("/api/trade/buy", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sell: (data: { stock_code: string; shares: number; price: number }) =>
    request<{ success: boolean; message: string }>("/api/trade/sell", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  placeOrder: (data: {
    stock_code: string;
    order_type: string;
    side: string;
    shares: number;
    price?: number;
    trigger_price?: number;
  }) =>
    request<{ success: boolean; message: string }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  cancelOrder: (id: number) =>
    request<{ success: boolean; message: string }>(`/api/orders/${id}`, {
      method: "DELETE",
    }),
  getOrders: (status?: string) =>
    request<Order[]>("/api/orders" + (status ? `?status=${status}` : "")),

  // Market Data
  getStockPrices: (codes?: string) =>
    request<StockPrice[]>("/api/market/prices" + (codes ? `?codes=${codes}` : "")),
  getStockUniverse: () =>
    request<{ stocks: { code: string; name: string; exchange: string }[] }>("/api/market/universe"),
  getKline: (code: string, days: number = 60) =>
    request<KlineData>(`/api/market/kline/${code}?days=${days}`),

  // Analysis
  spectralAnalysis: (prices: number[]) =>
    request<SpectralResult>("/api/analysis/spectral", {
      method: "POST",
      body: JSON.stringify({ prices }),
    }),
  backtest: (data: BacktestRequest) =>
    request<BacktestResult>("/api/backtest", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getBacktestStrategies: () =>
    request<{ strategies: { name: string; label: string }[] }>("/api/backtest/strategies"),

};

export interface PortfolioPosition {
  stock_code: string;
  shares: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
}

export interface PerformanceData {
  total_value: number;
  cash: number;
  total_return: number;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  unrealized_pnl: number;
}

export interface TradeRecord {
  id: number;
  stock_code: string;
  trade_type: string;
  shares: number;
  price: number;
  total_amount: number;
  fee: number;
  trade_date: string;
}

export interface Order {
  id: number;
  stock_code: string;
  order_type: string;
  side: string;
  shares: number;
  price: number | null;
  trigger_price: number | null;
  status: string;
  created_at: string;
}

export interface StockPrice {
  code: string;
  name: string;
  price: number;
  change_percent: number;
}

export interface KlineData {
  code: string;
  name: string;
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

export interface SpectralResult {
  frequencies: number[];
  powers: number[];
  dominant_period: number;
  significant_periods: number[];
  weekly_power: number;
  monthly_power: number;
  quarterly_power: number;
}

export interface BacktestRequest {
  strategy: string;
  start_date: string;
  end_date: string;
  stock_codes?: string[];
  initial_cash?: number;
}

export interface BacktestResult {
  strategy_name: string;
  performance: {
    total_return: number;
    cagr: number;
    sharpe: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
  };
  trades: { date: string; stock_code: string; trade_type: string; shares: number; price: number }[];
  equity_curve: { date: string; equity: number }[];
}
