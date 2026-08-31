# EPSILON — Quantitative Decision Lab

<p align="center">
  <a href="https://epsilonfield.space">
    <img src="website/public/social/epsilon-social-preview-v1.jpg" alt="EPSILON — Quantitative Decision Lab" width="100%">
  </a>
</p>

<p align="center">
  <a href="https://epsilonfield.space/lab"><strong>Open Decision Lab</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/DresdenGman/EPSILON-trading-simulator/releases/download/v2.0.0/epsilon-decision-lab-30s.mp4"><strong>Watch the 30-second film</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/DresdenGman/EPSILON-trading-simulator/releases/tag/v2.0.0"><strong>Explore v2.0</strong></a>
  &nbsp;·&nbsp;
  <a href="https://epsilonfield.space/impact"><strong>Public impact ledger</strong></a>
</p>

> Build a market idea. Test it. Then try to break it.

I first built EPSILON as a trading simulator. I have since reworked it into a decision lab focused less on producing an answer than on testing how much that answer deserves to be trusted.

EPSILON is a research environment for turning market ideas into explicit, testable claims. It combines simulated market observation, strategy testing, evidence provenance, and structured critique in one repeatable decision cycle:

`Observe → Frame a hypothesis → Test → Interrogate → Refine → Retest`

EPSILON is not a trading recommendation engine. Its purpose is to make assumptions visible, preserve failed or negative evidence, and show exactly when a result no longer matches the question being asked.

## See the product

<p align="center">
  <a href="https://github.com/DresdenGman/EPSILON-trading-simulator/releases/download/v2.0.0/epsilon-decision-lab-30s.mp4">
    <img src="docs/media/epsilon-demo-30s/epsilon-decision-lab-30s-poster.jpg" alt="Watch the EPSILON 30-second product film" width="100%">
  </a>
</p>

<p align="center"><em>Click the image to watch the 30-second product film.</em></p>

<table>
  <tr>
    <td width="50%">
      <a href="https://epsilonfield.space">
        <img src="docs/screenshots/landing.png" alt="EPSILON public landing page">
      </a>
    </td>
    <td width="50%">
      <a href="https://epsilonfield.space/lab">
        <img src="docs/screenshots/strategy-lab.png" alt="EPSILON Strategy Lab">
      </a>
    </td>
  </tr>
  <tr>
    <td align="center"><strong>One clear research path</strong><br><sub>Understand the idea and enter the workspace.</sub></td>
    <td align="center"><strong>Evidence stays attached</strong><br><sub>Inspect inputs, metrics, trades, and boundaries together.</sub></td>
  </tr>
</table>

## Start here

