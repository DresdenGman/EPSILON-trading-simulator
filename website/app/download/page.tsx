import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, PackageX, Terminal } from "lucide-react";

const repositoryUrl = "https://github.com/DresdenGman/EPSILON-trading-simulator";
const releaseUrl = `${repositoryUrl}/releases/tag/v1.0.0`;
const sourceRunbook = "# Clone the repository\ngit clone https://github.com/DresdenGman/EPSILON-trading-simulator.git\ncd EPSILON-trading-simulator\n\n# Install dependencies\npip install -r requirements.txt\n\n# Run the application\npython mock.py";

export const metadata: Metadata = {
  title: "Source & Distribution",
  description: "Review EPSILON's source-first desktop distribution status and verified release record.",
  alternates: { canonical: "/download" },
};

const statusItems = [
  { label: "Release", value: "v1.0.0", tone: "text-white" },
  { label: "Source", value: "Available", tone: "text-[#A7F3D0]" },
  { label: "Installers", value: "Not published", tone: "text-[#FDE68A]" },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#071323] text-[#E2E8F0]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071323]/88 backdrop-blur-xl">
        <div className="epsilon-shell flex h-16 items-center justify-between">
          <Link href="/landing" className="flex items-baseline gap-3">
            <span className="font-mono text-sm font-semibold tracking-[0.12em] text-white">EPS<span className="text-[#3ecfb9]">ILON</span></span>
            <span className="hidden border-l border-white/10 pl-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B] sm:block">Decision Lab / Distribution</span>
          </Link>
          <nav aria-label="Distribution navigation" className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em] sm:text-[11px]">
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
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#3ecfb9]">EPSILON / Source & distribution</p>
                <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">The research client,<br /><span className="text-[#94A3B8]">without a false download.</span></h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#94A3B8] sm:text-lg">EPSILON&apos;s original desktop environment remains available from source. Until signed installers are published and verifiable, the product says exactly what exists—and nothing more.</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#3ecfb9] px-5 py-3 text-sm font-semibold text-[#071323] transition-colors hover:bg-[#65dcc8]">View source <Code2 className="h-4 w-4" /></a>
                  <a href="#run-from-source" className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/5">Run locally <ArrowDown className="h-4 w-4" /></a>
                </div>
              </div>
              <aside className="border border-white/10 bg-[#0A182A]/88 p-5 backdrop-blur" aria-label="Distribution status">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Public distribution</p><p className="mt-1 text-sm font-semibold text-white">Current verified state</p></div>
                  <span className="h-2 w-2 rounded-full bg-[#3ecfb9]" aria-hidden="true" />
                </div>
                <dl className="divide-y divide-white/10">
                  {statusItems.map((item) => <div key={item.label} className="flex items-center justify-between gap-4 py-4"><dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]">{item.label}</dt><dd className={`text-sm font-medium ${item.tone}`}>{item.value}</dd></div>)}
                </dl>
                <p className="border-t border-white/10 pt-4 text-xs leading-5 text-[#64748B]">No local build is represented as a public package. GitHub remains the source of truth.</p>
              </aside>
            </div>
          </div>
        </section>

        <section className="epsilon-shell py-14 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#3ecfb9]">01 / Choose the honest path</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">One product.<br />Two valid entry points.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#94A3B8]">Use the browser Decision Lab for the guided product experience, or inspect and run the original desktop code locally.</p>
            </div>
            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
              <Link href="/dashboard" className="group flex min-h-64 flex-col justify-between bg-[#0A182A] p-6 transition-colors hover:bg-[#0D1D32]">
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#3ecfb9]">Recommended / Browser</span><h3 className="mt-5 text-xl font-semibold text-white">Open Decision Lab</h3><p className="mt-3 text-sm leading-6 text-[#94A3B8]">Observe a market, record a hypothesis, test it, and challenge the conclusion in one public session.</p></div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#72dfcd]">Enter the lab <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
              <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="group flex min-h-64 flex-col justify-between bg-[#0A182A] p-6 transition-colors hover:bg-[#0D1D32]">
                <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Technical / Source</span><h3 className="mt-5 text-xl font-semibold text-white">Inspect the desktop client</h3><p className="mt-3 text-sm leading-6 text-[#94A3B8]">Read the implementation, clone the repository, and run the original Python environment locally.</p></div>
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
              <h2 className="mt-3 text-2xl font-semibold text-white">A release exists.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#94A3B8]">Version 1.0.0 provides a durable public record and release notes. It is the only page that should be trusted for future package assets.</p>
              <a href={releaseUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#72dfcd] hover:underline">View release record <ArrowUpRight className="h-4 w-4" /></a>
            </div>
            <div className="bg-[#050D18] py-12 pl-0 lg:pl-12">
              <div className="flex h-10 w-10 items-center justify-center border border-[#FDE68A]/20 text-[#FDE68A]"><PackageX className="h-4 w-4" /></div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-[#FDE68A]">Boundary / No installer assets</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">A download does not—yet.</h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#94A3B8]">No verified macOS, Windows, or Linux installer is published. This is a distribution boundary, not a broken button or hidden package.</p>
            </div>
          </div>
        </section>

        <section id="run-from-source" className="epsilon-shell grid min-w-0 gap-8 py-14 sm:py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:gap-16">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#3ecfb9]">03 / Source runbook</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Run the real project locally.</h2>
            <p className="mt-4 text-sm leading-6 text-[#94A3B8]">Clone the repository and use your own Python environment. Review dependencies before installation.</p>
          </div>
          <div className="min-w-0 overflow-hidden border border-white/10 bg-[#030912]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]"><Terminal className="h-3.5 w-3.5 text-[#3ecfb9]" />Source runbook</span><span className="font-mono text-[10px] text-[#475569]">bash</span></div>
            <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-7 text-[#CBD5E1]"><code>{sourceRunbook}</code></pre>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#050D18]"><div className="epsilon-shell flex flex-col gap-3 py-6 font-mono text-[10px] uppercase tracking-[0.12em] text-[#64748B] sm:flex-row sm:items-center sm:justify-between"><span>EPSILON Decision Lab · Source-first distribution</span><a href={repositoryUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#3ecfb9]">Repository ↗</a></div></footer>
    </div>
  );
}
