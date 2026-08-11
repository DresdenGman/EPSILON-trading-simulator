// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AIPage from "./page";
import { ResearchProvider } from "@/components/research/ResearchContext";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock("@/components/ai/AIChatDialog", () => ({ default: () => React.createElement("div", null, "AI chat") }));

describe("AIPage", () => {
  it("describes the server-backed research critic without making a local-only privacy claim", () => {
    const { container } = render(React.createElement(ResearchProvider, null, React.createElement(AIPage)));

    expect(screen.getByText(/server-backed research critic/i)).toBeTruthy();
    expect(screen.getByText(/when enabled for a deployment.*server-side DeepSeek integration/i)).toBeTruthy();
    expect(container.textContent).not.toMatch(/Ollama|never leaves your machine|runs locally/i);
  });
});
