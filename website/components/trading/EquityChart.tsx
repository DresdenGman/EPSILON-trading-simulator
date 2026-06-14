"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/glass-card";

interface EquityChartProps {
  data: { date: string; equity: number }[];
  initialCapital?: number;
  loading?: boolean;
}

export default function EquityChart({ data, initialCapital, loading }: EquityChartProps) {
  if (loading) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-white font-semibold text-sm tracking-wide">EQUITY CURVE</h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="h-[300px] flex items-center justify-center text-[#64748B] animate-pulse">
            Loading equity curve...
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  if (data.length === 0) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <h3 className="text-white font-semibold text-sm tracking-wide">EQUITY CURVE</h3>
        </GlassCardHeader>
        <GlassCardContent>
          <div className="h-[300px] flex items-center justify-center text-[#64748B] text-sm">
            No trading data yet
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const chartData = data
    .filter((d) => d.date && d.equity != null)
    .map((d) => ({
      date: d.date,
      equity: Number(Number(d.equity).toFixed(2)),
    }));

  if (chartData.length === 0) return null;

  const min = Math.min(...chartData.map((d) => d.equity));

  return (
    <GlassCard highlight>
      <GlassCardHeader>
        <h3 className="text-white font-semibold text-sm tracking-wide">EQUITY CURVE</h3>
      </GlassCardHeader>
      <GlassCardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D09C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00D09C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="#334155"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v?.slice(5) || ""}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="#334155"
                tick={{ fontSize: 10 }}
                domain={[min * 0.99, "auto"]}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  backdropFilter: "blur(12px)",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#00D09C"
                strokeWidth={2}
                fill="url(#equityGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#00D09C", stroke: "#0F172A", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}
