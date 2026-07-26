import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const target = process.argv[2];
if (!target) throw new Error('Usage: node tests/retry-browser-test.mjs <test-file>');

const testFile = resolve(process.cwd(), target);
const attempts = Number(process.env.MK_BROWSER_TEST_ATTEMPTS || 2);
const timeout = Number(process.env.MK_BROWSER_TEST_TIMEOUT || 120000);
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

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const result = await run();
  if (result.ok) process.exit(0);
  if (attempt < attempts) {
    console.warn(`Browser QA attempt ${attempt} failed; retrying in a fresh process group.`);
    await delay(1200);
  }
}

process.exit(1);
