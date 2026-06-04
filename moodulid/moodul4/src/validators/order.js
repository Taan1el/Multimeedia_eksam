import { body } from "express-validator";

export const orderRules = [
  body("coffeeId").isInt({ min: 1 }).toInt(),
  body("customerName").trim().isLength({ min: 2, max: 120 }),
  body("email").isEmail().normalizeEmail(),
  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 60 }),
  body("quantity").isInt({ min: 1, max: 20 }).toInt(),
  body("grind").trim().isIn(["whole", "filter", "espresso", "french-press"]),
  body("address").trim().isLength({ min: 5, max: 500 }),
  body("notes").optional({ values: "falsy" }).trim().isLength({ max: 1000 })
];
