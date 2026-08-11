"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ResearchProvider, useResearchExperiment } from "@/components/research/ResearchContext";
import ActiveExperimentBar from "@/components/research/ActiveExperimentBar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RotateCcw } from "lucide-react";

const productNav = [
  { label: "Market", detail: "Observe", href: "/dashboard" },
  { label: "Strategy Lab", detail: "Test", href: "/dashboard/backtest" },
  { label: "Interrogate", detail: "Challenge", href: "/dashboard/ai" },
];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isGuest, logout } = useAuth();
  const { resetExperiment } = useResearchExperiment();
  const pathname = usePathname();
  const [guestSessionRevision, setGuestSessionRevision] = React.useState(0);
  const resetGuestWorkspace = () => {
    const confirmed = window.confirm("Reset this guest session? This clears the simulated portfolio, trades, orders, hypothesis, and test artifact stored in this browser tab.");
    if (!confirmed) return;
    logout();
    resetExperiment();
    setGuestSessionRevision((current) => current + 1);
  };
  const protectedContent = loading ? (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Checking session">
      <div className="surface-card px-5 py-4 text-sm text-base-content/55">Checking your session…</div>
    </div>
  ) : children;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar sticky top-0 z-50 border-b border-base-300 bg-base-100/90 px-5 backdrop-blur-xl">
        <div className="navbar-start">
          <Link href="/" className="group flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight">
              <span className="text-base-content">EPS</span>
              <span className="text-primary">ILON</span>
            </span>
            <span className="hidden border-l border-base-300 pl-3 font-mono text-2xs uppercase tracking-[0.18em] text-base-content/40 transition-colors group-hover:text-primary/75 lg:block">Decision Lab</span>
          </Link>
        </div>
        <div className="navbar-center hidden md:flex items-center gap-1">
          {productNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group rounded-md border px-3 py-2 text-left transition-colors ${active ? "border-primary/20 bg-primary/[0.06] text-primary" : "border-transparent text-base-content/60 hover:border-base-300 hover:bg-base-200/60 hover:text-base-content"}`}
              >
                <span className="block text-xs font-semibold leading-none">{item.label}</span>
                <span className="mt-1 hidden text-2xs font-mono uppercase tracking-[0.12em] text-base-content/40 lg:block">{item.detail}</span>
              </Link>
            );
          })}
        </div>
        <div className="navbar-end gap-1">
          <ThemeToggle />
          {loading ? (
            <span className="skeleton h-8 w-24 rounded-btn" aria-label="Checking session" />
          ) : isGuest ? (
            <button
              type="button"
              onClick={resetGuestWorkspace}
              aria-label="Reset guest session data"
              title="Reset the data stored in this browser tab"
              className="inline-flex h-8 items-center gap-2 rounded-md border border-base-300 px-2.5 font-mono text-2xs uppercase tracking-[0.11em] text-base-content/45 transition-colors hover:border-primary/30 hover:text-primary"
            >
              <span className="hidden sm:inline">Guest</span>
              <span className="hidden h-3 w-px bg-base-300 sm:block" />
              <RotateCcw aria-hidden="true" size={11} strokeWidth={1.8} />
              <span>Reset</span>
            </button>
          ) : (
            <span className="rounded-full border border-base-300 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.12em] text-base-content/55">Workspace</span>
          )}
        </div>
      </div>

      <div className="border-b border-base-300/70 bg-base-200/30 px-5 py-2 md:hidden">
        <nav aria-label="Product navigation" className="flex gap-2 overflow-x-auto pb-1">
          {productNav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium ${active ? "border-primary/20 bg-primary/[0.06] text-primary" : "border-transparent text-base-content/60"}`}>{item.label}</Link>;
          })}
        </nav>
      </div>

      {!loading && isAuthenticated && pathname.startsWith("/dashboard/backtest") && <ActiveExperimentBar />}

      <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-6">
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-grid-subtle" />
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
