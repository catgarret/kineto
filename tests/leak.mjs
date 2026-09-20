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

// 위 8개는 모듈마다 맞춘 마크업이 필요해 손으로 적었습니다. 그 밖의 모듈 다수는 평범한
// 문단 몇 개면 붙으므로, 같은 fixture 를 돌려 쓰면서 검사 대상을 8개에서 33개로 넓힙니다.
// 검사 범위가 좁으면 "통과"가 곧 "안전"이 아니게 됩니다 — Toast 의 남는 region 도 Toast 가
// 목록에 없어서 오래 보이지 않았습니다.
const genericFixture = () => {
  const el = document.createElement('div');
  el.innerHTML = '<p>Alpha text</p><p>Beta text</p><span>1234</span>';
  document.body.appendChild(el);
  return [el, {}];
};
// 캔버스·미디어를 그리거나(lazy·stylize·glitch·brushReveal·scrollSequence·ambientMedia),
// 페이지 전체를 가져가거나(pageReveal·pageTransition·fullpage·cssScroll), 전용 소재가
// 필요한 모듈(lightbox·cursor·radial·slider·megaMenu·textFill·textSplit·textTransition·
// scrollVelocity·vibrate)은 여기서 다루지 않습니다. 각자의 전용 검사가 있습니다.
for (const name of [
  'blurText', 'cardGlow', 'counter', 'dateTime', 'loader', 'loadingIndicator', 'mouseParallax',
  'overflowText', 'parallax', 'progress', 'reveal', 'stickyStack', 'textReveal', 'tilt',
  'typewriter', 'confetti', 'hold', 'toast', 'bottomSheet', 'coverReveal', 'drag', 'flip',
  'scrollShadows', 'stickyHeader', 'horizontalScroll'
]) fixtures[name] = genericFixture;

const fails = [];
for (const [name, make] of Object.entries(fixtures)) {
  const [el, opts] = make();
  const beforeSet = new Set(listeners); const beforeR = rafPending.size; const beforeO = obsLive;
  // 문서에 직접 붙인 것도 destroy 가 되돌려야 합니다. 리스너·RAF·observer 만 보면
  // 공유 오버레이·region 처럼 body 에 남는 요소를 놓칩니다(Toast 의 알림 region 이
  // 실제로 그랬습니다 — 토스트가 없는 페이지에 빈 랜드마크가 영원히 남았습니다).
  const beforeBody = new Set(document.body.children);
  const beforeHead = new Set(document.head.children);
  // 요소 자신도 만나기 전 모습 그대로 돌려줘야 합니다. 리스너·RAF·노드만 보면
  // 남은 `tabindex`(탭 순서에 계속 남음)·`aria-label`(라이브러리가 지은 이름이 계속 붙음)·
  // `overflow-y:auto`(스크롤 컨테이너가 아니던 요소가 계속 컨테이너)를 놓칩니다.
  const beforeMarkup = el.outerHTML;
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
  // `#kineto-inline-fallback` 은 라이브러리 **런타임**의 스타일시트입니다. 첫 create 때
  // 한 번 들어가고 모든 인스턴스가 함께 쓰므로, 모듈 하나의 destroy 가 걷어낼 대상이
  // 아닙니다(걷어내면 아직 살아 있는 다른 인스턴스의 스타일이 사라집니다).
  const RUNTIME_NODES = new Set(['kineto-inline-fallback']);
  const strayNodes = [...document.body.children].filter((node) => node !== el && !beforeBody.has(node))
    .concat([...document.head.children].filter((node) => !beforeHead.has(node) && !RUNTIME_NODES.has(node.id)));
  if (strayNodes.length) {
    fails.push(`${name}: ${strayNodes.length} node(s) left in the document after destroy `
      + `[${strayNodes.map((node) => node.tagName.toLowerCase() + '.' + (String(node.className).trim().split(/\s+/)[0] || '')).join(', ')}]`);
    strayNodes.forEach((node) => node.remove());
  }
  const afterMarkup = el.outerHTML;
  if (afterMarkup !== beforeMarkup) {
    const rootOf = (markup) => markup.slice(0, markup.indexOf('>') + 1);
    fails.push(rootOf(afterMarkup) !== rootOf(beforeMarkup)
      ? `${name}: destroy left the element changed — ${rootOf(beforeMarkup)} became ${rootOf(afterMarkup)}`
      : `${name}: destroy left the element's contents changed (${beforeMarkup.length} -> ${afterMarkup.length} chars)`);
  }
  // 두 번 불러도 터지지 않아야 합니다 — 프레임워크 어댑터가 unmount 와 명시적 destroy 로
  // 두 번 부르는 경우가 실제로 있습니다.
  try { inst.destroy?.(); } catch (e) { fails.push(`${name}: a second destroy() threw ${e.message}`); }
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

// Lightbox 도 뷰어 하나를 공유하고, 그와 함께 `<style id="kt-lightbox-style">` 를
// document.head 에 넣습니다. 뷰어는 마지막 항목이 사라질 때 이미 치우고 있었지만
// 스타일은 남아서, 라이트박스를 한 번 쓴 페이지에 죽은 CSS 가 계속 붙어 있었습니다.
// 들어온 것과 같은 순간에 나가야 합니다.
const lightboxHost = document.body.appendChild(document.createElement('a'));
lightboxHost.href = 'https://example.test/photo.jpg';
const lightbox = Kineto.create('lightbox', lightboxHost, {});
if (lightbox) {
  if (!document.getElementById('kt-lightbox-style')) fails.push('lightbox: expected the viewer stylesheet while an instance is alive');
  lightbox.destroy();
  if (document.getElementById('kt-lightbox-style')) fails.push('lightbox: the viewer stylesheet must leave with the last instance, not outlive the page that used it');
  if (document.getElementById('kt-lightbox')) fails.push('lightbox: the shared viewer must leave with the last instance');
} else {
  fails.push('lightbox: fixture did not mount — the shared-element check never ran');
}
lightboxHost.remove();

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
console.log('leak OK — no net event listeners / rAF handles / observers / document nodes left after destroy().');
// Exit synchronously: any leaked rAF would otherwise re-arm forever and hang.
process.exit(0);
