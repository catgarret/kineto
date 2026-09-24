import assert from 'node:assert/strict';
import Kineto from '../src/core.js';
import { JSDOM } from 'jsdom';
import { coerce, createProgressOutputs, cssString, dash, decomposeHangul, FRAME_MS, frameClock, frameEase, hangulFrames, latestEntry, measureThenApply, numberOption, q, readOpts, segmentText, selectAll, snapshotAttributes, snapshotInlineStyles, textOption, timeMs } from '../src/utils.js';

assert.equal(dash('scrollSequence'), 'scroll-sequence');
assert.equal(coerce('true'), true);
assert.equal(coerce('false'), false);
assert.equal(coerce('12.5'), 12.5);
assert.deepEqual(coerce('{"once":false}'), { once: false });
// A text option: absent → fallback, present-but-empty (reads as true) → empty.
assert.equal(textOption(undefined, '|'), '|');
assert.equal(textOption(coerce(''), '|'), '', 'data-kt-prefix="" means "no prefix", not the word "true"');
assert.equal(textOption(0), '0');
assert.equal(textOption('₩'), '₩');
// Selectors from options: an invalid one matches nothing instead of throwing.
assert.deepEqual(selectAll('div[', { querySelectorAll() { throw new SyntaxError('bad'); } }), []);
assert.equal(cssString('a"b'), 'a\\"b');
// frameEase: a per-frame lerp factor converted to elapsed time. One 60Hz frame
// is the factor itself; two 120Hz frames add up to one 60Hz frame; a long gap
// catches up at most four frames; a non-number never produces NaN.
{
  const close = (a, b) => Math.abs(a - b) < 1e-9;
  assert.ok(close(frameEase(0.2, FRAME_MS), 0.2));
  const half = frameEase(0.2, FRAME_MS / 2);
  assert.ok(close(1 - (1 - half) * (1 - half), 0.2), 'two half-frames equal one frame');
  assert.ok(close(frameEase(0.2, 10000), 1 - 0.8 ** 4), 'a long gap is capped at four frames');
  assert.equal(frameEase(1, 5), 1);
  assert.equal(frameEase('cubic-bezier(.2,.8,.2,1)', FRAME_MS), 0, 'a curve string is not a factor');
  const clock = frameClock(250);
  assert.ok(close(clock.tick(1000), FRAME_MS), 'the first tick counts as one frame');
  assert.equal(clock.tick(1008), 8);
  assert.ok(close(clock.tick(5000), FRAME_MS), 'waking after an idle gap counts as one frame, not four seconds');
  clock.reset();
  assert.ok(close(clock.tick(5010), FRAME_MS));
}
// IntersectionObserver batches are chronological: a node moved right after
// observe() reports [not visible, visible] in one callback, and only the last
// record is the current state.
{
  const a = { id: 'a' }; const b = { id: 'b' };
  const batch = [{ target: a, isIntersecting: false }, { target: b, isIntersecting: false }, { target: a, isIntersecting: true }];
  assert.equal(latestEntry(batch, a).isIntersecting, true, 'the newest record for the target wins');
  assert.equal(latestEntry(batch, b).isIntersecting, false);
  assert.equal(latestEntry(batch), batch[2], 'without a target, the newest record of the batch');
  assert.equal(latestEntry([], a), undefined);
}
assert.deepEqual(hangulFrames('강'), ['ㄱ', '가', '강']);
assert.deepEqual(decomposeHangul('A'), null);
assert.deepEqual(segmentText('가A'), ['가', 'A']);
assert.deepEqual(q('#missing'), [], 'q() must be SSR-safe');

