import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import revealModule, { staggerDelays } from '../src/modules/reveal.js';
import fullpageModule from '../src/modules/fullpage.js';

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

// Clock reveal on a staggered list must mask each item independently. Masking
// the <ul> itself turns the whole list into one large clock wipe.
const clockList = document.createElement('ul');
clockList.innerHTML = '<li>A</li><li>B</li><li>C</li>';
document.body.appendChild(clockList);
const clockReveal = revealModule.create(clockList, {
  preset: 'clock',
  duration: 0.2,
  stagger: 0.05,
  order: 'start'
});
assert.equal(clockList.style.maskImage, '', 'staggered clock reveal must not mask the list root');
assert.ok(
  [...clockList.children].every((item) => item.style.maskImage.includes('conic-gradient')),
  'every list item must receive its own clock mask'
);
await new Promise((resolve) => setTimeout(resolve, 90));
assert.ok(
  new Set([...clockList.children].map((item) => item.style.maskImage)).size > 1,
  'staggered item masks must advance independently'
);
clockReveal.destroy();
assert.ok([...clockList.children].every((item) => item.getAttribute('style') == null), 'clock reveal destroy must restore item styles');
clockList.remove();

// The wheel gesture that changes to a long section must stop at the section's
// top. Trackpad inertia from that same gesture used to scroll the new section
// immediately, so it appeared halfway down on first entry.
const fullpageEl = document.createElement('div');
fullpageEl.innerHTML = '<section>Overview</section><section>Long</section><section>End</section>';
document.body.appendChild(fullpageEl);
Object.defineProperty(fullpageEl, 'clientHeight', { configurable: true, value: 360 });
const fullpageSections = [...fullpageEl.children];
fullpageSections.forEach((section, index) => {
  Object.defineProperty(section, 'clientHeight', { configurable: true, value: 360 });
  Object.defineProperty(section, 'scrollHeight', { configurable: true, value: index === 1 ? 900 : 360 });
});
const fullpage = fullpageModule.create(fullpageEl, { duration: 0.15 });
const wheel = () => fullpageEl.dispatchEvent(new window.WheelEvent('wheel', {
  bubbles: true,
  cancelable: true,
  deltaY: 80
}));
wheel();
assert.equal(fullpage.index, 1, 'first wheel must move to the long second section');
assert.equal(fullpageSections[1].scrollTop, 0, 'long section must enter at its top');
wheel();
assert.equal(fullpageSections[1].scrollTop, 0, 'same wheel gesture tail must not scroll the newly entered section');
await new Promise((resolve) => setTimeout(resolve, 320));
wheel();
assert.equal(fullpageSections[1].scrollTop, 80, 'the next wheel gesture must scroll the long section internally');
fullpage.destroy();
fullpageEl.remove();

const sliderModule = (await import('../src/modules/slider.js')).default;
const bottomSheetModule = (await import('../src/modules/bottomSheet.js')).default;
const loadingIndicatorModule = (await import('../src/modules/loadingIndicator.js')).default;
const coverRevealModule = (await import('../src/modules/coverReveal.js')).default;
const flipModule = (await import('../src/modules/flip.js')).default;
const cardGlowModule = (await import('../src/modules/cardGlow.js')).default;
const tiltModule = (await import('../src/modules/tilt.js')).default;

// FLIP uses both X and Y deltas, so the same transaction supports a multi-row
// grid instead of only shuffling one horizontal strip.
const flipGrid = document.createElement('div');
const flipItems = Array.from({ length: 6 }, (_value, index) => {
  const item = document.createElement('span');
  item.textContent = String(index);
  flipGrid.appendChild(item);
  return item;
});
document.body.appendChild(flipGrid);
let flipLayout = 0;
const flipFrames = [];
flipItems.forEach((item, index) => {
  item.getBoundingClientRect = () => {
    const order = flipLayout === 0 ? index : (index + 3) % 6;
    const left = (order % 3) * 60;
    const top = Math.floor(order / 3) * 60;
    return { left, top, width: 46, height: 46, right: left + 46, bottom: top + 46 };
  };
  item.animate = (frames) => {
    flipFrames.push(frames);
    return { finished: Promise.resolve(), cancel() {} };
  };
});
const flip = flipModule.create(flipGrid, { duration: 0.2, watch: false });
flipLayout = 1;
flip.play();
assert.ok(flipFrames.some((frames) => /translate\([^,]+px, -?60px\)/.test(frames[0].transform)), 'multi-row FLIP must animate a vertical delta');
flip.destroy();
flipGrid.remove();

