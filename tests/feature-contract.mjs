import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const contract = JSON.parse(await readFile(new URL('../kineto.features.json', import.meta.url), 'utf8'));
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const expectedContractKeys = ['$schema', 'additionalNamedExports', 'behaviorContractVersion', 'compatibilityApi', 'contractVersion', 'coreApi', 'coreProperties', 'criticalBehaviors', 'libraryVersion', 'moduleCount', 'modules'].sort();
assert.deepEqual(Object.keys(contract).sort(), expectedContractKeys, 'feature contract top-level shape drifted');
const expectedModuleKeys = ['attribute', 'defaultVariant', 'name', 'publicOptions', 'variants'].sort();
const dash = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
assert.equal(contract.modules.length, contract.moduleCount, 'moduleCount must equal modules.length');
assert.equal(new Set(contract.modules.map(({ name }) => name)).size, contract.moduleCount, 'module names must be unique');
assert.equal(new Set(contract.modules.map(({ attribute }) => attribute)).size, contract.moduleCount, 'activation attributes must be unique');
assert.equal(contract.behaviorContractVersion, '1.2.0', 'behavior contract version is missing');
assert.equal(contract.libraryVersion, packageJson.version, 'contract libraryVersion must match package.json');
assert.equal(new Set(contract.coreProperties).size, contract.coreProperties.length, 'coreProperties must be unique');
assert.equal(new Set(contract.coreApi).size, contract.coreApi.length, 'coreApi methods must be unique');
assert.equal(new Set(contract.additionalNamedExports).size, contract.additionalNamedExports.length, 'additionalNamedExports must be unique');

const moduleFiles = (await readdir(new URL('../src/modules/', import.meta.url)))
  .filter((name) => name.endsWith('.js'))
  .map((name) => name.slice(0, -3))
  .sort();
assert.deepEqual(moduleFiles, contract.modules.map(({ name }) => name).sort(), 'src/modules contains an uncontracted file or is missing a contracted module');

for (const moduleContract of contract.modules) {
  assert.deepEqual(Object.keys(moduleContract).sort(), expectedModuleKeys, `${moduleContract.name} contract shape drifted`);
  assert.equal(moduleContract.attribute, `data-kt-${dash(moduleContract.name)}`, `${moduleContract.name} activation attribute does not match its public name`);
  assert.ok(moduleContract.variants.includes(moduleContract.defaultVariant), `${moduleContract.name} defaultVariant must be listed in variants`);
  assert.equal(new Set(moduleContract.publicOptions).size, moduleContract.publicOptions.length, `${moduleContract.name} publicOptions must be unique`);
  const sourcePath = resolve(import.meta.dirname, `../src/modules/${moduleContract.name}.js`);
  const source = await readFile(sourcePath, 'utf8');
  assert.doesNotMatch(source, /opts\s*\[/, `${moduleContract.name} must use dot notation for contracted options`);
  assert.doesNotMatch(source, /(?:const|let|var)\s*\{[^}]+\}\s*=\s*opts\b/s, `${moduleContract.name} must not destructure options outside the contract scanner`);
  const sourceOptions = [...source.matchAll(/opts\.([A-Za-z_$][\w$]*)/g)].map((match) => match[1]);
  assert.deepEqual([...new Set(sourceOptions)].sort(), [...moduleContract.publicOptions].sort(), `${moduleContract.name} source options drifted from the behavior contract`);
}

const built = await import(`${pathToFileURL(new URL('../dist/kineto.js', import.meta.url).pathname).href}?t=${Date.now()}`);
const Kineto = built.default;
assert.equal(Kineto.version, contract.libraryVersion, 'runtime version must match the contract');
assert.deepEqual(Object.keys(built).sort(), ['default', ...contract.modules.map(({ name }) => name), ...contract.additionalNamedExports].sort(), 'named ESM export surface drifted');
const expected = contract.modules.map(({ name }) => name).sort();
const actual = Object.keys(Kineto.registry).sort();
assert.deepEqual(actual, expected, 'built registry differs from frozen feature contract');

for (const { name } of contract.modules) {
  assert.equal(typeof Kineto[name], 'function', `Kineto.${name} is missing`);
  assert.equal(typeof built[name], 'function', `named ESM export ${name} is missing`);
}
for (const property of contract.coreProperties) assert.ok(property in Kineto, `core property ${property} is missing`);
for (const method of contract.coreApi) assert.equal(typeof Kineto[method], 'function', `core API ${method} is missing`);
const expectedRootKeys = [...contract.modules.map(({ name }) => name), ...contract.coreProperties, ...contract.coreApi].sort();
assert.deepEqual(Object.keys(Kineto).sort(), expectedRootKeys, 'uncontracted root API was added or a contracted API was removed');

for (const path of contract.compatibilityApi) {
  const [group, method] = path.split('.');
  assert.equal(typeof Kineto[group]?.[method], 'function', `compatibility API ${path} is missing`);
}
const expectedCompatibilityKeys = contract.compatibilityApi.map((path) => path.split('.')[1]).sort();
assert.deepEqual(Object.keys(Kineto.core).sort(), expectedCompatibilityKeys, 'compatibility API surface drifted');

console.log(`Feature contract OK: ${contract.moduleCount} modules and ${contract.coreApi.length} core APIs.`);
