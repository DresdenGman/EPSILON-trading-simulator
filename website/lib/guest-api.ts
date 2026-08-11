import type {
  BacktestRequest,
  BacktestResult,
  KlineData,
  Order,
  PerformanceData,
  PortfolioPosition,
  SpectralResult,
  StockPrice,
  TradeRecord,
} from "@/lib/api";

const STORAGE_KEY = "epsilon.guest-session.v1";
const INITIAL_CASH = 100_000;

const MARKET: StockPrice[] = [
  { code: "AAPL", name: "Apple", price: 228.41, change_percent: 1.24 },
  { code: "MSFT", name: "Microsoft", price: 418.79, change_percent: 0.63 },
  { code: "NVDA", name: "NVIDIA", price: 182.73, change_percent: 2.18 },
  { code: "GOOGL", name: "Alphabet", price: 196.52, change_percent: -0.41 },
  { code: "AMZN", name: "Amazon", price: 224.18, change_percent: 0.87 },
  { code: "TSLA", name: "Tesla", price: 338.09, change_percent: -1.56 },
];

type GuestPosition = { shares: number; avgCost: number };
type GuestState = {
  cash: number;
  positions: Record<string, GuestPosition>;
  trades: TradeRecord[];
  orders: Order[];
  nextTradeId: number;
  nextOrderId: number;
  equity: { date: string; value: number }[];
};

function initialState(): GuestState {
  return {
    cash: INITIAL_CASH,
    positions: {},
    trades: [],
    orders: [],
    nextTradeId: 1,
    nextOrderId: 1,
    equity: [{ date: new Date().toISOString(), value: INITIAL_CASH }],
  };
}

function readState(): GuestState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const value = JSON.parse(raw) as Partial<GuestState>;
    if (!Number.isFinite(value.cash) || !value.positions || !Array.isArray(value.trades) || !Array.isArray(value.orders)) {
      return initialState();
    }
    return {
      cash: Number(value.cash),
      positions: value.positions as Record<string, GuestPosition>,
      trades: value.trades,
      orders: value.orders,
      nextTradeId: Number.isInteger(value.nextTradeId) ? Number(value.nextTradeId) : value.trades.length + 1,
      nextOrderId: Number.isInteger(value.nextOrderId) ? Number(value.nextOrderId) : value.orders.length + 1,
      equity: Array.isArray(value.equity) && value.equity.length > 0 ? value.equity : initialState().equity,
    };
  } catch {
    return initialState();
  }
}

function writeState(state: GuestState) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function marketPrice(code: string) {
  return MARKET.find((stock) => stock.code === code)?.price;
}

function deterministicUnit(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 2001) / 1000 - 1;
}

function portfolio(state: GuestState): PortfolioPosition[] {
  return Object.entries(state.positions)
    .filter(([, position]) => position.shares > 0)
    .map(([stock_code, position]) => {
      const current_price = marketPrice(stock_code) ?? position.avgCost;
      const market_value = current_price * position.shares;
      return {
        stock_code,
        shares: position.shares,
        avg_cost: position.avgCost,
        current_price,
        market_value,
        unrealized_pnl: market_value - position.avgCost * position.shares,
      };
    });
}

function totalValue(state: GuestState) {
  return state.cash + portfolio(state).reduce((sum, position) => sum + position.market_value, 0);
}

function performance(state: GuestState): PerformanceData {
  const positions = portfolio(state);
  const value = totalValue(state);
  const wins = state.trades.filter((trade) => trade.trade_type === "sell" && trade.price >= (state.positions[trade.stock_code]?.avgCost ?? 0)).length;
  const sells = state.trades.filter((trade) => trade.trade_type === "sell").length;
  return {
    total_value: value,
    cash: state.cash,
    total_return: ((value / INITIAL_CASH) - 1) * 100,
    win_rate: sells ? (wins / sells) * 100 : 0,
    profit_factor: sells && wins === sells ? 999.99 : sells ? Math.max(0.5, 1 + wins / sells) : 0,
    max_drawdown: Math.min(0, ...state.equity.map((point) => ((point.value / INITIAL_CASH) - 1) * 100)),
    unrealized_pnl: positions.reduce((sum, position) => sum + position.unrealized_pnl, 0),
  };
}

