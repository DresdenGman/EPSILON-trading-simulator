import type { Metadata } from "next";
import PublicPageShell from "@/components/public/PublicPageShell";

export const metadata: Metadata = { title: "Privacy", description: "How the public EPSILON instrument stores and shares research data." };

const sections = [
  ["Browser-local workspace", "The public instrument stores the simulated portfolio, claim, rejection rule, and completed artifact in this browser. It does not require an account. Reset removes EPSILON workspace records from this device."],
  ["Shared Evidence Plates", "A share link contains the claim, configuration, metrics, normalized equity points, provenance, and generation time. Anyone who receives that URL can inspect it. Do not place private or identifying information in a claim."],
  ["Research Critic", "Guest critique is generated deterministically in the browser and sends nothing to an AI provider. If an authenticated hosted model is enabled later, the interface will identify that mode before a question is sent."],
  ["Infrastructure records", "Hosting and repository providers may process ordinary network and access logs under their own policies. EPSILON does not sell personal information or use the public workspace for advertising profiles."],
];

export default function PrivacyPage() {
  return <PublicPageShell kicker="Privacy / public workspace" title="Local by default. Explicit when shared." introduction="This notice describes the current public product as deployed on August 30, 2026. It is written for clarity: the public research workspace stays on the device unless the user deliberately creates a portable link.">
    <div className="mx-auto max-w-5xl border-t instrument-rule">{sections.map(([title, detail], index) => <section key={title} className="grid gap-3 border-b instrument-rule py-8 sm:grid-cols-[5rem_0.6fr_1fr]"><span className="font-mono text-xs text-base-content/30">0{index + 1}</span><h2 className="text-xl font-medium">{title}</h2><p className="text-sm leading-7 text-base-content/52">{detail}</p></section>)}</div>
    <p className="mx-auto mt-10 max-w-5xl text-sm leading-7 text-base-content/48">Questions or deletion requests concerning an account-enabled future service can be sent to <a className="text-secondary hover:underline" href="mailto:dresdengoehner@gmail.com">dresdengoehner@gmail.com</a>. Browser-local records are controlled directly through the Reset action.</p>
  </PublicPageShell>;
}
