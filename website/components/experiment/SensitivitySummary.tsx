"use client";

interface SensitivitySummaryProps {
  totalReturn?: number;
  status: "pending" | "running" | "validated" | "inconclusive" | "failed";
  baseline?: SensitivityRun | null;
  perturbed?: SensitivityRun | null;
  conclusion?: "preserved" | "reversed" | null;
  error?: string | null;
  onRun: () => void;
}

export interface SensitivityRun {
  slippagePerShare: number;
  totalReturn: number;
  sharpe: number;
  maxDrawdown: number;
  tradeCount: number;
}

export default function SensitivitySummary({
  totalReturn,
  status,
  baseline,
  perturbed,
  conclusion,
  error,
  onRun,
}: SensitivitySummaryProps) {
  const deltaReturn = baseline && perturbed ? perturbed.totalReturn - baseline.totalReturn : null;
  const statusLabel = {
    pending: "VALIDATION PENDING",
    running: "RUNNING ε VALIDATION…",
    validated: conclusion === "preserved" ? "PRESERVED ε-STABLE" : "REVERSED ε-FRAGILE",
    inconclusive: "INCONCLUSIVE",
    failed: "VALIDATION FAILED",
  }[status];

  const statusClass = status === "validated"
    ? conclusion === "preserved" ? "text-success" : "text-error"
    : status === "failed" ? "text-error" : "text-warning";

  return (
    <section className="surface-card rounded-box border-base-300/80 px-4 py-3" aria-label="Epsilon sensitivity summary">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-mono text-2xs uppercase tracking-[0.16em] text-base-content/40">ε sensitivity</div>
          <div className="mt-1 text-xs font-semibold text-base-content">How fragile is the conclusion?</div>
        </div>
        <span className={`badge badge-ghost font-mono text-2xs ${statusClass}`}>{statusLabel}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-2xs">
        <div className="border-l border-primary/35 pl-2">
          <div className="uppercase tracking-wide text-base-content/35">Baseline slip</div>
          <div className="text-xs text-base-content/75">$0.010</div>
        </div>
        <div className="border-l border-primary/35 pl-2">
          <div className="uppercase tracking-wide text-base-content/35">ε slip</div>
          <div className="text-xs text-base-content/75">$0.020</div>
        </div>
        <div className="border-l border-primary/35 pl-2">
          <div className="uppercase tracking-wide text-base-content/35">Δ return</div>
          <div className="text-xs text-base-content/75">{deltaReturn === null ? "—" : `${deltaReturn >= 0 ? "+" : ""}${deltaReturn.toFixed(2)} pp`}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-base-300/70 pt-2 font-mono text-2xs">
        <span className="text-base-content/40">Baseline return</span>
        <span className={totalReturn !== undefined && totalReturn >= 0 ? "text-success" : "text-base-content/65"}>
          {baseline ? `${baseline.totalReturn >= 0 ? "+" : ""}${baseline.totalReturn.toFixed(2)}%` : totalReturn !== undefined ? `${totalReturn >= 0 ? "+" : ""}${totalReturn.toFixed(2)}%` : "—"}
        </span>
      </div>

      {baseline && perturbed && (
        <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-2xs text-base-content/50">
          <span>Sharpe {baseline.sharpe.toFixed(2)} → {perturbed.sharpe.toFixed(2)}</span>
          <span>Trades {baseline.tradeCount} → {perturbed.tradeCount}</span>
        </div>
      )}

      {status === "inconclusive" && <p className="mt-2 text-2xs text-warning">No executed trades in one run; no sensitivity conclusion was generated.</p>}
      {error && <p className="mt-2 text-2xs text-error">{error}</p>}

      <details className="mt-2 text-2xs text-base-content/45">
        <summary className="cursor-pointer hover:text-base-content/70">Perturbation details</summary>
        <p className="mt-1 leading-relaxed">Only execution friction changes: slippage $0.010 → $0.020 per share. A conclusion is valid only when both runs execute at least one trade.</p>
      </details>

      <button onClick={onRun} disabled={status === "running"} className="btn btn-outline btn-primary btn-xs mt-3 w-full font-mono text-2xs">
        {status === "running" ? "Running…" : "Run ε validation"}
      </button>
    </section>
  );
}
