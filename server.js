const fs = require('fs');
const path = require('path');
const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const { chromium } = require('playwright');
const { getReportData } = require('./reportData');
const { buildHtml } = require('./template');

const app = express();
app.use(express.json());

const db = new DatabaseSync('report.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

fs.mkdirSync('reports', { recursive: true });

async function renderPdf(filePath) {
  const html = buildHtml(getReportData());
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: filePath, format: 'A4', printBackground: true });
  await browser.close();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/reports', async (req, res) => {
  const force = req.body?.force === true;
  const today = new Date().toISOString().slice(0, 10);

  if (!force) {
    const existing = db
      .prepare(
        'SELECT id FROM reports WHERE substr(created_at, 1, 10) = ? ORDER BY id DESC LIMIT 1',
      )
      .get(today);
    if (existing) {
      return res
        .status(200)
        .json({ id: existing.id, file: `/reports/${existing.id}/file` });
    }
  }

  const createdAt = new Date().toISOString();
  const { lastInsertRowid } = db
    .prepare('INSERT INTO reports (path, created_at) VALUES (?, ?)')
    .run('', createdAt);
  const id = Number(lastInsertRowid);
  const filePath = path.join('reports', `${id}.pdf`);

  try {
    await renderPdf(filePath);
    db.prepare('UPDATE reports SET path = ? WHERE id = ?').run(filePath, id);
    res.status(201).json({ id, file: `/reports/${id}/file` });
  } catch (err) {
    console.error(err);
    db.prepare('DELETE FROM reports WHERE id = ?').run(id);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.get('/reports/:id', (req, res) => {
  const row = db
    .prepare('SELECT * FROM reports WHERE id = ?')
    .get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json({
    id: row.id,
    created_at: row.created_at,
    file: `/reports/${row.id}/file`,
  });
});

app.get('/reports/:id/file', (req, res) => {
  const row = db
    .prepare('SELECT * FROM reports WHERE id = ?')
    .get(req.params.id);
  if (!row || !row.path || !fs.existsSync(row.path)) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.resolve(row.path));
});

app.listen(3000, () => console.log('Server running on port 3000'));
