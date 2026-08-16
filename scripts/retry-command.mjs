// Re-run a complete verification command once after a transient CI failure.
// The command is still required to pass; retries only absorb short-lived
// runner, browser, or registry instability without masking a real regression.
import { spawn } from 'node:child_process';

const command = process.argv[2];
const args = process.argv.slice(3);
if (!command) throw new Error('Usage: node scripts/retry-command.mjs <command> [...args]');

const attempts = Number(process.env.KT_COMMAND_ATTEMPTS || 2);
const retryDelay = Number(process.env.KT_COMMAND_RETRY_DELAY_MS || 1500);
if (!Number.isInteger(attempts) || attempts < 1) {
  throw new Error('KT_COMMAND_ATTEMPTS must be a positive integer');
}
if (!Number.isFinite(retryDelay) || retryDelay < 0) {
  throw new Error('KT_COMMAND_RETRY_DELAY_MS must be a non-negative number');
}

const executable = process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function run() {
  return new Promise((resolve) => {
    const child = spawn(executable, args, {
      stdio: 'inherit',
      env: process.env
    });
    child.on('exit', (code, signal) => resolve({ code: code ?? 1, signal }));
    child.on('error', () => resolve({ code: 1, signal: 'spawn-error' }));
  });
}

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const result = await run();
  if (result.code === 0 && !result.signal) {
    if (attempt > 1) console.log(`Verification passed on retry ${attempt}/${attempts}.`);
    process.exit(0);
  }
  if (attempt < attempts) {
    console.warn(`Command failed (attempt ${attempt}/${attempts}); retrying in ${retryDelay}ms.`);
    await delay(retryDelay);
  }
}

process.exitCode = 1;
