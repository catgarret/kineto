// Native CSS Scroll Snap contract checks for the narrow, opt-in slider path.
// Run: node tests/browser/slider-scroll-snap.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const server = http.createServer((req, res) => {
  const fp = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': req.url.endsWith('.js') ? 'text/javascript' : 'text/html' });
    res.end(buf);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const PORT = server.address().port;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
const page = await browser.newPage({ viewport: { width: 900, height: 500 } });
page.on('pageerror', (error) => console.log('PAGEERROR:', error.message));
await page.setContent(`<!doctype html><html><head><style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 24px; font: 16px sans-serif; }
  .fixture { width: 300px; height: 120px; margin-bottom: 16px; }
  .kt-slider-wrap { width: 100%; height: 100%; border: 1px solid #ddd; }
  .kt-slider-track { height: 100%; }
  .kt-slide { display: grid; place-items: center; height: 100%; font-size: 28px; }
</style></head><body>
  <div id="native-a" class="fixture"><div class="kt-slider-wrap"><div class="kt-slider-track">
    <div class="kt-slide">A1</div><div class="kt-slide">A2</div><div class="kt-slide">A3</div>
  </div></div></div>
  <div id="native-b" class="fixture"><div class="kt-slider-wrap"><div class="kt-slider-track">
    <div class="kt-slide">B1</div><div class="kt-slide">B2</div><div class="kt-slide">B3</div>
  </div></div></div>
  <div id="fallback" class="fixture"><div class="kt-slider-wrap"><div class="kt-slider-track">
    <div class="kt-slide">F1</div><div class="kt-slide">F2</div><div class="kt-slide">F3</div>
  </div></div></div>
  <script src="http://localhost:${PORT}/dist/kineto.umd.js"></script>
</body></html>`, { waitUntil: 'load' });
await page.waitForFunction(() => !!window.Kineto);

let pass = 0;
let fail = 0;
const check = (name, condition, detail = '') => {
  console.log(`  [${condition ? 'PASS' : 'FAIL'}] ${name}${detail ? ` — ${detail}` : ''}`);
  condition ? pass++ : fail++;
};
const waitFor = (predicate, timeout = 1500) => page.waitForFunction(predicate, null, { timeout });

const native = await page.evaluate(() => {
  const changes = [];
  const before = [];
  const el = document.querySelector('#native-a');
  const api = window.Kineto.create('slider', el, {
    effect: 'slide', loop: 'off', perView: 1, axis: 'x', gap: 0,
    scrollSnap: true, wheel: true, initial: 1,
    onBeforeChange: (next) => before.push(next), onChange: (next) => changes.push(next)
  });
  const wrap = el.querySelector('.kt-slider-wrap');
  window.__KT_NATIVE__ = { api, el, wrap, changes, before };
  return {
    mode: el.dataset.ktSliderScrollSnap,
    overflowX: getComputedStyle(wrap).overflowX,
    snapType: getComputedStyle(wrap).scrollSnapType,
    slideDisplay: getComputedStyle(el.querySelector('.kt-slide')).display,
    initial: api.index,
    scrollLeft: wrap.scrollLeft,
    scrollWidth: wrap.scrollWidth,
    clientWidth: wrap.clientWidth
  };
});
await page.waitForTimeout(80);
const nativeAfterLayout = await page.evaluate(() => ({ scrollLeft: window.__KT_NATIVE__.wrap.scrollLeft, width: window.__KT_NATIVE__.wrap.clientWidth }));
native.scrollLeft = nativeAfterLayout.scrollLeft;
native.clientWidth = nativeAfterLayout.width;
console.log('  initial:', JSON.stringify(native));
check('eligible slider selects native mode', native.mode === 'native', native.mode);
check('native path exposes horizontal scrolling and snap', native.overflowX === 'auto' && /x.*mandatory/.test(native.snapType), `${native.overflowX}, ${native.snapType}`);
check('native path lays slides out in a row', native.slideDisplay === 'grid' && native.scrollWidth > native.clientWidth * 2, `${native.slideDisplay}, ${native.scrollWidth}/${native.clientWidth}`);
check('initial index is reflected in scroll position', native.initial === 1 && Math.abs(native.scrollLeft - native.clientWidth) <= 2, `${native.initial}, ${native.scrollLeft}`);

