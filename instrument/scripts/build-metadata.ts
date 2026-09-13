import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { SoftwareBuild } from "../lib/build-info.ts";

// Deliberate allowlist: never traverse environment files, uploads or build output.
const sourceDirectories = ["app", "components", "hooks", "lib", "scripts", "data"];
const sourceFiles = ["package.json", "package-lock.json", "release.json", "vite.config.ts", "next.config.ts", "tsconfig.json"];

export function sourceFingerprint(directory: string) {
  const files: string[] = [];
  function collect(relative: string) {
    const full = join(directory, relative);
    if (!existsSync(full)) return;
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) throw new Error(`Source fingerprint does not follow symlinks: ${relative}`);
    if (stat.isDirectory()) {
      for (const name of readdirSync(full).sort()) {
        if (!name.startsWith(".")) collect(`${relative}/${name}`);
      }
    } else if (stat.isFile()) files.push(relative);
  }
  for (const path of [...sourceDirectories, ...sourceFiles]) collect(path);
  const digest = createHash("sha256");
  for (const path of files.sort()) {
    const bytes = readFileSync(join(directory, path));
    digest.update(`${path}\0${bytes.length}\0`).update(bytes);
  }
  return digest.digest("hex");
}

export function collectBuildMetadata(directory: string): SoftwareBuild {
  const release = JSON.parse(readFileSync(join(directory, "release.json"), "utf8"));
  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  let commitSha: string | null = null;
  let sourceState: SoftwareBuild["sourceState"] = "unavailable";
  try {
    const git = (args: string[]) => execFileSync("git", args, { cwd: directory, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    // A parent directory's unrelated repository is not evidence for this app.
    if (git(["ls-files", "--error-unmatch", "package.json"]) === "package.json") {
      const candidate = git(["rev-parse", "HEAD"]);
      if (/^[0-9a-f]{40,64}$/.test(candidate)) {
        commitSha = candidate;
        sourceState = git(["status", "--porcelain", "--untracked-files=all", "--", "."]) ? "modified" : "clean";
      }
    }
  } catch { /* ZIPs remain reproducible by content, without inventing a commit. */ }
  return {
    productRelease: release.productRelease,
    packageVersion: manifest.version,
    evidenceFormat: release.evidenceFormat,
    engineRevision: release.engineRevision,
    commitSha,
    sourceState,
    sourceFingerprint: sourceFingerprint(directory),
  };
}
