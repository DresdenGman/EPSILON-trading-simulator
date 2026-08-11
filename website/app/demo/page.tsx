import Link from "next/link";
import type { Metadata } from "next";
import FlagshipDemo from "@/components/experiment/FlagshipDemo";

export const metadata: Metadata = {
  title: "Flagship Experiment",
  description: "Inspect one controlled EPSILON experiment: change one assumption, preserve the evidence, and test whether the conclusion survives.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return <main className="min-h-screen bg-base-100 px-4 py-6 md:px-8"><div className="mx-auto max-w-5xl"><header className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><Link href="/landing" className="font-mono text-xs font-semibold tracking-[0.18em] text-base-content">EPS<span className="text-primary">ILON</span></Link><div className="mt-4 font-mono text-2xs uppercase tracking-[0.18em] text-primary/70">Flagship experiment · EXP-001</div><p className="mt-1 text-sm text-base-content/55">Testing whether a conclusion survives a small perturbation.</p></div><span className="badge badge-outline border-primary/40 font-mono text-2xs text-primary">3 MIN DEMO</span></header><FlagshipDemo /><footer className="mt-8 flex flex-col gap-4 border-t border-base-300/70 py-8 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-2xs uppercase tracking-[0.16em] text-primary/70">Continue the research loop</p><p className="mt-2 text-sm text-base-content/55">Build your own hypothesis, test it, and interrogate the result.</p></div><Link href="/dashboard" className="btn btn-primary btn-sm">Enter the Decision Lab →</Link></footer></div></main>;
}
