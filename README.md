# EPSILON
### Build a model. Question its conclusions.

**Economics · mathematical modeling · open-source research systems**

[Explore the project](https://epsilonfield.space) · [Open the lab](https://epsilonfield.space/lab) · [Bring a question](https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8) · [Inspect the evidence](docs/REFERENCE_CASE.md)

EPSILON is a quantitative decision lab built by **Dresden E. Goehner**, with open-source contributions. It turns a market idea into an explicit claim, tests nearby assumptions, and preserves the evidence—even when the claim fails.

The project began as a Python trading simulator in the repository's December 2025 records. It has evolved into a public, no-login evidence instrument. The central question is no longer simply **“What return did this strategy produce?”** but **“Which assumptions does that conclusion depend on, and what would make us reject it?”**

| At a glance | |
|---|---|
| **Recognition** | **Third Prize — 2026 Diamond Challenge Beijing Pitch Event**. Regional recognition; not a global placement. [Certificate and provenance](docs/RECOGNITION.md). |
| **Current product** | A claim, a pre-specified rejection rule, one baseline and five perturbations, and an exportable evidence artifact. |
| **Recorded result** | Fixed case 001: baseline **−7.75%**, **0/5** perturbations passing, **Rejected**. A maintainer observation, not an independent reproduction. |
| **Open participation** | Submit a question, attempt a reproduction, challenge an assumption, or adapt the small-group clinic kit. |
| **Boundaries** | Educational research; no real-money execution, personalized investment advice, or profitability guarantee. |

**Navigate:** [Problem](#why-this-exists) · [Method](#what-the-instrument-does) · [Evidence](#a-negative-result-worth-preserving) · [Timeline](#development-and-recognition) · [Participate](#help-shape-the-work) · [Architecture](#project-map) · [Run locally](#run-and-verify) · [Limits](#limits-and-next-steps)

## Why this exists

A backtest is an argument built on choices: assets, dates, signal timing, fees, execution assumptions, and a rule for judging the result. A convincing curve does not make those choices reliable.

EPSILON connects three disciplines:

| Discipline | Its role in the project |
|---|---|
| **Economics** | Make frictions and decision constraints explicit: costs, execution, and the question being measured. |
| **Mathematics** | Specify a rejection rule and compare outputs under controlled perturbations. Distinguish local sensitivity from a general robustness claim. |
| **Systems engineering** | Keep the claim, inputs, computation, provenance, software identity, and exported result connected. |

This is a system for inspecting a conclusion, not an AI oracle for predicting markets.

## What the instrument does

```text
Define a claim and rejection rule
               ↓
Run baseline + four individual stresses + one joint stress
               ↓
Inspect metrics, verdict, changed inputs, and provenance
               ↓
Export → reproduce or challenge → revise without erasing the original
```

1. **Define:** select the strategy, universe, dates, fees, slippage, and rejection rule before running.
2. **Compare:** inspect five nearby alternatives alongside the baseline. In fixed case 001 these test higher fees, higher slippage, a shifted window, a reduced universe, and a joint stress.
3. **Inspect:** read the verdict with the actual metrics, data mode, limitations, and source identity.
4. **Export and challenge:** retain the evidence artifact and fingerprints; report agreement, a mismatch, or an inability to reproduce.

### Two data modes, never interchangeable

| Mode | What it means | What it does not establish |
|---|---|---|
| **Browser demonstration** | Deterministic illustrative arithmetic for learning the workflow. | Historical market performance or empirical validation. |
| **Historical mode** | Server-side retrieval of adjusted daily market bars, subject to provider configuration, access, and limits. | Real-time execution, licensed redistribution of raw data, or a profitable strategy. |

A failed historical request is not silently replaced with synthetic data. The +30-day shifted window overlaps the baseline: it is a sensitivity test, **not independent out-of-sample validation**. A local fingerprint is not third-party preregistration.

[Method and system disclosure](https://epsilonfield.space/status) · [Reproduction instructions](docs/REPRODUCIBILITY.md) · [Build and evidence identity](docs/RELEASE_IDENTITY.md)

## A negative result worth preserving

**Fixed historical case 001 — maintainer observation recorded September 13, 2026**

| Configuration / outcome | Record |
|---|---|
| Universe and strategy | SPY / QQQ; Momentum (2%) |
| Baseline dates | September 1, 2025–February 27, 2026 |
| Rejection rule | Reject unless net return is positive in all five predefined perturbations |
| Baseline net return | **−7.75%** |
| Perturbations passing | **0 / 5** |
| Verdict | **Rejected** |

The baseline was already negative. This is **not** a profitable strategy overturned by stress testing, a proof that all momentum fails, or an external reproduction. Its value is that the inputs and unfavorable result remain inspectable.

**[Inspect case 001, the source record, and reporting template →](docs/REFERENCE_CASE.md)**

## Development and recognition

Dates below describe documented milestones, not undocumented inception dates. [Full timeline and source links](docs/PROJECT_HISTORY.md).

| Date | Milestone | Evidence |
|---|---|---|
| **December 9, 2025** | Python desktop simulator: order handling, performance metrics, and equity curves. | [Source record](https://github.com/DresdenGman/EPSILON-trading-simulator/commit/fc81b85) |
| **January–February 2026** | EPSILON branding, web presentation, and reorganized strategy/analysis modules. | [Branding commit](https://github.com/DresdenGman/EPSILON-trading-simulator/commit/9e06432) |
| **March 2026** | **Third Prize, Diamond Challenge Beijing Pitch Event.** Event scheduled March 7; award certificate emailed March 13. | [Original certificate and context](docs/RECOGNITION.md) |
| **June 14, 2026** | FastAPI/PostgreSQL and Next.js full-stack implementation. | [Source record](https://github.com/DresdenGman/EPSILON-trading-simulator/commit/9579fc9) |
| **August 10–13, 2026** | Quantitative decision lab: hypotheses, experiments, public documentation, and evidence records. | [Source record](https://github.com/DresdenGman/EPSILON-trading-simulator/commit/0560eac) |
| **August 30–September 2, 2026** | Current evidence instrument: baseline plus perturbations, export, historical-data path. | [PR #15](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/15) |
| **September 7–13, 2026** | Contributor-led checks/reporting improvements, fixed case, build identity, reproduction guidance, and English-language cleanup. | [PR #22](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/22) · [#23](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/23) · [#24](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/24) · [#26](https://github.com/DresdenGman/EPSILON-trading-simulator/pull/26) |

<details>
<summary><strong>View the Diamond Challenge certificate</strong></summary>

The certificate names Dresden Goehner and states “THIRD PRIZE.” The organizer's March 13, 2026 email to Team EPSILON establishes the Beijing event context. The certificate itself does not print a date or location. This recognition does not establish endorsement of later software versions or trading performance.

<img src="instrument/public/evidence/diamond-challenge-2026-beijing-third-prize.jpg" alt="Certificate awarding Dresden Goehner Third Prize in Diamond Challenge" width="480">

</details>

## Help shape the work

**You do not need to write code to contribute.** Start with a backtest conclusion you do not fully trust.

| Contribution | Smallest useful first step | Where |
|---|---|---|
| **Bring a question** | State the claim, what worries you, and an optional public example. | [Discussion #8](https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8) · [Question guide](docs/community/BRING_A_QUESTION.md) |
| **Try the fixed case** | Report agreement, a mismatch, or a blocked attempt. | [Case 001](docs/REFERENCE_CASE.md) |
| **Challenge the method** | Identify a specific assumption or unsupported inference. | [Issue templates](https://github.com/DresdenGman/EPSILON-trading-simulator/issues/new/choose) |
| **Host a short clinic** | Use the worksheet with a small group; discuss which conclusion the evidence supports. | [Assumption Clinic kit](docs/community/ASSUMPTION_CLINIC.md) |
| **Improve the software** | Propose a scoped correction and a verification path. | [Contributing](CONTRIBUTING.md) |

**First-round goal:** work through three concrete questions in public, with a documented result or blocker and an opportunity for the questioner to respond. This is a proposed pilot, not a claim that three cases or teaching sessions have already happened. Questions outside the instrument's scope may become documented limitations rather than promised features.

Do not post API keys, brokerage credentials, personal account data, or material you lack permission to share. Participation requires no star, endorsement, or favorable review.

### How progress is counted

Repository stars and forks indicate **attention**, not beneficiaries. Anonymous browser sessions are not distinct people. Server-completed configurations are not automatically independent reproductions. Public feedback, resulting changes, and external reuse require separate evidence.

[Live impact record](https://epsilonfield.space/impact) · [Independent review log](docs/INDEPENDENT_REVIEW_LOG.md)

We distinguish **planned → submitted → reviewed → tested → changed → independently reused**, with links where available. EPSILON records are not combined with other projects' contacts, participants, or outcomes.

## Project map

```text
instrument/        Current public product: React / TypeScript / Vinext on Sites
  app/             /, /lab, /impact, /status, and server API routes
  lib/             Experiment logic, provenance, and supporting services
  public/evidence/ Public award evidence
docs/              Method, reproduction, history, recognition, community guides
.github/           CI checks and contribution/reporting forms

website/           Earlier Next.js web implementation (historical)
backend/           Earlier FastAPI implementation (historical)
analysis/          Original Python analysis modules
strategies/        Original strategy modules
trading/ + ui/     Original desktop simulator
```

The historical implementations remain available in the original repository; they are not separate current products. [Architecture](docs/PRODUCT_ARCHITECTURE.md) · [Documentation index](docs/README.md)

## Run and verify

Prerequisites: **Node.js 22.13+ and npm**.

```bash
cd instrument
npm ci
npm run dev
```

The demonstration requires no user account. Historical mode needs the server-side configuration described in the [reproduction guide](docs/REPRODUCIBILITY.md). Never place provider secrets in client code or public issues.

```bash
cd instrument
npm run check
npm run build
# From the repository root:
python3 utils/check_english.py
```

Checks cover signal timing, execution costs, perturbations, rule evaluation, hashes, build identity, fixed-case inputs, and request/telemetry boundaries. Passing tests establish implementation behavior—not independent empirical validation. [Archived Python/web instructions](docs/legacy/REPRODUCIBILITY_PRE_INSTRUMENT.md).

## Limits and next steps

**Current limits:** a small set of strategies and predefined stresses; overlapping windows; provider-dependent historical access; no proof of general robustness; no personalized advice or live-money trading.

**Next-stage goals, not completed outcomes:**

- Work through the first three scoped community questions.
- Publish a feedback-led correction with the original question and verification attached.
- Pilot a short assumption clinic and record what participants actually did.
- Make a session reusable by another host and document any confirmed reuse separately.

These goals focus on useful, inspectable work rather than treating visibility as validation.

<details>
<summary>Historical media and release assets</summary>

The [August 2026 v2.0 film](https://github.com/DresdenGman/EPSILON-trading-simulator/releases/download/v2.0.0/epsilon-decision-lab-30s.mp4), [release notes](https://github.com/DresdenGman/EPSILON-trading-simulator/releases/tag/v2.0.0), and [earlier screenshots](docs/screenshots/) document an earlier interface, not the current product. Dated launch materials should be checked against today's method and limitations before reuse.

</details>

## Credit, citation, and license

Created and maintained by **Dresden E. Goehner**. Contributor work remains credited through the original commits and pull requests. Methodological criticism, failed attempts, and negative findings are welcome.

For citations, use [CITATION.cff](CITATION.cff) and identify the exact revision or release used. **MIT license**; see [LICENSE](LICENSE).
