import { Router } from "express";
import { validationResult } from "express-validator";
import {
  distinctParitolu,
  distinctRostitase,
  findCoffeeById,
  listCoffees,
  listCoffeesFiltered
} from "../repositories/coffees.js";
import { decorate } from "../lib/coffeeView.js";
import { contactRules } from "../validators/contact.js";
import { orderRules } from "../validators/order.js";
import { sendContactMessage } from "../services/mailer.js";
import { createOrder } from "../repositories/orders.js";

export const pagesRouter = Router();

pagesRouter.get("/", (req, res) => {
  const coffees = listCoffees().map(decorate);
  res.render("pages/index", {
    title: "Avaleht",
    featured: coffees.slice(0, 3),
    popular: coffees
  });
});

pagesRouter.get("/kohvisordid", (req, res) => {
  const query = {
    paritolu: req.query.paritolu || "",
    rostitase: req.query.rostitase || req.query.roast || "",
    sort: req.query.sort || ""
  };
  res.render("pages/kohvisordid", {
    title: "Kohvisordid",
    coffees: listCoffeesFiltered(query).map(decorate),
    origins: distinctParitolu(),
    roasts: distinctRostitase(),
    query
  });
});

pagesRouter.get("/kohvisordid/:id", (req, res) => {
  const coffee = findCoffeeById(req.params.id);
  if (!coffee) {
    res.status(404).render("pages/simple", { title: "Ei leitud", heading: "Kohvisorti ei leitud" });
    return;
  }

  const related = listCoffees()
    .filter((item) => item.id !== coffee.id)
    .slice(0, 3)
    .map(decorate);

  res.render("pages/detail", {
    title: coffee.nimi,
    coffee: decorate(coffee),
    related
  });
});

pagesRouter.get("/kontakt", (req, res) => {
  res.render("pages/kontakt", { title: "Kontakt", form: {}, sent: false });
});

pagesRouter.post("/kontakt", contactRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).render("pages/kontakt", {
      title: "Kontakt",
      form: req.body,
      errors: errors.array(),
      sent: false
    });
    return;
  }

  await sendContactMessage({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  res.render("pages/kontakt", { title: "Kontakt", form: {}, sent: true });
});

pagesRouter.get("/tellimus", (req, res) => {
  const coffees = listCoffees().map(decorate);
  const selected = coffees.find((coffee) => String(coffee.id) === String(req.query.id)) || coffees[0];
  res.render("pages/tellimus", {
    title: "Tellimus",
    coffees,
    selected,
    form: { coffeeId: selected?.id, quantity: 1, grind: "whole" },
    sent: false
  });
});

pagesRouter.post("/tellimus", orderRules, (req, res) => {
  const coffees = listCoffees().map(decorate);
  const coffee = findCoffeeById(req.body.coffeeId);
  const errors = validationResult(req);

  if (!errors.isEmpty() || !coffee) {
    res.status(400).render("pages/tellimus", {
      title: "Tellimus",
      coffees,
      selected: coffee ? decorate(coffee) : coffees[0],
      form: req.body,
      errors: errors.isEmpty() ? [{ msg: "Valitud kohvisorti ei leitud" }] : errors.array(),
      sent: false
    });
    return;
  }

  const totalCents = Math.round(Number(coffee.hind) * 100 * Number(req.body.quantity));
  createOrder({
    coffeeId: coffee.id,
    customerName: req.body.customerName,
    email: req.body.email,
    phone: req.body.phone,
    quantity: req.body.quantity,
    grind: req.body.grind,
    address: req.body.address,
    notes: req.body.notes,
    totalCents
  });

  res.render("pages/tellimus", {
    title: "Tellimus",
    coffees,
    selected: decorate(coffee),
    form: { coffeeId: coffee.id, quantity: 1, grind: "whole" },
    sent: true
  });
});

const supportPages = {
  "/rostimisprotsess": {
    title: "Röstimisprotsess",
    heading: "Aeglane röst, puhas maitse",
    body: "Röstime väikestes partiides, jälgime temperatuuri ja aega ning laseme igal päritolul oma iseloomu säilitada."
  },
  "/paritolu": {
    title: "Päritolu",
    heading: "Päritolu on maitse alus",
    body: "Valime kohvid piirkondadest, kus kasvutingimused, sort ja töötlus annavad tassile selge iseloomu."
  },
  "/kkk": {
    title: "KKK",
    heading: "Korduma kippuvad küsimused",
    body: "Kui sa ei tea, millist rösti valida, alusta keskmisest röstist. Tellimuse või töötoa küsimustega kirjuta kontaktivormi kaudu."
  },
  "/tarne": {
    title: "Tarne",
    heading: "Tarne ja kättesaamine",
    body: "Tellimused pannakse teele pärast röstimist. Tallinnas saab kokku leppida ka kohapealse kättesaamise."
  },
  "/tagastused": {
    title: "Tagastused",
    heading: "Tagastused",
    body: "Kui tellimusega on probleem, võta ühendust ja leiame lahenduse. Avamata pakendi saab tagastada kokkuleppel."
  },
  "/kohvik": {
    title: "Kohvik",
    heading: "Kohvik röstikoja juures",
    body: "Röstikoja kohvik on väike koht aeglaseks tassiks, cuppinguks ja kohvivaliku proovimiseks."
  }
};

Object.entries(supportPages).forEach(([route, page]) => {
  pagesRouter.get(route, (req, res) => {
    res.render("pages/simple", page);
  });
});
