// React/Vue adapters WITHOUT the full runtime: they import the on-demand entry,
// so a page that only uses the adapters downloads the core plus the modules its
// components use. This checks, in a DOM (jsdom) with the real React and Vue:
//   1. nothing is registered until a component asks for a module;
//   2. <Motion type="tilt"> / useKineto() import the module, then create it;
//   3. a component unmounted while its module is still importing leaves no
//      instance behind (the late create is skipped);
//   4. Vue's v-motion directive does the same;
//   5. the adapters' exported Kineto is the shared instance the full runtime
//      would register on (one core for every ESM entry).
// Engine-free modules only (tilt, magnetic, ripple): GSAP cannot load here.
// Run: node --preserve-symlinks on-demand-qa.mjs (from tests/framework-qa)
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const { JSDOM } = await import(fileURLToPath(new URL('../../node_modules/jsdom/lib/api.js', import.meta.url)));
const dom = new JSDOM('<!doctype html><body><div id="react"></div><div id="vue"></div></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
try { Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true }); } catch (_error) { /* read-only on Node 21+ */ }
for (const key of ['Element', 'Node', 'HTMLElement', 'SVGElement', 'Event', 'CustomEvent', 'MouseEvent', 'PointerEvent', 'KeyboardEvent', 'MutationObserver', 'getComputedStyle', 'DocumentFragment', 'Text', 'Comment']) {
  try { globalThis[key] = window[key]; } catch (_error) { /* read-only */ }
}
globalThis.requestAnimationFrame = window.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame = (id) => clearTimeout(id);
window.matchMedia = globalThis.matchMedia = (query) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class ObserverStub { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
window.IntersectionObserver = window.ResizeObserver = globalThis.IntersectionObserver = globalThis.ResizeObserver = ObserverStub;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = (await import('react')).default;
const { act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { createApp, h, withDirectives, nextTick } = await import('vue');
const { Motion, Kineto } = await import('@dong-gri/kineto/react');
const { vMotion, Kineto: VueKineto } = await import('@dong-gri/kineto/vue');

const registered = () => Object.keys(Kineto.registry).sort();

// 5. One instance behind both adapters.
assert.equal(VueKineto, Kineto, 'the React and Vue adapters must share one Kineto instance');
assert.equal(typeof Kineto.loadModules, 'function', 'the adapters use the on-demand entry');
// 1. Nothing up front.
assert.deepEqual(registered(), [], 'no module is registered before a component asks for one');

// 2. React: import on first use, then create.
const reactHost = document.getElementById('react');
const root = createRoot(reactHost);
await act(async () => { root.render(React.createElement(Motion, { type: 'tilt', id: 'react-tilt' }, 'tilt')); });
await Kineto.loadModules();
await act(async () => {});
const tiltElement = document.getElementById('react-tilt');
assert.ok(Kineto.getInstance(tiltElement, 'tilt'), 'React <Motion type="tilt"> must create tilt once the module is imported');
assert.deepEqual(registered(), ['tilt'], 'only the module a component used is imported');

// 3. Unmounted while importing: the late create is skipped.
await act(async () => { root.render(React.createElement(Motion, { type: 'magnetic', id: 'react-magnetic' }, 'magnetic')); });
const magneticElement = document.getElementById('react-magnetic');
await act(async () => { root.render(React.createElement('p', null, 'gone')); });
await Kineto.loadModules();
await act(async () => {});
assert.equal(Kineto.getInstance(magneticElement, 'magnetic'), null, 'a component unmounted while its module was importing must not get an instance');
assert.equal(Kineto.instanceCount, 0, `React left ${Kineto.instanceCount} instances after unmount`);
await act(async () => { root.unmount(); });

// 4. Vue: v-motion imports on first use, then creates; unmount destroys.
const vueApp = createApp({ render: () => withDirectives(h('button', { id: 'vue-ripple' }, 'ripple'), [[vMotion, { type: 'ripple' }]]) });
vueApp.mount('#vue');
await Kineto.loadModules();
await nextTick();
const rippleElement = document.getElementById('vue-ripple');
assert.ok(Kineto.getInstance(rippleElement, 'ripple'), 'Vue v-motion must create ripple once the module is imported');
assert.deepEqual(registered(), ['magnetic', 'ripple', 'tilt'], 'Vue imports only the module it used');
vueApp.unmount();
assert.equal(Kineto.instanceCount, 0, `Vue left ${Kineto.instanceCount} instances after unmount`);

console.log('framework on-demand QA OK — React/Vue adapters without the full runtime import only the modules components use, create them after the import, skip a component unmounted mid-import, and share one Kineto instance.');
process.exit(0);
