// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ResearchProvider,
  UNKNOWN_BACKTEST_PROVENANCE,
  useResearchExperiment,
} from "./ResearchContext";

function Probe() {
  const { experiment, hydrated, testState, setSubject, setHypothesis, setFalsification, recordBacktest } = useResearchExperiment();
  const record = (totalReturn: number) => recordBacktest({
    method: "backtest",
    strategy: "momentum",
    symbols: ["AAPL"],
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    initialCash: 100000,
    totalReturn,
    sharpe: 1.1,
    maxDrawdown: -4,
    tradeCount: 8,
    completedAt: "2026-08-10T19:00:00.000Z",
    provenance: UNKNOWN_BACKTEST_PROVENANCE,
  });

  return (
    <div>
      <span data-testid="hydrated">{String(hydrated)}</span>
      <span data-testid="state">{testState}</span>
      <span data-testid="return">{experiment.test?.totalReturn ?? "none"}</span>
      <button onClick={() => setSubject("AAPL")}>subject</button>
      <button onClick={() => setHypothesis("Momentum persists.")}>hypothesis</button>
      <button onClick={() => setHypothesis("Momentum fails in high-volatility regimes.")}>refine</button>
      <button onClick={() => setFalsification("Reject if out-of-sample Sharpe is below zero.")}>falsification</button>
      <button onClick={() => record(5)}>record first</button>
      <button onClick={() => undefined}>failed retest</button>
      <button onClick={() => record(2)}>record second</button>
    </div>
  );
}

describe("ResearchProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  afterEach(() => cleanup());

  it("keeps old evidence stale until a successful matching retest replaces it", async () => {
    const view = render(<ResearchProvider><Probe /></ResearchProvider>);
    await waitFor(() => expect(screen.getByTestId("hydrated").textContent).toBe("true"));

    fireEvent.click(screen.getByRole("button", { name: "subject" }));
    fireEvent.click(screen.getByRole("button", { name: "hypothesis" }));
    fireEvent.click(screen.getByRole("button", { name: "record first" }));
    expect(screen.getByTestId("state").textContent).toBe("current");
    expect(screen.getByTestId("return").textContent).toBe("5");

    fireEvent.click(screen.getByRole("button", { name: "refine" }));
    expect(screen.getByTestId("state").textContent).toBe("stale");

    fireEvent.click(screen.getByRole("button", { name: "failed retest" }));
    expect(screen.getByTestId("state").textContent).toBe("stale");
    expect(screen.getByTestId("return").textContent).toBe("5");

    fireEvent.click(screen.getByRole("button", { name: "record second" }));
    expect(screen.getByTestId("state").textContent).toBe("current");
    expect(screen.getByTestId("return").textContent).toBe("2");

    fireEvent.click(screen.getByRole("button", { name: "falsification" }));
    expect(screen.getByTestId("state").textContent).toBe("stale");
    fireEvent.click(screen.getByRole("button", { name: "record second" }));
    expect(screen.getByTestId("state").textContent).toBe("current");

    await waitFor(() => expect(window.localStorage.getItem("epsilon.research-experiment.v1")).toContain('"totalReturn":2'));
    view.unmount();
    render(<ResearchProvider><Probe /></ResearchProvider>);
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("current"));
    expect(screen.getByTestId("return").textContent).toBe("2");
  });
});
