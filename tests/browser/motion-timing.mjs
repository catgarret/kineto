// Pointer-following motion runs on elapsed time, not on frame count.
//
// Tilt, Magnetic, Card Glow, Mouse Parallax, Horizontal Scroll, Scroll Velocity
// and Radial eased with `lerp(current, target, smoothing)` once per
// requestAnimationFrame. On a 120Hz screen (ProMotion laptops and phones) that
// moved twice as fast as the 60Hz feel it was tuned on; on a busy page it
// dragged (Card Glow's light took seconds to return in WebKit). They now use
// utils.frameEase(), like Cursor already did.
//
// Also locked here: those modules read `ease` as a NUMBER (an alias of
// `smoothing`). The demo drawer offered them a curve editor, and a curve string
// turned every frame into NaN — the element simply stopped moving. And Mouse
// Parallax's default preset ignored `smoothing`, so that drawer control did
// nothing.
//
// The page's requestAnimationFrame is replaced by a manual queue so the test
// chooses the frame timestamps (60Hz vs 120Hz) instead of hoping for them.
//
// Run: npm run build && node tests/browser/motion-timing.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);
const SITE = 'http://kineto.test';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0} .box{width:200px;height:120px;margin:20px;background:#ccc}
</style></head><body>
  <div id="stage"></div>
  <script>
    // Manual frame clock: modules call requestAnimationFrame as usual, the test
    // decides when each frame runs and with which timestamp.
    window.__frames = [];
    window.requestAnimationFrame = (callback) => { window.__frames.push(callback); return window.__frames.length; };
    window.cancelAnimationFrame = (id) => { if (window.__frames[id - 1]) window.__frames[id - 1] = null; };
    window.__runFrames = (count, stepMs, start) => {
      let time = start;
      for (let index = 0; index < count; index += 1) {
        time += stepMs;
        const queue = window.__frames; window.__frames = [];
        queue.forEach((callback) => callback && callback(time));
      }
      return time;
    };
  </script>
  <script src="${SITE}/dist/kineto.umd.js"></script>
</body></html>`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox'] }
  : { headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.origin === SITE && url.pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: html });
  if (url.origin === SITE && url.pathname.startsWith('/dist/')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(root, url.pathname)) });
  return route.fulfill({ status: 404, body: '' });
});
await page.goto(`${SITE}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.Kineto);

// Moves a fresh Tilt toward the pointer for `wallMs` of simulated time at the
// given refresh rate and returns how far (degrees) it got.
const tiltAfter = (hz, wallMs, options = {}) => page.evaluate(({ hz, wallMs, options }) => {
  const box = document.createElement('div');
  box.className = 'box';
  document.getElementById('stage').appendChild(box);
  const instance = window.Kineto.create('tilt', box, { max: 20, ...options });
  window.__runFrames(3, 1000 / 60, 1000);
  const rect = box.getBoundingClientRect();
  const at = { bubbles: true, clientX: rect.left + 4, clientY: rect.top + 4 };
  box.dispatchEvent(new PointerEvent('pointerenter', at));
  box.dispatchEvent(new PointerEvent('pointermove', at));
  box.dispatchEvent(new MouseEvent('mousemove', at));
  const frames = Math.round(wallMs / (1000 / hz));
  window.__runFrames(frames, 1000 / hz, 2000);
  const match = box.style.transform.match(/rotateX\(([-\d.e]+)deg\)/);
  instance.destroy();
  box.remove();
  return match ? Number(match[1]) : NaN;
}, { hz, wallMs, options });

const at60 = await tiltAfter(60, 150);
const at120 = await tiltAfter(120, 150);
const settled = await tiltAfter(60, 3000);
assert.ok(Number.isFinite(at60) && Math.abs(at60) > 0.5, `tilt must move toward the pointer (${at60})`);
assert.ok(Math.abs(settled) > Math.abs(at60), `150ms must be part of the way, not all of it (${at60} vs ${settled})`);
assert.ok(Math.abs(at120 - at60) / Math.abs(at60) < 0.06,
  `the same 150ms must cover the same angle at 60Hz and 120Hz (60Hz ${at60.toFixed(3)}°, 120Hz ${at120.toFixed(3)}°)`);

// A curve name where a number is expected keeps the default instead of NaN.
const curved = await tiltAfter(60, 150, { ease: 'cubic-bezier(.2,.8,.2,1)' });
assert.ok(Number.isFinite(curved) && Math.abs(curved - at60) < 1e-6,
  `Tilt with ease:'cubic-bezier(…)' must keep its default smoothing (${curved} vs ${at60})`);

