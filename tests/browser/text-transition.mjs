// Text Transition — the `pop` variant and per-instance effect tuning.
//
//   1. Tuning is per instance. `blur`, `startScale` and `endScale` used to be
//      written into ONE module-level keyframe table from create(), so the last
//      Text Transition created decided the blur and scales of every other one
//      on the page. Two instances with different values must keep their own.
//   2. `pop` springs each letter in: it starts invisible, low, small and tilted
//      (opacity 0, translateY .4em, scale .4, rotate -15deg), OVERSHOOTS
//      (scale above 1, tilt past 0) and comes to rest exactly at identity.
//      The curve is a sampled damped spring played with a linear easing, the
//      letters are staggered, and it lasts 1 s unless the page says otherwise.
//   3. `pop` is per-letter even without charMode, and the old text leaves in
//      one short fade (no stagger), so the next title's entrance is what reads.
//   4. pause() holds the spring mid-flight, resume() finishes it, destroy()
//      hands the element back exactly as it was.
//
// Run: npm run build && node tests/browser/text-transition.mjs
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
const FIXTURE = '/__text_transition__.html';
const fixtureHtml = () => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/dist/kineto.css"><style>
  body{margin:0;padding:24px;background:#111;color:#fff;font:700 40px/1.2 system-ui}
  main>div{margin:0 0 24px}
</style></head><body><main>
  <div id="blur-strong" data-kt-text-transition="blur" data-kt-blur="30" data-kt-pause="60000"><div>ONE</div><div>TWO</div></div>
  <div id="blur-soft" data-kt-text-transition="blur" data-kt-blur="4" data-kt-pause="60000"><div>ONE</div><div>TWO</div></div>
  <div id="scale-small" data-kt-text-transition="scale" data-kt-start-scale="0.5" data-kt-pause="60000"><div>ONE</div><div>TWO</div></div>
  <div id="scale-big" data-kt-text-transition="scale" data-kt-start-scale="1.3" data-kt-pause="60000"><div>ONE</div><div>TWO</div></div>
  <div id="pop" data-kt-text-transition="pop" data-kt-pause="60000"><div>01 Kinetic</div><div>02 Spring</div></div>
</main>
<script src="/dist/kineto.umd.js"></script><script>Kineto.init();</script></body></html>`;
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
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${origin}${FIXTURE}`);
  await page.waitForFunction(() => Kineto.getInstance(document.getElementById('pop'), 'textTransition'));

  // 1. Per-instance tuning — read the keyframes each element is actually playing.
  // The leak showed on the SECOND text: each instance's first entrance was
  // built before the next instance overwrote the table, so cycle once and read
  // the entrance that follows.
  const tuning = await page.evaluate(async () => {
    const ids = ['blur-strong', 'blur-soft', 'scale-small', 'scale-big'];
    ids.forEach((id) => Kineto.getInstance(document.getElementById(id), 'textTransition').next());
    await new Promise((resolve) => setTimeout(resolve, 700));
    const firstFrame = (id) => {
      const inner = document.getElementById(id).querySelector('[aria-live]');
      const animation = inner.getAnimations().at(-1);
      return animation ? animation.effect.getKeyframes()[0] : null;
    };
    return {
      strong: firstFrame('blur-strong')?.filter,
      soft: firstFrame('blur-soft')?.filter,
      small: firstFrame('scale-small')?.transform,
      big: firstFrame('scale-big')?.transform
    };
  });
  assert.equal(tuning.strong, 'blur(30px)', 'the first Blur instance keeps its own blur amount');
  assert.equal(tuning.soft, 'blur(4px)', 'the second Blur instance keeps its own blur amount');
  assert.equal(tuning.small, 'scale(0.5)', 'the first Scale instance keeps its own start scale');
  assert.equal(tuning.big, 'scale(1.3)', 'the second Scale instance keeps its own start scale');

  // 2. The pop entrance, from the animations the letters are running.
  const pop = await page.evaluate(() => {
    const el = document.getElementById('pop');
    const letters = [...el.querySelectorAll('.kt-text-char')];
    const animations = letters.map((letter) => letter.getAnimations()[0]);
    const frames = animations[0].effect.getKeyframes();
    const scaleOf = (transform) => Number(/scale\(([-\d.]+)\)/.exec(transform)?.[1]);
    const rotateOf = (transform) => Number(/rotate\(([-\d.]+)deg\)/.exec(transform)?.[1]);
    const timing = animations.map((animation) => animation.effect.getTiming());
    return {
      text: letters.map((letter) => letter.textContent).join(''),
      letterCount: letters.length,
      first: frames[0],
      last: frames[frames.length - 1],
      frameCount: frames.length,
      maxScale: Math.max(...frames.map((frame) => scaleOf(frame.transform))),
      maxRotate: Math.max(...frames.map((frame) => rotateOf(frame.transform))),
      maxOpacity: Math.max(...frames.map((frame) => Number(frame.opacity))),
      duration: timing[0].duration,
      easing: timing[0].easing,
      delays: timing.map((entry) => entry.delay)
    };
  });
  assert.equal(pop.text, '01Kinetic', 'pop splits the first text into letters (spaces stay text nodes)');
  assert.equal(Number(pop.first.opacity), 0, 'letters start invisible');
  assert.match(pop.first.transform, /translateY\(0\.4(?:000)?em\) scale\(0\.4(?:000)?\) rotate\(-15(?:\.000)?deg\)/, 'letters start low, small and tilted');
  assert.match(pop.last.transform, /translateY\(0(?:\.0+)?em\) scale\(1(?:\.0+)?\) rotate\(0(?:\.0+)?deg\)/, 'letters come to rest exactly at identity');
  assert.equal(Number(pop.last.opacity), 1);
  assert.ok(pop.maxScale > 1.08 && pop.maxScale < 1.12, `the spring overshoots about 10 % in scale (got ${pop.maxScale})`);
  assert.ok(pop.maxRotate > 2 && pop.maxRotate < 3, `and swings past upright (got ${pop.maxRotate}deg)`);
  assert.ok(pop.maxOpacity <= 1, 'opacity never exceeds 1 while the transform overshoots');
  assert.ok(pop.frameCount >= 30, `the spring is sampled finely (${pop.frameCount} keyframes)`);
  assert.equal(pop.easing, 'linear', 'the curve lives in the keyframes, so the easing is linear');
  assert.equal(pop.duration, 1000, 'pop settles in 1 s when the page gives no duration');
  assert.ok(pop.delays.every((delay, index) => index === 0 || delay > pop.delays[index - 1]), 'letters are staggered left to right');
  assert.ok(Math.abs(pop.delays[1] - pop.delays[0] - 20) < 1, `default stagger is 20 ms (got ${pop.delays[1] - pop.delays[0]})`);

  // 4a. pause() holds the spring; resume() finishes it.
  const held = await page.evaluate(async () => {
    const el = document.getElementById('pop');
    const instance = Kineto.getInstance(el, 'textTransition');
    instance.replay();
    await new Promise((resolve) => setTimeout(resolve, 120));
    instance.pause();
    const letter = el.querySelector('.kt-text-char');
    // pause() completes at the next frame (the animation's ready promise), so the
    // hold time lands a frame after the call: sample only once it has.
    await letter.getAnimations()[0]?.ready;
    const before = getComputedStyle(letter).transform;
    await new Promise((resolve) => setTimeout(resolve, 300));
    const after = getComputedStyle(letter).transform;
    const state = letter.getAnimations()[0]?.playState;
    instance.resume();
    await Promise.all(el.getAnimations({ subtree: true }).map((animation) => animation.finished.catch(() => {})));
    return { before, after, state, rest: getComputedStyle(letter).transform };
  });
  assert.equal(held.state, 'paused', 'pause() pauses the letters');
  assert.equal(held.after, held.before, 'a paused spring does not move');
  assert.ok(['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(held.rest), `after resume the letter rests at identity (got ${held.rest})`);

  // 3. Next text: one short fade out, then the new letters pop in.
  const swap = await page.evaluate(async () => {
    const el = document.getElementById('pop');
    const instance = Kineto.getInstance(el, 'textTransition');
    instance.next();
    // The finished entrance stays in effect (fill: forwards), so the leave is the
    // most recent animation on each letter.
    const leaving = [...el.querySelectorAll('.kt-text-char')].map((letter) => letter.getAnimations().at(-1)?.effect.getTiming());
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      leaveDurations: [...new Set(leaving.map((timing) => timing?.duration))],
      leaveDelays: [...new Set(leaving.map((timing) => timing?.delay))],
      index: instance.index,
      text: [...el.querySelectorAll('.kt-text-char')].map((letter) => letter.textContent).join('')
    };
  });
  assert.equal(swap.leaveDelays.length, 1, 'the old text leaves all at once');
  assert.equal(swap.leaveDelays[0], 0);
  assert.ok(swap.leaveDurations.length === 1 && swap.leaveDurations[0] <= 200, `the old text fades quickly (got ${swap.leaveDurations})`);
  assert.equal(swap.index, 1);
  assert.equal(swap.text, '02Spring', 'the next text is on screen, letter by letter');

  // 4b. destroy() restores the element.
  const restored = await page.evaluate(() => {
    const el = document.createElement('div');
    el.innerHTML = '<div>A B</div><div>C</div>';
    el.setAttribute('class', 'probe');
    document.querySelector('main').append(el);
    const before = el.outerHTML;
    const instance = Kineto.create('textTransition', el, { effect: 'pop' });
    const split = el.querySelectorAll('.kt-text-char').length;
    instance.destroy();
    return { split, same: el.outerHTML === before };
  });
  assert.equal(restored.split, 2, 'pop forces per-letter mode on its own');
  assert.ok(restored.same, 'destroy() hands the element back exactly as it was');

  assert.deepEqual(errors, []);
  console.log(`text-transition OK (${browserName}) — per-instance blur/scale tuning, pop spring (overshoot ${pop.maxScale.toFixed(3)}, ${pop.frameCount} keyframes, ${pop.letterCount} staggered letters), quick leave, pause/resume, exact restore.`);
} finally {
  await browser.close();
  server.close();
}
