import { describe, expect, it } from "vitest";
import { diagnoseExperiment, evaluateReplication } from "./experiment";

const base = {
  baselineTrades: 65,
  perturbedTrades: 65,
  parameter: "slippage_per_share" as const,
  baselineParameter: 0.01,
  perturbedParameter: 0.02,
};

describe("diagnoseExperiment", () => {
  it("preserves a positive conclusion while recording weakening", () => {
    const result = diagnoseExperiment({ ...base, baselineReturn: 4.07, perturbedReturn: 3.99 });
    expect(result.outcome).toBe("preserved");
    expect(result.effect).toBe("weakened");
    expect(result.deltaReturnPp).toBeCloseTo(-0.08);
    expect(result.valid).toBe(true);
  });

  it("detects a positive-to-non-positive reversal", () => {
    const result = diagnoseExperiment({ ...base, baselineReturn: 4.07, perturbedReturn: -0.2 });
    expect(result.outcome).toBe("reversed");
    expect(result.perturbedSign).toBe("non_positive");
  });

  it("preserves a non-positive conclusion without calling it successful", () => {
    const result = diagnoseExperiment({ ...base, baselineReturn: -2, perturbedReturn: -3 });
    expect(result.outcome).toBe("preserved");
    expect(result.baselineSign).toBe("non_positive");
    expect(result.effect).toBe("weakened");
  });

  it("withholds a conclusion when either run has no trades", () => {
    const result = diagnoseExperiment({ ...base, baselineReturn: 4.07, perturbedReturn: 3.99, perturbedTrades: 0 });
    expect(result.outcome).toBe("inconclusive");
    expect(result.valid).toBe(false);
  });
});

describe("evaluateReplication", () => {
  it("replicates the same positive sensitivity pattern", () => {
    const primary = diagnoseExperiment({ ...base, baselineReturn: 4.07, perturbedReturn: 3.99 });
    const replication = diagnoseExperiment({ ...base, baselineReturn: 1.2, perturbedReturn: 1.1 });
    expect(evaluateReplication(primary, replication)).toBe("replicated");
  });

  it("does not replicate when the perturbation reverses in the holdout", () => {
    const primary = diagnoseExperiment({ ...base, baselineReturn: 4.07, perturbedReturn: 3.99 });
    const replication = diagnoseExperiment({ ...base, baselineReturn: 1.2, perturbedReturn: -0.4 });
    expect(evaluateReplication(primary, replication)).toBe("not_replicated");
  });

  it("does not call a non-positive window a positive replication", () => {
    const primary = diagnoseExperiment({ ...base, baselineReturn: 4.07, perturbedReturn: 3.99 });
    const replication = diagnoseExperiment({ ...base, baselineReturn: -2.1, perturbedReturn: -2.3 });
    expect(evaluateReplication(primary, replication)).toBe("not_replicated");
  });

  it("withholds a cross-window verdict for invalid runs", () => {
    const primary = diagnoseExperiment({ ...base, baselineReturn: 4.07, perturbedReturn: 3.99 });
    const replication = diagnoseExperiment({ ...base, baselineReturn: 1.2, perturbedReturn: 1.1, perturbedTrades: 0 });
    expect(evaluateReplication(primary, replication)).toBe("inconclusive");
  });
});
