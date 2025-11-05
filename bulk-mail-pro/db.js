import Database from "better-sqlite3";
const db = new Database("bulk-mail.db");

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  created_at TEXT NOT NULL,
  scheduled_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' -- pending | sending | done | failed
);

CREATE TABLE IF NOT EXISTS recipients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL,
  first TEXT, last TEXT, email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued', -- queued|sent|failed|opened|clicked
  error TEXT,
  message_id TEXT,
  sent_at TEXT,
  FOREIGN KEY(batch_id) REFERENCES batches(id)
);

CREATE TABLE IF NOT EXISTS templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_id INTEGER NOT NULL,
  type TEXT NOT NULL, -- open|click
  meta TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(recipient_id) REFERENCES recipients(id)
);
`);

export default db;
