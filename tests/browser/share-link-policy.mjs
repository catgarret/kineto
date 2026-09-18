// Share-link security policy — a `?kt=` settings URL is untrusted input.
//
// The demo restores option VALUES from that URL. Fields the module renders as
// markup (tooltip content/html, cursor templates, toast icon, rolling items)
// and resource URLs pointing off-origin must never be applied from a link,
// otherwise anyone could craft a URL that executes script or fetches
// third-party assets in every visitor's browser. Benign fields in the same
// link must still restore, so the policy is targeted rather than a blanket
// drop of shared settings.
// Run: node tests/browser/share-link-policy.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.KT_CHROME || undefined;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.woff2': 'font/woff2' };
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
const DEMO = `http://localhost:${PORT}/demo/index.html`;

const browser = await chromium.launch({ headless: true, ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] });
let pass = 0; let fail = 0;
const ck = (name, condition, detail) => { console.log(`  [${condition ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`); condition ? pass++ : fail++; };

// Every page in this file records uncaught errors and the XSS canary the
// payloads below try to set. Neither may ever appear.
async function openDemo(query = '') {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(`${DEMO}${query}`, { waitUntil: 'load' });
  await page.waitForFunction(() => window.Kineto && window.KinetoPlayground && document.querySelector('#mod-tooltip .kt-playground[data-share-key]') && document.querySelector('#mod-cursor .kt-playground[data-share-key]'), null, { timeout: 20000 });
  return { context, page, pageErrors };
}

// 1. The policy itself, as exposed for QA.
const probe = await openDemo();
const policy = await probe.page.evaluate(() => {
  const check = window.KinetoPlayground.isShareableOption;
  return {
    tooltipHtml: check('tooltip', 'html', true),
    tooltipContent: check('tooltip', 'content', 'plain text'),
    tooltipPlacement: check('tooltip', 'placement', 'left'),
    cursorTemplate: check('cursor', 'template', '<b>x</b>'),
    cursorHoverTemplate: check('cursor', 'hoverTemplate', 'x'),
    toastIcon: check('toast', 'icon', '✓'),
    toastMessage: check('toast', 'message', 'hello'),
    rollingItems: check('overflowText', 'items', 'a|b'),
    externalSrc: check('cursor', 'src', 'https://evil.example/pixel.png'),
    protocolRelativeSrc: check('cursor', 'hoverSrc', '//evil.example/pixel.png'),
    javascriptSrc: check('cursor', 'clickImage', 'javascript:alert(1)'),
    relativeSrc: check('cursor', 'src', './assets/motion-demo.webp'),
    sameOriginAbsolute: check('cursor', 'clickSprite', `${location.origin}/demo/assets/motion-demo.webp`),
    emptySrc: check('cursor', 'src', ''),
    ambientExternal: check('ambientMedia', 'ambientSrc', 'https://evil.example/a.mp4'),
    ambientRelative: check('ambientMedia', 'ambientSrc', './assets/motion-demo.mp4'),
    numeric: check('cursor', 'dotSize', 9)
  };
});
ck('markup fields are never shareable', [policy.tooltipHtml, policy.tooltipContent, policy.cursorTemplate, policy.cursorHoverTemplate, policy.toastIcon, policy.rollingItems].every((value) => value === false), JSON.stringify(policy));
ck('plain text and numeric fields remain shareable', policy.tooltipPlacement === true && policy.toastMessage === true && policy.numeric === true);
ck('off-origin, protocol-relative and javascript: asset URLs are rejected', [policy.externalSrc, policy.protocolRelativeSrc, policy.javascriptSrc, policy.ambientExternal].every((value) => value === false));
ck('same-origin and empty asset URLs are accepted', [policy.relativeSrc, policy.sameOriginAbsolute, policy.emptySrc, policy.ambientRelative].every((value) => value === true));

const keys = await probe.page.evaluate(() => {
  const cursorCard = Array.from(document.querySelectorAll('#mod-cursor article.card')).find((card) => card.querySelector('[data-kt-cursor="custom"]'));
  return {
    tooltip: document.querySelector('#mod-tooltip .kt-playground[data-share-key]')?.dataset.shareKey,
    cursor: cursorCard?.querySelector('.kt-playground[data-share-key]')?.dataset.shareKey,
    authoredTemplate: cursorCard?.querySelector('[data-kt-cursor="custom"]')?.getAttribute('data-kt-template')
  };
});
ck('tooltip and custom cursor demos expose share keys', Boolean(keys.tooltip && keys.cursor && keys.authoredTemplate), JSON.stringify(keys));
ck('policy probe page raised no runtime errors', probe.pageErrors.length === 0, probe.pageErrors.join(' | '));
await probe.context.close();

