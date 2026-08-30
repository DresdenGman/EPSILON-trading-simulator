import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";

describe("historical market-data route", () => {
  afterEach(() => {
    delete process.env.MASSIVE_API_KEY;
    delete process.env.TWELVE_DATA_API_KEY;
    delete process.env.HISTORICAL_DATA_PUBLIC;
  });

  it("stays closed when no server-side provider is configured", async () => {
    const response = await GET(new Request("https://epsilon.test/api/market-data/history?symbol=AAPL&start=2025-01-01&end=2025-06-01"));
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "Historical market data is not enabled for the public instrument." });
  });

  it("does not accept malformed symbols even when the route is enabled", async () => {
    process.env.MASSIVE_API_KEY = "server-only-placeholder";
    process.env.HISTORICAL_DATA_PUBLIC = "true";
    const response = await GET(new Request("https://epsilon.test/api/market-data/history?symbol=%3Cscript%3E&start=2025-01-01&end=2025-06-01"));
    expect(response.status).toBe(400);
  });
});
