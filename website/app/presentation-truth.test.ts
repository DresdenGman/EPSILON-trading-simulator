import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), "utf8");

describe("product source of truth", () => {
  it("describes one Decision Lab instead of competing legacy products", () => {
    const rootReadme = read("../../README.md");
    const webReadme = read("../README.md");
    const landing = read("./landing/page.tsx");
    const dashboard = read("./dashboard/page.tsx");

    expect(rootReadme).toContain("EPSILON — Quantitative Decision Lab");
    expect(rootReadme).toContain("Market → Strategy Lab → Interrogate");
    expect(webReadme).toContain("EPSILON Web Laboratory");

    for (const publicSurface of [rootReadme, webReadme, landing, dashboard]) {
      expect(publicSurface).not.toMatch(/institutional-grade/i);
      expect(publicSurface).not.toMatch(/AI (Strategy )?Advisor/i);
      expect(publicSurface).not.toMatch(/Start Trading Free/i);
    }
  });

  it("does not use the legacy real-data desktop screenshot as social metadata", () => {
    const metadata = read("./layout.tsx");

    expect(metadata).toContain("falsifiable hypothesis");
    expect(metadata).not.toContain("/screenshots/main_interface.png");
  });

  it("keeps canonical and discovery metadata on the EPSILON deployment", () => {
    const metadata = read("./layout.tsx");
    const site = read("../lib/site.ts");
    const robots = read("./robots.ts");
    const sitemap = read("./sitemap.ts");

    for (const source of [metadata, site, robots, sitemap]) {
      expect(source).not.toContain("epsilon-trading.com");
    }
    expect(metadata).toContain("SITE_URL");
    expect(site).toContain("https://epsilon-livid.vercel.app");
    expect(robots).toContain("/dashboard");
    expect(sitemap).not.toContain("/demo");
  });

  it("keeps Market bound to the active experiment instead of a fixed showcase", () => {
    const dashboard = read("./dashboard/page.tsx");

    expect(dashboard).not.toContain("VALIDATION_CONFIG");
    expect(dashboard).not.toContain("SensitivitySummary");
    expect(dashboard).not.toContain("ExperimentConclusion");
    expect(dashboard).toContain("getResearchNextStep");
  });
});
