"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { stripLedger, type LedgerEntry, type Strategy } from "../../lib/backtest";
import { describeRule, evidenceDigest, EPSILON_SOFTWARE_REVISION, evaluateEvidence, type EvidenceRun, type EvidenceVerdict, type FalsificationRule, type Metric, type Operator } from "../../lib/evidence-contract";
import { makeSyntheticRuns } from "../../lib/synthetic";
import { recordImpactEvent } from "../../components/impact-tracker";

type Evidence = {
  format: "epsilon.evidence.v2";
  generatedAt: string;
  artifactHash: string;
  softwareRevision: string;
  claim: string;
  falsification: string;
  config: { strategy: string; start: string; end: string; universe: string; fee: number; slippage: number };
  mode: "controlled-synthetic" | "historical-market-data";
  provenance: { provider: string; adjusted: boolean; symbols: string[]; dataFingerprint: string; timing: string };
  falsificationRule: FalsificationRule;
  verdict: EvidenceVerdict;
  runs: EvidenceRun[];
  baselineLedger: LedgerEntry[];
};

const metricLabels: Record<Metric, string> = { net_return: "Net total return", max_drawdown: "Maximum drawdown", sharpe: "Annualized Sharpe" };
const operatorLabels: Record<Operator, string> = { gt: ">", gte: "≥", lt: "<", lte: "≤" };

function polyline(path: number[]) {
  const min = Math.min(...path) - 1;
  const max = Math.max(...path) + 1;
  return path.map((value, index) => `${(index / (path.length - 1)) * 640},${190 - ((value - min) / (max - min || 1)) * 150}`).join(" ");
}

function displayMetric(value: number, metric: Metric) {
  return `${value > 0 ? "+" : ""}${value.toFixed(metric === "sharpe" ? 3 : 2)}${metric === "sharpe" ? "" : "%"}`;
}

