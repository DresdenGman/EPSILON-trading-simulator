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
          <div key={i} className="surface-card p-4 animate-shimmer" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="skeleton h-3 w-16 mb-2.5" />
            <div className="skeleton h-6 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <div key={card.label} className="surface-card p-4 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="text-secondary text-2xs uppercase tracking-wide mb-1.5">{card.label}</div>
          <div className={`text-lg font-bold font-mono tracking-tight ${
            card.isPositive ? "text-accent" : card.isNegative ? "text-danger" : "text-text-primary"
          }`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
