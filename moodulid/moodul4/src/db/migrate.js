import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import { config } from "../config.js";
import { db } from "./database.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const moduleRoot = path.resolve(currentDir, "../..");
const localSeedPath = path.resolve(currentDir, "seed.sql");
const sharedSeedPath = path.resolve(moduleRoot, "../shared-data/seed.sql");
const seedPath = fs.existsSync(localSeedPath) ? localSeedPath : sharedSeedPath;

const userSchema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

const orderSchema = `
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coffee_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  quantity INTEGER NOT NULL,
  grind TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  total_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coffee_id) REFERENCES kohvisort(id)
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
`;

db.exec(userSchema);

if (!fs.existsSync(seedPath)) {
  throw new Error(`Seed file not found: ${seedPath}`);
}

db.exec("DROP TABLE IF EXISTS orders;");
db.exec("DROP TABLE IF EXISTS event;");
db.exec("DROP TABLE IF EXISTS kohvisort;");
db.exec(fs.readFileSync(seedPath, "utf8"));
db.exec(orderSchema);

const adminExists = db.prepare("SELECT id FROM users WHERE email = ?").get(config.admin.email);
if (!adminExists) {
  const passwordHash = await bcrypt.hash(config.admin.password, 12);
  db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')")
    .run(config.admin.email, passwordHash);
}

console.log("Database migrated and seeded.");
