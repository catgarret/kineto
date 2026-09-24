// What does a page cost when nobody is doing anything?
//
// The demo answered "76% of the main thread": 371 rAF callbacks a second at
// the very top of the page, most of them from loops that had nothing to draw —
// fourteen cursors redrawing with the pointer nowhere near, springs and
// parallax layers long since at rest, and endless strips far below the fold.
// Two library changes answer it now, and this test holds both:
//
//   loops that SETTLE — Cursor, Scroll Velocity, Mouse Parallax and its compass
//     stop asking for frames once they have caught up, and input wakes them;
//   loops that never settle are SUSPENDED off screen — a module that declares
//     `offscreen: 'pause'` is paused by the core while its element is out of
//     view (the same system pause a hidden tab gets) and resumed on return,
//     without ever overriding a pause the page asked for itself.
//
// Only Kineto's own rAF callbacks are counted — GSAP keeps its own ticker — by
// the stack each one was scheduled from.
//
// Run: npm run build && node tests/browser/idle-cost.mjs
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
const FIXTURE = '/__idle__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;background:#111;color:#fff;font:16px system-ui}
  .box{height:220px;margin:20px;border:1px solid #333;display:grid;place-items:center;overflow:hidden}
  .spacer{height:3000px}
</style>
<script>
  // Count Kineto's rAF callbacks, attributed by the scheduling stack.
  (() => {
    const raf = window.requestAnimationFrame.bind(window);
    window.__ktFrames = 0;
    window.requestAnimationFrame = (callback) => {
      const mine = /kineto\\.umd/.test(new Error().stack || '');
      return raf((time) => { if (mine) window.__ktFrames += 1; callback(time); });
    };
  })();
</script></head><body>
<div class="box" id="scope" data-kt-cursor="ring" data-kt-scope>cursor scope</div>
<div class="box"><div id="velocity" data-kt-scroll-velocity>SCROLL</div></div>
<div class="box" id="parallax" data-kt-mouse-parallax><span data-kt-mouse-speed="0.5">layer</span></div>
<div class="box"><div id="compass" data-kt-mouse-parallax="compass">→</div></div>
<div class="spacer"></div>
<div class="box"><div id="strip" data-kt-marquee data-kt-speed="40"><span>ONE · TWO · THREE · FOUR · </span></div></div>
<div class="spacer"></div>
<div class="box"><div id="loader" data-kt-loading-indicator="terminal" data-kt-terminal-style="snake"></div></div>
<script src="/node_modules/gsap/dist/gsap.min.js"></script>
<script src="/node_modules/gsap/dist/ScrollTrigger.min.js"></script>
<script src="/dist/kineto.umd.js"></script>
<script>window.Kineto.init();</script></body></html>`;
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
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const errors = [];
page.on('pageerror', (error) => errors.push(String(error)));
await page.goto(`${origin}${FIXTURE}`, { waitUntil: 'load' });
await page.mouse.move(890, 690);
await page.waitForTimeout(1500);

// Kineto frames per second over a window, with nothing happening.
const framesOver = async (ms) => {
  const start = await page.evaluate(() => window.__ktFrames);
  await page.waitForTimeout(ms);
  return ((await page.evaluate(() => window.__ktFrames)) - start) * (1000 / ms);
};
const instances = await page.evaluate(() => ({
  cursor: Boolean(window.Kineto.getInstance(document.getElementById('scope'), 'cursor')),
  velocity: Boolean(window.Kineto.getInstance(document.getElementById('velocity'), 'scrollVelocity')),
  parallax: Boolean(window.Kineto.getInstance(document.getElementById('parallax'), 'mouseParallax')),
  compass: Boolean(window.Kineto.getInstance(document.getElementById('compass'), 'mouseParallax')),
  strip: Boolean(window.Kineto.getInstance(document.getElementById('strip'), 'marquee'))
}));
assert.deepEqual(instances, { cursor: true, velocity: true, parallax: true, compass: true, strip: true },
  'every instance under test must exist');

// 1. At rest, with the endless strip off screen, Kineto asks for (nearly) nothing.
const idle = await framesOver(1500);
assert.ok(idle < 3, `an idle page must not keep drawing: ${idle.toFixed(1)} Kineto frames a second`);

// 2. Pointer movement wakes the cursor and the parallax layers — and they settle again.
await page.mouse.move(200, 120);
await page.mouse.move(420, 160, { steps: 8 });
const moving = await framesOver(250);
assert.ok(moving > 10, `moving the pointer must wake the followers: ${moving.toFixed(1)} frames a second`);
await page.waitForTimeout(2500);
const settled = await framesOver(1000);
assert.ok(settled < 3, `once caught up the followers must stop: ${settled.toFixed(1)} frames a second`);

// 2b. A pause in mid-motion must not strand a settling loop: after resume()
// the next pointer move has to reach the follower and the layers again. (A
// cancelled frame id that was never cleared used to make wake() believe a loop
// was still scheduled — and never start one.)
const follower = () => page.evaluate(() => {
  const match = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(document.querySelector('.kt-cursor-follower')?.style.transform || '');
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
});
const layer = () => page.evaluate(() => document.querySelector('[data-kt-mouse-speed]').style.transform);
await page.mouse.move(700, 200, { steps: 4 });
await page.evaluate(() => {
  for (const [id, name] of [['scope', 'cursor'], ['parallax', 'mouseParallax']]) {
    const instance = window.Kineto.getInstance(document.getElementById(id), name);
    instance.pause();
    instance.resume();
  }
});
await page.mouse.move(150, 100, { steps: 6 });
await page.waitForTimeout(900);
const caughtUp = await follower();
assert.ok(caughtUp && Math.abs(caughtUp.x - 150) < 8 && Math.abs(caughtUp.y - 100) < 8,
  `after pause → resume the cursor follower must catch up with the pointer: ${JSON.stringify(caughtUp)}`);
// Mouse Parallax listens on its own element, so this move happens over it.
const layerBefore = await layer();
await page.mouse.move(120, 540, { steps: 3 });
await page.mouse.move(820, 660, { steps: 6 });
await page.waitForTimeout(600);
assert.notEqual(await layer(), layerBefore, 'after pause → resume the parallax layer must follow the pointer again');
await page.waitForTimeout(1500);

// 3. The strip runs on screen and stops again when it leaves.
await page.evaluate(() => document.getElementById('strip').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(600);
const onScreen = await framesOver(800);
assert.ok(onScreen > 20, `an endless strip in view must keep running: ${onScreen.toFixed(1)} frames a second`);
await page.evaluate(() => window.scrollTo(0, 0));
// A jump-scroll gives Scroll Velocity its full kick; its spring legitimately
// takes about two seconds to come back to rest before the page is idle again.
await page.waitForTimeout(3000);
const offScreen = await framesOver(1000);
assert.ok(offScreen < 3, `the same strip scrolled away must be suspended: ${offScreen.toFixed(1)} frames a second`);

// 4. The page's own pause wins over coming back into view.
await page.evaluate(() => window.Kineto.getInstance(document.getElementById('strip'), 'marquee').pause());
await page.evaluate(() => document.getElementById('strip').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(800);
const userPaused = await framesOver(800);
assert.ok(userPaused < 3, `a strip the page paused must stay paused on screen: ${userPaused.toFixed(1)} frames a second`);
await page.evaluate(() => window.Kineto.getInstance(document.getElementById('strip'), 'marquee').resume());
await page.waitForTimeout(300);
const userResumed = await framesOver(800);
assert.ok(userResumed > 20, `and resuming it on screen must run it: ${userResumed.toFixed(1)} frames a second`);

// 5. Resuming while it is OFF screen clears the pause but waits for the view.
await page.evaluate(() => window.Kineto.getInstance(document.getElementById('strip'), 'marquee').pause());
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(3000);
await page.evaluate(() => window.Kineto.getInstance(document.getElementById('strip'), 'marquee').resume());
const resumedOffScreen = await framesOver(800);
assert.ok(resumedOffScreen < 3, `resume() off screen must not start drawing yet: ${resumedOffScreen.toFixed(1)} frames a second`);
await page.evaluate(() => document.getElementById('strip').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(600);
const cameBack = await framesOver(800);
assert.ok(cameBack > 20, `…and must run once it scrolls in: ${cameBack.toFixed(1)} frames a second`);

// 6. Timer-driven work is suspended too — quietly. A terminal loader swaps its
// frames on timers, not rAF: off screen it must stop touching the DOM, and the
// page must never hear a "paused" it did not ask for.
await page.evaluate(() => {
  const loader = document.getElementById('loader');
  window.__loaderMutations = 0;
  window.__loaderEvents = [];
  new MutationObserver((list) => { window.__loaderMutations += list.length; })
    .observe(loader, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'style'] });
  loader.addEventListener('kt-loading-indicator-statechange', (event) => window.__loaderEvents.push(event.detail.state));
});
const loaderMutationsOver = async (ms) => {
  const start = await page.evaluate(() => window.__loaderMutations);
  await page.waitForTimeout(ms);
  return (await page.evaluate(() => window.__loaderMutations)) - start;
};
await page.evaluate(() => document.getElementById('loader').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(400);
const loaderOn = await loaderMutationsOver(800);
assert.ok(loaderOn > 3, `a terminal loader in view must keep animating: ${loaderOn} DOM changes`);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
const loaderOff = await loaderMutationsOver(1000);
assert.equal(loaderOff, 0, `a terminal loader off screen must stop touching the DOM: ${loaderOff} changes in a second`);
const loaderSeen = await page.evaluate(() => ({
  state: window.Kineto.getInstance(document.getElementById('loader'), 'loadingIndicator').state,
  // Only written on a state change, and none has happened.
  attr: document.getElementById('loader').dataset.ktLoadingState ?? null,
  events: window.__loaderEvents
}));
assert.deepEqual(loaderSeen, { state: 'running', attr: null, events: [] },
  'the system suspension must not show the page a paused state or send it state events');
await page.evaluate(() => document.getElementById('loader').scrollIntoView({ block: 'center' }));
await page.waitForTimeout(400);
assert.ok(await loaderMutationsOver(800) > 3, 'the loader must run again once it scrolls back in');

// 7. destroy() leaves no observer behind.
await page.evaluate(() => window.Kineto.destroy());
await page.waitForTimeout(300);
const afterDestroy = await framesOver(800);
assert.ok(afterDestroy < 1, `nothing may keep running after destroy(): ${afterDestroy.toFixed(1)} frames a second`);
assert.deepEqual(errors, [], 'no page errors');

await page.close();
await browser.close();
server.close();
console.log(`idle-cost OK (${browserName}) — idle ${idle.toFixed(1)}/s, pointer ${moving.toFixed(0)}/s → settled ${settled.toFixed(1)}/s, strip on ${onScreen.toFixed(0)}/s → off ${offScreen.toFixed(1)}/s, user pause and resume honoured on and off screen, terminal loader quiet off screen.`);
