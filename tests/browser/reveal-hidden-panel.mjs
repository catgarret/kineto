// A native slide-left/right Reveal created in a hidden panel plays when the
// panel opens.
//
// The failure this guards (found by `npm run audit:hidden-panel`): without
// GSAP — blocked or offline, or a data-saver device on the low performance
// tier — Reveal decides "in view" itself. Its IntersectionObserver watches the
// element, and a slide-left/right waits one whole element width to the side.
// On a page that clips horizontal overflow (`overflow-x: clip` on html/body,
// common exactly where things slide in), a wide card shows the observer only a
// sliver of that moved box, under the 10% threshold. Created while its panel
// was closed, the card never got another report when the panel opened: no
// scroll, no threshold crossing, and it stayed invisible for good. The size
// change from 0×0 now wakes the check (src/modules/reveal.js observeBoundaries).
//
// GSAP's CDN is blocked here so the native path runs deterministically.
// Run: npm run build && node tests/browser/reveal-hidden-panel.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] }
  : { headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
// No GSAP: every request that leaves the page fails, as on a blocked CDN.
await page.route(/^https?:\/\//, (route) => route.abort());

// The cards are as wide as the stage, which is centred with a small gutter, so
// after sliding a whole width aside only a few percent of each is on screen.
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{overflow-x:clip} body{margin:0}
  #stage{width:880px;margin:40px auto}
  .card{height:160px;margin-bottom:20px;background:#c33;color:#fff}
</style></head><body><main id="stage">
  <div id="panel" hidden>
    <div id="right" class="card" data-kt-reveal="slide-right" data-kt-duration="0.4">right</div>
    <div id="left" class="card" data-kt-reveal="slide-left" data-kt-duration="0.4">left</div>
  </div>
</main></body></html>`);
await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'dist/kineto.umd.js'), 'utf8') });

const result = await page.evaluate(async () => {
  const { Kineto } = window;
  const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
  const cards = ['right', 'left'].map((id) => document.getElementById(id));
  Kineto.init(document);
  // Reveal waits for the engine first; once it is known to be missing the two
  // cards are created on the native path, still inside the closed panel.
  const createdBy = performance.now() + 5000;
  while (Kineto.instanceCount < 2 && performance.now() < createdBy) await frame();
  const created = Kineto.instanceCount;
  await frame();
  await frame();
  const whileClosed = cards.map((card) => getComputedStyle(card).opacity);
  document.getElementById('panel').hidden = false;
  const openedAt = performance.now();
  const shown = () => cards.every((card) => getComputedStyle(card).opacity === '1');
  while (!shown() && performance.now() - openedAt < 3000) await frame();
  return {
    gsap: Boolean(window.gsap),
    created,
    whileClosed,
    opacity: cards.map((card) => getComputedStyle(card).opacity),
    ms: Math.round(performance.now() - openedAt)
  };
});

assert.deepEqual(errors, [], 'no page errors');
assert.equal(result.gsap, false, 'the native path must run (GSAP blocked)');
assert.equal(result.created, 2, 'both cards must be created while their panel is closed');
assert.deepEqual(result.whileClosed, ['0', '0'], 'the cards wait hidden while the panel is closed');
assert.deepEqual(result.opacity, ['1', '1'],
  `slide-right and slide-left must play when the panel opens (opacity ${result.opacity.join(', ')} after ${result.ms}ms)`);

await browser.close();
console.log(`reveal-hidden-panel OK (${browserName}) — native slide-right/left created in a closed panel played ${result.ms}ms after it opened on a page that clips horizontal overflow.`);
