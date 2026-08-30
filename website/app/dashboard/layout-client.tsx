"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ResearchProvider, useResearchExperiment } from "@/components/research/ResearchContext";
import ActiveExperimentBar from "@/components/research/ActiveExperimentBar";
import EpsilonMark from "@/components/brand/EpsilonMark";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";

const productNav = [
  { label: "Observe", detail: "Market", href: "/dashboard" },
  { label: "Perturb", detail: "Evidence field", href: "/dashboard/backtest" },
  { label: "Challenge", detail: "Research critic", href: "/dashboard/ai" },
];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isGuest, logout } = useAuth();
  const { experiment, resetExperiment } = useResearchExperiment();
  const pathname = usePathname();
  const [guestSessionRevision, setGuestSessionRevision] = React.useState(0);
  const resetGuestWorkspace = () => {
    const confirmed = window.confirm("Reset this local workspace? This clears the simulated portfolio, trades, orders, hypothesis, and test artifact stored on this device.");
    if (!confirmed) return;
    logout();
    resetExperiment();
    setGuestSessionRevision((current) => current + 1);
  };
  const protectedContent = loading ? (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Restoring workspace">
      <div className="surface-card px-5 py-4 text-sm text-base-content/55">Restoring workspace…</div>
    </div>
  ) : children;

  return (
    <div className="instrument-shell min-h-screen bg-base-100">
      <div className="navbar sticky top-0 z-50 min-h-16 border-b border-base-300 bg-base-100/88 px-4 backdrop-blur-xl sm:px-6">
        <div className="navbar-start">
          <Link href="/landing" className="group flex items-center gap-3">
            <EpsilonMark className="h-6 w-10 text-base-content" />
            <span className="text-sm font-semibold tracking-[0.15em] text-base-content">EPSILON</span>
            <span className="hidden border-l border-base-300 pl-3 font-mono text-2xs uppercase tracking-[0.18em] text-base-content/35 lg:block">Evidence instrument</span>
          </Link>
        </div>
        <div className="navbar-center hidden md:flex items-center gap-1">
          {productNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            const href = item.href === "/dashboard/backtest" && experiment.symbol
              ? `/dashboard/backtest?symbols=${encodeURIComponent(experiment.symbol)}`
              : item.href;
            return (
              <Link
                key={item.href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group border-b px-3 py-2 text-left transition-colors ${active ? "border-base-content text-base-content" : "border-transparent text-base-content/48 hover:border-base-content/30 hover:text-base-content"}`}
              >
                <span className="block text-xs font-semibold leading-none">{item.label}</span>
                <span className="mt-1 hidden text-2xs font-mono uppercase tracking-[0.12em] text-base-content/40 lg:block">{item.detail}</span>
              </Link>
            );
          })}
        </div>
        <div className="navbar-end gap-2">
          <Link href="/impact" className="hidden px-2 py-2 font-mono text-2xs uppercase tracking-[0.13em] text-base-content/38 transition-colors hover:text-base-content lg:block">Public ledger</Link>
          {loading ? (
            <span className="skeleton h-8 w-24 rounded-btn" aria-label="Checking session" />
          ) : isGuest ? (
            <button
              type="button"
              onClick={resetGuestWorkspace}
              aria-label="Reset local workspace data"
              title="Reset the workspace data stored on this device"
              className="inline-flex h-8 items-center gap-2 rounded border border-base-300 px-2.5 font-mono text-2xs uppercase tracking-[0.11em] text-base-content/45 transition-colors hover:border-base-content/45 hover:text-base-content"
            >
              <span className="hidden sm:inline">Local</span>
              <span className="hidden h-3 w-px bg-base-300 sm:block" />
              <RotateCcw aria-hidden="true" size={11} strokeWidth={1.8} />
              <span>Reset</span>
            </button>
          ) : (
            <span className="rounded-full border border-base-300 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.12em] text-base-content/55">Workspace</span>
          )}
        </div>
      </div>

      <div className="border-b border-base-300/70 bg-base-200/30 px-4 py-2 md:hidden">
        <nav aria-label="Product navigation" className="flex gap-2 overflow-x-auto pb-1">
          {productNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            const href = item.href === "/dashboard/backtest" && experiment.symbol
              ? `/dashboard/backtest?symbols=${encodeURIComponent(experiment.symbol)}`
              : item.href;
            return <Link key={item.href} href={href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap border-b px-3 py-1.5 text-xs font-medium ${active ? "border-base-content text-base-content" : "border-transparent text-base-content/50"}`}>{item.label}</Link>;
          })}
        </nav>
      </div>

      {!loading && isAuthenticated && pathname.startsWith("/dashboard/backtest") && <ActiveExperimentBar />}

      <main className="relative mx-auto max-w-[92rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div key={guestSessionRevision} className="relative z-10">{protectedContent}</div>
      </main>
    </div>
  );
}

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ResearchProvider>
        <DashboardInner>{children}</DashboardInner>
      </ResearchProvider>
    </AuthProvider>
  );
}
