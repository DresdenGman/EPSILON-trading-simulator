"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Link from "next/link";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-surface-root text-text-primary">
      {/* Glass navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-surface-root/80 bg-blur-lg">
        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2 mr-8">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-text-primary">EPS</span>
                <span className="text-accent">ILON</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {[
                ["Dashboard", "/dashboard"],
                ["Analysis", "/dashboard/backtest"],
                ["AI Advisor", "/dashboard/ai"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 text-sm text-secondary hover:text-text-primary rounded-lg hover:bg-white/[0.05] transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="px-4 py-1.5 text-sm text-secondary hover:text-text-primary transition-colors">
                Login
              </Link>
              <Link href="/auth/register" className="px-4 py-1.5 text-sm bg-accent text-black font-semibold rounded-lg hover:bg-accent-light transition-all shadow-glow-accent-sm">
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary hover:text-text-primary rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-black text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="hidden sm:inline">{user?.username}</span>
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 glass-card py-1 z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-white/5">
                      <div className="text-text-primary text-sm font-medium">{user?.username}</div>
                      <div className="text-muted text-xs">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => { logout(); setOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-white/[0.05] transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main content with subtle grid background */}
      <main className="max-w-7xl mx-auto px-5 py-6 relative">
        <div className="fixed inset-0 opacity-[0.03] pointer-events-none epsilon-grid-background" />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
