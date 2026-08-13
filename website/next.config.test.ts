import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const nextConfig = require("./next.config.js") as {
  redirects: () => Promise<Array<{ source: string; destination: string; permanent: boolean }>>;
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
