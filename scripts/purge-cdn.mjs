// Flush only files that are actually shipped in the npm package. Pages runs
// its co-deployed build, while these aliases serve public CDN consumers.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PURGE_FILES = Object.freeze([
  'kineto.min.js',
  'kineto.umd.cjs',
  'kineto.umd.min.js',
  'kineto.min.css'
]);

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function boundedInteger(value, name, { min, max }) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer from ${min} through ${max}.`);
  }
  return value;
}

async function fetchWithTimeout(fetchImpl, url, milliseconds) {
  const controller = new globalThis.AbortController();
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      const error = new Error(`request timed out after ${milliseconds}ms`);
      controller.abort(error);
      reject(error);
    }, milliseconds);
  });

  try {
    return await Promise.race([
      Promise.resolve().then(() => fetchImpl(url, { signal: controller.signal })),
      timeout
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function purgeAliases({
  fetchImpl = globalThis.fetch,
  baseUrl = 'https://purge.jsdelivr.net/npm/@dong-gri/kineto/dist',
  attempts = 3,
  retryDelay = 500,
  requestTimeout = 10000,
  logger = console
} = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('A fetch implementation is required.');
  boundedInteger(attempts, 'attempts', { min: 1, max: 5 });
  boundedInteger(retryDelay, 'retryDelay', { min: 0, max: 10000 });
  boundedInteger(requestTimeout, 'requestTimeout', { min: 1, max: 60000 });

  const results = [];
  const root = baseUrl.replace(/\/$/, '');

  for (const file of PURGE_FILES) {
    let status = 0;
    let error = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await fetchWithTimeout(fetchImpl, `${root}/${file}`, requestTimeout);
        status = Number(response?.status) || 0;
        if (response.ok) {
          error = null;
          break;
        }
        error = new Error(`HTTP ${status || 'unknown'}`);
      } catch (cause) {
        status = 0;
        error = cause instanceof Error ? cause : new Error(String(cause));
      }

      if (attempt < attempts && retryDelay > 0) await wait(retryDelay * attempt);
    }

    const ok = error === null;
    results.push({ file, ok, status, error: error?.message || null });
    logger[ok ? 'log' : 'warn'](`${ok ? 'OK' : 'FAIL'} ${status || 'ERR'}  ${file}${error ? ` — ${error.message}` : ''}`);
  }

  const failures = results.filter((result) => !result.ok);
  return { ok: results.length - failures.length, total: results.length, failures, results };
}

export async function runPurge(options = {}) {
  const logger = options.logger || console;
  const result = await purgeAliases(options);
  logger.log(`\njsDelivr unversioned purge: ${result.ok}/${result.total} published files flushed.`);
  if (result.failures.length) {
    throw new Error(`jsDelivr purge failed for: ${result.failures.map(({ file }) => file).join(', ')}`);
  }
  logger.log('Public CDN aliases now point at the freshly published package.');
  return result;
}

const isMain = fileURLToPath(import.meta.url) === path.resolve(process.argv[1] || '');
if (isMain) {
  runPurge().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
