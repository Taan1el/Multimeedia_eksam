import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const sessionSecret = process.env.SESSION_SECRET || "development-session-secret";
const adminEmail = process.env.ADMIN_EMAIL || "admin@slowpour.test";
const adminPassword = process.env.ADMIN_PASSWORD || "SlowPour123!";
const port = Number(process.env.PORT || 3004);
const smtpPort = Number(process.env.SMTP_PORT || 587);
const sessionMaxAgeMs = Number(process.env.SESSION_MAX_AGE_MS || 8 * 60 * 60 * 1000);
const smtpHost = process.env.SMTP_HOST || "";
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpTo = process.env.CONTACT_TO || "";
const smtpFrom = process.env.CONTACT_FROM || "";

function parseTrustProxy(value) {
  if (!value) return nodeEnv === "production" ? 1 : false;
  if (value === "false") return false;
  if (value === "loopback") return "loopback";
  const hops = Number(value);
  if (Number.isInteger(hops) && hops >= 0 && hops <= 3) return hops;
  throw new Error("TRUST_PROXY must be false, loopback, or a number from 0 to 3");
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port");
}
if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
  throw new Error("SMTP_PORT must be a valid TCP port");
}
if (
  !Number.isFinite(sessionMaxAgeMs) ||
  sessionMaxAgeMs < 15 * 60 * 1000 ||
  sessionMaxAgeMs > 7 * 24 * 60 * 60 * 1000
) {
  throw new Error("SESSION_MAX_AGE_MS must be between 15 minutes and 7 days");
}
if (smtpHost && (!smtpUser || !smtpPass || !smtpTo || !smtpFrom)) {
  throw new Error("SMTP_USER, SMTP_PASS, CONTACT_TO and CONTACT_FROM are required with SMTP_HOST");
}

if (nodeEnv === "production") {
  if (!process.env.SESSION_SECRET || sessionSecret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters in production");
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in production");
  }
  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters in production");
  }
}

export const config = {
  nodeEnv,
  port,
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  sessionSecret,
  sessionMaxAgeMs,
  databasePath: process.env.DATABASE_PATH || "./data/slow-pour.sqlite",
  admin: {
    email: adminEmail,
    password: adminPassword
  },
  smtp: {
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    user: smtpUser,
    pass: smtpPass,
    to: smtpTo,
    from: smtpFrom
  }
};