// Tilt and Card Glow shadows must coexist with each other and with a card's
// original box-shadow. Each module owns only its CSS-variable channel.
const shadowCard = document.createElement('div');
shadowCard.style.boxShadow = '0 1px 3px rgb(0 0 0 / 20%)';
document.body.appendChild(shadowCard);
Object.defineProperty(shadowCard, 'clientWidth', { configurable: true, value: 240 });
Object.defineProperty(shadowCard, 'clientHeight', { configurable: true, value: 140 });
shadowCard.getBoundingClientRect = () => ({ left: 0, top: 0, width: 240, height: 140, right: 240, bottom: 140 });
const glowShadow = cardGlowModule.create(shadowCard, {
  shadow: true,
  shadowColor: '#172033',
  shadowOpacity: 0.36,
  shadowBlur: 40,
  shadowSpread: -12,
  shadowX: 2,
  shadowY: 16,
  shadowFollow: 20
});
const tiltShadow = tiltModule.create(shadowCard, {
  glare: false,
  tiltShadow: true,
  tiltShadowColor: '#311827',
  tiltShadowOpacity: 0.3,
  tiltShadowBlur: 28,
  tiltShadowSpread: -6,
  tiltShadowX: -2,
  tiltShadowY: 12,
  tiltShadowFollow: 1.4
});
assert.ok(shadowCard.classList.contains('kt-interactive-shadow'), 'interactive shadow host class missing');
assert.match(shadowCard.style.getPropertyValue('--kt-card-glow-shadow-runtime'), /color-mix/);
assert.match(shadowCard.style.getPropertyValue('--kt-tilt-shadow-runtime'), /color-mix/);
assert.match(shadowCard.style.getPropertyValue('--kt-shadow-base-runtime'), /0 1px 3px/);
glowShadow.destroy();
assert.ok(shadowCard.classList.contains('kt-interactive-shadow'), 'destroying Card Glow must preserve Tilt shadow');
assert.equal(shadowCard.style.getPropertyValue('--kt-card-glow-shadow-runtime'), '');
assert.match(shadowCard.style.getPropertyValue('--kt-tilt-shadow-runtime'), /color-mix/);
tiltShadow.destroy();
assert.ok(!shadowCard.classList.contains('kt-interactive-shadow'), 'last shadow module must clean up host class');
assert.equal(shadowCard.style.boxShadow, '0 1px 3px rgb(0 0 0 / 20%)', 'original box-shadow must be preserved');
shadowCard.remove();

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

// Slider effects must be visually distinct instead of aliasing every scene
// transition to fade. The generated transforms/filters remain class- and
// CSS-variable-addressable for product overrides.
const effectExpectations = {
  fade: (slide) => slide.style.filter === '' && slide.style.transform.includes('translate3d'),
  dissolve: (slide) => slide.style.filter.includes('blur('),
  wipe: (slide) => slide.style.clipPath.includes('inset('),
  flip: (slide) => slide.style.transform.includes('rotateY('),
  cube: (slide) => slide.style.transform.includes('rotateY('),
  cards: (slide) => slide.style.transform.includes('rotateZ('),
  creative: (slide) => slide.style.transform.includes('rotateZ('),
  coverflow: (slide) => slide.style.transform.includes('rotateY(')
};
for (const [effect, check] of Object.entries(effectExpectations)) {
  const effectInstance = sliderModule.create(sliderEl, { effect, loop: 'rewind' });
  assert.equal(sliderEl.dataset.ktSliderEffect, effect, `${effect}: effect state hook missing`);
  assert.ok(check(sliderEl.querySelectorAll('.kt-slide')[1]), `${effect}: renderer did not produce a distinct scene treatment`);
  effectInstance.destroy();
}

const sliderEvents = [];
sliderEl.addEventListener('kt-slider-change', (event) => sliderEvents.push(event.detail.index));
const apiInstance = sliderModule.create(sliderEl, { effect: 'slide', loop: 'rewind' });
assert.equal(typeof apiInstance.slideNext, 'function');
assert.equal(typeof apiInstance.slideTo, 'function');
apiInstance.slideNext();
assert.deepEqual(sliderEvents, [1], 'slider change event must expose the next index');
apiInstance.disable();
apiInstance.slideNext();
assert.equal(apiInstance.index, 1, 'disabled slider must ignore navigation');
apiInstance.enable();
apiInstance.slideTo(2);
assert.equal(apiInstance.isEnd, true);
apiInstance.destroy();

