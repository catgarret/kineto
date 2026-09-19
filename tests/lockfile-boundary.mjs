import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const packageJson = readJson('package.json');

const lockfiles = [
  { file: 'package-lock.json', kind: 'root' },
  { file: 'tests/consumer-bundles/package-lock.json', kind: 'fixture' },
  { file: 'tests/framework-qa/package-lock.json', kind: 'fixture' },
  { file: 'tests/integrations/package-lock.json', kind: 'fixture' },
  // A publishable workspace package: pinned registry dependencies only, no
  // link back to the repository (it ships contract copies instead).
  { file: 'packages/kineto-mcp/package-lock.json', kind: 'package', name: '@dong-gri/kineto-mcp' }
];

let registryPackages = 0;
let localLinks = 0;

for (const { file, kind, name } of lockfiles) {
  const lockfile = readJson(file);
  assert.equal(lockfile.lockfileVersion, 3, `${file} must use npm lockfileVersion 3`);
  assert.ok(lockfile.packages && typeof lockfile.packages === 'object', `${file} must contain package entries`);

  const rootPackage = lockfile.packages[''];
  assert.ok(rootPackage, `${file} must contain root package metadata`);
  if (kind === 'root') {
    assert.equal(rootPackage.name, packageJson.name, `${file} root name must match package.json`);
    assert.equal(rootPackage.version, packageJson.version, `${file} root version must match package.json`);
  } else if (kind === 'package') {
    assert.equal(rootPackage.name, name, `${file} root name must match the package`);
    assert.equal(lockfile.packages['node_modules/@dong-gri/kineto'], undefined, `${file} must not link the repository — the package bundles contract copies`);
  } else {
    const linkedPackage = lockfile.packages['node_modules/@dong-gri/kineto'];
    assert.ok(linkedPackage, `${file} must link the local Kineto package`);
    assert.equal(linkedPackage.resolved, '../..', `${file} local Kineto link must stay workspace-relative`);
    assert.equal(linkedPackage.link, true, `${file} local Kineto package must remain an npm link`);
  }

  for (const [packagePath, metadata] of Object.entries(lockfile.packages)) {
    if (!metadata || typeof metadata !== 'object' || !metadata.resolved) continue;
    if (metadata.resolved === '../..' && metadata.link === true) {
      assert.equal(packagePath, 'node_modules/@dong-gri/kineto', `${file} has an unexpected local link`);
      localLinks += 1;
      continue;
    }

    assert.match(
      metadata.resolved,
      /^https:\/\/registry\.npmjs\.org\/[^\s]+\.tgz$/,
      `${file} must resolve packages from the public npm registry: ${metadata.resolved}`
    );
    assert.match(metadata.integrity ?? '', /^sha(?:1|256|384|512)-/, `${file} registry package is missing integrity: ${packagePath}`);
    assert.equal(metadata.link, undefined, `${file} registry packages must not be marked as links: ${packagePath}`);
    registryPackages += 1;
  }
}

const fixtureCount = lockfiles.filter(({ kind }) => kind === 'fixture').length;
assert.equal(localLinks, fixtureCount, `consumer fixtures must contain exactly one local Kineto link each (${fixtureCount} fixtures)`);
assert.ok(registryPackages > 0, 'lockfiles must contain registry package entries to audit');

console.log(`lockfile-boundary OK — ${lockfiles.length} lockfiles, ${registryPackages} registry packages, ${localLinks} fixture links.`);
