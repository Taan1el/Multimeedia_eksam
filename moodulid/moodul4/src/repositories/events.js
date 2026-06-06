import { db } from "../db/database.js";

const listStatement = db.prepare(`
  SELECT id, date_label, title, location, spots_free, spots_total
  FROM event
  ORDER BY id ASC
`);

export function listEvents() {
  return listStatement.all();
}
