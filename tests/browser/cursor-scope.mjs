// A card's cursor stays in its card, however the card looked when Kineto started.
//
// The failure this guards: the cursor module decided "scoped or page-wide" by
// the host's size at creation. A card cursor whose host was hidden at that
// moment (a closed tab panel, a collapsed accordion, a card not on the page
// yet) measured 0×0 and became a page-wide cursor — a second ring that
// followed the pointer everywhere, drawn over the page's own cursor
// (src/modules/cursor.js → isScopedElement).
//
// Checked here:
//   1. a host with content that was hidden at start-up is a scope once shown:
//      nothing of it is drawn with the pointer outside, it is drawn inside,
//      and the page-wide cursor steps aside there;
//   2. a host inside a skipped `content-visibility:auto` block is a scope;
//   3. the page-wide cases keep working: an empty holder, an explicit
//      `data-kt-global="true"` on a host with content, and a tiny drawn holder.
// Run: node tests/browser/cursor-scope.mjs   (KT_BROWSER=firefox|webkit)
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
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

// Hosts, top to bottom (all absolutely placed so each has a known box):
//   #page      the page-wide cursor, an empty holder
//   #hidden    a card cursor inside a panel that is closed at start-up
//   #explicit  a host with content that asks to be page-wide
//   #tiny      a drawn 2×2 holder with content (the original "holder" rule)
//   #skipped   a card cursor inside a block the browser skips (far below)
await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;height:4000px}
  .box{position:absolute;left:40px;width:240px;height:160px;background:#eee}
  #panel{position:absolute;left:40px;top:40px}
  #tiny{position:absolute;left:600px;top:600px;width:2px;height:2px;overflow:hidden}
  #far{position:absolute;top:3000px;left:0;content-visibility:auto;contain-intrinsic-size:auto 200px}
</style></head><body>
  <div id="page" data-kt-cursor="dot" data-kt-global="true"></div>
  <div id="panel" hidden><div id="hidden" class="box" data-kt-cursor="ring"><button>inside</button></div></div>
  <div id="explicit" class="box" style="top:260px" data-kt-cursor="blob" data-kt-global="true"><span>page-wide</span></div>
  <div id="tiny" data-kt-cursor="crosshair"><span>.</span></div>
  <div id="far"><div id="skipped" class="box" data-kt-cursor="dot"><button>far</button></div></div>
</body></html>`);
await page.addScriptTag({ content: fs.readFileSync(path.join(root, 'dist/kineto.umd.js'), 'utf8') });

const scopes = await page.evaluate(() => {
  window.Kineto.init(document);
  // The closed panel opens after start-up, the way a tab or accordion does.
  document.getElementById('panel').hidden = false;
  const state = {};
  ['page', 'hidden', 'explicit', 'tiny', 'skipped'].forEach((id) => {
    state[id] = document.getElementById(id).classList.contains('kt-cursor-scope');
  });
  return state;
});
assert.deepEqual(scopes, { page: false, hidden: true, explicit: false, tiny: false, skipped: true },
  `scoped hosts must be scopes whatever their box at start-up (${JSON.stringify(scopes)})`);

// Which cursors are drawn with the pointer at (x, y)? Keyed by their type class.
const drawnAt = async (x, y) => {
  await page.mouse.move(x - 6, y - 4);
  await page.mouse.move(x, y, { steps: 4 });
  await page.waitForTimeout(260); // the opacity fade is 180ms
  return page.evaluate(() => [...document.querySelectorAll('body > .kt-cursor')]
    .filter((cursor) => Number(getComputedStyle(cursor).opacity) > 0.05)
    .map((cursor) => [...cursor.classList].find((name) => /^kt-cursor-(dot|ring|blob|crosshair)$/.test(name)))
    .sort());
};

// Far from every card: the page-wide cursors only (the empty holder, the
// explicit one and the tiny holder) — never the card's ring.
const outside = await drawnAt(700, 120);
assert.ok(!outside.includes('kt-cursor-ring'), `a card's ring must not follow the pointer outside the card (drawn: ${outside})`);
assert.ok(outside.includes('kt-cursor-dot') && outside.includes('kt-cursor-blob') && outside.includes('kt-cursor-crosshair'),
  `the page-wide cursors must still be drawn outside every card (drawn: ${outside})`);

// Inside the once-hidden card: its ring is drawn and the page-wide cursors step aside.
const inside = await drawnAt(160, 120);
assert.deepEqual(inside, ['kt-cursor-ring'], `inside its card only the card's ring is drawn (drawn: ${inside})`);

assert.deepEqual(errors, [], `no page errors: ${errors.join(' | ')}`);
await browser.close();
console.log(`cursor-scope OK (${browserName}) — a card cursor hidden at start-up stayed in its card, a skipped block's cursor stayed scoped, and the empty, explicit and tiny holders stayed page-wide.`);
