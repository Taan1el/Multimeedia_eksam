import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const sessionSecret = process.env.SESSION_SECRET || "development-session-secret";
const adminEmail = process.env.ADMIN_EMAIL || "admin@slowpour.test";
const adminPassword = process.env.ADMIN_PASSWORD || "SlowPour123!";

if (nodeEnv === "production") {
  if (!process.env.SESSION_SECRET || sessionSecret === "development-session-secret") {
    throw new Error("SESSION_SECRET must be set in production");
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in production");
  }
}

export const config = {
  nodeEnv,
  port: Number(process.env.PORT || 3004),
  sessionSecret,
  databasePath: process.env.DATABASE_PATH || "./data/slow-pour.sqlite",
  admin: {
    email: adminEmail,
    password: adminPassword
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    to: process.env.CONTACT_TO || "",
    from: process.env.CONTACT_FROM || ""
  }
};
