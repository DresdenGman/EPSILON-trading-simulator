import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const releaseUrl = "https://github.com/DresdenGman/EPSILON-trading-simulator/releases/tag/v1.0.0";
const sourceRunbook = "# Clone the repository\ngit clone https://github.com/DresdenGman/EPSILON-trading-simulator.git\ncd EPSILON-trading-simulator\n\n# Install dependencies\npip install -r requirements.txt\n\n# Run the application\npython mock.py";

export const metadata: Metadata = {
  title: "Source & Distribution",
  description: "Review EPSILON's source-first desktop distribution status and verified release record.",
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#071323] text-gray-200">
      <header className="sticky top-0 z-30 border-b border-[#234057] bg-[#071323]/90 backdrop-blur-xl">
        <div className="epsilon-shell flex items-center justify-between py-4">
          <Link href="/landing" className="flex items-baseline gap-3"><span className="font-mono text-sm font-semibold tracking-[0.12em] text-gray-100">EPS<span className="text-epsilon-gold">ILON</span></span><span className="hidden border-l border-[#234057] pl-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 sm:block">Decision Lab / Distribution</span></Link>
          <nav aria-label="Distribution navigation" className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] sm:text-[11px]"><Link href="/landing" className="text-gray-400 transition-colors hover:text-epsilon-gold">Back to EPSILON</Link><Link href="/dashboard" className="border border-epsilon-gold/45 px-3 py-2 text-epsilon-gold transition-colors hover:bg-epsilon-gold/10">Open the Lab</Link></nav>
        </div>
      </header>
      <main className="epsilon-shell py-10 sm:py-16">
        <section className="border-b border-[#234057] pb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-epsilon-gold">EPSILON / Desktop distribution</p>
          <div className="mt-5 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:items-end">
            <div><h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-gray-100 sm:text-5xl">Desktop Research Client</h1><p className="mt-5 max-w-2xl text-base leading-7 text-gray-400">The original EPSILON desktop environment remains available from source. Packaged installers are not currently published for v1.0.0.</p></div>
            <div className="grid grid-cols-2 border border-[#234057] bg-[#0a1a2d]/70 font-mono text-[11px]"><div className="border-b border-r border-[#234057] p-4"><p className="uppercase tracking-[0.14em] text-gray-500">Release</p><p className="mt-2 text-gray-100">v1.0.0</p></div><div className="border-b border-[#234057] p-4"><p className="uppercase tracking-[0.14em] text-gray-500">Installer assets</p><p className="mt-2 text-epsilon-gold">Not published</p></div><div className="border-r border-[#234057] p-4"><p className="uppercase tracking-[0.14em] text-gray-500">Source</p><p className="mt-2 text-gray-100">Available</p></div><div className="p-4"><p className="uppercase tracking-[0.14em] text-gray-500">Distribution</p><p className="mt-2 text-gray-100">Source-first</p></div></div>
          </div>
        </section>
        <section className="py-10 sm:py-14"><div className="max-w-2xl"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-epsilon-gold">01 / Distribution status</p><h2 className="mt-3 text-2xl font-semibold text-gray-100">Release evidence, not placeholder downloads.</h2><p className="mt-3 text-sm leading-6 text-gray-400">A published release exists, but it does not contain verified public installer assets. This page will only link packages after they are published and verifiable.</p></div><div className="mt-7 overflow-hidden border border-[#234057] bg-[#0a1a2d]/45"><div className="grid grid-cols-[1.15fr_0.9fr] border-b border-[#234057] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 sm:grid-cols-[1.2fr_0.9fr_1fr]"><span>Distribution</span><span>Current state</span><span className="hidden sm:block">Action</span></div><div className="grid grid-cols-[1.15fr_0.9fr] border-b border-[#234057] px-4 py-4 text-sm sm:grid-cols-[1.2fr_0.9fr_1fr]"><span className="font-medium text-gray-200">Packaged installers</span><span className="font-mono text-xs text-epsilon-gold">Not published</span><span className="hidden text-gray-500 sm:block">No verified package available</span></div><div className="grid grid-cols-[1.15fr_0.9fr] px-4 py-4 text-sm sm:grid-cols-[1.2fr_0.9fr_1fr]"><span className="font-medium text-gray-200">Source distribution</span><span className="font-mono text-xs text-emerald-300">Available</span><a href="#run-from-source" className="hidden font-mono text-xs text-epsilon-gold hover:underline sm:block">Run from source ↓</a></div></div></section>
        <section className="grid gap-5 border-y border-[#234057] py-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:py-12"><div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-epsilon-gold">02 / Release record</p><h2 className="mt-3 text-2xl font-semibold text-gray-100">Follow the verified release record.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">The GitHub release is the source of truth for public packages and release notes. Local artifacts are not presented as public installers.</p></div><a href={releaseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex"><Button variant="outline" size="lg" className="border-epsilon-gold/50 text-epsilon-gold hover:bg-epsilon-gold/10">View release record <ArrowUpRight className="ml-2 h-4 w-4" /></Button></a></section>
        <section id="run-from-source" className="grid min-w-0 gap-8 py-10 sm:py-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div className="min-w-0"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-epsilon-gold">03 / Source distribution</p><h2 className="mt-3 text-2xl font-semibold text-gray-100">Run the real project locally.</h2><p className="mt-3 text-sm leading-6 text-gray-400">For the current desktop environment, clone the repository and run the verified source path from your own Python environment.</p></div><Card className="min-w-0 border-[#234057] bg-[#050d18] shadow-none"><CardContent className="p-0"><div className="flex items-center gap-2 border-b border-[#234057] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500"><Terminal className="h-3.5 w-3.5 text-epsilon-gold" />Source runbook</div><pre className="overflow-x-auto p-5 font-mono text-[12px] leading-7 text-gray-300"><code>{sourceRunbook}</code></pre></CardContent></Card></section>
      </main>
      <footer className="border-t border-[#234057] bg-[#050d18]"><div className="epsilon-shell flex flex-col gap-3 py-6 font-mono text-[10px] uppercase tracking-[0.12em] text-gray-500 sm:flex-row sm:items-center sm:justify-between"><span>EPSILON Decision Lab · Desktop distribution</span><a href="https://github.com/DresdenGman/EPSILON-trading-simulator" target="_blank" rel="noopener noreferrer" className="hover:text-epsilon-gold">Repository ↗</a></div></footer>
    </div>
  );
}
