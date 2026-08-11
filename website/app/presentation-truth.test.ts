import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) => readFileSync(new URL(relativePath, import.meta.url), "utf8");

describe("presentation source of truth", () => {
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
});
