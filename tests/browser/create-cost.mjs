// What does it cost to create many instances at once?
//
// Overflow Text used to measure itself inside create(): write the DOM, read a
// width, write again. A page creating hundreds of them in one scan (the demo
// has 236, one per settings title) therefore laid itself out once PER INSTANCE
// — about half a second of forced layouts. It now measures in the shared
// layout pass (measureThenApply in src/utils.js): every instance builds its
// DOM, then all of them read in one layout on the next frame, then all apply.
//
// This test holds that, and the behaviour around it:
//   1. creating 150 instances forces (almost) no synchronous layout — counted
//      from a Chromium performance trace;
//   2. one frame later, overflowing lines move and lines that fit rest with an
//      ellipsis, exactly as before;
//   3. pausing and resuming a line that fits leaves its DOM alone — the core
//      resumes every instance each time it scrolls back into view, and a
//      rebuild there used to cost a layout per scroll;
//   4. a paused instance whose measurement lands later starts paused;
//   5. Lazy images (no width/height) created together share ONE layout too —
//      the shared media wrapper used to read the parent's box between each
//      image's DOM writes (24 images on the demo: most of a second on a phone),
//      and the wrapper still gets the box it needs, before the next frame.
//
// Run: npm run build && node tests/browser/create-cost.mjs
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
const FIXTURE = '/__create_cost__.html';
const MEDIA_FIXTURE = '/__create_cost_media__.html';
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const mediaFixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;display:grid;grid-template-columns:repeat(8,1fr);gap:8px;padding:8px}
  .stage{height:90px;border:1px solid #ccc}
  .loose{border:1px solid #ccc;align-self:start}
</style></head><body>
${Array.from({ length: 40 }, (_, index) => `<div class="${index % 2 ? 'loose' : 'stage'}"><img class="media" data-src="${PIXEL}" alt=""></div>`).join('\n')}
<script src="/dist/kineto.umd.js"></script></body></html>`;
const LONG = 'A settings title long enough to overflow its box';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;font:14px/1.4 system-ui;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;padding:8px}
  .cell{border:1px solid #ccc;padding:6px}
  .line{width:120px}
</style></head><body>
${Array.from({ length: 150 }, (_, index) => `<div class="cell"><div class="line" id="line-${index}" data-overflow-text="${index % 3 === 2 ? 'short' : 'long'}">${index % 3 === 2 ? 'Fits' : LONG}</div></div>`).join('\n')}
<script src="/node_modules/gsap/dist/gsap.min.js"></script>
<script src="/dist/kineto.umd.js"></script></body></html>`;

const server = http.createServer((request, response) => {
  if (request.method !== 'GET') { response.writeHead(405).end(); return; }
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === FIXTURE || pathname === MEDIA_FIXTURE) {
    response.writeHead(200, { 'content-type': MIME['.html'] });
    response.end(pathname === FIXTURE ? fixtureHtml() : mediaFixtureHtml());
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
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
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

// Create every instance in ONE task, as a scan does.
const createAll = () => page.evaluate(() => {
  document.querySelectorAll('[data-overflow-text]').forEach((el) => {
    window.Kineto.create('overflowText', el, { mode: 'bounce', delay: 0, speed: 120 });
  });
});

// 1. Forced layouts while creating (Chromium exposes them in its trace: a
//    Layout event that carries a JavaScript stack was forced by a read).
let forcedLayouts = null;
if (browserName === 'chromium') {
  const cdp = await context.newCDPSession(page);
  const events = [];
  cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
  const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline.stack', transferMode: 'ReportEvents' });
  await createAll();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await cdp.send('Tracing.end');
  await complete;
  forcedLayouts = events.filter((event) => event.name === 'Layout' && event.args?.beginData?.stackTrace?.length).length;
  if (process.env.KT_DEBUG) console.log('layouts', events.filter((event) => event.name === 'Layout').length, 'forced', forcedLayouts);
  assert.ok(forcedLayouts <= 3,
    `creating 150 Overflow Text instances together must not lay the page out once per instance: ${forcedLayouts} forced layouts`);
} else {
  await createAll();
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

// 2. The same decisions as before, one frame later.
const state = await page.evaluate(() => {
  const read = (kind) => [...document.querySelectorAll(`[data-overflow-text="${kind}"]`)].map((el) => ({
    active: el.dataset.ktOverflowActive,
    moving: el.querySelector('.kt-overflow-text-track')?.getAnimations().length > 0,
    ellipsis: el.querySelector('.kt-overflow-text-track')?.style.textOverflow
  }));
  return { long: read('long'), short: read('short') };
});
assert.ok(state.long.length === 100 && state.long.every((line) => line.active === 'true' && line.moving),
  'every overflowing line must move once measured');
assert.ok(state.short.length === 50 && state.short.every((line) => line.active === 'false' && !line.moving && line.ellipsis === 'ellipsis'),
  'every line that fits must rest, truncated with an ellipsis');

// 3. Pause → resume on a line that fits must not rebuild it.
const untouched = await page.evaluate(() => {
  const el = document.querySelector('[data-overflow-text="short"]');
  const track = el.querySelector('.kt-overflow-text-track');
  const instance = window.Kineto.getInstance(el, 'overflowText');
  instance.pause();
  instance.resume();
  return el.querySelector('.kt-overflow-text-track') === track;
});
assert.equal(untouched, true, 'resuming a line that fits must leave its DOM as it was');

// 4. Paused before its measurement lands: it starts paused, and resume() runs it.
const pausedStart = await page.evaluate(async () => {
  // At the top: off screen, the core would rightly hold resume() back.
  window.scrollTo(0, 0);
  const host = document.body.insertBefore(document.createElement('div'), document.body.firstChild);
  host.className = 'line';
  host.textContent = 'Another title that is far too long for the box it sits in';
  const instance = window.Kineto.create('overflowText', host, { mode: 'bounce', delay: 0, speed: 120 });
  instance.pause();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const animation = () => host.querySelector('.kt-overflow-text-track').getAnimations()[0];
  const whilePaused = animation()?.playState;
  instance.resume();
  const afterResume = animation()?.playState;
  instance.destroy();
  return { whilePaused, afterResume };
});
assert.deepEqual(pausedStart, { whilePaused: 'paused', afterResume: 'running' },
  'an instance paused before it was measured must start paused, and run on resume()');
assert.deepEqual(errors, [], 'no page errors');

// 5. Lazy images created in one task: one shared layout, and each wrapper still
//    fills a parent that has a box (a stage) or reserves 16:9 when it would
//    collapse (a parent with no height and an image not loaded yet).
const media = await context.newPage();
await media.goto(`${origin}${MEDIA_FIXTURE}`, { waitUntil: 'load' });
const createMedia = () => media.evaluate(() => {
  document.querySelectorAll('img.media').forEach((img) => window.Kineto.create('lazy', img, { effect: 'fade' }));
});
let mediaLayouts = null;
if (browserName === 'chromium') {
  const cdp = await context.newCDPSession(media);
  const events = [];
  cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
  const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
  await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline.stack', transferMode: 'ReportEvents' });
  await createMedia();
  await cdp.send('Tracing.end');
  await complete;
  mediaLayouts = events.filter((event) => event.name === 'Layout' && event.args?.beginData?.stackTrace?.length).length;
  assert.ok(mediaLayouts <= 3, `creating 40 Lazy images together must not lay the page out once per image: ${mediaLayouts} forced layouts`);
} else {
  await createMedia();
}
// Checked right after the creating task — before a frame could paint.
const boxes = await media.evaluate(() => [...document.querySelectorAll('img.media')].map((img) => {
  const wrap = img.parentElement;
  return { stage: wrap.parentElement.classList.contains('stage'), height: wrap.style.height, ratio: wrap.style.aspectRatio, wrapped: wrap.classList.contains('kt-lazy-wrap') };
}));
assert.ok(boxes.every((box) => box.wrapped), 'every image is wrapped');
assert.ok(boxes.filter((box) => box.stage).every((box) => box.height === '100%'), `a wrapper fills a parent that has a box (${JSON.stringify(boxes.slice(0, 2))})`);
assert.ok(boxes.filter((box) => !box.stage).every((box) => /16 \/ 9/.test(box.ratio)), `a wrapper that would collapse reserves 16:9 (${JSON.stringify(boxes.slice(0, 2))})`);
await media.close();

await browser.close();
server.close();
console.log(`create-cost OK (${browserName}) — 150 Overflow Text instances created with ${forcedLayouts ?? 'n/a'} forced layouts and 40 Lazy images with ${mediaLayouts ?? 'n/a'}; fit/overflow decisions, wrapper boxes, quiet resume and paused start verified.`);
