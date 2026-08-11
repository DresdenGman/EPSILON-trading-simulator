"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useResearchExperiment } from "@/components/research/ResearchContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  kind?: "response" | "error";
}

const promptStarters = [
  {
    label: "Challenge the assumption",
    detail: "Find the premise carrying the conclusion.",
    prompt: "Which assumption is carrying this conclusion, and how would you test whether it is false?",
  },
  {
    label: "Define falsifying evidence",
    detail: "Name the result that should reverse the decision.",
    prompt: "What specific evidence would falsify this hypothesis or force me to revise it?",
  },
  {
    label: "Design the next test",
    detail: "Change one variable and preserve the decision rule.",
    prompt: "Propose the next atomic test: change one assumption, preserve the decision rule, and explain what I should compare.",
  },
];

export default function AIChatDialog() {
  const { isAuthenticated, isGuest } = useAuth();
  const { experiment, testState } = useResearchExperiment();
  const activeTest = testState === "current" ? experiment.test : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const reduceMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bottomRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
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
      if (isGuest) {
        await new Promise((resolve) => window.setTimeout(resolve, 280));
        const evidenceState = activeTest
          ? `The current guest artifact reports ${activeTest.totalReturn.toFixed(2)}% total return across ${activeTest.tradeCount} simulated trades.`
          : "There is no current test artifact, so the claim cannot yet be evaluated against a result.";
        const response = [
          "Guest critic · local heuristic",
          "",
          `Question under review: ${question}`,
          "",
          evidenceState,
          "",
          "Challenge the conclusion by separating the claim, the assumptions built into the synthetic path, and the evidence that would reverse your decision. A stable next test changes one assumption only—such as execution friction, sample window, or universe—while preserving the falsification rule.",
          "",
          "This response is generated locally for the public guest experience. It is not live AI analysis, web research, market evidence, or financial advice.",
        ].join("\n");
        setMessages((prev) => [...prev, { role: "assistant", content: response, kind: "response" }]);
        return;
      }
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          searchEnabled,
          experiment: {
            subject: experiment.symbol,
            hypothesis: experiment.hypothesis || null,
            test: activeTest,
          },
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
      let hasAssistantMessage = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        assistantContent += chunk;
        if (!hasAssistantMessage) {
          hasAssistantMessage = true;
          setMessages((prev) => [...prev, { role: "assistant", content: assistantContent, kind: "response" }]);
        } else {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], content: assistantContent };
            }
            return updated;
          });
        }
      }

      if (!assistantContent.trim()) {
        throw new Error("The research critic returned no analysis. Check the server configuration and try again.");
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: msg, kind: "error" },
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
    <div className="grid border border-[#1E293B] bg-[#0F172A] lg:grid-cols-[minmax(0,0.3fr)_minmax(0,1fr)]">
      <aside className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r lg:p-6" aria-label="Research frame">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">01 / Frame</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Set the question.</h2>
        <p className="mt-2 text-sm leading-6 text-[#94A3B8]">This workspace interrogates the active experiment. It only receives the research context and {isGuest ? "session-local guest artifact" : "completed service-response artifact"} shown below.</p>
        <div className="mt-5 border-y border-white/10 py-4 text-xs leading-5 text-[#94A3B8]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#E2E8F0]">Active experiment</p>
          <p className="mt-2">Subject: <span className="text-white">{experiment.symbol ?? "Not selected"}</span></p>
          <p className="mt-1">Hypothesis: <span className="text-white">{experiment.hypothesis || "Not recorded"}</span></p>
          <p className="mt-1">Test artifact: <span className={testState === "stale" ? "text-[#FDE68A]" : "text-white"}>{activeTest ? `${activeTest.strategy.replaceAll("_", " ")} · ${activeTest.tradeCount} trades` : testState === "stale" ? "Previous result · Needs retest" : "No completed backtest"}</span></p>
          {activeTest && <p className="mt-1">Data provenance: <span className="text-[#FDE68A]">{activeTest.provenance.dataSource ?? "Source not provided"}</span></p>}
        </div>
        <Link
          href={experiment.symbol ? `/dashboard/backtest?symbols=${encodeURIComponent(experiment.symbol)}` : "/dashboard/backtest"}
          className="mt-4 inline-flex w-full items-center justify-center border border-[#00D09C]/40 px-3 py-2 text-xs font-semibold text-[#00D09C] transition-colors hover:bg-[#00D09C]/10"
        >
          {testState === "stale" ? "Refine & retest →" : "Open Strategy Lab →"}
        </Link>
        <div className="mt-6 border-y border-white/10 py-4">
          {isGuest ? (
            <div aria-label="Guest critic capability">
              <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#E2E8F0]">Local heuristic · no live AI/web</span>
              <span className="mt-1 block text-xs leading-5 text-[#64748B]">The public sandbox generates a fixed local critique and performs no web retrieval.</span>
            </div>
          ) : (
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={searchEnabled}
                onChange={(event) => setSearchEnabled(event.target.checked)}
                disabled={loading}
                className="mt-0.5 h-4 w-4 accent-[#00D09C] disabled:opacity-50"
              />
              <span><span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#E2E8F0]">Web evidence {searchEnabled ? "on" : "off"}</span><span className="mt-1 block text-xs leading-5 text-[#64748B]">When enabled, the service may retrieve web results for your latest question.</span></span>
            </label>
          )}
        </div>
        <div className="mt-6 space-y-3 text-sm leading-6 text-[#94A3B8]">
          <p>What assumption is carrying this conclusion?</p>
          <p>What evidence would falsify it?</p>
          <p>Which interpretation is most fragile?</p>
        </div>
      </aside>

      <section className="flex min-h-[500px] flex-col" aria-label="Research conversation">
      <span className="sr-only" role="status" aria-live="polite">
        {loading ? "Research critic running." : messages.length > 0 ? messages[messages.length - 1].kind === "error" ? "Research critic failed." : "Research critic complete." : ""}
      </span>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:px-6">
        <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#00D09C]">02 / Interrogate</p><h3 className="mt-1 text-sm font-semibold text-white">Research transcript</h3></div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#64748B]">{isGuest ? "Local heuristic · no live AI/web" : searchEnabled ? "Web evidence on" : "Model assisted"}</span>
      </div>

      <div className={`flex-1 overflow-y-auto p-5 lg:p-6 ${messages.length === 0 ? "flex" : "space-y-5"}`}>
        {messages.length === 0 && (
          <div className="my-auto w-full">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D09C]">Ready / Begin with doubt</p>
              <h4 className="mt-3 max-w-xl text-xl font-semibold tracking-tight text-white sm:text-2xl">Do not ask for a prediction. Ask what could make the model wrong.</h4>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#94A3B8]">{activeTest ? "The active backtest artifact is attached. Choose a line of inquiry or write your own question to expose assumptions, sample risks, and evidence gaps." : testState === "stale" ? "The previous result no longer matches the current subject or hypothesis. You can frame the critique now, but retest before treating the result as current evidence." : "Record a hypothesis or complete a backtest to attach stronger evidence. You can still begin by defining what would falsify the claim."}</p>
            </div>
            <div className="mt-7 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-3" aria-label="Suggested research questions">
              {promptStarters.map((starter, index) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => setInput(starter.prompt)}
                  className="group bg-[#0B1628] p-4 text-left transition-colors hover:bg-[#111F34] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00D09C]"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#00D09C]">0{index + 1}</span>
                  <span className="mt-3 block text-sm font-semibold text-white group-hover:text-[#A7F3D0]">{starter.label}</span>
                  <span className="mt-2 block text-xs leading-5 text-[#64748B]">{starter.detail}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[#475569]">Select a prompt to edit it below · nothing is sent automatically</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className="border-b border-white/5 pb-5 last:border-b-0"
          >
            <div
              className={`max-w-3xl text-sm ${
                msg.role === "user"
                  ? "text-[#E2E8F0]"
                  : "text-white"
              }`}
            >
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#00D09C]">{msg.role === "user" ? "You / hypothesis" : "EPSILON / examination"}</p>
              {msg.kind === "error" && (
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#FCA5A5]">Critic unavailable / no conclusion generated</p>
              )}
              <div className={`whitespace-pre-wrap leading-relaxed ${msg.kind === "error" ? "border-l border-[#F0616D] pl-3 text-[#FECACA]" : ""}`}>{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="border-l border-[#00D09C] pl-4">
            <div className="text-sm">
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

      <div className="border-t border-white/10 p-5 lg:p-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">Continue / Add the next question</p>
        <div className="flex gap-2">
          <input
            type="text"
            aria-label="Research question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAuthenticated
                ? isGuest ? "Challenge this guest experiment..." : "Ask about your strategy..."
                : "Research session unavailable..."
            }
            disabled={loading}
            className="flex-1 border border-[#334155] bg-[#1E293B] px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#64748B] focus:border-[#00D09C] disabled:opacity-40"
          />
          {loading ? (
            <button
              onClick={handleStop}
              aria-label="Stop response"
              className="bg-[#F0616D] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#FB7185]"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={handleSend}
              aria-label="Send research question"
              disabled={!input.trim()}
              className="bg-[#00D09C] px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-[#37E8B8] disabled:opacity-40"
            >
              Send
            </button>
          )}
        </div>
      </div>
      </section>
    </div>
  );
}
