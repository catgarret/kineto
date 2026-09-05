import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditLockfiles, auditTargets } from '../scripts/audit-lockfiles.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const workflow = read('.github/workflows/supply-chain.yml');
const dependabot = read('.github/dependabot.yml');
const gitignore = read('.gitignore');
const packageJson = JSON.parse(read('package.json'));
const consumerPackage = JSON.parse(read('tests/consumer-bundles/package.json'));
const frameworkPackage = JSON.parse(read('tests/framework-qa/package.json'));
const auditedLockfiles = ['package-lock.json', 'tests/consumer-bundles/package-lock.json', 'tests/framework-qa/package-lock.json'];

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /cron:\s*"41 3 \* \* 1"/);
assert.match(workflow, /permissions:[\s\S]*contents:\s*read/);
assert.match(workflow, /timeout-minutes:\s*10/);
assert.match(workflow, /uses:\s*actions\/checkout@[0-9a-f]{40}\s+# v6/);
assert.match(workflow, /uses:\s*actions\/setup-node@[0-9a-f]{40}\s+# v6/);
assert.match(workflow, /node-version:\s*22/);
assert.match(workflow, /npm ci --ignore-scripts/);
assert.match(workflow, /npm run test:lockfile-boundary/);
assert.match(workflow, /id:\s*lockfile_audit/);
assert.match(workflow, /continue-on-error:\s*true/);
assert.match(workflow, /npm run audit:lockfiles -- --output-dir artifacts/);
assert.match(workflow, /npm sbom --sbom-format=spdx/);
assert.match(workflow, /npm run test:package-size/);
assert.match(workflow, /npm run test:package-tarball/);
assert.match(workflow, /uses:\s*actions\/upload-artifact@[0-9a-f]{40}\s+# v4/);
assert.match(workflow, /name:\s*supply-chain-reports/);
assert.match(workflow, /path:\s*artifacts\//);
assert.match(workflow, /retention-days:\s*14/);
assert.ok((workflow.match(/if:\s*always\(\)/g) || []).length >= 3,
  'audit failure must not skip SBOM, package checks, or report upload');
assert.match(workflow, /steps\.lockfile_audit\.outcome == 'failure'/);
assert.match(gitignore, /^\/artifacts\/$/m,
  'local audit reports must not dirty the release-preparation worktree');

for (const directory of ['/', '/tests/consumer-bundles', '/tests/framework-qa']) {
  assert.match(
    dependabot,
    new RegExp(`package-ecosystem: npm\\s+directory: ${directory.replaceAll('/', '\\/')}`),
    `Dependabot must cover ${directory}`
  );
}
assert.equal((dependabot.match(/package-ecosystem:\s*npm/g) || []).length, 3);
assert.match(dependabot, /package-ecosystem:\s*github-actions/);
assert.match(dependabot, /interval:\s*weekly/);
assert.match(dependabot, /timezone:\s*Asia\/Seoul/);

assert.equal(packageJson.devDependencies.eslint, '^10.10.0');
assert.equal(packageJson.devDependencies.lenis, '^1.3.26');
assert.equal(packageJson.devDependencies.playwright, '^1.62.1');
assert.equal(packageJson.devDependencies['playwright-core'], '^1.62.1');
assert.equal(packageJson.devDependencies.vite, '^8.2.2');
assert.equal(packageJson.devDependencies.typescript, '^6.0.3', 'TypeScript 7 requires a separate compatibility change');
assert.equal(consumerPackage.dependencies.react, '^19.2.8');
assert.equal(consumerPackage.dependencies.vue, '^3.5.42');
assert.equal(consumerPackage.devDependencies.rolldown, '1.2.7');
assert.equal(consumerPackage.devDependencies.vite, '^8.2.2');
assert.equal(frameworkPackage.dependencies.jquery, '^3.7.1', 'jQuery 4 requires a separate adapter compatibility change');
assert.equal(frameworkPackage.dependencies.picomatch, '4.0.7');
assert.equal(frameworkPackage.dependencies.react, '^19.2.8');
assert.equal(frameworkPackage.dependencies['react-dom'], '^19.2.8');
assert.equal(frameworkPackage.dependencies.vue, '^3.5.42');
assert.equal(frameworkPackage.devDependencies['playwright-core'], '^1.62.1');
assert.equal(frameworkPackage.devDependencies.vite, '^8.2.2');

for (const lockfile of auditedLockfiles) {
  const lock = JSON.parse(read(lockfile));
  const picomatchVersions = Object.entries(lock.packages)
    .filter(([packagePath]) => packagePath.endsWith('node_modules/picomatch'))
    .map(([, metadata]) => metadata.version);
  assert.ok(picomatchVersions.length > 0, `${lockfile} must resolve picomatch`);
  for (const version of picomatchVersions) {
    const [major, minor, patch] = version.split('.').map(Number);
    assert.ok(major > 4 || (major === 4 && (minor > 0 || patch >= 7)),
      `${lockfile} must resolve picomatch >=4.0.7, received ${version}`);
  }
}

assert.deepEqual(
  auditTargets.map(({ name, directory, report }) => ({ name, directory, report })),
  [
    { name: 'root', directory: '.', report: 'npm-audit-root.json' },
    { name: 'consumer-bundles', directory: 'tests/consumer-bundles', report: 'npm-audit-consumer-bundles.json' },
    { name: 'framework-qa', directory: 'tests/framework-qa', report: 'npm-audit-framework-qa.json' }
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

  assert.deepEqual(visited, ['root', 'consumer-bundles', 'framework-qa']);
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
