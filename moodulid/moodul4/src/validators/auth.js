import { body } from "express-validator";

export const loginRules = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
];
