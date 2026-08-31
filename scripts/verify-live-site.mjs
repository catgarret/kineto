// Verify the public demo after Pages deploy. This intentionally runs outside
// the offline test suite: it checks the actual canonical response after CDN
// propagation, not just the generated `site/` artifact.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const contract = JSON.parse(fs.readFileSync(path.join(root, 'kineto.features.json'), 'utf8'));
const url = process.env.KT_LIVE_URL || packageJson.homepage || 'https://kineto.dongri.me';
const includeBackup = process.argv.includes('--include-backup') || Boolean(process.env.KT_LIVE_BACKUP_URL);
const backupUrl = process.env.KT_LIVE_BACKUP_URL || 'https://git.dongri.me/example/kineto/';
const urls = [url, ...(includeBackup ? [backupUrl] : [])];
const attempts = Math.max(1, Number(process.env.KT_LIVE_ATTEMPTS || 12));
const delayMs = Math.max(250, Number(process.env.KT_LIVE_DELAY_MS || 5000));

const checks = [
  [`version ${packageJson.version}`, (html) => html.includes(`data-kt-version>${packageJson.version}<`)],
  [`module count ${contract.moduleCount}`, (html) => html.includes(`data-kt-module-count>${contract.moduleCount}<`)],
  ['Google Tag Manager', (html) => html.includes('GTM-KFQSFGJL')],
  ['unversioned CDN bundle', (html) => /cdn\.jsdelivr\.net\/npm\/@dong-gri\/kineto\/dist/.test(html) && !/@dong-gri\/kineto@[^/]+/.test(html)]
];

const verifyUrl = async (targetUrl) => {
  let lastError = 'no response';
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(`${targetUrl}${targetUrl.includes('?') ? '&' : '?'}kt-live-check=${Date.now()}`, {
        headers: { 'cache-control': 'no-cache' }
      });
      const html = await response.text();
      const missing = checks.filter(([, check]) => !check(html)).map(([name]) => name);
      const build = html.match(/window\.__KT_BUILD__\s*=\s*["']([^"']+)["']/)?.[1] || '';
      if (response.ok && missing.length === 0 && (!includeBackup || build)) {
        return { url: targetUrl, build };
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
  console.log(`live-site parity OK — ${results.map(({ url: targetUrl, build }) => `${targetUrl} v${packageJson.version}/${contract.moduleCount} build ${build}`).join('; ')}`);
} else {
  console.log(`live-site OK — ${url} serves v${packageJson.version}, ${contract.moduleCount} modules, GTM, and unversioned CDN.`);
}
