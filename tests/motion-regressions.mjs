import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import revealModule, { staggerDelays } from '../src/modules/reveal.js';
import fullpageModule from '../src/modules/fullpage.js';
import megaMenuModule from '../src/modules/megaMenu.js';
import scrollShadowsModule from '../src/modules/scrollShadows.js';
import overflowTextModule from '../src/modules/overflowText.js';
import { getTerminalFramePreset } from '../src/modules/loadingIndicator/terminalFramePresets.js';

// GitHub's public check metadata only exposes a step-level failure by default.
// Mirror an uncaught assertion into an annotation so runner-only regressions
// retain their exact message without requiring authenticated log access.
process.on('uncaughtExceptionMonitor', (error) => {
  if (!process.env.GITHUB_ACTIONS) return;
  const detail = String(error?.stack || error).replace(/\r?\n/g, ' ').slice(0, 900);
  console.error(`::error title=motion-regressions assertion::${detail}`);
});

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
  Image: window.Image,
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
await new Promise((resolve) => setTimeout(resolve, 24));
assert.match(horizontalMask.style.maskImage, /--kt-scroll-shadow-start/, 'mask fade must be driven by the public edge-distance CSS variables');
horizontalMaskInstance.destroy();
assert.equal(horizontalMask.style.getPropertyValue('--kt-scroll-shadow-start'), '', 'destroy must clear the mask edge variable');
horizontalMask.remove();

// On touch devices a hover-configured menu must still open on a single tap.
const mobileMenuHost = document.createElement('nav');
mobileMenuHost.innerHTML = '<ul><li><button>Solutions</button><div class="kt-menu-panel"><a href="#">Item</a></div></li></ul>';
document.body.appendChild(mobileMenuHost);
const mobileMenu = megaMenuModule.create(mobileMenuHost, { trigger: 'hover', responsive: 'scroll' });
const mobileTrigger = mobileMenuHost.querySelector('button');
const touchUp = new window.Event('pointerup', { bubbles: true, cancelable: true });
Object.defineProperty(touchUp, 'pointerType', { value: 'touch' });
mobileTrigger.dispatchEvent(touchUp);
assert.equal(mobileTrigger.getAttribute('aria-expanded'), 'true', 'a touch tap must open a hover mega menu');
assert.equal(mobileMenuHost.querySelector('.kt-menu-panel').hidden, false, 'the touch-opened mega panel must be rendered');
mobileMenu.destroy();
mobileMenuHost.remove();

// Reported: "솔루션에 마우스 대면 안 나오고, 왔다갔다 하면 나옴" — a single steady
// hover appears to do nothing while wiggling in and out opens the panel.
//
// It could not be reproduced. `openTimer` and `closeTimer` are shared across all
// entries of a menu, which is the shape a bug like that usually has, so the four
// cases below drive the module's own listeners directly: a cold hover, a hover
// arriving after sweeping across the other items, one arriving after a plain
// link that owns no panel (so it never cancels a pending close), and the
// wiggle itself. All four opened when measured in a browser, and this pins them
// so a future change to the shared timers has to fail loudly instead.
// jsdom answers `false` to every media query, so without this stub the module
// takes the no-hover path and none of the assertions below would be testing what
// they claim to. The stub also documents the fix: `any-hover` is what a
// touchscreen laptop answers `true` to, while `hover` — the primary pointer —
// answers `false` and used to disable the whole hover interaction there.
const realMatchMedia = window.matchMedia;
const stubQuery = (query, matches) => ({
  matches, media: query, onchange: null,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; }
});
const hoverAwareMatchMedia = (query) => (/any-hover|any-pointer/.test(query)
  ? stubQuery(query, true)
  : (realMatchMedia ? realMatchMedia.call(window, query) : stubQuery(query, false)));
window.matchMedia = hoverAwareMatchMedia;
// The module reads the bare global, not `window.matchMedia`.
const realGlobalMatchMedia = globalThis.matchMedia;
globalThis.matchMedia = hoverAwareMatchMedia;
const hoverBar = document.createElement('nav');
hoverBar.innerHTML = `
  <ul>
    <li><button>제품</button><div class="kt-menu-panel"><a href="#">P</a></div></li>
    <li><button>문서</button><div class="kt-menu-panel"><a href="#">D</a></div></li>
    <li><a href="#">모듈 인덱스</a></li>
    <li><button>솔루션</button><div class="kt-menu-panel"><a href="#">S</a></div></li>
  </ul>`;
document.body.appendChild(hoverBar);
const hoverMenu = megaMenuModule.create(hoverBar, { trigger: 'hover', responsive: 'scroll', openDelay: 10, closeDelay: 20 });
const hoverItems = [...hoverBar.querySelectorAll('li')];
const solutionItem = hoverItems[3];
const solutionTrigger = solutionItem.querySelector('button');
const hoverEnter = (li) => li.dispatchEvent(new window.MouseEvent('mouseenter'));
const hoverLeave = (li) => li.dispatchEvent(new window.MouseEvent('mouseleave'));
const settle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

