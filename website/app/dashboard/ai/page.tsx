"use client";

import React from "react";
import AIChatDialog from "@/components/ai/AIChatDialog";
import Link from "next/link";
import { useResearchExperiment } from "@/components/research/ResearchContext";

export default function AIPage() {
  const { experiment, testState } = useResearchExperiment();

  return (
    <div className="space-y-6">
      <div className="lab-page-header">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="lab-page-kicker">Research / Interrogation</p>
            <h1 className="lab-page-title">Challenge an interpretation.</h1>
            <p className="lab-page-description">
              Interrogate the active experiment: question its assumptions, examine alternative explanations, and identify the next test that could change the conclusion.
            </p>
          </div>
          <Link
            href="/dashboard/backtest"
            className="lab-outline-action"
          >
            ← Refine in Strategy Lab
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-base-300/70 pt-4 font-mono text-2xs uppercase tracking-[0.16em] text-base-content/40">
          <span>Role <strong className="ml-2 font-medium text-base-content">Interrogate reasoning</strong></span>
          <span>Workspace <strong className="ml-2 font-medium text-base-content">Local heuristic · no live AI/web</strong></span>
          <span>Use <strong className="ml-2 font-medium text-base-content">Challenge before trust</strong></span>
        </div>
      </div>

      <section className="lab-panel grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_16rem]" aria-label="Thesis under review">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="product-kicker">Thesis under review</p>
            <span className="rounded-full border border-base-300 px-2 py-1 font-mono text-2xs uppercase tracking-[0.12em] text-base-content/45">{testState === "current" ? "Evidence current" : testState === "stale" ? "Retest required" : "Untested"}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-base-content">{experiment.hypothesis || "No thesis has been recorded yet. Return to Market to frame the claim before asking for a critique."}</p>
          <p className="mt-3 border-l border-warning/40 pl-3 text-xs leading-5 text-base-content/55">
            <span className="font-mono uppercase tracking-[0.12em] text-warning">Falsified if · </span>
            {experiment.falsification || "No rejection rule has been defined."}
          </p>
        </div>
        <div className="flex flex-col justify-center border-t border-base-300/80 bg-base-100/30 p-5 lg:border-l lg:border-t-0">
          <p className="metric-label">Interrogation target</p>
          <p className="mt-2 text-sm font-medium text-base-content">{experiment.symbol ?? "No market selected"}</p>
          <Link href="/dashboard" className="mt-4 text-xs font-medium text-primary hover:underline">Revise thesis →</Link>
        </div>
      </section>

      <AIChatDialog />

      <section className="grid overflow-hidden rounded-xl border border-base-300/80 bg-base-200/35 sm:grid-cols-3" aria-label="Research interrogation notes">
        <div className="border-b border-base-300/70 p-5 sm:border-b-0 sm:border-r">
          <p className="product-kicker">01 / Frame</p>
          <p className="mt-2 text-sm leading-6 text-base-content/55">Ask what assumption is carrying a conclusion.</p>
        </div>
        <div className="border-b border-base-300/70 p-5 sm:border-b-0 sm:border-r">
          <p className="product-kicker">02 / Examine</p>
          <p className="mt-2 text-sm leading-6 text-base-content/55">Ask which evidence would falsify the interpretation.</p>
        </div>
        <div className="p-5">
          <p className="product-kicker">03 / Verify</p>
          <p className="mt-2 text-sm leading-6 text-base-content/55">Browser-local workspaces use a clearly labeled local heuristic. A configured deployment may use EPSILON&apos;s server-side model integration. Treat either critique as research support, not financial advice.</p>
        </div>
      </section>
    </div>
  );
}
