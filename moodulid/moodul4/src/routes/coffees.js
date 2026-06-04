import { Router } from "express";
import { validationResult } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import {
  createCoffee,
  deleteCoffee,
  findCoffeeById,
  listCoffees,
  updateCoffee
} from "../repositories/coffees.js";
import { coffeeIdRule, coffeeRules } from "../validators/coffee.js";

export const coffeeRouter = Router();

coffeeRouter.get("/", (req, res) => {
  res.json({ items: listCoffees() });
});

coffeeRouter.get("/:id", coffeeIdRule, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const coffee = findCoffeeById(req.params.id);
  if (!coffee) {
    res.status(404).json({ error: "Coffee not found" });
    return;
  }

  res.json({ item: coffee });
});

coffeeRouter.post("/", requireAuth, coffeeRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  res.status(201).json({ item: createCoffee(req.body) });
});

coffeeRouter.put("/:id", requireAuth, coffeeIdRule, coffeeRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const coffee = updateCoffee(req.params.id, req.body);
  if (!coffee) {
    res.status(404).json({ error: "Coffee not found" });
    return;
  }

  res.json({ item: coffee });
});

coffeeRouter.delete("/:id", requireAuth, coffeeIdRule, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  if (!deleteCoffee(req.params.id)) {
    res.status(404).json({ error: "Coffee not found" });
    return;
  }

  res.json({ ok: true });
});