export default function LabPage() {
  const [claim, setClaim] = useState("Momentum remains positive after plausible execution costs.");
  const [metric, setMetric] = useState<Metric>("net_return");
  const [operator, setOperator] = useState<Operator>("gt");
  const [threshold, setThreshold] = useState(0);
  const [strategy, setStrategy] = useState<Strategy>("Momentum (2%)");
  const [start, setStart] = useState("2024-01-01");
  const [end, setEnd] = useState("2024-06-30");
  const [universe, setUniverse] = useState("AAPL,MSFT,GOOGL");
  const [fee, setFee] = useState(0.0001);
  const [slippage, setSlippage] = useState(0.01);
  const [dataMode, setDataMode] = useState<"synthetic" | "historical">("synthetic");
  const [historicalAvailable, setHistoricalAvailable] = useState(false);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [status, setStatus] = useState("Ready / define the rejection rule");
  const [locked, setLocked] = useState(false);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const rule = useMemo<FalsificationRule>(() => ({ metric, operator, threshold, perturbationScope: "all" }), [metric, operator, threshold]);
  const controlsDisabled = locked || pending;

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" }).then((response) => response.json()).then((payload) => {
      const health = payload as { historicalAdapter?: { configured?: boolean; enabled?: boolean; suggestedRange?: { start?: string; end?: string } } };
      const available = Boolean(health.historicalAdapter?.configured && health.historicalAdapter?.enabled);
      setHistoricalAvailable(available);
      if (available) {
        const suggested = health.historicalAdapter?.suggestedRange;
        if (suggested?.start && suggested.end) {
          setStart(suggested.start);
          setEnd(suggested.end);
        }
        setDataMode("historical");
      }
    }).catch(() => setHistoricalAvailable(false));
  }, []);

  function validateInputs() {
    const symbols = universe.split(",").map((symbol) => symbol.trim()).filter(Boolean);
    if (!claim.trim() || claim.trim().length > 240) return "Claim must contain 1–240 characters";
    if (!symbols.length || symbols.length > 5 || symbols.some((symbol) => !/^[A-Z][A-Z0-9.-]{0,9}$/.test(symbol))) return "Use one to five valid ticker symbols";
    const range = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000;
    if (!Number.isFinite(range) || range < 30 || range > 730) return "Date range must be between 30 days and 2 years";
    if (fee < 0 || fee > 0.02 || slippage < 0 || slippage > 10) return "Execution assumptions are outside supported bounds";
    return null;
  }

  async function runEvidence() {
    if (controlsDisabled) return;
    const validation = validateInputs();
    if (validation) { setStatus(validation); return; }
    setPending(true);
    setCopied(false);
    try {
      if (dataMode === "synthetic") {
        const computed = makeSyntheticRuns({ strategy, start, end, universe, fee, slippage });
        const baselineLedger = computed[0].ledger;
        const runs = computed.map(stripLedger);
        const core = {
          format: "epsilon.evidence.v2" as const,
          softwareRevision: EPSILON_SOFTWARE_REVISION,
          claim: claim.trim(),
          falsification: describeRule(rule),
          config: { strategy, start, end, universe, fee, slippage },
          mode: "controlled-synthetic" as const,
          provenance: { provider: "EPSILON deterministic demonstration", adjusted: false, symbols: universe.split(","), dataFingerprint: await evidenceDigest({ strategy, start, end, universe }), timing: "Illustrative deterministic arithmetic; not observed market history." },
          falsificationRule: rule,
          verdict: evaluateEvidence(runs, rule),
          runs,
          baselineLedger,
        };
        const artifactHash = await evidenceDigest(core);
        setEvidence({ ...core, generatedAt: new Date().toISOString(), artifactHash });
        void recordImpactEvent("evidence_completed", { artifactHash, mode: "controlled-synthetic" });
        setLocked(true);
        setStatus("Evidence field complete / six controlled computations");
        return;
      }
      setStatus("Fetching adjusted daily bars / computing six server-side runs");
      const result = await fetch("/api/evidence/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ claim, falsificationRule: rule, strategy, start, end, universe: universe.split(","), fee, slippage }) });
      const payload = await result.json() as Evidence & { error?: string };
      if (!result.ok) throw new Error(payload.error ?? "Historical evidence failed.");
      setEvidence(payload);
      void recordImpactEvent("evidence_completed", { artifactHash: payload.artifactHash, mode: "historical-market-data" });
      setLocked(true);
      setStatus("Historical evidence complete / six server-side computations");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Historical evidence failed");
    } finally {
      setPending(false);
    }
  }

  function downloadEvidence() {
    if (!evidence) return;
    const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `epsilon-${evidence.artifactHash.slice(0, 12)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    void recordImpactEvent("evidence_exported", { artifactHash: evidence.artifactHash, mode: evidence.mode });
  }

  async function copySummary() {
    if (!evidence) return;
    await navigator.clipboard.writeText(`EPSILON ${evidence.verdict.verdict.toUpperCase()} · ${evidence.verdict.survivalCount}/${evidence.verdict.testedCount} perturbations survived · ${metricLabels[evidence.falsificationRule.metric]} worst case ${displayMetric(evidence.verdict.worstCase, evidence.falsificationRule.metric)} · artifact ${evidence.artifactHash.slice(0, 12)}`);
    setCopied(true);
    void recordImpactEvent("summary_copied", { artifactHash: evidence.artifactHash, mode: evidence.mode });
  }

  function editExperiment() {
    setLocked(false);
    setEvidence(null);
    setCopied(false);
    setStatus("Ready / revise the inputs and run a new evidence field");
  }

  return (
    <main className="lab-shell" id="main-content">
      <a className="skip-link" href="#experiment">Skip to experiment</a>
      <header className="lab-header">
        <Link href="/" className="brand"><span className="epsilon-glyph">ε</span><span>EPSILON</span></Link>
        <div className="lab-sequence"><span>01 Define</span><span>02 Perturb</span><span>03 Challenge</span></div>
        <Link href="/status" className="quiet-link">System disclosure →</Link>
      </header>
      <section className="lab-intro">
        <div><p className="eyebrow">Perturbation laboratory / ε</p><h1>Test the neighborhood,<br /><span>not only the line.</span></h1></div>
        <p>Pre-register a machine-readable rejection rule, compute one baseline, then challenge it with atomic and joint stresses.</p>
      </section>

      <div className="lab-grid" id="experiment">
        <section className="setup-panel" aria-label="Experiment setup">
          <div className="panel-title"><div><p className="eyebrow">01 / Define</p><h2>One claim. One rejection rule.</h2></div><span className={`mode-pill ${dataMode === "historical" ? "mode-live" : ""}`}>{dataMode === "synthetic" ? "Demonstration" : "Historical / live"}</span></div>
          <label>Data mode<select disabled={controlsDisabled} value={dataMode} onChange={(event) => setDataMode(event.target.value as "synthetic" | "historical")}><option value="historical" disabled={!historicalAvailable}>Historical market data{historicalAvailable ? " · available" : " · unavailable"}</option><option value="synthetic">Deterministic demonstration</option></select></label>
          <p className="field-note">{dataMode === "historical" ? "Adjusted daily bars are fetched server-side; the provider credential never enters the browser." : "A transparent deterministic sample for learning the workflow—not empirical market evidence."}</p>
          <label>Falsifiable claim<textarea disabled={controlsDisabled} maxLength={240} value={claim} onChange={(event) => setClaim(event.target.value)} rows={3} /></label>
          <fieldset className="rule-fieldset" disabled={controlsDisabled}>
            <legend>Machine rejection rule</legend>
            <div className="rule-grid">
              <label>Metric<select value={metric} onChange={(event) => setMetric(event.target.value as Metric)}><option value="net_return">Net total return</option><option value="max_drawdown">Maximum drawdown</option><option value="sharpe">Annualized Sharpe</option></select></label>
              <label>Must be<select value={operator} onChange={(event) => setOperator(event.target.value as Operator)}>{Object.entries(operatorLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Threshold<input type="number" step={metric === "sharpe" ? "0.1" : "0.5"} min="-1000" max="1000" value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} /></label>
            </div>
            <p>{describeRule(rule)}</p>
          </fieldset>
          <div className="config-grid">
            <label>Strategy<select disabled={controlsDisabled} value={strategy} onChange={(event) => setStrategy(event.target.value as Strategy)}><option>Buy & Hold</option><option>Moving Average (20-day)</option><option>Momentum (2%)</option></select></label>
            <label>Universe<input disabled={controlsDisabled} value={universe} onChange={(event) => setUniverse(event.target.value.toUpperCase())} maxLength={54} spellCheck={false} /></label>
            <label>Start<input disabled={controlsDisabled} type="date" value={start} onChange={(event) => setStart(event.target.value)} /></label>
            <label>End<input disabled={controlsDisabled} type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
            <label>Fee rate<input disabled={controlsDisabled} type="number" step="0.0001" min="0" max="0.02" value={fee} onChange={(event) => setFee(Number(event.target.value))} /></label>
            <label>Slip / share<input disabled={controlsDisabled} type="number" step="0.01" min="0" max="10" value={slippage} onChange={(event) => setSlippage(Number(event.target.value))} /></label>
          </div>
          <div className="stress-list" aria-label="Stress plan"><span>Atomic</span><p>Fee ×5 · slippage ×5 · window +30d · narrow universe</p><span>Joint</span><p>Fee ×5 + slippage ×5 + window +30d</p></div>
          <div className="run-actions"><button className="run-button" disabled={controlsDisabled} onClick={runEvidence}>{pending ? "Computing evidence…" : locked ? "Experiment locked" : "Lock & run evidence field"} <span>{pending ? "◌" : "→"}</span></button>{locked && <button className="edit-button" onClick={editExperiment}>Start a revised experiment</button>}</div>
          <output aria-live="polite" className="run-status">{status}</output>
        </section>

        <section className="result-panel" aria-label="Experiment evidence">
          {!evidence ? <EmptyEvidence /> : (
            <article className="generated-evidence">
              <div className="result-heading"><div><p className="eyebrow">Evidence plate / {evidence.format}</p><h2>{evidence.claim}</h2></div><div className={`verdict verdict-${evidence.verdict.verdict}`}><span>{evidence.verdict.verdict === "rejected" ? "Claim rejected" : evidence.verdict.verdict === "fragile" ? "Claim is fragile" : "Survives tested neighborhood"}</span><strong>{evidence.verdict.survivalCount}/{evidence.verdict.testedCount}</strong></div></div>
              <div className="rejection"><span>Machine rule</span><p>{evidence.falsification}</p></div>
              <figure className="lab-chart"><figcaption><span>Atomic and joint stresses, visible consequences.</span><span>Normalized equity</span></figcaption><svg viewBox="0 0 640 210" aria-labelledby="lab-chart-title"><title id="lab-chart-title">Normalized baseline and perturbation equity paths</title>{[40,90,140,190].map((y) => <line key={y} x1="0" y1={y} x2="640" y2={y} className="grid-line" />)}{evidence.runs.map((run) => <polyline key={run.id} points={polyline(run.path)} fill="none" stroke={run.color} strokeWidth={run.id === "baseline" ? 2.5 : 1.5} vectorEffect="non-scaling-stroke" />)}</svg></figure>
              <div className="table-scroll"><table className="result-table"><caption className="sr-only">Exact baseline and perturbation outcomes</caption><thead><tr><th>Run</th><th>Changed input</th><th>Return</th><th>Sharpe</th><th>Drawdown</th><th>Cost</th></tr></thead><tbody>{evidence.runs.map((run) => <tr key={run.id}><th scope="row"><i style={{ background: run.color }} />{run.label}</th><td>{run.changed}</td><td><strong>{displayMetric(run.returnPct, "net_return")}</strong></td><td>{run.sharpe.toFixed(3)}</td><td>{run.drawdown.toFixed(2)}%</td><td>{run.costPct.toFixed(3)}%</td></tr>)}</tbody></table></div>
              <div className="evidence-metrics"><div><span>Worst tested {metricLabels[evidence.falsificationRule.metric]}</span><strong>{displayMetric(evidence.verdict.worstCase, evidence.falsificationRule.metric)}</strong></div><div><span>Worst threshold margin</span><strong>{displayMetric(evidence.verdict.worstMargin, evidence.falsificationRule.metric)}</strong></div><div><span>Largest sensitivity</span><strong>{evidence.verdict.largestSensitivity ? `${evidence.verdict.largestSensitivity.label} ${evidence.verdict.largestSensitivity.delta > 0 ? "+" : ""}${evidence.verdict.largestSensitivity.delta.toFixed(2)}` : "—"}</strong></div><div><span>Baseline observations</span><strong>{evidence.runs[0].observations}</strong></div></div>
              <div className="artifact-proof"><div><span>Artifact fingerprint</span><code>{evidence.artifactHash.slice(0, 24)}</code></div><div><span>Data fingerprint</span><code>{evidence.provenance.dataFingerprint.slice(0, 24)}</code></div><p>{evidence.provenance.timing}</p></div>
              <div className="artifact-actions"><p>{evidence.mode === "historical-market-data" ? `Adjusted daily bars · ${evidence.provenance.provider} · ${evidence.provenance.symbols.join(", ")}` : "Deterministic demonstration arithmetic"} · research use only · not investment advice</p><div><button onClick={copySummary}>{copied ? "Copied ✓" : "Copy summary"}</button><button onClick={downloadEvidence}>Download evidence ↓</button><a href="https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8" target="_blank" rel="noreferrer" onClick={() => void recordImpactEvent("challenge_opened", { artifactHash: evidence.artifactHash, mode: evidence.mode })}>Challenge the method ↗</a></div></div>
            </article>
          )}
        </section>
      </div>
      <footer className="lab-footer"><span>Claims and settings are processed only to compute the requested evidence and are not stored by EPSILON.</span><Link href="/status">Method, limitations & data disclosure →</Link></footer>
    </main>
  );
}

function EmptyEvidence() {
  return <div className="empty-evidence"><p className="eyebrow">02 / Perturb</p><h2>A single backtest is an answer.<br />A tested neighborhood is evidence.</h2><div className="empty-lines">{["Execution cost", "Slippage", "Test window", "Universe", "Joint stress"].map((item) => <div key={item}><span>ε / {item}</span><i /></div>)}</div></div>;
}
