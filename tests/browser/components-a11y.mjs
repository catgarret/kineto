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

// A probe collects one page state that several checks then judge separately,
// so each finding keeps its own pass/fail line.
async function probe(name, fn) {
  try {
    return await fn();
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.log(`FAIL ${name}: ${error.message}`);
    return {};
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

const cursorState = await probe('cursor-native-pointer', () => page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<input id="field" type="text"><div id="plain">plain</div><div id="nocustom" data-kt-cursor-hide>hidden zone</div>';
  const instance = window.Kineto.create('cursor', document.body, {});
  const cursorOf = (id) => getComputedStyle(document.getElementById(id)).cursor;
  const active = { field: cursorOf('field'), plain: cursorOf('plain'), hideZone: cursorOf('nocustom') };
  instance.pause();
  const pausedClass = document.documentElement.classList.contains('kt-cursor-active');
  const pausedPlain = cursorOf('plain');
  instance.resume();
  const resumedClass = document.documentElement.classList.contains('kt-cursor-active');
  instance.destroy();
  return { active, pausedClass, pausedPlain, resumedClass };
}));
await check('cursor-native-fields', async () => {
  assert.equal(cursorState.active.plain, 'none', 'the page cursor must still replace the native pointer elsewhere');
  assert.notEqual(cursorState.active.field, 'none', `a text field must keep its native caret cursor (${JSON.stringify(cursorState)})`);
  assert.notEqual(cursorState.active.hideZone, 'none', 'where the custom cursor hides, the native pointer must show');
});
await check('cursor-pause-pointer', async () => {
  assert.equal(cursorState.pausedClass, false, 'a paused cursor must give the native pointer back');
  assert.notEqual(cursorState.pausedPlain, 'none', 'a paused cursor must not leave the page without a pointer');
  assert.equal(cursorState.resumedClass, true, 'resume() must hide the native pointer again');
});
await clearStage();

await check('cursor-hidden-moves', async () => {
  const frames = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<div id="scope" style="width:200px;height:100px;background:#eee">scoped cursor here</div><div id="elsewhere" style="height:100px">elsewhere</div>';
    const instance = window.Kineto.create('cursor', document.getElementById('scope'), {});
    await window.__frames(3);
    const elsewhere = document.getElementById('elsewhere');
    const rect = elsewhere.getBoundingClientRect();
    const real = window.requestAnimationFrame;
    let requested = 0;
    window.requestAnimationFrame = (callback) => { requested += 1; return real.call(window, callback); };
    for (let i = 0; i < 8; i += 1) {
      elsewhere.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: rect.left + 10 + i * 5, clientY: rect.top + 20 }));
      await new Promise((resolve) => real.call(window, resolve));
    }
    window.requestAnimationFrame = real;
    instance.destroy();
    return requested;
  });
  assert.equal(frames, 0, `a scoped cursor must not wake frames for pointer moves outside its scope (${frames})`);
});
await clearStage();

await check('cursor-sparkle-layout', async () => {
  const reads = await page.evaluate(async () => {
    const instance = window.Kineto.create('cursor', document.body, { type: 'sparkle', sparkleThrottle: 16 });
    const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    let count = 0;
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get() { count += 1; return descriptor.get.call(this); } });
    for (let i = 0; i < 6; i += 1) {
      document.body.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 100 + i * 12, clientY: 100 }));
      await window.__wait(25);
    }
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', descriptor);
    const stars = document.querySelectorAll('.kt-cursor span[aria-hidden="true"]').length;
    instance.destroy();
    return { count, stars };
  });
  assert.ok(reads.stars > 0, 'sparkles must still spawn');
  assert.equal(reads.count, 0, `spawning a sparkle must not force a layout (${reads.count} offsetWidth reads)`);
});
await clearStage();

