// Pause, resume and destroy at the awkward moments.
//
// Each case below was a real defect:
//   • Sticky Header / Parallax (no-GSAP fallback): a frame queued by the last
//     scroll ran AFTER destroy() and put the class / transform back.
//   • Bottom Sheet: destroy() closes the sheet, and the close animation's
//     finish handler then hid the restored panel for good.
//   • Counter (pop): onComplete fired a second after destroy().
//   • Tilt: pause() cancelled its frame but kept the id, so resume() never
//     scheduled another — one tab switch left it dead.
//   • Radial: `autoplay: true` was Number(true) = 1ms per step, and a hover-out
//     or scroll-back restarted autoplay on a carousel the page had paused.
//   • Lazy under Ambient Media: Ambient Media moves the image into its wrapper
//     right after Lazy started observing it. The observer then reports
//     [not visible, visible] in one batch; reading only the first record left
//     the image unloaded forever.
//   • Tabs initialised inside a hidden panel wrote `width: 0` for the marker,
//     so revealing them started a CSS transition from nothing: the pill was
//     missing until that transition got frames (a busy page, WebKit in CI).
//   • Reduced motion removed FEATURES, not motion: Lightbox never opened, Date
//     Time never formatted, Sticky Header never got its class, and Gesture's
//     pull-to-refresh was gone.
//
// Run: npm run build && node tests/browser/lifecycle-edges.mjs   (KT_BROWSER=firefox|webkit)
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
  body{margin:0} .spacer{height:1500px} #sheet{height:200px}
  #tilt{width:200px;height:120px;background:#ccc} #radial{width:400px;height:300px}
  #radial > div{width:60px;height:60px}
  #tabsEl [role=tablist]{position:relative;display:flex} #tabsEl button{width:80px;height:30px}
  #tabsEl .kt-tabs__indicator{position:absolute;left:0;bottom:0;height:4px;transition:transform 5s linear,width 5s linear}
</style></head><body>
  <header id="header" data-kt-sticky-header></header>
  <div id="px">parallax</div>
  <div class="spacer"></div>
  <div id="sheet" hidden><p>sheet</p><button>ok</button></div>
  <span id="counter">0</span>
  <div id="tilt"></div>
  <div id="radial"><div class="kt-radial-item">1</div><div class="kt-radial-item">2</div><div class="kt-radial-item">3</div><div class="kt-radial-item">4</div></div>
  <img id="photo" alt="photo" width="40" height="40" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
  <time id="when" data-kt-date-time data-kt-date="2020-01-02T03:04:05Z" data-kt-mode="absolute" data-kt-locale="en-US">raw</time>
  <header id="header2"></header>
  <div id="ambient" style="width:200px;height:120px;position:relative"><img id="lazyimg" alt="lazy"></div>
  <img id="batched" alt="batched" width="40" height="40"><div id="batchedReveal">reveal</div>
  <div id="tabsWrap" hidden><div id="tabsEl"><div role="tablist"><button type="button">One</button><button type="button">Two</button></div><div class="kt-tabpanel">one</div><div class="kt-tabpanel">two</div></div></div>
  <div id="pull" style="height:120px;overflow:auto"><div style="height:400px">list</div></div>
  <div class="spacer"></div>
  <script src="${SITE}/dist/kineto.umd.js"></script>
</body></html>`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox'] }
  : { headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.origin === SITE && url.pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: html });
  if (url.origin === SITE && url.pathname.startsWith('/dist/')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(root, url.pathname)) });
  // No GSAP here on purpose: Parallax takes its native fallback path.
  return route.fulfill({ status: 404, body: '' });
});
await page.goto(`${SITE}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.Kineto);
const frames = (count = 3) => page.evaluate((n) => new Promise((resolve) => {
  let left = n;
  const step = () => (--left <= 0 ? resolve() : requestAnimationFrame(step));
  requestAnimationFrame(step);
}), count);

// Sticky Header + Parallax fallback: scroll, then destroy before the frame runs.
const afterScroll = await page.evaluate(async () => {
  const header = document.getElementById('header');
  const px = document.getElementById('px');
  const sticky = window.Kineto.create('stickyHeader', header, { offset: 10 });
  // The fallback is what runs without GSAP; call it directly so the test does
  // not depend on whether an engine happens to be on the page.
  const pxInstance = window.Kineto.registry.parallax.fallback(px, { speed: 0.5 });
  window.scrollTo(0, 400);
  window.dispatchEvent(new Event('scroll'));
  sticky.destroy();
  pxInstance.destroy();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return {
    headerClass: header.className,
    headerProgress: header.style.getPropertyValue('--kt-header-progress'),
    pxTransform: px.style.transform
  };
});
assert.deepEqual(afterScroll, { headerClass: '', headerProgress: '', pxTransform: '' },
  `a frame queued before destroy() must not write after it (${JSON.stringify(afterScroll)})`);

