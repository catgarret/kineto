import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditLockfiles, auditTargets } from '../scripts/audit-lockfiles.mjs';
import { assertPinnedAction } from './workflow-action-pins.mjs';
import { assertDependencyFloor } from './dependency-floors.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const workflow = read('.github/workflows/supply-chain.yml');
const dependabot = read('.github/dependabot.yml');
const gitignore = read('.gitignore');
const packageJson = JSON.parse(read('package.json'));
const consumerPackage = JSON.parse(read('tests/consumer-bundles/package.json'));
const frameworkPackage = JSON.parse(read('tests/framework-qa/package.json'));
const auditedLockfiles = ['package-lock.json', 'tests/consumer-bundles/package-lock.json', 'tests/framework-qa/package-lock.json', 'tests/integrations/package-lock.json', 'packages/kineto-mcp/package-lock.json'];

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /cron:\s*"41 3 \* \* 1"/);
assert.match(workflow, /permissions:[\s\S]*contents:\s*read/);
assert.match(workflow, /timeout-minutes:\s*10/);
assertPinnedAction(workflow, 'actions/checkout');
assertPinnedAction(workflow, 'actions/setup-node');
assert.match(workflow, /node-version:\s*22/);
assert.match(workflow, /npm ci --ignore-scripts/);
assert.match(workflow, /npm run test:lockfile-boundary/);
assert.match(workflow, /id:\s*lockfile_audit/);
assert.match(workflow, /continue-on-error:\s*true/);
assert.match(workflow, /npm run audit:lockfiles -- --output-dir artifacts/);
assert.match(workflow, /npm sbom --sbom-format=spdx/);
assert.match(workflow, /npm run test:package-size/);
assert.match(workflow, /npm run test:package-tarball/);
assertPinnedAction(workflow, 'actions/upload-artifact');
assert.match(workflow, /name:\s*supply-chain-reports/);
assert.match(workflow, /path:\s*artifacts\//);
assert.match(workflow, /retention-days:\s*14/);
assert.ok((workflow.match(/if:\s*always\(\)/g) || []).length >= 3,
  'audit failure must not skip SBOM, package checks, or report upload');
assert.match(workflow, /steps\.lockfile_audit\.outcome == 'failure'/);
assert.match(gitignore, /^\/artifacts\/$/m,
  'local audit reports must not dirty the release-preparation worktree');

for (const directory of ['/', '/tests/consumer-bundles', '/tests/framework-qa', '/tests/integrations', '/packages/kineto-mcp']) {
  assert.match(
    dependabot,
    new RegExp(`package-ecosystem: npm\\s+directory: ${directory.replaceAll('/', '\\/')}`),
    `Dependabot must cover ${directory}`
  );
}
assert.equal((dependabot.match(/package-ecosystem:\s*npm/g) || []).length, 5);
// UI-library majors in the integration fixture are reviewed with the map,
// not bumped automatically into a failing CI run.
assert.match(dependabot, /directory: \/tests\/integrations[\s\S]*?ignore:\s*\n\s*- dependency-name: "\*"\s*\n\s*update-types: \["version-update:semver-major"\]/,
  'the integrations fixture must ignore automatic major bumps');
assert.match(dependabot, /package-ecosystem:\s*github-actions/);
assert.match(dependabot, /interval:\s*weekly/);
assert.match(dependabot, /timezone:\s*Asia\/Seoul/);

for (const [actual, minimum] of [
  ['^6.0.3', '^6.0.3'], ['^6.0.4', '^6.0.3'], ['^6.1.0', '^6.0.3'],
  ['^3.7.2', '^3.7.1'], ['^3.10.0', '^3.7.1'],
  ['1.2.7', '1.2.7'], ['1.2.8', '1.2.7'], ['1.3.0', '1.2.7']
]) {
  assert.doesNotThrow(() => assertDependencyFloor(actual, minimum),
    `${actual} must satisfy the existing ${minimum} floor`);
}
for (const [actual, minimum] of [
  ['^6.0.2', '^6.0.3'], ['^5.99.99', '^6.0.3'], ['^7.0.2', '^6.0.3'],
  ['^3.6.99', '^3.7.1'], ['^4.0.0', '^3.7.1'], ['3.7.1', '^3.7.1'],
  ['1.2.6', '1.2.7'], ['2.0.0', '1.2.7'], ['^1.2.8', '1.2.7'],
  ['*', '^3.7.1'], ['^3.7.1 || ^4.0.0', '^3.7.1'], ['>=3.7.1', '^3.7.1'],
  ['~3.7.1', '^3.7.1'], ['^3.7', '^3.7.1'], ['^3.7.x', '^3.7.1'],
  ['latest', '^3.7.1'], ['^3.7.2-beta.1', '^3.7.1'], ['^3.7.1+build', '^3.7.1'],
  ['^03.7.1', '^3.7.1'], [' ^3.7.1', '^3.7.1'], [undefined, '^3.7.1'],
  ['^3.9007199254740992.1', '^3.7.1']
]) {
  assert.throws(() => assertDependencyFloor(actual, minimum), /supported major/,
    `${String(actual)} must not bypass the existing ${minimum} policy`);
}

assertDependencyFloor(packageJson.devDependencies.eslint, '^10.10.0', 'root eslint');
assertDependencyFloor(packageJson.devDependencies.lenis, '^1.3.26', 'root lenis');
assertDependencyFloor(packageJson.devDependencies.playwright, '^1.62.1', 'root playwright');
assertDependencyFloor(packageJson.devDependencies['playwright-core'], '^1.62.1', 'root playwright-core');
assertDependencyFloor(packageJson.devDependencies.vite, '^8.2.2', 'root vite');
assertDependencyFloor(packageJson.devDependencies.typescript, '^6.0.3', 'root TypeScript');
assertDependencyFloor(consumerPackage.dependencies.react, '^19.2.8', 'consumer React');
assertDependencyFloor(consumerPackage.dependencies.vue, '^3.5.42', 'consumer Vue');
assertDependencyFloor(consumerPackage.devDependencies.rolldown, '1.2.7', 'consumer rolldown');
assertDependencyFloor(consumerPackage.devDependencies.vite, '^8.2.2', 'consumer vite');
assertDependencyFloor(frameworkPackage.dependencies.jquery, '^3.7.1', 'framework jQuery');
assertDependencyFloor(frameworkPackage.dependencies.picomatch, '4.0.7', 'framework picomatch');
assertDependencyFloor(frameworkPackage.dependencies.react, '^19.2.8', 'framework React');
assertDependencyFloor(frameworkPackage.dependencies['react-dom'], '^19.2.8', 'framework React DOM');
assertDependencyFloor(frameworkPackage.dependencies.vue, '^3.5.42', 'framework Vue');
assertDependencyFloor(frameworkPackage.devDependencies['playwright-core'], '^1.62.1', 'framework playwright-core');
assertDependencyFloor(frameworkPackage.devDependencies.vite, '^8.2.2', 'framework vite');

// Every picomatch copy in an audited lockfile must sit on a patched line.
// The 4.x line (Vite, fdir, tinyglobby) is held at >= 4.0.7. The 2.x line is
// still required by micromatch 4 → fast-glob 3, which the shadcn CLI in
// tests/integrations uses, and was patched in 2.3.2 for GHSA-3v7f-55p6-f55p
// (POSIX class method injection) and GHSA-c2c7-rcm5-vvqj (extglob ReDoS).
// A major outside this table is a new line that needs its own review.
const PICOMATCH_FLOORS = { 2: [2, 3, 2], 4: [4, 0, 7] };
const atLeast = ([major, minor, patch], [floorMajor, floorMinor, floorPatch]) =>
  major === floorMajor && (minor > floorMinor || (minor === floorMinor && patch >= floorPatch));
// The MCP server has no glob tooling at all; every other lockfile pulls
// picomatch through Vite/rolldown, so its absence there would mean the check
// silently stopped covering anything.
const PICOMATCH_FREE_LOCKFILES = new Set(['packages/kineto-mcp/package-lock.json']);

for (const lockfile of auditedLockfiles) {
  const lock = JSON.parse(read(lockfile));
  const picomatchVersions = Object.entries(lock.packages)
    .filter(([packagePath]) => packagePath.endsWith('node_modules/picomatch'))
    .map(([, metadata]) => metadata.version);
  if (!PICOMATCH_FREE_LOCKFILES.has(lockfile)) assert.ok(picomatchVersions.length > 0, `${lockfile} must resolve picomatch`);
  for (const version of picomatchVersions) {
    const parsed = version.split('.').map(Number);
    const floor = PICOMATCH_FLOORS[parsed[0]];
    assert.ok(floor, `${lockfile} resolves picomatch ${version} from an unreviewed major line (known lines: ${Object.keys(PICOMATCH_FLOORS).join(', ')})`);
    assert.ok(atLeast(parsed, floor), `${lockfile} must resolve picomatch >=${floor.join('.')} on the ${parsed[0]}.x line, received ${version}`);
  }
}

assert.deepEqual(
  auditTargets.map(({ name, directory, report }) => ({ name, directory, report })),
  [
    { name: 'root', directory: '.', report: 'npm-audit-root.json' },
    { name: 'consumer-bundles', directory: 'tests/consumer-bundles', report: 'npm-audit-consumer-bundles.json' },
    { name: 'framework-qa', directory: 'tests/framework-qa', report: 'npm-audit-framework-qa.json' },
    { name: 'integrations', directory: 'tests/integrations', report: 'npm-audit-integrations.json' },
    { name: 'kineto-mcp', directory: 'packages/kineto-mcp', report: 'npm-audit-kineto-mcp.json' }
  ]
);

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kineto-audit-fixture-'));
try {
  const visited = [];
  const results = auditLockfiles({
    root,
    outputDir: temp,
    logger: { log() {} },
    runner(target) {
      visited.push(target.name);
      const failed = target.name === 'framework-qa';
      return {
        status: failed ? 1 : 0,
        stdout: JSON.stringify({
          auditReportVersion: 2,
          vulnerabilities: failed ? { picomatch: { severity: 'high' } } : {},
          metadata: {
            vulnerabilities: {
              info: 0,
              low: 0,
              moderate: 0,
              high: failed ? 1 : 0,
              critical: 0,
              total: failed ? 1 : 0
            }
          }
        }),
        stderr: ''
      };
    }
  });

  assert.deepEqual(visited, ['root', 'consumer-bundles', 'framework-qa', 'integrations', 'kineto-mcp']);
  assert.deepEqual(results.filter(({ status }) => status !== 0).map(({ name }) => name), ['framework-qa']);
  for (const target of auditTargets) {
    const report = JSON.parse(fs.readFileSync(path.join(temp, target.report), 'utf8'));
    assert.equal(report.auditReportVersion, 2);
  }
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(temp, 'npm-audit-framework-qa.json'), 'utf8')).metadata.vulnerabilities.high,
    1,
    'a failing fixture audit must still leave a machine-readable report'
  );
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

const lifecycleScripts = Object.keys(packageJson.scripts).filter((name) => /^(pre|post)?install$/.test(name));
assert.deepEqual(lifecycleScripts, [], 'package must not run install lifecycle scripts');
assert.equal(packageJson.scripts['audit:lockfiles'], 'node scripts/audit-lockfiles.mjs');
assert.match(packageJson.scripts.verify, /npm run audit:lockfiles/);
assert.match(packageJson.scripts['test:node'], /test:supply-chain-automation/);

console.log('supply-chain-automation OK — root and fixture audits, durable reports, SBOM upload, Dependabot coverage, and dependency floors are enforced.');
