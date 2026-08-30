import type { Metadata } from "next";
import { Suspense } from "react";
import EvidencePageClient from "./EvidencePageClient";

export const metadata: Metadata = {
  title: "Evidence Plate",
  description: "Inspect and challenge a portable EPSILON perturbation experiment.",
  robots: { index: false, follow: true },
};

export default function EvidencePage() {
  return <Suspense fallback={<div className="instrument-shell min-h-screen p-8 text-base-content/50">Reading evidence artifact…</div>}><EvidencePageClient /></Suspense>;
}
