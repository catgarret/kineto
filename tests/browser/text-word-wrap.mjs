// Split text must wrap between words, never inside one.
//
// Every character-animating module turns each glyph into its own inline-block
// so it can move on its own — and a browser may wrap a line between ANY two
// inline-blocks. The demo showed it: Text Reveal's Flicker card rendered
// "SELECT YOUR PLATFORM" as "SELECT YOU / R PLATFORM". The fix is one shared
// helper (utils.wordSink) that puts each run of characters in a nowrap word
// box, so the whitespace between words is the only place a line can break.
//
// This test measures it the only way that means anything: lay each module's
// output out in a column too narrow for the whole line, then check that every
// character of every word sits on the same line box as that word's first
// character. It also checks that the text still wraps at all — a fix that
// simply stopped wrapping would pass the first check and overflow the column.
//
// Run: npm run build && node tests/browser/text-word-wrap.mjs
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
const FIXTURE = '/__wordwrap__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;padding:24px;background:#111;color:#fff;font:700 28px/1.3 system-ui}
  .col{width:230px;margin:0 0 28px;letter-spacing:.12em}
</style></head><body><main></main>
<script src="/node_modules/gsap/dist/gsap.min.js"></script>
<script src="/node_modules/gsap/dist/ScrollTrigger.min.js"></script>
<script src="/dist/kineto.umd.js"></script></body></html>`;
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
const page = await browser.newPage({ viewport: { width: 700, height: 1400 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });

const TEXT = 'SELECT YOUR PLATFORM AND SHIP IT';
const CASES = [
  ['textReveal stream (char)', `data-kt-text-reveal="stream" data-kt-by="char"`],
  ['textReveal bounce', `data-kt-text-reveal="bounce"`],
  ['textReveal flicker', `data-kt-text-reveal="flicker" data-kt-duration="0.2"`],
  ['textReveal shuffle', `data-kt-text-reveal="shuffle"`],
  ['textReveal decode', `data-kt-text-reveal="decode"`],
  ['blurText', `data-kt-blur-text`],
  ['textSplit', `data-kt-text-split`],
  ['textFill', `data-kt-text-fill`]
];

await page.evaluate(({ cases, text }) => {
  window.Kineto.config?.({ smooth: false });
  document.querySelector('main').innerHTML = cases
    .map(([label, attrs], index) => `<div class="col" id="c${index}" data-label="${label}" ${attrs}>${text}</div>`)
    .join('');
  window.Kineto.init();
}, { cases: CASES, text: TEXT });
await page.waitForTimeout(1600);

const report = await page.evaluate(() => [...document.querySelectorAll('.col')].map((col) => {
  const words = [...col.querySelectorAll('.kt-text-word')];
  // A word box holds characters (or a character's clip wrapper). Every one of
  // them has to share the first one's line.
  // offsetTop is the LAYOUT position — it ignores transforms, so a glyph still
  // bouncing into place 20px low does not read as having wrapped.
  const split = words.filter((word) => {
    const glyphs = [...word.children].filter((child) => child.offsetWidth > 0);
    if (glyphs.length < 2) return false;
    const top = glyphs[0].offsetTop;
    return glyphs.some((glyph) => Math.abs(glyph.offsetTop - top) > 3);
  }).map((word) => word.textContent);
  const lineTops = new Set(words.map((word) => word.firstElementChild?.offsetTop ?? 0));
  // Laid out past the column, not painted past it: Shuffle deliberately locks
  // each cell to its final width while wider scramble glyphs flash through it,
  // and that ink may overhang for a frame without the LINE being too long.
  const right = col.getBoundingClientRect().right;
  return {
    label: col.dataset.label,
    words: words.length,
    split,
    lines: lineTops.size,
    overflows: words.some((word) => word.getBoundingClientRect().right > right + 2)
  };
}));

assert.deepEqual(errors, [], 'no module may raise a page error');
for (const row of report) {
  assert.ok(row.words >= 5, `${row.label}: the text must be split into word boxes, found ${row.words}`);
  assert.deepEqual(row.split, [], `${row.label}: a word was broken across two lines: ${row.split.join(', ')}`);
  assert.ok(row.lines >= 2, `${row.label}: the text must still wrap — a column this narrow cannot hold it on one line`);
  assert.equal(row.overflows, false, `${row.label}: no word may push past the column`);
}

// And destroy() takes the word boxes with it.
const left = await page.evaluate(() => {
  document.querySelectorAll('.col').forEach((col) => {
    Object.keys(window.Kineto.registry).forEach((name) => window.Kineto.destroyModule(col, name));
  });
  return document.querySelectorAll('.kt-text-word').length;
});
assert.equal(left, 0, 'destroy() must remove the word boxes it created');

await page.close();
await browser.close();
server.close();
console.log(`text-word-wrap OK (${browserName}) — ${report.length} splitters wrap only between words, still wrap in a narrow column, and clean up on destroy.`);
