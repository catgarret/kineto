// Runs one test "lane" — an `a && b && c` chain in package.json — step by step.
//
//   node scripts/run-lane.mjs test:browser            # CI: one test at a time
//   node scripts/run-lane.mjs test:browser --jobs 2   # locally: two at a time
//
// Why not `npm run test:browser`: a chain stops at the first failure, and CI
// wrapped the WHOLE chain in a retry. One flaky browser test therefore re-ran
// all 41 tests (about 7 minutes) up to three times, and the release of v0.12.1
// spent 22 minutes failing the same check three times. Here:
//   • a failing browser test is retried ON ITS OWN, in a fresh process group
//     (tests/retry-browser-test.mjs, MK_BROWSER_TEST_ATTEMPTS / _TIMEOUT);
//   • the lane keeps going, so one run reports every failing test, not only
//     the first;
//   • each step's time is printed, so the slow tests are visible.
// The chain in package.json stays the single list of tests (the workflow
// tests read it), and `npm run <lane>` still works as before.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const lane = args.find((arg) => !arg.startsWith('--'));
const jobsFlag = args.indexOf('--jobs');
const jobs = Math.max(1, Math.min(8, Number(jobsFlag >= 0 ? args[jobsFlag + 1] : process.env.KT_LANE_JOBS) || 1));

const fail = (message) => { console.error(`run-lane: ${message}`); process.exit(2); };
if (!lane) fail('pass a package.json script name, e.g. test:browser');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const chain = pkg.scripts?.[lane];
if (!chain) fail(`package.json has no "${lane}" script`);

// Only plain `node <file>` steps are accepted: the lane is a list of test
// files, and nothing from it is ever handed to a shell.
const RETRY = 'tests/retry-browser-test.mjs';
const steps = chain.split(' && ').map((step) => {
  const parts = step.trim().split(/\s+/);
  if (parts[0] !== 'node' || parts.length < 2 || parts.length > 3 || !parts.slice(1).every((part) => /^[\w./-]+\.mjs$/.test(part))) {
    fail(`unsupported step in ${lane}: "${step}" (expected "node <file>.mjs")`);
  }
  const file = parts[parts.length - 1];
  // A step already wrapped in the retry helper keeps its wrapper; every other
  // browser test gets one, so a flake costs one test, not the lane.
  return { label: file, argv: [RETRY, file] };
});

const runStep = (step) => new Promise((resolve) => {
  const started = Date.now();
  const child = spawn(process.execPath, step.argv, { cwd: root, stdio: 'inherit', env: process.env });
  child.on('exit', (code, signal) => resolve({ ...step, ok: code === 0 && !signal, seconds: (Date.now() - started) / 1000 }));
  child.on('error', () => resolve({ ...step, ok: false, seconds: (Date.now() - started) / 1000 }));
});

// Local runs have no CI env: give each test room (the heaviest demo checks take
// minutes on a small machine) and one retry. CI sets both explicitly.
process.env.MK_BROWSER_TEST_TIMEOUT ||= '600000';
process.env.MK_BROWSER_TEST_ATTEMPTS ||= '2';

const results = [];
let next = 0;
const worker = async () => {
  while (next < steps.length) {
    const step = steps[next];
    next += 1;
    console.log(`\n▶ ${step.label}`);
    const result = await runStep(step);
    results.push(result);
    console.log(`${result.ok ? '✓' : '✗'} ${step.label} (${result.seconds.toFixed(1)}s)`);
  }
};
const started = Date.now();
await Promise.all(Array.from({ length: Math.min(jobs, steps.length) }, worker));

const failed = results.filter((result) => !result.ok);
const slowest = [...results].sort((a, b) => b.seconds - a.seconds).slice(0, 5)
  .map((result) => `${result.label} ${result.seconds.toFixed(0)}s`).join(', ');
console.log(`\n${lane}: ${results.length - failed.length}/${results.length} passed in ${((Date.now() - started) / 60000).toFixed(1)} min (jobs=${jobs}). Slowest: ${slowest}.`);
if (failed.length) {
  console.error(`${lane} failed: ${failed.map((result) => result.label).join(', ')}`);
  process.exit(1);
}
