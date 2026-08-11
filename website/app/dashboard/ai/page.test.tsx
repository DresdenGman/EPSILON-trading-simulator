// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AIPage from "./page";
import { ResearchProvider } from "@/components/research/ResearchContext";

vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true, isGuest: true }) }));
vi.mock("@/components/ai/AIChatDialog", () => ({ default: () => React.createElement("div", null, "AI chat") }));

describe("AIPage", () => {
  it("describes the guest critic honestly while preserving the server-backed boundary", () => {
    const { container } = render(React.createElement(ResearchProvider, null, React.createElement(AIPage)));

    expect(screen.getByText(/local heuristic · no live ai\/web/i)).toBeTruthy();
    expect(screen.getByText(/guest sessions use a clearly labeled local heuristic/i)).toBeTruthy();
    expect(container.textContent).not.toMatch(/Ollama|never leaves your machine/i);
  });
});
