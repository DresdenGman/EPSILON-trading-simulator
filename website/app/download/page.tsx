import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Terminal } from "lucide-react";
import EpsilonMark from "@/components/brand/EpsilonMark";

const repositoryUrl = "https://github.com/DresdenGman/EPSILON-trading-simulator";
const releaseUrl = `${repositoryUrl}/releases/tag/v2.0.0`;
const sourceRunbook = `# Clone the original repository
git clone https://github.com/DresdenGman/EPSILON-trading-simulator.git
cd EPSILON-trading-simulator

# Terminal 1 — research API
python3 -m venv backend/venv
backend/venv/bin/pip install -r backend/requirements.txt
backend/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 2 — web product
cd website
npm install
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev`;

export const metadata: Metadata = {
  title: "Source & Reproducibility",
  description: "Use EPSILON, inspect its source, and reproduce the complete evidence instrument locally.",
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {
  return (
    <div className="instrument-shell min-h-screen text-base-content">
      <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/88 backdrop-blur-xl"><div className="mx-auto flex max-w-[92rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8"><Link href="/landing" className="flex items-center gap-3 text-sm font-semibold tracking-[0.15em]"><EpsilonMark className="h-6 w-10" />EPSILON <span className="hidden border-l border-base-300 pl-3 font-mono text-[10px] font-normal uppercase tracking-[0.16em] text-base-content/32 sm:inline">Source</span></Link><Link href="/dashboard" className="instrument-button">Open instrument <ArrowRight className="ml-2 h-3.5 w-3.5" /></Link></div></header>
      <main>
        <section className="mx-auto max-w-[92rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"><div className="grid gap-10 border-b instrument-rule pb-16 lg:grid-cols-[1.1fr_0.55fr] lg:items-end"><div><p className="instrument-label">Source & reproducibility / one canonical product</p><h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">Use the instrument now. Inspect every layer later.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-base-content/52">EPSILON has one public product: the browser evidence instrument. Its implementation, history, and local run path stay open in the original repository.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard" className="instrument-button">Open EPSILON <ArrowRight className="ml-2 h-4 w-4" /></Link><a href="#run-from-source" className="instrument-button-secondary">Run locally <ArrowDown className="ml-2 h-4 w-4" /></a></div></div><aside className="instrument-panel p-5"><div className="flex items-center justify-between border-b instrument-rule pb-4"><div><p className="instrument-label">Distribution status</p><p className="mt-2 text-sm font-medium">Current verified state</p></div><span className="h-2 w-2 rounded-full bg-success" /></div><dl className="divide-y divide-base-300 text-sm"><div className="flex justify-between py-4"><dt className="instrument-label">Public product</dt><dd>Live</dd></div><div className="flex justify-between py-4"><dt className="instrument-label">Source</dt><dd>Open</dd></div><div className="flex justify-between py-4"><dt className="instrument-label">Repository</dt><dd>Original / preserved</dd></div></dl><a href={releaseUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center text-xs text-secondary hover:underline">View release record <ArrowUpRight className="ml-2 h-3.5 w-3.5" /></a><p className="mt-4 border-t instrument-rule pt-4 text-xs leading-5 text-base-content/38">No replacement repository. Existing history, stars, releases, and desktop lineage remain intact.</p></aside></div></section>

        <section className="mx-auto grid max-w-[92rem] gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:px-8"><div><p className="instrument-label">01 / Two legitimate paths</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">A simple public route. An inspectable technical record.</h2></div><div className="grid gap-px border border-base-300 bg-base-300 sm:grid-cols-2"><Link href="/dashboard" className="group flex min-h-72 flex-col justify-between bg-base-100 p-6 hover:bg-base-200"><div><p className="instrument-label text-secondary">Recommended / browser</p><h3 className="mt-5 text-xl font-semibold">Use the evidence instrument</h3><p className="mt-3 text-sm leading-6 text-base-content/48">Observe a market, define a claim, compute its perturbation field, and publish a challengeable Evidence Plate.</p></div><span className="text-sm font-medium text-secondary">Enter EPSILON →</span></Link><a href={repositoryUrl} target="_blank" rel="noreferrer" className="group flex min-h-72 flex-col justify-between bg-base-100 p-6 hover:bg-base-200"><div><p className="instrument-label">Technical / source</p><h3 className="mt-5 text-xl font-semibold">Inspect the implementation</h3><p className="mt-3 text-sm leading-6 text-base-content/48">Read the Next.js interface, Python services, test suite, release history, and preserved desktop client.</p></div><span className="inline-flex items-center text-sm font-medium">View original repository <ArrowUpRight className="ml-2 h-4 w-4" /></span></a></div></section>

        <section id="run-from-source" className="border-y instrument-rule bg-base-200/42"><div className="mx-auto grid max-w-[92rem] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.58fr_1.42fr] lg:px-8 lg:py-24"><div><p className="instrument-label">02 / Source runbook</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">Run the complete product locally.</h2><p className="mt-4 text-sm leading-7 text-base-content/48">Python 3.11+, Node.js 18+, and npm are required. Guest mode can also run the controlled browser engine without the API.</p></div><div className="min-w-0 overflow-hidden border border-base-300 bg-[#050609]"><div className="flex items-center justify-between border-b border-base-300 px-5 py-3"><span className="inline-flex items-center gap-2 instrument-label"><Terminal className="h-3.5 w-3.5 text-secondary" />Source runbook</span><span className="font-mono text-[10px] text-base-content/28">bash</span></div><pre className="overflow-x-auto p-5 font-mono text-[12px] leading-7 text-base-content/72"><code>{sourceRunbook}</code></pre></div></div></section>
      </main>
      <footer className="border-t instrument-rule"><div className="mx-auto flex max-w-[92rem] flex-col gap-3 px-4 py-7 font-mono text-[10px] uppercase tracking-[0.12em] text-base-content/32 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><span>EPSILON · Open source & reproducible</span><a href={repositoryUrl} target="_blank" rel="noreferrer" className="hover:text-base-content">Repository ↗</a></div></footer>
    </div>
  );
}
