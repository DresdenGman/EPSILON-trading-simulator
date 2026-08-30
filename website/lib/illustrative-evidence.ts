import type { EvidenceArtifact, EvidenceResultSnapshot } from "@/lib/evidence-artifact";

const dates = ["01-02", "01-16", "01-30", "02-13", "02-27", "03-12", "03-26", "04-09", "04-23", "05-07", "05-21", "06-04", "06-18", "06-28"];

function result(label: string, returns: number[], sharpe: number, drawdown: number): EvidenceResultSnapshot {
  const finalReturn = returns.at(-1) ?? 0;
  return {
    strategyName: label,
    totalReturn: finalReturn,
    cagr: finalReturn * 2.05,
    sharpe,
    maxDrawdown: drawdown,
    winRate: 54.2,
    profitFactor: 1.31,
    tradeCount: 18,
    equityCurve: returns.map((value, index) => ({ date: `2024-${dates[index]}`, equity: 100000 * (1 + value / 100) })),
  };
}

export const ILLUSTRATIVE_EVIDENCE: EvidenceArtifact = {
  format: "epsilon.evidence.v1",
  claim: "Recent momentum remains directionally positive under nearby execution and sampling assumptions.",
  falsifiedIf: "The return direction reverses when one plausible assumption changes while the others remain fixed.",
  configuration: {
    strategy: "momentum", startDate: "2024-01-02", endDate: "2024-06-28",
    stockCodes: ["AAPL", "MSFT", "GOOGL"], initialCash: 100000,
    feeRate: 0.0001, minimumFee: 1, slippagePerShare: 0.01,
  },
  baseline: result("Momentum", [0, 0.5, -0.2, 1.2, 0.8, 2.1, 1.6, 3.2, 2.8, 4.4, 3.9, 5.4, 5.1, 6.2], 0.91, -3.8),
  observations: [
    { id: "fee-5x", label: "Fee ×5", parameter: "fee_rate", baselineValue: "0.0001", perturbedValue: "0.0005", status: "succeeded", result: result("Momentum", [0, 0.42, -0.35, 0.98, 0.58, 1.75, 1.14, 2.58, 2.02, 3.48, 2.82, 4.11, 3.61, 4.32], 0.68, -4.3) },
    { id: "slippage-5x", label: "Slippage ×5", parameter: "slippage_per_share", baselineValue: "$0.01", perturbedValue: "$0.05", status: "succeeded", result: result("Momentum", [0, 0.3, -0.5, 0.7, 0.32, 1.34, 0.66, 1.92, 1.21, 2.5, 1.66, 2.98, 2.12, 2.71], 0.43, -5.2) },
    { id: "window-plus-30", label: "Window +30d", parameter: "start_date", baselineValue: "2024-01-02", perturbedValue: "2024-02-01", status: "succeeded", result: result("Momentum", [0, -0.2, 0.45, 0.1, 1.1, 0.72, 2.03, 1.62, 3.12, 2.74, 4.01, 3.58, 4.72, 5.18], 0.79, -3.5) },
    { id: "universe-narrow", label: "Narrow universe", parameter: "stock_codes", baselineValue: "AAPL,MSFT,GOOGL", perturbedValue: "AAPL,MSFT", status: "succeeded", result: result("Momentum", [0, 0.65, 0.18, 1.44, 1.02, 2.38, 1.91, 3.41, 3.02, 4.63, 4.14, 5.55, 5.22, 5.83], 0.86, -3.9) },
  ],
  provenance: {
    resultOrigin: "guest-simulation", dataMode: "controlled-synthetic",
    dataSource: "Illustrative EPSILON controlled synthetic path",
    samplingInterval: "Synthetic daily observations",
    fillModel: "Illustrative controlled execution assumptions",
  },
  generatedAt: "2026-08-30T00:00:00.000Z",
};
