// Runs one test "lane" — an `a && b && c` chain in package.json — step by step.
//
//   node scripts/run-lane.mjs test:node                     # every Node test, in order
//   node scripts/run-lane.mjs test:browser                  # Chromium lane, one test at a time
//   node scripts/run-lane.mjs test:browser --jobs 2         # two at a time (4+ CPU cores only)
//   node scripts/run-lane.mjs test:browser:cross --shard 1/2  # CI: half of the lane per runner
//   node scripts/run-lane.mjs test:browser --only magnetic --repeat 5   # hunt a flake
//   node scripts/run-lane.mjs test:browser --shard 2/3 --list           # show a shard, run nothing
//
// Why not `npm run test:browser`: a chain stops at the first failure, and CI
// used to wrap the WHOLE chain in a retry. One flaky browser test re-ran all 41
// tests (about 7 minutes) up to three times. Here:
//   • a failing step is retried ON ITS OWN, in a fresh process
//     (tests/retry-browser-test.mjs for test files, scripts/retry-command.mjs
//     for `npm run` steps), and a pass on retry is reported as FLAKY;
//   • the lane keeps going, so one run reports every failing step;
//   • `--shard k/n` splits a lane across CI runners (round-robin by position,
//     so every step lands in exactly one shard and a new test needs no config);
//   • each step's time is printed, so slow tests are visible.
//
// package.json stays the ONE list of tests: CI, the release workflow, and the
// local `npm run preflight` all run lanes through this file, so "passes
// locally" and "passes in CI" mean the same set of tests.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { annotation, inGitHubActions } from './gh-actions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RETRY_BROWSER = 'tests/retry-browser-test.mjs';
const RETRY_COMMAND = 'scripts/retry-command.mjs';
const VALUE_FLAGS = new Set(['--jobs', '--shard', '--only', '--repeat']);
const MAX_BUFFER_BYTES = 1024 * 1024; // per step, when output is buffered (--jobs > 1)

/** argv → options. Throws a readable Error on a bad flag. */
export function parseArgs(argv, env = {}) {
  const options = { lane: null, jobs: Number(env.KT_LANE_JOBS) || 1, shard: null, only: [], repeat: 1, list: false };
  let sawOnly = false;
  for (let index = 0; index < argv.length; index += 1) {
    let [flag, value] = argv[index].split(/=(.*)/s, 2);
    if (VALUE_FLAGS.has(flag) && value === undefined) { value = argv[index + 1]; index += 1; }
    if (flag === '--jobs') options.jobs = Number(value);
    else if (flag === '--shard') options.shard = parseShard(value);
    else if (flag === '--only') { sawOnly = true; options.only = String(value ?? '').split(',').map((part) => part.trim()).filter(Boolean); }
    else if (flag === '--repeat') options.repeat = Number(value);
    else if (flag === '--list') options.list = true;
    else if (flag.startsWith('--')) throw new Error(`unknown flag ${flag}`);
    else if (!options.lane) options.lane = flag;
    else throw new Error(`unexpected argument ${flag}`);
  }
  if (!options.lane) throw new Error('pass a package.json script name, e.g. test:browser');
  if (!Number.isInteger(options.jobs) || options.jobs < 1 || options.jobs > 8) throw new Error('--jobs must be 1–8');
  if (!Number.isInteger(options.repeat) || options.repeat < 1 || options.repeat > 50) throw new Error('--repeat must be 1–50');
  if (sawOnly && !options.only.length) throw new Error('--only needs a value');
  return options;
}

/** "2/3" → { index: 2, count: 3 }. */
export function parseShard(value) {
  const match = /^(\d+)\/(\d+)$/.exec(String(value ?? ''));
  const index = Number(match?.[1]);
  const count = Number(match?.[2]);
  if (!match || count < 1 || count > 16 || index < 1 || index > count) throw new Error(`--shard must look like 1/2 (got "${value}")`);
  return { index, count };
}

