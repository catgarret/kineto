// Squircle — the corner shape, drawn two ways.
//
// The module's whole promise is that a browser without `corner-shape` gets the
// SAME curve as one that has it. That cannot be checked by reading options: it
// has to be measured against the real property, in a browser that implements
// it. Chromium does, so this file draws both and compares their silhouettes.
//
// Hit testing is what traces a shape here (`elementFromPoint` respects both
// `clip-path` and `corner-shape`), and Chromium's hit test for the native
// property is about 2px coarser than its paint — measured constant whatever the
// box or radius.
//
// That 2px is why this file does NOT compare "how far in is the edge at this
// height": near the ends of a corner the curve is almost horizontal, so 2px of
// vertical slop becomes tens of pixels of horizontal difference and the number
// says nothing about the shape. Two measurements that do not have that problem:
//
//   1. the corner's AREA, as a grid of inside/outside probes. A 2px band along
//      the curve is a bounded share of the corner however steep it is;
//   2. where the curve crosses the 45° diagonal, which is the one place the
//      curve is at 45° so a probe offset translates one to one — and whose
//      exact value is known for every shape: r·(1 − 2^(-1/n)).
//
// Runs on Chromium by default; KT_BROWSER=firefox|webkit selects another engine
// (those have no `corner-shape`, so only the polyfill half runs there).
// Run: npm run build && node tests/browser/squircle.mjs
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
const FIXTURE = '/__squircle__.html';
const fixtureHtml = () => `<!doctype html><html><head><link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;background:#fff}
  .cell{position:absolute;top:0;width:240px;height:240px;background:#000}
  .bordered{background:#fff;border:6px solid #000;box-sizing:border-box}
</style></head><body><main></main><script src="/dist/kineto.umd.js"></script></body></html>`;
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === FIXTURE) {
    response.writeHead(200, { 'content-type': 'text/html' });
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

const launchOptions = {
  headless: true,
  ...(browserName === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
  args: browserName === 'chromium' ? ['--no-sandbox', '--disable-gpu'] : []
};
const browser = await browserType.launch(launchOptions);
// The cells must not overlap: a hit test that falls through a clipped corner
// would land on the neighbour and report its edge instead of nothing.
const page = await browser.newPage({ viewport: { width: 1560, height: 620 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

const result = await page.evaluate(() => {
  const { Kineto } = window;
  const main = document.querySelector('main');
  const SHAPES = ['square', 'squircle', 'round', 'bevel', 'scoop', 'notch'];
  const report = { supportsNative: CSS.supports('corner-shape', 'squircle'), shapes: {}, errors: [] };

  // The left column is the browser's own property, the right column is ours.
  main.innerHTML = SHAPES.map((shape, index) => (
    `<div class="cell" id="n-${shape}" style="left:${index * 300}px"></div>`
    + `<div class="cell" id="p-${shape}" style="left:${index * 300}px;top:300px"></div>`
  )).join('');
  for (const shape of SHAPES) {
    const native = document.getElementById(`n-${shape}`);
    native.style.borderRadius = '100px';
    native.style.cornerShape = shape;
    const poly = document.getElementById(`p-${shape}`);
    poly.setAttribute('data-kt-squircle', shape);
    poly.setAttribute('data-kt-corner-radius', '100');
    poly.setAttribute('data-kt-native-shape', 'off');
  }
  Kineto.init();

  const RADIUS = 100;
  const STEP = 2;
  // Which probes of the corner box land on the element: the corner's own area.
  const cornerMask = (element, originX, originY) => {
    const cells = [];
    for (let y = 0; y < RADIUS; y += STEP) {
      for (let x = 0; x < RADIUS; x += STEP) {
        cells.push(document.elementFromPoint(originX + x + 0.5, originY + y + 0.5) === element);
      }
    }
    return cells;
  };
  // Where the outline crosses the 45° diagonal, walking out from the corner.
  const diagonalCrossing = (element, originX, originY) => {
    for (let t = 0; t < RADIUS * 1.5; t += 0.5) {
      if (document.elementFromPoint(originX + t + 0.5, originY + t + 0.5) === element) return t;
    }
    return Infinity;
  };
  SHAPES.forEach((shape, index) => {
    const poly = document.getElementById(`p-${shape}`);
    const instance = Kineto.getInstance(poly, 'squircle');
    const entry = { renderer: instance?.renderer, clipped: Boolean(poly.style.clipPath), k: instance?.shape?.k, idealDiagonal: instance?.shape?.diagonal };
    const polyMask = cornerMask(poly, index * 300, 300);
    entry.polyArea = polyMask.filter(Boolean).length / polyMask.length;
    entry.polyDiagonal = diagonalCrossing(poly, index * 300, 300);
    if (report.supportsNative) {
      const native = document.getElementById(`n-${shape}`);
      const nativeMask = cornerMask(native, index * 300, 0);
      entry.areaMismatch = nativeMask.filter((inside, at) => inside !== polyMask[at]).length / nativeMask.length;
      entry.nativeDiagonal = diagonalCrossing(native, index * 300, 0);
    }
    report.shapes[shape] = entry;
  });

  // The element must come back exactly as it was found.
  const restored = document.createElement('div');
  restored.className = 'cell';
  restored.setAttribute('data-kt-squircle', 'squircle');
  main.appendChild(restored);
  Kineto.init();
  const beforeDestroy = restored.getAttribute('style');
  Kineto.destroyModule(restored, 'squircle');
  report.destroyClearedStyle = restored.getAttribute('style') == null;
  report.destroyChangedSomething = Boolean(beforeDestroy);

  // A border is redrawn along the curve rather than left cut off at the corners.
  const bordered = document.createElement('div');
  bordered.className = 'cell bordered';
  bordered.setAttribute('data-kt-squircle', 'squircle');
  bordered.setAttribute('data-kt-corner-radius', '40');
  bordered.setAttribute('data-kt-native-shape', 'off');
  main.appendChild(bordered);
  Kineto.init();
  report.borderLayer = Boolean(bordered.querySelector('.kt-squircle-border'));
  report.borderStrokeWidth = bordered.querySelector('.kt-squircle-border path')?.getAttribute('stroke-width');
  report.borderColorCleared = bordered.style.borderColor === 'transparent';
  Kineto.destroyModule(bordered, 'squircle');
  report.borderLayerRemoved = !bordered.querySelector('.kt-squircle-border');

  return report;
});

assert.deepEqual(errors, [], 'squircle must not raise page errors');

// Where the outline meets the 45° diagonal. On that line the two coordinates
// are equal, so solving `u^n + u^n = 1` for u gives u = 2^(-1/n) and the probe's
// own coordinate is r·(1 − 2^(-1/n)): 15.9px for a squircle, 29.3 for a circle,
// 50 for a bevel, 75 for a scoop.
const RADIUS = 100;
const idealDiagonal = (exponent) => RADIUS * (1 - Math.pow(2, -1 / exponent));
for (const [shape, entry] of Object.entries(result.shapes)) {
  assert.equal(entry.renderer, 'polyfill', `${shape}: nativeShape:"off" must use the polyfill`);
  assert.ok(entry.clipped, `${shape}: the polyfill must write a clip-path`);
  // `notch` and `square` are the ends of the family, where the exponent stands
  // in for 0 and infinity — the analytic crossing is exact for the rest.
  if (shape === 'square') {
    // The other end of the family: the corner box stays whole.
    assert.equal(entry.polyArea, 1, 'square must leave the corner box untouched');
    continue;
  }
  if (shape === 'notch') {
    // The corner box is removed whole, so nothing inside it answers and the
    // diagonal probe only finds the element once it is past the corner.
    assert.equal(entry.polyArea, 0, 'notch must leave nothing of the corner box');
    assert.ok(entry.polyDiagonal >= RADIUS - 2, `notch must cut the whole corner out, first hit at ${entry.polyDiagonal}`);
    continue;
  }
  const ideal = entry.idealDiagonal * RADIUS;
  assert.ok(
    Math.abs(entry.polyDiagonal - ideal) <= 2,
    `${shape} (K=${entry.k}) must cross the diagonal at ${ideal.toFixed(1)}px, measured ${entry.polyDiagonal}`
  );
}
// Each shape has to be distinguishable from the next, or the keywords are
// decorative names for one curve.
const order = ['square', 'squircle', 'round', 'bevel', 'scoop', 'notch'];
order.forEach((shape, at) => {
  if (at === 0) return;
  const previous = result.shapes[order[at - 1]];
  assert.ok(
    result.shapes[shape].polyDiagonal > previous.polyDiagonal + 10,
    `${shape} must bite deeper than ${order[at - 1]} (${previous.polyDiagonal} vs ${result.shapes[shape].polyDiagonal})`
  );
});
// And each one must actually cover a different amount of the corner, which is
// the claim "six shapes" makes and the thing a collapsed outline breaks.
const areas = order.map((shape) => result.shapes[shape].polyArea);
areas.forEach((area, at) => {
  if (at === 0) return;
  assert.ok(area < areas[at - 1] - 0.05, `${order[at]} must keep less of the corner than ${order[at - 1]} (${areas[at - 1].toFixed(3)} vs ${area.toFixed(3)})`);
});

if (result.supportsNative) {
  for (const [shape, entry] of Object.entries(result.shapes)) {
    // A 2px hit-test band along the curve is about 4% of the corner box; 8%
    // leaves room for the engine without letting a different shape through —
    // the next shape along differs by 10% or more (round vs squircle: 13%).
    assert.ok(
      entry.areaMismatch <= 0.08,
      `${shape}: the polyfill corner must cover the same area as the browser's own corner-shape (${(entry.areaMismatch * 100).toFixed(1)}% differ)`
    );
    // `notch` and `square` remove or keep the whole corner box, so the diagonal
    // probe has nothing to cross — the area above is what says they agree.
    if (Number.isFinite(entry.nativeDiagonal) && Number.isFinite(entry.polyDiagonal)) {
      assert.ok(
        Math.abs(entry.polyDiagonal - entry.nativeDiagonal) <= 3,
        `${shape}: the two curves must cross the diagonal in the same place (native ${entry.nativeDiagonal}, polyfill ${entry.polyDiagonal})`
      );
    } else {
      assert.equal(
        Number.isFinite(entry.nativeDiagonal), Number.isFinite(entry.polyDiagonal),
        `${shape}: one outline crosses the diagonal and the other does not`
      );
    }
  }
} else {
  console.log(`squircle note (${browserName}) — no native corner-shape here, so only the drawn outline was checked.`);
}

assert.equal(result.destroyChangedSomething, true, 'the module must write something to undo');
assert.equal(result.destroyClearedStyle, true, 'destroy() must leave the element without the style attribute it never had');
assert.equal(result.borderLayer, true, 'a bordered element must get its border redrawn along the curve');
assert.equal(result.borderStrokeWidth, '12', 'the redrawn border is doubled, because the clip keeps its inner half');
assert.equal(result.borderColorCleared, true, 'the original square border must be hidden once it is redrawn');
assert.equal(result.borderLayerRemoved, true, 'destroy() must take the redrawn border with it');

await page.close();
await browser.close();
server.close();
console.log(`squircle OK (${browserName}) — six corner shapes at their exact analytic geometry${result.supportsNative ? ', matched by area and diagonal against the browser\'s own corner-shape' : ''}, redrawn border and clean teardown.`);
