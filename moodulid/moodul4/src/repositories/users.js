import { db } from "../db/database.js";

const findByEmailStatement = db.prepare(`
  SELECT id, email, password_hash, role, created_at
  FROM users
  WHERE email = ?
`);

const findByIdStatement = db.prepare(`
  SELECT id, email, role, created_at
  FROM users
  WHERE id = ?
`);

const createStatement = db.prepare(`
  INSERT INTO users (email, password_hash, role)
  VALUES (?, ?, ?)
`);

export function findUserByEmail(email) {
  return findByEmailStatement.get(email);
}

export function findUserById(id) {
  return findByIdStatement.get(id);
}

export function createUser({ email, passwordHash, role = "admin" }) {
  const result = createStatement.run(email, passwordHash, role);
  return findUserById(result.lastInsertRowid);
}
