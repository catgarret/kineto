import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { renderToString as renderReactToString } from 'react-dom/server';
import { chromium } from 'playwright-core';
import { createSSRApp, h, ref } from 'vue';
import { renderToString as renderVueToString } from '@vue/server-renderer';
import { useKineto as useReactKineto } from '@dong-gri/kineto/react';
import { useKineto as useVueKineto } from '@dong-gri/kineto/vue';

function ReactHydrationHarness() {
  const { ref: element } = useReactKineto('hydrationProbe', { revision: 0 }, [0]);
  return React.createElement('div', { id: 'react-hydration-target', ref: element }, 'React hydration adapter');
}

const VueHydrationHarness = {
  setup() {
    const revision = ref(0);
    const { element } = useVueKineto('hydrationProbe', () => ({ revision: revision.value }), [revision]);
    return () => h('div', { id: 'vue-hydration-target', ref: element }, 'Vue hydration adapter');
  }
};

async function browserPath() {
  if (process.env.MK_CHROMIUM || process.env.KT_CHROME) return process.env.MK_CHROMIUM || process.env.KT_CHROME;
  const corePath = chromium.executablePath();
  if (existsSync(corePath)) return corePath;
  const bundled = await import('playwright').catch(() => null);
  const bundledPath = bundled?.chromium?.executablePath?.();
  return bundledPath && existsSync(bundledPath) ? bundledPath : '/usr/bin/chromium';
}

const reactHtml = renderReactToString(React.createElement(ReactHydrationHarness));
const vueHtml = await renderVueToString(createSSRApp(VueHydrationHarness));
const fixture = `<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="react-hydration-root">${reactHtml}</div><div id="vue-hydration-root">${vueHtml}</div></body></html>`;

let browser;
try {
  browser = await chromium.launch({
    executablePath: await browserPath(),
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files']
  });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.stack || error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      runtimeErrors.push(`${message.type()}: ${message.text()}`);
    }
  });
  await page.setContent(fixture, { waitUntil: 'load' });
  await page.evaluate(() => {
    window.__KINETO_HYDRATION_SSR_NODES__ = {
      react: document.querySelector('#react-hydration-root').firstElementChild,
      vue: document.querySelector('#vue-hydration-root').firstElementChild
    };
  });
  await page.addScriptTag({ path: resolve('dist-iife/hydration-qa.js') });
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrationQaDone === 'true',
    null,
    { timeout: 15000 }
  );
  const report = await page.evaluate(() => window.__KINETO_HYDRATION_QA__);
  assert.deepEqual(runtimeErrors, [], `Hydration runtime warnings/errors:\n${runtimeErrors.join('\n')}`);
  assert.equal(report?.ok, true, report?.error || 'Hydration QA did not return a successful report');
  assert.deepEqual(report.lifecycle.react, { creates: 2, destroys: 2, revisions: [0, 1] });
  assert.deepEqual(report.lifecycle.vue, { creates: 2, destroys: 2, revisions: [0, 1] });
  assert.deepEqual(report.hydrationMessages, []);
  assert.equal(report.instanceCount, 0, 'Hydration QA leaked Kineto instances');
  console.log('framework hydration QA OK — React/Vue reused SSR DOM, hydrated once, updated once, and unmounted with 0 active instances.');
} finally {
  await browser?.close();
}
