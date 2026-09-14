import assert from 'node:assert/strict';
import { waitForAssertions } from './src/wait-for-assertions.mjs';

let calls = 0;
await waitForAssertions(() => { calls += 1; });
assert.equal(calls, 1, 'already settled states must not wait');

await waitForAssertions(() => {
  calls += 1;
  assert.ok(calls >= 4, 'all required state must be ready');
}, { interval: 1 });
assert.equal(calls, 4, 'retry only until the assertion succeeds');

let settled = false;
const delayed = setTimeout(() => { settled = true; }, 150);
try {
  await waitForAssertions(() => assert.ok(settled, 'completion delayed beyond the former 100ms sleep'));
} finally {
  clearTimeout(delayed);
}

const missing = new Error('completion callback missing');
await assert.rejects(
  waitForAssertions(() => { throw missing; }, { timeout: 5, interval: 1 }),
  (error) => error.cause === missing && /within 5ms.*completion callback missing/.test(error.message)
);
await assert.rejects(waitForAssertions(() => assert.fail('DOM still mounted'), { timeout: 0 }), /DOM still mounted/);
console.log('Framework assertion wait OK: immediate, delayed, timeout, original failure retained.');
