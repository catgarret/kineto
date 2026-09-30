// Text and number entrances inside a panel that opens and closes (a tab, an
// accordion, a dialog) play when the panel opens: the first time with the
// default once:true, every time with once:false.
//
// The failures this guards (see panelGate in src/utils.js): ScrollTrigger
// measures an element in a closed panel as a 0×0 box at the top of the
// viewport, so a Counter in a closed tab counted while nobody could see it
// (3454 of 5000 by the time the tab opened), and a once:false Text Split did
// not replay when its panel reopened. Blur Text and Text Split usually sit on
// an inline <span>, which ResizeObserver reports as 0×0 either way, so a panel
// opening around one went unnoticed until the nearest block ancestor was
// watched as well. Reveal on an inline element is here for the same reason
// (tests/browser/reveal-panel-reopen.mjs covers its paths on blocks).
//
// "Played" is measured, not assumed: every frame after the panel opens, each
// element's text and the opacity/filter/transform of it and its descendants
// are fingerprinted. An entrance must produce at least a start, a middle and
// an end (three distinct frames — WebKit's first frames after load can be few,
// so this counts states, not frame rate); one that must not replay produces
// exactly one. A counter must also wait at 0 while its panel is closed.
//
// Run: npm run build && node tests/browser/panel-entrances.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const engine = ['gsap.min.js', 'ScrollTrigger.min.js'].map((file) => fs.readFileSync(path.join(root, 'node_modules/gsap/dist', file), 'utf8'));
const runtime = fs.readFileSync(path.join(root, 'dist/kineto.umd.js'), 'utf8');

// id → [markup, replays]: `replays` is whether reopening must play it again.
const CASES = {
  blurOnce: ['<span data-kt-blur-text>Hello panel world</span>', false],
  blurRepeat: ['<span data-kt-blur-text data-kt-once="false">Hello panel world</span>', true],
  splitOnce: ['<span data-kt-text-split>Hello panel world</span>', false],
  splitRepeat: ['<span data-kt-text-split data-kt-once="false">Hello panel world</span>', true],
  counterOnce: ['<div data-kt-counter="plain" data-kt-to="5000" data-kt-duration="0.8">0</div>', false],
  counterRepeat: ['<div data-kt-counter="plain" data-kt-to="5000" data-kt-duration="0.8" data-kt-once="false">0</div>', true],
  slotRepeat: ['<div data-kt-counter="slot" data-kt-to="5000" data-kt-duration="0.8" data-kt-once="false">0</div>', true],
  revealInline: ['<span data-kt-reveal="fade-up" data-kt-once="false" data-kt-duration="0.5">inline reveal</span>', true]
};
// Without GSAP, Counter shows its final value and Text Split and Blur Text's
// once:false are GSAP features, so only the inline Reveal runs there.
const NATIVE = ['revealInline'];
const MIN_FRAMES = 3;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] }
  : { headless: true });

const run = async (ids, withEngine) => {
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route(/^https?:\/\//, (route) => route.abort());
  const panels = ids.map((id) => `<div class="panel" id="p-${id}" hidden><div id="${id}">${CASES[id][0]}</div></div>`).join('');
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;font:20px system-ui} main{display:grid;grid-template-columns:repeat(4,250px);gap:12px;padding:12px}
    .panel{height:90px} .panel[hidden]{display:none}
  </style></head><body><main>${panels}</main></body></html>`);
  if (withEngine) for (const content of engine) await page.addScriptTag({ content });
  await page.addScriptTag({ content: runtime });
  const result = await page.evaluate(async (ids) => {
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    window.Kineto.init(document);
    const createdBy = performance.now() + 5000;
    while (window.Kineto.instanceCount < ids.length && performance.now() < createdBy) await frame();
    for (let index = 0; index < 15; index += 1) await frame();
    const fingerprint = (el) => [el, ...el.querySelectorAll('*')]
      .map((node) => { const style = getComputedStyle(node); return `${style.opacity}|${style.filter}|${style.transform}`; })
      .join(';') + `#${el.textContent}`;
    const hosts = ids.map((id) => document.getElementById(id));
    const textWhileClosed = hosts.map((host) => host.textContent.trim());
    // All panels open together (they are independent; the watch is real time).
    const watch = async () => {
      ids.forEach((id) => { document.getElementById(`p-${id}`).hidden = false; });
      const frames = hosts.map(() => new Set());
      const openedAt = performance.now();
      while (performance.now() - openedAt < 1600) {
        await frame();
        hosts.forEach((host, index) => frames[index].add(fingerprint(host)));
      }
      return frames.map((set) => set.size);
    };
    const first = await watch();
    ids.forEach((id) => { document.getElementById(`p-${id}`).hidden = true; });
    for (let index = 0; index < 20; index += 1) await frame();
    const again = await watch();
    return {
      engine: Boolean(window.gsap && window.ScrollTrigger),
      created: window.Kineto.instanceCount,
      rows: Object.fromEntries(ids.map((id, index) => [id, {
        closed: textWhileClosed[index], first: first[index], again: again[index], text: hosts[index].textContent.trim()
      }]))
    };
  }, ids);
  await page.close();
  return { result, errors };
};

const problems = [];
for (const [label, withEngine, ids] of [['gsap', true, Object.keys(CASES)], ['native', false, NATIVE]]) {
  const { result, errors } = await run(ids, withEngine);
  const fail = (message) => problems.push(`${label}: ${message}`);
  if (errors.length) fail(`page errors: ${errors.join(' | ')}`);
  if (result.engine !== withEngine) fail(`the ${label} path did not run`);
  if (result.created !== ids.length) fail(`${result.created} of ${ids.length} instances were created in their closed panels`);
  for (const id of ids) {
    const row = result.rows[id];
    const replays = CASES[id][1];
    if (row.first < MIN_FRAMES) fail(`${id} did not play its entrance when its panel first opened ${JSON.stringify(row)}`);
    if (replays && row.again < MIN_FRAMES) fail(`${id} (once:false) did not play its entrance again when its panel reopened ${JSON.stringify(row)}`);
    if (!replays && row.again !== 1) fail(`${id} (once:true) replayed when its panel reopened ${JSON.stringify(row)}`);
    if (id.startsWith('counter') && (row.closed !== '0' || row.text !== '5000')) fail(`${id} must wait at 0 while closed and land on 5000 ${JSON.stringify(row)}`);
  }
}
assert.deepEqual(problems, [], `entrances in a panel that opens and closes (${browserName}):\n${problems.join('\n')}`);

await browser.close();
console.log(`panel-entrances OK (${browserName}) — Blur Text, Text Split, Counter (plain, slot) and an inline Reveal play when their panel opens, once:false ones again on every reopen, once:true ones only the first time; a closed counter waits at 0.`);
