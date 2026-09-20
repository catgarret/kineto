// Structural demo checks that run the REAL demo scripts in a DOM:
//  1. Module Index (#module-list) has exactly registry-count items, each with a
//     one-line description (no stale/extra entries — e.g. never 55 vs 51).
//  2. Every settings trigger sits AFTER (below) its demo — including the long
//     pinned demos (stickyStack / scrollSequence / horizontalScroll).
// Run: node tests/demo-structure.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY = fs.readdirSync(path.join(root, 'src/modules')).filter((f) => f.endsWith('.js')).map((f) => f.replace('.js', ''));
// `radial` used to have no nav entry of its own — it was only demoed through
// Slider's radial effect, so the counts here had to add it back by hand. It now
// carries a data-kt-radial card and is listed like every other module, so the
// index count is simply the registry count.
const COMPAT_DEMOS = { radial: 'slider' };
const html = fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/gi, '');

// Count top-level demo units the way buildContent does, so we can prove none are
// lost when the category sections are rebuilt.
const UNIT_SEL = '.card, .reveal-demo-card, .hscroll-demo-unit, .scroll-demo-unit, [data-demo-module], [data-kt-sticky-stack], [data-kt-horizontal-scroll], [data-kt-scroll-sequence], [data-loader-type]';
const countUnits = (doc) => { const r = [...doc.querySelectorAll('main ' + UNIT_SEL)]; return r.filter((u) => !r.some((o) => o !== u && o.contains(u))); };
const unitsBefore = countUnits(new JSDOM(fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8')).window.document).length;

const dom = new JSDOM(html, { url: 'https://example.test/', runScripts: 'dangerously', pretendToBeVisual: true });
const { window: w } = dom; const d = w.document;
w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
w.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
w.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
const run = (c) => { const s = d.createElement('script'); s.textContent = c; d.body.appendChild(s); };
const noop = () => {};
run(`const R=${JSON.stringify(REGISTRY)};window.Kineto={registry:Object.fromEntries(R.map(m=>[m,{}])),config:${noop},init:${noop},replay:${noop},destroyModule:${noop},pageReveal:${noop},loader:()=>({destroy:()=>{}}),enableSmooth:${noop},disableSmooth:${noop},getInstance:()=>null};`);
try { run(fs.readFileSync(path.join(root, 'demo/help-i18n.js'), 'utf8')); } catch (_) {}
run(fs.readFileSync(path.join(root, 'demo/module-metadata.js'), 'utf8'));
// 비교 시트는 블록을 만들 때 main.js가 직접 부르므로, 구조 검사에서도 실제로 실행합니다.
run(fs.readFileSync(path.join(root, 'demo/variant-catalog.js'), 'utf8'));
run(fs.readFileSync(path.join(root, 'demo/compare.js'), 'utf8'));
run(fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8'));
run(fs.readFileSync(path.join(root, 'demo/main.js'), 'utf8'));

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
ok(!/\sstyle="/.test(fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8')), 'demo/index.html contains static inline style attributes');
const sourceDocument = new JSDOM(fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8')).window.document;
const inlineScripts = [...sourceDocument.querySelectorAll('script:not([src])')];
ok(
  inlineScripts.length === 1 && /googletagmanager\.com\/gtm\.js/.test(inlineScripts[0].textContent),
  'demo may contain only the required Google Tag Manager bootstrap inline script'
);
ok(sourceDocument.querySelectorAll('style').length === 0, 'demo contains inline style blocks');

// 1. Module Index
const items = [...d.querySelectorAll('#module-list .mod-index-item')];
ok(items.length === REGISTRY.length, `module-index count ${items.length}, expected ${REGISTRY.length}`);
ok(items.every((i) => i.querySelector('.mii-sub')?.textContent.trim()), 'some module-index items have no description');
const idxModules = items.map((i) => i.dataset.module);
ok(new Set(idxModules).size === idxModules.length, 'duplicate module in index');
for (const [moduleName, hostModule] of Object.entries(COMPAT_DEMOS)) {
  ok(idxModules.includes(moduleName), `module-index is missing ${moduleName}`);
  ok(idxModules.includes(hostModule), `module-index is missing ${hostModule}, which shares ${moduleName}'s engine`);
}

// 2. Settings triggers below demos (pinned ones especially)
const toDash = (n) => n.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
for (const name of ['stickyStack', 'scrollSequence', 'horizontalScroll']) {
  const demo = d.querySelector('[data-kt-' + toDash(name) + ']');
  const settingsHost = d.querySelector('[data-settings-for="' + name + '"]');
  const trig = settingsHost?.querySelector(':scope > .kt-playground > summary')
    || settingsHost?.querySelector(':scope > summary');
  ok(!!demo, `${name}: demo not found`);
  ok(!!trig, `${name}: settings trigger not found`);
  if (demo && trig) {
    const following = demo.compareDocumentPosition(trig) & w.Node.DOCUMENT_POSITION_FOLLOWING;
    ok(!!following, `${name}: settings trigger is NOT below the demo`);
  }
}
ok(d.querySelectorAll('.kt-playground-host--above').length === 0, 'a settings panel is still placed above its demo');
for (const [module, variants] of [
  ['slider', ['fade', 'wipe', 'flip', 'cube', 'cards', 'creative']],
  ['reveal', ['mask', 'swing', 'skew']]
]) {
  for (const variant of variants) {
    const cards = [...d.querySelectorAll(`#mod-${module} .card[data-demo-no-legacy-share]`)]
      .filter((card) => card.querySelector(`[data-kt-${module}="${variant}"]`));
    ok(cards.length === 1, `${module}.${variant}: requires one dedicated comparison card`);
    const panel = cards[0]?.querySelector(':scope > .kt-playground');
    ok(!!panel?.dataset.shareKey, `${module}.${variant}: requires semantic shared settings`);
    ok(!panel?.dataset.shareLegacyKey, `${module}.${variant}: must not shift historical v1 aliases`);
  }
}
const verticalStack = d.querySelector('[data-kt-sticky-stack="vertical"]');
const verticalUnit = verticalStack?.closest('.sticky-stack-unit');
const verticalStage = verticalStack?.closest('.demo-stage');
ok(!!verticalUnit?.classList.contains('card'), 'vertical sticky stack is not using the standard demo card structure');
ok(verticalStage?.parentElement === verticalUnit, 'vertical sticky stack is not directly contained by its demo-stage/card unit');
ok(
  verticalStage?.nextElementSibling?.classList.contains('kt-playground'),
  'vertical sticky stack settings are not glued directly below the demo-stage'
);
const stickyDemos = [...d.querySelectorAll('#mod-stickyStack [data-demo-id]')];
const stickySettings = [...d.querySelectorAll('#mod-stickyStack [data-settings-for-demo]')];
ok(stickyDemos.length === 3, `stickyStack has ${stickyDemos.length} demo ids, expected 3`);
ok(stickySettings.length === 3, `stickyStack has ${stickySettings.length} settings owners, expected 3`);
for (const id of ['stickyStack-vertical', 'stickyStack-horizontal', 'stickyStack-floating']) {
  ok(stickyDemos.filter((node) => node.dataset.demoId === id).length === 1, `${id}: demo owner is not unique`);
  ok(stickySettings.filter((node) => node.dataset.settingsForDemo === id).length === 1, `${id}: settings owner is not unique`);
}

// 3. No demo unit is lost or orphaned by the category rebuild.
const unitsAfter = countUnits(d);
ok(unitsAfter.length === unitsBefore, `demo units changed during rebuild: ${unitsBefore} -> ${unitsAfter.length}`);
ok((w.__ktDemoOrphans || 0) === 0, `${w.__ktDemoOrphans} demo unit(s) had no resolvable module owner (orphaned)`);
const loose = unitsAfter.filter((u) => !u.closest('[data-module-block]') && !u.closest('.hero'));
ok(loose.length === 0, `${loose.length} demo unit(s) ended up outside any module block`);
// 4. Standalone scroll demos (not .card) must NOT be forced into a 3-col grid —
//    they stack full width. (Card-based full-width modules like fullpage may use
//    a grid because each `.card.full` spans a full row anyway.)
for (const m of ['horizontalScroll', 'stickyStack', 'scrollSequence']) {
  const body = d.getElementById('mod-' + m)?.querySelector('.module-block-body');
  ok(body && !body.classList.contains('grid'), `${m}: standalone demo is inside a forced grid`);
}

// 5. 모션 토글 — 질감 카드에서 움직임을 켜고 끌 수 있어야 합니다. 버튼 하나가
//    라벨 두 개(끄기/켜기)를 품고 한 번에 하나만 보여 주는 구조라, 여기서는 그
//    약속이 지켜지는지 확인합니다: 대상이 실제로 있고, 켤 때 쓸 모션 이름이
//    있고, aria-pressed 와 보이는 라벨이 카드의 현재 상태와 일치하는지.
const motionToggles = [...d.querySelectorAll('[data-action="toggle-motion"]')];
ok(motionToggles.length >= 4, `motion toggles: ${motionToggles.length}, expected at least 4`);
const MOTIONS = ['drift', 'shuffle', 'scan', 'flow', 'pulse'];
for (const button of motionToggles) {
  const card = button.closest('.card');
  const target = card?.querySelector('[data-kt-stylize]');
  const title = card?.querySelector('h3')?.textContent?.trim() || '(untitled)';
  ok(!!target, `${title}: motion toggle has no [data-kt-stylize] target in its card`);
  if (!target) continue;
  const on = (target.getAttribute('data-kt-motion') || 'none') !== 'none';
  ok(MOTIONS.includes(button.dataset.motionOn), `${title}: data-motion-on must name a real motion, got "${button.dataset.motionOn}"`);
  ok(button.getAttribute('aria-pressed') === String(on), `${title}: aria-pressed must match the card's authored motion`);
  const labels = [...button.querySelectorAll('[data-demo-i18n-text]')];
  ok(labels.length === 2, `${title}: a motion toggle needs exactly two labels (off/on), got ${labels.length}`);
  if (labels.length === 2) {
    ok(labels.filter((label) => !label.hidden).length === 1, `${title}: exactly one motion label may be visible`);
    ok(labels[on ? 1 : 0].hidden, `${title}: the visible label must describe what pressing the button does`);
  }
}
// 켜기만 있고 끄기가 없으면 요청의 절반만 지킨 셈이라, 두 방향이 모두 있는지 봅니다.
ok(
  motionToggles.some((button) => button.getAttribute('aria-pressed') === 'true')
  && motionToggles.some((button) => button.getAttribute('aria-pressed') === 'false'),
  'the demo must show both directions: a moving texture that can stop and a still one that can start'
);
ok(
  /dataset\.action==='toggle-motion'/.test(fs.readFileSync(path.join(root, 'demo/main.js'), 'utf8')),
  'demo/main.js must handle the motion toggle'
);

console.log('demo units:', unitsBefore, '-> ', unitsAfter.length, '| orphans:', w.__ktDemoOrphans, '| loose:', loose.length);
console.log('motion toggles:', motionToggles.length);
console.log('module-index items:', items.length, '| settings hosts:', d.querySelectorAll('[data-settings-for]').length);
if (fails.length) { console.error('\nFAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('demo-structure OK — index groups cover registry, every settings trigger is below its demo.');
