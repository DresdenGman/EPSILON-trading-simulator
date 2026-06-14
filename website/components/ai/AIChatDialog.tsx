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
    <div className="surface-card flex flex-col h-[500px] shadow-surface-md">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-text-primary text-sm font-semibold">AI Strategy Advisor</h3>
          <p className="text-muted text-2xs">Powered by DeepSeek</p>
        </div>
        <div className="status-dot status-dot-online" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted mt-8">
            <p className="text-3xl mb-3">🤖</p>
            <p className="text-sm">Ask me about trading strategies, portfolio analysis, or market insights.</p>
            <p className="text-2xs mt-1 opacity-60">Powered by DeepSeek AI</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-accent/10 text-text-primary border border-accent/20"
                  : "bg-white/[0.03] text-text-primary border border-white/5"
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-soft" />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-soft" style={{ animationDelay: "0.15s" }} />
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-soft" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5">
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
            className="flex-1 bg-white/[0.03] text-text-primary rounded-lg px-3 py-2 text-sm border border-white/5 focus:border-accent/30 focus:ring-1 focus:ring-accent/10 outline-none transition-all disabled:opacity-40 placeholder:text-muted/50"
          />
          {loading ? (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-danger text-white font-semibold rounded-lg hover:bg-danger-light transition-colors text-sm"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent-light transition-all disabled:opacity-40 text-sm shadow-glow-accent-sm active:scale-[0.98]"
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
