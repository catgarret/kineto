// Destroy-cleanliness test (audit D-3 / J-7): after destroy(), a module must
// leave no net event listeners, rAF handles or observers behind. We instrument
// the DOM primitives in jsdom, create each module on a fixture, destroy it, and
// assert the tracked counts return to their pre-create baseline.
// Run: node tests/leak.mjs
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w; globalThis.document = w.document;
// The bundle's q() checks bare globals (Element/Node/NodeList…) — expose them so
// element targets are recognised in Node.
for (const k of ['Element', 'Node', 'NodeList', 'HTMLCollection', 'HTMLElement', 'Event', 'CustomEvent', 'getComputedStyle']) {
  try { globalThis[k] = w[k]; } catch (_) {}
}
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => { const id = setTimeout(() => cb(Date.now()), 0); rafPending.add(id); return id; };
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => { rafPending.delete(id); clearTimeout(id); };
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class OB { observe() {} unobserve() {} disconnect() { obsLive--; } constructor() { obsLive++; } }
w.IntersectionObserver = OB; w.ResizeObserver = OB; w.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
globalThis.IntersectionObserver = OB; globalThis.ResizeObserver = OB;

// jsdom has no Web Animations API — stub a minimal animate() so WAAPI modules run.
if (!w.Element.prototype.animate) {
  w.Element.prototype.animate = function () { const a = { onfinish: null, oncancel: null, cancel() {}, play() {}, pause() {}, finish() {}, finished: Promise.resolve(), addEventListener() {}, removeEventListener() {} }; return a; };
}

let obsLive = 0; const rafPending = new Set();
// Track live event listeners as a multiset of records.
const listeners = new Set();
const proto = w.EventTarget.prototype;
const addReal = proto.addEventListener; const rmReal = proto.removeEventListener;
proto.addEventListener = function (type, fn, opts) { const rec = { t: this, type, fn }; this.__recs ||= []; this.__recs.push(rec); listeners.add(rec); return addReal.call(this, type, fn, opts); };
proto.removeEventListener = function (type, fn, opts) { (this.__recs || []).forEach((rec) => { if (rec.type === type && rec.fn === fn) { listeners.delete(rec); } }); return rmReal.call(this, type, fn, opts); };

const { default: Kineto } = await import('../dist/kineto.js');

// Minimal fixtures per module (only DOM-only, non-canvas modules are checked).
const fixtures = {
  tooltip: () => [Object.assign(document.body.appendChild(document.createElement('button'))), { content: 'hi' }],
  switch: () => [document.body.appendChild(document.createElement('button')), {}],
  gesture: () => [document.body.appendChild(document.createElement('button')), {}],
  magnetic: () => [document.body.appendChild(document.createElement('button')), {}],
  ripple: () => [document.body.appendChild(document.createElement('button')), {}],
  tabs: () => { const el = document.createElement('div'); el.innerHTML = '<div role="tablist"><button>A</button><button>B</button></div><div class="kt-tabpanel">1</div><div class="kt-tabpanel">2</div>'; document.body.appendChild(el); return [el, {}]; },
  accordion: () => { const el = document.createElement('div'); el.innerHTML = '<details><summary>x</summary><p>y</p></details><details><summary>z</summary><p>w</p></details>'; document.body.appendChild(el); return [el, {}]; },
  marquee: () => { const el = document.createElement('div'); el.innerHTML = '<span>scrolling text here</span>'; document.body.appendChild(el); return [el, {}]; },
};

