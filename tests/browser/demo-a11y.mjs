// The demo's own dialogs, tabs and scroll handlers — accessibility and cost.
//
// Each case below was a real defect of the demo page (not the library):
//   1. Settings drawer: after the first open and close the sheet only slid off
//      screen. It stayed a modal dialog (`aria-modal`) with focusable controls,
//      so Tab reached invisible buttons and a screen reader treated the page
//      as covered. Closed, it must be `inert` and not modal.
//   2. Sitemap: closing and reopening within the 260ms fade let the stale
//      hide timer hide the reopened overlay while the page stayed inert —
//      Escape could no longer close it, the page was stuck.
//   3. Tabbed demo cards: `role="tablist"` / `role="tab"` without panels,
//      `aria-controls`, a roving tab stop or arrow keys.
//   4. The hero title's gradient flow (a background-position animation, main
//      thread) ran forever, also scrolled far away.
//   5. The hero snap's wheel/touchmove handlers (non-passive, live for the
//      whole session) read offsetHeight/offsetTop on every event.
//
// Run: node tests/browser/demo-a11y.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported KT_BROWSER: ${browserName}`);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.json': 'application/json'
};
const LOCAL_CDN = [
  [/cdn\.jsdelivr\.net\/npm\/gsap@[^/]+\/dist\/(gsap|ScrollTrigger)\.min\.js/, (match) => `node_modules/gsap/dist/${match[1]}.min.js`],
  [/cdn\.jsdelivr\.net\/npm\/lenis@[^/]+\/dist\/lenis\.min\.js/, () => 'node_modules/lenis/dist/lenis.min.js']
];