const tooltipState = await probe('tooltip-a11y', () => page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<button id="iconBtn" title="Settings"><svg width="16" height="16" aria-hidden="true"></svg></button>'
    + '<button id="namedBtn" aria-label="Close"></button><button id="hoverBtn">Hover me</button><button id="away">away</button>';
  const icon = window.Kineto.create('tooltip', document.getElementById('iconBtn'), {});
  const named = window.Kineto.create('tooltip', document.getElementById('namedBtn'), {});
  const hover = window.Kineto.create('tooltip', document.getElementById('hoverBtn'), { content: 'More about this', delay: 0, hideDelay: 60 });
  const iconBtn = document.getElementById('iconBtn');
  const iconName = iconBtn.getAttribute('aria-label');
  const iconDescribed = iconBtn.hasAttribute('aria-describedby');
  const namedDescribed = document.getElementById('namedBtn').hasAttribute('aria-describedby');
  // Hover the trigger, then move onto the tip itself: it must stay.
  const trigger = document.getElementById('hoverBtn');
  trigger.dispatchEvent(new PointerEvent('pointerenter'));
  await window.__wait(60);
  const tipId = trigger.getAttribute('aria-describedby');
  const tip = document.getElementById(tipId);
  trigger.dispatchEvent(new PointerEvent('pointerleave'));
  tip.dispatchEvent(new PointerEvent('pointerenter'));
  await window.__wait(250);
  const hoverable = !tip.hidden;
  // Escape closes it wherever focus is.
  hover.show();
  await window.__wait(50);
  const shownForEscape = !tip.hidden;
  document.getElementById('away').focus();
  document.getElementById('away').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await window.__wait(250);
  const escaped = shownForEscape && tip.hidden;
  const unsupported = hover.update({ placement: 'bottom' });
  icon.destroy(); named.destroy(); hover.destroy();
  const restored = iconBtn.getAttribute('title') === 'Settings' && !iconBtn.hasAttribute('aria-label');
  return { iconName, iconDescribed, namedDescribed, hoverable, escaped, unsupported, restored };
}));
await check('tooltip-name', async () => {
  assert.equal(tooltipState.iconName, 'Settings', `an icon-only button must keep its title as its name (${JSON.stringify(tooltipState)})`);
  assert.equal(tooltipState.iconDescribed, false, 'a tip equal to the name must not be read twice');
  assert.equal(tooltipState.namedDescribed, false, 'a tip taken from aria-label must not describe the same element');
  assert.equal(tooltipState.restored, true, 'destroy() must put the title back and drop the aria-label it added');
});
await check('tooltip-hoverable', async () => {
  assert.equal(tooltipState.hoverable, true, 'the pointer must be able to move onto a hover tip');
});
await check('tooltip-escape', async () => {
  assert.equal(tooltipState.escaped, true, 'Escape must close a tip wherever focus is');
});
await check('tooltip-update', async () => {
  assert.equal(tooltipState.unsupported, false, 'update() must decline options it cannot apply live');
});
await clearStage();

const toastState = await probe('toast-announce-focus', () => page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<button id="saveBtn">Save</button>';
  const trigger = document.getElementById('saveBtn');
  const instance = window.Kineto.create('toast', trigger, { duration: 10000 });
  const politeBefore = document.querySelector('[aria-live="polite"]');
  const assertiveBefore = document.querySelector('[aria-live="assertive"]');
  const shown = instance.show('Saved');
  await window.__frames(3);
  const politeText = politeBefore?.textContent || '';
  instance.show('Failed', { type: 'error' });
  await window.__frames(3);
  const assertiveText = assertiveBefore?.textContent || '';
  trigger.focus();
  const close = shown.el.querySelector('.kt-toast__close');
  close.focus();
  close.click();
  await window.__wait(400);
  const focusedAfter = document.activeElement?.id || document.activeElement?.tagName;
  instance.destroy();
  const leftovers = document.querySelectorAll('.kt-toast-announcer, .kt-toast-region').length;
  return { hadRegions: Boolean(politeBefore && assertiveBefore), politeText, assertiveText, focusedAfter, leftovers };
}));
await check('toast-announce', async () => {
  assert.equal(toastState.hadRegions, true, 'empty live regions must exist before the first toast');
  assert.match(toastState.politeText, /Saved/, 'a status toast must be announced through the polite region');
  assert.match(toastState.assertiveText, /Failed/, 'an error toast must be announced through the assertive region');
  assert.equal(toastState.leftovers, 0, 'destroying the last toast instance must remove its regions');
});
await check('toast-focus-return', async () => {
  assert.equal(toastState.focusedAfter, 'saveBtn', `dismissing a focused toast must return focus (${toastState.focusedAfter})`);
});
await clearStage();

