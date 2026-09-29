// Gate: every CI job builds dist/ before it reads it.
//
// dist/ stopped being tracked in v0.13.0. Three jobs kept reading it without a
// build — the weekly supply-chain audit and live-site parity check, and the
// tag-only MCP release — and only the weekly runs showed it, days later. This
// test reads every workflow on every pull request instead. The analysis lives
// in ./workflow-commands.mjs; the fixtures below pin what it must catch.
// @lane-affected-by .github/workflows/   (run-lane --changed: any workflow edit)
// @lane-affected-by scripts/   (a script can start or stop reading dist/)
// @lane-affected-by tests/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { commandEvents, createBuildOrderChecker, workflowJobs } from './workflow-commands.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const workflowDir = path.join(root, '.github/workflows');

// ── Fixtures: a throwaway repository with known readers and non-readers ──
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'kineto-build-order-'));
const writeFixture = (relative, source) => {
  fs.mkdirSync(path.dirname(path.join(fixtureRoot, relative)), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, relative), source);
};
writeFixture('scripts/reads.mjs', "fs.readFileSync(path.join(root, 'dist', 'kineto.js'));\n");
writeFixture('scripts/plain.mjs', "console.log('no build needed');\n");
writeFixture('scripts/uses-helper.mjs', "import { load } from '../tests/helper.mjs';\nload();\n");
writeFixture('tests/helper.mjs', "export const load = () => import('../dist/kineto.js');\n");
const fixtureScripts = {
  build: 'node scripts/reads.mjs',
  check: 'node scripts/reads.mjs',
  'lane:check': 'node scripts/reads.mjs',
  'self:check': 'npm run build && node scripts/reads.mjs',
  plain: 'node scripts/plain.mjs',
  helper: 'node scripts/uses-helper.mjs'
};
const fixture = createBuildOrderChecker(fixtureRoot, fixtureScripts);
const job = (...steps) => `jobs:\n  work:\n    steps:\n${steps.map((step) => `      - name: step\n        run: |\n${step.split('\n').map((line) => `          ${line}`).join('\n')}\n`).join('')}`;
const violations = (source) => fixture.workflowViolations(source);

try {
  assert.deepEqual(violations(job('npm ci', 'npm run check')),
    [{ job: 'work', file: 'scripts/reads.mjs', trail: ['check'] }],
    'a reader before any build is reported with the script chain');
  assert.deepEqual(violations(job('npm ci', 'npm run build', 'npm run check')), [],
    'a reader after the build step passes');
  assert.deepEqual(violations(job('npm ci\nnpm run build\nnpm run check')), [],
    'order inside one run block counts too');
  assert.equal(violations(job('npm run check\nnpm run build')).length, 1,
    'a build after the reader does not help');
  assert.equal(violations(job('node scripts/plain.mjs npm run check')).length, 1,
    'a wrapper script does not hide the npm script it runs');
  assert.equal(violations(job('node scripts/plain.mjs lane:check --shard 1/2')).length, 1,
    'a wrapper argument that names a script runs that script');
  assert.equal(violations(job('for command in lane:check plain; do\n  npm run "$command"\ndone')).length, 1,
    'a loop over script names runs those scripts');
  assert.deepEqual(violations(job('npm run self:check')), [],
    'a script that builds before it reads is self-sufficient');
  assert.deepEqual(violations(job('npm run helper')),
    [{ job: 'work', file: 'scripts/uses-helper.mjs', trail: ['helper'] }],
    'a read through an imported local module counts');
  assert.deepEqual(violations(job('npm --prefix tests/other run check', 'npm run plain')), [],
    'another package\'s scripts are not this package\'s');
  assert.deepEqual(violations(job('# npm run check\necho done')), [],
    'commented commands do not run');
  assert.equal(violations('jobs:\n  work:\n    steps:\n      - run: npm run check\n').length, 1,
    'the inline `- run:` step form is read');
  assert.equal(violations('jobs:\n  work:\n    steps:\n      - run: npm run build\n  next:\n    steps:\n      - run: npm run check\n').length, 1,
    'a build in one job does not carry into another job');
  assert.throws(() => violations(job('node scripts/missing.mjs')), /missing file: scripts\/missing\.mjs/,
    'a workflow that runs a missing file fails loudly');
  assert.deepEqual(commandEvents('npm run -s check -- --flag && npm test', new Set(Object.keys(fixtureScripts))),
    [{ kind: 'script', name: 'check' }, { kind: 'script', name: 'test' }],
    'npm flags before and after the script name are skipped');
  assert.deepEqual(workflowJobs('name: x\njobs:\n  a:\n    steps:\n      - run: >-\n          one\n          two\n      - run: three\n').map((entry) => entry.commands),
    [['one\ntwo', 'three']], 'folded and plain run values are both kept in order');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}

// ── The repository itself ──
const checker = createBuildOrderChecker(root, pkg.scripts);
// Known readers and non-readers keep the detection honest: if these flip, the
// gate below would pass for the wrong reason.
for (const reader of ['scripts/package-size.mjs', 'scripts/verify-live-site.mjs', 'tests/feature-contract.mjs', 'tests/package-tarball.mjs']) {
  assert.ok(checker.readsBuild(reader), `${reader} reads dist/ and must be recognised as a build reader`);
}
for (const wrapper of ['scripts/run-lane.mjs', 'scripts/retry-command.mjs']) {
  assert.equal(checker.readsBuild(wrapper), false, `${wrapper} only runs other commands and must not count as a reader`);
}

const problems = [];
for (const file of fs.readdirSync(workflowDir).filter((name) => /\.ya?ml$/.test(name)).sort()) {
  const source = fs.readFileSync(path.join(workflowDir, file), 'utf8');
  for (const { job: jobId, file: reader, trail } of checker.workflowViolations(source)) {
    const via = trail.length ? `npm run ${trail.join(' → ')} → ` : '';
    problems.push(`${file} › ${jobId}: ${via}${reader} reads dist/ before the job runs \`npm run build\``);
  }
}
assert.deepEqual(problems, [], `every job that reads dist/ must build it first:\n${problems.join('\n')}`);

console.log('workflow build order OK — every job builds dist/ before reading it');