// 2. A tooltip link carrying an HTML payload: the markup fields are ignored
//    while the benign placement in the same link is applied.
{
  const payload = { v: 2, demo: keys.tooltip, options: { tooltip: { html: true, content: '<img src="x" onerror="window.__ktShareXss = 1">', placement: 'left' } } };
  const { context, page, pageErrors } = await openDemo(`?kt=${shareToken(payload)}`);
  await page.waitForFunction(() => Array.from(document.querySelectorAll('#mod-tooltip [data-kt-tooltip]')).some((node) => node.getAttribute('data-kt-placement') === 'left'), null, { timeout: 15000 });
  await page.waitForTimeout(600);
  const result = await page.evaluate(() => {
    const targets = Array.from(document.querySelectorAll('#mod-tooltip [data-kt-tooltip]'));
    return {
      canary: window.__ktShareXss,
      placements: targets.map((node) => node.getAttribute('data-kt-placement')),
      contentAttributes: targets.filter((node) => node.hasAttribute('data-kt-content')).length,
      htmlTrue: targets.filter((node) => node.getAttribute('data-kt-html') === 'true').length,
      injectedImages: document.querySelectorAll('.kt-tooltip img[src="x"]').length
    };
  });
  ck('tooltip link: benign placement is restored', result.placements.every((value) => value === 'left'), JSON.stringify(result.placements));
  ck('tooltip link: html toggle is not restored from the URL', result.htmlTrue === 1, `${result.htmlTrue} target(s) with data-kt-html="true" (authored demo has exactly one)`);
  ck('tooltip link: markup content never reaches the DOM', result.contentAttributes === 0 && result.injectedImages === 0 && result.canary === undefined, JSON.stringify(result));
  ck('tooltip link: no runtime errors', pageErrors.length === 0, pageErrors.join(' | '));
  await context.close();
}

// 3. A cursor link mixing a template payload, an off-origin image URL, a
//    same-origin image URL, and a benign colour.
{
  const payload = { v: 2, demo: keys.cursor, options: { cursor: { template: '<img src="x" onerror="window.__ktShareXss = 2">', hoverTemplate: '<b>x</b>', src: 'https://evil.example/pixel.png', clickImage: './assets/motion-demo.webp', color: '#123456' } } };
  const { context, page, pageErrors } = await openDemo(`?kt=${shareToken(payload)}`);
  await page.waitForFunction(() => Array.from(document.querySelectorAll('#mod-cursor [data-kt-cursor="custom"]')).some((node) => node.getAttribute('data-kt-color') === '#123456'), null, { timeout: 15000 });
  await page.waitForTimeout(600);
  const result = await page.evaluate((authoredTemplate) => {
    const target = document.querySelector('#mod-cursor [data-kt-cursor="custom"]');
    return {
      canary: window.__ktShareXss,
      template: target?.getAttribute('data-kt-template'),
      templateUnchanged: target?.getAttribute('data-kt-template') === authoredTemplate,
      hoverTemplateUnchanged: !(target?.getAttribute('data-kt-hover-template') || '').includes('<b>x</b>'),
      src: target?.getAttribute('data-kt-src'),
      clickImage: target?.getAttribute('data-kt-click-image'),
      color: target?.getAttribute('data-kt-color'),
      injectedImages: document.querySelectorAll('.kt-cursor-single img[src="x"]').length
    };
  }, keys.authoredTemplate);
  ck('cursor link: authored templates survive a template payload', result.templateUnchanged && result.hoverTemplateUnchanged && result.injectedImages === 0 && result.canary === undefined, JSON.stringify(result));
  ck('cursor link: off-origin image URL is not applied', !result.src, `data-kt-src=${result.src}`);
  ck('cursor link: same-origin image URL and colour are applied', result.clickImage === './assets/motion-demo.webp' && result.color === '#123456', `clickImage=${result.clickImage} color=${result.color}`);
  ck('cursor link: no runtime errors', pageErrors.length === 0, pageErrors.join(' | '));
  await context.close();
}

await browser.close();
server.close();
console.log(`\n===== SHARE-LINK POLICY: ${pass} passed, ${fail} failed =====`);
process.exit(fail ? 1 : 0);
