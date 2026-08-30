"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EpsilonMark from "@/components/brand/EpsilonMark";
import EvidencePlate from "@/components/evidence/EvidencePlate";
import { decodeEvidenceArtifact } from "@/lib/evidence-artifact";

export default function EvidencePageClient() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("artifact") ?? "";
  const artifact = decodeEvidenceArtifact(encoded);

  return (
    <div className="instrument-shell min-h-screen text-base-content">
      <header className="border-b border-base-300 bg-base-100/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/landing" className="flex items-center gap-3 font-semibold tracking-[0.15em]"><EpsilonMark className="h-6 w-10" /><span>EPSILON</span></Link>
          <div className="flex items-center gap-2"><Link href="/impact" className="instrument-button-secondary">Public ledger</Link><Link href="/dashboard/backtest" className="instrument-button">Create evidence →</Link></div>
        </div>
      </header>
      <main className="mx-auto max-w-[92rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        {artifact ? (
          <>
            <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><p className="instrument-label">Public research object</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">Inspect it. Challenge it. Fork it.</h1></div>
              <p className="max-w-xl text-sm leading-6 text-base-content/48">This URL contains the exact portable artifact shown below. It is independently inspectable, but it is not a server signature or a claim of real-world performance.</p>
            </div>
            <EvidencePlate artifact={artifact} />
          </>
        ) : (
          <section className="instrument-panel mx-auto max-w-3xl p-7 sm:p-10">
            <p className="instrument-label">Evidence plate / empty</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">No valid evidence artifact was found.</h1>
            <p className="mt-5 text-sm leading-7 text-base-content/52">Open Strategy Lab, define a falsifiable claim, and run the Evidence Field. EPSILON will create a portable link that keeps the claim, exact perturbations, outcomes, and provenance together.</p>
            <Link href="/dashboard/backtest" className="instrument-button mt-8">Open Strategy Lab →</Link>
          </section>
        )}
      </main>
    </div>
  );
}
