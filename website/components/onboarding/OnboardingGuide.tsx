"use client";

import React from "react";
import Link from "next/link";
import EpsilonMark from "@/components/brand/EpsilonMark";

const STORAGE_KEY = "epsilon.onboarding-complete.v1";

const steps = [
  ["01 / Define", "Write the rejection rule first", "Record the market claim and the result that would force you to revise it."],
  ["02 / Perturb", "Move one assumption at a time", "EPSILON computes a baseline, then changes cost, slippage, window, and universe independently."],
  ["03 / Challenge", "Publish inspectable reasoning", "The Evidence Plate keeps assumptions, outcomes, provenance, and a Fork link together."],
];

export default function OnboardingGuide({ forceOpenSignal = 0 }: { forceOpenSignal?: number }) {
  const [open, setOpen] = React.useState(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (forceOpenSignal > 0 || window.localStorage.getItem(STORAGE_KEY) !== "true") setOpen(true);
  }, [forceOpenSignal]);

  React.useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="presentation">
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="epsilon-onboarding-title" className="instrument-panel max-h-[92vh] w-full max-w-5xl overflow-y-auto border-base-content/20 bg-base-100 p-5 outline-none sm:p-8">
        <header className="flex items-start justify-between gap-5 border-b instrument-rule pb-6">
          <div className="flex items-center gap-3"><EpsilonMark className="h-6 w-10" /><span className="font-mono text-xs uppercase tracking-[0.18em]">EPSILON / orientation</span></div>
          <button type="button" onClick={dismiss} className="font-mono text-[10px] uppercase tracking-[0.14em] text-base-content/45 hover:text-base-content" aria-label="Close orientation">Close ×</button>
        </header>
        <div className="grid gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="instrument-label">One minute / not a demo</p>
            <h2 id="epsilon-onboarding-title" className="mt-4 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">A backtest is an answer. A neighborhood is evidence.</h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-base-content/52">You are entering a browser-local quantitative evidence instrument. No account or real capital is required, and every result is explicitly labeled controlled synthetic.</p>
          </div>
          <div className="border-t instrument-rule">
            {steps.map(([label, title, detail]) => <div key={label} className="grid gap-2 border-b instrument-rule py-5 sm:grid-cols-[7rem_1fr]"><p className="instrument-label pt-1">{label}</p><div><h3 className="font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-base-content/48">{detail}</p></div></div>)}
          </div>
        </div>
        <footer className="flex flex-col gap-3 border-t instrument-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-base-content/38">Your workspace remains on this device until you reset it. Shared links contain the Evidence Plate itself.</p>
          <div className="flex flex-wrap gap-2"><button type="button" onClick={dismiss} className="instrument-button-secondary">Not now</button><Link href="/dashboard" onClick={dismiss} className="instrument-button-secondary">Observe a market</Link><Link href="/dashboard/backtest" onClick={dismiss} className="instrument-button">Run evidence field →</Link></div>
        </footer>
      </div>
    </div>
  );
}
