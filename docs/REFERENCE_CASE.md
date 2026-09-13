# Fixed historical case 001

Purpose: let another person attempt the same explicitly specified experiment and report agreement, disagreement, or failure. This is a reproducibility entry point, not a winning strategy or an independent validation result.

Source of truth: [`historical-sensitivity-001.json`](../instrument/data/cases/historical-sensitivity-001.json). Inputs were fixed before this case's first recorded run. This is not an independently timestamped preregistration, blind experiment, or proof the developer had never seen these markets. There is no expected numerical result or required favorable verdict.

| Input | Fixed value |
|---|---|
| Universe, in order | SPY, QQQ |
| Strategy | Momentum (2%) |
| Baseline window | 2025-09-01 through 2026-02-27 |
| Fee rate | 0.0001 |
| Slippage per share | $0.01 |
| Rule | Net total return strictly greater than 0 in all five perturbations |
| Stresses | Fee ×5; slippage ×5; dates +30d; SPY only; joint fee/slippage/window |

Warm-up data begins 2025-07-18; the shifted end is 2026-03-29. Two uncached symbols require two provider requests, not one per stress. Access/shared capacity can still fail. The shifted window overlaps the baseline; it is not out-of-sample replication. Choosing two existing ETFs does not remove selection or survivorship bias.

## Browser attempt

1. Open [the lab](https://epsilonfield.space/lab). Historical configuration is required; if unavailable, record a blocked historical attempt rather than substitute a demonstration.
2. Click **Load fixed historical case 001**. This fills inputs only. Check the table, then click **Lock & run evidence field** once.
3. Confirm historical mode, Massive provenance, and six runs. `survives`, `fragile`, and `rejected` are all reportable. The verdict evaluates five perturbations; inspect the baseline separately.
4. Download evidence. Save the date, complete build metadata, request, data fingerprint, evidence ID, checksum, all metrics, and verdict. Never share provider keys/private information.
5. Report mismatches or concerns in [Discussions #8](https://github.com/DresdenGman/EPSILON-trading-simulator/discussions/8) or an issue. Distinguish using the hosted app, running your own checkout, and independently recomputing from equivalent source data.

For 429, respect `Retry-After`; do not repeatedly submit. For an inaccessible historical window, retain the failure. Changed dates define another case, not successful reproduction of this one.

## Exact API request

From the repository root, after checking availability and permitted use:

```bash
curl --fail-with-body https://epsilonfield.space/api/evidence/run \
  -H 'Content-Type: application/json' \
  --data-binary @instrument/data/cases/historical-sensitivity-001.json
```

This computes and may add a first-party run event; it is not a read-only health check. Raw licensed bars are not returned. Independent recomputation still requires equivalent source data; see [reproduction boundaries](REPRODUCIBILITY.md).

## Report template

```text
Case: historical-sensitivity-001
Role: maintainer check / external hosted attempt / independent local reproduction
Attempted at (UTC):
Status: completed / provider blocked / failed / mismatch
Build commit, source state, source fingerprint:
Data mode, provider, data fingerprint:
Evidence ID and artifact checksum:
Baseline and five perturbation metrics; verdict:
Steps/environment and differences from the fixed request:
What failed or changed my interpretation:
Public artifact or redacted supporting record:
```

Revised inputs require a new identifier. Do not overwrite this case to improve returns. A maintainer's successful run proves the path was exercised, not external or independent confirmation.
