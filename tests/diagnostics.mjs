import assert from 'node:assert/strict';
import Kineto from '../src/core.js';

const originalDebug = false;
const originalSink = null;
Kineto.config({ debug: originalDebug, debugSink: originalSink });
Kineto.diagnostics.clear();

const disabled = Kineto.diagnostics.emit({
  code: Kineto.diagnosticCodes.UNKNOWN_MODULE,
  module: 'missing',
  phase: 'create',
  recoverable: true
});
assert.equal(disabled.code, 'KT_UNKNOWN_MODULE');
assert.deepEqual(Kineto.diagnostics.history, [], 'diagnostics must not buffer while debug is disabled');

const received = [];
const sink = [];
const unsubscribe = Kineto.diagnostics.subscribe((event) => received.push(event));
Kineto.config({ debug: true, debugSink: (event) => sink.push(event) });
const cause = new Error('fixture failure');
const event = Kineto.diagnostics.emit({
  code: Kineto.diagnosticCodes.CREATE_FAILED,
  module: 'slider',
  phase: 'create',
  recoverable: true,
  cause,
  detail: { fixture: true }
});

assert.equal(event.cause, cause);
assert.equal(event.detail.fixture, true);
assert.deepEqual(received, [event]);
assert.deepEqual(sink, [event]);
assert.deepEqual(Kineto.diagnostics.history, [event]);
assert.throws(() => Kineto.diagnostics.create({ code: 'BAD', module: 'x', phase: 'create' }), /Invalid Kineto diagnostic code/);
assert.throws(() => Kineto.diagnostics.create({ code: 'KT_BAD', module: 'x', phase: 'unknown' }), /Invalid Kineto diagnostic phase/);

unsubscribe();
Kineto.diagnostics.clear();
Kineto.config({ debug: false, debugSink: null });
assert.deepEqual(Kineto.diagnostics.history, []);

console.log('diagnostics OK — codes, opt-in sink, subscription, history, and validation verified.');
