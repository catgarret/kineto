import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const required = [
  'dist/motionkit.js',
  'dist/motionkit.umd.js',
  'dist/motionkit.umd.cjs',
  'dist/motionkit.css',
  'FEATURE_CONTRACT.md',
  'motionkit.features.json',
  'demo/index.html',
  'demo/playground.js',
  'demo/playground.css'
];
for (const path of required) await access(new URL(`../${path}`, import.meta.url));

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(packageJson.exports['./style.css'], './dist/motionkit.css');
assert.equal(packageJson.exports['./package.json'], './package.json');

const esm = await import('@dong-gri/motionkit');
assert.equal(esm.default.version, '0.8.1');
assert.equal(Object.keys(esm.default.registry).length, 34);
assert.equal(typeof esm.lazy, 'function');
assert.equal(typeof esm.scrollSequence, 'function');

const require = createRequire(import.meta.url);
const commonJs = require('@dong-gri/motionkit');
assert.equal(commonJs.version, '0.8.1');
assert.equal(Object.keys(commonJs.registry).length, 34);
assert.equal(typeof commonJs.autoInit, 'function');

for (const adapter of ['react', 'vue', 'jquery']) {
  const source = await readFile(new URL(`../src/adapters/${adapter}.js`, import.meta.url), 'utf8');
  assert.match(source, /from ['"]@dong-gri\/motionkit['"]/, `${adapter} adapter must resolve the packaged core`);
}

console.log('Package surface OK: ESM, CommonJS, CSS and adapter entry points verified.');
