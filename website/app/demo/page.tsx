import Link from "next/link";
import type { Metadata } from "next";
import FlagshipDemo from "@/components/experiment/FlagshipDemo";

export const metadata: Metadata = {
  title: "Flagship Experiment",
  description: "Inspect one controlled EPSILON experiment: change one assumption, preserve the evidence, and test whether the conclusion survives.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#071323] text-base-content">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071323]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link href="/landing" className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-semibold tracking-[0.14em] text-white">EPS<span className="text-[#3ecfb9]">ILON</span></span>
            <span className="hidden border-l border-white/10 pl-3 font-mono text-2xs uppercase tracking-[0.18em] text-base-content/35 sm:block">Flagship experiment / EXP-001</span>
          </Link>
          <nav aria-label="Demo navigation" className="flex items-center gap-4 font-mono text-2xs uppercase tracking-[0.14em]">
            <Link href="/landing" className="hidden text-base-content/45 transition-colors hover:text-white sm:block">Overview</Link>
            <Link href="/dashboard" className="rounded-md border border-primary/45 px-3 py-2 text-primary transition-colors hover:bg-primary/10">Open the Lab →</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <header className="mb-8 grid gap-5 border-b border-white/10 pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <div className="font-mono text-2xs uppercase tracking-[0.2em] text-primary">Flagship experiment · EXP-001</div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl">One changed assumption. One conclusion put at risk.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-base-content/55">Follow a controlled sensitivity test from its question and evidence to replication and limits.</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-[0.14em] text-base-content/40"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />Interactive · about 3 minutes</div>
        </header>
        <FlagshipDemo />
        <footer className="mt-10 flex flex-col gap-5 border-t border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-mono text-2xs uppercase tracking-[0.16em] text-primary/70">Continue the research loop</p><p className="mt-2 text-sm text-base-content/55">Build your own hypothesis, test it, and interrogate the result.</p></div>
          <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-content transition-colors hover:bg-[#65dcc8]">Enter the Decision Lab →</Link>
        </footer>
      </main>
    </div>
  );
}
