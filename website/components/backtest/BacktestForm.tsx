"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, BacktestResult } from "@/lib/api";
import { GUEST_MODE } from "@/lib/guest-mode";
import { BacktestExportConfiguration, downloadBacktestResult } from "@/lib/backtest-export";
import { GUEST_BACKTEST_PROVENANCE, UNKNOWN_BACKTEST_PROVENANCE, useResearchExperiment } from "@/components/research/ResearchContext";

function normalizeStockCodes(value: string) {
  return Array.from(new Set(
    value
      .split(",")
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean)
  ));
}

type SubmittedConfiguration = BacktestExportConfiguration;

type AttemptStatus = "idle" | "running" | "failed" | "succeeded";

function configurationsMatch(left: SubmittedConfiguration, right: SubmittedConfiguration) {
  return (
    left.strategy === right.strategy &&
    left.startDate === right.startDate &&
    left.endDate === right.endDate &&
    left.initialCash === right.initialCash &&
    left.stockCodes.join(",") === right.stockCodes.join(",")
  );
}

export default function BacktestForm() {
  const { experiment, hydrated, testState, setHypothesis, setFalsification, recordBacktest } = useResearchExperiment();
  const searchParams = useSearchParams();
  const transferredSymbols = searchParams.get("symbols");
  const [strategy, setStrategy] = useState("momentum");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-06-30");
  const [stockCodes, setStockCodes] = useState("AAPL,MSFT,GOOGL");
  const [initialCash, setInitialCash] = useState(100000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [successfulConfiguration, setSuccessfulConfiguration] = useState<SubmittedConfiguration | null>(null);
  const [latestAttemptConfiguration, setLatestAttemptConfiguration] = useState<SubmittedConfiguration | null>(null);
  const [latestAttemptStatus, setLatestAttemptStatus] = useState<AttemptStatus>("idle");
  const [validationError, setValidationError] = useState("");
  const [attemptError, setAttemptError] = useState("");
  const restoredConfigurationRef = useRef(false);

  useEffect(() => {
    if (!hydrated || restoredConfigurationRef.current) return;
    restoredConfigurationRef.current = true;
    const selectedSymbols = normalizeStockCodes(transferredSymbols ?? "");
    if (experiment.test) {
      const restoredConfiguration = {
        strategy: experiment.test.strategy,
        startDate: experiment.test.startDate,
        endDate: experiment.test.endDate,
        stockCodes: experiment.test.symbols,
        initialCash: experiment.test.initialCash,
      };
      setStrategy(experiment.test.strategy);
      setStartDate(experiment.test.startDate);
      setEndDate(experiment.test.endDate);
      setInitialCash(experiment.test.initialCash);
      setStockCodes((selectedSymbols.length > 0 ? selectedSymbols : experiment.test.symbols).join(","));
      if (experiment.test.result) {
        setResult(experiment.test.result);
        setSuccessfulConfiguration(restoredConfiguration);
        setLatestAttemptConfiguration(restoredConfiguration);
        setLatestAttemptStatus("succeeded");
      }
      setValidationError("");
    } else if (selectedSymbols.length > 0) {
      setStockCodes(selectedSymbols.join(","));
      setValidationError("");
    } else if (experiment.symbol) {
      setStockCodes(experiment.symbol);
      setValidationError("");
    }
  }, [experiment.symbol, experiment.test, hydrated, transferredSymbols]);

  const configurationChanged = Boolean(
    result && successfulConfiguration && !configurationsMatch({
      strategy,
      startDate,
      endDate,
      stockCodes: normalizeStockCodes(stockCodes),
      initialCash,
    }, successfulConfiguration)
  );

  const handleRun = async () => {
    const normalizedStockCodes = normalizeStockCodes(stockCodes);
    if (normalizedStockCodes.length === 0) {
      setValidationError("Enter at least one stock code before running a backtest.");
      return;
    }
    if (!startDate || !endDate || startDate >= endDate) {
      setValidationError("End date must be after the start date.");
      return;
    }
    if (!Number.isFinite(initialCash) || initialCash <= 0) {
      setValidationError("Initial cash must be greater than zero.");
      return;
    }

    const attemptConfiguration = { strategy, startDate, endDate, stockCodes: normalizedStockCodes, initialCash };
    setLoading(true);
    setValidationError("");
    setAttemptError("");
    setLatestAttemptConfiguration(attemptConfiguration);
    setLatestAttemptStatus("running");
    try {
      const data = await api.backtest({
        strategy: attemptConfiguration.strategy,
        start_date: attemptConfiguration.startDate,
        end_date: attemptConfiguration.endDate,
        stock_codes: normalizedStockCodes,
        initial_cash: attemptConfiguration.initialCash,
      });
      setResult(data);
      setSuccessfulConfiguration(attemptConfiguration);
      recordBacktest({
        method: "backtest",
        strategy: attemptConfiguration.strategy,
        symbols: normalizedStockCodes,
        startDate: attemptConfiguration.startDate,
        endDate: attemptConfiguration.endDate,
        initialCash: attemptConfiguration.initialCash,
        totalReturn: data.performance.total_return,
        sharpe: data.performance.sharpe,
        maxDrawdown: data.performance.max_drawdown,
        tradeCount: data.trades.length,
        completedAt: new Date().toISOString(),
        result: data,
        provenance: GUEST_MODE ? GUEST_BACKTEST_PROVENANCE : UNKNOWN_BACKTEST_PROVENANCE,
      });
      setLatestAttemptStatus("succeeded");
    } catch (e: any) {
      setAttemptError(e.message || "Backtest failed");
      setLatestAttemptStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)]">
      <section className="lab-panel min-w-0 p-5 lg:p-6" aria-label="Experiment setup">
        <div className="mb-6 border-b border-base-300/70 pb-5">
          <p className="lab-section-kicker">01 / Define</p>
          <h3 className="mt-2 text-lg font-semibold text-base-content">Experiment setup</h3>
          <p className="mt-1 text-sm leading-5 text-base-content/55">These inputs define one controlled simulation.</p>
          <label htmlFor="strategy-hypothesis" className="lab-field-label mt-5">Current hypothesis</label>
          <textarea
            id="strategy-hypothesis"
            value={experiment.hypothesis}
            onChange={(event) => setHypothesis(event.target.value)}
            rows={3}
            placeholder="Record the claim this test is meant to challenge."
            className="lab-input mt-2 resize-y text-xs leading-5"
          />
          <label htmlFor="strategy-falsification" className="lab-field-label mt-4 text-warning/80">Falsified if</label>
          <textarea
            id="strategy-falsification"
            value={experiment.falsification}
            onChange={(event) => setFalsification(event.target.value)}
            rows={2}
            placeholder="Define the evidence that would make you reject or revise the claim."
            className="lab-input mt-2 resize-y text-xs leading-5 focus:border-warning/60"
          />
          {testState === "stale" && <p className="mt-3 text-xs leading-5 text-warning/85">Needs retest — the last successful result belongs to the previous subject, thesis, or rejection rule.</p>}
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="backtest-strategy" className="lab-field-label">Strategy</label>
            <select
              id="backtest-strategy"
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="lab-input"
            >
              <option value="buy_and_hold">Buy & Hold</option>
              <option value="moving_average">Moving Average (20-day)</option>
              <option value="momentum">Momentum (2%)</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="backtest-start-date" className="lab-field-label">Start date</label>
            <input
              id="backtest-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="lab-input"
            />
          </div>
          <div>
            <label htmlFor="backtest-end-date" className="lab-field-label">End date</label>
            <input
              id="backtest-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="lab-input"
            />
          </div>
          </div>
          <div>
            <label htmlFor="backtest-universe" className="lab-field-label">Universe (comma-separated stock codes)</label>
            <input
              id="backtest-universe"
              type="text"
              value={stockCodes}
              onChange={(e) => setStockCodes(e.target.value)}
              className="lab-input"
            />
          </div>
          <div>
            <label htmlFor="backtest-initial-cash" className="lab-field-label">Initial cash</label>
            <input
              id="backtest-initial-cash"
              type="number"
              value={initialCash}
              onChange={(e) => setInitialCash(Number(e.target.value))}
              className="lab-input"
            />
          </div>
          <div className="pt-2">
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-primary-content transition-colors hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Running..." : "Run Backtest"}
            </button>
          </div>
        </div>
        {validationError && <div className="mt-4 rounded-lg border border-error/25 bg-error/10 p-3 text-sm text-error">{validationError}</div>}
        {latestAttemptStatus === "running" && latestAttemptConfiguration && (
          <div role="status" className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary/90">
            Running {latestAttemptConfiguration.stockCodes.join(", ")} · {latestAttemptConfiguration.strategy.replaceAll("_", " ")}.
          </div>
        )}
        {latestAttemptStatus === "failed" && latestAttemptConfiguration && (
          <div role="alert" className="mt-4 rounded-lg border border-error/25 bg-error/10 p-3 text-sm text-error">
            <span className="font-semibold">Latest attempt failed: </span>
            {latestAttemptConfiguration.stockCodes.join(", ")} · {latestAttemptConfiguration.strategy.replaceAll("_", " ")}. {attemptError}
          </div>
        )}
        {latestAttemptStatus === "succeeded" && <p role="status" aria-live="polite" className="sr-only">Backtest complete. Result evidence is available for review.</p>}
      </section>

      <section className="lab-panel min-w-0 p-5 lg:p-6" aria-label="Experiment evidence">
        {!result && <div className="flex min-h-[360px] flex-col justify-between">
          <div>
            <p className="lab-section-kicker">02 / Run & inspect</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-base-content">A result is only useful when its evidence stays attached.</h3>
            <p className="lab-muted-copy mt-2 max-w-xl">Submit the controlled configuration at left. EPSILON keeps the measured outcome, trade-level evidence, and limits of the claim in one review surface.</p>
            <div className="mt-7 grid gap-px overflow-hidden rounded-lg border border-base-300/80 bg-base-300/70 sm:grid-cols-3" aria-label="Backtest evidence preview">
              {[
                { step: "01 / Measure", title: "Outcome", detail: "Return, drawdown, Sharpe, and win rate." },
                { step: "02 / Inspect", title: "Trade ledger", detail: "Every simulated entry, exit, and P&L." },
                { step: "03 / Challenge", title: "Boundaries", detail: "Source, sampling, friction, and validity limits." },
              ].map((item) => (
                <div key={item.title} className="bg-base-100/35 p-4">
                  <p className="font-mono text-2xs uppercase tracking-[0.14em] text-primary/75">{item.step}</p>
                  <p className="mt-3 text-sm font-semibold text-base-content">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-base-content/45">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7 flex items-center gap-3 border-t border-base-300/70 pt-4">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <p className="font-mono text-2xs uppercase tracking-[0.16em] text-base-content/45">Evidence remains bound to the exact submitted configuration.</p>
          </div>
        </div>}
      {result && (
        <div className="space-y-4">
          {configurationChanged && (
            <div role="status" className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              <span className="font-mono text-2xs uppercase tracking-[0.14em]">Configuration changed</span>
              <p className="mt-1">Displayed results belong to the previous successful run. Run the backtest again to evaluate the current configuration.</p>
            </div>
          )}
          {successfulConfiguration && (
            <section className="border-b border-base-300/70 pb-5" aria-label="Submitted backtest configuration">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between">
                <h4 className="font-semibold text-base-content">{configurationChanged || latestAttemptStatus === "running" || latestAttemptStatus === "failed" ? "Previous successful run" : "Submitted configuration"}</h4>
                <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="font-mono text-2xs uppercase tracking-[0.14em] text-primary/75">Inputs sent to the backtest service</span>
                  <button
                    type="button"
                    onClick={() => downloadBacktestResult(result, successfulConfiguration)}
                    disabled={latestAttemptStatus === "running"}
                    className="w-fit text-left text-xs font-medium text-primary transition-colors hover:text-primary/75 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Export result artifact (JSON)
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><div className="lab-field-label">Strategy</div><div className="mt-1 text-base-content">{result.strategy_name}</div></div>
                <div><div className="lab-field-label">Universe</div><div className="mt-1 font-mono text-base-content">{successfulConfiguration.stockCodes.join(", ")}</div></div>
                <div><div className="lab-field-label">Window</div><div className="mt-1 font-mono text-base-content">{successfulConfiguration.startDate} → {successfulConfiguration.endDate}</div></div>
                <div><div className="lab-field-label">Initial cash</div><div className="mt-1 font-mono text-base-content">${successfulConfiguration.initialCash.toLocaleString()}</div></div>
              </div>
              <div className="mt-4 grid overflow-hidden rounded-lg border border-base-300/80 text-xs sm:grid-cols-3" aria-label="Backtest evidence provenance">
                <div className="border-b border-base-300/80 bg-base-100/25 p-3 sm:border-b-0 sm:border-r">
                  <div className="lab-field-label">Result origin</div>
                  <div className="mt-1 text-base-content/80">{GUEST_MODE ? "Browser-local simulation engine" : "Backtest service response"}</div>
                </div>
                <div className="border-b border-base-300/80 bg-base-100/25 p-3 sm:border-b-0 sm:border-r">
                  <div className="lab-field-label">Data source / sampling</div>
                  <div className={`mt-1 ${GUEST_MODE ? "text-base-content/80" : "text-warning"}`}>{GUEST_MODE ? "Controlled synthetic path / daily observations" : "Not provided by service"}</div>
                </div>
                <div className="bg-base-100/25 p-3">
                  <div className="lab-field-label">Fees / slippage / fill / benchmark</div>
                  <div className="mt-1 text-warning">{GUEST_MODE ? "Controlled synthetic assumptions / not historical evidence" : "Not provided by service"}</div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-base-content/50">This controlled simulation describes this configuration only. It does not establish historical validity, live performance, profitability, or general robustness.</p>
            </section>
          )}
          <section aria-label="Result summary">
            <div className="mb-3 flex items-baseline justify-between gap-4"><p className="lab-section-kicker">03 / Inspect</p><p className="text-xs text-base-content/45">Measured from the submitted simulation</p></div>
          <div className="grid overflow-hidden rounded-lg border border-base-300/80 sm:grid-cols-3 xl:grid-cols-7">
            {[
              { label: "Strategy", value: result.strategy_name, color: "text-base-content" },
              { label: "Total Return", value: `${result.performance.total_return.toFixed(2)}%`, color: result.performance.total_return >= 0 ? "text-primary" : "text-error" },
              { label: "CAGR", value: `${result.performance.cagr.toFixed(2)}%`, color: "text-base-content" },
              { label: "Sharpe", value: result.performance.sharpe.toFixed(4), color: "text-base-content" },
              { label: "Max Drawdown", value: `${result.performance.max_drawdown.toFixed(2)}%`, color: "text-error" },
              { label: "Win Rate", value: `${result.performance.win_rate.toFixed(2)}%`, color: "text-base-content" },
              ...(Number.isFinite(result.performance.profit_factor)
                ? [{ label: "Profit Factor", value: result.performance.profit_factor.toFixed(2), color: "text-base-content" }]
                : []),
            ].map((card) => (
              <div key={card.label} className="border-b border-r border-base-300/80 bg-base-100/20 p-3 last:border-r-0 sm:nth-[3n]:border-r-0 xl:nth-[3n]:border-r xl:nth-[7n]:border-r-0">
                <div className="lab-field-label">{card.label}</div>
                <div className={`mt-2 text-base font-semibold ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>
          </section>

          <div className="border-t border-base-300/70 pt-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><div><p className="lab-section-kicker">04 / Challenge</p><h4 className="mt-1 font-semibold text-base-content">Trade Results ({result.trades.length} trades)</h4></div><p className="text-xs text-base-content/45">Full server response</p></div>
            {result.trades.length === 0 && <p className="mb-3 text-sm text-base-content/55">0 trades were generated for this configuration.</p>}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-base-200">
                  <tr className="font-mono text-2xs uppercase tracking-[0.1em] text-base-content/45">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Symbol</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Shares</th>
                    <th className="text-right p-2">Price</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((trade, i) => (
                    <tr key={i} className="border-t border-base-300/70 transition-colors hover:bg-base-100/30">
                      <td className="p-2 text-base-content/55">{trade.date}</td>
                      <td className="p-2 font-medium text-base-content">
                        <div>{trade.stock_code}</div>
                        {trade.stock_name && <div className="mt-0.5 text-xs font-normal text-base-content/45">{trade.stock_name}</div>}
                      </td>
                      <td className={`p-2 font-medium ${trade.trade_type === "Buy" ? "text-primary" : "text-error"}`}>
                        {trade.trade_type}
                      </td>
                      <td className="p-2 text-right text-base-content">{trade.shares}</td>
                      <td className="p-2 text-right text-base-content/55">${trade.price.toFixed(2)}</td>
                      <td className="p-2 text-right text-base-content">${trade.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}
      </section>
      </div>
    </div>
  );
}
