// Real-browser proof that the demo's LEFT NAV order == RIGHT CONTENT order.
// Serves demo/ (with the actual built bundle) and reads both sides from the
// live DOM after the page's own scripts run. Run: node tests/nav-parity-browser.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = fs.readdirSync(path.join(root, 'src/modules')).filter((f) => f.endsWith('.js')).length;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/demo/index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({
  headless: true,
  ...(process.env.MK_CHROMIUM ? { executablePath: process.env.MK_CHROMIUM } : {}),
  args: ['--no-sandbox']
});
const page = await browser.newPage();
await page.goto(`http://localhost:${port}/demo/index.html`, { waitUntil: 'load' });
await page.waitForSelector('#side-nav-modules .nav-mod', { timeout: 15000 });
await page.waitForSelector('main [data-module-block]', { timeout: 15000 });

const data = await page.evaluate(() => ({
  left: [...document.querySelectorAll('#side-nav-modules .nav-mod')].map((a) => a.dataset.module),
  right: [...document.querySelectorAll('main [data-module-block]')].map((el) => el.dataset.moduleBlock),
  registry: Object.keys(window.Kineto.registry).length,
  hrefIds: [...document.querySelectorAll('#side-nav-modules .nav-mod')].map((a) => {
    const id = (a.getAttribute('href') || '').slice(1);
    return { module: a.dataset.module, href: a.getAttribute('href'), idCount: document.querySelectorAll('[id="' + id + '"]').length,
      label: a.textContent.trim(), title: document.getElementById(id)?.querySelector('.module-block-title')?.textContent.trim(),
      sub: document.getElementById(id)?.querySelector('.module-block-sub')?.textContent.trim() };
  }),
}));
await browser.close();
server.close();

const arrEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const fails = [];
if (!arrEq(data.left, data.right)) fails.push('left !== right');
if (new Set(data.left).size !== data.left.length) fails.push('duplicate nav module');
if (data.left.length !== data.registry) fails.push(`nav ${data.left.length} !== registry ${data.registry}`);
if (data.registry !== REGISTRY) fails.push(`registry ${data.registry} !== module files ${REGISTRY}`);
data.hrefIds.forEach((h) => {
  if (h.href !== `#mod-${h.module}`) fails.push(`bad href ${h.href}`);
  if (h.idCount !== 1) fails.push(`href ${h.href} -> ${h.idCount} ids`);
  if (h.label !== h.title) fails.push(`label "${h.label}" !== title "${h.title}"`);
  if (!h.sub) fails.push(`${h.module} block has no subtitle`);
});

console.log('BROWSER LEFT :', JSON.stringify(data.left));
console.log('BROWSER RIGHT:', JSON.stringify(data.right));
console.log('equal:', arrEq(data.left, data.right), '| nav:', data.left.length, '| registry:', data.registry);
if (fails.length) { console.error('\nFAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('\nBROWSER nav-parity OK — real Chromium, left order == right order, ' + data.left.length + ' modules.');
