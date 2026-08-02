import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import revealModule, { staggerDelays } from '../src/modules/reveal.js';
import fullpageModule from '../src/modules/fullpage.js';
import megaMenuModule from '../src/modules/megaMenu.js';
import scrollShadowsModule from '../src/modules/scrollShadows.js';
import overflowTextModule from '../src/modules/overflowText.js';
import { getTerminalFramePreset } from '../src/modules/loadingIndicator/terminalFramePresets.js';

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

const responsiveMenuHost = document.createElement('nav');
responsiveMenuHost.innerHTML = '<ul><li><button>Menu</button><div class="kt-menu-panel"><a href="#">Item</a></div></li></ul>';
document.body.appendChild(responsiveMenuHost);
const responsiveMenu = megaMenuModule.create(responsiveMenuHost, { responsive: 'scroll' });
assert.ok(responsiveMenuHost.classList.contains('kt-menu--responsive-scroll'), 'Mega Menu scroll mode class missing');
responsiveMenu.destroy();
assert.ok(!responsiveMenuHost.classList.contains('kt-menu--responsive-scroll'), 'Mega Menu responsive class must clean up');
responsiveMenuHost.remove();

const hoverRoll = document.createElement('a');
hoverRoll.innerHTML = '<span>WORK</span><span>프로젝트</span>';
document.body.appendChild(hoverRoll);
const hoverChanges = [];
const hoverRollInstance = overflowTextModule.create(hoverRoll, {
  mode: 'rolling',
  trigger: 'hover',
  onChange: (index) => hoverChanges.push(index)
});
hoverRoll.dispatchEvent(new window.Event('pointerenter'));
hoverRoll.dispatchEvent(new window.FocusEvent('focusin'));
assert.deepEqual(hoverChanges, [1], 'click focus must not restart an already-hovered roll');
hoverRoll.dispatchEvent(new window.Event('pointerleave'));
assert.deepEqual(hoverChanges, [1], 'pointer leave must not restore while the link still has focus');
hoverRoll.dispatchEvent(new window.FocusEvent('focusout', { relatedTarget: null }));
assert.deepEqual(hoverChanges, [1, 0], 'hover roll must restore after both pointer and focus leave');
hoverRollInstance.destroy();
hoverRoll.remove();

const horizontalMask = document.createElement('div');
document.body.appendChild(horizontalMask);
const horizontalMaskInstance = scrollShadowsModule.create(horizontalMask, { axis: 'x', mode: 'mask' });
assert.equal(horizontalMaskInstance.state.axis, 'horizontal', 'Scroll Shadows must accept the public x-axis alias');
horizontalMaskInstance.destroy();
horizontalMask.remove();

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
fullpageSections[1].scrollTop = 540;
fullpage.go(2, true);
fullpage.go(1, true);
assert.equal(fullpageSections[1].scrollTop, 540, 're-entering a long section must preserve its last internal scroll position');
fullpage.destroy();
fullpageEl.remove();

const sliderModule = (await import('../src/modules/slider.js')).default;
const bottomSheetModule = (await import('../src/modules/bottomSheet.js')).default;
const loadingIndicatorModule = (await import('../src/modules/loadingIndicator.js')).default;
const coverRevealModule = (await import('../src/modules/coverReveal.js')).default;
const flipModule = (await import('../src/modules/flip.js')).default;
const cardGlowModule = (await import('../src/modules/cardGlow.js')).default;
const tiltModule = (await import('../src/modules/tilt.js')).default;

const radialHost = document.createElement('div');
radialHost.innerHTML = '<div>A</div><div>B</div><div>C</div><div>D</div><div>E</div>';
document.body.appendChild(radialHost);
const radialLoop = sliderModule.create(radialHost, { effect: 'radial', loop: 'infinite', controls: false });
radialLoop.go(4);
const retainedRadialIndex = radialLoop.index;
radialLoop.destroy();
const radialFinite = sliderModule.create(radialHost, { effect: 'radial', loop: 'off', controls: false, initialIndex: retainedRadialIndex });
assert.equal(radialFinite.index, 4, 'disabling radial infinite mode must retain the active item');
assert.equal(radialHost.querySelectorAll('.kt-active').length, 1, 'finite radial layout must keep one active item');
radialFinite.destroy();
radialHost.remove();