const sheetState = await probe('bottom-sheet-modal', () => page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<button id="opener">Open</button><a id="bgLink" href="#bg">background</a>'
    + '<div id="sheetA" style="height:200px"><h2>Sheet</h2><button hidden id="ghost">ghost</button><p>Plain text</p><button data-kt-sheet-close id="closeBtn">Close</button></div>'
    + '<div id="sheetB" style="height:200px"><p>Nothing to focus</p></div>';
  const a = window.Kineto.create('bottomSheet', document.getElementById('sheetA'), { duration: 0.05, resizable: true });
  const b = window.Kineto.create('bottomSheet', document.getElementById('sheetB'), { duration: 0.05 });
  document.getElementById('opener').focus();
  a.open();
  await window.__wait(120);
  const backgroundInert = Boolean(document.getElementById('bgLink').closest('[inert]'));
  const firstFocus = document.activeElement?.id;
  // Keyboard resize on the handle.
  const handle = document.querySelector('#sheetA .kt-sheet__handle');
  const before = document.getElementById('sheetA').getBoundingClientRect().height;
  handle.focus();
  handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
  const after = document.getElementById('sheetA').getBoundingClientRect().height;
  document.getElementById('closeBtn').click();
  await window.__wait(150);
  const closedByButton = document.getElementById('sheetA').hidden;
  const backgroundBack = !document.getElementById('bgLink').closest('[inert]');
  b.open();
  await window.__wait(120);
  const emptyFocus = document.activeElement?.id;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
  const stillInside = document.getElementById('sheetB').contains(document.activeElement);
  b.close();
  a.destroy(); b.destroy();
  return { backgroundInert, firstFocus, grew: after > before, closedByButton, backgroundBack, emptyFocus, stillInside };
}));
await check('sheet-inert-background', async () => {
  assert.equal(sheetState.backgroundInert, true, `the page behind an open sheet must be inert (${JSON.stringify(sheetState)})`);
  assert.equal(sheetState.backgroundBack, true, 'closing must give the page back');
});
await check('sheet-focus', async () => {
  assert.equal(sheetState.firstFocus, 'closeBtn', 'focus must skip controls that are not drawn');
  assert.equal(sheetState.emptyFocus, 'sheetB', 'a sheet with nothing focusable must take focus itself');
  assert.equal(sheetState.stillInside, true, 'Tab must not leave a sheet with nothing focusable');
});
await check('sheet-keyboard-resize', async () => {
  assert.equal(sheetState.grew, true, 'ArrowUp on the resize handle must grow the sheet');
});
await check('sheet-close-button', async () => {
  assert.equal(sheetState.closedByButton, true, 'a [data-kt-sheet-close] button must close the sheet');
});
await clearStage();

const menuState = await probe('mega-menu-keys', () => page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<nav id="nav"><ul style="display:flex;gap:10px;list-style:none">'
    + '<li><a id="prodLink" href="#products">Products</a><div class="kt-menu-panel"><a href="#p1">One</a></div></li>'
    + '<li><a id="aboutLink" href="#about">About</a></li>'
    + '<li><button id="helpBtn">Help</button><div class="kt-menu-panel"><a href="#h1">Docs</a></div></li>'
    + '</ul></nav>';
  const instance = window.Kineto.create('megaMenu', document.getElementById('nav'), {});
  const prod = document.getElementById('prodLink');
  const haspopup = prod.getAttribute('aria-haspopup');
  const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
  prod.dispatchEvent(enter);
  const enterKeptForLink = !enter.defaultPrevented;
  prod.focus();
  prod.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
  const afterRight = document.activeElement?.id;
  instance.destroy();
  return { haspopup, enterKeptForLink, afterRight };
}));
await check('menu-disclosure', async () => {
  assert.equal(menuState.haspopup, null, 'a disclosure trigger must not announce a menu popup');
});
await check('menu-link-enter', async () => {
  assert.equal(menuState.enterKeptForLink, true, 'Enter on a link trigger must follow the link');
});
await check('menu-arrow-plain-links', async () => {
  assert.equal(menuState.afterRight, 'aboutLink', `ArrowRight must reach plain top-level links (${menuState.afterRight})`);
});
await clearStage();

