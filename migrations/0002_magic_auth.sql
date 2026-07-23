CREATE TABLE IF NOT EXISTS magic_login_tokens (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_magic_login_tokens_email
  ON magic_login_tokens(email);

CREATE INDEX IF NOT EXISTS idx_magic_login_tokens_expires
  ON magic_login_tokens(expires_at);

CREATE TABLE IF NOT EXISTS magic_sessions (
  session_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  member_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_magic_sessions_member_id
  ON magic_sessions(member_id);

CREATE INDEX IF NOT EXISTS idx_magic_sessions_expires
  ON magic_sessions(expires_at);
