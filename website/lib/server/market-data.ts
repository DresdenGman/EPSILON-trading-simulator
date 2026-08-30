export type HistoricalBar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type HistoricalSeries = {
  symbol: string;
  source: "Massive" | "Twelve Data";
  adjusted: boolean;
  interval: "1day";
  bars: HistoricalBar[];
};

function finite(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function assertBars(bars: HistoricalBar[]) {
  if (!bars.length) throw new Error("The historical provider returned no daily bars for this request.");
  if (bars.length > 800) throw new Error("The historical response exceeds the supported research window.");
  if (bars.some((bar) => !bar.date || [bar.open, bar.high, bar.low, bar.close, bar.volume].some((value) => !Number.isFinite(value)))) {
    throw new Error("The historical provider returned malformed market data.");
  }
  return bars.sort((left, right) => left.date.localeCompare(right.date));
}

async function providerFetch(url: string, authorization: string) {
  const response = await fetch(url, {
    headers: { Authorization: authorization, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 3600 },
  } as RequestInit & { next: { revalidate: number } });
  if (!response.ok) {
    if (response.status === 429) throw new Error("Historical data quota is temporarily exhausted.");
    if (response.status === 401 || response.status === 403) throw new Error("Historical data provider authorization failed.");
    throw new Error(`Historical data provider returned HTTP ${response.status}.`);
  }
  return response.json() as Promise<unknown>;
}

async function fetchMassive(symbol: string, start: string, end: string, key: string): Promise<HistoricalSeries> {
  const url = `https://api.massive.com/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/day/${start}/${end}?adjusted=true&sort=asc&limit=800`;
  const payload = await providerFetch(url, `Bearer ${key}`) as { results?: unknown };
  if (!Array.isArray(payload.results)) throw new Error("Massive returned an unsupported response.");
  const bars = payload.results.map((raw) => {
    const item = raw as Record<string, unknown>;
    const timestamp = finite(item.t);
    return {
      date: timestamp === null ? "" : new Date(timestamp).toISOString().slice(0, 10),
      open: finite(item.o) ?? Number.NaN,
      high: finite(item.h) ?? Number.NaN,
      low: finite(item.l) ?? Number.NaN,
      close: finite(item.c) ?? Number.NaN,
      volume: finite(item.v) ?? Number.NaN,
    };
  });
  return { symbol, source: "Massive", adjusted: true, interval: "1day", bars: assertBars(bars) };
}

async function fetchTwelveData(symbol: string, start: string, end: string, key: string): Promise<HistoricalSeries> {
  const query = new URLSearchParams({ symbol, interval: "1day", start_date: start, end_date: end, outputsize: "800", order: "ASC" });
  const payload = await providerFetch(`https://api.twelvedata.com/time_series?${query}`, `apikey ${key}`) as { values?: unknown; status?: unknown; message?: unknown };
  if (!Array.isArray(payload.values)) throw new Error(typeof payload.message === "string" ? payload.message.slice(0, 180) : "Twelve Data returned an unsupported response.");
  const bars = payload.values.map((raw) => {
    const item = raw as Record<string, unknown>;
    return {
      date: typeof item.datetime === "string" ? item.datetime.slice(0, 10) : "",
      open: finite(item.open) ?? Number.NaN,
      high: finite(item.high) ?? Number.NaN,
      low: finite(item.low) ?? Number.NaN,
      close: finite(item.close) ?? Number.NaN,
      volume: finite(item.volume) ?? 0,
    };
  });
  return { symbol, source: "Twelve Data", adjusted: false, interval: "1day", bars: assertBars(bars) };
}

export function historicalProviderStatus() {
  const provider = process.env.MASSIVE_API_KEY?.trim()
    ? "Massive"
    : process.env.TWELVE_DATA_API_KEY?.trim()
      ? "Twelve Data"
      : null;
  return { provider, publicEnabled: process.env.HISTORICAL_DATA_PUBLIC === "true" };
}

export async function getHistoricalSeries(symbol: string, start: string, end: string) {
  const massiveKey = process.env.MASSIVE_API_KEY?.trim();
  if (massiveKey) return fetchMassive(symbol, start, end, massiveKey);
  const twelveDataKey = process.env.TWELVE_DATA_API_KEY?.trim();
  if (twelveDataKey) return fetchTwelveData(symbol, start, end, twelveDataKey);
  throw new Error("No historical data provider is configured.");
}
