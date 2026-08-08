// Enforce the size of the actual npm/GitHub Release tarball, not just individual
// build artifacts. Development sources, demos, QA documents, and unminified
// builds stay in Git, while npm receives only supported runtime entry points.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = JSON.parse(execFileSync('npm', ['pack', '--json', '--dry-run'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 10 * 1024 * 1024
}))[0];

const files = result.files.map((file) => file.path).sort();
const packedKb = result.size / 1024;
const unpackedKb = result.unpackedSize / 1024;
const check = process.argv.includes('--check');

const BUDGET = {
  // The 52-entry modular graph adds the Date Time runtime while retaining the
  // same allowlist. It measures 473.9 KB on Node 25/npm 11 and 475.2 KB on
  // the Node 22/npm 10 release runner, with 1604.7 KB unpacked / 72 files.
  // Keep only the 0.8 KB cross-runner compression headroom; this is not a
  // blanket increase for future dependencies.
  packedKb: 476,
  unpackedKb: 1608,
  files: 75
};

console.log(`release package: ${packedKb.toFixed(1)} KB packed · ${unpackedKb.toFixed(1)} KB unpacked · ${files.length} files`);

const failures = [];
if (packedKb > BUDGET.packedKb) failures.push(`packed ${packedKb.toFixed(1)} KB > ${BUDGET.packedKb} KB`);
if (unpackedKb > BUDGET.unpackedKb) failures.push(`unpacked ${unpackedKb.toFixed(1)} KB > ${BUDGET.unpackedKb} KB`);
if (files.length > BUDGET.files) failures.push(`files ${files.length} > ${BUDGET.files}`);

const forbidden = files.filter((file) => (
  file.startsWith('demo/')
  || file.startsWith('docs/')
  || file.startsWith('tests/')
  || file === 'dist/kineto.js'
  || file === 'dist/kineto.umd.js'
  || file === 'dist/kineto.css'
));
if (forbidden.length) failures.push(`development-only files included: ${forbidden.join(', ')}`);

const required = [
  'dist/kineto.min.css',
  'dist/kineto.min.js',
  'dist/kineto.umd.cjs',
  'dist/kineto.umd.min.js',
  'dist/modular/core.js',
  'dist/modular/modules/slider.js',
  'types/index.d.ts',
  'types/core.d.ts',
  'types/module.d.ts',
  'package.json',
  'README.md',
  'LICENSE'
];
for (const file of required) {
  if (!files.includes(file)) failures.push(`required release file missing: ${file}`);
}

if (check && failures.length) {
  console.error(`release package budget FAIL:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}
if (check) console.log('release package budget OK — full and modular runtime allowlists are intact.');
