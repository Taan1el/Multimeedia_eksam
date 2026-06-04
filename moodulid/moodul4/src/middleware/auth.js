import { findUserById } from "../repositories/users.js";

export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    if (req.accepts("html")) {
      res.redirect("/admin/login");
      return;
    }
    res.status(401).json({ error: "Login required" });
    return;
  }

  const user = findUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    if (req.accepts("html")) {
      res.redirect("/admin/login");
      return;
    }
    res.status(401).json({ error: "Login required" });
    return;
  }

  req.user = user;
  next();
}