const fullpageState = await probe('fullpage-keys', () => page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<div id="fp" style="height:300px;position:relative"><section><button id="fpBtn">Act</button><input id="fpInput" value="text"></section>'
    + '<section><div style="height:900px">long</div></section><section>three</section></div>';
  const el = document.getElementById('fp');
  const instance = window.Kineto.create('fullpage', el, { duration: 0.05 });
  await window.__wait(100);
  const press = (target, key) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event.defaultPrevented;
  };
  document.getElementById('fpBtn').focus();
  const spaceOnButton = press(document.getElementById('fpBtn'), ' ');
  document.getElementById('fpInput').focus();
  const arrowInInput = press(document.getElementById('fpInput'), 'ArrowDown');
  el.focus();
  press(el, 'ArrowDown'); // to the long section
  await window.__wait(250);
  const section = el.querySelectorAll('section')[1];
  const scrollBefore = section.scrollTop;
  press(el, 'ArrowDown');
  await window.__wait(100);
  const scrolledInside = section.scrollTop > scrollBefore;
  const dots = el.querySelector('.kt-fullpage-dots');
  const dotRole = dots?.getAttribute('role');
  const dot = el.querySelector('.kt-fullpage-dot');
  const box = dot.getBoundingClientRect();
  const hit = document.elementFromPoint(box.left + box.width / 2 + 9, box.top + box.height / 2);
  const bigTarget = hit === dot;
  instance.destroy();
  return { spaceOnButton, arrowInInput, scrolledInside, dotRole, bigTarget };
}));
await check('fullpage-keys-in-controls', async () => {
  assert.equal(fullpageState.spaceOnButton, false, `Space on a button inside a section must press the button (${JSON.stringify(fullpageState)})`);
  assert.equal(fullpageState.arrowInInput, false, 'arrow keys in a text field must stay with the field');
});
await check('fullpage-long-section', async () => {
  assert.equal(fullpageState.scrolledInside, true, 'a long section must scroll by keyboard before paging');
});
await check('fullpage-dots', async () => {
  assert.equal(fullpageState.dotRole, 'group', 'the dots are a group of buttons, not a tablist');
  assert.equal(fullpageState.bigTarget, true, 'a fullpage dot must be a 24px target');
});
await clearStage();

const controlsState = await probe('small-controls', () => page.evaluate(async (markup) => {
  const stage = document.getElementById('stage');
  stage.innerHTML = `${markup}<div id="sw-host" style="background:#fff;color:#000;padding:10px"><button id="sw">Notify</button></div>`
    + '<div id="dragBox" style="width:200px;padding:10px;background:#ddd"><input id="dragField" value="abc"></div>';
  const slider = window.Kineto.create('slider', document.getElementById('sl'), { dots: true });
  const dot = document.querySelector('#sl .kt-slider-dot:not(.is-active)');
  const painted = getComputedStyle(dot).width;
  // Probe 10px below the painted dot's centre: inside a 24px target only.
  const box = dot.getBoundingClientRect();
  const hitBelow = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2 + 10);
  const toast = window.Kineto.create('toast', document.getElementById('sw'), { duration: 10000 });
  const shown = toast.show('Hi');
  const closeBox = shown.el.querySelector('.kt-toast__close').getBoundingClientRect();
  toast.destroy();
  const sw = window.Kineto.create('switch', document.getElementById('sw'), {});
  // The track colour transitions in from the button's own background.
  await window.__wait(400);
  const parse = (value) => {
    const numbers = (value.match(/[\d.]+/g) || []).map(Number);
    if (/^color\(/.test(value)) return { r: numbers[0] * 255, g: numbers[1] * 255, b: numbers[2] * 255, a: numbers[3] ?? 1 };
    return { r: numbers[0], g: numbers[1], b: numbers[2], a: numbers[3] ?? 1 };
  };
  const track = parse(getComputedStyle(document.getElementById('sw')).backgroundColor);
  const over = (channel) => channel * track.a + 255 * (1 - track.a);
  const lum = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const L = 0.2126 * lum(over(track.r)) + 0.7152 * lum(over(track.g)) + 0.0722 * lum(over(track.b));
  const contrast = 1.05 / (L + 0.05);
  sw.destroy();
  const drag = window.Kineto.create('drag', document.getElementById('dragBox'), {});
  const field = document.getElementById('dragField');
  const arrow = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true });
  field.dispatchEvent(arrow);
  const dragMovedFromField = arrow.defaultPrevented;
  drag.destroy();
  slider.destroy();
  return { painted, hitBelow: hitBelow === dot, closeWidth: closeBox.width, closeHeight: closeBox.height, contrast, dragMovedFromField };
}, sliderMarkup('sl')));
await check('slider-dot-target', async () => {
  assert.equal(controlsState.painted, '8px', 'the slider dot must keep its painted size');
  assert.equal(controlsState.hitBelow, true, `a slider dot must be a 24px target (${JSON.stringify(controlsState)})`);
});
await check('toast-close-target', async () => {
  assert.ok(controlsState.closeWidth >= 24 && controlsState.closeHeight >= 24, `the toast close button must be at least 24px (${controlsState.closeWidth}×${controlsState.closeHeight})`);
});
await check('switch-contrast', async () => {
  assert.ok(controlsState.contrast >= 3, `an off switch must contrast 3:1 with the page (${controlsState.contrast.toFixed(2)}:1)`);
});
await check('drag-keys-in-fields', async () => {
  assert.equal(controlsState.dragMovedFromField, false, 'arrow keys in a field inside a draggable must not move it');
});
await clearStage();

