// Attachment QA — the claims in kineto.integrations.json, proven against the
// real libraries:
//   1. Each library's root components forward `data-kt-*` to the DOM
//      (server render → jsdom → Kineto.scan creates the instance).
//   2. React apps need nothing but attributes + Kineto.observe(): a client
//      render adds a card later and the observer creates/destroys the module.
//   3. Vue components let attrs fall through (Vuetify / PrimeVue SSR).
// Run: npm --prefix tests/integrations run qa   (from the repository root)
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { JSDOM } from 'jsdom';

// Stylesheet imports inside the libraries (Vuetify, PrimeVue) become empty modules.
register('./css-loader.mjs', import.meta.url);

const dom = new JSDOM('<!doctype html><body><div id="root"></div></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w;
globalThis.document = w.document;
try { Object.defineProperty(globalThis, 'navigator', { value: w.navigator, configurable: true }); } catch (_) { /* Node 21+ exposes a read-only navigator */ }
for (const key of ['Element', 'Node', 'NodeList', 'HTMLCollection', 'HTMLElement', 'HTMLImageElement', 'HTMLButtonElement', 'Event', 'CustomEvent', 'MutationObserver', 'getComputedStyle', 'DocumentFragment', 'Text', 'SVGElement', 'KeyboardEvent', 'MouseEvent', 'PointerEvent']) {
  try { globalThis[key] = w[key]; } catch (_) { /* some are read-only */ }
}
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = globalThis.matchMedia = (query) => ({ matches: false, media: query, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } });
class ObserverStub { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
w.IntersectionObserver = ObserverStub; w.ResizeObserver = ObserverStub;
globalThis.IntersectionObserver = ObserverStub; globalThis.ResizeObserver = ObserverStub;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// Vuetify probes CSS.supports at import time.
if (typeof globalThis.CSS === 'undefined') globalThis.CSS = { supports: () => false, escape: (value) => String(value) };

const { default: Kineto } = await import('@dong-gri/kineto');
const React = (await import('react')).default;
const { renderToString } = await import('react-dom/server');
const { createRoot } = await import('react-dom/client');
const { act } = await import('react');

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const mount = (html) => { const host = document.createElement('div'); host.innerHTML = html; document.body.appendChild(host); return host; };
const hasInstance = (host, selector, name) => {
  const el = host.querySelector(selector);
  return Boolean(el && Kineto.getInstance(el, name));
};
const results = [];
const record = (library, component, ok, detail = '') => { results.push({ library, component, ok, detail }); if (!ok) console.error(`  ✗ ${library} ${component} ${detail}`); };

// ------------------------------------------------------------- React libraries
// Each entry renders a library component with Kineto attributes on it. The
// attributes must appear on the element Kineto can scan. Modules that wait for
// the GSAP engine (reveal, textReveal, textSplit …) cannot initialise in jsdom,
// so those attributes are asserted as forwarded while an engine-free module on
// the same element proves that Kineto.scan() attaches.
const reactCases = [];
{
  const Card = (await import('@mui/material/Card')).default;
  const Button = (await import('@mui/material/Button')).default;
  const Typography = (await import('@mui/material/Typography')).default;
  reactCases.push(['mui', 'Card', () => React.createElement(Card, { 'data-kt-tilt': 'tilt-glare', 'data-kt-max': '8' }, 'x'), '[data-kt-tilt]', 'tilt']);
  reactCases.push(['mui', 'Button', () => React.createElement(Button, { 'data-kt-magnetic': '', variant: 'contained' }, 'Go'), '[data-kt-magnetic]', 'magnetic']);
  reactCases.push(['mui', 'Typography', () => React.createElement(Typography, { variant: 'h2', 'data-kt-glitch': 'rgb', 'data-kt-text-reveal': 'stream' }, 'Report'), '[data-kt-glitch]', 'glitch']);
}
{
  const { MantineProvider, Card, Button, Title } = await import('@mantine/core');
  const wrap = (child) => React.createElement(MantineProvider, null, child);
  reactCases.push(['mantine', 'Card', () => wrap(React.createElement(Card, { 'data-kt-tilt': 'tilt', 'data-kt-max': '6' }, 'x')), '[data-kt-tilt]', 'tilt']);
  reactCases.push(['mantine', 'Button', () => wrap(React.createElement(Button, { 'data-kt-magnetic': '' }, 'Go')), '[data-kt-magnetic]', 'magnetic']);
  reactCases.push(['mantine', 'Title', () => wrap(React.createElement(Title, { order: 1, 'data-kt-glitch': 'rgb', 'data-kt-text-split': 'word' }, 'Spring')), '[data-kt-glitch]', 'glitch']);
}
{
  const { ChakraProvider, defaultSystem, Card, Button, Heading } = await import('@chakra-ui/react');
  const wrap = (child) => React.createElement(ChakraProvider, { value: defaultSystem }, child);
  reactCases.push(['chakra', 'Card.Root', () => wrap(React.createElement(Card.Root, { 'data-kt-card-glow': 'edge' }, 'x')), '[data-kt-card-glow]', 'cardGlow']);
  reactCases.push(['chakra', 'Button', () => wrap(React.createElement(Button, { 'data-kt-magnetic': '' }, 'Go')), '[data-kt-magnetic]', 'magnetic']);
  reactCases.push(['chakra', 'Heading', () => wrap(React.createElement(Heading, { 'data-kt-glitch': 'rgb', 'data-kt-text-reveal': 'stream' }, 'Ready')), '[data-kt-glitch]', 'glitch']);
}
{
  const { Card, Button, Typography } = await import('antd');
  reactCases.push(['antd', 'Card', () => React.createElement(Card, { 'data-kt-card-glow': 'border', 'data-kt-reveal': 'fade-up' }, 'x'), '[data-kt-card-glow]', 'cardGlow']);
  reactCases.push(['antd', 'Button', () => React.createElement(Button, { 'data-kt-magnetic': '', type: 'primary' }, 'Go'), '[data-kt-magnetic]', 'magnetic']);
  reactCases.push(['antd', 'Typography.Title', () => React.createElement(Typography.Title, { level: 2, 'data-kt-glitch': 'rgb', 'data-kt-text-reveal': 'stream' }, 'Ready'), '[data-kt-glitch]', 'glitch']);
}

for (const [library, component, render, selector, module] of reactCases) {
  let html = '';
  try { html = renderToString(render()); } catch (error) { record(library, component, false, `render failed: ${error.message}`); continue; }
  const host = mount(html);
  const target = host.querySelector(selector);
  if (!target) { record(library, component, false, `attribute not forwarded to the DOM: ${html.slice(0, 120)}`); host.remove(); continue; }
  const forwarded = [...target.attributes].filter((attribute) => attribute.name.startsWith('data-kt-')).length;
  const requested = Object.keys(render().props || {}).filter((key) => key.startsWith('data-kt-')).length || [...html.matchAll(/data-kt-/g)].length;
  if (forwarded < requested) { record(library, component, false, `only ${forwarded}/${requested} data-kt-* attributes reached <${target.tagName.toLowerCase()}>`); host.remove(); continue; }
  Kineto.scan(host);
  record(library, component, hasInstance(host, selector, module), `${module} instance not created on <${target.tagName.toLowerCase()}>`);
  Kineto.destroy(host);
  host.remove();
}

// ------------------------------------------------- React client + observe()
{
  const Card = (await import('@mui/material/Card')).default;
  const container = document.getElementById('root');
  const handle = Kineto.observe(container);
  const root = createRoot(container);
  await act(async () => { root.render(React.createElement('div', null, React.createElement(Card, { 'data-kt-tilt': 'tilt', id: 'live-card' }, 'live'))); });
  await settle();
  const live = document.getElementById('live-card');
  record('react', 'client render + observe()', Boolean(live && Kineto.getInstance(live, 'tilt')), 'instance not created for a component rendered after observe()');
  await act(async () => { root.render(React.createElement('div', null, 'gone')); });
  await settle();
  record('react', 'unmount + observe()', Kineto.instanceCount === 0, `instances left after unmount: ${Kineto.instanceCount}`);
  handle.disconnect();
  await act(async () => { root.unmount(); });
}

// ------------------------------------------------------------ Vue libraries
{
  const { createSSRApp, h } = await import('vue');
  const { renderToString: renderVue } = await import('vue/server-renderer');
  const vueCases = [];
  {
    const { createVuetify } = await import('vuetify');
    const { VCard, VBtn } = await import('vuetify/components');
    const vuetify = createVuetify({ components: { VCard, VBtn } });
    vueCases.push(['vuetify', 'v-card', () => { const app = createSSRApp({ render: () => h(VCard, { 'data-kt-tilt': 'tilt', 'data-kt-max': '5' }, () => 'x') }); app.use(vuetify); return app; }, '[data-kt-tilt]', 'tilt']);
    vueCases.push(['vuetify', 'v-btn', () => { const app = createSSRApp({ render: () => h(VBtn, { 'data-kt-magnetic': '' }, () => 'Go') }); app.use(vuetify); return app; }, '[data-kt-magnetic]', 'magnetic']);
  }
  {
    const PrimeVue = (await import('primevue/config')).default;
    const Card = (await import('primevue/card')).default;
    const Button = (await import('primevue/button')).default;
    vueCases.push(['primevue', 'Card', () => { const app = createSSRApp({ render: () => h(Card, { 'data-kt-card-glow': 'spotlight' }, { content: () => 'x' }) }); app.use(PrimeVue, { unstyled: true }); return app; }, '[data-kt-card-glow]', 'cardGlow']);
    vueCases.push(['primevue', 'Button', () => { const app = createSSRApp({ render: () => h(Button, { label: 'Buy', 'data-kt-magnetic': '', 'data-kt-strength': '0.3' }) }); app.use(PrimeVue, { unstyled: true }); return app; }, '[data-kt-magnetic]', 'magnetic']);
  }
  for (const [library, component, makeApp, selector, module] of vueCases) {
    let html = '';
    try { html = await renderVue(makeApp()); } catch (error) { record(library, component, false, `render failed: ${error.message}`); continue; }
    const host = mount(html);
    const target = host.querySelector(selector);
    if (!target) { record(library, component, false, `attribute not forwarded to the DOM: ${html.slice(0, 120)}`); host.remove(); continue; }
    Kineto.scan(host);
    record(library, component, hasInstance(host, selector, module), `${module} instance not created on <${target.tagName.toLowerCase()}>`);
    Kineto.destroy(host);
    host.remove();
  }
}

const failed = results.filter((entry) => !entry.ok);
assert.deepEqual(failed, [], `attachment claims failed:\n${failed.map((entry) => `  - ${entry.library} ${entry.component}: ${entry.detail}`).join('\n')}`);
const libraries = [...new Set(results.map((entry) => entry.library))];
console.log(`integrations attachment OK — ${results.length} checks across ${libraries.join(', ')}: data-kt-* props/attrs reach the DOM, Kineto.scan() attaches, React client renders are picked up and released by Kineto.observe().`);
