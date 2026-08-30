import type { Metadata } from "next";
import Link from "next/link";
import EpsilonMark from "@/components/brand/EpsilonMark";

export const metadata: Metadata = {
  title: "Public Impact Ledger",
  description: "A source-backed record of EPSILON reach, external challenges, and product changes.",
  alternates: { canonical: "/impact" },
};

type RepoSnapshot = { stars: number | null; forks: number | null };

async function getRepoSnapshot(): Promise<RepoSnapshot> {
  try {
    const response = await fetch("https://api.github.com/repos/DresdenGman/EPSILON-trading-simulator", {
      next: { revalidate: 3600 }, headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return { stars: null, forks: null };
    const payload = await response.json() as { stargazers_count?: unknown; forks_count?: unknown };
    return {
      stars: typeof payload.stargazers_count === "number" ? payload.stargazers_count : null,
      forks: typeof payload.forks_count === "number" ? payload.forks_count : null,
    };
  } catch { return { stars: null, forks: null }; }
}

const reach = [
  ["10", "Repository views", "8 unique visitors", "GitHub Traffic", "Jul 30–Aug 12, 2026"],
  ["95", "Repository clones", "48 unique cloners", "GitHub Traffic", "Jul 30–Aug 12, 2026"],
  ["0", "Independent challenges", "Challenge channel opened Aug 13", "Discussion #8", "All time"],
  ["0", "Feedback-led changes", "No external change claimed yet", "Review ledger", "All time"],
];

const stages = [
  ["01", "Submit", "A participant runs one evidence loop and names one assumption."],
  ["02", "Triage", "The challenge is accepted, queued, rejected with reasons, or marked duplicate."],
  ["03", "Test", "The objection becomes an inspectable product change or experiment."],
  ["04", "Publish", "The outcome links back to the original objection without rewriting it."],
];

export default async function ImpactPage() {
  const repo = await getRepoSnapshot();
  return (
    <div className="instrument-shell min-h-screen text-base-content">
      <header className="border-b border-base-300 bg-base-100/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-3 text-sm font-semibold tracking-[0.15em]"><EpsilonMark className="h-6 w-10" />EPSILON</Link>
          <nav className="flex items-center gap-2"><Link href="/landing" className="instrument-button-secondary">Product</Link><a href="https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8" target="_blank" rel="noreferrer" className="instrument-button">Submit challenge ↗</a></nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[92rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 border-b instrument-rule pb-14 lg:grid-cols-[1.15fr_0.45fr] lg:items-end">
            <div><p className="instrument-label">Public impact ledger / source-backed</p><h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">Impact is a change someone else can inspect.</h1><p className="mt-6 max-w-2xl text-base leading-7 text-base-content/52">This ledger separates attention, independent reasoning, and product change. It never converts a view into a claim of adoption.</p></div>
            <aside className="border-l-2 border-warning/65 bg-warning/[0.035] px-5 py-4"><p className="instrument-label text-warning">Measurement rule</p><p className="mt-3 text-sm leading-6 text-base-content/62">Views measure reach. A review counts only when a real person submits a substantive challenge.</p></aside>
          </div>
        </section>

        <section className="mx-auto max-w-[92rem] px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-px border border-base-300 bg-base-300 sm:grid-cols-3">
            {[
              [repo.stars ?? "—", "GitHub stars", repo.stars === null ? "Live count temporarily unavailable" : "Live public repository signal", "stargazers"],
              [repo.forks ?? "—", "GitHub forks", repo.forks === null ? "Live count temporarily unavailable" : "Independent repository copies", "forks"],
              ["2", "Public releases", "Original history + evidence instrument", "releases"],
            ].map(([value, label, detail, path]) => <article key={label} className="bg-base-100 p-6 sm:p-8"><p className="instrument-label">{label}</p><p className="mt-8 font-mono text-6xl tracking-[-0.06em]">{value}</p><p className="mt-3 text-sm text-base-content/42">{detail}</p><a href={`https://github.com/DresdenGman/EPSILON-trading-simulator/${path}`} target="_blank" rel="noreferrer" className="mt-8 inline-block text-xs text-secondary hover:underline">GitHub source ↗</a></article>)}
          </div>

          <div className="mt-10 grid gap-px border border-base-300 bg-base-300 md:grid-cols-2">
            {reach.map(([value, label, detail, source, window]) => <article key={label} className="bg-base-200 p-6"><div className="flex items-start justify-between gap-5"><div><p className="font-mono text-4xl">{value}</p><h2 className="mt-2 text-lg font-semibold">{label}</h2></div><span className="rounded-full border border-base-300 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-base-content/42">Recorded baseline</span></div><p className="mt-5 text-sm text-base-content/52">{detail}</p><div className="mt-7 flex justify-between border-t instrument-rule pt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-base-content/32"><span>{source}</span><span>{window}</span></div></article>)}
          </div>
        </section>

        <section className="border-y instrument-rule bg-base-200/45">
          <div className="mx-auto grid max-w-[92rem] lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b instrument-rule px-4 py-16 sm:px-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-24"><p className="instrument-label">Open falsification challenge</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Do not endorse EPSILON. Try to break its reasoning.</h2><p className="mt-6 text-sm leading-7 text-base-content/52">Complete one research loop and identify the first assumption you would challenge. Every substantive response receives a public disposition.</p><a href="https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8" target="_blank" rel="noreferrer" className="instrument-button mt-8">Enter the challenge ↗</a></div>
            <div>{stages.map(([number, title, detail]) => <div key={number} className="grid gap-3 border-b instrument-rule px-4 py-7 last:border-b-0 sm:grid-cols-[3rem_9rem_1fr] sm:items-baseline sm:px-6 lg:px-10"><span className="font-mono text-xs text-base-content/28">{number}</span><h3 className="font-medium">{title}</h3><p className="text-sm leading-6 text-base-content/48">{detail}</p></div>)}</div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[92rem] flex-col gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8 lg:py-24"><div><p className="instrument-label">Independent review log</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">The public ledger begins at zero.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-base-content/48">Future entries must link the original challenge, response, disposition, and resulting change. No external review is claimed before it exists.</p></div><a href="https://github.com/DresdenGman/EPSILON-trading-simulator/blob/main/docs/INDEPENDENT_REVIEW_LOG.md" target="_blank" rel="noreferrer" className="instrument-button-secondary shrink-0">Inspect the ledger ↗</a></section>
      </main>
    </div>
  );
}