const server = http.createServer((request, response) => {
  if (request.method !== 'GET') { response.writeHead(405).end(); return; }
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await browserType.launch({
  headless: true,
  ...(browserName === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
  args: browserName === 'chromium' ? ['--no-sandbox', '--disable-gpu'] : []
});
const page = await browser.newPage({ viewport: { width: 1280, height: 860 }, reducedMotion: 'no-preference' });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
// A repeat visit: no intro loader (it only holds the page still).
await page.addInitScript(() => { try { sessionStorage.setItem('kt-intro-seen', '1'); } catch (_) { /* private mode */ } });
await page.route((url) => !url.href.startsWith(origin), async (route) => {
  const url = route.request().url();
  for (const [pattern, local] of LOCAL_CDN) {
    const match = pattern.exec(url);
    const file = match && path.resolve(root, local(match));
    if (file && fs.existsSync(file)) {
      await route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
      return;
    }
  }
  await route.fulfill({ status: 200, contentType: url.endsWith('.js') ? 'text/javascript' : 'text/css', body: '' });
});
await page.goto(`${origin}/demo/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => document.documentElement.classList.contains('kt-blocks-ready') && window.KINETO_BLOCKS, null, { timeout: 30000 });

const settle = (ms = 120) => page.waitForTimeout(ms);

// 1. Settings drawer: modal only while open.
{
  const summary = page.locator('.card .kt-playground > summary').first();
  await summary.evaluate((node) => { window.KINETO_FOLD?.reveal?.(node); node.scrollIntoView({ block: 'center' }); });
  await summary.click();
  await page.waitForFunction(() => document.querySelector('.kt-drawer-sheet')?.classList.contains('is-open'));
  const opened = await page.evaluate(() => {
    const sheet = document.querySelector('.kt-drawer-sheet');
    return { inert: sheet.inert, modal: sheet.getAttribute('aria-modal'), focusInside: sheet.contains(document.activeElement) };
  });
  assert.deepEqual(opened, { inert: false, modal: 'true', focusInside: true }, `an open drawer is a modal dialog holding focus (${JSON.stringify(opened)})`);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('.kt-drawer-sheet').classList.contains('is-open'));
  const closed = await page.evaluate(() => {
    const sheet = document.querySelector('.kt-drawer-sheet');
    return { inert: sheet.inert, modal: sheet.hasAttribute('aria-modal'), focusInside: sheet.contains(document.activeElement) };
  });
  assert.deepEqual(closed, { inert: true, modal: false, focusInside: false },
    `a closed drawer must be inert and not modal, so Tab and screen readers never reach it (${JSON.stringify(closed)})`);

  // Closed within the frame it opened in (a double click, a script): the
  // drawer's frame callbacks used to open it again, leaving the dim backdrop
  // over the page (seen as a flaky click in demo-code-access).
  await page.waitForFunction(() => !document.querySelector('.kt-drawer-backdrop')?.classList.contains('is-open'));
  const quick = await summary.evaluate(async (node) => {
    const details = node.parentElement;
    details.open = true;
    await new Promise((resolve) => setTimeout(resolve, 0)); // the toggle event runs show()
    details.open = false;
    await new Promise((resolve) => setTimeout(resolve, 0)); // … and hide(), before the next frame
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    return {
      backdrop: document.querySelector('.kt-drawer-backdrop').classList.contains('is-open'),
      sheet: document.querySelector('.kt-drawer-sheet').classList.contains('is-open'),
      inert: document.querySelector('.kt-drawer-sheet').inert
    };
  });
  assert.deepEqual(quick, { backdrop: false, sheet: false, inert: true }, `a drawer closed in the frame it opened stays closed (${JSON.stringify(quick)})`);
}

// 2. Sitemap: reopening during the closing fade keeps it open and the page usable.
{
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('#sitemap-btn');
  await page.waitForFunction(() => document.querySelector('.sitemap-overlay')?.classList.contains('is-open'));
  await page.click('.sitemap-close');
  await settle(60);
  // The fading overlay still covers the page, so the button is pressed the way a
  // shortcut or script would (a pointer click would land on the overlay).
  await page.evaluate(() => document.getElementById('sitemap-btn').click());
  await settle(500);
  const reopened = await page.evaluate(() => {
    const overlay = document.querySelector('.sitemap-overlay');
    return { hidden: overlay.hidden, open: overlay.classList.contains('is-open'), mainInert: document.querySelector('main').closest('[inert]') !== null };
  });
  assert.deepEqual(reopened, { hidden: false, open: true, mainInert: true }, `a sitemap reopened during its fade stays open (${JSON.stringify(reopened)})`);
  await page.keyboard.press('Escape');
  await settle(500);
  const closed = await page.evaluate(() => ({
    hidden: document.querySelector('.sitemap-overlay').hidden,
    mainInert: document.querySelector('main').closest('[inert]') !== null,
    locked: document.documentElement.classList.contains('is-locked')
  }));
  assert.deepEqual(closed, { hidden: true, mainInert: false, locked: false }, `closing the sitemap gives the page back (${JSON.stringify(closed)})`);
}

// 3. Tabbed demo cards follow the tabs pattern.
{
  const strip = page.locator('.card[data-demo-tabs] .demo-tabs').first();
  await strip.evaluate((node) => { window.KINETO_FOLD?.reveal?.(node); node.scrollIntoView({ block: 'center' }); });
  const wiring = await strip.evaluate((node) => {
    const tabs = [...node.querySelectorAll('[role="tab"]')];
    return {
      tabs: tabs.length,
      controlled: tabs.every((tab) => {
        const panel = document.getElementById(tab.getAttribute('aria-controls') || '');
        return panel?.getAttribute('role') === 'tabpanel' && panel.getAttribute('aria-labelledby') === tab.id;
      }),
      tabStops: tabs.filter((tab) => tab.tabIndex === 0).length
    };
  });
  assert.ok(wiring.tabs >= 2 && wiring.controlled && wiring.tabStops === 1, `each tab controls a labelled tabpanel with one tab stop (${JSON.stringify(wiring)})`);
  await strip.locator('[role="tab"]').first().focus();
  await page.keyboard.press('ArrowRight');
  const moved = await strip.evaluate((node) => {
    const tabs = [...node.querySelectorAll('[role="tab"]')];
    const second = tabs[1];
    return { selected: second.getAttribute('aria-selected'), focused: document.activeElement === second, panelShown: !document.getElementById(second.getAttribute('aria-controls')).hidden, tabStop: second.tabIndex };
  });
  assert.deepEqual(moved, { selected: 'true', focused: true, panelShown: true, tabStop: 0 }, `ArrowRight selects and focuses the next tab (${JSON.stringify(moved)})`);
}

// 4 + 5. The hero: no animation far away, no layout reads per wheel event.
{
  const reads = await page.evaluate(async () => {
    const hero = document.querySelector('.hero');
    const landing = document.querySelector('main .section-head');
    const count = { reads: 0 };
    const spy = (node, name) => {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name);
      Object.defineProperty(node, name, { configurable: true, get() { count.reads += 1; return descriptor.get.call(this); } });
    };
    spy(hero, 'offsetHeight');
    if (landing) spy(landing, 'offsetTop');
    window.scrollTo(0, Math.round(document.documentElement.scrollHeight / 2));
    await new Promise((resolve) => setTimeout(resolve, 300));
    count.reads = 0;
    for (let i = 0; i < 30; i += 1) window.dispatchEvent(new WheelEvent('wheel', { deltaY: i % 2 ? 40 : -40, bubbles: true, cancelable: true }));
    const result = count.reads;
    delete hero.offsetHeight;
    if (landing) delete landing.offsetTop;
    return result;
  });
  assert.equal(reads, 0, `the hero snap must not read layout on wheel events (${reads} reads for 30 events)`);
  await settle(300);
  const far = await page.evaluate(() => document.querySelector('.hero-title').getAnimations().map((animation) => animation.playState));
  assert.ok(far.length > 0 && far.every((state) => state === 'paused'), `the hero title rests while the hero is out of sight (${far})`);
  // Back at the top (through Lenis when smooth scrolling is on past the hero,
  // or it would ease the page back to where it was).
  await page.evaluate(() => { const lenis = window.Kineto?.lenis; if (lenis?.scrollTo) lenis.scrollTo(0, { immediate: true }); window.scrollTo(0, 0); });
  await page.waitForFunction(() => document.querySelector('.hero-title').getAnimations().every((animation) => animation.playState === 'running'), null, { timeout: 5000 })
    .catch(async (error) => { throw new Error(`the hero title must run again at the top: ${JSON.stringify(await page.evaluate(() => ({ y: scrollY, past: document.querySelector('.hero').classList.contains('is-past'), states: document.querySelector('.hero-title').getAnimations().map((a) => a.playState) })))} (${error.message})`); });
}

assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
await browser.close();
server.close();
console.log(`demo-a11y OK (${browserName}) — the closed drawer is inert and not modal, a reopened sitemap stays open and a closed one frees the page, demo tabs follow the tabs pattern with arrow keys, the hero title rests far away, and wheel events read no layout.`);
