# EPSILON Historical Validation Protocol

Status: `PRE-REGISTERED / NOT YET EXECUTED`
Scope: EPSILON's first future validation against a frozen historical-market dataset

> This protocol defines EPSILON's first historical-market validation before observing its results. No historical result is reported in this document.

This is a research-governance artifact, not a claim that the current synthetic experiment has become historical evidence.

## A. Research question

Does the conclusion pattern observed in EPSILON's controlled experiment survive when the same experimental logic is applied to a frozen historical-market dataset?

This is deliberately narrower than:

- Does momentum beat the market?
- Is the strategy profitable?
- Can this strategy predict prices?

The empirical stage is not a new alpha-research claim. It tests whether the project's controlled perturbation method and conclusion pattern survive a change in data source.

## B. Claim boundary

### Method claim already supported by the synthetic stage

EPSILON can run a controlled, reproducible perturbation experiment with a pre-specified falsification rule, retain negative results, and repeat the protocol on a separate window.

### Empirical question not yet answered

Does the same conclusion survive on a frozen historical dataset?

These claims must remain separate. Until the protocol is executed, the historical stage has no result.

## C. Pre-commitment table

The following decisions must be frozen before historical data is inspected for a result. Any change creates a new protocol version.

| Decision | Pre-registered value |
|---|---|
| Strategy | Existing EXP-001 flagship momentum strategy |
| Strategy parameters | Exact current values at the protocol commit |
| Universe | `AAPL`, `MSFT`, `NVDA` |
| Capital | `$100,000` |
| Data frequency | Daily bars |
| Data source | One named provider and one immutable snapshot, recorded before execution |
| Price convention | Provider's documented adjusted/unadjusted convention, recorded before execution |
| Baseline friction | `$0.010/share` |
| Perturbed friction | `$0.020/share` |
| ε | `+$0.010/share` |
| Signal timing | Signal on day `t` executes no earlier than day `t+1` |
| Fees and fills | Identical between baseline and +ε except for the locked friction change |
| Decision input | Sign of total return |
| Falsification rule | A valid sign reversal between baseline and +ε |
| Primary window | One fixed historical window recorded before execution |
| Replication window | One non-overlapping window selected by a written rule before execution |
| Missing data | Missing or invalid required data makes the run `INCONCLUSIVE` |

The exact current strategy parameter values, provider, snapshot identifier, and dates must be filled in and committed before the first historical run. This document intentionally does not invent them in advance.

## D. Validity and falsification

The comparison is valid only if baseline and +ε use the same data snapshot, strategy, universe, capital, fees, execution timing, and window.

- `PRESERVED`: both valid total returns have the same sign.
- `REVERSED`: both runs are valid and the total-return sign changes.
- `INCONCLUSIVE`: a run fails, required data is missing, or the locked comparison cannot be made.

The historical stage must not report `PASSED`, `FAILED`, `PRESERVED`, or `REPLICATED` before execution. A negative return is not an experiment failure. A sign reversal is evidence against the narrow robustness claim; these are different statements.

## E. Freeze rule

After the first historical result is visible, do not change:

- the window, universe, strategy, or parameters;
- ε, fees, fill assumptions, or execution timing;
- the data provider, snapshot, adjustment convention, or missing-data policy;
- the decision metric or sign-based falsification rule;
- the interpretation by adding a post-result threshold or success score;
- the number of windows tested while hiding unfavorable windows.

If any locked decision changes, label the work as a new protocol version and do not present it as the same experiment.

## F. Required audit record

Before execution, record:

1. protocol version, commit identifier, and timestamp;
2. data provider, immutable snapshot identifier, adjustment convention, and missing-data policy;
3. exact strategy parameters, universe, capital, fees, execution timing, baseline friction, and ε;
4. primary and replication window-selection rules;
5. the exact falsification condition;
6. the strongest expected counterargument.

After execution, append results without rewriting the pre-commitment section:

- baseline and +ε total return and signs;
- `PRESERVED`, `REVERSED`, or `INCONCLUSIVE` outcome;
- trade counts as secondary context;
- data-quality or execution failures;
- what the result does and does not establish.

## G. Strongest counterargument

The first historical window may be favorable, the data may contain survivorship or adjustment artifacts, or the friction perturbation may be too small to be economically meaningful. A rule-based replication and an explicit data-quality record address part of this objection; they do not prove profitability, statistical significance, predictive power, or general robustness.

## H. Acceptance tests for the future implementation

### 10 seconds

An unfamiliar viewer understands that EPSILON is testing whether one conclusion changes when one assumption is slightly perturbed. They do not primarily describe it as a stock simulator.

### 30 seconds

The viewer can identify baseline friction, `+$0.010/share` ε, and the fact that a valid sign reversal would falsify the narrow claim.

### 90 seconds

The viewer understands that the replication window exists to challenge whether the primary historical window was selected favorably.

### 3 minutes

The presenter can show the pre-registered protocol, explain the claim boundary, run the primary and replication comparisons after authorization, state the result, and immediately state its limitation without changing the rules mid-demo.

## Explicit non-goals

This protocol does not authorize or claim:

- historical validation before a real data run exists;
- profitability, statistical significance, predictive performance, or general robustness;
- a new metric, robustness score, chart system, or additional experiment;
- changes to CSP-v1 or the current synthetic EXP-001 result;
- tuning the strategy, dates, universe, or ε to obtain a preferred outcome.

The next phase is meant to make the future test harder to move—not to make the current result look better.
