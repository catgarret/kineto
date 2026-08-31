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

// 2. Built bundles must carry the on-demand CDN loader (proof they fetch, not
//    bundle) and must NOT balloon to the size that bundling GSAP+Lenis caused
//    (~400 KB). A regression that re-bundles an engine trips this ceiling.
for (const build of ['dist/kineto.js', 'dist/kineto.umd.js']) {
  const code = read(build);
  assert.match(code, /cdn\.jsdelivr\.net\/npm\/gsap/, `${build} is missing the GSAP CDN loader — engines must be fetched on demand`);
  assert.match(code, /cdn\.jsdelivr\.net\/npm\/lenis/, `${build} is missing the Lenis CDN loader`);
}
// The readable UMD build is currently just over 401 KB after the native Slider
// Scroll Snap path was added. Bundling GSAP+Lenis measured about 407 KB before
// this work, so a 403 KB ceiling still catches that class of regression while
// allowing the measured runtime path to evolve. Exact distributable budgets
// live in scripts/bundle-size.mjs.
const umdBytes = fs.statSync(path.join(root, 'dist/kineto.umd.js')).size;
assert.ok(umdBytes < 403 * 1024, `dist/kineto.umd.js is ${(umdBytes / 1024).toFixed(0)}KB — too large; an engine looks bundled again (expected < 403KB without GSAP/Lenis)`);

console.log(`deps-boundary OK — zero runtime dependencies, ${Object.keys(packageJson.peerDependencies || {}).length} optional peers, no gsap/lenis imports in ${srcFiles.length} source files; both builds use the on-demand CDN loader; UMD is ${(umdBytes / 1024).toFixed(0)}KB (engines not bundled).`);