// Bottom Sheet: destroy an open sheet; the panel must not be hidden afterwards.
await page.evaluate(() => window.scrollTo(0, 0));
const sheet = await page.evaluate(async () => {
  const el = document.getElementById('sheet');
  const instance = window.Kineto.create('bottomSheet', el, { duration: 0.2 });
  instance.open();
  await new Promise((resolve) => setTimeout(resolve, 300));
  instance.destroy();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { hidden: el.hidden, cls: el.className };
});
assert.deepEqual(sheet, { hidden: false, cls: '' }, `a destroyed sheet must stay as destroy() left it (${JSON.stringify(sheet)})`);

// Counter pop: no onComplete after destroy.
const completed = await page.evaluate(async () => {
  const el = document.getElementById('counter');
  let calls = 0;
  const instance = window.Kineto.create('counter', el, { mode: 'pop', to: 42, popDuration: 0.1, stagger: 0.01, onComplete: () => { calls += 1; } });
  instance?.replay?.();
  instance.destroy();
  await new Promise((resolve) => setTimeout(resolve, 600));
  return calls;
});
assert.equal(completed, 0, 'a destroyed counter must not report completion');

// Tilt: pause → resume must bring the pointer response back.
const tilt = await page.evaluate(async () => {
  const el = document.getElementById('tilt');
  el.scrollIntoView();
  const instance = window.Kineto.create('tilt', el, { max: 20, smoothing: 1 });
  instance.pause();
  instance.resume();
  const box = el.getBoundingClientRect();
  el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, clientX: box.left + 5, clientY: box.top + 5 }));
  el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: box.left + 5, clientY: box.top + 5 }));
  el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: box.left + 5, clientY: box.top + 5 }));
  await new Promise((resolve) => setTimeout(resolve, 300));
  const transform = el.style.transform;
  instance.destroy();
  return transform;
});
assert.match(tilt, /rotate/, `a resumed tilt must respond to the pointer again (transform: "${tilt}")`);

// Radial: autoplay:true is a 3s interval, and the page's pause() holds.
const radial = await page.evaluate(async () => {
  const el = document.getElementById('radial');
  el.scrollIntoView();
  const instance = window.Kineto.create('radial', el, { autoplay: true });
  const start = instance.index;
  await new Promise((resolve) => setTimeout(resolve, 400));
  const after400 = instance.index;
  instance.pause();
  el.dispatchEvent(new MouseEvent('mouseleave'));
  const i2 = instance.index;
  await new Promise((resolve) => setTimeout(resolve, 3300));
  const afterPausedWait = instance.index;
  instance.destroy();
  return { start, after400, pausedMoved: afterPausedWait !== i2 };
});
assert.equal(radial.after400, radial.start, `autoplay:true must not step within 400ms (${JSON.stringify(radial)})`);
assert.equal(radial.pausedMoved, false, `a paused radial must stay paused through a hover-out (${JSON.stringify(radial)})`);

// Lazy + Ambient Media: moved right after observe() must still load.
const movedLazy = await page.evaluate(async () => {
  const host = document.getElementById('ambient');
  const image = document.getElementById('lazyimg');
  const src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
  let loaded = false;
  const lazy = window.Kineto.create('lazy', image, { effect: 'print', src, nativeLazy: false, rootMargin: '10000px', duration: 0.1, onLoad: () => { loaded = true; } });
  const ambient = window.Kineto.create('ambientMedia', host, { blur: 10 });
  const movedIntoWrapper = Boolean(image.closest('.kt-ambient-wrap'));
  for (let waited = 0; waited < 2000 && !loaded; waited += 50) await new Promise((resolve) => setTimeout(resolve, 50));
  const result = { movedIntoWrapper, loaded, hasSrc: image.getAttribute('src') === src };
  ambient?.destroy?.();
  lazy?.destroy?.();
  return result;
});
assert.deepEqual(movedLazy, { movedIntoWrapper: true, loaded: true, hasSrc: true },
  `a lazy image moved by Ambient Media right after observe() must still load (${JSON.stringify(movedLazy)})`);

