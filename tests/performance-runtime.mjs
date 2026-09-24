// Deterministic work-count regressions: no wall-clock thresholds.
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body><main></main></body>', { pretendToBeVisual: true });
const w = dom.window;
for (const key of ['window', 'document', 'Element', 'NodeList', 'HTMLCollection', 'MutationObserver', 'CustomEvent']) {
  globalThis[key] = key === 'window' ? w : w[key];
}
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: w.navigator });
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const frames = new Map();
let nextId = 0;
let time = globalThis.performance.now();
globalThis.requestAnimationFrame = (callback) => { frames.set(++nextId, callback); return nextId; };
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
const step = () => {
  time += 1000 / 60;
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach((callback) => callback(time));
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const { default: Kineto } = await import('../src/core.js');
const app = document.querySelector('main');

// scan() discovery cost must scale with engine tiers, not registered module
// count. A hundred activation names still require one selector traversal for
// the native tier; adding a GSAP-tier module makes that two, not 101+.
for (let i = 0; i < 100; i += 1) {
  Kineto.register(`bulkProbe${i}`, { create: (el) => ({ el, destroy() {} }) });
}
const discoveryRoot = document.createElement('section');
for (let i = 0; i < 100; i += 1) {
  const el = document.createElement('div');
  el.setAttribute(`data-kt-bulk-probe${i}`, '');
  discoveryRoot.append(el);
}
let selectorTraversals = 0;
const realQuerySelectorAll = discoveryRoot.querySelectorAll.bind(discoveryRoot);
discoveryRoot.querySelectorAll = (...args) => {
  selectorTraversals += 1;
  return realQuerySelectorAll(...args);
};
Kineto.scan(discoveryRoot);
assert.equal(Kineto.instanceCount, 100);
assert.equal(selectorTraversals, 1, '100 native modules must share one selector traversal');
Kineto.destroy();
for (let i = 0; i < 100; i += 1) Kineto.unregister(`bulkProbe${i}`);

Kineto.register('probe', { create: (el) => ({ el, destroy() {} }) });
const scans = [];
const scan = Kineto.scan;
Kineto.scan = function (root) { scans.push(root); return scan.call(this, root); };
const watcher = Kineto.observe(app, { scan: false, attributes: true });
const parent = document.createElement('section');
app.append(parent);
for (let i = 0; i < 100; i += 1) {
  const el = document.createElement('div');
  parent.append(el);
  el.setAttribute('data-kt-probe', '');
}
await settle();
assert.equal(Kineto.instanceCount, 100);
assert.equal(scans.length, 1, 'one inserted subtree must be scanned once, not once per descendant');
// Existing instances must not parse markup on repeated scans.
const first = parent.firstElementChild;
Object.defineProperty(first, 'dataset', { configurable: true, get() { throw new Error('duplicate option parse'); } });
Kineto.scan(parent);
delete first.dataset;
// An observer callback queues a microtask, then disconnect happens before that
// microtask. Native disconnect alone cannot cancel our separately queued work.
scans.length = 0;
const late = document.createElement('div');
late.setAttribute('data-kt-probe', '');
app.append(late);
await Promise.resolve();
watcher.disconnect();
await settle();
assert.equal(scans.length, 0, 'disconnect must cancel queued scans');
assert.equal(Kineto.getInstance(late, 'probe'), null);
Kineto.destroy();
// Disjoint siblings still scan independently. Nodes moved out of the watched
// root before delivery must not be initialized; connected moves keep instances.
app.innerHTML = '';
scans.length = 0;
const moves = Kineto.observe(app, { scan: false });
const left = document.createElement('div');
const right = document.createElement('div');
const movedOut = document.createElement('div');
for (const node of [left, right, movedOut]) {
  node.setAttribute('data-kt-probe', '');
  app.append(node);
}
document.body.append(movedOut);
await settle();
assert.equal(scans.length, 2);
assert.equal(Kineto.instanceCount, 2);
assert.equal(Kineto.getInstance(movedOut, 'probe'), null);
const retained = Kineto.getInstance(left, 'probe');
right.append(left);
await settle();
assert.equal(Kineto.getInstance(left, 'probe'), retained, 'connected reparenting must retain the instance');
moves.disconnect();
// A core-only consumer must not fetch GSAP for an unregistered activation.
movedOut.setAttribute('data-kt-reveal', '');
Kineto.scan(movedOut);
assert.equal(document.querySelector('script[data-kt-engine]'), null, 'unregistered modules cannot trigger engine downloads');
Kineto.destroy();
frames.clear();

// Discovery stays a snapshot per module. Initializing the root may clone
// activation markup; those generated nodes belong to a subsequent scan.
const cloneRoot = document.createElement('section');
cloneRoot.setAttribute('data-kt-clone-probe', '');
const authoredChild = document.createElement('div');
authoredChild.setAttribute('data-kt-clone-probe', '');
cloneRoot.append(authoredChild);
const generatedChild = authoredChild.cloneNode();
Kineto.register('cloneProbe', { create(el) {
  if (el === cloneRoot) el.append(generatedChild);
  return { el, destroy() {} };
} });
Kineto.scan(cloneRoot);
assert.ok(Kineto.getInstance(authoredChild, 'cloneProbe'));
assert.equal(Kineto.getInstance(generatedChild, 'cloneProbe'), null, 'creation cannot expand its own scan snapshot');
Kineto.destroy();
frames.clear();

// A manually paused or destroyed velocity instance must not be reawakened by
// ScrollTrigger, including pause/destroy from its own frame callback.
let triggerOptions;
const { setAnimationEngine } = await import('../src/runtime.js');
setAnimationEngine({ ScrollTrigger: { create(options) { triggerOptions = options; return { kill() {} }; } } });
const { default: velocity } = await import('../src/modules/scrollVelocity.js');
for (const spring of [true, false]) {
  let updates = 0;
  const el = document.createElement('div');
  el.style.transform = 'scale(2)';
  const original = el.getAttribute('style');
  const instance = velocity.create(el, { spring, onUpdate() { updates += 1; } });
  step();
  assert.equal(frames.size, 0, 'velocity must idle after its neutral frame');
  const idleUpdates = updates;
  for (let i = 0; i < 60; i += 1) step();
  assert.equal(updates, idleUpdates, 'idle must not write styles or call onUpdate');
  triggerOptions.onUpdate({ getVelocity: () => 2200, direction: 1 });
  assert.equal(frames.size, 1, 'scroll must wake the idle loop');
  step();
  assert.ok(instance.value > 0);
  for (let i = 0; i < 1500 && frames.size; i += 1) step();
  assert.equal(frames.size, 0, 'spring and lerp must both settle');
  assert.equal(instance.value, 0);
  instance.pause();
  triggerOptions.onUpdate({ getVelocity: () => -2200, direction: -1 });
  assert.equal(frames.size, 0, 'input cannot resume an explicit pause');
  instance.resume();
  instance.resume();
  assert.equal(frames.size, 1, 'resume must schedule only one frame');
  step();
  assert.ok(instance.value < 0);
  instance.destroy();
  instance.resume();
  triggerOptions.onUpdate({ getVelocity: () => 2200, direction: 1 });
  assert.equal(frames.size, 0, 'destroy must be terminal');
  assert.equal(el.getAttribute('style'), original);
}
for (const action of ['pause', 'destroy']) {
  let instance;
  instance = velocity.create(document.createElement('div'), { onUpdate() { instance[action](); } });
  step();
  assert.equal(frames.size, 0, `${action} from onUpdate must not leave a frame`);
  instance.destroy();
}
console.log('performance-runtime OK — 100 modules → 1 discovery traversal; 101 mutation targets → 1 scan; duplicate options skipped; disconnected work cancelled; velocity idle/wake/settle/reentry.');
dom.window.close();
