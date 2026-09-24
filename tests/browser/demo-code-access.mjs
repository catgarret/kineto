// Every example on the demo page must hand over its code.
//
// "Some places have no button to see and copy the source" was a real report:
// cards that showed an effect but gave no way to take it home. This test holds
// the promise for the whole page, card by card:
//
//   1. every top-level card either carries a playground ("설정 · 코드") whose
//      code is primed for HTML/JS, or a copy control bound to real code;
//   2. every code block shown on the page has a copy control beside it;
//   3. opening a playground (first, middle, last on the page) shows the code
//      tabs and a copy button, and copying hands over exactly the code shown.
//
// The page runs from this checkout (dist/ + demo/); CDN scripts are served from
// node_modules, and every other external request is answered empty so the test
// never depends on the network.
//
// Run: npm run build && node tests/browser/demo-code-access.mjs
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
// CDN scripts the demo needs, served from the local install instead.
const LOCAL_CDN = [
  [/cdn\.jsdelivr\.net\/npm\/gsap@[^/]+\/dist\/(gsap|ScrollTrigger)\.min\.js/, (match) => `node_modules/gsap/dist/${match[1]}.min.js`],
  [/cdn\.jsdelivr\.net\/npm\/lenis@[^/]+\/dist\/lenis\.min\.js/, () => 'node_modules/lenis/dist/lenis.min.js']
];

// A static server for this checkout only: the resolved path must stay inside
// the repository, and only GET is answered.
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
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
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
// Record what the copy buttons hand to the clipboard (no permission prompts).
await page.addInitScript(() => {
  window.__copied = [];
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text) => { window.__copied.push(String(text)); } }
  });
});
await page.goto(`${origin}/demo/index.html`, { waitUntil: 'load' });
await page.waitForFunction(() => document.querySelectorAll('details.kt-playground').length > 100, null, { timeout: 30000 });

// 1 + 2. The whole page, statically.
const audit = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('article.card')]
    .filter((card, index, all) => !all.some((other) => other !== card && other.contains(card)));
  const name = (card) => (card.querySelector('h2,h3,h4')?.textContent || card.id || card.className).trim().slice(0, 60);
  const copyTarget = (control) => {
    const selector = control.getAttribute('data-copy');
    return selector ? document.querySelector(selector)?.textContent?.trim() || '' : 'inline';
  };
  const withoutCode = cards.filter((card) => {
    const primed = [...card.querySelectorAll('details.kt-playground')]
      .some((panel) => (panel.dataset.htmlCode || '').trim().length > 10 || (panel.dataset.jsCode || '').trim().length > 10);
    if (primed) return false;
    const copies = [...card.querySelectorAll('[data-copy], .copy-chip, .kt-playground__copy')];
    return !copies.some((control) => copyTarget(control).length > 10);
  }).map(name);
  const blocks = [...document.querySelectorAll('pre, .install-row code')]
    .filter((block) => !block.closest('.kt-drawer-sheet, details.kt-playground'));
  const blocksWithoutCopy = blocks.filter((block) => {
    const box = block.closest('.install-row, .code-block, article.card, section');
    return !box?.querySelector('[data-copy], .copy-chip, .kt-playground__copy, button[class*="copy"]');
  }).map((block) => block.textContent.trim().slice(0, 60));
  return { cards: cards.length, withoutCode, blocks: blocks.length, blocksWithoutCopy };
});
assert.ok(audit.cards > 150, `the demo must render its cards (found ${audit.cards})`);
assert.deepEqual(audit.withoutCode, [], 'every card must hand over its code');

