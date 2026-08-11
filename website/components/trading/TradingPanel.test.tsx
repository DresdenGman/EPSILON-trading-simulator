// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TradingPanel from "./TradingPanel";

const mocks = vi.hoisted(() => ({
  buy: vi.fn(),
  sell: vi.fn(),
  placeOrder: vi.fn(),
}));

vi.mock("@/lib/api", () => ({ api: mocks }));
vi.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ isAuthenticated: true }) }));
vi.mock("@/components/effects/MotionCard", () => ({
  default: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("TradingPanel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits a market buy only once while the first request is in flight", () => {
    let resolveBuy: ((value: { message: string }) => void) | undefined;
    mocks.buy.mockImplementation(() => new Promise((resolve) => { resolveBuy = resolve; }));

    render(React.createElement(TradingPanel, {
      stock: { code: "AAPL", name: "Apple", price: 100, change_percent: 0 },
      onTradeExecuted: vi.fn().mockResolvedValue("reconciled"),
    }));

    const button = screen.getByRole("button", { name: "Buy AAPL" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mocks.buy).toHaveBeenCalledTimes(1);
    resolveBuy?.({ message: "Buy executed" });
  });
});
