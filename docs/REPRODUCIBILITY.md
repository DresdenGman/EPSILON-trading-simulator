# Reproduce the current EPSILON instrument

The current public product is `instrument/`, served at [epsilonfield.space/lab](https://epsilonfield.space/lab). It does not require the older Python API, PostgreSQL, `website/`, or an account.

## 1. Run an exact checkout

Prerequisites: Git, Node.js 22.13 or newer, and npm. Use an exact reviewed commit when comparing results, and record `node --version` and `git rev-parse HEAD`.

```bash
git clone https://github.com/DresdenGman/EPSILON-trading-simulator.git
cd EPSILON-trading-simulator/instrument
npm ci
npm run check
npm run build
npm run dev
```

Open the local URL printed by the development server, then `/lab`. `npm run check` runs unit tests, TypeScript checks, and lint. The build is a separate check. Neither command is empirical market validation.

## 2. Choose the right data mode

**Offline demonstration:** without provider configuration, choose “Deterministic demonstration,” define the claim and rule, then run and download evidence. This path uses illustrative deterministic arithmetic, not observed prices. Its artifact must say `mode: controlled-synthetic`. It is a workflow check only.

**Historical experiment:** the server needs `MASSIVE_API_KEY` and `HISTORICAL_DATA_ENABLED=true`, plus a data entitlement allowing the intended use. See `instrument/.env.example`; use local environment configuration or the hosting service's secret settings, never a browser-visible variable or committed key. Set `MASSIVE_CALLS_PER_MINUTE` to the permitted budget. The public workflow uses the Massive adapter; installing a finance plugin or buying an unrelated provider does not configure it.

Inspect `/api/health`: `historicalAdapter.configured` and `.enabled` describe configuration, not a successful provider fetch. A completed historical experiment must independently return `mode: historical-market-data`, `provenance.provider: Massive`, six runs, and a data fingerprint. Errors must stay errors; do not relabel a demonstration as historical evidence.

For a shared, predeclared input set, follow [fixed historical case 001](REFERENCE_CASE.md). No CSV upload is required.

## 3. Compare the right fields

Record the exact request, `software`, `softwareRevision`, `mode`, `provenance`, all six run metrics, `verdict`, `evidenceId`, and `artifactHash`. [Build identity](RELEASE_IDENTITY.md) explains the distinctions between product release, evidence format, engine revision, build commit, and source fingerprint.

- The same algorithm, request, normalized source data, and build identity should reproduce the same `evidenceId` and computed outputs.
- `generatedAt` changes on a new run, so the complete artifact checksum normally changes even if the evidence ID is unchanged.
- Different build commits or source fingerprints change evidence identity. Compare normalized inputs, data fingerprints, and numerical results before concluding that the engine regressed.
- Provider-adjusted history may be revised. A different data fingerprint is a data difference, not automatically a software bug. The export contains derived outputs and a fingerprint, not raw source bars; exact independent recomputation requires equivalent licensed source data.
- A checksum detects modification relative to the saved checksum. It does not establish who produced an artifact, certify the provider, or independently timestamp a preregistration.

Report mismatches with these fields, runtime, date, and reproduction steps. Remove credentials and private information. Rejection, fragility, provider-access failures, and inconclusive attempts are valid reports, not reasons to tune the case after seeing its result.

## Historical material

[Earlier reproduction protocol](legacy/REPRODUCIBILITY_PRE_INSTRUMENT.md) and [earlier architecture](legacy/PRODUCT_ARCHITECTURE_PRE_INSTRUMENT.md) document the former Dashboard/CSP-v1 path. They are not instructions for today's deployment or evidence of current historical-data validation.
