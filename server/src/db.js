import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';

// node:sqlite is still flagged "experimental" and prints a warning on first use.
// It's a first-class SQLite build shipped with Node 24 (zero native compilation),
// so we silence just that one harmless warning to keep the startup log clean.
const originalEmit = process.emit;
process.emit = function (name, data, ...rest) {
  if (
    name === 'warning' &&
    data &&
    data.name === 'ExperimentalWarning' &&
    /SQLite/i.test(String(data.message))
  ) {
    return false;
  }
  return originalEmit.call(this, name, data, ...rest);
};

fs.mkdirSync(config.dataDir, { recursive: true });
fs.mkdirSync(config.uploadsDir, { recursive: true });

// A single SQLite file. In the cloud this same schema maps 1:1 onto a managed
// Postgres instance (DATABASE_URL) - the model layer is the only thing that changes.
export const db = new DatabaseSync(path.join(config.dataDir, 'grievance.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'citizen',
    phone         TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    code                     TEXT    UNIQUE,
    user_id                  INTEGER NOT NULL,
    title                    TEXT    NOT NULL,
    description              TEXT    NOT NULL,
    category                 TEXT    NOT NULL,
    location                 TEXT    NOT NULL,
    image_path               TEXT,
    status                   TEXT    NOT NULL DEFAULT 'Submitted',
    priority                 TEXT    NOT NULL DEFAULT 'Medium',
    department               TEXT,
    officer                  TEXT,
    resolution_remarks       TEXT,
    resolution_evidence_path TEXT,
    created_at               TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at               TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS complaint_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    type         TEXT    NOT NULL,
    message      TEXT    NOT NULL,
    actor        TEXT,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
  );
`);
