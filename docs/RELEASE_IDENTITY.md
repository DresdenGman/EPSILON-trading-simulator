# Build and evidence identity

These identifiers answer different questions; they are not interchangeable versions.

| Field | Meaning |
|---|---|
| `software.productRelease` | Named product release line, currently `v2.0.0`; not a claim that current code equals that tag |
| `software.packageVersion` | Internal application package version |
| `format` / `software.evidenceFormat` | Evidence schema family, `epsilon.evidence.v2` |
| `softwareRevision` / `software.engineRevision` | Declared engine revision; update deliberately for computation-semantic changes |
| `software.commitSha` | Full build-checkout commit, or `null`; deployment-source and public repositories can have different SHAs |
| `software.sourceState` | `clean`, `modified`, or `unavailable` for the application directory at build time |
| `software.sourceFingerprint` | SHA-256 of allowlisted source/configuration below, independent of repository layout |
| `provenance.dataFingerprint` | Digest of normalized computation data, not a data download |
| `evidenceId` | Canonical core evidence digest, including build identity but excluding generation time |
| `artifactHash` | Digest of the whole export except this field, including generation time |

Health reports the server's embedded identity. New artifacts include their producing build's identity under `software`, covered by the checksum. A tab open across deployment can hold older client code; compare the artifact, not just today's health response.

## Fingerprint scope

Sorted inputs: non-dot files in `app/`, `components/`, `hooks/`, `lib/`, `scripts/`, and `data/`; plus `package.json`, `package-lock.json`, `release.json`, `vite.config.ts`, `next.config.ts`, and `tsconfig.json`. Hashing includes each relative path, byte length, and exact bytes. Symlinks in this set cause an error rather than following another directory.

This is an application-source/configuration fingerprint, **not** all repository files, static media, tests, hosting settings, secrets, installed dependencies, runtime data, or deployed worker bytes. Environment values and build output are deliberately excluded. It compares public `instrument/` source with a site's source checkout even when commit IDs differ.

From `instrument/`, inspect the same calculation without building:

```bash
node --input-type=module -e 'import { collectBuildMetadata } from "./scripts/build-metadata.ts"; console.log(collectBuildMetadata(process.cwd()))'
```

Production builds should use clean committed source. Modified checkouts retain the parent commit but say `modified`; source archives have a null commit and unavailable state. Imports outside Vite have unavailable build metadata rather than guessing from a package version.

Preserve older artifacts without `software` and their original checksums; do not retroactively invent metadata. A hash is not authentication. No field alone establishes independent reproduction or research validity.
