import assert from 'node:assert/strict';
import Kineto from '../src/core.js';
import { coerce, dash, decomposeHangul, hangulFrames, q, readOpts, segmentText } from '../src/utils.js';

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

assert.equal(Kineto.env.ssr, true);
assert.doesNotThrow(() => Kineto.scan());
assert.doesNotThrow(() => Kineto.init());
assert.doesNotThrow(() => Kineto.autoInit());
assert.doesNotThrow(() => Kineto.destroy());

console.log('Utility and SSR checks OK.');