function parseBody(options: RequestInit) {
  if (typeof options.body !== "string") return {} as Record<string, unknown>;
  try {
    return JSON.parse(options.body) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function createKline(code: string, days: number): KlineData {
  const stock = MARKET.find((candidate) => candidate.code === code) ?? MARKET[0];
  const count = Math.max(20, Math.min(days, 180));
  const dates: string[] = [];
  const open: number[] = [];
  const high: number[] = [];
  const low: number[] = [];
  const close: number[] = [];
  const volume: number[] = [];
  const seed = stock.code.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  for (let index = 0; index < count; index += 1) {
    const date = new Date(Date.UTC(2026, 7, 10));
    date.setUTCDate(date.getUTCDate() - (count - index - 1));
    const trend = 0.82 + index / count * 0.18;
    const wave = Math.sin((index + seed) / 5) * 0.025 + Math.sin((index + seed) / 13) * 0.018;
    const closePrice = Number((stock.price * (trend + wave)).toFixed(2));
    const openPrice = Number((closePrice * (1 + Math.sin(index + seed) * 0.004)).toFixed(2));
    dates.push(date.toISOString().slice(0, 10));
    open.push(openPrice);
    close.push(closePrice);
    high.push(Number((Math.max(openPrice, closePrice) * 1.008).toFixed(2)));
    low.push(Number((Math.min(openPrice, closePrice) * 0.992).toFixed(2)));
    volume.push(28_000_000 + ((index * 7919 + seed * 101) % 19_000_000));
  }

  return { code: stock.code, name: stock.name, dates, open, high, low, close, volume };
}

function createBacktest(request: BacktestRequest): BacktestResult {
  const symbols = request.stock_codes?.length ? request.stock_codes : ["AAPL", "MSFT", "GOOGL"];
  const cash = request.initial_cash ?? INITIAL_CASH;
  const strategyLabels: Record<string, string> = {
    buy_and_hold: "Buy & Hold",
    moving_average: "Moving Average (20-day)",
    momentum: "Momentum (2%)",
  };
  const strategyEdge = request.strategy === "buy_and_hold" ? 5.4 : request.strategy === "moving_average" ? 3.2 : 1.15;
  const windowKey = [request.start_date, request.end_date, request.strategy, ...symbols].join("|");
  const regimeShift = deterministicUnit(windowKey) * 1.4;
  const pathAmplitude = 0.35 + Math.abs(deterministicUnit(`${windowKey}|path`)) * 0.65;
  const pathPhase = deterministicUnit(`${windowKey}|phase`) * Math.PI;
  const friction = (request.slippage_per_share ?? 0.01) * 19 + (request.fee_rate ?? 0.0001) * 100;
  const totalReturn = Number((strategyEdge + regimeShift - friction).toFixed(2));
  const trades = symbols.slice(0, 3).flatMap((code, index) => {
    const price = marketPrice(code) ?? 100;
    const shares = 8 + index * 4;
    return [
      { date: request.start_date, stock_code: code, stock_name: MARKET.find((s) => s.code === code)?.name ?? code, trade_type: "Buy", shares, price: Number((price * 0.86).toFixed(2)), total_amount: Number((price * 0.86 * shares).toFixed(2)) },
      { date: request.end_date, stock_code: code, stock_name: MARKET.find((s) => s.code === code)?.name ?? code, trade_type: "Sell", shares, price: Number((price * (0.86 + totalReturn / 100)).toFixed(2)), total_amount: Number((price * (0.86 + totalReturn / 100) * shares).toFixed(2)) },
    ];
  });
  const points = 24;
  const equity_curve = Array.from({ length: points }, (_, index) => {
    const date = new Date(`${request.start_date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index * 7);
    const progress = index / (points - 1);
    const path = totalReturn * progress + Math.sin(index / 2.3 + pathPhase) * pathAmplitude;
    return { date: date.toISOString().slice(0, 10), equity: Number((cash * (1 + path / 100)).toFixed(2)) };
  });

  return {
    strategy_name: strategyLabels[request.strategy] ?? request.strategy,
    performance: {
      total_return: totalReturn,
      cagr: Number((totalReturn * 2.05).toFixed(2)),
      sharpe: Number((0.95 + Math.abs(totalReturn) / 3).toFixed(4)),
      max_drawdown: Number((-Math.max(0.72, Math.abs(totalReturn) * 0.42)).toFixed(2)),
      win_rate: 50,
      profit_factor: Number((1.08 + Math.max(totalReturn, 0) / 10).toFixed(2)),
    },
    trades,
    equity_curve,
  };
}

function spectral(prices: number[]): SpectralResult {
  const count = Math.max(prices.length, 1);
  const sampleCount = Math.min(Math.floor(count / 2), 36);
  const frequencies = Array.from({ length: sampleCount }, (_, index) => (index + 1) / count);
  const powers = frequencies.map((frequency) => {
    let real = 0;
    let imaginary = 0;
    prices.forEach((price, index) => {
      real += price * Math.cos(2 * Math.PI * frequency * index);
      imaginary -= price * Math.sin(2 * Math.PI * frequency * index);
    });
    return Number(((real * real + imaginary * imaginary) / count / count).toFixed(4));
  });
  const dominantIndex = powers.reduce((best, value, index) => value > powers[best] ? index : best, 0);
  const dominantPeriod = frequencies[dominantIndex] ? 1 / frequencies[dominantIndex] : 0;
  return {
    frequencies,
    powers,
    dominant_period: dominantPeriod,
    significant_periods: [dominantPeriod].filter(Number.isFinite),
    weekly_power: powers[Math.min(4, powers.length - 1)] ?? 0,
    monthly_power: powers[Math.min(19, powers.length - 1)] ?? 0,
    quarterly_power: powers[Math.min(29, powers.length - 1)] ?? 0,
  };
}

function executeTrade(side: "buy" | "sell", data: Record<string, unknown>) {
  const state = readState();
  const code = String(data.stock_code ?? "").toUpperCase();
  const shares = Math.max(1, Math.floor(Number(data.shares)));
  const price = marketPrice(code);
  if (!price || !Number.isFinite(shares)) throw new Error("Select a valid simulated instrument and share count.");
  const fee = Math.max(1, price * shares * 0.0001);
  const total = price * shares;
  const current = state.positions[code] ?? { shares: 0, avgCost: 0 };

  if (side === "buy") {
    if (state.cash < total + fee) throw new Error("Guest session has insufficient simulated cash.");
    const newShares = current.shares + shares;
    state.positions[code] = { shares: newShares, avgCost: (current.avgCost * current.shares + total) / newShares };
    state.cash -= total + fee;
  } else {
    if (current.shares < shares) throw new Error(`Guest session holds only ${current.shares} ${code} shares.`);
    state.positions[code] = { ...current, shares: current.shares - shares };
    state.cash += total - fee;
  }

  state.trades.unshift({
    id: state.nextTradeId++,
    stock_code: code,
    trade_type: side,
    shares,
    price,
    total_amount: total,
    fee,
    trade_date: new Date().toISOString(),
  });
  state.equity.push({ date: new Date().toISOString(), value: totalValue(state) });
  writeState(state);
  return { success: true, message: `${side === "buy" ? "Bought" : "Sold"} ${shares} ${code} in this guest session.` };
}

export async function guestRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const [pathname, query = ""] = path.split("?");
  const body = parseBody(options);
  const state = readState();

  if (pathname === "/api/me") return { id: 0, email: "guest@epsilon.local", username: "Guest Researcher", created_at: new Date(0).toISOString() } as T;
  if (pathname === "/api/login") return { access_token: "guest-session" } as T;
  if (pathname === "/api/register") return { id: 0, email: String(body.email ?? "guest@epsilon.local"), username: String(body.username ?? "Guest Researcher"), created_at: new Date().toISOString() } as T;
  if (pathname === "/api/logout") return undefined as T;
  if (pathname === "/api/market/prices") {
    const requested = new URLSearchParams(query).get("codes")?.split(",").map((code) => code.toUpperCase());
    return (requested?.length ? MARKET.filter((stock) => requested.includes(stock.code)) : MARKET) as T;
  }
  if (pathname === "/api/market/universe") return { stocks: MARKET.map(({ code, name }) => ({ code, name, exchange: "SIM" })) } as T;
  if (pathname.startsWith("/api/market/kline/")) {
    const code = decodeURIComponent(pathname.slice("/api/market/kline/".length)).toUpperCase();
    return createKline(code, Number(new URLSearchParams(query).get("days") ?? 60)) as T;
  }
  if (pathname === "/api/account") {
    const value = totalValue(state);
    return { id: 0, cash: state.cash, initial_capital: INITIAL_CASH, total_value: value, total_pnl: value - INITIAL_CASH } as T;
  }
  if (pathname === "/api/portfolio") return portfolio(state) as T;
  if (pathname === "/api/portfolio/performance") return performance(state) as T;
  if (pathname === "/api/portfolio/equity") return { dates: state.equity.map((point) => point.date), equity: state.equity.map((point) => point.value), initial_capital: INITIAL_CASH } as T;
  if (pathname === "/api/trades/history") return state.trades as T;
  if (pathname === "/api/trade/buy") return executeTrade("buy", body) as T;
  if (pathname === "/api/trade/sell") return executeTrade("sell", body) as T;
  if (pathname === "/api/orders" && options.method === "POST") {
    const order: Order = {
      id: state.nextOrderId++,
      stock_code: String(body.stock_code ?? "").toUpperCase(),
      order_type: String(body.order_type ?? "limit"),
      side: String(body.side ?? "buy"),
      shares: Math.max(1, Math.floor(Number(body.shares))),
      price: body.price == null ? null : Number(body.price),
      trigger_price: body.trigger_price == null ? null : Number(body.trigger_price),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    state.orders.unshift(order);
    writeState(state);
    return { success: true, message: `Recorded simulated order #${order.id}.` } as T;
  }
  if (pathname === "/api/orders" && (!options.method || options.method === "GET")) return state.orders as T;
  if (pathname.startsWith("/api/orders/") && options.method === "DELETE") {
    const id = Number(pathname.split("/").at(-1));
    const order = state.orders.find((candidate) => candidate.id === id);
    if (order) order.status = "cancelled";
    writeState(state);
    return { success: true, message: `Cancelled simulated order #${id}.` } as T;
  }
  if (pathname === "/api/backtest") return createBacktest(body as unknown as BacktestRequest) as T;
  if (pathname === "/api/backtest/strategies") return { strategies: [{ name: "buy_and_hold", label: "Buy & Hold" }, { name: "moving_average", label: "Moving Average" }, { name: "momentum", label: "Momentum" }] } as T;
  if (pathname === "/api/analysis/spectral") return spectral(Array.isArray(body.prices) ? body.prices.map(Number).filter(Number.isFinite) : []) as T;

  throw new Error(`Guest session does not support ${pathname}.`);
}

export function resetGuestSession() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEY);
}
