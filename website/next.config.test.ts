import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfig = require("./next.config.js") as {
  poweredByHeader: boolean;
  redirects: () => Promise<Array<{ source: string; destination: string; permanent: boolean }>>;
  headers: () => Promise<Array<{ source: string; headers: Array<{ key: string; value: string }> }>>;
};

describe("legacy public routes", () => {
  it("converges presentation and legacy routes on the product", async () => {
    await expect(nextConfig.redirects()).resolves.toEqual([
      { source: "/demo", destination: "/dashboard/backtest", permanent: true },
      { source: "/simulator", destination: "/dashboard", permanent: true },
      { source: "/video", destination: "/landing", permanent: true },
    ]);
  });
});

describe("public response hardening", () => {
  it("sets baseline browser security headers on every route", async () => {
    const rules = await nextConfig.headers();

    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe("/:path*");
    expect(nextConfig.poweredByHeader).toBe(false);
    expect(Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]))).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    });
  });
});
