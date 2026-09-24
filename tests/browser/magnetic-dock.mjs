// Magnetic's `dock` variant — a row that magnifies around the pointer.
//
// The part that makes it a dock rather than "icons that get bigger" is the
// RE-PACKING: the row has to open up so the grown icon has somewhere to be.
// Without it the icons simply scale into each other and the row reads as a pile,
// which is exactly the failure that looks fine in the DOM — the transforms are
// all there, the neighbours just never moved.
//
// So this measures geometry: sizes AND centres, at rest and under the pointer.
// Run: npm run build && node tests/browser/magnetic-dock.mjs
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
const FIXTURE = '/__dock__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;background:#12151c;height:100vh;display:flex;align-items:flex-end;justify-content:center;padding-bottom:80px}
  .dock{display:flex;gap:12px;align-items:flex-end}
  .dock span{display:block;width:50px;height:50px;border-radius:14px;background:#ff5b1c}
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
const page = await browser.newPage({ viewport: { width: 900, height: 300 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

const geometry = () => page.evaluate(() => Array.from(document.querySelectorAll('.dock span')).map((node) => {
  const box = node.getBoundingClientRect();
  return { width: Math.round(box.width), centre: Math.round(box.left + box.width / 2), bottom: Math.round(box.bottom) };
}));

await page.evaluate(() => {
  document.querySelector('main').innerHTML =
    '<div class="dock" data-kt-magnetic="dock" data-kt-max-scale="2" data-kt-range="140" data-kt-lift="18">'
    + Array.from({ length: 7 }, () => '<span></span>').join('') + '</div>';
  window.Kineto.init();
});
await page.waitForTimeout(250);
const rest = await geometry();
assert.deepEqual(errors, [], 'dock must not raise page errors');
assert.ok(rest.every((entry) => entry.width === 50), `every icon rests at its own size, got ${rest.map((e) => e.width).join(',')}`);

// Point at the middle icon and let the easing settle.
const target = rest[3];
await page.mouse.move(target.centre, rest[3].bottom - 25);
await page.waitForTimeout(700);
const hovered = await geometry();

const widths = hovered.map((entry) => entry.width);
assert.ok(widths[3] >= 90, `the icon under the pointer must reach about twice its size, got ${widths[3]}`);
// A dock falls away from the pointer: each step out is smaller than the last.
assert.ok(widths[2] < widths[3] && widths[1] < widths[2], `the row must fall away leftward, got ${widths.join(',')}`);
assert.ok(widths[4] < widths[3] && widths[5] < widths[4], `the row must fall away rightward, got ${widths.join(',')}`);
assert.ok(widths[0] <= 56 && widths[6] <= 56, `the far ends must stay near their rest size, got ${widths.join(',')}`);

// The re-packing: neighbours have to move out of the way, and by MORE than the
// grown icon's own edge — otherwise they are simply being overlapped.
const leftShift = rest[2].centre - hovered[2].centre;
const rightShift = hovered[4].centre - rest[4].centre;
assert.ok(leftShift > 8, `the icon left of the pointer must slide aside, moved ${leftShift}px`);
assert.ok(rightShift > 8, `the icon right of the pointer must slide aside, moved ${rightShift}px`);
const gap = hovered[4].centre - hovered[3].centre - (hovered[4].width + hovered[3].width) / 2;
assert.ok(gap > -1, `the grown icon must not overlap its neighbour, ${gap.toFixed(1)}px between them`);

// …and it lifts, which is the other half of a dock.
assert.ok(rest[3].bottom - hovered[3].bottom > 6, 'the icon under the pointer must rise');

// A one-pixel crossing of a rest midpoint must not change the packing anchor
// by a whole icon. Test both directions after settling to separate geometry
// discontinuities from frame-rate noise.
const midpoint = (rest[3].centre + rest[4].centre) / 2;
for (const direction of [1, -1]) {
  await page.mouse.move(midpoint - direction, target.bottom - 25);
  await page.waitForTimeout(700);
  const before = await geometry();
  await page.mouse.move(midpoint + direction, target.bottom - 25);
  await page.waitForTimeout(700);
  const after = await geometry();
  const jump = Math.max(...after.map((entry, index) => Math.abs(entry.centre - before[index].centre)));
  assert.ok(jump <= 4, `a 2px midpoint crossing must remain continuous, row jumped ${jump}px`);
}

// A steady sweep must move the row smoothly. The dock in v0.11.0 visibly
// stuttered ("끊겨 보임") when the pointer moved sideways: its packing anchor and
// its scales were eased separately and the row re-packed between neighbouring
// centres, so icons flipped direction within a few frames (83 such flips and a
// per-frame velocity change of 56 px measured on that build) even though every
// single frame looked plausible. Sample every icon on every frame of a sweep
// across and back, and count those flips.
await page.mouse.move(rest[0].centre - 40, target.bottom - 25);
await page.waitForTimeout(500);
await page.evaluate(() => {
  const icons = [...document.querySelectorAll('.dock span')];
  window.__dockFrames = [];
  const sample = () => {
    window.__dockFrames.push(icons.map((node) => new DOMMatrix(getComputedStyle(node).transform).e));
    if (window.__dockFrames.length < 420) requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
});
const sweepFrom = rest[0].centre - 40;
const sweepTo = rest[rest.length - 1].centre + 40;
for (let x = sweepFrom; x <= sweepTo; x += 3) { await page.mouse.move(x, target.bottom - 25); await page.waitForTimeout(8); }
for (let x = sweepTo; x >= sweepFrom; x -= 3) { await page.mouse.move(x, target.bottom - 25); await page.waitForTimeout(8); }
await page.waitForTimeout(400);
const frames = await page.evaluate(() => window.__dockFrames);
let flips = 0;
let jerk = 0;
for (let icon = 0; icon < rest.length; icon += 1) {
  const velocity = frames.slice(1).map((frame, index) => frame[icon] - frames[index][icon]);
  for (let index = 1; index < velocity.length; index += 1) {
    if (index >= 2) jerk = Math.max(jerk, Math.abs(velocity[index] - velocity[index - 1]));
    if (Math.abs(velocity[index]) < 0.15 || Math.abs(velocity[index - 1]) < 0.15) continue;
    if (Math.sign(velocity[index]) === Math.sign(velocity[index - 1])) continue;
    // a flip that flips BACK within three frames is a stutter, not a turn
    if (velocity.slice(index + 1, index + 4).some((next) => Math.abs(next) > 0.15 && Math.sign(next) === Math.sign(velocity[index - 1]))) flips += 1;
  }
}
assert.ok(frames.length > 60, `the sweep must be sampled (${frames.length} frames)`);
assert.ok(flips <= 3, `a steady sweep must not make icons flip back and forth, ${flips} flips`);
assert.ok(jerk <= 20, `the row must not lurch between frames, velocity changed by ${jerk.toFixed(1)} px/frame`);

// Leaving puts the row back exactly as it was.
await page.mouse.move(10, 10);
await page.waitForTimeout(900);
const left = await geometry();
assert.ok(
  left.every((entry, index) => Math.abs(entry.width - rest[index].width) <= 1 && Math.abs(entry.centre - rest[index].centre) <= 1),
  'the row must settle back to its rest layout when the pointer leaves'
);

const after = await page.evaluate(() => {
  const dock = document.querySelector('.dock');
  window.Kineto.destroyModule(dock, 'magnetic');
  return Array.from(dock.children).map((node) => node.getAttribute('style'));
});
assert.ok(after.every((style) => style == null), `destroy() must leave the icons without the style attribute they never had, got ${JSON.stringify(after)}`);

await page.close();
await browser.close();
server.close();
console.log(`magnetic-dock OK (${browserName}) — ${widths[3]}px under the pointer falling away to ${widths[0]}px at the ends, neighbours sliding ${leftShift}/${rightShift}px aside without overlap, a smooth sweep (${flips} flips, jerk ${jerk.toFixed(1)}), and a clean return.`);
