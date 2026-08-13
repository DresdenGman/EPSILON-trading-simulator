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
      <div className="lab-page-header">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="lab-page-kicker">Strategy Lab / Experiment</p>
            <h1 className="lab-page-title">Test a market hypothesis.</h1>
            <p className="lab-page-description">
              Define an experiment, run the available evidence, then inspect what the submitted series actually supports.
            </p>
          </div>
        <Link
          href="/dashboard"
          className="lab-outline-action"
        >
          ← Return to market
        </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-base-300/70 pt-4 font-mono text-2xs uppercase tracking-[0.16em] text-base-content/40">
          <span>Instruments <strong className="ml-2 font-medium text-base-content">{instrumentLabel}</strong></span>
          <span>Workspace <strong className="ml-2 font-medium text-base-content">{tab === "backtest" ? "Strategy test" : "Structure test"}</strong></span>
          <span>Sequence <strong className="ml-2 font-medium text-base-content">Define → Run → Inspect → Challenge</strong></span>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-xl border border-base-300/80 bg-base-200/35 sm:grid-cols-2">
        <button
          onClick={() => setTab("backtest")}
          className={`lab-tab sm:border-r ${
            tab === "backtest" ? "border-primary bg-primary/[0.06] text-base-content" : "border-transparent text-base-content/45 hover:bg-base-300/30 hover:text-base-content"
          }`}
        >
          <span className="block font-mono text-2xs uppercase tracking-[0.18em] text-primary/75">01 / Strategy test</span>
          <span className="mt-1 block text-sm font-medium">Test the trading rule</span>
        </button>
        <button
          onClick={() => setTab("spectral")}
          className={`lab-tab ${
            tab === "spectral" ? "border-primary bg-primary/[0.06] text-base-content" : "border-transparent text-base-content/45 hover:bg-base-300/30 hover:text-base-content"
          }`}
        >
          <span className="block font-mono text-2xs uppercase tracking-[0.18em] text-primary/75">02 / Structure test</span>
          <span className="mt-1 block text-sm font-medium">Inspect the price series (FFT)</span>
        </button>
      </div>

      {tab === "backtest" ? <BacktestForm /> : <SpectralAnalysis />}
    </div>
  );
}
