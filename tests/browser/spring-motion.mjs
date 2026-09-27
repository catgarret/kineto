// Springs and easing tokens reach every animating module, and Reveal `split`
// plays its blob → split choreography.
//
// Checked here (no GSAP on the page, so the CSS/WAAPI paths run):
//   1. `Kineto.spring('spring-snappy')` returns a CSS linear() and its natural
//      duration; the stylesheet's --kt-spring-* tokens match the runtime.
//   2. A spring token on modules that used to hardcode their curve (Tabs, Flip,
//      Tooltip, Switch, Bottom Sheet) becomes a linear() easing in WAAPI / CSS
//      with the spring's natural duration — and a token that is not a CSS
//      easing (a GSAP name) falls back instead of throwing.
//   3. `Kineto.config({ ease })` changes UI motion page-wide; an element's own
//      `ease` still wins.
//   4. Reveal `split`: hidden until it enters, then the group rises, a blob
//      appears in the middle, each child opens from the centre, content comes
//      last; the blob is removed and every inline style restored at the end.
//   5. destroy() mid-entrance leaves no blob and no inline styles.
// Run: node tests/browser/spring-motion.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.join(root, pathname);
  if (!file.startsWith(root)) { response.writeHead(403); response.end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404); response.end(); return; }
    const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html';
    response.writeHead(200, { 'content-type': type });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] }
  : { headless: true });

const pageHtml = `<!doctype html><html><head><meta charset="utf-8">
  <link rel="stylesheet" href="${origin}/dist/kineto.css">
  <style>body{margin:0;font:14px sans-serif}.gap{height:1400px}
  .pill{display:flex;gap:10px;align-items:center;padding:0 24px;height:56px;border-radius:28px;background:#d6d6db}
  .pill i{width:8px;height:8px;border-radius:50%;background:#333;display:block}
  .btn{width:56px;height:56px;border-radius:50%;background:#d6d6db;display:grid;place-items:center}
  #split{display:flex;gap:14px;justify-content:center}</style></head><body>
  <div id="tabs" data-kt-tabs data-kt-ease="spring-bouncy">
    <div role="tablist"><button role="tab">A</button><button role="tab">B</button></div>
    <div role="tabpanel">One</div><div role="tabpanel">Two</div>
  </div>
  <label id="switch" data-kt-switch data-kt-ease="spring-snappy"><input type="checkbox"></label>
  <div id="flip" data-kt-flip data-kt-ease="spring(0.5s, 0.3)"><span>1</span><span>2</span></div>
  <div id="flipGsapName" data-kt-flip data-kt-ease="power3.out"><span>1</span></div>
  <button id="tip" data-kt-tooltip data-kt-content="Hello" data-kt-ease="spring-bouncy">tip</button>
  <div class="gap"></div>
  <nav id="split" data-kt-reveal="split">
    <div class="pill"><i></i><i></i><i></i></div>
    <div class="btn"><b>II</b></div>
  </nav>
  <div class="gap"></div>
  <script type="module">
    import Kineto from '${origin}/dist/kineto.js';
    window.Kineto = Kineto;
    Kineto.scan();
    window.ready = true;
  </script></body></html>`;

