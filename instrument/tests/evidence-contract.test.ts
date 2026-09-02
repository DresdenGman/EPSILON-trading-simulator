import assert from "node:assert/strict";
import test from "node:test";
import { createEvidenceArtifact, evidenceDigest, evaluateEvidence, verifyEvidenceArtifact, type EvidenceRun, type FalsificationRule } from "../lib/evidence-contract.ts";

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

void test("artifact checksum covers generation time and all exported fields except itself", async () => {
  const first = await createEvidenceArtifact({ claim: "test" }, "2026-01-01T00:00:00.000Z");
  const second = await createEvidenceArtifact({ claim: "test" }, "2026-01-02T00:00:00.000Z");
  assert.notEqual(first.artifactHash, second.artifactHash);
  assert.equal(first.evidenceId, second.evidenceId);
  assert.equal(await verifyEvidenceArtifact(first), true);
  assert.equal(await verifyEvidenceArtifact({ ...first, generatedAt: second.generatedAt }), false);
  assert.equal(await verifyEvidenceArtifact({ ...first, artifactHash: "0".repeat(64) }), false);
});
