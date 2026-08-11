"use client";

import React from "react";
import { PerformanceData } from "@/lib/api";

interface AccountSummaryProps {
  data: PerformanceData | null;
  loading?: boolean;
  state?: "idle" | "loading" | "ready" | "empty" | "error";
}

export default function AccountSummary({ data, loading, state = data ? "ready" : "empty" }: AccountSummaryProps) {
  const cards = data
    ? [
        { label: "Portfolio Value", value: `$${data.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, accent: false },
        { label: "Cash", value: `$${data.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, accent: false },
        { label: "Total Return", value: `${data.total_return >= 0 ? "+" : ""}${data.total_return.toFixed(2)}%`, isPositive: data.total_return > 0, isNegative: data.total_return < 0 },
        { label: "Unrealized P&L", value: `${data.unrealized_pnl >= 0 ? "+" : ""}$${Math.abs(data.unrealized_pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, isPositive: data.unrealized_pnl > 0, isNegative: data.unrealized_pnl < 0 },
        { label: "Win Rate", value: `${data.win_rate.toFixed(1)}%`, accent: false },
        { label: "Profit Factor", value: data.profit_factor === 999.99 ? "∞" : data.profit_factor.toFixed(2), accent: false },
        { label: "Max Drawdown", value: `${data.max_drawdown.toFixed(2)}%`, isNegative: data.max_drawdown < 0 },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-base-300 bg-base-200/50 sm:grid-cols-4 lg:grid-cols-8">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="border-b border-r border-base-300/70 p-3 last:border-r-0 lg:border-b-0" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="skeleton h-3 w-16" />
            <div className="skeleton mt-2 h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="surface-card px-4 py-3 text-sm text-warning">
        Account performance is not confirmed. No account metrics are shown until the source responds.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-base-300/90 bg-base-200/55 shadow-[0_12px_32px_rgba(0,0,0,0.08)] sm:grid-cols-4 lg:grid-cols-8">
      {cards.map((card, i) => (
        <div key={card.label} className={`min-w-0 border-b border-r border-base-300/70 px-3 py-3 last:border-r-0 sm:nth-[4n]:border-r-0 lg:border-b-0 lg:nth-[4n]:border-r lg:nth-[7n]:border-r-0 ${i === 0 ? "lg:col-span-2 lg:px-4" : ""}`}>
          <div className="font-mono text-2xs uppercase tracking-[0.12em] text-base-content/40 truncate">{card.label}</div>
          <div className={`mt-1 font-mono font-semibold truncate ${i === 0 ? "text-base" : "text-sm"} ${
            card.isPositive ? "text-success" : card.isNegative ? "text-error" : "text-base-content"
          }`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