/**
 * One package.json chain → runnable steps. Only two shapes are accepted, and
 * nothing is ever handed to a shell:
 *   node <file>.mjs                              → a test file (retried alone)
 *   node tests/retry-browser-test.mjs <file>.mjs → the same, already wrapped
 *   npm run <script>                             → another package script
 */
export function parseLane(chain, lane = 'lane') {
  return String(chain).split(' && ').map((step) => {
    const parts = step.trim().split(/\s+/);
    if (parts[0] === 'npm' && parts[1] === 'run' && parts.length === 3 && /^[\w:.-]+$/.test(parts[2])) {
      return { label: parts[2], argv: [RETRY_COMMAND, 'npm', 'run', parts[2]] };
    }
    const files = parts.slice(1);
    const wrapped = files.length === 2 && files[0] === RETRY_BROWSER;
    if (parts[0] === 'node' && (files.length === 1 || wrapped) && files.every((part) => /^[\w./-]+\.mjs$/.test(part))) {
      const file = files[files.length - 1];
      return { label: file, argv: [RETRY_BROWSER, file] };
    }
    throw new Error(`unsupported step in ${lane}: "${step}" (expected "node <file>.mjs" or "npm run <script>")`);
  });
}

/** Keeps the steps of one shard (round-robin by position) that match `only`. */
export function selectSteps(steps, { shard = null, only = [] } = {}) {
  return steps.filter((step, position) => (!shard || position % shard.count === shard.index - 1)
    && (!only.length || only.some((part) => step.label.includes(part))));
}

// Keeps the last MAX_BUFFER_BYTES of a child's output (used with --jobs > 1 so
// parallel tests do not interleave their lines).
function outputTail() {
  const chunks = [];
  let size = 0;
  let dropped = 0;
  return {
    push(chunk) {
      chunks.push(chunk);
      size += chunk.length;
      while (size > MAX_BUFFER_BYTES && chunks.length > 1) { const old = chunks.shift(); size -= old.length; dropped += old.length; }
    },
    text: () => `${dropped ? `[… ${dropped} bytes of earlier output trimmed]\n` : ''}${Buffer.concat(chunks).toString('utf8')}`
  };
}

function runStep(step, { buffered, env }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const output = buffered ? outputTail() : null;
    const child = spawn(process.execPath, step.argv, { cwd: root, env, stdio: buffered ? ['ignore', 'pipe', 'pipe'] : 'inherit' });
    if (output) for (const stream of [child.stdout, child.stderr]) stream.on('data', (chunk) => output.push(chunk));
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      resolve({ ...step, ok, seconds: (Date.now() - started) / 1000, output: output?.text() ?? '' });
    };
    // 'close' (not 'exit') fires after the child's output is fully read.
    child.on('close', (code, signal) => done(code === 0 && !signal));
    child.on('error', () => done(false));
  });
}

