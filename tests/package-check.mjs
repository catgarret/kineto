import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
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
// The module count comes from the feature contract, never a literal here.
const { moduleCount } = JSON.parse(await readFile(new URL('../kineto.features.json', import.meta.url), 'utf8'));
// The default entry is dist/kineto.default.js over the full runtime; `/all` is
// the full runtime itself, built on the modular core it shares with /core,
// /auto and the React/Vue adapters; `require` of either gets the UMD build with .d.cts
// declarations. The whole map is also checked against the contract by
// tests/entry-points.mjs.
assert.equal(packageJson.module, './dist/kineto.default.js');
assert.equal(packageJson.browser, './dist/kineto.umd.cjs');
assert.deepEqual(packageJson.exports['.'].import, { types: './types/default.d.ts', default: './dist/kineto.default.js' });
assert.deepEqual(packageJson.exports['.'].require, { types: './types/index.d.cts', default: './dist/kineto.umd.cjs' });
assert.deepEqual(packageJson.exports['./all'].import, { types: './types/all.d.ts', default: './dist/modular/all.js' });
assert.deepEqual(packageJson.exports['./all'].require, { types: './types/index.d.cts', default: './dist/kineto.umd.cjs' });
assert.deepEqual(packageJson.exports['./auto'], { types: './types/auto.d.ts', default: './dist/modular/auto.js' });
assert.equal(packageJson.exports['./style.css'], './dist/kineto.min.css');
assert.equal(packageJson.types, './types/index.d.ts');
assert.equal(packageJson.exports['./core'].types, './types/core.d.ts');
assert.equal(packageJson.exports['./core'].default, './dist/modular/core.js');
assert.equal(packageJson.exports['./states'].types, './types/states.d.ts');
assert.equal(packageJson.exports['./states'].default, './dist/modular/states.js');
assert.equal(packageJson.exports['./presence'].types, './types/presence.d.ts');
assert.equal(packageJson.exports['./presence'].default, './dist/modular/presence.js');
assert.equal(packageJson.exports['./modules/*'].types, './types/module.d.ts');
assert.equal(packageJson.exports['./modules/*'].default, './dist/modular/modules/*.js');
assert.equal(packageJson.exports['./react'].types, './types/react.d.ts');
assert.equal(packageJson.exports['./vue'].types, './types/vue.d.ts');
assert.equal(packageJson.exports['./jquery'].types, './types/jquery.d.ts');
assert.equal(packageJson.exports['./package.json'], './package.json');
assert.ok(!packageJson.dependencies?.[packageJson.name], 'package must not depend on itself');

for (const declaration of ['index', 'default', 'all', 'auto', 'core', 'states', 'presence', 'module', 'react', 'vue', 'jquery']) {
  await access(new URL(`../types/${declaration}.d.ts`, import.meta.url));
}

const esm = await import('@dong-gri/kineto');
assert.equal(esm.default.version, packageJson.version);
assert.equal(Object.keys(esm.default.registry).length, moduleCount);
assert.equal(typeof esm.lazy, 'function');
assert.equal(typeof esm.scrollSequence, 'function');
const all = await import('@dong-gri/kineto/all');
assert.equal(all.default, esm.default, 'the default entry and /all are one Kineto instance');
assert.equal(typeof all.lazy, 'function', '/all keeps the named factories');

// Every ESM entry shares one core. On their own, /auto and /core register
// nothing up front — checked in a fresh process, because this one already
// imported the full runtime into the shared instance.
const alone = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '--eval',
  "import Auto from '@dong-gri/kineto/auto'; const before = Object.keys(Auto.registry).length; await Auto.loadModules('slider'); console.log(JSON.stringify({ before, after: Object.keys(Auto.registry) }))"
], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8' }));
assert.deepEqual(alone, { before: 0, after: ['slider'] }, 'the auto entry alone registers nothing up front; loadModules() imports exactly the module asked for');
const coreAlone = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '--eval',
  "import Kineto from '@dong-gri/kineto/core'; import slider from '@dong-gri/kineto/modules/slider'; const before = Object.keys(Kineto.registry).length; Kineto.register('slider', slider); console.log(JSON.stringify({ before, after: Object.keys(Kineto.registry), api: typeof Kineto.slider }))"
], { cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8' }));
assert.deepEqual(coreAlone, { before: 0, after: ['slider'], api: 'function' }, 'modular core alone must not register the full module set');
const auto = (await import('@dong-gri/kineto/auto')).default;
assert.equal(auto, esm.default, '/auto shares the one Kineto instance with the default entry and /all');
assert.equal(Object.keys(auto.registry).length, moduleCount, '/auto keeps the modules the full runtime registered');

const modularCore = (await import('@dong-gri/kineto/core')).default;
const modularStates = (await import('@dong-gri/kineto/states')).default;
assert.equal(typeof modularStates, 'function');
assert.deepEqual(modularStates({ hidden: { opacity: 0 }, visible: { opacity: 1 } }).stateNames, ['hidden', 'visible']);
const modularPresence = (await import('@dong-gri/kineto/presence')).default;
assert.equal(typeof modularPresence, 'function');
assert.equal(modularPresence(null).ssr, true);
assert.equal(modularCore, esm.default, '/core shares the one Kineto instance with the default entry and /all');

const require = createRequire(import.meta.url);
const commonJs = require('@dong-gri/kineto');
assert.equal(commonJs.version, packageJson.version);
assert.equal(Object.keys(commonJs.registry).length, moduleCount);
assert.equal(typeof commonJs.autoInit, 'function');

// React and Vue take the on-demand entry (a component imports its module the
// first time it is used; a page that also imports the full runtime shares the
// same instance, so nothing loads twice). jQuery keeps the full runtime.
for (const [adapter, entry] of [['react', 'auto'], ['vue', 'auto'], ['jquery', 'all']]) {
  const source = await readFile(new URL(`../src/adapters/${adapter}.js`, import.meta.url), 'utf8');
  assert.match(source, new RegExp(`from ['"]@dong-gri/kineto/${entry}['"]`), `${adapter} adapter must resolve @dong-gri/kineto/${entry}`);
}

// Entry points that do their work ON IMPORT must be declared side-effectful, or
// a bundler drops a bare `import '@dong-gri/kineto/jquery'` and the plugin is
// never installed: the jQuery adapter installs itself on window.jQuery, and
// the UMD builds assign window.Kineto.
for (const file of ['./src/adapters/jquery.js', './dist/kineto.umd.js', './dist/kineto.umd.min.js', './dist/kineto.umd.cjs', './dist/kineto.default.js', './dist/kineto.min.js', './dist/modular/all.js', './dist/modular/auto.js']) {
  assert.ok(packageJson.sideEffects.includes(file), `package.json sideEffects must list ${file}`);
}
assert.ok(packageJson.sideEffects.includes('**/*.css'), 'stylesheets stay side-effectful');

console.log('Package surface OK: full, modular, CommonJS, CSS and adapter entry points verified.');
