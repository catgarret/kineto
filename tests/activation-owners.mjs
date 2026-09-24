// An option that shares its name with another module's activation attribute
// belongs to the element's own module — it must not start a second module.
//
// `data-kt-hold="1400"` on a Text Transition is "hold each text for 1.4s". It
// also used to turn the element into a Hold (press-and-hold) button, because
// the core's hand-kept list of such names knew only Text Reveal and Text Split.
// The list is now generated from the contract (src/activationOwners.js); this
// test checks the generated map against the contract and the behaviour on
// every collision the contract has.
//
// Run: node tests/activation-owners.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const features = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));

const dom = new JSDOM('<!doctype html><body><main></main></body>', { pretendToBeVisual: true });
const w = dom.window;
for (const key of ['window', 'document', 'Element', 'NodeList', 'HTMLCollection', 'MutationObserver', 'CustomEvent', 'getComputedStyle']) {
  globalThis[key] = key === 'window' ? w : (key === 'getComputedStyle' ? w.getComputedStyle.bind(w) : w[key]);
}
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: w.navigator });
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);

const { ACTIVATION_OPTION_OWNERS } = await import('../src/activationOwners.js');
const { default: Kineto } = await import('../src/core.js');
// Scroll-driven modules (Text Reveal, Text Split) wait for GSAP before they are
// created; hand the core a stand-in so discovery is all that is tested here.
Kineto.setAnimationEngine({ gsap: { registerPlugin() {}, to() {} }, ScrollTrigger: { create() { return { kill() {} }; }, refresh() {} } });

// 1. The generated map is exactly the contract's collisions.
const names = new Set(features.modules.map((module) => module.name));
const expected = {};
for (const module of features.modules) {
  for (const option of module.publicOptions) {
    if (option !== module.name && names.has(option)) (expected[option] = expected[option] || []).push(module.name);
  }
}
for (const key of Object.keys(expected)) expected[key].sort();
assert.deepEqual(
  Object.fromEntries(Object.entries(ACTIVATION_OPTION_OWNERS).map(([key, list]) => [key, [...list].sort()])),
  expected,
  'src/activationOwners.js must list every option that is also an activation name — run node scripts/sync-playground-options.mjs'
);

// 2. On every such element the colliding name does not start the other module.
// Stand-in modules record whether they were created, so the check is about the
// core's discovery rule alone, not about what each real module needs to run.
const created = [];
const dash = (value) => value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
for (const name of new Set([...Object.keys(ACTIVATION_OPTION_OWNERS), ...Object.values(ACTIVATION_OPTION_OWNERS).flat()])) {
  Kineto.unregister(name);
  Kineto.register(name, { create: (el) => { created.push({ name, el }); return { el, destroy() {} }; } });
}
const app = document.querySelector('main');
const cases = [];
for (const [activation, owners] of Object.entries(ACTIVATION_OPTION_OWNERS)) {
  for (const owner of owners) {
    const el = document.createElement('div');
    el.setAttribute(`data-kt-${dash(owner)}`, '');
    el.setAttribute(`data-kt-${dash(activation)}`, '1400');
    app.append(el);
    cases.push({ el, owner, activation });
  }
}
Kineto.scan(app);
await new Promise((resolve) => setTimeout(resolve, 20));
for (const { el, owner, activation } of cases) {
  const names = created.filter((entry) => entry.el === el).map((entry) => entry.name);
  assert.ok(names.includes(owner), `${owner} must start on its own element`);
  assert.ok(!names.includes(activation),
    `data-kt-${dash(activation)} on a ${owner} element is ${owner}'s option and must not also start ${activation}`);
}

// 3. …while the same attribute on its own still starts its module.
const alone = document.createElement('div');
alone.setAttribute('data-kt-hold', '');
app.append(alone);
Kineto.scan(app);
await new Promise((resolve) => setTimeout(resolve, 20));
assert.ok(created.some((entry) => entry.el === alone && entry.name === 'hold'), 'data-kt-hold alone must still start Hold');

console.log(`activation-owners OK — ${cases.length} option/activation collisions from the contract, none starts a second module; the attribute alone still activates.`);
process.exit(0);
