// Core loader lifecycle checks in real Chromium: RAF/onProgress stop after
// completion, instanceCount returns, reduced-motion onComplete fires once,
// idempotent destroy. Drives window.Kineto.loader directly on the built UMD.
// Run: LD_LIBRARY_PATH=/tmp/xstub node tests/browser/loader-core.mjs
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.KT_CHROME || undefined; // portable: normal 'npx playwright install' needs no path
const server = http.createServer((req, res) => {
  const fp = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(fp, (err, buf) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': req.url.endsWith('.js') ? 'text/javascript' : 'text/html' }); res.end(buf); });
});
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;
const HTML = `<!doctype html><html><head></head><body><script src="http://localhost:${PORT}/dist/kineto.umd.js"></script></body></html>`;

const browser = await chromium.launch({ headless: true, ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox','--disable-gpu'] });
let pass = 0, fail = 0;
const check = (n, c, d) => { console.log(`  [${c ? 'PASS' : 'FAIL'}] ${n}${d ? ' — ' + d : ''}`); c ? pass++ : fail++; };

// ---- 1. Normal loader: RAF/onProgress stop after completion; instanceCount returns ----
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
  await page.setContent(HTML, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.Kineto);
  const r = await page.evaluate(async () => {
    const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(el);
    window.__prog = 0;
    const base = window.Kineto.instanceCount;
    const inst = window.Kineto.loader(el, { type: 'bar', minDuration: 200, duration: 0.2, completeHold: 60, hideScrollbar: false, onProgress: () => { window.__prog++; } });
    const created = window.Kineto.instanceCount;
    inst.setProgress(50); inst.setProgress(100); // -> complete()
    await new Promise((res) => setTimeout(res, 900)); // let exit finish (minDuration+hold+exit+buffer)
    const progAfterComplete = window.__prog;
    const display1 = getComputedStyle(el).display;
    await new Promise((res) => setTimeout(res, 1000)); // 1s more — RAF must be dead
    const progLater = window.__prog;
    inst.destroy();
    const afterDestroy = window.Kineto.instanceCount;
    // idempotent: second destroy must not throw
    let threw = false; try { inst.destroy(); } catch (e) { threw = true; }
    return { base, created, progAfterComplete, progLater, display1, afterDestroy, threw };
  });
  console.log('  normal:', JSON.stringify(r));
  check('overlay hidden after complete', r.display1 === 'none', `display=${r.display1}`);
  check('onProgress stops after completion (no increase over 1s)', r.progLater === r.progAfterComplete, `${r.progAfterComplete} -> ${r.progLater}`);
  check('instanceCount returns to baseline after destroy', r.afterDestroy === r.base, `${r.base} -> ${r.created} -> ${r.afterDestroy}`);
  check('destroy() is idempotent (no throw on 2nd call)', r.threw === false);
  await ctx.close();
}

// ---- 2. reduced-motion: onComplete fires exactly once, async ----
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.setContent(HTML, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.Kineto);
  const r = await page.evaluate(async () => {
    const el = document.createElement('div'); document.body.appendChild(el);
    let calls = 0;
    const inst = window.Kineto.loader(el, { type: 'bar', onComplete: () => { calls++; } });
    const immediate = calls; // must be 0 synchronously (async contract)
    await new Promise((res) => setTimeout(res, 100));
    return { immediate, calls, display: getComputedStyle(el).display };
  });
  console.log('  reduced-motion:', JSON.stringify(r));
  check('reduced-motion hides loader', r.display === 'none', `display=${r.display}`);
  check('reduced-motion onComplete fires exactly once', r.calls === 1, `calls=${r.calls}`);
  check('reduced-motion onComplete is async (0 synchronously)', r.immediate === 0, `immediate=${r.immediate}`);
  await ctx.close();
}

// ---- 3. Overlapping hideScrollbar:true loaders: lock released once, page unlocked ----
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setContent(HTML, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.Kineto);
  const r = await page.evaluate(async () => {
    const before = { body: document.body.style.overflow, html: document.documentElement.style.overflow };
    const mk = () => { const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(el); return window.Kineto.loader(el, { type: 'bar', minDuration: 100, duration: 0.15, completeHold: 40, hideScrollbar: true }); };
    const a = mk(); const b = mk();
    const during = { body: document.body.style.overflow, html: document.documentElement.style.overflow };
    a.complete(); b.complete();
    await new Promise((res) => setTimeout(res, 700));
    const after = { body: document.body.style.overflow, html: document.documentElement.style.overflow };
    return { before, during, after };
  });
  console.log('  overlap lock:', JSON.stringify(r));
  check('two hideScrollbar loaders lock during', r.during.body === 'hidden' && r.during.html === 'hidden', JSON.stringify(r.during));
  check('overlapping loaders fully unlock after (no permanent lock)', r.after.body === r.before.body && r.after.html === r.before.html, `${JSON.stringify(r.before)} -> ${JSON.stringify(r.after)}`);
  await ctx.close();
}

await browser.close();
server.close();
console.log(`\n===== CORE RESULT: ${pass} passed, ${fail} failed =====`);
process.exit(fail ? 1 : 0);
