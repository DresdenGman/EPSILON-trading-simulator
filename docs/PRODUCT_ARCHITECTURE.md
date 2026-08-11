# EPSILON Product Architecture

Status: `Phase 1A · product surface map + legacy reconciliation contract`

EPSILON is a quantitative decision laboratory: a coherent product where simulated trading, strategy analysis, research experiments, and AI-assisted reflection all serve one question—how should a person act when a model's conclusion may change under uncertainty?

This map preserves the existing product surfaces. No route is removed in Phase 1A.

## Product surfaces

| Surface | Current role | Actual capability | Final product role | Status | Action |
|---|---|---|---|---|---|
| `/` | Authenticated product home | Dashboard entry with account, market, portfolio, and EXP-001 context | Trade workspace and product home | Core functional | Keep / integrate |
| `/landing` | Public narrative site | Portfolio, purpose, product story, and contact sections | Public explanation of the laboratory and creator | Legacy-presentation | Refactor later |
| `/dashboard` | Trade workspace | Market watch, portfolio, orders, history, and current experiment | Operational laboratory: observe and act in simulation | Core functional | Keep / integrate |
| `/dashboard/backtest` | Analysis workspace | Strategy parameters, backtests, and spectral analysis | Strategy Lab: inspect how a rule behaves | Core functional | Keep / integrate |
| `/dashboard/ai` | AI advisor | Strategy and portfolio questions through the AI interface | Reflection layer: question assumptions and interpret evidence | Core functional | Keep / integrate |
| `/simulator` | Immersive simulator | Trading terminal, order entry, charts, event log, and risk co-pilot presentation | Guided simulation environment | Research prototype | Refactor later |
| `/demo` | Flagship research exhibit | EXP-001 primary/replication experiment with explicit falsification rule | Research Lab: demonstrate the product thesis | Research prototype | Integrate, do not replace |
| `/download` | Distribution support | Installation guidance and placeholder release links | Desktop distribution entry | Support | Repair later |
| `/video` | Presentation support | Introduction video and external links | Short-form product introduction | Support | Keep |
| `/auth/*` | Identity | Login and registration surfaces | Access boundary for personalized workspaces | Core functional | Keep |

## Unified information architecture

The authenticated product shell exposes five destinations without changing existing route paths:

```text
EPSILON Quantitative Decision Laboratory
├── Trade          /dashboard
├── Strategy Lab   /dashboard/backtest
├── Research       /demo
├── AI             /dashboard/ai
└── Simulator      /simulator
```

The public `/landing` page explains why EPSILON exists. The authenticated shell helps a user move from a market decision to a test, then to reflection:

```text
Observe market → simulate decision → test strategy → perturb assumption → inspect result → question interpretation
```

The same product thesis should be visible in each surface, while each surface keeps its distinct job. The goal is not to make every page look identical.

## Legacy continuity contract

EPSILON has multiple credible product generations. The current five-workspace architecture must not silently lose capabilities that were already achieved in the desktop simulator. Before a major redesign or cleanup, consult:

- `docs/LEGACY_CAPABILITY_MAP.md` for capability-by-capability recovery decisions;
- `docs/LEGACY_ASSET_MANIFEST.md` for screenshots, videos, duplicate asset trees, and packaged artifacts.

The migration rule is:

```text
historical evidence → verify current equivalent → classify state → recover or integrate → validate user journey
```

Legacy material is not automatically better, and current material is not automatically complete. A capability may be `PRESERVED`, `IMPROVED`, `PARTIALLY PRESERVED`, `DEGRADED`, `UNMAPPED`, `ILLUSTRATIVE ONLY`, `SUPERSEDED`, or `UNKNOWN`; no capability is deleted during reconciliation.

## Product states

Each future surface should communicate its state honestly using the shared vocabulary:

- `READY`: protocol or workspace is available.
- `RUNNING`: work is executing; known context remains visible.
- `COMPLETE`: evidence is available.
- `INCONCLUSIVE`: the protocol did not support a valid conclusion.
- `FAILED`: an operational error occurred.

An unfavorable financial number is not itself an application error.

## Phase boundaries

Phase 1A establishes the map, shared semantic styling targets, product shell navigation, and product metadata. It does not redesign every page.

Later phases may incrementally migrate Dashboard, Strategy Lab, AI, Simulator, Landing, and Download against this map. Historical data validation remains governed by `docs/HISTORICAL_VALIDATION_PROTOCOL.md` and must not be used as a reason to bypass product integration.

## Narrative through-line

EPSILON's role in the wider application portfolio is not simply “a trading project.” It is the project where the creator turns uncertainty back onto his own model:

```text
observe ambiguity → build a model → test it → expose its limits → revise what you believe
```

Other projects can share this intellectual habit while asking different domain questions. EPSILON's distinctive contribution is the software system that lets the creator attack the assumptions behind a quantitative conclusion.

## Non-goals for Phase 1A

- Delete or redirect an existing route.
- Replace the existing Dashboard, Simulator, Backtest, AI, or Landing implementation.
- Add a new strategy, market, indicator, chart system, or data provider.
- Rebuild authentication, Prisma, FastAPI, or the backtest engine.
- Add historical-data execution.
- Turn `/demo` into the whole product.
