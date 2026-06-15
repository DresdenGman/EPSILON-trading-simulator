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
import Link from "next/link";

const AUTO_REFRESH_MS = 30000;

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();

  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockPrice | null>(null);
  const [klineData, setKlineData] = useState<KlineData | null>(null);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [equityData, setEquityData] = useState<{ date: string; equity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [tradeFlash, setTradeFlash] = useState<"buy" | "sell" | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStocks = useCallback(async () => {
    try {
      const data = await api.getStockPrices();
      setStocks(data);
      if (data.length > 0 && !selectedCode) {
        setSelectedCode(data[0].code);
        setSelectedStock(data[0]);
      }
    } catch (e) {
      console.error("Failed to fetch stocks:", e);
    }
  }, [selectedCode]);

  const fetchKline = useCallback(async (code: string) => {
    try {
      const data = await api.getKline(code, 90);
      setKlineData(data);
      const stock = stocks.find((s) => s.code === code) || null;
      setSelectedStock(stock);
    } catch (e) {
      console.error("Failed to fetch kline:", e);
    }
  }, [stocks]);

  const fetchPortfolioData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [pos, perf, tradeHistory, orderList, equity] = await Promise.all([
        api.getPortfolio(),
        api.getPerformance(),
        api.getTradeHistory(),
        api.getOrders(),
        api.getEquityCurve(),
      ]);
      setPositions(pos);
      setPerformance(perf);
      setTrades(tradeHistory);
      setOrders(orderList);
      setEquityData(
        equity.dates.map((d: string, i: number) => ({
          date: d,
          equity: equity.equity[i],
        }))
      );
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch portfolio:", e);
    }
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
    const stock = stocks.find((s) => s.code === code) || null;
    setSelectedStock(stock);
  };

  const handleTradeExecuted = (side?: "buy" | "sell") => {
    if (side) {
      setTradeFlash(side);
      setTimeout(() => setTradeFlash(null), 1000);
    }
    fetchPortfolioData();
  };

  // Welcome screen (not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
        <div className="max-w-3xl text-center space-y-8 animate-fade-in-up">
          {/* Hero */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              Live Market Data
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
              Trade Smarter.<br />
              <span className="text-gradient-accent">Analyze Deeper.</span>
            </h1>
            <p className="text-secondary text-lg max-w-xl mx-auto leading-relaxed">
              EPSILON is an institutional-grade trading simulator. Practice with real-time data, advanced analytics, and AI-powered strategy insights — risk-free.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: "📊", title: "Live Trading", desc: "15 US stocks with real-time price simulation" },
              { icon: "🤖", title: "AI Advisor", desc: "DeepSeek-powered strategy analysis and insights" },
              { icon: "📈", title: "Backtesting", desc: "Test strategies on historical data with metrics" },
            ].map((f) => (
              <div key={f.title} className="surface-card p-5 text-left hover:border-accent/20 transition-all duration-250 group">
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform duration-250">{f.icon}</div>
                <h3 className="text-text-primary font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-muted text-2xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-all shadow-glow-accent-sm hover:shadow-glow-accent active:scale-[0.98] text-center"
            >
              Start Trading Free
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-8 py-3 surface-card text-text-primary font-medium rounded-xl hover:border-white/10 transition-all text-center"
            >
              Sign In
            </Link>
          </div>

          <p className="text-muted text-2xs pt-2">
            No real money. No risk. Pure education.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated dashboard
  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text-primary">Dashboard</h1>
          {lastUpdated && (
            <p className="text-2xs text-muted mt-0.5">
              Updated {lastUpdated.toLocaleTimeString()} · Auto-refresh every 30s
            </p>
          )}
        </div>
        <button
          onClick={() => { fetchStocks(); fetchPortfolioData(); }}
          className="px-3 py-1.5 text-2xs text-muted hover:text-text-primary border border-white/5 hover:border-white/10 rounded-lg transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Trade flash overlay */}
      {tradeFlash && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`text-6xl font-bold animate-fade-in ${
            tradeFlash === "buy" ? "text-accent" : "text-danger"
          }`} style={{ animationDuration: "0.8s" }}>
            {tradeFlash === "buy" ? "BOUGHT" : "SOLD"}
          </div>
        </div>
      )}

      <AccountSummary data={performance} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-2">
          <StockPicker stocks={stocks} selectedCode={selectedCode} onSelect={handleStockSelect} loading={loading} />
        </div>
        <div className="lg:col-span-7">
          <KlineChartComponent data={klineData} loading={loading} />
        </div>
        <div className="lg:col-span-3">
          <TradingPanel stock={selectedStock} onTradeExecuted={handleTradeExecuted} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PortfolioTable positions={positions} loading={loading} />
        <OrderList orders={orders} loading={loading} onUpdate={fetchPortfolioData} />
      </div>

      <EquityChart data={equityData} loading={loading} />

      <TradeHistory trades={trades} loading={loading} />
    </div>
  );
}
