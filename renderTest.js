const fs = require('fs');
const { chromium } = require('playwright');
const { getReportData } = require('./reportData');
const { buildHtml } = require('./template');

(async () => {
  fs.mkdirSync('reports', { recursive: true });

  const html = buildHtml(getReportData());

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({
    path: 'reports/test.pdf',
    format: 'A4',
    printBackground: true,
  });
  await browser.close();

  console.log('Saved reports/test.pdf');
})();