hoverEnter(solutionItem);
await settle(60);
assert.equal(solutionTrigger.getAttribute('aria-expanded'), 'true', 'a single cold hover must open the panel');
hoverLeave(solutionItem);
await settle(60);

for (const li of hoverItems.slice(0, 3)) { hoverEnter(li); await settle(6); hoverLeave(li); }
hoverEnter(solutionItem);
await settle(60);
assert.equal(solutionTrigger.getAttribute('aria-expanded'), 'true', 'a hover that arrives after sweeping the bar must still open');
hoverLeave(solutionItem);
await settle(60);

// The plain <li> owns no panel, so it never clears the pending close the
// previous item queued — the shared timers have to survive that.
hoverEnter(hoverItems[0]); await settle(6); hoverLeave(hoverItems[0]);
hoverEnter(hoverItems[2]); await settle(6); hoverLeave(hoverItems[2]);
hoverEnter(solutionItem);
await settle(60);
assert.equal(solutionTrigger.getAttribute('aria-expanded'), 'true', 'a hover arriving past a panel-less link must still open');
hoverLeave(solutionItem);
await settle(60);

hoverEnter(solutionItem); await settle(5); hoverLeave(solutionItem); await settle(5);
hoverEnter(solutionItem);
await settle(60);
assert.equal(solutionTrigger.getAttribute('aria-expanded'), 'true', 'an in-out-in wiggle must leave the panel open, not stuck closed');
hoverMenu.destroy();
hoverBar.remove();
window.matchMedia = realMatchMedia;
globalThis.matchMedia = realGlobalMatchMedia;

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
const counterModule = (await import('../src/modules/counter.js')).default;
const dateTimeModule = (await import('../src/modules/dateTime.js')).default;
const brushRevealModule = (await import('../src/modules/brushReveal.js')).default;
const pageRevealModule = (await import('../src/modules/pageReveal.js')).default;
const bottomSheetModule = (await import('../src/modules/bottomSheet.js')).default;
const loadingIndicatorModule = (await import('../src/modules/loadingIndicator.js')).default;
const coverRevealModule = (await import('../src/modules/coverReveal.js')).default;
const flipModule = (await import('../src/modules/flip.js')).default;
const cardGlowModule = (await import('../src/modules/cardGlow.js')).default;
const tiltModule = (await import('../src/modules/tilt.js')).default;

// Keep slider visibility lifecycle deterministic without depending on a browser
// viewport. Tests drive the observer entries explicitly for both track and Radial.
class TestIntersectionObserver {
  static instances = [];
  constructor(callback) { this.callback = callback; this.target = null; TestIntersectionObserver.instances.push(this); }
  observe(target) {
    this.target = target;
    // Non-slider modules still need the normal initial in-view callback. Slider
    // tests drive their entries manually so the offscreen transition is stable.
    if (!target?.classList?.contains('kt-slider--slide')
      && !target?.classList?.contains('kt-slider--fade')
      && !target?.classList?.contains('kt-slider--dissolve')
      && !target?.classList?.contains('kt-slider--wipe')
      && !target?.classList?.contains('kt-slider--coverflow')
      && !target?.classList?.contains('kt-slider--flip')
      && !target?.classList?.contains('kt-slider--cube')
      && !target?.classList?.contains('kt-slider--cards')
      && !target?.classList?.contains('kt-slider--creative')
      && !target?.classList?.contains('kt-radial')) {
      Promise.resolve().then(() => this.callback([{ target: this.target, isIntersecting: true, intersectionRatio: 1 }]));
    }
  }
  disconnect() { this.target = null; }
  setVisible(isIntersecting) {
    this.callback([{ target: this.target, isIntersecting, intersectionRatio: isIntersecting ? 1 : 0 }]);
  }
}
globalThis.IntersectionObserver = window.IntersectionObserver = TestIntersectionObserver;

const brushHost = document.createElement('div');
brushHost.innerHTML = '<img src="base.png" alt="">';
document.body.appendChild(brushHost);
const brushImage = brushHost.querySelector('img');
const brushInstance = brushRevealModule.create(brushHost, { src: 'reveal.png' });
assert.equal(brushImage.draggable, false, 'Brush Reveal images must disable native browser drag previews');
const brushDrag = new window.Event('dragstart', { bubbles: true, cancelable: true });
brushImage.dispatchEvent(brushDrag);
assert.equal(brushDrag.defaultPrevented, true, 'Brush Reveal must cancel dragstart before a browser ghost image can appear');
brushInstance.destroy();
assert.equal(brushImage.hasAttribute('draggable'), false, 'Brush Reveal destroy must restore an image without an authored draggable attribute');
brushHost.remove();

