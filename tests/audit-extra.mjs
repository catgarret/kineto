// Extra acceptance tests (audit J-11).
//  1. Invalid cubic-bezier (x outside 0..1) is rejected, not silently accepted.
//  2. Spring and cubic-bezier are DIFFERENT easing models — spring resolves to a
//     CSS linear() sample, never a cubic-bezier() (name/model honesty, C-1/J-3).
//  3. The demo settings panel rolls a bad value back to the last known good
//     state instead of leaving a broken instance (B-6).
// Run: node tests/audit-extra.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── 1 & 2: easing validity + model distinction ───────────────────────────────
const easings = await import('../src/easings.js');
assert.equal(easings.isValidBezierPoints([0.2, 0, 0.8, 1]), true, 'a valid bezier must pass');
assert.equal(easings.isValidBezierPoints([-0.2, 0, 0.8, 1]), false, 'x1 < 0 must be rejected');
assert.equal(easings.isValidBezierPoints([0.2, 0, 1.4, 1]), false, 'x2 > 1 must be rejected');

const springCss = easings.toCSS({ spring: { stiffness: 170, damping: 12, mass: 1 } });
assert.match(springCss, /^linear\(/, `spring must resolve to a CSS linear() sample, got "${springCss}"`);
assert.doesNotMatch(springCss, /cubic-bezier/, 'spring must NOT be represented as a cubic-bezier');
assert.match(easings.toCSS('spring'), /^linear\(/, "the 'spring' token must resolve to linear()");
const bez = easings.toCSS([0.2, 0, 0.8, 1]);
assert.match(bez, /^cubic-bezier\(/, 'a cubic-bezier point array must resolve to cubic-bezier()');
assert.equal(easings.EASINGS.families.Spring, 'spring', 'Spring family must be typed as spring, not cubic-bezier');
assert.equal(easings.EASINGS.families.Elastic, 'linear', 'Elastic must be typed as linear (sampled), not cubic-bezier');

// ── 3: demo panel rolls back a bad value to last-known-good ───────────────────
const dom = new JSDOM('<!doctype html><body><main><article class="card"><h3>Reveal</h3><div class="demo-stage"><div class="reveal-demo-card" data-kt-reveal="fade" data-kt-duration="0.8">A</div></div><div class="replay-row"><button data-action="replay-parent" data-module="reveal">R</button></div></article></main></body>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const { window: w } = dom;
w.requestAnimationFrame = (cb) => setTimeout(() => cb(1), 0); w.cancelAnimationFrame = (i) => clearTimeout(i);
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const store = {}; Object.defineProperty(w, 'localStorage', { configurable: true, value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = '' + v; }, removeItem: (k) => { delete store[k]; } } });
w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
if (!w.Element.prototype.animate) w.Element.prototype.animate = () => ({ cancel() {}, play() {}, pause() {}, finished: Promise.resolve() });
// Stub Kineto: create() THROWS when duration is the bad value, simulating an
// invalid option/combination; getInstance returns nothing so rebuildModule takes
// the recreate path.
const created = [];
w.Kineto = {
  registry: {}, overflowText() {}, getInstance() { return null; }, updateModule() { return false; }, destroyModule() {},
  create(name, el) { if (el.getAttribute('data-kt-duration') === '99bad') throw new Error('invalid duration'); created.push(name); }
};
w.ktToast = () => {};
w.eval(fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8'));
w.KinetoPlayground.mount(w.document);
const target = w.document.querySelector('[data-kt-reveal]');
const seeded = target.__ktLastGood?.find?.((p) => p[0] === 'data-kt-duration');
assert.equal(seeded?.[1], '0.8', 'last-known-good must be seeded at mount with duration 0.8');
// A bad value is written, then the panel's programmatic validation pass
// rebuilds it. Visible controls apply live, so there is no redundant button.
target.setAttribute('data-kt-duration', '99bad');
const panel = w.document.querySelector('.kt-playground'); panel.open = true; panel.dispatchEvent(new w.Event('toggle'));
panel.__apply?.();
await new Promise((r) => setTimeout(r, 20));
assert.equal(target.getAttribute('data-kt-duration'), '0.8', `bad value must roll back to last-known-good 0.8, got "${target.getAttribute('data-kt-duration')}"`);

console.log('audit-extra OK — invalid bezier rejected; spring≠bezier model; demo rolls a bad value back to last-known-good.');
process.exit(0);
