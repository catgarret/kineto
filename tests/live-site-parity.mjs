import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'scripts/verify-live-site.mjs');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const featureContract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const runtimeAssets = new Map([
  ['/kineto.umd.min.js', fs.readFileSync(path.join(root, 'dist/kineto.umd.min.js'))],
  ['/kineto.min.css', fs.readFileSync(path.join(root, 'dist/kineto.min.css'))]
]);
const goodHtml = (build) => `<!doctype html><link rel="stylesheet" href="./kineto.min.css?v=${build}"><script>window.__KT_BUILD__="${build}";</script><span data-kt-version>${packageJson.version}</span><span data-kt-module-count>${featureContract.moduleCount}</span><script src="./kineto.umd.min.js?v=${build}"></script><code>https://cdn.jsdelivr.net/npm/@dong-gri/kineto/dist/kineto.umd.min.js</code>GTM-KFQSFGJL`;
let backupHtml = goodHtml('fixture-build');
let corruptBackupAsset = false;
let slowPrimary = false;

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  if (slowPrimary && pathname.startsWith('/primary/')) {
    setTimeout(() => {
      if (response.destroyed) return;
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(goodHtml('fixture-build'));
    }, 1000);
    return;
  }
  const assetName = [...runtimeAssets.keys()].find((name) => pathname.endsWith(name));
  if (assetName) {
    const body = corruptBackupAsset && pathname.startsWith('/backup/')
      ? Buffer.from('corrupt fixture asset')
      : runtimeAssets.get(assetName);
    response.writeHead(200, { 'content-type': assetName.endsWith('.css') ? 'text/css' : 'text/javascript' });
    response.end(body);
    return;
  }
  response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  response.end(request.url.startsWith('/backup') ? backupHtml : goodHtml('fixture-build'));
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const env = {
  ...process.env,
  KT_LIVE_URL: `http://127.0.0.1:${port}/primary/`,
  KT_LIVE_BACKUP_URL: `http://127.0.0.1:${port}/backup/`,
  KT_LIVE_ATTEMPTS: '1',
  KT_LIVE_REQUEST_TIMEOUT_MS: '2000',
  KT_EXPECTED_BUILD: 'fixture-build'
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

  env.KT_EXPECTED_BUILD = 'other-build';
  const expectedBuildFailed = await runParity();
  assert.notEqual(expectedBuildFailed.status, 0, 'live verification must reject an unexpected deployment commit');
  assert.match(expectedBuildFailed.stderr, /expected build other-build/);

  env.KT_EXPECTED_BUILD = '';
  backupHtml = goodHtml('different-build');
  const failed = await runParity();
  assert.notEqual(failed.status, 0, 'parity must fail when build markers differ');
  assert.match(failed.stderr, /build marker mismatch/);

  env.KT_EXPECTED_BUILD = 'fixture-build';
  backupHtml = goodHtml('fixture-build');
  corruptBackupAsset = true;
  const assetFailed = await runParity();
  assert.notEqual(assetFailed.status, 0, 'parity must fail when a deployed runtime asset differs from dist');
  assert.match(assetFailed.stderr, /hash mismatch/);

  corruptBackupAsset = false;
  slowPrimary = true;
  env.KT_LIVE_REQUEST_TIMEOUT_MS = '250';
  const startedAt = Date.now();
  const timeoutFailed = await runParity();
  assert.notEqual(timeoutFailed.status, 0, 'live verification must bound an unresponsive deployment request');
  assert.ok(Date.now() - startedAt < 2000, 'request timeout must fail without waiting for the workflow timeout');
  assert.match(timeoutFailed.stderr, /timed out|aborted|TimeoutError/i);
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log('live-site parity fixture OK — matching sites pass; build-marker and runtime-asset drift fail.');