const radialHost = document.createElement('div');
radialHost.innerHTML = '<div><img src="a.png" draggable="true"></div><div><img src="b.png"></div><div><img src="c.png"></div><div><img src="d.png"></div><div><img src="e.png"></div>';
document.body.appendChild(radialHost);
const authoredRadialImage = radialHost.querySelector('img');
authoredRadialImage.style.userSelect = 'text';
authoredRadialImage.style.webkitUserDrag = 'element';
const radialLoop = sliderModule.create(radialHost, { effect: 'radial', loop: 'infinite', controls: false });
assert.equal(radialHost.querySelector('img').draggable, false, 'radial item images must not start the browser ghost-image drag');
assert.equal(authoredRadialImage.style.userSelect, 'none', 'radial images must disable text selection while spinning');
assert.equal(authoredRadialImage.style.webkitUserDrag, 'none', 'radial images must disable WebKit native drag previews');
const radialDragStart = new window.Event('dragstart', { bubbles: true, cancelable: true });
authoredRadialImage.dispatchEvent(radialDragStart);
assert.equal(radialDragStart.defaultPrevented, true, 'radial must cancel dragstart at the container boundary');
assert.equal(radialHost.style.touchAction, 'pan-y', 'bottom/top radial docks must preserve perpendicular page scrolling');
radialLoop.go(4);
const retainedRadialIndex = radialLoop.index;
radialHost.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0, button: 0 }));
radialHost.dispatchEvent(new window.MouseEvent('pointermove', { bubbles: true, clientX: 90, clientY: 0, button: 0 }));
radialHost.dispatchEvent(new window.MouseEvent('pointerup', { bubbles: true, clientX: 90, clientY: 0, button: 0 }));
const radialAfterDrag = radialLoop.index;
radialHost.querySelector('.kt-radial-item').dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
assert.equal(radialLoop.index, radialAfterDrag, 'radial must consume the click following a drag even after a delayed event loop');
radialLoop.destroy();
assert.equal(radialHost.querySelector('img').getAttribute('draggable'), 'true', 'radial destroy must restore an authored draggable value');
assert.equal(authoredRadialImage.style.userSelect, 'text', 'radial destroy must restore authored image selection');
assert.equal(authoredRadialImage.style.webkitUserDrag, 'element', 'radial destroy must restore authored WebKit drag behavior');
assert.equal(radialHost.style.touchAction, '', 'radial destroy must restore the authored touch-action');
const radialFinite = sliderModule.create(radialHost, { effect: 'radial', loop: 'off', controls: false, initialIndex: retainedRadialIndex });
assert.equal(radialFinite.index, 4, 'disabling radial infinite mode must retain the active item');
assert.equal(radialHost.querySelectorAll('.kt-active').length, 1, 'finite radial layout must keep one active item');
radialFinite.destroy();
radialHost.remove();

// Radial opts into the same frame smoothing as the track slider without
// changing the historical duration default. The first frame must be an
// intermediate orbit, and the solver must settle on the requested index.
const radialSmoothHost = document.createElement('div');
radialSmoothHost.innerHTML = '<div>A</div><div>B</div><div>C</div><div>D</div>';
document.body.appendChild(radialSmoothHost);
const radialSmooth = sliderModule.create(radialSmoothHost, { effect: 'radial', loop: 'off', controls: false, smoothing: 0.5 });
const radialSmoothItem = radialSmoothHost.querySelector('.kt-radial-item');
const radialSmoothBefore = radialSmoothItem.style.transform;
radialSmooth.go(0);
await new Promise((resolve) => window.requestAnimationFrame(resolve));
const radialSmoothDuring = radialSmoothItem.style.transform;
assert.notEqual(radialSmoothDuring, radialSmoothBefore, 'radial smoothing must render an intermediate frame');
await new Promise((resolve) => setTimeout(resolve, 260));
assert.equal(radialSmooth.index, 0, 'radial smoothing must settle on the requested item');
radialSmooth.destroy();
radialSmoothHost.remove();

// Radial can opt into the same spring settling model as Track without
// changing its historical cubic default. The intermediate frame must move,
// and the public controls must settle at the requested index.
const radialSpringHost = document.createElement('div');
radialSpringHost.innerHTML = '<div>A</div><div>B</div><div>C</div><div>D</div>';
document.body.appendChild(radialSpringHost);
const radialSpring = sliderModule.create(radialSpringHost, {
  effect: 'radial', loop: 'off', controls: false, spring: true,
  stiffness: 170, damping: 24, mass: 1
});
const radialSpringItem = radialSpringHost.querySelector('.kt-radial-item');
const radialSpringBefore = radialSpringItem.style.transform;
radialSpring.go(0);
await new Promise((resolve) => setTimeout(resolve, 40));
assert.notEqual(radialSpringItem.style.transform, radialSpringBefore, 'radial spring must render an intermediate orbit');
await new Promise((resolve) => setTimeout(resolve, 800));
assert.equal(radialSpring.index, 0, 'radial spring must settle on the requested item');
radialSpring.destroy();
radialSpringHost.remove();

const dragSliderHost = document.createElement('div');
dragSliderHost.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div class="kt-slide"><img src="a.png"></div><div class="kt-slide"><img src="b.png"></div></div></div>';
document.body.appendChild(dragSliderHost);
const dragSlider = sliderModule.create(dragSliderHost, { preset: 'slide', drag: true, touch: true });
assert.equal(dragSliderHost.querySelector('img').draggable, false, 'slider images must not start the browser ghost-image drag');
dragSlider.destroy();
dragSliderHost.remove();

