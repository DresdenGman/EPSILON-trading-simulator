import Link from "next/link";
import { discussion, milestones, participationPaths, repository } from "../lib/project-story";

export default function Home() {
  return (
    <main className="site-shell overview-shell">
      <a className="skip-link" href="#overview">Skip to project overview</a>
      <header className="site-header overview-header">
        <Link href="/" className="brand"><span className="epsilon-glyph">ε</span><span>EPSILON</span></Link>
        <nav aria-label="Primary navigation"><a href="#overview">Project</a><a href="#timeline">Timeline</a><a href="#participate">Participate</a><Link href="/lab" className="nav-cta">Open lab</Link></nav>
      </header>

      <section className="project-hero">
        <div>
          <p className="eyebrow">Economics · mathematical modeling · open source</p>
          <h1>Build a model.<br />Question its<br /><span>conclusions.</span></h1>
          <p className="hero-summary">EPSILON is a quantitative decision lab: turn a market idea into a testable claim, change its assumptions, and keep the evidence—even when the claim fails.</p>
          <div className="overview-actions"><Link href="/lab" className="primary-button">Explore the instrument <span>→</span></Link><a href={discussion} className="text-link">Bring a question ↗</a></div>
          <p className="microcopy">No login required · historical research · no real-money trading</p>
        </div>
        <aside className="project-index" aria-label="Project at a glance">
          <p className="eyebrow">The project at a glance</p>
          <dl>
            <div><dt>Built by</dt><dd>Dresden E. Goehner, with open-source contributions</dd></div>
            <div><dt>First source records</dt><dd>December 2025</dd></div>
            <div><dt>Recognition</dt><dd>Diamond Challenge 2026<br /><strong>Third Prize · Beijing Pitch Event</strong></dd></div>
            <div><dt>Current focus</dt><dd>Assumption sensitivity, reproducible evidence, and external critique</dd></div>
          </dl>
          <a href="#timeline">Follow the development record ↓</a>
        </aside>
      </section>

      <section id="overview" className="overview-section">
        <div className="overview-heading"><p className="eyebrow">01 / The question</p><h2>A convincing curve is not<br />the whole argument.</h2><p>A financial result depends on its inputs, timing, costs, and comparison. EPSILON makes those choices inspectable instead of treating a single output as a forecast.</p></div>
        <div className="overview-columns">
          <article><span className="section-number">Economics</span><h3>Decisions have frictions.</h3><p>Fees and execution assumptions affect returns. An experiment states what is being measured, over which period, and under which constraints.</p></article>
          <article><span className="section-number">Mathematics</span><h3>Change an assumption.</h3><p>Compare an output with nearby, explicitly specified alternatives. Measure the difference; do not mistake a finite sensitivity exercise for a proof of general robustness.</p></article>
          <article><span className="section-number">Systems</span><h3>Keep the chain intact.</h3><p>Connect the claim, rejection rule, computation, provenance, and export. A result stays attached to the inputs and software that produced it.</p></article>
        </div>
      </section>

      <section id="method" className="overview-section method-overview">
        <div className="overview-heading"><p className="eyebrow">02 / What you can do today</p><h2>One claim.<br />Six visible computations.</h2></div>
        <ol className="workflow-strip">
          <li><span>01</span><h3>Define</h3><p>Specify the strategy, universe, dates, costs, and rejection rule before the run.</p></li>
          <li><span>02</span><h3>Compare</h3><p>Run a baseline, four individual stresses, and one joint stress. Inspect each changed assumption.</p></li>
          <li><span>03</span><h3>Inspect</h3><p>Read the verdict alongside metrics, data mode, source identity, and limitations.</p></li>
          <li><span>04</span><h3>Challenge</h3><p>Export the evidence, report a mismatch, or propose a revised experiment without erasing the original.</p></li>
        </ol>
        <div className="mode-note"><p><strong>Two distinct modes.</strong> The browser demonstration uses deterministic illustrative arithmetic. Historical mode requests adjusted daily market data from the server-side provider; availability and limits apply. A failed historical request is not replaced with synthetic data.</p><Link href="/status">Read the method and limitations →</Link></div>
      </section>

      <section id="evidence" className="overview-section case-section">
        <div className="overview-heading"><p className="eyebrow">03 / A recorded result, not a success story</p><h2>The negative result<br />stays in the record.</h2><p>Fixed historical case 001 · maintainer observation · September 13, 2026</p></div>
        <div className="case-summary"><div><span>Baseline net return</span><strong>−7.75%</strong></div><div><span>Perturbations passing</span><strong>0 / 5</strong></div><div><span>Claim verdict</span><strong>Rejected</strong></div></div>
        <div className="case-explanation"><p><strong>The test:</strong> SPY and QQQ, Momentum (2%), September 1, 2025–February 27, 2026. Reject unless net return is positive in all five predefined perturbations.</p><p><strong>The boundary:</strong> the baseline was already negative. This is not a profitable strategy overturned by stress testing, proof that all momentum fails, or an independent external reproduction.</p></div>
        <a className="text-link" href={repository + "/blob/main/docs/REFERENCE_CASE.md"}>Inspect inputs, result, and reproduction instructions ↗</a>
      </section>

      <section id="timeline" className="overview-section timeline-section">
        <div className="overview-heading"><p className="eyebrow">04 / Development & recognition</p><h2>From trading simulator<br />to evidence instrument.</h2><p>Recorded milestones—not an invented origin story. Earlier implementations remain in the same repository.</p></div>
        <ol className="project-timeline">{milestones.map((item) => <li key={item.date}><div className="milestone-date"><span>{item.date}</span><small>{item.kind}</small></div><div><h3>{item.title}</h3><p>{item.description}</p><a href={item.href}>{item.kind === "Recognition" ? "View the award certificate" : "Inspect the source record"} ↗</a></div></li>)}</ol>
        <a className="text-link" href={repository + "/blob/main/docs/PROJECT_HISTORY.md"}>Full timeline and evidence notes ↗</a>
      </section>

      <section id="participate" className="overview-section participation-section">
        <div className="overview-heading"><p className="eyebrow">05 / Help shape the work</p><h2>Bring a question<br />you cannot quite resolve.</h2><p>An unexpected backtest result, an uncertain cost assumption, or a conclusion that seems too broad. Start with the question; you do not need a pull request.</p></div>
        <div className="overview-columns">{participationPaths.map((path) => <article key={path.title}><h3>{path.title}</h3><p>{path.description}</p><a href={path.href}>{path.label} ↗</a></article>)}</div>
        <div className="mode-note"><p><strong>A small first round:</strong> we aim to work through three concrete questions in public. Share the claim, what worries you, and an optional public example. Maintainers will scope what can be tested, document findings or blockers, and invite your response. This is not a promise to solve every problem.</p><p>Never post API keys, brokerage information, private data, or material you cannot redistribute. No endorsement or GitHub star is required.</p></div>
      </section>

      <section className="overview-section record-section">
        <div className="overview-heading"><p className="eyebrow">06 / Progress without inflated claims</p><h2>Attention, use, and change<br />are different outcomes.</h2></div>
        <div className="case-explanation"><p>GitHub stars and forks show repository attention. Browser sessions indicate visits, not distinct people. A server-completed run is not automatically an independent reproduction. Public feedback and resulting changes need their own records.</p><p><strong>Next, not yet achieved:</strong> a small assumption-clinic pilot, a documented feedback-led improvement, and a session reused by another host. These are goals, not reported beneficiaries or partnerships.</p></div>
        <div className="overview-actions"><Link href="/impact" className="text-link">Inspect the impact ledger →</Link><a href={repository + "/blob/main/docs/INDEPENDENT_REVIEW_LOG.md"} className="text-link">Read the external review log ↗</a></div>
      </section>
      <footer><span>EPSILON · Dresden E. Goehner · MIT license<br />Educational research, not investment advice.</span><div><a href={repository}>GitHub ↗</a><Link href="/status">System disclosure</Link><Link href="/impact">Impact record</Link></div></footer>
    </main>
  );
}
