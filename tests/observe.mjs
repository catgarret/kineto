// Kineto.observe() — live-DOM watching for frameworks and UI libraries.
//
// The first scan() only sees markup that exists at that moment. React and Vue
// renders, Bootstrap modals, shadcn/Radix portals and PrimeVue dialogs all add
// (and remove) `data-kt-*` elements later. observe() must create instances for
// added subtrees, destroy instances whose element left the document, stay
// idempotent per root, ignore attribute changes unless asked, survive the
// automatic core-service teardown that happens when the last instance goes,
// and stop on disconnect() / Kineto.destroy().
//
// Run: node tests/observe.mjs
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body><main id="app"></main></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w;
globalThis.document = w.document;
// Node 21+ ships a read-only global navigator; older Node has none. Expose
// jsdom's so the test sees the same shape a browser gives the runtime.
try { Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true }); } catch (_) { /* read-only navigator */ }
for (const key of ['Element', 'Node', 'NodeList', 'HTMLCollection', 'HTMLElement', 'Event', 'CustomEvent', 'getComputedStyle', 'MutationObserver']) {
  try { globalThis[key] = w[key]; } catch (_) { /* read-only globals in some runtimes */ }
}
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = (query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class ObserverStub { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = ObserverStub; w.ResizeObserver = ObserverStub;
globalThis.IntersectionObserver = ObserverStub; globalThis.ResizeObserver = ObserverStub;

const { default: Kineto } = await import('../dist/kineto.js');
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const app = document.getElementById('app');
const count = (name) => Array.from(document.querySelectorAll(`[data-kt-${name}]`)).filter((el) => Kineto.getInstance(el, name)).length;

// 1. Idempotent per root, and the initial scan picks up existing markup.
app.innerHTML = '<button data-kt-ripple>existing</button>';
const handle = Kineto.observe(app);
assert.equal(handle.active, true);
assert.equal(handle.root, app);
assert.equal(Kineto.observe(app), handle, 'observing the same root twice returns the same handle');
assert.equal(count('ripple'), 1, 'observe() scans the root immediately');

// 2. Markup added later is created after one microtask (one scan per commit).
const late = document.createElement('div');
late.innerHTML = '<button data-kt-ripple>a</button><button data-kt-magnetic>b</button><span data-kt-tooltip data-kt-content="hi">c</span>';
app.appendChild(late);
assert.equal(count('magnetic'), 0, 'creation is batched into a microtask, not synchronous');
await settle();
assert.equal(count('ripple'), 2);
assert.equal(count('magnetic'), 1);
assert.equal(count('tooltip'), 1);
const before = Kineto.instanceCount;

// 3. Removing a subtree destroys its instances (no leak), and the observer
//    survives the automatic core teardown when instances drop to zero.
late.remove();
await settle();
assert.equal(Kineto.instanceCount, before - 3, 'instances of removed elements are destroyed');
assert.equal(handle.active, true);
app.innerHTML = '';
await settle();
assert.equal(Kineto.instanceCount, 0, 'the last instance can go away while the observer keeps watching');
app.innerHTML = '<button data-kt-ripple>again</button>';
await settle();
assert.equal(count('ripple'), 1, 'the observer still works after every instance was destroyed');

// 4. Attribute additions are ignored by default and honoured with { attributes: true }.
const plain = document.createElement('button');
app.appendChild(plain);
await settle();
plain.setAttribute('data-kt-magnetic', '');
await settle();
assert.equal(count('magnetic'), 0, 'attribute changes are not watched unless requested');
handle.disconnect();
assert.equal(handle.active, false);
const attributeHandle = Kineto.observe(app, { attributes: true, scan: false });
assert.notEqual(attributeHandle, handle, 'a disconnected root can be observed again with new options');
assert.equal(count('magnetic'), 0, 'scan: false leaves existing markup alone');
plain.setAttribute('data-kt-switch', '');
await settle();
assert.equal(count('switch'), 1, 'a data-kt-* attribute added to an existing element creates the module');

// 5. disconnect() stops watching but keeps instances; Kineto.destroy() clears both.
attributeHandle.disconnect();
app.appendChild(Object.assign(document.createElement('button'), { innerHTML: 'x' })).setAttribute('data-kt-ripple', '');
await settle();
assert.equal(count('ripple'), 1, 'nothing is created after disconnect()');
assert.equal(count('switch'), 1, 'disconnect() does not destroy existing instances');
const again = Kineto.observe(document);
Kineto.destroy();
assert.equal(again.active, false, 'Kineto.destroy() disconnects every live observer');
assert.equal(Kineto.instanceCount, 0);

// 6. Environments without MutationObserver (or SSR) get an inert handle.
const saved = globalThis.MutationObserver;
delete globalThis.MutationObserver;
const inert = Kineto.observe(app);
assert.equal(inert.active, false);
inert.disconnect();
globalThis.MutationObserver = saved;

console.log('observe OK — live-DOM scan on insertion, destroy on removal, idempotent roots, optional attribute watching, disconnect and global destroy.');
