import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("health route", () => {
  it("reports capability modes without exposing credentials", async () => {
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body).toMatchObject({ status: "operational", product: "EPSILON", publicDataMode: "controlled-synthetic", guestCritic: "evidence-aware-local" });
    expect(JSON.stringify(body)).not.toMatch(/api.?key|database.?url|secret/i);
  });
});
