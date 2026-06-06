import { body, param } from "express-validator";
import { normalizeText } from "./normalize.js";

export const coffeeIdRule = [
  param("id").isInt({ min: 1 }).toInt()
];

export const coffeeRules = [
  body("nimi").customSanitizer(normalizeText).isLength({ min: 2, max: 120 }),
  body("paritolu").customSanitizer(normalizeText).isLength({ min: 2, max: 160 }),
  body("rostitase").customSanitizer(normalizeText).isLength({ min: 2, max: 80 }),
  body("maitseprofiil").customSanitizer(normalizeText).isLength({ min: 2, max: 240 }),
  body("hind").isFloat({ min: 0 }).toFloat(),
  body("kaal").customSanitizer(normalizeText).isLength({ min: 2, max: 40 }),
  body("kirjeldus").customSanitizer(normalizeText).isLength({ min: 10, max: 2000 }),
  body("pilt").optional({ values: "falsy" }).customSanitizer(normalizeText).isLength({ max: 240 })
];
