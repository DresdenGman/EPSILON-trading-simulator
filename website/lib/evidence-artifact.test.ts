import { describe, expect, it } from "vitest";
import { ILLUSTRATIVE_EVIDENCE } from "@/lib/illustrative-evidence";
import {
  decodeEvidenceArtifact,
  decodePortableEvidenceArtifact,
  describeStability,
  encodeEvidenceArtifact,
  encodePortableEvidenceArtifact,
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

  it("compresses share links while preserving every evidence field", async () => {
    const legacy = encodeEvidenceArtifact(ILLUSTRATIVE_EVIDENCE);
    const encoded = await encodePortableEvidenceArtifact(ILLUSTRATIVE_EVIDENCE);
    const decoded = await decodePortableEvidenceArtifact(encoded);

    expect(encoded.startsWith("g1.")).toBe(true);
    expect(encoded.length).toBeLessThan(legacy.length * 0.6);
    expect(decoded).toEqual(ILLUSTRATIVE_EVIDENCE);
  });

  it("keeps existing uncompressed links readable", async () => {
    const legacy = encodeEvidenceArtifact(ILLUSTRATIVE_EVIDENCE);
    expect(await decodePortableEvidenceArtifact(legacy)).toEqual(ILLUSTRATIVE_EVIDENCE);
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
