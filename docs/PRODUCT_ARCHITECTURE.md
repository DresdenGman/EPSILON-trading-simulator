# EPSILON Product Architecture

Status: `Product convergence · one public product`

EPSILON is a quantitative decision laboratory for forming a market claim,
testing it against explicit inputs and evidence boundaries, challenging the
interpretation, and retesting without rewriting prior results.

## Canonical product path

```text
/landing
    ↓
/dashboard                 Market / Observe + Frame
    ↓
/dashboard/backtest        Strategy Lab / Test
    ↓
/dashboard/ai              Interrogate / Challenge
    ↓
Refine the claim and retest
```

There is no separate demo product. The sensitivity protocol that previously
powered the presentation route is integrated into the Dashboard as a real
validation action.

## Route roles

| Route | Product role | Public status |
|---|---|---|
| `/landing` | Canonical product explanation and workspace entry | Indexed |
| `/dashboard` | Market evidence, hypothesis, rejection rule, and simulated action | Working product |
| `/dashboard/backtest` | Strategy and structure tests with attached provenance | Working product |
| `/dashboard/ai` | Structured interrogation of the current claim and test artifact | Working product |
| `/download` | Source and desktop distribution support | Indexed support |
| `/auth/*` | Optional account access for persistent workspaces | Not indexed |
| `/demo` | Retired presentation URL → `/dashboard/backtest` | Redirect only |
| `/simulator` | Retired legacy URL → `/dashboard` | Redirect only |
| `/video` | Retired presentation URL → `/landing` | Redirect only |

## Research state contract

The active research object keeps four things together:

1. the selected subject;
2. the user-authored hypothesis;
3. the pre-committed rejection condition;
4. the most recent successful test artifact and its provenance.

Changing the subject, hypothesis, or rejection condition makes existing
evidence stale. A failed attempt does not overwrite the last successful
artifact. Only a successful run matching the current research object becomes
current evidence.

## Evidence boundaries

The interface separates:

- submitted inputs;
- computed outputs;
- data and execution provenance;
- interpretation and critique.

Guest sessions use a deterministic browser-local simulation and local
interrogation heuristic. They are labeled as synthetic and do not claim live
market data, historical validation, real AI/web retrieval, profitability, or
financial advice.

## Legacy continuity

The original desktop application, assets, and historical implementations stay
in the same repository. They are development history and source-distribution
material, not competing public products. Before removing legacy capability,
consult:

- `docs/LEGACY_CAPABILITY_MAP.md`;
- `docs/LEGACY_ASSET_MANIFEST.md`;
- `docs/HISTORICAL_VALIDATION_PROTOCOL.md`.

## Product states

- `READY`: a workspace or protocol is available.
- `RUNNING`: an operation is executing while known context remains visible.
- `COMPLETE`: evidence is available for inspection.
- `STALE`: evidence belongs to an earlier research definition.
- `INCONCLUSIVE`: the protocol did not support a valid conclusion.
- `FAILED`: an operational error occurred without deleting prior evidence.

An unfavorable financial result is evidence, not an application error.

## Product principle

```text
observe ambiguity → frame a claim → test it → expose its limits → revise
```

EPSILON is not a recommendation engine. Its purpose is to make it harder to
confuse an output with a conclusion that deserves to be trusted.
