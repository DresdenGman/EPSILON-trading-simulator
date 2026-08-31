import assert from "node:assert/strict";
import test from "node:test";
import { evidenceDigest, evaluateEvidence, type EvidenceRun, type FalsificationRule } from "../lib/evidence-contract.ts";

function run(id: string, value: number): EvidenceRun {
  return { id, label: id, changed: "test", returnPct: value, sharpe: value, drawdown: -value, annualizedVol: 1, observations: 30, turnover: 1, costPct: 0, color: "#fff", path: [100, 100 + value] };
}

void test("verdict distinguishes survival, fragility, and rejection", () => {
  const rule: FalsificationRule = { metric: "net_return", operator: "gt", threshold: 0, perturbationScope: "all" };
  assert.equal(evaluateEvidence([run("base", 3), run("a", 2), run("b", 1)], rule).verdict, "survives");
  assert.equal(evaluateEvidence([run("base", 3), run("a", 2), run("b", -1)], rule).verdict, "fragile");
  assert.equal(evaluateEvidence([run("base", 3), run("a", -2), run("b", -1)], rule).verdict, "rejected");
});

void test("canonical evidence digest is independent of object key order", async () => {
  assert.equal(await evidenceDigest({ b: 2, a: { y: 2, x: 1 } }), await evidenceDigest({ a: { x: 1, y: 2 }, b: 2 }));
});
