import Link from "next/link";

const researchLoop = [
  { number: "01", title: "Market", verb: "Observe", detail: "Choose a subject and turn an intuition into a falsifiable claim." },
  { number: "02", title: "Strategy Lab", verb: "Test", detail: "Run the claim against explicit inputs, outputs, and evidence boundaries." },
  { number: "03", title: "Interrogate", verb: "Challenge", detail: "Expose assumptions, refine the question, and retest without erasing history." },
];

const evidenceRules = [
  ["Claims stay claims", "A hypothesis is never presented as an observed fact."],
  ["Unknown stays unknown", "Missing provider or execution details are not filled with plausible guesses."],
  ["Failed tests survive", "Negative, stale, and failed evidence remains visible instead of being tuned away."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#071323] text-[#edf4f8]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#26455d]/70 bg-[#071323]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="font-mono text-sm font-semibold tracking-[0.18em] text-white sm:text-base">
            EPS<span className="text-[#3ecfb9]">ILON</span>
          </Link>
          <nav aria-label="Public navigation" className="flex items-center gap-1 text-xs sm:gap-3 sm:text-sm">
            <Link href="/impact" className="rounded-md px-2 py-2 font-medium text-[#a9bac6] transition-colors hover:bg-white/5 hover:text-white sm:px-4">
              Impact
            </Link>
            <Link href="#workflow" className="rounded-md px-2 py-2 font-medium text-[#a9bac6] transition-colors hover:bg-white/5 hover:text-white sm:px-4">
              How it works
            </Link>
            <Link href="/dashboard" className="rounded-md border border-[#3ecfb9]/45 bg-[#3ecfb9] px-3 py-2 font-semibold text-[#071323] transition-colors hover:bg-[#65dcc8] sm:px-4">
              Open workspace
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-screen items-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(#426680_1px,transparent_1px),linear-gradient(90deg,#426680_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="pointer-events-none absolute -right-52 -top-64 h-[42rem] w-[42rem] rounded-full bg-[#3ecfb9]/10 blur-3xl" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[#3ecfb9]">Quantitative Decision Lab</p>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Build a market idea.<br />
                <span className="text-[#3ecfb9]">Test it.</span><br />
                Then try to break it.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-[#a9bac6] sm:text-lg sm:leading-8">
                EPSILON turns market ideas into explicit research experiments—then keeps the assumptions, missing evidence, and failure conditions visible.
              </p>
              <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Link href="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#3ecfb9] px-6 py-3 text-sm font-semibold text-[#071323] transition-transform hover:-translate-y-0.5 hover:bg-[#65dcc8]">
                  Enter Decision Lab <span className="ml-2" aria-hidden="true">→</span>
                </Link>
                <Link href="/dashboard/backtest" className="inline-flex min-h-12 items-center justify-center rounded-md px-3 py-3 text-sm font-medium text-[#c3d0d9] transition-colors hover:bg-white/5 hover:text-white">
                  Open Strategy Lab →
                </Link>
              </div>
              <div className="mt-12 grid max-w-2xl grid-cols-3 border-y border-[#26455d] py-4 font-mono text-[10px] uppercase tracking-[0.12em] text-[#7893a6] sm:text-xs">
                <span>Falsifiable claim</span>
                <span className="border-x border-[#26455d] px-3 text-center">Visible evidence</span>
                <span className="text-right">Atomic retest</span>
              </div>
            </div>

            <aside aria-label="EPSILON product workflow" className="border border-[#355a73] bg-[#0a1b2e]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-[#29485e] pb-5 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="text-[#3ecfb9]">Active workspace · AAPL</span>
                <span className="rounded-full border border-[#3ecfb9]/35 px-2 py-1 text-[#75ddcb]">Research state</span>
              </div>
              <div className="py-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#718da0]">Research thesis</p>
                <h2 className="mt-3 text-2xl font-semibold leading-8 text-white">Recent momentum persists after realistic execution costs.</h2>
              </div>
              <div className="grid gap-px overflow-hidden border border-[#29485e] bg-[#29485e] sm:grid-cols-3">
                <div className="bg-[#0b2034] p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#718da0]">01 · Observe</p><p className="mt-2 text-sm font-semibold text-white">Market evidence</p></div>
                <div className="bg-[#0b2034] p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#3ecfb9]">02 · Test</p><p className="mt-2 text-sm font-semibold text-white">Strategy Lab</p></div>
                <div className="bg-[#0b2034] p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#718da0]">03 · Challenge</p><p className="mt-2 text-sm font-semibold text-white">Interrogate</p></div>
              </div>
              <div className="mt-5 border-l-2 border-[#e0bd62] bg-[#e0bd62]/5 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e0bd62]">Rejected if</p>
                <p className="mt-2 text-sm leading-6 text-[#c9d4dc]">The edge disappears out of sample or reverses under higher costs.</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#7893a6]">
                <span>Submitted inputs</span><span>Computed outputs</span><span>Visible provenance</span>
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-[#f4f7f9] px-4 py-24 text-[#0b1724] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#167a6b]">Why it exists</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">A backtest produces an answer. EPSILON shows what makes it fragile.</h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-[#516273] sm:text-lg">
              <p>A convincing result can come from the assumptions, test window, sampling process, or execution model. EPSILON keeps those choices attached to the result instead of hiding them behind a performance number.</p>
              <p>The product does not promise certainty. It makes the research question, evidence boundary, rejection rule, and next test visible in one continuous workspace.</p>
              <p className="font-medium text-[#0b1724]">The objective is disciplined iteration: form a claim, test it, expose its limits, and update without rewriting history.</p>
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 border-y border-[#26455d] bg-[#09182a] px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#3ecfb9]">One product · one research loop</p>
            <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">Observe. Test. Interrogate. Retest.</h2>
              <p className="max-w-sm text-sm leading-6 text-[#8ea4b5]">Every workspace advances the same active experiment instead of opening a separate product.</p>
            </div>
            <div className="mt-12 border-t border-[#29485e]">
              {researchLoop.map((step) => (
                <Link key={step.number} href={step.number === "01" ? "/dashboard" : step.number === "02" ? "/dashboard/backtest" : "/dashboard/ai"} className="group grid gap-3 border-b border-[#29485e] py-7 sm:grid-cols-[3.5rem_minmax(10rem,0.7fr)_minmax(0,1.3fr)_auto] sm:items-baseline sm:gap-6">
                  <span className="font-mono text-xs text-[#5f7b8e]">{step.number}</span>
                  <div><h3 className="text-lg font-semibold text-white group-hover:text-[#3ecfb9]">{step.title}</h3><span className="mt-1 block font-mono text-xs uppercase tracking-[0.14em] text-[#3ecfb9]">{step.verb}</span></div>
                  <p className="text-sm leading-6 text-[#8ea4b5]">{step.detail}</p>
                  <span className="hidden text-[#5f7b8e] transition-transform group-hover:translate-x-1 sm:block">→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-24 text-[#0b1724] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#167a6b]">Evidence discipline</p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">The limitations are part of the result.</h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#5b6d7d]">EPSILON is designed to resist the easiest form of self-deception: quietly changing the meaning of evidence after seeing the output.</p>
                <Link href="/dashboard/backtest" className="mt-8 inline-flex items-center rounded-md bg-[#0b1724] px-5 py-3 text-sm font-semibold text-white hover:bg-[#183047]">Open Strategy Lab →</Link>
              </div>
              <div className="border-t border-[#cfdae2]">
                {evidenceRules.map(([title, detail]) => (
                  <div key={title} className="grid gap-2 border-b border-[#cfdae2] py-6 sm:grid-cols-[12rem_1fr] sm:gap-6">
                    <h3 className="font-semibold text-[#0b1724]">{title}</h3>
                    <p className="text-sm leading-6 text-[#5b6d7d]">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#29485e] bg-[#071323] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#3ecfb9]">Source & continuity</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">The original desktop project, the web laboratory, and the research record remain in one repository.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8ea4b5]">History is preserved. Public routing is simplified. Distribution claims remain limited to what can be verified.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link href="/download" className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#3ecfb9]/45 px-5 py-3 text-sm font-semibold text-[#72dfcd] hover:bg-[#3ecfb9]/10">Source & Reproducibility →</Link>
              <a href="https://github.com/DresdenGman/EPSILON-trading-simulator" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm text-[#9db0be] hover:bg-white/5 hover:text-white">Open repository ↗</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#26455d] bg-[#06101d] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-[#718a9b] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 EPSILON · Quantitative Decision Lab by Dresden E. Goehner</span>
          <a href="mailto:dresdengoehner@gmail.com" className="hover:text-[#3ecfb9]">dresdengoehner@gmail.com</a>
        </div>
      </footer>
    </div>
  );
}
