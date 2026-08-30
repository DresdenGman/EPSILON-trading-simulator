import Link from "next/link";
import EpsilonMark from "@/components/brand/EpsilonMark";
import EvidencePlate from "@/components/evidence/EvidencePlate";
import { ILLUSTRATIVE_EVIDENCE } from "@/lib/illustrative-evidence";

const loop = [
  { number: "01", title: "Observe", detail: "Select a market subject and write the claim before seeing the answer.", href: "/dashboard" },
  { number: "02", title: "Define", detail: "Attach a rejection rule, universe, window, and execution assumptions.", href: "/dashboard/backtest" },
  { number: "03", title: "Perturb", detail: "Change one nearby assumption at a time and compute the consequences.", href: "/dashboard/backtest" },
  { number: "04", title: "Challenge", detail: "Publish the evidence object so another person can inspect and fork it.", href: "/dashboard/backtest" },
];

const principles = [
  ["ε is operational", "Every coloured trace corresponds to one exact parameter change."],
  ["Failure remains visible", "A reversal, failed run, or unknown source is preserved instead of tuned away."],
  ["Evidence can travel", "The claim, conditions, outcomes, and provenance stay together in one portable object."],
];

export default function LandingPage() {
  return (
    <div className="instrument-shell min-h-screen overflow-x-hidden text-base-content">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-base-300 bg-base-100/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-3 text-sm font-semibold tracking-[0.16em]"><EpsilonMark className="h-6 w-10" /><span>EPSILON</span></Link>
          <nav aria-label="Public navigation" className="flex items-center gap-1 sm:gap-2">
            <Link href="/impact" className="hidden px-3 py-2 text-xs text-base-content/50 transition-colors hover:text-base-content sm:block">Public ledger</Link>
            <a href="https://github.com/DresdenGman/EPSILON-trading-simulator" target="_blank" rel="noopener noreferrer" className="hidden px-3 py-2 text-xs text-base-content/50 transition-colors hover:text-base-content md:block">Source ↗</a>
            <Link href="/dashboard" className="instrument-button min-h-9 px-3 py-2">Open instrument →</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[92rem] px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
          <div className="grid gap-10 border-b instrument-rule pb-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:items-end">
            <div>
              <p className="instrument-label">Quantitative evidence instrument / public access</p>
              <h1 className="mt-7 max-w-5xl text-balance text-[clamp(3.6rem,8.4vw,8.8rem)] font-semibold leading-[0.84] tracking-[-0.072em]">
                Don’t trust the line.<br /><span className="text-base-content/32">Test its neighborhood.</span>
              </h1>
            </div>
            <div className="border-l instrument-rule pl-5 lg:pb-2 lg:pl-7">
              <p className="max-w-lg text-base leading-7 text-base-content/58">EPSILON turns one market claim into a field of nearby experiments. It reveals whether the conclusion survives when cost, slippage, window, or universe changes.</p>
              <div className="mt-7 flex flex-wrap gap-3"><Link href="/dashboard/backtest" className="instrument-button">Run an evidence field →</Link><Link href="#method" className="instrument-button-secondary">See the method</Link></div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-base-content/35">
            <span>Controlled synthetic markets</span><span>No login required</span><span>No real capital</span><span>Open source</span>
          </div>
        </section>

        <section className="mx-auto max-w-[92rem] px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="instrument-label">Live product language / 00</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">The result is not the object. The evidence field is.</h2></div><p className="font-mono text-[10px] uppercase tracking-[0.12em] text-secondary">Illustrative controlled experiment</p></div>
          <EvidencePlate artifact={ILLUSTRATIVE_EVIDENCE} actions={false} compact />
        </section>

        <section id="method" className="border-y instrument-rule bg-base-200/36">
          <div className="mx-auto grid max-w-[92rem] lg:grid-cols-[0.42fr_1fr]">
            <div className="border-b instrument-rule px-4 py-14 sm:px-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-24">
              <p className="instrument-label">Method / ε</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">A mathematical idea made into a research behavior.</h2>
              <p className="mt-6 text-sm leading-7 text-base-content/52">In analysis, ε describes a nearby change: an error, tolerance, perturbation, or residual. EPSILON asks the practical version—what happens to your conclusion in that neighborhood?</p>
            </div>
            <div>
              {loop.map((step) => (
                <Link key={step.number} href={step.href} className="group grid gap-4 border-b instrument-rule px-4 py-7 last:border-b-0 sm:grid-cols-[4rem_0.55fr_1fr_auto] sm:items-baseline sm:px-6 lg:px-10">
                  <span className="font-mono text-xs text-base-content/28">{step.number}</span><h3 className="text-xl font-medium group-hover:text-secondary">{step.title}</h3><p className="text-sm leading-6 text-base-content/48">{step.detail}</p><span className="hidden text-base-content/25 transition-transform group-hover:translate-x-1 sm:block">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[92rem] gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-32">
          <div>
            <p className="instrument-label">Evidence discipline / 01</p>
            <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Monochrome until challenged.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-base-content/52">EPSILON does not use colour to decorate performance. Colour appears only when an assumption changes, so every visual difference has a research meaning.</p>
          </div>
          <div className="border-t instrument-rule">
            {principles.map(([title, detail], index) => (
              <div key={title} className="grid gap-3 border-b instrument-rule py-7 sm:grid-cols-[3rem_0.6fr_1fr]"><span className="font-mono text-xs text-base-content/28">0{index + 1}</span><h3 className="font-medium">{title}</h3><p className="text-sm leading-6 text-base-content/48">{detail}</p></div>
            ))}
          </div>
        </section>

        <section className="border-y instrument-rule">
          <div className="mx-auto grid max-w-[92rem] lg:grid-cols-2">
            <div className="border-b instrument-rule px-4 py-16 sm:px-6 lg:border-b-0 lg:border-r lg:px-8 lg:py-24">
              <p className="instrument-label">From private result to public reasoning</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Publish something other people can disagree with precisely.</h2>
            </div>
            <div className="flex flex-col justify-between px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
              <p className="max-w-xl text-base leading-8 text-base-content/52">An Evidence Plate packages the original claim, exact changes, result traces, limitations, and a Fork link. The social unit is not a screenshot of returns—it is a challenge another person can reproduce.</p>
              <div className="mt-10 flex flex-wrap gap-3"><Link href="/dashboard/backtest" className="instrument-button">Create your first plate →</Link><Link href="/impact" className="instrument-button-secondary">Inspect public impact</Link></div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[92rem] flex-col gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8 lg:py-28">
          <div><p className="instrument-label">Begin / no account required</p><h2 className="mt-4 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">Make the assumptions move before the conclusion does.</h2></div><Link href="/dashboard" className="instrument-button shrink-0">Open EPSILON →</Link>
        </section>
      </main>

      <footer className="border-t instrument-rule px-4 py-7 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[92rem] flex-col gap-3 text-xs text-base-content/38 sm:flex-row sm:items-center sm:justify-between"><span>© 2026 EPSILON · Quantitative evidence instrument by Dresden E. Goehner</span><div className="flex gap-5"><Link href="/download" className="hover:text-base-content">Reproducibility</Link><a href="mailto:dresdengoehner@gmail.com" className="hover:text-base-content">Contact</a></div></div></footer>
    </div>
  );
}
