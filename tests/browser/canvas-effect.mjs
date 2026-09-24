// Canvas Effect in a real browser (MK-CANVAS-001): everything the host promises
// an effect it will take care of.
//
//   1. the backing store fills the element's PADDING box at the capped pixel ratio;
//   2. an effect that returns false from frame() rests — no frames — and the
//      pointer wakes it;
//   3. `fps` caps the frame rate;
//   4. off screen, the core suspends it; on screen it runs again;
//   5. an effect that throws stops alone (is-failed) while the others go on;
//   6. a bare fragment shader draws, with its options bound as uniforms;
//   7. reduced motion draws one still frame and no loop;
//   8. an option update reaches the effect live, through resize();
//   9. destroy() restores the element exactly and stops asking for frames;
//  10. without WebGL the element keeps its own background (is-unsupported).
//
// Run: npm run build && node tests/browser/canvas-effect.mjs
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
const FIXTURE = '/__canvas_effect__.html';

// Test-owned effects that record what the host hands them.
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0}
  .host{width:300px;height:200px;padding:20px;margin:10px;background:#123}
  .spacer{height:3000px}
</style></head><body>
<div class="host" id="rest" data-kt-canvas-effect="probe"><p id="content">content</p></div>
<div class="host" id="padded" data-kt-canvas-effect="probe" data-kt-max-dpr="1.5"></div>
<div class="host" id="capped" data-kt-canvas-effect="spin" data-kt-fps="10"></div>
<div class="host" id="broken" data-kt-canvas-effect="broken"></div>
<div class="host" id="shader" data-kt-canvas-effect="solid" data-kt-color="#ff0000"></div>
<div class="spacer"></div>
<div class="host" id="below" data-kt-canvas-effect="spin"></div>
<script src="/dist/kineto.umd.js"></script>
<script>
  window.__frames = {};
  window.__resized = {};
  const count = (api) => { window.__frames[api.el.id] = (window.__frames[api.el.id] || 0) + 1; };
  Kineto.defineCanvasEffect('probe', {
    options: { size: 10 },
    resize(api) { window.__resized[api.el.id] = { width: api.width, height: api.height, pixels: api.canvas.width, size: api.options.size }; },
    frame(api) { count(api); return api.pointer.active; }
  });
  Kineto.defineCanvasEffect('spin', { frame(api) { count(api); return true; } });
  Kineto.defineCanvasEffect('broken', { frame(api) { count(api); throw new Error('effect bug'); } });
  Kineto.defineCanvasEffect('solid', {
    options: { color: '#ffffff' },
    fragment: 'precision mediump float; uniform vec3 uColor; void main(){ gl_FragColor = vec4(uColor, 1.0); }'
  });
  Kineto.init();
</script></body></html>`;

const server = http.createServer((request, response) => {
  if (request.method !== 'GET') { response.writeHead(405).end(); return; }
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === FIXTURE) {
    response.writeHead(200, { 'content-type': MIME['.html'] });
    response.end(fixtureHtml());
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
const origin = `${'http'}://127.0.0.1:${server.address().port}`;

const browser = await browserType.launch({
  headless: true,
  ...(browserName === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
  args: browserName === 'chromium' ? ['--no-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] : []
});
const open = async (contextOptions = {}) => {
  const context = await browser.newContext({ viewport: { width: 900, height: 700 }, deviceScaleFactor: 2, ...contextOptions });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  return { context, page, errors };
};
const frames = (page, id) => page.evaluate((key) => window.__frames[key] || 0, id);
const framesOver = async (page, id, ms) => {
  const start = await frames(page, id);
  await page.waitForTimeout(ms);
  return (await frames(page, id)) - start;
};

const { context, page, errors } = await open();

// 1. Padding box × capped pixel ratio.
const padded = await page.evaluate(() => window.__resized.padded);
assert.deepEqual(padded, { width: 340, height: 240, pixels: 510, size: 10 },
  `the canvas must fill the padding box at min(devicePixelRatio 2, maxDpr 1.5): ${JSON.stringify(padded)}`);
const layering = await page.evaluate(() => {
  const host = document.getElementById('rest');
  const canvas = host.querySelector('canvas');
  const box = canvas.getBoundingClientRect();
  const hostBox = host.getBoundingClientRect();
  return { first: host.firstElementChild === canvas, z: getComputedStyle(canvas).zIndex, isolation: getComputedStyle(host).isolation, fills: Math.round(box.width) === Math.round(hostBox.width) && Math.round(box.height) === Math.round(hostBox.height), events: getComputedStyle(canvas).pointerEvents };
});
assert.deepEqual(layering, { first: true, z: '-1', isolation: 'isolate', fills: true, events: 'none' },
  'the canvas sits behind the content, fills the host and never takes the pointer');

// 2. Rest, then wake on input.
await page.waitForTimeout(700);
assert.equal(await framesOver(page, 'rest', 600), 0, 'an effect whose frame() returns false must stop asking for frames');
await page.mouse.move(60, 60);
await page.mouse.move(160, 110, { steps: 8 });
assert.ok(await framesOver(page, 'rest', 250) > 3, 'pointer movement over the host must wake it');
await page.waitForTimeout(900);
assert.equal(await framesOver(page, 'rest', 500), 0, 'and it rests again once the pointer is still');

// 3. The frame-rate cap.
const capped = await framesOver(page, 'capped', 1000);
assert.ok(capped >= 6 && capped <= 13, `fps: 10 must draw about ten frames a second: ${capped}`);

// 4. Off screen: suspended by the core; on screen: running.
assert.equal(await framesOver(page, 'below', 800), 0, 'an effect off screen must not draw');
await page.evaluate(() => document.getElementById('below').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(300);
assert.ok(await framesOver(page, 'below', 600) > 10, 'once in view it must run');
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);

// 5. A throwing effect stops alone.
const broken = await page.evaluate(() => ({ failed: document.getElementById('broken').classList.contains('is-failed'), frames: window.__frames.broken, hidden: getComputedStyle(document.querySelector('#broken canvas')).display }));
assert.deepEqual(broken, { failed: true, frames: 1, hidden: 'none' }, 'a throwing effect must stop after its first frame and step aside');
assert.ok(await framesOver(page, 'capped', 500) > 2, 'while every other effect keeps going');

// 6. A bare fragment shader, its option bound as uColor. (In view: off screen
// the core has it suspended, and an undrawn WebGL buffer reads as zeros.)
await page.evaluate(() => document.getElementById('shader').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(300);
const shader = await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => {
  const host = document.getElementById('shader');
  if (host.classList.contains('is-unsupported')) { resolve({ unsupported: true }); return; }
  const canvas = host.querySelector('canvas');
  const gl = canvas.getContext('webgl');
  const pixel = new Uint8Array(4);
  gl.readPixels(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  resolve({ unsupported: false, pixel: Array.from(pixel) });
})));
if (shader.unsupported) {
  console.log(`  (${browserName}: no WebGL in this headless build — checked the fallback instead)`);
} else {
  assert.deepEqual(shader.pixel, [255, 0, 0, 255], `data-kt-color must reach the shader as uColor: ${JSON.stringify(shader.pixel)}`);
}

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);

// 8. A live update reaches resize() without a rebuild.
const updated = await page.evaluate(() => {
  const host = document.getElementById('rest');
  const before = window.Kineto.getInstance(host, 'canvasEffect');
  const live = window.Kineto.updateModule(host, 'canvasEffect', { size: 40 });
  return { live, same: window.Kineto.getInstance(host, 'canvasEffect') === before, size: window.__resized.rest.size };
});
assert.deepEqual(updated, { live: true, same: true, size: 40 }, 'an option change must reach the effect in place');

// 9. destroy() restores and stops.
const restored = await page.evaluate(() => {
  const host = document.getElementById('capped');
  window.Kineto.getInstance(host, 'canvasEffect').destroy();
  return { html: host.outerHTML, style: host.getAttribute('style') };
});
assert.deepEqual(restored, { html: '<div class="host" id="capped" data-kt-canvas-effect="spin" data-kt-fps="10"></div>', style: null },
  'destroy() must hand the element back exactly as it was');
assert.equal(await framesOver(page, 'capped', 500), 0, 'and nothing may draw after it');
assert.deepEqual(errors, [], 'no page errors');
await context.close();

// 7. Reduced motion: one still frame, no loop.
const reduced = await open({ reducedMotion: 'reduce' });
await reduced.page.waitForTimeout(400);
const still = await reduced.page.evaluate(() => ({ still: document.getElementById('capped').classList.contains('is-still'), frames: window.__frames.capped }));
assert.deepEqual(still, { still: true, frames: 1 }, `reduced motion must draw exactly one frame: ${JSON.stringify(still)}`);
assert.equal(await framesOver(reduced.page, 'capped', 600), 0, 'and never loop');
await reduced.context.close();

// 10. No WebGL: the element keeps its own background.
const noGl = await browser.newContext({ viewport: { width: 900, height: 700 } });
await noGl.addInitScript(() => {
  const original = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
    return /webgl/.test(type) ? null : original.call(this, type, ...rest);
  };
});
const noGlPage = await noGl.newPage();
await noGlPage.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });
await noGlPage.waitForTimeout(500);
const fallback = await noGlPage.evaluate(() => {
  const host = document.getElementById('shader');
  return { unsupported: host.classList.contains('is-unsupported'), canvas: getComputedStyle(host.querySelector('canvas')).display, background: getComputedStyle(host).backgroundColor };
});
assert.deepEqual(fallback, { unsupported: true, canvas: 'none', background: 'rgb(17, 34, 51)' },
  'without WebGL the canvas steps aside and the element keeps its own background');
await noGl.close();

await browser.close();
server.close();
console.log(`canvas-effect OK (${browserName}) — padding-box × capped DPR, rest and wake, fps cap, off-screen suspension, isolated failure, ${shader.unsupported ? 'no-WebGL fallback' : 'shader uniforms'}, still frame, live update, exact restore, no-WebGL fallback.`);
