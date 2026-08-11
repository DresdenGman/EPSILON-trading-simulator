// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not mount protected content while the session is being checked", () => {
    authState.loading = true;
    authState.isAuthenticated = false;
    renderLayout();

    expect(screen.getByText("Checking your session…")).toBeTruthy();
    expect(screen.queryByText("Protected workspace")).toBeNull();
    expect(screen.getByRole("link", { name: "Market" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Strategy Lab" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Interrogate" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /download|simulator|research/i })).toBeNull();
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

    const reset = screen.getByRole("button", { name: "Reset guest session data" });
    fireEvent.click(reset);
    expect(authState.logout).not.toHaveBeenCalled();

    fireEvent.click(reset);
    expect(authState.logout).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
