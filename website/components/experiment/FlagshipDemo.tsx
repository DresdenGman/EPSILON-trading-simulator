"use client";

import { useMemo, useState } from "react";
import { api, BacktestResult } from "@/lib/api";
import { diagnoseExperiment, ExperimentDiagnosis } from "@/lib/experiment";
import { GUEST_MODE } from "@/lib/guest-mode";
import DemoProgress from "./DemoProgress";
import ReplicationCheck from "./ReplicationCheck";

const DEMO_EXPERIMENT = {
  id: "EXP-001",
  hypothesis: "Does the conclusion remain unchanged when execution friction increases slightly?",
  strategy: "momentum",
  stockCodes: ["AAPL", "MSFT", "NVDA"],
  initialCash: 100000,
  startDate: "2026-04-01",
  endDate: "2026-07-01",
  feeRate: 0.0001,
  minFee: 1,
  baselineSlippage: 0.01,
  perturbedSlippage: 0.02,
};

type DemoState = "idle" | "running" | "complete" | "inconclusive" | "failed";

function resultMetrics(result: BacktestResult, slippagePerShare: number) {
  return {
    slippagePerShare,
    totalReturn: result.performance.total_return,
    sharpe: result.performance.sharpe,
    maxDrawdown: result.performance.max_drawdown,
    tradeCount: result.trades.length,
  };
}

function formatReturn(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function Metric({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`border-l border-primary/35 pl-3 ${muted ? "text-base-content/55" : ""}`}>
      <div className="font-mono text-2xs uppercase tracking-[0.12em] text-base-content/35">{label}</div>
      <div className="mt-1 text-lg font-semibold text-base-content">{value}</div>
    </div>
  );
}

