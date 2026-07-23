CREATE TABLE IF NOT EXISTS colab_shifts (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL DEFAULT '',
  parent_id TEXT NOT NULL DEFAULT '',
  month TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  date_label TEXT NOT NULL DEFAULT '',
  date_value TEXT NOT NULL DEFAULT '',
  time_label TEXT NOT NULL DEFAULT '',
  member_id TEXT NOT NULL DEFAULT '',
  person TEXT NOT NULL DEFAULT '',
  covered_by TEXT NOT NULL DEFAULT '',
  coverage_status TEXT NOT NULL DEFAULT 'Open',
  is_covered INTEGER NOT NULL DEFAULT 0,
  tags_json TEXT NOT NULL DEFAULT '[]',
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_colab_shifts_date_value
  ON colab_shifts(date_value);

CREATE INDEX IF NOT EXISTS idx_colab_shifts_member_id
  ON colab_shifts(member_id);

CREATE INDEX IF NOT EXISTS idx_colab_shifts_coverage
  ON colab_shifts(is_covered, coverage_status);
