import type { Metadata } from "next";
import PublicPageShell from "@/components/public/PublicPageShell";

export const metadata: Metadata = { title: "Terms", description: "Conditions for using the public EPSILON quantitative evidence instrument." };

const terms = [
  ["Research use", "EPSILON is an educational and research instrument. It does not execute real trades, hold capital, provide individualized advice, or promise investment outcomes."],
  ["Evidence boundary", "Controlled-synthetic results are not historical performance. Users must independently verify data, assumptions, code, suitability, and legal obligations before relying on any conclusion."],
  ["User-authored content", "Claims and rejection rules remain the responsibility of the person who writes and shares them. Do not place confidential, unlawful, or personally identifying information in portable artifacts."],
  ["Availability", "The open product is provided as available and may change. No warranty is made that the service will be uninterrupted, error-free, or suitable for a particular financial decision."],
  ["Open source", "Source code is available in the original public repository under its stated license. Third-party data and services retain their own licenses and terms."],
];

export default function TermsPage() {
  return <PublicPageShell kicker="Terms / public instrument" title="Research support, not authority." introduction="By using EPSILON, you agree to treat its output as an inspectable research artifact rather than a recommendation, guarantee, or substitute for professional judgment.">
    <div className="mx-auto max-w-5xl border-t instrument-rule">{terms.map(([title, detail], index) => <section key={title} className="grid gap-3 border-b instrument-rule py-8 sm:grid-cols-[5rem_0.6fr_1fr]"><span className="font-mono text-xs text-base-content/30">0{index + 1}</span><h2 className="text-xl font-medium">{title}</h2><p className="text-sm leading-7 text-base-content/52">{detail}</p></section>)}</div>
    <p className="mx-auto mt-10 max-w-5xl text-xs leading-6 text-base-content/40">Effective August 30, 2026. Contact: <a className="text-secondary hover:underline" href="mailto:dresdengoehner@gmail.com">dresdengoehner@gmail.com</a>.</p>
  </PublicPageShell>;
}
