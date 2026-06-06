import { body } from "express-validator";
import { normalizeText } from "./normalize.js";

export const contactRules = [
  body("name").customSanitizer(normalizeText).isLength({ min: 2, max: 120 }),
  body("email").customSanitizer(normalizeText).isEmail().normalizeEmail(),
  body("message").customSanitizer(normalizeText).isLength({ min: 10, max: 3000 })
];