export default function FlagshipDemo() {
  const [state, setState] = useState<DemoState>("idle");
  const [phase, setPhase] = useState(0);
  const [baseline, setBaseline] = useState<ReturnType<typeof resultMetrics> | null>(null);
  const [perturbed, setPerturbed] = useState<ReturnType<typeof resultMetrics> | null>(null);
  const [diagnosis, setDiagnosis] = useState<ExperimentDiagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runExperiment = async () => {
    setState("running");
    setPhase(1);
    setError(null);
    setBaseline(null);
    setPerturbed(null);
    setDiagnosis(null);

    const request = {
      strategy: DEMO_EXPERIMENT.strategy,
      start_date: DEMO_EXPERIMENT.startDate,
      end_date: DEMO_EXPERIMENT.endDate,
      stock_codes: DEMO_EXPERIMENT.stockCodes,
      initial_cash: DEMO_EXPERIMENT.initialCash,
      fee_rate: DEMO_EXPERIMENT.feeRate,
      min_fee: DEMO_EXPERIMENT.minFee,
    };

    try {
      const [baseResult, epsilonResult] = await Promise.all([
        api.backtest({ ...request, slippage_per_share: DEMO_EXPERIMENT.baselineSlippage }),
        api.backtest({ ...request, slippage_per_share: DEMO_EXPERIMENT.perturbedSlippage }),
      ]);
      const base = resultMetrics(baseResult, DEMO_EXPERIMENT.baselineSlippage);
      const epsilon = resultMetrics(epsilonResult, DEMO_EXPERIMENT.perturbedSlippage);
      const result = diagnoseExperiment({
        baselineReturn: base.totalReturn,
        perturbedReturn: epsilon.totalReturn,
        baselineTrades: base.tradeCount,
        perturbedTrades: epsilon.tradeCount,
        parameter: "slippage_per_share",
        baselineParameter: base.slippagePerShare,
        perturbedParameter: epsilon.slippagePerShare,
      });

      setBaseline(base);
      setPerturbed(epsilon);
      setDiagnosis(result);
      setState(result.valid ? "complete" : "inconclusive");
      setPhase(result.valid ? 2 : 1);
    } catch (e) {
      setState("failed");
      setPhase(0);
      setError(e instanceof Error ? e.message : "The backtest service did not return a complete result.");
    }
  };

  const statusText = state === "running"
    ? "PRIMARY CONTROLLED RUNS IN PROGRESS…"
    : state === "failed"
      ? "ENGINE UNAVAILABLE"
      : state === "inconclusive"
        ? "PRIMARY INCONCLUSIVE"
        : state === "complete"
          ? "PRIMARY COMPLETE"
          : "READY TO RUN";
  const delta = baseline && perturbed ? perturbed.totalReturn - baseline.totalReturn : null;
  const conclusionText = useMemo(() => {
    if (!diagnosis) return null;
    if (diagnosis.outcome === "reversed") return "The conclusion failed under the ε perturbation.";
    const direction = diagnosis.baselineSign === "positive" ? "positive-return" : "non-positive";
    return `The ${direction} conclusion survived a +$0.01/share increase in execution slippage.`;
  }, [diagnosis]);

  return (
    <div>
      <DemoProgress activeStep={phase} />

      <article className="divide-y divide-base-300/70 border-y border-base-300/70">

      <section id="demo-step-1" className="px-5 py-9 md:px-8 md:py-12">
        <div className="font-mono text-2xs uppercase tracking-[0.18em] text-primary">01 / Question · {DEMO_EXPERIMENT.id}</div>
        <h2 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
          {DEMO_EXPERIMENT.hypothesis}
        </h2>

        <div className="mt-8 border-y border-base-300/70 py-5">
          <div className="font-mono text-2xs uppercase tracking-[0.16em] text-base-content/40">Controlled change</div>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="border border-base-300/70 px-4 py-3">
              <div className="font-mono text-2xs uppercase tracking-[0.14em] text-base-content/40">Baseline</div>
              <div className="mt-1 font-mono text-lg text-base-content">$0.010<span className="ml-1 text-xs text-base-content/45">/share</span></div>
            </div>
            <div className="text-center font-mono text-xs text-primary">ONLY VARIABLE CHANGED<br /><span className="text-2xs text-primary/70">ε = +$0.010/share</span></div>
            <div className="border border-primary/35 bg-primary/5 px-4 py-3">
              <div className="font-mono text-2xs uppercase tracking-[0.14em] text-primary/70">+ε perturbed</div>
              <div className="mt-1 font-mono text-lg text-base-content">$0.020<span className="ml-1 text-xs text-base-content/45">/share</span></div>
            </div>
          </div>
        </div>

        <div className="mt-5 border-l-2 border-warning/50 bg-warning/5 px-4 py-4">
          <div className="font-mono text-2xs uppercase tracking-[0.16em] text-warning/80">Falsification rule</div>
          <p className="mt-2 text-sm font-semibold text-base-content">The conclusion is preserved only if total return keeps the same sign.</p>
          <p className="mt-1 text-xs leading-relaxed text-base-content/55">A sign reversal falsifies the claim. No robustness score or post-result threshold is added.</p>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-2xs uppercase tracking-wide text-base-content/45">
            <span><b className="text-base-content/70">Window</b> {DEMO_EXPERIMENT.startDate} → {DEMO_EXPERIMENT.endDate}</span>
            <span><b className="text-base-content/70">Universe</b> {DEMO_EXPERIMENT.stockCodes.join(" · ")}</span>
            <span><b className="text-base-content/70">Capital</b> $100,000</span>
          </div>
          <button onClick={runExperiment} disabled={state === "running"} className="min-h-10 min-w-44 rounded-md bg-primary px-4 py-2 font-mono text-2xs font-semibold uppercase tracking-[0.1em] text-primary-content transition-colors hover:bg-[#65dcc8] disabled:cursor-not-allowed disabled:opacity-50">
            {state === "running" ? "Running…" : state === "complete" || state === "inconclusive" ? "Run primary again" : "Run primary ε test"}
          </button>
        </div>
      </section>

      <section id="demo-step-2" className="px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="font-mono text-2xs uppercase tracking-[0.18em] text-primary">02 / Primary evidence</div>
          <span role="status" aria-live="polite" className={`font-mono text-2xs ${state === "failed" ? "text-error" : "text-base-content/45"}`}>{statusText}</span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-base-content/60">Same strategy, universe, capital, date window, fees, and model. Only execution slippage changes.</p>
        <div className="mt-3 border-l-2 border-primary/30 pl-3 font-mono text-2xs uppercase tracking-[0.12em] text-base-content/45">Data: controlled synthetic path · Model: {GUEST_MODE ? "browser-local windowed model" : "CSP-v1"} · Synthetic ≠ historical market validation</div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="border border-base-300/70 p-4 font-mono text-xs"><div className="text-base-content/40">BASELINE · $0.010/share</div><div className="mt-2 text-base-content/55">{baseline ? "COMPLETE" : state === "running" ? "RUNNING…" : "WAITING"}</div></div>
          <div className="border border-primary/25 bg-primary/5 p-4 font-mono text-xs"><div className="text-primary/70">+ε · $0.020/share</div><div className="mt-2 text-base-content/55">{perturbed ? "COMPLETE" : state === "running" ? "RUNNING…" : "WAITING"}</div></div>
        </div>

        {state === "failed" && <div className="mt-4 border-l-2 border-error/50 bg-error/5 p-4 text-sm text-error"><div className="font-mono text-2xs uppercase tracking-[0.14em]">Engine unavailable</div><p className="mt-2 text-error/80">{error} No primary conclusion generated.</p><button onClick={runExperiment} className="mt-3 border border-error/40 px-3 py-2 font-mono text-2xs uppercase tracking-[0.1em] transition-colors hover:bg-error/10">Retry primary</button></div>}
      </section>

      {baseline && perturbed && <section id="demo-step-3" className="px-5 py-8 md:px-8 md:py-10"><div className="flex flex-wrap items-center justify-between gap-2"><div className="font-mono text-2xs uppercase tracking-[0.18em] text-primary">03 / Diagnosis</div><span className="font-mono text-2xs text-base-content/45">{DEMO_EXPERIMENT.startDate} → {DEMO_EXPERIMENT.endDate}</span></div><div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4"><Metric label="Baseline total return" value={formatReturn(baseline.totalReturn)} muted /><Metric label="+ε total return" value={formatReturn(perturbed.totalReturn)} muted /><Metric label="Δ return" value={`${delta !== null && delta >= 0 ? "+" : ""}${delta?.toFixed(2)} pp`} muted /><Metric label="Executed trades" value={`${baseline.tradeCount} → ${perturbed.tradeCount}`} muted /></div><div className="mt-5 border-t border-base-300/70 pt-3 font-mono text-2xs uppercase tracking-[0.14em] text-primary/70">Decision input: return sign · One variable changed: execution friction</div></section>}

      {diagnosis && <section id="demo-step-4" className={`border-l-2 px-5 py-8 md:px-8 md:py-10 ${diagnosis.outcome === "reversed" ? "border-l-warning bg-warning/5" : "border-l-primary bg-primary/[0.03]"}`}><div className="flex flex-wrap items-center justify-between gap-3"><div className="font-mono text-2xs uppercase tracking-[0.18em] text-primary">04 / Primary conclusion</div><span className={`border px-2 py-1 font-mono text-2xs ${diagnosis.outcome === "reversed" ? "border-warning/50 text-warning" : "border-primary/50 text-primary"}`}>{diagnosis.outcome === "preserved" ? "PRESERVED" : "REVERSED"}</span></div><h2 className="mt-4 text-xl font-semibold">{conclusionText}</h2><p className="mt-2 text-sm leading-relaxed text-base-content/60">{diagnosis.effect === "weakened" ? "Execution friction weakened the observed result without reversing its direction." : "The perturbation did not weaken the observed result."}</p></section>}

      {diagnosis?.valid && <ReplicationCheck primaryDiagnosis={diagnosis} strategy={DEMO_EXPERIMENT.strategy} stockCodes={DEMO_EXPERIMENT.stockCodes} initialCash={DEMO_EXPERIMENT.initialCash} feeRate={DEMO_EXPERIMENT.feeRate} minFee={DEMO_EXPERIMENT.minFee} baselineSlippage={DEMO_EXPERIMENT.baselineSlippage} perturbedSlippage={DEMO_EXPERIMENT.perturbedSlippage} onRun={() => setPhase(3)} onComplete={() => setPhase(4)} />}

      <section id="demo-step-6" className="px-5 py-8 md:px-8 md:py-10"><div className="border-l-2 border-warning/50 pl-4"><div className="font-mono text-2xs uppercase tracking-[0.18em] text-warning/80">06 / Limits</div><h2 className="mt-3 text-xl font-semibold">A local sensitivity result is not general robustness.</h2><div className="mt-4 grid gap-2 border-y border-warning/15 py-4 font-mono text-2xs uppercase tracking-[0.12em] text-base-content/50 sm:grid-cols-2 md:grid-cols-4"><span>1 strategy configuration</span><span>2 controlled windows</span><span>1 perturbed parameter</span><span>1 ε magnitude</span></div><p className="mt-5 max-w-3xl text-sm leading-relaxed text-base-content/65">The experiment shows whether this specific conclusion survived this specific perturbation and a pre-specified replication window. It does not establish historical market validity, profitability, statistical significance, general robustness, or predictive performance.</p></div></section>
      </article>
    </div>
  );
}
