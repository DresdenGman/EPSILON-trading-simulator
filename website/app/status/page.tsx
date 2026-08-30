import type { Metadata } from "next";
import PublicPageShell from "@/components/public/PublicPageShell";
import { historicalProviderStatus } from "@/lib/server/market-data";

export const metadata: Metadata = { title: "Status", description: "Current operational modes and capability status for EPSILON." };

export default function StatusPage() {
  const hostedCritic = Boolean(process.env.DEEPSEEK_API_KEY?.trim());
  const historicalProvider = historicalProviderStatus();
  const rows = [
    ["Public instrument", "Operational", "No-login browser workspace"],
    ["Evidence engine", "Operational", "Controlled-synthetic baseline + four perturbations"],
    ["Portable artifacts", "Operational", "Compressed, self-contained, legacy-link compatible"],
    ["Local critic", "Operational", "Deterministic evidence-aware examination"],
    ["Hosted model critic", hostedCritic ? "Configured" : "Optional", hostedCritic ? "Server-side provider available for authenticated sessions" : "Local critic remains available without a provider key"],
    ["Historical market data", historicalProvider.provider && historicalProvider.publicEnabled ? "Provider configured" : historicalProvider.provider ? "Configured / closed" : "Not enabled", historicalProvider.provider ? `${historicalProvider.provider} credential detected; public route ${historicalProvider.publicEnabled ? "enabled" : "remains closed"}` : "Public results remain controlled synthetic"],
  ];
  return <PublicPageShell kicker="System status / capability truth" title="Operational modes, without ambiguity." introduction="This page distinguishes what works now from what is merely configurable. A missing external provider never changes a synthetic result into a historical one.">
    <div className="mx-auto max-w-6xl border-t instrument-rule">{rows.map(([name, status, detail]) => <div key={name} className="grid gap-3 border-b instrument-rule py-6 sm:grid-cols-[0.7fr_0.4fr_1fr] sm:items-center"><h2 className="font-medium">{name}</h2><span className={`w-fit rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${status === "Operational" || status === "Configured" || status === "Provider configured" ? "border-success/35 text-success" : "border-base-300 text-base-content/42"}`}>{status}</span><p className="text-sm leading-6 text-base-content/48">{detail}</p></div>)}</div>
    <div className="mx-auto mt-10 max-w-6xl instrument-panel p-6"><p className="instrument-label">Machine-readable health</p><p className="mt-3 text-sm text-base-content/50">A non-sensitive JSON health record is available at <a href="/api/health" className="font-mono text-secondary hover:underline">/api/health</a>.</p></div>
  </PublicPageShell>;
}
