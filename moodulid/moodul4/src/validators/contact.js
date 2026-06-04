import { body } from "express-validator";

export const contactRules = [
  body("name").trim().isLength({ min: 2, max: 120 }),
  body("email").isEmail().normalizeEmail(),
  body("message").trim().isLength({ min: 10, max: 3000 })
];
