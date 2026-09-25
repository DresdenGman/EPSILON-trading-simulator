# How We Design an Honest External-Data Validation

> EPSILON pilot methodology · `docs/pilot/` · Draft 2026-09-25
>
> This document describes the *method* EPSILON uses whenever an outside party
> offers data for validation. It is a process record, not a result claim.
> Every pilot run conducted under this method gets its own dated report in
> this directory. Negative results are kept, not replaced.

## 1. Why this document exists

A backtest run on someone else's data can easily become marketing: pick the
window that looks good, hide the costs, publish the curve. This methodology
exists to make that impossible by construction. The pilot is designed so that
**a failed validation is as publishable as a successful one** — the evidence
package is identical either way.

## 2. Principles

1. **Minimum-viable data first.** We ask for the smallest anonymized sample
   that can exercise the pipeline (a handful of tickers, a few months of
   daily bars). Full history comes only after the loop is proven.
2. **Anonymization before transfer.** No personal or client-identifiable
   information. If we cannot verify anonymization, we do not accept the data.
3. **Pre-registered assumptions.** Strategy, universe, window, fee rate,
   slippage, claim, and rejection rule are written down *before* the run.
   Changing inputs after seeing the output starts a new case with a new ID —
   the old one is never edited.
4. **Falsification rule, not a beauty contest.** The claim must survive all
   (or a pre-declared subset of) predefined perturbations: higher fees,
   higher slippage, shifted dates, reduced universe, joint stress. A rule
   that cannot fail is not a rule.
5. **Preserved negative results.** A rejected verdict is published with the
   same completeness as an accepted one. See Case 001 (−7.75% baseline,
   0/5 variations passing, rejected) as the reference example.
6. **Evidence package, not a screenshot.** Every run exports: inputs, data
   fingerprint (SHA-256), software identity (repo commit), per-variation
   metrics, rule verdict, evidence ID, checksum.
7. **Review before publish.** The data provider reviews the report first.
   The public version is published only with written consent, in anonymized
   form.

## 3. The pilot loop (7 steps)

| # | Step | Output |
|---|------|--------|
| 1 | Agree on the question + rejection rule with the provider | One-page proposal (signed off by both sides) |
| 2 | Receive minimum-viable anonymized sample | Data fingerprint recorded |
| 3 | Freeze the configuration (strategy, universe, window, costs) | Config file, hashed |
| 4 | Run baseline + 5 predefined perturbations | Six result sets |
| 5 | Apply the falsification rule | Verdict: accepted / rejected |
| 6 | Provider reviews the draft report | Review note |
| 7 | Publish anonymized report + evidence package | Public URL in this directory |

Target cadence: steps 2–5 within one week of data receipt; step 7 within
two weeks.

## 4. What this collaboration is not

- Not an investment, financing, or angel round.
- Not forming a company.
- No investment advice, no live trading, no client solicitation.
- A research-and-education collaboration. Either side can stop at any step;
  work completed up to that point is still published as-is.

## 5. Pilot log

| Date | Partner (anonymized) | Data scope | Status |
|------|----------------------|------------|--------|
| 2026-09-25 | — | Methodology published (this document) | method only, no data yet |

*New rows are appended, never edited. A row that ends in "rejected" stays
rejected.*
