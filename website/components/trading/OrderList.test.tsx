// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderList from "./OrderList";

const mocks = vi.hoisted(() => ({ cancelOrder: vi.fn() }));

vi.mock("@/lib/api", () => ({ api: mocks }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() } }));

describe("OrderList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not send a second cancellation while another cancellation is pending", () => {
    mocks.cancelOrder.mockImplementation(() => new Promise(() => undefined));

    render(React.createElement(OrderList, {
      orders: [
        { id: 1, stock_code: "AAPL", order_type: "limit", side: "buy", shares: 1, price: 100, trigger_price: null, status: "pending", created_at: "2026-01-01" },
        { id: 2, stock_code: "MSFT", order_type: "limit", side: "sell", shares: 1, price: 200, trigger_price: null, status: "pending", created_at: "2026-01-01" },
      ],
      onUpdate: vi.fn().mockResolvedValue(true),
    }));

    const buttons = screen.getAllByRole("button", { name: "Cancel" });
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    expect(mocks.cancelOrder).toHaveBeenCalledTimes(1);
    expect(mocks.cancelOrder).toHaveBeenCalledWith(1);
  });
});
