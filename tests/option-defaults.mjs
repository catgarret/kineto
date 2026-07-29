// Every control the settings drawer renders must have a known resting value, so
// the panel shows what the demo is ACTUALLY doing rather than a blank.
//
// The bug this locks down: `optionValue()` used to return '' whenever the demo
// markup did not spell an option out as a data-kt-* attribute. 176 of 371 fields
// came up empty; touching one wrote an attribute that had never existed, which
// looked like "the setting only starts working once you poke it". The fix is a
// declared default per option in kineto.features.json (`optionDefaults`), mirrored
// into demo/playground.js as PUBLIC_DEFAULTS by scripts/sync-playground-options.mjs.
//
// Add a control to FIELDS without declaring its default and this test fails.
//
// Run: node tests/option-defaults.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'demo/playground.js'), 'utf8');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));

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
const DEFAULTS = eval(`(${objectLiteral('DEFAULTS')})`);
const PUBLIC_DEFAULTS = eval(`(${objectLiteral('PUBLIC_DEFAULTS')})`);

const byName = new Map(contract.modules.map((module) => [module.name, module]));
const problems = [];

// 1. No field may be left without a resting value.
const undeclared = [];
let fieldCount = 0;
for (const [moduleName, rows] of Object.entries(FIELDS)) {
  for (const [key] of rows) {
    fieldCount += 1;
    const known = DEFAULTS[moduleName]?.[key] !== undefined || PUBLIC_DEFAULTS[moduleName]?.[key] !== undefined;
    if (!known) undeclared.push(`${moduleName}.${key}`);
  }
}
if (undeclared.length) {
  problems.push(`${undeclared.length} drawer field(s) have no declared default — the panel will show a blank:\n    - ${undeclared.slice(0, 25).join('\n    - ')}`);
}

// 2. PUBLIC_DEFAULTS must be a faithful mirror of the contract, not hand-edited.
const mirrored = {};
for (const module of [...contract.modules].sort((a, b) => a.name.localeCompare(b.name))) {
  if (module.optionDefaults && Object.keys(module.optionDefaults).length) mirrored[module.name] = module.optionDefaults;
}
if (JSON.stringify(mirrored) !== JSON.stringify(PUBLIC_DEFAULTS)) {
  problems.push('PUBLIC_DEFAULTS in demo/playground.js has drifted from kineto.features.json. Run: node scripts/sync-playground-options.mjs');
}

// 3. A declared default must name a real public option of that module, otherwise
//    it is dead weight that silently stops matching the implementation.
const orphans = [];
for (const [moduleName, defaults] of Object.entries(mirrored)) {
  const module = byName.get(moduleName);
  if (!module) { orphans.push(`${moduleName} (module not in contract)`); continue; }
  for (const key of Object.keys(defaults)) {
    if (!module.publicOptions.includes(key)) orphans.push(`${moduleName}.${key}`);
  }
}
if (orphans.length) {
  problems.push(`${orphans.length} declared default(s) do not name a public option:\n    - ${orphans.slice(0, 20).join('\n    - ')}`);
}

// 4. Defaults must be primitives the drawer can put in an input.
const badTypes = [];
for (const [moduleName, defaults] of Object.entries(mirrored)) {
  for (const [key, value] of Object.entries(defaults)) {
    const type = typeof value;
    if (type !== 'string' && type !== 'number' && type !== 'boolean') badTypes.push(`${moduleName}.${key} (${type})`);
  }
}
if (badTypes.length) problems.push(`${badTypes.length} default(s) are not a string/number/boolean:\n    - ${badTypes.join('\n    - ')}`);

if (problems.length) {
  console.error('option-defaults FAILED:\n  - ' + problems.join('\n  - '));
  process.exit(1);
}
const declaredCount = Object.values(mirrored).reduce((sum, o) => sum + Object.keys(o).length, 0);
console.log(`option-defaults OK — ${fieldCount} drawer fields, 0 without a resting value; ${declaredCount} defaults declared in the contract across ${Object.keys(mirrored).length} modules.`);
