// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BacktestForm from "./BacktestForm";
import { createBacktestExport } from "@/lib/backtest-export";
import { ResearchProvider, UNKNOWN_BACKTEST_PROVENANCE } from "@/components/research/ResearchContext";

const mocks = vi.hoisted(() => ({ backtest: vi.fn() }));

vi.mock("@/lib/api", () => ({ api: mocks }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));

const successfulResult = {
  strategy_name: "Momentum (2%)",
  performance: { total_return: 1, cagr: 1, sharpe: 1, max_drawdown: -1, win_rate: 50, profit_factor: 1 },
  trades: [],
  equity_curve: [],
};

function renderBacktestForm() {
  return render(React.createElement(ResearchProvider, null, React.createElement(BacktestForm)));
}

describe("BacktestForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });
  afterEach(() => cleanup());

  it("submits only one backtest while the current attempt is running", () => {
    mocks.backtest.mockImplementation(() => new Promise(() => undefined));
    renderBacktestForm();

    const button = screen.getByRole("button", { name: "Run Backtest" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mocks.backtest).toHaveBeenCalledTimes(1);
  });

  it("retains the previous successful result after a later attempt fails", async () => {
    mocks.backtest
      .mockResolvedValueOnce(successfulResult)
      .mockRejectedValueOnce(new Error("Backtest service unavailable"));
    renderBacktestForm();

    fireEvent.click(screen.getByRole("button", { name: "Run Backtest" }));
    await screen.findByText("Submitted configuration");
    expect(screen.getByText("Profit Factor")).toBeTruthy();
    expect(screen.getByText("1.00")).toBeTruthy();

    fireEvent.change(screen.getByDisplayValue("AAPL,MSFT,GOOGL"), { target: { value: "MSFT" } });
    fireEvent.click(screen.getByRole("button", { name: "Run Backtest" }));

    await screen.findByText(/Latest attempt failed:/);
    expect(screen.getByText("Previous successful run")).toBeTruthy();
    expect(screen.getByText("AAPL, MSFT, GOOGL")).toBeTruthy();
    expect(screen.getByText(/Displayed results belong to the previous successful run/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Export result artifact (JSON)" })).toBeTruthy();
    expect(screen.getAllByText("Not provided by service")).toHaveLength(2);
  });

  it("exports only the successful result and its submitted configuration", () => {
    const configuration = {
      strategy: "momentum",
      startDate: "2024-01-01",
      endDate: "2024-06-30",
      stockCodes: ["AAPL", "MSFT"],
      initialCash: 100000,
    };

    const exported = createBacktestExport(successfulResult, configuration);

    expect(exported.filename).toBe("epsilon-backtest-2024-01-01-to-2024-06-30.json");
    expect(JSON.parse(exported.content)).toEqual({
      format: "epsilon.backtest-result.v1",
      provenance: {
        configuration,
        resultOrigin: "backtest-service-response",
        data: {
          mode: "unknown",
          source: null,
          provider: null,
          samplingInterval: null,
          asOf: null,
        },
        executionAssumptions: {
          feeRate: null,
          minimumFee: null,
          slippagePerShare: null,
          fillModel: null,
          benchmark: null,
        },
      },
      result: successfulResult,
    });
  });

  it("restores the last successful configuration for refine and retest", async () => {
    window.sessionStorage.setItem("epsilon.research-experiment.v1", JSON.stringify({
      symbol: "MSFT",
      hypothesis: "Momentum weakens after volatility expands.",
      updatedAt: "2026-08-10T19:00:00.000Z",
      test: {
        subjectSnapshot: "MSFT",
        hypothesisSnapshot: "Momentum persists.",
        method: "backtest",
        strategy: "moving_average",
        symbols: ["MSFT"],
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        initialCash: 75000,
        totalReturn: 4,
        sharpe: 0.8,
        maxDrawdown: -6,
        tradeCount: 12,
        completedAt: "2026-08-10T19:00:00.000Z",
        provenance: UNKNOWN_BACKTEST_PROVENANCE,
      },
    }));

    renderBacktestForm();

    expect(await screen.findByDisplayValue("Momentum weakens after volatility expands.")).toBeTruthy();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("moving_average");
    expect(screen.getByDisplayValue("2023-01-01")).toBeTruthy();
    expect(screen.getByDisplayValue("2023-12-31")).toBeTruthy();
    expect(screen.getByDisplayValue("MSFT")).toBeTruthy();
    expect(screen.getByDisplayValue("75000")).toBeTruthy();
    expect(screen.getByText(/Needs retest/)).toBeTruthy();
  });

  it("renders the full server trade ledger without truncating entries after 100", async () => {
    const trades = Array.from({ length: 101 }, (_, index) => ({
      date: "2024-02-01",
      stock_code: `T${index + 1}`,
      stock_name: `Test Company ${index + 1}`,
      trade_type: "Buy",
      shares: index + 1,
      price: index + 0.5,
      total_amount: index + 100.25,
    }));
    mocks.backtest.mockResolvedValueOnce({ ...successfulResult, trades });
    renderBacktestForm();

    fireEvent.click(screen.getByRole("button", { name: "Run Backtest" }));

    await screen.findByText("Trade Results (101 trades)");
    expect(screen.getByText("Test Company 101")).toBeTruthy();
    expect(screen.getByText("$200.25")).toBeTruthy();
  });
});
