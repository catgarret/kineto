// Direct-source Wave timing/lifecycle checks plus real browser input and SVG motion.
// KT_BROWSER=chromium|firefox|webkit node tests/glitch-wave-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    response.writeHead(error ? 404 : 200, { 'content-type': 'text/javascript', 'access-control-allow-origin': '*' });
    response.end(error ? '' : body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;

try {
  browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setContent('<!doctype html><body><main></main></body>');
  const timing = await page.evaluate(async (base) => {
    const module = (await import(`${base}/src/modules/glitch.js`)).default;
    const originalSet = window.setTimeout;
    const originalClear = window.clearTimeout;
    const originalNow = window.performance.now;
    let now = 0;
    let serial = 0;
    let hidden = false;
    const pending = new Map();
    const failures = [];
    let checks = 0;
    const check = (condition, message) => { checks += 1; if (!condition) failures.push(message); };
    window.setTimeout = (callback, ms) => {
      const id = ++serial;
      pending.set(id, { callback, at: now + Math.max(0, Number(ms) || 0) });
      return id;
    };
    window.clearTimeout = (id) => pending.delete(id);
    window.performance.now = () => now;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    const advance = (milliseconds) => {
      const end = now + milliseconds;
      for (let step = 0; step < 10000; step += 1) {
        const next = [...pending].filter(([, entry]) => entry.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) { now = end; return; }
        const [id, entry] = next;
        pending.delete(id);
        now = entry.at;
        entry.callback();
      }
      throw new Error('Wave scheduled an unbounded timer loop');
    };
    const visibility = (value) => {
      hidden = value;
      document.dispatchEvent(new window.Event('visibilitychange'));
    };
    const make = (options = {}) => {
      const el = document.createElement('div');
      el.innerHTML = 'Signal<br><strong>intact</strong>';
      el.style.setProperty('filter', 'contrast(1.2)', 'important');
      document.querySelector('main').append(el);
      const children = [...el.childNodes];
      const instance = module.create(el, { preset: 'wave', ...options });
      const turbulence = [...document.querySelectorAll('feTurbulence')].at(-1);
      const record = { el, instance, turbulence, writes: 0, children };
      const setAttribute = turbulence.setAttribute.bind(turbulence);
      turbulence.setAttribute = (name, value) => { if (name === 'baseFrequency') record.writes += 1; setAttribute(name, value); };
      record.active = () => el.style.filter.includes('url(');
      record.value = () => turbulence.getAttribute('baseFrequency');
      record.destroy = () => {
        instance.destroy();
        check(pending.size === 0, 'destroy clears every Wave timer');
        check(!document.querySelector('filter[id^="kt-glitch-wave-"]'), 'destroy removes its SVG definition');
        check(el.style.filter === 'contrast(1.2)' && el.style.getPropertyPriority('filter') === 'important', 'destroy restores original filter and priority');
        check(children.every((child, index) => el.childNodes[index] === child), 'Wave keeps authored child identity');
        el.remove();
      };
      return record;
    };
    try {
      const continuous = make();
      check(continuous.active() && pending.size === 1, 'default starts continuously with one clock');
      advance(420);
      check(continuous.writes === 10, 'default makes at most one changed SVG write per 42ms tick');
      check(continuous.value() === '0.0008 0.0315', 'default preserves the 2.6s triangle sweep');
      advance(2604);
      check(continuous.active() && pending.size === 1, 'default continues after a complete historical cycle');
      const frozen = continuous.value();
      continuous.instance.pause();
      continuous.instance.pause();
      advance(882);
      check(continuous.value() === frozen && pending.size === 0, 'repeated pause holds phase with no timer');
      continuous.instance.resume();
      continuous.instance.resume();
      check(continuous.value() === frozen && pending.size === 1, 'resume preserves phase and is idempotent');
      advance(42);
      check(continuous.value() !== frozen, 'resumed clock advances');
      visibility(true);
      const hiddenWrites = continuous.writes;
      advance(2000);
      check(continuous.writes === hiddenWrites && pending.size === 0, 'hidden document produces zero SVG writes or timers');
      continuous.instance.pause();
      visibility(false);
      advance(420);
      check(continuous.writes === hiddenWrites && pending.size === 0, 'visibility recovery never overrides manual pause');
      continuous.instance.resume();
      advance(42);
      check(continuous.writes > hiddenWrites, 'manual resume after visibility recovery works');
      continuous.el.style.opacity = '.37';
      const staleCallback = [...pending.values()][0].callback;
      continuous.destroy();
      continuous.instance.resume();
      continuous.instance.replay();
      continuous.instance.pause();
      continuous.instance.destroy();
      staleCallback();
      visibility(true);
      visibility(false);
      check(pending.size === 0, 'destroyed methods and stale callbacks cannot resurrect a clock');
      check(continuous.el.style.opacity === '0.37', 'destroy preserves unrelated consumer styles');

      const finite = make({ loop: false, duration: .126, delay: .2 });
      check(!finite.active(), 'delay leaves the original filter untouched');
      advance(100);
      finite.instance.pause();
      advance(1000);
      finite.instance.resume();
      advance(99);
      check(!finite.active(), 'pause preserves the remaining initial delay');
      advance(1);
      check(finite.active(), 'delay expires at its remaining deadline');
      advance(126);
      check(!finite.active() && pending.size === 0, 'loop:false completes one configured cycle and restores clean content');
      finite.instance.resume();
      check(!finite.active() && pending.size === 0, 'resume cannot restart an already completed cycle');
      finite.instance.replay();
      check(finite.active() && pending.size === 1, 'replay restarts a completed one-shot immediately');
      advance(126);
      check(!finite.active() && pending.size === 0, 'replay also respects one-shot completion');
      finite.destroy();

      const configured = make({ loop: false, duration: 1, speed: 2, frequency: 2, seed: 91, channelOffset: 12, intensity: 1.5 });
      check(configured.turbulence.getAttribute('seed') === '91', 'seed controls the SVG noise pattern');
      check(document.querySelector('feDisplacementMap').getAttribute('scale') === '18', 'channelOffset and intensity control distortion together');
      advance(252);
      check(!configured.active() && pending.size === 0, 'explicit duration combines with speed and frequency');
      configured.destroy();

      const legacyDelay = make({ delay: 80 });
      advance(79);
      check(!legacyDelay.active(), 'legacy millisecond delay remains pending');
      advance(1);
      check(legacyDelay.active(), 'delay above ten retains legacy millisecond units');
      legacyDelay.destroy();

      const hover = make({ trigger: 'hover', delay: .2 });
      check(!hover.active() && pending.size === 0, 'hover never auto-starts');
      hover.el.dispatchEvent(new window.Event('pointerenter'));
      advance(100);
      hover.el.dispatchEvent(new window.Event('pointerleave'));
      advance(1000);
      check(!hover.active() && pending.size === 0, 'hover leave cancels a pending initial delay');
      hover.el.dispatchEvent(new window.Event('pointerenter'));
      advance(200);
      check(hover.active(), 'hover re-entry can start again');
      hover.el.dispatchEvent(new window.Event('pointerleave'));
      check(!hover.active() && pending.size === 0, 'hover leave removes distortion and clock');
      hover.destroy();

      visibility(true);
      const hiddenStart = make({ delay: .1 });
      check(!hiddenStart.active() && pending.size === 0, 'hidden creation does not schedule work');
      advance(500);
      visibility(false);
      advance(99);
      check(!hiddenStart.active(), 'hidden time does not consume initial delay');
      advance(43);
      check(hiddenStart.active() && hiddenStart.writes > 0, 'visible creation recovery advances after its delay');
      hiddenStart.destroy();

      const stable = make({ randomness: 0 });
      const stableValue = stable.value();
      advance(420);
      check(stable.value() === stableValue && stable.writes === 0, 'randomness:0 keeps a stable midpoint without redundant SVG writes');
      stable.destroy();
      const delayedDestroy = make({ delay: 2 });
      delayedDestroy.destroy();
      advance(3000);
      check(pending.size === 0, 'destroy cancels delayed creation');
    } finally {
      window.setTimeout = originalSet;
      window.clearTimeout = originalClear;
      window.performance.now = originalNow;
      delete document.hidden;
    }
    return { failures, checks };
  }, origin);
  assert.deepEqual(timing.failures, [], `Wave timing/lifecycle failures (${browserName})`);

  // Native events, IntersectionObserver and timer scheduling, not the fake clock.
  await page.setContent('<!doctype html><style>body{margin:0;min-height:3600px}#target{margin-top:2000px;width:240px;height:120px;background:#ace}</style><div id="target">Actual<br>SVG motion</div>');
  await page.evaluate(async (base) => {
    const module = (await import(`${base}/src/modules/glitch.js`)).default;
    const target = document.getElementById('target');
    const instance = module.create(target, { preset: 'wave', trigger: 'scroll', duration: .4 });
    window.__wave = { module, target, instance };
  }, origin);
  assert.equal(await page.locator('#target').evaluate((el) => el.style.filter), '', 'offscreen scroll trigger remains clean');
  await page.locator('#target').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.getElementById('target').style.filter.includes('url('));
  const first = await page.locator('feTurbulence').getAttribute('baseFrequency');
  await page.waitForFunction((value) => document.querySelector('feTurbulence').getAttribute('baseFrequency') !== value, first);
  assert.ok(await page.locator('#target').evaluate((el) => window.getComputedStyle(el).filter.includes('url(') && el.getBoundingClientRect().height > 0), 'visible content uses an actual SVG filter');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => !document.getElementById('target').style.filter);
  await page.locator('#target').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.getElementById('target').style.filter.includes('url('));
  await page.evaluate(() => {
    const { module, target, instance } = window.__wave;
    instance.destroy();
    window.__wave.instance = module.create(target, { preset: 'wave', trigger: 'hover', loop: false, duration: .126 });
  });
  await page.mouse.move(700, 10);
  assert.equal(await page.locator('#target').evaluate((el) => el.style.filter), '', 'real hover trigger starts clean');
  await page.locator('#target').hover();
  await page.waitForFunction(() => document.getElementById('target').style.filter.includes('url('));
  await page.waitForFunction(() => !document.getElementById('target').style.filter);
  await page.mouse.move(700, 10);
  await page.locator('#target').hover();
  await page.waitForFunction(() => document.getElementById('target').style.filter.includes('url('));
  await page.evaluate(() => window.__wave.instance.destroy());
  assert.equal(await page.locator('filter[id^="kt-glitch-wave-"]').count(), 0);

  const reduced = await page.evaluate(async (base) => {
    const core = (await import(`${base}/src/core.js`)).default;
    const { module, target } = window.__wave;
    core.register('glitch', module);
    core.setReducedMotion('always');
    const instance = core.create('glitch', target, { preset: 'wave', loop: true });
    const clean = target.style.filter === '' && !document.querySelector('feTurbulence');
    instance.pause();
    instance.resume();
    core.destroyModule(target, 'glitch');
    return { clean, instances: core.instanceCount };
  }, origin);
  assert.deepEqual(reduced, { clean: true, instances: 0 }, 'reduced motion creates no SVG animation and cleans up');
  assert.deepEqual(errors, [], 'no browser runtime errors');
  console.log(`Glitch Wave OK (${browserName}): ${timing.checks} deterministic checks; real hover/scroll/re-entry, SVG motion, reduced motion and cleanup.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
