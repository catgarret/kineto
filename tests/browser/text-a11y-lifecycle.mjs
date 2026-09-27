// Text modules: what a screen reader gets, and what pause/resume starts.
//
// Each case below was a real defect:
//   1. a11y — split text was silent in NVDA/JAWS browse mode. Every glyph was
//      aria-hidden and the text came back only as `aria-label` on a div/span/p,
//      where a name is not allowed (and is ignored). Now one visually hidden text
//      node holds the text; destroy() restores the authored DOM.
//   2. Counter (slot, the default) — each reel's dozen digits were readable,
//      and the host was `aria-live="polite"` while it was rewritten every frame.
//   3. Overflow Text rolling — `role="status"` on a nav link took its link role
//      away, and its name read "WORK프로젝트" (the items joined) and changed on hover.
//   4. Looping text (Text Transition, Overflow Text tickers) was a live region:
//      announced every few seconds, forever.
//   5. GSAP scroll entrances (Reveal, Blur Text, Counter) and scrubbed tweens
//      (Parallax) — resume() un-paused tweens that were waiting for their
//      ScrollTrigger, so a hidden tab coming back played everything below the fold.
//   6. resume() after the effect finished ran it again (Typewriter, Text
//      Transition, Text Reveal) — onComplete again, finished text wiped and
//      re-revealed, or an element that never entered revealed off screen.
//   7. Overflow Text rolling added four hover listeners per rebuild (resume and
//      replay rebuild), and a rebuilt ticker skipped items.
//   8. Glitch — replay() and quick pause/resume stacked burst chains (image and
//      rgb-slice-burst presets), and every view notice started one (text).
//   9. Text Reveal flicker `flickerLoop` kept every ambient player forever, and
//      pause/resume replayed all of them (finished ones too).
//  10. Text Split swapped texts before it had ever entered; Counter's clock
//      rewrote its label 4× a second, and the reduced-motion clock could not pause.
//  11. Text Fill rewrote every glyph's background on every scroll update.
//  12. Intl.NumberFormat / Intl.Segmenter were built on every call (every
//      Counter frame, every Typewriter keystroke).
//
// Real GSAP + ScrollTrigger from node_modules, like layout-refresh.mjs.
// Run: npm run build && node tests/browser/text-a11y-lifecycle.mjs   (KT_BROWSER=firefox|webkit)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browserName = process.env.KT_BROWSER || 'chromium';
const browserType = { chromium, firefox, webkit }[browserName];
assert.ok(browserType, `Unsupported KT_BROWSER: ${browserName}`);

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.join(root, pathname);
  if (!file.startsWith(root)) { response.writeHead(403); response.end(); return; }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { 'content-type': file.endsWith('.js') ? 'text/javascript' : 'text/html' });
    response.end(body);
  });
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

// #top is on screen; #below starts two screens down (never entered unless a
// case scrolls there).
const pageHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;font:16px/1.4 sans-serif} #top{min-height:600px} .gap{height:2400px} #below{min-height:900px}
  .narrow{width:60px} .box{width:120px;height:60px;position:relative}
</style></head><body>
  <div id="top"></div>
  <div class="gap"></div>
  <div id="below"></div>
  <div class="gap"></div>
  <script src="${origin}/node_modules/gsap/dist/gsap.min.js"></script>
  <script src="${origin}/node_modules/gsap/dist/ScrollTrigger.min.js"></script>
  <script src="${origin}/dist/kineto.umd.js"></script>
