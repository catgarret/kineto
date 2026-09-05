import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const auditTargets = Object.freeze([
  Object.freeze({ name: 'root', directory: '.', report: 'npm-audit-root.json' }),
  Object.freeze({ name: 'consumer-bundles', directory: 'tests/consumer-bundles', report: 'npm-audit-consumer-bundles.json' }),
  Object.freeze({ name: 'framework-qa', directory: 'tests/framework-qa', report: 'npm-audit-framework-qa.json' })
]);

const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function defaultRunner(target, root) {
  return spawnSync(npmExecutable, ['audit', '--audit-level=low', '--json'], {
    cwd: path.join(root, target.directory),
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024
  });
}

function parseReport(target, result) {
  try {
    return JSON.parse(result.stdout || '');
  } catch (_error) {
    return {
      error: {
        code: result.error?.code || 'INVALID_AUDIT_OUTPUT',
        message: result.error?.message || 'npm audit did not return valid JSON',
        status: result.status ?? 1,
        target: target.name,
        stderr: String(result.stderr || '').trim(),
        stdout: String(result.stdout || '').trim()
      }
    };
  }
}

export function auditLockfiles({
  root = repositoryRoot,
  outputDir = path.join(root, 'artifacts'),
  runner = defaultRunner,
  logger = console
} = {}) {
  fs.mkdirSync(outputDir, { recursive: true });
  const results = [];

  for (const target of auditTargets) {
    const lockfile = path.join(root, target.directory, 'package-lock.json');
    let commandResult;
    if (fs.existsSync(lockfile)) {
      commandResult = runner(target, root);
    } else {
      commandResult = {
        status: 1,
        stdout: '',
        stderr: `missing lockfile: ${path.relative(root, lockfile)}`
      };
    }

    const report = parseReport(target, commandResult);
    const reportPath = path.join(outputDir, target.report);
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

    const status = commandResult.status ?? 1;
    const total = report.metadata?.vulnerabilities?.total;
    const detail = Number.isFinite(total) ? `${total} vulnerabilities` : 'audit command error';
    logger.log(`${status === 0 ? 'OK' : 'FAIL'} ${target.name}: ${detail} -> ${path.relative(root, reportPath)}`);
    results.push({ ...target, status, reportPath, report });
  }

  return results;
}

function outputDirectory(argv) {
  const index = argv.indexOf('--output-dir');
  if (index < 0) return path.join(repositoryRoot, 'artifacts');
  const value = argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error('--output-dir requires a directory');
  return path.resolve(repositoryRoot, value);
}

const isMain = fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  const results = auditLockfiles({ outputDir: outputDirectory(process.argv.slice(2)) });
  const failed = results.filter((result) => result.status !== 0);
  if (failed.length) {
    console.error(`Lockfile audit failed: ${failed.map((result) => result.name).join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(`Lockfile audit OK: ${results.length} lockfiles, separate JSON reports written.`);
  }
}
