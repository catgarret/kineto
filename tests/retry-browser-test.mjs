// Runs ONE browser test file, retrying it in a fresh process group when it
// fails or hangs:
//   node tests/retry-browser-test.mjs tests/browser/<file>.mjs
// MK_BROWSER_TEST_ATTEMPTS (default 2) and MK_BROWSER_TEST_TIMEOUT (ms per
// attempt, default 180000) bound the work. A pass after a failure is reported
// as FLAKY (console + GitHub annotation, see scripts/gh-actions.mjs) so that
// retries never hide a problem silently.
import { spawn } from 'node:child_process';
import { relative, resolve } from 'node:path';
import { annotation, inGitHubActions, reportFlaky } from '../scripts/gh-actions.mjs';

const target = process.argv[2];
if (!target) throw new Error('Usage: node tests/retry-browser-test.mjs <test-file>');

const testFile = resolve(process.cwd(), target);
const attempts = Number(process.env.MK_BROWSER_TEST_ATTEMPTS || 2);
// The full demo QA includes 184 lazy playgrounds plus animated-media capture.
// GitHub's shared runners can take longer than the local ~80s baseline while
// still remaining a bounded test; allow one 180s attempt before retrying.
const timeout = Number(process.env.MK_BROWSER_TEST_TIMEOUT || 180000);
const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));

function signalGroup(pid, signal) {
  if (!pid) return;
  try { process.kill(-pid, signal); } catch { /* process group already exited */ }
}

async function stopGroup(pid) {
  signalGroup(pid, 'SIGTERM');
  await delay(350);
  signalGroup(pid, 'SIGKILL');
  await delay(150);
}

async function run() {
  return new Promise((resolveRun) => {
    const child = spawn(process.execPath, [testFile], {
      stdio: 'inherit',
      detached: true,
      env: { ...process.env }
    });
    let timedOut = false;
    let settled = false;

    const finish = async (code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      await stopGroup(child.pid);
      resolveRun({ ok: code === 0 && !timedOut, code, signal, timedOut });
    };

    const timer = setTimeout(() => {
      timedOut = true;
      signalGroup(child.pid, 'SIGTERM');
      setTimeout(() => signalGroup(child.pid, 'SIGKILL'), 1200).unref();
    }, timeout);

    child.on('exit', (code, signal) => { void finish(code, signal); });
    child.on('error', () => { void finish(1, 'spawn-error'); });
  });
}

const label = relative(process.cwd(), testFile) || target;
let last = null;
for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const result = await run();
  last = result;
  if (result.ok) {
    if (attempt > 1) reportFlaky({ label, attempt, attempts });
    process.exit(0);
  }
  if (attempt < attempts) {
    console.warn(`Browser QA attempt ${attempt} failed (code=${result.code ?? 'null'}, signal=${result.signal ?? 'none'}, timedOut=${result.timedOut}); retrying in a fresh process group.`);
    await delay(1200);
  }
}

// A test killed by the timeout cannot report for itself, so say what happened.
// (A test that failed on its own already printed its assertion; see
// tests/ci-annotate.mjs.)
const why = last?.timedOut ? `timed out after ${Math.round(timeout / 1000)}s` : `exit code ${last?.code ?? 'null'}${last?.signal ? `, signal ${last.signal}` : ''}`;
console.error(`${label} failed on all ${attempts} attempt(s); last attempt: ${why}.`);
if (inGitHubActions()) console.error(annotation('error', `${label} failed`, `failed on all ${attempts} attempt(s); last attempt: ${why}`));
process.exit(1);