</body></html>`;

const browser = await browserType.launch(browserName === 'chromium'
  ? { headless: true, ...(process.env.KT_CHROME ? { executablePath: process.env.KT_CHROME } : {}), args: ['--no-sandbox', '--disable-gpu'] }
  : { headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.route(`${origin}/fixture.html`, (route) => route.fulfill({ contentType: 'text/html', body: pageHtml }));
await page.goto(`${origin}/fixture.html`, { waitUntil: 'load' });
await page.waitForFunction(() => Boolean(window.Kineto && window.gsap && window.ScrollTrigger));

// Page helpers: what a screen reader reads, and whether a node is in a live region.
await page.evaluate(() => {
  window.Kineto.setAnimationEngine({ gsap: window.gsap, ScrollTrigger: window.ScrollTrigger });
  window.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  window.frames2 = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.until = async (check, timeout = 4000) => {
    const end = performance.now() + timeout;
    while (!check()) {
      if (performance.now() > end) return false;
      await window.sleep(20);
    }
    return true;
  };
  window.make = (tag, text, where = 'top', attrs = {}) => {
    const el = document.createElement(tag);
    if (text != null) el.textContent = text;
    Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
    document.getElementById(where).appendChild(el);
    return el;
  };
  // The non-whitespace text nodes a screen reader reads (outside aria-hidden).
  window.readableNodes = (host) => {
    const found = [];
    const walk = (node, hidden) => {
      if (node.nodeType === 3) { if (!hidden && node.nodeValue.trim()) found.push(node.nodeValue); return; }
      if (node.nodeType !== 1) return;
      const inside = hidden || node.getAttribute('aria-hidden') === 'true';
      node.childNodes.forEach((child) => walk(child, inside));
    };
    walk(host, false);
    return found;
  };
  window.collapse = (text) => String(text).replace(/\s+/g, ' ').trim();
  window.inLiveRegion = (node) => {
    for (let el = node?.nodeType === 1 ? node : node?.parentElement; el; el = el.parentElement) {
      if (el.hasAttribute('aria-live')) return el.getAttribute('aria-live') !== 'off';
      if (['status', 'alert', 'log'].includes(el.getAttribute('role'))) return true;
    }
    return false;
  };
  // Counts DOM changes a screen reader would announce (inside a live region).
  window.watchLiveRegions = () => {
    const records = [];
    const observer = new MutationObserver((list) => list.forEach((record) => { if (window.inLiveRegion(record.target)) records.push(record); }));
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    return () => { observer.takeRecords().forEach((record) => { if (window.inLiveRegion(record.target)) records.push(record); }); observer.disconnect(); return records.length; };
  };
});

const failures = [];
async function check(name, run) {
  try {
    await run();
  } catch (error) {
    failures.push(`${name}: ${error.message.split('\n')[0]}`);
  }
}

// 1. Every text module exposes its text through one readable text node, sets no
//    name on a host that cannot take one, and destroy() restores the DOM.
await check('a11y: one readable text node per text module', async () => {
  const results = await page.evaluate(async () => {
    const specs = [
      ['typewriter', 'Type me', 'Type me', { strings: ['Type me'], loop: false, typeSpeed: 5 }],
      ['textSplit', 'Split me', 'Split me', {}],
      ['blurText', 'Blur me', 'Blur me', {}],
      ['textReveal', 'Reveal me', 'Reveal me', { mode: 'char', speed: 5 }],
      ['textFill', 'Fill me', 'Fill me', {}],
      ['glitch', 'Glitch me', 'Glitch me', { preset: 'rgb' }],
      ['overflowText', 'A long line that cannot fit its box', 'A long line that cannot fit its box', { mode: 'loop', delay: 0 }, 'narrow'],
      ['textTransition', 'Pop me', 'Pop me', { texts: ['Pop me'], effect: 'pop' }],
      ['counter', '0', '12,345', { to: 12345, format: ',', duration: 0.2 }]
    ];
    const out = [];
    for (const [name, source, expected, options, className] of specs) {
      const host = window.make('p', source, 'top', className ? { class: className } : {});
      const before = host.outerHTML;
      const instance = window.Kineto.create(name, host, options);
      await window.frames2();
      const nodes = window.readableNodes(host);
      out.push({
        name,
        read: window.collapse(nodes.join(' ')),
        expected,
        nodes: nodes.length,
        label: host.getAttribute('aria-label')
      });
      instance.destroy();
      out[out.length - 1].restored = host.outerHTML === before;
      host.remove();
    }
    // A heading takes a name, so it keeps the aria-label as well.
    const heading = window.make('h2', 'Heading split');
    const headingInstance = window.Kineto.create('textSplit', heading, {});
    const headingLabel = heading.getAttribute('aria-label');
    headingInstance.destroy();
    heading.remove();
    return { out, headingLabel };
  });
  const wrong = results.out.filter((r) => r.read !== r.expected || r.nodes !== 1 || r.label != null || !r.restored);
  assert.deepEqual(wrong, [], `text modules must read as one hidden text node, with no name on <p>, and restore on destroy: ${JSON.stringify(wrong)}`);
  assert.equal(results.headingLabel, 'Heading split', 'a heading host keeps its aria-label');
});

// 2. Counter: reels are hidden, and a running count is not a live region.
await check('counter: hidden reels, no live-region churn', async () => {
  const result = await page.evaluate(async () => {
    const slot = window.make('p', '0');
    const slotInstance = window.Kineto.create('counter', slot, { to: 9876, duration: 0.2 });
    const readableReels = [...slot.querySelectorAll('.kt-counter-reel')].filter((reel) => !reel.closest('[aria-hidden="true"]')).length;
    const reels = slot.querySelectorAll('.kt-counter-reel').length;
    slotInstance.destroy();
    slot.remove();
    const plain = window.make('p', '0');
    const stop = window.watchLiveRegions();
    let done = false;
    const plainInstance = window.Kineto.create('counter', plain, { mode: 'plain', to: 500, duration: 0.4, onComplete: () => { done = true; } });
    await window.until(() => done);
    const liveMutations = stop();
    plainInstance.destroy();
    plain.remove();
    return { reels, readableReels, done, liveMutations };
  });
  assert.ok(result.reels > 0 && result.readableReels === 0, `slot reels must be aria-hidden (${JSON.stringify(result)})`);
  assert.ok(result.done && result.liveMutations <= 1, `a counting plain counter must not churn a live region (${JSON.stringify(result)})`);
});

// 3. A rolling nav link stays a link with one stable name.
await check('overflowText: rolling link keeps its role and name', async () => {
  await page.evaluate(() => {
    const link = window.make('a', null, 'top', { href: '#work', id: 'navlink' });
    link.innerHTML = '<span>WORK</span><span>프로젝트</span>';
    window.navInstance = window.Kineto.create('overflowText', link, { mode: 'rolling', trigger: 'hover' });
  });
  const role = await page.evaluate(() => document.getElementById('navlink').getAttribute('role'));
  assert.equal(role, null, 'a rolling link must not be given a role');
  assert.equal(await page.getByRole('link', { name: 'WORK', exact: true }).count(), 1, 'the link is named by its first item');
  await page.hover('#navlink');
  await page.waitForTimeout(450);
  assert.equal(await page.getByRole('link', { name: 'WORK', exact: true }).count(), 1, 'the name does not change on hover');
  await page.mouse.move(900, 650);
  await page.evaluate(() => { window.navInstance.destroy(); document.getElementById('navlink').remove(); });
});

// 4. Text that rotates by itself is never announced.
await check('looping text: no live-region announcements', async () => {
  const result = await page.evaluate(async () => {
    const stop = window.watchLiveRegions();
    let transitions = 0;
    let rolls = 0;
    const words = window.make('p', null);
    const wordsInstance = window.Kineto.create('textTransition', words, { texts: ['One', 'Two', 'Three'], hold: 120, duration: 60, onChange: () => { transitions += 1; } });
    const ticker = window.make('div', null);
    const tickerInstance = window.Kineto.create('overflowText', ticker, { mode: 'rolling', items: ['A', 'B', 'C'], holdDuration: 120, rollDuration: 60, delay: 0, onChange: () => { rolls += 1; } });
    await window.until(() => transitions >= 3 && rolls >= 3, 5000);
    const announcements = stop();
    wordsInstance.destroy();
    tickerInstance.destroy();
    words.remove();
    ticker.remove();
    return { transitions, rolls, announcements };
  });
  assert.ok(result.transitions >= 3 && result.rolls >= 3, `both must actually rotate (${JSON.stringify(result)})`);
  assert.equal(result.announcements, 0, `auto-rotating text must not mutate a live region (${JSON.stringify(result)})`);
});

// 5. pause()+resume() (a tab switch) must not play entrances below the fold.
await check('scroll tweens: resume leaves unentered entrances alone', async () => {
  const result = await page.evaluate(async () => {
    const reveal = window.make('div', 'Reveal below', 'below');
    const blur = window.make('p', 'Blur below', 'below');
    const count = window.make('p', '0', 'below');
    const parallax = window.make('div', 'Parallax below', 'below');
    const instances = [
      window.Kineto.create('reveal', reveal, { preset: 'fade-up' }),
      window.Kineto.create('blurText', blur, {}),
      window.Kineto.create('counter', count, { to: 4321, duration: 0.3 }),
      window.Kineto.create('parallax', parallax, { speed: 0.5 })
    ];
    window.ScrollTrigger.refresh();
    await window.frames2();
    const reel = count.querySelector('.kt-counter-reel');
    const parallaxBefore = window.gsap.getProperty(parallax, 'y');
    instances.forEach((instance) => { instance.pause(); instance.resume(); });
    await window.sleep(600);
    const state = {
      revealOpacity: getComputedStyle(reveal).opacity,
      revealClass: reveal.classList.contains('is-inview'),
      blurOpacity: getComputedStyle(blur.querySelector('.kt-text-word > span')).opacity,
      reelY: window.gsap.getProperty(reel, 'y'),
      parallaxMoved: Math.abs(window.gsap.getProperty(parallax, 'y') - parallaxBefore) > 0.5
    };
    instances.forEach((instance) => instance.destroy());
    [reveal, blur, count, parallax].forEach((el) => el.remove());
    return state;
  });
  assert.deepEqual(result, { revealOpacity: '0', revealClass: false, blurOpacity: '0', reelY: 0, parallaxMoved: false },
    `entrances below the fold must still wait for their trigger after pause/resume (${JSON.stringify(result)})`);
});

// 6. resume() after the effect finished changes nothing.
await check('finished effects: resume is a no-op', async () => {
  const result = await page.evaluate(async () => {
    const counts = { typewriter: 0, textTransition: 0, textReveal: 0 };
    const typed = window.make('p', null);
    const typewriter = window.Kineto.create('typewriter', typed, { strings: ['ab'], loop: false, typeSpeed: 10, onComplete: () => { counts.typewriter += 1; } });
    const words = window.make('p', null);
    const transition = window.Kineto.create('textTransition', words, { texts: ['one', 'two'], loop: false, hold: 80, duration: 50, onComplete: () => { counts.textTransition += 1; } });
    const decoded = window.make('p', 'Decode');
    const reveal = window.Kineto.create('textReveal', decoded, { mode: 'decode', speed: 5, flickerCount: 1, onComplete: () => { counts.textReveal += 1; } });
    await window.until(() => counts.typewriter && counts.textTransition && counts.textReveal, 5000);
    const html = [typed.innerHTML, words.innerHTML, decoded.innerHTML];
    for (let round = 0; round < 2; round += 1) {
      [typewriter, transition, reveal].forEach((instance) => { instance.pause(); instance.resume(); });
      await window.sleep(250);
    }
    const unchanged = [typed.innerHTML, words.innerHTML, decoded.innerHTML].every((value, index) => value === html[index]);
    // Never entered: resume() must not reveal it off screen.
    let belowDone = 0;
    const below = window.make('p', 'Never seen', 'below');
    const belowReveal = window.Kineto.create('textReveal', below, { mode: 'decode', speed: 5, flickerCount: 1, onComplete: () => { belowDone += 1; } });
    belowReveal.pause();
    belowReveal.resume();
    await window.sleep(400);
    const belowGlyphs = below.querySelectorAll('span[aria-hidden="true"]').length;
    [typewriter, transition, reveal, belowReveal].forEach((instance) => instance.destroy());
    [typed, words, decoded, below].forEach((el) => el.remove());
    return { counts, unchanged, belowDone, belowGlyphs };
  });
  assert.deepEqual(result, { counts: { typewriter: 1, textTransition: 1, textReveal: 1 }, unchanged: true, belowDone: 0, belowGlyphs: 0 },
    `resume after completion (or before entering) must not run the effect again (${JSON.stringify(result)})`);
});

// 7. Rolling rebuilds keep one set of hover listeners and their place in the list.
await check('overflowText: rebuilds keep one hover listener set and the ticker position', async () => {
  const result = await page.evaluate(async () => {
    const changes = [];
    const host = window.make('span', null);
    const instance = window.Kineto.create('overflowText', host, { mode: 'rolling', trigger: 'hover', items: ['One', 'Two'], onChange: (index) => changes.push(index) });
    for (let round = 0; round < 3; round += 1) { instance.pause(); instance.resume(); }
    host.dispatchEvent(new PointerEvent('pointerenter'));
    const afterHover = changes.length;
    host.dispatchEvent(new PointerEvent('pointerleave'));
    instance.destroy();
    const beforeDestroyed = changes.length;
    host.dispatchEvent(new PointerEvent('pointerenter'));
    const afterDestroy = changes.length - beforeDestroyed;
    host.remove();

    const ticker = window.make('div', null);
    const rolled = [];
    const tickerInstance = window.Kineto.create('overflowText', ticker, { mode: 'rolling', items: ['A', 'B', 'C', 'D'], holdDuration: 100, rollDuration: 40, delay: 0, onChange: (index) => rolled.push(index) });
    await window.until(() => rolled.length >= 1);
    tickerInstance.pause();
    tickerInstance.resume();
    const shown = ticker.querySelector('.kt-overflow-rolling-track').firstElementChild.textContent;
    tickerInstance.destroy();
    ticker.remove();
    return { afterHover, afterDestroy, shown, expected: ['A', 'B', 'C', 'D'][rolled[rolled.length - 1]] };
  });
  assert.equal(result.afterHover, 1, `one hover after three rebuilds must roll once (${JSON.stringify(result)})`);
  assert.equal(result.afterDestroy, 0, 'no hover listener may act after destroy');
  assert.equal(result.shown, result.expected, `a rebuilt ticker must show the item it was on (${JSON.stringify(result)})`);
});

// 8. Glitch burst chains do not multiply. With randomness 0 every gap is a
//    fixed delay, so the setTimeout calls with that delay count the chains.
await check('glitch: replay/resume/view notices never stack burst chains', async () => {
  const result = await page.evaluate(async () => {
    const native = window.setTimeout;
    const calls = [];
    window.setTimeout = (fn, ms, ...rest) => { calls.push(Math.round(Number(ms) * 100) / 100); return native(fn, ms, ...rest); };
    const rate = async (delay, ms = 1500) => {
      const start = calls.length;
      await window.sleep(ms);
      return calls.slice(start).filter((value) => value === delay).length;
    };
    const out = {};
    // Image preset: gap (700 + 0.5·1800) / frequency 4 = 400ms.
    const imageHost = window.make('div', null, 'top', { class: 'box' });
    imageHost.innerHTML = '<img alt="" width="120" height="60" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=">';
    const image = window.Kineto.create('glitch', imageHost, { preset: 'image', randomness: 0, frequency: 4, speed: 3, delay: 0 });
    out.imageBefore = await rate(400);
    for (let round = 0; round < 5; round += 1) image.replay();
    out.imageAfter = await rate(400);
    image.destroy();
    imageHost.remove();
    // RGB slice burst: gap ((250 + 1200) / 2) / cadence 4 = 181.25ms.
    const sliceHost = window.make('div', 'Slice', 'top', { class: 'box' });
    const slice = window.Kineto.create('glitch', sliceHost, { preset: 'rgb-slice-burst', randomness: 0, frequency: 4 });
    out.sliceBefore = await rate(181.25);
    for (let round = 0; round < 3; round += 1) { slice.pause(); slice.resume(); }
    out.sliceAfter = await rate(181.25);
    slice.destroy();
    sliceHost.remove();
    // Text, trigger 'view': gap (520 + 0.5·1400) / 4 = 305ms. Scrolling it to
    // 20% visible and back crosses the 0.4 threshold twice — two notices, both
    // still intersecting — while it stays near enough for the core not to pause it.
    const viewHost = window.make('p', 'View glitch', 'top', { style: 'height:100px;margin:0' });
    const view = window.Kineto.create('glitch', viewHost, { preset: 'rgb', trigger: 'view', randomness: 0, frequency: 4 });
    out.viewBefore = await rate(305);
    const viewTop = viewHost.getBoundingClientRect().top + window.scrollY;
    for (let round = 0; round < 2; round += 1) {
      window.scrollTo(0, viewTop + 80);
      await window.sleep(150);
      window.scrollTo(0, 0);
      await window.sleep(150);
    }
    out.viewAfter = await rate(305);
    view.destroy();
    viewHost.remove();
    window.setTimeout = native;
    return out;
  });
  assert.ok(result.imageBefore >= 1 && result.imageAfter <= result.imageBefore + 1, `image replay must not add burst chains (${JSON.stringify(result)})`);
  assert.ok(result.sliceBefore >= 2 && result.sliceAfter <= result.sliceBefore + 2, `rgb-slice-burst pause/resume must not add burst chains (${JSON.stringify(result)})`);
  assert.ok(result.viewBefore >= 2 && result.viewAfter <= result.viewBefore + 2, `a view notice must not add a burst chain (${JSON.stringify(result)})`);
});

// 9. Text Reveal flickerLoop keeps only live players; pause/resume restarts
//    only what was running. Math.random is pinned so the ambient timer is 500ms.
await check('textReveal: ambient flicker players stay bounded', async () => {
  const result = await page.evaluate(async () => {
    const random = Math.random;
    Math.random = () => 0;
    const host = window.make('p', 'Flicker text');
    const instance = window.Kineto.create('textReveal', host, { mode: 'flicker', flickerLoop: true, duration: 0.1 });
    await window.sleep(3800); // the entrance, then about six ambient flickers
    const running = () => host.getAnimations({ subtree: true }).filter((player) => player.playState === 'running').length;
    const runningBefore = running();
    instance.pause();
    const held = host.getAnimations({ subtree: true }).filter((player) => player.playState === 'paused').length;
    instance.resume();
    const runningAfter = running();
    // The ambient loop is still alive after resume.
    let flickered = false;
    await window.until(() => { flickered ||= running() > 0; return flickered; }, 1500);
    instance.destroy();
    host.remove();
    Math.random = random;
    return { runningBefore, held, runningAfter, flickered };
  });
  assert.ok(result.held <= 1 && result.runningAfter <= result.runningBefore, `only running players are paused and resumed (${JSON.stringify(result)})`);
  assert.ok(result.flickered, `the ambient flicker must continue after resume (${JSON.stringify(result)})`);
  const declared = await page.evaluate(() => [window.Kineto.registry.textReveal.offscreen?.({ flickerLoop: true }), window.Kineto.registry.textReveal.offscreen?.({})]);
  assert.deepEqual(declared, ['pause', null], 'a looping Text Reveal is paused off screen');
});

// 10. Text Split swaps and the Counter clock.
await check('textSplit swaps wait for entry; clock writes only changes; reduced clock pauses', async () => {
  const result = await page.evaluate(async () => {
    const registry = window.Kineto.registry;
    // Created straight from the module so no core suspension is involved.
    let swaps = 0;
    const split = window.make('p', 'Swap', 'below');
    const splitInstance = registry.textSplit.create(split, { texts: ['A', 'B'], hold: 200, duration: 0.1, onSwap: () => { swaps += 1; } });
    splitInstance.pause();
    splitInstance.resume();
    await window.sleep(700);
    splitInstance.destroy();
    split.remove();

    const clock = window.make('p', null);
    const clockInstance = window.Kineto.create('counter', clock, { mode: 'clock', secondsOnly: true });
    const writes = [];
    const observer = new MutationObserver((list) => list.forEach((record) => {
      const named = record.type === 'attributes' && record.target === clock && record.attributeName === 'aria-label';
      const copy = record.target.nodeType === 1 && record.target.classList.contains('kt-sr-only');
      if (named || copy) writes.push(record.type);
    }));
    observer.observe(clock, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label'] });
    await window.sleep(1100);
    observer.disconnect();
    clockInstance.destroy();
    clock.remove();

    const reduced = window.make('p', null);
    const reducedInstance = registry.counter.reduced(reduced, { mode: 'clock', secondsOnly: true });
    reducedInstance.pause();
    const pausedText = reduced.textContent;
    await window.sleep(1300);
    const heldWhilePaused = reduced.textContent === pausedText;
    reducedInstance.resume();
    const ticksAgain = await window.until(() => reduced.textContent !== pausedText, 1500);
    reducedInstance.destroy();
    reduced.remove();
    return {
      swaps,
      clockWrites: writes.length,
      heldWhilePaused,
      ticksAgain,
      splitOffscreen: [registry.textSplit.offscreen?.({ texts: ['a', 'b'] }), registry.textSplit.offscreen?.({})],
      clockOffscreen: [registry.counter.offscreen?.({ mode: 'clock' }), registry.counter.offscreen?.({ secondsOnly: true }), registry.counter.offscreen?.({})]
    };
  });
  assert.equal(result.swaps, 0, `a Text Split that never entered must not swap after resume (${JSON.stringify(result)})`);
  assert.ok(result.clockWrites <= 2, `the clock's accessible text is written only when it changes (${JSON.stringify(result)})`);
  assert.ok(result.heldWhilePaused && result.ticksAgain, `the reduced-motion clock pauses and resumes (${JSON.stringify(result)})`);
  assert.deepEqual(result.splitOffscreen, ['pause', null], 'a swapping Text Split is paused off screen');
  assert.deepEqual(result.clockOffscreen, ['pause', 'pause', null], 'a Counter clock is paused off screen');
});

