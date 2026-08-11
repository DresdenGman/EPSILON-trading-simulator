"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { ResearchProvider } from "@/components/research/ResearchContext";
import ActiveExperimentBar from "@/components/research/ActiveExperimentBar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const productNav = [
  { label: "Market", detail: "Observe", href: "/dashboard" },
  { label: "Strategy Lab", detail: "Test", href: "/dashboard/backtest" },
  { label: "Interrogate", detail: "Challenge", href: "/dashboard/ai" },
];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isGuest, logout } = useAuth();
  const pathname = usePathname();
  const protectedContent = loading ? (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Checking session">
      <div className="surface-card px-5 py-4 text-sm text-base-content/55">Checking your session…</div>
    </div>
  ) : children;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-base-100/85 backdrop-blur-xl border-b border-base-300 sticky top-0 z-50 px-5">
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
                className={`group rounded-btn px-3 py-2 text-left transition-colors ${active ? "bg-primary/10 text-primary" : "text-base-content/65 hover:bg-base-200 hover:text-base-content"}`}
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
              onClick={logout}
              title="Reset the data stored in this browser tab"
              className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 font-mono text-2xs uppercase tracking-[0.12em] text-primary/80 transition-colors hover:bg-primary/10"
            >
              Guest session · Reset
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
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${active ? "bg-primary/15 text-primary" : "text-base-content/60"}`}>{item.label}</Link>;
          })}
        </nav>
      </div>

      {!loading && isAuthenticated && (pathname === "/dashboard" || pathname.startsWith("/dashboard/backtest")) && <ActiveExperimentBar />}

      <main className="max-w-7xl mx-auto px-5 py-6 relative">
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-grid-subtle" />
        <div className="relative z-10">{protectedContent}</div>
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
