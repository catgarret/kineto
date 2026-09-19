// Stylize — the standalone dither / ASCII / halftone module.
//
// tests/browser/lazy-stylized.mjs still covers the deprecated `data-kt-lazy`
// aliases. This file covers what only Stylize has: `mode` (a permanent filter
// vs a one-shot reveal), the reveal `trigger`, the KT_DEPRECATED diagnostic the
// aliases now emit, coexistence with Lazy on one element, reduced motion, and
// destroy() leaving the media untouched.
// Runs on Chromium by default; KT_BROWSER=firefox|webkit selects another engine.
// Run: npm run build && node tests/browser/stylize.mjs
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName] || chromium;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.gif': 'image/gif', '.png': 'image/png', '.mp4': 'video/mp4' };

// Same origin as the media, so the canvas can read the sampled pixels back.
const FIXTURE_PATH = '/__stylize__.html';
const fixtureHtml = () => `<!doctype html><html><head><link rel="stylesheet" href="/dist/kineto.css"><style>body{margin:0;background:#222}.cell{width:240px;height:160px;display:inline-block;margin:8px}.cell img,.cell video{width:100%;height:100%;object-fit:cover}.below{margin-top:200vh}</style></head><body><main></main><script src="/dist/kineto.umd.js"></script></body></html>`;
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === FIXTURE_PATH) {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end(fixtureHtml());
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404); response.end(); return; }
    const type = MIME[path.extname(file)] || 'application/octet-stream';
    // Media elements ask for a byte range and some engines refuse to start
    // without a 206 answer, so serve ranges rather than only whole files.
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
    if (range && type.startsWith('video/')) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Number(range[2]) : body.length - 1;
      const slice = body.subarray(start, end + 1);
      response.writeHead(206, {
        'content-type': type,
        'accept-ranges': 'bytes',
        'content-range': `bytes ${start}-${end}/${body.length}`,
        'content-length': slice.length
      });
      response.end(slice);
      return;
    }
    response.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': body.length });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const launchOptions = {
  headless: true,
  ...(browserName === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
  args: browserName === 'chromium' ? ['--no-sandbox', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'] : []
};
const browser = await browserType.launch(launchOptions);

const probe = async (reducedMotion) => {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 }, reducedMotion });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}${FIXTURE_PATH}`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.Kineto));
  const result = await page.evaluate(async (base) => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitFor = async (check, timeout = 6000) => {
      const start = performance.now();
      while (performance.now() - start < timeout) {
        if (check()) return true;
        await wait(40);
      }
      return check();
    };
    const main = document.querySelector('main');
    const mount = (attributes, tag = 'img', className = 'cell') => {
      const cell = document.createElement('div');
      cell.className = className;
      const media = document.createElement(tag);
      Object.entries(attributes).forEach(([name, value]) => media.setAttribute(name, value));
      // `muted` has to be the property, not just the attribute, or the autoplay
      // policy blocks playback and there are no frames to draw.
      if (tag === 'video') media.muted = true;
      cell.appendChild(media);
      main.appendChild(cell);
      return media;
    };
    // Stylize reuses a Lazy wrapper when both are attached, so look for either.
    const wrapOf = (media) => media.closest('.kt-stylize-wrap, .kt-lazy-wrap');
    const canvasOf = (media) => wrapOf(media)?.querySelector('.kt-stylize-stylized-canvas') || null;
    const fingerprint = (canvas) => {
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      let hash = 0;
      for (let index = 0; index < data.length; index += 16) hash = (hash * 31 + data[index] + data[index + 1] * 3 + data[index + 2] * 7) >>> 0;
      return hash;
    };
    // Some headless engines freeze GIFs on their first frame. Sampling the raw
    // <img> says whether this environment animates at all, so the redraw check
    // can be skipped instead of failing for the engine's reason.
    const rawFrame = (media) => {
      const scratch = document.createElement('canvas');
      scratch.width = 32; scratch.height = 32;
      scratch.getContext('2d').drawImage(media, 0, 0, 32, 32);
      return fingerprint(scratch);
    };
    const paletteOf = (canvas) => {
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      const colors = new Map();
      let opaque = 0;
      for (let index = 0; index < data.length; index += 4) {
        if (data[index + 3] === 0) continue;
        opaque += 1;
        const key = `${data[index]},${data[index + 1]},${data[index + 2]}`;
        colors.set(key, (colors.get(key) || 0) + 1);
      }
      return { opaque, colors: [...colors.entries()].sort((a, b) => b[1] - a[1]) };
    };

    const source = `${base}/demo/assets/gallery-01.webp`;
    const report = { deprecations: [] };
    // Diagnostics only leave the hub when the consumer opted in.
    Kineto.config({ debug: true });
    Kineto.diagnostics.subscribe((entry) => {
      if (entry.code === Kineto.diagnosticCodes.DEPRECATED) {
        report.deprecations.push({ module: entry.module, variant: entry.detail?.variant, replacement: entry.detail?.replacement });
      }
    });

    // `src`, not `data-src`: Stylize does not load anything.
    const persist = mount({ 'data-kt-stylize': 'dither', 'data-kt-paper-color': '#ffffff', 'data-kt-ink-color': '#000000', 'data-kt-cell-size': '6', src: source, alt: 'persist' });
    const revealOnLoad = mount({ 'data-kt-stylize': 'ascii', 'data-kt-mode': 'reveal', 'data-kt-duration': '0.6', 'data-kt-delay': '0', 'data-kt-cell-size': '10', src: source, alt: 'reveal' });
    const manual = mount({ 'data-kt-stylize': 'halftone', 'data-kt-mode': 'reveal', 'data-kt-trigger': 'manual', 'data-kt-duration': '0.6', src: source, alt: 'manual' });
    const offscreen = mount({ 'data-kt-stylize': 'dither', 'data-kt-mode': 'reveal', 'data-kt-trigger': 'view', 'data-kt-duration': '0.5', src: source, alt: 'in view' }, 'img', 'cell below');
    const combined = mount({ 'data-kt-lazy': 'fade', 'data-kt-stylize': 'halftone', 'data-kt-duration': '0.3', 'data-src': source, alt: 'lazy + stylize' });
    const alias = mount({ 'data-kt-lazy': 'dither', 'data-kt-persist': 'true', 'data-src': source, alt: 'deprecated alias' });
    // An animated GIF is the portable live source: every engine decodes it, so
    // the "keeps re-rendering" promise is checked everywhere. The <video> case
    // below needs an H.264 decoder, which some Chromium builds ship without.
    const gif = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '5', src: `${base}/demo/assets/motion-demo.gif`, alt: 'animated' });
    const video = mount({ 'data-kt-stylize': 'halftone', 'data-kt-cell-size': '8', src: `${base}/demo/assets/motion-demo.mp4`, loop: '', playsinline: '', autoplay: '' }, 'video');

    Kineto.init();
    await waitFor(() => canvasOf(persist));

    // 1. persist is the default mode: the look stays and never hands off.
    const persistPalette = paletteOf(canvasOf(persist));
    report.persistOpaque = persistPalette.opaque;
    report.persistTopColors = persistPalette.colors.slice(0, 3).map(([key]) => key);

    // 2. a reveal paints while it runs, then removes its own layer once it
    //    reaches the original. Read "started" before waiting on anything else —
    //    a 0.6s reveal is over before a longer wait returns.
    report.revealStarted = Boolean(canvasOf(revealOnLoad));
    report.revealCleared = await waitFor(() => !canvasOf(revealOnLoad), 4000);
    report.persistStillThere = Boolean(canvasOf(persist));

    // 3. `manual` waits for replay(); `view` waits for the viewport.
    report.manualIdle = !canvasOf(manual);
    Kineto.getInstance(manual, 'stylize')?.replay();
    report.manualStarted = await waitFor(() => Boolean(canvasOf(manual)), 2000);
    report.offscreenIdle = !canvasOf(offscreen);
    offscreen.scrollIntoView();
    report.offscreenStarted = await waitFor(() => Boolean(canvasOf(offscreen)), 3000);

    // 4. Lazy and Stylize share one wrapper instead of nesting two.
    await waitFor(() => canvasOf(combined), 4000);
    report.combinedWrappers = combined.closest('main').querySelectorAll('.kt-lazy-wrap .kt-stylize-wrap, .kt-stylize-wrap .kt-lazy-wrap').length;
    report.combinedStylized = Boolean(canvasOf(combined));

    // 5. the deprecated alias still renders, through the Lazy prefix.
    report.aliasRendered = await waitFor(() => Boolean(alias.closest('.kt-lazy-wrap')?.querySelector('.kt-lazy-stylized-canvas')), 4000);

    // 6. a live source keeps being redrawn while the look persists.
    await waitFor(() => canvasOf(gif) && paletteOf(canvasOf(gif)).opaque > 0, 5000);
    report.gifOpaque = canvasOf(gif) ? paletteOf(canvasOf(gif)).opaque : 0;
    const gifFirst = canvasOf(gif) ? fingerprint(canvasOf(gif)) : 0;
    const rawFirst = rawFrame(gif);
    await wait(700);
    report.environmentAnimatesImages = rawFrame(gif) !== rawFirst;
    report.gifRedrawn = canvasOf(gif) ? fingerprint(canvasOf(gif)) !== gifFirst : false;
    report.gifStillDrawing = Boolean(canvasOf(gif));

    // 7. the same path for <video>, skipped where the engine cannot decode it.
    try { await video.play(); } catch (_error) { /* policy or codec may refuse */ }
    await waitFor(() => video.readyState >= 2 || video.error, 5000);
    report.videoUnsupported = Boolean(video.error) || video.readyState < 2;
    if (!report.videoUnsupported) {
      await waitFor(() => canvasOf(video) && paletteOf(canvasOf(video)).opaque > 0, 4000);
      report.videoOpaque = canvasOf(video) ? paletteOf(canvasOf(video)).opaque : 0;
      await wait(300);
      report.videoStillDrawing = Boolean(canvasOf(video));
    }

    // 7. destroy() puts the media back exactly as it was.
    Kineto.destroyModule(persist, 'stylize');
    report.destroyedCanvas = Boolean(canvasOf(persist));
    report.destroyedWrapper = Boolean(persist.closest('.kt-stylize-wrap'));
    report.destroyedStillInDom = document.contains(persist);
    report.destroyedSrc = persist.getAttribute('src') === source;
    return report;
  }, origin);
  await page.close();
  return { result, errors };
};

try {
  const { result, errors } = await probe('no-preference');
  assert.deepEqual(errors, [], 'stylize must not raise page errors');

  assert.ok(result.persistOpaque > 0, 'persist must paint the canvas');
  assert.deepEqual(
    [...result.persistTopColors].sort(),
    ['0,0,0', '255,255,255'].sort(),
    'a two-colour dither must paint only the paper and ink colours'
  );
  assert.equal(result.persistStillThere, true, 'persist must keep the stylized layer');

  assert.equal(result.revealStarted, true, 'a reveal must paint before it hands off');
  assert.equal(result.revealCleared, true, 'a reveal must drop its layer once it reaches the original');

  assert.equal(result.manualIdle, true, 'trigger=manual must not start on its own');
  assert.equal(result.manualStarted, true, 'replay() must start a manual reveal');
  assert.equal(result.offscreenIdle, true, 'trigger=view must wait for the viewport');
  assert.equal(result.offscreenStarted, true, 'trigger=view must start once in view');

  assert.equal(result.combinedWrappers, 0, 'Lazy and Stylize must share one wrapper, not nest two');
  assert.equal(result.combinedStylized, true, 'Stylize must still paint when Lazy owns the wrapper');

  assert.equal(result.aliasRendered, true, 'the deprecated data-kt-lazy alias must keep rendering');
  assert.ok(
    result.deprecations.some((entry) => entry.module === 'lazy' && entry.variant === 'dither' && entry.replacement === 'data-kt-stylize="dither"'),
    'the deprecated alias must emit KT_DEPRECATED naming its replacement'
  );
  assert.ok(
    !result.deprecations.some((entry) => entry.module === 'stylize'),
    'the Stylize module itself must not report a deprecation'
  );

  assert.ok(result.gifOpaque > 0, 'an animated source must be drawn');
  if (result.environmentAnimatesImages) {
    assert.equal(result.gifRedrawn, true, 'an animated source must keep being redrawn while the look persists');
  } else {
    console.log(`stylize note (${browserName}) — GIF redraw skipped: this engine does not animate images offscreen.`);
  }
  assert.equal(result.gifStillDrawing, true, 'a persistent filter must stay attached to a live source');
  if (result.videoUnsupported) {
    console.log(`stylize note (${browserName}) — <video> skipped: this engine has no decoder for the fixture.`);
  } else {
    assert.ok(result.videoOpaque > 0, 'video must be drawn');
    assert.equal(result.videoStillDrawing, true, 'a persistent video filter must stay attached');
  }

  assert.equal(result.destroyedCanvas, false, 'destroy() must remove the canvas');
  assert.equal(result.destroyedWrapper, false, 'destroy() must unwrap the media');
  assert.equal(result.destroyedStillInDom, true, 'destroy() must leave the media in the document');
  assert.equal(result.destroyedSrc, true, 'destroy() must leave the source untouched');

  // Reduced motion: the look is not motion, so a permanent filter still applies;
  // a reveal is skipped and the untouched original is shown instead.
  const reduced = await probe('reduce');
  assert.deepEqual(reduced.errors, [], 'stylize must not raise page errors under reduced motion');
  assert.ok(reduced.result.persistOpaque > 0, 'reduced motion must keep a persistent filter');
  assert.equal(reduced.result.revealStarted, false, 'reduced motion must skip a reveal');
  assert.equal(reduced.result.manualStarted, false, 'reduced motion must not play a manual reveal');

  console.log(`stylize OK (${browserName}) — persist/reveal modes, load/view/manual triggers, shared Lazy wrapper, deprecated alias + KT_DEPRECATED, video frames, destroy cleanup, reduced motion.`);
} finally {
  await browser.close();
  server.close();
}
