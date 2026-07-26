// B-1 lazy-render proof: the demo has ~119 option panels, and building every
// panel body up front (fieldsets, controls, code, search) is the dominant load
// cost. panelFor() must build only the lightweight <details>/<summary> trigger
// eagerly and defer the heavy body until its panel is first opened.
//
// This runs the REAL demo/playground.js in a jsdom window with a Kineto stub,
// mounts it over two demo cards, and asserts:
//   1. after mount, every settings trigger (summary) exists  — eager
//   2. after mount, zero option bodies exist                 — lazy
//   3. opening one panel builds exactly one body with fields — on demand
// Run: node tests/playground-lazy.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = `<!doctype html><html><body><main>
  <article class="card"><h3>Reveal</h3><div class="demo-stage"><div class="reveal-demo-card" data-kt-reveal="fade" data-kt-duration="0.8">A</div></div><div class="replay-row"><button class="btn" data-action="replay-parent" data-module="reveal">Replay</button></div></article>
  <article class="card"><h3>Marquee</h3><div class="demo-stage"><div data-kt-marquee><span>hi</span></div></div><div class="replay-row"><button class="btn" data-action="replay-parent" data-module="marquee">Replay</button></div></article>
</main></body></html>`;

const dom = new JSDOM(html, { pretendToBeVisual: true, runScripts: 'outside-only', url: 'http://localhost/' });
const { window } = dom;
window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
window.cancelAnimationFrame = (id) => clearTimeout(id);
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const store = {};
Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } } });
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
window.Kineto = { registry: {}, reveal() {}, marquee() {}, overflowText() {}, destroyModule() {}, applyModule() {} };
window.ktToast = () => {};

window.eval(fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8'));
const KP = window.KinetoPlayground;
assert.ok(KP && typeof KP.mount === 'function', 'KinetoPlayground.mount missing');
KP.mount(window.document);

const triggers = window.document.querySelectorAll('.kt-playground > summary').length;
const bodiesBefore = window.document.querySelectorAll('.kt-playground__body').length;
assert.equal(triggers, 2, `expected 2 eager settings triggers, got ${triggers}`);
assert.equal(bodiesBefore, 0, `expected 0 option bodies before opening (lazy), got ${bodiesBefore}`);

const first = window.document.querySelector('.kt-playground');
first.open = true;
first.dispatchEvent(new window.Event('toggle'));

const bodiesAfter = window.document.querySelectorAll('.kt-playground__body').length;
const fieldsAfter = window.document.querySelectorAll('.kt-playground__body .kt-playground__field').length;
assert.equal(bodiesAfter, 1, `expected exactly 1 body built after opening one panel, got ${bodiesAfter}`);
assert.ok(fieldsAfter > 0, `opened body should contain option fields, got ${fieldsAfter}`);

console.log(`playground-lazy OK — ${triggers} eager triggers, 0 bodies at load, body+${fieldsAfter} fields built only on open.`);
