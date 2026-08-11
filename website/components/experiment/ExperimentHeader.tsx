"use client";

interface ExperimentHeaderProps {
  experimentId?: string;
  strategy?: string;
  universe?: string;
  regime?: string;
  initialCash?: number;
  feeRate?: number;
  slippagePerShare?: number;
  horizon?: string;
}

export default function ExperimentHeader({
  experimentId = "EXP-001",
  strategy = "Short-horizon momentum",
  universe = "US large-cap mock universe",
  regime = "Baseline market",
  initialCash = 100000,
  feeRate = 0.0001,
  slippagePerShare = 0.01,
  horizon = "90D",
}: ExperimentHeaderProps) {
  return (
    <section className="surface-card rounded-box border-primary/20 bg-base-200/70 px-4 py-3" aria-label="Current experiment">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.18em] text-primary/70">
            <span>ε</span>
            <span>{experimentId}</span>
            <span className="text-base-content/30">/</span>
            <span>Flagship experiment</span>
          </div>
          <h2 className="text-sm font-semibold text-base-content md:text-base">
            Does momentum survive small changes in its assumptions?
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-relaxed text-base-content/50">
            Test a market hypothesis, then measure whether the conclusion remains stable under ε-level perturbations.
          </p>
        </div>
        <span className="badge badge-outline border-primary/40 font-mono text-2xs text-primary">BASELINE</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-base-300/70 pt-2 font-mono text-2xs uppercase tracking-wide text-base-content/45">
        <span><b className="text-base-content/70">Strategy</b> {strategy}</span>
        <span><b className="text-base-content/70">Universe</b> {universe}</span>
        <span><b className="text-base-content/70">Regime</b> {regime}</span>
        <span><b className="text-base-content/70">Capital</b> ${initialCash.toLocaleString()}</span>
        <span><b className="text-base-content/70">Fee</b> {(feeRate * 10000).toFixed(1)} bps</span>
        <span><b className="text-base-content/70">Slip</b> ${slippagePerShare.toFixed(3)}/share</span>
        <span><b className="text-base-content/70">Horizon</b> {horizon}</span>
      </div>
    </section>
  );
}
