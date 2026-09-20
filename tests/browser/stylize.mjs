// Stylize — the standalone dither / ASCII / halftone module.
//
// tests/browser/lazy-stylized.mjs still covers the deprecated `data-kt-lazy`
// aliases. This file covers what only Stylize has: `mode` (a permanent filter
// vs a one-shot reveal), the reveal `trigger` and `transition`, the living look
// (`motion`) and pointer reactions, the levels controls, the KT_DEPRECATED
// diagnostic the aliases now emit, coexistence with Lazy on one element,
// reduced motion, and destroy() leaving the media untouched.
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
    // A living look animates a STILL picture — that is the whole point of
    // `motion`, and the thing a single-paint persist could not do.
    const moving = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '4', 'data-kt-motion': 'drift', 'data-kt-motion-speed': '2', src: source, alt: 'living' });
    const still = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '4', src: source, alt: 'still' });
    // Levels: the same picture at two contrasts must not paint the same cells.
    const flat = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '4', 'data-kt-contrast': '1', 'data-kt-paper-color': '#ffffff', 'data-kt-ink-color': '#000000', src: source, alt: 'flat' });
    const punchy = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '4', 'data-kt-contrast': '2', 'data-kt-paper-color': '#ffffff', 'data-kt-ink-color': '#000000', src: source, alt: 'punchy' });
    const lens = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '10', 'data-kt-pointer': 'lens', 'data-kt-pointer-cell-size': '2', 'data-kt-pointer-radius': '60', src: source, alt: 'lens' });
    // Design tokens: a page hands Kineto its own custom properties instead of
    // repeating hex codes that then drift from the design system. The scoped
    // element must win over the root so a re-themed section re-themes the look.
    document.documentElement.style.setProperty('--kt-test-paper', '#ffffff');
    document.documentElement.style.setProperty('--kt-test-ink', '#000000');
    const tokened = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '4', 'data-kt-paper-color': 'var(--kt-test-paper)', 'data-kt-ink-color': 'var(--kt-test-ink)', src: source, alt: 'tokens' });
    const themed = mount({ 'data-kt-stylize': 'dither', 'data-kt-cell-size': '4', 'data-kt-paper-color': 'var(--kt-test-paper)', 'data-kt-ink-color': 'var(--kt-test-ink)', src: source, alt: 'themed tokens' });
    themed.style.setProperty('--kt-test-paper', '#ff00ff');
    themed.style.setProperty('--kt-test-ink', '#00ffff');
    const dissolve = mount({ 'data-kt-stylize': 'dither', 'data-kt-mode': 'reveal', 'data-kt-transition': 'dissolve', 'data-kt-duration': '4', 'data-kt-delay': '0', 'data-kt-cell-size': '4', src: source, alt: 'dissolve' });
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

    // 6. the living look, the levels and the pointer.
    await waitFor(() => canvasOf(moving) && canvasOf(still) && canvasOf(flat) && canvasOf(punchy) && canvasOf(lens), 5000);
    const movingFirst = fingerprint(canvasOf(moving));
    const stillFirst = fingerprint(canvasOf(still));
    await wait(600);
    report.motionAnimatesStillImage = fingerprint(canvasOf(moving)) !== movingFirst;
    report.stillStaysStill = fingerprint(canvasOf(still)) === stillFirst;
    // Contrast cannot be measured by how much ink there is: pushing contrast
    // around the mid grey adds as much black as it adds white. What it does
    // change is the STRUCTURE — mid tones stop being 50% checkerboards and turn
    // into solid areas, so neighbouring pixels agree far more often.
    const uniformity = (media) => {
      const canvas = canvasOf(media);
      const { width, height } = canvas;
      const { data } = canvas.getContext('2d').getImageData(0, 0, width, height);
      let same = 0;
      let pairs = 0;
      for (let y = 0; y < height; y += 1) {
        for (let x = 1; x < width; x += 1) {
          const here = (y * width + x) * 4;
          pairs += 1;
          if (data[here] === data[here - 4]) same += 1;
        }
      }
      return pairs ? same / pairs : 0;
    };
    report.flatUniformity = uniformity(flat);
    report.punchyUniformity = uniformity(punchy);
    report.contrastChangesStructure = report.punchyUniformity > report.flatUniformity + 0.02;

    // The lens only redraws once the pointer is over the media.
    const lensBefore = fingerprint(canvasOf(lens));
    const lensBox = wrapOf(lens).getBoundingClientRect();
    lens.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, clientX: lensBox.left + lensBox.width / 2, clientY: lensBox.top + lensBox.height / 2
    }));
    report.lensChanged = await waitFor(() => fingerprint(canvasOf(lens)) !== lensBefore, 2000);

    // A `dissolve` reveal keeps the authored cell size and clears cells, so the
    // canvas gains transparent pixels instead of going blurry.
    await waitFor(() => canvasOf(dissolve), 4000);
    const clearShare = () => {
      const canvas = canvasOf(dissolve);
      if (!canvas) return 1;
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      let clear = 0;
      for (let index = 3; index < data.length; index += 4) if (data[index] === 0) clear += 1;
      return clear / (data.length / 4);
    };
    const clearedEarly = clearShare();
    await wait(1200);
    report.dissolveClears = clearShare() > clearedEarly + 0.05;

    // The palette a token produced, as actually painted.
    const palette = (media) => {
      const canvas = canvasOf(media);
      if (!canvas) return [];
      return paletteOf(canvas).colors.slice(0, 2).map(([key]) => key).sort();
    };
    await waitFor(() => canvasOf(tokened) && canvasOf(themed), 5000);
    report.tokenPalette = palette(tokened);
    report.themedPalette = palette(themed);

    // 7. a live source keeps being redrawn while the look persists.
    await waitFor(() => canvasOf(gif) && paletteOf(canvasOf(gif)).opaque > 0, 5000);
    report.gifOpaque = canvasOf(gif) ? paletteOf(canvasOf(gif)).opaque : 0;
    const gifFirst = canvasOf(gif) ? fingerprint(canvasOf(gif)) : 0;
    const rawFirst = rawFrame(gif);
    await wait(700);
    report.environmentAnimatesImages = rawFrame(gif) !== rawFirst;
    report.gifRedrawn = canvasOf(gif) ? fingerprint(canvasOf(gif)) !== gifFirst : false;
    report.gifStillDrawing = Boolean(canvasOf(gif));

    // 8. the same path for <video>, skipped where the engine cannot decode it.
    try { await video.play(); } catch (_error) { /* policy or codec may refuse */ }
    await waitFor(() => video.readyState >= 2 || video.error, 5000);
    report.videoUnsupported = Boolean(video.error) || video.readyState < 2;
    if (!report.videoUnsupported) {
      await waitFor(() => canvasOf(video) && paletteOf(canvasOf(video)).opaque > 0, 4000);
      report.videoOpaque = canvasOf(video) ? paletteOf(canvasOf(video)).opaque : 0;
      await wait(300);
      report.videoStillDrawing = Boolean(canvasOf(video));
    }

    // 9. destroy() puts the media back exactly as it was.
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

  assert.equal(result.motionAnimatesStillImage, true, 'motion must keep redrawing a still picture');
  assert.equal(result.stillStaysStill, true, 'a still picture with no motion must be painted once');
  assert.equal(
    result.contrastChangesStructure, true,
    `raising contrast must consolidate mid tones into solid areas (flat ${result.flatUniformity?.toFixed(3)} vs punchy ${result.punchyUniformity?.toFixed(3)})`
  );
  assert.equal(result.lensChanged, true, 'the pointer lens must redraw the area under the pointer');
  assert.equal(result.dissolveClears, true, 'a dissolve reveal must clear cells rather than blur them');

  assert.deepEqual(
    result.tokenPalette, ['0,0,0', '255,255,255'],
    'a var(--token) colour must resolve against the page design tokens'
  );
  assert.deepEqual(
    result.themedPalette, ['0,255,255', '255,0,255'],
    'a token overridden on the element itself must win over the root value'
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
  assert.equal(reduced.result.motionAnimatesStillImage, false, 'reduced motion must disable added living-look motion');
  assert.equal(reduced.result.lensChanged, false, 'reduced motion must disable added pointer animation');

  const lifecyclePage = await browser.newPage();
  await lifecyclePage.goto(`${origin}${FIXTURE_PATH}`);
  const imageLifecycle = await lifecyclePage.evaluate(async (base) => {
    const { probeImageLifecycle } = await import(`${base}/tests/browser/stylize-image-probe.js`);
    return { source: await probeImageLifecycle(base), bundle: await probeImageLifecycle(base, true) };
  }, origin);
  assert.deepEqual(imageLifecycle, { source: [], bundle: [] }, 'Stylize image active timing and pending work must survive suspension');
  console.log(`stylize image lifecycle OK (${browserName}) — delay/reveal/hold suspension, hidden initialization, static resize, callback replay and teardown.`);
  const lifecycle = await lifecyclePage.evaluate(async (base) => {
    const [{ default: stylize }, { createImageStylizer, resolveStylizedSettings }] = await Promise.all([
      import(`${base}/src/modules/stylize.js`), import(`${base}/src/modules/media/stylizer.js`)
    ]);
    const host = document.createElement('div');
    host.className = 'cell';
    const img = new Image();
    img.src = `${base}/demo/assets/gallery-01.webp`;
    host.append(img);
    document.body.append(host);
    await img.decode();
    const failures = [];
    for (const media of [img, document.createElement('video')]) {
      if (!media.isConnected) host.append(media);
      const instance = stylize.create(media);
      instance.destroy();
      media.style.color = 'red';
      const before = host.outerHTML;
      instance.destroy(); instance.replay(); instance.resume(); instance.pause();
      if (host.outerHTML !== before) failures.push(`${media.tagName}: stale instance changed restored DOM`);
    }
    const originals = [window.requestAnimationFrame, window.cancelAnimationFrame, window.setTimeout, window.clearTimeout, window.ResizeObserver];
    const frames = new Map(), timers = new Map(), observers = new Set();
    let serial = 0;
    window.requestAnimationFrame = (fn) => { const id = ++serial; frames.set(id, fn); return id; };
    window.cancelAnimationFrame = (id) => frames.delete(id);
    window.setTimeout = (fn) => { const id = ++serial; timers.set(id, fn); return id; };
    window.clearTimeout = (id) => timers.delete(id);
    window.ResizeObserver = class { observe() { observers.add(this); } disconnect() { observers.delete(this); } };
    try {
      for (const point of ['rendered', 'persist-progress', 'reveal-progress']) {
        let controller;
        controller = createImageStylizer({
          el: img, wrapper: host, effect: 'dither',
          settings: resolveStylizedSettings('dither', { persist: point !== 'reveal-progress', motion: 'drift' }),
          onRendered: () => { if (point === 'rendered') controller.destroy(); },
          onProgress: () => { if (point !== 'rendered') controller.destroy(); }
        });
        controller.start();
        if (point === 'reveal-progress') {
          for (const [id, fn] of [...timers]) { timers.delete(id); fn(); }
          for (const [id, fn] of [...frames]) { frames.delete(id); fn(100); }
        }
        if (frames.size || timers.size || observers.size || host.querySelector('canvas')) failures.push(`${point}: callback destroy left scheduled work or a layer`);
        controller.destroy();
        frames.clear(); timers.clear(); observers.clear();
      }
    } finally {
      [window.requestAnimationFrame, window.cancelAnimationFrame, window.setTimeout, window.clearTimeout, window.ResizeObserver] = originals;
    }
    return failures;
  }, origin);
  assert.deepEqual(lifecycle, [], 'Stylize direct and callback teardown must be terminal');
  if (!result.videoUnsupported) {
    const videoLifecycle = await lifecyclePage.evaluate(async (base) => {
      const { probeVideoLifecycle } = await import(`${base}/tests/browser/stylize-video-probe.js`);
      return {
        source: await probeVideoLifecycle(base),
        bundle: await probeVideoLifecycle(base, true)
      };
    }, origin);
    assert.deepEqual(videoLifecycle, { source: [], bundle: [] }, 'Stylize video triggers, active timing and teardown must agree with the contract');
    console.log(`stylize video lifecycle OK (${browserName}) — triggers, queued replay, active delay/duration/hold, playback/visibility suspension and callback teardown.`);
  }
  await lifecyclePage.close();

  console.log(`stylize OK (${browserName}) — persist/reveal modes, load/view/manual triggers, dissolve transition, motion on a still image, contrast levels, pointer lens, design-token colours, shared Lazy wrapper, deprecated alias + KT_DEPRECATED, video frames, destroy cleanup, reduced motion.`);
} finally {
  await browser.close();
  server.close();
}
