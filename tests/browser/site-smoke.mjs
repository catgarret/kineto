// Deployed-site smoke — the generated `site/` executes minified copies of the
// demo scripts and stylesheets, while every other browser test runs against
// the readable `demo/` source. This lane boots the exact bytes GitHub Pages
// serves and exercises the paths minification could plausibly break: page
// boot, i18n copy, the settings drawer, a live option change, and a `?kt=`
// share-link restore.
// Run: npm run build && node tests/browser/site-smoke.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.KT_CHROME || undefined;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const MODULE_COUNT = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8')).moduleCount;
const shareToken = (payload) => Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, 'http://localhost');
  let filePath = path.join(root, decodeURIComponent(requestUrl.pathname));
  if (filePath.endsWith('/')) filePath = path.join(filePath, 'index.html');
  fs.readFile(filePath, (error, bytes) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    response.end(bytes);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const PORT = server.address().port;
const SITE = `http://localhost:${PORT}/site/index.html`;

let pass = 0; let fail = 0;
const ck = (name, condition, detail) => { console.log(`  [${condition ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`); condition ? pass++ : fail++; };

// The generated site must reference the minified demo assets, not the source.
const siteHtml = fs.readFileSync(path.join(root, 'site/index.html'), 'utf8');
for (const asset of ['playground.js', 'main.js', 'styles.css', 'playground.css']) {
  const site = fs.statSync(path.join(root, 'site', asset)).size;
  const demo = fs.statSync(path.join(root, 'demo', asset)).size;
  ck(`site/${asset} is smaller than demo/${asset}`, site < demo, `${site} < ${demo} bytes`);
  ck(`site/index.html references ./${asset}`, siteHtml.includes(`./${asset}?v=`));
}

const browser = await chromium.launch({ headless: true, ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] });

// External CDN assets (fonts, icons, Prism, GTM) are unreachable in the QA
// sandbox; only script errors and first-party console errors count.
const isFirstPartyError = (text) => !/Failed to load resource|net::ERR_|ERR_NAME_NOT_RESOLVED|googletagmanager|cdnjs|jsdelivr/i.test(text);
async function openSite(query = '') {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error' && isFirstPartyError(message.text())) errors.push(`console: ${message.text()}`); });
  await page.goto(`${SITE}${query}`, { waitUntil: 'load' });
  await page.waitForFunction((expected) => window.Kineto && window.KinetoPlayground && document.querySelectorAll('main [data-module-block]').length >= expected, MODULE_COUNT - 1, { timeout: 20000 });
  return { context, page, errors };
}

// 1. Boot: runtime version, module count, build stamp, localized copy, and the
//    settings drawer built by the minified playground.
{
  const { context, page, errors } = await openSite();
  await page.waitForFunction(() => document.querySelector('#mod-typewriter .kt-playground[data-share-key]'), null, { timeout: 15000 });
  const boot = await page.evaluate(async () => {
    const card = document.querySelector('#mod-typewriter .kt-playground[data-share-key]')?.closest('.card');
    card?.querySelector('.kt-playground>summary')?.click();
    await new Promise((resolve) => setTimeout(resolve, 300));
    const body = [...document.querySelectorAll('.kt-drawer-sheet .kt-playground__body')].find((node) => !node.hidden);
    const range = body?.querySelector('input[type="range"][data-option="typeSpeed"]');
    let liveValue = null;
    if (range) {
      range.value = String(Number(range.min || 0) + Number(range.step || 1) * 3);
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 400));
      liveValue = document.querySelector('#mod-typewriter [data-kt-typewriter]')?.getAttribute('data-kt-type-speed');
    }
    document.querySelector('.kt-drawer-backdrop.is-open')?.click();
    return {
      version: window.Kineto.version,
      shownVersion: document.querySelector('[data-kt-version]')?.textContent,
      moduleCount: document.querySelector('[data-kt-module-count]')?.textContent,
      build: (document.querySelector('[data-kt-build]')?.textContent || '').trim(),
      buildGlobal: window.__KT_BUILD__,
      helpLanguages: Object.keys(window.MK_HELP_I18N || {}).length,
      copyLanguages: (window.KINETO_COPY_I18N?.languages || []).length,
      drawerOpened: Boolean(body),
      rangeFound: Boolean(range),
      rangeValue: range?.value,
      liveValue
    };
  });
  ck('site boots the tested runtime version', boot.version === pkg.version && boot.shownVersion === pkg.version, `${boot.version} / ${boot.shownVersion}`);
  ck(`site shows ${MODULE_COUNT} modules`, boot.moduleCount === String(MODULE_COUNT), boot.moduleCount);
  ck('site stamps the build id', /^\S+$/.test(boot.build) && boot.build === boot.buildGlobal, `${boot.build} / ${boot.buildGlobal}`);
  ck('minified i18n tables still expose their languages', boot.helpLanguages >= 2 && boot.copyLanguages >= 6, `help=${boot.helpLanguages} copy=${boot.copyLanguages}`);
  ck('settings drawer opens from the minified playground', boot.drawerOpened && boot.rangeFound, JSON.stringify({ drawerOpened: boot.drawerOpened, rangeFound: boot.rangeFound }));
  ck('changing a control updates the live module option', boot.liveValue != null && boot.liveValue === boot.rangeValue, `attribute=${boot.liveValue} control=${boot.rangeValue}`);
  ck('boot raised no first-party runtime errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

// 2. Share-link restore runs through the minified encode/decode path.
{
  const probe = await openSite();
  await probe.page.waitForFunction(() => document.querySelector('#mod-typewriter .kt-playground[data-share-key]'), null, { timeout: 15000 });
  const shareKey = await probe.page.evaluate(() => document.querySelector('#mod-typewriter .kt-playground[data-share-key]')?.dataset.shareKey);
  await probe.context.close();
  const { context, page, errors } = await openSite(`?kt=${shareToken({ v: 2, demo: shareKey, options: { typewriter: { typeSpeed: 21 } } })}`);
  await page.waitForFunction(() => document.querySelector('#mod-typewriter [data-kt-typewriter]')?.getAttribute('data-kt-type-speed') === '21', null, { timeout: 15000 }).catch(() => {});
  const restored = await page.evaluate(() => document.querySelector('#mod-typewriter [data-kt-typewriter]')?.getAttribute('data-kt-type-speed'));
  ck('share link restores an option on the deployed site', restored === '21', `typeSpeed=${restored}`);
  ck('share restore raised no first-party runtime errors', errors.length === 0, errors.join(' | '));
  await context.close();
}

await browser.close();
server.close();
console.log(`\n===== SITE SMOKE: ${pass} passed, ${fail} failed =====`);
process.exit(fail ? 1 : 0);
