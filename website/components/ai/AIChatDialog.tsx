"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatDialog() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
            updated[lastIdx] = { ...updated[lastIdx], content: assistantContent };
          }
          return updated;
        });
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[#0F172A] rounded-xl border border-[#1E293B] flex flex-col h-[500px]">
      <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold">AI Strategy Advisor</h3>
          <p className="text-[#64748B] text-xs">Powered by DeepSeek</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#00D09C]" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[#64748B] mt-8">
            <p className="text-2xl mb-2">🤖</p>
            <p className="text-sm">
              Ask me about trading strategies, portfolio analysis, or market insights.
            </p>
            <p className="text-xs mt-1 text-[#475569]">Powered by DeepSeek AI</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-[#00D09C]/20 text-white border border-[#00D09C]/30"
                  : "bg-[#1E293B] text-[#E2E8F0] border border-[#334155]"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1E293B] border border-[#334155] rounded-xl px-4 py-2.5 text-sm">
              <div className="flex items-center gap-2 text-[#64748B]">
                <div className="w-2 h-2 bg-[#00D09C] rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-[#00D09C] rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-[#00D09C] rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-[#1E293B]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAuthenticated
                ? "Ask about your strategy..."
                : "Login to ask about your portfolio..."
            }
            disabled={loading}
            className="flex-1 bg-[#1E293B] text-white rounded-lg px-3 py-2 text-sm border border-[#334155] focus:border-[#00D09C] outline-none transition-colors disabled:opacity-50"
          />
          {loading ? (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-[#F0616D] text-white font-semibold rounded-lg hover:bg-[#D44B56] transition-colors text-sm"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-2 bg-[#00D09C] text-black font-semibold rounded-lg hover:bg-[#00B386] transition-colors disabled:opacity-50 text-sm"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
