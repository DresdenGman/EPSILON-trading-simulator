# Reproduce EXP-001

This is a local, read-only reproduction path. It does not require production credentials, a production database, or user data.

## Runtime

From the repository root, start the API:

```bash
backend/venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

The API continues in backtest-only mode if local PostgreSQL is stopped. `/api/health` should return `{"status":"ok","version":"0.9.0"}`.

In another terminal:

```bash
cd website
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev
```

Open [http://localhost:3000/demo](http://localhost:3000/demo).

## Expected interaction

1. Read the hypothesis, fixed configuration, CSP-v1 provenance, and ε definition.
2. Click `Run primary ε test` once. The page makes two requests through the active backtest adapter.
3. Read the primary evidence and local diagnosis.
4. Confirm that the replication rule and `2026-01-01 → 2026-03-31` window are visible before running them.
5. Click `Run pre-specified replication`. The page makes two additional requests through the same adapter.
6. Read `REPLICATED`, `NOT REPLICATED`, or `INCONCLUSIVE` without any fallback result.

The exact observed numbers may change if the controlled configuration or model version changes. Do not tune code to recover an old snapshot.

The public Guest-first deployment uses a browser-local deterministic adapter: no network backtest service is implied. Its synthetic return and equity path depend on the pre-specified start/end dates, strategy, and universe, so changing the replication window is a real model input rather than a label-only replay. A configured local backend uses the CSP-v1 `/api/backtest` path described above.

## Verification commands

```bash
backend/venv/bin/python -m unittest tests.test_stock_data_manager tests.test_demo_runtime -v

cd website
npm test -- --run lib/experiment.test.ts
npx tsc --noEmit
npm run build
```

The Python tests cover weekday-only history, OHLC consistency, temporal continuity, exact repeatability, fixed non-overlapping replication windows, and different `PYTHONHASHSEED` processes. The web tests cover local diagnosis, deterministic repeatability, date-window sensitivity, and cross-window replication cases.

## Reproducibility contract

Same commit/worktree, experiment protocol, active synthetic-model version, fixed windows, universe, capital, fee assumptions, slippage values, and strategy configuration should produce the same controlled experiment outputs across restarts and processes.

Changing the market-model version invalidates direct result comparison and requires a new evidence snapshot. The model is a controlled synthetic instrument, not a historical-data claim.
