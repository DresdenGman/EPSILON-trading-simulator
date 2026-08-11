"use client";

import { useState } from "react";
import { api, BacktestResult } from "@/lib/api";
import { diagnoseExperiment, evaluateReplication, ExperimentDiagnosis, ReplicationVerdict } from "@/lib/experiment";

const REPLICATION_WINDOW = { startDate: "2026-01-01", endDate: "2026-03-31" };

interface ReplicationCheckProps {
  primaryDiagnosis: ExperimentDiagnosis;
  strategy: string;
  stockCodes: string[];
  initialCash: number;
  feeRate: number;
  minFee: number;
  baselineSlippage: number;
  perturbedSlippage: number;
  onRun?: () => void;
  onComplete?: () => void;
}

interface RunMetrics {
  totalReturn: number;
  tradeCount: number;
}

function metrics(result: BacktestResult): RunMetrics {
  return { totalReturn: result.performance.total_return, tradeCount: result.trades.length };
}

function signLabel(sign: ExperimentDiagnosis["baselineSign"]) {
  return sign === "positive" ? "POSITIVE" : "NON-POSITIVE";
}

export default function ReplicationCheck({ primaryDiagnosis, strategy, stockCodes, initialCash, feeRate, minFee, baselineSlippage, perturbedSlippage, onRun, onComplete }: ReplicationCheckProps) {
  const [status, setStatus] = useState<"idle" | "running" | "complete" | "failed">("idle");
  const [replication, setReplication] = useState<RunMetrics[] | null>(null);
  const [diagnosis, setDiagnosis] = useState<ExperimentDiagnosis | null>(null);
  const [verdict, setVerdict] = useState<ReplicationVerdict | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runReplication = async () => {
    onRun?.();
    setStatus("running");
    setError(null);
    setReplication(null);
    setDiagnosis(null);
    setVerdict(null);
    const request = { strategy, start_date: REPLICATION_WINDOW.startDate, end_date: REPLICATION_WINDOW.endDate, stock_codes: stockCodes, initial_cash: initialCash, fee_rate: feeRate, min_fee: minFee };
    try {
      const [baselineResult, perturbedResult] = await Promise.all([
        api.backtest({ ...request, slippage_per_share: baselineSlippage }),
        api.backtest({ ...request, slippage_per_share: perturbedSlippage }),
      ]);
      const baseline = metrics(baselineResult);
      const perturbed = metrics(perturbedResult);
      const result = diagnoseExperiment({ baselineReturn: baseline.totalReturn, perturbedReturn: perturbed.totalReturn, baselineTrades: baseline.tradeCount, perturbedTrades: perturbed.tradeCount, parameter: "slippage_per_share", baselineParameter: baselineSlippage, perturbedParameter: perturbedSlippage });
      setReplication([baseline, perturbed]);
      setDiagnosis(result);
      setVerdict(evaluateReplication(primaryDiagnosis, result));
      setStatus("complete");
      onComplete?.();
    } catch (e) {
      setStatus("failed");
      setError(e instanceof Error ? e.message : "The replication service did not return a complete result.");
    }
  };

  const verdictLabel = verdict === "replicated" ? "REPLICATED · WITHIN TWO PRE-SPECIFIED FIXED WINDOWS" : verdict === "not_replicated" ? "NOT REPLICATED" : "REPLICATION INCONCLUSIVE";
  const primaryPattern = `${signLabel(primaryDiagnosis.baselineSign)} → ${signLabel(primaryDiagnosis.perturbedSign)}`;
  const replicationPattern = diagnosis ? `${signLabel(diagnosis.baselineSign)} → ${signLabel(diagnosis.perturbedSign)}` : null;

  return (
    <section id="demo-step-5" className={`px-5 py-8 md:px-8 md:py-10 ${verdict === "not_replicated" ? "bg-warning/5" : ""}`} aria-label="Pre-specified replication check">
      <div className="font-mono text-2xs uppercase tracking-[0.18em] text-primary">05 / Replication challenge</div>
      <h2 className="mt-3 text-2xl font-semibold">The obvious objection: was the primary window cherry-picked?</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-base-content/60">Repeat the exact protocol on the immediately preceding non-overlapping calendar quarter. The rule and window are visible before execution.</p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="border border-base-300/70 p-4"><div className="font-mono text-2xs uppercase tracking-[0.14em] text-base-content/35">Selection rule</div><div className="mt-2 text-sm text-base-content/70">Immediately preceding non-overlapping calendar quarter.</div></div>
        <div className="border border-primary/30 bg-primary/5 p-4"><div className="font-mono text-2xs uppercase tracking-[0.14em] text-primary/70">Pre-specified window</div><div className="mt-2 font-mono text-sm text-base-content">{REPLICATION_WINDOW.startDate} → {REPLICATION_WINDOW.endDate}</div></div>
      </div>

      <div className="mt-5 border-l-2 border-warning/50 bg-warning/5 px-4 py-3"><div className="font-mono text-2xs uppercase tracking-[0.14em] text-warning/80">Falsification rule</div><p className="mt-2 text-xs leading-relaxed text-base-content/70">Replication succeeds only if the same valid return-sign pattern appears. Any valid sign reversal is <b>NOT REPLICATED</b>.</p></div>

      <button onClick={runReplication} disabled={status === "running"} className="mt-5 min-h-10 rounded-md border border-primary/50 px-4 py-2 font-mono text-2xs font-semibold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50">{status === "running" ? "Replication running…" : status === "complete" ? "Retry replication" : "Run pre-specified replication"}</button>

      {status === "failed" && <div className="mt-4 border-l-2 border-error/50 bg-error/5 p-4 text-sm text-error"><div className="font-mono text-2xs uppercase tracking-[0.14em]">Replication interrupted</div><p className="mt-2 text-error/80">{error} No cross-window conclusion generated.</p></div>}

      {replication && diagnosis && verdict && <div className="mt-6 border-t border-base-300/70 pt-5"><div className="font-mono text-2xs uppercase tracking-[0.16em] text-primary">Replication evidence</div><div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3"><div><span className="block font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">Primary pattern</span><span className="mt-1 block text-sm font-semibold">{primaryPattern}</span></div><div><span className="block font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">Replication pattern</span><span className="mt-1 block text-sm font-semibold">{replicationPattern}</span></div><div><span className="block font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">Replication return</span><span className="mt-1 block font-mono text-sm">{replication[0].totalReturn.toFixed(2)}% → {replication[1].totalReturn.toFixed(2)}%</span></div></div><div className={`mt-5 border-l-2 p-4 ${verdict === "replicated" ? "border-primary bg-primary/5" : verdict === "not_replicated" ? "border-warning bg-warning/5" : "border-base-300 bg-base-200/30"}`}><div className={`font-mono text-sm font-semibold tracking-[0.14em] ${verdict === "not_replicated" ? "text-warning" : "text-primary"}`}>{verdictLabel}</div><p className="mt-2 text-sm leading-relaxed text-base-content/70">{verdict === "replicated" ? "The same local sensitivity pattern appeared in both pre-specified windows." : verdict === "not_replicated" ? "The sensitivity classification or return direction changed across windows. The primary result remains unchanged; no general robustness claim is made." : "The replication did not produce two valid comparable runs. No cross-window conclusion generated."}</p></div><div className="mt-4 grid gap-3 border-t border-base-300/70 pt-4 text-xs md:grid-cols-2"><div><div className="font-mono text-2xs uppercase tracking-[0.14em] text-base-content/35">What this means</div><p className="mt-1 text-base-content/65">{verdict === "replicated" ? "The same narrow sensitivity pattern appeared twice under the fixed protocol." : "The second window challenged the primary result and the outcome is preserved honestly."}</p></div><div><div className="font-mono text-2xs uppercase tracking-[0.14em] text-base-content/35">What this does not mean</div><p className="mt-1 text-base-content/65">Not historical validation, profitability, statistical significance, general robustness, or predictive performance.</p></div></div></div>}
    </section>
  );
}
