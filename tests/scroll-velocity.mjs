// Scroll Velocity — every contracted variant must look different.
//
// `blur` used to fall through to the skew transform with `maxBlur` at 0, so
// `data-kt-scroll-velocity="blur"` was `skew` under another name: documented,
// contracted, and indistinguishable on screen. This drives each variant with
// the same scroll speed through a stand-in ScrollTrigger and compares what the
// element ends up with (inline transform and filter) — no browser needed.
//
// Run: node tests/scroll-velocity.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'))
  .modules.find(({ name }) => name === 'scrollVelocity');

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const frames = new Map();
let nextId = 0;
let time = 0;
globalThis.requestAnimationFrame = (callback) => { frames.set(++nextId, callback); return nextId; };
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
const step = () => {
  time += 1000 / 60;
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(time));
};

let trigger;
const { setAnimationEngine } = await import('../src/runtime.js');
setAnimationEngine({ ScrollTrigger: { create(options) { trigger = options; return { kill() {} }; } } });
const { default: velocity } = await import('../src/modules/scrollVelocity.js');

const looks = new Map();
for (const variant of contract.variants) {
  const el = document.createElement('div');
  el.style.color = 'red';
  const original = el.getAttribute('style');
  const instance = velocity.create(el, { preset: variant, spring: false });
  step();
  trigger.onUpdate({ getVelocity: () => 2200, direction: 1 });
  for (let i = 0; i < 6; i += 1) step();
  looks.set(variant, { transform: el.style.transform, filter: el.style.filter, willChange: el.style.willChange });
  instance.destroy();
  assert.equal(el.getAttribute('style'), original, `${variant}: destroy() restores the element`);
}

const signatures = [...looks.values()].map((look) => `${look.transform}|${look.filter}`);
assert.equal(new Set(signatures).size, contract.variants.length,
  `every variant must look different at the same speed: ${JSON.stringify(Object.fromEntries(looks))}`);

const blur = looks.get('blur');
assert.match(blur.filter, /^blur\((?!0px)[\d.]+px\)$/, 'blur softens the element with speed');
assert.equal(blur.transform, '', 'blur moves nothing');
assert.equal(blur.willChange, 'filter', 'and only promises a filter change');
assert.equal(looks.get('skew').filter, '', 'skew does not blur unless maxBlur is given');
assert.match(looks.get('skew').transform, /^skewX\(/);

console.log(`scroll-velocity OK — ${contract.variants.length} variants, ${contract.variants.length} distinct looks at the same speed (blur: ${blur.filter}, no transform); destroy restores each element.`);
dom.window.close();
