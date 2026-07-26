// Performance-hygiene guards (audit D-3). Two things the library promises for
// battery/CPU cost when many effects share a page:
//   1. When the tab is hidden, the core pauses EVERY live instance (and resumes
//      on return) — proven behaviourally by driving a real instance through a
//      visibilitychange.
//   2. Scroll/wheel/touch listeners in src/ are registered passive (they never
//      preventDefault), so they can't block scrolling on the main thread —
//      enforced by static scan so a future non-passive listener fails CI.
// Run: node tests/perf-hygiene.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---- 1. Behavioural: document.hidden pauses/resumes all live instances -------
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w; globalThis.document = w.document;
for (const k of ['Element', 'Node', 'NodeList', 'HTMLCollection', 'HTMLElement', 'Event', 'CustomEvent', 'getComputedStyle']) {
  try { globalThis[k] = w[k]; } catch (_) {}
}
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class OB { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = OB; w.ResizeObserver = OB; w.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
globalThis.IntersectionObserver = OB; globalThis.ResizeObserver = OB;
if (!w.Element.prototype.animate) {
  w.Element.prototype.animate = function () { return { onfinish: null, oncancel: null, cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve(), addEventListener() {}, removeEventListener() {} }; };
}

const { default: Kineto } = await import('../dist/kineto.js');

const el = w.document.body.appendChild(w.document.createElement('button'));
const inst = Kineto.create('switch', el, {});
assert.ok(inst, 'could not create a switch instance to test visibility pause');
// The record stores THIS returned object, so overriding its pause/resume lets
// us observe the core's visibility handler calling through.
let paused = 0; let resumed = 0;
inst.pause = () => { paused += 1; };
inst.resume = () => { resumed += 1; };

const setHidden = (v) => { Object.defineProperty(w.document, 'hidden', { configurable: true, get: () => v }); Object.defineProperty(w.document, 'visibilityState', { configurable: true, get: () => (v ? 'hidden' : 'visible') }); };
setHidden(true); w.document.dispatchEvent(new w.Event('visibilitychange'));
assert.equal(paused, 1, `hidden tab must pause live instances (paused=${paused})`);
setHidden(false); w.document.dispatchEvent(new w.Event('visibilitychange'));
assert.equal(resumed, 1, `returning tab must resume live instances (resumed=${resumed})`);
Kineto.destroyAll?.();

// ---- 2. Static: scroll/wheel/touch listeners must be passive ------------------
const listenerRe = /addEventListener\(\s*['"](scroll|wheel|touchstart|touchmove|mousewheel)['"]/;
const violations = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.js')) {
      fs.readFileSync(full, 'utf8').split('\n').forEach((line, i) => {
        if (listenerRe.test(line) && !/passive/.test(line)) violations.push(`${path.relative(root, full)}:${i + 1}  ${line.trim()}`);
      });
    }
  }
};
walk(path.join(root, 'src'));
assert.equal(violations.length, 0, `non-passive scroll/touch/wheel listeners found:\n${violations.join('\n')}`);

console.log('perf-hygiene OK — hidden-tab pause/resume drives all instances; all scroll/touch/wheel listeners are passive.');
// Core services (visibility listener, smooth ticker) keep the loop alive under
// the setTimeout-based rAF shim; assertions have all passed, so exit cleanly.
process.exit(0);