// 2b. Snippets carry only markup a page writes. State the core or a module sets
// on an element (data-kt-offscreen while it is out of view, data-kt-overflow-
// active …) is not an option: pasted into a page it would pin that state there.
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const leaked = await page.evaluate(({ activations, options }) => {
  const activation = new Set(activations);
  const option = new Set(options);
  const effects = new Map((window.Kineto.listCanvasEffects?.() || []).map((effect) => [effect.name, Object.keys(effect.options)]));
  const camel = (value) => value.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
  const found = new Set();
  document.querySelectorAll('details.kt-playground').forEach((panel) => {
    // Each snippet's ROOT tags only — children are the page's authored markup
    // (hover targets, layers, menu items) and carry their own data-kt-* hooks.
    const html = (panel.dataset.htmlCode || '').split('\n').filter((line) => /^<[a-z]/i.test(line)).map((line) => line.slice(0, line.indexOf('>') + 1)).join('\n');
    const effect = /data-kt-canvas-effect="([^"]+)"/.exec(html)?.[1];
    for (const [, name] of html.matchAll(/\s(data-kt-[a-z0-9-]+)(?==|\s|>)/g)) {
      const key = camel(name.slice(8));
      if (activation.has(name) || option.has(key) || effects.get(effect)?.includes(key)) continue;
      found.add(name);
    }
  });
  return [...found];
}, {
  activations: contract.modules.map(({ attribute }) => attribute),
  options: [...new Set(contract.modules.flatMap(({ publicOptions }) => publicOptions))]
});
assert.deepEqual(leaked, [], 'copied snippets must not carry runtime state attributes');
assert.deepEqual(audit.blocksWithoutCopy, [], 'every code block on the page needs a copy control');

// 3. A real open → copy on the first, a middle and the last playground. The
// drawer keeps every body it has shown and hides all but the current one.
const ACTIVE = '.kt-drawer-sheet > .kt-playground__body:not([hidden])';
const panelCount = await page.locator('details.kt-playground').count();
for (const index of [0, Math.floor(panelCount / 2), panelCount - 1]) {
  const panel = page.locator('details.kt-playground').nth(index);
  await panel.scrollIntoViewIfNeeded();
  await panel.locator(':scope > summary').click();
  // Wait for the drawer to show THIS playground's body — the previous one is
  // still visible for a moment after the click.
  await page.waitForFunction(([i, active]) => {
    const body = document.querySelector(active);
    return body?.__mkOwner === document.querySelectorAll('details.kt-playground')[i] && body.querySelector('.kt-playground__copy');
  }, [index, ACTIVE], { timeout: 10000 });
  const opened = await page.evaluate(([i, active]) => {
    const details = document.querySelectorAll('details.kt-playground')[i];
    const drawer = document.querySelector(active);
    return {
      title: details.closest('article')?.querySelector('h2,h3,h4')?.textContent?.trim(),
      tabs: [...drawer.querySelectorAll('.kt-playground__tab')].map((tab) => tab.dataset.codeTab),
      shown: drawer.querySelector('pre code')?.textContent || '',
      html: details.dataset.htmlCode || ''
    };
  }, [index, ACTIVE]);
  assert.ok(['html', 'js', 'react', 'vue'].every((tab) => opened.tabs.includes(tab)),
    `${opened.title}: the code view must offer HTML, JS, React and Vue (got ${opened.tabs.join(', ')})`);
  assert.ok(opened.shown.trim().length > 10, `${opened.title}: the code view must show code`);
  const before = await page.evaluate(() => window.__copied.length);
  await page.evaluate((active) => document.querySelector(`${active} .kt-playground__tab[data-code-tab="html"]`)?.click(), ACTIVE);
  await page.evaluate((active) => document.querySelector(`${active} .kt-playground__copy`).click(), ACTIVE);
  await page.waitForFunction((count) => window.__copied.length > count, before, { timeout: 5000 });
  const copied = await page.evaluate(() => window.__copied.at(-1));
  assert.equal(copied, opened.html, `${opened.title}: copying must hand over exactly the HTML example`);
  await page.evaluate((i) => { document.querySelectorAll('details.kt-playground')[i].open = false; }, index);
}
assert.deepEqual(errors, [], 'no page errors');

await browser.close();
server.close();
console.log(`demo-code-access OK (${browserName}) — ${audit.cards} cards and ${audit.blocks} code blocks all hand over their code; open → copy verified on 3 of ${panelCount} playgrounds.`);
