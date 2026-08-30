// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardClientLayout from "./layout-client";

const authState = vi.hoisted(() => ({
  loading: true,
  isAuthenticated: false,
  isGuest: false,
  user: null as { username: string; email: string } | null,
  logout: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => authState,
}));
vi.mock("@/components/layout/ThemeToggle", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/backtest",
  useSearchParams: () => new URLSearchParams("symbols=AAPL"),
}));

function renderLayout() {
  return render(
    React.createElement(DashboardClientLayout, null, React.createElement("div", null, "Protected workspace")),
  );
}

describe("DashboardClientLayout", () => {
  beforeEach(() => {
    authState.loading = true;
    authState.isAuthenticated = false;
    authState.isGuest = false;
    authState.user = null;
    authState.logout.mockClear();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not mount protected content while the workspace is being restored", () => {
    authState.loading = true;
    authState.isAuthenticated = false;
    renderLayout();

    expect(screen.getByText("Restoring workspace…")).toBeTruthy();
    expect(screen.queryByText("Protected workspace")).toBeNull();
    expect(screen.getAllByRole("link", { name: /Observe/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Perturb/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Challenge/ }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /download|simulator/i })).toBeNull();
  });

  it("keeps the public workspace available without an account session", () => {
    authState.loading = false;
    authState.isAuthenticated = false;
    renderLayout();

    expect(screen.getByText("Protected workspace")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Sign in" })).toBeNull();
  });

  it("mounts protected content only after the session is confirmed", () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { username: "Ada", email: "ada@example.com" };
    renderLayout();

    expect(screen.getByText("Protected workspace")).toBeTruthy();
  });

  it("does not remove the public workspace when an account session becomes invalid", () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { username: "Ada", email: "ada@example.com" };
    const view = renderLayout();
    expect(screen.getByText("Protected workspace")).toBeTruthy();

    authState.isAuthenticated = false;
    authState.user = null;
    view.rerender(
      React.createElement(DashboardClientLayout, null, React.createElement("div", null, "Protected workspace")),
    );

    expect(screen.getByText("Protected workspace")).toBeTruthy();
    expect(screen.queryByText("Sign in to access your workspace")).toBeNull();
  });

  it("requires confirmation before clearing a guest session", () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.isGuest = true;
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    renderLayout();

    const reset = screen.getByRole("button", { name: "Reset local workspace data" });
    fireEvent.click(reset);
    expect(authState.logout).not.toHaveBeenCalled();

    fireEvent.click(reset);
    expect(authState.logout).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(2);
  });

  it("carries the active subject through the global Strategy Lab navigation", async () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    window.localStorage.setItem("epsilon.research-experiment.v1", JSON.stringify({
      symbol: "NVDA",
      hypothesis: "NVDA momentum survives realistic costs.",
      falsification: "The return reverses after higher costs.",
      test: null,
      updatedAt: "2026-08-12T20:00:00.000Z",
    }));

    renderLayout();

    await waitFor(() => expect(screen.getAllByRole("link", { name: /Perturb/ })
      .some((link) => link.getAttribute("href") === "/dashboard/backtest?symbols=NVDA")).toBe(true));
  });
});
