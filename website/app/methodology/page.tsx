import type { Metadata } from "next";
import PublicPageShell from "@/components/public/PublicPageShell";

export const metadata: Metadata = { title: "Methodology", description: "How EPSILON turns a quantitative claim into an inspectable perturbation field." };

const method = [
  ["01 / Claim", "Pre-commit the interpretation", "Write a falsifiable statement before computing the result. The statement remains user-authored and is never upgraded into an observation."],
  ["02 / Baseline", "Fix the reference configuration", "Record strategy, universe, window, capital, fee, minimum fee, and slippage. The baseline is one controlled computation—not a robustness claim."],
  ["03 / Perturb", "Apply atomic changes", "Change exactly one documented input per run. EPSILON currently tests fee, slippage, start window, and universe or minimum fee."],
  ["04 / Challenge", "Keep failure attached", "Direction reversals, failed runs, provenance, and the pre-committed rejection rule remain visible in the portable Evidence Plate."],
];

export default function MethodologyPage() {
  return <PublicPageShell kicker="Methodology / ε" title="Make sensitivity visible." introduction="EPSILON operationalizes a mathematical neighborhood: if x is the baseline configuration and ε is one nearby input change, the relevant object is not only f(x), but the observed field f(x + ε).">
    <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr]">
      <aside className="instrument-panel h-fit p-6"><p className="instrument-label">Current evidence boundary</p><p className="mt-4 text-sm leading-7 text-base-content/58">The public engine uses deterministic controlled-synthetic daily paths. It does not claim historical validation, live prices, causal identification, or future performance.</p><div className="mt-6 border-t instrument-rule pt-5 font-mono text-xs leading-6 text-base-content/50"><p>y₀ = f(x)</p><p>yᵢ = f(x + εᵢ)</p><p>Δᵢ = yᵢ − y₀</p><p className="mt-3 text-secondary">one εᵢ / one changed input</p></div></aside>
      <div className="border-t instrument-rule">{method.map(([label, title, detail]) => <section key={label} className="grid gap-3 border-b instrument-rule py-7 sm:grid-cols-[8rem_0.7fr_1fr]"><p className="instrument-label pt-1">{label}</p><h2 className="text-xl font-medium">{title}</h2><p className="text-sm leading-7 text-base-content/50">{detail}</p></section>)}</div>
    </div>
    <section className="mt-16 grid gap-px border border-base-300 bg-base-300 md:grid-cols-3"><div className="bg-base-100 p-6"><p className="instrument-label">Direction</p><p className="mt-3 text-sm leading-6 text-base-content/52">“Preserved” reports only whether completed returns kept the baseline sign. It does not prove the user&apos;s full rejection rule.</p></div><div className="bg-base-100 p-6"><p className="instrument-label">Normalization</p><p className="mt-3 text-sm leading-6 text-base-content/52">Every equity trace is normalized to its own first point so shape changes remain comparable across windows.</p></div><div className="bg-base-100 p-6"><p className="instrument-label">Provenance</p><p className="mt-3 text-sm leading-6 text-base-content/52">Data mode, source, sampling interval, execution model, assumptions, and generation time travel with the artifact.</p></div></section>
  </PublicPageShell>;
}
