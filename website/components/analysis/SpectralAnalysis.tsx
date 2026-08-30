"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, SpectralResult } from "@/lib/api";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

export default function SpectralAnalysis() {
  const searchParams = useSearchParams();
  const transferredSymbols = searchParams.get("symbols");
  const transferredSymbol = (transferredSymbols ?? "")
    .split(",")
    .map((symbol) => symbol.trim().toUpperCase())
    .find((symbol) => /^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol));
  const [stockCode, setStockCode] = useState("AAPL");
  const [result, setResult] = useState<SpectralResult | null>(null);
  const [analyzedSource, setAnalyzedSource] = useState<{ code: string; name: string; points: number; asOf: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setStockCode(transferredSymbol ?? "AAPL");
  }, [transferredSymbol]);

  const handleAnalyze = async () => {
    const requestedCode = stockCode.trim().toUpperCase();
    if (!requestedCode) {
      setError("Enter a stock code before running spectral analysis.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const kline = await api.getKline(requestedCode, 90);
      const prices = kline.close.filter((price) => Number.isFinite(price));
      if (prices.length < 2) {
        throw new Error("Price history did not contain enough valid close values for analysis.");
      }
      const data = await api.spectralAnalysis(prices);
      setResult(data);
      setAnalyzedSource({ code: kline.code, name: kline.name, points: prices.length, asOf: kline.dates.at(-1) ?? null });
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
  const sourceChanged = Boolean(result && analyzedSource && stockCode.trim().toUpperCase() !== analyzedSource.code);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.36fr)_minmax(0,1fr)]">
      <section className="border border-[#1E293B] bg-[#0F172A] p-5 lg:p-6" aria-label="Market series input">
        <div className="mb-6 border-b border-white/10 pb-4"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Define / Market series</p><h3 className="mt-2 text-lg font-semibold text-white">Structure test input</h3></div>
        <p className="mb-5 text-sm leading-6 text-[#94A3B8]">Analyze a server-provided 90-day historical close series. It describes the selected series only; it is not a price prediction.</p>
        <div className="space-y-3">
          <input
            type="text"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value.toUpperCase())}
            placeholder="Stock code, e.g. AAPL"
            className="w-full bg-[#1E293B] text-white px-3 py-3 text-sm border border-[#334155] focus:border-[#00D09C] outline-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-[#00D09C] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#37E8B8] disabled:opacity-50"
          >
            {loading ? "Loading & analyzing..." : "Analyze close series"}
          </button>
        </div>
        {loading && <p className="mt-4 text-sm text-[#94A3B8]">Fetching historical closes for {stockCode.trim().toUpperCase() || "the selected symbol"}…</p>}
        {error && <div className="mt-4 text-sm text-[#F0616D]">{error}</div>}
      </section>

      <section className="border border-[#1E293B] bg-[#0F172A] p-5 lg:p-6" aria-label="Spectral evidence">
        {!result && <div className="flex min-h-[260px] flex-col justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Run / Spectral evidence</p><h3 className="mt-2 text-lg font-semibold text-white">Awaiting a price-series analysis</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#94A3B8]">Submit a market series to inspect its spectrum and the source used to generate it.</p></div><p className="border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]">The evidence panel records only a completed server-provided series.</p></div>}
      {result && (
        <div className="space-y-4">
          {sourceChanged && <div role="status" className="rounded-xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-4 py-3 text-sm text-[#FDE68A]">Displayed analysis belongs to {analyzedSource?.code}. Run analysis again to evaluate the current symbol.</div>}
          {analyzedSource && <section className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-4" aria-label="Spectral analysis source">
            <div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="text-white font-semibold">{sourceChanged ? "Previous analysis source" : "Analysis source"}</h4><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#00D09C]/70">Server-provided close series</span></div>
            <p className="mt-2 text-sm text-[#94A3B8]">{analyzedSource.code} · {analyzedSource.name} · {analyzedSource.points} valid closing-price observations</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64748B]">Provider not provided · Sampling interval not provided · Period unit: observations{analyzedSource.asOf ? ` · Last observation ${analyzedSource.asOf}` : ""}</p>
          </section>}
          <section aria-label="Spectral result summary"><div className="mb-3 flex items-baseline justify-between gap-4"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Inspect / Result summary</p><p className="text-xs text-[#64748B]">Computed from the submitted series</p></div><div className="grid grid-cols-2 border border-[#1E293B] md:grid-cols-4">
            {[
              { label: "Dominant Period", value: `${result.dominant_period.toFixed(1)} observations` },
              { label: "Weekly Power", value: result.weekly_power.toFixed(2) },
              { label: "Monthly Power", value: result.monthly_power.toFixed(2) },
              { label: "Quarterly Power", value: result.quarterly_power.toFixed(2) },
            ].map((card) => (
              <div key={card.label} className="border-r border-[#1E293B] p-3 last:border-r-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#64748B]">{card.label}</div>
                <div className="mt-2 text-base font-semibold text-white">{card.value}</div>
              </div>
            ))}
          </div></section>

          {spectralChartData.length > 0 && (
            <div className="border-t border-white/10 pt-5">
              <div className="mb-3"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">Challenge / Spectral evidence</p><h4 className="mt-1 text-white font-semibold">Power spectrum</h4></div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={spectralChartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke="#64748B" tick={{ fontSize: 10 }} label={{ value: "Period (observations)", position: "bottom", fill: "#64748B", fontSize: 11 }} />
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
            <div className="border-t border-white/10 pt-5">
              <h4 className="text-white font-semibold mb-2">Significant periods</h4>
              <div className="flex flex-wrap gap-2">
                {result.significant_periods.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-[#00D09C]/10 text-[#00D09C] rounded-full text-sm font-medium">
                    {p.toFixed(1)} observations
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </section>
      </div>
    </div>
  );
}
