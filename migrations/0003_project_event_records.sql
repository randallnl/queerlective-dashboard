CREATE TABLE IF NOT EXISTS project_event_records (
  id TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  date_value TEXT NOT NULL DEFAULT '',
  end_date_value TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  owner TEXT NOT NULL DEFAULT '',
  admin_only INTEGER NOT NULL DEFAULT 0,
  record_json TEXT NOT NULL,
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (source, id)
);

CREATE INDEX IF NOT EXISTS idx_project_event_records_date
  ON project_event_records(date_value);

CREATE INDEX IF NOT EXISTS idx_project_event_records_source
  ON project_event_records(source);

CREATE INDEX IF NOT EXISTS idx_project_event_records_status
  ON project_event_records(status);

CREATE INDEX IF NOT EXISTS idx_project_event_records_admin_only
  ON project_event_records(admin_only);
