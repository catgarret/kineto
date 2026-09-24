// Option values are TEXT. Markup is where most option values come from, and
// markup is often filled from a CMS or from user data, so a value must never
// be parsed as HTML unless its option is one of the explicitly HTML-named ones
// (`html`, `template`, `hoverTemplate`, `uiTemplate`, Tooltip's `html: true`).
//
// Each case below used to build an HTML string from an option value:
//   typewriter  caretChar          → `<span …>${caretChar}</span>`
//   progress    color / trackColor → `stroke="${color}"` inside an SVG string
//   toast       icon               → `icon.innerHTML = icon`
//   cursor      rotateText / text  → `<textPath …>${text}</textPath>`
//   overflow    items (attribute)  → `segment.innerHTML = item`
// and Page Transition injected (and executed) whatever the response said, even
// when a same-origin redirect had taken the request to another origin.
// Markup can also CLOBBER globals: `<img id="gsap">` makes `window.gsap` an
// element, which used to pass for the engine and stop the real one loading.
//
// Run: npm run build && node tests/browser/markup-trust.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const SITE = 'http://kineto.test';
const OTHER = 'http://elsewhere.test';
// A payload that runs if it is ever parsed as HTML (or closes an attribute).
const PAYLOAD = '"/><img src=x onerror="window.__xss=(window.__xss||0)+1">';
// The same, without `|` — Overflow Text splits its item list on it.
const ITEM_PAYLOAD = '"/><img src=x onerror="window.__xss=7">';

const page0 = `<!doctype html><html><head><meta charset="utf-8"></head><body>
  <main id="main">
    <span id="tw" data-kt-typewriter data-kt-strings="hi" data-kt-caret-char='${PAYLOAD.replace(/'/g, '&#39;')}'></span>
    <div id="ring" data-kt-progress data-kt-ui="ring" data-kt-attach="inline" data-kt-track-color='${PAYLOAD.replace(/'/g, '&#39;')}'></div>
    <button id="toast" data-kt-toast data-kt-message="ok" data-kt-icon='${PAYLOAD.replace(/'/g, '&#39;')}'>toast</button>
    <div id="cursor-host" data-kt-cursor="text" data-kt-rotate-text='${PAYLOAD.replace(/'/g, '&#39;')}'>cursor</div>
    <span id="roll" data-kt-overflow-text="rolling" data-kt-items='first|${ITEM_PAYLOAD}'>first</span>
    <a id="to-redirect" href="/redirect">redirect</a>
    <a id="to-json" href="/data">json</a>
    <a id="to-page" href="/next">next</a>
  </main>
  <script src="${SITE}/dist/kineto.umd.js"></script>
</body></html>`;
// Elements whose ids shadow the engine globals, then a scroll module.
const clobbered = `<!doctype html><html><body>
  <img id="gsap" alt=""><a id="ScrollTrigger" name="ScrollTrigger"></a><form id="Lenis"></form>
  <div style="height:1200px"></div><h2 id="rev" data-kt-reveal="fade-up">reveal</h2><div style="height:1200px"></div>
  <script src="${SITE}/dist/kineto.umd.js"></script>
</body></html>`;
const nextPage = '<!doctype html><html><head><title>Next</title></head><body><main id="main"><p id="arrived">same-origin page</p></main></body></html>';
const foreign = '<!doctype html><html><head><title>Elsewhere</title></head><body><main id="main"><p id="foreign">foreign</p><script>window.__xss=(window.__xss||0)+100</script></main></body></html>';

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox'] }
  : { headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.route('**/*', async (route) => {
  const url = new URL(route.request().url());
  const html = (body, extra = {}) => route.fulfill({ status: 200, contentType: 'text/html', body, headers: extra });
  if (url.origin === SITE) {
    if (url.pathname === '/') return html(page0);
    if (url.pathname === '/next') return html(nextPage);
    if (url.pathname === '/clobbered') return html(clobbered);
    // fetch() gets the redirect. The browser's own navigation to the same URL
    // (the safe fallback) is answered with a plain page, because Playwright
    // does not route the redirected leg of a navigation.
    if (url.pathname === '/redirect') {
      if (route.request().resourceType() === 'document') return html('<!doctype html><title>navigated</title><p id="navigated">navigated</p>');
      return route.fulfill({ status: 302, headers: { location: `${OTHER}/page` } });
    }
    if (url.pathname === '/data') return route.fulfill({ status: 200, contentType: 'application/json', body: '{"main":"<script>window.__xss=1000</script>"}' });
    if (url.pathname.startsWith('/dist/')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(root, url.pathname)) });
  }
  // The other origin answers with CORS wide open: the worst case for a
  // redirect, because fetch() may then read the body.
  if (url.origin === OTHER) return html(foreign, { 'access-control-allow-origin': '*' });
  // The engine CDN, answered from the local install.
  const engine = /npm\/gsap@[^/]+\/dist\/(gsap|ScrollTrigger)\.min\.js$/.exec(url.href);
  if (engine) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(root, `node_modules/gsap/dist/${engine[1]}.min.js`)) });
  return route.fulfill({ status: 404, body: '' });
});

await page.goto(`${SITE}/`, { waitUntil: 'load' });
await page.waitForFunction(() => window.Kineto);
await page.evaluate(() => window.Kineto.init(document));
await page.waitForTimeout(300);