// 11. Text Fill writes only the glyphs whose fill changed.
await check('textFill: a scroll update writes only changed glyphs', async () => {
  const result = await page.evaluate(async () => {
    const host = window.make('p', 'A text fill line with plenty of glyphs', 'below');
    let updates = 0;
    const instance = window.Kineto.create('textFill', host, { scrub: false, start: 'top bottom', end: 'bottom top', onUpdate: () => { updates += 1; } });
    let writes = 0;
    const glyphs = [...host.querySelectorAll('span[aria-hidden="true"]')];
    glyphs.forEach((span) => {
      Object.defineProperty(span.style, 'backgroundPosition', {
        configurable: true,
        get() { return this.getPropertyValue('background-position'); },
        set(value) { writes += 1; this.setProperty('background-position', value); }
      });
    });
    window.ScrollTrigger.refresh();
    const top = host.getBoundingClientRect().top + window.scrollY;
    for (let step = 0; step <= 30; step += 1) {
      window.scrollTo(0, top - window.innerHeight + step * 20);
      await window.frames2();
    }
    window.scrollTo(0, 0);
    await window.frames2();
    instance.destroy();
    host.remove();
    return { glyphs: glyphs.length, updates, writes };
  });
  assert.ok(result.updates >= 10, `the scroll must drive the fill (${JSON.stringify(result)})`);
  assert.ok(result.writes <= result.updates * 3, `writes per update must not scale with the glyph count (${JSON.stringify(result)})`);
});

