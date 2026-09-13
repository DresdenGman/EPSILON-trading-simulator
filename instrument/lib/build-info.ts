import release from "../release.json" with { type: "json" };
import manifest from "../package.json" with { type: "json" };

export type SoftwareBuild = {
  productRelease: string;
  packageVersion: string;
  evidenceFormat: string;
  engineRevision: string;
  commitSha: string | null;
  sourceState: "clean" | "modified" | "unavailable";
  sourceFingerprint: string | null;
};

declare const __EPSILON_BUILD__: SoftwareBuild | undefined;

// Node-only consumers and source archives must not pretend to be a known build.
export const SOFTWARE_BUILD: Readonly<SoftwareBuild> = Object.freeze(
  typeof __EPSILON_BUILD__ === "undefined"
    ? { ...release, packageVersion: manifest.version, commitSha: null, sourceState: "unavailable", sourceFingerprint: null }
    : __EPSILON_BUILD__,
);