// numberOption — the one numeric-option reader the modules share. A finite
// number is clamped; anything that is not a number falls back UNCLAMPED, so a
// module whose default sits outside its own bounds shows the bug instead of
// having it quietly corrected.
assert.equal(numberOption('12', 5), 12, 'a numeric string is a number');
assert.equal(numberOption(undefined, 5), 5, 'a missing value falls back');
assert.equal(numberOption('', 5), 5, 'an empty attribute falls back, it is not zero');
assert.equal(numberOption('abc', 5), 5, 'a typo falls back');
assert.equal(numberOption(Infinity, 5), 5, 'infinity is not a usable option value');
assert.equal(numberOption(0, 5), 0, 'zero is a value, not a missing option');
assert.equal(numberOption(99, 5, 0, 10), 10, 'a finite value is clamped into range');
assert.equal(numberOption(-99, 5, 0, 10), 0, 'clamping works at the bottom too');
assert.equal(numberOption('nope', -7, 0, 10), -7, 'the fallback is returned as written');

// timeMs — timing options written in seconds OR milliseconds. The integration
// map handed AI tools `hold: 1.4` for Text Transition, which read it as 1.4 ms
// and swapped words every frame; Text Split's contract default `hold: 1.2`
// clamped to 200 ms the same way. 20 and below is seconds, above is ms.
assert.equal(timeMs(1.4, 1600), 1400, 'a small value is seconds');
assert.equal(timeMs('1.2', 1600), 1200, 'from markup too');
assert.equal(timeMs(1400, 1600), 1400, 'a large value is already milliseconds');
assert.equal(timeMs('1600', 0), 1600);
assert.equal(timeMs(20, 0), 20000, '20 is the last value read as seconds');
assert.equal(timeMs(21, 0), 21, 'and 21 the first read as milliseconds');
assert.equal(timeMs(0, 1600), 0, 'zero is a value, not a missing option');
assert.equal(timeMs(undefined, 1600), 1600, 'a missing value falls back');
assert.equal(timeMs('', 1600), 1600, 'an empty attribute falls back, it is not zero');
assert.equal(timeMs('soon', 1600), 1600, 'a typo falls back');
assert.equal(timeMs(-3, 1600), 1600, 'a negative time falls back');

// snapshotAttributes must hand the element back exactly as it found it. The
// trap is `style`: once the CSSOM has written to it, Chromium and WebKit both
// answer a `removeAttribute('style')` by emptying the declaration block and
// serialising it straight back, so the element keeps a `style=""` it never had.
// jsdom does not reproduce that, so this checks the guard itself — the restore
// must leave no empty husk even when one is planted underneath it.
{
  const { JSDOM: SnapshotDom } = await import('jsdom');
  const page = new SnapshotDom('<main><div id="probe">x</div></main>');
  const probe = page.window.document.getElementById('probe');
  const restore = snapshotAttributes(probe, ['class', 'style']);
  probe.style.setProperty('--kt-probe', '1s');
  probe.classList.add('kt-probe');
  assert.ok(probe.hasAttribute('style'), 'the fixture must actually write an inline style');
  // Stand in for the engine behaviour: removing the attribute leaves the husk.
  const nativeRemove = probe.removeAttribute.bind(probe);
  let planted = false;
  probe.removeAttribute = (name) => {
    nativeRemove(name);
    if (name === 'style' && !planted) { planted = true; probe.setAttribute('style', ''); }
  };
  restore();
  assert.equal(probe.hasAttribute('style'), false, 'restore must not leave an empty style attribute behind');
  assert.equal(probe.hasAttribute('class'), false, 'and the same for any other attribute it removed');
}

const mockElement = {
  dataset: {
    ktReveal: 'fade-up',
    ktDuration: '0.8',
    ktOnce: 'false',
    ktOptions: '{"debug":true}'
  }
};
assert.deepEqual(readOpts(mockElement, 'reveal'), {
  preset: 'fade-up',
  duration: 0.8,
  once: false,
  options: { debug: true }
});
assert.deepEqual(
  readOpts({ dataset: { ktRadial: 'top', ktRadius: '280' } }, 'radial'),
  { position: 'top', radius: 280 },
  'radial activation values must preserve the legacy position option'
);

assert.equal(Kineto.env.ssr, true);
assert.doesNotThrow(() => Kineto.scan());
assert.doesNotThrow(() => Kineto.init());
assert.doesNotThrow(() => Kineto.autoInit());
assert.doesNotThrow(() => Kineto.destroy());

