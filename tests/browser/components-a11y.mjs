// Interactive components: accessibility, lifecycle and idle cost.
//
// Each case below was a real defect:
//   • slider-reduced: under reduced motion the stylesheet's
//     `.kt-slider-wrap{overflow:hidden}` clipped the track, so only slide 1 was
//     ever visible, and the page's next/prev buttons had no methods to call.
//   • slider-hidden-focus: Tab reached links inside `aria-hidden` slides.
//   • slider-nan: goTo() with no argument set the index to NaN and left a frame
//     loop running forever.
//   • hold-assistive: a screen reader's "activate" is a click with no press;
//     `tap` swallowed it and `hold`/`mash` never completed, while a plain click
//     on a hold-to-confirm LINK followed it at once.
//   • marquee-clones: the visual clones were aria-hidden but focusable, with
//     duplicate ids, and keyboard focus could not stop the strip.
//   • marquee-rest: a hovered strip eased toward speed 0 forever, one frame at
//     a time.
//   • nested-widgets: Tabs and Accordion claimed the parts of a nested instance.
//   • media-hidden-panel: media created inside a closed panel measured 0×0 and
//     was given a permanent 16:9 box.
//   • tilt-*: a resting pointer or a phone held still kept a frame loop per
//     card; a disabled shadow was rewritten every frame; a card paused when
//     the gyro permission arrived never listened to the gyro.
//   • lenis-prevent: the default Lenis `prevent` walked every ancestor, and
//     Lenis calls it for every ancestor too — depth² style reads per wheel.
//
// Run: npm run build && node tests/browser/components-a11y.mjs   (KT_BROWSER=firefox|webkit)
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
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${SITE}/dist/kineto.css">
<style>
  body{margin:0;font:14px system-ui} #stage{width:600px;padding:20px}
  .box{width:200px;height:120px;background:#ccc}
</style></head><body>
  <div id="stage"></div>
  <script src="${SITE}/dist/kineto.umd.js"></script>
  <script>
    // Frames requested while fn runs over the next \`count\` frames.
    window.__countFrames = async (count) => {
      const real = window.requestAnimationFrame;
      let requested = 0;
      window.requestAnimationFrame = (callback) => { requested += 1; return real.call(window, callback); };
      await new Promise((resolve) => { let left = count; const step = () => (--left <= 0 ? resolve() : real.call(window, step)); real.call(window, step); });
      window.requestAnimationFrame = real;
      return requested;
    };
    window.__frames = (count = 2) => new Promise((resolve) => { let left = count; const step = () => (--left <= 0 ? resolve() : requestAnimationFrame(step)); requestAnimationFrame(step); });
    window.__wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // Everything focusable inside an aria-hidden subtree that can still take
    // focus AND stays hidden once focused (a slider may reveal the slide).
    window.__focusLeaks = (scope) => {
      const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
      const leaks = [];
      Array.from(scope.querySelectorAll('[aria-hidden="true"]')).forEach((hidden) => {
        Array.from(hidden.querySelectorAll(FOCUSABLE)).forEach((node) => {
          node.focus();
          if (document.activeElement === node && node.closest('[aria-hidden="true"]')) leaks.push(node.outerHTML.slice(0, 60));
        });
      });
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      return leaks;
    };
  </script>
</body></html>`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox'] }
  : { headless: true });

async function openPage(contextOptions = {}) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 700 }, ...contextOptions });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin === SITE && url.pathname === '/') return route.fulfill({ status: 200, contentType: 'text/html', body: html });
    if (url.origin === SITE && url.pathname.startsWith('/dist/')) {
      const type = url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript';
      return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(path.join(root, url.pathname)) });
    }
    if (url.origin === SITE && url.pathname === '/pixel.gif') return route.fulfill({ status: 200, contentType: 'image/gif', body: PIXEL });
    return route.fulfill({ status: 404, body: '' });
  });
  await page.goto(`${SITE}/`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.Kineto);
  return { page, context, errors };
}

// Every case runs, so one run shows every regression at once.
const failures = [];
const passed = [];
async function check(name, fn) {
  try {
    await fn();
    passed.push(name);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

const { page, context, errors } = await openPage();
const clearStage = () => page.evaluate(() => { document.getElementById('stage').innerHTML = ''; });

const sliderMarkup = (id, slides = 3) => `<div id="${id}"><div class="kt-slider-wrap" style="width:300px"><div class="kt-slider-track">${
  Array.from({ length: slides }, (_, i) => `<div class="kt-slide" style="height:80px"><a href="#s${i}">Slide link ${i + 1}</a></div>`).join('')
}</div></div></div>`;

await check('slider-hidden-focus', async () => {
  const leaks = await page.evaluate(async (markup) => {
    const stage = document.getElementById('stage');
    stage.innerHTML = markup;
    const el = document.getElementById('sl');
    const instance = window.Kineto.create('slider', el, {});
    await window.__frames(2);
    const found = window.__focusLeaks(el);
    instance.destroy();
    return found;
  }, sliderMarkup('sl'));
  assert.deepEqual(leaks, [], `focus must never rest inside an aria-hidden slide (${leaks.join(', ')})`);
});
await clearStage();

await check('slider-nan', async () => {
  const result = await page.evaluate(async (markup) => {
    document.getElementById('stage').innerHTML = markup;
    const el = document.getElementById('sl');
    const instance = window.Kineto.create('slider', el, {});
    await window.__wait(900);
    instance.goTo(undefined);
    instance.goTo('next');
    await window.__wait(900);
    const index = instance.index;
    const frames = await window.__countFrames(10);
    const transforms = Array.from(el.querySelectorAll('.kt-slide')).map((slide) => slide.style.transform).join(' ');
    instance.destroy();
    return { index, dataIndex: el.dataset.ktSliderIndex ?? null, frames, nanTransform: /NaN/.test(transforms) };
  }, sliderMarkup('sl'));
  assert.equal(result.index, 0, `goTo(undefined) must leave the index alone (${JSON.stringify(result)})`);
  assert.equal(result.nanTransform, false, 'no NaN may reach a slide transform');
  assert.ok(result.frames <= 1, `the slider must rest after an ignored goTo() (${result.frames} frames requested)`);
});
await clearStage();

await check('hold-assistive', async () => {
  const result = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<button id="tapBtn">Delete</button><button id="holdBtn">Hold</button><button id="mashBtn">Mash</button><a id="holdLink" href="#followed">Hold link</a>';
    const confirms = { tap: 0, hold: 0, mash: 0, link: 0 };
    const tap = window.Kineto.create('hold', document.getElementById('tapBtn'), { mode: 'tap', duration: 900, submit: false });
    const hold = window.Kineto.create('hold', document.getElementById('holdBtn'), { mode: 'hold', submit: false });
    const mash = window.Kineto.create('hold', document.getElementById('mashBtn'), { mode: 'mash', submit: false });
    const link = window.Kineto.create('hold', document.getElementById('holdLink'), { mode: 'hold' });
    document.getElementById('tapBtn').addEventListener('kt-hold-confirm', () => { confirms.tap += 1; });
    document.getElementById('holdBtn').addEventListener('kt-hold-confirm', () => { confirms.hold += 1; });
    document.getElementById('mashBtn').addEventListener('kt-hold-confirm', () => { confirms.mash += 1; });
    // The link's confirmation is cancelled so the test page stays put.
    document.getElementById('holdLink').addEventListener('kt-hold-confirm', (event) => { confirms.link += 1; event.preventDefault(); });
    // A screen reader's activation: a click event and nothing before it.
    document.getElementById('tapBtn').click();
    const tapArmedAfterOne = confirms.tap;
    document.getElementById('tapBtn').click();
    document.getElementById('holdBtn').click();
    document.getElementById('holdBtn').click();
    document.getElementById('mashBtn').click();
    document.getElementById('mashBtn').click();
    const hashBefore = location.hash;
    document.getElementById('holdLink').click();
    await window.__wait(50);
    const followedOnFirstClick = location.hash !== hashBefore;
    document.getElementById('holdLink').click();
    const describedBy = document.getElementById('holdBtn').getAttribute('aria-describedby');
    const hint = describedBy ? document.getElementById(describedBy)?.textContent || '' : '';
    [tap, hold, mash, link].forEach((instance) => instance.destroy());
    const cleaned = !document.getElementById('holdBtn').hasAttribute('aria-describedby') && !document.querySelector('.kt-hold-hint');
    return { confirms, tapArmedAfterOne, followedOnFirstClick, hint, cleaned };
  });
  assert.equal(result.tapArmedAfterOne, 0, 'the first assistive click on tap must only arm');
  assert.deepEqual(result.confirms, { tap: 1, hold: 1, mash: 1, link: 1 },
    `two assistive clicks must confirm every mode exactly once (${JSON.stringify(result.confirms)})`);
  assert.equal(result.followedOnFirstClick, false, 'a plain click must not follow a hold-to-confirm link');
  assert.ok(result.hint.length > 0, 'the button must describe how to confirm (aria-describedby)');
  assert.equal(result.cleaned, true, 'destroy() must remove the description and its reference');
});
await clearStage();

await check('marquee-clones', async () => {
  const result = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<div id="mq" style="width:400px"><a id="mqLink" href="#m">Marquee link</a><span> — item — </span></div>';
    const el = document.getElementById('mq');
    const instance = window.Kineto.create('marquee', el, { speed: 120 });
    await window.__wait(300);
    const leaks = window.__focusLeaks(el);
    const ids = document.querySelectorAll('#mqLink').length;
    // Keyboard focus on the real link must bring the strip to a stop.
    document.getElementById('mqLink').focus();
    const readX = () => el.querySelector('.kt-marquee-group').style.transform;
    let still = false;
    const started = performance.now();
    while (performance.now() - started < 3000) {
      const before = readX();
      await window.__wait(120);
      if (readX() === before) { still = true; break; }
    }
    const moving = readX();
    document.getElementById('mqLink').blur();
    await window.__wait(250);
    const resumed = readX() !== moving;
    instance.destroy();
    return { leaks, ids, still, resumed };
  });
  assert.deepEqual(result.leaks, [], `clones must not be focusable (${result.leaks.join(', ')})`);
  assert.equal(result.ids, 1, 'clones must not repeat the ids of the strip');
  assert.equal(result.still, true, 'focus inside the strip must stop it');
  assert.equal(result.resumed, true, 'the strip must move again once focus leaves');
});
await clearStage();

await check('marquee-rest', async () => {
  const frames = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<div id="mq" style="width:400px"><span>one — two — three — </span></div>';
    const el = document.getElementById('mq');
    const instance = window.Kineto.create('marquee', el, { speed: 80 });
    await window.__wait(200);
    el.dispatchEvent(new PointerEvent('pointerenter'));
    await window.__wait(1500);
    const requested = await window.__countFrames(10);
    instance.destroy();
    return requested;
  });
  assert.ok(frames <= 1, `a hovered marquee must stop requesting frames once it has stopped (${frames})`);
});
await clearStage();

await check('nested-widgets', async () => {
  const result = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = `
      <div id="outerTabs" data-kt-tabs data-kt-effect="none">
        <div role="tablist"><button type="button">Outer A</button><button type="button">Outer B</button></div>
        <div class="kt-tabpanel" id="outerPanelA">
          <div id="innerTabs" data-kt-tabs data-kt-effect="none">
            <div role="tablist"><button type="button">Inner A</button><button type="button">Inner B</button></div>
            <div class="kt-tabpanel" id="innerPanelA">inner a</div>
            <div class="kt-tabpanel" id="innerPanelB">inner b</div>
          </div>
        </div>
        <div class="kt-tabpanel" id="outerPanelB">outer b</div>
      </div>
      <div id="outerAcc" data-kt-accordion data-kt-duration="0.05">
        <details id="outerItem"><summary>Outer item</summary>
          <div id="innerAcc" data-kt-accordion data-kt-duration="0.05">
            <details id="innerItem"><summary id="innerSummary">Inner item</summary><p>inner body</p></details>
          </div>
        </details>
      </div>`;
    window.Kineto.scan(stage);
    await window.__frames(2);
    const outerTabs = document.querySelectorAll('#outerTabs > [role=tablist] [role=tab]');
    const innerTabs = document.querySelectorAll('#innerTabs [role=tab]');
    const outerControls = Array.from(outerTabs).map((tab) => tab.getAttribute('aria-controls'));
    const innerControls = Array.from(innerTabs).map((tab) => tab.getAttribute('aria-controls'));
    innerTabs[1].click();
    await window.__frames(2);
    const outerPanelAVisible = !document.getElementById('outerPanelA').hidden;
    const innerPanelBVisible = !document.getElementById('innerPanelB').hidden;
    document.getElementById('outerItem').open = true;
    document.getElementById('innerSummary').click();
    await window.__wait(300);
    const innerOpen = document.getElementById('innerItem').open;
    const innerPanels = document.getElementById('innerItem').querySelectorAll('.kt-accordion-panel').length;
    window.Kineto.destroy(stage);
    return { outerControls, innerControls, outerPanelAVisible, innerPanelBVisible, innerOpen, innerPanels };
  });
  assert.deepEqual(result.outerControls, ['outerPanelA', 'outerPanelB'], `outer tabs must control only their own panels (${JSON.stringify(result)})`);
  assert.deepEqual(result.innerControls, ['innerPanelA', 'innerPanelB'], 'inner tabs must control their own panels');
  assert.equal(result.outerPanelAVisible, true, 'selecting an inner tab must leave the outer panel shown');
  assert.equal(result.innerPanelBVisible, true, 'selecting an inner tab must show its panel');
  assert.equal(result.innerOpen, true, 'a nested accordion item must open on its own summary');
  assert.equal(result.innerPanels, 1, 'a nested accordion item must be wrapped once');
});
await clearStage();

await check('media-hidden-panel', async () => {
  const result = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<div id="closed" style="display:none"><div style="height:180px"><img id="lz" alt="lazy"></div></div>';
    const img = document.getElementById('lz');
    const instance = window.Kineto.create('lazy', img, { src: '/pixel.gif', effect: 'fade' });
    await window.__frames(2);
    document.getElementById('closed').style.display = 'block';
    const wrapper = img.parentElement;
    const started = performance.now();
    while (performance.now() - started < 1500 && wrapper.style.height !== '100%' && !wrapper.style.aspectRatio) await window.__frames(1);
    const box = { aspectRatio: wrapper.style.aspectRatio, height: wrapper.style.height };
    instance.destroy();
    return box;
  });
  assert.equal(result.aspectRatio, '', `media in a closed panel must not be fixed to 16:9 (${JSON.stringify(result)})`);
  assert.equal(result.height, '100%', 'once drawn, it must fill the parent that defines its box');
});
await clearStage();

// One tilted card, three findings: the loop rests, the disabled shadow is
// left alone, and the card pauses off screen.
const tiltState = await page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<div id="tl" class="box"></div>';
  const el = document.getElementById('tl');
  const instance = window.Kineto.create('tilt', el, { max: 20 });
  const shadowBefore = el.style.getPropertyValue('--kt-tilt-shadow-runtime');
  const rect = el.getBoundingClientRect();
  const at = { bubbles: true, clientX: rect.left + 5, clientY: rect.top + 5 };
  el.dispatchEvent(new PointerEvent('pointerenter', at));
  el.dispatchEvent(new PointerEvent('pointermove', at));
  await window.__wait(1200);
  const tilted = /rotateX\((?!0deg)/.test(el.style.transform);
  const frames = await window.__countFrames(10);
  const shadowAfter = el.style.getPropertyValue('--kt-tilt-shadow-runtime');
  instance.destroy();
  return { tilted, frames, shadowUnchanged: shadowBefore === shadowAfter, pausesOffscreen: window.Kineto.registry.tilt.offscreen === 'pause' };
});
await check('tilt-rest', async () => {
  assert.equal(tiltState.tilted, true, 'tilt must follow the pointer');
  assert.ok(tiltState.frames <= 1, `a tilt under a resting pointer must stop requesting frames (${tiltState.frames})`);
});
await check('tilt-shadow-disabled', async () => {
  assert.equal(tiltState.shadowUnchanged, true, 'a disabled shadow must not be rewritten while tilting');
});
await check('tilt-offscreen', async () => {
  assert.equal(tiltState.pausesOffscreen, true, 'tilt must pause while off screen');
});
await clearStage();

await check('tilt-gyro-after-pause', async () => {
  const transform = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<div id="tl" class="box"></div>';
    const el = document.getElementById('tl');
    // A phone: no hover, and an orientation API without a permission gate.
    const realMatchMedia = window.matchMedia;
    const realOrientation = window.DeviceOrientationEvent;
    window.matchMedia = (query) => (/hover:\s*none/.test(query)
      ? { matches: true, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }
      : realMatchMedia.call(window, query));
    window.DeviceOrientationEvent = class FakeOrientationEvent extends Event {};
    const instance = window.Kineto.create('tilt', el, { max: 20, smoothing: 1 });
    window.matchMedia = realMatchMedia;
    // Paused (off screen, hidden tab) when the permission arrives …
    instance.pause();
    await window.__wait(30);
    // … and back on screen later: the gyro must drive it.
    instance.resume();
    window.dispatchEvent(Object.assign(new Event('deviceorientation'), { gamma: 20, beta: 70 }));
    await window.__wait(200);
    const value = el.style.transform;
    instance.destroy();
    window.DeviceOrientationEvent = realOrientation;
    return value;
  });
  assert.match(transform, /rotateX\(-?[1-9]/, `a tilt paused when the gyro permission arrived must still follow the gyro ("${transform}")`);
});
await clearStage();

await check('lenis-prevent', async () => {
  const result = await page.evaluate(async () => {
    window.Lenis = class FakeLenis {
      constructor(options) { window.__lenisOptions = options; }
      on() {}
      raf() {}
      destroy() {}
    };
    window.Kineto.enableSmooth();
    const started = performance.now();
    while (!window.__lenisOptions && performance.now() - started < 2000) await window.__wait(10);
    const prevent = window.__lenisOptions?.prevent;
    if (typeof prevent !== 'function') return { missing: true };
    const stage = document.getElementById('stage');
    let parent = stage;
    const chain = [];
    for (let depth = 0; depth < 12; depth += 1) {
      const node = document.createElement('div');
      parent.appendChild(node);
      chain.push(node);
      parent = node;
    }
    parent.textContent = 'deep';
    // What Lenis does: call prevent() for each element on the path, target first.
    const path = [...chain].reverse().concat(Array.from((function* up(node) { for (let n = node; n && n !== document.documentElement; n = n.parentElement) yield n; })(stage)));
    const realGetComputedStyle = window.getComputedStyle;
    let reads = 0;
    window.getComputedStyle = (...args) => { reads += 1; return realGetComputedStyle.apply(window, args); };
    const plain = path.some((node) => prevent(node));
    const plainReads = reads;
    // A scrolling ancestor and a data-lenis-prevent ancestor are still honoured.
    chain[3].style.cssText = 'height:4px;overflow:auto';
    reads = 0;
    const scrolling = path.some((node) => prevent(node));
    chain[3].style.cssText = '';
    chain[2].setAttribute('data-lenis-prevent', '');
    const flagged = path.some((node) => prevent(node));
    window.getComputedStyle = realGetComputedStyle;
    window.Kineto.disableSmooth();
    delete window.Lenis;
    stage.innerHTML = '';
    return { plain, plainReads, pathLength: path.length, scrolling, flagged };
  });
  assert.notEqual(result.missing, true, 'enableSmooth() must pass a default prevent() to Lenis');
  assert.equal(result.plain, false, 'a plain path must not be prevented');
  assert.ok(result.plainReads <= result.pathLength, `prevent() must read each element's style at most once per event (${result.plainReads} reads for ${result.pathLength} elements)`);
  assert.equal(result.scrolling, true, 'a scrolling ancestor must still let native scroll through');
  assert.equal(result.flagged, true, 'data-lenis-prevent must still be honoured');
});
await clearStage();

assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
await context.close();

// ── Reduced motion ──────────────────────────────────────────────────────────
const reducedPage = await openPage({ reducedMotion: 'reduce' });
await check('slider-reduced', async () => {
  const result = await reducedPage.page.evaluate(async (markup) => {
    document.getElementById('stage').innerHTML = markup;
    const el = document.getElementById('sl');
    const wrap = el.querySelector('.kt-slider-wrap');
    const slides = Array.from(el.querySelectorAll('.kt-slide'));
    const styleBefore = wrap.style.cssText;
    const instance = window.Kineto.create('slider', el, {});
    const hasNext = typeof instance?.next === 'function' && typeof instance?.prev === 'function' && typeof instance?.goTo === 'function';
    const inView = (slide) => {
      const a = slide.getBoundingClientRect();
      const b = wrap.getBoundingClientRect();
      return a.left >= b.left - 1 && a.right <= b.right + 1 && a.width > 0;
    };
    const reachable = [];
    for (let i = 0; i < slides.length; i += 1) {
      if (hasNext) instance.goTo(i);
      else wrap.scrollLeft = i * wrap.clientWidth;
      await window.__frames(2);
      reachable.push(inView(slides[i]));
    }
    let afterNext = null;
    if (hasNext) {
      instance.goTo(0);
      await window.__frames(1);
      instance.next();
      await window.__frames(1);
      afterNext = instance.index;
    }
    instance?.destroy();
    return { hasNext, reachable, afterNext, restored: wrap.style.cssText === styleBefore };
  }, sliderMarkup('sl'));
  assert.equal(result.hasNext, true, 'a reduced-motion slider must still offer next/prev/goTo');
  assert.deepEqual(result.reachable, [true, true, true], `every slide must be reachable under reduced motion (${JSON.stringify(result.reachable)})`);
  assert.equal(result.afterNext, 1, 'next() must move one slide');
  assert.equal(result.restored, true, 'destroy() must restore the viewport');
});
assert.deepEqual(reducedPage.errors, [], `page errors (reduced):\n${reducedPage.errors.join('\n')}`);
await reducedPage.context.close();

await browser.close();
if (failures.length) {
  console.error(`components-a11y FAILED (${browserName}) — ${failures.length} case(s):\n  ${failures.join('\n  ')}`);
  process.exit(1);
}
console.log(`components-a11y OK (${browserName}) — ${passed.length} cases: ${passed.join(', ')}.`);
