// Verify the public demo after Pages deploy. This intentionally runs outside
// the offline test suite: it checks the actual canonical response and deployed
// runtime bytes, not just the generated `site/` artifact.
import fs from 'node:fs';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const url = process.env.KT_LIVE_URL || packageJson.homepage || 'https://kineto.dongri.me';
const includeBackup = process.argv.includes('--include-backup') || Boolean(process.env.KT_LIVE_BACKUP_URL);
const backupUrl = process.env.KT_LIVE_BACKUP_URL || 'https://git.dongri.me/example/kineto/';
const urls = [url, ...(includeBackup ? [backupUrl] : [])];
const boundedEnvironmentInteger = (name, fallback, minimum, maximum) => {
  const parsed = Number(process.env[name] || fallback);
  return Number.isFinite(parsed)
    ? Math.min(maximum, Math.max(minimum, Math.floor(parsed)))
    : fallback;
};
const attempts = boundedEnvironmentInteger('KT_LIVE_ATTEMPTS', 12, 1, 60);
const delayMs = boundedEnvironmentInteger('KT_LIVE_DELAY_MS', 5000, 250, 30000);
const requestTimeoutMs = boundedEnvironmentInteger('KT_LIVE_REQUEST_TIMEOUT_MS', 15000, 250, 60000);
const expectedBuild = String(process.env.KT_EXPECTED_BUILD || '').trim();
const runtimeAssets = [
  { file: 'kineto.umd.min.js', label: 'Kineto UMD runtime' },
  { file: 'kineto.min.css', label: 'Kineto stylesheet' }
].map((asset) => ({
  ...asset,
  sha256: createHash('sha256').update(fs.readFileSync(path.join(root, 'dist', asset.file))).digest('hex')
}));

const checks = [
  [`version ${packageJson.version}`, (html) => html.includes(`data-kt-version>${packageJson.version}<`)],
  [`module count ${contract.moduleCount}`, (html) => html.includes(`data-kt-module-count>${contract.moduleCount}<`)],
  ['Google Tag Manager', (html) => html.includes('GTM-KFQSFGJL')],
  ['co-deployed UMD runtime', (html) => /src="\.\/kineto\.umd\.min\.js\?v=[^"]+"/.test(html)],
  ['co-deployed stylesheet', (html) => /href="\.\/kineto\.min\.css\?v=[^"]+"/.test(html)],
  ['public unversioned CDN install snippet', (html) => /cdn\.jsdelivr\.net\/npm\/@dong-gri\/kineto\/dist/.test(html)]
];

const fetchRuntimeAssets = async (responseUrl) => {
  const baseUrl = new URL('.', responseUrl);
  const verified = [];
  for (const asset of runtimeAssets) {
    const assetUrl = new URL(asset.file, baseUrl);
    assetUrl.searchParams.set('kt-live-asset-check', String(Date.now()));
    const response = await fetch(assetUrl, {
      headers: { 'cache-control': 'no-cache' },
      signal: AbortSignal.timeout(requestTimeoutMs)
    });
    if (!response.ok) throw new Error(`${asset.label} returned ${response.status} ${response.statusText}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    if (sha256 !== asset.sha256) {
      throw new Error(`${asset.label} hash mismatch: live=${sha256} local=${asset.sha256}`);
    }
    verified.push({ file: asset.file, sha256 });
  }
  return verified;
};

const verifyUrl = async (targetUrl) => {
  let lastError = 'no response';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${targetUrl}${targetUrl.includes('?') ? '&' : '?'}kt-live-check=${Date.now()}`, {
        headers: { 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(requestTimeoutMs)
      });
      const html = await response.text();
      const missing = checks.filter(([, check]) => !check(html)).map(([name]) => name);
      const build = html.match(/window\.__KT_BUILD__\s*=\s*["']([^"']+)["']/)?.[1] || '';
      const expectedBuildMatches = !expectedBuild
        || build === expectedBuild
        || (build && expectedBuild.startsWith(build));
      if (!expectedBuildMatches) missing.push(`expected build ${expectedBuild.slice(0, 12)}`);
      if (response.ok && missing.length === 0 && (!includeBackup || build)) {
        const assets = await fetchRuntimeAssets(response.url);
        return { url: targetUrl, build, assets };
      }
      if (response.ok && missing.length === 0 && includeBackup && !build) {
        missing.push('build marker');
      }
      lastError = `${response.status} ${response.statusText}; missing: ${missing.join(', ') || 'none'}`;
    } catch (error) {
      lastError = error?.message || String(error);
    }
    if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`${targetUrl} did not serve the expected release after ${attempts} attempts: ${lastError}`);
};

const results = [];
for (const targetUrl of urls) {
  try {
    results.push(await verifyUrl(targetUrl));
  } catch (error) {
    console.error(`live-site FAIL — ${error?.message || String(error)}`);
    process.exit(1);
  }
}

if (includeBackup && results[0].build !== results[1].build) {
  console.error(`live-site FAIL — build marker mismatch: ${results[0].url}=${results[0].build}, ${results[1].url}=${results[1].build}`);
  process.exit(1);
}

if (includeBackup) {
  const runtimeHash = results[0].assets[0].sha256.slice(0, 12);
  console.log(`live-site parity OK — ${results.map(({ url: targetUrl, build }) => `${targetUrl} v${packageJson.version}/${contract.moduleCount} build ${build}`).join('; ')}; runtime ${runtimeHash}`);
} else {
  console.log(`live-site OK — ${url} serves v${packageJson.version}, ${contract.moduleCount} modules, GTM, build ${results[0].build || 'unmarked'}, and byte-matched runtime assets.`);
}
