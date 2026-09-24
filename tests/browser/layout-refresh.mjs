// A document that grows by itself must not leave ScrollTrigger positions behind.
//
// The failure this guards: on the demo, content above a pinned Sticky Stack
// grew after start-up (images, folded cards), ScrollTrigger kept the old
// start/end, and the pinned cards were drawn over the content that moved in
// under them. The core now watches the body's height while a scroll-driven
// instance lives and refreshes ScrollTrigger once the height settles
// (src/layoutRefresh.js).
//
// Checked here:
//   1. growing a block above a trigger moves the trigger's start by the growth;
//   2. the refresh is debounced — a height animated over many frames costs one
//      refresh, and an idle page costs none (no refresh → pin-spacer → refresh loop);
//   3. `Kineto.config({ autoRefresh: false })` leaves positions to the page;
//   4. destroying the last scroll-driven instance stops the watcher.
// Run: node tests/browser/layout-refresh.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.join(root, pathname);
  if (!file.startsWith(root)) { response.writeHead(403); response.end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html' });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const origin = `http://127.0.0.1:${port}`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] }
  : { headless: true });

// A plain page: a block that will grow, then a reveal whose ScrollTrigger start
// depends on everything above it, then a pinned sticky stack.
const pageHtml = `<!doctype html><html><head><meta charset="utf-8">
  <style>body{margin:0}#grow{height:300px;background:#ddd}.gap{height:900px}
  .stack{height:300px}.stack>div{height:300px;background:#bbb}</style></head><body>
  <div id="grow"></div>
  <div class="gap"></div>
  <h2 id="title" data-kt-reveal="fade-up">Reveal</h2>
  <div class="gap"></div>
  <div class="stack" data-kt-sticky-stack><div>A</div><div>B</div><div>C</div></div>
  <div class="gap"></div>
  <script src="${origin}/node_modules/gsap/dist/gsap.min.js"></script>
  <script src="${origin}/node_modules/gsap/dist/ScrollTrigger.min.js"></script>
  <script src="${origin}/dist/kineto.umd.js"></script>
</body></html>`;

async function openPage(config = {}) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  page.on('pageerror', (error) => { throw error; });
  await page.route(`${origin}/fixture.html`, (route) => route.fulfill({ contentType: 'text/html', body: pageHtml }));
  await page.goto(`${origin}/fixture.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.Kineto && window.gsap && window.ScrollTrigger));
  await page.evaluate((options) => {
    window.Kineto.setAnimationEngine({ gsap: window.gsap, ScrollTrigger: window.ScrollTrigger });
    window.Kineto.config(options);
    window.__refreshes = 0;
    window.ScrollTrigger.addEventListener('refresh', () => { window.__refreshes += 1; });
    window.Kineto.init(document);
  }, config);
  await page.waitForFunction(() => window.ScrollTrigger.getAll().length >= 2);
  // Let start-up settle: the first refreshes (load, pin spacers) happen here.
  await page.waitForTimeout(600);
  return page;
}

const revealStart = (page) => page.evaluate(() => {
  const title = document.getElementById('title');
  const trigger = window.ScrollTrigger.getAll().find((item) => item.trigger === title);
  return trigger ? Math.round(trigger.start) : null;
});

// 1 + 2. Growth moves the trigger; idle costs nothing; an animation costs one.
{
  const page = await openPage();
  const before = await revealStart(page);
  assert.ok(Number.isFinite(before), 'the reveal must have a ScrollTrigger');

  const idleStart = await page.evaluate(() => window.__refreshes);
  await page.waitForTimeout(800);
  const idleRefreshes = await page.evaluate(() => window.__refreshes) - idleStart;
  assert.equal(idleRefreshes, 0, `an idle page must not refresh (refreshed ${idleRefreshes} times — a refresh loop)`);

  // Grow by 600px over ~20 frames, the way a folding block or accordion does.
  const animatedStart = await page.evaluate(() => window.__refreshes);
  await page.evaluate(() => new Promise((resolve) => {
    const block = document.getElementById('grow');
    let frame = 0;
    const step = () => {
      frame += 1;
      block.style.height = `${300 + frame * 30}px`;
      if (frame < 20) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  }));
  await page.waitForTimeout(700);
  const after = await revealStart(page);
  const animatedRefreshes = await page.evaluate(() => window.__refreshes) - animatedStart;
  assert.ok(Math.abs(after - before - 600) <= 2,
    `a trigger below a block that grew 600px must move 600px (was ${before}, now ${after})`);
  assert.ok(animatedRefreshes >= 1 && animatedRefreshes <= 2,
    `a height animated over 20 frames must cost one settled refresh, got ${animatedRefreshes}`);

  // 4. Destroying every scroll-driven instance stops the watcher.
  await page.evaluate(() => { window.Kineto.destroy(); window.__refreshes = 0; document.getElementById('grow').style.height = '100px'; });
  await page.waitForTimeout(600);
  assert.equal(await page.evaluate(() => window.__refreshes), 0, 'no watcher may outlive the last scroll-driven instance');
  await page.close();
}

// 3. Opt-out.
{
  const page = await openPage({ autoRefresh: false });
  const before = await revealStart(page);
  await page.evaluate(() => { document.getElementById('grow').style.height = '900px'; });
  await page.waitForTimeout(700);
  assert.equal(await revealStart(page), before, 'autoRefresh:false must leave ScrollTrigger positions to the page');
  await page.evaluate(() => window.Kineto.config({ autoRefresh: true }));
  await page.close();
}

await browser.close();
server.close();
console.log(`layout-refresh OK (${browserName}) — a 600px growth moved the trigger 600px with one settled refresh, an idle page refreshed 0 times, the opt-out held, and destroy stopped the watcher.`);
