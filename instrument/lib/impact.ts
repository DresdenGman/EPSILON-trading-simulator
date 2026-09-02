import { env } from "cloudflare:workers";
export { impactEvents, isClientImpactEvent, normalizeImpactSource } from "./impact-contract";
export type { ClientImpactEventName, ImpactEventName } from "./impact-contract";

export async function ensureImpactSchema() {
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS impact_events (
      id TEXT PRIMARY KEY,
      dedupe_key TEXT NOT NULL UNIQUE,
      event_name TEXT NOT NULL,
      session_id TEXT NOT NULL,
      source TEXT NOT NULL,
      path TEXT NOT NULL,
      artifact_hash TEXT,
      mode TEXT,
      created_at TEXT NOT NULL
    )`),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_impact_events_name_created ON impact_events(event_name, created_at)"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_impact_events_session ON impact_events(session_id)"),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS impact_rate_windows (
      bucket TEXT PRIMARY KEY,
      used INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    )`),
  ]);
}

export function impactDb() {
  return env.DB;
}

export async function consumeImpactBudget(units = 1, limit = 120) {
  if (!Number.isInteger(units) || units < 1 || units > limit) return false;
  const now = new Date();
  const bucket = now.toISOString().slice(0, 16);
  const cutoff = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 16);
  const retainedAfter = new Date(now.getTime() - 90 * 86_400_000).toISOString();
  await ensureImpactSchema();
  const reserved = await env.DB.prepare(`INSERT INTO impact_rate_windows (bucket, used, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(bucket) DO UPDATE SET
      used = impact_rate_windows.used + excluded.used,
      updated_at = excluded.updated_at
    WHERE impact_rate_windows.used + excluded.used <= ?
    RETURNING used`)
    .bind(bucket, units, now.toISOString(), limit)
    .first<{ used: number }>();
  if (!reserved) return false;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM impact_rate_windows WHERE bucket < ?").bind(cutoff),
    env.DB.prepare("DELETE FROM impact_events WHERE created_at < ?").bind(retainedAfter),
  ]);
  return true;
}

export async function pruneImpactEvents(now = new Date()) {
  const retainedAfter = new Date(now.getTime() - 90 * 86_400_000).toISOString();
  await ensureImpactSchema();
  await env.DB.prepare("DELETE FROM impact_events WHERE created_at < ?").bind(retainedAfter).run();
  return retainedAfter;
}

export async function recordVerifiedHistoricalRun(evidenceId: string, artifactHash: string, createdAt: string) {
  await ensureImpactSchema();
  const id = `verified:${evidenceId}`;
  await env.DB.prepare(`INSERT OR IGNORE INTO impact_events
    (id, dedupe_key, event_name, session_id, source, path, artifact_hash, mode, created_at)
    VALUES (?, ?, 'verified_historical_run', ?, 'server', '/api/evidence/run', ?, 'historical-market-data', ?)`)
    .bind(crypto.randomUUID(), id, id, artifactHash, createdAt)
    .run();
}
