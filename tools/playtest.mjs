// Functional playtest for the Leonida Ledger, run against serve.ts.
// Checks: 55 rows render, ticking persists across reload, the spoiler setting
// hides secret trophies, filters and search narrow the list, export downloads
// a JSON file, import restores it, and the roadmap and missables pages render.
// Usage: node tools/playtest.mjs [baseUrl]
import { createRequire } from 'node:module';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';

const require = createRequire('/tmp/pw/node_modules/');
const { chromium } = require('playwright-core');

const base = process.argv[2] || 'http://localhost:8080';
const executablePath = join(homedir(), '.cache/ms-playwright/chromium-1148/chrome-linux/chrome');

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const outside = [];
page.on('request', (request) => {
  if (!request.url().startsWith(base)) outside.push(request.url());
});

await page.goto(`${base}/#/tracker`, { waitUntil: 'networkidle' });
await page.waitForSelector('.trophy', { timeout: 10000 });
check('checklist renders 55 trophies', (await page.locator('.trophy').count()) === 55);
check('header shows 0 / 55 at start', (await page.locator('#earnedCount').textContent()) === '0');

// Tick one trophy and reload: localStorage must keep it.
await page.locator('article.trophy[data-id="17"] input[type="checkbox"]').check();
await page.waitForTimeout(300);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForSelector('.trophy', { timeout: 10000 });
check('ticked trophy persists after reload', await page.locator('article.trophy[data-id="17"] input[type="checkbox"]').isChecked());
check('header shows 1 / 55 after reload', (await page.locator('#earnedCount').textContent()) === '1');

// Spoiler setting hides secret, unearned trophies.
await page.locator('#spoilerToggle').check();
await page.waitForTimeout(300);
const hiddenName = await page.locator('article.trophy[data-id="3"] .t-name').textContent();
check('spoiler hides a secret story trophy', hiddenName.includes('Hidden trophy'), hiddenName);
await page.locator('#spoilerToggle').uncheck();
await page.waitForTimeout(200);

// Filters.
await page.locator('.chip[data-filter="missable"]').click();
await page.waitForTimeout(300);
check('missable filter shows 11 trophies', (await page.locator('.trophy').count()) === 11);
await page.locator('.chip[data-filter="all"]').click();
await page.fill('#searchInput', 'shooting range');
await page.waitForTimeout(300);
check('search "shooting range" finds 3 trophies', (await page.locator('.trophy').count()) === 3);
await page.fill('#searchInput', 'gold medal in all shooting');
await page.waitForTimeout(300);
check('search "gold medal in all shooting" finds 1 trophy', (await page.locator('.trophy').count()) === 1);
await page.fill('#searchInput', '');
await page.waitForTimeout(200);

// Export: capture the download.
const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
await page.locator('#exportBtn').click();
const download = await downloadPromise;
const exportPath = `/tmp/leonida-export-test.json`;
await download.saveAs(exportPath);
const exported = JSON.parse((await import('node:fs')).readFileSync(exportPath, 'utf8'));
check('export writes earned ids as JSON', Array.isArray(exported.earned) && exported.earned.includes(17), JSON.stringify(exported.earned));

// Import: a file with 5 earned trophies replaces the state.
const importPath = '/tmp/leonida-import-test.json';
writeFileSync(importPath, JSON.stringify({ earned: [1, 2, 3, 4, 5], spoiler: false }));
await page.locator('#importFile').setInputFiles(importPath);
await page.waitForTimeout(500);
check('import restores 5 earned trophies', (await page.locator('#earnedCount').textContent()) === '5');

// Roadmap and missables pages.
await page.goto(`${base}/#/roadmap`, { waitUntil: 'networkidle' });
await page.waitForSelector('.stage', { timeout: 10000 });
check('roadmap renders 4 stages', (await page.locator('.stage').count()) === 4);
await page.goto(`${base}/#/missables`, { waitUntil: 'networkidle' });
await page.waitForSelector('.trophy', { timeout: 10000 });
check('missables page renders 11 trophies', (await page.locator('.trophy').count()) === 11);

// Detail pane: open a trophy and read its guide and sources.
await page.goto(`${base}/#/tracker`, { waitUntil: 'networkidle' });
await page.locator('article.trophy[data-id="52"]').click();
await page.waitForTimeout(400);
const detailText = await page.locator('#detail').textContent();
check('detail pane shows guide + sources', detailText.includes('Guide') && detailText.includes('Exophase'), detailText.slice(0, 80));

check('no requests outside the app server', outside.length === 0, outside.join(', '));
await browser.close();

const failed = results.filter((r) => !r.ok).length;
console.log(failed === 0 ? 'ALL PLAYTEST CHECKS PASSED' : `${failed} CHECK(S) FAILED`);
process.exit(failed === 0 ? 0 : 1);
