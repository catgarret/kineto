import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': req.url.endsWith('.js') ? 'text/javascript' : 'text/html' });
    res.end(body);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><script src="http://localhost:${port}/dist/kineto.umd.js"></script>`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.Kineto?.states));
  const result = await page.evaluate(async () => {
    const host = document.createElement('div');
    const child = document.createElement('div');
    child.className = 'child';
    child.setAttribute('data-kt-state', 'visible');
    host.style.cssText = 'color: red';
    host.appendChild(child);
    document.body.appendChild(host);
    const states = window.Kineto.states({
      hidden: { opacity: 0, y: 16, blur: 4 },
      visible: { opacity: 1, y: 0, blur: 0 }
    });
    const first = await states.apply(host, 'visible', { initial: 'hidden', children: '.child', duration: 24, stagger: 4 });
    const during = { opacity: getComputedStyle(host).opacity, transform: getComputedStyle(host).transform, filter: getComputedStyle(host).filter };
    const pending = states.apply(host, 'hidden', { duration: 500 });
    pending.cancel();
    const cancelled = await pending;
    await states.scan(document, { duration: 1 });
    const replay = await states.replay(host, 'visible', { duration: 1 });
    const beforeDestroy = host.getAttribute('style');
    states.destroy();
    return { first, during, cancelled, replay, beforeDestroy, afterDestroy: host.getAttribute('style') };
  });
  assert.deepEqual(result.first, { status: 'finished' });
  assert.equal(result.during.opacity, '1');
  assert.notEqual(result.during.transform, 'none');
  assert.match(result.during.filter, /blur/);
  assert.deepEqual(result.cancelled, { status: 'cancelled' });
  assert.deepEqual(result.replay, { status: 'finished' });
  assert.equal(result.afterDestroy, 'color: red;');
  console.log('Motion States browser QA OK', JSON.stringify(result));

  const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.setContent(`<!doctype html><script src="http://localhost:${port}/dist/kineto.umd.js"></script>`, { waitUntil: 'load' });
  await reducedPage.waitForFunction(() => Boolean(window.Kineto?.states));
  const reduced = await reducedPage.evaluate(async () => {
    const el = document.createElement('div'); document.body.appendChild(el);
    const states = window.Kineto.states({ hidden: { opacity: 0 }, visible: { opacity: 1 } });
    const start = performance.now();
    const result = await states.apply(el, 'visible', { duration: 500 });
    return { result, elapsed: performance.now() - start, animations: el.getAnimations().length, opacity: getComputedStyle(el).opacity };
  });
  assert.deepEqual(reduced.result, { status: 'finished' });
  assert.ok(reduced.elapsed < 120, `reduced motion should skip duration: ${JSON.stringify(reduced)}`);
  assert.equal(reduced.animations, 0);
  assert.equal(reduced.opacity, '1');
  await reducedContext.close();
} finally {
  await browser.close();
  server.close();
}
