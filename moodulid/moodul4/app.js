import express from "express";
import compression from "compression";
import session from "express-session";
import helmet from "helmet";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { csrfSync } from "csrf-sync";
import nunjucks from "nunjucks";
import { config } from "./src/config.js";
import { findUserById } from "./src/repositories/users.js";
import { authRouter } from "./src/routes/auth.js";
import { coffeeRouter } from "./src/routes/coffees.js";
import { contactRouter } from "./src/routes/contact.js";
import { pagesRouter } from "./src/routes/pages.js";
import { adminRouter } from "./src/routes/admin.js";
import { SQLiteSessionStore } from "./src/session/sqliteStore.js";
import {
  adminWriteLimiter,
  contactLimiter,
  generalLimiter,
  loginLimiter,
  orderLimiter
} from "./src/middleware/rateLimits.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const builtCssPath = path.join(__dirname, "public/build/main.css");
const inlineStyles = fs.existsSync(builtCssPath)
  ? fs.readFileSync(builtCssPath, "utf8")
  : "";
const inlineStyleHash = inlineStyles
  ? `'sha256-${crypto.createHash("sha256").update(inlineStyles).digest("base64")}'`
  : null;
export const app = express();
const { csrfSynchronisedProtection, generateToken, invalidCsrfTokenError } = csrfSync({
  getTokenFromRequest: (req) => req.body._csrf || req.headers["x-csrf-token"]
});

const views = nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app
});
views.addGlobal("inlineStyles", inlineStyles);

app.set("view engine", "njk");
app.set("trust proxy", config.trustProxy);
app.disable("x-powered-by");
app.use(compression());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", "data:"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", ...(inlineStyleHash ? [inlineStyleHash] : [])],
        upgradeInsecureRequests: config.nodeEnv === "production" ? [] : null
      }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  })
);
const staticCache = config.nodeEnv === "production" ? { maxAge: "1d" } : {};
app.use("/assets", express.static(path.join(__dirname, "public/assets"), staticCache));
app.use("/build", express.static(path.join(__dirname, "public/build"), staticCache));
app.use("/src", express.static(path.join(__dirname, "public/src")));
app.use(generalLimiter);
app.use(express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 100 }));
app.use(express.json({ limit: "100kb" }));
app.use(
  session({
    name: "slow_pour_sid",
    store: new SQLiteSessionStore({ ttlMs: config.sessionMaxAgeMs }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      maxAge: config.sessionMaxAgeMs,
      sameSite: "lax",
      secure: config.nodeEnv === "production"
    }
  })
);
app.use(csrfSynchronisedProtection);

// Expose a CSRF token and the current user to every view.
app.use((req, res, next) => {
  res.locals.csrfToken = generateToken(req);
  res.locals.user = req.session.userId ? findUserById(req.session.userId) : null;
  next();
});

app.get("/csrf-token", (req, res) => {
  res.json({ csrfToken: generateToken(req) });
});

// JSON API (kept for completeness, mounted under /api).
app.use("/api/auth/login", loginLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api/auth", authRouter);
app.use("/api/kohvisordid", coffeeRouter);
app.use("/api/contact", contactRouter);

// Server-rendered HTML site.
app.use("/admin/login", loginLimiter);
app.use("/admin", adminWriteLimiter);
app.use("/kontakt", contactLimiter);
app.use("/tellimus", orderLimiter);
app.use("/admin", adminRouter);
app.use("/", pagesRouter);

app.use((req, res) => {
  if (req.accepts("html")) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Lehte ei leitud" });
    return;
  }
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    if (req.accepts("html")) {
      res.status(403).render("pages/simple", {
        title: "Vigane päring",
        heading: "Vormi kehtivus aegus",
        body: "Laadi leht uuesti ja proovi veel kord."
      });
      return;
    }
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }
  next(err);
});

app.use((err, req, res, next) => {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;
  if (status >= 500) console.error(err);
  if (req.accepts("html")) {
    res.status(status).render("pages/simple", {
      title: status === 500 ? "Serveri viga" : "Päringu viga",
      heading: status === 500 ? "Midagi läks valesti" : "Päringut ei saanud töödelda",
      body: "Palun proovi mõne aja pärast uuesti."
    });
    return;
  }
  res.status(status).json({
    error: status === 500 ? "Server error" : "Request failed"
  });
});

export function startServer(port = config.port) {
  return app.listen(port, () => {
    console.log(`Slow Pour backend listening on port ${port}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer();
}
