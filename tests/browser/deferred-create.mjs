// Kineto.config({ defer: true }) — create an effect only when it nears the screen.
//
// Why this exists: scan() created every effect on the page at start-up. The
// demo has 500+; on a phone that held the main thread for seconds after load
// for effects nobody could see yet. With `defer`, modules that declare
// `defer: true` wait until their element comes within one viewport, while
// pins, page-level modules and components (keyboard/ARIA) are still created at
// once, and direct JavaScript calls are never deferred.
//
// Held here, in a real browser:
//   1. deferred modules below the fold are not created at init, eager ones are;
//   2. scrolling near creates them — with the options the markup has THEN;
//   3. a direct `Kineto.reveal(el)` call is created at once;
//   4. `destroy()` forgets queued work, and a removed element never starts;
//   5. without `defer` (the default) everything is created at init, as before.
//
// Run: npm run build && node tests/browser/deferred-create.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported KT_BROWSER: ${browserName}`);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

const fixture = (defer) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;font:16px system-ui} .box{height:120px;margin:20px}
</style></head><body>
<div class="box" id="top" data-kt-reveal="fade">near the top</div>
<div style="height:3000px"></div>
<div class="box" id="far-reveal" data-kt-reveal="fade" data-kt-duration="0.4">far reveal</div>
<div style="height:3000px"></div>
<div class="box" id="far-tabs" data-kt-tabs><div role="tablist"><button>A</button><button>B</button></div><div role="tabpanel">A</div><div role="tabpanel" hidden>B</div></div>
<div style="height:3000px"></div>
<div class="box" id="far-split" data-kt-text-split="chars">split me</div>
<div class="box" id="far-gone" data-kt-text-split="words">removed before it is reached</div>
<div class="box" id="far-direct">created from JavaScript</div>
<div style="height:3000px"></div>
<script src="/node_modules/gsap/dist/gsap.min.js"></script>
<script src="/node_modules/gsap/dist/ScrollTrigger.min.js"></script>
<script src="/dist/kineto.umd.js"></script>
<script>window.Kineto.config({ defer: ${defer} }); window.Kineto.init(); window.Kineto.reveal(document.getElementById('far-direct'));</script>
</body></html>`;

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/__defer__.html') {
    response.writeHead(200, { 'content-type': MIME['.html'] });
    response.end(fixture(url.searchParams.get('defer') === '1'));
    return;
  }
  const file = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404).end(); return; }
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

const created = (page) => page.evaluate(() => {
  const has = (id, name) => Boolean(window.Kineto.getInstance(document.getElementById(id), name));
  return {
    top: has('top', 'reveal'), farReveal: has('far-reveal', 'reveal'), tabs: has('far-tabs', 'tabs'),
    split: has('far-split', 'textSplit'), direct: has('far-direct', 'reveal')
  };
});
// Wait for a condition on rendered frames rather than a guessed duration.
const until = (page, check, arg) => page.waitForFunction(check, arg, { timeout: 10000 });

try {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(`${origin}/__defer__.html?defer=1`, { waitUntil: 'load' });
  await until(page, () => Boolean(window.Kineto.getInstance(document.getElementById('top'), 'reveal')));

  // 1. Only what can be reached is created; eager modules and JS calls are.
  assert.deepEqual(await created(page), { top: true, farReveal: false, tabs: true, split: false, direct: true },
    'with defer, far effects wait; tabs (a component) and a direct JS call do not');

  // 2. Coming near creates it, with the markup's options at that moment.
  await page.evaluate(() => document.getElementById('far-reveal').setAttribute('data-kt-duration', '0.9'));
  await page.evaluate(() => window.scrollTo(0, 2600));
  await until(page, () => Boolean(window.Kineto.getInstance(document.getElementById('far-reveal'), 'reveal')));
  const options = await page.evaluate(() => window.Kineto.getInstance(document.getElementById('far-reveal'), 'reveal').options?.duration);
  assert.equal(Number(options), 0.9, 'a deferred instance reads its options when it is created');
  assert.equal((await created(page)).split, false, 'an element three screens further still waits');

  // 4. A removed element never starts; destroy() forgets what is queued.
  await page.evaluate(() => { window.__gone = document.getElementById('far-gone'); window.__gone.remove(); });
  await page.evaluate(() => window.scrollTo(0, document.getElementById('far-split').offsetTop - 300));
  await until(page, () => Boolean(window.Kineto.getInstance(document.getElementById('far-split'), 'textSplit')));
  assert.equal(await page.evaluate(() => Boolean(window.Kineto.getInstance(window.__gone, 'textSplit'))), false,
    'an element removed while it waited is never created');
  await page.evaluate(() => { window.Kineto.destroy(); window.scrollTo(0, 0); });
  const afterDestroy = await page.evaluate(() => window.Kineto.instanceCount);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => window.Kineto.instanceCount), afterDestroy, 'destroy() must cancel queued creation');
  assert.equal(afterDestroy, 0, 'destroy() leaves nothing behind');
  assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
  await page.close();

  // 5. The default is unchanged: everything at init.
  const eager = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await eager.goto(`${origin}/__defer__.html?defer=0`, { waitUntil: 'load' });
  await until(eager, () => Boolean(window.Kineto.getInstance(document.getElementById('far-split'), 'textSplit')));
  assert.deepEqual(await created(eager), { top: true, farReveal: true, tabs: true, split: true, direct: true },
    'without defer every effect is created at init');
  await eager.close();

  console.log(`deferred-create OK (${browserName}) — far effects wait for the viewport and read their options then, components and JS calls are immediate, destroy() and removal cancel queued work, and the default still creates everything at init.`);
} finally {
  await browser.close();
  server.close();
}
