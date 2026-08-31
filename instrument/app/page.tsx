import Link from "next/link";

const traces = [
  { label: "Baseline", value: "+6.20%", color: "#f5f5f0", points: "0,122 42,112 84,119 126,91 168,99 210,70 252,77 294,47 336,35" },
  { label: "Fee ×5", value: "+4.32%", color: "#a88cff", points: "0,122 42,116 84,121 126,100 168,105 210,83 252,91 294,66 336,58" },
  { label: "Slip ×5", value: "+2.71%", color: "#ff8b5d", points: "0,122 42,119 84,125 126,108 168,117 210,96 252,105 294,88 336,81" },
  { label: "Window +30d", value: "+5.18%", color: "#4dd9c0", points: "0,122 42,109 84,113 126,88 168,95 210,75 252,81 294,59 336,48" },
  { label: "Narrow universe", value: "+5.83%", color: "#ffc857", points: "0,122 42,111 84,116 126,93 168,97 210,72 252,79 294,51 336,40" },
  { label: "Joint stress", value: "+0.84%", color: "#ef5da8", points: "0,122 42,120 84,127 126,113 168,121 210,106 252,114 294,102 336,96" },
];

function EpsilonMark() {
  return (
    <svg aria-label="EPSILON" viewBox="0 0 48 22" className="brand-mark">
      <path d="M2 12c5 0 5-7 10-7s5 12 11 12 6-10 12-10 5 5 11 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="23" cy="17" r="1.8" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <a className="skip-link" href="#evidence">Skip to evidence</a>
      <header className="site-header">
        <Link href="/" className="brand"><EpsilonMark /><span>EPSILON</span></Link>
        <nav aria-label="Primary navigation">
          <a href="#method">Method</a>
          <a href="#evidence">Evidence</a>
          <Link href="/impact">Impact</Link>
          <Link href="/lab" className="nav-cta">Open instrument <span>→</span></Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Quantitative evidence instrument / public access</p>
          <h1>Don’t trust<br />the line.<br /><span>Test its neighborhood.</span></h1>
        </div>
        <div className="hero-argument">
          <p>EPSILON turns one market claim into a field of nearby experiments. It reveals whether a conclusion survives when cost, slippage, window, or universe changes.</p>
          <Link href="/lab" className="primary-button">Run an evidence field <span>→</span></Link>
          <p className="microcopy">Historical evaluation available · no login · no real capital</p>
        </div>
      </section>

      <section id="evidence" className="evidence-section">
        <div className="section-heading">
          <div><p className="eyebrow">Illustrative evidence plate / epsilon.evidence.v2</p><h2>Nearby assumptions.<br />Visible consequences.</h2></div>
          <div className="direction"><span>Sample survival</span><strong>5/5</strong></div>
        </div>

        <article className="evidence-card">
          <div className="claim-block">
            <p className="eyebrow">Illustrative claim / 01</p>
            <h3>Momentum remains directionally positive under nearby execution and sampling assumptions.</h3>
            <div className="falsified"><span>Falsified if</span><p>The return direction reverses when one plausible assumption changes while the others remain fixed.</p></div>
          </div>
          <figure className="field-chart">
            <figcaption><span>Perturbation field / normalized equity</span><span>ε = one changed input</span></figcaption>
            <svg viewBox="0 0 336 150" aria-labelledby="sample-chart-title">
              <title id="sample-chart-title">A baseline equity path compared with four atomic perturbations and one joint stress</title>
              {[30, 60, 90, 120].map((y) => <line key={y} x1="0" y1={y} x2="336" y2={y} className="grid-line" />)}
              {traces.map((trace) => <polyline key={trace.label} points={trace.points} fill="none" stroke={trace.color} strokeWidth={trace.label === "Baseline" ? 2.4 : 1.4} vectorEffect="non-scaling-stroke" />)}
            </svg>
            <div className="legend">{traces.map((trace) => <div key={trace.label}><i style={{ background: trace.color }} /><span>{trace.label}</span><strong>{trace.value}</strong></div>)}</div>
          </figure>
        </article>
      </section>

      <section id="method" className="method-section">
        <div><p className="eyebrow">Method / ε</p><h2>A mathematical idea made into a research behavior.</h2></div>
        <div className="formula"><span>y₀ = f(x)</span><span>yᵢ = f(x + εᵢ)</span><span>Δᵢ = yᵢ − y₀</span></div>
        <ol>
          <li><span>01</span><div><h3>Define</h3><p>Write the claim and rejection rule before computing the answer.</p></div></li>
          <li><span>02</span><div><h3>Perturb</h3><p>Change exactly one documented assumption in each nearby run.</p></div></li>
          <li><span>03</span><div><h3>Challenge</h3><p>Keep assumptions, outcomes, provenance, and limitations together.</p></div></li>
        </ol>
      </section>

      <section className="challenge-section">
        <div>
          <p className="eyebrow">Open challenge / external review</p>
          <h2>Do not endorse it.<br />Try to break it.</h2>
        </div>
        <div>
          <p>Find one assumption, interpretation risk, or evidence gap that EPSILON makes too easy to miss. Every substantive challenge receives a public disposition and an inspectable follow-up.</p>
          <div className="challenge-actions">
            <a href="https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8" target="_blank" rel="noreferrer" className="primary-button">Submit a challenge <span>↗</span></a>
            <Link href="/impact" className="text-link">View the public impact record →</Link>
          </div>
        </div>
      </section>

      <footer><span>© 2026 EPSILON · Dresden E. Goehner</span><div><a href="https://github.com/DresdenGman/EPSILON-trading-simulator" target="_blank" rel="noreferrer">GitHub ↗</a><Link href="/impact">Impact record →</Link><Link href="/status">System disclosure →</Link></div></footer>
    </main>
  );
}