const fails = [];
for (const [name, make] of Object.entries(fixtures)) {
  const [el, opts] = make();
  const beforeSet = new Set(listeners); const beforeR = rafPending.size; const beforeO = obsLive;
  // 문서에 직접 붙인 것도 destroy 가 되돌려야 합니다. 리스너·RAF·observer 만 보면
  // 공유 오버레이·region 처럼 body 에 남는 요소를 놓칩니다(Toast 의 알림 region 이
  // 실제로 그랬습니다 — 토스트가 없는 페이지에 빈 랜드마크가 영원히 남았습니다).
  const beforeBody = new Set(document.body.children);
  let inst;
  try { inst = Kineto.create(name, el, opts); } catch (e) { fails.push(`${name}: create threw ${e.message}`); el.remove(); continue; }
  if (!inst) { fails.push(`${name}: create returned null (fixture invalid)`); el.remove(); continue; }
  try { Kineto.destroyModule(el, name); if (inst && inst.destroy) inst.destroy(); } catch (e) { fails.push(`${name}: destroy threw ${e.message}`); }
  // Listener leaks are scoped to the module's OWN element subtree — jsdom adds
  // its own noisy window/document listeners that a real browser would not, so
  // those are out of scope here. rAF handles and observers are checked globally.
  const added = [...listeners].filter((r) => !beforeSet.has(r));
  const elLeaks = added.filter((r) => r.t === el || (el.contains && r.t && r.t.nodeType === 1 && el.contains(r.t)));
  const dR = rafPending.size - beforeR; const dO = obsLive - beforeO;
  if (elLeaks.length > 0) fails.push(`${name}: ${elLeaks.length} element listener(s) leaked after destroy [${elLeaks.map((r) => r.type).join(',')}]`);
  if (dR > 0) fails.push(`${name}: ${dR} rAF handle(s) leaked after destroy`);
  if (dO > 0) fails.push(`${name}: ${dO} observer(s) leaked after destroy`);
  const strayNodes = [...document.body.children].filter((node) => node !== el && !beforeBody.has(node));
  if (strayNodes.length) {
    fails.push(`${name}: ${strayNodes.length} node(s) left in document.body after destroy `
      + `[${strayNodes.map((node) => node.tagName.toLowerCase() + '.' + (String(node.className).trim().split(/\s+/)[0] || '')).join(', ')}]`);
    strayNodes.forEach((node) => node.remove());
  }
  el.remove();
}

// 공유 요소의 수명. Toast 의 알림 region 은 자리마다 하나를 여러 인스턴스가 함께 쓰므로
// 인스턴스 하나가 사라졌다고 지울 수 없고, **마지막 하나까지 사라졌을 때** 지워야 합니다.
// 예전에는 아예 지우지 않아서, 토스트를 한 번 띄운 페이지에는 그 뒤로 토스트가 하나도
// 없어도 빈 `role="region"` 랜드마크가 영원히 남았습니다. 위 fixture 루프는 show() 를
// 부르지 않아 region 이 만들어지지도 않으므로, 실제 순서를 여기서 따로 재현합니다.
const regionCount = () => document.querySelectorAll('.kt-toast-region').length;
const toastHostA = document.body.appendChild(document.createElement('button'));
const toastHostB = document.body.appendChild(document.createElement('button'));
const toastA = Kineto.create('toast', toastHostA, { message: 'A', duration: 1000 });
const toastB = Kineto.create('toast', toastHostB, { message: 'B', duration: 1000 });
if (regionCount() !== 0) fails.push('toast: a region appeared before any toast was shown');
const shownToast = toastA.show();
if (regionCount() !== 1) fails.push('toast: showing a toast must create exactly one region');
toastA.destroy();
if (regionCount() !== 1) fails.push('toast: the shared region must survive while another instance still uses it');
shownToast.dismiss();
if (regionCount() !== 1) fails.push('toast: the region must stay while a live instance can still show into it');
toastB.destroy();
if (regionCount() !== 0) fails.push('toast: the region must go once the last instance is destroyed — otherwise an empty "Notifications" landmark stays in the page forever');
toastHostA.remove();
toastHostB.remove();

// Live reduced-motion re-application (audit D-1/J-5): flipping the policy must
// recreate the instances already on the page, not drop them or throw.
const rb = document.body.appendChild(document.createElement('button'));
Kineto.create('tooltip', rb, { content: 'x' });
const cBefore = Kineto.instanceCount;
try { Kineto.setReducedMotion('always'); } catch (e) { fails.push(`setReducedMotion threw: ${e.message}`); }
if (Kineto.instanceCount !== cBefore) fails.push(`reduced-motion reapply lost instances: ${cBefore} -> ${Kineto.instanceCount}`);
if (!Kineto.prefersReducedMotion) fails.push('setReducedMotion("always") did not enable reduced motion');
Kineto.setReducedMotion('user');
Kineto.destroyModule(rb, 'tooltip');

console.log(`leak check ran on ${Object.keys(fixtures).length} DOM modules.`);
if (fails.length) { console.error('FAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('leak OK — no net event listeners / rAF handles / observers / document.body nodes left after destroy().');
// Exit synchronously: any leaked rAF would otherwise re-arm forever and hang.
process.exit(0);
