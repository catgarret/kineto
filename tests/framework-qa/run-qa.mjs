import { chromium } from 'playwright-core';
import { resolve } from 'node:path';

let browser;
try {
  browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files'] });
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
