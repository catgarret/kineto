// Install a locked nested QA project without making a transient registry
// timeout fail the whole release. `npm ci` remains strict about the lockfile;
// only the network operation is retried in a fresh npm process.
import { spawn } from 'node:child_process';

const target = process.argv[2];
if (!target) throw new Error('Usage: node scripts/npm-ci-retry.mjs <directory>');

const attempts = Number(process.env.KT_NPM_CI_ATTEMPTS || 3);
if (!Number.isInteger(attempts) || attempts < 1) {
  throw new Error('KT_NPM_CI_ATTEMPTS must be a positive integer');
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = [
  '--prefix', target,
  'ci',
  '--prefer-offline',
  '--fetch-retries=3',
  '--fetch-retry-mintimeout=1000',
  '--fetch-retry-maxtimeout=5000',
  '--fetch-timeout=30000'
];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function install() {
  return new Promise((resolve) => {
    const child = spawn(npm, args, { stdio: 'inherit', env: process.env });
    child.on('exit', (code) => resolve(code === 0));
    child.on('error', () => resolve(false));
  });
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  if (await install()) {
    console.log(`Locked install ready for ${target} (attempt ${attempt}/${attempts}).`);
    process.exit(0);
  }
  if (attempt < attempts) {
    const pause = attempt * 1500;
    console.warn(`Locked install for ${target} failed (attempt ${attempt}/${attempts}); retrying in ${pause}ms.`);
    await delay(pause);
  }
}

console.error(`::error title=Locked nested install failed::${target}`);
process.exitCode = 1;
