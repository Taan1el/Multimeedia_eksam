import { db } from "../db/database.js";

const createStatement = db.prepare(`
  INSERT INTO orders (
    coffee_id, customer_name, email, phone, quantity, grind, address, notes, total_cents
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const countStatement = db.prepare("SELECT COUNT(*) AS count FROM orders");

export function createOrder(order) {
  const result = createStatement.run(
    order.coffeeId,
    order.customerName,
    order.email,
    order.phone || null,
    order.quantity,
    order.grind,
    order.address,
    order.notes || null,
    order.totalCents
  );
  return result.lastInsertRowid;
}

export function countOrders() {
  return countStatement.get().count;
}
