"use client";

import { useEffect } from "react";

export type ImpactEvent = "site_visit" | "lab_opened" | "evidence_completed" | "evidence_exported" | "summary_copied" | "challenge_opened" | "reproduce_opened";

const SESSION_KEY = "epsilon_impact_session_v1";

function sessionId() {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, created);
  return created;
}

function sourceLabel() {
  const query = new URLSearchParams(window.location.search);
  const campaignSource = query.get("utm_source")?.slice(0, 48);
  if (campaignSource) return campaignSource;
  if (!document.referrer) return "direct";
  try {
    const hostname = new URL(document.referrer).hostname;
    return hostname === window.location.hostname ? "internal" : hostname.slice(0, 80);
  } catch {
    return "unknown";
  }
}

export async function recordImpactEvent(
  event: ImpactEvent,
  details: { artifactHash?: string; mode?: string } = {},
) {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    sessionId: sessionId(),
    source: sourceLabel(),
    path: window.location.pathname.slice(0, 120),
    artifactHash: details.artifactHash?.slice(0, 64),
    mode: details.mode?.slice(0, 32),
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
