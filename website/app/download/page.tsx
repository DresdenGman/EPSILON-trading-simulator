import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, History, Terminal } from "lucide-react";

const repositoryUrl = "https://github.com/DresdenGman/EPSILON-trading-simulator";
const releaseUrl = `${repositoryUrl}/releases/tag/v2.0.0`;
const sourceRunbook = `# Clone the original repository
git clone https://github.com/DresdenGman/EPSILON-trading-simulator.git
cd EPSILON-trading-simulator

# Terminal 1 — research API
python3 -m venv backend/venv
backend/venv/bin/pip install -r backend/requirements.txt
backend/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 2 — web product (from the repository root)
cd website
npm install
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev`;

export const metadata: Metadata = {
  title: "Source & Reproducibility",
  description: "Open EPSILON's public Decision Lab, inspect the source, and reproduce the current web product locally.",
  alternates: { canonical: "/download" },
};

const statusItems = [
  { label: "Public product", value: "Live", tone: "text-[#A7F3D0]" },
  { label: "Release", value: "v2.0.0", tone: "text-white" },
  { label: "Source", value: "Open", tone: "text-[#A7F3D0]" },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#071323] text-[#E2E8F0]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071323]/88 backdrop-blur-xl">
        <div className="epsilon-shell flex h-16 items-center justify-between">
          <Link href="/landing" className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-semibold tracking-[0.12em] text-white">EPS<span className="text-[#3ecfb9]">ILON</span></span>
            <span className="hidden border-l border-white/10 pl-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B] sm:block">Decision Lab / Source</span>
          </Link>
          <nav aria-label="Source navigation" className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] sm:text-[11px]">
            <Link href="/landing" className="hidden text-[#94A3B8] transition-colors hover:text-white sm:block">Overview</Link>
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-[#3ecfb9]/50 px-3 py-2 text-[#72dfcd] transition-colors hover:bg-[#3ecfb9]/10">Open the Lab <ArrowRight className="h-3 w-3" /></Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative border-b border-white/10">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[44rem] -translate-x-1/2 rounded-full bg-[#3ecfb9]/5 blur-[110px]" />
          <div className="epsilon-shell relative py-16 sm:py-24 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.68fr)] lg:items-end">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#3ecfb9]">EPSILON / Source & reproducibility</p>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">Use the product now.<br /><span className="text-[#94A3B8]">Inspect how it is built.</span></h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#94A3B8] sm:text-lg">EPSILON has one public product: the browser-based Decision Lab. Its source, release history, and local run path remain open so every claim can be inspected and reproduced.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#3ecfb9] px-5 py-3 text-sm font-semibold text-[#071323] transition-colors hover:bg-[#65dcc8]">Open Decision Lab <ArrowRight className="h-4 w-4" /></Link>
                  <a href="#run-from-source" className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5">Run locally <ArrowDown className="h-4 w-4" /></a>
                </div>
              </div>
              <aside className="border border-white/10 bg-[#0A182A]/88 p-5 backdrop-blur" aria-label="Distribution status">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Public product</p><p className="mt-1 text-sm font-semibold text-white">Current verified state</p></div>
                  <span className="h-2 w-2 rounded-full bg-[#3ecfb9]" aria-hidden="true" />
                </div>
                <dl className="divide-y divide-white/10">
                  {statusItems.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 py-4"><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]">{item.label}</dt><dd className={`text-sm font-medium ${item.tone}`}>{item.value}</dd></div>)}
                </dl>
                <p className="border-t border-white/10 pt-4 text-xs leading-5 text-[#64748B]">The live workspace is the canonical product. GitHub remains the source of truth for code and releases.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="epsilon-shell py-14 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#3ecfb9]">01 / One canonical product</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">A clear public path.<br />An open technical record.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#94A3B8]">Visitors use the browser Decision Lab. Engineers can inspect or reproduce that same product from the original repository.</p>
            </div>
            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
              <Link href="/dashboard" className="group flex min-h-64 flex-col justify-between bg-[#0A182A] p-6 transition-colors hover:bg-[#0D1D32]">
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3ecfb9]">Recommended / Browser</span><h3 className="mt-5 text-xl font-semibold text-white">Open Decision Lab</h3><p className="mt-3 text-sm leading-6 text-[#94A3B8]">Observe a market, record a hypothesis, test it, and challenge the conclusion in one public session.</p></div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#72dfcd]">Enter the lab <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
              <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="group flex min-h-64 flex-col justify-between bg-[#0A182A] p-6 transition-colors hover:bg-[#0D1D32]">
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Technical / Source</span><h3 className="mt-5 text-xl font-semibold text-white">Inspect the implementation</h3><p className="mt-3 text-sm leading-6 text-[#94A3B8]">Read the Next.js interface and Python research services, then reproduce the current product locally.</p></div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">View repository <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
              </a>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#050D18]">
          <div className="epsilon-shell grid gap-px bg-white/10 lg:grid-cols-2">
            <div className="bg-[#050D18] py-12 pr-0 lg:pr-12">
              <div className="flex h-10 w-10 items-center justify-center border border-[#3ecfb9]/30 text-[#3ecfb9]"><Check className="h-4 w-4" /></div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#3ecfb9]">02 / Verified record</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">The current release is v2.0.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#94A3B8]">Version 2.0 records the transition from a trading simulator to a quantitative decision lab, with release notes and public media attached to the original repository.</p>
              <a href={releaseUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#72dfcd] hover:underline">View release record <ArrowUpRight className="h-4 w-4" /></a>
            </div>
            <div className="bg-[#050D18] py-12 pl-0 lg:pl-12">
              <div className="flex h-10 w-10 items-center justify-center border border-[#FDE68A]/20 text-[#FDE68A]"><History className="h-4 w-4" /></div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FDE68A]">Continuity / Original repository</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Earlier versions stay visible.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#94A3B8]">The original desktop client remains in the repository as development history. It is preserved—not presented as a competing public product.</p>
            </div>
          </div>
        </section>

        <section id="run-from-source" className="epsilon-shell grid min-w-0 gap-8 py-14 sm:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#3ecfb9]">03 / Source runbook</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Run the complete web product locally.</h2>
            <p className="mt-4 text-sm leading-6 text-[#94A3B8]">Start the Python research API and Next.js interface from the same original repository. Python 3.11+, Node.js 18+, and npm are required.</p>
          </div>
          <div className="min-w-0 overflow-hidden border border-white/10 bg-[#030912]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]"><Terminal className="h-3.5 w-3.5 text-[#3ecfb9]" />Source runbook</span><span className="font-mono text-[10px] text-[#475569]">bash</span></div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-7 text-[#CBD5E1]"><code>{sourceRunbook}</code></pre>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#050D18]"><div className="epsilon-shell flex flex-col gap-3 py-6 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64748B] sm:flex-row sm:items-center sm:justify-between"><span>EPSILON Decision Lab · Open source & reproducible</span><a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#3ecfb9]">Repository ↗</a></div></footer>
    </div>
  );
}