// Determinate indicators update nearby copy and can subscribe to Loader's
// existing progress event without a new cross-module dependency.
const progressScope = document.createElement('div');
progressScope.setAttribute('data-kt-progress-scope', '');
progressScope.innerHTML = `
  <div id="progress-source"></div>
  <span id="progress-indicator"></span>
  <output data-kt-progress-output data-kt-progress-template="{value}% 완료">0% 완료</output>
`;
document.body.appendChild(progressScope);
const progressIndicator = loadingIndicatorModule.create(
  progressScope.querySelector('#progress-indicator'),
  { type: 'spinner', spinnerStyle: 'comet', spinnerMode: 'fill', autoComplete: false }
);
progressIndicator.setProgress(100);
assert.equal(progressScope.querySelector('[data-kt-progress-output]').textContent, '100% 완료');
progressIndicator.bindProgress(progressScope.querySelector('#progress-source'));
progressScope.querySelector('#progress-source').dispatchEvent(new window.CustomEvent('kt-loader-progress', {
  detail: { value: 37 }
}));
assert.equal(progressIndicator.progress, 37);
assert.equal(progressScope.querySelector('[data-kt-progress-output]').textContent, '37% 완료');
progressIndicator.destroy();
assert.equal(progressScope.querySelector('[data-kt-progress-output]').textContent, '0% 완료');
progressScope.remove();

// Multiple progress producers may intentionally share one visible output.
// Destroying one producer must not restore stale copy while another owns it.
const sharedProgressScope = document.createElement('div');
sharedProgressScope.setAttribute('data-kt-progress-scope', '');
sharedProgressScope.innerHTML = `
  <span class="shared-indicator"></span>
  <span class="shared-indicator"></span>
  <output data-kt-progress-output>Waiting</output>
`;
document.body.appendChild(sharedProgressScope);
const sharedIndicators = [...sharedProgressScope.querySelectorAll('.shared-indicator')].map((host) => (
  loadingIndicatorModule.create(host, {
    type: 'spinner',
    spinnerStyle: 'comet',
    spinnerMode: 'fill',
    autoComplete: false
  })
));
sharedIndicators[0].setProgress(24);
sharedIndicators[1].setProgress(63);
sharedIndicators[0].destroy();
assert.equal(
  sharedProgressScope.querySelector('[data-kt-progress-output]').textContent,
  '63%',
  'destroying one shared producer must preserve the live output'
);
sharedIndicators[1].destroy();
assert.equal(
  sharedProgressScope.querySelector('[data-kt-progress-output]').textContent,
  'Waiting',
  'the last shared producer must restore the original output'
);
sharedProgressScope.remove();

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

// `none` keeps FLIP's record/reorder API useful while applying the new layout
// immediately, without creating Web Animations.
flipFrames.length = 0;
flipLayout = 0;
const instantFlip = flipModule.create(flipGrid, { duration: 0.2, mode: 'none', watch: false });
flipLayout = 1;
instantFlip.play();
assert.equal(flipFrames.length, 0, 'FLIP mode none must update without animation');
instantFlip.destroy();

flipFrames.length = 0;
flipLayout = 0;
const scaleFlip = flipModule.create(flipGrid, { duration: 0.2, mode: 'scale', watch: false });
flipLayout = 1;
scaleFlip.play();
assert.ok(
  flipFrames.some((frames) => frames.some((frame) => /scale\(\.18\)/.test(frame.transform || '')) && frames.every((frame) => frame.opacity == null)),
  'FLIP scale must visibly shrink and expand instead of degrading into a fade'
);
scaleFlip.destroy();

flipFrames.length = 0;
flipLayout = 0;
const sequentialFadeFlip = flipModule.create(flipGrid, { duration: 0.2, mode: 'fade', watch: false });
flipLayout = 1;
sequentialFadeFlip.play();
assert.ok(
  flipFrames.every((frames) => frames[0].transform?.startsWith('translate(')
    && frames[1].transform === frames[0].transform && frames[1].opacity === 0
    && frames[2].transform === 'none' && frames[2].opacity === 0),
  'FLIP fade must disappear at the old slot before it moves invisibly and appears at the new slot'
);
sequentialFadeFlip.destroy();

flipFrames.length = 0;
flipItems.forEach((item) => { item.animate = (frames) => { flipFrames.push(frames); return { finished: new Promise(() => {}), cancel() {} }; }; });
const previousPrototypeAnimate = window.HTMLElement.prototype.animate;
window.HTMLElement.prototype.animate = function animate(frames) { flipFrames.push(frames); return { finished: new Promise(() => {}), cancel() {} }; };
flipLayout = 0;
const crossfadeFlip = flipModule.create(flipGrid, { duration: 0.2, mode: 'crossfade', watch: false });
flipLayout = 1;
crossfadeFlip.play();
assert.ok(
  document.body.querySelector('[aria-hidden="true"][style*="2147483646"]')
    && flipFrames.some((frames) => frames.length === 2 && frames[0].opacity === 1 && frames[1].opacity === 0)
    && flipFrames.some((frames) => frames.length === 2 && frames[0].opacity === 0 && frames[1].opacity === 1),
  'FLIP crossfade must overlap an outgoing old-position visual clone with the incoming live item'
);
crossfadeFlip.destroy();
window.HTMLElement.prototype.animate = previousPrototypeAnimate;
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