await check('progress-hidden-button', async () => {
  const result = await page.evaluate(async () => {
    window.scrollTo(0, 0);
    const host = document.createElement('div');
    document.getElementById('stage').appendChild(host);
    const instance = window.Kineto.create('progress', host, { ui: 'ring', clickToTop: true, showAfter: 300 });
    await window.__frames(3);
    const ring = document.querySelector('.kt-progress-ring');
    const hiddenOpacity = ring?.style.opacity;
    ring?.focus();
    const focusable = document.activeElement === ring;
    instance.destroy();
    return { hiddenOpacity, focusable };
  });
  assert.equal(result.hiddenOpacity, '0', 'the back-to-top ring starts hidden before showAfter');
  assert.equal(result.focusable, false, 'a hidden back-to-top button must not take focus');
});
await clearStage();

const radialMarkup = '<div id="rd" style="width:400px;height:300px;position:relative">'
  + ['Mercury', 'Venus', 'Earth', 'Mars'].map((name) => `<div class="kt-radial-item" style="width:60px;height:60px">${name}</div>`).join('')
  + '</div>';
const radialState = await probe('radial', () => page.evaluate(async (markup) => {
  const stage = document.getElementById('stage');
  stage.innerHTML = markup;
  const el = document.getElementById('rd');
  let clicked = '';
  el.addEventListener('click', (event) => { clicked = event.target.closest('.kt-radial-item')?.textContent || ''; });
  const instance = window.Kineto.create('slider', el, { effect: 'radial', duration: 0.3, labels: { previous: 'Back one', next: 'On one' } });
  const items = () => Array.from(el.querySelectorAll('.kt-radial-item'));
  const stops = () => items().filter((item) => item.tabIndex === 0).map((item) => item.textContent);
  const firstStops = stops();
  const front = items()[instance.index];
  front.focus();
  front.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  const activatedByKey = clicked;
  // Arrow: the wheel turns and focus follows the new front item.
  const live = el.querySelector('.kt-radial-live');
  let liveWrites = 0;
  const watcher = new MutationObserver((records) => { liveWrites += records.length; });
  watcher.observe(live, { childList: true, characterData: true, subtree: true });
  front.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
  await window.__wait(600);
  watcher.disconnect();
  const focusedAfterArrow = document.activeElement?.textContent || '';
  const frontAfterArrow = items()[instance.index].textContent;
  const liveText = live.textContent;
  const stopsAfterArrow = stops();
  const buttons = Array.from(el.querySelectorAll('.kt-radial-controls button')).map((button) => button.getAttribute('aria-label'));
  document.activeElement?.blur();
  instance.destroy();
  return { firstStops, activatedByKey, focusedAfterArrow, frontAfterArrow, stopsAfterArrow, liveWrites, liveText, buttons };
}, radialMarkup));
await check('radial-roving-focus', async () => {
  assert.equal(radialState.firstStops?.length, 1, `exactly one radial item must be the tab stop (${JSON.stringify(radialState)})`);
  assert.equal(radialState.focusedAfterArrow, radialState.frontAfterArrow, 'focus must follow the front item');
  assert.deepEqual(radialState.stopsAfterArrow, [radialState.frontAfterArrow], 'the tab stop must move with the front item');
});
await check('radial-enter-activates', async () => {
  assert.ok(radialState.activatedByKey, 'Enter on the front item must activate it');
});
await check('radial-live-region', async () => {
  assert.ok(radialState.liveWrites <= 2, `the live region must change once per step, not every frame (${radialState.liveWrites} writes)`);
  assert.match(radialState.liveText || '', new RegExp(radialState.frontAfterArrow), 'the announcement must name the item');
});
await check('radial-labels', async () => {
  assert.deepEqual(radialState.buttons, ['Back one', 'On one'], 'built prev/next buttons must take their names from labels');
});
await clearStage();