const inertiaSliderHost = document.createElement('div');
inertiaSliderHost.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div></div></div>';
document.body.appendChild(inertiaSliderHost);
const inertiaSlider = sliderModule.create(inertiaSliderHost, { preset: 'slide', loop: 'off', drag: true, touch: true });
const inertiaWrap = inertiaSliderHost.querySelector('.kt-slider-wrap');
const pointer = (type, clientX) => {
  const event = new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY: 0, button: 0 });
  Object.defineProperty(event, 'pointerId', { value: 7 });
  Object.defineProperty(event, 'pointerType', { value: 'touch' });
  return event;
};
inertiaWrap.dispatchEvent(pointer('pointerdown', 300));
inertiaWrap.dispatchEvent(pointer('pointermove', 250));
inertiaWrap.dispatchEvent(pointer('pointermove', 230));
inertiaWrap.dispatchEvent(pointer('pointerup', 230));
assert.ok(inertiaSlider.index > 0, 'recent pointer samples must carry a drag release into the next slide');
inertiaSlider.destroy();
inertiaSliderHost.remove();

// `velocityInfluence` controls only the release fling. With a measured slide
// step, the same short drag rounds to the first slide when it is 0 and carries
// into the next slide when the influence is enabled.
const influenceHost = document.createElement('div');
influenceHost.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div class="kt-slide">A</div><div class="kt-slide">B</div><div class="kt-slide">C</div><div class="kt-slide">D</div></div></div>';
document.body.appendChild(influenceHost);
const influenceWrap = influenceHost.querySelector('.kt-slider-wrap');
Object.defineProperty(influenceWrap, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top: 0, width: 300, height: 100, right: 300, bottom: 100 }) });
influenceHost.querySelectorAll('.kt-slide').forEach((slide) => Object.defineProperty(slide, 'offsetWidth', { configurable: true, value: 100 }));
const noFling = sliderModule.create(influenceHost, { preset: 'slide', loop: 'off', velocityInfluence: 0 });
influenceWrap.dispatchEvent(pointer('pointerdown', 200));
influenceWrap.dispatchEvent(pointer('pointermove', 185));
influenceWrap.dispatchEvent(pointer('pointerup', 185));
assert.equal(noFling.index, 0, 'velocityInfluence=0 must disable release fling');
noFling.destroy();
const strongFling = sliderModule.create(influenceHost, { preset: 'slide', loop: 'off', velocityInfluence: 1.2 });
influenceWrap.dispatchEvent(pointer('pointerdown', 200));
influenceWrap.dispatchEvent(pointer('pointermove', 185));
influenceWrap.dispatchEvent(pointer('pointerup', 185));
assert.ok(strongFling.index > 0, 'velocityInfluence above 1 must carry a release into the next slide');
strongFling.destroy();

const momentumOff = sliderModule.create(influenceHost, {
  preset: 'slide', loop: 'off', velocityInfluence: 1.2, momentum: false
});
influenceWrap.dispatchEvent(pointer('pointerdown', 200));
influenceWrap.dispatchEvent(pointer('pointermove', 185));
influenceWrap.dispatchEvent(pointer('pointerup', 185));
assert.equal(momentumOff.index, 0, 'momentum=false must ignore release velocity even when velocityInfluence is high');
momentumOff.destroy();

const stickySnap = sliderModule.create(influenceHost, {
  preset: 'slide', loop: 'off', velocityInfluence: 0, stickySnap: true
});
influenceWrap.dispatchEvent(pointer('pointerdown', 200));
influenceWrap.dispatchEvent(pointer('pointermove', 145));
influenceWrap.dispatchEvent(pointer('pointerup', 145));
assert.equal(stickySnap.index, 1, 'stickySnap=true must choose the nearest slide after a fractional drag');
stickySnap.destroy();
influenceHost.remove();

const bounceHost = document.createElement('div');
bounceHost.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div class="kt-slide">A</div><div class="kt-slide">B</div><div class="kt-slide">C</div></div></div>';
document.body.appendChild(bounceHost);
const bounceWrap = bounceHost.querySelector('.kt-slider-wrap');
Object.defineProperty(bounceWrap, 'getBoundingClientRect', { configurable: true, value: () => ({ left: 0, top: 0, width: 300, height: 100, right: 300, bottom: 100 }) });
bounceHost.querySelectorAll('.kt-slide').forEach((slide) => Object.defineProperty(slide, 'offsetWidth', { configurable: true, value: 100 }));
const bounceSlider = sliderModule.create(bounceHost, { preset: 'slide', loop: 'off', initial: 0, bounce: true });
bounceWrap.dispatchEvent(pointer('pointerdown', 100));
bounceWrap.dispatchEvent(pointer('pointermove', 500));
bounceWrap.dispatchEvent(pointer('pointerup', 500));
assert.equal(bounceSlider.index, 0, 'bounce must settle an overscrolled first edge at index 0');
await new Promise((resolve) => setTimeout(resolve, 180));
bounceSlider.destroy();
assert.equal(bounceWrap.getAttribute('style'), null, 'bounce destroy must restore the authored wrapper style');
bounceHost.remove();