// snapshotInlineStyles(): destroy() must hand back the exact owned inline
// state — value AND priority, absent properties removed, and no leftover
// `style=""` on an element that never had one. Property names may be
// camelCase or kebab-case, including vendor prefixes.
{
  const { window } = new JSDOM('<!doctype html><div id="a" style="position: relative !important; color: red"></div><div id="b"></div>');
  const a = window.document.getElementById('a');
  const restoreA = snapshotInlineStyles(a, ['position', 'transform', 'will-change']);
  a.style.setProperty('position', 'absolute');
  a.style.transform = 'translateX(4px)';
  a.style.setProperty('will-change', 'transform');
  restoreA();
  assert.equal(a.style.getPropertyValue('position'), 'relative', 'restore puts back the prior value');
  assert.equal(a.style.getPropertyPriority('position'), 'important', 'restore keeps the prior !important priority');
  assert.equal(a.style.getPropertyValue('transform'), '', 'a property the element never set is removed');
  assert.equal(a.style.getPropertyValue('will-change'), '', 'kebab-case names are handled');
  assert.equal(a.style.getPropertyValue('color'), 'red', 'unrelated inline styles are untouched');

  const b = window.document.getElementById('b');
  const restoreB = snapshotInlineStyles(b, ['willChange', 'webkitUserDrag']);
  b.style.willChange = 'transform';
  b.style.webkitUserDrag = 'none';
  assert.ok(b.hasAttribute('style'), 'the module wrote inline styles');
  restoreB();
  assert.equal(b.hasAttribute('style'), false, 'an element that had no style attribute gets none back');
  assert.equal(b.style.webkitUserDrag, undefined, 'a vendor member the element never had is not left behind');

  // DOM adapters keep unsupported vendor properties only as camelCase members
  // (`-webkit-user-drag` has no CSSOM entry in jsdom); an authored member value
  // must still come back after a module overwrote it.
  const c = window.document.createElement('img');
  c.style.webkitUserDrag = 'element';
  const restoreC = snapshotInlineStyles(c, ['webkitUserDrag']);
  c.style.webkitUserDrag = 'none';
  restoreC();
  assert.equal(c.style.webkitUserDrag, 'element', 'an authored vendor member value is restored in DOM adapters');
}

// measureThenApply — the shared layout pass. Every read queued in one frame
// runs before any apply (so one layout serves all of them), applies keep their
// order, a failing step does not take the others down, and work an apply
// queues goes to the NEXT frame rather than reading a half-written DOM.
{
  const frames = [];
  const savedRaf = globalThis.requestAnimationFrame;
  const savedError = console.error;
  globalThis.requestAnimationFrame = (callback) => { frames.push(callback); return frames.length; };
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    const log = [];
    measureThenApply(() => { log.push('read a'); return 1; }, (value) => log.push(`apply a ${value}`));
    measureThenApply(() => { throw new Error('read failed'); }, () => log.push('apply broken'));
    measureThenApply(() => { log.push('read b'); return 2; }, (value) => {
      log.push(`apply b ${value}`);
      measureThenApply(() => { log.push('read c'); return 3; }, (next) => log.push(`apply c ${next}`));
    });
    assert.equal(frames.length, 1, 'one frame is requested for every job queued before it');
    assert.deepEqual(log, [], 'nothing runs synchronously');
    frames.shift()();
    assert.deepEqual(log, ['read a', 'read b', 'apply a 1', 'apply b 2'], 'all reads first, then the applies in order; a failed read skips only its own apply');
    assert.equal(errors.length, 1, 'the failed step is reported');
    assert.equal(frames.length, 1, 'work queued by an apply waits for the next frame');
    frames.shift()();
    assert.deepEqual(log.slice(-2), ['read c', 'apply c 3']);
    // A cancelled job never runs, and the shared frame goes once it is empty.
    let cancelledFrame = null;
    const savedCancel = globalThis.cancelAnimationFrame;
    globalThis.cancelAnimationFrame = (id) => { cancelledFrame = id; };
    const cancel = measureThenApply(() => { log.push('read d'); }, () => log.push('apply d'));
    cancel();
    assert.equal(cancelledFrame, frames.length, 'the frame nothing is waiting for is cancelled');
    frames.length = 0;
    globalThis.cancelAnimationFrame = savedCancel;
    assert.ok(!log.includes('read d'), 'a cancelled job never reads');
    globalThis.requestAnimationFrame = undefined;
    let immediate = null;
    measureThenApply(() => 'now', (value) => { immediate = value; });
    assert.equal(immediate, 'now', 'without requestAnimationFrame the pair runs at once');
  } finally {
    globalThis.requestAnimationFrame = savedRaf;
    console.error = savedError;
  }
}



