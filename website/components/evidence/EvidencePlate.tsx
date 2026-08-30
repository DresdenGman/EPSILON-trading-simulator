"use client";

import React from "react";
import Link from "next/link";
import { Check, Copy, Download, Share2 } from "lucide-react";
import PerturbationField from "@/components/evidence/PerturbationField";
import { describeStability, encodeEvidenceArtifact, type EvidenceArtifact } from "@/lib/evidence-artifact";

function xmlEscape(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function createPlateSvg(artifact: EvidenceArtifact) {
  const stability = describeStability(artifact);
  const stabilitySummary = stability.completed > 0
    ? `DIRECTION PRESERVED ${stability.preserved}/${stability.completed}`
    : "ATOMIC CHALLENGES NOT RUN";
  const claim = xmlEscape((artifact.claim || "Untitled market claim").slice(0, 150));
  const rejection = xmlEscape((artifact.falsifiedIf || "No rejection rule recorded").slice(0, 150));
  const symbols = xmlEscape(artifact.configuration.stockCodes.join(" · "));
  const observations = artifact.observations.slice(0, 4).map((observation, index) => {
    const y = 610 + index * 40;
    const outcome = observation.result ? `${observation.result.totalReturn >= 0 ? "+" : ""}${observation.result.totalReturn.toFixed(2)}%` : "RUN FAILED";
    return `<text x="72" y="${y}" fill="#92949d" font-family="monospace" font-size="15">${xmlEscape(observation.label.toUpperCase())}</text><text x="1128" y="${y}" text-anchor="end" fill="#f0efea" font-family="monospace" font-size="15">${xmlEscape(outcome)}</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#08090c"/><path d="M72 76h1056" stroke="#292c34"/><text x="72" y="58" fill="#f0efea" font-family="Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="4">EPSILON</text><text x="1128" y="58" text-anchor="end" fill="#92949d" font-family="monospace" font-size="13" letter-spacing="2">EVIDENCE PLATE / V1</text><text x="72" y="135" fill="#92949d" font-family="monospace" font-size="13" letter-spacing="2">CLAIM</text><foreignObject x="72" y="160" width="1056" height="130"><div xmlns="http://www.w3.org/1999/xhtml" style="font:600 38px/1.18 Arial,sans-serif;color:#f0efea">${claim}</div></foreignObject><text x="72" y="330" fill="#92949d" font-family="monospace" font-size="13" letter-spacing="2">FALSIFIED IF</text><foreignObject x="72" y="352" width="1056" height="76"><div xmlns="http://www.w3.org/1999/xhtml" style="font:18px/1.45 Arial,sans-serif;color:#c3c2bd">${rejection}</div></foreignObject><path d="M72 465h1056" stroke="#292c34"/><text x="72" y="510" fill="#f0efea" font-family="monospace" font-size="17">BASELINE ${artifact.baseline.totalReturn >= 0 ? "+" : ""}${artifact.baseline.totalReturn.toFixed(2)}%</text><text x="1128" y="510" text-anchor="end" fill="#8be9fd" font-family="monospace" font-size="17">${stabilitySummary}</text><text x="72" y="555" fill="#92949d" font-family="monospace" font-size="13">${symbols} · ${artifact.configuration.startDate} → ${artifact.configuration.endDate}</text>${observations}<path d="M72 754h1056" stroke="#292c34"/><text x="72" y="780" fill="#92949d" font-family="monospace" font-size="12">CONTROLLED SYNTHETIC RESEARCH · NOT INVESTMENT ADVICE · ${xmlEscape(artifact.generatedAt.slice(0, 10))}</text></svg>`;
}

export default function EvidencePlate({ artifact, actions = true, compact = false }: { artifact: EvidenceArtifact; actions?: boolean; compact?: boolean }) {
  const [copied, setCopied] = React.useState(false);
  const stability = describeStability(artifact);
  const [encoded, setEncoded] = React.useState("");
  React.useEffect(() => { setEncoded(encodeEvidenceArtifact(artifact)); }, [artifact]);
  const evidencePath = `/evidence?artifact=${encoded}`;
  const forkPath = `/dashboard/backtest?artifact=${encoded}`;

  const copyShareLink = async () => {
    const url = `${window.location.origin}${evidencePath}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const share = async () => {
    const url = `${window.location.origin}${evidencePath}`;
    if (navigator.share) {
      await navigator.share({ title: "EPSILON Evidence Plate", text: artifact.claim || "Challenge this quantitative claim.", url });
      return;
    }
    await copyShareLink();
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([createPlateSvg(artifact)], { type: "image/svg+xml" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `epsilon-evidence-${artifact.configuration.stockCodes.join("-").toLowerCase()}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className={`instrument-panel min-w-0 ${compact ? "p-4" : "p-5 sm:p-7"}`}>
      <header className="flex flex-wrap items-start justify-between gap-5 border-b instrument-rule pb-5">
        <div className="max-w-3xl">
          <p className="instrument-label">Evidence plate / {artifact.format}</p>
          <h2 className={`${compact ? "mt-3 text-xl" : "mt-4 text-2xl sm:text-3xl"} text-balance font-semibold tracking-[-0.035em] text-base-content`}>
            {artifact.claim || "Untitled market claim"}
          </h2>
        </div>
        <div className="border-l instrument-rule pl-4 text-right">
          <p className="instrument-label">{stability.completed > 0 ? "Direction preserved" : "Atomic challenges"}</p>
          <p className="mt-2 font-mono text-xl text-base-content">{stability.completed > 0 ? `${stability.preserved}/${stability.completed}` : "Not run"}</p>
        </div>
      </header>

      <div className="grid gap-4 border-b instrument-rule py-5 sm:grid-cols-[0.75fr_1.25fr]">
        <div><p className="instrument-label">Falsified if</p></div>
        <p className="text-sm leading-6 text-base-content/68">{artifact.falsifiedIf || "No rejection rule was recorded. Interpret the result cautiously."}</p>
      </div>

      <div className="py-6"><PerturbationField artifact={artifact} compact={compact} /></div>

      <div className="overflow-x-auto border-t instrument-rule pt-5">
        <table className="w-full min-w-[680px] text-left text-xs">
          <caption className="sr-only">Exact baseline and perturbation outcomes</caption>
          <thead className="font-mono text-[10px] uppercase tracking-[0.12em] text-base-content/38">
            <tr><th className="pb-3 font-normal">Run</th><th className="pb-3 font-normal">Changed input</th><th className="pb-3 text-right font-normal">Return</th><th className="pb-3 text-right font-normal">Sharpe</th><th className="pb-3 text-right font-normal">Drawdown</th></tr>
          </thead>
          <tbody>
            <tr className="border-t instrument-rule text-base-content"><td className="py-3 font-medium">Baseline</td><td className="py-3 font-mono text-base-content/48">None</td><td className="py-3 text-right font-mono">{artifact.baseline.totalReturn.toFixed(2)}%</td><td className="py-3 text-right font-mono">{artifact.baseline.sharpe.toFixed(3)}</td><td className="py-3 text-right font-mono">{artifact.baseline.maxDrawdown.toFixed(2)}%</td></tr>
            {artifact.observations.map((observation) => (
              <tr key={observation.id} className="border-t instrument-rule text-base-content/74"><td className="py-3">{observation.label}</td><td className="py-3 font-mono text-base-content/48">{observation.baselineValue} → {observation.perturbedValue}</td><td className="py-3 text-right font-mono">{observation.result ? `${observation.result.totalReturn.toFixed(2)}%` : "Failed"}</td><td className="py-3 text-right font-mono">{observation.result ? observation.result.sharpe.toFixed(3) : "—"}</td><td className="py-3 text-right font-mono">{observation.result ? `${observation.result.maxDrawdown.toFixed(2)}%` : "—"}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-5 flex flex-col gap-4 border-t instrument-rule pt-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl text-xs leading-5 text-base-content/42">
          <p>{artifact.provenance.dataSource} · {artifact.provenance.samplingInterval}</p>
          <p className="mt-1">Portable, self-contained research artifact. User-authored claims are not server-verified. Controlled simulation is not historical or investment evidence.</p>
        </div>
        {actions && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyShareLink} className="instrument-button-secondary gap-2">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy link"}</button>
            <button type="button" onClick={share} className="instrument-button-secondary gap-2"><Share2 size={14} />Share</button>
            <button type="button" onClick={download} className="instrument-button-secondary gap-2"><Download size={14} />SVG</button>
            <Link href={forkPath} className="instrument-button">Challenge / Fork →</Link>
          </div>
        )}
      </footer>
    </article>
  );
}
