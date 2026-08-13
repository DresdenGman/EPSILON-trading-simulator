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
import { useResearchExperiment } from "@/components/research/ResearchContext";
import { getResearchNextStep } from "@/lib/research-workflow";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";

const AUTO_REFRESH_MS = 30000;
type ResourceState = "idle" | "loading" | "ready" | "empty" | "error";
type ReconciliationState = "reconciled" | "stale";

export default function DashboardPage() {
  const { isAuthenticated, isGuest } = useAuth();
  const { experiment, hydrated, testState, setSubject, setHypothesis, setFalsification } = useResearchExperiment();

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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const selectionInitializedRef = useRef(false);

  const fetchStocks = useCallback(async () => {
    setMarketState("loading");
    try {
      const data = await api.getStockPrices();
      setStocks(data);
      setMarketState(data.length > 0 ? "ready" : "empty");
    } catch (e) {
      console.error("Failed to fetch stocks:", e);
      setMarketState("error");
    }
  }, []);

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
    if (!hydrated || selectionInitializedRef.current || stocks.length === 0) return;
    selectionInitializedRef.current = true;
    const activeStock = experiment.symbol ? stocks.find((stock) => stock.code === experiment.symbol) : null;
    const initialStock = activeStock ?? stocks[0];
    setSelectedCode(initialStock.code);
    setSelectedStock(initialStock);
    if (!experiment.symbol) setSubject(initialStock.code);
  }, [experiment.symbol, hydrated, setSubject, stocks]);

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
  const nextStep = getResearchNextStep({
    hypothesis: experiment.hypothesis,
    falsification: experiment.falsification,
    testState,
    symbol: selectedCode,
  });
  const hasAccountActivity = positions.length > 0 || trades.length > 0 || orders.some((order) => order.status === "pending");

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

          <aside className="flex flex-col justify-between border-t border-base-300/80 bg-base-100/35 p-5 lg:border-l lg:border-t-0" aria-label="Next research step">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="product-kicker">Next / {nextStep.index}</span>
                <span className="font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">{nextStep.stage}</span>
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-6 text-base-content">{nextStep.title}</h2>
              <p className="mt-2 text-xs leading-5 text-base-content/45">{nextStep.description}</p>
            </div>
            <div className="mt-6">
              <Link href={nextStep.href} className="flex w-full items-center justify-between rounded-md bg-primary px-3 py-2.5 text-xs font-semibold text-primary-content transition-colors hover:bg-primary/90">
                <span>{nextStep.action}</span><ArrowRight aria-hidden="true" size={14} strokeWidth={1.8} />
              </Link>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-base-300/70 pt-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-2xs font-semibold text-base-content/55">{dashboardState}</p>
                  <p className="mt-0.5 truncate text-2xs text-base-content/35">
                    {isGuest ? "Local workspace" : "Simulated environment"}
                    {lastUpdated ? ` · ${lastUpdated.toLocaleTimeString()}` : " · awaiting sync"}
                  </p>
                </div>
                <button type="button" aria-label="Refresh workspace evidence" onClick={() => { fetchStocks(); fetchPortfolioData(); }} className="rounded-md border border-base-300 p-2 text-base-content/35 transition-colors hover:border-primary/30 hover:text-primary">
                  <RefreshCw aria-hidden="true" size={12} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Primary action workspace */}
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

      {/* Consequence review appears only after the workspace contains execution evidence. */}
      <section aria-labelledby="consequence-review" className="shrink-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="product-kicker">Account evidence</span>
          <h2 id="consequence-review" className="text-xs font-semibold text-base-content/70">Review simulated consequences</h2>
          {hasAccountActivity && <span className="ml-auto font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">Outcome ≠ conclusion</span>}
        </div>
        {!hasAccountActivity ? (
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-dashed border-base-300 bg-base-200/25 px-4 py-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-base-content/70">
                {accountErrors > 0 ? "Account evidence is not available." : accountLoading ? "Checking account evidence…" : "No execution evidence yet."}
              </p>
              <p className="mt-1 text-xs leading-5 text-base-content/40">
                {accountErrors > 0
                  ? "EPSILON does not infer positions or outcomes when the account source cannot be confirmed."
                  : "A simulated trade or pending order will create the portfolio, equity, and execution review here."}
              </p>
            </div>
            <span className="shrink-0 font-mono text-2xs uppercase tracking-[0.14em] text-base-content/30">Waiting for an action</span>
          </div>
        ) : (
          <div className="space-y-2">
            <AccountSummary data={performance} loading={loading || performanceState === "loading"} state={performanceState} />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <PortfolioTable positions={positions} loading={loading || portfolioState === "loading"} state={portfolioState} />
              <OrderList orders={orders} loading={loading || ordersState === "loading"} state={ordersState} onUpdate={fetchPortfolioData} />
              <EquityChart data={equityData} initialCapital={equityInitialCapital ?? undefined} loading={loading || equityState === "loading"} state={equityState} />
              <TradeHistory trades={trades} loading={loading || tradesState === "loading"} state={tradesState} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
