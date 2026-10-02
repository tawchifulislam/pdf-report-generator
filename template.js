function buildHtml(data) {
  const today = new Date().toISOString().slice(0, 10);

  const topRows = data.topProducts
    .map(p => `<tr><td>${p.product}</td><td>${p.revenue}</td></tr>`)
    .join('');

  const orderRows = data.allOrders
    .map(
      o =>
        `<tr><td>${o.id}</td><td>${o.customer}</td><td>${o.product}</td><td>${o.amount}</td><td>${o.created_at}</td></tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }
  h1 { margin-bottom: 4px; }
  .totals { margin: 16px 0; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  th { background: #f0f0f0; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
</style>
</head>
<body>
  <h1>Sales Report</h1>
  <div>${today}</div>
  <div class="totals">
    <div>Total orders: <strong>${data.totalOrders}</strong></div>
    <div>Total revenue: <strong>${data.totalRevenue}</strong></div>
  </div>
  <h2>Top 5 products by revenue</h2>
  <table>
    <thead><tr><th>Product</th><th>Revenue</th></tr></thead>
    <tbody>${topRows}</tbody>
  </table>
  <h2>All orders</h2>
  <table>
    <thead><tr><th>ID</th><th>Customer</th><th>Product</th><th>Amount</th><th>Date</th></tr></thead>
    <tbody>${orderRows}</tbody>
  </table>
</body>
</html>`;
}

module.exports = { buildHtml };
