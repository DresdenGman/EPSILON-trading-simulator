"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative min-h-screen bg-[#0A0F1A] text-white">
      {/* Animated background grid */}
      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.06}
        duration={4}
        className="fixed inset-0 z-0"
      />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-2.5 mr-8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D09C] to-[#00B386] flex items-center justify-center text-black font-bold text-sm">
                E
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">EPS</span>
                <span className="text-[#00D09C]">ILON</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/backtest"
                className="px-3 py-1.5 text-sm text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                Analysis
              </Link>
              <Link
                href="/dashboard/ai"
                className="px-3 py-1.5 text-sm text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                AI Advisor
              </Link>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-1.5 text-sm text-[#94A3B8] hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-sm bg-[#00D09C] text-black font-semibold rounded-lg hover:bg-[#00B386] transition-all duration-200 hover:shadow-glow"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#94A3B8] hover:text-white rounded-lg hover:bg-white/[0.06] transition-all duration-200"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00D09C] to-[#00B386] flex items-center justify-center text-black text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="hidden sm:inline">{user?.username}</span>
              </button>
              {open && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl shadow-lg py-1 z-50 animate-fade-in">
                    <div className="px-3 py-2.5 border-b border-white/[0.04]">
                      <div className="text-white text-sm font-medium">
                        {user?.username}
                      </div>
                      <div className="text-[#64748B] text-xs">
                        {user?.email}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-[#F0616D] hover:bg-white/[0.04] transition-colors"
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

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 animate-fade-in">
        {children}
      </main>
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
