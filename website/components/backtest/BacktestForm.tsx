"use client";

import React, { useState } from "react";
import { api, BacktestResult } from "@/lib/api";

export default function BacktestForm() {
  const [strategy, setStrategy] = useState("momentum");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-06-30");
  const [stockCodes, setStockCodes] = useState("AAPL,MSFT,GOOGL");
  const [initialCash, setInitialCash] = useState(100000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState("");

  const handleRun = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.backtest({
        strategy,
        start_date: startDate,
        end_date: endDate,
        stock_codes: stockCodes.split(",").map((s) => s.trim()),
        initial_cash: initialCash,
      });
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Backtest failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
        <h3 className="text-white font-semibold mb-4">Backtest Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label className="text-xs text-[#64748B] block mb-1">Stock Codes (comma-separated)</label>
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
          <div className="flex items-end">
            <button
              onClick={handleRun}
              disabled={loading}
              className="w-full py-2 bg-[#00D09C] text-black font-semibold rounded-lg hover:bg-[#00B386] transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Running..." : "Run Backtest"}
            </button>
          </div>
        </div>
        {error && <div className="mt-4 text-sm text-[#F0616D] bg-[#F0616D]/10 p-3 rounded-lg">{error}</div>}
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Strategy", value: result.strategy_name, color: "text-white" },
              { label: "Total Return", value: `${result.performance.total_return.toFixed(2)}%`, color: result.performance.total_return >= 0 ? "text-[#00D09C]" : "text-[#F0616D]" },
              { label: "CAGR", value: `${result.performance.cagr.toFixed(2)}%`, color: "text-white" },
              { label: "Sharpe", value: result.performance.sharpe.toFixed(4), color: "text-white" },
              { label: "Max Drawdown", value: `${result.performance.max_drawdown.toFixed(2)}%`, color: "text-[#F0616D]" },
              { label: "Win Rate", value: `${result.performance.win_rate.toFixed(2)}%`, color: "text-white" },
            ].map((card) => (
              <div key={card.label} className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4">
                <div className="text-[#64748B] text-xs mb-1">{card.label}</div>
                <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
            <h4 className="text-white font-semibold mb-3">Trade Results ({result.trades.length} trades)</h4>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0F172A]">
                  <tr className="text-[#64748B] text-xs uppercase">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Symbol</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-right p-2">Shares</th>
                    <th className="text-right p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.slice(0, 100).map((trade, i) => (
                    <tr key={i} className="border-t border-[#1E293B] hover:bg-white/[0.02]">
                      <td className="p-2 text-[#94A3B8]">{trade.date}</td>
                      <td className="p-2 text-white font-medium">{trade.stock_code}</td>
                      <td className={`p-2 font-medium ${trade.trade_type === "Buy" ? "text-[#00D09C]" : "text-[#F0616D]"}`}>
                        {trade.trade_type}
                      </td>
                      <td className="p-2 text-right text-white">{trade.shares}</td>
                      <td className="p-2 text-right text-[#94A3B8]">${trade.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
