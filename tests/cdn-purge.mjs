import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PURGE_FILES, purgeAliases, runPurge } from '../scripts/purge-cdn.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const publishedRootFiles = packageJson.files
  .filter((file) => /^dist\/[^/]+\.[^/]+$/.test(file))
  .map((file) => path.basename(file));

assert.deepEqual(PURGE_FILES, [
  'kineto.min.js',
  'kineto.umd.cjs',
  'kineto.umd.min.js',
  'kineto.min.css'
]);
assert.deepEqual(PURGE_FILES, publishedRootFiles, 'purge aliases must exactly match npm-published root dist files');

const calls = [];
const success = await purgeAliases({
  baseUrl: 'https://purge.example.test/dist/',
  attempts: 2,
  retryDelay: 0,
  logger: { log() {}, warn() {} },
  fetchImpl: async (url) => {
    calls.push(url);
    return { ok: true, status: 200 };
  }
});

assert.equal(success.ok, 4);
assert.equal(success.total, 4);
assert.deepEqual(calls, PURGE_FILES.map((file) => `https://purge.example.test/dist/${file}`));

let transientAttempts = 0;
const partial = await purgeAliases({
  attempts: 2,
  retryDelay: 0,
  logger: { log() {}, warn() {} },
  fetchImpl: async (url) => {
    if (url.endsWith('/kineto.min.js') && transientAttempts++ === 0) return { ok: false, status: 503 };
    if (url.endsWith('/kineto.min.css')) throw new Error('network unavailable');
    return { ok: true, status: 200 };
  }
});

assert.equal(transientAttempts, 2, 'transient failures must be retried');
assert.equal(partial.ok, 3);
assert.equal(partial.failures.length, 1);
assert.equal(partial.failures[0].file, 'kineto.min.css');
assert.equal(partial.failures[0].error, 'network unavailable');

await assert.rejects(
  runPurge({
    attempts: 1,
    retryDelay: 0,
    logger: { log() {}, warn() {} },
    fetchImpl: async (url) => url.endsWith('/kineto.min.css')
      ? { ok: false, status: 503 }
      : { ok: true, status: 200 }
  }),
  /jsDelivr purge failed for: kineto\.min\.css/,
  'a partial purge failure must reject the CLI operation'
);

let timeoutCalls = 0;
const timedOut = await purgeAliases({
  attempts: 1,
  retryDelay: 0,
  requestTimeout: 5,
  logger: { log() {}, warn() {} },
  fetchImpl: async () => {
    timeoutCalls += 1;
    return new Promise(() => {});
  }
});
assert.equal(timeoutCalls, PURGE_FILES.length);
assert.equal(timedOut.failures.length, PURGE_FILES.length);
assert.match(timedOut.failures[0].error, /request timed out after 5ms/);

await assert.rejects(purgeAliases({ attempts: 0 }), /attempts must be an integer from 1 through 5/);
await assert.rejects(purgeAliases({ attempts: 6 }), /attempts must be an integer from 1 through 5/);
await assert.rejects(purgeAliases({ retryDelay: -1 }), /retryDelay must be an integer from 0 through 10000/);
await assert.rejects(purgeAliases({ requestTimeout: 0 }), /requestTimeout must be an integer from 1 through 60000/);

console.log('cdn-purge OK — exact published aliases, bounded attempts/timeouts, fatal partial failure.');
