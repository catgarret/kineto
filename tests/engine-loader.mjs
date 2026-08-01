// On-demand engine loader (audit D-4). GSAP/Lenis are not bundled; when a page
// uses a GSAP-backed effect and no engine is present, scan() must inject the
// official CDN <script> — while effects that don't need GSAP initialise
// immediately, never blocked on the network. Also verifies setEngineSource()
// lets a consumer repoint the CDN (pin a version / self-host).
// Run: node tests/engine-loader.mjs
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { url: 'https://x.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w; globalThis.document = w.document;
for (const k of ['Element', 'Node', 'NodeList', 'HTMLElement', 'Event', 'CustomEvent', 'getComputedStyle']) globalThis[k] = w[k];
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class OB { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = OB; w.ResizeObserver = OB; globalThis.IntersectionObserver = OB; globalThis.ResizeObserver = OB;
if (!w.Element.prototype.animate) w.Element.prototype.animate = () => ({ onfinish: null, oncancel: null, cancel() {}, play() {}, pause() {}, finished: Promise.resolve() });

const { default: Kineto } = await import('../dist/kineto.js');

const defaults = Kineto.getEngineSource();
assert.match(defaults.gsap, /gsap@3\.15\.0/, 'default GSAP URL must be version-pinned for deterministic caching');
assert.match(defaults.scrollTrigger, /gsap@3\.15\.0/, 'default ScrollTrigger URL must match the pinned GSAP version');
assert.match(defaults.lenis, /lenis@1\.3\.25/, 'default Lenis URL must be version-pinned for deterministic caching');

// A GSAP-backed effect (reveal) with no engine on the page → CDN inject.
// A non-GSAP effect (switch) on the same page → must init immediately.
w.document.body.innerHTML = '<div data-kt-reveal="fade">hi</div><button data-kt-switch></button>';
Kineto.scan(w.document);
await new Promise((r) => setTimeout(r, 30));

const scriptSrcs = Array.from(w.document.getElementsByTagName('script')).map((s) => s.src);
assert.ok(scriptSrcs.some((s) => /cdn\.jsdelivr\.net\/npm\/gsap.*gsap\.min\.js/.test(s)), 'scanning a GSAP effect with no engine present must inject the GSAP CDN <script>');
assert.ok(Array.from(w.document.querySelectorAll('script[data-kt-engine]')).every((script) => script.async), 'engine scripts must download asynchronously');
assert.ok(Kineto.getInstance(w.document.querySelector('[data-kt-switch]'), 'switch'), 'a non-GSAP effect must initialise immediately, not wait on the engine fetch');

// Consumer can repoint the engine source (version pin / self-host / mirror).
Kineto.setEngineSource({ gsap: 'https://example.com/mygsap.js' });
assert.equal(Kineto.getEngineSource().gsap, 'https://example.com/mygsap.js', 'setEngineSource() must override the CDN URL');

console.log('engine-loader OK — GSAP effect injects the CDN engine on demand; non-GSAP effects init immediately; setEngineSource() repoints the source.');
process.exit(0);
