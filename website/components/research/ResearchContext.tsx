"use client";

import React from "react";

export type ResearchTestArtifact = {
  subjectSnapshot: string | null;
  hypothesisSnapshot: string;
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

export type ResearchTestInput = Omit<ResearchTestArtifact, "subjectSnapshot" | "hypothesisSnapshot">;
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
  fillModel: "Browser-local windowed demonstration model",
  benchmark: null,
};

export type ResearchExperiment = {
  symbol: string | null;
  hypothesis: string;
  test: ResearchTestArtifact | null;
  updatedAt: string | null;
};

type ResearchContextValue = {
  experiment: ResearchExperiment;
  hydrated: boolean;
  testState: ResearchTestState;
  setSubject: (symbol: string | null) => void;
  setHypothesis: (hypothesis: string) => void;
  recordBacktest: (artifact: ResearchTestInput) => void;
  resetExperiment: () => void;
};

const EMPTY_EXPERIMENT: ResearchExperiment = {
  symbol: null,
  hypothesis: "",
  test: null,
  updatedAt: null,
};

const STORAGE_KEY = "epsilon.research-experiment.v1";
const ResearchContext = React.createContext<ResearchContextValue | null>(null);

function normalizeHypothesis(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function testMatchesExperiment(experiment: ResearchExperiment) {
  if (!experiment.test) return false;
  return (
    experiment.test.subjectSnapshot === experiment.symbol &&
    experiment.test.hypothesisSnapshot === normalizeHypothesis(experiment.hypothesis)
  );
}

function readStoredExperiment(): ResearchExperiment {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_EXPERIMENT;
    const parsed = JSON.parse(stored) as Partial<ResearchExperiment>;
    return {
      symbol: typeof parsed.symbol === "string" ? parsed.symbol : null,
      hypothesis: typeof parsed.hypothesis === "string" ? parsed.hypothesis : "",
      test: parsed.test && typeof parsed.test === "object"
        ? {
            ...parsed.test as ResearchTestArtifact,
            subjectSnapshot: typeof (parsed.test as Partial<ResearchTestArtifact>).subjectSnapshot === "string"
              ? (parsed.test as ResearchTestArtifact).subjectSnapshot
              : null,
            hypothesisSnapshot: typeof (parsed.test as Partial<ResearchTestArtifact>).hypothesisSnapshot === "string"
              ? (parsed.test as ResearchTestArtifact).hypothesisSnapshot
              : "",
            provenance: { ...UNKNOWN_BACKTEST_PROVENANCE, ...(parsed.test as Partial<ResearchTestArtifact>).provenance },
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
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(experiment));
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
  const recordBacktest = React.useCallback((artifact: ResearchTestInput) => {
    setExperiment((current) => {
      const symbol = current.symbol && artifact.symbols.includes(current.symbol)
        ? current.symbol
        : artifact.symbols[0] ?? current.symbol;
      const test: ResearchTestArtifact = {
        ...artifact,
        subjectSnapshot: symbol,
        hypothesisSnapshot: normalizeHypothesis(current.hypothesis),
      };
      return { ...current, symbol, test, updatedAt: new Date().toISOString() };
    });
  }, []);
  const resetExperiment = React.useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY);
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
    recordBacktest,
    resetExperiment,
  }), [experiment, hydrated, recordBacktest, resetExperiment, setHypothesis, setSubject, testState]);

  return <ResearchContext.Provider value={value}>{children}</ResearchContext.Provider>;
}

export function useResearchExperiment() {
  const context = React.useContext(ResearchContext);
  if (!context) throw new Error("useResearchExperiment must be used inside ResearchProvider");
  return context;
}
