import assert from 'node:assert/strict';
import Kineto from '../src/core.js';
import { JSDOM } from 'jsdom';
import { coerce, dash, decomposeHangul, hangulFrames, numberOption, q, readOpts, segmentText, snapshotAttributes, snapshotInlineStyles } from '../src/utils.js';

assert.equal(dash('scrollSequence'), 'scroll-sequence');
assert.equal(coerce('true'), true);
assert.equal(coerce('false'), false);
assert.equal(coerce('12.5'), 12.5);
assert.deepEqual(coerce('{"once":false}'), { once: false });
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

console.log('Utility and SSR checks OK.');
