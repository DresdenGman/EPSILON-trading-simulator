import assert from "node:assert/strict";
import test from "node:test";
import referenceCase from "../data/cases/historical-sensitivity-001.json" with { type: "json" };

void test("reference case 001 remains fixed; revised inputs require a new case identifier", () => {
  assert.deepEqual(referenceCase, {
    claim: "This fixed momentum configuration has positive net total return in all five predefined perturbations.",
    falsificationRule: { metric: "net_return", operator: "gt", threshold: 0, perturbationScope: "all" },
    strategy: "Momentum (2%)", start: "2025-09-01", end: "2026-02-27",
    universe: ["SPY", "QQQ"], fee: 0.0001, slippage: 0.01,
  });
});
