import assert from 'node:assert/strict';
import Kineto from '../src/core.js';
import { JSDOM } from 'jsdom';
import { coerce, dash, decomposeHangul, hangulFrames, q, readOpts, segmentText, snapshotInlineStyles } from '../src/utils.js';

assert.equal(dash('scrollSequence'), 'scroll-sequence');
assert.equal(coerce('true'), true);
assert.equal(coerce('false'), false);
assert.equal(coerce('12.5'), 12.5);
assert.deepEqual(coerce('{"once":false}'), { once: false });
assert.deepEqual(hangulFrames('강'), ['ㄱ', '가', '강']);
assert.deepEqual(decomposeHangul('A'), null);
assert.deepEqual(segmentText('가A'), ['가', 'A']);
assert.deepEqual(q('#missing'), [], 'q() must be SSR-safe');

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
