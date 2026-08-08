import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

async function browserPath() {
  if (process.env.MK_CHROMIUM || process.env.KT_CHROME) return process.env.MK_CHROMIUM || process.env.KT_CHROME;
  const corePath = chromium.executablePath();
  if (existsSync(corePath)) return corePath;
  // The repository-level Playwright install owns the browser cache in local and
  // CI development runs; keep the fixture's runtime dependency light while
  // still using that verified browser when playwright-core has no local binary.
  const bundled = await import('playwright').catch(() => null);
  const bundledPath = bundled?.chromium?.executablePath?.();
  return bundledPath && existsSync(bundledPath) ? bundledPath : '/usr/bin/chromium';
}

let browser;
try {
  browser = await chromium.launch({ executablePath: await browserPath(), headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.stack || error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  await page.setContent(`<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{min-height:1200px;font-family:sans-serif}#react-root,#vue-root,#jquery-root{min-height:80px;margin:24px}</style></head><body><div id="react-root"></div><div id="vue-root"></div><div id="jquery-root"><div id="jquery-target">jQuery adapter</div></div></body></html>`, { waitUntil: 'load' });
  await page.addStyleTag({ path: resolve('dist-iife/kineto-framework-qa.css') });
  await page.addScriptTag({ path: resolve('dist-iife/framework-qa.js') });
  await page.waitForFunction(() => document.documentElement.dataset.frameworkQaDone === 'true', null, { timeout: 30000 });
  const report = await page.evaluate(() => window.__FRAMEWORK_QA__);
  console.log(JSON.stringify({ report, runtimeErrors: errors }, null, 2));
  if (!report.ok || report.instanceCount !== 0 || errors.length) process.exitCode = 1;
} finally {
  await browser?.close();
}
