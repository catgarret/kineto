// The owner's 2026-09-24 demo review, held as tests.
//
//   1. Radial has its own card in its own block — it used to be a heading over
//      a "the card lives in Slider" note, which read as "Radial is hidden".
//   2. A module block opens on two rows of demos; the rest wait behind one
//      button (demo/fold.js). Slider used to print a card per variant directly
//      under a sheet that already compares every variant.
//        • folded cards are clipped, not display:none, and they are inert;
//        • the button says how many are hidden, opens, and closes again;
//        • anything that scrolls to a folded card opens its fold first;
//        • rows are measured, so a phone folds at two ONE-card rows.
//   3. Reveal's orange box keeps all four corners inside a grey stage; only a
//      box that sits directly on the settings bar loses its bottom corners.
//   4. CSS Scroll's native tabs move: the stage clips with `overflow: clip`
//      (a scroll container would capture the native timeline), and each tab
//      says which engine is driving it.
//   5. No block row leaves a hole (2026-09-25: Flip showed one card at two
//      thirds of the width and the next at full width — two `.wide` cards in a
//      3-up grid). Flip lays its two cards side by side; any row that cannot be
//      completed is split evenly, not only the last one.
//
// Run: npm run build && node tests/browser/demo-blocks.mjs   (KT_BROWSER=webkit|firefox)
import assert from 'node:assert/strict';
import { chromium, firefox, webkit } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported KT_BROWSER: ${browserName}`);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.json': 'application/json'
};
// CDN scripts the demo needs, served from the local install instead.
const LOCAL_CDN = [
  [/cdn\.jsdelivr\.net\/npm\/gsap@[^/]+\/dist\/(gsap|ScrollTrigger)\.min\.js/, (match) => `node_modules/gsap/dist/${match[1]}.min.js`],
  [/cdn\.jsdelivr\.net\/npm\/lenis@[^/]+\/dist\/lenis\.min\.js/, () => 'node_modules/lenis/dist/lenis.min.js']
];

// A static server for this checkout only: GET, and paths inside the repository.
const server = http.createServer((request, response) => {
  if (request.method !== 'GET') { response.writeHead(405).end(); return; }
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404).end(); return; }
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

async function openDemo(viewport) {
  const page = await browser.newPage({ viewport, reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.route((url) => !url.href.startsWith(origin), async (route) => {
    const url = route.request().url();
    for (const [pattern, local] of LOCAL_CDN) {
      const match = pattern.exec(url);
      const file = match && path.resolve(root, local(match));
      if (file && fs.existsSync(file)) {
        await route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
        return;
      }
    }
    await route.fulfill({ status: 200, contentType: url.endsWith('.js') ? 'text/javascript' : 'text/css', body: '' });
  });
  await page.goto(`${origin}/demo/index.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('#mod-slider .module-fold') && window.KINETO_FOLD, null, { timeout: 30000 });
  // The fold is laid out on the frame after the blocks are measured.
  await page.waitForFunction(() => document.querySelector('#mod-slider .module-block-body')?.dataset.demoFoldActive === 'true', null, { timeout: 10000 });
  return { page, errors };
}

/** What a reader of one block can see and reach. */
const foldState = (page, block) => page.evaluate((id) => {
  const body = document.querySelector(`#${id} .module-block-body`);
  const cards = [...body.children];
  const button = body.nextElementSibling?.querySelector('button');
  const clip = body.getBoundingClientRect();
  return {
    active: body.dataset.demoFoldActive,
    state: body.dataset.demoFold,
    total: cards.length,
    folded: cards.filter((card) => card.hasAttribute('data-demo-folded')).length,
    inert: cards.filter((card) => card.inert).length,
    // A folded card must still be laid out at its real size (modules measure it).
    foldedSized: cards.filter((card) => card.hasAttribute('data-demo-folded')).every((card) => card.getBoundingClientRect().height > 100),
    // …and must start below the visible part of the grid.
    foldedBelow: cards.filter((card) => card.hasAttribute('data-demo-folded')).every((card) => card.getBoundingClientRect().top > clip.bottom - 90),
    visibleHeight: Math.round(clip.height),
    fullHeight: body.scrollHeight,
    overflow: getComputedStyle(body).overflowY,
    count: button?.querySelector('.module-fold__count')?.textContent,
    expanded: button?.getAttribute('aria-expanded'),
    buttonShown: Boolean(button && !button.closest('.module-fold').hidden)
  };
}, block);

/** Every row of every block grid, measured: which ones leave a hole. */
const rowHoles = (page) => page.evaluate(() => {
  window.KINETO_FOLD?.openAll?.();
  const holes = [];
  document.querySelectorAll('.module-block-body.grid:not(.module-block-body--dense)').forEach((body) => {
    const cards = [...body.children].filter((card) => card.classList.contains('card') && card.getBoundingClientRect().height > 0);
    const rows = new Map();
    cards.forEach((card) => {
      const top = Math.round(card.getBoundingClientRect().top);
      if (!rows.has(top)) rows.set(top, []);
      rows.get(top).push(card);
    });
    const gap = parseFloat(getComputedStyle(body).columnGap) || 0;
    const width = body.getBoundingClientRect().width;
    rows.forEach((row) => {
      const used = row.reduce((sum, card) => sum + card.getBoundingClientRect().width, 0) + gap * (row.length - 1);
      if (used < width - 4) holes.push(`${body.closest('[id^="mod-"]')?.id}: ${Math.round(used)} of ${Math.round(width)}px`);
    });
  });
  return holes;
});

