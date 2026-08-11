# EPSILON Web Laboratory

This directory contains the Next.js interface for EPSILON — Quantitative Decision Lab.

The web product has one research path:

`Market → Strategy Lab → Interrogate → Refine → Retest`

Public visitors start at `/landing` or inspect the controlled flagship experiment at `/demo`. `/download` is a support surface for source and desktop distribution status; it is not a primary product entry.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/landing`.

The frontend expects the research API at `NEXT_PUBLIC_API_URL` (default local API: `http://127.0.0.1:8000`). Authentication and saved-account workflows may additionally require the configured database and auth environment variables.

## Verification

```bash
npx tsc --noEmit
npx vitest run
npm run build
```

Avoid running `next build` while a development server is actively using the same `.next` directory.

## Route roles

| Route | Role |
|---|---|
| `/landing` | Canonical public explanation |
| `/demo` | Flagship controlled experiment |
| `/dashboard` | Market workspace |
| `/dashboard/backtest` | Strategy Lab |
| `/dashboard/ai` | Research interrogation |
| `/download` | Source and distribution support |
| `/simulator` | Legacy URL redirected to `/demo` |
| `/video` | Legacy URL redirected to `/landing` |

The original repository and legacy source pages are intentionally retained. Public routing converges them without deleting project history.
