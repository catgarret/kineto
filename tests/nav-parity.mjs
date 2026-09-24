// Verifies the demo's LEFT NAV order == RIGHT CONTENT order, by actually running
// demo/main.js against demo/index.html in a DOM and reading both sides back.
//
//   leftOrder  = [...#side-nav-modules .nav-mod].map(a => a.dataset.module)
//   rightOrder = [...main [data-module-block]].map(el => el.dataset.moduleBlock)
//   expect(rightOrder).toEqual(leftOrder)          // same order, by construction
//   expect(new Set(leftOrder).size).toBe(len)      // no duplicates
//   grouped compatibility modules may share their engine's section
//   each nav href="#mod-X" resolves to exactly one element with that id
//   each nav label === its module block title; every block has a subtitle
//
// Run: node tests/nav-parity.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'demo/index.html'), 'utf8');
const mainJs = fs.readFileSync(path.join(root, 'demo/main.js'), 'utf8');
const helpJs = fs.readFileSync(path.join(root, 'demo/help-i18n.js'), 'utf8');
const REGISTRY = fs.readdirSync(path.join(root, 'src/modules'))
  .filter((f) => f.endsWith('.js')).map((f) => f.replace('.js', ''));
// `radial` is a backward-compatible entry point onto Slider's radial effect.
// Both are public modules and both are listed in the nav; this map only records
// that they share one engine.
//
// 2026-09-20: the demo used to carry a card for each, which showed the same
// carousel twice. 2026-09-24: the one remaining card lived in Slider's block,
// which left the Radial block as a heading over a "the card is over there" note
// — the owner read that as Radial being hidden. The card now lives in Radial's
// own block (data-kt-radial), and Slider's compare sheet borrows it as the
// material for its `radial` variant (data-demo-specimen="slider").
const COMPAT_DEMOS = { radial: 'slider' };

// Drop the page's own <script> tags (external bundle + demo scripts); we inject
// controlled stubs + main.js ourselves so nothing depends on network fetches.
const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, '');
const dom = new JSDOM(stripped, { url: 'https://example.test/', runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;
const doc = window.document;

const stub = `
  window.matchMedia = window.matchMedia || (q => ({ matches: true, media: q, onchange: null,
    addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){}, dispatchEvent(){return false;} }));
  window.IntersectionObserver = window.IntersectionObserver || class { observe(){} unobserve(){} disconnect(){} };
  const __REG = ${JSON.stringify(REGISTRY)};
  const __noop = () => {};
  window.Kineto = { registry: Object.fromEntries(__REG.map(m => [m, {}])), config: __noop, init: __noop,
    replay: __noop, destroyModule: __noop, pageReveal: __noop, loader: () => ({ destroy: __noop }),
    enableSmooth: __noop, disableSmooth: __noop, getInstance: () => null };
  window.KinetoPlayground = { capture: __noop, mount: __noop, setHelpLang: __noop, refreshHelp: __noop,
    publicOptions: {}, pageRevealOptions: () => ({}) };
`;
const run = (code) => { const s = doc.createElement('script'); s.textContent = code; doc.body.appendChild(s); };
run(stub);
run(fs.readFileSync(path.join(root, 'demo/module-metadata.js'), 'utf8'));
try { run(helpJs); } catch (_) {}
run(mainJs);

const leftOrder = [...doc.querySelectorAll('#side-nav-modules .nav-mod')].map((a) => a.dataset.module);
const rightOrder = [...doc.querySelectorAll('main [data-module-block]')].map((el) => el.dataset.moduleBlock);

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const arrEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

ok(leftOrder.length > 0, 'nav produced no links (builder did not run)');
ok(arrEq(leftOrder, rightOrder), 'leftOrder !== rightOrder');
ok(new Set(leftOrder).size === leftOrder.length, 'duplicate module in nav');
ok(new Set(rightOrder).size === rightOrder.length, 'duplicate module block');
ok(leftOrder.length === REGISTRY.length, `nav count ${leftOrder.length} !== registry ${REGISTRY.length}`);
const missing = REGISTRY.filter((m) => !leftOrder.includes(m));
ok(missing.length === 0, 'modules missing from nav: ' + missing.join(', '));
for (const [moduleName, hostModule] of Object.entries(COMPAT_DEMOS)) {
  ok(REGISTRY.includes(moduleName), `compat module ${moduleName} is not registered`);
  ok(leftOrder.includes(hostModule), `${hostModule} is missing from the nav for ${moduleName}`);
  if (moduleName === 'radial') {
    ok(!!doc.querySelector('#mod-radial [data-demo-home="radial"] [data-kt-radial]'), 'the Radial block must hold its own data-kt-radial card');
    ok(!doc.querySelector('#mod-radial .module-block-elsewhere'), 'the Radial block must not point elsewhere for its demo');
    const specimen = doc.querySelector('[data-demo-specimen="slider"]');
    ok(!!specimen && specimen.children.length >= 2,
      'Slider\'s compare sheet needs radial material — mark an element with 2+ items data-demo-specimen="slider"');
  }
}
for (const a of doc.querySelectorAll('#side-nav-modules .nav-mod')) {
  const href = a.getAttribute('href') || '';
  ok(href === `#mod-${a.dataset.module}`, `bad href ${href} for ${a.dataset.module}`);
  const id = href.slice(1);
  const matches = doc.querySelectorAll('[id="' + id + '"]');
  ok(matches.length === 1, `href ${href} resolves to ${matches.length} elements`);
  const block = doc.getElementById(id);
  if (block) {
    const title = block.querySelector('.module-block-title')?.textContent.trim();
    ok(title === a.textContent.trim(), `label "${a.textContent.trim()}" !== title "${title}" (${a.dataset.module})`);
    const sub = block.querySelector('.module-block-sub')?.textContent.trim();
    ok(!!sub, `block ${id} has no subtitle`);
  }
}

console.log('LEFT  (nav):   ', JSON.stringify(leftOrder));
console.log('RIGHT (blocks):', JSON.stringify(rightOrder));
console.log('equal:', arrEq(leftOrder, rightOrder), '| count:', leftOrder.length, '| registry:', REGISTRY.length);
if (fails.length) { console.error('\nFAILED:\n - ' + fails.join('\n - ')); process.exit(1); }
console.log(`\nnav-parity OK — ${leftOrder.length} sections represent ${REGISTRY.length} modules, all checks passed.`);
