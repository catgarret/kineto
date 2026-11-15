// Package-consumer lint: what a bundler, Node and TypeScript see when they
// resolve @dong-gri/kineto from the published tarball.
//
//   1. publint --strict                 package.json fields, exports, files
//   2. @arethetypeswrong/cli (attw)     every subpath's types vs. its JavaScript,
//                                       for Node 16+ (ESM and CJS) and bundlers
//
// attw reports a few things that are true and intended, so they are allowed
// here BY SHAPE, not by switching whole rules off (a new problem of the same
// kind elsewhere still fails):
//   - node10 (TypeScript's legacy `moduleResolution: node`) cannot see
//     `exports`; only `.` resolves there, through the top-level `types`/`main`.
//   - every subpath except `.` and `./all` is ESM-only, so `require()` of it
//     "resolves to ESM" (CJSResolvesToESM) — that is the design, not a bug.
//   - `./umd` is the script-tag build (a UMD file named .js inside a
//     `type: module` package); it is documented for CDNs, not as an import target.
//   - `./style.css` is not JavaScript.
//
// Security: no shell — both tools run through execFileSync with argv arrays,
// and the tarball is written to a private temporary directory.
// Run: node scripts/check-package-lint.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { expectedExitEnv } from './gh-actions.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bin = (name) => path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name);
const CJS_SUBPATHS = new Set(['.', './all']);
const EXCLUDED = ['style.css', 'umd'];

const allowed = (problem) => {
  if (problem.resolutionKind === 'node10') return true;
  if (problem.kind === 'CJSResolvesToESM' && !CJS_SUBPATHS.has(problem.entrypoint)) return true;
  // The legacy top-level `types` (node10 only) is the ESM declaration next to
  // the UMD `main`; node16 `require` has its own .d.cts.
  if (problem.kind === 'FalseExportDefault' && problem.typesFileName?.endsWith('/types/index.d.ts') && problem.implementationFileName?.endsWith('/dist/kineto.umd.cjs')) return true;
  return false;
};

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'kineto-package-lint-'));
try {
  execFileSync(bin('publint'), ['--strict'], { cwd: root, stdio: 'inherit' });

  const packed = JSON.parse(execFileSync('npm', ['pack', '--json', '--pack-destination', temp], { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }))[0];
  const tarball = path.join(temp, packed.filename);
  // attw exits (1) as soon as it finds any problem, which can cut a piped JSON
  // report short; writing to a file keeps it whole. The exit code is ignored:
  // the JSON is what gets judged below — so attw runs with expectedExitEnv(),
  // or CI would annotate its by-design exit 1 as a failure on a green job.
  const reportPath = path.join(temp, 'attw.json');
  const out = fs.openSync(reportPath, 'w');
  try {
    execFileSync(bin('attw'), [tarball, '--format', 'json', '--exclude-entrypoints', ...EXCLUDED], { cwd: root, env: expectedExitEnv(), stdio: ['ignore', out, 'inherit'] });
  } catch (error) {
    if (typeof error.status !== 'number') throw error;
  } finally {
    fs.closeSync(out);
  }
  const report = fs.readFileSync(reportPath, 'utf8');
  const { analysis } = JSON.parse(report);
  const problems = analysis.problems || [];
  const unexpected = problems.filter((problem) => !allowed(problem));
  if (unexpected.length) {
    console.error('Type resolution problems (attw):');
    unexpected.forEach((problem) => console.error(`  ${problem.kind} ${problem.entrypoint || ''} ${problem.resolutionKind || ''} ${problem.typesFileName || ''}`));
    process.exit(1);
  }
  console.log(`package lint OK — publint strict clean; attw: ${problems.length} known-by-design findings, 0 unexpected across ${Object.keys(analysis.entrypoints || {}).length} subpaths.`);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
