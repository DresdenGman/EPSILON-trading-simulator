# EPSILON Assumption Clinic

**Status: pilot format, not a completed or evaluated educational program.**

> **Revision note — v2 (2026-09-26):** revised in response to feedback themes from the April 2026 workshop (school AA club — Applied Mathematics and AI; 26 attendees total across 2 sessions, 40 minutes each; 5 feedback forms, first batch, lightly edited afterwards). The v2 additions below are optional; the core 25-minute worksheet is unchanged.

A 25-minute small-group session for inspecting one market claim. The goal is to distinguish what a result shows from what a person hopes it shows—not to discover a profitable trade.

## Who can use it

A student club, educator, or small study group can adapt this worksheet. No coding or financial account is needed. The example is [fixed case 001](../REFERENCE_CASE.md); hosts may also use a public question from [Discussion #8](https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8). Do not describe a group as a partner unless that relationship has been agreed.

## Session outline

| Time | Activity | Record |
|---|---|---|
| 0–4 minutes | Read the claim and identify what would make it fail. | One explicit rejection rule. |
| 4–9 minutes | List the chosen universe, dates, fees, signal timing, and execution assumptions. | One assumption the group wants to inspect. |
| 9–16 minutes | Inspect the recorded case or run the lab if historical access is available. | Mode, inputs, observed outputs, and any blocker. |
| 16–22 minutes | Compare the conclusion before and after inspecting the assumptions. | A revised inference, or a reason it did not change. |
| 22–25 minutes | Write one remaining question and one limitation. | A short report the group may choose to share. |

If data access fails, use the documented case and label the activity **case discussion**, not a completed historical run. Browser demonstration arithmetic is not market evidence.

## Worksheet

```text
Claim:
What would make us reject it:
Inputs and assumptions:
Assumption we inspected:
Evidence mode (recorded case / demonstration / historical run):
Observed result or blocker:
What the evidence supports:
What it does NOT support:
Our revised conclusion (or why unchanged):
Remaining question:
Revision / artifact link, if any:
```

### A worked reasoning boundary

Case 001 records a −7.75% baseline and 0/5 perturbations passing. It supports rejection under that case's stated rule. It does not show that a profitable baseline collapsed under stress, that all momentum strategies fail, or that a participant independently recomputed the result.

### Why five perturbations?

The five are fixed by design: fee ×5, slippage ×5, window +30d, narrow universe (SPY only), and a joint stress combining them. They cover the three places backtests most often break — costs, data/window choices, and concentration — while staying small enough to run and discuss in 25 minutes. The number five is a teaching constraint, not a statistical one; it is not exhaustive.

**Your 6th:** define one more perturbation your group cares about (e.g., a different fee model, a crisis-only window). Write it down *before* seeing any results, then note whether it would have changed the verdict.

### Optional second case: public-data demonstration D1

The exact case-001 configuration (strategy, universe, window, costs, perturbation definitions, falsification rule) run with the repository's engine code (commit `b5ab906`) on **public Yahoo Finance data** instead of the provider feed. Results: baseline **−8.53%**, **0/5** perturbations passing, verdict **rejected**. Full table: [PUBLIC_DATA_DEMONSTRATION_D1.md](../PUBLIC_DATA_DEMONSTRATION_D1.md); machine-readable results: [demo-run-d1.json](../demo-run-d1.json).

Honest label: this is an **independent data-source method demonstration, NOT a reproduction of case 001** — the data source differs, so numerical agreement is not expected and not claimed. Use it as a second worked example for the worksheet, or to discuss what "same method, different data" does and does not prove.

### Optional 10-minute rerun exercise

For groups that want to touch the evidence directly (no trading account needed):

1. Open the D1 results table and the machine-readable `demo-run-d1.json`. (3 min)
2. Pick any two runs and check that the JSON values match the published table. Note the data fingerprint `8043ab5d…`. (4 min)
3. Discuss: what would you need to *fully* rerun this yourself — the data download, the engine code at commit `b5ab906`, the perturbation definitions? What is the weakest link in that chain? (3 min)

This is an artifact inspection, not a full recomputation. If your group completes a genuine independent rerun, file it with the issue template — that becomes a **Reused** record.

### What this does NOT cover

- **Multiple testing / data snooping:** this worksheet inspects one predeclared case. It does not adjust for trying many strategies and reporting only the best. Discussion: if a researcher tested 50 strategies and showed you the winner, which parts of this worksheet still apply, and which break?
- **Regime change and live-vs-backtest gaps:** a backtest that survives all five perturbations can still fail live. Discussion: name one assumption (e.g., "fees stay constant", "I can trade at the close") that no historical perturbation can fully test.

### No passing case yet — design your own

April participants asked to see a case that *passes*. We will not invent one: a fabricated positive example would teach the wrong lesson. Instead, use this open exercise: pick a strategy and market you expect to survive, write down the claim and the rejection rule **before** running anything, then test it with the same five perturbations. If it passes, you have a genuine positive example to share back. If it fails, you have learned something cheaper than a live account would teach you.

## Optional report back

Share only with participants' permission. A useful report includes the session date, format, aggregate attendance if actually recorded, the worksheet result, and one suggestion. Do not publish students' names or identifiable responses without appropriate consent. No testimonials are required.

Separate these records:

- **Planned:** a host intends to use the kit.
- **Held:** the host confirms the session occurred.
- **Completed activity:** a worksheet or experiment was actually completed.
- **Feedback:** a specific observation was submitted.
- **Changed:** that feedback led to a linked correction or revision.
- **Reused:** another host confirms a separate use of the kit.

Downloading the kit, opening a page, and receiving an invitation do not establish any of those outcomes. An informal before/after worksheet is not a controlled learning-effect study.

## Reuse and credit

Adapt under the repository's MIT license and identify the revision used. Credit contributors accurately, retain unfavorable results, and never require a star or endorsement. [Contributing guide](../../CONTRIBUTING.md).
