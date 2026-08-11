"use client";

import Link from "next/link";
import { useResearchExperiment } from "@/components/research/ResearchContext";

export default function ActiveExperimentBar() {
  const { experiment, hydrated, testState } = useResearchExperiment();

  if (!hydrated) {
    return <div className="border-b border-base-300/70 bg-base-200/30 px-5 py-3 text-xs text-base-content/40">Restoring active experiment…</div>;
  }

  const status = testState === "current" ? "Evidence current" : testState === "stale" ? "Needs retest" : "Not tested";

  return (
    <section className="border-b border-base-300/70 bg-base-200/30 px-5 py-3" aria-label="Active experiment">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center">
        <div className="shrink-0">
          <p className="font-mono text-2xs uppercase tracking-[0.16em] text-primary/75">Active experiment</p>
          <p className="mt-1 font-mono text-xs font-semibold text-base-content">{experiment.symbol ?? "No subject selected"}</p>
        </div>
        <div className="min-w-0 flex-1 border-base-300 md:border-l md:pl-4">
          <p className="truncate text-xs text-base-content/70">{experiment.hypothesis || "No hypothesis recorded — frame one before treating any result as evidence."}</p>
          {experiment.test && (
            <p className="mt-1 font-mono text-2xs uppercase tracking-[0.11em] text-base-content/40">
              Last success · {experiment.test.strategy.replaceAll("_", " ")} · {experiment.test.symbols.join(", ")} · return {experiment.test.totalReturn.toFixed(2)}%
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className={`font-mono text-2xs uppercase tracking-[0.14em] ${testState === "current" ? "text-primary" : testState === "stale" ? "text-warning" : "text-base-content/40"}`}>{status}</span>
          <Link href={experiment.symbol ? `/dashboard/backtest?symbols=${encodeURIComponent(experiment.symbol)}` : "/dashboard/backtest"} className="text-xs font-medium text-primary hover:underline">
            {testState === "stale" ? "Retest →" : "Open test →"}
          </Link>
        </div>
      </div>
    </section>
  );
}
