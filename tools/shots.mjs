// Takes the entry's four screenshots with headless Chromium, served from the
// repo's own serve.ts. Usage: node tools/shots.mjs [baseUrl]
//   baseUrl defaults to http://localhost:8080
// The screenshots are real renders of app/ in the browser: the checklist
// cover, a trophy guide open in the detail pane, the roadmap, and the
// missables page with the spoiler setting on. Progress is seeded (13 of 55
// earned) so the tracker reads as a guide in use, not an empty list.
import { createRequire } from 'node:module';
import { mkdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const require = createRequire('/tmp/pw/node_modules/');
const { chromium } = require('playwright-core');

const base = process.argv[2] || 'http://localhost:8080';
const repo = process.cwd();
const shotsDir = join(repo, 'screenshots');
mkdirSync(shotsDir, { recursive: true });

// 13 earned: the opening chapters and missions, a few activities and moments.
const SEEDED_EARNED = [2, 3, 4, 5, 6, 8, 15, 16, 19, 21, 33, 42, 52];
const SEEDED_STATE = JSON.stringify({
  earned: SEEDED_EARNED,
  spoiler: false,
  filter: 'all',
});

const executablePath = join(
  homedir(),
  '.cache/ms-playwright/chromium-1148/chrome-linux/chrome',
);

const browser = await chromium.launch({ executablePath });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const outsideRequests = [];
page.on('request', (request) => {
  if (!request.url().startsWith(base)) outsideRequests.push(request.url());
});

await page.addInitScript((state) => {
  localStorage.setItem('leonida-ledger-v1', state);
}, SEEDED_STATE);

// 1 — cover: the checklist with progress, filters and the spoiler setting.
await page.goto(`${base}/#/tracker`, { waitUntil: 'networkidle' });
await page.waitForSelector('.trophy', { timeout: 10000 });
await page.waitForTimeout(400);
await page.screenshot({ path: join(shotsDir, '1-checklist.jpg'), type: 'jpeg', quality: 82 });

// 2 — a trophy's guide open: Hot Together, with its missable note and sources.
await page.locator('article.trophy[data-id="33"]').scrollIntoViewIfNeeded();
await page.locator('article.trophy[data-id="33"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: join(shotsDir, '2-detail.jpg'), type: 'jpeg', quality: 82 });

// 3 — the roadmap to the platinum, from the top of the page.
await page.goto(`${base}/#/roadmap`, { waitUntil: 'networkidle' });
await page.waitForSelector('.stage', { timeout: 10000 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: join(shotsDir, '3-roadmap.jpg'), type: 'jpeg', quality: 82 });

// 4 — the missables page with the spoiler setting on, switched on by
// clicking the toggle the way a reader would (the seed init script would
// overwrite a stored value on reload, so no reload is used here).
await page.goto(`${base}/#/missables`, { waitUntil: 'networkidle' });
await page.waitForSelector('.trophy', { timeout: 10000 });
await page.locator('#spoilerToggle').check();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: join(shotsDir, '4-missables.jpg'), type: 'jpeg', quality: 82 });

await browser.close();

for (const name of ['1-checklist.jpg', '2-detail.jpg', '3-roadmap.jpg', '4-missables.jpg']) {
  const size = statSync(join(shotsDir, name)).size;
  console.log(`${name}: ${size} bytes${size > 262144 ? ' — OVER 256 KiB!' : ''}`);
}
console.log(outsideRequests.length === 0
  ? 'No requests outside the app server.'
  : `Requests outside the app server: ${outsideRequests.join(', ')}`);
