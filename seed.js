const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('report.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT NOT NULL,
    product TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.exec('DELETE FROM orders');
db.exec("DELETE FROM sqlite_sequence WHERE name = 'orders'");

const customers = [
  'Rahim',
  'Karim',
  'Nusrat',
  'Sadia',
  'Tanvir',
  'Mim',
  'Arif',
  'Lamia',
];
const products = [
  'Keyboard',
  'Mouse',
  'Monitor',
  'Headphones',
  'Webcam',
  'USB Hub',
];

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function randomDate() {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(rand(0, 30)));
  return d.toISOString().slice(0, 10);
}

const insert = db.prepare(
  'INSERT INTO orders (customer, product, amount, created_at) VALUES (?, ?, ?, ?)',
);

db.exec('BEGIN');
for (let i = 0; i < 200; i++) {
  insert.run(
    pick(customers),
    pick(products),
    Number(rand(5, 200).toFixed(2)),
    randomDate(),
  );
}
db.exec('COMMIT');

const { count } = db.prepare('SELECT COUNT(*) AS count FROM orders').get();
console.log('Row count:', count);
