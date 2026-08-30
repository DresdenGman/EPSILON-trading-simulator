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
            <p className="lab-page-kicker">Perturbation laboratory / ε</p>
            <h1 className="lab-page-title">Test the neighborhood, not only the line.</h1>
            <p className="lab-page-description">
              Compute one baseline, change one assumption at a time, and keep every consequence attached to the claim.
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
          <span>Workspace <strong className="ml-2 font-medium text-base-content">{tab === "backtest" ? "Evidence field" : "Structure test"}</strong></span>
          <span>Sequence <strong className="ml-2 font-medium text-base-content">Define → Baseline → Perturb → Publish</strong></span>
        </div>
      </div>

      <div className="grid overflow-hidden rounded-md border border-base-300/80 bg-base-200/35 sm:grid-cols-2">
        <button
          onClick={() => setTab("backtest")}
          className={`lab-tab sm:border-r ${
            tab === "backtest" ? "border-primary bg-primary/[0.06] text-base-content" : "border-transparent text-base-content/45 hover:bg-base-300/30 hover:text-base-content"
          }`}
        >
          <span className="block font-mono text-2xs uppercase tracking-[0.18em] text-base-content/45">01 / Evidence field</span>
          <span className="mt-1 block text-sm font-medium">Perturb the trading rule</span>
        </button>
        <button
          onClick={() => setTab("spectral")}
          className={`lab-tab ${
            tab === "spectral" ? "border-primary bg-primary/[0.06] text-base-content" : "border-transparent text-base-content/45 hover:bg-base-300/30 hover:text-base-content"
          }`}
        >
          <span className="block font-mono text-2xs uppercase tracking-[0.18em] text-base-content/45">02 / Structure test</span>
          <span className="mt-1 block text-sm font-medium">Inspect the price series (FFT)</span>
        </button>
      </div>

      {tab === "backtest" ? <BacktestForm /> : <SpectralAnalysis />}
    </div>
  );
}
