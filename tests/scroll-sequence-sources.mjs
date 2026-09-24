import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import scrollSequence from '../src/modules/scrollSequence.js';
import { setAnimationEngine } from '../src/runtime.js';

const dom = new JSDOM('<div id="sequence"></div>');
const element = dom.window.document.querySelector('#sequence');

assert.equal(scrollSequence.reduced(element, {}), null, 'scrollSequence must not request a placeholder host when no frame source is configured');
assert.equal(element.style.backgroundImage, '', 'missing frame sources must leave the element untouched');

const instance = scrollSequence.reduced(element, { urlPrefix: '/frames/frame_', padding: 4, extension: '.webp' });
assert.match(element.style.backgroundImage, /\/frames\/frame_0001\.webp/, 'an explicit frame prefix must resolve the first reduced-motion frame');
instance.destroy();
assert.equal(element.getAttribute('style'), null, 'destroy must restore the original element after the static fallback');

console.log('scroll-sequence-sources OK — no implicit example.com request; explicit frame sources still resolve.');


// Repeated scrub updates that round to the same frame must not repaint the
// canvas or repeat onFrame. A real resize still has to redraw because assigning
// canvas.width/height clears the backing store even when the frame is unchanged.
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Element = dom.window.Element;
globalThis.HTMLCanvasElement = dom.window.HTMLCanvasElement;

let resizeCallback = null;
globalThis.ResizeObserver = class {
  constructor(callback) { resizeCallback = callback; }
  observe() {}
  disconnect() {}
};

class FakeImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
  }
  set src(value) {
    this._src = value;
    this.naturalWidth = 640;
    this.naturalHeight = 360;
    this.onload?.();
  }
  get src() { return this._src; }
}
globalThis.Image = FakeImage;

let drawCalls = 0;
const frameCalls = [];
const context = {
  imageSmoothingEnabled: false,
  clearRect() {},
  drawImage() { drawCalls += 1; }
};
dom.window.HTMLCanvasElement.prototype.getContext = () => context;

let tweenTarget = null;
let tweenOptions = null;
const tween = {
  scrollTrigger: { kill() {} },
  pause() {},
  resume() {},
  kill() {}
};
setAnimationEngine({
  gsap: {
    registerPlugin() {},
    to(target, options) {
      tweenTarget = target;
      tweenOptions = options;
      return tween;
    }
  },
  ScrollTrigger: {}
});

element.getBoundingClientRect = () => ({ width: 320, height: 180 });
const live = scrollSequence.create(element, {
  urls: ['/frames/001.jpg', '/frames/002.jpg', '/frames/003.jpg'],
  frames: 3,
  preloadRadius: 1,
  onFrame(index) { frameCalls.push(index); }
});
assert.ok(live, 'configured scrollSequence must create with injected engines');
assert.equal(drawCalls, 1, 'initial loaded frame must paint once');
assert.deepEqual(frameCalls, [0]);

for (let i = 0; i < 12; i += 1) {
  tweenTarget.frame = 0.4;
  tweenOptions.onUpdate();
}
assert.equal(drawCalls, 1, 'scrub updates rounding to frame 0 must not repaint');
assert.deepEqual(frameCalls, [0], 'onFrame reports actual paints, not duplicate scrub ticks');

tweenTarget.frame = 0.6;
tweenOptions.onUpdate();
assert.equal(drawCalls, 2, 'crossing into frame 1 must paint once');
assert.deepEqual(frameCalls, [0, 1]);

for (let i = 0; i < 12; i += 1) {
  tweenTarget.frame = 1.4;
  tweenOptions.onUpdate();
}
assert.equal(drawCalls, 2, 'repeated updates rounding to frame 1 must stay idle');

resizeCallback?.();
assert.equal(drawCalls, 3, 'resize must force redraw of the current frame');
assert.deepEqual(frameCalls, [0, 1, 1], 'forced resize redraw remains observable through onFrame');

live.destroy();
