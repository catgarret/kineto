// Dependency-boundary guard (audit D-4). Kineto must NOT bundle or import GSAP /
// Lenis: they are loaded at runtime from the page or the official CDN (see
// src/runtime.js). This keeps the shipped files free of third-party engine code
// (no redistribution / licensing grey area, no pinned engine version) while
// still working with zero setup. This test fails if an engine sneaks back into
// the source imports or the built bundles.
// Run: node tests/deps-boundary.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const packageJson = JSON.parse(read('package.json'));

// 0. Published runtime metadata must stay dependency-free. Engines are loaded
// on demand from the page/CDN, while framework integrations remain optional
// peer dependencies so consumers do not receive an implicit install payload.
assert.equal(Object.keys(packageJson.dependencies || {}).length, 0, 'package.json must not add runtime dependencies');
assert.equal(Object.keys(packageJson.optionalDependencies || {}).length, 0, 'package.json must not add optional runtime dependencies');
for (const dependency of Object.keys(packageJson.peerDependencies || {})) {
  assert.equal(packageJson.peerDependenciesMeta?.[dependency]?.optional, true, `${dependency} peer dependency must remain optional`);
}

// 1. No source file may import the gsap or lenis packages (static or dynamic).
const IMPORT_GSAP = /(?:import\s+[^;]*from\s*['"]gsap(?:\/[^'"]*)?['"]|import\(\s*['"]gsap(?:\/[^'"]*)?['"]\s*\))/;
const IMPORT_LENIS = /(?:import\s+[^;]*from\s*['"]lenis['"]|import\(\s*['"]lenis['"]\s*\))/;
const srcFiles = [];
const walk = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, e.name); if (e.name.startsWith('.fuse_hidden')) continue; if (e.isDirectory()) walk(full); else if (e.name.endsWith('.js')) srcFiles.push(full); } };
walk(path.join(root, 'src'));
for (const file of srcFiles) {
  const code = fs.readFileSync(file, 'utf8');
  assert.doesNotMatch(code, IMPORT_GSAP, `${path.relative(root, file)} imports the gsap package — engines must load at runtime, not be bundled`);
  assert.doesNotMatch(code, IMPORT_LENIS, `${path.relative(root, file)} imports the lenis package — engines must load at runtime, not be bundled`);
}

// Browser network capabilities are intentional public surfaces, but their
// source-file boundary must not expand unnoticed. Media `src` assignments use
// consumer-provided assets; direct fetches and dynamic scripts are the smaller,
// higher-risk subset reviewed in docs/supply-chain.md.
const relativeSourceFiles = (pattern) => srcFiles
  .filter((file) => pattern.test(fs.readFileSync(file, 'utf8')))
  .map((file) => path.relative(root, file).split(path.sep).join('/'))
  .sort();

assert.deepEqual(relativeSourceFiles(/\bfetch(?:er)?\s*\(/), [
  'src/modules/cursor/clickEffects.js',
  'src/modules/lightbox.js',
  'src/modules/loader.js',
  'src/modules/pageTransition.js'
], 'direct browser fetch access must stay inside the reviewed public features');
assert.deepEqual(relativeSourceFiles(/document\.createElement\(\s*['"]script['"]\s*\)/), [
  'src/modules/pageTransition.js',
  'src/runtime.js'
], 'dynamic script creation must stay inside the reviewed engine and page-transition paths');
assert.deepEqual(relativeSourceFiles(/\.src\s*=/), [
  'src/modules/ambientMedia.js',
  'src/modules/brushReveal.js',
  'src/modules/cursor.js',
  'src/modules/cursor/clickEffects.js',
  'src/modules/lazy.js',
  'src/modules/lightbox.js',
  'src/modules/scrollSequence.js',
  'src/runtime.js'
], 'browser resource URL assignment must stay inside the reviewed engine/media paths');

for (const [label, pattern] of [
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['EventSource', /\bEventSource\b/],
  ['sendBeacon', /\bsendBeacon\s*\(/]
]) {
  assert.deepEqual(relativeSourceFiles(pattern), [], `${label} access is not an approved Kineto network capability`);
}

const runtimeSource = read('src/runtime.js');
assert.match(runtimeSource, /https:\/\/cdn\.jsdelivr\.net\/npm\/lenis@1\.3\.26\/dist\/lenis\.min\.js/, 'source must use the audited immutable Lenis 1.3.26 CDN asset');
assert.match(runtimeSource, /sha384-jqpi9VmOdhyLoLURgjCn7EpnG9BbnHW57ibIZoeaIU\+erWDH3k8fQQg0xH2ySjnw/, 'source must carry the audited Lenis 1.3.26 SHA-384 integrity');

// 2. Built bundles must carry the on-demand CDN loader (proof they fetch, not
//    bundle) and must NOT balloon to the size that bundling GSAP+Lenis caused
//    (~400 KB). A regression that re-bundles an engine trips this ceiling.
for (const build of ['dist/kineto.js', 'dist/kineto.umd.js']) {
  const code = read(build);
  assert.match(code, /cdn\.jsdelivr\.net\/npm\/gsap/, `${build} is missing the GSAP CDN loader — engines must be fetched on demand`);
  assert.match(code, /cdn\.jsdelivr\.net\/npm\/lenis/, `${build} is missing the Lenis CDN loader`);
}
// The reviewed one-shot click media and text/lifecycle fixes bring UMD to about
// 409 KB. Retain a narrow byte guard alongside the source-import prohibition;
// the current distributable ceiling is shared with scripts/bundle-size.mjs.
const umdBytes = fs.statSync(path.join(root, 'dist/kineto.umd.js')).size;
assert.ok(umdBytes < 410 * 1024, `dist/kineto.umd.js is ${(umdBytes / 1024).toFixed(0)}KB — exceeds the reviewed dependency-free runtime budget of 410KB`);

console.log(`deps-boundary OK — zero runtime dependencies, ${Object.keys(packageJson.peerDependencies || {}).length} optional peers, reviewed browser network capability boundary, no gsap/lenis imports in ${srcFiles.length} source files; both builds use the on-demand CDN loader; UMD is ${(umdBytes / 1024).toFixed(0)}KB (engines not bundled).`);
