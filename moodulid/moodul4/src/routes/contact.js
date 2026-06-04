import { Router } from "express";
import { validationResult } from "express-validator";
import { contactRules } from "../validators/contact.js";
import { sendContactMessage } from "../services/mailer.js";

export const contactRouter = Router();

contactRouter.post("/", contactRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  await sendContactMessage({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  res.json({ ok: true });
});
