// Live-update model (audit B-5 / F-2). A module that implements update() must be
// updatable IN PLACE — same instance, no destroy/recreate — while modules that
// don't cleanly fall back to recreate. Kineto.updateModule() is the single entry
// point the demo and consumers use.
// Run: node tests/update-model.mjs
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w; globalThis.document = w.document;
for (const k of ['Element', 'Node', 'NodeList', 'HTMLElement', 'Event', 'CustomEvent', 'getComputedStyle']) globalThis[k] = w[k];
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class OB { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = OB; w.ResizeObserver = OB; globalThis.IntersectionObserver = OB; globalThis.ResizeObserver = OB;
if (!w.Element.prototype.animate) w.Element.prototype.animate = () => ({ onfinish: null, cancel() {}, play() {}, pause() {}, finished: Promise.resolve() });

const { default: Kineto } = await import('../dist/kineto.js');

// A module WITH update() (tooltip) updates in place: same instance, new content.
const btn = w.document.body.appendChild(w.document.createElement('button'));
btn.setAttribute('data-kt-title', 'first');
const inst = Kineto.create('tooltip', btn, { content: 'first' });
assert.ok(inst && typeof inst.update === 'function', 'tooltip must expose update()');
const before = Kineto.getInstance(btn, 'tooltip');
const live = Kineto.updateModule(btn, 'tooltip', { content: 'second' });
assert.equal(live, true, 'updateModule must report a live update for a module that supports it');
const after = Kineto.getInstance(btn, 'tooltip');
assert.equal(before, after, 'tooltip instance must be the SAME object after a live update (no recreate)');
const tip = w.document.querySelector('.kt-tooltip, [role="tooltip"]');
assert.ok(tip && /second/.test(tip.textContent), `tip content should update in place, got "${tip?.textContent}"`);

// A module WITHOUT update() falls back to recreate (still succeeds, new instance).
const box = w.document.body.appendChild(w.document.createElement('button'));
const sw1 = Kineto.create('switch', box, {});
const liveSwitch = Kineto.updateModule(box, 'switch', {});
assert.equal(liveSwitch, false, 'a module without update() must report NO live update (recreate fallback)');
const sw2 = Kineto.getInstance(box, 'switch');
assert.ok(sw2 && sw2 !== sw1, 'switch should have been recreated as a fresh instance');

console.log('update-model OK — update()-capable modules live-update in place; others fall back to recreate via updateModule().');
process.exit(0);
