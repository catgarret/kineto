// Actual rendered-state and lifecycle checks, not a claim of pixel/visual parity.
// Run after installing Playwright: KT_BROWSER=chromium|firefox|webkit node tests/reveal-variant-browser.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const variants = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'))
  .modules.find((entry) => entry.name === 'reveal').variants;
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, body) => {
    response.writeHead(error ? 404 : 200, { 'content-type': 'text/javascript', 'access-control-allow-origin': '*' });
    response.end(error ? '' : body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const near = (actual, expected, tolerance = 0.6) => Math.abs(actual - expected) <= tolerance;

try {
  browser = await browserType.launch({
    headless: true,
    ...(browserName === 'chromium' ? {
      ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
      args: ['--no-sandbox', '--disable-gpu']
    } : {})
  });
  for (const engine of ['native', 'gsap']) {
    const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setContent(`<!doctype html><html><head><style>
      body { margin: 0; }
      #fixtures { position: absolute; top: 1600px; display: grid; grid-template-columns: repeat(5, 140px); gap: 20px; }
      .probe { width: 140px; height: 66px; box-sizing: border-box; font: 14px/22px sans-serif; }
      .designer { opacity: .2; transform: translateX(-16px); }
      .designer.is-entered { opacity: 1; transform: none; }
    </style></head><body><main id="fixtures"></main></body></html>`);
    if (engine === 'gsap') {
      await page.addScriptTag({ url: `${origin}/node_modules/gsap/dist/gsap.min.js` });
      await page.addScriptTag({ url: `${origin}/node_modules/gsap/dist/ScrollTrigger.min.js` });
    }
    await page.evaluate(async ({ origin: base, variants: names }) => {
      const [{ default: core }, { default: reveal }] = await Promise.all([
        import(`${base}/src/core.js`), import(`${base}/src/modules/reveal.js`)
      ]);
      core.register('reveal', reveal);
      core.config({ performance: 'high' });
      if (window.gsap) core.setAnimationEngine({ gsap: window.gsap, ScrollTrigger: window.ScrollTrigger });
      window.__revealTest = { core, names, records: [] };
      window.__revealTest.read = (element) => {
        const style = window.getComputedStyle(element);
        const matrix = new window.DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
        return {
          opacity: Number(style.opacity), matrix: [matrix.m11, matrix.m12, matrix.m21, matrix.m22, matrix.m41, matrix.m42],
          transform: style.transform, filter: style.filter, clip: style.clipPath,
          mask: style.maskImage || style.webkitMaskImage, origin: style.transformOrigin,
          className: element.className, style: element.getAttribute('style'), text: element.textContent,
          html: element.innerHTML, height: element.getBoundingClientRect().height
        };
      };
      for (const preset of names) {
        const element = document.createElement('div');
        element.className = `probe${preset === 'class' ? ' designer' : ''}`;
        element.setAttribute('style', 'color: rgb(3, 4, 5); white-space: pre-wrap');
        element.innerHTML = 'First<br><strong>Second</strong>\nThird';
        document.querySelector('#fixtures').append(element);
        const snapshot = { style: element.getAttribute('style'), className: element.className, html: element.innerHTML };
        const children = Array.from(element.childNodes);
        const record = { preset, element, snapshot, children, completed: 0 };
        record.instance = core.create('reveal', element, {
          preset, duration: .22, ease: 'linear', enterClass: 'is-entered',
          onComplete: () => { record.completed += 1; }
        });
        window.__revealTest.records.push(record);
      }
    }, { origin, variants });
    const initial = await page.evaluate(() => window.__revealTest.records.map(({ preset, element, instance }) => ({
      preset, created: Boolean(instance), ...window.__revealTest.read(element)
    })));
    const byPreset = Object.fromEntries(initial.map((state) => [state.preset, state]));
    const expectedPositions = {
      fade: [0, 0], 'fade-up': [0, 40], 'fade-down': [0, -40],
      'fade-left': [-40, 0], 'fade-right': [40, 0],
      'slide-up': [0, 66], 'slide-down': [0, -66],
      'slide-left': [-140, 0], 'slide-right': [140, 0],
      'zoom-in': [0, 0], 'zoom-out': [0, 0], blur: [0, 0],
      rise: [0, 72], soft: [0, 24], rotate: [0, 0], swing: [-28, 0], skew: [0, 28]
    };
    for (const state of initial) {
      const label = `${engine}/${state.preset}`;
      check(state.created, `${label}: must create`);
      check(state.html === 'First<br><strong>Second</strong>\nThird', `${label}: must retain BR, newline and inline markup`);
      if (expectedPositions[state.preset]) {
        const [x, y] = expectedPositions[state.preset];
        check(near(state.matrix[4], x) && near(state.matrix[5], y), `${label}: initial translation should be ${x},${y}, received ${state.transform}`);
      }
      if (!['mask', 'wipe', 'clock', 'class'].includes(state.preset)) check(state.opacity === 0, `${label}: initial opacity should be 0`);
    }
    check(near(byPreset['zoom-in'].matrix[0], .78, .01), `${engine}/zoom-in: must begin scaled down`);
    check(near(byPreset['zoom-out'].matrix[0], 1.16, .01), `${engine}/zoom-out: must begin scaled up`);
    check(byPreset.blur.filter === 'blur(20px)' && byPreset.soft.filter === 'blur(8px)', `${engine}: blur and soft must have different rendered blur strength`);
    check(byPreset['flip-x'].transform.startsWith('matrix3d(') && byPreset['flip-y'].transform.startsWith('matrix3d(')
      && byPreset['flip-x'].transform !== byPreset['flip-y'].transform, `${engine}: flips must render different 3D axes`);
    check(near(byPreset.skew.matrix[1], Math.tan(7 * Math.PI / 180), .001), `${engine}/skew: must render a shear`);
    check(byPreset.swing.origin.startsWith('0px 0px'), `${engine}/swing: must hinge at the top-left corner`);
    if (engine === 'gsap') check(byPreset.mask.clip !== byPreset.wipe.clip && byPreset.mask.clip !== 'none' && byPreset.wipe.clip !== 'none', `${engine}: default mask and wipe must expose different horizontal/vertical clips`);
    else check(byPreset.mask.opacity === 0 && byPreset.wipe.opacity === 0, 'native: pending clip entrances must remain hidden while awaiting viewport entry');
    check(byPreset.clock.mask.includes('conic-gradient'), `${engine}/clock: must start with a conic mask`);

    // A real layout change brings the targets into view. This exercises the
    // native IntersectionObserver and ScrollTrigger/IO backup entrance paths.
    await page.evaluate(() => {
      document.querySelector('#fixtures').style.top = '24px';
      window.ScrollTrigger?.refresh();
    });
    // Sample actual intermediate values via RAF; a jump from hidden to final
    // state must not satisfy these transition checks.
    const samples = await page.evaluate(async () => {
      const { records, read } = window.__revealTest;
      const seen = new Set();
      const clips = {};
      const premature = new Set();
      const until = window.performance.now() + 450;
      while (window.performance.now() < until) {
        for (const { preset, element, completed } of records) {
          const current = read(element);
          if (preset === 'class') continue;
          if (preset === 'clock' ? current.mask.includes('conic-gradient') && !current.mask.includes('0deg, transparent 0deg')
            : ['mask', 'wipe'].includes(preset) ? current.clip !== 'none' && /[1-9]/.test(current.clip) && !current.clip.includes('100%')
              : current.opacity > .02 && current.opacity < .98) seen.add(preset);
          if (['mask', 'wipe'].includes(preset) && current.clip !== 'none' && /[1-9]/.test(current.clip)) clips[preset] ||= current.clip;
          if (!['class', 'clock', 'mask', 'wipe'].includes(preset) && current.opacity > .02 && current.opacity < .9 && completed) premature.add(preset);
        }
        await new Promise(window.requestAnimationFrame);
      }
      return { seen: [...seen], clips, premature: [...premature] };
    });
    for (const preset of variants.filter((name) => name !== 'class')) check(samples.seen.includes(preset), `${engine}/${preset}: must render intermediate frames`);
    check(samples.clips.mask && samples.clips.wipe && samples.clips.mask !== samples.clips.wipe,
      `${engine}: mask and wipe must animate different horizontal/vertical clip apertures`);
    check(samples.premature.length === 0, `${engine}: onComplete must not fire when an entrance is still visibly in progress (${samples.premature.join(', ')})`);
    const finished = await page.evaluate(() => window.__revealTest.records.map(({ preset, element, completed, children }) => ({
      preset, completed, sameNodes: children.every((node, index) => node === element.childNodes[index]), ...window.__revealTest.read(element)
    })));
    for (const state of finished) {
      const label = `${engine}/${state.preset}`;
      check(state.opacity === 1, `${label}: must finish fully visible`);
      check(state.sameNodes && state.html === 'First<br><strong>Second</strong>\nThird', `${label}: must retain authored DOM identity`);
      check(near(state.matrix[0], 1, .002) && near(state.matrix[3], 1, .002)
        && [state.matrix[1], state.matrix[2], state.matrix[4], state.matrix[5]].every((value) => near(value, 0, .002)), `${label}: must finish without shear, scale or displacement (${state.transform})`);
      if (state.preset !== 'class') check(state.completed === 1, `${label}: completion must fire once per entrance`);
    }
    if (engine === 'gsap') {
      await page.evaluate(() => window.__revealTest.records.find(({ preset }) => preset === 'fade-up').instance.replay());
      await page.waitForTimeout(60);
      const paused = await page.evaluate(() => {
        const record = window.__revealTest.records.find(({ preset }) => preset === 'fade-up');
        record.instance.pause();
        return window.__revealTest.read(record.element);
      });
      await page.waitForTimeout(100);
      const held = await page.evaluate(() => {
        const record = window.__revealTest.records.find(({ preset }) => preset === 'fade-up');
        const state = window.__revealTest.read(record.element);
        record.instance.resume();
        return state;
      });
      check(paused.opacity > 0 && paused.opacity < 1 && paused.opacity === held.opacity
        && paused.transform === held.transform, 'gsap/fade-up: pause must hold the active replay tween');
      await page.waitForTimeout(300);
      const resumed = await page.evaluate(() => {
        const record = window.__revealTest.records.find(({ preset }) => preset === 'fade-up');
        return { completed: record.completed, opacity: window.getComputedStyle(record.element).opacity };
      });
      check(resumed.completed === 2 && resumed.opacity === '1', 'gsap/fade-up: resume must finish the paused replay once');
    }
    // Replay first, then destroy while work is still queued/running. Inspect
    // after the original duration so stale RAFs/tweens cannot hide behind an
    // immediate restoration assertion.
    await page.evaluate(() => {
      window.__revealTest.records.forEach((record) => { record.beforeDestroy = record.completed; });
      window.__revealTest.records.forEach(({ instance }) => instance.replay());
      window.__revealTest.records.forEach(({ instance }) => instance.destroy());
    });
    await page.waitForTimeout(400);
    const restored = await page.evaluate(() => ({
      states: window.__revealTest.records.map(({ preset, element, snapshot, children, completed, beforeDestroy }) => ({
        preset, snapshot, current: { style: element.getAttribute('style'), className: element.className, html: element.innerHTML },
        completed, beforeDestroy,
        sameNodes: children.every((node, index) => node === element.childNodes[index])
      })),
      instances: window.__revealTest.core.instanceCount,
      triggers: window.ScrollTrigger?.getAll().length || 0
    }));
    for (const state of restored.states) {
      check(JSON.stringify(state.current) === JSON.stringify(state.snapshot) && state.sameNodes,
        `${engine}/${state.preset}: replay followed by destroy must restore and retain authored DOM/styles (${JSON.stringify(state.current)})`);
      check(state.completed === state.beforeDestroy, `${engine}/${state.preset}: destroy must cancel pending completion callbacks`);
    }
    check(restored.instances === 0 && restored.triggers === 0, `${engine}: destroy must remove all records and scroll triggers`);

    const reduced = await page.evaluate(() => {
      const { core, records, read } = window.__revealTest;
      core.setReducedMotion('always');
      return records.map(({ preset, element, snapshot }) => {
        const authored = element.style.cssText;
        const instance = core.create('reveal', element, { preset });
        const state = read(element);
        instance.destroy();
        return { preset, state, restored: element.style.cssText === authored && element.className === snapshot.className };
      });
    });
    for (const state of reduced) {
      check(state.state.opacity === 1 && state.state.transform === 'none' && state.state.clip === 'none', `${engine}/${state.preset}: reduced motion must expose a static final state`);
      check(state.restored, `${engine}/${state.preset}: reduced destroy must restore authored styles`);
    }
    const staggered = await page.evaluate(async () => {
      const { core } = window.__revealTest;
      core.setReducedMotion('never');
      const records = [];
      for (const preset of ['fade-up', 'mask', 'clock']) {
        for (const count of [1, 3]) {
          const element = document.createElement('div');
          element.className = 'authored-root';
          element.style.cssText = 'color: rgb(8, 9, 10); position: fixed; top: 24px';
          element.innerHTML = Array.from({ length: count }, (_, index) => `<span class="authored-child" style="display:block">${index}</span>`).join('');
          document.body.append(element);
          const original = element.outerHTML;
          const instance = core.create('reveal', element, { preset, stagger: .02, duration: .08 });
          instance.replay();
          records.push({ preset, count, element, original, instance });
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      records.forEach(({ instance }) => instance.destroy());
      await new Promise((resolve) => setTimeout(resolve, 150));
      return records.map(({ preset, count, element, original }) => {
        const restored = element.outerHTML === original;
        element.remove();
        return { preset, count, restored };
      });
    });
    for (const state of staggered) check(state.restored, `${engine}/${state.preset}: stagger with ${state.count} child nodes must restore the parent and children`);
    const delayed = await page.evaluate(async () => {
      const { core } = window.__revealTest;
      const element = document.createElement('div');
      element.className = 'probe';
      element.style.cssText = 'position: fixed; top: 40px';
      element.textContent = 'Delayed entrance';
      document.body.append(element);
      let completed = 0;
      const instance = core.create('reveal', element, {
        preset: 'fade', delay: .2, duration: .12, onComplete: () => { completed += 1; }
      });
      window.ScrollTrigger?.refresh();
      await new Promise((resolve) => setTimeout(resolve, 90));
      const before = { opacity: window.getComputedStyle(element).opacity, completed };
      await new Promise((resolve) => setTimeout(resolve, 330));
      const after = { opacity: window.getComputedStyle(element).opacity, completed };
      instance.destroy();
      element.remove();
      return { before, after, instances: core.instanceCount, triggers: window.ScrollTrigger?.getAll().length || 0 };
    });
    check(delayed.before.opacity === '0' && delayed.before.completed === 0, `${engine}: configured delay must keep the entrance pending`);
    check(delayed.after.opacity === '1' && delayed.after.completed === 1, `${engine}: delayed entrance must settle and complete once`);
    check(delayed.instances === 0 && delayed.triggers === 0, `${engine}: all follow-up fixtures must release records and triggers`);
    if (engine === 'gsap') {
      const repeating = await page.evaluate(async () => {
        const { core } = window.__revealTest;
        const observer = window.IntersectionObserver;
        window.IntersectionObserver = undefined;
        document.body.style.minHeight = '3000px';
        window.scrollTo(0, 0);
        const element = document.createElement('div');
        element.className = 'probe';
        element.style.cssText = 'position: absolute; top: 1000px; color: rgb(10, 20, 30)';
        element.textContent = 'Repeatable reveal';
        document.body.append(element);
        const original = element.outerHTML;
        const events = { enter: 0, leave: 0, enterBack: 0, leaveBack: 0 };
        const instance = core.create('reveal', element, {
          preset: 'fade-up', once: false, duration: .12, start: 'top center', end: 'bottom top',
          onEnter: () => { events.enter += 1; }, onLeave: () => { events.leave += 1; },
          onEnterBack: () => { events.enterBack += 1; }, onLeaveBack: () => { events.leaveBack += 1; }
        });
        window.ScrollTrigger.refresh();
        const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
        const state = () => ({ opacity: Number(window.getComputedStyle(element).opacity), events: { ...events }, triggers: window.ScrollTrigger.getAll().length });
        window.scrollTo(0, 800);
        await wait();
        const entered = state();
        instance.replay();
        await wait();
        const replayed = state();
        window.scrollTo(0, 1300);
        await wait();
        const left = state();
        window.scrollTo(0, 800);
        await wait();
        const enteredBack = state();
        window.scrollTo(0, 0);
        await wait();
        const leftBack = state();
        window.scrollTo(0, 800);
        await wait();
        const reentered = state();
        instance.destroy();
        await wait();
        const restored = element.outerHTML === original;
        element.remove();
        window.IntersectionObserver = observer;
        return { entered, replayed, left, enteredBack, leftBack, reentered, restored, triggers: window.ScrollTrigger.getAll().length, instances: core.instanceCount };
      });
      check(repeating.entered.opacity === 1 && repeating.entered.events.enter === 1, 'gsap/once:false: first viewport entrance must complete');
      check(repeating.replayed.opacity === 1 && repeating.replayed.triggers === 1, 'gsap/once:false: explicit replay must preserve the original scroll trigger');
      check(repeating.left.opacity === 0 && repeating.left.events.leave === 1, 'gsap/once:false: leaving after replay must reverse the scroll tween');
      check(repeating.enteredBack.opacity === 1 && repeating.enteredBack.events.enterBack === 1, 'gsap/once:false: backwards re-entry after replay must reveal again');
      check(repeating.leftBack.opacity === 0 && repeating.leftBack.events.leaveBack === 1, 'gsap/once:false: backwards leave after replay must reverse again');
      check(repeating.reentered.opacity === 1 && repeating.reentered.events.enter === 2, 'gsap/once:false: a second forward entrance must retain its callback and animation');
      check(repeating.restored && repeating.triggers === 0 && repeating.instances === 0, 'gsap/once:false: destroy must release both replay and scroll animation ownership');
      const reentrant = await page.evaluate(async () => {
        const { core } = window.__revealTest;
        const observer = window.IntersectionObserver;
        window.IntersectionObserver = undefined;
        const results = [];
        for (const preset of ['fade-up', 'class']) {
          for (const boundary of ['forward', 'backward']) {
            window.scrollTo(0, 0);
            const element = document.createElement('div');
            element.className = 'authored';
            element.style.cssText = 'position: absolute; top: 1000px; color: rgb(10, 20, 30)';
            element.textContent = 'Reentrant lifecycle';
            document.body.append(element);
            const original = element.outerHTML;
            let instance;
            let armed = false;
            let destroyed = false;
            let callbacksAfterDestroy = 0;
            let destroys = 0;
            const destroy = () => { destroys += 1; destroyed = true; instance.destroy(); };
            instance = core.create('reveal', element, {
              preset, once: false, duration: .08, start: 'top center', end: 'bottom top',
              enterClass: 'entered', leaveClass: 'after-destroy',
              onLeave: () => {
                if (destroyed) callbacksAfterDestroy += 1;
                if (armed && (preset === 'class' || boundary === 'forward')) destroy();
              },
              onLeaveBack: () => {
                if (destroyed) callbacksAfterDestroy += 1;
                if (armed && preset !== 'class' && boundary === 'backward') destroy();
              }
            });
            window.ScrollTrigger.refresh();
            window.scrollTo(0, 800);
            await new Promise((resolve) => setTimeout(resolve, 180));
            armed = true;
            window.scrollTo(0, boundary === 'forward' ? 1300 : 0);
            await new Promise((resolve) => setTimeout(resolve, 180));
            const restored = element.outerHTML === original;
            instance.destroy();
            element.remove();
            results.push({ preset, boundary, restored, destroys, callbacksAfterDestroy });
          }
        }
        window.IntersectionObserver = observer;
        return { results, instances: core.instanceCount, triggers: window.ScrollTrigger.getAll().length };
      });
      for (const state of reentrant.results) {
        check(state.destroys === 1 && state.restored,
          `gsap/${state.preset}/${state.boundary}: destroy inside a leave callback must remain restored`);
        check(state.callbacksAfterDestroy === 0,
          `gsap/${state.preset}/${state.boundary}: nested leave callbacks must stop after destroy`);
      }
      check(reentrant.instances === 0 && reentrant.triggers === 0, 'gsap: reentrant destruction must leave no instance or trigger');
    }
    check(errors.length === 0, `${engine}: unexpected browser errors: ${errors.join('; ')}`);
    await page.close();
  }
  assert.equal(failures.length, 0, `Reveal rendering/lifecycle regressions (${browserName}):\n${failures.join('\n')}`);
  console.log(`Reveal variants OK (${browserName}): ${variants.length} presets × native/GSAP; intermediate motion, authored text DOM, replay, reduced motion and delayed destroy restoration.`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
