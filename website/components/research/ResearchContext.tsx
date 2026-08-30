"use client";

import React from "react";
import { readWorkspaceItem, removeWorkspaceItem, writeWorkspaceItem } from "@/lib/browser-workspace-storage";
import type { BacktestResult } from "@/lib/api";
import { isEvidenceArtifact, type EvidenceArtifact } from "@/lib/evidence-artifact";

export type ResearchTestArtifact = {
  subjectSnapshot: string | null;
  hypothesisSnapshot: string;
  falsificationSnapshot: string;
  method: "backtest";
  strategy: string;
  symbols: string[];
  startDate: string;
  endDate: string;
  initialCash: number;
  totalReturn: number;
  sharpe: number;
  maxDrawdown: number;
  tradeCount: number;
  completedAt: string;
  result: BacktestResult | null;
  perturbationEvidence?: EvidenceArtifact | null;
  provenance: {
    resultOrigin: "backtest-service-response" | "guest-simulation";
    dataMode: "unknown" | "controlled-synthetic";
    dataSource: string | null;
    dataProvider: string | null;
    samplingInterval: string | null;
    dataAsOf: null;
    feeRate: number | null;
    minimumFee: number | null;
    slippagePerShare: number | null;
    fillModel: string | null;
    benchmark: string | null;
  };
};

export type ResearchTestInput = Omit<ResearchTestArtifact, "subjectSnapshot" | "hypothesisSnapshot" | "falsificationSnapshot" | "result"> & {
  result?: BacktestResult | null;
};
export type ResearchTestState = "empty" | "current" | "stale";

export const UNKNOWN_BACKTEST_PROVENANCE: ResearchTestArtifact["provenance"] = {
  resultOrigin: "backtest-service-response",
  dataMode: "unknown",
  dataSource: null,
  dataProvider: null,
  samplingInterval: null,
  dataAsOf: null,
  feeRate: null,
  minimumFee: null,
  slippagePerShare: null,
  fillModel: null,
  benchmark: null,
};

export const GUEST_BACKTEST_PROVENANCE: ResearchTestArtifact["provenance"] = {
  resultOrigin: "guest-simulation",
  dataMode: "controlled-synthetic",
  dataSource: "Window-aware deterministic browser-generated path",
  dataProvider: "EPSILON guest engine",
  samplingInterval: "Synthetic daily observations",
  dataAsOf: null,
  feeRate: null,
  minimumFee: null,
  slippagePerShare: null,
  fillModel: "Browser-local windowed execution model",
  benchmark: null,
};

export const SERVICE_BACKTEST_PROVENANCE: ResearchTestArtifact["provenance"] = {
  resultOrigin: "backtest-service-response",
  dataMode: "controlled-synthetic",
  dataSource: "Window-aware controlled synthetic path",
  dataProvider: "EPSILON backtest service",
  samplingInterval: "Synthetic daily observations",
  dataAsOf: null,
  feeRate: null,
  minimumFee: null,
  slippagePerShare: null,
  fillModel: "Service-side controlled synthetic execution model",
  benchmark: null,
};

export type ResearchExperiment = {
  symbol: string | null;
  hypothesis: string;
  falsification: string;
  test: ResearchTestArtifact | null;
  updatedAt: string | null;
};

type ResearchContextValue = {
  experiment: ResearchExperiment;
  hydrated: boolean;
  testState: ResearchTestState;
  setSubject: (symbol: string | null) => void;
  setHypothesis: (hypothesis: string) => void;
  setFalsification: (falsification: string) => void;
  recordBacktest: (artifact: ResearchTestInput) => void;
  resetExperiment: () => void;
};

const EMPTY_EXPERIMENT: ResearchExperiment = {
  symbol: null,
  hypothesis: "",
  falsification: "",
  test: null,
  updatedAt: null,
};

const STORAGE_KEY = "epsilon.research-experiment.v1";
const ResearchContext = React.createContext<ResearchContextValue | null>(null);

function normalizeHypothesis(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStoredBacktestResult(value: unknown): value is BacktestResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<BacktestResult>;
  const performance = candidate.performance as Partial<BacktestResult["performance"]> | undefined;
  if (
    typeof candidate.strategy_name !== "string" ||
    !performance ||
    !isFiniteNumber(performance.total_return) ||
    !isFiniteNumber(performance.cagr) ||
    !isFiniteNumber(performance.sharpe) ||
    !isFiniteNumber(performance.max_drawdown) ||
    !isFiniteNumber(performance.win_rate) ||
    !isFiniteNumber(performance.profit_factor) ||
    !Array.isArray(candidate.trades) ||
    !Array.isArray(candidate.equity_curve)
  ) return false;

  return candidate.trades.every((trade) => (
    trade &&
    typeof trade.date === "string" &&
    typeof trade.stock_code === "string" &&
    typeof trade.stock_name === "string" &&
    typeof trade.trade_type === "string" &&
    isFiniteNumber(trade.shares) &&
    isFiniteNumber(trade.price) &&
    isFiniteNumber(trade.total_amount)
  )) && candidate.equity_curve.every((point) => (
    point && typeof point.date === "string" && isFiniteNumber(point.equity)
  ));
}

