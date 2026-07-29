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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demo = path.join(root, 'demo');

// Read the demo's own tables rather than a duplicated list, so the audit can
// never drift from what the page actually renders.
const source = fs.readFileSync(path.join(demo, 'playground.js'), 'utf8');
function objectLiteral(name) {
  const start = source.indexOf(`const ${name} = {`);
  if (start < 0) throw new Error(`playground.js no longer declares \`const ${name} = {\``);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error(`unterminated ${name} literal`);
}

const FIELDS = eval(`(${objectLiteral('FIELDS')})`);

const win = {};
for (const file of ['help-i18n.js', 'help-i18n-extra.js']) {
  new Function('window', fs.readFileSync(path.join(demo, file), 'utf8'))(win);
}
const HELP = win.MK_HELP_I18N;
if (!HELP || !HELP.ko || !HELP.en) {
  console.error('help-coverage FAILED — MK_HELP_I18N did not load with ko + en sets.');
  process.exit(1);
}

const languages = Object.keys(HELP);
const fieldCount = Object.values(FIELDS).reduce((sum, rows) => sum + rows.length, 0);
const missing = [];
const blank = [];
for (const [moduleName, rows] of Object.entries(FIELDS)) {
  for (const row of rows) {
    const key = row[0];
    for (const lang of languages) {
      const tip = HELP[lang]?.[moduleName]?.[key];
      if (tip == null) missing.push(`${lang} · ${moduleName}.${key}`);
      else if (typeof tip !== 'string' || tip.trim().length < 4) blank.push(`${lang} · ${moduleName}.${key}`);
    }
  }
}

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
if (blank.length) problems.push(`${blank.length} tooltip(s) too short to explain anything:\n    - ${blank.slice(0, 15).join('\n    - ')}`);
if (tooLong.length) problems.push(`${tooLong.length} tooltip(s) longer than 220 chars:\n    - ${tooLong.slice(0, 15).join('\n    - ')}`);

if (problems.length) {
  console.error('help-coverage FAILED:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
console.log(`help-coverage OK — ${fieldCount} drawer fields x ${languages.length} languages (${languages.join(', ')}), 0 gaps.`);
