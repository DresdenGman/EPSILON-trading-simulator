import Link from "next/link";

const checks = [
  ["Evidence engine", "Operational", "Baseline + four atomic perturbations + one joint execution stress"],
  ["Rejection rule", "Operational", "Machine-evaluable metric, operator, threshold, and required scope"],
  ["Portable artifact", "Operational", "epsilon.evidence.v2 JSON with calculation and data fingerprints"],
  ["Execution timing", "Documented", "Signals use information through the prior close; positions apply to the next return"],
  ["Real-capital execution", "Not connected", "Research instrument only; no orders, brokerage, or custody"],
];

export default function StatusPage() {
  const historicalConfigured = Boolean(process.env.MASSIVE_API_KEY);
  const historicalEnabled = process.env.HISTORICAL_DATA_ENABLED === "true";

  return (
    <main className="status-shell" id="main-content">
      <a className="skip-link" href="#system-status">Skip to system status</a>
      <header className="lab-header">
        <Link href="/" className="brand"><span className="epsilon-glyph">ε</span><span>EPSILON</span></Link>
        <span className="status-header-label">System disclosure</span>
        <Link href="/lab" className="quiet-link">Open instrument →</Link>
      </header>
      <section className="status-intro">
        <div><p className="eyebrow">System status / disclosure</p><h1>What is live.<br /><span>What is not.</span></h1></div>
        <p>EPSILON separates working behavior from future ambition. This page is the public contract for method, data, and limitations.</p>
      </section>
      <section className="status-grid" id="system-status">
        {checks.map(([name, state, detail]) => (
          <article key={name}><div><i className={state === "Operational" || state === "Documented" ? "status-dot live" : "status-dot"} /><span>{state}</span></div><h2>{name}</h2><p>{detail}</p></article>
        ))}
        <article>
          <div><i className={`status-dot ${historicalConfigured && historicalEnabled ? "live" : ""}`} /><span>{historicalConfigured && historicalEnabled ? "Evaluation access" : "Not enabled"}</span></div>
          <h2>Historical adapter</h2>
          <p>{historicalConfigured && historicalEnabled ? "Adjusted daily bars are queried server-side under the owner’s provider account and remain subject to provider terms." : "The adapter is present but no public historical computation is active."}</p>
        </article>
      </section>

      <section className="disclosure-section">
        <div><p className="eyebrow">Method / no hidden leap</p><h2>What the verdict means.</h2></div>
        <div className="disclosure-grid">
          <article><span>01</span><h3>Pre-register</h3><p>A claim is paired with a metric, comparison operator, threshold, and perturbation scope before computation.</p></article>
          <article><span>02</span><h3>Lag signals</h3><p>Historical strategies use only information available through the prior close. This prevents same-period look-ahead.</p></article>
          <article><span>03</span><h3>Perturb locally</h3><p>Four one-factor runs isolate sensitivity; one joint stress exposes execution interactions. Survival is evidence of local robustness, not proof.</p></article>
          <article><span>04</span><h3>Keep the trail</h3><p>The export includes configuration, exact outcomes, baseline ledger, provider provenance, limitations, and deterministic fingerprints.</p></article>
        </div>
      </section>

      <section className="limits-section">
        <div><p className="eyebrow">Limitations / read before use</p><h2>Honest boundaries.</h2></div>
        <ul>
          <li><strong>Not investment advice.</strong><span>Results are research outputs and do not recommend trades or predict future performance.</span></li>
          <li><strong>Historical universes are user-selected.</strong><span>EPSILON does not yet provide a point-in-time constituent database, so survivorship bias remains possible.</span></li>
          <li><strong>Adjusted bars simplify reality.</strong><span>Daily close-to-close simulation omits intraday liquidity, market impact, taxes, borrow constraints, and partial fills.</span></li>
          <li><strong>Public open corpus is pending.</strong><span>The bundled corpus manifest remains unapproved; it is not used by the production engine.</span></li>
          <li><strong>No account or storage layer.</strong><span>Claims and settings are processed to produce the response and are not stored by EPSILON.</span></li>
        </ul>
      </section>
      <footer><span>Honest state over inflated claims.</span><div><a href="https://github.com/DresdenGman/EPSILON-trading-simulator" target="_blank" rel="noreferrer">Source & research trail ↗</a><Link href="/api/health">Machine-readable health →</Link></div></footer>
    </main>
  );
}
