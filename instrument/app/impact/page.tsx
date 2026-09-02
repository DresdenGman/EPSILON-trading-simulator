"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recordImpactEvent } from "../../components/impact-tracker";

type Count = { events: number; sessions: number };
type Summary = { status: "live" | "initializing"; updatedAt: string; metrics: Record<string, Count> };

const empty: Summary = { status: "initializing", updatedAt: "", metrics: {} };

function value(summary: Summary, event: string, field: keyof Count = "sessions") {
  return summary.metrics[event]?.[field] ?? 0;
}

export default function ImpactPage() {
  const [summary, setSummary] = useState<Summary>(empty);

  useEffect(() => {
    fetch("/api/impact/summary", { cache: "no-store" })
      .then(async (response) => await response.json() as Summary)
      .then((payload) => setSummary(payload))
      .catch(() => setSummary(empty));
  }, []);

  return (
    <main className="impact-shell">
      <header className="site-header impact-header">
        <Link href="/" className="brand"><span className="epsilon-glyph">ε</span><span>EPSILON</span></Link>
        <nav aria-label="Impact navigation"><Link href="/lab">Open instrument</Link><Link href="/status">Disclosure</Link><a href="https://github.com/DresdenGman/EPSILON-trading-simulator" target="_blank" rel="noreferrer">Source ↗</a></nav>
      </header>

      <section className="impact-intro">
        <div><p className="eyebrow">Public impact record / measured conservatively</p><h1>Reach is visible.<br /><span>Impact must be earned.</span></h1></div>
        <p>EPSILON separates anonymous browser signals from server-verified research use and independently reviewable contribution. A page view is unverified reach. A historical evidence run is counted only after the server completes it. A substantive external challenge becomes impact only when it remains publicly inspectable.</p>
      </section>

      <section className="impact-scorecard" aria-label="Anonymous product activity">
        <article><span>Anonymous lab signals</span><strong>{value(summary, "lab_opened")}</strong><p>Deduplicated, unverified browser sessions that opened the instrument.</p></article>
        <article><span>Verified historical experiments</span><strong>{value(summary, "verified_historical_run", "events")}</strong><p>Unique real-data evidence configurations completed and recorded by the server.</p></article>
        <article><span>Challenge-link signals</span><strong>{value(summary, "challenge_opened")}</strong><p>Unverified sessions that opened the external review channel.</p></article>
        <article><span>Public reproductions</span><strong>0</strong><p>Reserved for independently linkable reproduction records, never browser clicks.</p></article>
      </section>

      <section className="impact-layers">
        <div><p className="eyebrow">Evidence hierarchy</p><h2>Not every number means the same thing.</h2></div>
        <ol>
          <li><span>01 / Reach</span><div><h3>Someone encountered the work.</h3><p>Visits, impressions, and video views are useful distribution diagnostics. They are not counted as adoption or educational impact.</p></div></li>
          <li><span>02 / Use</span><div><h3>The server completed a research action.</h3><p>Only completed historical-data evidence runs are shown as verified product use. Browser openings and link clicks remain explicitly unverified signals.</p></div></li>
          <li><span>03 / External challenge</span><div><h3>Someone tested the method itself.</h3><p>A review counts only when a real person identifies a specific assumption, evidence gap, interpretation risk, or product weakness in a publicly linkable record.</p></div></li>
          <li><span>04 / Change</span><div><h3>The criticism altered the work.</h3><p>Accepted challenges link to the resulting experiment, issue, correction, or product change. Unfavorable findings remain visible.</p></div></li>
        </ol>
      </section>

      <section className="impact-challenge">
        <div><p className="eyebrow">Falsification challenge / open</p><h2>Find the assumption<br />we failed to expose.</h2></div>
        <div><p>The most valuable contribution is not praise. Run one evidence field, identify one weakness, and leave a challenge another person can inspect.</p><div className="impact-action-stack"><a href="https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8" target="_blank" rel="noreferrer" className="primary-button" onClick={() => void recordImpactEvent("challenge_opened")}>Open the challenge protocol <span>↗</span></a><a href="https://github.com/DresdenGman/EPSILON-trading-simulator/issues/new?template=reproduction-report.yml" target="_blank" rel="noreferrer" className="text-link" onClick={() => void recordImpactEvent("reproduce_opened")}>File an independent reproduction →</a></div><p className="impact-integrity">No purchased traffic · no coordinated votes · no investment claims · no account identifiers · coarse source categories only · rolling 90-day measurement window.</p></div>
      </section>

      <footer><span>{summary.status === "live" ? "Measurement live" : "Measurement initializing"}{summary.updatedAt ? ` · ${new Date(summary.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}` : ""}</span><div><Link href="/">Home →</Link><Link href="/lab">Run an evidence field →</Link></div></footer>
    </main>
  );
}
