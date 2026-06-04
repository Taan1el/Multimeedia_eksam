import { Router } from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { createCoffee, deleteCoffee, findCoffeeById, listCoffees, updateCoffee } from "../repositories/coffees.js";
import { findUserByEmail } from "../repositories/users.js";
import { coffeeIdRule, coffeeRules } from "../validators/coffee.js";
import { loginRules } from "../validators/auth.js";

export const adminRouter = Router();

function coffeeFormData(body = {}) {
  return {
    nimi: body.nimi || "",
    paritolu: body.paritolu || "",
    rostitase: body.rostitase || "",
    maitseprofiil: body.maitseprofiil || "",
    hind: body.hind || "",
    kaal: body.kaal || "250 g",
    kirjeldus: body.kirjeldus || "",
    pilt: body.pilt || ""
  };
}

adminRouter.get("/login", (req, res) => {
  if (req.session.userId) {
    res.redirect("/admin");
    return;
  }
  res.render("admin/login", { title: "Admin login" });
});

adminRouter.post("/login", loginRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/login", { title: "Admin login", errors: errors.array(), form: req.body });
    return;
  }

  const user = findUserByEmail(req.body.email);
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    res.status(401).render("admin/login", {
      title: "Admin login",
      errors: [{ msg: "Vale e-post või parool" }],
      form: req.body
    });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).render("admin/login", {
        title: "Admin login",
        errors: [{ msg: "Sisselogimine ebaõnnestus" }],
        form: req.body
      });
      return;
    }
    req.session.userId = user.id;
    res.redirect("/admin");
  });
});

adminRouter.post("/logout", requireAuth, (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

adminRouter.get("/", requireAuth, (req, res) => {
  res.render("admin/index", {
    title: "Admin",
    coffees: listCoffees()
  });
});

adminRouter.get("/kohvisordid/new", requireAuth, (req, res) => {
  res.render("admin/coffee-form", {
    title: "Lisa kohvisort",
    action: "/admin/kohvisordid",
    coffee: coffeeFormData()
  });
});

adminRouter.post("/kohvisordid", requireAuth, coffeeRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/coffee-form", {
      title: "Lisa kohvisort",
      action: "/admin/kohvisordid",
      coffee: coffeeFormData(req.body),
      errors: errors.array()
    });
    return;
  }

  const coffee = createCoffee(req.body);
  res.redirect(`/admin/kohvisordid/${coffee.id}/edit`);
});

adminRouter.get("/kohvisordid/:id/edit", requireAuth, coffeeIdRule, (req, res) => {
  const errors = validationResult(req);
  const coffee = errors.isEmpty() ? findCoffeeById(req.params.id) : null;
  if (!coffee) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Kohvisorti ei leitud" });
    return;
  }

  res.render("admin/coffee-form", {
    title: "Muuda kohvisorti",
    action: `/admin/kohvisordid/${coffee.id}`,
    coffee
  });
});

adminRouter.post("/kohvisordid/:id", requireAuth, coffeeIdRule, coffeeRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("admin/coffee-form", {
      title: "Muuda kohvisorti",
      action: `/admin/kohvisordid/${req.params.id}`,
      coffee: { id: req.params.id, ...coffeeFormData(req.body) },
      errors: errors.array()
    });
    return;
  }

  const coffee = updateCoffee(req.params.id, req.body);
  if (!coffee) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Kohvisorti ei leitud" });
    return;
  }
  res.redirect("/admin");
});

adminRouter.post("/kohvisordid/:id/delete", requireAuth, coffeeIdRule, (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) deleteCoffee(req.params.id);
  res.redirect("/admin");
});