// createProgressOutputs(): smoothed loader ticks often stay inside one rounded
// percentage. Preserve continuous --kt-progress / <progress>.value updates, but
// do not rewrite identical visible text, rounded metadata or --kt-percent.
{
  const { window } = new JSDOM('<!doctype html><div id="scope"><span id="out" data-kt-progress-output data-kt-progress-template="{value}% {state}"></span><progress id="meter" max="100" data-kt-progress-output></progress><progress id="bare" data-kt-progress-output></progress></div>');
  const scope = window.document.getElementById('scope');
  const out = window.document.getElementById('out');
  const meter = window.document.getElementById('meter');
  const bare = window.document.getElementById('bare');

  const textWrites = [];
  let textValue = out.textContent;
  Object.defineProperty(out, 'textContent', {
    configurable: true,
    get() { return textValue; },
    set(value) { textWrites.push(String(value)); textValue = String(value); }
  });

  const outStyleWrites = [];
  const nativeOutSetProperty = out.style.setProperty.bind(out.style);
  out.style.setProperty = (name, value, priority) => {
    outStyleWrites.push([name, String(value)]);
    return nativeOutSetProperty(name, value, priority);
  };

  const outputs = createProgressOutputs(scope);
  outputs.update(10.1, 'running');
  outputs.update(10.2, 'running');
  outputs.update(10.24, 'running');

  assert.deepEqual(textWrites, ['10% running'], 'same rounded percent/state/template must not rewrite visible output');
  assert.equal(out.dataset.ktProgressValue, '10');
  assert.equal(out.dataset.ktProgressState, 'running');
  assert.equal(outStyleWrites.filter(([name]) => name === '--kt-percent').length, 1, 'rounded percent CSS must be written once');
  assert.equal(outStyleWrites.filter(([name]) => name === '--kt-progress').length, 3, 'distinct serialized continuous progress values must remain observable');

  outputs.update(10.24, 'paused');
  assert.deepEqual(textWrites, ['10% running', '10% paused'], 'state changes must refresh the discrete output');

  out.dataset.ktProgressTemplate = 'state={state} value={value}';
  outputs.update(10.24, 'paused');
  assert.deepEqual(textWrites, ['10% running', '10% paused', 'state=paused value=10'], 'live template changes must invalidate the write cache');

  outputs.update(10.24, 'paused');
  assert.equal(textWrites.length, 3, 'identical progress/state/template must stay deduplicated');

  outputs.update(10.241, 'paused');
  assert.equal(outStyleWrites.filter(([name]) => name === '--kt-progress').length, 3, 'same four-decimal progress serialization must skip the CSS write');

  outputs.update(10.6, 'paused');
  assert.equal(textWrites.at(-1), 'state=paused value=11', 'integer boundary must refresh visible output');

  outputs.update(42.12345, 'running');
  assert.equal(meter.value, 42.12345, '<progress>.value keeps full numeric precision');
  outputs.update(42.12346, 'running');
  assert.equal(meter.value, 42.12346, '<progress>.value updates even within one rounded percent');
  // A <progress> without max has max = 1: the value is written on that scale,
  // not as 42 — which the element clamps to 1 and draws as a full bar.
  assert.ok(Math.abs(bare.value - 0.4212346) < 1e-9, `a bare <progress> shows 42 %, not a full bar (got ${bare.value})`);

  outputs.destroy();
}

console.log('Utility and SSR checks OK.');
