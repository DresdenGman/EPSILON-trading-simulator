"use client";

import React, { useState } from "react";
import { api, SpectralResult } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function SpectralAnalysis() {
  const [pricesInput, setPricesInput] = useState("100,102,105,103,108,110,107,112,115,118,120,117,122,125,130,128");
  const [result, setResult] = useState<SpectralResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    const prices = pricesInput.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    if (prices.length < 2) {
      setError("Need at least 2 price points");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.spectralAnalysis(prices);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const spectralChartData = result?.frequencies
    ? result.frequencies.map((f, i) => ({
        period: f > 0 ? (1 / f).toFixed(1) : "0",
        power: result.powers[i],
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
        <h3 className="text-white font-semibold mb-4">Spectral (FFT) Analysis</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={pricesInput}
            onChange={(e) => setPricesInput(e.target.value)}
            placeholder="Price series: 100,102,105,..."
            className="flex-1 bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-2 bg-[#00D09C] text-black font-semibold rounded-lg hover:bg-[#00B386] transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-[#F0616D]">{error}</div>}
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Dominant Period", value: `${result.dominant_period.toFixed(1)} days` },
              { label: "Weekly Power", value: result.weekly_power.toFixed(2) },
              { label: "Monthly Power", value: result.monthly_power.toFixed(2) },
              { label: "Quarterly Power", value: result.quarterly_power.toFixed(2) },
            ].map((card) => (
              <div key={card.label} className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4">
                <div className="text-[#64748B] text-xs mb-1">{card.label}</div>
                <div className="text-lg font-bold text-white">{card.value}</div>
              </div>
            ))}
          </div>

          {spectralChartData.length > 0 && (
            <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
              <h4 className="text-white font-semibold mb-3">Power Spectrum</h4>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={spectralChartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke="#64748B" tick={{ fontSize: 10 }} label={{ value: "Period (days)", position: "bottom", fill: "#64748B", fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="power" stroke="#00D09C" fill="#00D09C" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {result.significant_periods.length > 0 && (
            <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4">
              <h4 className="text-white font-semibold mb-2">Significant Periods</h4>
              <div className="flex flex-wrap gap-2">
                {result.significant_periods.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-[#00D09C]/10 text-[#00D09C] rounded-full text-sm font-medium">
                    {p.toFixed(1)} days
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
