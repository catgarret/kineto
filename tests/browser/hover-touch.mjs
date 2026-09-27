// Hover-driven modules follow one input policy (docs/hover-touch-policy.md):
// "can any attached input hover with a fine pointer?" — utils.canHover().
//
// The failures this guards:
//   - A touchscreen laptop (or a tablet with a trackpad) reports its PRIMARY
//     input as coarse and non-hovering, and `navigator.maxTouchPoints > 0`,
//     even while a mouse is moving. Cursor turned itself off there, and Tilt
//     and Mouse Parallax waited for a gyroscope a laptop never fires, ignoring
//     the mouse (they checked `(hover: none)` / "has a touchscreen").
//   - On a phone a Hover Roll link navigated before its roll could be seen.
//
// Three input profiles, emulated the same way in every engine by answering the
// hover/pointer media queries (headless engines do not all emulate them):
//   desktop  primary fine + hover, no touch points
//   hybrid   primary coarse + no hover, but any-hover/any-pointer fine, 5 touch points
//   touch    nothing can hover (a phone)
// Checked per profile: which modules take the pointer path, the gyroscope path
// or no path; a touch on a hybrid hides the page cursor; a touch tap on a Hover
// Roll link rolls first and navigates after `rollDuration`.
// Run: node tests/browser/hover-touch.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);
const runtime = fs.readFileSync(path.join(root, 'dist/kineto.umd.js'), 'utf8');

// What each profile answers. Only hover/pointer queries are answered here;
// every other query goes to the real engine.
const PROFILES = {
  desktop: { hover: true, fine: true, anyHover: true, anyFine: true, touchPoints: 0 },
  hybrid: { hover: false, fine: false, anyHover: true, anyFine: true, touchPoints: 5 },
  touch: { hover: false, fine: false, anyHover: false, anyFine: false, touchPoints: 5 }
};

