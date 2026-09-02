"use client";

import { useEffect } from "react";

export type ImpactEvent = "site_visit" | "lab_opened" | "challenge_opened" | "reproduce_opened";

const SESSION_KEY = "epsilon_impact_session_v1";
const SOURCE_KEY = "epsilon_impact_source_v1";

function sessionId() {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

function sourceLabel() {
  const existing = window.sessionStorage.getItem(SOURCE_KEY);
  if (existing) return existing;
  const query = new URLSearchParams(window.location.search);
  const aliases: Record<string, string> = { twitter: "x", x: "x", github: "github", stocktwits: "stocktwits", linkedin: "linkedin", reddit: "reddit", youtube: "youtube", producthunt: "producthunt", substack: "substack", email: "email", school: "school" };
  const campaignSource = query.get("utm_source")?.trim().toLowerCase();
  if (campaignSource) {
    const source = aliases[campaignSource] ?? "other";
    window.sessionStorage.setItem(SOURCE_KEY, source);
    return source;
  }
  if (!document.referrer) {
    window.sessionStorage.setItem(SOURCE_KEY, "direct");
    return "direct";
  }
  try {
    const hostname = new URL(document.referrer).hostname;
    const source = hostname === window.location.hostname ? "internal" : hostname.endsWith("github.com") ? "github" : hostname.endsWith("stocktwits.com") ? "stocktwits" : hostname.endsWith("linkedin.com") ? "linkedin" : hostname.endsWith("reddit.com") ? "reddit" : hostname.endsWith("youtube.com") || hostname.endsWith("youtu.be") ? "youtube" : "other";
    window.sessionStorage.setItem(SOURCE_KEY, source);
    return source;
  } catch {
    window.sessionStorage.setItem(SOURCE_KEY, "unknown");
    return "unknown";
  }
}

export async function recordImpactEvent(
  event: ImpactEvent,
) {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    sessionId: sessionId(),
    source: sourceLabel(),
    path: window.location.pathname.slice(0, 120),
  };
  try {
    await fetch("/api/impact/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Measurement must never interrupt research work.
  }
}

export function ImpactTracker() {
  useEffect(() => {
    void recordImpactEvent("site_visit");
    if (window.location.pathname === "/lab") void recordImpactEvent("lab_opened");
  }, []);
  return null;
}
