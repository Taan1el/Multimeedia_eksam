import { body } from "express-validator";
import { normalizeText } from "./normalize.js";

export const orderRules = [
  body("coffeeId").isInt({ min: 1 }).toInt(),
  body("customerName").customSanitizer(normalizeText).isLength({ min: 2, max: 120 }),
  body("email").customSanitizer(normalizeText).isEmail().normalizeEmail(),
  body("phone").optional({ values: "falsy" }).customSanitizer(normalizeText).isLength({ max: 60 }),
  body("quantity").isInt({ min: 1, max: 20 }).toInt(),
  body("grind").customSanitizer(normalizeText).isIn(["whole", "filter", "espresso", "french-press"]),
  body("address").customSanitizer(normalizeText).isLength({ min: 5, max: 500 }),
  body("notes").optional({ values: "falsy" }).customSanitizer(normalizeText).isLength({ max: 1000 })
];
