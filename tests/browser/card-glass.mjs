// Card Glow's `glass` variant — the iOS-style pane.
//
// Four things make a pane read as glass, and each degrades on its own:
// the backdrop is blurred and its colour pushed, a bright rim runs along the
// lit edge, a sheen sits inside the top, and what is behind BENDS at the rim.
// Only the bend needs something not every engine has (an SVG filter used as a
// `backdrop-filter`, Chromium today), so the test checks the first three
// everywhere and the fourth where the engine can do it.
//
// Contrast is measured from decoded screenshot pixels. A real sibling
// backdrop avoids root-canvas background special cases; no PNG-size heuristic.
// Run: npm run build && node tests/browser/card-glass.mjs
import assert from 'node:assert/strict';
import { bevelBand, buildDisplacementMap, displacementScale } from '../../src/modules/surface/glass.js';

const map = buildDisplacementMap({ createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) }, 100, 60, 30, 18);
assert.equal(map.data[(30 * 100 + 50) * 4], 128, 'lens centre must remain neutral');
// Along the middle row, from the left rim inward: where each pixel samples the
// backdrop from. feDisplacementMap moves by scale × (R/255 − 0.5).
const red = (x) => map.data[(30 * 100 + x) * 4];
const sampleAt = (x) => x + 0.5 + displacementScale(18) * (red(x) / 255 - 0.5);
assert.ok(red(1) > 225 && red(5) > red(10) && red(10) > red(15), 'the pull must be strongest at the rim and fall off across the band');
for (let x = 0; x < 20; x += 1) {
  assert.ok(sampleAt(x + 1) > sampleAt(x), `the lens must never fold the backdrop back on itself (x=${x})`);
}
// The smear this replaced: the old profile stretched about one pixel of
// backdrop across the last few pixels of the band (a local stretch of ~15×).
// Where the band meets the clear centre, one pixel must still show ~one pixel.
assert.ok(sampleAt(17) - sampleAt(16) > 0.75, `the band must meet the clear centre without a seam (step ${(sampleAt(17) - sampleAt(16)).toFixed(2)})`);
// A 52px pill keeps a clear centre: the bevel is capped by the pane's size.
assert.ok(bevelBand(300, 52, 18) < 18 && bevelBand(300, 52, 18) > 10, 'a thin pane must get a narrower bevel than it asked for');
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
  body::before{content:"";position:fixed;inset:0;background:repeating-linear-gradient(90deg,#000 0 8px,#fff 8px 16px)}
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
  args: browserName === 'chromium' ? ['--no-sandbox'] : []
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
// Leaving must finish its light return, rather than paint a single lerp frame.
await page.mouse.move(5, 5);
await page.waitForTimeout(900);
const returnedRim = await page.evaluate(() => window.__glassRim());
const angleOf = (css) => Number(css.match(/linear-gradient\(([-\d.]+)deg/)[1]);
assert.ok(Math.abs(angleOf(returnedRim) - angleOf(report.rimBefore)) < 0.1, 'leaving must return to the resting light');
await page.mouse.move(report.box.left + 16, report.box.top + 16);
await page.evaluate(() => window.Kineto.getInstance(document.getElementById('glass'), 'cardGlow').pause());
const pausedRim = await page.evaluate(() => window.__glassRim());
await page.mouse.move(report.box.right - 16, report.box.bottom - 16);
await page.waitForTimeout(100);
assert.equal(await page.evaluate(() => window.__glassRim()), pausedRim, 'pause must hold the light');
await page.evaluate(() => window.Kineto.getInstance(document.getElementById('glass'), 'cardGlow').resume());
await page.waitForTimeout(500);
assert.notEqual(await page.evaluate(() => window.__glassRim()), pausedRim, 'resume must schedule rendering again');


assert.match(report.filter, /blur\(12px\)/, 'the pane must blur its backdrop by the requested amount');
assert.match(report.filter, /saturate\(/, 'the pane must push the colour behind it');
assert.equal(report.hasRim, true, 'the pane must draw a lit rim');
assert.equal(report.hasSheen, true, 'the pane must draw an inner sheen');
assert.equal(report.opacityAtRest, '1', 'glass is the material, so it must stay on when the pointer leaves');
assert.notEqual(report.isolation, 'isolate', 'an isolated card has no backdrop to filter — glass must not isolate');
assert.equal(report.bare, false, 'a card without the module must be left alone');
if (browserName !== 'chromium') assert.equal(report.refracting, false, 'syntax-only SVG support must retain the CSS blur fallback');
assert.doesNotMatch(report.flatFilter, /url\(/, 'glassRefraction:"off" must drop the bend and keep the blur');
assert.match(report.flatFilter, /blur\(12px\)/, 'glassRefraction:"off" must keep everything else');

if (report.refracting) {
  assert.equal(report.filtersInDocument, 1, 'exactly one displacement filter per refracting pane');
  assert.equal(report.filtersInsideLayer, 1, 'the filter must live inside the pane so it leaves with it');
} else {
  console.log(`card-glass note (${browserName}) — no SVG backdrop-filter here, so the bend was skipped as designed.`);
}

// Decode screenshots in a canvas and measure stripe contrast directly. PNG
// byte length measures compression, not blur: a perfectly blurred flat grey
// region can compress just as well as the original two-colour stripes.
const pixels = async (clip) => {
  const png = await page.screenshot({ clip });
  return page.evaluate(async (base64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${base64}`;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width; canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return Array.from(ctx.getImageData(0, 0, img.width, img.height).data);
  }, png.toString('base64'));
};
const contrast = (data) => {
  const red = data.filter((_, index) => index % 4 === 0);
  return Math.max(...red) - Math.min(...red);
};
const bare = await pixels({ x: 760, y: 130, width: 64, height: 16 });
const control = await pixels({ x: 64, y: 270, width: 64, height: 16 });
const inside = await pixels({ x: 112, y: 130, width: 64, height: 16 });
assert.ok(contrast(bare) > 200, 'fixture must expose high contrast stripes');
const paintsBlur = contrast(control) < contrast(bare) * 0.25;
if (paintsBlur) {
  assert.ok(contrast(inside) < contrast(bare) * 0.25,
    `glass must really blur the backdrop; contrast ${contrast(inside)}`);
} else {
  console.log(`card-glass note (${browserName}) — plain control does not paint blur; pixel blur assertion unavailable.`);
}

// Compare the SAME region with refraction enabled/disabled, with no blur or
// highlights to hide a broken filter. Different screenshot positions used to
// compare different stripe phases and could pass even with no displacement.
await page.evaluate(() => {
  const el = document.getElementById('glass');
  window.Kineto.destroyModule(el, 'cardGlow');
  window.Kineto.create('cardGlow', el, { mode:'glass', glassBlur:0,
    glassDepth:24, glassTint:'transparent', glassRimOpacity:0, glassSheen:0 });
});
await page.waitForTimeout(150);
const rimClip = { x: 44, y: 130, width: 28, height: 40 };
const bent = await pixels(rimClip);
await page.evaluate(() => {
  const layer = document.querySelector('#glass .kt-card-glow');
  layer.style.backdropFilter = 'none';
  layer.style.webkitBackdropFilter = 'none';
});
const flat = await pixels(rimClip);
if (report.refracting && paintsBlur) {
  const delta = bent.reduce((sum, value, index) => sum + Math.abs(value - flat[index]), 0) / bent.length;
  assert.ok(delta > 3, `edge refraction must move backdrop pixels, mean difference ${delta}`);
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
console.log(`card-glass OK (${browserName}) — ${paintsBlur ? 'pixel blur' : 'blur declaration'}, rim, sheen, ${report.refracting && paintsBlur ? 'pixel refraction' : 'refraction declaration/fallback'}, return, pause/resume and teardown.`);
