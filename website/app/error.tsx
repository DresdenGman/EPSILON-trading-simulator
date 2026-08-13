"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071323] px-6 text-[#E2E8F0]">
      <section role="alert" className="w-full max-w-xl border-y border-white/10 py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FCA5A5]">EPSILON / Workspace interrupted</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">This view could not be completed.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[#94A3B8]">No conclusion should be inferred from an interrupted workspace. Retry the current view or return to the public overview.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="rounded-md bg-[#3ecfb9] px-5 py-3 text-sm font-semibold text-[#071323] transition-colors hover:bg-[#65dcc8]">Try this view again</button>
          <Link href="/landing" className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/5">Return to overview</Link>
        </div>
      </section>
    </main>
  );
}
