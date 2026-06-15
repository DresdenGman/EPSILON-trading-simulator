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
import Particles from "@/components/effects/Particles";
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Canvas particles background */}
        <Particles quantity={30} color="100,255,218" staticMode={false} />

        {/* Floating blobs */}
        <div className="absolute -z-10 opacity-15">
          <div className="w-96 h-96 rounded-full bg-primary blur-3xl animate-blob absolute -top-32 -left-32" style={{ animationDelay: '0s' }} />
          <div className="w-72 h-72 rounded-full bg-secondary blur-3xl animate-blob absolute top-20 right-0" style={{ animationDelay: '3s' }} />
          <div className="w-80 h-80 rounded-full bg-accent blur-3xl animate-blob absolute -bottom-20 left-1/4" style={{ animationDelay: '6s' }} />
        </div>

        <div className="max-w-3xl text-center space-y-8">
          {/* Hero with edge-outline title */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live Market Data
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Trade Smarter.<br />
              <span className="text-gradient-accent text-edge-outline">Analyze Deeper.</span>
            </h1>
            <p className="text-base-content/60 text-lg max-w-xl mx-auto leading-relaxed">
              EPSILON is an institutional-grade trading simulator. Practice with real-time data, advanced analytics, and AI-powered strategy insights — risk-free.
            </p>
          </div>

          {/* Feature cards — neumorphic */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { icon: "📊", title: "Live Trading", desc: "15 US stocks with real-time price simulation" },
              { icon: "🤖", title: "AI Advisor", desc: "DeepSeek-powered strategy analysis and insights" },
              { icon: "📈", title: "Backtesting", desc: "Test strategies on historical data with metrics" },
            ].map((f, i) => (
              <div key={f.title} className={`card-neumorph p-5 text-left stagger-item stagger-${i+1}`}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-base-content font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-base-content/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA — offset shadow buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 stagger-item stagger-6">
            <Link href="/auth/register" className="btn-offset-primary px-8 py-3 !text-sm !font-semibold no-underline">
              Start Trading Free
            </Link>
            <Link href="/auth/login" className="text-base-content/60 hover:text-base-content transition-colors text-sm font-medium">
              Sign In →
            </Link>
          </div>

          <p className="text-base-content/30 text-xs">No real money. No risk. Pure education.</p>
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

      <div className="divider-glow" />

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
