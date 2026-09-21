// Hold's `tap` mode — the button that asks again in its own place.
//
// The whole point is that a destructive button becomes its own confirmation
// instead of opening a dialog, so the things worth checking are the ones that
// make that safe rather than merely pretty:
//
//   the first click must NOT do the thing (it only arms the button);
//   the second one must;
//   and every other answer — Escape, a click elsewhere, blur, the timeout —
//   must put the button back EXACTLY as it was, label and all.
//
// That last part is why the label is restored from a snapshot of the child
// nodes rather than from a remembered string: a button whose label is an icon
// plus text would otherwise come back as text alone.
// Run: npm run build && node tests/browser/hold-tap.mjs
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
const FIXTURE = '/__holdtap__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;padding:40px;background:#12151c;color:#fff;font:14px system-ui}
  button{font:inherit;padding:10px 18px;border-radius:10px;border:1px solid #ffffff33;background:#20242e;color:#fff}
  #elsewhere{margin-left:24px}
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
const page = await browser.newPage({ viewport: { width: 700, height: 240 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

await page.evaluate(() => {
  document.querySelector('main').innerHTML =
    '<button id="danger" data-kt-hold="tap" data-kt-mode="tap" data-kt-duration="900" data-kt-submit="false">'
    + '<span class="icon">✕</span> Delete</button><button id="elsewhere">Something else</button>';
  window.Kineto.init();
  window.__confirms = 0;
  window.__clicks = 0;
  const danger = document.getElementById('danger');
  danger.addEventListener('kt-hold-confirm', () => { window.__confirms += 1; });
  // A plain click listener is what a real page would have wired up, and it is
  // the thing the first press must not reach.
  danger.addEventListener('click', () => { window.__clicks += 1; });
});

const read = () => page.evaluate(() => {
  const danger = document.getElementById('danger');
  return {
    text: danger.textContent.trim(),
    armed: danger.classList.contains('kt-hold-armed'),
    markup: danger.innerHTML,
    confirms: window.__confirms,
    clicks: window.__clicks
  };
});

const rest = await read();
assert.deepEqual(errors, [], 'tap mode must not raise page errors');
assert.equal(rest.text, '✕ Delete', 'the button starts as itself');
assert.match(rest.markup, /<span class="icon">/, 'the button starts with its own markup');

// 1. first click arms it and reaches nothing.
await page.click('#danger');
const armed = await read();
assert.equal(armed.armed, true, 'the first click must arm the button');
assert.equal(armed.text, 'Sure?', `the label must become the question, got "${armed.text}"`);
assert.equal(armed.confirms, 0, 'the first click must not confirm');
assert.equal(armed.clicks, 0, 'the first click must not reach the page\'s own click handler');

// 2. Escape is an answer, and it is no — with the original markup back.
await page.keyboard.press('Escape');
const escaped = await read();
assert.equal(escaped.armed, false, 'Escape must disarm');
assert.equal(escaped.markup, rest.markup, 'Escape must put the button back exactly as it was, markup and all');
assert.equal(escaped.confirms, 0, 'Escape must not confirm');

// 3. a click anywhere else is also no.
await page.click('#danger');
await page.click('#elsewhere');
const away = await read();
assert.equal(away.armed, false, 'a click elsewhere must disarm');
assert.equal(away.markup, rest.markup, 'a click elsewhere must restore the markup');

// 4. so is running out of time.
await page.click('#danger');
assert.equal((await read()).armed, true, 'armed again');
await page.waitForTimeout(1300);
const expired = await read();
assert.equal(expired.armed, false, 'the arming must time out on its own');
assert.equal(expired.markup, rest.markup, 'the timeout must restore the markup');
assert.equal(expired.confirms, 0, 'none of the ways of saying no may confirm');

// 5. the second click is the yes.
await page.click('#danger');
await page.click('#danger');
const done = await read();
assert.equal(done.confirms, 1, 'the second click must confirm exactly once');
assert.equal(done.armed, false, 'confirming must leave the armed state');
assert.equal(done.markup, rest.markup, 'confirming must put the label back too');

// 6. the keyboard has to do all of this as well.
await page.evaluate(() => { window.__confirms = 0; window.Kineto.getInstance(document.getElementById('danger'), 'hold').reset(); });
await page.focus('#danger');
await page.keyboard.press('Enter');
assert.equal((await read()).armed, true, 'Enter must arm the button');
await page.keyboard.press('Enter');
assert.equal((await read()).confirms, 1, 'a second Enter must confirm');

// 7. teardown leaves no trace.
const after = await page.evaluate(() => {
  const danger = document.getElementById('danger');
  window.Kineto.destroyModule(danger, 'hold');
  return { markup: danger.innerHTML, classes: danger.className, style: danger.getAttribute('style'), fills: document.querySelectorAll('.kt-hold-fill').length };
});
assert.equal(after.markup, rest.markup, 'destroy() must leave the original markup');
assert.doesNotMatch(after.classes, /kt-hold/, 'destroy() must take its classes with it');
assert.equal(after.fills, 0, 'tap mode must never have inserted a gauge in the first place');
assert.equal(after.style, null, 'tap mode must not have touched the element\'s inline style');

await page.close();
await browser.close();
server.close();
console.log(`hold-tap OK (${browserName}) — first press arms without reaching the page, Escape / a click elsewhere / the timeout each restore the exact markup, the second press confirms once, and the keyboard does all of it.`);
