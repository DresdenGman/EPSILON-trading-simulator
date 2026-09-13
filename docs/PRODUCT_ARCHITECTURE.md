# Current product architecture

The production application lives in `instrument/`. React and TypeScript run through Vinext/Vite on OpenAI Sites. The Python desktop application and `website/` + `backend/` remain historical implementations in the same repository.

| Surface | Current responsibility |
|---|---|
| `/` | Explain the method and open the lab |
| `/lab` | Define a claim and machine rule; compute, inspect, and export evidence |
| `/status` | Disclose the method, data mode, and limitations |
| `/impact` | Separate anonymous use, external challenges, and feedback-led changes |
| `/api/health` | Report configuration and build identity, not provider success |
| `/api/evidence/run` | Validate a historical request, fetch adjusted daily bars server-side, return six computations |
| `/api/impact/*` | First-party bounded telemetry and aggregated public counts |

## Two explicit computation paths

- Browser-local demonstration: `lib/synthetic.ts` produces illustrative deterministic arithmetic. It is never empirical history.
- Historical data: the server obtains Massive adjusted daily closes, applies `lib/backtest.ts`, and returns derived evidence. Provider credentials never enter client code. A disabled, unavailable, over-budget, or failed provider request returns an error, not synthetic fallback.

Both paths use `lib/evidence-contract.ts` for rule evaluation, canonical evidence identity, and artifact checksums. Build-time metadata from `scripts/build-metadata.ts` is embedded in the browser and server via Vite. See [release identity](RELEASE_IDENTITY.md).

## Experiment lifecycle

Define inputs and a rule → submit once → compute baseline and five perturbations → lock successful evidence → download or challenge → explicitly start a revised experiment.

Inputs are disabled while pending and after success. The reference-case button loads inputs only, without fetching data or asserting an outcome. Failed computation exposes an error and permits correction. Revising an experiment clears its displayed result rather than attaching old evidence to new inputs.

## Method boundaries

Stresses are fee ×5, slippage ×5, start/end dates +30 calendar days, the first half of the supplied universe (rounded up), and a joint fee/slippage/window change. The shifted window overlaps the baseline: this is sensitivity testing, not independent out-of-sample replication. Universe order matters. Historical signals use information through the previous close; the model omits intraday execution, market impact, taxes, and borrow constraints.

Real data is not equivalent to an unbiased design. User-selected tickers do not establish a point-in-time universe. Artifacts omit raw licensed price bars. Checksums are not signatures or external preregistrations. These remain limitations, not completed features.

## Evidence and privacy

Claims/configurations are processed for computation, not persisted as user research records. The impact ledger stores limited events and hashed evidence identifiers, not raw prices or full claims. Site visits, lab opens, historical runs, unique people, independent reproductions, replies, and completed tests are different quantities. Maintainer checks are not independent validation; contact and application records remain outside this public application.

The [old Dashboard route map](legacy/PRODUCT_ARCHITECTURE_PRE_INSTRUMENT.md) is archived, not a second public product.
