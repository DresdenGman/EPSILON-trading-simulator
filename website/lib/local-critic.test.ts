import { describe, expect, it } from "vitest";
import { createLocalCritique } from "@/lib/local-critic";
import { ILLUSTRATIVE_EVIDENCE } from "@/lib/illustrative-evidence";
import { GUEST_BACKTEST_PROVENANCE, type ResearchTestArtifact } from "@/components/research/ResearchContext";

function testArtifact(): ResearchTestArtifact {
  return {
    subjectSnapshot: "AAPL",
    hypothesisSnapshot: ILLUSTRATIVE_EVIDENCE.claim,
    falsificationSnapshot: ILLUSTRATIVE_EVIDENCE.falsifiedIf,
    method: "backtest",
    strategy: "momentum",
    symbols: ["AAPL", "MSFT", "GOOGL"],
    startDate: "2024-01-02",
    endDate: "2024-06-28",
    initialCash: 100000,
    totalReturn: ILLUSTRATIVE_EVIDENCE.baseline.totalReturn,
    sharpe: ILLUSTRATIVE_EVIDENCE.baseline.sharpe,
    maxDrawdown: ILLUSTRATIVE_EVIDENCE.baseline.maxDrawdown,
    tradeCount: ILLUSTRATIVE_EVIDENCE.baseline.tradeCount,
    completedAt: ILLUSTRATIVE_EVIDENCE.generatedAt,
    result: null,
    perturbationEvidence: ILLUSTRATIVE_EVIDENCE,
    provenance: GUEST_BACKTEST_PROVENANCE,
  };
}

describe("local evidence critic", () => {
  it("extracts measured sensitivity instead of returning a fixed generic critique", () => {
    const response = createLocalCritique({
      question: "Which execution assumption is most fragile?",
      hypothesis: ILLUSTRATIVE_EVIDENCE.claim,
      falsification: ILLUSTRATIVE_EVIDENCE.falsifiedIf,
      test: testArtifact(),
    });

    expect(response).toContain("4/4 atomic perturbations completed");
    expect(response).toContain("Largest observed return movement: Slippage ×5");
    expect(response).toContain("widen per-share slippage");
    expect(response).toContain("not historical performance");
  });

  it("states the missing-evidence limit when no current artifact exists", () => {
    const response = createLocalCritique({ question: "Challenge this.", hypothesis: "A claim", falsification: "", test: null });
    expect(response).toContain("No current test artifact is attached");
    expect(response).toContain("No rejection rule recorded");
  });
});
