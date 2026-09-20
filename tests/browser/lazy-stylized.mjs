// Lazy `dither` / `ascii` / `halftone` — the shared stylized-media rasterizer.
//
// Checks the behaviour the contract promises for the three variants: a reveal
// resolves into the original media, `persist` keeps the stylized look, palette
// options change real pixels, live sources (animated image, <video>) keep
// re-rendering, and destroy() leaves no wrapper, canvas or instance behind.
// Runs on Chromium by default; KT_BROWSER=firefox|webkit selects another engine.
// Run: npm run build && node tests/browser/lazy-stylized.mjs
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName] || chromium;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.gif': 'image/gif', '.png': 'image/png' };

// The fixture page is served from the same origin as the media so the canvas
// can read the sampled pixels back (a cross-origin image taints the canvas and
// the effect deliberately steps aside, which is not what this test measures).
const FIXTURE_PATH = '/__lazy-stylized__.html';
const fixtureHtml = () => `<!doctype html><html><head><link rel="stylesheet" href="/dist/kineto.css"><style>body{margin:0;background:#222}.cell{width:240px;height:160px;display:inline-block;margin:8px}.cell img,.cell video{width:100%;height:100%;object-fit:cover}</style></head><body><main></main><script src="/dist/kineto.umd.js"></script></body></html>`;
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
    response.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
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
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}${FIXTURE_PATH}`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.Kineto));

  const result = await page.evaluate(async (base) => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const main = document.querySelector('main');
    const mount = (attributes, tag = 'img') => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const media = document.createElement(tag);
      Object.entries(attributes).forEach(([name, value]) => media.setAttribute(name, value));
      cell.appendChild(media);
      main.appendChild(cell);
      return media;
    };
    const canvasOf = (media) => media.closest('.kt-lazy-wrap')?.querySelector('.kt-lazy-stylized-canvas') || null;
    const pixels = (canvas) => {
      const context = canvas.getContext('2d');
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      const colors = new Map();
      let opaque = 0;
      for (let index = 0; index < data.length; index += 4) {
        if (data[index + 3] === 0) continue;
        opaque += 1;
        const key = `${data[index]},${data[index + 1]},${data[index + 2]}`;
        colors.set(key, (colors.get(key) || 0) + 1);
      }
      return { opaque, total: data.length / 4, colors };
    };
    const fingerprint = (canvas) => {
      const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      let hash = 0;
      for (let index = 0; index < data.length; index += 16) hash = (hash * 31 + data[index] + data[index + 1] * 3 + data[index + 2] * 7) >>> 0;
      return hash;
    };
    const waitFor = async (check, timeout = 6000) => {
      const start = performance.now();
      while (performance.now() - start < timeout) {
        if (check()) return true;
        await wait(40);
      }
      return check();
    };
    const source = `${base}/demo/assets/gallery-01.webp`;
    const report = { errors: [] };

    // 1. persist: two-colour ordered dither paints only paper/ink pixels.
    const dither = mount({ 'data-kt-lazy': 'dither', 'data-kt-persist': 'true', 'data-kt-paper-color': '#f1ede2', 'data-kt-ink-color': '#ff4a1c', 'data-kt-cell-size': '6', 'data-src': source });
    const ascii = mount({ 'data-kt-lazy': 'ascii', 'data-kt-persist': 'true', 'data-kt-cell-size': '10', 'data-kt-paper-color': '#ffffff', 'data-kt-ink-color': '#000000', 'data-src': source });
    const halftone = mount({ 'data-kt-lazy': 'halftone', 'data-kt-persist': 'true', 'data-kt-paper-color': '#ffffff', 'data-kt-ink-color': '#000000', 'data-src': source });
    const inverted = mount({ 'data-kt-lazy': 'dither', 'data-kt-persist': 'true', 'data-kt-inverted': 'true', 'data-kt-paper-color': '#f1ede2', 'data-kt-ink-color': '#ff4a1c', 'data-kt-cell-size': '6', 'data-src': source });
    const diffusion = mount({ 'data-kt-lazy': 'dither', 'data-kt-persist': 'true', 'data-kt-dither-type': 'floyd-steinberg', 'data-kt-original-colors': 'true', 'data-kt-color-steps': '3', 'data-kt-cell-size': '4', 'data-src': source });
    const random = mount({ 'data-kt-lazy': 'dither', 'data-kt-persist': 'true', 'data-kt-dither-type': 'random', 'data-kt-seed': '7', 'data-kt-paper-color': '#f1ede2', 'data-kt-ink-color': '#ff4a1c', 'data-kt-cell-size': '6', 'data-src': source });
    const reveal = mount({ 'data-kt-lazy': 'ascii', 'data-kt-duration': '0.8', 'data-kt-delay': '0', 'data-kt-cell-size': '10', 'data-src': source });
    const gif = mount({ 'data-kt-lazy': 'dither', 'data-kt-persist': 'true', 'data-kt-cell-size': '4', 'data-src': `${base}/demo/assets/motion-demo.gif` });
    let progressEnd = null;
    Kineto.init();
    // The reveal card also exercises the JavaScript API with callbacks.
    const revealInstance = Kineto.getInstance(reveal, 'lazy');
    Kineto.destroyModule(reveal, 'lazy');
    Kineto.lazy(reveal, { effect: 'ascii', duration: 0.8, delay: 0, cellSize: 10, nativeLazy: false, rootMargin: '10000px', onProgress: (value) => { progressEnd = value; } });
    report.revealInstanceCreated = Boolean(revealInstance);

    await waitFor(() => [dither, ascii, halftone, inverted, diffusion, random, gif].every((media) => canvasOf(media)?.width > 1 && pixels(canvasOf(media)).opaque > 0), 8000);
    const ditherPixels = pixels(canvasOf(dither));
    report.dither = {
      opaque: ditherPixels.opaque,
      total: ditherPixels.total,
      colors: [...ditherPixels.colors.keys()],
      inkShare: (ditherPixels.colors.get('255,74,28') || 0) / ditherPixels.opaque
    };
    const invertedPixels = pixels(canvasOf(inverted));
    report.invertedInkShare = (invertedPixels.colors.get('255,74,28') || 0) / invertedPixels.opaque;
    report.asciiColors = pixels(canvasOf(ascii)).colors.size;
    report.asciiWhiteShare = (pixels(canvasOf(ascii)).colors.get('255,255,255') || 0) / pixels(canvasOf(ascii)).opaque;
    report.halftoneWhiteShare = (pixels(canvasOf(halftone)).colors.get('255,255,255') || 0) / pixels(canvasOf(halftone)).opaque;
    report.halftoneColors = pixels(canvasOf(halftone)).colors.size;
    report.diffusionColors = pixels(canvasOf(diffusion)).colors.size;
    report.fingerprints = { dither: fingerprint(canvasOf(dither)), random: fingerprint(canvasOf(random)), inverted: fingerprint(canvasOf(inverted)) };
    report.originalVisible = [dither, ascii, halftone].map((media) => getComputedStyle(media).opacity);

    // 2. The animated GIF keeps changing behind the dither (MK-LAZY-006). Some
    //    headless builds never advance animated images at all; detect that from
    //    the raw <img> so the check measures the effect, not the environment.
    const rawFrame = (media) => {
      const scratch = document.createElement('canvas');
      scratch.width = 60;
      scratch.height = 40;
      scratch.getContext('2d').drawImage(media, 0, 0, 60, 40);
      return fingerprint(scratch);
    };
    const gifFirst = fingerprint(canvasOf(gif));
    const rawFirst = rawFrame(gif);
    await wait(450);
    report.environmentAnimatesImages = rawFrame(gif) !== rawFirst;
    report.gifChanged = fingerprint(canvasOf(gif)) !== gifFirst;

    // 3. Reveal: the canvas layer fades out and the original is exposed.
    report.revealLayerAtStart = Boolean(canvasOf(reveal));
    await waitFor(() => !canvasOf(reveal), 5000);
    report.revealFinished = !canvasOf(reveal) && getComputedStyle(reveal).opacity === '1' && reveal.currentSrc.endsWith('gallery-01.webp');
    report.progressEnd = progressEnd;

    // 4. Video: frames from a canvas stream are re-rendered while playing.
    const feed = document.createElement('canvas');
    feed.width = 160;
    feed.height = 100;
    const feedContext = feed.getContext('2d');
    // Every feed frame must differ from the ones around it, otherwise two
    // samples taken a few hundred ms apart can land on the same picture and
    // report a false "did not re-render". A bar sweeping across the frame gives
    // a long period (about 3 s at the 60 ms interval below); the halftone reads
    // luminance, so the bar is bright on a dark background.
    let feedFrame = 0;
    const paintFeed = () => {
      feedFrame += 1;
      feedContext.fillStyle = '#202020';
      feedContext.fillRect(0, 0, 160, 100);
      feedContext.fillStyle = '#f0f0f0';
      feedContext.fillRect((feedFrame * 3) % 160, 0, 24, 100);
      feedContext.fillRect(0, (feedFrame * 5) % 100, 160, 14);
    };
    paintFeed();
    const video = mount({ 'data-kt-lazy': 'halftone', 'data-kt-persist': 'true', 'data-kt-cell-size': '6', 'data-kt-paper-color': '#101010', 'data-kt-ink-color': '#7cf5c4', muted: '', playsinline: '' }, 'video');
    let stream = null;
    try { stream = feed.captureStream(15); } catch (_error) { stream = null; }
    if (stream) {
      video.srcObject = stream;
      Kineto.lazy(video, { effect: 'halftone', persist: true, cellSize: 6, paperColor: '#101010', inkColor: '#7cf5c4', rootMargin: '10000px', threshold: 0 });
      const feedTimer = setInterval(paintFeed, 60);
      const videoCanvasReady = await waitFor(() => video.readyState >= 2 && canvasOf(video) && pixels(canvasOf(video)).opaque > 0, 8000);
      // Some headless builds (WebKit on Linux without a compositor) accept a
      // canvas stream but never deliver a second frame to the <video>. Sample
      // the raw element too, so the assertion measures the effect, not the
      // environment — the same approach as the animated-image check above.
      const rawVideoBefore = videoCanvasReady ? rawFrame(video) : 0;
      const before = videoCanvasReady ? fingerprint(canvasOf(video)) : 0;
      await wait(400);
      const rawVideoAfter = videoCanvasReady ? rawFrame(video) : 0;
      // Give the 24 fps render loop a few frames to pick up the newest frame
      // before comparing, so a frame that arrived just now is not a false miss.
      await wait(150);
      const after = videoCanvasReady ? fingerprint(canvasOf(video)) : 0;
      const videoInstance = Kineto.getInstance(video, 'lazy');
      videoInstance.pause();
      await wait(200);
      const pausedA = fingerprint(canvasOf(video));
      await wait(300);
      const pausedB = fingerprint(canvasOf(video));
      videoInstance.resume();
      clearInterval(feedTimer);
      report.video = { ready: videoCanvasReady, environmentAdvancesFrames: rawVideoBefore !== rawVideoAfter, rerendered: before !== after, frozenWhilePaused: pausedA === pausedB, colors: pixels(canvasOf(video)).colors.size };
    } else {
      report.video = { unsupported: true };
    }

    // 5. destroy() leaves nothing behind.
    const before = { wrappers: document.querySelectorAll('.kt-lazy-wrap').length, canvases: document.querySelectorAll('.kt-lazy-stylized-canvas').length, instances: Kineto.instanceCount };
    Kineto.destroy();
    await wait(80);
    report.cleanup = {
      before,
      wrappers: document.querySelectorAll('.kt-lazy-wrap').length,
      canvases: document.querySelectorAll('.kt-lazy-stylized-canvas').length,
      instances: Kineto.instanceCount,
      videoStyle: video.getAttribute('style'),
      ditherStyle: dither.getAttribute('style')
    };
    return report;
  }, origin);

  assert.deepEqual(errors, [], `page errors: ${errors.join(' | ')}`);
  assert.ok(result.revealInstanceCreated, 'data-kt-lazy="ascii" must create a lazy instance through scan()');
  assert.ok(result.dither.opaque === result.dither.total, `persist dither must paint every pixel (${result.dither.opaque}/${result.dither.total})`);
  assert.deepEqual([...result.dither.colors].sort(), ['241,237,226', '255,74,28'], `two-colour dither must use exactly paper and ink: ${result.dither.colors.join(' ')}`);
  assert.ok(result.dither.inkShare > 0.05 && result.dither.inkShare < 0.95, `dither must mix ink and paper (ink share ${result.dither.inkShare.toFixed(2)})`);
  assert.ok(Math.abs(result.invertedInkShare - (1 - result.dither.inkShare)) < 0.12, `inverted dither must swap the ink share (${result.invertedInkShare.toFixed(2)} vs ${result.dither.inkShare.toFixed(2)})`);
  assert.ok(result.fingerprints.random !== result.fingerprints.dither && result.fingerprints.inverted !== result.fingerprints.dither, 'ditherType and inverted must change the rendered pixels');
  assert.ok(result.asciiWhiteShare > 0.3 && result.asciiWhiteShare < 0.99 && result.asciiColors >= 2, `ascii must draw glyphs over the paper (white ${result.asciiWhiteShare.toFixed(2)}, colours ${result.asciiColors})`);
  assert.ok(result.halftoneWhiteShare > 0.2 && result.halftoneWhiteShare < 0.99 && result.halftoneColors >= 2, `halftone must draw dots over the paper (white ${result.halftoneWhiteShare.toFixed(2)})`);
  assert.ok(result.diffusionColors > 2, `error-diffusion colour dithering must keep sampled colours (${result.diffusionColors} colours)`);
  assert.deepEqual(result.originalVisible, ['1', '1', '1'], 'the original media stays visible under the stylized canvas');
  if (result.environmentAnimatesImages) {
    assert.ok(result.gifChanged, 'a persisted dither over an animated GIF must keep re-rendering frames');
  }
  assert.ok(result.revealLayerAtStart, 'the reveal must start with a stylized canvas layer');
  assert.ok(result.revealFinished, 'the reveal must remove its layer and expose the original image');
  assert.equal(result.progressEnd, 1, 'onProgress must end at 1');
  if (!result.video.unsupported) {
    assert.ok(result.video.ready, 'a playing <video> source must render through the stylized canvas');
    if (result.video.environmentAdvancesFrames) {
      assert.ok(result.video.rerendered, 'a persisted video must re-render as frames change');
    }
    assert.ok(result.video.frozenWhilePaused, 'pause() must stop re-rendering the video');
    assert.ok(result.video.colors >= 2, 'video halftone must draw ink dots over the paper');
  }
  assert.equal(result.cleanup.instances, 0, 'destroy must release every instance');
  assert.equal(result.cleanup.wrappers, 0, 'destroy must remove every lazy wrapper');
  assert.equal(result.cleanup.canvases, 0, 'destroy must remove every stylized canvas');
  // Chromium may keep an empty `style=""` shell after removeAttribute; what
  // matters is that no owned declaration survives.
  assert.equal((result.cleanup.videoStyle || '').trim(), '', `destroy must restore the video inline style (${result.cleanup.videoStyle})`);
  assert.equal((result.cleanup.ditherStyle || '').trim(), '', `destroy must restore the image inline style (${result.cleanup.ditherStyle})`);
  const skipped = [
    result.environmentAnimatesImages ? '' : 'animated-image continuity skipped: this browser build does not advance GIF frames',
    result.video.unsupported ? 'video skipped: captureStream unsupported here' : '',
    !result.video.unsupported && !result.video.environmentAdvancesFrames ? 'video re-render skipped: this browser build does not deliver new canvas-stream frames' : ''
  ].filter(Boolean);
// ── Data Mosaic 은 격자가 아니라 모자이크여야 합니다 ─────────────────────────
//
// 예전에는 `tileMax` 격자의 칸마다 같은 배율로 쪼개서 타일이 거의 한 가지 크기로 수렴했고,
// 결과가 모자이크가 아니라 규칙적인 격자로 읽혔습니다. 그리고 버스트마다 씨앗을 처음부터
// 다시 잡아 **다시 재생해도 같은 그림**이었습니다. 두 가지를 함께 지킵니다.
const mosaic = await page.evaluate(async () => {
  const cell = document.createElement('div');
  cell.className = 'cell';
  const image = document.createElement('img');
  image.dataset.src = './demo/assets/gallery-04.webp';
  cell.appendChild(image);
  document.querySelector('main').appendChild(cell);
  const instance = window.Kineto.create('lazy', image, { preset: 'data-mosaic', duration: 0.6, tileMax: 48, tileMin: 6 });
  const layerOf = () => cell.querySelector('[class*="data-mosaic-layer"]');
  const settle = () => new Promise((resolve) => setTimeout(resolve, 140));
  // 첫 버스트가 **끝난 뒤에** 다시 재생해야 합니다. 도는 중에 부르면 같은 레이어가 그대로
  // 남아 두 번 다 같은 그림을 읽게 됩니다(테스트가 실제로 그렇게 속았습니다).
  const finished = () => new Promise((resolve) => setTimeout(resolve, 900));
  await settle();
  const read = () => {
    const tiles = [...(layerOf()?.children || [])];
    const tally = new Map();
    tiles.forEach((tile) => tally.set(tile.style.width, (tally.get(tile.style.width) || 0) + 1));
    return {
      count: tiles.length,
      sizes: [...tally.keys()],
      // 큰 타일이 **면적으로** 얼마나 차지하는가. 개수로 세면 작은 타일이 당연히 많아서
      // (한 칸을 넷으로 쪼개면 4개가 되니까) 분포가 왜곡됩니다. 눈에 "큰 덩어리와 작은
      // 알갱이가 섞여 있다"로 읽히려면 가장 큰 크기가 면적의 한 자리 수 이상은 되어야 합니다.
      largestAreaShare: (() => {
        const area = (size) => Number.parseFloat(size) ** 2;
        const total = tiles.reduce((sum, tile) => sum + area(tile.style.width), 0) || 1;
        const largest = Math.max(...[...tally.keys()].map(Number.parseFloat));
        return tiles.filter((tile) => Number.parseFloat(tile.style.width) === largest)
          .reduce((sum, tile) => sum + area(tile.style.width), 0) / total;
      })(),
      layout: tiles.map((tile) => `${tile.style.left}/${tile.style.top}/${tile.style.width}`).join(',')
    };
  };
  const first = read();
  await finished();
  // 데모의 Replay 버튼이 실제로 부르는 경로로 다시 재생합니다.
  window.Kineto.replay(image, 'lazy');
  await settle();
  const second = read();
  instance.destroy();
  cell.remove();
  return { first, second };
});

assert.ok(mosaic.first.count > 30, `the mosaic must cover the image with tiles (got ${mosaic.first.count})`);
assert.ok(mosaic.first.sizes.length >= 3,
  `tiles must come in several sizes (sizes: ${mosaic.first.sizes.join(', ')})`);
assert.ok(mosaic.first.largestAreaShare > 0.08,
  `the coarsest tiles must hold real estate, or every cell has split to the floor and the cover is a plain fine grid `
  + `(largest size covers ${(mosaic.first.largestAreaShare * 100).toFixed(0)}% of the area; sizes: ${mosaic.first.sizes.join(', ')})`);
assert.notEqual(mosaic.first.layout, mosaic.second.layout,
  `replaying must lay the tiles out afresh — replaying into the identical pattern is what made the effect look canned (${mosaic.first.count} then ${mosaic.second.count} tiles)`);

  console.log(`Lazy stylized OK (${browserName}): dither/ascii/halftone persist + reveal, palette/type/inverted pixels, live-source re-render, pause freeze, mosaic tile variety, full cleanup${skipped.length ? ` (${skipped.join('; ')})` : ''}.`);
} finally {
  await browser.close();
  server.close();
}
