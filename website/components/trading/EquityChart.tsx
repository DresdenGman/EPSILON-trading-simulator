"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EquityChartProps {
  data: { date: string; equity: number }[];
  initialCapital?: number;
  loading?: boolean;
}

export default function EquityChart({ data, initialCapital, loading }: EquityChartProps) {
  if (loading) {
    return (
      <div className="w-full h-[300px] bg-[#0F172A] rounded-xl border border-[#1E293B] flex items-center justify-center">
        <div className="text-[#64748B] animate-pulse">Loading equity curve...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-[300px] bg-[#0F172A] rounded-xl border border-[#1E293B] flex items-center justify-center">
        <div className="text-[#64748B]">No trading data yet</div>
      </div>
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
    <div className="w-full h-[300px] bg-[#0F172A] rounded-xl border border-[#1E293B] p-4">
      <h3 className="text-white font-semibold mb-3">Equity Curve</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#64748B"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => v?.slice(5) || ""}
          />
          <YAxis
            stroke="#64748B"
            tick={{ fontSize: 10 }}
            domain={[min * 0.99, "auto"]}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="#00D09C"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#00D09C" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