let failures = 0;
const check = (label, condition, detail = '') => {
  if (condition) console.log(`  ✓ ${label}`);
  else { failures += 1; console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`); }
};

const context = await browser.newContext({ viewport: { width: 1000, height: 700 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
await page.route(`${origin}/`, (route) => route.fulfill({ contentType: 'text/html', body: pageHtml }));
await page.goto(`${origin}/`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 10000 });

// 1. Kineto.spring + CSS tokens
const api = await page.evaluate(() => {
  const s = window.Kineto.spring('spring-snappy');
  const token = getComputedStyle(document.documentElement).getPropertyValue('--kt-spring-snappy').trim();
  const tokenDuration = getComputedStyle(document.documentElement).getPropertyValue('--kt-spring-snappy-duration').trim();
  return { easing: s?.easing, duration: s?.duration, valid: CSS.supports('transition-timing-function', s?.easing || ''), token, tokenDuration, none: window.Kineto.spring('ease') };
});
check('Kineto.spring returns a valid linear()', api.easing?.startsWith('linear(') && api.valid);
check('Kineto.spring gives a natural duration', api.duration > 0.3 && api.duration < 1.5, String(api.duration));
const normalize = (curve) => curve.replace(/\s+/g, '').replace(/(^|[,(])0\./g, '$1.');
check('CSS token matches the runtime curve (minifier may drop leading zeros)', normalize(api.token) === normalize(api.easing), `${api.token.slice(0, 60)} | ${api.easing.slice(0, 60)}`);
check('CSS duration token matches the runtime', Math.abs(parseFloat(api.tokenDuration) - api.duration) < 0.002, api.tokenDuration);
check('Kineto.spring(non-spring) is null', api.none === null);

// 2. Modules that used to hardcode their curve now take a spring.
const modules = await page.evaluate(async () => {
  const seen = [];
  const original = Element.prototype.animate;
  Element.prototype.animate = function patched(frames, timing) {
    const host = this.closest('#tabs, #switch, #flip, #flipGsapName, #split');
    const id = host?.id || (this.getAttribute('role') === 'tooltip' || String(this.className).includes('tooltip') ? 'tip' : String(this.className));
    seen.push({ id, easing: timing?.easing, duration: timing?.duration });
    return original.call(this, frames, timing);
  };
  // Tabs: panel entrance + indicator CSS variables
  document.querySelectorAll('#tabs [role="tab"]')[1].click();
  const tabs = document.getElementById('tabs');
  const tabEase = tabs.style.getPropertyValue('--kt-tab-ease');
  // Switch thumb transition
  const thumb = document.querySelector('#switch span[aria-hidden], #switch .kt-switch__thumb, #switch span');
  // Flip
  const flip = window.Kineto.getInstance('#flip', 'flip');
  flip?.measure?.(); flip?.record?.();
  const first = document.querySelector('#flip span');
  document.getElementById('flip').appendChild(first);
  flip?.play?.();
  const flipName = window.Kineto.getInstance('#flipGsapName', 'flip');
  flipName?.record?.(); flipName?.play?.();
  // Tooltip
  document.getElementById('tip').focus();
  await new Promise((resolve) => setTimeout(resolve, 150));
  Element.prototype.animate = original;
  return {
    seen, tabEase, tabDuration: tabs.style.getPropertyValue('--kt-tab-duration'),
    thumbTransition: thumb ? thumb.style.transition : ''
  };
});
const springAnimations = modules.seen.filter((entry) => String(entry.easing).startsWith('linear('));
check('Tabs indicator gets the spring through --kt-tab-ease', modules.tabEase.startsWith('linear('), modules.tabEase.slice(0, 30));
check('Tabs spring keeps its natural duration', parseFloat(modules.tabDuration) > 0.4, modules.tabDuration);
check('Switch thumb transition uses the spring', /linear\(/.test(modules.thumbTransition), modules.thumbTransition.slice(0, 60));
check('Tabs panel entrance uses the spring in WAAPI', springAnimations.some((entry) => entry.id === 'tabs'), JSON.stringify(modules.seen.map((e) => [e.id, String(e.easing).slice(0, 12)])));
check('Tooltip entrance uses the spring in WAAPI', springAnimations.some((entry) => entry.id === 'tip'), JSON.stringify(modules.seen.filter((e) => e.id === 'tip')));
check('no animation received a non-CSS easing', modules.seen.every((entry) => entry.easing == null || !/power|\.out/.test(entry.easing)), JSON.stringify(modules.seen.map((e) => e.easing).filter((e) => /power/.test(String(e)))));

// 3. Page-wide default vs element ease
const pageWide = await page.evaluate(() => {
  const K = window.Kineto;
  K.config({ ease: 'apple-standard' });
  const host = document.createElement('div');
  host.innerHTML = '<div role="tablist"><button role="tab">A</button><button role="tab">B</button></div><div role="tabpanel">1</div><div role="tabpanel">2</div>';
  document.body.prepend(host);
  K.create('tabs', host);
  const pageCurve = host.style.getPropertyValue('--kt-tab-ease');
  const own = document.createElement('div');
  own.innerHTML = host.innerHTML;
  document.body.prepend(own);
  K.create('tabs', own, { ease: 'ease-out' });
  const ownCurve = own.style.getPropertyValue('--kt-tab-ease');
  K.config({ ease: null });
  K.destroy(host); K.destroy(own); host.remove(); own.remove();
  return { pageCurve, ownCurve };
});
check('Kineto.config({ ease }) sets the page UI curve', pageWide.pageCurve === 'cubic-bezier(0.4,0,0.6,1)', pageWide.pageCurve);
check('an element ease wins over the page default', pageWide.ownCurve === 'ease-out', pageWide.ownCurve);

// 4. Reveal split
const before = await page.evaluate(() => getComputedStyle(document.getElementById('split')).opacity);
check('split is hidden before it enters', before === '0', before);
await page.evaluate(() => document.getElementById('split').scrollIntoView({ block: 'center' }));
await page.waitForFunction(() => document.querySelector('#split .kt-reveal-split-blob'), null, { timeout: 5000 });
const early = await page.evaluate(() => {
  const nav = document.getElementById('split');
  const anims = nav.getAnimations({ subtree: true });
  anims.forEach((animation) => { animation.pause(); animation.currentTime = 120; });
  const blob = nav.querySelector('.kt-reveal-split-blob');
  const b = blob.getBoundingClientRect();
  const n = nav.getBoundingClientRect();
  const pill = getComputedStyle(nav.querySelector('.pill'));
  const out = {
    blobTall: b.height > b.width,
    blobCentered: Math.abs((b.left + b.width / 2) - (n.left + n.width / 2)) < 2,
    risen: parseFloat(getComputedStyle(nav).translate.split(' ')[1] || '0') > 0,
    pillHidden: pill.opacity === '0'
  };
  anims.forEach((animation) => { animation.currentTime = 700; });
  const pillBox = nav.querySelector('.pill').getBoundingClientRect();
  const btn = nav.querySelector('.btn').getBoundingClientRect();
  out.split = btn.left > pillBox.right - 1;
  out.dotsWaiting = getComputedStyle(nav.querySelector('.pill i')).opacity !== '1';
  anims.forEach((animation) => animation.play());
  return out;
});
check('split: blob starts as a tall pill in the middle', early.blobTall && early.blobCentered, JSON.stringify(early));
check('split: the group rises from below', early.risen);
check('split: children wait for the blob', early.pillHidden);
check('split: children have split apart by 0.7 s', early.split);
check('split: content arrives after the shapes', early.dotsWaiting);
await page.waitForFunction(() => !document.querySelector('#split .kt-reveal-split-blob'), null, { timeout: 8000 });
const after = await page.evaluate(() => {
  const nav = document.getElementById('split');
  return { style: nav.getAttribute('style'), children: [...nav.querySelectorAll('*')].filter((node) => node.getAttribute('style')).length, opacity: getComputedStyle(nav).opacity };
});
check('split: blob removed and styles restored at the end', !after.style && after.children === 0 && after.opacity === '1', JSON.stringify(after));

// 5. destroy mid-entrance
const destroyed = await page.evaluate(async () => {
  const K = window.Kineto;
  const nav = document.getElementById('split');
  const instance = K.getInstance(nav, 'reveal');
  instance.replay();
  await new Promise((resolve) => setTimeout(resolve, 80));
  K.destroy(nav);
  return { blob: !!nav.querySelector('.kt-reveal-split-blob'), style: nav.getAttribute('style'), styled: [...nav.querySelectorAll('*')].filter((node) => node.getAttribute('style')).length };
});
check('split: destroy mid-entrance leaves nothing behind', !destroyed.blob && !destroyed.style && destroyed.styled === 0, JSON.stringify(destroyed));

check('no page errors', errors.length === 0, errors.join(' | '));
await browser.close();
server.close();
if (failures) { console.error(`spring-motion FAILED (${failures})`); process.exit(1); }
console.log(`spring-motion OK (${browserName})`);
