"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import AIChatDialog from "@/components/ai/AIChatDialog";
import Link from "next/link";

export default function AIPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Strategy Advisor</h1>
          <p className="text-[#64748B] text-sm mt-1">
            Ask your personal AI trading coach for strategy analysis and insights
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm text-[#94A3B8] hover:text-white border border-[#334155] rounded-lg hover:bg-[#1E293B] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      <AIChatDialog />

      <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] p-6">
        <h3 className="text-white font-semibold mb-2">About AI Advisor</h3>
        <ul className="text-[#94A3B8] text-sm space-y-1">
          <li>• Runs locally via Ollama — your data never leaves your machine</li>
          <li>• Supports strategy diagnosis, performance analysis, and trading education</li>
          <li>• Requires Ollama running on your server with a model installed (qwen, llama, mistral, etc.)</li>
        </ul>
      </div>
    </div>
  );
}
