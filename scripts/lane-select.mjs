// Which steps of a lane run (used by scripts/run-lane.mjs).
//
//   • balancedShard — CI splits a lane across runners. Round-robin by position
//     put two of the slowest browser tests on one runner (WebKit 1/2 took 251 s,
//     2/2 199 s; Firefox ran alone for 342 s), and CI takes as long as its
//     slowest shard. Steps are now dealt by MEASURED time: the longest first,
//     each onto the least-loaded shard (the classic "LPT" rule). The times come
//     from tests/lane-timings.json (`run-lane --record-timings` rewrites it); a
//     step with no time yet counts as the median, so a new test needs no config.
//     Every step still lands in exactly one shard, and a shard runs its steps in
//     lane order.
//
//   • affectedSteps — `run-lane --changed` runs only the steps a change can
//     affect, so a local check after a demo or single-module edit takes a few
//     minutes instead of the whole lane. It is a local accelerator: CI always
//     runs every step. When in doubt it runs more, never less — a changed file
//     no rule understands runs the whole lane. A test that covers a whole area
//     without naming it (every demo block, every module's idle loop) says so in
//     a comment: `// @lane-affected-by src/modules/` — any changed file under
//     that path then runs it.
//
// The functions here are pure (tests/lane-select.mjs checks them); the small
// readers at the bottom are the only parts that touch git or the disk.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/** Seconds assumed for a step when no step of the lane has a measured time. */
export const DEFAULT_STEP_SECONDS = 30;

/** The key a lane's times are stored under: browser lanes differ per engine. */
export function timingKey(lane, browser) {
  return lane.startsWith('test:browser') ? `${lane}@${browser || 'chromium'}` : lane;
}

function median(values) {
  if (!values.length) return DEFAULT_STEP_SECONDS;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * The steps of shard `index` of `count`, dealt by time (see the top of the file).
 * @param {{label: string}[]} steps   the lane, in order
 * @param {{index: number, count: number}} shard
 * @param {Record<string, number>} [seconds]  measured seconds per step label
 */
export function balancedShard(steps, shard, seconds = {}) {
  const known = steps.map((step) => seconds[step.label]).filter((value) => Number.isFinite(value) && value > 0);
  const fallback = median(known);
  const cost = (step) => (Number.isFinite(seconds[step.label]) && seconds[step.label] > 0 ? seconds[step.label] : fallback);
  // Longest first; equal times keep lane order, so the deal is deterministic.
  const order = steps.map((step, position) => ({ step, position, cost: cost(step) }))
    .sort((a, b) => b.cost - a.cost || a.position - b.position);
  const loads = Array.from({ length: shard.count }, () => 0);
  const owner = new Map();
  for (const { step, cost: time } of order) {
    let target = 0;
    for (let candidate = 1; candidate < loads.length; candidate += 1) if (loads[candidate] < loads[target]) target = candidate;
    loads[target] += time;
    owner.set(step, target);
  }
  return steps.filter((step) => owner.get(step) === shard.index - 1);
}

// ---------------------------------------------------------------- --changed

/**
 * Changed files that can affect ANY step: shared runtime code, the lane
 * machinery, dependencies. One of these runs the whole lane.
 */
const BROAD = [
  /^src\/(?!modules\/)[^/]+$/, // core, utils, runtime, kineto.css, index, …
  /^src\/adapters\//,
  /^package(-lock)?\.json$/,
  /^scripts\/(run-lane|lane-select|retry-command|gh-actions)\.mjs$/,
  /^tests\/(retry-browser-test|ci-annotate)\.mjs$/,
  /^tests\/browser-smoke-page\.js$/
];

/** camelCase module name → its activation attribute (textSplit → data-kt-text-split). */
const attributeOf = (name) => `data-kt-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * For one changed file: a test of whether a step's text is affected, or
 * `'all'` when the file is not understood (so everything runs).
 */
export function matcherFor(file) {
  if (BROAD.some((pattern) => pattern.test(file))) return 'all';
  const module = /^src\/modules\/([A-Za-z0-9]+)(?:\.js$|\/)/.exec(file);
  if (module) {
    const name = module[1];
    const mentions = new RegExp(`\\b${escapeRegExp(name)}\\b|${escapeRegExp(attributeOf(name))}\\b|modules/${escapeRegExp(name)}\\b`);
    return (text) => mentions.test(text);
  }
  // The demo and its deployed copy: every step that opens or reads them.
  if (/^(demo|site)\//.test(file)) return (text) => /\b(demo|site)\/[\w./-]+|['"`/]demo\/|site\/index\.html/.test(text);
  // Anything else (a test, a helper, a script, a doc, a contract JSON, a
  // workflow) affects the steps that name it: by path or by file name.
  const base = path.posix.basename(file);
  const stem = base.replace(/\.[^.]+$/, '');
  const byName = new RegExp(`${escapeRegExp(file)}|\\b${escapeRegExp(base)}\\b|\\b${escapeRegExp(stem)}\\b`);
  return (text) => byName.test(text);
}

