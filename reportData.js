const { DatabaseSync } = require('node:sqlite');

function getReportData() {
  const db = new DatabaseSync('report.db');

  const totals = db
    .prepare(
      'SELECT COUNT(*) AS totalOrders, ROUND(SUM(amount), 2) AS totalRevenue FROM orders',
    )
    .get();

  const topProducts = db
    .prepare(
      `SELECT product, ROUND(SUM(amount), 2) AS revenue
       FROM orders
       GROUP BY product
       ORDER BY revenue DESC
       LIMIT 5`,
    )
    .all();

  const ordersPerDay = db
    .prepare(
      `SELECT created_at AS day, COUNT(*) AS orders
       FROM orders
       WHERE created_at >= date('now', '-6 days')
       GROUP BY created_at
       ORDER BY created_at`,
    )
    .all();

  const allOrders = db
    .prepare(
      'SELECT id, customer, product, amount, created_at FROM orders ORDER BY id',
    )
    .all();

  db.close();

  return {
    totalOrders: totals.totalOrders,
    totalRevenue: totals.totalRevenue,
    topProducts,
    ordersPerDay,
    allOrders,
  };
}

module.exports = { getReportData };
