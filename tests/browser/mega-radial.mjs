// Mega-menu's `radial` layout — the items that fan out around their trigger.
//
// The thing worth measuring here is GEOMETRY, and it has to be measured from
// the pixels the browser actually laid out rather than from the numbers the
// module wrote down. Reading back the custom properties would only prove that
// setProperty works; what matters is where the links ended up on screen.
//
// So every check below is taken from getBoundingClientRect():
//
//   every item ends up `radius` away from the trigger's centre;
//   the angles are the arc the options asked for, in the clockwise-from-noon
//     convention the option names promise;
//   a closed menu has every item back ON the trigger, which is what makes the
//     ring collapse rather than disappear;
//   and destroy() leaves the markup exactly as it found it.
//
// Run: npm run build && node tests/browser/mega-radial.mjs
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
const FIXTURE = '/__megaradial__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;background:#12151c;color:#fff;font:14px system-ui}
  main{height:520px;display:flex;align-items:center;justify-content:center}
  nav ul{list-style:none;margin:0;padding:0}
  button{font:inherit;padding:10px 18px;border-radius:10px;border:1px solid #ffffff33;background:#20242e;color:#fff}
  .kt-menu-panel a{background:#20242e;padding:6px 10px;border-radius:999px}
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
const page = await browser.newPage({ viewport: { width: 900, height: 520 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

const ITEMS = ['One', 'Two', 'Three', 'Four', 'Five'];
const markup = (attributes) => '<nav id="ring" data-kt-mega-menu="radial" '
  + `data-kt-trigger="click" ${attributes}><ul><li>`
  + '<button type="button" id="trigger">Menu</button>'
  + '<div class="kt-menu-panel"><ul>'
  + ITEMS.map((label) => `<li><a href="#${label.toLowerCase()}">${label}</a></li>`).join('')
  + '</ul></div></li></ul></nav>';

const build = async (attributes) => {
  await page.evaluate((html) => {
    if (window.__ring) window.Kineto.destroyModule(document.getElementById('ring'), 'megaMenu');
    document.querySelector('main').innerHTML = html;
    window.Kineto.init();
    window.__ring = true;
  }, markup(attributes));
};

// Where each item's centre sits relative to the trigger's centre, in the same
// clockwise-from-noon degrees the options are written in.
const polar = () => page.evaluate(() => {
  const centre = (node) => {
    const box = node.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  };
  const origin = centre(document.getElementById('trigger'));
  return [...document.querySelectorAll('#ring .kt-menu-panel a')].map((node) => {
    const point = centre(node);
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    return {
      distance: Math.hypot(dx, dy),
      // atan2 measures anticlockwise from 3 o'clock on a y-up plane; the page's
      // y runs down, so this is already clockwise — the +90 puts 0 at noon.
      angle: (Math.atan2(dy, dx) * 180) / Math.PI + 90
    };
  });
});
const norm = (angle) => { let a = angle; while (a > 180) a -= 360; while (a <= -180) a += 360; return a; };
const settle = () => page.waitForTimeout(700);

// ── 1. the default half-ring ────────────────────────────────────────────────
await build('data-kt-layout="radial" data-kt-radius="120" data-kt-start-angle="-90" data-kt-sweep="180" data-kt-stagger="0"');
await page.click('#trigger');
await settle();
const half = await polar();
assert.deepEqual(errors, [], 'the radial layout must not raise page errors');
assert.equal(half.length, ITEMS.length, 'every link must be placed on the ring');
for (const [index, item] of half.entries()) {
  assert.ok(Math.abs(item.distance - 120) < 2,
    `item ${index} must sit 120px from the trigger, measured ${item.distance.toFixed(1)}px`);
  const expected = -90 + (180 * index) / (ITEMS.length - 1);
  assert.ok(Math.abs(norm(item.angle - expected)) < 1.5,
    `item ${index} must sit at ${expected}°, measured ${item.angle.toFixed(1)}°`);
}
// The convention the option names promise: 0 is straight up, and the angle
// grows clockwise. -90 is therefore the item furthest to the LEFT, +90 the one
// furthest to the right, and the middle item directly above the trigger.
const screen = await page.evaluate(() => {
  const box = (selector, index) => document.querySelectorAll(selector)[index].getBoundingClientRect();
  const trigger = document.getElementById('trigger').getBoundingClientRect();
  const first = box('#ring .kt-menu-panel a', 0);
  const middle = box('#ring .kt-menu-panel a', 2);
  const last = box('#ring .kt-menu-panel a', 4);
  return {
    firstX: first.left + first.width / 2,
    middleX: middle.left + middle.width / 2,
    middleY: middle.top + middle.height / 2,
    lastX: last.left + last.width / 2,
    triggerX: trigger.left + trigger.width / 2,
    triggerY: trigger.top + trigger.height / 2
  };
});
assert.ok(screen.firstX < screen.triggerX - 100, 'startAngle -90 must put the first item to the left');
assert.ok(screen.lastX > screen.triggerX + 100, 'the sweep must carry the last item to the right');
assert.ok(Math.abs(screen.middleX - screen.triggerX) < 2, 'the middle item must sit directly above the trigger');
assert.ok(screen.middleY < screen.triggerY - 100, 'and above it, not below — 0° is noon, not six o\'clock');

// ── 2. closing collapses the ring onto the trigger ──────────────────────────
// Not "hides it": the items have to travel home, which is the difference
// between a ring that closes and a panel that vanishes.
await page.click('#trigger');
await page.waitForTimeout(120);
const midClose = await polar();
assert.ok(midClose.every((item) => item.distance < 120),
  'every item must be on its way back before the panel is allowed to disappear');
await settle();
const closed = await page.evaluate(() => document.querySelector('#ring .kt-menu-panel').hidden);
assert.equal(closed, true, 'the panel must be hidden once the last item is home');

// ── 3. a full circle must not stack two items on the same point ─────────────
await build('data-kt-layout="radial" data-kt-radius="140" data-kt-start-angle="0" data-kt-sweep="360" data-kt-stagger="0"');
await page.click('#trigger');
await settle();
const full = await polar();
const step = 360 / ITEMS.length;
for (const [index, item] of full.entries()) {
  assert.ok(Math.abs(item.distance - 140) < 2, `full-circle item ${index} must sit on the 140px ring`);
  assert.ok(Math.abs(norm(item.angle - step * index)) < 1.5,
    `full-circle item ${index} must sit at ${step * index}°, measured ${item.angle.toFixed(1)}°`);
}
const gaps = full.map((item, index) => Math.abs(norm(item.angle - full[(index + 1) % full.length].angle)));
assert.ok(gaps.every((gap) => gap > step - 2), 'a full circle must space the items evenly, not double one up');

// ── 4. the stagger is a real head start, not a decoration ───────────────────
await build('data-kt-layout="radial" data-kt-radius="120" data-kt-start-angle="-90" data-kt-sweep="180" data-kt-stagger="200"');
await page.click('#trigger');
await page.waitForTimeout(90);
const early = await polar();
assert.ok(early[0].distance > early[4].distance + 20,
  `the first item must be well ahead of the last, measured ${early[0].distance.toFixed(1)}px vs ${early[4].distance.toFixed(1)}px`);
await page.waitForTimeout(1600);
const late = await polar();
assert.ok(late.every((item) => Math.abs(item.distance - 120) < 2), 'everyone arrives in the end');

// ── 5. the ring resizes from CSS alone ──────────────────────────────────────
// `radius` is fixed when the menu is built, but a phone needs a smaller circle
// than the desktop card the menu was authored for — and that is a media query's
// job. `--kt-menu-ring-scale` is the hook, so it has to move real pixels.
// Its own ring, with no stagger: the previous step left one whose last item
// does not start moving for 800ms, and this check is about distance, not timing.
await build('data-kt-layout="radial" data-kt-radius="120" data-kt-start-angle="-90" data-kt-sweep="180" data-kt-stagger="0"');
await page.click('#trigger');
await settle();
await page.evaluate(() => { document.getElementById('ring').style.setProperty('--kt-menu-ring-scale', '0.5'); });
await settle();
const scaled = await polar();
for (const [index, item] of scaled.entries()) {
  assert.ok(Math.abs(item.distance - 60) < 2,
    `--kt-menu-ring-scale must halve the ring, item ${index} measured ${item.distance.toFixed(1)}px`);
}
await page.evaluate(() => { document.getElementById('ring').style.removeProperty('--kt-menu-ring-scale'); });

// ── 5. the other layouts are untouched ──────────────────────────────────────
await build('data-kt-layout="dropdown"');
const dropdown = await page.evaluate(() => {
  const panel = document.querySelector('#ring .kt-menu-panel');
  const items = [...panel.querySelectorAll('a')];
  return {
    ringClasses: items.filter((node) => node.classList.contains('kt-menu-item')).length,
    inlineStyles: items.filter((node) => node.hasAttribute('style')).length,
    stacked: panel.classList.contains('kt-menu-ring-open')
  };
});
assert.equal(dropdown.ringClasses, 0, 'a dropdown must not be marked up as a ring');
assert.equal(dropdown.inlineStyles, 0, 'a dropdown must not carry the ring geometry');
assert.equal(dropdown.stacked, false, 'a dropdown has no ring state to open');

// ── 6. destroy() leaves nothing behind ──────────────────────────────────────
await build('data-kt-layout="radial" data-kt-radius="120" data-kt-stagger="0"');
// The baseline is the markup as AUTHORED — parsed in a detached element so the
// module never touches it. Reading it off the live nav after init() would bake
// the module's own attributes into the thing destroy() is measured against.
const before = await page.evaluate((html) => {
  const scratch = document.createElement('div');
  scratch.innerHTML = html;
  return scratch.firstElementChild.innerHTML;
}, markup('data-kt-layout="radial" data-kt-radius="120" data-kt-stagger="0"'));
await page.click('#trigger');
await settle();
const after = await page.evaluate(() => {
  const nav = document.getElementById('ring');
  window.Kineto.destroyModule(nav, 'megaMenu');
  return {
    html: nav.innerHTML,
    items: document.querySelectorAll('.kt-menu-item').length,
    classes: nav.className
  };
});
assert.equal(after.items, 0, 'destroy() must take the ring markers with it');
assert.equal(after.html, before, 'destroy() must leave the panel exactly as it found it');
assert.doesNotMatch(after.classes, /kt-menu/, 'destroy() must take the layout classes too');
assert.deepEqual(errors, [], 'nothing above may have raised a page error');

await page.close();
await browser.close();
server.close();
console.log(`mega-radial OK (${browserName}) — items measured on the arc the options asked for, a full circle spaced evenly, the stagger a real head start, --kt-menu-ring-scale resizing the ring from CSS, the ring collapsing home before the panel leaves, and destroy() restoring the markup byte for byte.`);
