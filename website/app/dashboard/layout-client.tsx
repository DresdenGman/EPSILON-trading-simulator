"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Link from "next/link";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <nav className="sticky top-0 z-50 bg-[#050508]/60 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2 mr-6">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white/90">EPS</span>
                <span className="text-accent">ILON</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm text-white/40 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/backtest"
                className="px-3 py-1.5 text-sm text-white/40 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                Analysis
              </Link>
              <Link
                href="/dashboard/ai"
                className="px-3 py-1.5 text-sm text-white/40 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                AI Advisor
              </Link>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-sm bg-accent text-black font-semibold rounded-lg hover:bg-accent-light transition-all duration-300 hover:shadow-glow"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/50 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-black text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="hidden sm:inline">{user?.username}</span>
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-[#0F172A] backdrop-blur-xl border border-white/[0.06] rounded-xl shadow-lg shadow-black/20 py-1 z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-white/[0.04]">
                      <div className="text-white text-sm font-medium">{user?.username}</div>
                      <div className="text-white/30 text-xs">{user?.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#F0616D] hover:bg-white/[0.04] transition-colors duration-200"
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
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

export default function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
