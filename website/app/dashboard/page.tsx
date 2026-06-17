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
  const autoSelected = useRef(false);

  const fetchStocks = useCallback(async () => {
    try {
      const data = await api.getStockPrices();
      setStocks(data);
      if (data.length > 0 && !autoSelected.current) {
        autoSelected.current = true;
        setSelectedCode(data[0].code);
        setSelectedStock(data[0]);
      }
    } catch (e) {
      console.error("Failed to fetch stocks:", e);
    }
  }, []);

  const fetchKline = useCallback(async (code: string) => {
    try {
      const data = await api.getKline(code, 90);
      setKlineData(data);
    } catch (e) {
      console.error("Failed to fetch kline:", e);
    }
  }, []);

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

  // Dashboard — demo mode, always shown
  return (
    <div className="space-y-2 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-base-content uppercase tracking-wide">Dashboard</h1>
          {lastUpdated && (
            <span className="text-2xs text-base-content/30">
              Updated {lastUpdated.toLocaleTimeString()} · Auto 30s
            </span>
          )}
        </div>
        <button
          onClick={() => { fetchStocks(); fetchPortfolioData(); }}
          className="btn btn-ghost btn-xs text-base-content/40"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Trade flash overlay */}
      {tradeFlash && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`text-6xl font-bold animate-fade-in ${tradeFlash === "buy" ? "text-primary" : "text-error"}`} style={{ animationDuration: "0.8s" }}>
            {tradeFlash === "buy" ? "BOUGHT" : "SOLD"}
          </div>
        </div>
      )}

      {/* Account Summary — compact */}
      <div className="shrink-0">
        <AccountSummary data={performance} loading={loading} />
      </div>

      {/* Main trading area — fills remaining height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-1.5 flex-1 min-h-0">
        {/* Left: Stock Picker */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <StockPicker stocks={stocks} selectedCode={selectedCode} onSelect={handleStockSelect} loading={loading} />
        </div>

        {/* Center: K-line Chart */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <KlineChartComponent data={klineData} loading={loading} />
        </div>

        {/* Right: Trading Panel */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <TradingPanel stock={selectedStock} onTradeExecuted={handleTradeExecuted} />
        </div>
      </div>

      {/* Bottom row: Portfolio + Equity + History — 3 equal columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1.5 shrink-0" style={{ maxHeight: "24vh" }}>
        <div className="min-h-0 overflow-hidden">
          <PortfolioTable positions={positions} loading={loading} />
        </div>
        <div className="min-h-0 overflow-hidden">
            <EquityChart data={equityData} loading={loading} />
        </div>
        <div className="min-h-0 overflow-hidden">
          <TradeHistory trades={trades} loading={loading} />
        </div>
      </div>
    </div>
  );
}
