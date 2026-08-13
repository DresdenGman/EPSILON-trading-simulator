import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Public Impact Ledger",
  description: "A source-backed record of EPSILON reach, external challenges, and product changes.",
  alternates: { canonical: "/impact" },
};

type RepoSnapshot = { stargazers_count: number; forks_count: number };
const fallbackRepo = { stargazers_count: 21, forks_count: 3 };

async function getRepoSnapshot(): Promise<RepoSnapshot> {
  try {
    const response = await fetch("https://api.github.com/repos/DresdenGman/EPSILON-trading-simulator", {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return fallbackRepo;
    return (await response.json()) as RepoSnapshot;
  } catch {
    return fallbackRepo;
  }
}

const publicMetrics = [
  ["10", "Repository views", "8 unique visitors", "GitHub Traffic", "Jul 30–Aug 12, 2026"],
  ["95", "Repository clones", "48 unique cloners", "GitHub Traffic", "Jul 30–Aug 12, 2026"],
  ["0", "Independent challenges", "Challenge opened Aug 13", "Discussion #8", "All time"],
  ["0", "Feedback-led changes", "No external change claimed yet", "Review ledger", "All time"],
];

const reviewStages = [
  ["01", "Submit", "A real participant completes one loop and names one assumption."],
  ["02", "Triage", "The challenge is accepted, queued, rejected with reasons, or marked duplicate."],
  ["03", "Test", "A product change or experiment receives an inspectable record."],
  ["04", "Publish", "The outcome is linked here without rewriting the original objection."],
];

export default async function ImpactPage() {
  const repo = await getRepoSnapshot();
  return (
    <div className="min-h-screen bg-[#071323] text-[#edf4f8]">
      <header className="border-b border-[#26455d]/70 bg-[#071323]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="font-mono text-sm font-semibold tracking-[0.18em] text-white">EPS<span className="text-[#3ecfb9]">ILON</span></Link>
          <nav aria-label="Impact navigation" className="flex items-center gap-2 text-xs sm:text-sm">
            <Link href="/landing" className="rounded-md px-3 py-2 text-[#9db0be] hover:bg-white/5 hover:text-white">Product</Link>
            <a href="https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8" target="_blank" rel="noreferrer" className="rounded-md bg-[#3ecfb9] px-3 py-2 font-semibold text-[#071323] hover:bg-[#65dcc8]">Submit a challenge ↗</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#26455d] px-4 py-20 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.13] [background-image:linear-gradient(#426680_1px,transparent_1px),linear-gradient(90deg,#426680_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-4xl">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#3ecfb9]">Public impact ledger · source-backed</p>
                <h1 className="mt-6 text-5xl font-semibold tracking-[-0.045em] text-white sm:text-6xl">Impact is a change<br />someone else can inspect.</h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#a9bac6] sm:text-lg">This page records reach, methodological objections, and product changes without converting attention into a claim of adoption.</p>
              </div>
              <div className="border-l-2 border-[#e0bd62] bg-[#e0bd62]/5 px-5 py-4 lg:max-w-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e0bd62]">Measurement rule</p>
                <p className="mt-2 text-sm leading-6 text-[#c9d4dc]">Views measure reach. A review is counted only when a real person submits a substantive challenge.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-px overflow-hidden border border-[#29485e] bg-[#29485e] sm:grid-cols-2 lg:grid-cols-3">
              {[
                [repo.stargazers_count, "GitHub stars · live", "Public repository signal", "stargazers"],
                [repo.forks_count, "GitHub forks · live", "Independent repository copies", "forks"],
                [2, "Public releases", "v1 history + v2 Decision Lab", "releases"],
              ].map(([value, label, detail, path]) => (
                <article key={String(label)} className="bg-[#0a1b2e] p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#718da0]">{label}</p>
                  <p className="mt-6 font-mono text-5xl text-white">{value}</p>
                  <p className="mt-2 text-sm text-[#8ea4b5]">{detail}</p>
                  <a href={`https://github.com/DresdenGman/EPSILON-trading-simulator/${path}`} className="mt-7 inline-block text-xs text-[#3ecfb9] hover:underline">GitHub source ↗</a>
                </article>
              ))}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {publicMetrics.map(([value, label, detail, source, window]) => (
                <article key={label} className="border border-[#29485e] bg-[#09182a] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="font-mono text-4xl text-white">{value}</p><h2 className="mt-2 text-lg font-semibold">{label}</h2></div>
                    <span className="rounded-full border border-[#355a73] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#8ea4b5]">Verified baseline</span>
                  </div>
                  <p className="mt-4 text-sm text-[#a9bac6]">{detail}</p>
                  <div className="mt-6 flex justify-between border-t border-[#29485e] pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-[#718da0]"><span>{source}</span><span>{window}</span></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f4f7f9] px-4 py-20 text-[#0b1724] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#167a6b]">Open falsification challenge</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">Do not endorse the product. Try to break its reasoning.</h2>
              <p className="mt-6 text-base leading-7 text-[#5b6d7d]">Complete one research loop and identify the first assumption you would challenge. Every substantive response receives a public disposition.</p>
              <a href="https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8" target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-md bg-[#0b1724] px-5 py-3 text-sm font-semibold text-white hover:bg-[#183047]">Enter the challenge ↗</a>
            </div>
            <div className="border-t border-[#cfdae2]">
              {reviewStages.map(([number, title, detail]) => (
                <div key={number} className="grid gap-3 border-b border-[#cfdae2] py-6 sm:grid-cols-[3rem_9rem_1fr] sm:items-baseline">
                  <span className="font-mono text-xs text-[#71808e]">{number}</span><h3 className="font-semibold">{title}</h3><p className="text-sm leading-6 text-[#5b6d7d]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#29485e] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-center">
            <div><p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#3ecfb9]">Independent review log</p><h2 className="mt-3 text-3xl font-semibold text-white">No external review is claimed before it exists.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#8ea4b5]">The public ledger begins at zero. Future entries must link to the original challenge, response, disposition, and resulting change.</p></div>
            <a href="https://github.com/DresdenGman/EPSILON-trading-simulator/blob/main/docs/INDEPENDENT_REVIEW_LOG.md" className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#3ecfb9]/45 px-5 py-3 text-sm font-semibold text-[#72dfcd] hover:bg-[#3ecfb9]/10">Inspect the ledger ↗</a>
          </div>
        </section>
      </main>
    </div>
  );
}