// Only the existing, low-coupling composition API is supported: paired
// sliders share an index without recursively broadcasting the same change.
const syncEl = document.createElement('div');
syncEl.id = 'slider-sync';
syncEl.innerHTML = sliderEl.innerHTML;
document.body.appendChild(syncEl);
const mainSync = sliderModule.create(sliderEl, { preset: 'slide', sync: '#slider-sync' });
const peerSync = sliderModule.create(syncEl, { preset: 'slide', sync: '#slider' });
mainSync.goTo(2);
assert.equal(peerSync.index, 2, 'slider.sync must propagate the active index to its peer');
peerSync.goTo(1);
assert.equal(mainSync.index, 1, 'two-way slider.sync must not recurse or lose the peer update');
mainSync.destroy();
peerSync.destroy();
syncEl.remove();

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

const coverflowShadow = sliderModule.create(sliderEl, {
  effect: 'coverflow',
  activeShadow: true,
  activeShadowOpacity: 0.36
});
assert.ok(sliderEl.classList.contains('kt-slider--active-shadow'), 'Coverflow active shadow hook missing');
assert.equal(sliderEl.style.getPropertyValue('--kt-slide-active-shadow-opacity'), '36%');
assert.ok(sliderEl.querySelector('.kt-slide.is-active'), 'Coverflow active shadow requires an active slide hook');
coverflowShadow.destroy();
assert.ok(!sliderEl.classList.contains('kt-slider--active-shadow'), 'Coverflow active shadow hook must clean up');
assert.equal(sliderEl.style.getPropertyValue('--kt-slide-active-shadow-opacity'), '');

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
const sheetHandle = sheetEl.querySelector('.kt-sheet__handle');
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
sheetHandle.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, clientY: 500, button: 0 }));
sheetHandle.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientY: 450, button: 0 }));
sheetHandle.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true, clientY: 450, button: 0 }));
assert.equal(sheetEl.style.height, '350px', 'the visible top handle must remain a resize surface in header mode');
assert.deepEqual(resizeEvents.at(-1), { height: 350, source: 'handle' });
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
assert.equal(indicatorHost.querySelectorAll('.kt-loading-terminal__cell').length, 10, 'terminal meter must render individual animated cells');
indicator.setProgress(64);
assert.equal(indicator.progress, 64);
assert.equal(indicatorHost.querySelectorAll('.kt-loading-terminal__cell.is-filled').length, 6, 'terminal meter must reflect progress in filled cells');
assert.ok(indicatorEvents.includes(64), 'inline indicator must emit progress events');
indicator.complete();
await indicator.finished;
indicator.destroy();
indicatorHost.remove();

const promiseHost = document.createElement('span');
document.body.appendChild(promiseHost);
const promiseIndicator = loadingIndicatorModule.create(promiseHost, {
  type: 'spinner',
  completeHold: 0,
  exitDuration: 0,
  hideOnComplete: false
});
assert.equal(
  await promiseIndicator.trackPromise(Promise.resolve('ready')),
  'ready',
  'trackPromise must preserve the resolved value'
);
await promiseIndicator.finished;
assert.equal(promiseIndicator.state, 'completed', 'trackPromise must settle the indicator lifecycle');
promiseIndicator.destroy();
promiseHost.remove();

const frameHost = document.createElement('span');
document.body.appendChild(frameHost);
assert.deepEqual(
  getTerminalFramePreset('braille-pulse').frames,
  [...'⠀⣀⣤⣶⣿⣿⣿⣶⣤⣀'],
  'Braille Pulse must fill both dot columns one horizontal row at a time'
);
assert.deepEqual(
  getTerminalFramePreset('clock').frames,
  ['🕛', '🕒', '🕕', '🕘'],
  'Clock must use actual clock faces instead of reversing the Circle frames'
);
const frameIndicator = loadingIndicatorModule.create(frameHost, {
  type: 'terminal',
  terminalStyle: 'braille',
  frameInterval: 40
});
const firstFrame = frameHost.querySelector('.kt-loading-terminal__frame')?.textContent;
await new Promise((resolve) => setTimeout(resolve, 55));
const secondFrame = frameHost.querySelector('.kt-loading-terminal__frame')?.textContent;
assert.notEqual(secondFrame, firstFrame, 'terminal frame spinner must advance through its preset');
frameIndicator.pause();
const pausedFrame = frameHost.querySelector('.kt-loading-terminal__frame')?.textContent;
await new Promise((resolve) => setTimeout(resolve, 55));
assert.equal(frameHost.querySelector('.kt-loading-terminal__frame')?.textContent, pausedFrame, 'paused terminal frame spinner must stop its timer');
frameIndicator.destroy();
frameHost.remove();

