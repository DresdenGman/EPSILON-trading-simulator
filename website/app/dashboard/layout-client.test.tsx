// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DashboardClientLayout from "./layout-client";

const authState = vi.hoisted(() => ({
  loading: true,
  isAuthenticated: false,
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
  afterEach(() => cleanup());

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

  it("does not mount protected content for an unauthenticated session", () => {
    authState.loading = false;
    authState.isAuthenticated = false;
    renderLayout();

    expect(screen.getByText("Sign in to access your workspace")).toBeTruthy();
    expect(screen.queryByText("Protected workspace")).toBeNull();
    expect(screen.getByRole("link", { name: "Sign in" }).getAttribute("href"))
      .toBe("/auth/login?next=%2Fdashboard%2Fbacktest%3Fsymbols%3DAAPL");
  });

  it("mounts protected content only after the session is confirmed", () => {
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.user = { username: "Ada", email: "ada@example.com" };
    renderLayout();

    expect(screen.getByText("Protected workspace")).toBeTruthy();
  });

  it("removes protected content when the confirmed session becomes invalid", () => {
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

    expect(screen.queryByText("Protected workspace")).toBeNull();
    expect(screen.getByText("Sign in to access your workspace")).toBeTruthy();
  });
});
