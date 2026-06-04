import { db } from "../db/database.js";

const listStatement = db.prepare(`
  SELECT id, nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt
  FROM kohvisort
  ORDER BY id ASC
`);

const findByIdStatement = db.prepare(`
  SELECT id, nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt
  FROM kohvisort
  WHERE id = ?
`);

const createStatement = db.prepare(`
  INSERT INTO kohvisort (nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateStatement = db.prepare(`
  UPDATE kohvisort
  SET nimi = ?, paritolu = ?, rostitase = ?, maitseprofiil = ?, hind = ?, kaal = ?, kirjeldus = ?, pilt = ?
  WHERE id = ?
`);

const deleteStatement = db.prepare("DELETE FROM kohvisort WHERE id = ?");

export function listCoffees() {
  return listStatement.all();
}

export function findCoffeeById(id) {
  return findByIdStatement.get(id);
}

export function createCoffee(coffee) {
  const result = createStatement.run(
    coffee.nimi,
    coffee.paritolu,
    coffee.rostitase,
    coffee.maitseprofiil,
    coffee.hind,
    coffee.kaal,
    coffee.kirjeldus,
    coffee.pilt || null
  );
  return findCoffeeById(result.lastInsertRowid);
}

export function updateCoffee(id, coffee) {
  updateStatement.run(
    coffee.nimi,
    coffee.paritolu,
    coffee.rostitase,
    coffee.maitseprofiil,
    coffee.hind,
    coffee.kaal,
    coffee.kirjeldus,
    coffee.pilt || null,
    id
  );
  return findCoffeeById(id);
}

export function deleteCoffee(id) {
  return deleteStatement.run(id).changes > 0;
}

const distinctParitoluStatement = db.prepare(
  "SELECT DISTINCT paritolu FROM kohvisort ORDER BY paritolu"
);
const distinctRostitaseStatement = db.prepare(
  "SELECT DISTINCT rostitase FROM kohvisort ORDER BY rostitase"
);

// Values are bound (?), only the whitelisted sort keyword is interpolated.
export function listCoffeesFiltered({ paritolu, rostitase, sort } = {}) {
  const where = [];
  const args = [];
  if (paritolu) { where.push("paritolu = ?"); args.push(paritolu); }
  if (rostitase) { where.push("rostitase = ?"); args.push(rostitase); }
  const order = sort === "asc" ? "hind ASC" : sort === "desc" ? "hind DESC" : "id ASC";
  const sql = `
    SELECT id, nimi, paritolu, rostitase, maitseprofiil, hind, kaal, kirjeldus, pilt
    FROM kohvisort
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY ${order}
  `;
  return db.prepare(sql).all(...args);
}

export function distinctParitolu() {
  return distinctParitoluStatement.all().map((row) => row.paritolu);
}

export function distinctRostitase() {
  return distinctRostitaseStatement.all().map((row) => row.rostitase);
}