// Text-valued options stay text.
await page.click('#toast');
await page.waitForTimeout(200);
await page.mouse.move(40, 40);
await page.evaluate(() => document.getElementById('cursor-host').dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 40, clientY: 40 })));
await page.waitForTimeout(150);
const rendered = await page.evaluate(([payload, itemPayload]) => {
  const caret = document.querySelector('#tw .kt-tw-caret');
  const ringTrack = document.querySelector('#ring .kt-progress-ring-track');
  const toastIcon = document.querySelector('.kt-toast__icon, .kt-toast__ring-icon');
  const textPath = document.querySelector('.kt-cursor-textring textPath');
  return {
    injectedImages: document.querySelectorAll('img[src="x"]').length,
    ranScript: window.__xss || 0,
    caret: caret?.textContent === payload,
    ringStroke: ringTrack?.getAttribute('stroke') === payload,
    ringChildren: ringTrack?.parentNode?.children.length,
    toastIcon: toastIcon ? toastIcon.textContent === payload : 'no icon',
    textPath: textPath ? textPath.textContent === payload : 'no ring',
    rolling: [...document.querySelectorAll('#roll .kt-overflow-text-segment')].some((segment) => segment.textContent === itemPayload)
  };
}, [PAYLOAD, ITEM_PAYLOAD]);
assert.equal(rendered.injectedImages, 0, `no option value may create markup (${JSON.stringify(rendered)})`);
assert.equal(rendered.ranScript, 0, 'no option value may run script');
assert.equal(rendered.caret, true, 'typewriter caretChar must be shown literally');
assert.equal(rendered.ringStroke, true, 'progress ring colours must stay attribute values');
assert.equal(rendered.ringChildren, 2, 'the progress ring must hold exactly its two circles');
assert.equal(rendered.toastIcon, true, `a custom toast icon is text (${JSON.stringify(rendered)})`);
assert.equal(rendered.textPath, true, `the cursor text ring shows its text literally (${JSON.stringify(rendered)})`);
assert.equal(rendered.rolling, true, `Overflow Text items from an attribute are text (${JSON.stringify(rendered)})`);

// Page Transition only injects a same-origin HTML page.
await page.evaluate(() => { window.__transition = window.Kineto.create('pageTransition', document.documentElement, { container: 'main', minDuration: 0 }); });

// 1. An ordinary same-origin page is fetched and swapped in (the feature works).
await page.click('#to-page');
await page.waitForSelector('#arrived', { timeout: 5000 });
assert.equal(new URL(page.url()).origin, SITE, 'a same-origin page is swapped in place');
await page.goto(`${SITE}/`, { waitUntil: 'load' });
await page.evaluate(() => { window.Kineto.init(document); window.Kineto.create('pageTransition', document.documentElement, { container: 'main', minDuration: 0 }); });

// 2. A same-origin link that redirects to another origin must NOT be injected:
//    the browser navigates there itself, as a normal link would. Before the
//    fix the foreign body replaced <main> here and its script ran on this origin.
//    (Playwright's WebKit cannot fulfil a request with a redirect status, so
//    this case runs in Chromium and Firefox.)
if (browserName !== 'webkit') {
  await Promise.all([
    page.waitForURL(`${SITE}/redirect`, { timeout: 5000 }),
    page.click('#to-redirect')
  ]);
  assert.equal(await page.locator('#navigated').count(), 1, 'a redirected page must be left to a real navigation');
  assert.equal(await page.evaluate(() => window.__xss || 0), 0, 'no foreign script may run on this origin');
  await page.goto(`${SITE}/`, { waitUntil: 'load' });
  await page.evaluate(() => { window.Kineto.init(document); window.Kineto.create('pageTransition', document.documentElement, { container: 'main', minDuration: 0 }); });
}

// 3. A same-origin response that is not an HTML document is not injected.
await Promise.all([
  page.waitForURL(`${SITE}/data`, { timeout: 5000 }),
  page.click('#to-json')
]);
assert.match(await page.evaluate(() => document.contentType), /json/, 'a non-HTML response is left to the browser');
await page.goto(`${SITE}/`, { waitUntil: 'load' });
await page.evaluate(() => { window.Kineto.init(document); window.__t = window.Kineto.create('pageTransition', document.documentElement, { container: 'main', minDuration: 0 }); });

// 4. The public navigate() never fetches another origin.
const fetched = [];
page.on('request', (request) => { if (request.resourceType() === 'fetch') fetched.push(request.url()); });
await Promise.all([
  page.waitForURL(`${OTHER}/page`, { timeout: 5000 }),
  page.evaluate((other) => window.__t.navigate(`${other}/page`), OTHER)
]);
assert.deepEqual(fetched, [], `navigate() to another origin must be a plain navigation, not a fetch (${fetched.join(', ')})`);

// Clobbered globals: the real engine still loads (with its SRI) and drives the reveal.
await page.goto(`${SITE}/clobbered`, { waitUntil: 'load' });
await page.evaluate(() => window.Kineto.init(document));
await page.waitForFunction(() => window.gsap && typeof window.gsap.to === 'function' && window.Kineto.getInstance(document.getElementById('rev'), 'reveal'), null, { timeout: 8000 });
const engine = await page.evaluate(() => ({
  gsapIsEngine: typeof window.gsap.to === 'function',
  triggers: window.ScrollTrigger?.getAll?.().length || 0
}));
assert.equal(engine.gsapIsEngine, true, 'an element with id="gsap" must not pass for GSAP, and must not stop it loading');
assert.ok(engine.triggers >= 1, `the reveal must run on the real ScrollTrigger (${JSON.stringify(engine)})`);

assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
await browser.close();
console.log(`markup-trust OK (${browserName}) — caret, ring colours, toast icon and cursor ring text stay text; Page Transition injects only same-origin HTML (a cross-origin redirect, a JSON response and navigate() to another origin are plain navigations); ids that shadow engine globals cannot pose as GSAP.`);
