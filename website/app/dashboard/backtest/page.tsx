"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import BacktestForm from "@/components/backtest/BacktestForm";
import SpectralAnalysis from "@/components/analysis/SpectralAnalysis";
import Link from "next/link";

export default function BacktestPage() {
  const [tab, setTab] = React.useState<"backtest" | "spectral">("backtest");
  const searchParams = useSearchParams();
  const instruments = Array.from(
    new Set(
      (searchParams.get("symbols") ?? "")
        .split(",")
        .map((symbol) => symbol.trim().toUpperCase())
        .filter((symbol) => /^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol))
    )
  );
  const instrumentLabel = instruments.length ? instruments.join(" · ") : "DEFAULT UNIVERSE";

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00D09C]">Strategy Lab / Experiment</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">Test a market hypothesis.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
              Define an experiment, run the available evidence, then inspect what the submitted series actually supports.
            </p>
          </div>
        <Link
          href="/dashboard"
          className="border border-[#334155] px-4 py-2 text-sm text-[#94A3B8] transition-colors hover:border-[#64748B] hover:text-white"
        >
          ← Return to market
        </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]">
          <span>Instruments <strong className="ml-2 font-medium text-[#E2E8F0]">{instrumentLabel}</strong></span>
          <span>Workspace <strong className="ml-2 font-medium text-[#E2E8F0]">{tab === "backtest" ? "Strategy test" : "Structure test"}</strong></span>
          <span>Sequence <strong className="ml-2 font-medium text-[#E2E8F0]">Define → Run → Inspect → Challenge</strong></span>
        </div>
      </div>

      <div className="grid border-y border-white/10 sm:grid-cols-2">
        <button
          onClick={() => setTab("backtest")}
          className={`border-b-2 px-5 py-4 text-left transition-colors sm:border-b-0 sm:border-r ${
            tab === "backtest" ? "border-[#00D09C] bg-[#00D09C]/[0.07] text-white" : "border-transparent text-[#64748B] hover:bg-white/[0.02] hover:text-white"
          }`}
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D09C]">01 / Strategy test</span>
          <span className="mt-1 block text-sm font-medium">Test the trading rule</span>
        </button>
        <button
          onClick={() => setTab("spectral")}
          className={`border-b-2 px-5 py-4 text-left transition-colors sm:border-b-0 ${
            tab === "spectral" ? "border-[#00D09C] bg-[#00D09C]/[0.07] text-white" : "border-transparent text-[#64748B] hover:bg-white/[0.02] hover:text-white"
          }`}
        >
          <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D09C]">02 / Structure test</span>
          <span className="mt-1 block text-sm font-medium">Inspect the price series (FFT)</span>
        </button>
      </div>

      {tab === "backtest" ? <BacktestForm /> : <SpectralAnalysis />}
    </div>
  );
}
