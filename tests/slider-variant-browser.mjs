// Real-browser Slider effect, input and authored-state restoration regression.
// Run after building: KT_BROWSER=chromium|firefox|webkit node tests/slider-variant-browser.mjs
// Source-only iteration without rebuilding dist: add KT_SLIDER_SOURCE=1.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(await readFile(path.join(root, 'kineto.features.json'), 'utf8'));
const effects = contract.modules.find(({ name }) => name === 'slider').variants;
const expectedEffects = ['slide', 'fade', 'dissolve', 'wipe', 'coverflow', 'flip', 'cube', 'cards', 'creative', 'radial'];
assert.deepEqual(effects, expectedEffects, 'update behavioral coverage when the public Slider effects change');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/') {
    response.writeHead(200, { 'content-type': 'text/html' });
    response.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="icon" href="data:,"><link rel="stylesheet" href="/dist/kineto.css"></head><body><main id="fixtures"></main><script src="/dist/kineto.umd.js"></script></body></html>');
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': file.endsWith('.css') ? 'text/css' : 'text/javascript' });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
let browser;

try {
  browser = await browserType.launch({
    headless: true,
    ...(browserName === 'chromium' ? {
      ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
      args: ['--no-sandbox', '--disable-gpu']
    } : {})
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.stack || error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load' });
  await page.addStyleTag({ content: `
    * { box-sizing: border-box; }
    body { margin: 0; padding: 30px; }
    .fixture { width: 360px; height: 220px; }
    .kt-slider-wrap, .kt-slider-track { height: 100%; }
    .kt-slide { height: 220px; }
    .kt-slide img { width: 100%; height: 100%; object-fit: cover; }
    .orbit-item { width: 80px; height: 80px; }
    .orbit-item img { width: 80px; height: 80px; }
    .kt-radial-controls { bottom: 4px; }
  ` });
  await page.evaluate(async (useSource) => {
    window.__sourceSlider = (await import('/src/modules/slider.js')).default;
    if (useSource) window.Kineto.register('slider', window.__sourceSlider);
    window.__makeSliderFixture = (effect, source = false, overrides = {}) => {
      const host = document.createElement('section');
      host.className = 'fixture authored-slider';
      host.classList.add(effect === 'radial' ? 'kt-radial' : `kt-slider--${effect}`);
      host.setAttribute('role', 'region');
      host.setAttribute('aria-roledescription', 'authored gallery');
      host.style.cssText = 'color: rgb(4, 5, 6); cursor: crosshair !important; touch-action: manipulation !important; --kt-radial-radius: 70px !important; --kt-slide-active-shadow-opacity: 18% !important';
      const slides = ['#0069a6', '#bc2a46', '#456f18'].map((color, index) => {
        const graphic = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220"><rect width="360" height="220" fill="${color}"/><text x="160" y="120" fill="white" font-size="50">${index + 1}</text></svg>`);
        return `<article class="${effect === 'radial' ? 'orbit-item' : 'kt-slide'} authored-${index}" role="listitem" aria-roledescription="authored item" aria-label="Item ${index + 1}" style="border-radius: 8px; --authored: ${index}; opacity: .9"><img alt="Scene ${index + 1}" src="data:image/svg+xml,${graphic}"${index === 0 ? ' draggable="true" style="user-select: text !important; -webkit-user-drag: element !important"' : ''}></article>`;
      });
      host.innerHTML = effect === 'radial'
        ? `<!-- before -->${slides[0]}<!-- between -->${slides.slice(1).join('')}<button type="button" class="authored-control">Keep</button>`
        : `<div class="kt-slider-wrap" role="group" aria-roledescription="authored viewport" aria-label="Authored label" tabindex="3" aria-disabled="false" style="height:220px; overflow:visible"><div class="kt-slider-track" style="align-items:center">${slides.join('')}</div></div>`;
      document.querySelector('#fixtures').replaceChildren(host);
      const nodes = [host, ...host.querySelectorAll('*')];
      const snapshot = () => nodes.map((node) => {
        // Compare CSS declarations and priorities, not serialization: WebKit can
        // retain an empty style attribute after removeAttribute following layout.
        return {
          node: node.tagName,
          attributes: Object.fromEntries([...node.attributes].filter(({ name }) => name !== 'style').map(({ name, value }) => [name, value]).sort(([a], [b]) => a.localeCompare(b))),
          style: Object.fromEntries([...node.style].sort().map((name) => [name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]])),
          children: [...node.childNodes].map((child) => child.nodeType === window.Node.ELEMENT_NODE ? nodes.indexOf(child) : `${child.nodeType}:${child.textContent}`)
        };
      });
      const before = snapshot();
      const options = {
        effect, loop: 'off', duration: 0.3, smoothing: 0.18, momentum: false,
        stickySnap: true, initial: 0, initialIndex: 0, dots: true, grabCursor: true,
        pauseWhenOffscreen: false, radius: 110, align: 'center', controls: true,
        activeClass: 'custom-active', ...overrides
      };
      const api = source ? window.__sourceSlider.create(host, options) : window.Kineto.create('slider', host, options);
      const items = [...host.querySelectorAll(effect === 'radial' ? '.orbit-item' : '.kt-slide')];
      const viewport = effect === 'radial' ? host : host.querySelector('.kt-slider-wrap');
      const initial = window.getComputedStyle(items[0]).transform;
      const capture = () => items.map((item) => {
        const style = window.getComputedStyle(item);
        const matrix = new window.DOMMatrixReadOnly(style.transform);
        const grain = window.getComputedStyle(item, '::after');
        return {
          transform: style.transform, matrix: [...matrix.toFloat64Array()], opacity: Number(style.opacity),
          filter: style.filter, clip: style.clipPath, origin: style.transformOrigin,
          backface: style.backfaceVisibility, progress: Number.parseFloat(style.getPropertyValue('--kt-slider-slide-progress')),
          grain: { opacity: Number(grain.opacity), background: grain.backgroundImage },
          active: item.classList.contains(effect === 'radial' ? 'kt-active' : 'is-active'),
          hidden: item.getAttribute('aria-hidden'), current: item.getAttribute('aria-current')
        };
      });
      const waitForLanding = (index) => new Promise((resolve, reject) => {
        const started = window.performance.now();
        const reference = [...new window.DOMMatrixReadOnly(initial).toFloat64Array()];
        const tick = () => {
          const state = capture();
          const completeProgress = !Number.isFinite(state[index].progress) || state[index].progress === 1;
          if (api.index === index && completeProgress && state[index].matrix.every((value, offset) => Math.abs(value - reference[offset]) < 0.001)) resolve(state);
          else if (window.performance.now() - started > 4000) reject(new Error(`${effect} did not settle at ${index}: ${JSON.stringify(state)}`));
          else window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
      const transition = (method) => new Promise((resolve, reject) => {
        const beforeMotion = capture();
        const started = window.performance.now();
        api[method]();
        const tick = () => {
          const state = capture();
          const changed = state[0].matrix.some((value, offset) => Math.abs(value - beforeMotion[0].matrix[offset]) > 0.01)
            || Math.abs(state[0].opacity - beforeMotion[0].opacity) > 0.01
            || state[1].clip !== beforeMotion[1].clip;
          if (changed && (effect === 'slide' || effect === 'coverflow' || effect === 'radial' || (state[1].progress > 0.03 && state[1].progress < 0.97))) resolve(state);
          else if (window.performance.now() - started > 1500) reject(new Error(`${effect} did not expose an intermediate animation frame`));
          else window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
      });
      window.__sliderFixture = { api, host, viewport, items, before, snapshot, capture, transition, waitForLanding };
      return capture();
    };
  }, process.env.KT_SLIDER_SOURCE === '1');

  // Exercise source directly as well as the distributable; a stale artifact
  // must never be mistaken for the source of a reported lifecycle defect.
  for (const effect of ['fade', 'radial']) {
    await page.evaluate((variant) => window.__makeSliderFixture(variant, true), effect);
    const result = await page.evaluate(() => {
      const fixture = window.__sliderFixture;
      fixture.api.destroy();
      return { before: fixture.before, after: fixture.snapshot() };
    });
    assert.deepEqual(result.after, result.before, `${effect}: direct source destroy restores authored DOM, styles and ARIA`);
    const absentClass = await page.evaluate((variant) => {
      const host = document.createElement('section');
      host.innerHTML = variant === 'radial'
        ? '<article>A</article><article>B</article>'
        : '<div class="kt-slider-track"><article>A</article><article>B</article></div>';
      document.querySelector('#fixtures').appendChild(host);
      window.__sourceSlider.create(host, { effect: variant }).destroy();
      const value = host.getAttribute('class');
      host.remove();
      return value;
    }, effect);
    assert.equal(absentClass, null, `${effect}: destroy does not leave a new empty class attribute`);
    const composition = await page.evaluate((variant) => {
      window.__makeSliderFixture(variant, true);
      const { api, items } = window.__sliderFixture;
      const image = items[1].querySelector('img');
      image.style.opacity = '1';
      image.style.filter = 'none';
      image.style.setProperty('--loaded', 'true');
      api.destroy();
      return { opacity: image.style.opacity, filter: image.style.filter, loaded: image.style.getPropertyValue('--loaded') };
    }, effect);
    assert.deepEqual(composition, { opacity: '1', filter: 'none', loaded: 'true' }, `${effect}: destroying Slider must preserve image styles changed by Lazy or application code`);
  }

  const autoHeightCleanup = await page.evaluate(async () => {
    window.__makeSliderFixture('fade', true, { autoHeight: true });
    const fixture = window.__sliderFixture;
    fixture.api.destroy();
    await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
    return { before: fixture.before, after: fixture.snapshot() };
  });
  assert.deepEqual(autoHeightCleanup.after, autoHeightCleanup.before, 'autoHeight initialization must not write a queued height after direct destroy');

  for (const effect of ['fade', 'coverflow', 'radial']) {
    const composed = await page.evaluate((variant) => {
      window.__makeSliderFixture(variant, true, { activeShadow: true });
      const { api, host, viewport, items } = window.__sliderFixture;
      host.style.backgroundColor = 'blue';
      host.style.setProperty('--responsive-width', '75vw', 'important');
      host.classList.add('application-ready');
      host.classList.remove('authored-slider');
      viewport.style.borderColor = 'green';
      if (variant === 'radial') {
        items[0].style.color = 'red';
        items[0].style.setProperty('--loaded', 'true');
        items[0].classList.add('image-ready');
      }
      api.destroy();
      const css = (node, name) => [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)];
      return {
        background: host.style.backgroundColor, responsive: css(host, '--responsive-width'),
        applicationClass: host.classList.contains('application-ready'), removedClass: host.classList.contains('authored-slider'),
        authoredVariant: host.classList.contains(variant === 'radial' ? 'kt-radial' : `kt-slider--${variant}`),
        cursor: css(host, 'cursor'), touch: css(host, 'touch-action'), radius: css(host, '--kt-radial-radius'), shadow: css(host, '--kt-slide-active-shadow-opacity'),
        viewportBorder: viewport.style.borderColor,
        item: variant === 'radial' ? { color: items[0].style.color, loaded: items[0].style.getPropertyValue('--loaded'), ready: items[0].classList.contains('image-ready') } : null
      };
    }, effect);
    assert.deepEqual(composed, {
      background: 'blue', responsive: ['75vw', 'important'], applicationClass: true, removedClass: false,
      authoredVariant: true, cursor: ['crosshair', 'important'], touch: ['manipulation', 'important'],
      radius: ['70px', 'important'], shadow: ['18%', 'important'], viewportBorder: 'green',
      item: effect === 'radial' ? { color: 'red', loaded: 'true', ready: true } : null
    }, `${effect}: teardown restores owned presentation and priorities without rewinding external class/style updates`);
  }

  for (const effect of effects) {
    const initial = await page.evaluate((variant) => window.__makeSliderFixture(variant), effect);
    const frame = await page.evaluate(() => window.__sliderFixture.transition('next'));
    const a = frame[0];
    const b = frame[1];
    const perspective = await page.evaluate(() => window.getComputedStyle(window.__sliderFixture.viewport).perspective);
    const identity2D = (matrix) => Math.abs(matrix[0] - 1) < 0.001 && Math.abs(matrix[5] - 1) < 0.001 && Math.abs(matrix[1]) < 0.001 && Math.abs(matrix[4]) < 0.001;
    if (effect === 'slide') {
      assert.ok(a.matrix[12] < initial[0].matrix[12] && identity2D(a.matrix), 'slide moves horizontally without blur, scale or rotation');
      assert.equal(a.opacity, 1);
      assert.equal(a.filter, 'none');
    } else if (effect === 'fade') {
      assert.ok(a.opacity > 0 && a.opacity < 1 && b.opacity > 0 && b.opacity < 1, 'fade cross-fades two scenes');
      assert.deepEqual(a.matrix, initial[0].matrix, 'fade never moves or scales the scene');
      assert.equal(a.filter, 'none');
      assert.equal(a.clip, 'none');
    } else if (effect === 'dissolve') {
      assert.ok(a.matrix[0] > 1 && /blur\([1-9.]/.test(a.filter), 'dissolve combines scale and blur');
      assert.ok(a.grain.opacity > 0 && a.grain.background.includes('radial-gradient'), 'dissolve adds visible transient grain instead of duplicating fade');
    } else if (effect === 'wipe') {
      assert.ok(b.clip.startsWith('inset(') && b.clip !== 'inset(0px)', 'wipe has a partial incoming mask');
      assert.equal(a.opacity, 1, 'wipe keeps the outgoing scene opaque');
      assert.equal(b.opacity, 1, 'wipe reveals the incoming scene without cross-fading');
      assert.equal(b.filter, 'none');
    } else if (effect === 'coverflow') {
      assert.notEqual(perspective, 'none');
      assert.ok(Math.abs(b.matrix[2]) > 0.01 && b.matrix[14] < 0 && b.opacity > 0, 'coverflow previews a rotated, scaled neighbour in depth');
      assert.ok(initial[1].opacity > 0, 'coverflow neighbour is visible before navigation');
    } else if (effect === 'flip' || effect === 'cube') {
      assert.notEqual(perspective, 'none');
      assert.equal(b.backface, 'hidden');
      assert.ok(Math.abs(b.matrix[2]) > 0.01 && b.matrix[14] < 0, `${effect} rotates a real 3D face`);
      if (effect === 'flip') assert.ok(Math.abs(b.matrix[12]) < 0.001, 'flip rotates around its stationary centre');
      else assert.ok(b.matrix[12] > 0 && b.origin.startsWith('360px'), 'cube translates and rotates around its incoming edge');
    } else if (effect === 'cards' || effect === 'creative') {
      assert.ok(Math.abs(b.matrix[1]) > 0.01 && b.matrix[14] < 0 && b.matrix[0] < 1, `${effect} combines depth, tilt and scale`);
      if (effect === 'cards') {
        assert.ok(initial[1].opacity > 0 && b.matrix[13] > 0, 'cards keeps an offset stack visible');
        assert.equal(b.filter, 'none');
      } else assert.ok(b.matrix[13] < 0 && /blur\([1-9.]/.test(b.filter), 'creative travels diagonally with blur');
    } else {
      assert.ok(identity2D(a.matrix) && a.matrix[12] !== initial[0].matrix[12] && a.matrix[13] !== initial[0].matrix[13], 'radial follows an arc while keeping images upright');
    }

    const next = await page.evaluate(() => window.__sliderFixture.waitForLanding(1));
    if (Number.isFinite(next[1].progress)) assert.equal(next[1].progress, 1, `${effect}: landing waits for the full incoming scene`);
    assert.deepEqual(next.map(({ active }) => active), [false, true, false], `${effect}: next settles with one active item`);
    assert.equal(effect === 'radial' ? next[1].current : next[1].hidden, effect === 'radial' ? 'true' : 'false', `${effect}: active item has coherent ARIA state`);
    await page.evaluate(() => window.__sliderFixture.api.prev());
    await page.evaluate(() => window.__sliderFixture.waitForLanding(0));
    await page.evaluate(() => window.__sliderFixture.viewport.focus());
    await page.keyboard.press('ArrowRight');
    await page.evaluate(() => window.__sliderFixture.waitForLanding(1));
    await page.keyboard.press('ArrowLeft');
    await page.evaluate(() => window.__sliderFixture.waitForLanding(0));

    const ghost = await page.evaluate(() => {
      const { items } = window.__sliderFixture;
      const image = items[0].querySelector('img');
      const event = new window.Event('dragstart', { bubbles: true, cancelable: true });
      image.dispatchEvent(event);
      return { draggable: image.draggable, prevented: event.defaultPrevented };
    });
    assert.deepEqual(ghost, { draggable: false, prevented: true }, `${effect}: native ghost-image drag is explicitly prevented`);
    const imageBox = await page.evaluate(() => {
      const box = window.__sliderFixture.items[0].querySelector('img').getBoundingClientRect();
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    });
    const dragLength = effect === 'radial' ? 65 : imageBox.width * 0.7;
    await page.mouse.move(imageBox.x + imageBox.width * 0.85, imageBox.y + imageBox.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(imageBox.x + imageBox.width * 0.85 - dragLength, imageBox.y + imageBox.height * 0.5, { steps: 8 });
    await page.mouse.up();
    await page.evaluate(() => window.__sliderFixture.waitForLanding(1));

    // Destroy in flight, not only after a settled frame, to catch queued writes.
    const destroyed = await page.evaluate(async () => {
      const fixture = window.__sliderFixture;
      fixture.api.next();
      fixture.api.destroy();
      await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));
      const image = fixture.items[0].querySelector('img');
      const event = new window.Event('dragstart', { bubbles: true, cancelable: true });
      image.dispatchEvent(event);
      fixture.host.dispatchEvent(new window.PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse', pointerId: 1 }));
      fixture.host.dispatchEvent(new window.PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse', pointerId: 1 }));
      return { before: fixture.before, after: fixture.snapshot(), prevented: event.defaultPrevented, instances: window.Kineto.instanceCount };
    });
    assert.deepEqual(destroyed.after, destroyed.before, `${effect}: destroy restores original nodes, order, styles, classes, images and ARIA without queued writes`);
    assert.equal(destroyed.prevented, false, `${effect}: destroy removes the native drag guard`);
    assert.equal(destroyed.instances, 0, `${effect}: destroy unregisters the active instance`);
    const replay = await page.evaluate(() => {
      const fixture = window.__sliderFixture;
      const options = fixture.api.options;
      const recreated = window.Kineto.create('slider', fixture.host, options);
      const replayed = window.Kineto.replay(fixture.host, 'slider', options);
      const state = { replaced: replayed !== recreated, index: replayed.index, instances: window.Kineto.instanceCount };
      replayed.destroy();
      return { ...state, before: fixture.before, after: fixture.snapshot(), remaining: window.Kineto.instanceCount };
    });
    assert.equal(replay.replaced, true, `${effect}: settings replay replaces the old instance`);
    assert.equal(replay.index, 0, `${effect}: settings replay retains the initial index`);
    assert.equal(replay.instances, 1, `${effect}: settings replay keeps exactly one instance`);
    assert.equal(replay.remaining, 0, `${effect}: replayed destroy unregisters the instance`);
    assert.deepEqual(replay.after, replay.before, `${effect}: recreate/replay preserves original author-owned nodes and styles`);
    console.log(`Slider ${effect}: rendered transition, next/prev, keyboard, image drag, destroy and replay passed (${browserName}).`);
  }
  assert.deepEqual(errors, [], 'Slider fixtures must not emit browser runtime errors');
  console.log(`Slider variant browser OK: ${effects.length}/${effects.length} public effects; direct-source restoration; ${browserName}.`);
} finally {
  await browser?.close();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}
