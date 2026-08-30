import type { EvidenceArtifact, EvidenceResultSnapshot } from "@/lib/evidence-artifact";

const TRACE_COLORS = ["#8BE9FD", "#D6A2FF", "#FF8D7A", "#B7F171", "#F3C969", "#7FA7FF"];

function normalizeCurve(result: EvidenceResultSnapshot) {
  const first = result.equityCurve[0]?.equity;
  if (!first || !Number.isFinite(first)) return [];
  return result.equityCurve.map((point) => ({
    date: point.date,
    value: ((point.equity / first) - 1) * 100,
  }));
}

function makePath(values: Array<{ value: number }>, min: number, max: number) {
  if (!values.length) return "";
  const width = 880;
  const height = 250;
  const range = Math.max(max - min, 1);
  return values.map((point, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width;
    const y = height - ((point.value - min) / range) * height;
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ");
}

export default function PerturbationField({ artifact, compact = false }: { artifact: EvidenceArtifact; compact?: boolean }) {
  const traces = [
    { id: "baseline", label: "Baseline", result: artifact.baseline, color: "#F0EFEA" },
    ...artifact.observations
      .filter((observation) => observation.status === "succeeded" && observation.result)
      .map((observation, index) => ({
        id: observation.id,
        label: observation.label,
        result: observation.result!,
        color: TRACE_COLORS[index % TRACE_COLORS.length],
      })),
  ].map((trace) => ({ ...trace, curve: normalizeCurve(trace.result) }));

  const values = traces.flatMap((trace) => trace.curve.map((point) => point.value));
  const rawMin = values.length ? Math.min(...values, 0) : -1;
  const rawMax = values.length ? Math.max(...values, 0) : 1;
  const padding = Math.max((rawMax - rawMin) * 0.12, 0.75);
  const min = rawMin - padding;
  const max = rawMax + padding;
  const zeroY = 250 - ((0 - min) / Math.max(max - min, 1)) * 250;

  return (
    <figure className="min-w-0" aria-labelledby="perturbation-field-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="instrument-label">Perturbation field / normalized equity</p>
          <h3 id="perturbation-field-title" className="mt-2 text-lg font-medium tracking-[-0.02em] text-base-content">
            Nearby assumptions, visible consequences.
          </h3>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-base-content/35">ε = one changed input per trace</p>
      </div>
      <div className={`mt-5 overflow-hidden border border-base-300 bg-[#0b0c10] ${compact ? "p-3" : "p-4 sm:p-5"}`}>
        <svg viewBox="0 0 880 250" className={`block w-full ${compact ? "h-[210px]" : "h-[260px] sm:h-[330px]"}`} role="img" aria-labelledby="perturbation-field-svg-title perturbation-field-svg-desc" preserveAspectRatio="none">
          <title id="perturbation-field-svg-title">Normalized equity traces for the baseline and each atomic perturbation</title>
          <desc id="perturbation-field-svg-desc">A white baseline trace is compared with coloured traces. Each coloured trace changes exactly one documented input.</desc>
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
            <line key={fraction} x1="0" x2="880" y1={fraction * 250} y2={fraction * 250} stroke="rgba(240,239,234,0.075)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" x2="880" y1={zeroY} y2={zeroY} stroke="rgba(240,239,234,0.24)" strokeWidth="1" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
          {traces.map((trace, index) => (
            <path
              key={trace.id}
              d={makePath(trace.curve, min, max)}
              fill="none"
              stroke={trace.color}
              strokeWidth={index === 0 ? 2.3 : 1.6}
              opacity={index === 0 ? 1 : 0.88}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-base-300/70 pt-3">
          {traces.map((trace) => (
            <span key={trace.id} className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.11em] text-base-content/55">
              <span className="h-px w-5" style={{ backgroundColor: trace.color }} aria-hidden="true" />
              {trace.label} · {trace.result.totalReturn >= 0 ? "+" : ""}{trace.result.totalReturn.toFixed(2)}%
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 text-xs leading-5 text-base-content/42">
        Every trace is normalized to its own starting equity. Colour denotes a documented assumption change—not confidence, quality, or predicted performance.
      </figcaption>
    </figure>
  );
}
