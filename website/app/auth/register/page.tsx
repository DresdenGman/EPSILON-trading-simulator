"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authRouteWithNext, getSafeAuthRedirect } from "@/lib/auth-redirect";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeAuthRedirect(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(email, username, password);
      router.replace(redirectTo);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative flex min-h-[42vh] flex-col justify-between overflow-hidden border-b border-base-300 px-6 py-7 sm:px-10 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-70" />
          <div className="relative">
            <Link href="/" className="inline-flex items-baseline gap-3 font-bold tracking-tight">
              <span className="text-xl"><span className="text-base-content">EPS</span><span className="text-primary">ILON</span></span>
              <span className="font-mono text-2xs uppercase tracking-[0.18em] text-base-content/40">Decision Lab</span>
            </Link>
          </div>
          <div className="relative max-w-xl py-10 lg:py-0">
            <p className="product-kicker">Access / new session</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Create your access.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-base-content/60">A workspace for observing markets, testing ideas, and challenging conclusions.</p>
            <div className="mt-9 flex flex-wrap gap-x-3 gap-y-2 font-mono text-2xs uppercase tracking-[0.14em] text-base-content/45">
              <span>01 Observe</span><span className="text-primary/60">→</span><span>02 Hypothesis</span><span className="text-primary/60">→</span><span>03 Test</span><span className="text-primary/60">→</span><span>04 Challenge</span>
            </div>
          </div>
          <p className="relative font-mono text-2xs uppercase tracking-[0.14em] text-base-content/35">Simulated markets · quantitative research · no real capital</p>
        </section>

        <main className="flex items-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <p className="product-kicker">EPSILON / Create access</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Open a new Decision Lab session.</h2>
            <p className="mt-2 text-sm leading-6 text-base-content/60">Create an account to enter the simulated market workspace.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5 border-t border-base-300 pt-6">
          <div>
            <label className="metric-label block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="input input-bordered h-11 w-full bg-base-200/60 text-base-content placeholder:text-base-content/30 focus:border-primary/60 focus:outline-none"
              placeholder="trader1"
            />
          </div>
          <div>
            <label className="metric-label block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input input-bordered h-11 w-full bg-base-200/60 text-base-content placeholder:text-base-content/30 focus:border-primary/60 focus:outline-none"
              placeholder="trader@example.com"
            />
          </div>
          <div>
            <label className="metric-label block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="input input-bordered h-11 w-full bg-base-200/60 text-base-content placeholder:text-base-content/30 focus:border-primary/60 focus:outline-none"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="rounded-box border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary h-11 w-full font-semibold disabled:opacity-40"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating account
              </span>
            ) : "Create access"}
          </button>

          <p className="border-t border-base-300 pt-5 text-center text-sm text-base-content/55">
            Already have an account?{" "}
            <Link href={authRouteWithNext("/auth/login", redirectTo)} className="font-medium text-primary hover:underline">
              Resume session →
            </Link>
          </p>
        </form>
          </div>
        </main>
      </div>
    </div>
  );
}
