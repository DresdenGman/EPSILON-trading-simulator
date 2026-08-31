import { env } from "cloudflare:workers";

export function providerBudgetLimit() {
  const configured = Number(process.env.MASSIVE_CALLS_PER_MINUTE ?? "5");
  return Number.isFinite(configured) ? Math.max(1, Math.min(500, Math.floor(configured))) : 5;
}

async function ensureProviderBudgetSchema() {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS provider_rate_windows (
    bucket TEXT PRIMARY KEY,
    used INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
}

export async function consumeProviderBudget(units: number) {
  const limit = providerBudgetLimit();
  if (!Number.isInteger(units) || units < 1 || units > limit) return false;
  await ensureProviderBudgetSchema();
  const now = new Date();
  const bucket = now.toISOString().slice(0, 16);
  const cutoff = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 16);
  await env.DB.prepare("DELETE FROM provider_rate_windows WHERE bucket < ?").bind(cutoff).run();
  const reserved = await env.DB.prepare(`INSERT INTO provider_rate_windows (bucket, used, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(bucket) DO UPDATE SET
      used = provider_rate_windows.used + excluded.used,
      updated_at = excluded.updated_at
    WHERE provider_rate_windows.used + excluded.used <= ?
    RETURNING used`)
    .bind(bucket, units, now.toISOString(), limit)
    .first<{ used: number }>();
  return Boolean(reserved);
}