// ── Desktop ──────────────────────────────────────────────────────────────────
{
  const { page, errors } = await openDemo({ width: 1440, height: 900 });

  // 1. Radial lives in Radial.
  const radial = await page.evaluate(() => ({
    card: Boolean(document.querySelector('#mod-radial [data-demo-home="radial"] [data-kt-radial]')),
    elsewhere: Boolean(document.querySelector('#mod-radial .module-block-elsewhere')),
    inSlider: Boolean(document.querySelector('#mod-slider [data-kt-radial], #mod-slider [data-kt-slider="radial"]'))
  }));
  assert.deepEqual(radial, { card: true, elsewhere: false, inSlider: false }, `the Radial card must live in the Radial block (${JSON.stringify(radial)})`);

  // 2. Slider (2 columns, 9 cards) opens on 2 rows = 4 cards.
  const closed = await foldState(page, 'mod-slider');
  assert.equal(closed.active, 'true', 'Slider has more than two rows, so it must fold');
  assert.equal(closed.state, 'closed');
  assert.equal(closed.folded, closed.total - 4, `two rows of two must stay open (${JSON.stringify(closed)})`);
  assert.equal(closed.inert, closed.folded, 'every folded card must be inert, and only those');
  assert.ok(closed.foldedSized, 'folded cards must stay laid out at their real size');
  assert.ok(closed.foldedBelow, 'folded cards must sit below the visible rows');
  assert.equal(closed.overflow, 'clip', 'a closed fold clips its grid');
  assert.ok(closed.visibleHeight < closed.fullHeight - 400, `a closed fold must hide real height (${JSON.stringify(closed)})`);
  assert.equal(closed.count, `+${closed.folded}`, 'the button must say how many demos are hidden');
  assert.ok(closed.buttonShown && closed.expanded === 'false', 'the fold button must be visible and collapsed');

  // A block that fits in two rows shows no button.
  const radialFold = await page.evaluate(() => document.querySelector('#mod-radial .module-fold')?.hidden ?? true);
  assert.equal(radialFold, true, 'a block with one card must not offer "show more"');

  // Open.
  await page.locator('#mod-slider .module-fold__toggle').click();
  // Opening settles on transitionend or, at the latest, fold.js's 700ms timer.
  // A slow WebKit runner can hold the main thread for seconds while the newly
  // revealed sliders start, so allow for that rather than guess a duration.
  await page.waitForFunction(() => document.querySelector('#mod-slider .module-block-body').dataset.demoFold === 'open', null, { timeout: 15000 });
  const opened = await foldState(page, 'mod-slider');
  assert.equal(opened.folded, 0, 'an open fold hides nothing');
  assert.equal(opened.inert, 0, 'an open fold leaves nothing inert');
  assert.ok(Math.abs(opened.visibleHeight - opened.fullHeight) <= 2, `an open fold shows its full height (${JSON.stringify(opened)})`);
  assert.equal(opened.expanded, 'true');
  const inlineAfterOpen = await page.evaluate(() => document.querySelector('#mod-slider .module-block-body').style.maxHeight);
  assert.equal(inlineAfterOpen, '', 'an open fold must not keep a measured max-height that would cut a later resize');

  // Close again.
  await page.locator('#mod-slider .module-fold__toggle').click();
  await page.waitForFunction(() => document.querySelector('#mod-slider .module-block-body').dataset.demoFold === 'closed', null, { timeout: 15000 });
  const reclosed = await foldState(page, 'mod-slider');
  assert.equal(reclosed.folded, closed.folded, 'closing must fold the same cards again');
  const buttonInView = await page.evaluate(() => {
    const box = document.querySelector('#mod-slider .module-fold__toggle').getBoundingClientRect();
    return box.top >= 0 && box.bottom <= innerHeight;
  });
  assert.ok(buttonInView, 'after closing, the button must still be on screen where the reader clicked it');

  // Anything that scrolls to a folded card opens its fold first — here the
  // generic event other scripts (compare sheet, share links) dispatch.
  const revealed = await page.evaluate(() => {
    const card = document.querySelector('#mod-slider [data-demo-folded]');
    card.dispatchEvent(new CustomEvent('kt-demo:reveal', { bubbles: true }));
    return { state: card.parentElement.dataset.demoFold, inert: card.inert, folded: card.hasAttribute('data-demo-folded') };
  });
  assert.deepEqual(revealed, { state: 'open', inert: false, folded: false }, 'kt-demo:reveal must open the fold instantly');

  // 3. Reveal radii.
  const radii = await page.evaluate(() => {
    const nested = document.querySelector('#mod-reveal .demo-stage > .reveal-demo-card');
    const direct = [...document.querySelectorAll('#mod-reveal .card > .reveal-demo-card')]
      .find((box) => box.nextElementSibling?.classList.contains('kt-playground'));
    const corners = (node) => {
      const style = getComputedStyle(node);
      return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].map((value) => Number.parseFloat(value));
    };
    return { nested: nested && corners(nested), direct: direct && corners(direct) };
  });
  assert.ok(radii.nested?.every((value) => value > 0), `an orange box inside a grey stage keeps all four corners (${JSON.stringify(radii)})`);
  assert.ok(radii.direct && radii.direct[0] > 0 && radii.direct[2] === 0 && radii.direct[3] === 0,
    `an orange box sitting on the settings bar squares only its bottom corners (${JSON.stringify(radii)})`);

  // 4. CSS Scroll.
  const cssScroll = await page.evaluate(() => {
    const card = document.querySelector('[data-demo-home="cssScroll"]');
    return {
      overflow: getComputedStyle(card.querySelector('.css-scroll-demo-stage')).overflowY,
      notes: card.querySelectorAll('.css-scroll-note').length,
      readouts: card.querySelectorAll('[data-css-scroll-readout]').length,
      nativeView: CSS.supports?.('animation-timeline', 'view()') === true
    };
  });
  assert.equal(cssScroll.overflow, 'clip', 'the CSS Scroll stage must clip without becoming a scroll container');
  assert.equal(cssScroll.notes, 3, 'each CSS Scroll tab explains what its 0→1 measures');
  assert.equal(cssScroll.readouts, 3, 'each CSS Scroll tab shows the engine and the live progress');
  if (cssScroll.nativeView) {
    const card = page.locator('[data-demo-home="cssScroll"]');
    await card.evaluate((node) => node.scrollIntoView({ block: 'center' }));
    await card.locator('.demo-tab').nth(1).click();
    await page.waitForTimeout(250);
    const read = () => card.evaluate((node) => {
      const panel = node.querySelector('.demo-tabpanel:not([hidden])');
      return {
        progress: Number.parseFloat(getComputedStyle(panel.querySelector('.css-scroll-card')).getPropertyValue('--scroll-progress')),
        mode: window.Kineto.getInstance(panel.querySelector('.css-scroll-card'), 'cssScroll')?.mode,
        shown: panel.querySelector('[data-css-scroll-mode]')?.textContent
      };
    });
    // Wait for results, not guessed durations: the readout and the native
    // timeline both update on rendered frames, and a busy WebKit runner can
    // deliver only a few per second.
    const settle = async (test) => {
      let value = await read();
      for (let waited = 0; waited < 6000 && !test(value); waited += 150) {
        await page.waitForTimeout(150);
        value = await read();
      }
      return value;
    };
    const before = await settle((value) => value.shown === 'CSS 네이티브' && Number.isFinite(value.progress));
    await page.evaluate(() => window.scrollBy(0, 220));
    const after = await settle((value) => Math.abs(value.progress - before.progress) > 0.05);
    assert.equal(before.mode, 'native', `the native view tab must run natively here (${JSON.stringify(before)})`);
    assert.ok(Math.abs(after.progress - before.progress) > 0.05, `the native view tab must move with the scroll (${JSON.stringify({ before, after })})`);
    assert.equal(after.shown, 'CSS 네이티브', 'the readout names the engine that drives the tab');
  }

  // 5. No holes; Flip's two cards share one row.
  const flip = await page.evaluate(() => [...document.querySelectorAll('#mod-flip .module-block-body > .card')]
    .map((card) => { const box = card.getBoundingClientRect(); return { top: Math.round(box.top), width: Math.round(box.width) }; }));
  assert.equal(flip.length, 2, 'the Flip block has its two cards');
  assert.ok(flip[0].top === flip[1].top && Math.abs(flip[0].width - flip[1].width) <= 1,
    `Flip's two cards must sit side by side at equal width (${JSON.stringify(flip)})`);
  assert.deepEqual(await rowHoles(page), [], 'no block row may leave a hole on desktop');
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.waitForTimeout(400);
  assert.deepEqual(await rowHoles(page), [], 'no block row may leave a hole at 1024px');

  assert.deepEqual(errors, [], `demo page errors:\n${errors.join('\n')}`);
  await page.close();
}

// ── Phone ────────────────────────────────────────────────────────────────────
// One column: two rows are two cards. Measured rows, not a column count.
{
  const { page, errors } = await openDemo({ width: 390, height: 844 });
  const phone = await foldState(page, 'mod-slider');
  assert.equal(phone.total - phone.folded, 2, `a phone shows two one-card rows before the fold (${JSON.stringify(phone)})`);
  assert.deepEqual(errors, [], `demo page errors (phone):\n${errors.join('\n')}`);
  await page.close();
}

await browser.close();
server.close();
console.log(`demo-blocks OK (${browserName}) — Radial in its own block, two-row folds (4 of 9 Slider cards on desktop, 2 on a phone) that open, close and reveal on demand, Reveal corners by placement, and CSS Scroll tabs that move and name their engine.`);
