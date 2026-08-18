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
const GROUPED_MODULES = { radial: 'slider' };
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
ok(items.length + Object.keys(GROUPED_MODULES).length === REGISTRY.length, `module-index/group count ${items.length} + ${Object.keys(GROUPED_MODULES).length}, expected ${REGISTRY.length}`);
ok(items.every((i) => i.querySelector('.mii-sub')?.textContent.trim()), 'some module-index items have no description');
const idxModules = items.map((i) => i.dataset.module);
ok(new Set(idxModules).size === idxModules.length, 'duplicate module in index');
for (const [moduleName, hostModule] of Object.entries(GROUPED_MODULES)) {
  ok(idxModules.includes(hostModule), `module-index group host ${hostModule} is missing for ${moduleName}`);
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

console.log('demo units:', unitsBefore, '-> ', unitsAfter.length, '| orphans:', w.__ktDemoOrphans, '| loose:', loose.length);
console.log('module-index items:', items.length, '| settings hosts:', d.querySelectorAll('[data-settings-for]').length);
if (fails.length) { console.error('\nFAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log('demo-structure OK — index groups cover registry, every settings trigger is below its demo.');
