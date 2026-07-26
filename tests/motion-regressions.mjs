import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { staggerDelays } from '../src/modules/reveal.js';

const rounded = (values) => values.map((value) => Number(value.toFixed(3)));
assert.deepEqual(rounded(staggerDelays(5, 0.1, 'start')), [0, 0.1, 0.2, 0.3, 0.4]);
assert.deepEqual(rounded(staggerDelays(5, 0.1, 'end')), [0.4, 0.3, 0.2, 0.1, 0]);
assert.deepEqual(rounded(staggerDelays(5, 0.1, 'center')), [0.2, 0.1, 0, 0.1, 0.2]);
assert.deepEqual(rounded(staggerDelays(5, 0.1, 'edges')), [0, 0.1, 0.2, 0.1, 0]);
assert.deepEqual(rounded(staggerDelays(3, 0.1, 'unsupported')), [0, 0.1, 0.2]);
assert.deepEqual(
  rounded(staggerDelays(5, 0.1, 'random')).sort((a, b) => a - b),
  [0, 0.1, 0.2, 0.3, 0.4],
  'random reveal order must use every stagger slot exactly once'
);

const dom = new JSDOM(`<!doctype html><body>
  <div id="slider" data-kt-slider="fade">
    <div class="kt-slider-wrap">
      <div class="kt-slider-track">
        <div class="kt-slide">A</div>
        <div class="kt-slide">B</div>
        <div class="kt-slide">C</div>
      </div>
    </div>
  </div>
</body>`, { pretendToBeVisual: true, url: 'http://localhost/' });

const { window } = dom;
Object.assign(globalThis, {
  window,
  document: window.document,
  Element: window.Element,
  HTMLElement: window.HTMLElement,
  getComputedStyle: window.getComputedStyle,
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window)
});
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: window.navigator });

const sliderModule = (await import('../src/modules/slider.js')).default;
const coverRevealModule = (await import('../src/modules/coverReveal.js')).default;
const sliderEl = document.querySelector('#slider');
const instance = sliderModule.create(sliderEl, {
  preset: 'fade',
  loop: 'rewind',
  autoplay: 80,
  pauseOnHover: false,
  dots: true,
  progress: true,
  progressType: 'ring',
  pauseButton: true
});

const pauseButton = sliderEl.querySelector('.kt-slider-progress--ring.has-control .kt-slider-pause');
assert.ok(pauseButton, 'ring progress must contain the play/pause button');
assert.ok(sliderEl.querySelector('.kt-slider-progress__svg'), 'ring progress SVG must be rendered');
assert.ok(Array.from(sliderEl.querySelectorAll('.kt-slider-dot')).every((dot) => !dot.hasAttribute('style')), 'dots must remain CSS-customizable without inline styles');

pauseButton.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, button: 0 }));
pauseButton.click();
const pausedIndex = instance.index;
await new Promise((resolve) => setTimeout(resolve, 150));
assert.equal(instance.index, pausedIndex, 'pause must hold longer than the autoplay interval');
assert.equal(instance.paused, true);
assert.equal(pauseButton.dataset.paused, 'true');
assert.match(pauseButton.getAttribute('aria-label'), /Resume/);

pauseButton.click();
await new Promise((resolve) => setTimeout(resolve, 120));
assert.notEqual(instance.index, pausedIndex, 'resume must restart autoplay from the preserved state');
assert.equal(instance.paused, false);
instance.destroy();

const barInstance = sliderModule.create(sliderEl, {
  preset: 'fade',
  loop: 'rewind',
  autoplay: 120,
  progress: true,
  progressType: 'bar',
  pauseButton: true
});
assert.ok(sliderEl.querySelector('.kt-slider-progress--bar .kt-slider-progress__fill'), 'bar progress UI must render');
assert.ok(sliderEl.querySelector('.kt-slider-wrap > .kt-slider-pause'), 'bar progress UI must support the pause control');
assert.equal(sliderEl.querySelectorAll('.kt-slider-progress--ring').length, 0, 'switching to bar must remove stale ring UI');
barInstance.destroy();

const hoverInstance = sliderModule.create(sliderEl, {
  preset: 'fade',
  loop: 'rewind',
  autoplay: 400,
  pauseOnHover: true,
  progress: true,
  progressType: 'ring'
});
const hoverWrap = sliderEl.querySelector('.kt-slider-wrap');
const hoverProgress = sliderEl.querySelector('.kt-slider-progress__fill');
await new Promise((resolve) => setTimeout(resolve, 240));
hoverWrap.dispatchEvent(new window.Event('pointerenter'));
const hoverPausedIndex = hoverInstance.index;
const pausedOffset = Number(hoverProgress.style.strokeDashoffset);
await new Promise((resolve) => setTimeout(resolve, 300));
assert.equal(hoverInstance.index, hoverPausedIndex, 'hover must pause autoplay past the original deadline');
assert.ok(
  Math.abs(Number(hoverProgress.style.strokeDashoffset) - pausedOffset) < 0.02,
  'hover must freeze the progress ring at its current elapsed position'
);
hoverWrap.dispatchEvent(new window.Event('pointerleave'));
await new Promise((resolve) => setTimeout(resolve, 220));
assert.notEqual(
  hoverInstance.index,
  hoverPausedIndex,
  'leaving hover must use the preserved remaining time instead of restarting a full interval'
);
hoverInstance.destroy();

// Cover Reveal option combinations that previously left an opaque black panel
// or destroyed the target after a live settings rebuild.
for (const direction of ['left', 'right', 'up', 'down', 'random']) {
  const target = document.createElement('p');
  target.textContent = 'Cover reveal line one and line two';
  document.body.appendChild(target);
  const cover = coverRevealModule.create(target, {
    lines: true,
    layers: 3,
    direction,
    duration: 0.05,
    stagger: 0,
    waitForImage: false
  });
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.ok(target.querySelector('.kt-cover-line'), `${direction}: per-line wrapper missing`);
  assert.equal(target.querySelectorAll('[aria-hidden="true"]').length, 3, `${direction}: three cover layers were not created`);
  cover.replay();
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(target.querySelectorAll('[aria-hidden="true"]').length, 3, `${direction}: replay did not rebuild three layers`);
  cover.destroy();
  assert.equal(target.textContent, 'Cover reveal line one and line two', `${direction}: destroy did not restore the original text`);
  target.remove();
}

// A slider's `data-kt-progress` option must not also activate the standalone
// Progress module on the same element. This attribute-name collision used to
// make every settings update destroy the carousel DOM.
const Kineto = (await import('../src/core.js')).default;
let sliderCreates = 0;
const progressTargets = [];
Kineto.register('slider', { create: (el) => { sliderCreates += 1; return { el, destroy() {} }; } });
Kineto.register('progress', { create: (el) => { progressTargets.push(el.id); return { el, destroy() {} }; } });
document.body.innerHTML = '<div id="combined" data-kt-slider="fade" data-kt-progress="true"></div><div id="standalone" data-kt-progress></div>';
Kineto.scan(document);
assert.equal(sliderCreates, 1, 'slider activation must still be discovered');
assert.deepEqual(progressTargets, ['standalone'], 'progress must initialize only on the standalone progress element');
assert.equal(Kineto.getInstance(document.querySelector('#combined'), 'progress'), null, 'slider progress option must not create a Progress instance');
Kineto.destroy(document);
Kineto.unregister('slider');
Kineto.unregister('progress');
dom.window.close();

console.log('Motion regressions OK — reveal order; Cover Reveal combinations; slider pause/progress, CSS hooks, and activation collisions.');
