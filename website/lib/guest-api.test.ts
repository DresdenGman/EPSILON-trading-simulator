// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { guestRequest } from "@/lib/guest-api";
import type { BacktestResult, Order, PerformanceData, PortfolioPosition, StockPrice, TradeRecord } from "@/lib/api";

describe("guestRequest", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("opens a complete market and guest identity without registration", async () => {
    const user = await guestRequest<{ id: number; username: string }>("/api/me");
    const stocks = await guestRequest<StockPrice[]>("/api/market/prices");

    expect(user).toEqual(expect.objectContaining({ id: 0, username: "Guest Researcher" }));
    expect(stocks.map((stock) => stock.code)).toContain("AAPL");
  });

  it("keeps simulated trades and account changes inside the browser session", async () => {
    await guestRequest("/api/trade/buy", {
      method: "POST",
      body: JSON.stringify({ stock_code: "AAPL", shares: 10 }),
    });

    const positions = await guestRequest<PortfolioPosition[]>("/api/portfolio");
    const trades = await guestRequest<TradeRecord[]>("/api/trades/history");
    const performance = await guestRequest<PerformanceData>("/api/portfolio/performance");

    expect(positions[0]).toEqual(expect.objectContaining({ stock_code: "AAPL", shares: 10 }));
    expect(trades[0]).toEqual(expect.objectContaining({ stock_code: "AAPL", trade_type: "buy" }));
    expect(performance.cash).toBeLessThan(100_000);
  });

  it("records and cancels guest orders", async () => {
    await guestRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify({ stock_code: "MSFT", order_type: "limit", side: "buy", shares: 4, price: 400 }),
    });
    await guestRequest("/api/orders/1", { method: "DELETE" });

    const orders = await guestRequest<Order[]>("/api/orders");
    expect(orders[0]).toEqual(expect.objectContaining({ id: 1, stock_code: "MSFT", status: "cancelled" }));
  });

  it("makes execution friction visible in deterministic backtests", async () => {
    const request = {
      strategy: "momentum",
      start_date: "2024-01-01",
      end_date: "2024-06-30",
      stock_codes: ["AAPL", "MSFT"],
      initial_cash: 100_000,
    };
    const baseline = await guestRequest<BacktestResult>("/api/backtest", { method: "POST", body: JSON.stringify({ ...request, slippage_per_share: 0.01 }) });
    const perturbed = await guestRequest<BacktestResult>("/api/backtest", { method: "POST", body: JSON.stringify({ ...request, slippage_per_share: 0.02 }) });

    expect(baseline.trades).toHaveLength(4);
    expect(perturbed.performance.total_return).toBeLessThan(baseline.performance.total_return);
  });

  it("uses the pre-specified date window as a real deterministic input", async () => {
    const request = {
      strategy: "momentum",
      stock_codes: ["AAPL", "MSFT", "NVDA"],
      initial_cash: 100_000,
      slippage_per_share: 0.01,
    };
    const primary = await guestRequest<BacktestResult>("/api/backtest", {
      method: "POST",
      body: JSON.stringify({ ...request, start_date: "2026-04-01", end_date: "2026-07-01" }),
    });
    const primaryRepeat = await guestRequest<BacktestResult>("/api/backtest", {
      method: "POST",
      body: JSON.stringify({ ...request, start_date: "2026-04-01", end_date: "2026-07-01" }),
    });
    const replication = await guestRequest<BacktestResult>("/api/backtest", {
      method: "POST",
      body: JSON.stringify({ ...request, start_date: "2026-01-01", end_date: "2026-03-31" }),
    });
    const reversalBaseline = await guestRequest<BacktestResult>("/api/backtest", {
      method: "POST",
      body: JSON.stringify({ ...request, start_date: "2026-04-01", end_date: "2026-04-28" }),
    });
    const reversalPerturbed = await guestRequest<BacktestResult>("/api/backtest", {
      method: "POST",
      body: JSON.stringify({ ...request, start_date: "2026-04-01", end_date: "2026-04-28", slippage_per_share: 0.02 }),
    });

    expect(primary).toEqual(primaryRepeat);
    expect(replication.performance.total_return).not.toBe(primary.performance.total_return);
    expect(replication.equity_curve).not.toEqual(primary.equity_curve);
    expect(reversalBaseline.performance.total_return).toBeGreaterThan(0);
    expect(reversalPerturbed.performance.total_return).toBeLessThan(0);
  });
});
