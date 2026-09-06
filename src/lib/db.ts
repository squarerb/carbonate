import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Overridable so tests can point this at an isolated in-memory database
// (CARBONATE_DB_PATH=":memory:") instead of the real data file.
const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "carbonate.db");
const DB_PATH = process.env.CARBONATE_DB_PATH || DEFAULT_DB_PATH;

if (DB_PATH !== ":memory:") {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Reuse a single connection across hot-reloads in dev.
declare global {
  // eslint-disable-next-line no-var
  var __carbonateDb: DatabaseSync | undefined;
}

function getDb(): DatabaseSync {
  if (!global.__carbonateDb) {
    const db = new DatabaseSync(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS pastes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT NOT NULL,
        language TEXT,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        burn_after_read INTEGER NOT NULL DEFAULT 0
      )
    `);
    global.__carbonateDb = db;
  }
  return global.__carbonateDb;
}

export interface Paste {
  id: string;
  title: string | null;
  content: string;
  language: string | null;
  createdAt: number;
  expiresAt: number | null;
  burnAfterRead: boolean;
}

export type ExpiryOption = "never" | "1h" | "1d" | "1w" | "1m";

export function expiryToMs(option: ExpiryOption): number | null {
  const HOUR = 60 * 60 * 1000;
  switch (option) {
    case "1h":
      return HOUR;
    case "1d":
      return 24 * HOUR;
    case "1w":
      return 7 * 24 * HOUR;
    case "1m":
      return 30 * 24 * HOUR;
    case "never":
    default:
      return null;
  }
}

/** Opportunistic cleanup — no cron needed for a small self-hosted instance. */
function purgeExpired() {
  const db = getDb();
  db.prepare(`DELETE FROM pastes WHERE expires_at IS NOT NULL AND expires_at < ?`).run(
    Date.now()
  );
}

export function createPaste(input: {
  id: string;
  title: string | null;
  content: string;
  language: string | null;
  expiresIn: ExpiryOption;
  burnAfterRead: boolean;
}): Paste {
  const db = getDb();
  purgeExpired();
  const createdAt = Date.now();
  const ms = expiryToMs(input.expiresIn);
  const expiresAt = ms ? createdAt + ms : null;

  db.prepare(
    `INSERT INTO pastes (id, title, content, language, created_at, expires_at, burn_after_read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.id,
    input.title,
    input.content,
    input.language,
    createdAt,
    expiresAt,
    input.burnAfterRead ? 1 : 0
  );

  return {
    id: input.id,
    title: input.title,
    content: input.content,
    language: input.language,
    createdAt,
    expiresAt,
    burnAfterRead: input.burnAfterRead,
  };
}

type Row = {
  id: string;
  title: string | null;
  content: string;
  language: string | null;
  created_at: number;
  expires_at: number | null;
  burn_after_read: number;
};

function rowToPaste(row: Row): Paste {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    language: row.language,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    burnAfterRead: !!row.burn_after_read,
  };
}

/**
 * Reads a paste. If it's expired it's deleted and treated as missing.
 * If it's burn-after-read, it's deleted immediately after this read —
 * the caller is the one and only viewer.
 */
export function readAndMaybeConsume(id: string): Paste | null {
  const db = getDb();
  const row = db.prepare(`SELECT * FROM pastes WHERE id = ?`).get(id) as
    | Row
    | undefined;

  if (!row) return null;

  if (row.expires_at !== null && row.expires_at < Date.now()) {
    db.prepare(`DELETE FROM pastes WHERE id = ?`).run(id);
    return null;
  }

  if (row.burn_after_read) {
    db.prepare(`DELETE FROM pastes WHERE id = ?`).run(id);
  }

  return rowToPaste(row);
}
