import assert from "node:assert/strict";
import test from "node:test";
import { runBacktest, type Bar, type RunConfig } from "../lib/backtest.ts";
import { makeSyntheticRuns } from "../lib/synthetic.ts";

function bars(closes: number[]): Bar[] {
  const start = Date.parse("2024-01-01T00:00:00Z");
  return closes.map((close, index) => ({ timestamp: start + index * 86_400_000, close }));
}

function config(strategy: RunConfig["strategy"], fee = 0): RunConfig {
  return { id: "baseline", label: "Baseline", changed: "None", color: "#fff", strategy, start: "2024-01-02", end: "2024-02-20", universe: ["TEST"], fee, slippage: 0 };
}

void test("momentum does not capture a same-day price shock", () => {
  const closes = [...Array(20).fill(100), 200, ...Array(30).fill(200)];
  const result = runBacktest(config("Momentum (2%)"), { TEST: bars(closes) });
  assert.equal(result.returnPct, 0);
});

void test("execution fees reduce net return", () => {
  const series = { TEST: bars(Array.from({ length: 51 }, (_, index) => 100 * 1.005 ** index)) };
  assert.ok(runBacktest(config("Buy & Hold", 0.001), series).returnPct < runBacktest(config("Buy & Hold"), series).returnPct);
});

void test("zero synthetic fees and slippage create zero cost perturbation", () => {
  const runs = makeSyntheticRuns({ strategy: "Buy & Hold", start: "2024-01-01", end: "2024-06-30", universe: "AAPL,MSFT", fee: 0, slippage: 0 });
  assert.equal(runs[1].returnPct, runs[0].returnPct);
  assert.equal(runs[2].returnPct, runs[0].returnPct);
});
