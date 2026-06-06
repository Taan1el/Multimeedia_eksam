import { Router } from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { findUserByEmail, findUserById } from "../repositories/users.js";
import { requireAuth } from "../middleware/auth.js";
import { loginRules } from "../validators/auth.js";

export const authRouter = Router();

authRouter.post("/login", loginRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const user = findUserByEmail(req.body.email);
  if (!user) {
    res.status(401).json({ error: "Invalid login" });
    return;
  }

  const passwordMatches = await bcrypt.compare(req.body.password, user.password_hash);
  if (!passwordMatches) {
    res.status(401).json({ error: "Invalid login" });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log in" });
      return;
    }
    req.session.userId = user.id;
    res.json({ user: findUserById(user.id) });
  });
});

authRouter.post("/logout", requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out" });
      return;
    }
    res.clearCookie("slow_pour_sid");
    res.json({ ok: true });
  });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
