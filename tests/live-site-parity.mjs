import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'scripts/verify-live-site.mjs');
const goodHtml = (build) => `<!doctype html><script>window.__KT_BUILD__="${build}";</script><span data-kt-version>0.9.3</span><span data-kt-module-count>52</span><script src="https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.min.js"></script>GTM-KFQSFGJL`;
let backupHtml = goodHtml('fixture-build');

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(request.url.startsWith('/backup') ? backupHtml : goodHtml('fixture-build'));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const env = {
  ...process.env,
  KT_LIVE_URL: `http://127.0.0.1:${port}/primary`,
  KT_LIVE_BACKUP_URL: `http://127.0.0.1:${port}/backup`,
  KT_LIVE_ATTEMPTS: '1'
};
const runParity = () => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [script, '--include-backup'], { cwd: root, env });
  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', reject);
  child.on('close', (status) => resolve({ status, stdout, stderr }));
});

try {
  const passed = await runParity();
  assert.equal(passed.status, 0, passed.stderr);
  assert.match(passed.stdout, /live-site parity OK/);

  backupHtml = goodHtml('different-build');
  const failed = await runParity();
  assert.notEqual(failed.status, 0, 'parity must fail when build markers differ');
  assert.match(failed.stderr, /build marker mismatch/);
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log('live-site parity fixture OK — matching sites pass and build-marker drift fails.');
