"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface EquityChartProps {
  data: { date: string; equity: number }[];
  initialCapital?: number;
  loading?: boolean;
}

export default function EquityChart({ data, initialCapital, loading }: EquityChartProps) {
  if (loading) {
    return (
      <div className="surface-card w-full h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="skeleton h-4 w-40 mx-auto mb-3 rounded" />
          <div className="skeleton h-[220px] w-[90%] mx-auto rounded-lg" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="surface-card w-full h-[300px] flex items-center justify-center">
        <div className="text-center text-muted">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-sm">No trading data yet</p>
        </div>
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
  const base = initialCapital || chartData[0]?.equity || 100000;

  return (
    <div className="surface-card w-full h-[320px] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-text-primary text-sm font-semibold">Equity Curve</h3>
        <span className="text-2xs text-muted font-mono">
          Initial: ${base.toLocaleString()}
        </span>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D09C" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#00D09C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            stroke="#586376"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => v?.slice(5) || ""}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#586376"
            tick={{ fontSize: 10 }}
            domain={[min * 0.99, "auto"]}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#111620",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "#EDF0F5",
              fontSize: "12px",
              fontFamily: "JetBrains Mono, monospace",
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Equity"]}
          />
          <ReferenceLine
            y={base}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="equity"
            stroke="#00D09C"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: "#00D09C", stroke: "#0B0D14", strokeWidth: 2 }}
            fill="url(#equityGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
