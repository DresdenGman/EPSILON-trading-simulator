# EPSILON Evidence Matrix

This file maps claims to concrete implementation evidence and limitations. It is not a claim that the whole application is production-ready.

## Observed flagship snapshot

Verification date: `2026-08-10`
Base Git commit: `390155760ba1dda8a47775fa9c67b2005045a43e`
Status: working tree contains the documented CSP-v1 and `/demo` changes; this snapshot must be regenerated after committing those changes.

| | Primary | Replication |
|---|---:|---:|
| Window | 2026-04-01 → 2026-07-01 | 2026-01-01 → 2026-03-31 |
| Baseline return | -0.57% | -0.61% |
| ε return | -0.58% | -0.62% |
| Trades | 11 → 11 | 16 → 16 |
| Local pattern | non-positive → non-positive / PRESERVED | non-positive → non-positive / PRESERVED |
| Cross-window result | — | REPLICATED |

The snapshot was produced through the read-only backtest path and rechecked in the browser. It is an observed result, not a value embedded in the UI source.

## Claim → evidence → limitation

| Claim | Evidence | Limitation |
|---|---|---|
| Backtests do not contaminate user accounts | `TradeManager(..., persist=False)` in `strategies/backtest_engine.py`; `tests/test_backtest_engine.py` | Applies to the experiment engine, not every account flow |
| Signals do not execute on the same information bar | Pending signals execute on the next trading day in `strategies/backtest_engine.py`; `tests/test_backtest_engine.py` | Simplified daily execution model |
| Demo backtests do not require PostgreSQL | Read-only startup handling in `backend/main.py`; browser `/demo` runtime check | Account and trading routes remain database-dependent |
| Synthetic history is reproducible | `CSP-v1` and SHA-256 seeds in `data/stock_data_manager.py`; `tests/test_stock_data_manager.py` | Synthetic data is not empirical market data |
| Prices form a continuous controlled path | Sequential close generation and prior-close-related open in `data/stock_data_manager.py`; continuity/OHLC tests | The model is intentionally simplified and weekday-only |
| Primary results are not hard-coded | Two real `/api/backtest` calls in `website/components/experiment/FlagshipDemo.tsx`; browser verification | One configured experiment |
| Replication is not selected after seeing its result | Fixed previous-quarter rule in `website/components/experiment/ReplicationCheck.tsx`; rule visible before execution | Only two windows |
| Negative results are retained | Current non-positive observed snapshot; dynamic sign-aware conclusion in `FlagshipDemo.tsx` | A negative result is not statistical evidence by itself |
| A conclusion can fail | `PRESERVED / REVERSED / INCONCLUSIVE` in `website/lib/experiment.ts`; Vitest cases | Binary sign rule is intentionally narrow |

## Why the negative result matters

Earlier synthetic generation produced independent daily price levels. After the controlled path was corrected to evolve sequentially, the result changed. EPSILON retained the new non-positive result instead of tuning the generator, strategy, dates, or ε to recover an earlier positive number.

The method changed → the result changed → the result was accepted.

## Questions this evidence does not answer

- Does momentum work in real markets? No conclusion here.
- Is the observed difference statistically or economically significant? Not tested here.
- Is the strategy generally robust? Not established.
- Are two windows enough to establish out-of-sample validity? No.
- Can the account architecture be considered fully consolidated? No; the wider application still has historical architecture debt.
