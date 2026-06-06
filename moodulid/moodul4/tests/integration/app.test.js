import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { HtmlValidate } from "html-validate";
import request from "supertest";

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "slow-pour-test-"));
process.env.NODE_ENV = "test";
process.env.DATABASE_PATH = path.join(testRoot, "test.sqlite");
process.env.SESSION_SECRET = "integration-test-session-secret-32-chars";
process.env.SESSION_MAX_AGE_MS = "3600000";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = "StrongPass123!";
process.env.SMTP_HOST = "";
process.env.SMTP_USER = "";
process.env.SMTP_PASS = "";
process.env.CONTACT_TO = "";
process.env.CONTACT_FROM = "";
process.env.TRUST_PROXY = "false";

let app;
let db;

function csrfToken(html) {
  const match = html.match(/name="_csrf" value="([^"]+)"/);
  assert.ok(match, "CSRF token is present");
  return match[1];
}

before(async () => {
  await import("../../src/db/migrate.js");
  ({ app } = await import("../../app.js"));
  ({ db } = await import("../../src/db/database.js"));
});

after(() => {
  db.close();
  fs.rmSync(testRoot, { recursive: true, force: true });
});

test("public routes render database events and customer pages", async () => {
  const routes = [
    "/",
    "/kohvisordid",
    "/kohvisordid/1",
    "/kontakt",
    "/tellimus",
    "/kkk",
    "/tarne",
    "/tagastus",
    "/kohvik",
    "/admin/login",
  ];

  for (const route of routes) {
    const response = await request(app).get(route).expect(200);
    assert.match(response.headers["content-type"], /text\/html/);
  }

  const home = await request(app).get("/").expect(200);
  assert.match(home.text, /Vabu kohti: 8 \/ 20/);
  assert.match(home.text, /Suvine kohviturg/);

  await request(app).get("/cart").set("Accept", "application/json").expect(404);
  await request(app).get("/ostukorv").set("Accept", "application/json").expect(404);
});

test("catalog filters and sorts database rows", async () => {
  const filtered = await request(app)
    .get("/kohvisordid")
    .query({ rostitase: "Hele" })
    .expect(200);
  assert.match(filtered.text, /Aeglane Hommik/);
  assert.doesNotMatch(filtered.text, /Öine Valss/);

  const sorted = await request(app)
    .get("/kohvisordid")
    .query({ sort: "asc" })
    .expect(200);
  assert.ok(
    sorted.text.indexOf("Laisa Päeva Blend") < sorted.text.indexOf("Aeglane Hommik"),
    "lowest-priced coffee is rendered first",
  );
});

test("contact and order forms validate input and accept valid submissions", async () => {
  const agent = request.agent(app);

  let page = await agent.get("/kontakt").expect(200);
  let token = csrfToken(page.text);
  await agent
    .post("/kontakt")
    .type("form")
    .send({ _csrf: token, name: "x", email: "bad", message: "short" })
    .expect(400);

  page = await agent.get("/kontakt").expect(200);
  token = csrfToken(page.text);
  const contact = await agent
    .post("/kontakt")
    .type("form")
    .send({
      _csrf: token,
      name: "  Kontakt   Test  ",
      email: "contact@example.com",
      message: "See on kontaktivormi automaatne kontrollsõnum.",
    })
    .expect(200);
  assert.match(contact.text, /Sõnum saadetud/);

  page = await agent.get("/tellimus").expect(200);
  token = csrfToken(page.text);
  await agent
    .post("/tellimus")
    .type("form")
    .send({
      _csrf: token,
      coffeeId: 1,
      quantity: 0,
      grind: "whole",
      customerName: "T",
      email: "bad",
      address: "x",
    })
    .expect(400);

  page = await agent.get("/tellimus").expect(200);
  token = csrfToken(page.text);
  await agent
    .post("/tellimus")
    .type("form")
    .send({
      _csrf: token,
      coffeeId: 1,
      quantity: 2,
      grind: "filter",
      customerName: "  Tellija   Test  ",
      email: "buyer@example.com",
      phone: "+372 5555 5555",
      address: "Roostiku 12, Tallinn",
      notes: "Uksekell ei tööta",
    })
    .expect(200);

  const order = db
    .prepare("SELECT customer_name, quantity, total_cents FROM orders ORDER BY id DESC LIMIT 1")
    .get();
  assert.deepEqual(order, {
    customer_name: "Tellija   Test",
    quantity: 2,
    total_cents: 2700,
  });
});

