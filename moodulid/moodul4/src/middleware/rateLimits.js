import { rateLimit } from "express-rate-limit";

function limitHandler(message) {
  return (req, res) => {
    if (req.accepts("html")) {
      res.status(429).render("pages/simple", {
        title: "Liiga palju päringuid",
        heading: "Palun proovi mõne aja pärast uuesti",
        body: message,
      });
      return;
    }
    res.status(429).json({ error: message });
  };
}

function postOnly(req) {
  return req.method !== "POST";
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: limitHandler("Päringuid on praegu liiga palju."),
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: postOnly,
  handler: limitHandler("Sisselogimiskatseid on liiga palju."),
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: postOnly,
  handler: limitHandler("Sõnumeid on saadetud liiga palju."),
});

export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: postOnly,
  handler: limitHandler("Tellimusi on esitatud liiga palju."),
});

export const adminWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => !["POST", "PUT", "DELETE", "PATCH"].includes(req.method),
  handler: limitHandler("Muudatusi on tehtud liiga palju."),
});