// The same contract without relying on timing: an observer that delivers the
// stale record first and the current one last, in one batch, like a browser
// does after a DOM move. Every single-target observer must act on the last.
const batched = await page.evaluate(async () => {
  const Native = window.IntersectionObserver;
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.live = true; }
    observe(target) {
      setTimeout(() => {
        if (this.live) this.callback([
          { target, isIntersecting: false, intersectionRatio: 0 },
          { target, isIntersecting: true, intersectionRatio: 1 }
        ], this);
      }, 20);
    }
    unobserve() {}
    disconnect() { this.live = false; }
    takeRecords() { return []; }
  };
  try {
    const image = document.getElementById('batched');
    const src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
    let entered = 0;
    const lazy = window.Kineto.create('lazy', image, { effect: 'print', src, nativeLazy: false, duration: 0.1 });
    const reveal = window.Kineto.create('reveal', document.getElementById('batchedReveal'), { preset: 'class', once: false, onEnter: () => { entered += 1; } });
    await new Promise((resolve) => setTimeout(resolve, 600));
    const result = { lazyLoaded: image.getAttribute('src') === src, revealEntered: entered > 0 };
    lazy?.destroy?.();
    reveal?.destroy?.();
    return result;
  } finally {
    window.IntersectionObserver = Native;
  }
});
assert.deepEqual(batched, { lazyLoaded: true, revealEntered: true },
  `observers must act on the newest record of a batch (${JSON.stringify(batched)})`);

// Tabs created while hidden: the marker snaps into place on reveal (the
// stylesheet transition here is 5s, so anything that animates would show),
// a later tab change still slides, and hiding again keeps the geometry.
const tabsReveal = await page.evaluate(async () => {
  const nextFrames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const wrap = document.getElementById('tabsWrap');
  const el = document.getElementById('tabsEl');
  const instance = window.Kineto.create('tabs', el, {});
  await nextFrames();
  const indicator = el.querySelector('.kt-tabs__indicator');
  const writtenWhileHidden = indicator.style.width;
  wrap.hidden = false;
  instance.refresh();
  const revealedWidth = Math.round(indicator.getBoundingClientRect().width);
  el.querySelectorAll('[role=tab]')[1].click();
  const slides = indicator.getAnimations().some((animation) => animation.transitionProperty === 'transform');
  indicator.getAnimations().forEach((animation) => animation.finish());
  wrap.hidden = true;
  await nextFrames();
  const widthAfterHide = indicator.style.width;
  instance.destroy();
  wrap.hidden = false;
  return { writtenWhileHidden, revealedWidth, slides, widthAfterHide };
});
assert.deepEqual(tabsReveal, { writtenWhileHidden: '', revealedWidth: 80, slides: true, widthAfterHide: '80px' },
  `hidden-initialised tabs must place their marker on reveal without animating from 0 (${JSON.stringify(tabsReveal)})`);

// Reduced motion keeps the features and drops only the motion.
const reduced = await page.evaluate(async () => {
  window.Kineto.setReducedMotion('always');
  const photo = document.getElementById('photo');
  const lightbox = window.Kineto.create('lightbox', photo, {});
  photo.click();
  await new Promise((resolve) => setTimeout(resolve, 150));
  const viewer = document.getElementById('kt-lightbox');
  const opened = Boolean(viewer && !viewer.hidden);
  viewer?.querySelector('.kt-lightbox-close')?.click();
  const when = document.getElementById('when');
  const date = window.Kineto.create('dateTime', when, { date: '2020-01-02T03:04:05Z', mode: 'absolute', locale: 'en-US' });
  const header = document.getElementById('header2');
  const sticky = window.Kineto.create('stickyHeader', header, { offset: 10 });
  window.scrollTo(0, 300);
  window.dispatchEvent(new Event('scroll'));
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const stuck = header.classList.contains('kt-stuck');
  const pull = window.Kineto.create('gesture', document.getElementById('pull'), { preset: 'pull' });
  const result = { opened, formatted: when.textContent !== 'raw', stuck, pullIsReal: Boolean(document.querySelector('#pull .kt-pull-indicator, .kt-pull-indicator')) };
  [lightbox, date, sticky, pull].forEach((instance) => instance?.destroy?.());
  window.Kineto.setReducedMotion('user');
  return result;
});
assert.deepEqual(reduced, { opened: true, formatted: true, stuck: true, pullIsReal: true },
  `reduced motion must keep features working (${JSON.stringify(reduced)})`);

await frames();
assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
await browser.close();
console.log(`lifecycle-edges OK (${browserName}) — no writes after destroy (Sticky Header, Parallax, Bottom Sheet, Counter), Tilt revives after pause, Radial autoplay:true is 3s and pause() holds, Lazy loads after Ambient Media moves it (observers act on the newest record of a batch), hidden Tabs snap their marker on reveal, and reduced motion keeps Lightbox, Date Time, Sticky Header and pull-to-refresh working.`);
