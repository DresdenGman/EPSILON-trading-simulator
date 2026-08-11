// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AIChatDialog from "./AIChatDialog";
import { ResearchProvider, UNKNOWN_BACKTEST_PROVENANCE } from "@/components/research/ResearchContext";

const { mockAuthState } = vi.hoisted(() => ({ mockAuthState: { isAuthenticated: true, isGuest: false } }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => mockAuthState }));

describe("AIChatDialog", () => {
  beforeEach(() => {
    mockAuthState.isAuthenticated = true;
    mockAuthState.isGuest = false;
    window.sessionStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      body: new ReadableStream({ start(controller) { controller.close(); } }),
    }));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("sends the explicit web-evidence preference with a research question", async () => {
    render(React.createElement(ResearchProvider, null, React.createElement(AIChatDialog)));

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.change(screen.getByPlaceholderText("Ask about your strategy..."), { target: { value: "What would falsify this view?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send research question" }));

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const request = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(JSON.parse(request.body)).toMatchObject({
      searchEnabled: true,
      messages: [{ role: "user", content: "What would falsify this view?" }],
      experiment: { subject: null, hypothesis: null, test: null },
    });
  });

  it("shows a recoverable unavailable state when the provider returns an empty stream", async () => {
    render(React.createElement(ResearchProvider, null, React.createElement(AIChatDialog)));

    fireEvent.change(screen.getByPlaceholderText("Ask about your strategy..."), { target: { value: "Challenge this result." } });
    fireEvent.click(screen.getByRole("button", { name: "Send research question" }));

    expect(await screen.findByText("Critic unavailable / no conclusion generated")).toBeTruthy();
    expect(screen.getByText(/returned no analysis/i)).toBeTruthy();
    expect((screen.getByPlaceholderText("Ask about your strategy...") as HTMLInputElement).disabled).toBe(false);
  });

  it("surfaces a server configuration error without creating a blank examination", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: "Research critic is not configured. Add a server-side DeepSeek API key and try again." }),
    }));
    render(React.createElement(ResearchProvider, null, React.createElement(AIChatDialog)));

    fireEvent.change(screen.getByPlaceholderText("Ask about your strategy..."), { target: { value: "Challenge this result." } });
    fireEvent.click(screen.getByRole("button", { name: "Send research question" }));

    expect(await screen.findByText(/Research critic is not configured/i)).toBeTruthy();
    expect(screen.getByText("Critic unavailable / no conclusion generated")).toBeTruthy();
    expect((screen.getByPlaceholderText("Ask about your strategy...") as HTMLInputElement).disabled).toBe(false);
  });

  it("does not send a stale artifact as evidence for a refined hypothesis", async () => {
    window.sessionStorage.setItem("epsilon.research-experiment.v1", JSON.stringify({
      symbol: "AAPL",
      hypothesis: "Momentum fails in high-volatility regimes.",
      updatedAt: "2026-08-10T19:00:00.000Z",
      test: {
        subjectSnapshot: "AAPL",
        hypothesisSnapshot: "Momentum persists.",
        method: "backtest",
        strategy: "momentum",
        symbols: ["AAPL"],
        startDate: "2024-01-01",
        endDate: "2024-06-30",
        initialCash: 100000,
        totalReturn: 5,
        sharpe: 1.1,
        maxDrawdown: -4,
        tradeCount: 8,
        completedAt: "2026-08-10T19:00:00.000Z",
        provenance: UNKNOWN_BACKTEST_PROVENANCE,
      },
    }));

    render(<ResearchProvider><AIChatDialog /></ResearchProvider>);
    await screen.findByText("Previous result · Needs retest");
    fireEvent.change(screen.getByPlaceholderText("Ask about your strategy..."), { target: { value: "Challenge the refined claim." } });
    fireEvent.click(screen.getByRole("button", { name: "Send research question" }));

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    const request = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(JSON.parse(request.body).experiment).toMatchObject({
      subject: "AAPL",
      hypothesis: "Momentum fails in high-volatility regimes.",
      test: null,
    });
  });

  it("removes live-model and web-evidence affordances from the guest critic", () => {
    mockAuthState.isGuest = true;
    render(<ResearchProvider><AIChatDialog /></ResearchProvider>);

    expect(screen.getAllByText(/local heuristic · no live ai\/web/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(/model assisted/i)).toBeNull();
    expect(screen.queryByText(/web evidence on/i)).toBeNull();
  });

  it("loads a suggested critique into the composer without sending it", () => {
    render(<ResearchProvider><AIChatDialog /></ResearchProvider>);

    fireEvent.click(screen.getByRole("button", { name: /Define falsifying evidence/i }));

    expect((screen.getByLabelText("Research question") as HTMLInputElement).value).toBe("What specific evidence would falsify this hypothesis or force me to revise it?");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("respects reduced-motion preferences when moving the transcript", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));

    render(<ResearchProvider><AIChatDialog /></ResearchProvider>);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto" });
  });
});
