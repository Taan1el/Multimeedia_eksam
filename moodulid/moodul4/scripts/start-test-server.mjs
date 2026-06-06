import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, ".test-data");
const databasePath = path.join(dataDir, "browser.sqlite");

fs.mkdirSync(dataDir, { recursive: true });
for (const suffix of ["", "-shm", "-wal"]) {
  fs.rmSync(`${databasePath}${suffix}`, { force: true });
}

process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "3104";
process.env.DATABASE_PATH = databasePath;
process.env.SESSION_SECRET = "browser-test-session-secret-32-chars";
process.env.SESSION_MAX_AGE_MS = "3600000";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = "StrongPass123!";
process.env.SMTP_HOST = "";
process.env.SMTP_USER = "";
process.env.SMTP_PASS = "";
process.env.CONTACT_TO = "";
process.env.CONTACT_FROM = "";
process.env.TRUST_PROXY = "false";

await import("../src/db/migrate.js");
const { startServer } = await import("../app.js");
const { db } = await import("../src/db/database.js");
const server = startServer(Number(process.env.PORT));

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
