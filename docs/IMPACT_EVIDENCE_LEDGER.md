# EPSILON Impact Evidence Ledger

This file is an audit index, not a marketing scoreboard. Every primary outcome must link to an external record, artifact, commit, DOI, or organizer confirmation.

## Baseline — August 30, 2026

| Metric | Value | Definition | Source |
|---|---:|---|---|
| GitHub Stars | 20 | Current repository watchers who starred the repository | GitHub repository API |
| GitHub Forks | 3 | Current public forks | GitHub repository API |
| Repository views, rolling 14 days | 5 | GitHub traffic views | GitHub Traffic API |
| Unique repository visitors, rolling 14 days | 4 | GitHub-estimated distinct repository visitors | GitHub Traffic API |
| Repository clones, rolling 14 days | 32 | Full clones, excluding fetches | GitHub Traffic API |
| Unique cloners, rolling 14 days | 24 | GitHub-estimated distinct cloners | GitHub Traffic API |
| Verified External Research Workflows | 0 | External person completed the full evidence standard | This ledger |
| Independent Reproduction Attempts | 0 | External fixed-release reproduction with durable evidence | GitHub issue records |
| Substantive Independent Challenges Resolved | 0 | Qualified external challenge with public disposition | Independent review log |

The repository metric baseline is preserved in [`docs/metrics/latest.json`](metrics/latest.json). A scheduled workflow appends future snapshots to [`docs/metrics/history.ndjson`](metrics/history.ndjson).

## Primary record schema

| Field | Meaning |
|---|---|
| Record ID | Stable identifier such as `VERW-001`, `IRA-001`, or `SICR-001` |
| Date | UTC date the evidence became public |
| Type | `VERW`, `IRA`, or `SICR` |
| External source | Durable URL controlled by or visible to the reviewer/community |
| Person/institution | Named only with permission; otherwise anonymous with source URL |
| Evidence | Artifact hash, reproduction output, event confirmation, or issue record |
| Disposition | For challenges: accepted, experiment queued, not accepted, or duplicate |
| Resulting change | Linked experiment, issue, pull request, release, or correction |
| Verification status | `VERIFIED`, `PENDING`, or `REJECTED` with reason |

## Verified records

No primary impact record has been verified yet. The first real record must be added without renumbering or rewriting this baseline.

## Archival records

| Date | Record | Status | Identifier |
|---|---|---|---|
| 2026-08-31 | Software Heritage archival snapshot | Successfully archived with a complete visit | Request `2459169`; snapshot `swh:1:snp:ee045df2843943938c9de7bd6ea22d567dcbaadc` |
| — | Zenodo software release | Not yet connected | DOI pending a meaningful release and account authorization |
| — | OSF preregistration | Not yet created | DOI pending a frozen historical protocol and account authorization |

## Counting exclusions

Do not count:

- the author, automated accounts, or duplicate people;
- page views, impressions, likes, votes, or Stars as research workflows;
- praise without a specific claim, assumption, evidence gap, or observed result;
- private compliments without a durable record;
- synthetic results described as historical validation;
- names, affiliations, or quotations without permission.
