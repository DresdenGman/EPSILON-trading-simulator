# Demonstration run D1 — public-data method check

> Suggested repo path: `docs/PUBLIC_DATA_DEMONSTRATION_D1.md`
> Status: completed · Attempted 2026-09-25 (UTC) · Role: maintainer method demonstration
>
> **What this is:** the exact fixed case-001 configuration (strategy, universe,
> window, costs, perturbation definitions, falsification rule) executed with the
> repository's own engine code on **public Yahoo Finance data** instead of the
> provider feed. **What this is not:** a reproduction of case 001 — the data
> source differs, so numerical agreement is not expected and not claimed.

## Assumption list (fixed before the run)

| Input | Fixed value |
|---|---|
| Universe, in order | SPY, QQQ |
| Strategy | Momentum (2%) — 20-day lookback, 2% threshold; signals use information through the prior close; positions apply to the next close-to-close return |
| Baseline window | 2025-09-01 through 2026-02-27 |
| Fee rate | 0.0001 (per unit turnover) |
| Slippage | $0.01 per share |
| Falsification rule | Net total return strictly greater than 0 in **all five** perturbations; otherwise the claim is rejected |
| Perturbations | Fee ×5; slippage ×5; window +30d; narrow universe (SPY only); joint fee×5 + slippage×5 + window +30d |

Nothing was changed after observing the results.

## Data provenance

- Source: Yahoo Finance v8 chart API (public, no key), downloaded 2026-09-25
- Series: `adjclose` (split- **and** dividend-adjusted), daily bars
- Coverage: 2025-07-01 → 2026-04-15, 199 bars per symbol (includes the 45-day warm-up fetch the production pipeline uses)
- Raw file fingerprints (SHA-256):
  - `spy_yahoo.json`: `960d599b00fd8c7ac2637e3f134057e57e4e9eadf61c013229fae23d22c7e0c3`
  - `qqq_yahoo.json`: `d463916385d6d42ed54513d4a3523d6ca4f2fbed76b89b5b9b263da790467b0a`
- Engine data fingerprint (SHA-256 over canonical `[timestamp, close]` pairs, same scheme as the production evidence API): `8043ab5d4445d6b7d7669cc7cc0a049dbefbb26c58a463c296be1a182a3dce1a`

## Software identity

- Engine: `instrument/lib/backtest.ts` + `instrument/lib/evidence-contract.ts` copied verbatim from commit `b5ab906de286783c9f707ea55338b8d503edeed9`, with one disclosed edit: the module specifier `"./evidence-contract"` → `"./evidence-contract.ts"` in `backtest.ts` line 1 (required by Node ESM resolution; no logic change).
- Perturbation definitions and verdict logic copied exactly from `instrument/app/api/evidence/run/route.ts` and `evaluateEvidence`.
- Driver: local `run-demo.ts` (fetch/fee plumbing only; no strategy or statistics code of its own).

## Results — exact per-variation table

| Run | Changed assumption | Net return % | Sharpe | Max drawdown % | Ann. vol % | Obs. | Turnover | Cost % | Rule check |
|---|---|---:|---:|---:|---:|---:|---:|---:|:---:|
| Baseline | None | **−8.53** | −2.049 | −10.59 | 8.66 | 124 | 26.000 | 0.301 | — |
| epsilon-1 | Fee ×5 | −9.48 | −2.291 | −11.34 | 8.67 | 124 | 26.000 | 1.341 | fail |
| epsilon-2 | Slippage ×5 | −8.68 | −2.086 | −10.71 | 8.66 | 124 | 26.000 | 0.463 | fail |
| epsilon-3 | Window +30d | −9.31 | −2.342 | −10.59 | 8.40 | 123 | 22.000 | 0.254 | fail |
| epsilon-4 | Narrow universe (SPY) | −7.03 | −2.005 | −8.10 | 7.26 | 124 | 30.000 | 0.345 | fail |
| epsilon-5 | Joint stress | −10.23 | −2.588 | −11.46 | 8.40 | 123 | 22.000 | 1.272 | fail |

## Verdict

- Survival: **0/5** perturbations. Worst case −10.23% (joint stress). Largest sensitivity −1.70pp (joint stress vs baseline). Nearest failure −7.03% (narrow universe).
- **Verdict: `rejected`.** The claim "positive net total return in all five perturbations" does not hold on this data either.

## Comparison with case 001 (context, not a claim)

The maintainer's provider-data observation for case 001 was −7.75% baseline, 0/5, rejected. This public-data run gives −8.53% baseline, 0/5, rejected — the same qualitative outcome (negative baseline, rejected verdict) from an independent public source. The 0.78pp gap is consistent with vendor differences: Massive vs Yahoo adjustment methodologies, and provider-adjusted bars changing over time. Per `REPRODUCIBILITY.md`, this is a same-method/different-data run, not an independent reproduction of case 001.

## Limitations

- Not a reproduction of case 001 (different data vendor and adjustment methodology).
- The shifted window overlaps the baseline; it is not out-of-sample replication.
- Two large US ETFs: selection and survivorship bias remain.
- Adjusted daily close-to-close bars do not model intraday liquidity, market impact, taxes, borrow constraints, or partial fills.
- Yahoo's historical bars can be revised; a later download may differ — the fingerprints above pin this run.

## What this demonstrates

The full EPSILON loop — fixed inputs, six runs, falsification rule, evidence fingerprint — executes end-to-end on third-party public data and reports a negative result without modification. The pipeline is ready to run unchanged the day external sample data arrives.

## Reproduce this run

1. Download SPY/QQQ daily `adjclose` for 2025-07-01→2026-04-15 from the Yahoo Finance v8 chart API; verify the raw SHA-256 fingerprints above.
2. Copy `instrument/lib/backtest.ts`, `evidence-contract.ts`, `build-info.ts` from commit `b5ab906` (adjust the one module specifier for Node ESM).
3. Build the six run configs exactly as in `instrument/app/api/evidence/run/route.ts`; run `runBacktest` per config; evaluate with `evaluateEvidence` under rule `{metric: "net_return", operator: "gt", threshold: 0, perturbationScope: "all"}`.
4. Compare your per-variation table and data fingerprint with this report; report mismatches as an issue.
