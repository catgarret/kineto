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

// ── "요청했는데 아무 일도 일어나지 않는" 경우에 이유가 남는가 ──────────────────
//
// `data-kt-tabs` 를 붙였는데 안에 tablist 가 없으면 모듈은 null 을 돌려주고 조용히
// 끝납니다. 화면에는 아무 변화가 없고, 예전에는 콘솔에도 진단에도 아무것도 남지
// 않아서 작성자가 원인을 알 길이 없었습니다(모듈 소스에 이런 자리가 78곳입니다).
// 이제 `KT_NOT_APPLICABLE` 이 어느 모듈이 어느 요소에서 물러났는지 남깁니다.
// 진단은 debug 일 때만 나가므로 기본 동작의 소음은 그대로 0입니다.
const { JSDOM } = await import('jsdom');
// core 만 import 하면 모듈은 하나도 등록되어 있지 않습니다. 실제 경로를 검사하려고
// 진짜 Tabs 를 등록합니다 — 가짜 모듈을 쓰면 core 의 분기만 보고 실제 모듈이 언제
// 물러나는지는 못 봅니다.
const tabsModule = (await import('../src/modules/tabs.js')).default;
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Element = dom.window.Element;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.getComputedStyle = dom.window.getComputedStyle;

Kineto.register('tabs', tabsModule);
const declined = [];
const stopWatching = Kineto.diagnostics.subscribe((event) => declined.push(event));
Kineto.config({ debug: true });

const host = document.createElement('div');
host.id = 'no-tablist-here';
host.className = 'card wide';
host.innerHTML = '<p>there is no tablist in here</p>';
document.body.appendChild(host);

assert.equal(Kineto.create('tabs', host, {}), null, 'tabs must decline markup it cannot use');
const notApplicable = declined.find((event) => event.code === 'KT_NOT_APPLICABLE');
assert.ok(notApplicable, 'declining to initialise must say so — otherwise nothing happens and nobody knows why');
assert.equal(notApplicable.module, 'tabs');
assert.equal(notApplicable.phase, 'create');
assert.equal(notApplicable.recoverable, true);
assert.equal(notApplicable.detail, 'div#no-tablist-here.card',
  'the detail must point at the element so the author can find it, without carrying page text');

stopWatching();
Kineto.diagnostics.clear();
Kineto.config({ debug: false, debugSink: null });
assert.deepEqual(Kineto.diagnostics.history, []);
const silent = [];
const stopSilent = Kineto.diagnostics.subscribe((event) => silent.push(event));
assert.equal(Kineto.create('tabs', host, {}), null);
assert.deepEqual(silent, [], 'with debug off a declined module must stay completely silent');
stopSilent();
host.remove();

console.log('diagnostics OK — codes, opt-in sink, subscription, history, validation, and the reason a module declined to initialise.');