await check('radial-autoplay-focus', async () => {
  const moved = await page.evaluate(async (markup) => {
    document.getElementById('stage').innerHTML = markup;
    const el = document.getElementById('rd');
    const instance = window.Kineto.create('slider', el, { effect: 'radial', duration: 0.05, autoplay: 300 });
    const before = instance.index;
    el.querySelectorAll('.kt-radial-item')[before].focus();
    await window.__wait(1000);
    const after = instance.index;
    document.activeElement?.blur();
    instance.destroy();
    return after !== before;
  }, radialMarkup);
  assert.equal(moved, false, 'autoplay must hold while focus is inside the wheel');
});
await clearStage();

await check('radial-refit', async () => {
  const radius = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<div id="closedWheel" style="display:none"><div id="wheel" style="width:300px;height:300px;position:relative">'
      + [1, 2, 3, 4].map((n) => `<div class="kt-radial-item" style="width:60px;height:60px">${n}</div>`).join('') + '</div></div>';
    const el = document.getElementById('wheel');
    const instance = window.Kineto.create('slider', el, { effect: 'radial', position: 'center' });
    document.getElementById('closedWheel').style.display = 'block';
    await window.__frames(3);
    const value = el.style.getPropertyValue('--kt-radial-radius');
    instance.destroy();
    return value;
  });
  // (300 - 60 - 16) / 2 — the radius that fits the box once it is drawn.
  assert.equal(radius, '112px', `a centred wheel must refit when it is drawn (${radius})`);
});
await clearStage();

await check('lazy-frame-after-destroy', async () => {
  const style = await page.evaluate(async () => {
    const stage = document.getElementById('stage');
    stage.innerHTML = '<img id="lzFade" alt="fade" width="40" height="40">';
    const img = document.getElementById('lzFade');
    const instance = window.Kineto.create('lazy', img, { src: '/pixel.gif', effect: 'fade' });
    // Destroy right after the reveal asked for its frame (the src write and
    // the frame request happen in the same task; this runs before the frame).
    await new Promise((resolve) => {
      const watcher = new MutationObserver(() => {
        if (!/pixel\.gif/.test(img.getAttribute('src') || '')) return;
        watcher.disconnect();
        instance.destroy();
        resolve();
      });
      watcher.observe(img, { attributes: true, attributeFilter: ['src'] });
      setTimeout(resolve, 3000);
    });
    await window.__frames(3);
    return img.getAttribute('style');
  });
  assert.equal(style, null, `a destroyed Lazy image must not be written to by a queued frame (style="${style}")`);
});
await clearStage();

const restingLoops = await probe('resting-loops', () => page.evaluate(async () => {
  const stage = document.getElementById('stage');
  stage.innerHTML = '<div id="glow" class="box">glow</div><div id="magnetHost" style="padding:40px"><button id="magnet">magnet</button></div>'
    + '<div id="brush" class="box" data-reveal-src="/pixel.gif"></div>';
  const settle = async (el, x, y) => {
    el.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, clientX: x, clientY: y }));
    el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }));
    await window.__wait(1200);
    return window.__countFrames(10);
  };
  const glowEl = document.getElementById('glow');
  const glow = window.Kineto.create('cardGlow', glowEl, {});
  const glowRect = glowEl.getBoundingClientRect();
  const glowFrames = await settle(glowEl, glowRect.left + 20, glowRect.top + 20);
  glow.destroy();
  const magnetEl = document.getElementById('magnet');
  const magnet = window.Kineto.create('magnetic', magnetEl, {});
  const magnetRect = magnetEl.getBoundingClientRect();
  const magnetFrames = await settle(document.getElementById('magnetHost'), magnetRect.left + magnetRect.width / 2 + 10, magnetRect.top + magnetRect.height / 2);
  magnet.destroy();
  const brushEl = document.getElementById('brush');
  const brush = window.Kineto.create('brushReveal', brushEl, { persist: true });
  await window.__wait(100);
  const brushRect = brushEl.getBoundingClientRect();
  const brushFrames = await settle(brushEl, brushRect.left + 30, brushRect.top + 30);
  brush.destroy();
  return { glowFrames, magnetFrames, brushFrames };
}));
await check('card-glow-rest', async () => {
  assert.ok(restingLoops.glowFrames <= 1, `Card Glow under a resting pointer must stop requesting frames (${restingLoops.glowFrames})`);
});
await check('magnetic-rest', async () => {
  assert.ok(restingLoops.magnetFrames <= 1, `Magnetic under a resting pointer must stop requesting frames (${restingLoops.magnetFrames})`);
});
await check('brush-reveal-rest', async () => {
  assert.ok(restingLoops.brushFrames <= 1, `a persistent Brush Reveal under a resting pointer must stop requesting frames (${restingLoops.brushFrames})`);
});
await clearStage();

