"use client";

import React from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/layout/ThemeToggle";
import Link from "next/link";

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-base-100">
      {/* DaisyUI navbar */}
      <div className="navbar bg-base-100/80 backdrop-blur-lg border-b border-base-300 sticky top-0 z-50 px-5">
        <div className="navbar-start">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="text-base-content">EPS</span>
            <span className="text-primary">ILON</span>
          </Link>
        </div>
        <div className="navbar-center hidden md:flex gap-0.5">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
          <Link href="/dashboard/backtest" className="btn btn-ghost btn-sm">Analysis</Link>
          <Link href="/dashboard/ai" className="btn btn-ghost btn-sm">AI Advisor</Link>
        </div>
        <div className="navbar-end gap-1">
          <ThemeToggle />
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          ) : (
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-sm gap-2" onClick={() => setOpen(!open)}>
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-6">
                    <span className="text-xs font-bold">{user?.username?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                </div>
                <span className="hidden sm:inline text-base-content/70">{user?.username}</span>
              </button>
              {open && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                  <ul className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-48 z-50 border border-base-300 mt-1">
                    <li className="menu-title"><span>{user?.username}</span></li>
                    <li><span className="text-xs text-base-content/50">{user?.email}</span></li>
                    <div className="divider my-1" />
                    <li><button onClick={() => { logout(); setOpen(false); }} className="text-error">Logout</button></li>
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-6 relative">
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-grid-subtle" />
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
