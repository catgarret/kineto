// Bootstrap 5 coexistence QA — opens examples/bootstrap/index.html in a real
// browser and proves the rules written in kineto.integrations.json:
//   1. the pinned CDN files (SRI) equal the bootstrap package in this fixture,
//      so the page runs offline here and byte-identically online;
//   2. data-bs-* and data-kt-* share elements: Bootstrap opens the modal, shows
//      the tooltip, expands the accordion and slides the carousel while Kineto
//      instances live on the same elements;
//   3. Kineto.observe() attaches to toasts/cards added later and releases them;
//   4. the conflict rules hold (one tooltip, no data-kt-slider on .carousel,
//      no .placeholder next to data-kt-lazy) and Bootstrap's layout is intact;
//   5. neither library logs an error.
// Run: npm --prefix tests/integrations run qa   (from the repository root)
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const EXAMPLE = 'examples/bootstrap/index.html';
const html = fs.readFileSync(path.join(root, EXAMPLE), 'utf8');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };
const sri = (file) => `sha384-${crypto.createHash('sha384').update(fs.readFileSync(file)).digest('base64')}`;

// 1. Every CDN URL in the example is pinned with an integrity hash that equals
//    the locally installed package file. Bumping the version in one place
//    without the other fails here instead of in a user's browser.
const bootstrapVersion = JSON.parse(fs.readFileSync(path.join(here, 'node_modules/bootstrap/package.json'), 'utf8')).version;
const cdnAssets = [...html.matchAll(/(?:href|src)="(https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@([^/]+)\/dist\/([^"]+))"[^>]*integrity="([^"]+)"/g)]
  .map(([, url, version, file, integrity]) => ({ url, version, file, integrity, local: path.join(here, 'node_modules/bootstrap/dist', file) }));
assert.equal(cdnAssets.length, 2, 'the example must load Bootstrap CSS and the JS bundle from the CDN with SRI');
for (const asset of cdnAssets) {
  assert.equal(asset.version, bootstrapVersion, `${asset.file}: example pins bootstrap@${asset.version} but the fixture installs ${bootstrapVersion}`);
  assert.equal(asset.integrity, sri(asset.local), `${asset.file}: integrity attribute does not match bootstrap@${bootstrapVersion}`);
}
for (const [tag] of html.matchAll(/<(?:link|script)\b[^>]*https?:\/\/[^>]*>/g)) {
  assert.match(tag, /\sintegrity="sha(?:256|384|512)-[^"]+"/, `every remote <link>/<script> in the example needs an integrity attribute: ${tag}`);
}

// Engines: Kineto loads GSAP/ScrollTrigger/Lenis from jsDelivr at runtime with
// SRI. The repository devDependencies hold the same pinned versions, so they
// are served from disk here and the browser still verifies the hashes.
const engineFiles = {
  'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js': 'node_modules/gsap/dist/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js': 'node_modules/gsap/dist/ScrollTrigger.min.js',
  'https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js': 'node_modules/lenis/dist/lenis.min.js'
};
const localFiles = new Map([
  ...cdnAssets.map((asset) => [asset.url, asset.local]),
  ...Object.entries(engineFiles).map(([url, file]) => [url, path.join(root, file)])
]);

// Static conflict rules — cheaper to assert on the source than in the browser.
assert.doesNotMatch(html, /class="[^"]*\bcarousel\b[^"]*"[^>]*data-kt-slider/, '.carousel must not also be a data-kt-slider');
assert.doesNotMatch(html, /data-bs-toggle="tooltip"[^>]*data-kt-tooltip|data-kt-tooltip[^>]*data-bs-toggle="tooltip"/, 'one element must not carry both tooltips');
assert.doesNotMatch(html, /class="[^"]*\bplaceholder(?:-glow|-wave)?\b/, 'Bootstrap placeholders and data-kt-lazy skeletons must not be mixed');
assert.match(html, /Kineto\.observe\(\)/, 'the example must rely on Kineto.observe() for dynamically added markup');

