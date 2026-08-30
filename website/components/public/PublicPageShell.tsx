import Link from "next/link";
import type { ReactNode } from "react";
import EpsilonMark from "@/components/brand/EpsilonMark";

export default function PublicPageShell({ kicker, title, introduction, children }: { kicker: string; title: string; introduction: string; children: ReactNode }) {
  return (
    <div className="instrument-shell min-h-screen text-base-content">
      <header className="border-b border-base-300 bg-base-100/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-3 font-semibold tracking-[0.15em]"><EpsilonMark className="h-6 w-10" /><span>EPSILON</span></Link>
          <nav aria-label="Public documentation" className="flex items-center gap-2"><Link href="/methodology" className="hidden px-3 py-2 text-xs text-base-content/45 hover:text-base-content sm:block">Method</Link><Link href="/status" className="hidden px-3 py-2 text-xs text-base-content/45 hover:text-base-content sm:block">Status</Link><Link href="/dashboard" className="instrument-button">Open instrument →</Link></nav>
        </div>
      </header>
      <main className="mx-auto max-w-[92rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 border-b instrument-rule pb-12 lg:grid-cols-[1fr_0.65fr] lg:items-end">
          <div><p className="instrument-label">{kicker}</p><h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">{title}</h1></div>
          <p className="max-w-2xl border-l instrument-rule pl-5 text-sm leading-7 text-base-content/55">{introduction}</p>
        </div>
        <div className="py-12 lg:py-16">{children}</div>
      </main>
      <footer className="border-t instrument-rule px-4 py-7 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[92rem] flex-wrap items-center justify-between gap-4 text-xs text-base-content/38"><span>EPSILON · Open quantitative evidence instrument</span><div className="flex flex-wrap gap-5"><Link href="/methodology" className="hover:text-base-content">Methodology</Link><Link href="/privacy" className="hover:text-base-content">Privacy</Link><Link href="/terms" className="hover:text-base-content">Terms</Link><Link href="/status" className="hover:text-base-content">Status</Link><Link href="/download" className="hover:text-base-content">Source</Link></div></div></footer>
    </div>
  );
}