test("CSRF and authentication guards reject unsafe requests", async () => {
  await request(app)
    .post("/kontakt")
    .type("form")
    .send({ name: "Test", email: "test@example.com", message: "Missing CSRF token" })
    .expect(403);

  await request(app).get("/admin").expect(302).expect("Location", "/admin/login");

  const apiAgent = request.agent(app);
  const tokenResponse = await apiAgent.get("/csrf-token").expect(200);
  await apiAgent
    .post("/api/kohvisordid")
    .set("Accept", "application/json")
    .set("x-csrf-token", tokenResponse.body.csrfToken)
    .send({
      nimi: "Keelatud",
      paritolu: "Eesti",
      rostitase: "Hele",
      maitseprofiil: "õun, mesi",
      hind: 9.5,
      kaal: "250 g",
      kirjeldus: "Piisavalt pikk kontrollkirjeldus.",
    })
    .expect(401);
});

test("admin API login and coffee CRUD use a persisted session", async () => {
  const agent = request.agent(app);
  let tokenResponse = await agent.get("/csrf-token").expect(200);

  await agent
    .post("/api/auth/login")
    .set("x-csrf-token", tokenResponse.body.csrfToken)
    .send({ email: "admin@example.com", password: "StrongPass123!" })
    .expect(200);

  await agent.get("/api/auth/me").expect(200);
  tokenResponse = await agent.get("/csrf-token").expect(200);
  const token = tokenResponse.body.csrfToken;

  const coffee = {
    nimi: "API Test",
    paritolu: "Eesti",
    rostitase: "Hele",
    maitseprofiil: "õun, mesi",
    hind: 9.5,
    kaal: "250 g",
    kirjeldus: "Ajutine API CRUD kontrollkohv.",
    pilt: "",
  };

  const created = await agent
    .post("/api/kohvisordid")
    .set("x-csrf-token", token)
    .send(coffee)
    .expect(201);
  const id = created.body.item.id;

  const updated = await agent
    .put(`/api/kohvisordid/${id}`)
    .set("x-csrf-token", token)
    .send({ ...coffee, nimi: "API Test Updated" })
    .expect(200);
  assert.equal(updated.body.item.nimi, "API Test Updated");

  await agent
    .delete(`/api/kohvisordid/${id}`)
    .set("x-csrf-token", token)
    .expect(200);
  assert.equal(db.prepare("SELECT id FROM kohvisort WHERE id = ?").get(id), undefined);

  tokenResponse = await agent.get("/csrf-token").expect(200);
  await agent
    .post("/api/auth/logout")
    .set("x-csrf-token", tokenResponse.body.csrfToken)
    .expect(200);
  await agent.get("/api/auth/me").set("Accept", "application/json").expect(401);
});

test("security headers and safe error responses are present", async () => {
  const response = await request(app).get("/").expect(200);
  assert.match(response.headers["content-security-policy"], /script-src 'self'/);
  assert.equal(response.headers["x-frame-options"], "SAMEORIGIN");
  assert.equal(response.headers["referrer-policy"], "strict-origin-when-cross-origin");
  assert.ok(response.headers.ratelimit);

  const html404 = await request(app)
    .get("/missing")
    .set("Accept", "text/html")
    .expect(404);
  assert.match(html404.text, /Lehte ei leitud/);

  await request(app)
    .get("/missing")
    .set("Accept", "application/json")
    .expect(404, { error: "Not found" });
});

test("rendered HTML passes the recommended validator rules", async () => {
  const validator = new HtmlValidate({
    extends: ["html-validate:recommended"],
    rules: {
      "doctype-style": "off",
      "no-trailing-whitespace": "off",
      "no-inline-style": "off",
      "void-style": "off",
    },
  });
  const routes = ["/", "/kohvisordid", "/kohvisordid/1", "/kontakt", "/tellimus"];

  for (const route of routes) {
    const response = await request(app).get(route).expect(200);
    const report = await validator.validateString(response.text, route);
    const details = report.results
      .flatMap((result) => result.messages)
      .map((message) => `${message.ruleId}: ${message.message} (${message.line}:${message.column})`)
      .join("\n");
    assert.equal(report.valid, true, `${route}\n${details}`);
  }
});