const numericEase = await page.evaluate(() => {
  const results = {};
  const place = () => { const el = document.createElement('div'); el.className = 'box'; document.getElementById('stage').appendChild(el); return el; };
  const point = (el, dx = 30, dy = 20) => {
    const rect = el.getBoundingClientRect();
    const at = { bubbles: true, clientX: rect.left + rect.width / 2 + dx, clientY: rect.top + rect.height / 2 + dy };
    el.dispatchEvent(new PointerEvent('pointerenter', at));
    el.dispatchEvent(new PointerEvent('pointermove', at));
    el.dispatchEvent(new MouseEvent('mousemove', at));
  };
  // Magnetic (pointer preset) with a curve-valued `ease`.
  const magnet = place();
  const magnetic = window.Kineto.create('magnetic', magnet, { ease: 'cubic-bezier(.2,.8,.2,1)', radius: 400 });
  point(magnet);
  window.__runFrames(20, 1000 / 60, 5000);
  results.magnetic = magnet.style.transform;
  magnetic.destroy();
  // Mouse Parallax: the layered preset must read `smoothing` (1 = arrive in one frame).
  const layer = place();
  const parallax = window.Kineto.create('mouseParallax', layer, { smoothing: 1, maxX: 40, maxY: 40, speed: 1 });
  point(layer, 60, 0);
  window.__runFrames(1, 1000 / 60, 8000);
  const oneFrame = layer.style.transform;
  window.__runFrames(30, 1000 / 60, 9000);
  results.parallaxArrivesInOneFrame = oneFrame === layer.style.transform && /translate3d\(/.test(oneFrame);
  parallax.destroy();
  // Cursor with a curve-valued `ease` still follows.
  const cursor = window.Kineto.create('cursor', document.body, { preset: 'dot', ease: 'power2.out' });
  document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 300, clientY: 200 }));
  window.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 300, clientY: 200 }));
  window.__runFrames(20, 1000 / 60, 12000);
  const follower = document.querySelector('.kt-cursor-follower, .kt-cursor');
  results.cursor = follower ? follower.style.transform : 'no follower';
  cursor?.destroy?.();
  return results;
});
assert.match(numericEase.magnetic, /translate3d\(-?\d/, `Magnetic with a curve-valued ease must still move (${numericEase.magnetic})`);
assert.doesNotMatch(numericEase.magnetic, /NaN/, 'Magnetic must never write NaN');
assert.equal(numericEase.parallaxArrivesInOneFrame, true, 'Mouse Parallax (layers) must honour `smoothing`');
assert.doesNotMatch(numericEase.cursor, /NaN/, `Cursor with a curve-valued ease must not write NaN (${numericEase.cursor})`);

// Slider: a frame timestamp that repeats counts as one frame. The track loop
// used `time - lastFrameTime`, which is 0 for a repeated timestamp, so a
// carousel fed the same timestamp stood still short of its slide and kept
// requesting frames; the radial loop's duration curve measured `time` against
// performance.now() and never finished. Five normal frames start each move,
// then 90 callbacks all carry the same timestamp.
const repeatedFrames = await page.evaluate(() => {
  const stuckAt = (time) => window.__runFrames(90, 0, time);
  const slide = (label) => `<article class="kt-slide" style="width:300px;height:120px">${label}</article>`;
  const track = document.createElement('section');
  track.innerHTML = `<div class="kt-slider-wrap"><div class="kt-slider-track">${slide('A')}${slide('B')}${slide('C')}</div></div>`;
  document.getElementById('stage').appendChild(track);
  const carousel = window.Kineto.create('slider', track, { effect: 'fade', loop: 'off', smoothing: 0.18, momentum: false, pauseWhenOffscreen: false });
  window.__runFrames(3, 1000 / 60, 20000);
  carousel.next();
  stuckAt(window.__runFrames(5, 1000 / 60, 21000));
  const progress = Number(track.querySelectorAll('.kt-slide')[1].style.getPropertyValue('--kt-slider-slide-progress'));
  const trackPending = window.__frames.filter(Boolean).length;
  carousel.destroy();
  track.remove();

  const orbit = document.createElement('section');
  orbit.className = 'kt-radial';
  orbit.style.cssText = 'width:300px;height:300px;position:relative';
  orbit.innerHTML = ['1', '2', '3', '4'].map((label) => `<div class="orbit-item" style="width:40px;height:40px">${label}</div>`).join('');
  document.getElementById('stage').appendChild(orbit);
  const radial = window.Kineto.create('slider', orbit, { effect: 'radial', loop: 'off', duration: 0.4, initialIndex: 0, pauseWhenOffscreen: false });
  window.__runFrames(3, 1000 / 60, 30000);
  radial.next();
  stuckAt(window.__runFrames(5, 1000 / 60, 31000));
  const item = orbit.querySelectorAll('.orbit-item')[1];
  const afterStuck = item.style.transform;
  const pending = window.__frames.filter(Boolean).length;
  window.__runFrames(40, 1000 / 60, 40000);
  const radialSettled = { active: item.classList.contains('kt-active'), pending, landed: item.style.transform === afterStuck };
  radial.destroy();
  orbit.remove();
  return { progress, trackPending, radialSettled };
});
assert.equal(repeatedFrames.progress, 1, `a slider fed a repeated frame timestamp must still land on its slide (progress ${repeatedFrames.progress})`);
assert.equal(repeatedFrames.trackPending, 0, 'a landed slider must stop requesting frames');
assert.deepEqual(repeatedFrames.radialSettled, { active: true, pending: 0, landed: true }, `the radial slider must finish its move on repeated timestamps too (${JSON.stringify(repeatedFrames.radialSettled)})`);

assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
await browser.close();
console.log(`motion-timing OK (${browserName}) — Tilt covers ${at60.toFixed(2)}° in 150ms at 60Hz and ${at120.toFixed(2)}° at 120Hz; Tilt, Magnetic and Cursor keep moving with a curve-valued ease; Mouse Parallax honours smoothing; the track and radial Slider land on repeated frame timestamps.`);
