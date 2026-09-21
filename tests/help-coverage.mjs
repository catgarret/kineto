// Every field the settings drawer renders must carry a (?) tooltip in every
// language the demo offers. The tooltip is created only `if (tip)` in
// demo/playground.js, so a missing HELP entry silently drops the (?) — there is
// no visual warning. This test is the guard: add a control to FIELDS without a
// tooltip and the build fails.
//
// Run: node tests/help-coverage.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demo = path.join(root, 'demo');

// Read the demo's own tables rather than a duplicated list, so the audit can
// never drift from what the page actually renders.
//
// This used to read the first `const FIELDS = { … }` literal out of the source
// text, which saw 32 modules of the 50 the drawer actually builds: the rest are
// appended with `Object.assign(FIELDS, { … })` further down. A module added
// there could ship with no tooltips at all and this test still reported "0
// gaps" — which is exactly what happened to Squircle. Running the real script
// and reading the manifest it publishes is the only way the audit can see every
// field, and it is what tests/demo-control-contract.mjs already does.
const window = new JSDOM('<!doctype html><body></body>', {
  url: 'https://example.test/',
  runScripts: 'dangerously',
  pretendToBeVisual: true
}).window;
window.matchMedia = (query) => ({
  matches: false, media: query,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
});
const playgroundScript = window.document.createElement('script');
playgroundScript.textContent = fs.readFileSync(path.join(demo, 'playground.js'), 'utf8');
window.document.body.appendChild(playgroundScript);
const FIELDS = window.KinetoPlayground?.fields;
if (!FIELDS) throw new Error('demo/playground.js no longer publishes KinetoPlayground.fields');

const helpHost = {};
for (const file of ['help-i18n.js', 'help-i18n-extra.js']) {
  new Function('window', fs.readFileSync(path.join(demo, file), 'utf8'))(helpHost);
}
const HELP = helpHost.MK_HELP_I18N;
if (!HELP || !HELP.ko || !HELP.en) {
  console.error('help-coverage FAILED — MK_HELP_I18N did not load with ko + en sets.');
  process.exit(1);
}

const languages = Object.keys(HELP);
const fieldCount = Object.values(FIELDS).reduce((sum, rows) => sum + rows.length, 0);
// Fields that have never had a tooltip. Widening the audit above from the first
// source literal to the drawer's real manifest uncovered these 110 at once —
// they were always unexplained, the old audit simply could not see them.
// (109 now: `hold.mode` was written when tap-to-confirm was added.)
//
// This list is a RATCHET, not an exemption: it may only shrink. Writing a
// tooltip and leaving the entry here fails the test just as loudly as a new gap,
// so the debt cannot quietly become permanent, and nothing new can join it.
const KNOWN_GAPS = {
  accordion: ['activeClass', 'arrowPosition', 'blur', 'duration', 'ease', 'effect', 'single'],
  bottomSheet: ['backdrop', 'backdropOpacity', 'dismissible', 'duration', 'handle', 'resizable'],
  brushReveal: ['threshold'],
  confetti: ['colors', 'count', 'duration', 'gravity', 'once', 'scalar', 'spread', 'trigger', 'zIndex'],
  coverReveal: ['color', 'delay', 'direction', 'duration', 'layers', 'lines', 'maskDirection', 'stagger', 'waitForImage', 'watch'],
  drag: ['axis', 'bounds', 'inertia', 'snapBack'],
  gesture: ['duration', 'hoverScale', 'lift', 'origin', 'tapScale'],
  hold: ['action', 'blend', 'color', 'decay', 'duration', 'step', 'submit'],
  lightbox: ['download', 'thumbnails', 'transition'],
  loadingIndicator: ['barHeight', 'barWidth', 'color', 'preset', 'progressOutput', 'progressSource', 'progressTemplate', 'showLabel', 'showSpinner', 'showStatus', 'size', 'stepTotal', 'stroke', 'trackColor'],
  megaMenu: ['closeDelay', 'duration', 'indicator', 'layout', 'openDelay', 'trigger'],
  stickyHeader: ['activeClass', 'distance', 'offset', 'shadow', 'shrink'],
  switch: ['checked', 'duration', 'offColor', 'onColor', 'size', 'thumbColor'],
  tabs: ['activation', 'activeClass', 'duration', 'effect', 'indicator', 'indicatorMotion', 'orientation'],
  toast: ['barColor', 'dismissible', 'duration', 'icon', 'max', 'message', 'position', 'progressBar', 'type'],
  tooltip: ['content', 'delay', 'duration', 'effect', 'hideDelay', 'html', 'interactive', 'offset', 'placement', 'trigger'],
};
const known = new Set(
  Object.entries(KNOWN_GAPS).flatMap(([moduleName, keys]) => keys.map((key) => `${moduleName}.${key}`))
);