const scannerHost = document.createElement('span');
document.body.appendChild(scannerHost);
const scannerIndicator = loadingIndicatorModule.create(scannerHost, {
  type: 'terminal',
  terminalStyle: 'scanner',
  frameInterval: 40
});
const scannerFirst = scannerHost.querySelector('.kt-loading-terminal__frame')?.textContent;
await new Promise((resolve) => setTimeout(resolve, 55));
const scannerSecond = scannerHost.querySelector('.kt-loading-terminal__frame')?.textContent;
assert.notEqual(scannerSecond, scannerFirst, 'indeterminate Scanner must animate when no progress is authored');
scannerIndicator.setProgress(60);
const scannerDeterminate = scannerHost.querySelector('.kt-loading-terminal__frame')?.textContent;
await new Promise((resolve) => setTimeout(resolve, 55));
assert.equal(
  scannerHost.querySelector('.kt-loading-terminal__frame')?.textContent,
  scannerDeterminate,
  'Scanner must stop on the requested determinate progress'
);
scannerIndicator.destroy();
scannerHost.remove();

const dualHost = document.createElement('span');
document.body.appendChild(dualHost);
// `dual` was folded into comet: the same arc engine with `track` and
// `spinnerMode` options, so there is one spinner instead of three.
const dualIndicator = loadingIndicatorModule.create(dualHost, { type: 'spinner', spinnerStyle: 'comet', spinnerMode: 'grow', track: true });
// Dual ring is an Adobe-Spectrum-style progress circle: ONE svg holding a track
// circle and a same-size arc drawn on top (not a small ring nested in a big one).
assert.ok(dualHost.querySelector('.kt-loading-spinner__svg'), 'arc spinner must render the SVG arc engine');
assert.equal(dualHost.querySelectorAll('.kt-loading-spinner__track').length, 1, 'track:true must render a track circle');
assert.equal(dualHost.querySelectorAll('.kt-loading-spinner__arc').length, 1, 'arc spinner must render one arc over the track');
assert.equal(
  dualHost.querySelector('.kt-loading-spinner__track')?.getAttribute('r'),
  dualHost.querySelector('.kt-loading-spinner__arc')?.getAttribute('r'),
  'track and arc must be the same size (overlapping, not nested)'
);
assert.equal(dualHost.querySelector('.kt-loading')?.classList.contains('has-glow'), false, 'loading indicators must not enable glow by default');
dualIndicator.destroy();
dualHost.remove();

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
await paletteCover.refresh((target) => {
  target.dataset.refreshProof = 'ready';
});
assert.equal(paletteTarget.dataset.refreshProof, 'ready', 'Cover Reveal refresh must run the caller update before replay');
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

const maskTarget = document.createElement('div');
maskTarget.textContent = 'Colorless mask';
document.body.appendChild(maskTarget);
const maskCover = coverRevealModule.create(maskTarget, {
  colorMode: 'pair', color: '#f00', color2: '#0f0', mask: true, layers: 2, waitForImage: false
});
const maskPanels = [...maskTarget.closest('.kt-cover-wrap').querySelectorAll('[aria-hidden="true"]')];
assert.equal(maskPanels.length, 1, 'mask mode must replace the final colored panel instead of adding another layer');
assert.notEqual(maskPanels[0].style.background, 'rgb(0, 255, 0)', 'color2 must not be painted when a two-layer reveal uses the mask replacement');
await new Promise((resolve) => setTimeout(resolve, 30));
assert.notEqual(maskTarget.closest('.kt-cover-wrap').style.clipPath, '', 'mask mode must clip the complete cover wrapper so content and panels reveal as one unit');
assert.equal(maskTarget.style.clipPath, '', 'mask mode must not fragment the content child independently');
maskCover.destroy();
maskTarget.remove();

const fullWheelHost = document.createElement('div');
fullWheelHost.innerHTML = '<div>A</div><div>B</div><div>C</div><div>D</div>';
document.body.appendChild(fullWheelHost);
const fullWheel = sliderModule.create(fullWheelHost, { effect: 'radial', position: 'center', radius: 100, controls: false });
assert.equal(fullWheelHost.querySelector('.kt-radial-hub').style.left, '50%', 'center radial must place its hub at the horizontal center');
assert.ok([...fullWheelHost.querySelectorAll('.kt-radial-item')].every((item) => item.style.opacity === '1'), 'center radial must keep the complete wheel visible');
fullWheel.destroy();
fullWheelHost.remove();

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

console.log('Motion regressions OK — reveal order; fullpage handoff; bounded composition APIs; interaction shadows; Bottom Sheet resizing; loading indicators; Cover Reveal combinations; slider progress and activation collisions.');