// Track settling is elapsed-time based rather than frame-count based: driving
// the same 100ms at 60Hz and 120Hz should land at practically the same point.
// The first callback also establishes a normal frame interval, while a long
// gap is capped inside the solver so a background-tab resume cannot teleport.
const realRequestAnimationFrame = globalThis.requestAnimationFrame;
const realCancelAnimationFrame = globalThis.cancelAnimationFrame;
let queuedFrame = null;
let frameId = 0;
globalThis.requestAnimationFrame = (callback) => { queuedFrame = { callback, id: ++frameId }; return frameId; };
globalThis.cancelAnimationFrame = (id) => { if (queuedFrame?.id === id) queuedFrame = null; };
const driveSlider = (times) => {
  const host = document.createElement('div');
  host.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div class="kt-slide">A</div><div class="kt-slide">B</div><div class="kt-slide">C</div></div></div>';
  document.body.appendChild(host);
  const instance = sliderModule.create(host, { preset: 'slide', loop: 'off', smoothing: 0.14 });
  instance.goTo(1);
  for (const time of times) {
    const frame = queuedFrame;
    queuedFrame = null;
    assert.ok(frame, `slider must schedule a frame at ${time}ms`);
    frame.callback(time);
  }
  const transform = host.querySelector('.kt-slide').style.transform;
  instance.destroy();
  host.remove();
  return Number(transform.match(/translate3d\((-?[\d.]+)px/)?.[1] || 0);
};
const at60Hz = driveSlider([16.667, 33.334, 50.001, 66.668, 83.335, 100.002]);
const at120Hz = driveSlider(Array.from({ length: 12 }, (_, index) => (index + 1) * 8.333));
assert.ok(Math.abs(at60Hz - at120Hz) < 0.02, `slider settling must be refresh-rate invariant — ${at60Hz} vs ${at120Hz}`);
const cappedGap = driveSlider([16.667, 500]);
assert.ok(cappedGap < 0.99, `a long frame gap must be capped instead of teleporting — ${cappedGap}`);
const springHost = document.createElement('div');
springHost.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div class="kt-slide">A</div><div class="kt-slide">B</div><div class="kt-slide">C</div></div></div>';
document.body.appendChild(springHost);
const springSlider = sliderModule.create(springHost, { preset: 'slide', loop: 'off', spring: true, stiffness: 170, damping: 24, mass: 1 });
const springInitial = springHost.querySelector('.kt-slide').style.transform;
springSlider.goTo(1);
let springIntermediate = '';
for (let time = 16.667; time <= 3000 && queuedFrame; time += 16.667) {
  const frame = queuedFrame;
  queuedFrame = null;
  frame.callback(time);
  if (!springIntermediate) springIntermediate = springHost.querySelector('.kt-slide').style.transform;
}
assert.notEqual(springIntermediate, springInitial, 'spring settling must render an intermediate frame');
assert.equal(springSlider.index, 1, 'spring settling must reach the requested slide');
assert.equal(queuedFrame, null, 'spring settling must stop scheduling frames after it settles');
springSlider.destroy();
springHost.remove();
globalThis.requestAnimationFrame = realRequestAnimationFrame;
globalThis.cancelAnimationFrame = realCancelAnimationFrame;

// Offscreen sliders stop their timer, progress loop and in-flight transform rAF,
// then resume from the preserved autoplay deadline when they re-enter the view.
const visibilitySliderHost = document.createElement('div');
visibilitySliderHost.innerHTML = '<div class="kt-slider-wrap"><div class="kt-slider-track"><div>A</div><div>B</div></div></div>';
document.body.appendChild(visibilitySliderHost);
const visibilitySlider = sliderModule.create(visibilitySliderHost, { preset: 'slide', autoplay: 45, pauseWhenOffscreen: true });
const visibilityObserver = TestIntersectionObserver.instances.at(-1);
assert.ok(visibilityObserver?.target === visibilitySliderHost, 'slider must observe its host for offscreen lifecycle');
visibilityObserver.setVisible(false);
const offscreenIndex = visibilitySlider.index;
await new Promise((resolve) => setTimeout(resolve, 80));
assert.equal(visibilitySlider.index, offscreenIndex, 'offscreen slider must stop autoplay');
visibilityObserver.setVisible(true);
await new Promise((resolve) => setTimeout(resolve, 70));
assert.notEqual(visibilitySlider.index, offscreenIndex, 'visible slider must resume autoplay');
visibilitySlider.destroy();
assert.equal(visibilityObserver.target, null, 'destroy must disconnect the offscreen observer');
visibilitySliderHost.remove();

const radialVisibilityHost = document.createElement('div');
radialVisibilityHost.innerHTML = '<div>A</div><div>B</div><div>C</div>';
document.body.appendChild(radialVisibilityHost);
const radialVisibility = sliderModule.create(radialVisibilityHost, { effect: 'radial', autoplay: 45, pauseWhenOffscreen: true, controls: false });
const radialVisibilityObserver = TestIntersectionObserver.instances.at(-1);
radialVisibilityObserver.setVisible(false);
const radialOffscreenIndex = radialVisibility.index;
await new Promise((resolve) => setTimeout(resolve, 80));
assert.equal(radialVisibility.index, radialOffscreenIndex, 'offscreen Radial must stop autoplay');
radialVisibilityObserver.setVisible(true);
await new Promise((resolve) => setTimeout(resolve, 70));
assert.notEqual(radialVisibility.index, radialOffscreenIndex, 'visible Radial must resume autoplay');
radialVisibility.destroy();
radialVisibilityHost.remove();

const secondsCounter = document.createElement('span');
document.body.appendChild(secondsCounter);
const secondsInstance = counterModule.create(secondsCounter, {
  mode: 'clock', secondsOnly: true, secondsDigits: 3, secondsLabel: 'S', since: new Date(Date.now() - 12000).toISOString()
});
assert.match(secondsCounter.textContent, /^0?12S$/, 'clock seconds-only mode must render an elapsed seconds value with its unit');
assert.equal(secondsCounter.querySelector('.kt-counter-separator--blink'), null, 'the seconds-only unit must not blink like a clock colon');
secondsInstance.destroy();
secondsCounter.remove();

const protectedSecondsCounter = document.createElement('span');
document.body.appendChild(protectedSecondsCounter);
const protectedSecondsInstance = counterModule.create(protectedSecondsCounter, {
  // A copied playground configuration can retain an old non-clock mode. The
  // seconds-only semantic must still win instead of rendering a numeric mode.
  mode: 'pop', secondsOnly: true, secondsDigits: 3, secondsLabel: 'S', since: new Date(Date.now() - 12000).toISOString()
});
assert.match(protectedSecondsCounter.textContent, /^0?12S$/, 'secondsOnly must force the Clock renderer when a conflicting mode is supplied');
assert.ok(protectedSecondsCounter.querySelector('.kt-counter-clock-digit'), 'secondsOnly with a conflicting mode must use Clock digit markup');
protectedSecondsInstance.destroy();
protectedSecondsCounter.remove();

const countdownSecondsCounter = document.createElement('span');
document.body.appendChild(countdownSecondsCounter);
const countdownSecondsInstance = counterModule.create(countdownSecondsCounter, {
  mode: 'clock', secondsOnly: true, secondsDigits: 3, secondsLabel: 'S', until: new Date(Date.now() + 12000).toISOString()
});
const countdownSeconds = Number(countdownSecondsCounter.textContent.replace('S', ''));
assert.ok(countdownSeconds > 0 && countdownSeconds <= 12, 'secondsOnly must support a future until timestamp as a remaining-seconds countdown');
countdownSecondsInstance.destroy();
countdownSecondsCounter.remove();

const relativeTime = document.createElement('time');
relativeTime.textContent = '2026년 8월 9일 10:30';
document.body.appendChild(relativeTime);
const relativeInstance = dateTimeModule.create(relativeTime, {
  date: '2026년 8월 9일 10:30', mode: 'both', locale: 'ko', now: '2026-08-09T10:35:00+09:00', live: false
});
assert.match(relativeTime.textContent, /5분 전/, 'dateTime must parse Korean server-rendered dates into relative time');
assert.match(relativeTime.textContent, /2026/, 'dateTime both mode must retain an absolute timestamp');
relativeInstance.destroy();
assert.equal(relativeTime.textContent, '2026년 8월 9일 10:30', 'dateTime destroy must restore server-rendered content');
relativeTime.remove();

for (const serverDate of ['20260809103000', '2026년 8월 9일 10시 30분', '09/08/2026 10:30', '2026-08-09 10:30:00', '2026-08-09T10:30:00']) {
  const compactTime = document.createElement('time');
  document.body.appendChild(compactTime);
  const compactInstance = dateTimeModule.create(compactTime, {
    date: serverDate, mode: 'relative', locale: 'ko', now: '2026-08-09T10:35:00+09:00', live: false
  });
  assert.match(compactTime.textContent, /5분 전/, `dateTime must normalize non-ISO server date: ${serverDate}`);
  compactInstance.destroy();
  compactTime.remove();
}

const invalidServerDate = document.createElement('time');
document.body.appendChild(invalidServerDate);
const invalidDateInstance = dateTimeModule.create(invalidServerDate, {
  date: '2026-02-31 10:30:00', mode: 'relative', locale: 'ko', fallback: '날짜 확인 필요', live: false
});
assert.equal(invalidServerDate.textContent, '날짜 확인 필요', 'dateTime must reject impossible calendar dates instead of normalizing into a different day');
invalidDateInstance.destroy();
invalidServerDate.remove();

for (const invalidDate of [
  ['2026-02-31T10:30:00', 'en-US'],
  ['2026/02/31 10:30', 'en-US'],
  ['2026.02.31 10:30', 'ko'],
  ['2026-08-09 25:70:00', 'ko']
]) {
  const invalidVariant = document.createElement('time');
  document.body.appendChild(invalidVariant);
  const invalidVariantInstance = dateTimeModule.create(invalidVariant, {
    date: invalidDate[0], mode: 'relative', locale: invalidDate[1], fallback: '날짜 확인 필요', live: false
  });
  assert.equal(invalidVariant.textContent, '날짜 확인 필요', `dateTime must reject invalid calendar/time input: ${invalidDate[0]}`);
  invalidVariantInstance.destroy();
  invalidVariant.remove();
}

for (const validDate of [
  '2026-8-9 10:30',
  '2026/08/09 10:30:00+0900',
  '2026.08.09T10:30:00+09:00',
  '2026-08-09 10:30:00.123456 +09:00',
  '09/08/2026 10:30:00.987654+0900'
]) {
  const validVariant = document.createElement('time');
  document.body.appendChild(validVariant);
  const validVariantInstance = dateTimeModule.create(validVariant, {
    date: validDate, mode: 'relative', locale: 'ko', now: '2026-08-09T10:35:00+09:00', live: false
  });
  assert.match(validVariant.textContent, /5분 전/, `dateTime must normalize valid year-first server date: ${validDate}`);
  validVariantInstance.destroy();
  validVariant.remove();
}

const cutoffRelativeTime = document.createElement('time');
document.body.appendChild(cutoffRelativeTime);
const cutoffInstance = dateTimeModule.create(cutoffRelativeTime, {
  date: '2026-06-01T10:30:00+09:00', mode: 'relative', locale: 'ko', now: '2026-08-09T10:35:00+09:00',
  relativeCutoff: 30, relativeCutoffUnit: 'day', dateStyle: 'medium', live: false
});
assert.match(cutoffRelativeTime.textContent, /2026/, 'relative mode must switch to the localized absolute date after its configured cutoff');
cutoffInstance.destroy();
cutoffRelativeTime.remove();

const fixedUnitRelativeTime = document.createElement('time');
document.body.appendChild(fixedUnitRelativeTime);
const fixedUnitInstance = dateTimeModule.create(fixedUnitRelativeTime, {
  date: '2026-08-09T10:30:00+09:00', mode: 'relative', locale: 'ko', now: '2026-08-09T10:35:00+09:00',
  relativeUnit: 'day', relativeRounding: 'trunc', numeric: 'always', live: false
});
assert.match(fixedUnitRelativeTime.textContent, /0일 전/, 'relativeUnit must allow a deliberately fixed calendar unit instead of automatic unit selection');
fixedUnitInstance.destroy();
fixedUnitRelativeTime.remove();

// Flash is an exposure strobe, while Fade is a single opaque cover dissolving.
// Record the WAAPI frames so a future refactor cannot collapse them into the
// same opacity curve again.
const pageRevealFrames = [];
const nativeAnimate = window.HTMLElement.prototype.animate;
window.HTMLElement.prototype.animate = function recordPageReveal(frames, options) {
  pageRevealFrames.push({ frames, options, background: this.style.background, filter: this.style.filter });
  return { finished: new Promise(() => {}), cancel() {}, pause() {}, play() {} };
};
const pageRevealHost = document.createElement('main');
document.body.appendChild(pageRevealHost);
const flashReveal = pageRevealModule.create(pageRevealHost, { effect: 'flash', duration: 0.4, color: '#ff5b1c' });
const flashFrames = pageRevealFrames.splice(0);
flashReveal.destroy();
const fadeReveal = pageRevealModule.create(pageRevealHost, { effect: 'fade', duration: 0.4, color: '#ff5b1c' });
const fadeFrames = pageRevealFrames.splice(0);
fadeReveal.destroy();
const capturePageReveal = (effect) => {
  const instance = pageRevealModule.create(pageRevealHost, { effect, duration: 0.4, color: '#ff5b1c' });
  const frames = pageRevealFrames.splice(0);
  const layers = [...pageRevealHost.ownerDocument.documentElement.querySelectorAll('[aria-hidden="true"]')]
    .map((node) => ({ maskImage: node.style.maskImage, webkitMaskImage: node.style.webkitMaskImage }));
  instance.destroy();
  return { frames, layers };
};
const curtainCapture = capturePageReveal('curtain');
const irisCapture = capturePageReveal('iris');
const dissolveCapture = capturePageReveal('dissolve');
const pushCapture = capturePageReveal('push');
window.HTMLElement.prototype.animate = nativeAnimate;
pageRevealHost.remove();
// Flash has been wrong twice, in opposite directions, and both failures are
// pinned here.
//
// v1 was a five-keyframe `steps(1,end)` double pulse over a page that was never
// covered — two hard on/off blinks that read as a rendering fault.
// v2 blew an opaque cover out to white and then ramped its opacity to zero,
// which is structurally a fade (a global opacity ramp with a colour change) and
// was reported as looking exactly like one.
//
// v3 is an anamorphic light streak that CUTS the frame open: the cover is
// clipped away from the centre and never changes opacity at all. So the two
// invariants are: the cover animates clip-path, and nothing in the preset ramps
// the cover's opacity.
const flashCover = flashFrames.find(({ frames }) => frames.length === 2 && frames[0].clipPath === 'inset(0 0 0 0)');
assert.ok(flashCover, 'Page Reveal flash must clip the cover open rather than fading it');
assert.equal(flashCover.frames[1].clipPath, 'inset(50% 0 50% 0)', 'Page Reveal flash must open the cover from the centre outwards');
assert.ok(flashCover.frames.every((frame) => frame.opacity === undefined),
  'Page Reveal flash must not ramp the cover opacity — that is what made it read as fade');
assert.ok(flashFrames.every(({ options }) => !String(options?.easing ?? '').includes('steps')),
  'Page Reveal flash must interpolate — a step easing is what made v1 look like a double blink');
assert.ok(flashFrames.some(({ frames }) => frames.some((frame) => /scaleY\(\d{2,}\)/.test(String(frame.transform || '')))),
  'Page Reveal flash must blow a light streak out vertically');
assert.ok(fadeFrames.length === 1 && fadeFrames[0].frames.length === 2 && fadeFrames[0].frames[0].opacity === 1 && fadeFrames[0].frames[1].opacity === 0, 'Page Reveal fade must remain one continuous cover dissolve');
assert.ok(curtainCapture.frames.some(({ frames }) => frames.some((frame) => /scale[XY]\(1\)/.test(String(frame.transform || '')))),
  'Page Reveal curtain must remain a directional cover movement, not a fade alias');
assert.ok(irisCapture.frames.some(({ frames }) => frames.some((frame) => String(frame.clipPath || '').startsWith('circle('))),
  'Page Reveal iris must expose a circular clip-path aperture');
assert.ok(dissolveCapture.layers.some(({ maskImage, webkitMaskImage }) => maskImage || webkitMaskImage),
  'Page Reveal dissolve must use a feathered mask layer');
assert.ok(pushCapture.frames.some(({ frames }) => frames.some((frame) => String(frame.transform || '').includes('translateY(11vh)'))),
  'Page Reveal push must animate the page host instead of duplicating curtain opacity');

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

// View Transitions is an opt-in progressive enhancement for same-document
// reorders. The native callback owns the DOM mutation; Kineto only applies
// temporary names and restores any authored inline value after the transition.
const originalStartViewTransition = document.startViewTransition;
const hadStartViewTransition = 'startViewTransition' in document;
let nativeTransitionCalls = 0;
Object.defineProperty(document, 'startViewTransition', {
  configurable: true,
  value(callback) {
    nativeTransitionCalls += 1;
    callback();
    return { finished: Promise.resolve() };
  }
});
flipItems.forEach((item, index) => {
  item.setAttribute('data-kt-layout-id', `card-${index}`);
  if (index === 0) item.style.viewTransitionName = 'authored-card';
});
const nativeFlip = flipModule.create(flipGrid, { viewTransition: true, watch: false });
nativeFlip.reorder([...flipItems].reverse());
assert.equal(nativeTransitionCalls, 1, 'FLIP must use the native View Transition when explicitly enabled');
assert.equal(flipGrid.firstElementChild, flipItems[5], 'native View Transition callback must own the reorder mutation');
await new Promise((resolve) => setTimeout(resolve, 0));
assert.equal(flipItems[0].style.viewTransitionName, 'authored-card', 'native View Transition must restore authored names');
assert.equal(flipItems[1].style.getPropertyValue('view-transition-name'), '', 'native View Transition names must be temporary');
nativeFlip.destroy();
if (hadStartViewTransition) Object.defineProperty(document, 'startViewTransition', { configurable: true, value: originalStartViewTransition });
else delete document.startViewTransition;
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

// Co-mounting is currently possible because each module owns its OWN overlay
// child rather than writing into the host, and because the shared box-shadow is
// composed from custom properties instead of one module overwriting the other's
// string. Measured in a browser: children 1 -> 2 with both mounted, back to 1
// after one is destroyed, and Tilt's transform keeps animating throughout.
//
// None of that is guaranteed by anything — it is a property of how these two
// modules happen to be written. See docs/rfc/module-composition.md: `transform`
// is a single string slot and fourteen modules write it on the host, so the next
// pair to be co-mounted may well clobber each other. Pin the working case so a
// refactor cannot silently take it away.
const combo = document.createElement('div');
document.body.appendChild(combo);
Object.defineProperty(combo, 'clientWidth', { configurable: true, value: 240 });
Object.defineProperty(combo, 'clientHeight', { configurable: true, value: 140 });
combo.getBoundingClientRect = () => ({ left: 0, top: 0, width: 240, height: 140, right: 240, bottom: 140 });
const comboTilt = tiltModule.create(combo, { max: 12, glare: false });
const tiltOnlyChildren = combo.children.length;
const comboGlow = cardGlowModule.create(combo, { mode: 'spotlight' });
assert.ok(
  combo.children.length > tiltOnlyChildren,
  `Card Glow must add its own overlay instead of reusing Tilt's (${tiltOnlyChildren} -> ${combo.children.length})`
);
assert.ok(
  combo.style.transformStyle === 'preserve-3d',
  'mounting Card Glow must not clear the 3D context Tilt established'
);
comboGlow.destroy();
assert.equal(
  combo.children.length, tiltOnlyChildren,
  'destroying Card Glow must remove only its own overlay'
);
assert.ok(
  combo.style.transformStyle === 'preserve-3d',
  'destroying Card Glow must leave Tilt fully mounted'
);
comboTilt.destroy();
assert.equal(combo.children.length, 0, 'both modules must clean up after themselves');
combo.remove();
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