| Surface | Purpose |
|---|---|
| [`/`](https://epsilonfield.space) | Understand the perturbation method and enter the instrument |
| [`/lab`](https://epsilonfield.space/lab) | Define a claim and rejection rule, run six nearby experiments, and export evidence |
| [`/impact`](https://epsilonfield.space/impact) | Separate anonymous reach, use, external challenge, and feedback-led change |
| [`/status`](https://epsilonfield.space/status) | Inspect data mode, provenance boundaries, method, and limitations |
| [GitHub repository](https://github.com/DresdenGman/EPSILON-trading-simulator) | Reproduce, challenge, cite, or contribute to the research software |

## Public launch assets

The product is ready for a controlled public launch around one clear idea: **a market result is more useful when its assumptions and failure conditions remain visible.**

- [Public launch kit](docs/PUBLIC_LAUNCH_KIT.md) — approved positioning, channel sequence, and ready-to-adapt copy
- [Communication pack](docs/COMMUNICATION_PACK.md) — bilingual launch copy aligned with the product truth and builder narrative
- [Independent review log](docs/INDEPENDENT_REVIEW_LOG.md) — source-backed external challenges, dispositions, and feedback-led changes
- [GitHub social preview (1280 × 640)](website/public/social/epsilon-social-preview-v1.jpg)
- [EPSILON v2.0 release](https://github.com/DresdenGman/EPSILON-trading-simulator/releases/tag/v2.0.0) — release notes, product film, and downloadable media assets

The launch kit deliberately separates claims that are demonstrated by the product from aspirations that still need user evidence. It should be used for authentic feedback and early-adopter conversations, not performance marketing or investment claims.

## The research loop

### 1. Define

Write a falsifiable market claim and a machine-readable rejection rule before computing the answer.

### 2. Perturb

Run one baseline, four atomic stresses, and one joint stress. Each run keeps the changed input visible.

### 3. Challenge

Inspect exact metrics, provenance, limitations, and the nearest failure. Export the complete evidence artifact with cryptographic fingerprints.

### 4. Revise and reproduce

Start a revised experiment or submit an external methodological challenge. Reproduction mismatches, rejected claims, and inconclusive results remain valid evidence.

## Integrated sensitivity validation

The working product includes a controlled validation protocol that asks:

> Does the conclusion remain unchanged when execution friction increases slightly?

It runs the same momentum configuration twice, changes only execution slippage, evaluates a pre-specified return-sign rule, and repeats the protocol on a non-overlapping window.

Here, ε simply denotes the small increase in slippage used to test whether the conclusion survives.

The experiment currently uses the deterministic controlled synthetic path `CSP-v1`. It tests experimental sensitivity; it is not historical market validation, statistical significance, evidence of profitability, or proof of predictive performance.

The protocol now lives inside the Dashboard as part of the research workflow rather than as a separate public demo. Read the supporting records:

- [Flagship experiment protocol](docs/FLAGSHIP_EXPERIMENT.md)
- [Evidence matrix](docs/EVIDENCE.md)
- [Reproducibility instructions](docs/REPRODUCIBILITY.md)
- [Product architecture](docs/PRODUCT_ARCHITECTURE.md)

## Evidence discipline

EPSILON distinguishes four kinds of information:

| Type | Meaning |
|---|---|
| Hypothesis | A user-authored claim to test |
| Submitted inputs | Configuration sent to a research service |
| Computed outputs | Metrics returned by that service |
| Provenance | What is known—and not known—about data and execution assumptions |

EPSILON does not convert a hypothesis into a fact, a metric into a forecast, or missing provenance into a plausible-sounding source.

## Architecture

```text
epsilonfield.space
      │
      ├── /lab       claim → rejection rule → six runs → evidence artifact
      ├── /impact    anonymous use → external challenge → public disposition
      └── /status    data mode → provenance → limitations

React / TypeScript / Vinext on OpenAI Sites
      ├── deterministic browser-local demonstration
      ├── optional server-side historical-data adapter
      └── privacy-minimizing first-party impact ledger
```

The original Python desktop application and earlier Next.js/FastAPI surfaces remain in this repository as development history and source distribution. They are not competing public products.

## Run locally

Prerequisites: Node.js 22.13+ and npm.

```bash
cd instrument
npm install
npm run dev
```

The public evidence workflow requires no account. Historical-data mode requires the documented server-side provider configuration; otherwise the instrument remains explicitly labeled as a deterministic demonstration.

## Verification

```bash
# Core Python evidence paths
backend/venv/bin/python -m unittest tests.test_stock_data_manager tests.test_demo_runtime -v

# Website type and behavior checks
cd website
npx tsc --noEmit
npx vitest run
```

The web tests cover the research context lifecycle, stale evidence handling, atomic retesting, AI evidence boundaries, route convergence, authenticated navigation, and distribution truthfulness.

## What EPSILON does not claim

- No real-money execution
- No personalized financial advice
- No guaranteed real-time or historical provider unless provenance explicitly supplies one
- No strategy profitability or general robustness claim
- No public installer when a verifiable package has not been published

## Repository continuity

This is the original EPSILON repository. The project is evolving in place so its history, Stars, issues, and earlier desktop/web versions remain intact.

## License

MIT © 2026 Dresden E. Goehner
