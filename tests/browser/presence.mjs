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
    res.writeHead(200, {
      'content-type': req.url.endsWith('.js') ? 'text/javascript' : 'text/html',
      'access-control-allow-origin': '*'
    });
    res.end(body);
  });
});
await new Promise((resolve) => server.listen(0, resolve));
const port = server.address().port;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu'] });
try {
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><script src="http://localhost:${port}/dist/kineto.umd.js"></script><script type="module">import presence from 'http://localhost:${port}/dist/modular/presence.js'; window.KinetoPresence = presence;</script>`, { waitUntil: 'load' });
  await page.waitForFunction(() => Boolean(window.KinetoPresence));
  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const host = document.createElement('section');
    const child = document.createElement('button');
    child.textContent = 'focus';
    host.setAttribute('aria-hidden', 'false');
    host.style.cssText = 'color: red; pointer-events: auto';
    host.appendChild(child);
    document.body.appendChild(host);
    const states = window.Kineto.states({ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } });
    let safeCalls = 0;
    const presence = window.KinetoPresence(host, {
      enter: { state: states, name: 'visible' },
      exit: { state: states, name: 'hidden' },
      accessibility: 'managed',
      safeToRemove: () => { safeCalls += 1; }
    });
    const entered = await presence.enter({ duration: 1 });
    const afterEnter = {
      opacity: getComputedStyle(host).opacity,
      ariaHidden: host.getAttribute('aria-hidden'),
      inert: host.hasAttribute('inert'),
      pointerEvents: host.style.pointerEvents
    };
    child.focus();
    const focusSink = document.createElement('div');
    focusSink.tabIndex = -1;
    document.body.appendChild(focusSink);
    const left = await presence.leave({ duration: 1, focusTarget: focusSink });
    const afterLeave = {
      focusedSink: document.activeElement === focusSink,
      ariaHidden: host.getAttribute('aria-hidden'),
      inert: host.hasAttribute('inert'),
      pointerEvents: host.style.pointerEvents,
      safeCalls
    };
    presence.destroy();
    const restored = {
      ariaHidden: host.getAttribute('aria-hidden'),
      inert: host.hasAttribute('inert'),
      pointerEvents: host.style.pointerEvents,
      style: host.getAttribute('style')
    };

    const reentryHost = document.createElement('div');
    document.body.appendChild(reentryHost);
    const reentry = window.KinetoPresence(reentryHost);
    const leaving = reentry.leave({ duration: 80 });
    const entering = reentry.enter();
    const reentryResults = { leaving: await leaving, entering: await entering };
    reentry.destroy();

    const waitHost = document.createElement('div');
    document.body.appendChild(waitHost);
    const waiting = window.KinetoPresence(waitHost, { mode: 'wait' });
    const waitingLeave = waiting.leave({ duration: 30 });
    const waitingEnter = waiting.enter();
    const waitingEnterLatest = waiting.enter();
    const waitResults = {
      leave: await waitingLeave,
      enter: await waitingEnter,
      latestEnter: await waitingEnterLatest
    };
    waiting.destroy();

    const destroyHost = document.createElement('div');
    document.body.appendChild(destroyHost);
    const doomed = window.KinetoPresence(destroyHost);
    const doomedLeave = doomed.leave({ duration: 200 });
    doomed.destroy();
    const destroyResult = await doomedLeave;
    return { entered, afterEnter, left, afterLeave, restored, reentryResults, waitResults, destroyResult, status: doomed.status };
  });
  assert.deepEqual(result.entered, { status: 'finished' });
  assert.equal(result.afterEnter.opacity, '1');
  assert.equal(result.afterEnter.ariaHidden, 'false');
  assert.equal(result.afterEnter.inert, false);
  assert.equal(result.afterEnter.pointerEvents, 'auto');
  assert.deepEqual(result.left, { status: 'finished' });
  assert.equal(result.afterLeave.focusedSink, true);
  assert.equal(result.afterLeave.ariaHidden, 'true');
  assert.equal(result.afterLeave.inert, true);
  assert.equal(result.afterLeave.pointerEvents, 'none');
  assert.equal(result.afterLeave.safeCalls, 1);
  assert.equal(result.restored.ariaHidden, 'false');
  assert.equal(result.restored.inert, false);
  assert.equal(result.restored.pointerEvents, 'auto');
  assert.deepEqual(result.reentryResults.leaving, { status: 'cancelled', reason: 'reenter' });
  assert.deepEqual(result.reentryResults.entering, { status: 'finished' });
  assert.deepEqual(result.waitResults.leave, { status: 'finished' });
  assert.deepEqual(result.waitResults.enter, { status: 'cancelled', reason: 'reenter' });
  assert.deepEqual(result.waitResults.latestEnter, { status: 'finished' });
  assert.deepEqual(result.destroyResult, { status: 'cancelled', reason: 'destroy' });
  assert.equal(result.status, 'destroyed');
  console.log('Presence browser QA OK', JSON.stringify(result));

  const reducedContext = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.setContent(`<!doctype html><script src="http://localhost:${port}/dist/kineto.umd.js"></script><script type="module">import presence from 'http://localhost:${port}/dist/modular/presence.js'; window.KinetoPresence = presence;</script>`, { waitUntil: 'load' });
  await reducedPage.waitForFunction(() => Boolean(window.KinetoPresence));
  const reduced = await reducedPage.evaluate(async () => {
    const el = document.createElement('div'); document.body.appendChild(el);
    const controller = window.KinetoPresence(el);
    const start = performance.now();
    const result = await controller.leave({ duration: 500 });
    return { result, elapsed: performance.now() - start };
  });
  assert.deepEqual(reduced.result, { status: 'skipped' });
  assert.ok(reduced.elapsed < 120, `reduced motion should skip duration: ${JSON.stringify(reduced)}`);
  await reducedContext.close();
} finally {
  await browser.close();
  server.close();
}
