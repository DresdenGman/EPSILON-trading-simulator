"use client";

import React from "react";
import { TradeRecord } from "@/lib/api";

interface TradeHistoryProps {
  trades: TradeRecord[];
  loading?: boolean;
}

export default function TradeHistory({ trades, loading }: TradeHistoryProps) {
  if (loading) {
    return (
      <div className="surface-card p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-14" />
            <div className="skeleton h-4 w-10" />
            <div className="skeleton h-4 w-12 ml-auto" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/5">
        <h3 className="text-text-primary text-sm font-semibold">Trade History</h3>
      </div>
      {trades.length === 0 ? (
        <div className="p-8 text-center text-muted text-sm">
          <div className="text-2xl mb-2">📋</div>
          No trades yet. Execute your first trade to see history.
        </div>
      ) : (
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-raised z-10">
              <tr className="text-muted text-2xs uppercase tracking-wide">
                {["Date", "Symbol", "Type", "Shares", "Price", "Total", "Fee"].map((h) => (
                  <th key={h} className={h === "Date" || h === "Symbol" || h === "Type" ? "text-left font-medium px-4 py-2" : "text-right font-medium px-4 py-2"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-t border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 text-secondary text-xs">{trade.trade_date}</td>
                  <td className="px-4 py-2.5 text-text-primary font-semibold text-xs">{trade.stock_code}</td>
                  <td className={`px-4 py-2.5 text-xs font-semibold ${trade.trade_type === "buy" ? "text-accent" : "text-danger"}`}>
                    {trade.trade_type.toUpperCase()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-text-primary font-mono text-xs">{trade.shares}</td>
                  <td className="px-4 py-2.5 text-right text-secondary font-mono text-xs">${trade.price.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-text-primary font-mono text-xs">${trade.total_amount.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right text-muted font-mono text-xs">${trade.fee.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