export function testMatchesExperiment(experiment: ResearchExperiment) {
  if (!experiment.test) return false;
  return (
    experiment.test.subjectSnapshot === experiment.symbol &&
    experiment.test.hypothesisSnapshot === normalizeHypothesis(experiment.hypothesis) &&
    experiment.test.falsificationSnapshot === normalizeHypothesis(experiment.falsification)
  );
}

function readStoredExperiment(): ResearchExperiment {
  try {
    const stored = readWorkspaceItem(STORAGE_KEY);
    if (!stored) return EMPTY_EXPERIMENT;
    const parsed = JSON.parse(stored) as Partial<ResearchExperiment>;
    const storedTest = parsed.test as Partial<ResearchTestArtifact> | null | undefined;
    return {
      symbol: typeof parsed.symbol === "string" ? parsed.symbol : null,
      hypothesis: typeof parsed.hypothesis === "string" ? parsed.hypothesis : "",
      falsification: typeof parsed.falsification === "string" ? parsed.falsification : "",
      test: storedTest && typeof storedTest === "object"
        ? {
            ...storedTest as ResearchTestArtifact,
            subjectSnapshot: typeof storedTest.subjectSnapshot === "string"
              ? storedTest.subjectSnapshot
              : null,
            hypothesisSnapshot: typeof storedTest.hypothesisSnapshot === "string"
              ? storedTest.hypothesisSnapshot
              : "",
            falsificationSnapshot: typeof storedTest.falsificationSnapshot === "string"
              ? storedTest.falsificationSnapshot
              : "",
            result: isStoredBacktestResult(storedTest.result) ? storedTest.result : null,
            perturbationEvidence: isEvidenceArtifact(storedTest.perturbationEvidence)
              ? storedTest.perturbationEvidence
              : null,
            provenance: { ...UNKNOWN_BACKTEST_PROVENANCE, ...storedTest.provenance },
          }
        : null,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return EMPTY_EXPERIMENT;
  }
}

export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [experiment, setExperiment] = React.useState<ResearchExperiment>(EMPTY_EXPERIMENT);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setExperiment(readStoredExperiment());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!experiment.updatedAt) return;
    writeWorkspaceItem(STORAGE_KEY, JSON.stringify(experiment));
  }, [experiment]);

  const updateExperiment = React.useCallback((update: Partial<ResearchExperiment>) => {
    setExperiment((current) => ({ ...current, ...update, updatedAt: new Date().toISOString() }));
  }, []);

  const setSubject = React.useCallback((symbol: string | null) => {
    setExperiment((current) => {
      if (current.symbol === symbol) return current;
      return { ...current, symbol, updatedAt: new Date().toISOString() };
    });
  }, []);
  const setHypothesis = React.useCallback((hypothesis: string) => updateExperiment({ hypothesis }), [updateExperiment]);
  const setFalsification = React.useCallback((falsification: string) => updateExperiment({ falsification }), [updateExperiment]);
  const recordBacktest = React.useCallback((artifact: ResearchTestInput) => {
    setExperiment((current) => {
      const symbol = current.symbol && artifact.symbols.includes(current.symbol)
        ? current.symbol
        : artifact.symbols[0] ?? current.symbol;
      const test: ResearchTestArtifact = {
        ...artifact,
        result: artifact.result ?? null,
        subjectSnapshot: symbol,
        hypothesisSnapshot: normalizeHypothesis(current.hypothesis),
        falsificationSnapshot: normalizeHypothesis(current.falsification),
      };
      return { ...current, symbol, test, updatedAt: new Date().toISOString() };
    });
  }, []);
  const resetExperiment = React.useCallback(() => {
    removeWorkspaceItem(STORAGE_KEY);
    setExperiment(EMPTY_EXPERIMENT);
  }, []);

  const testState: ResearchTestState = !experiment.test
    ? "empty"
    : testMatchesExperiment(experiment)
      ? "current"
      : "stale";

  const value = React.useMemo<ResearchContextValue>(() => ({
    experiment,
    hydrated,
    testState,
    setSubject,
    setHypothesis,
    setFalsification,
    recordBacktest,
    resetExperiment,
  }), [experiment, hydrated, recordBacktest, resetExperiment, setFalsification, setHypothesis, setSubject, testState]);

  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
}

export function useResearchExperiment() {
  const context = React.useContext(ResearchContext);
  if (!context) throw new Error("useResearchExperiment must be used inside ResearchProvider");
  return context;
}