await check('slider-progress-rest', async () => {
  const result = await page.evaluate(async (markup) => {
    document.getElementById('stage').innerHTML = markup;
    const el = document.getElementById('sl');
    const instance = window.Kineto.create('slider', el, { autoplay: 4000, progress: true });
    const fill = el.querySelector('.kt-slider-progress__fill');
    await window.__wait(300);
    const early = fill.style.transform;
    await window.__wait(300);
    const advancing = fill.style.transform !== early;
    instance.pause();
    await window.__wait(100);
    const frames = await window.__countFrames(10);
    instance.resume();
    await window.__wait(300);
    const resumed = fill.style.transform;
    await window.__wait(200);
    const advancingAgain = fill.style.transform !== resumed;
    instance.destroy();
    return { advancing, frames, advancingAgain };
  }, sliderMarkup('sl'));
  assert.equal(result.advancing, true, 'the autoplay progress bar must fill while running');
  assert.ok(result.frames <= 1, `a paused autoplay progress bar must stop requesting frames (${result.frames})`);
  assert.equal(result.advancingAgain, true, 'the progress bar must fill again after resume()');
});
await clearStage();

await check('slider-metrics-cache', async () => {
  const reads = await page.evaluate(async (markup) => {
    document.getElementById('stage').innerHTML = markup;
    const el = document.getElementById('sl');
    const wrap = el.querySelector('.kt-slider-wrap');
    const instance = window.Kineto.create('slider', el, {});
    await window.__wait(300);
    const real = Element.prototype.getBoundingClientRect;
    let count = 0;
    Element.prototype.getBoundingClientRect = function countedRect() { if (this === wrap) count += 1; return real.call(this); };
    instance.goTo(2);
    await window.__frames(20);
    Element.prototype.getBoundingClientRect = real;
    instance.destroy();
    return count;
  }, sliderMarkup('sl'));
  assert.ok(reads <= 1, `the slider must not measure its viewport every frame (${reads} reads over 20 frames)`);
});
await clearStage();

// Forced layouts are counted from a Chromium performance trace (a Layout event
// with a JavaScript stack was forced by a read), as tests/browser/create-cost.mjs does.
if (browserName === 'chromium') {
  await check('sticky-stack-create-layouts', async () => {
    await page.evaluate(() => {
      document.getElementById('stage').innerHTML = `<div id="stack">${Array.from({ length: 8 }, (_, i) => `<div style="height:${60 + i * 5}px;background:#ccc">card ${i + 1}</div>`).join('')}</div>`;
    });
    const cdp = await context.newCDPSession(page);
    const events = [];
    cdp.on('Tracing.dataCollected', ({ value }) => events.push(...value));
    const complete = new Promise((resolve) => cdp.once('Tracing.tracingComplete', resolve));
    await cdp.send('Tracing.start', { categories: 'devtools.timeline,disabled-by-default-devtools.timeline.stack', transferMode: 'ReportEvents' });
    const tops = await page.evaluate(() => {
      const el = document.getElementById('stack');
      const instance = window.Kineto.create('stickyStack', el, { align: 'center' });
      const values = Array.from(el.children).map((child) => child.style.top);
      instance.destroy();
      return values;
    });
    await cdp.send('Tracing.end');
    await complete;
    await cdp.detach();
    const forced = events.filter((event) => event.name === 'Layout' && event.args?.beginData?.stackTrace?.length).length;
    // Card 4 is 75px tall: 50vh - 38px + 3 × 16px offset = 50vh + 10px.
    assert.ok(/50vh/.test(tops[3]) && /10px/.test(tops[3]), `sticky tops must be unchanged (${tops[3]})`);
    assert.ok(forced <= 2, `creating an 8-card Sticky Stack must not lay out once per card (${forced} forced layouts)`);
  });
  await clearStage();
}

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
