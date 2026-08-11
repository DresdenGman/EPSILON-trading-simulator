"use client";

import React from "react";
import AIChatDialog from "@/components/ai/AIChatDialog";
import Link from "next/link";

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00D09C]">Research / Interrogation</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white">Challenge an interpretation.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94A3B8]">
              Interrogate the active experiment: question its assumptions, examine alternative explanations, and identify the next test that could change the conclusion.
            </p>
          </div>
          <Link
            href="/dashboard/backtest"
            className="border border-[#334155] px-4 py-2 text-sm text-[#94A3B8] transition-colors hover:border-[#64748B] hover:text-white"
          >
            ← Refine in Strategy Lab
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]">
          <span>Role <strong className="ml-2 font-medium text-[#E2E8F0]">Interrogate reasoning</strong></span>
          <span>Service <strong className="ml-2 font-medium text-[#E2E8F0]">Server-backed research critic</strong></span>
          <span>Use <strong className="ml-2 font-medium text-[#E2E8F0]">Challenge before trust</strong></span>
        </div>
      </div>

      <AIChatDialog />

      <section className="grid border-y border-white/10 sm:grid-cols-3" aria-label="Research interrogation notes">
        <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D09C]">01 / Frame</p>
          <p className="mt-2 text-sm leading-6 text-[#94A3B8]">Ask what assumption is carrying a conclusion.</p>
        </div>
        <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D09C]">02 / Examine</p>
          <p className="mt-2 text-sm leading-6 text-[#94A3B8]">Ask which evidence would falsify the interpretation.</p>
        </div>
        <div className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D09C]">03 / Verify</p>
          <p className="mt-2 text-sm leading-6 text-[#94A3B8]">When enabled for a deployment, messages are processed through EPSILON&apos;s server-side DeepSeek integration. Treat its critique as research support, not financial advice.</p>
        </div>
      </section>
    </div>
  );
}
