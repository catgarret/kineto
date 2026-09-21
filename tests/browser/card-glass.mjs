// Card Glow's `glass` variant — the iOS-style pane.
//
// Four things make a pane read as glass, and each degrades on its own:
// the backdrop is blurred and its colour pushed, a bright rim runs along the
// lit edge, a sheen sits inside the top, and what is behind BENDS at the rim.
// Only the bend needs something not every engine has (an SVG filter used as a
// `backdrop-filter`, Chromium today), so the test checks the first three
// everywhere and the fourth where the engine can do it.
//
// The backdrop is a hard 8px stripe pattern, and the blur is checked on the
// rendered pixels rather than on the computed style — a `backdrop-filter` that
// the engine accepts but silently does not apply (an isolated stacking context
// is the classic way to get one) leaves the DOM looking perfectly correct. The
// measure is the size of a PNG of the region. Hard stripes are two colours in
// a perfect repeat and compress to almost nothing; blurring them turns every
// edge into a ramp of distinct values, which PNG cannot pack at all. So the
// blurred clip comes out MUCH bigger than the bare one — and the three ways
// this can go wrong separate cleanly: an unfiltered pane paints the same
// stripes (ratio ~1), a flat tint paints one colour (below 1), and a real blur
// measures about 11.
// Run: npm run build && node tests/browser/card-glass.mjs
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
const FIXTURE = '/__glass__.html';
// Hard stripes: a blur has nowhere to hide against them, and a bend at the rim
// shows as the stripe edges moving.
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  html,body{margin:0;height:100%}
  body{background:repeating-linear-gradient(90deg,#000 0 8px,#fff 8px 16px)}
  .pane{position:absolute;top:60px;width:240px;height:180px;border-radius:32px}
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
const page = await browser.newPage({ viewport: { width: 900, height: 320 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

const report = await page.evaluate(async () => {
  const { Kineto } = window;
  document.querySelector('main').innerHTML = `
    <div class="pane" id="glass" style="left:40px" data-kt-card-glow="glass" data-kt-glass-blur="12" data-kt-glass-depth="24"></div>
    <div class="pane" id="flat" style="left:330px" data-kt-card-glow="glass" data-kt-glass-blur="12" data-kt-glass-depth="24" data-kt-glass-refraction="off"></div>
    <div class="pane" id="bare" style="left:620px"><b>content</b></div>
    <div id="control" style="position:absolute;top:244px;left:40px;width:120px;height:72px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)"></div>`;
  Kineto.init();
  await new Promise((resolve) => setTimeout(resolve, 400));

  const layerOf = (id) => document.getElementById(id).querySelector('.kt-card-glow');
  const glassLayer = layerOf('glass');
  const filter = getComputedStyle(glassLayer).backdropFilter || getComputedStyle(glassLayer).webkitBackdropFilter;

  const rim = glassLayer.querySelector('.kt-card-glow-spotlight');
  const sheen = glassLayer.querySelector('.kt-card-glow-sheen');
  const rimBefore = rim?.style.background || '';
  window.__glassRim = () => rim?.style.background || '';

  return {
    rimBefore,
    box: (({ left, top, right, bottom }) => ({ left, top, right, bottom }))(
      document.getElementById('glass').getBoundingClientRect()
    ),
    filter,
    refracting: /url\(/.test(filter),
    flatFilter: getComputedStyle(layerOf('flat')).backdropFilter || getComputedStyle(layerOf('flat')).webkitBackdropFilter,
    hasRim: Boolean(rim) && /linear-gradient/.test(rimBefore),
    hasSheen: Boolean(sheen) && /linear-gradient/.test(sheen.style.background || ''),
    // The pane is the material, not a hover reaction: it must be opaque at rest.
    opacityAtRest: layerOf('flat').style.opacity,
    // An isolated stacking context has no backdrop to filter, so the module
    // must NOT isolate a glass card the way it isolates the other looks.
    isolation: getComputedStyle(document.getElementById('glass')).isolation,
    // The SVG filter lives inside the pane's own layer, so it leaves with it.
    filtersInDocument: document.querySelectorAll('filter[id^="kt-glass-"]').length,
    filtersInsideLayer: glassLayer.querySelectorAll('filter[id^="kt-glass-"]').length,
    bare: Boolean(layerOf('bare'))
  };
});

assert.deepEqual(errors, [], 'glass must not raise page errors');
// The lit edge has to follow the pointer. This drives the REAL input pipeline
// rather than dispatching a synthetic PointerEvent: a hand-built
// `new PointerEvent('pointermove', { clientX })` arrives without usable
// coordinates in WebKit, so the module had nothing to move the rim to and the
// check failed on a browser where the feature actually works.
await page.mouse.move(report.box.left + 12, report.box.top + 12);
await page.mouse.move(report.box.right - 12, report.box.bottom - 12);
await page.waitForTimeout(400);
const rimAfter = await page.evaluate(() => window.__glassRim());
assert.notEqual(rimAfter, report.rimBefore, 'the lit edge must follow the pointer');

assert.match(report.filter, /blur\(12px\)/, 'the pane must blur its backdrop by the requested amount');
assert.match(report.filter, /saturate\(/, 'the pane must push the colour behind it');
assert.equal(report.hasRim, true, 'the pane must draw a lit rim');
assert.equal(report.hasSheen, true, 'the pane must draw an inner sheen');
assert.equal(report.opacityAtRest, '1', 'glass is the material, so it must stay on when the pointer leaves');
assert.notEqual(report.isolation, 'isolate', 'an isolated card has no backdrop to filter — glass must not isolate');
assert.equal(report.bare, false, 'a card without the module must be left alone');
assert.doesNotMatch(report.flatFilter, /url\(/, 'glassRefraction:"off" must drop the bend and keep the blur');
assert.match(report.flatFilter, /blur\(12px\)/, 'glassRefraction:"off" must keep everything else');

if (report.refracting) {
  assert.equal(report.filtersInDocument, 1, 'exactly one displacement filter per refracting pane');
  assert.equal(report.filtersInsideLayer, 1, 'the filter must live inside the pane so it leaves with it');
} else {
  console.log(`card-glass note (${browserName}) — no SVG backdrop-filter here, so the bend was skipped as designed.`);
}

// The blur, on the pixels the browser actually painted. Both clips are the same
// size and sit on the same stripes; the only difference is the pane over one.
const clip = (left) => page.screenshot({ clip: { x: left, y: 110, width: 120, height: 80 } });
const [inside, outside] = await Promise.all([clip(100), clip(760)]);
const blurRatio = inside.length / outside.length;

// Does this engine PAINT a backdrop-filter here, or only accept the
// declaration? Headless Firefox and WebKit accept `backdrop-filter: blur(12px)`
// and composite nothing at all, so the pixel check below would be measuring the
// runner rather than the module. The control is a plain div with an inline
// backdrop-filter over the same stripes — no Kineto anywhere near it — so a
// Chromium run cannot take the skip branch by accident: measured on this
// fixture it lands at 12.9x there, against 1.0x in both of the others.
const low = (left) => page.screenshot({ clip: { x: left, y: 244, width: 120, height: 72 } });
const [control, controlStripes] = await Promise.all([low(40), low(200)]);
const controlRatio = control.length / controlStripes.length;

if (controlRatio > 3) {
  assert.ok(
    blurRatio > 3,
    `the backdrop must actually be blurred: a PNG of the pane is only ${blurRatio.toFixed(1)}x the size of `
    + `one of the bare stripes beside it (${inside.length} vs ${outside.length} bytes) — at about 1 the pane `
    + 'is passing the stripes through untouched, and below 1 it is painting over them instead of filtering them'
  );
} else {
  console.log(
    `card-glass note (${browserName}) — a plain control div with an inline backdrop-filter measures `
    + `${controlRatio.toFixed(2)}x the bare stripes here, so this engine is not compositing backdrop-filter `
    + 'at all in this run and the pixel check would say nothing about the module. The declaration, the rim, '
    + 'the sheen and the teardown are all still checked above.'
  );
}

// The bend, the same way: at the rim, refraction moves the stripes, so the two
// panes cannot paint the same pixels there.
const [bentRim, flatRim] = await Promise.all([
  page.screenshot({ clip: { x: 44, y: 110, width: 28, height: 80 } }),
  page.screenshot({ clip: { x: 334, y: 110, width: 28, height: 80 } })
]);
if (report.refracting && controlRatio > 3) {
  assert.ok(
    !bentRim.equals(flatRim),
    'with refraction on, the rim must not paint the same pixels as the pane with it off'
  );
}

// Teardown: the card must be exactly as it was found.
const after = await page.evaluate(() => {
  const el = document.getElementById('glass');
  window.Kineto.destroyModule(el, 'cardGlow');
  return {
    layer: Boolean(el.querySelector('.kt-card-glow')),
    filters: document.querySelectorAll('filter[id^="kt-glass-"]').length,
    style: el.getAttribute('style')
  };
});
assert.equal(after.layer, false, 'destroy() must remove the pane');
assert.equal(after.filters, 0, 'destroy() must take the displacement filter with it');
assert.doesNotMatch(after.style || '', /backdrop-filter|isolation/, 'destroy() must leave no glass styles behind');

await page.close();
await browser.close();
server.close();
console.log(`card-glass OK (${browserName}) — ${controlRatio > 3 ? `measured backdrop blur (${blurRatio.toFixed(1)}x the PNG of the bare stripes)` : 'declared backdrop blur (this engine composites none here)'} and saturation, pointer-lit rim, inner sheen, ${report.refracting ? 'edge refraction' : 'refraction correctly skipped'}, no stacking-context trap, clean teardown.`);
