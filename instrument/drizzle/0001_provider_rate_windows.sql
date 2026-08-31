CREATE TABLE IF NOT EXISTS provider_rate_windows (
  bucket TEXT PRIMARY KEY,
  used INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

PRAGMA optimize;