// Resizable Bottom Sheet keeps resizing on its header so body text remains
// selectable. Double click on the same header restores automatic height.
const sheetEl = document.createElement('section');
sheetEl.innerHTML = '<header data-kt-sheet-header><h3>Sheet</h3></header><p>Selectable body text</p><button>Action</button>';
document.body.appendChild(sheetEl);
sheetEl.getBoundingClientRect = () => ({ left: 0, top: 300, right: 400, bottom: 600, width: 400, height: 300 });
const resizeEvents = [];
sheetEl.addEventListener('kt-sheet-resize', (event) => resizeEvents.push(event.detail));
const sheetInstance = bottomSheetModule.create(sheetEl, {
  resizable: true,
  resizeArea: 'header',
  minHeight: 160,
  maxHeight: 700
});
const sheetHeader = sheetEl.querySelector('header');
sheetHeader.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, clientY: 500, button: 0 }));
sheetHeader.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientY: 400, button: 0 }));
sheetHeader.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true, clientY: 400, button: 0 }));
assert.equal(sheetEl.style.height, '400px');
assert.deepEqual(resizeEvents.at(-1), { height: 400, source: 'header' });
const heightAfterHeaderDrag = sheetEl.style.height;
sheetEl.querySelector('p').dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, clientY: 400, button: 0 }));
sheetEl.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientY: 320, button: 0 }));
sheetEl.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true, clientY: 320, button: 0 }));
assert.equal(sheetEl.style.height, heightAfterHeaderDrag, 'body pointer gestures must not resize the sheet');
sheetHeader.dispatchEvent(new window.MouseEvent('dblclick', { bubbles: true, button: 0 }));
assert.equal(sheetEl.style.height, '', 'double click must restore automatic sheet height');
sheetInstance.destroy();
sheetEl.remove();

// Loading Indicator is intentionally inline and terminal presets render only
// symbols. Product copy remains outside the library-owned indicator.
const indicatorHost = document.createElement('span');
document.body.appendChild(indicatorHost);
const indicatorEvents = [];
indicatorHost.addEventListener('kt-loading-indicator-progress', (event) => indicatorEvents.push(event.detail.progress));
const indicator = loadingIndicatorModule.create(indicatorHost, {
  type: 'terminal',
  terminalStyle: 'meter',
  progress: 35,
  hideOnComplete: false
});
assert.equal(indicatorHost.querySelector('.kt-loading--terminal')?.textContent.includes('Loading'), false);
assert.equal(indicatorHost.getAttribute('role'), 'progressbar');
indicator.setProgress(64);
assert.equal(indicator.progress, 64);
assert.ok(indicatorEvents.includes(64), 'inline indicator must emit progress events');
indicator.complete();
await indicator.finished;
indicator.destroy();
indicatorHost.remove();

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

const paletteTarget = document.createElement('div');
paletteTarget.textContent = 'Palette cover';
document.body.appendChild(paletteTarget);
const paletteCover = coverRevealModule.create(paletteTarget, {
  colorMode: 'palette',
  colors: 'rgba(255, 0, 0, .5), #00ff00, hsl(220 80% 55%)',
  layers: 3,
  duration: 0.05,
  stagger: 0,
  waitForImage: false
});
const palettePanels = [...paletteTarget.closest('.kt-cover-wrap').querySelectorAll('[aria-hidden="true"]')];
assert.equal(palettePanels.length, 3, 'palette mode must create every requested layer');
assert.equal(new Set(palettePanels.map((panel) => panel.style.background)).size, 3, 'palette mode must distribute palette colors across layers');
paletteCover.destroy();
paletteTarget.remove();

const autoSurface = document.createElement('div');
autoSurface.style.backgroundColor = 'rgb(30, 80, 140)';
const autoTarget = document.createElement('div');
autoTarget.textContent = 'Automatic harmonious cover';
autoSurface.appendChild(autoTarget);
document.body.appendChild(autoSurface);
const autoCover = coverRevealModule.create(autoTarget, {
  colorMode: 'auto',
  layers: 3,
  duration: 0.05,
  stagger: 0,
  waitForImage: false
});
assert.ok(
  [...autoTarget.closest('.kt-cover-wrap').querySelectorAll('[aria-hidden="true"]')]
    .every((panel) => panel.style.background.length > 0),
  'auto mode must create a CSS color palette from the image or surrounding surface'
);
autoCover.destroy();
autoSurface.remove();

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

console.log('Motion regressions OK — reveal order; fullpage handoff; composable interaction shadows; Bottom Sheet header resizing; inline loading indicators; Cover Reveal combinations; slider pause/progress and activation collisions.');
