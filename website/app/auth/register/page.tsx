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
    <div className="min-h-screen bg-[#050508] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-epsilon-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight inline-block">
            <span className="text-white">EPS</span>
            <span className="text-accent">ILON</span>
          </Link>
          <h2 className="text-white text-xl font-semibold mt-4">Create account</h2>
          <p className="text-white/35 text-sm mt-1">Start your trading journey</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface backdrop-blur-xl border border-white/5 rounded-2xl p-6 space-y-4 shadow-card"
        >
          <div>
            <label className="text-xs text-white/40 block mb-1.5 tracking-wide">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="w-full bg-white/[0.03] text-white rounded-lg px-3.5 py-2.5 text-sm border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-200 placeholder:text-white/15"
              placeholder="trader1"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5 tracking-wide">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/[0.03] text-white rounded-lg px-3.5 py-2.5 text-sm border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-200 placeholder:text-white/15"
              placeholder="trader@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 block mb-1.5 tracking-wide">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white/[0.03] text-white rounded-lg px-3.5 py-2.5 text-sm border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-all duration-200 placeholder:text-white/15"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <div className="text-sm text-[#F0616D] bg-[#F0616D]/5 border border-[#F0616D]/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-accent to-accent-dark text-black font-semibold rounded-lg transition-all duration-300 hover:shadow-glow hover:from-accent-light hover:to-accent disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-white/25">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-accent hover:text-accent-light transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
