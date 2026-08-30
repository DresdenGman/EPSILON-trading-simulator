"use client";

import type { ExperimentDiagnosis } from "@/lib/experiment";
import type { SensitivityRun } from "./SensitivitySummary";

interface ExperimentConclusionProps {
  diagnosis: ExperimentDiagnosis;
  baseline: SensitivityRun;
  perturbed: SensitivityRun;
}

export default function ExperimentConclusion({ diagnosis, baseline, perturbed }: ExperimentConclusionProps) {
  if (!diagnosis.valid) {
    return (
      <section className="surface-card rounded-box border-warning/30 px-4 py-3" aria-label="Experiment conclusion">
        <div className="font-mono text-2xs uppercase tracking-[0.16em] text-warning/80">ε / diagnosis</div>
        <p className="mt-1 text-sm font-semibold text-base-content">INCONCLUSIVE</p>
        <p className="mt-1 text-xs text-base-content/55">Insufficient executed trades to evaluate this perturbation. No robustness conclusion was generated.</p>
      </section>
    );
  }

  const preserved = diagnosis.outcome === "preserved";
  const delta = diagnosis.deltaReturnPp;
  const directionText = diagnosis.baselineSign === "positive"
    ? "The positive-return conclusion"
    : "The non-positive conclusion";

  return (
    <section className={`surface-card rounded-box px-4 py-3 ${preserved ? "border-primary/25" : "border-error/40"}`} aria-label="Experiment conclusion">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-2xs uppercase tracking-[0.16em] text-primary/70">ε / diagnosis</div>
        <span className={`badge badge-outline font-mono text-2xs ${preserved ? "border-success/50 text-success" : "border-error/50 text-error"}`}>
          {preserved ? "CONCLUSION PRESERVED" : "CONCLUSION REVERSED"}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-base-content">
        {preserved
          ? `${directionText} survived a +$${(diagnosis.perturbedParameter - diagnosis.baselineParameter).toFixed(2)}/share increase in execution slippage.`
          : "The conclusion failed under the ε perturbation."}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-base-300/70 pt-2 font-mono text-2xs md:grid-cols-4">
        <span><b className="block text-base-content/35">Baseline</b>{baseline.totalReturn.toFixed(2)}%</span>
        <span><b className="block text-base-content/35">Perturbed</b>{perturbed.totalReturn.toFixed(2)}%</span>
        <span><b className="block text-base-content/35">Δ Return</b>{delta >= 0 ? "+" : ""}{delta.toFixed(2)} pp</span>
        <span><b className="block text-base-content/35">Effect</b>{diagnosis.effect.toUpperCase()}</span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-base-content/55">
        {diagnosis.effect === "weakened" ? "Higher execution friction weakened the observed result, but did not reverse its direction." : "The perturbation did not weaken the observed result."}
      </p>

      <details className="mt-2 text-2xs text-base-content/45">
        <summary className="cursor-pointer hover:text-base-content/70">Method & limits</summary>
        <div className="mt-2 space-y-1 leading-relaxed">
          <p>Changed variable: slippage/share ${diagnosis.baselineParameter.toFixed(3)} → ${diagnosis.perturbedParameter.toFixed(3)}</p>
          <p>Held constant: strategy, universe, capital, date window and fee assumptions.</p>
          <p>Decision rule: compare the sign of total return.</p>
          <p>Scope: one parameter, one ε perturbation, one strategy configuration. This does not establish general strategy robustness.</p>
        </div>
      </details>
    </section>
  );
}
