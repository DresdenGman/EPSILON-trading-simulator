# EPSILON production integrations

EPSILON is complete and usable in controlled-synthetic mode without any external account. The integrations below are optional capability upgrades. They do not change the meaning of existing Evidence Artifacts.

## Historical daily bars

The server adapter prefers Massive and falls back to Twelve Data. Credentials must be configured in the deployment environment, never in browser code or a committed `.env` file.

```bash
# Choose one provider
MASSIVE_API_KEY=
TWELVE_DATA_API_KEY=

# Keep closed until provider terms, quota and output have been verified
HISTORICAL_DATA_PUBLIC=false
```

The endpoint is `GET /api/market-data/history?symbol=SPY&start=2025-01-01&end=2025-12-31`. It is disabled by default, validates symbols and ISO dates, limits requests to two years, caps provider output, applies a timeout and returns cache-safe responses. After a credential has been tested, set `HISTORICAL_DATA_PUBLIC=true` to make the endpoint available.

Historical bars are an input source, not an automatic claim of reproducibility. Before exposing them in the Evidence Instrument, record the provider, adjustment policy, interval, requested window and retrieval time in the resulting artifact.

## Hosted model critic

Guest sessions already include a deterministic, evidence-aware local critic. A hosted model is optional and should remain server-side.

```bash
DEEPSEEK_API_KEY=
TAVILY_API_KEY=
```

Apply provider spend limits before enabling a public model endpoint. Do not send user secrets, account data or private research to a model provider. Model output is critique, not evidence and not financial advice.

## Accounts and cloud persistence

The public instrument does not require login. If cross-device workspaces become necessary, configure a managed database and a strong authentication secret:

```bash
DATABASE_URL=
AUTH_SECRET=
```

Before enabling accounts, run migrations against a staging database, verify authorization on every record-owning route, define retention/deletion behavior and update the public privacy page to name the actual providers.

## Release gate

Before changing any optional integration from configured to public:

1. Confirm the provider key is stored only in server-side deployment settings.
2. Verify quota, timeout, rate-limit and failure behavior.
3. Confirm artifacts name the actual data mode and provider.
4. Run the full test suite and production build.
5. Check `/status` and `/api/health` on the deployed URL.
6. Perform one desktop and one mobile evidence loop through the production domain.
