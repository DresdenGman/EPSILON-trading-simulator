import type { EvidenceRun } from "./evidence-contract";
import type { LedgerEntry, Strategy } from "./backtest";

const COLORS = ["#f5f5f0", "#a88cff", "#ff8b5d", "#4dd9c0", "#ffc857", "#ef5da8"];

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return Math.abs(result >>> 0);
}

function pathFor(seed: number, terminal: number) {
  const points = [100];
  for (let index = 1; index < 32; index += 1) {
    const wave = Math.sin((seed % 19 + index) * 0.71) * 0.52 + Math.cos((seed % 11 + index) * 0.37) * 0.32;
    points.push(Math.max(88, points[index - 1] + terminal / 31 + wave));
  }
  const adjustment = 100 + terminal - points[points.length - 1];
  return points.map((point, index) => Number((point + adjustment * (index / (points.length - 1))).toFixed(4)));
}

function ledgerFor(path: number[], start: string): LedgerEntry[] {
  const origin = Date.parse(`${start}T00:00:00Z`);
  return path.slice(1).map((value, index) => ({ date: new Date(origin + (index + 1) * 86_400_000).toISOString().slice(0, 10), grossReturn: value / path[index] - 1, netReturn: value / path[index] - 1, turnover: 0, executionCost: 0, activePositions: 1 }));
}

export function makeSyntheticRuns(config: { strategy: Strategy; start: string; end: string; universe: string; fee: number; slippage: number }) {
  const seed = hash(`${config.strategy}|${config.start}|${config.end}|${config.universe}`);
  const baseline = 1.8 + (seed % 470) / 100;
  const feeImpact = config.fee * 4 * 760;
  const slipImpact = config.slippage * 4 * 18;
  const windowImpact = 0.45 + ((seed >> 3) % 155) / 100;
  const universeImpact = 0.3 + ((seed >> 6) % 105) / 100;
  const symbols = config.universe.split(",").map((symbol) => symbol.trim()).filter(Boolean);
  const narrow = symbols.slice(0, Math.max(1, Math.ceil(symbols.length / 2))).join(",");
  const outcomes = [
    { id: "baseline", label: "Baseline", changed: "None", result: baseline, costPct: (config.fee + config.slippage / 100) * 100 },
    { id: "epsilon-1", label: "Fee ×5", changed: `${config.fee} → ${Number((config.fee * 5).toFixed(5))}`, result: baseline - feeImpact, costPct: (config.fee * 5 + config.slippage / 100) * 100 },
    { id: "epsilon-2", label: "Slippage ×5", changed: `$${config.slippage} → $${Number((config.slippage * 5).toFixed(3))}`, result: baseline - slipImpact, costPct: (config.fee + (config.slippage * 5) / 100) * 100 },
    { id: "epsilon-3", label: "Window +30d", changed: `${config.start} → shifted +30 days`, result: baseline - windowImpact, costPct: (config.fee + config.slippage / 100) * 100 },
    { id: "epsilon-4", label: "Narrow universe", changed: `${config.universe} → ${narrow}`, result: baseline - universeImpact, costPct: (config.fee + config.slippage / 100) * 100 },
    { id: "epsilon-5", label: "Joint execution stress", changed: "Fee ×5 + slippage ×5 + window +30d", result: baseline - feeImpact - slipImpact - windowImpact, costPct: (config.fee * 5 + (config.slippage * 5) / 100) * 100 },
  ];
  const runs: Array<EvidenceRun & { ledger: LedgerEntry[] }> = outcomes.map((outcome, index) => {
    const path = pathFor(seed + index * 97, outcome.result);
    return { id: outcome.id, label: outcome.label, changed: outcome.changed, returnPct: Number(outcome.result.toFixed(2)), sharpe: Number((0.58 + outcome.result / 4.2).toFixed(3)), drawdown: Number((-0.65 - Math.abs(baseline - outcome.result) * 0.48).toFixed(2)), annualizedVol: Number((8.4 + Math.abs(baseline - outcome.result) * 0.7).toFixed(2)), observations: 31, turnover: Number((0.9 + index * 0.18).toFixed(3)), costPct: Number(outcome.costPct.toFixed(3)), color: COLORS[index], path, ledger: ledgerFor(path, config.start) };
  });
  return runs;
}
