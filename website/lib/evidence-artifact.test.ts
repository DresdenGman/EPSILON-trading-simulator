import { describe, expect, it } from "vitest";
import { ILLUSTRATIVE_EVIDENCE } from "@/lib/illustrative-evidence";
import {
  decodeEvidenceArtifact,
  describeStability,
  encodeEvidenceArtifact,
  isEvidenceArtifact,
} from "@/lib/evidence-artifact";

describe("evidence artifacts", () => {
  it("round-trips a portable evidence plate without losing exact assumptions", () => {
    const encoded = encodeEvidenceArtifact(ILLUSTRATIVE_EVIDENCE);
    const decoded = decodeEvidenceArtifact(encoded);
    expect(decoded).toEqual(ILLUSTRATIVE_EVIDENCE);
    expect(decoded?.configuration.slippagePerShare).toBe(0.01);
    expect(decoded?.observations).toHaveLength(4);
  });

  it("rejects malformed, oversized, and unsupported artifacts", () => {
    expect(decodeEvidenceArtifact("not-base64-json")).toBeNull();
    expect(decodeEvidenceArtifact("x".repeat(64_001))).toBeNull();
    expect(isEvidenceArtifact({ ...ILLUSTRATIVE_EVIDENCE, format: "epsilon.evidence.v0" })).toBe(false);
    expect(isEvidenceArtifact({ ...ILLUSTRATIVE_EVIDENCE, claim: "x".repeat(501) })).toBe(false);
  });

  it("describes direction stability without claiming the user-defined rule was proven", () => {
    expect(describeStability(ILLUSTRATIVE_EVIDENCE)).toEqual({ completed: 4, preserved: 4, reversed: 0 });
  });
});
