import { describe, expect, it } from "vitest";
import { authRouteWithNext, getSafeAuthRedirect } from "./auth-redirect";

describe("getSafeAuthRedirect", () => {
  it("keeps a dashboard deep link and its query", () => {
    expect(getSafeAuthRedirect("/dashboard/backtest?symbols=AAPL")).toBe("/dashboard/backtest?symbols=AAPL");
  });

  it("defaults to the workspace root when next is absent", () => {
    expect(getSafeAuthRedirect(null)).toBe("/dashboard");
  });

  it.each(["https://evil.example", "//evil.example", "/demo", "javascript:alert(1)"]) (
    "rejects an unsafe return path: %s",
    (next) => {
      expect(getSafeAuthRedirect(next)).toBe("/dashboard");
    },
  );
});

describe("authRouteWithNext", () => {
  it("preserves the deep link while switching authentication screens", () => {
    expect(authRouteWithNext("/auth/register", "/dashboard/backtest?symbols=AAPL"))
      .toBe("/auth/register?next=%2Fdashboard%2Fbacktest%3Fsymbols%3DAAPL");
  });
});
