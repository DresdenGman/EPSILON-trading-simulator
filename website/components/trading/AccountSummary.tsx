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
        { label: "Portfolio Value", value: `$${data.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-white" },
        { label: "Cash", value: `$${data.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-white" },
        { label: "Total Return", value: `${data.total_return >= 0 ? "+" : ""}${data.total_return.toFixed(2)}%`, color: data.total_return >= 0 ? "text-[#00D09C]" : "text-[#F0616D]" },
        { label: "Win Rate", value: `${data.win_rate.toFixed(1)}%`, color: "text-white" },
        { label: "Profit Factor", value: data.profit_factor === 999.99 ? "∞" : data.profit_factor.toFixed(2), color: "text-white" },
        { label: "Max Drawdown", value: `${data.max_drawdown.toFixed(2)}%`, color: "text-[#F0616D]" },
      ]
    : [];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4 animate-pulse">
            <div className="h-3 w-16 bg-[#1E293B] rounded mb-2" />
            <div className="h-5 w-24 bg-[#1E293B] rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4">
          <div className="text-[#64748B] text-xs mb-1">{card.label}</div>
          <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
