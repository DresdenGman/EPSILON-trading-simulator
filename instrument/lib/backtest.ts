import type { EvidenceRun } from "./evidence-contract";

export type Bar = { timestamp: number; close: number };
export type Strategy = "Buy & Hold" | "Moving Average (20-day)" | "Momentum (2%)";
export type BacktestConfig = { strategy: Strategy; start: string; end: string; universe: string[]; fee: number; slippage: number };
export type RunConfig = BacktestConfig & { id: string; label: string; changed: string; color: string };
export type LedgerEntry = { date: string; grossReturn: number; netReturn: number; turnover: number; executionCost: number; activePositions: number };

export function stripLedger(run: EvidenceRun & { ledger: LedgerEntry[] }): EvidenceRun {
  const { ledger, ...evidenceRun } = run;
  void ledger;
  return evidenceRun;
}

function signal(strategy: Strategy, closes: number[], index: number) {
  if (strategy === "Buy & Hold") return 1;
  if (index < 20) return 0;
  if (strategy === "Moving Average (20-day)") {
    const history = closes.slice(index - 20, index);
    const average = history.reduce((sum, value) => sum + value, 0) / history.length;
    return closes[index - 1] > average ? 1 : 0;
  }
  return closes[index - 1] / closes[index - 20] - 1 > 0.02 ? 1 : 0;
}

function sharedDates(config: RunConfig, series: Record<string, Bar[]>) {
  const start = Date.parse(`${config.start}T00:00:00Z`);
  const end = Date.parse(`${config.end}T23:59:59Z`);
  const counts = new Map<number, number>();
  for (const symbol of config.universe) {
    for (const bar of series[symbol] ?? []) counts.set(bar.timestamp, (counts.get(bar.timestamp) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([timestamp, count]) => count === config.universe.length && timestamp >= start && timestamp <= end)
    .map(([timestamp]) => timestamp)
    .sort((left, right) => left - right);
}

export function runBacktest(config: RunConfig, series: Record<string, Bar[]>): EvidenceRun & { ledger: LedgerEntry[] } {
  const dates = sharedDates(config, series);
  const indexes = Object.fromEntries(config.universe.map((symbol) => [symbol, new Map(series[symbol].map((bar, index) => [bar.timestamp, index]))]));
  const closes = Object.fromEntries(config.universe.map((symbol) => [symbol, series[symbol].map((bar) => bar.close)]));
  const previousPosition: Record<string, number> = {};
  const ledger: LedgerEntry[] = [];
  const path = [100];

  for (const timestamp of dates) {
    let gross = 0;
    let net = 0;
    let turnover = 0;
    let executionCost = 0;
    let activePositions = 0;
    let complete = true;
    for (const symbol of config.universe) {
      const index = indexes[symbol].get(timestamp);
      if (index === undefined || index < 1) { complete = false; break; }
      const symbolCloses = closes[symbol];
      const position = signal(config.strategy, symbolCloses, index);
      const marketReturn = symbolCloses[index] / symbolCloses[index - 1] - 1;
      const symbolTurnover = Math.abs(position - (previousPosition[symbol] ?? 0));
      const symbolCost = symbolTurnover * (config.fee + config.slippage / Math.max(symbolCloses[index - 1], 0.01));
      const symbolGross = position * marketReturn;
      gross += symbolGross;
      net += symbolGross - symbolCost;
      turnover += symbolTurnover;
      executionCost += symbolCost;
      activePositions += position;
      previousPosition[symbol] = position;
    }
    if (!complete) continue;
    const divisor = config.universe.length;
    const grossReturn = gross / divisor;
    const netReturn = net / divisor;
    ledger.push({ date: new Date(timestamp).toISOString().slice(0, 10), grossReturn, netReturn, turnover: turnover / divisor, executionCost: executionCost / divisor, activePositions });
    path.push(path[path.length - 1] * (1 + netReturn));
  }

  if (ledger.length < 20) throw new Error("At least 20 aligned market observations are required.");
  const returns = ledger.map((entry) => entry.netReturn);
  const totalReturn = path[path.length - 1] / path[0] - 1;
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(returns.length - 1, 1);
  const annualizedVol = Math.sqrt(252 * variance);
  const sharpe = annualizedVol > 0 ? (Math.sqrt(252) * mean) / Math.sqrt(variance) : 0;
  let peak = path[0];
  let drawdown = 0;
  for (const value of path) { peak = Math.max(peak, value); drawdown = Math.min(drawdown, value / peak - 1); }
  const sampled = Array.from({ length: 32 }, (_, index) => path[Math.min(path.length - 1, Math.round((index * (path.length - 1)) / 31))]);

  return {
    id: config.id,
    label: config.label,
    changed: config.changed,
    returnPct: Number((totalReturn * 100).toFixed(2)),
    sharpe: Number(sharpe.toFixed(3)),
    drawdown: Number((drawdown * 100).toFixed(2)),
    annualizedVol: Number((annualizedVol * 100).toFixed(2)),
    observations: ledger.length,
    turnover: Number(ledger.reduce((sum, entry) => sum + entry.turnover, 0).toFixed(3)),
    costPct: Number((ledger.reduce((sum, entry) => sum + entry.executionCost, 0) * 100).toFixed(3)),
    color: config.color,
    path: sampled,
    ledger,
  };
}