// 12. Intl formatters are built once, not per frame or per keystroke.
await check('utils: Intl.NumberFormat and Intl.Segmenter are cached', async () => {
  const result = await page.evaluate(async () => {
    const counts = { number: 0, segmenter: 0 };
    const NumberFormat = Intl.NumberFormat;
    const Segmenter = Intl.Segmenter;
    Intl.NumberFormat = new Proxy(NumberFormat, { construct(target, args) { counts.number += 1; return Reflect.construct(target, args); } });
    if (Segmenter) Intl.Segmenter = new Proxy(Segmenter, { construct(target, args) { counts.segmenter += 1; return Reflect.construct(target, args); } });
    let counted = false;
    let typed = false;
    const number = window.make('p', '0');
    const counter = window.Kineto.create('counter', number, { mode: 'plain', to: 99999, format: ',', duration: 0.4, onComplete: () => { counted = true; } });
    const line = window.make('p', null);
    const typewriter = window.Kineto.create('typewriter', line, { strings: ['abcdefgh'], loop: false, typeSpeed: 10, onComplete: () => { typed = true; } });
    await window.until(() => counted && typed);
    counter.destroy();
    typewriter.destroy();
    number.remove();
    line.remove();
    Intl.NumberFormat = NumberFormat;
    if (Segmenter) Intl.Segmenter = Segmenter;
    return counts;
  });
  assert.ok(result.number <= 1 && result.segmenter <= 1, `formatters must be reused (${JSON.stringify(result)})`);
});

await page.evaluate(() => window.frames2());
assert.deepEqual(errors, [], `page errors:\n${errors.join('\n')}`);
await browser.close();
server.close();
assert.deepEqual(failures, [], `\n${failures.join('\n')}`);
console.log(`text-a11y-lifecycle OK (${browserName}) — split text reads as one hidden text node (no names on generic hosts), counters hide their reels and do not churn a live region, rolling links keep role and name, rotating text is never announced, resume leaves unentered and finished effects alone, rolling rebuilds keep one hover listener set, glitch chains never stack, flicker players stay bounded, the clock writes only changes, Text Fill writes only changed glyphs, and Intl formatters are cached.`);
