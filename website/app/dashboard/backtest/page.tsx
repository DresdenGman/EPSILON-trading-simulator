"use client";

import React from "react";
import BacktestForm from "@/components/backtest/BacktestForm";
import SpectralAnalysis from "@/components/analysis/SpectralAnalysis";
import Link from "next/link";

export default function BacktestPage() {
  const [tab, setTab] = React.useState<"backtest" | "spectral">("backtest");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analysis & Backtesting</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Run strategy backtests and spectral analysis on price data
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white border border-[#334155] rounded-lg hover:bg-[#1E293B] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="flex rounded-lg overflow-hidden border border-[#1E293B] w-fit">
        <button
          onClick={() => setTab("backtest")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "backtest" ? "bg-[#00D09C] text-black" : "bg-transparent text-[#64748B] hover:text-white"
          }`}
        >
          Backtest
        </button>
        <button
          onClick={() => setTab("spectral")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            tab === "spectral" ? "bg-[#00D09C] text-black" : "bg-transparent text-[#64748B] hover:text-white"
          }`}
        >
          Spectral (FFT)
        </button>
      </div>

      {tab === "backtest" ? <BacktestForm /> : <SpectralAnalysis />}
    </div>
  );
}
