"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
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
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-root flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none epsilon-grid-background" />
      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight inline-block hover:scale-105 transition-transform">
            <span className="text-text-primary">EPS</span>
            <span className="text-accent">ILON</span>
          </Link>
          <h2 className="text-text-primary text-xl font-bold mt-5">Create account</h2>
          <p className="text-secondary text-sm mt-1">Start your trading journey</p>
        </div>

        <form onSubmit={handleSubmit} className="surface-card p-6 space-y-4 shadow-surface-lg">
          <div>
            <label className="text-2xs text-muted uppercase tracking-wide block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full bg-white/[0.03] text-text-primary rounded-lg px-3 py-2.5 text-sm border border-white/5 focus:border-accent/30 focus:ring-1 focus:ring-accent/10 outline-none transition-all placeholder:text-muted/50"
              placeholder="trader1"
            />
          </div>
          <div>
            <label className="text-2xs text-muted uppercase tracking-wide block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/[0.03] text-text-primary rounded-lg px-3 py-2.5 text-sm border border-white/5 focus:border-accent/30 focus:ring-1 focus:ring-accent/10 outline-none transition-all placeholder:text-muted/50"
              placeholder="trader@example.com"
            />
          </div>
          <div>
            <label className="text-2xs text-muted uppercase tracking-wide block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/[0.03] text-text-primary rounded-lg px-3 py-2.5 text-sm border border-white/5 focus:border-accent/30 focus:ring-1 focus:ring-accent/10 outline-none transition-all placeholder:text-muted/50"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger/10 p-3 rounded-lg border border-danger/20">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent text-black font-semibold rounded-lg hover:bg-accent-light transition-all duration-250 disabled:opacity-40 shadow-glow-accent-sm hover:shadow-glow-accent active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating account
              </span>
            ) : "Create Account"}
          </button>

          <p className="text-center text-sm text-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:text-accent-light font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
