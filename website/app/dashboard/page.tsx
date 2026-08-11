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

const AUTO_REFRESH_MS = 30000;
type ResourceState = "idle" | "loading" | "ready" | "empty" | "error";
type ReconciliationState = "reconciled" | "stale";
const FLAGSHIP_CONFIG = {
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
  const { isAuthenticated } = useAuth();
  const { experiment, setSubject, setHypothesis } = useResearchExperiment();

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
  const [tradeFlash, setTradeFlash] = useState<"buy" | "sell" | null>(null);
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

  const handleTradeExecuted = async (side?: "buy" | "sell"): Promise<ReconciliationState> => {
    if (side) {
      setTradeFlash(side);
      setTimeout(() => setTradeFlash(null), 1000);
    }
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
      strategy: FLAGSHIP_CONFIG.strategy,
      start_date: toDateString(start),
      end_date: toDateString(end),
      stock_codes: FLAGSHIP_CONFIG.stockCodes,
      initial_cash: FLAGSHIP_CONFIG.initialCash,
      fee_rate: FLAGSHIP_CONFIG.feeRate,
      min_fee: FLAGSHIP_CONFIG.minFee,
    };

    try {
      const [baselineResult, perturbedResult] = await Promise.all([
        api.backtest({ ...baseRequest, slippage_per_share: FLAGSHIP_CONFIG.baselineSlippage }),
        api.backtest({ ...baseRequest, slippage_per_share: FLAGSHIP_CONFIG.epsilonSlippage }),
      ]);
      const toRun = (result: typeof baselineResult, slippagePerShare: number): SensitivityRun => ({
        slippagePerShare,
        totalReturn: result.performance.total_return,
        sharpe: result.performance.sharpe,
        maxDrawdown: result.performance.max_drawdown,
        tradeCount: result.trades.length,
      });
      const baseline = toRun(baselineResult, FLAGSHIP_CONFIG.baselineSlippage);
      const perturbed = toRun(perturbedResult, FLAGSHIP_CONFIG.epsilonSlippage);
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
      {/* Experiment header — the selected instrument is the workspace subject. */}
      <div className="flex flex-col gap-3 border-b border-base-300/80 pb-3 sm:flex-row sm:items-end sm:justify-between shrink-0">
        <div className="min-w-0">
          <p className="product-kicker">Market observation / simulated environment</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="font-mono text-xl font-semibold tracking-tight text-base-content sm:text-2xl">
              {selectedCode ?? "MARKET"}<span className="text-base-content/30"> / </span>OBSERVATION
            </h1>
            <span className={`rounded-full border px-2 py-1 text-2xs font-mono uppercase tracking-[0.12em] ${accountErrors > 0 ? "border-warning/30 text-warning" : accountLoading ? "border-info/30 text-info" : "border-primary/20 text-primary/70"}`}>
              {dashboardState}
            </span>
          </div>
          <p className="mt-1 text-xs text-base-content/45">
            Select an instrument, frame a hypothesis, then test whether the evidence supports it.
            {lastUpdated ? ` Updated ${lastUpdated.toLocaleTimeString()} · Auto 30s.` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedCode && (
            <Link
              href={`/dashboard/backtest?symbols=${encodeURIComponent(selectedCode)}`}
              className="rounded-btn border border-primary/30 bg-primary/5 px-3 py-2 text-2xs font-mono uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/10"
            >
              Test {selectedCode} in Strategy Lab →
            </Link>
          )}
          <button
            onClick={() => { fetchStocks(); fetchPortfolioData(); }}
            className="btn btn-ghost btn-xs text-base-content/45"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <section aria-labelledby="research-frame" className="border border-base-300/80 bg-base-200/30 p-4 sm:flex sm:items-end sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="product-kicker">Research context</span>
            <h2 id="research-frame" className="text-xs font-semibold text-base-content/70">Frame the experiment</h2>
          </div>
          <label htmlFor="research-hypothesis" className="mt-2 block text-2xs text-base-content/45">What do you think is happening in {selectedCode ?? "this market"}?</label>
          <input
            id="research-hypothesis"
            value={experiment.hypothesis}
            onChange={(event) => setHypothesis(event.target.value)}
            placeholder="Example: recent momentum in this period is persistent enough to test."
            className="mt-1 w-full border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none transition-colors placeholder:text-base-content/30 focus:border-primary"
          />
        </div>
        <Link
          href={selectedCode ? `/dashboard/backtest?symbols=${encodeURIComponent(selectedCode)}` : "/dashboard/backtest"}
          className="mt-3 inline-flex shrink-0 rounded-btn border border-primary/30 bg-primary/5 px-3 py-2 text-2xs font-mono uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary/10 sm:mt-0"
        >
          Continue to test →
        </Link>
      </section>

      {/* Trade flash overlay */}
      {tradeFlash && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`text-6xl font-bold animate-fade-in ${tradeFlash === "buy" ? "text-primary" : "text-error"}`} style={{ animationDuration: "0.8s" }}>
            {tradeFlash === "buy" ? "BOUGHT" : "SOLD"}
          </div>
        </div>
      )}

      {/* Layer 1: decision context */}
      <section aria-labelledby="decision-context" className="shrink-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="product-kicker">Account context</span>
          <h2 id="decision-context" className="text-xs font-semibold text-base-content/70">Confirmed account state</h2>
        </div>
        <AccountSummary data={performance} loading={loading || performanceState === "loading"} state={performanceState} />
      </section>

      {/* Layer 2: the primary action workspace */}
      <section aria-labelledby="action-workspace" className="flex flex-col gap-2 lg:flex-1 lg:min-h-[34rem]">
        <div className="flex items-center gap-2">
          <span className="product-kicker">01 / Observe → execute</span>
          <h2 id="action-workspace" className="text-xs font-semibold text-base-content/70">Market decision workspace</h2>
          <span className="hidden text-2xs text-base-content/35 sm:inline">Select evidence, then prepare a simulated action.</span>
        </div>
        <div className="grid grid-cols-1 gap-2 lg:flex-1 lg:min-h-0 lg:grid-cols-12">
          {/* Left: Stock Picker */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
          <StockPicker stocks={stocks} selectedCode={selectedCode} onSelect={handleStockSelect} loading={loading || marketState === "loading"} state={marketState} />
          </div>

          {/* Center: K-line Chart */}
          <div className="lg:col-span-7 flex flex-col min-h-0">
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
            universe={FLAGSHIP_CONFIG.stockCodes.join(" · ")}
            initialCash={FLAGSHIP_CONFIG.initialCash}
            feeRate={FLAGSHIP_CONFIG.feeRate}
            slippagePerShare={FLAGSHIP_CONFIG.baselineSlippage}
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
