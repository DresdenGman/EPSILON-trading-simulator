// @vitest-environment jsdom

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SpectralAnalysis from "./SpectralAnalysis";

const mocks = vi.hoisted(() => ({ getKline: vi.fn(), spectralAnalysis: vi.fn() }));
const navigation = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));
vi.mock("@/lib/api", () => ({ api: mocks }));
vi.mock("next/navigation", () => ({ useSearchParams: () => navigation.searchParams }));
vi.mock("recharts", () => ({
  Area: () => null, AreaChart: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
  CartesianGrid: () => null, ResponsiveContainer: ({ children }: { children: React.ReactNode }) => React.createElement("div", null, children),
  Tooltip: () => null, XAxis: () => null, YAxis: () => null,
}));

describe("SpectralAnalysis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.searchParams = new URLSearchParams();
  });
  afterEach(() => document.body.replaceChildren());

  it("analyzes the close series returned for the selected stock", async () => {
    mocks.getKline.mockResolvedValue({ code: "MSFT", name: "Microsoft", close: [100, 101, 103], dates: [] });
    mocks.spectralAnalysis.mockResolvedValue({ frequencies: [], powers: [], dominant_period: 2, weekly_power: 1, monthly_power: 1, quarterly_power: 1, significant_periods: [] });
    render(React.createElement(SpectralAnalysis));

    fireEvent.change(screen.getByDisplayValue("AAPL"), { target: { value: "MSFT" } });
    fireEvent.click(screen.getByRole("button", { name: "Analyze close series" }));

    await screen.findByText(/MSFT · Microsoft · 3 valid closing-price observations/);
    expect(mocks.getKline).toHaveBeenCalledWith("MSFT", 90);
    expect(mocks.spectralAnalysis).toHaveBeenCalledWith([100, 101, 103]);
  });

  it("does not present a successful source when FFT analysis fails after market data loads", async () => {
    mocks.getKline.mockResolvedValue({ code: "AAPL", name: "Apple", close: [100, 101, 103], dates: [] });
    mocks.spectralAnalysis.mockRejectedValue(new Error("FFT service unavailable"));
    render(React.createElement(SpectralAnalysis));

    fireEvent.click(screen.getByRole("button", { name: "Analyze close series" }));

    await screen.findByText("FFT service unavailable");
    expect(mocks.spectralAnalysis).toHaveBeenCalledWith([100, 101, 103]);
    expect(screen.queryByLabelText("Spectral analysis source")).toBeNull();
  });

  it("uses the first valid Dashboard symbol when opening Strategy Lab", () => {
    navigation.searchParams = new URLSearchParams("symbols=NVDA,MSFT");
    render(React.createElement(SpectralAnalysis));

    expect(screen.getByDisplayValue("NVDA")).toBeTruthy();
  });

  it("keeps AAPL as the safe default when the transferred symbols are invalid", () => {
    navigation.searchParams = new URLSearchParams("symbols=!!!,,");
    render(React.createElement(SpectralAnalysis));

    expect(screen.getByDisplayValue("AAPL")).toBeTruthy();
  });
});
