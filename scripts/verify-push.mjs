// The check to run BEFORE every push (task branch or main):
//
//   npm run verify:push                 lint → build → generated files → Node lane → demo QA   (~4 min)
//   npm run verify:push -- --fast       lint → build → generated files → Node lane             (pre-push hook)
//   npm run verify:push -- --browser    … and the whole Chromium browser lane (one test per 2 cores)
//
// Why this exists: of the last 26 red CI runs, 15 failed on things this
// command catches in minutes — lint errors, a ReferenceError, and generated
// files (contract docs, playground options, the demo site) that were not
// regenerated or not committed. CI is the integration authority, not a test
// runner: push only after this passes.
//
// What "generated files" means here: `npm run build` regenerates dist/modular,
// site/, the playground options, the variant catalog and the integration
// artefacts. If the build CHANGES a file, the commit you are about to push has
// stale outputs — CI would fail on it. The files are left regenerated for you
// to review and commit; only files the build changed are reported (your own
// uncommitted edits are ignored).
//
// Nothing here uses a shell or the network beyond what the npm scripts do.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
for (const arg of args) {
  if (!['--fast', '--browser'].includes(arg)) {
    console.error(`verify:push: unknown flag ${arg} (use --fast or --browser)`);
    process.exit(2);
  }
}
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
// A browser test needs about two cores of its own: two tests on a 2-core
// machine starve each other and fail on timing (seen in a 2-core container).
const browserJobs = String(Math.max(1, Math.min(4, Math.floor(os.availableParallelism() / 2))));

/** Every modified or untracked file → a hash of its current bytes. */
function dirtyFiles() {
  const listed = spawnSync('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: root, encoding: 'utf8' });
  if (listed.status !== 0) throw new Error('git status failed — run this inside the repository');
  const files = new Map();
  // -z entries: "XY path\0" (a rename adds "\0old-path", which we skip).
  const entries = listed.stdout.split('\0');
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) continue;
    const status = entry.slice(0, 2);
    const file = entry.slice(3);
    if (status.includes('R') || status.includes('C')) index += 1;
    let hash = 'deleted';
    try { hash = createHash('sha1').update(fs.readFileSync(path.join(root, file))).digest('hex'); } catch { /* deleted */ }
    files.set(file, hash);
  }
  return files;
}

const steps = [
  { name: 'lint', command: npm, args: ['run', 'lint'] },
  { name: 'build (+ generated files)', command: npm, args: ['run', 'build'], checkGenerated: true },
  { name: 'Node lane (test:node)', command: process.execPath, args: ['scripts/run-lane.mjs', 'test:node'] },
  ...(args.has('--fast') ? [] : [{ name: 'demo QA (test:demo)', command: npm, args: ['run', 'test:demo'] }]),
  ...(args.has('--browser') ? [{ name: `Chromium browser lane (${browserJobs} at a time)`, command: process.execPath, args: ['scripts/run-lane.mjs', 'test:browser', '--jobs', browserJobs] }] : [])
];

// Locally a failing Node test fails at once: a retry only doubles the wait
// (network installs in the fixtures retry on their own, scripts/npm-ci-retry.mjs).
const env = { ...process.env, KT_COMMAND_ATTEMPTS: process.env.KT_COMMAND_ATTEMPTS || '1' };
const results = [];
const started = Date.now();
for (const step of steps) {
  console.log(`\n━━ verify:push · ${step.name}`);
  const before = step.checkGenerated ? dirtyFiles() : null;
  const stepStarted = Date.now();
  const run = spawnSync(step.command, step.args, { cwd: root, stdio: 'inherit', env });
  let ok = run.status === 0 && !run.signal;
  let note = '';
  if (ok && before) {
    const after = dirtyFiles();
    const changed = [...after].filter(([file, hash]) => before.get(file) !== hash).map(([file]) => file);
    if (changed.length) {
      ok = false;
      note = `the build changed ${changed.length} file(s) — the commit had stale generated output`;
      console.error(`\nThe build regenerated files that differ from what you have:\n${changed.map((file) => `  ${file}`).join('\n')}\n`
        + 'Review them and include them in your commit (they are already regenerated), then run verify:push again.');
    }
  }
  results.push({ ...step, ok, note, seconds: (Date.now() - stepStarted) / 1000 });
  // Lint or build failing makes the later steps meaningless; stop early.
  if (!ok && steps.indexOf(step) < 2) break;
}

console.log('\n━━ verify:push summary');
for (const result of results) console.log(`${result.ok ? '✓' : '✗'} ${result.name} (${result.seconds.toFixed(0)}s)${result.note ? ` — ${result.note}` : ''}`);
const minutes = ((Date.now() - started) / 60000).toFixed(1);
if (results.length < steps.length || results.some((result) => !result.ok)) {
  console.error(`\nverify:push FAILED after ${minutes} min — do not push. Fix the ✗ step above.`);
  process.exit(1);
}
console.log(`\nverify:push passed in ${minutes} min${args.has('--browser') ? '' : ' (browser lanes run in CI; run a changed browser test with `node scripts/run-lane.mjs test:browser --only <name> --repeat 3`)'}.`);
