// Gesture's `pull` — pull-to-refresh on a scroll container.
//
// Two claims separate this from "drag an element down", and both are the kind
// that look fine in the DOM while being wrong on the page:
//
//   it must NOT engage unless the container is already at the top, or every
//   ordinary scroll turns into a refresh;
//   and it must RESIST — the content follows at a fraction of the finger and
//   stops growing near `max`, which is what tells your hand the gesture has an
//   end. A 1:1 follow feels like the list came loose.
//
// So this drags with real pointer events and measures the translation, then
// scrolls down and drags again to prove nothing happens.
// Run: npm run build && node tests/browser/gesture-pull.mjs
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName] || chromium;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const FIXTURE = '/__pull__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;padding:40px;background:#12151c;color:#fff;font:14px system-ui}
  .wrap{position:relative;width:320px}
  .list{max-height:200px;overflow:auto;border:1px solid #ffffff22;border-radius:12px}
  .list div{padding:14px 16px;border-bottom:1px solid #ffffff14}
</style></head><body><main></main><script src="/dist/kineto.umd.js"></script></body></html>`;
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === FIXTURE) {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(fixtureHtml());
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await browserType.launch({
  headless: true,
  ...(browserName === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
  args: browserName === 'chromium' ? ['--no-sandbox', '--disable-gpu'] : []
});
const page = await browser.newPage({ viewport: { width: 620, height: 420 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

await page.evaluate(() => {
  const rows = Array.from({ length: 14 }, (_, index) => `<div>Row ${index + 1}</div>`).join('');
  document.querySelector('main').innerHTML =
    `<div class="wrap"><div class="list" id="list" data-kt-gesture="pull" data-kt-preset="pull" data-kt-threshold="60" data-kt-max="110">${rows}</div></div>`;
  window.__refreshes = 0;
  window.__resolve = null;
  window.Kineto.init();
  // A page that returns a promise is the real case: the gesture has to stay
  // held until the page says it is finished.
  window.Kineto.getInstance(document.getElementById('list'), 'gesture');
  document.getElementById('list').addEventListener('kt-pull-refresh', () => { window.__refreshes += 1; });
});

const shift = () => page.evaluate(() => {
  const list = document.getElementById('list');
  const value = /translateY\(([-\d.]+)px\)/.exec(list.style.transform || '');
  return {
    offset: value ? Number(value[1]) : 0,
    refreshes: window.__refreshes,
    loading: list.classList.contains('kt-pull-loading'),
    say: document.querySelector('.kt-pull-label')?.textContent || ''
  };
});

const box = await page.locator('#list').boundingBox();
const drag = async (distance, { release = true } = {}) => {
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();
  for (let step = 1; step <= 6; step += 1) {
    await page.mouse.move(box.x + box.width / 2, box.y + 20 + (distance * step) / 6);
    await page.waitForTimeout(16);
  }
  if (release) await page.mouse.up();
};

// 1. a short pull resists and springs back without refreshing.
await drag(40, { release: false });
const short = await shift();
assert.deepEqual(errors, [], 'pull must not raise page errors');
assert.ok(short.offset > 4, `a pull must move the content, moved ${short.offset}px`);
assert.ok(short.offset < 40, `a pull must RESIST — 40px of finger moved it ${short.offset}px, which is no resistance at all`);
await page.mouse.up();
await page.waitForTimeout(500);
const sprung = await shift();
assert.ok(sprung.offset < 2, `a short pull must spring back, left at ${sprung.offset}px`);
assert.equal(sprung.refreshes, 0, 'a short pull must not refresh');

// 2. the resistance has an end: twice the finger is nowhere near twice the pull.
await drag(120, { release: false });
const far = await shift();
assert.ok(far.offset <= 110, `the pull must stop near max, reached ${far.offset}px of a 110px limit`);
assert.ok(far.offset > short.offset, 'pulling further must still move further, just less');
assert.match(far.say, /Release/i, `past the threshold the label must say to let go, got "${far.say}"`);

// 3. letting go past the threshold refreshes, and stays held until done().
await page.mouse.up();
await page.waitForTimeout(300);
const refreshing = await shift();
assert.equal(refreshing.refreshes, 1, 'letting go past the threshold must refresh exactly once');
await page.waitForTimeout(600);
const finished = await shift();
assert.ok(finished.offset < 2, `the container must come back once the refresh is over, left at ${finished.offset}px`);
assert.equal(finished.loading, false, 'the loading class must be cleared');

// 4. the important negative: scrolled away from the top, the gesture is off.
await page.evaluate(() => { document.getElementById('list').scrollTop = 80; });
await drag(120);
await page.waitForTimeout(400);
const scrolled = await shift();
assert.equal(scrolled.offset, 0, `a pull below the top must not engage, moved ${scrolled.offset}px`);
assert.equal(scrolled.refreshes, 1, 'a pull below the top must not refresh — that would turn every scroll into one');

// 5. teardown.
const after = await page.evaluate(() => {
  const list = document.getElementById('list');
  window.Kineto.destroyModule(list, 'gesture');
  return { indicators: document.querySelectorAll('.kt-pull-indicator').length, style: list.getAttribute('style') };
});
assert.equal(after.indicators, 0, 'destroy() must take the indicator with it');
assert.doesNotMatch(after.style || '', /overscroll-behavior|transform/, 'destroy() must leave no gesture styles behind');

await page.close();
await browser.close();
server.close();
console.log(`gesture-pull OK (${browserName}) — 40px of finger moved ${short.offset.toFixed(0)}px and 120px moved ${far.offset.toFixed(0)}px against a 110px limit, one refresh held until done(), and no engagement once scrolled off the top.`);
