import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071323] px-6 text-[#E2E8F0]">
      <section className="w-full max-w-xl border-y border-white/10 py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#3ecfb9]">EPSILON / 404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">This research path does not exist.</h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[#94A3B8]">The requested route is not part of the current Decision Lab. Return to the overview or enter the public workspace.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/landing" className="rounded-md bg-[#3ecfb9] px-5 py-3 text-center text-sm font-semibold text-[#071323] transition-colors hover:bg-[#65dcc8]">Return to overview</Link>
          <Link href="/dashboard" className="rounded-md border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/5">Open Decision Lab</Link>
        </div>
      </section>
    </main>
  );
}
