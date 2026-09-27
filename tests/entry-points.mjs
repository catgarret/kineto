// Package entry points: kineto.features.json#entryPoints is the source of
// truth; package.json#exports, the type files, `files`, `sideEffects` and the
// built default entry must all agree with it (docs/entry-points.md).
//
//   - every public subpath is in the contract and vice versa;
//   - each subpath's `types` file exists and is the one the contract names;
//   - files with import-time side effects are declared, so a bundler never drops
//     a bare `import '@dong-gri/kineto/all'`;
//   - the default entry and `/all` are the SAME Kineto instance, and the default
//     entry's KT_DEPRECATED notice is opt-in, sent once, and then gets out of the way;
//   - the auto entry's extra API exists there and nowhere else.
//
// Run after `npm run build`: node tests/entry-points.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DEFAULT_ENTRY_NOTICE, ENTRY_POINTS } from '../scripts/entry-points.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const NOT_ENTRIES = new Set(['./style.css', './package.json']);

// 1. Subpaths: contract ⇔ package.json.
const exported = Object.keys(packageJson.exports).filter((subpath) => !NOT_ENTRIES.has(subpath)).sort();
assert.deepEqual(exported, Object.keys(ENTRY_POINTS).sort(), 'package.json#exports and kineto.features.json#entryPoints must list the same subpaths');

// 2. Types and targets. Conditions may nest ({ import: { types, default }, require: … }).
const leaves = (target, path = []) => (typeof target === 'string'
  ? [{ path, file: target }]
  : Object.entries(target).flatMap(([condition, value]) => leaves(value, [...path, condition])));
for (const [subpath, entry] of Object.entries(ENTRY_POINTS)) {
  const all = leaves(packageJson.exports[subpath]);
  const typesFor = (condition) => all.find(({ path: keys }) => keys.at(-1) === 'types' && (keys.length === 1 || keys[0] === condition))?.file;
  assert.equal(typesFor('import'), `./types/${entry.types}.d.ts`, `${subpath} must declare the ESM types file the contract names`);
  const requireTypes = all.find(({ path: keys }) => keys[0] === 'require' && keys.at(-1) === 'types')?.file;
  if (requireTypes) assert.match(requireTypes, /\.d\.cts$/, `${subpath}: require must resolve CommonJS declarations (.d.cts)`);
  for (const { path: keys, file } of all) {
    if (file.includes('*')) continue;
    assert.ok(fs.existsSync(path.join(root, file)), `${subpath} (${keys.join('.')}) → ${file} must exist after the build`);
    if (keys.at(-1) === 'types') continue;
    const packed = packageJson.files.some((allowed) => file.replace(/^\.\//, '').startsWith(allowed));
    assert.ok(packed, `${file} must be inside package.json#files`);
  }
}
const defaultImport = leaves(packageJson.exports['.']).find(({ path: keys }) => keys[0] === 'import' && keys.at(-1) === 'default').file;
assert.equal(packageJson.module, defaultImport, 'the legacy `module` field must point at the default entry');

// 3. Import-time side effects are declared.
for (const file of ['./dist/kineto.default.js', './dist/kineto.min.js', './dist/modular/auto.js']) {
  assert.ok(packageJson.sideEffects.includes(file), `${file} registers modules when imported and must be listed in sideEffects`);
}

// 4. The auto-only API is exactly what the contract says, and not core API.
const autoApi = ENTRY_POINTS['./auto'].api;
assert.ok(Array.isArray(autoApi) && autoApi.length, 'the auto entry must list the API it adds');
autoApi.forEach((method) => assert.ok(!contract.coreApi.includes(method), `${method} belongs to the auto entry, not coreApi`));

// 5. Default entry vs /all at runtime (Node, no DOM: scan() is an SSR no-op).
const { default: Default } = await import('../dist/kineto.default.js');
const { default: All } = await import('../dist/kineto.min.js');
assert.equal(Default, All, 'the default entry and /all must share one Kineto instance');
assert.equal(Object.keys(All.registry).length, contract.moduleCount, 'the default entry is still the full runtime in 0.13');
autoApi.forEach((method) => assert.equal(All[method], undefined, `the full runtime must not grow the auto-only ${method}()`));

const originalScan = Object.getOwnPropertyDescriptor(All, 'scan').value;
assert.notEqual(originalScan.name, '', 'scan is a function');
All.scan();
assert.equal(All.diagnostics.history.length, 0, 'without diagnostics turned on the notice is not recorded');
const received = [];
All.config({ debugSink: (event) => received.push(event) });
All.scan();
All.config({});
const notices = received.filter((event) => event.code === 'KT_DEPRECATED' && event.detail?.entry === '@dong-gri/kineto');
assert.equal(notices.length, 1, 'the default-entry notice is sent once, as soon as diagnostics are on');
assert.deepEqual(notices[0].detail, DEFAULT_ENTRY_NOTICE.detail, 'the notice carries the contract wording');
assert.deepEqual(notices[0].detail.replacement, ['@dong-gri/kineto/auto', '@dong-gri/kineto/all']);
assert.notEqual(All.scan.name, 'kinetoDefaultEntryNotice', 'after the notice the original scan() is restored');
assert.notEqual(All.config.name, 'kinetoDefaultEntryNotice', 'after the notice the original config() is restored');
All.config({ debugSink: null });

// 6. The deprecation is declared where the procedure says (docs/diagnostics-and-deprecation.md).
const defaultTypes = fs.readFileSync(path.join(root, 'types/default.d.ts'), 'utf8');
assert.match(defaultTypes, /@deprecated/, 'types/default.d.ts must mark the default export deprecated');
const deprecationDoc = fs.readFileSync(path.join(root, 'docs/diagnostics-and-deprecation.md'), 'utf8');
assert.match(deprecationDoc, /@dong-gri\/kineto\/auto/, 'the deprecation list must describe the default entry change');
assert.ok(fs.existsSync(path.join(root, 'docs/entry-points.md')), 'docs/entry-points.md is the migration guide');

// 7. Build output is not committed (0.13+): every workflow builds the commit it
//    tests, and a committed dist/ hid size regressions. Skipped outside a Git checkout.
let tracked = null;
try { tracked = execFileSync('git', ['ls-files', '--', 'dist'], { cwd: root, encoding: 'utf8' }).trim(); } catch (_error) { /* not a Git checkout */ }
if (tracked !== null) assert.equal(tracked, '', 'dist/ must not be tracked by Git (it is build output; see .gitignore)');

console.log(`entry-points OK — ${exported.length} subpaths match the contract; default = /all instance, opt-in notice once; auto API isolated.`);