const missing = [];
const blank = [];
const fixed = [];
for (const [moduleName, rows] of Object.entries(FIELDS)) {
  for (const row of rows) {
    const key = row[0];
    const allowed = known.has(`${moduleName}.${key}`);
    let covered = 0;
    for (const lang of languages) {
      const tip = HELP[lang]?.[moduleName]?.[key];
      if (tip == null) { if (!allowed) missing.push(`${lang} · ${moduleName}.${key}`); }
      else if (typeof tip !== 'string' || tip.trim().length < 4) blank.push(`${lang} · ${moduleName}.${key}`);
      else covered += 1;
    }
    // Written in every language but still listed: remove it from KNOWN_GAPS.
    if (allowed && covered === languages.length) fixed.push(`${moduleName}.${key}`);
  }
}
// An entry naming a field the drawer no longer renders is stale in the other
// direction, and would hide a real gap if that field ever came back.
const fieldKeys = new Set(
  Object.entries(FIELDS).flatMap(([moduleName, rows]) => rows.map((row) => `${moduleName}.${row[0]}`))
);
const orphaned = [...known].filter((entry) => !fieldKeys.has(entry));

// Tooltips in the drawer are a single line of prose; anything past ~220 chars
// overflows the popover instead of explaining the option.
const tooLong = [];
for (const [lang, modules] of Object.entries(HELP)) {
  for (const [moduleName, tips] of Object.entries(modules || {})) {
    for (const [key, tip] of Object.entries(tips || {})) {
      if (typeof tip === 'string' && tip.length > 220) tooLong.push(`${lang} · ${moduleName}.${key} (${tip.length} chars)`);
    }
  }
}

// A tooltip that just repeats its own label ("Glare opacity" -> "Glare
// opacity.") occupies the (?) without teaching anything. Compare the English
// tooltip against the English label and reject pure restatements.
const flatten = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const restated = [];
for (const [moduleName, rows] of Object.entries(FIELDS)) {
  for (const [key, label] of rows) {
    const tip = flatten(HELP.en?.[moduleName]?.[key]);
    const name = flatten(label);
    if (name && tip.startsWith(name) && tip.length <= name.length * 1.35) {
      restated.push(`${moduleName}.${key} — label "${label}" vs tip "${HELP.en[moduleName][key]}"`);
    }
  }
}

const problems = [];
if (restated.length) problems.push(`${restated.length} tooltip(s) only restate their label:\n    - ${restated.slice(0, 20).join('\n    - ')}`);
if (missing.length) problems.push(`${missing.length} field(s) without a tooltip:\n    - ${missing.slice(0, 25).join('\n    - ')}`);
if (fixed.length) problems.push(`${fixed.length} field(s) now have tooltips — delete them from KNOWN_GAPS:\n    - ${fixed.slice(0, 25).join('\n    - ')}`);
if (orphaned.length) problems.push(`${orphaned.length} KNOWN_GAPS entry(ies) name a field the drawer no longer has:\n    - ${orphaned.join('\n    - ')}`);
if (blank.length) problems.push(`${blank.length} tooltip(s) too short to explain anything:\n    - ${blank.slice(0, 15).join('\n    - ')}`);
if (tooLong.length) problems.push(`${tooLong.length} tooltip(s) longer than 220 chars:\n    - ${tooLong.slice(0, 15).join('\n    - ')}`);

if (problems.length) {
  console.error('help-coverage FAILED:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
console.log(
  `help-coverage OK — ${fieldCount} drawer fields x ${languages.length} languages (${languages.join(', ')}), `
  + `${known.size} field(s) still owed a tooltip (see KNOWN_GAPS; the list may only shrink).`
);
