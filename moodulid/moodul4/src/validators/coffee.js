import { body, param } from "express-validator";

export const coffeeIdRule = [
  param("id").isInt({ min: 1 }).toInt()
];

export const coffeeRules = [
  body("nimi").trim().isLength({ min: 2, max: 120 }),
  body("paritolu").trim().isLength({ min: 2, max: 160 }),
  body("rostitase").trim().isLength({ min: 2, max: 80 }),
  body("maitseprofiil").trim().isLength({ min: 2, max: 240 }),
  body("hind").isFloat({ min: 0 }).toFloat(),
  body("kaal").trim().isLength({ min: 2, max: 40 }),
  body("kirjeldus").trim().isLength({ min: 10, max: 2000 }),
  body("pilt").optional({ values: "falsy" }).trim().isLength({ max: 240 })
];
