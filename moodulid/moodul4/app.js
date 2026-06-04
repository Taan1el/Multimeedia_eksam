import express from "express";
import session from "express-session";
import helmet from "helmet";
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const { csrfSynchronisedProtection, generateToken, invalidCsrfTokenError } = csrfSync({
  getTokenFromRequest: (req) => req.body._csrf || req.headers["x-csrf-token"]
});

nunjucks.configure(path.join(__dirname, "views"), {
  autoescape: true,
  express: app
});

app.set("view engine", "njk");
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));
app.use("/src", express.static(path.join(__dirname, "public/src")));
app.use(express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 100 }));
app.use(express.json({ limit: "100kb" }));
app.use(
  session({
    name: "slow_pour_sid",
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
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
app.use("/api/auth", authRouter);
app.use("/api/kohvisordid", coffeeRouter);
app.use("/api/contact", contactRouter);

// Server-rendered HTML site.
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
    res.status(403).json({ error: "Invalid CSRF token" });
    return;
  }
  next(err);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Server error" : err.message
  });
});

app.listen(config.port, () => {
  console.log(`Slow Pour backend listening on port ${config.port}`);
});
