import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const required = [
  'dist/kineto.js',
  'dist/kineto.umd.js',
  'dist/kineto.umd.cjs',
  'dist/kineto.css',
  'FEATURE_CONTRACT.md',
  'kineto.features.json',
  'demo/index.html',
  'demo/playground.js',
  'demo/playground.css'
];
for (const path of required) await access(new URL(`../${path}`, import.meta.url));

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
assert.equal(packageJson.module, './dist/kineto.min.js');
assert.equal(packageJson.browser, './dist/kineto.umd.cjs');
assert.equal(packageJson.exports['.'].import, './dist/kineto.min.js');
assert.equal(packageJson.exports['.'].require, './dist/kineto.umd.cjs');
assert.equal(packageJson.exports['./style.css'], './dist/kineto.min.css');
assert.equal(packageJson.exports['./core'], './dist/modular/core.js');
assert.equal(packageJson.exports['./modules/*'], './dist/modular/modules/*.js');
assert.equal(packageJson.exports['./package.json'], './package.json');

const esm = await import('@dong-gri/kineto');
assert.equal(esm.default.version, packageJson.version);
assert.equal(Object.keys(esm.default.registry).length, 51);
assert.equal(typeof esm.lazy, 'function');
assert.equal(typeof esm.scrollSequence, 'function');

const modularCore = (await import('@dong-gri/kineto/core')).default;
const sliderModule = (await import('@dong-gri/kineto/modules/slider')).default;
assert.equal(Object.keys(modularCore.registry).length, 0, 'modular core must not register the full module set');
modularCore.register('slider', sliderModule);
assert.deepEqual(Object.keys(modularCore.registry), ['slider']);
assert.equal(typeof modularCore.slider, 'function');
modularCore.unregister('slider');

const require = createRequire(import.meta.url);
const commonJs = require('@dong-gri/kineto');
assert.equal(commonJs.version, packageJson.version);
assert.equal(Object.keys(commonJs.registry).length, 51);
assert.equal(typeof commonJs.autoInit, 'function');

for (const adapter of ['react', 'vue', 'jquery']) {
  const source = await readFile(new URL(`../src/adapters/${adapter}.js`, import.meta.url), 'utf8');
  assert.match(source, /from ['"]@dong-gri\/kineto['"]/, `${adapter} adapter must resolve the packaged core`);
}

console.log('Package surface OK: full, modular, CommonJS, CSS and adapter entry points verified.');
