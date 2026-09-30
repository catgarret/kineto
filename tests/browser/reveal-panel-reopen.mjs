// Reveal inside a panel that opens and closes (a tab, an accordion, a dialog)
// plays its entrance when the panel opens — every time with once:false, the
// first time only with once:true — with GSAP and without it.
//
// The failure this guards: ScrollTrigger measures an element in a closed panel
// (display:none) as a 0×0 box at the top of the viewport. Its trigger could
// fire while nobody could see the element, and nothing played the entrance
// when the panel opened. The Bootstrap example showed it: the second time a
// FAQ answer or the offer dialog opened (both once:false), the content simply
// appeared, with no entrance at all.
//
// Each engine runs the four Reveal paths that decide "in view" differently:
// the GSAP tween (fade-up), the clip/progress path (wipe), the class-only path
// and the default once:true entrance. `native` blocks GSAP's CDN, so the same
// markup runs without an animation engine.
//
// Run: npm run build && node tests/browser/reveal-panel-reopen.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

// The engines come from the repository's pinned devDependencies, added as page
// globals (Kineto uses a page's own GSAP when it has one).
const engine = ['gsap.min.js', 'ScrollTrigger.min.js'].map((file) => fs.readFileSync(path.join(root, 'node_modules/gsap/dist', file), 'utf8'));
const runtime = fs.readFileSync(path.join(root, 'dist/kineto.umd.js'), 'utf8');

const markup = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;font:14px system-ui} main{padding:20px;display:grid;grid-template-columns:repeat(2,300px);gap:20px}
  .panel{height:140px} .panel[hidden]{display:none}
  .box{height:120px;background:#c33;color:#fff}
  .box.is-inview{outline:4px solid #000}
</style></head><body><main>
  <div class="panel" id="p-tween" hidden><div class="box" id="tween" data-kt-reveal="fade-up" data-kt-once="false" data-kt-duration="0.5">tween</div></div>
  <div class="panel" id="p-wipe" hidden><div class="box" id="wipe" data-kt-reveal="wipe" data-kt-once="false" data-kt-duration="0.5">wipe</div></div>
  <div class="panel" id="p-class" hidden><div class="box" id="class" data-kt-reveal="class" data-kt-once="false">class</div></div>
  <div class="panel" id="p-once" hidden><div class="box" id="once" data-kt-reveal="fade-up" data-kt-duration="0.5">once</div></div>
</main></body></html>`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] }
  : { headless: true });

const run = async (withEngine) => {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 }, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Nothing leaves the page: without the local engine the CDN load fails, as offline.
  await page.route(/^https?:\/\//, (route) => route.abort());
  await page.setContent(markup);
  if (withEngine) for (const content of engine) await page.addScriptTag({ content });
  await page.addScriptTag({ content: runtime });

  const result = await page.evaluate(async () => {
    const { Kineto } = window;
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    const ids = ['tween', 'wipe', 'class', 'once'];
    Kineto.init(document);
    const createdBy = performance.now() + 5000;
    while (Kineto.instanceCount < ids.length && performance.now() < createdBy) await frame();
    for (let index = 0; index < 10; index += 1) await frame();

    // How "shown" an element is: 0 = entrance start, 1 = fully in.
    const shown = (el) => {
      const style = getComputedStyle(el);
      if (el.id === 'class') return el.classList.contains("is-inview") ? 1 : 0;
      if (el.id === 'wipe') {
        const inset = style.clipPath.match(/inset\(([^)]*)\)/);
        if (!inset) return 1;
        const hidden = Math.max(...inset[1].split(/\s+/).map((value) => Number.parseFloat(value) || 0));
        return 1 - hidden / 100;
      }
      return Number(style.opacity);
    };
    // Opens every panel at once (they are independent, and the watch is real
    // time) and follows each element for up to 2 s: did it start from (near)
    // its entrance start, and did it end fully in? A motion is judged from the
    // first painted frame, so it must visibly move. The class is judged from
    // the moment before the panel opens: off then, on once the element is on
    // screen (the CSS transition is the page's own).
    const openAll = async () => {
      const els = ids.map((id) => document.getElementById(id));
      const before = els.map(shown);
      ids.forEach((id) => { document.getElementById(`p-${id}`).hidden = false; });
      await frame();
      const lowest = els.map((el, index) => (el.id === 'class' ? Math.min(before[index], shown(el)) : shown(el)));
      const openedAt = performance.now();
      while (performance.now() - openedAt < 2000) {
        await frame();
        els.forEach((el, index) => { lowest[index] = Math.min(lowest[index], shown(el)); });
        if (els.every((el) => shown(el) >= 0.999) && performance.now() - openedAt > 700) break;
      }
      return els.map((el, index) => ({ lowest: Math.round(lowest[index] * 100) / 100, final: Math.round(shown(el) * 100) / 100 }));
    };
    const closeAll = async () => {
      ids.forEach((id) => { document.getElementById(`p-${id}`).hidden = true; });
      for (let index = 0; index < 20; index += 1) await frame();
    };

    const out = { engine: Boolean(window.gsap && window.ScrollTrigger), created: Kineto.instanceCount };
    const first = await openAll();
    await closeAll();
    const again = await openAll();
    ids.forEach((id, index) => {
      out[`${id}:first`] = first[index];
      out[`${id}:again`] = again[index];
    });
    return out;
  });
  await page.close();
  return { result, errors };
};

const problems = [];
const results = {};
for (const [label, withEngine] of [['gsap', true], ['native', false]]) {
  const { result, errors } = await run(withEngine);
  results[label] = result;
  const fail = (message) => problems.push(`${label}: ${message}`);
  if (errors.length) fail(`page errors: ${errors.join(' | ')}`);
  if (result.engine !== withEngine) fail(`the ${label} path did not run`);
  if (result.created !== 4) fail(`${result.created} of 4 reveals were created in their closed panels`);
  // An entrance was seen when the element started at most half in and ended fully in.
  const played = ({ lowest, final }) => lowest <= 0.5 && final >= 0.99;
  for (const id of ['tween', 'wipe', 'class', 'once']) {
    if (!played(result[`${id}:first`])) fail(`${id} did not play its entrance the first time its panel opened ${JSON.stringify(result[`${id}:first`])}`);
  }
  for (const id of ['tween', 'wipe', 'class']) {
    if (!played(result[`${id}:again`])) fail(`${id} (once:false) did not play its entrance again when its panel reopened ${JSON.stringify(result[`${id}:again`])}`);
  }
  const onceAgain = result['once:again'];
  if (onceAgain.lowest < 0.99 || onceAgain.final < 0.99) fail(`a once:true entrance replayed or hid when its panel reopened ${JSON.stringify(onceAgain)}`);
}
assert.deepEqual(problems, [], `Reveal in a panel that opens and closes (${browserName}):\n${problems.join('\n')}`);

await browser.close();
console.log(`reveal-panel-reopen OK (${browserName}) — with and without GSAP, the tween, clip and class Reveal paths play their entrance each time a panel opens (once:false), and once:true plays only the first time.`);
