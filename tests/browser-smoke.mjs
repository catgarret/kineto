import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'vite';
import { chromium, firefox, webkit } from 'playwright';
import { killBrowserServer } from './browser-cleanup.mjs';

const root = resolve(import.meta.dirname, '..');
const contract = JSON.parse(await readFile(resolve(root, 'kineto.features.json'), 'utf8'));
const contractModules = contract.modules.map(({ name }) => name).sort();
const outDir = resolve(import.meta.dirname, '.smoke');
await mkdir(outDir, { recursive: true });
await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    outDir,
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'browser-smoke-page.js'),
      name: 'KinetoSmoke',
      formats: ['iife'],
      fileName: () => 'browser-smoke.js'
    },
  }
});

const fixtureHtml = `<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{min-height:3000px}.fixture{width:240px;min-height:60px;margin:12px}.kt-slider-wrap{width:240px;overflow:hidden}.kt-slider-track{display:flex}.kt-slide{position:relative;min-width:240px}#sticky>div{height:40px}</style></head><body><main id="fixtures"></main></body></html>`;

let browserServer;
let browser;
let passed = false;
try {
  const browserName = process.env.KT_BROWSER || 'chromium';
  const browserType = { chromium, firefox, webkit }[browserName];
  assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);
  browserServer = await browserType.launchServer({
    ...(browserName === 'chromium' && process.env.MK_CHROMIUM ? { executablePath: process.env.MK_CHROMIUM } : {}),
    headless: true,
    ...(browserName === 'chromium' ? { args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'] } : {})
  });
  // A BrowserServer endpoint must be connected through the same engine that
  // created it; Chromium's protocol client cannot attach to Firefox/WebKit.
  browser = await browserType.connect(browserServer.wsEndpoint());
  const page = await browser.newPage({ reducedMotion: 'no-preference' });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.stack || error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  await page.setContent(fixtureHtml, { waitUntil: 'load' });
  await page.addStyleTag({ path: resolve(outDir, 'kineto.css') });
  await page.addScriptTag({ path: resolve(outDir, 'browser-smoke.js') });
  await page.waitForFunction(() => document.documentElement.dataset.smokeDone === 'true', null, { timeout: 15000 });
  const result = await page.evaluate(() => window.__MK_SMOKE__);
  assert.deepEqual(runtimeErrors, [], `Browser runtime errors:\n${runtimeErrors.join('\n')}`);
  assert.equal(result.ok, true, `Smoke failures:\n${result.errors.join('\n')}`);
  assert.deepEqual(result.registry, contractModules, 'source registry does not match the public module contract');
  assert.deepEqual(result.exercised, contractModules, 'cross-browser smoke did not exercise every public module');
  assert.equal(Object.keys(result.results).length, contract.moduleCount, 'cross-browser smoke module count is stale');
  assert.equal(result.instanceCount, 0, 'Kineto leaked active instances');

  await page.addScriptTag({ path: resolve(root, 'dist/kineto.umd.js') });
  const umd = await page.evaluate(() => ({
    version: window.Kineto?.version,
    modules: Object.keys(window.Kineto?.registry || {}).length,
    autoInit: typeof window.Kineto?.autoInit
  }));
  assert.deepEqual(umd, { version: contract.libraryVersion, modules: contract.moduleCount, autoInit: 'function' }, 'UMD global surface is invalid');
  assert.deepEqual(runtimeErrors, [], `UMD runtime errors:
${runtimeErrors.join('\n')}`);
  console.log(`Browser smoke OK: all ${contract.moduleCount} modules exercised in ${browserName}; UMD global verified.`);
  passed = true;
} finally {
  killBrowserServer(browserServer);
  await new Promise((resolveCleanup) => setTimeout(resolveCleanup, 250));
  if (passed) process.reallyExit(0);
}