async function main() {
  let options;
  let chain;
  try {
    options = parseArgs(process.argv.slice(2), process.env);
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    chain = pkg.scripts?.[options.lane];
    if (!chain) throw new Error(`package.json has no "${options.lane}" script`);
  } catch (error) {
    console.error(`run-lane: ${error.message}`);
    process.exit(2);
  }
  const { lane, jobs, shard, only, repeat } = options;
  let all;
  try { all = parseLane(chain, lane); } catch (error) { console.error(`run-lane: ${error.message}`); process.exit(2); }
  const selected = selectSteps(all, { shard, only });
  const scope = [shard && `shard ${shard.index}/${shard.count}`, only.length && `only ${only.join(',')}`].filter(Boolean).join(', ');
  if (only.length && !selected.length) { console.error(`run-lane: no step of ${lane} matches --only ${only.join(',')}`); process.exit(2); }
  if (options.list) {
    console.log(`${lane}${scope ? ` (${scope})` : ''}: ${selected.length} of ${all.length} steps`);
    for (const step of selected) console.log(`  ${step.label}`);
    return;
  }
  if (!selected.length) { console.log(`${lane} (${scope}): nothing to run.`); return; }

  // Room for the heaviest demo checks on a small machine, and one retry. CI sets
  // its own values in the workflow. --repeat turns retries OFF so a flake shows.
  const env = { ...process.env };
  env.MK_BROWSER_TEST_TIMEOUT ||= '600000';
  env.MK_BROWSER_TEST_ATTEMPTS ||= '2';
  env.KT_COMMAND_ATTEMPTS ||= '2';
  if (repeat > 1) { env.MK_BROWSER_TEST_ATTEMPTS = '1'; env.KT_COMMAND_ATTEMPTS = '1'; }
  const flakeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kineto-lane-'));
  env.KT_LANE_FLAKE_FILE = path.join(flakeDir, 'flaky.tsv');

  const queue = selected.flatMap((step) => Array.from({ length: repeat }, (_, run) => ({ ...step, run: run + 1 })));
  const buffered = jobs > 1;
  const actions = inGitHubActions();
  const results = [];
  let next = 0;
  const title = (step) => `${step.label}${repeat > 1 ? ` #${step.run}` : ''}`;
  const worker = async () => {
    while (next < queue.length) {
      const step = queue[next];
      next += 1;
      if (!buffered) console.log(actions ? `::group::${title(step)}` : `\n▶ ${title(step)}`);
      const result = await runStep(step, { buffered, env });
      results.push(result);
      const line = `${result.ok ? '✓' : '✗'} ${title(step)} (${result.seconds.toFixed(1)}s)`;
      if (buffered) {
        console.log(actions ? `::group::${line}` : `\n▶ ${title(step)}`);
        process.stdout.write(result.output);
        if (actions) console.log('::endgroup::');
        console.log(actions ? '' : line);
      } else {
        if (actions) console.log('::endgroup::');
        console.log(line);
      }
    }
  };
  const started = Date.now();
  await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, worker));

  let flaky = [];
  try { flaky = fs.readFileSync(env.KT_LANE_FLAKE_FILE, 'utf8').trim().split('\n').filter(Boolean); } catch { /* no flakes */ }
  fs.rmSync(flakeDir, { recursive: true, force: true });

  const failed = results.filter((result) => !result.ok);
  const minutes = ((Date.now() - started) / 60000).toFixed(1);
  const slowest = [...results].sort((a, b) => b.seconds - a.seconds).slice(0, 5)
    .map((result) => `${title(result)} ${result.seconds.toFixed(0)}s`).join(', ');
  console.log(`\n${lane}${scope ? ` (${scope})` : ''}: ${results.length - failed.length}/${results.length} passed in ${minutes} min (jobs=${jobs}${repeat > 1 ? `, repeat=${repeat}` : ''}). Slowest: ${slowest}.`);
  if (flaky.length) console.log(`Flaky (failed, then passed on retry): ${flaky.map((line) => line.replace('\t', ' ')).join(', ')}`);
  if (repeat > 1) {
    const byLabel = new Map();
    for (const result of results) {
      const entry = byLabel.get(result.label) || { runs: 0, passes: 0 };
      entry.runs += 1;
      entry.passes += result.ok ? 1 : 0;
      byLabel.set(result.label, entry);
    }
    for (const [label, { runs, passes }] of byLabel) console.log(`  ${passes === runs ? '✓' : '✗'} ${label}: ${passes}/${runs}`);
  }
  if (env.GITHUB_STEP_SUMMARY) {
    const rows = results.map((result) => `| ${result.ok ? '✓' : '✗'} | \`${title(result)}\` | ${result.seconds.toFixed(1)} |`);
    const summary = [`### ${lane}${scope ? ` (${scope})` : ''} — ${results.length - failed.length}/${results.length} in ${minutes} min`, '', '| | step | s |', '|---|---|---:|', ...rows, ''];
    try { fs.appendFileSync(env.GITHUB_STEP_SUMMARY, `${summary.join('\n')}\n`); } catch { /* the summary is optional */ }
  }
  if (failed.length) {
    const names = [...new Set(failed.map((result) => result.label))].join(', ');
    console.error(`${lane} failed: ${names}`);
    if (actions) console.error(annotation('error', `${lane}${scope ? ` ${scope}` : ''} failed`, names));
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
