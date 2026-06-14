"use client";

import React from "react";
import { PerformanceData } from "@/lib/api";
import { GlassCard, GlassCardContent } from "@/components/ui/glass-card";
import { NumberTicker } from "@/components/ui/number-ticker";

interface AccountSummaryProps {
  data: PerformanceData | null;
  loading?: boolean;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: "green" | "red" | null }) {
  const colorClass =
    accent === "green" ? "text-[#00D09C]" : accent === "red" ? "text-[#F0616D]" : "text-white";
  return (
    <div className="glass-card rounded-xl p-4 group hover:border-white/[0.1] transition-all duration-300">
      <div className="text-[#64748B] text-[11px] uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-lg font-bold font-mono tabular-nums ${colorClass}`}>{value}</div>
    </div>
  );
}

export default function AccountSummary({ data, loading }: AccountSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
            <div className="h-3 w-16 bg-white/[0.04] rounded mb-2" />
            <div className="h-5 w-24 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label="Portfolio Value"
        value={`$${data.total_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
      />
      <StatCard
        label="Cash"
        value={`$${data.cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
      />
      <StatCard
        label="Total Return"
        value={`${data.total_return >= 0 ? "+" : ""}${data.total_return.toFixed(2)}%`}
        accent={data.total_return >= 0 ? "green" : "red"}
      />
      <StatCard label="Win Rate" value={`${data.win_rate.toFixed(1)}%`} />
      <StatCard
        label="Profit Factor"
        value={data.profit_factor === 999.99 ? "∞" : data.profit_factor.toFixed(2)}
      />
      <StatCard
        label="Max Drawdown"
        value={`${data.max_drawdown.toFixed(2)}%`}
        accent="red"
      />
    </div>
  );
}