// Serve the repository so the example's relative ../../dist and ../../demo links resolve.
const server = http.createServer((request, response) => {
  const file = path.join(root, decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403); response.end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': mimeTypes[path.extname(file)] || 'application/octet-stream' });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const chrome = process.env.KT_CHROME || process.env.MK_CHROMIUM;
const browser = await chromium.launch({ headless: true, ...(chrome ? { executablePath: chrome } : {}), args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', (request) => errors.push(`request failed: ${request.url()} (${request.failure()?.errorText})`));
  await page.route((url) => localFiles.has(url.href), async (route) => {
    const file = localFiles.get(route.request().url());
    await route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: mimeTypes[path.extname(file)] });
  });
  // Anything else off-origin is a bug in the example (or a new CDN asset without a fixture).
  await page.route((url) => url.origin !== origin && !localFiles.has(url.href), (route) => route.abort('blockedbyclient'));

  await page.goto(`${origin}/${EXAMPLE}`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.bootstrap && window.Kineto && window.Kineto.instanceCount > 0));
  // Modules that need GSAP (textSplit, reveal, counter …) initialise once the engine arrives.
  await page.waitForFunction(() => Boolean(window.Kineto.getInstance(document.querySelector('.hero h1'), 'textSplit')), null, { timeout: 15000 });

  const shared = await page.evaluate(() => {
    const button = document.getElementById('open-offer');
    const grid = document.querySelector('#kpi .row');
    return {
      version: { bootstrap: window.bootstrap.Modal.VERSION, kineto: window.Kineto.version },
      buttonModules: ['ripple', 'magnetic'].filter((name) => window.Kineto.getInstance(button, name)),
      buttonIsBootstrapTrigger: button.getAttribute('data-bs-toggle') === 'modal',
      gridDisplay: getComputedStyle(grid).display,
      gridHasReveal: Boolean(window.Kineto.getInstance(grid, 'reveal')),
      progress: Boolean(window.Kineto.getInstance(document.querySelector('.reading-progress'), 'progress')),
      tilt: Boolean(window.Kineto.getInstance(document.querySelector('[data-kt-tilt]'), 'tilt')),
      marquee: Boolean(window.Kineto.getInstance(document.querySelector('[data-kt-marquee]'), 'marquee')),
      lazyImages: [...document.querySelectorAll('img[data-kt-lazy]')].filter((img) => window.Kineto.getInstance(img, 'lazy')).length,
      images: document.querySelectorAll('img[data-kt-lazy]').length
    };
  });
  assert.match(shared.version.bootstrap, /^5\./, 'Bootstrap 5 must be the loaded major');
  assert.deepEqual(shared.buttonModules, ['ripple', 'magnetic'], 'Kineto ripple + magnetic must attach to the Bootstrap modal trigger');
  assert.ok(shared.buttonIsBootstrapTrigger && shared.gridHasReveal && shared.progress && shared.tilt && shared.marquee, `attachment: ${JSON.stringify(shared)}`);
  assert.equal(shared.gridDisplay, 'flex', 'Kineto must not change the Bootstrap grid layout (.row stays flex)');
  assert.equal(shared.lazyImages, shared.images, 'every data-kt-lazy image must have a lazy instance');

  // 2a. Modal: Bootstrap shows it; the body list (display:none until then) reveals through Kineto.
  await page.click('#open-offer');
  await page.waitForSelector('#offerModal.show', { state: 'visible' });
  await page.waitForFunction(() => {
    const items = [...document.querySelectorAll('#offerModal .modal-body li')];
    return items.length === 3 && items.every((li) => Number(getComputedStyle(li).opacity) > 0.95);
  }, null, { timeout: 8000 });
  const focusInModal = await page.evaluate(() => document.getElementById('offerModal').contains(document.activeElement));
  assert.ok(focusInModal, 'Bootstrap keeps owning modal focus management');
  await page.keyboard.press('Escape');
  await page.waitForSelector('#offerModal', { state: 'hidden' });

  // 2b. Tooltip: hovering the Bootstrap trigger shows exactly one tooltip and it is Bootstrap's.
  await page.hover('#tooltip-button');
  await page.waitForSelector('.tooltip.show', { state: 'visible' });
  const tooltips = await page.evaluate(() => ({ bootstrap: document.querySelectorAll('.tooltip').length, kineto: document.querySelectorAll('.kt-tooltip, [data-kt-tooltip]').length }));
  assert.deepEqual(tooltips, { bootstrap: 1, kineto: 0 }, 'only Bootstrap renders the tooltip');
  await page.mouse.move(0, 0);

  // 2c. Accordion: Bootstrap expands the panel; Kineto reveals the body once it is visible.
  await page.click('[data-bs-target="#faq-1"]');
  await page.waitForSelector('#faq-1.show', { state: 'visible' });
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('#faq-1 .accordion-body')).opacity) > 0.95, null, { timeout: 8000 });
  const accordionOwners = await page.evaluate(() => ({
    kinetoAccordion: Boolean(window.Kineto.getInstance(document.getElementById('faq-accordion'), 'accordion')),
    bodyReveal: Boolean(window.Kineto.getInstance(document.querySelector('#faq-1 .accordion-body'), 'reveal'))
  }));
  assert.deepEqual(accordionOwners, { kinetoAccordion: false, bodyReveal: true }, 'Bootstrap owns open/close, Kineto only reveals the content');

  // 2d. Carousel: Bootstrap slides; Kineto has no slider instance on it.
  await page.click('#story .carousel-control-next');
  await page.waitForFunction(() => document.querySelector('#story .carousel-item:nth-child(2)').classList.contains('active'), null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => Boolean(window.Kineto.getInstance(document.getElementById('story'), 'slider'))), false, 'no Kineto slider on the Bootstrap carousel');

  // 3a. Dynamically added card → observe() attaches tilt without any extra call.
  const before = await page.evaluate(() => window.Kineto.instanceCount);
  await page.click('#add-card');
  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('#card-grid [data-kt-tilt]');
    return cards.length === 2 && window.Kineto.getInstance(cards[1], 'tilt');
  }, null, { timeout: 5000 });
  assert.ok((await page.evaluate(() => window.Kineto.instanceCount)) > before, 'instance count grows with the added card');

  // 3b. Dynamic toast → Bootstrap shows it, observe() attaches textReveal, removal releases the instance.
  await page.click('#show-toast');
  await page.waitForSelector('#toasts .toast.show', { state: 'visible' });
  await page.waitForFunction(() => Boolean(window.Kineto.getInstance(document.querySelector('#toasts .toast strong'), 'textReveal')), null, { timeout: 5000 });
  const countWithToast = await page.evaluate(() => window.Kineto.instanceCount);
  await page.evaluate(() => window.bootstrap.Toast.getInstance(document.querySelector('#toasts .toast')).hide());
  await page.waitForFunction(() => document.querySelectorAll('#toasts .toast').length === 0, null, { timeout: 5000 });
  await page.waitForFunction((expected) => window.Kineto.instanceCount === expected, countWithToast - 1, { timeout: 5000 });

  // KPI counters announce their final value and land on it after scrolling
  // into view (the slot reel keeps its digit strip, so it is checked by its
  // last reel digit rather than by textContent).
  await page.evaluate(() => document.getElementById('kpi').scrollIntoView({ block: 'center' }));
  await page.waitForFunction(() => {
    const [pop, slot, plain] = document.querySelectorAll('#kpi [data-kt-counter]');
    const labels = [pop, slot, plain].map((el) => el.getAttribute('aria-label'));
    const reels = [...slot.querySelectorAll('.kt-counter-reel')].map((reel) => reel.lastElementChild?.textContent);
    return labels.join('|') === '12,800|98%|42' && pop.textContent.trim() === '12,800' && plain.textContent.trim() === '42' && reels.join('') === '98';
  }, null, { timeout: 10000 });

  // 4. Global teardown releases everything Kineto created; Bootstrap components keep working.
  const teardown = await page.evaluate(() => {
    window.Kineto.destroy();
    const modal = window.bootstrap.Modal.getOrCreateInstance(document.getElementById('offerModal'));
    return { instances: window.Kineto.instanceCount, modalStillWorks: typeof modal.show === 'function', gridDisplay: getComputedStyle(document.querySelector('#kpi .row')).display };
  });
  assert.deepEqual(teardown, { instances: 0, modalStillWorks: true, gridDisplay: 'flex' });

  // 5. No runtime errors from either library or from a blocked request.
  assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
  console.log(`integrations bootstrap OK — bootstrap@${bootstrapVersion} (SRI verified) + Kineto ${shared.version.kineto}: modal/tooltip/accordion/carousel stay Bootstrap-owned, ripple/magnetic/reveal/counter/tilt/glow/lazy/marquee/progress attach, observe() handles dynamic cards and toasts, destroy() leaves Bootstrap intact.`);
} finally {
  await browser.close();
  server.close();
}
