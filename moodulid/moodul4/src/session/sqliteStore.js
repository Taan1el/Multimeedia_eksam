import session from "express-session";
import { db } from "../db/database.js";

const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000;

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions(expires_at);
`);

const findStatement = db.prepare(`
  SELECT sess, expires_at
  FROM sessions
  WHERE sid = ?
`);
const upsertStatement = db.prepare(`
  INSERT INTO sessions (sid, sess, expires_at, updated_at)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(sid) DO UPDATE SET
    sess = excluded.sess,
    expires_at = excluded.expires_at,
    updated_at = excluded.updated_at
`);
const destroyStatement = db.prepare("DELETE FROM sessions WHERE sid = ?");
const clearStatement = db.prepare("DELETE FROM sessions");
const pruneStatement = db.prepare("DELETE FROM sessions WHERE expires_at <= ?");
const touchStatement = db.prepare(`
  UPDATE sessions
  SET expires_at = ?, updated_at = ?
  WHERE sid = ?
`);
const countStatement = db.prepare(`
  SELECT COUNT(*) AS count
  FROM sessions
  WHERE expires_at > ?
`);

function expiresAt(sessionData, ttlMs) {
  const cookieExpiry = sessionData?.cookie?.expires
    ? new Date(sessionData.cookie.expires).getTime()
    : 0;
  return Number.isFinite(cookieExpiry) && cookieExpiry > Date.now()
    ? cookieExpiry
    : Date.now() + ttlMs;
}

export class SQLiteSessionStore extends session.Store {
  constructor({ ttlMs = DEFAULT_TTL_MS, pruneIntervalMs = 15 * 60 * 1000 } = {}) {
    super();
    this.ttlMs = ttlMs;
    pruneStatement.run(Date.now());
    this.pruneTimer = setInterval(() => pruneStatement.run(Date.now()), pruneIntervalMs);
    this.pruneTimer.unref();
  }

  get(sid, callback) {
    try {
      const row = findStatement.get(sid);
      if (!row || row.expires_at <= Date.now()) {
        if (row) destroyStatement.run(sid);
        callback(null, null);
        return;
      }
      callback(null, JSON.parse(row.sess));
    } catch (error) {
      callback(error);
    }
  }

  set(sid, sessionData, callback = () => {}) {
    try {
      const now = Date.now();
      upsertStatement.run(
        sid,
        JSON.stringify(sessionData),
        expiresAt(sessionData, this.ttlMs),
        now,
      );
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  destroy(sid, callback = () => {}) {
    try {
      destroyStatement.run(sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  touch(sid, sessionData, callback = () => {}) {
    try {
      const now = Date.now();
      touchStatement.run(expiresAt(sessionData, this.ttlMs), now, sid);
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  clear(callback = () => {}) {
    try {
      clearStatement.run();
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  length(callback) {
    try {
      callback(null, countStatement.get(Date.now()).count);
    } catch (error) {
      callback(error);
    }
  }
}
