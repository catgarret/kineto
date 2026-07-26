import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { killBrowserServer } from './browser-cleanup.mjs';
import { runAnimatedMediaQa } from './animated-media-helper.mjs';

const root = resolve(import.meta.dirname, '..');
let browserServer;
let browser;
let passed = false;
try {
  browserServer = await chromium.launchServer({
    ...(process.env.MK_CHROMIUM ? { executablePath: process.env.MK_CHROMIUM } : {}),
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required']
  });
  browser = await chromium.connect(browserServer.wsEndpoint());
  await runAnimatedMediaQa(browser, root);
  console.log('Animated media QA OK: GIF, animated WebP, APNG and video ambient remain live.');
  passed = true;
} finally {
  killBrowserServer(browserServer);
  await new Promise((resolveCleanup) => setTimeout(resolveCleanup, 250));
  if (passed) process.reallyExit(0);
}
