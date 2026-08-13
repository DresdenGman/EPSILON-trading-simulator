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
      setStrategy(experiment.test.strategy);
      setStartDate(experiment.test.startDate);
      setEndDate(experiment.test.endDate);
      setInitialCash(experiment.test.initialCash);
      setStockCodes((selectedSymbols.length > 0 ? selectedSymbols : experiment.test.symbols).join(","));
      setValidationError("");
    } else if (selectedSymbols.length > 0) {
      setStockCodes(selectedSymbols.join(","));
      setValidationError("");
    }
  }, [experiment.test, hydrated, transferredSymbols]);

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
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)]">
      <section className="border border-[#1E293B] bg-[#0F172A] p-5 lg:p-6" aria-label="Experiment setup">
        <div className="mb-6 border-b border-white/10 pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Define / Setup</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Experiment setup</h3>
          <p className="mt-1 text-sm leading-5 text-[#94A3B8]">These inputs define one controlled simulation.</p>
          <label htmlFor="strategy-hypothesis" className="mt-4 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Current hypothesis</label>
          <textarea
            id="strategy-hypothesis"
            value={experiment.hypothesis}
            onChange={(event) => setHypothesis(event.target.value)}
            rows={3}
            placeholder="Record the claim this test is meant to challenge."
            className="mt-2 w-full resize-y border border-[#334155] bg-[#111C30] px-3 py-2 text-xs leading-5 text-white outline-none placeholder:text-[#64748B] focus:border-[#00D09C]"
          />
          <label htmlFor="strategy-falsification" className="mt-4 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#FBBF24]">Falsified if</label>
          <textarea
            id="strategy-falsification"
            value={experiment.falsification}
            onChange={(event) => setFalsification(event.target.value)}
            rows={2}
            placeholder="Define the evidence that would make you reject or revise the claim."
            className="mt-2 w-full resize-y border border-[#334155] bg-[#111C30] px-3 py-2 text-xs leading-5 text-white outline-none placeholder:text-[#64748B] focus:border-[#FBBF24]"
          />
          {testState === "stale" && <p className="mt-2 text-xs leading-5 text-[#FDE68A]">Needs retest — the last successful result belongs to the previous subject, thesis, or rejection rule.</p>}
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#64748B] block mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
            >
              <option value="buy_and_hold">Buy & Hold</option>
              <option value="moving_average">Moving Average (20-day)</option>
              <option value="momentum">Momentum (2%)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[#64748B] block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748B] block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
            />
          </div>
          </div>
          <div>
            <label className="text-xs text-[#64748B] block mb-1">Universe (comma-separated stock codes)</label>
            <input
              type="text"
              value={stockCodes}
              onChange={(e) => setStockCodes(e.target.value)}
              className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748B] block mb-1">Initial Cash</label>
            <input
              type="number"
              value={initialCash}
              onChange={(e) => setInitialCash(Number(e.target.value))}
              className="w-full bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
            />
          </div>
          <div className="pt-2">
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full bg-[#00D09C] py-3 text-sm font-semibold text-black transition-colors hover:bg-[#37E8B8] disabled:opacity-50"
            >
              {loading ? "Running..." : "Run Backtest"}
            </button>
          </div>
        </div>
        {validationError && <div className="mt-4 text-sm text-[#F0616D] bg-[#F0616D]/10 p-3 rounded-lg">{validationError}</div>}
        {latestAttemptStatus === "running" && latestAttemptConfiguration && (
          <div role="status" className="mt-4 rounded-lg bg-[#00D09C]/10 p-3 text-sm text-[#A7F3D0]">
            Running {latestAttemptConfiguration.stockCodes.join(", ")} · {latestAttemptConfiguration.strategy.replaceAll("_", " ")}.
          </div>
        )}
        {latestAttemptStatus === "failed" && latestAttemptConfiguration && (
          <div role="alert" className="mt-4 rounded-lg bg-[#F0616D]/10 p-3 text-sm text-[#FCA5A5]">
            <span className="font-semibold">Latest attempt failed: </span>
            {latestAttemptConfiguration.stockCodes.join(", ")} · {latestAttemptConfiguration.strategy.replaceAll("_", " ")}. {attemptError}
          </div>
        )}
        {latestAttemptStatus === "succeeded" && <p role="status" aria-live="polite" className="sr-only">Backtest complete. Result evidence is available for review.</p>}
      </section>

      <section className="border border-[#1E293B] bg-[#0F172A] p-5 lg:p-6" aria-label="Experiment evidence">
        {!result && <div className="flex min-h-[360px] flex-col justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Run / Evidence</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">A result is only useful when its evidence stays attached.</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#94A3B8]">Submit the controlled configuration at left. EPSILON will keep the measured outcome, trade-level evidence, and the assumptions that limit the claim in one review surface.</p>
            <div className="mt-7 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3" aria-label="Backtest evidence preview">
              {[
                { step: "01 / Measure", title: "Outcome", detail: "Return, drawdown, Sharpe, and win rate." },
                { step: "02 / Inspect", title: "Trade ledger", detail: "Every simulated entry, exit, and P&L." },
                { step: "03 / Challenge", title: "Boundaries", detail: "Source, sampling, friction, and validity limits." },
              ].map((item) => (
                <div key={item.title} className="bg-[#0B1628] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#00D09C]">{item.step}</p>
                  <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#64748B]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-4">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D09C]" aria-hidden="true" />
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]">Evidence remains bound to the exact submitted configuration.</p>
          </div>
        </div>}
      {result && (
        <div className="space-y-4">
          {configurationChanged && (
            <div role="status" className="rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-4 py-3 text-sm text-[#FDE68A]">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Configuration changed</span>
              <p className="mt-1">Displayed results belong to the previous successful run. Run the backtest again to evaluate the current configuration.</p>
            </div>
          )}
          {successfulConfiguration && (
            <section className="border-b border-white/10 pb-4" aria-label="Submitted backtest configuration">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-white font-semibold">{configurationChanged || latestAttemptStatus === "running" || latestAttemptStatus === "failed" ? "Previous successful run" : "Submitted configuration"}</h4>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#00D09C]/70">Inputs sent to the backtest service</span>
                  <button
                    type="button"
                    onClick={() => downloadBacktestResult(result, successfulConfiguration)}
                    disabled={latestAttemptStatus === "running"}
                    className="text-xs font-medium text-[#00D09C] hover:text-[#A7F3D0] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Export result artifact (JSON)
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><div className="text-xs text-[#64748B]">Strategy</div><div className="mt-1 text-white">{result.strategy_name}</div></div>
                <div><div className="text-xs text-[#64748B]">Universe</div><div className="mt-1 font-mono text-white">{successfulConfiguration.stockCodes.join(", ")}</div></div>
                <div><div className="text-xs text-[#64748B]">Window</div><div className="mt-1 font-mono text-white">{successfulConfiguration.startDate} → {successfulConfiguration.endDate}</div></div>
                <div><div className="text-xs text-[#64748B]">Initial cash</div><div className="mt-1 font-mono text-white">${successfulConfiguration.initialCash.toLocaleString()}</div></div>
              </div>
              <div className="mt-4 grid border border-white/10 text-xs sm:grid-cols-3" aria-label="Backtest evidence provenance">
                <div className="border-b border-white/10 p-3 sm:border-b-0 sm:border-r">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Result origin</div>
                  <div className="mt-1 text-[#E2E8F0]">{GUEST_MODE ? "Guest simulation engine" : "Backtest service response"}</div>
                </div>
                <div className="border-b border-white/10 p-3 sm:border-b-0 sm:border-r">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Data source / sampling</div>
                  <div className={`mt-1 ${GUEST_MODE ? "text-[#E2E8F0]" : "text-[#FDE68A]"}`}>{GUEST_MODE ? "Controlled synthetic path / daily observations" : "Not provided by service"}</div>
                </div>
                <div className="p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">Fees / slippage / fill / benchmark</div>
                  <div className="mt-1 text-[#FDE68A]">{GUEST_MODE ? "Controlled synthetic assumptions / not historical evidence" : "Not provided by service"}</div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#94A3B8]">This controlled simulation describes this configuration only. It does not establish historical validity, live performance, profitability, or general robustness.</p>
            </section>
          )}
          <section aria-label="Result summary">
            <div className="mb-3 flex items-baseline justify-between gap-4"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Inspect / Result summary</p><p className="text-xs text-[#64748B]">Measured from the submitted simulation</p></div>
          <div className="grid grid-cols-2 border border-[#1E293B] sm:grid-cols-3 xl:grid-cols-7">
            {[
              { label: "Strategy", value: result.strategy_name, color: "text-white" },
              { label: "Total Return", value: `${result.performance.total_return.toFixed(2)}%`, color: result.performance.total_return >= 0 ? "text-[#00D09C]" : "text-[#F0616D]" },
              { label: "CAGR", value: `${result.performance.cagr.toFixed(2)}%`, color: "text-white" },
              { label: "Sharpe", value: result.performance.sharpe.toFixed(4), color: "text-white" },
              { label: "Max Drawdown", value: `${result.performance.max_drawdown.toFixed(2)}%`, color: "text-[#F0616D]" },
              { label: "Win Rate", value: `${result.performance.win_rate.toFixed(2)}%`, color: "text-white" },
              ...(Number.isFinite(result.performance.profit_factor)
                ? [{ label: "Profit Factor", value: result.performance.profit_factor.toFixed(2), color: "text-white" }]
                : []),
            ].map((card) => (
              <div key={card.label} className="border-b border-r border-[#1E293B] p-3 last:border-r-0 sm:nth-[3n]:border-r-0 xl:nth-[3n]:border-r xl:nth-[7n]:border-r-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#64748B]">{card.label}</div>
                <div className={`mt-2 text-base font-semibold ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>
          </section>

          <div className="border-t border-white/10 pt-5">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Challenge / Trade evidence</p><h4 className="mt-1 text-white font-semibold">Trade Results ({result.trades.length} trades)</h4></div><p className="text-xs text-[#64748B]">Full server response</p></div>
            {result.trades.length === 0 && <p className="mb-3 text-sm text-[#94A3B8]">0 trades were generated for this configuration.</p>}
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0F172A]">
                  <tr className="text-[#64748B] text-xs uppercase">
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
                    <tr key={i} className="border-t border-[#1E293B] hover:bg-white/[0.02]">
                      <td className="p-2 text-[#94A3B8]">{trade.date}</td>
                      <td className="p-2 text-white font-medium">
                        <div>{trade.stock_code}</div>
                        {trade.stock_name && <div className="mt-0.5 text-xs font-normal text-[#64748B]">{trade.stock_name}</div>}
                      </td>
                      <td className={`p-2 font-medium ${trade.trade_type === "Buy" ? "text-[#00D09C]" : "text-[#F0616D]"}`}>
                        {trade.trade_type}
                      </td>
                      <td className="p-2 text-right text-white">{trade.shares}</td>
                      <td className="p-2 text-right text-[#94A3B8]">${trade.price.toFixed(2)}</td>
                      <td className="p-2 text-right text-white">${trade.total_amount.toFixed(2)}</td>
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
