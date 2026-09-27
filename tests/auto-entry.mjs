// `@dong-gri/kineto/auto` — the core plus every module imported on demand.
//
// What must hold (docs/entry-points.md):
//   1. Nothing is registered up front; every contract module is known by name.
//   2. Markup activates any module: scan()/autoInit()/observe() import what the
//      markup uses — and ONLY that — register it and create it.
//   3. The preload veil stays up until those imports settled.
//   4. create() before the import returns null and starts it; loadModules() waits.
//   5. A failed import is reported once (KT_MODULE_LOAD_FAILED), leaves markup
//      static, releases the veil, and is not retried by every later scan — only
//      by an explicit loadModules().
//   6. registerLazy() validates its input and can never shadow a core method.
//   7. Concurrent scans import a module once; destroy() leaves nothing behind.
//
// Runs against the built dist/modular/auto.js so the real code-split graph
// (entry → chunks → module files) is what gets imported. Run: node tests/auto-entry.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html class="kt-preload"><body><main id="app"></main></body></html>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w;
globalThis.document = w.document;
try { Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true }); } catch (_) { /* read-only navigator */ }
for (const key of ['Element', 'Node', 'NodeList', 'HTMLCollection', 'HTMLElement', 'Event', 'CustomEvent', 'getComputedStyle', 'MutationObserver', 'PointerEvent', 'KeyboardEvent']) {
  try { globalThis[key] = w[key]; } catch (_) { /* read-only globals in some runtimes */ }
}
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = (query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class ObserverStub { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = ObserverStub; w.ResizeObserver = ObserverStub;
globalThis.IntersectionObserver = ObserverStub; globalThis.ResizeObserver = ObserverStub;

// Keep expected warnings out of the log, but let the test read them.
const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => warnings.push(args.map(String).join(' '));

const contract = JSON.parse(fs.readFileSync(new URL('../kineto.features.json', import.meta.url), 'utf8'));
const { default: Kineto } = await import('../dist/modular/auto.js');
const settle = () => new Promise((resolve) => setTimeout(resolve, 5));
const app = document.getElementById('app');
const events = [];
Kineto.config({ debugSink: (event) => events.push(event) });
const registered = () => Object.keys(Kineto.registry).sort();

try {
  // 1. Nothing imported yet; the auto-only API exists; the contract names are known.
  assert.deepEqual(registered(), [], 'the auto entry must not register any module up front');
  for (const method of contract.entryPoints['./auto'].api) assert.equal(typeof Kineto[method], 'function', `auto entry must add Kineto.${method}()`);
  assert.equal(typeof Kineto.defineCanvasEffect, 'function', 'Canvas Effect definitions can be registered before the module loads');

  // 2 + 3. autoInit imports exactly what the markup uses, then creates it; veil held until then.
  app.innerHTML = '<button data-kt-ripple>a</button><button data-kt-magnetic>b</button><span data-kt-tooltip data-kt-content="hi">c</span>';
  Kineto.autoInit();
  assert.ok(document.documentElement.classList.contains('kt-preload'), 'the preload veil must stay up while on-demand modules load');
  await Kineto.loadModules();
  await settle();
  assert.deepEqual(registered(), ['magnetic', 'ripple', 'tooltip'], 'only the modules the markup uses are imported');
  for (const name of ['ripple', 'magnetic', 'tooltip']) {
    assert.ok(Kineto.getInstance(app.querySelector(`[data-kt-${name}]`), name), `${name} must be created after its import`);
  }
  assert.equal(document.documentElement.classList.contains('kt-preload'), false, 'the veil is released once the imports settled');

  // observe(): markup added later pulls in a new module.
  const handle = Kineto.observe(app, { scan: false });
  const late = document.createElement('div');
  late.innerHTML = '<div data-kt-accordion><details><summary>Q</summary><p>A</p></details></div>';
  app.appendChild(late);
  await settle();
  await Kineto.loadModules();
  await settle();
  assert.ok(registered().includes('accordion'), 'observe() imports a module first used by added markup');
  assert.ok(Kineto.getInstance(late.firstElementChild, 'accordion'), 'observe() creates it');

  // 4. create() before the import: null + a hint, then loadModules() makes the JS API work.
  warnings.length = 0;
  const card = document.createElement('div');
  app.appendChild(card);
  assert.equal(Kineto.create('tilt', card), null, 'create() cannot wait for an import');
  assert.ok(warnings.some((line) => line.includes("loadModules('tilt')")), 'create() says how to wait for the module');
  await Kineto.loadModules('tilt');
  assert.equal(typeof Kineto.tilt, 'function', 'the shorthand exists once the module is registered');
  assert.ok(Kineto.tilt(card), 'create works after loadModules()');

  // 5. A failed import: reported once, static markup, veil released, no retry loop.
  let failingCalls = 0;
  Kineto.registerLazy('brokenChunk', () => { failingCalls += 1; return Promise.reject(new Error('chunk failed')); });
  document.documentElement.classList.add('kt-preload');
  const broken = document.createElement('div');
  broken.setAttribute('data-kt-broken-chunk', '');
  app.appendChild(broken);
  await settle();
  await Kineto.loadModules();
  await settle();
  assert.equal(failingCalls, 1, 'the failing importer ran once');
  assert.equal(events.filter((event) => event.code === 'KT_MODULE_LOAD_FAILED' && event.module === 'brokenChunk').length, 1, 'the failure is reported once');
  Kineto.scan(app);
  Kineto.scan(app);
  await settle();
  assert.equal(failingCalls, 1, 'later scans do not retry a failed import');
  assert.equal(document.documentElement.classList.contains('kt-preload'), false, 'a failed import still releases the veil');
  await Kineto.loadModules('brokenChunk');
  assert.equal(failingCalls, 2, 'an explicit loadModules() retries');

  // An importer that resolves to something that is not a module is a failure too.
  Kineto.registerLazy('notAModule', () => Promise.resolve({ default: { nope: true } }));
  await Kineto.loadModules('notAModule');
  assert.ok(events.some((event) => event.code === 'KT_MODULE_LOAD_FAILED' && event.module === 'notAModule'));
  assert.equal(Kineto.registry.notAModule, undefined);

  // 6. Validation: bad names / importers are rejected; a core method is never shadowed.
  const invalidBefore = events.filter((event) => event.code === 'KT_INVALID_MODULE').length;
  Kineto.registerLazy('../../evil', () => import('../dist/modular/core.js'));
  Kineto.registerLazy('ok', 'https://cdn.example/evil.js');
  assert.equal(events.filter((event) => event.code === 'KT_INVALID_MODULE').length, invalidBefore + 2, 'names must be identifiers and importers must be functions');
  let configImported = false;
  Kineto.registerLazy('config', () => { configImported = true; return Promise.resolve({ create() {} }); });
  await Kineto.loadModules('config');
  assert.equal(configImported, false, 'an on-demand name can never shadow a core method');
  assert.equal(typeof Kineto.config({}), 'object');

  // 7. Concurrent scans import a module once.
  let slowCalls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  Kineto.registerLazy('slowModule', () => { slowCalls += 1; return gate.then(() => ({ default: { create: (el) => ({ el, destroy() {} }) } })); });
  const slow = document.createElement('div');
  slow.setAttribute('data-kt-slow-module', '');
  app.appendChild(slow);
  document.documentElement.classList.add('kt-preload');
  Kineto.scan(app);
  Kineto.scan(app);
  Kineto.scan(slow);
  await settle();
  assert.ok(document.documentElement.classList.contains('kt-preload'), 'the veil must stay up for as long as an on-demand import is pending');
  release();
  await Kineto.loadModules();
  await settle();
  assert.equal(slowCalls, 1, 'one import per module, however many scans asked for it');
  assert.ok(Kineto.getInstance(slow, 'slowModule'), 'the module is created by the rescan');
  assert.equal(document.documentElement.classList.contains('kt-preload'), false, 'and the veil is released after it');

  // destroy(): no instances, observers disconnected.
  handle.disconnect();
  Kineto.destroy();
  assert.equal(Kineto.instanceCount, 0, 'destroy() leaves no instance behind');

  const known = contract.modules.map(({ name }) => name);
  const moduleLoaders = (await import('../src/moduleLoaders.js')).moduleLoaders;
  assert.deepEqual(Object.keys(moduleLoaders).sort(), [...known].sort(), 'every contract module is loadable on demand');

  console.log(`auto-entry OK — ${known.length} modules known, only used ones imported; veil, failures, validation and dedupe hold.`);
} finally {
  console.warn = originalWarn;
}
