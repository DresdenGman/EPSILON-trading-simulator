"use client";

import React from "react";
import { PerformanceData } from "@/lib/api";

interface AccountSummaryProps {
  data: PerformanceData | null;
  loading?: boolean;
}

export default function AccountSummary({ data, loading }: AccountSummaryProps) {
  const cards = data
    ? [
        { label: "Portfolio Value", value: `$${data.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, accent: false },
        { label: "Cash", value: `$${data.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, accent: false },
        { label: "Total Return", value: `${data.total_return >= 0 ? "+" : ""}${data.total_return.toFixed(2)}%`, isPositive: data.total_return >= 0, isNegative: data.total_return < 0 },
        { label: "Win Rate", value: `${data.win_rate.toFixed(1)}%`, accent: false },
        { label: "Profit Factor", value: data.profit_factor === 999.99 ? "∞" : data.profit_factor.toFixed(2), accent: false },
        { label: "Max Drawdown", value: `${data.max_drawdown.toFixed(2)}%`, isNegative: true },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full rounded-box" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <div key={card.label} className={`stat card-neumorph p-4 stagger-item stagger-${i+1}`}>
          <div className="stat-title text-xs">{card.label}</div>
          <div className={`stat-value text-lg font-mono ${
            card.isPositive ? "text-success" : card.isNegative ? "text-error" : "text-base-content"
          }`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
