CREATE TABLE IF NOT EXISTS impact_events (
  id TEXT PRIMARY KEY,
  dedupe_key TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  source TEXT NOT NULL,
  path TEXT NOT NULL,
  artifact_hash TEXT,
  mode TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_impact_events_name_created
ON impact_events(event_name, created_at);

CREATE INDEX IF NOT EXISTS idx_impact_events_session
ON impact_events(session_id);

PRAGMA optimize;