/** The paths a test declares with `@lane-affected-by <path>` (see the top of the file). */
export function declaredPrefixes(text) {
  return [...text.matchAll(/@lane-affected-by\s+([\w./-]+)/g)].map(([, prefix]) => prefix);
}

/**
 * The steps affected by `changedFiles`.
 * @param {{label: string}[]} steps
 * @param {string[]} changedFiles   repository-relative paths
 * @param {(step: {label: string}) => string} textOf   what a step runs (its test file, or an npm script's files)
 * @returns {{steps: {label: string}[], all: boolean, reason: string}}
 */
export function affectedSteps(steps, changedFiles, textOf) {
  if (!changedFiles.length) return { steps: [], all: false, reason: 'no changes' };
  const matchers = [];
  for (const file of changedFiles) {
    const matcher = matcherFor(file);
    if (matcher === 'all') return { steps, all: true, reason: `${file} affects every step` };
    matchers.push({ file, matcher });
  }
  const selected = steps.filter((step) => {
    // A changed test file is its own step.
    if (changedFiles.includes(step.label)) return true;
    const text = `${step.label}\n${textOf(step)}`;
    const declared = declaredPrefixes(text);
    return matchers.some(({ file, matcher }) => matcher(text) || declared.some((prefix) => file.startsWith(prefix)));
  });
  return { steps: selected, all: false, reason: `${changedFiles.length} changed file(s)` };
}

// ---------------------------------------------------------------- readers

/** Files changed since `base` (committed, staged, unstaged and untracked). */
export function changedFilesSince(root, base) {
  const git = (...args) => spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  let ref = base;
  if (!ref) {
    const upstream = git('rev-parse', '--verify', '--quiet', 'origin/main');
    ref = upstream.status === 0 ? git('merge-base', 'HEAD', 'origin/main').stdout.trim() : 'HEAD~1';
  }
  const committed = git('diff', '--name-only', `${ref}...HEAD`);
  if (committed.status !== 0) throw new Error(`--changed: cannot compare with "${ref}" (${committed.stderr.trim()})`);
  const working = git('status', '--porcelain=v1', '--untracked-files=all');
  const files = new Set(committed.stdout.split('\n').filter(Boolean));
  for (const line of working.stdout.split('\n')) {
    const file = line.slice(3).split(' -> ').pop();
    if (file) files.add(file);
  }
  return { ref, files: [...files].sort() };
}

/**
 * What a step runs, as text: its test file plus the local files it imports,
 * or — for `npm run x` — the files that script (and the scripts it calls) run.
 */
export function stepTextReader(root, scripts) {
  const cache = new Map();
  const readFile = (file) => {
    if (cache.has(file)) return cache.get(file);
    let text = '';
    try { text = fs.readFileSync(path.join(root, file), 'utf8'); } catch { /* missing: no text */ }
    cache.set(file, text);
    return text;
  };
  // One level of local imports: tests share helpers (e.g. a server or a page fixture).
  const withImports = (file) => {
    const text = readFile(file);
    const imports = [...text.matchAll(/from\s+['"](\.{1,2}\/[^'"]+)['"]/g)]
      .map(([, spec]) => path.posix.normalize(path.posix.join(path.posix.dirname(file), spec)));
    return [text, ...imports.map(readFile)].join('\n');
  };
  const scriptText = (name, depth = 0) => {
    const command = scripts[name] || '';
    if (depth > 3) return command;
    const files = [...command.matchAll(/\bnode\s+(?:--[\w-]+(?:=\S+)?\s+)*([\w./-]+\.m?js)/g)].map(([, file]) => withImports(file));
    const nested = [...command.matchAll(/\bnpm (?:--prefix [\w./-]+ )?run ([\w:.-]+)/g)].map(([, script]) => scriptText(script, depth + 1));
    return [command, ...files, ...nested].join('\n');
  };
  return (step) => (step.argv[0] === 'scripts/retry-command.mjs' ? scriptText(step.label) : withImports(step.label));
}