const emulateInput = (profile) => {
  const real = window.matchMedia.bind(window);
  const answer = (feature, value) => {
    if (feature === 'hover') return value === 'hover' ? profile.hover : !profile.hover;
    if (feature === 'any-hover') return value === 'hover' ? profile.anyHover : !profile.anyHover;
    if (feature === 'pointer') return value === 'fine' ? profile.fine : value === 'coarse' ? !profile.fine : false;
    if (feature === 'any-pointer') return value === 'fine' ? profile.anyFine : value === 'coarse' ? profile.touchPoints > 0 : false;
    return null;
  };
  window.matchMedia = (query) => {
    const clauses = [...String(query).matchAll(/\(\s*(any-hover|any-pointer|hover|pointer)\s*:\s*(\w+)\s*\)/g)];
    if (!clauses.length) return real(query);
    // `a, b` is OR; `a and b` is AND — the only two shapes the library uses.
    const matches = String(query).split(',').some((part) => [...part.matchAll(/\(\s*(any-hover|any-pointer|hover|pointer)\s*:\s*(\w+)\s*\)/g)]
      .every(([, feature, value]) => answer(feature, value)));
    return { matches, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } };
  };
  Object.defineProperty(Navigator.prototype, 'maxTouchPoints', { get: () => profile.touchPoints, configurable: true });
};

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;height:1400px;font:16px sans-serif}
  .box{position:absolute;left:40px;width:260px;height:160px;background:#ddd}
  #roll-target{position:absolute;top:1200px}
  #nav{position:absolute;left:400px;top:40px}
  #nav a{display:block;height:24px;overflow:hidden;line-height:24px}
</style></head><body>
  <div id="cursor-host" data-kt-cursor="ring" data-kt-global="true"></div>
  <div id="tilt" class="box" style="top:40px" data-kt-tilt data-kt-max="20" data-kt-smoothing="1"><span>tilt</span></div>
  <div id="parallax" class="box" style="top:240px" data-kt-mouse-parallax data-kt-smoothing="1"><span data-kt-mouse-speed="1">layer</span></div>
  <div id="glow" class="box" style="top:440px" data-kt-card-glow="spotlight" data-kt-disable-on-mobile="true"><span>glow</span></div>
  <nav id="nav"><a id="roll" href="#roll-target" data-kt-overflow-text="rolling" data-kt-trigger="hover" data-kt-roll-duration="300"><span>WORK</span><span>프로젝트</span></a></nav>
  <div id="roll-target">target</div>
</body></html>`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] }
  : { headless: true });
const errors = [];

const openProfile = async (name) => {
  const context = await browser.newContext({ viewport: { width: 900, height: 700 }, hasTouch: name !== 'desktop' });
  await context.addInitScript(emulateInput, PROFILES[name]);
  const page = await context.newPage();
  page.on('pageerror', (error) => errors.push(`${name}: ${error.message}`));
  await page.setContent(html);
  await page.addScriptTag({ content: runtime });
  await page.evaluate(() => window.Kineto.init(document));
  return { context, page };
};

const state = (page) => page.evaluate(() => ({
  canHover: window.matchMedia('(any-hover: hover) and (any-pointer: fine)').matches,
  cursor: document.querySelectorAll('body > .kt-cursor').length,
  glow: Boolean(window.Kineto.getInstance(document.getElementById('glow'), 'cardGlow')),
  tilt: Boolean(window.Kineto.getInstance(document.getElementById('tilt'), 'tilt'))
}));

// Moves the mouse across a box and reports whether its transform changed.
const followsMouse = async (page, selector, readSelector = selector) => {
  const before = await page.$eval(readSelector, (node) => node.style.transform);
  const box = await page.$eval(selector, (node) => { const r = node.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await page.mouse.move(box.x + 4, box.y + 4);
  await page.mouse.move(box.x + box.w - 6, box.y + box.h - 6, { steps: 8 });
  try {
    await page.waitForFunction(([sel, prev]) => {
      const now = document.querySelector(sel).style.transform;
      return now && now !== prev && !/^(none|translate3d\(0px, 0px, 0px\).*|rotateX\(0deg\) rotateY\(0deg\).*)$/.test(now);
    }, [readSelector, before], { timeout: 1500 });
    return true;
  } catch {
    return false;
  }
};

try {
  // desktop: the pointer path everywhere.
  {
    const { context, page } = await openProfile('desktop');
    const s = await state(page);
    assert.deepEqual(s, { canHover: true, cursor: s.cursor, glow: true, tilt: true }, `desktop state ${JSON.stringify(s)}`);
    assert.ok(s.cursor > 0, 'desktop draws the page cursor');
    assert.ok(await followsMouse(page, '#tilt'), 'desktop tilt follows the mouse');
    assert.ok(await followsMouse(page, '#parallax', '#parallax span'), 'desktop mouse parallax follows the mouse');
    await context.close();
  }

  // hybrid: a touchscreen laptop with a mouse — the pointer path, not the touch one.
  {
    const { context, page } = await openProfile('hybrid');
    const s = await state(page);
    assert.equal(s.canHover, true);
    assert.ok(s.cursor > 0, `a touchscreen laptop with a mouse keeps the page cursor (${JSON.stringify(s)})`);
    assert.equal(s.glow, true, 'disableOnMobile does not treat a touchscreen laptop as mobile');
    assert.ok(await followsMouse(page, '#tilt'), 'hybrid tilt follows the mouse instead of waiting for a gyroscope');
    assert.ok(await followsMouse(page, '#parallax', '#parallax span'), 'hybrid mouse parallax follows the mouse instead of waiting for a gyroscope');

    // A finger on the screen is not the mouse: the cursor hides, then comes back with the mouse.
    const visibleCursor = () => page.evaluate(() => [...document.querySelectorAll('body > .kt-cursor')]
      .some((node) => Number(getComputedStyle(node).opacity) > 0.05));
    await page.mouse.move(600, 500, { steps: 3 });
    await page.waitForFunction(() => [...document.querySelectorAll('body > .kt-cursor')].some((node) => Number(getComputedStyle(node).opacity) > 0.05), null, { timeout: 1500 });
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointermove', { clientX: 120, clientY: 600, pointerType: 'touch', bubbles: true })));
    await page.waitForFunction(() => [...document.querySelectorAll('body > .kt-cursor')].every((node) => Number(getComputedStyle(node).opacity) <= 0.05), null, { timeout: 1500 });
    await page.mouse.move(620, 520, { steps: 3 });
    await page.waitForFunction(() => [...document.querySelectorAll('body > .kt-cursor')].some((node) => Number(getComputedStyle(node).opacity) > 0.05), null, { timeout: 1500 });
    assert.equal(await visibleCursor(), true, 'the mouse brings the cursor back after a touch');
    await context.close();
  }

  // touch: a phone — no page cursor, gyro tilt, disableOnMobile honoured, Hover Roll rolls before navigating.
  {
    const { context, page } = await openProfile('touch');
    const s = await state(page);
    assert.deepEqual({ canHover: s.canHover, cursor: s.cursor, glow: s.glow }, { canHover: false, cursor: 0, glow: false },
      `a phone has no page cursor and honours disableOnMobile (${JSON.stringify(s)})`);

    const rollState = () => page.evaluate(() => {
      const roll = document.getElementById('roll');
      return { hash: location.hash, label: roll.getAttribute('aria-label') };
    });
    const before = await rollState();
    await page.tap('#roll');
    const right = await rollState();
    assert.equal(right.hash, before.hash, 'a touch tap on a Hover Roll link must not navigate before the roll');
    assert.notEqual(right.label, before.label, 'the tap starts the roll at once');
    await page.waitForFunction(() => location.hash === '#roll-target', null, { timeout: 2000 });
    await context.close();
  }

  assert.deepEqual(errors, [], 'no runtime errors');
  console.log(`Hover/touch policy (${browserName}) OK — desktop and touchscreen laptops follow the mouse (cursor, tilt, parallax, card glow); phones get the touch path; a tapped Hover Roll link rolls, then navigates.`);
} finally {
  await browser.close();
}
