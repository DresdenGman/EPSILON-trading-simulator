"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { api, StockPrice, PortfolioPosition, PerformanceData, TradeRecord, Order, KlineData } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import AccountSummary from "@/components/trading/AccountSummary";
import StockPicker from "@/components/trading/StockPicker";
import TradingPanel from "@/components/trading/TradingPanel";
import KlineChartComponent from "@/components/trading/KlineChart";
import PortfolioTable from "@/components/trading/PortfolioTable";
import OrderList from "@/components/trading/OrderList";
import TradeHistory from "@/components/trading/TradeHistory";
import EquityChart from "@/components/trading/EquityChart";
import ExperimentHeader from "@/components/experiment/ExperimentHeader";
import SensitivitySummary from "@/components/experiment/SensitivitySummary";
import type { SensitivityRun } from "@/components/experiment/SensitivitySummary";
import ExperimentConclusion from "@/components/experiment/ExperimentConclusion";
import { diagnoseExperiment } from "@/lib/experiment";
import { useResearchExperiment } from "@/components/research/ResearchContext";
import Link from "next/link";
import { ArrowRight, ExternalLink, RefreshCw } from "lucide-react";

const AUTO_REFRESH_MS = 30000;
type ResourceState = "idle" | "loading" | "ready" | "empty" | "error";
type ReconciliationState = "reconciled" | "stale";
const VALIDATION_CONFIG = {
  strategy: "momentum",
  stockCodes: ["AAPL", "MSFT", "NVDA"],
  initialCash: 100000,
  feeRate: 0.0001,
  minFee: 1,
  baselineSlippage: 0.01,
  epsilonSlippage: 0.02,
};

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { isAuthenticated, isGuest } = useAuth();
  const { experiment, testState, setSubject, setHypothesis, setFalsification } = useResearchExperiment();

  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockPrice | null>(null);
  const [klineData, setKlineData] = useState<KlineData | null>(null);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [equityData, setEquityData] = useState<{ date: string; equity: number }[]>([]);
  const [equityInitialCapital, setEquityInitialCapital] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [marketState, setMarketState] = useState<ResourceState>("idle");
  const [klineState, setKlineState] = useState<ResourceState>("idle");
  const [portfolioState, setPortfolioState] = useState<ResourceState>("idle");
  const [performanceState, setPerformanceState] = useState<ResourceState>("idle");
  const [ordersState, setOrdersState] = useState<ResourceState>("idle");
  const [tradesState, setTradesState] = useState<ResourceState>("idle");
  const [equityState, setEquityState] = useState<ResourceState>("idle");
  const [sensitivityStatus, setSensitivityStatus] = useState<"pending" | "running" | "validated" | "inconclusive" | "failed">("pending");
  const [sensitivityBaseline, setSensitivityBaseline] = useState<SensitivityRun | null>(null);
  const [sensitivityPerturbed, setSensitivityPerturbed] = useState<SensitivityRun | null>(null);
  const [sensitivityConclusion, setSensitivityConclusion] = useState<"preserved" | "reversed" | null>(null);
  const [sensitivityError, setSensitivityError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStocks = useCallback(async () => {
    setMarketState("loading");
    try {
      const data = await api.getStockPrices();
      setStocks(data);
      setMarketState(data.length > 0 ? "ready" : "empty");
      if (data.length > 0 && !selectedCode) {
        setSelectedCode(data[0].code);
        setSelectedStock(data[0]);
      }
    } catch (e) {
      console.error("Failed to fetch stocks:", e);
      setMarketState("error");
    }
  }, [selectedCode]);

  const fetchKline = useCallback(async (code: string) => {
    setKlineState("loading");
    try {
      const data = await api.getKline(code, 90);
      setKlineData(data);
      setKlineState(data.dates.length > 0 ? "ready" : "empty");
      const stock = stocks.find((s) => s.code === code) || null;
      setSelectedStock(stock);
    } catch (e) {
      console.error("Failed to fetch kline:", e);
      setKlineState("error");
    }
  }, [stocks]);

  const fetchPortfolioData = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setPortfolioState("loading");
    setPerformanceState("loading");
    setTradesState("loading");
    setOrdersState("loading");
    setEquityState("loading");

    const [portfolioResult, performanceResult, tradeResult, orderResult, equityResult] = await Promise.allSettled([
      api.getPortfolio(),
      api.getPerformance(),
      api.getTradeHistory(),
      api.getOrders(),
      api.getEquityCurve(),
    ]);

    const portfolioReady = portfolioResult.status === "fulfilled";
    const performanceReady = performanceResult.status === "fulfilled";
    const tradesReady = tradeResult.status === "fulfilled";
    const ordersReady = orderResult.status === "fulfilled";
    const equityReady = equityResult.status === "fulfilled";

    if (portfolioReady) {
      setPositions(portfolioResult.value);
      setPortfolioState(portfolioResult.value.length > 0 ? "ready" : "empty");
    } else {
      setPortfolioState("error");
      console.error("Failed to fetch portfolio:", portfolioResult.reason);
    }
    if (performanceReady) {
      setPerformance(performanceResult.value);
      setPerformanceState("ready");
    } else {
      setPerformanceState("error");
      console.error("Failed to fetch performance:", performanceResult.reason);
    }
    if (tradesReady) {
      setTrades(tradeResult.value);
      setTradesState(tradeResult.value.length > 0 ? "ready" : "empty");
    } else {
      setTradesState("error");
      console.error("Failed to fetch trade history:", tradeResult.reason);
    }
    if (ordersReady) {
      setOrders(orderResult.value);
      setOrdersState(orderResult.value.length > 0 ? "ready" : "empty");
    } else {
      setOrdersState("error");
      console.error("Failed to fetch orders:", orderResult.reason);
    }
    if (equityReady) {
      setEquityInitialCapital(equityResult.value.initial_capital);
      setEquityData(
        equityResult.value.dates.map((d: string, i: number) => ({
          date: d,
          equity: equityResult.value.equity[i],
        }))
      );
      setEquityState(equityResult.value.dates.length > 0 ? "ready" : "empty");
    } else {
      setEquityState("error");
      console.error("Failed to fetch equity:", equityResult.reason);
    }

    const allReady = portfolioReady && performanceReady && tradesReady && ordersReady && equityReady;
    if (allReady) setLastUpdated(new Date());
    return allReady;
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  useEffect(() => {
    if (selectedCode) fetchKline(selectedCode);
  }, [selectedCode, fetchKline]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolioData();
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, fetchPortfolioData]);

  // Auto-refresh
  useEffect(() => {
    if (!isAuthenticated) return;
    intervalRef.current = setInterval(() => {
      fetchStocks();
      fetchPortfolioData();
    }, AUTO_REFRESH_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, fetchStocks, fetchPortfolioData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F5" || (e.metaKey && e.key === "r")) {
        // Let browser handle refresh naturally
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleStockSelect = (code: string) => {
    setSelectedCode(code);
    setSubject(code);
    const stock = stocks.find((s) => s.code === code) || null;
    setSelectedStock(stock);
  };

  useEffect(() => {
    if (selectedCode) setSubject(selectedCode);
  }, [selectedCode, setSubject]);

  const handleTradeExecuted = async (): Promise<ReconciliationState> => {
    const reconciled = await fetchPortfolioData();
    return reconciled ? "reconciled" : "stale";
  };

  const accountStates = [portfolioState, performanceState, ordersState, tradesState, equityState];
  const accountLoading = accountStates.some((state) => state === "loading");
  const accountErrors = accountStates.filter((state) => state === "error").length;
  const accountReady = accountStates.filter((state) => state === "ready" || state === "empty").length;
  const sourceErrors = accountErrors + (marketState === "error" ? 1 : 0) + (klineState === "error" ? 1 : 0);
  const dashboardState = loading && accountReady === 0
    ? "LOADING…"
    : accountLoading
      ? "REFRESHING…"
      : sourceErrors === accountStates.length + 2
        ? "DATA UNAVAILABLE"
        : sourceErrors > 0
          ? `PARTIAL DATA · ${sourceErrors} source${sourceErrors === 1 ? "" : "s"} unavailable`
          : accountReady > 0
            ? "DATA READY"
            : "DATA NOT CONFIRMED";

  const evidenceLabel = testState === "current"
    ? "EVIDENCE CURRENT"
    : testState === "stale"
      ? "RETEST REQUIRED"
      : experiment.hypothesis
        ? "THESIS UNTESTED"
        : "THESIS OPEN";
  const protocolSteps = [
    { index: "01", label: "Observe", detail: selectedCode ?? "Select market", complete: Boolean(selectedCode) },
    { index: "02", label: "Frame", detail: experiment.hypothesis ? "Thesis recorded" : "Define thesis", complete: Boolean(experiment.hypothesis) },
    { index: "03", label: "Test", detail: testState === "current" ? "Evidence current" : testState === "stale" ? "Evidence stale" : "Awaiting test", complete: testState === "current" },
    { index: "04", label: "Challenge", detail: experiment.falsification ? "Rejection rule set" : "Define rejection rule", complete: Boolean(experiment.falsification) },
  ];

  const diagnosis = sensitivityBaseline && sensitivityPerturbed
    ? diagnoseExperiment({
        baselineReturn: sensitivityBaseline.totalReturn,
        perturbedReturn: sensitivityPerturbed.totalReturn,
        baselineTrades: sensitivityBaseline.tradeCount,
        perturbedTrades: sensitivityPerturbed.tradeCount,
        parameter: "slippage_per_share",
        baselineParameter: sensitivityBaseline.slippagePerShare,
        perturbedParameter: sensitivityPerturbed.slippagePerShare,
      })
    : null;

  const runSensitivityValidation = async () => {
    setSensitivityStatus("running");
    setSensitivityError(null);
    setSensitivityBaseline(null);
    setSensitivityPerturbed(null);
    setSensitivityConclusion(null);

    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 90);
    const baseRequest = {
      strategy: VALIDATION_CONFIG.strategy,
      start_date: toDateString(start),
      end_date: toDateString(end),
      stock_codes: VALIDATION_CONFIG.stockCodes,
      initial_cash: VALIDATION_CONFIG.initialCash,
      fee_rate: VALIDATION_CONFIG.feeRate,
      min_fee: VALIDATION_CONFIG.minFee,
    };

    try {
      const [baselineResult, perturbedResult] = await Promise.all([
        api.backtest({ ...baseRequest, slippage_per_share: VALIDATION_CONFIG.baselineSlippage }),
        api.backtest({ ...baseRequest, slippage_per_share: VALIDATION_CONFIG.epsilonSlippage }),
      ]);
      const toRun = (result: typeof baselineResult, slippagePerShare: number): SensitivityRun => ({
        slippagePerShare,
        totalReturn: result.performance.total_return,
        sharpe: result.performance.sharpe,
        maxDrawdown: result.performance.max_drawdown,
        tradeCount: result.trades.length,
      });
      const baseline = toRun(baselineResult, VALIDATION_CONFIG.baselineSlippage);
      const perturbed = toRun(perturbedResult, VALIDATION_CONFIG.epsilonSlippage);
      setSensitivityBaseline(baseline);
      setSensitivityPerturbed(perturbed);

      if (baseline.tradeCount === 0 || perturbed.tradeCount === 0) {
        setSensitivityStatus("inconclusive");
        return;
      }
      const baselinePositive = baseline.totalReturn > 0;
      const perturbedPositive = perturbed.totalReturn > 0;
      setSensitivityConclusion(baselinePositive === perturbedPositive ? "preserved" : "reversed");
      setSensitivityStatus("validated");
    } catch (error) {
      setSensitivityStatus("failed");
      setSensitivityError(error instanceof Error ? error.message : "Backtest results unavailable.");
    }
  };

  // Authenticated dashboard — a decision workspace: observe → act → review → challenge
  return (
    <div className="space-y-3 min-h-[calc(100vh-5rem)] flex flex-col">
      <section aria-labelledby="research-thesis" className="overflow-hidden rounded-xl border border-base-300/90 bg-base-200/55 shadow-[0_14px_44px_rgba(0,0,0,0.12)]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="product-kicker">Decision workspace / {selectedCode ?? "market"}</span>
              <span className={`rounded-full border px-2 py-1 font-mono text-2xs uppercase tracking-[0.12em] ${testState === "current" ? "border-primary/30 bg-primary/5 text-primary" : testState === "stale" ? "border-warning/30 bg-warning/5 text-warning" : "border-base-300 text-base-content/45"}`}>
                {evidenceLabel}
              </span>
              {selectedStock && (
                <span className="ml-auto font-mono text-xs text-base-content/55">
                  ${selectedStock.price.toFixed(2)}
                  <span className={`ml-2 ${selectedStock.change_percent >= 0 ? "text-primary/80" : "text-error/80"}`}>
                    {selectedStock.change_percent >= 0 ? "+" : ""}{selectedStock.change_percent.toFixed(2)}%
                  </span>
                </span>
              )}
            </div>
            <h1 id="research-thesis" className="mt-3 text-xl font-semibold tracking-[-0.02em] text-base-content sm:text-2xl">
              {selectedCode ?? "Market"} research workspace
            </h1>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-base-content/45">
              Record the claim and rejection rule before running evidence. Results remain provisional until challenged.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="group block rounded-lg border border-base-300/80 bg-base-100/45 p-3 transition-colors focus-within:border-primary/60">
                <span className="metric-label">Hypothesis</span>
                <span className="mt-1 block text-2xs leading-4 text-base-content/40">Claim to be evaluated for {selectedCode ?? "this market"}</span>
                <textarea
                  id="research-hypothesis"
                  value={experiment.hypothesis}
                  onChange={(event) => setHypothesis(event.target.value)}
                  rows={2}
                  placeholder="Recent momentum persists after realistic execution costs."
                  className="mt-2 w-full resize-none bg-transparent text-sm leading-5 text-base-content outline-none placeholder:text-base-content/25"
                />
              </label>
              <label className="group block rounded-lg border border-base-300/80 bg-base-100/45 p-3 transition-colors focus-within:border-warning/60">
                <span className="font-mono text-2xs uppercase tracking-[0.14em] text-warning/80">Falsified if</span>
                <span className="mt-1 block text-2xs leading-4 text-base-content/40">Pre-committed rejection condition</span>
                <textarea
                  id="research-falsification"
                  value={experiment.falsification}
                  onChange={(event) => setFalsification(event.target.value)}
                  rows={2}
                  placeholder="The edge disappears out of sample or reverses under higher costs."
                  className="mt-2 w-full resize-none bg-transparent text-sm leading-5 text-base-content outline-none placeholder:text-base-content/25"
                />
              </label>
            </div>
          </div>

          <aside className="flex flex-col justify-between border-t border-base-300/80 bg-base-100/35 p-5 lg:border-l lg:border-t-0" aria-label="Research status and actions">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="metric-label">Workspace state</span>
                <span className={`h-2 w-2 rounded-full ${accountErrors > 0 ? "bg-warning" : accountLoading ? "animate-pulse bg-info" : "bg-primary"}`} />
              </div>
              <p className="mt-2 font-mono text-sm font-semibold text-base-content">{dashboardState}</p>
              <p className="mt-1 text-xs leading-5 text-base-content/40">
                {isGuest ? "Session-local simulation" : "Simulated environment"}
                {lastUpdated ? ` · synced ${lastUpdated.toLocaleTimeString()}` : " · awaiting first sync"}
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <Link href={selectedCode ? `/dashboard/backtest?symbols=${encodeURIComponent(selectedCode)}` : "/dashboard/backtest"} className="flex w-full items-center justify-between rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-content transition-colors hover:bg-primary/90">
                <span>Run controlled test</span><ArrowRight aria-hidden="true" size={14} strokeWidth={1.8} />
              </Link>
              <Link href="/dashboard/ai" className="flex w-full items-center justify-between rounded-md border border-base-300 bg-base-200/70 px-3 py-2.5 text-xs font-semibold text-base-content/70 transition-colors hover:border-primary/40 hover:text-primary">
                <span>Challenge this thesis</span><ExternalLink aria-hidden="true" size={13} strokeWidth={1.8} />
              </Link>
              <button onClick={() => { fetchStocks(); fetchPortfolioData(); }} className="flex w-full items-center justify-center gap-2 py-1.5 text-center font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35 hover:text-base-content/60">
                <RefreshCw aria-hidden="true" size={11} strokeWidth={1.8} /> Refresh evidence
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section aria-label="Experiment protocol" className="grid overflow-hidden rounded-xl border border-base-300/80 bg-base-200/35 sm:grid-cols-2 lg:grid-cols-4">
        {protocolSteps.map((step) => (
          <div key={step.index} className="relative border-b border-base-300/70 px-4 py-3 last:border-b-0 sm:nth-[2n-1]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0">
            <div className="flex items-center gap-2">
              <span className={`font-mono text-2xs ${step.complete ? "text-primary" : "text-base-content/30"}`}>{step.index}</span>
              <span className="text-xs font-semibold text-base-content/75">{step.label}</span>
              <span className={`ml-auto h-1.5 w-1.5 rounded-full ${step.complete ? "bg-primary" : "bg-base-content/15"}`} />
            </div>
            <p className="mt-1 truncate pl-6 text-2xs text-base-content/40">{step.detail}</p>
          </div>
        ))}
      </section>

      {/* Layer 1: decision context */}
      <section aria-labelledby="decision-context" className="shrink-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="product-kicker">Evidence strip</span>
          <h2 id="decision-context" className="text-xs font-semibold text-base-content/70">{isGuest ? "Observed account outcomes" : "Confirmed account evidence"}</h2>
          <span className="ml-auto font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">Outcome ≠ conclusion</span>
        </div>
        <AccountSummary data={performance} loading={loading || performanceState === "loading"} state={performanceState} />
      </section>

      {/* Layer 2: the primary action workspace */}
      <section aria-labelledby="action-workspace" className="flex flex-col gap-2 lg:flex-1 lg:min-h-[34rem]">
        <div className="flex items-center gap-2">
          <span className="product-kicker">Execution layer</span>
          <h2 id="action-workspace" className="text-xs font-semibold text-base-content/70">Market evidence and simulated action</h2>
          <span className="hidden text-2xs text-base-content/35 sm:inline">Select evidence, then prepare a simulated action.</span>
        </div>
        <div className="grid grid-cols-1 gap-2 lg:flex-1 lg:min-h-0 lg:grid-cols-12">
          {/* Left: Stock Picker */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
          <StockPicker stocks={stocks} selectedCode={selectedCode} onSelect={handleStockSelect} loading={loading || marketState === "loading"} state={marketState} />
          </div>

          {/* Center: K-line Chart */}
          <div className="lg:col-span-6 flex flex-col min-h-0">
            <div className="relative flex min-h-0 flex-1 flex-col">
              <KlineChartComponent data={klineData} loading={loading || klineState === "loading"} state={klineState} />
            </div>
          </div>

          {/* Right: Trading Panel */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <TradingPanel stock={selectedStock} onTradeExecuted={handleTradeExecuted} />
          </div>
        </div>
      </section>

      {/* Layer 3: consequence review */}
      <section aria-labelledby="consequence-review" className="shrink-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="product-kicker">02 / Challenge</span>
          <h2 id="consequence-review" className="text-xs font-semibold text-base-content/70">Evidence review</h2>
        </div>
        <p className="mb-2 text-2xs text-base-content/40">Account outcome, equity path, and execution record are shown together so a decision can be reviewed against confirmed evidence.</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:max-h-[32vh] lg:grid-cols-4">
          <div className="lg:min-h-0 lg:overflow-hidden">
            <PortfolioTable positions={positions} loading={loading || portfolioState === "loading"} state={portfolioState} />
          </div>
          <div className="lg:min-h-0 lg:overflow-hidden">
            <OrderList orders={orders} loading={loading || ordersState === "loading"} state={ordersState} onUpdate={fetchPortfolioData} />
          </div>
          <div className="lg:min-h-0 lg:overflow-hidden">
            <EquityChart data={equityData} initialCapital={equityInitialCapital ?? undefined} loading={loading || equityState === "loading"} state={equityState} />
          </div>
          <div className="lg:min-h-0 lg:overflow-hidden">
            <TradeHistory trades={trades} loading={loading || tradesState === "loading"} state={tradesState} />
          </div>
        </div>
      </section>

      {/* Layer 4: challenge the assumption — research remains a next step, not the trading workspace hero. */}
      <section aria-labelledby="challenge-assumption" className="shrink-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="product-kicker">03 / Interrogate</span>
          <h2 id="challenge-assumption" className="text-xs font-semibold text-base-content/70">Question the conclusion</h2>
          <Link href="/dashboard/ai" className="ml-auto text-2xs font-mono uppercase tracking-[0.12em] text-primary hover:underline">Interrogate this experiment →</Link>
        </div>
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
          <ExperimentHeader
            strategy="Momentum (2%)"
            universe={VALIDATION_CONFIG.stockCodes.join(" · ")}
            initialCash={VALIDATION_CONFIG.initialCash}
            feeRate={VALIDATION_CONFIG.feeRate}
            slippagePerShare={VALIDATION_CONFIG.baselineSlippage}
          />
          <SensitivitySummary
            totalReturn={performance?.total_return}
            status={sensitivityStatus}
            baseline={sensitivityBaseline}
            perturbed={sensitivityPerturbed}
            conclusion={sensitivityConclusion}
            error={sensitivityError}
            onRun={runSensitivityValidation}
          />
        </div>
        {diagnosis && sensitivityBaseline && sensitivityPerturbed && (
          <div className="mt-2"><ExperimentConclusion diagnosis={diagnosis} baseline={sensitivityBaseline} perturbed={sensitivityPerturbed} /></div>
        )}
      </section>
    </div>
  );
}
