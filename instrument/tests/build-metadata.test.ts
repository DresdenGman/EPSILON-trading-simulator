import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { collectBuildMetadata, sourceFingerprint } from "../scripts/build-metadata.ts";
import { SOFTWARE_BUILD } from "../lib/build-info.ts";
import { createEvidenceArtifact, verifyEvidenceArtifact } from "../lib/evidence-contract.ts";

void test("source archives have a fingerprint but no invented commit; environment/output files are excluded", () => {
  const directory = mkdtempSync(join(tmpdir(), "epsilon-metadata-"));
  try {
    writeFileSync(join(directory, "package.json"), JSON.stringify({ version: "0.1.0" }));
    writeFileSync(join(directory, "release.json"), JSON.stringify({ productRelease: "v2.0.0", engineRevision: "test", evidenceFormat: "epsilon.evidence.v2" }));
    const original = collectBuildMetadata(directory);
    assert.equal(original.commitSha, null);
    assert.equal(original.sourceState, "unavailable");
    assert.match(original.sourceFingerprint!, /^[a-f0-9]{64}$/);
    writeFileSync(join(directory, ".env.local"), "EXAMPLE_SECRET=not-a-real-secret");
    mkdirSync(join(directory, "dist"));
    writeFileSync(join(directory, "dist", "output.js"), "generated");
    assert.equal(sourceFingerprint(directory), original.sourceFingerprint);
    mkdirSync(join(directory, "lib"));
    writeFileSync(join(directory, "lib", "example.ts"), "export const changed = true;");
    assert.notEqual(sourceFingerprint(directory), original.sourceFingerprint);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

void test("a clean checkout and a modified checkout cannot claim the same source state", () => {
  const directory = mkdtempSync(join(tmpdir(), "epsilon-git-metadata-"));
  const git = (args: string[]) => execFileSync("git", args, { cwd: directory, stdio: "pipe", encoding: "utf8" }).trim();
  try {
    writeFileSync(join(directory, "package.json"), JSON.stringify({ version: "0.1.0" }));
    writeFileSync(join(directory, "release.json"), JSON.stringify({ productRelease: "v2.0.0", engineRevision: "test", evidenceFormat: "epsilon.evidence.v2" }));
    git(["init"]);
    git(["add", "."]);
    git(["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", "commit", "-m", "fixture"]);
    const clean = collectBuildMetadata(directory);
    assert.equal(clean.sourceState, "clean");
    assert.equal(clean.commitSha, git(["rev-parse", "HEAD"]));
    writeFileSync(join(directory, "package.json"), JSON.stringify({ version: "0.2.0" }));
    const modified = collectBuildMetadata(directory);
    assert.equal(modified.commitSha, clean.commitSha);
    assert.equal(modified.sourceState, "modified");
    assert.notEqual(modified.sourceFingerprint, clean.sourceFingerprint);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

void test("every artifact covers build identity with its checksum", async () => {
  const artifact = await createEvidenceArtifact({ claim: "test" });
  assert.deepEqual(artifact.software, SOFTWARE_BUILD);
  assert.equal(await verifyEvidenceArtifact(artifact), true);
  assert.equal(await verifyEvidenceArtifact({ ...artifact, software: { ...artifact.software, commitSha: "0".repeat(40) } }), false);
});
