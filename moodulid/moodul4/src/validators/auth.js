import { body } from "express-validator";
import { normalizeText } from "./normalize.js";

export const loginRules = [
  body("email").customSanitizer(normalizeText).isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 200 })
];
