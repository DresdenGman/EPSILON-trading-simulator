CREATE TABLE IF NOT EXISTS impact_rate_windows (
  bucket TEXT PRIMARY KEY,
  used INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);
