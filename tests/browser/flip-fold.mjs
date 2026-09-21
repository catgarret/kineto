// FLIP's `fold` — the hand-over a folding screen makes when it opens.
//
// What separates it from `crossfade` is one thing: the middle of the change is
// SOFT. Two layouts dissolving through each other still read as two pictures
// swapping; blurring them as they pass reads as one surface being re-formed,
// which is the whole reason the effect exists. So the test is not "does an
// animation run" — it is "is there blur in the middle and none at either end",
// measured from the animations the browser is actually playing.
//
// The other half of the claim is that the OLD layout holds its place in space
// while the new one is built around it. That is the ghost: a pinned copy of the
// item at its old box, which has to be there during the change and gone after.
// Run: npm run build && node tests/browser/flip-fold.mjs
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName] || chromium;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const FIXTURE = '/__fold__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;background:#101318;color:#fff;font:13px system-ui}
  .panel{display:grid;grid-template-columns:repeat(2,90px);gap:10px;padding:20px}
  .panel.open{grid-template-columns:repeat(3,120px)}
  .tile{height:70px;background:#2a2f3a;border-radius:12px}
  .panel.open .tile{height:96px}
</style></head><body><main></main><script src="/dist/kineto.umd.js"></script></body></html>`;
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  if (pathname === FIXTURE) {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(fixtureHtml());
    return;
  }
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await browserType.launch({
  headless: true,
  ...(browserName === 'chromium' && process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}),
  args: browserName === 'chromium' ? ['--no-sandbox', '--disable-gpu'] : []
});
const page = await browser.newPage({ viewport: { width: 700, height: 420 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

const report = await page.evaluate(async () => {
  const { Kineto } = window;
  const tiles = Array.from({ length: 6 }, () => '<span class="tile"></span>').join('');
  document.querySelector('main').innerHTML =
    `<div class="panel" id="fold" data-kt-flip data-kt-mode="fold" data-kt-duration="0.6" data-kt-fold-blur="14" data-kt-watch="false">${tiles}</div>`
    + `<div class="panel" id="plain" data-kt-flip data-kt-mode="crossfade" data-kt-duration="0.6" data-kt-watch="false">${tiles}</div>`;
  Kineto.init();

  const open = (id) => {
    const panel = document.getElementById(id);
    const instance = Kineto.getInstance(panel, 'flip');
    instance.record();
    panel.classList.add('open');
    instance.play();
    return panel;
  };
  // Read the keyframes the browser is actually playing, not the ones we asked
  // for: a mode that quietly fell through to `slide` would have neither ghosts
  // nor a blur, and both are visible here.
  const framesOf = (panel) => panel.getAnimations({ subtree: true })
    .map((animation) => (animation.effect?.getKeyframes?.() || []).map((frame) => frame.filter || 'none'));

  const foldPanel = open('fold');
  const plainPanel = open('plain');
  const foldFrames = framesOf(foldPanel);
  const ghostsDuring = document.querySelectorAll('body > .tile[aria-hidden="true"]').length;
  const ghostFrames = Array.from(document.querySelectorAll('body > .tile[aria-hidden="true"]'))
    .flatMap((ghost) => (ghost.getAnimations()[0]?.effect?.getKeyframes?.() || []).map((frame) => frame.filter || 'none'));
  const plainFrames = framesOf(plainPanel);

  await new Promise((resolve) => setTimeout(resolve, 1200));
  return {
    ghostsDuring,
    ghostsAfter: document.querySelectorAll('body > .tile[aria-hidden="true"]').length,
    // The soft middle is made by the PAIR: the arriving layout comes in
    // blurred and sharpens, while the pinned copy of the old one fades out
    // going the other way. So the incoming half is blur → sharp…
    foldArrivesSoft: foldFrames.filter((frames) => frames.length >= 2
      && /blur\(1[0-9]px\)/.test(frames[0])
      && /blur\(0px\)/.test(frames[frames.length - 1])).length,
    foldAnimated: foldFrames.length,
    ghostBlurs: ghostFrames.filter((value) => /blur\(1[0-9]px\)/.test(value)).length,
    // crossfade is the control: same dissolve, no blur anywhere.
    plainBlurs: plainFrames.flat().filter((value) => /blur\([1-9]/.test(value)).length,
    plainAnimated: plainFrames.length
  };
});

assert.deepEqual(errors, [], 'fold must not raise page errors');
assert.ok(report.foldAnimated >= 6, `every tile must take part, ${report.foldAnimated} animated`);
assert.ok(
  report.foldArrivesSoft >= 6,
  `every arriving tile must come in blurred and sharpen — ${report.foldArrivesSoft} of ${report.foldAnimated} did`
);
assert.ok(report.ghostsDuring >= 6, `the old layout must hold its place while the new one arrives, ${report.ghostsDuring} ghosts`);
// …and the outgoing half is sharp → blur, which is the other side of the same
// soft moment. A fade alone would leave both halves crisp all the way through.
assert.ok(report.ghostBlurs >= 6, 'the outgoing layout must blur as it goes, not just fade');
assert.equal(report.ghostsAfter, 0, 'the pinned copies must be gone once the change is over');
// The control: if `fold` were quietly behaving like `crossfade`, the assertions
// above would still pass on a build where the blur was dropped — unless the
// difference between the two is itself checked.
assert.ok(report.plainAnimated >= 6, 'the crossfade control must animate too');
assert.equal(report.plainBlurs, 0, 'crossfade must stay sharp — that is what fold is different from');

await page.close();
await browser.close();
server.close();
console.log(`flip-fold OK (${browserName}) — ${report.foldArrivesSoft} tiles arriving blurred and sharpening, ${report.ghostsDuring} pinned copies holding the old layout and none left behind, and crossfade still sharp for contrast.`);
