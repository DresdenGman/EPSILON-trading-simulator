# Feedback-to-Change Log

This log shows how EPSILON handles criticism after it is received. It records the question, the maintainer's decision, the change, and what was actually verified. It does **not** turn a private submission into a public testimonial, an independent reproduction, or a measured learning outcome.

## How records enter this log

1. Keep the original submission and its receipt private unless the contributor explicitly permits sharing. Never publish receipt tokens, contact details, or identifiable quotations from a private response.
2. Summarize the *technical theme* in the maintainer's own words. Similar themes may appear in multiple submissions; a theme is not a count of people.
3. Give each theme a disposition: `accepted`, `needs experiment`, `not accepted`, or `duplicate`. State why.
4. Link the resulting issue, document, release, or public page. Separate a proposed fix from a tested change and a deployed change.
5. Record what remains unresolved. Add a later follow-up rather than rewriting an earlier decision.

As of September 25, the live database contains **four anonymous activity submissions**, all with public quotation permission off. That is a count of submissions, **not** a verified count of distinct people. All four private receipt statuses remain `received`, with no direct maintainer response recorded. The entries below therefore paraphrase technical concerns, not individual responses or conversations.

## Case 001: make a failed backtest inspectable

**Input:** Private, no-registration submissions through the [participation page](https://epsilonfield.space/participate), reviewed September 2026. Original responses remain private. The source case and maintainer's recorded values are public in the [fixed-case report](REFERENCE_CASE.md) and [original maintainer report](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/24#issuecomment-5652344901).

| Theme, paraphrased | Disposition and reason | Action and public evidence | Status / remaining limit |
|---|---|---|---|
| The baseline was already negative; a summary of `0/5` alone could suggest that a profitable strategy failed only after stress testing. | **Accepted.** The −7.75% baseline must appear beside the pass rule. | The [participation page](https://epsilonfield.space/participate) now says the baseline was already negative and displays it next to the five stress outcomes. | **Deployed.** This corrects the presentation, not the underlying result. |
| Stress magnitudes and individual outcomes were hard to inspect from the activity. | **Accepted.** A participant should be able to judge each changed assumption, not infer it from `0/5`. | A six-row table now lists the baseline plus higher fees, higher slippage, shifted dates, SPY-only universe, and joint stress, with each recorded net return. Values are attributed to the [September 13 maintainer report](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/24#issuecomment-5652344901). | **Deployed.** These are maintainer-reported historical results, not new calculations on the page. |
| “Not established” did not let a participant distinguish unsupported claims from claims directly contradicted by the record. | **Accepted.** The two judgments have different evidentiary meanings. | The activity now offers `supported`, `contradicted`, `not established`, and `unclear`, each with a short definition. The submission validator accepts the new choice while preserving earlier answer values. | **Deployed and tested.** Earlier submissions were not rewritten. |
| A rerun of the hosted instrument could be mistaken for independent recomputation. | **Accepted.** Repeating one pipeline does not independently check the calculation. | The activity now explains that an independent researcher would need a separate calculation using equivalent source data and a comparison of inputs and outputs. | **Deployed as guidance.** No independent recomputation is claimed. |
| The related-ETF universe and overlapping shifted window limit generalization. | **Needs experiment.** A copy change cannot create out-of-sample evidence or remove selection effects. | The [case report](REFERENCE_CASE.md) and activity disclose these limitations. | **Open.** A new, separately specified case and independent data/calculation would be needed; do not relabel the existing result as out-of-sample. |

### Change and verification record

| Date | Stage | Evidence |
|---|---|---|
| September 13, 2026 | **Recorded** | [Original maintainer report](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/24#issuecomment-5652344901): baseline −7.75%; fee ×5 −8.67%; slippage ×5 −7.89%; shifted window −8.35%; SPY only −7.22%; joint stress −9.24%; 0/5 passing. This was not an independent reproduction. |
| September 24–25, 2026 | **Received and reviewed for product decisions** | Three anonymous activity submissions were inspected and grouped by technical theme. No individual quotation was authorized; the private receipt statuses have not been advanced or replied to. |
| September 25, 2026 | **Changed and tested** | The participation page and validator were revised. All 21 site tests, type checks, lint checks, and the production build passed. A regression test checks the new `contradicted` answer alongside earlier answer values. |
| September 25, 2026 | **Deployed** | Public [participation page](https://epsilonfield.space/participate), Sites release **version 11**, source revision `55d6dd1935667851aa3e2e64457b9353d7d30d49`. The release changes explanation and response choices; it does not add a new market-data experiment. |

**Outcome boundary:** A more inspectable task and compatible submission flow were delivered. Direct follow-up to the private contributors remains open. We have not measured whether participants learned more, whether reviewers independently reproduced the case, or whether this change increased external adoption. Those outcomes require separate evidence.

## September 25 follow-up: execution identity and comparison criteria

A fourth anonymous activity submission used the new `contradicted` answer for statements 2 and 4 and raised a further technical concern. This shows that the revised options were used in **one submission**; it does not establish improved learning or a distinct new person. The response is private and is paraphrased below.

| Theme, paraphrased | Disposition and reason | Next action | Status |
|---|---|---|---|
| Six reported returns appear on the activity page without the run timestamp, data fingerprint, and artifact checksum needed to inspect their common execution identity. | **Accepted as a provenance gap.** The [original maintainer report](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/24#issuecomment-5652344901) contains a run timestamp, evidence ID, and artifact checksum, but the review page does not show them. A data fingerprint for that observation has not been established by the public record. | [Issue #32](https://github.com/DresdenGman/EPSILON-trading-simulator/issues/32) tracks displaying or linking only existing fields and explicitly marking missing fields. It also asks whether the six outcomes can be tied to one data snapshot. | **Open; not deployed.** No new provenance claim is made. |
| “Equivalent source data” and a matching result have no predeclared operational definition for an independent recomputation. | **Needs protocol and comparison test.** A different vendor's adjusted bars, matching verdict, or close-looking return is not automatically reproduction of case 001. | [Issue #32](https://github.com/DresdenGman/EPSILON-trading-simulator/issues/32) tracks the data-equivalence contract and a justified numerical comparison rule set before seeing a candidate result. | **Open.** No independent reproduction is claimed. |

The public-data [D1 demonstration](PUBLIC_DATA_DEMONSTRATION_D1.md) uses another data source and stays separate from the provider-data case 001. It does not close either issue above. This follow-up has been **received and triaged**, not replied to through the private receipt, implemented, tested, or deployed.

## Add the next record

For future feedback, append a dated section with: source channel and privacy permission; technical theme (paraphrased if private); disposition and rationale; issue/change link; test result; deployment status; contributor follow-up status; and unresolved questions. Keep `received`, `reviewed`, `changed`, `tested`, and `deployed` as distinct states. Public, attributable independent challenges belong in the separate [Independent Review Log](INDEPENDENT_REVIEW_LOG.md) only if its counting rules are met.
