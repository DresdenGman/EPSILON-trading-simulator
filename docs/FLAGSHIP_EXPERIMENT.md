# EXP-001 — Flagship Experiment Protocol

This document is the protocol, not a marketing description. The protocol is fixed before the observed result is interpreted.

## Research question

Does the sign of a momentum strategy's total return remain unchanged after a small increase in execution slippage?

## Controlled configuration

| Variable | Fixed value |
|---|---|
| Strategy | `momentum` / Momentum (2%) |
| Universe | `AAPL`, `MSFT`, `NVDA` |
| Initial capital | `$100,000` |
| Fee rate | `0.0001` |
| Minimum fee | `$1.00` |
| Baseline slippage | `$0.01/share` |
| Perturbed slippage | `$0.02/share` |
| ε | `+$0.01/share` |
| Market model | `CSP-v1` controlled synthetic path |
| Calendar | Weekdays only; US holidays are simplified |

## Primary protocol

`2026-04-01 → 2026-07-01`

Two real `/api/backtest` calls use identical configuration. Only `slippage_per_share` changes.

Signals generated with information through day `t` execute on the next available trading day (`t+1`). The backtest uses an isolated, non-persistent experiment account.

## Decision rule

The rule is deliberately narrow and pre-specified:

- `positive → positive`: `PRESERVED`;
- `non-positive → non-positive`: `PRESERVED`;
- either sign changes: `REVERSED`;
- either run has no executed trades or is incomplete: `INCONCLUSIVE`.

Sharpe, drawdown, trade count, and Δ return describe the evidence. They do not change the decision rule after observing the result.

## Pre-specified replication

`2026-01-01 → 2026-03-31`

Selection rule: immediately preceding non-overlapping calendar quarter. This rule was selected before observing the replication result. The protocol is identical to the primary experiment except for the date window.

The cross-window verdict is `REPLICATED` only when both valid windows have the same baseline sign, perturbed sign, and local sensitivity outcome. Otherwise it is `NOT REPLICATED`; incomplete runs are `INCONCLUSIVE`.

## What would falsify the conclusion?

For the current observed pattern, a valid replication that changes the return direction or reverses the ε conclusion would fail the cross-window replication check. That failure is evidence, not a reason to change the window or tune the generator.

## Scope and limits

This experiment does not establish historical market validity, statistical significance, profitability, general robustness, or predictive performance. CSP-v1 is an intentionally simple deterministic instrument for studying experimental sensitivity. A future historical-data snapshot could use the same protocol, but that is not part of this experiment.