await page.evaluate(() => window.__KT_NATIVE__.api.goTo(2));
await waitFor(() => window.__KT_NATIVE__.api.index === 2 && Math.abs(window.__KT_NATIVE__.wrap.scrollLeft - window.__KT_NATIVE__.wrap.clientWidth * 2) <= 2, 2500);
const programmatic = await page.evaluate(() => ({ index: window.__KT_NATIVE__.api.index, scrollLeft: window.__KT_NATIVE__.wrap.scrollLeft, width: window.__KT_NATIVE__.wrap.clientWidth }));
check('API navigation updates native scroll position and index', programmatic.index === 2 && Math.abs(programmatic.scrollLeft - programmatic.width * 2) <= 2, JSON.stringify(programmatic));

await page.evaluate(() => { window.__KT_NATIVE__.wrap.scrollTo({ left: 0, behavior: 'auto' }); });
await waitFor(() => window.__KT_NATIVE__.api.index === 0);
const scrolled = await page.evaluate(() => ({ index: window.__KT_NATIVE__.api.index, changes: window.__KT_NATIVE__.changes.slice(), before: window.__KT_NATIVE__.before.slice() }));
check('manual native scroll commits the same change lifecycle', scrolled.index === 0 && scrolled.changes.includes(0) && scrolled.before.includes(0), JSON.stringify(scrolled));

const box = await page.locator('#native-a .kt-slider-wrap').boundingBox();
await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + 25, box.y + box.height / 2, { steps: 4 });
await page.mouse.up();
await page.waitForTimeout(500);
const mouseDrag = await page.evaluate(() => ({ index: window.__KT_NATIVE__.api.index, scrollLeft: window.__KT_NATIVE__.wrap.scrollLeft, width: window.__KT_NATIVE__.wrap.clientWidth }));
check('native path keeps mouse drag and snap semantics', mouseDrag.index === 1, JSON.stringify(mouseDrag));

await page.locator('#native-a .kt-slider-wrap').focus();
await page.keyboard.press('ArrowRight');
await waitFor(() => window.__KT_NATIVE__.api.index === 2);
check('native path keeps keyboard navigation', await page.evaluate(() => window.__KT_NATIVE__.api.index === 2));

const sync = await page.evaluate(() => {
  const partnerEl = document.querySelector('#native-b');
  const mainEl = document.querySelector('#native-a');
  const partner = window.Kineto.create('slider', partnerEl, { effect: 'slide', loop: 'off', perView: 1, axis: 'x', gap: 0, scrollSnap: true, sync: '#native-a' });
  const main = window.Kineto.getInstance(mainEl, 'slider');
  window.__KT_SYNC__ = { main, partner, partnerEl };
  partner.goTo(1);
  return { main: main.index, partner: partner.index, partnerMode: partnerEl.dataset.ktSliderScrollSnap };
});
check('native path preserves sync targets', sync.main === 1 && sync.partner === 1 && sync.partnerMode === 'native', JSON.stringify(sync));

const fallback = await page.evaluate(() => {
  const el = document.querySelector('#fallback');
  const api = window.Kineto.create('slider', el, { effect: 'slide', loop: 'off', perView: 2, scrollSnap: true });
  const wrap = el.querySelector('.kt-slider-wrap');
  return { mode: el.dataset.ktSliderScrollSnap, overflowX: getComputedStyle(wrap).overflowX, snapType: getComputedStyle(wrap).scrollSnapType, index: api.index };
});
check('ineligible effects fall back to the transform engine', fallback.mode === 'fallback' && fallback.overflowX === 'hidden' && fallback.snapType === 'none', JSON.stringify(fallback));

const restore = await page.evaluate(() => {
  const el = document.createElement('div');
  el.className = 'fixture';
  el.innerHTML = '<div class="kt-slider-wrap" style="overflow:auto;scroll-snap-type:none;scroll-behavior:auto"><div class="kt-slider-track"><div class="kt-slide">R1</div><div class="kt-slide">R2</div></div></div>';
  document.body.appendChild(el);
  const wrap = el.querySelector('.kt-slider-wrap');
  const authored = wrap.getAttribute('style');
  const api = window.Kineto.create('slider', el, { effect: 'slide', loop: 'off', perView: 1, gap: 0, scrollSnap: true });
  api.destroy();
  return { authored, restored: wrap.getAttribute('style') };
});
check('destroy restores authored scroll styles', restore.authored === restore.restored, JSON.stringify(restore));

await page.evaluate(() => {
  for (const el of document.querySelectorAll('.fixture')) {
    const instance = window.Kineto.getInstance(el, 'slider');
    instance?.destroy();
  }
});
await browser.close();
server.close();
console.log(`\n===== NATIVE SCROLL SNAP: ${pass} passed, ${fail} failed =====`);
process.exit(fail ? 1 : 0);
