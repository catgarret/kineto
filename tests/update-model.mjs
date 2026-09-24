// Live-update model (audit B-5 / F-2). A module that implements update() must be
// updatable IN PLACE — same instance, no destroy/recreate — while modules that
// don't cleanly fall back to recreate. Kineto.updateModule() is the single entry
// point the demo and consumers use.
// Run: node tests/update-model.mjs
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.test/', pretendToBeVisual: true });
const { window: w } = dom;
globalThis.window = w; globalThis.document = w.document;
for (const k of ['Element', 'Node', 'NodeList', 'HTMLElement', 'Event', 'CustomEvent', 'getComputedStyle']) globalThis[k] = w[k];
globalThis.requestAnimationFrame = w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = w.cancelAnimationFrame = (id) => clearTimeout(id);
w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
class OB { observe() {} unobserve() {} disconnect() {} }
w.IntersectionObserver = OB; w.ResizeObserver = OB; globalThis.IntersectionObserver = OB; globalThis.ResizeObserver = OB;
if (!w.Element.prototype.animate) w.Element.prototype.animate = () => ({ onfinish: null, cancel() {}, play() {}, pause() {}, finished: Promise.resolve() });

const { default: Kineto } = await import('../dist/kineto.js');

// A module WITH update() (tooltip) updates in place: same instance, new content.
const btn = w.document.body.appendChild(w.document.createElement('button'));
btn.setAttribute('data-kt-title', 'first');
const inst = Kineto.create('tooltip', btn, { content: 'first' });
assert.ok(inst && typeof inst.update === 'function', 'tooltip must expose update()');
const before = Kineto.getInstance(btn, 'tooltip');
const live = Kineto.updateModule(btn, 'tooltip', { content: 'second' });
assert.equal(live, true, 'updateModule must report a live update for a module that supports it');
const after = Kineto.getInstance(btn, 'tooltip');
assert.equal(before, after, 'tooltip instance must be the SAME object after a live update (no recreate)');
const tip = w.document.querySelector('.kt-tooltip, [role="tooltip"]');
assert.ok(tip && /second/.test(tip.textContent), `tip content should update in place, got "${tip?.textContent}"`);

// A module WITHOUT update() falls back to recreate (still succeeds, new instance).
const box = w.document.body.appendChild(w.document.createElement('button'));
const sw1 = Kineto.create('switch', box, {});
const liveSwitch = Kineto.updateModule(box, 'switch', {});
assert.equal(liveSwitch, false, 'a module without update() must report NO live update (recreate fallback)');
const sw2 = Kineto.getInstance(box, 'switch');
assert.ok(sw2 && sw2 !== sw1, 'switch should have been recreated as a fresh instance');

// A module MAY answer `false` to a patch it cannot apply without a rebuild.
// That is a normal answer, not a failure: the instance is recreated quietly and
// updateModule reports "not live", exactly like a module with no update() at
// all. Stylize uses this — it swaps motion in place but rebuilds for cell size.
let seen = null;
Kineto.register('partialUpdate', { create: () => ({
  applied: [],
  // Only `colour` can change in place; anything else needs a fresh instance.
  update(patch) { if (Object.keys(patch).some((key) => key !== 'colour')) return false; this.applied.push(patch.colour); seen = this; return true; },
  destroy() {}
}) });
const partial = w.document.body.appendChild(w.document.createElement('div'));
const first = Kineto.create('partialUpdate', partial, { colour: 'red' });
assert.equal(Kineto.updateModule(partial, 'partialUpdate', { colour: 'blue' }), true, 'an accepted patch must report a live update');
assert.equal(Kineto.getInstance(partial, 'partialUpdate'), first, 'an accepted patch must keep the same instance');
assert.deepEqual(first.applied, ['blue'], 'the accepted patch must reach the instance');
assert.equal(Kineto.updateModule(partial, 'partialUpdate', { size: 4 }), false, 'a declined patch must report NO live update');
const rebuilt = Kineto.getInstance(partial, 'partialUpdate');
assert.ok(rebuilt && rebuilt !== first, 'a declined patch must recreate the instance');
// The recreate has to carry the merged options, or a declined patch would be
// silently dropped — the bug this fallback exists to avoid.
assert.equal(Kineto.updateModule(partial, 'partialUpdate', { colour: 'green' }), true, 'the recreated instance must accept live patches again');
assert.deepEqual(seen.applied, ['green'], 'the recreated instance must be the one now receiving patches');
Kineto.destroyModule(partial, 'partialUpdate');
Kineto.unregister('partialUpdate');

const radial = w.document.body.appendChild(w.document.createElement('div'));
radial.innerHTML = '<div>A</div><div>B</div><div>C</div><div>D</div><div>E</div>';
const radialLoop = Kineto.create('slider', radial, { effect: 'radial', loop: 'infinite', controls: false });
radialLoop.go(4);
Kineto.updateModule(radial, 'slider', { loop: 'off' });
const radialFinite = Kineto.getInstance(radial, 'slider');
assert.equal(radialFinite.index, 4, 'radial recreate must retain its active index when infinite mode is disabled');
assert.equal(radial.querySelector('.kt-active')?.textContent, 'E', 'the retained radial item must remain visually active');

Kineto.destroy();
let hidden = false, pauses = 0, resumes = 0;
Object.defineProperty(w.document, 'hidden', { configurable: true, get: () => hidden });
Kineto.register('visibilityProbe', { create: () => ({
  pause() { pauses++; return 'paused'; }, resume() { resumes++; return 'resumed'; }, destroy() {}
}) });
const probe = Kineto.create('visibilityProbe', btn);
const visibility = value => { hidden = value; w.document.dispatchEvent(new w.Event('visibilitychange')); };
assert.equal(probe.pause(), 'paused'); visibility(true); visibility(false);
assert.equal(resumes, 0, 'page visibility must preserve explicit instance pause');
assert.equal(probe.resume(), 'resumed'); assert.equal(resumes, 1, 'explicit resume releases the pause');
visibility(true); probe.resume();
assert.equal(resumes, 1, 'resume in a hidden tab waits for visibility');
visibility(false); assert.equal(resumes, 2, 'visibility resumes a released pause');
Kineto.pause(); visibility(true); visibility(false);
assert.equal(resumes, 2, 'global pause survives page visibility');
Kineto.resume(); assert.equal(resumes, 3, 'global resume releases explicit pause');
probe.destroy(); const counts = [pauses, resumes];
probe.pause(); probe.resume(); visibility(true); visibility(false);
assert.deepEqual([pauses, resumes], counts, 'destroyed normalized instances remain terminal');
assert.equal(Kineto.instanceCount, 0);
Kineto.unregister('visibilityProbe');

// A module whose pause() is public state suspends QUIETLY: the core tells its
// suspend(on) hook about every system change, whatever the page's own pause
// says, and never holds back the page's resume() — the module keeps its own
// work stopped while suspended.
const quietCalls = []; let quietResumes = 0;
Kineto.register('quietProbe', { create: () => ({
  pause() {}, resume() { quietResumes++; }, suspend(on) { quietCalls.push(on); }, destroy() {}
}) });
const quiet = Kineto.create('quietProbe', btn);
visibility(true); visibility(false);
assert.deepEqual(quietCalls, [true, false], 'a quiet module hears the hidden tab through suspend(), not pause()');
quiet.pause(); visibility(true);
assert.deepEqual(quietCalls, [true, false, true], 'a quiet module is suspended even while the page has it paused');
quiet.resume();
assert.equal(quietResumes, 1, "a quiet module takes the page's resume() at once, even while suspended");
visibility(false);
assert.deepEqual(quietCalls, [true, false, true, false], 'and is unsuspended when the tab returns');
quiet.destroy(); visibility(true); visibility(false);
assert.deepEqual(quietCalls, [true, false, true, false], 'a destroyed quiet module hears nothing more');
Kineto.unregister('quietProbe');

// Loading Indicator: pause()/resume() only move between running and paused,
// and a tab switch is a quiet suspension — a hidden indicator stays hidden and
// the page hears no state change. (resume() used to force 'running' from any
// state, so every tab switch revived finished indicators.)
const loadingHost = w.document.body.appendChild(w.document.createElement('div'));
const seenStates = [];
loadingHost.addEventListener('kt-loading-indicator-statechange', (event) => seenStates.push(event.detail.state));
const loading = Kineto.create('loadingIndicator', loadingHost, { type: 'spinner' });
visibility(true);
assert.equal(loading.state, 'running', 'a hidden tab must not change the public state');
assert.ok(loadingHost.classList.contains('is-suspended'), 'but it must stop the drawn motion');
visibility(false);
assert.ok(!loadingHost.classList.contains('is-suspended'), 'and restart it when the tab returns');
assert.deepEqual(seenStates, [], 'a tab switch must not send state events');
loading.hide();
loading.resume();
assert.equal(loading.state, 'hidden', 'resume() must not revive a hidden indicator');
visibility(true); visibility(false);
assert.equal(loading.state, 'hidden', 'nor may a tab switch');
loading.show(); loading.pause(); loading.resume();
assert.deepEqual(seenStates, ['hidden', 'running', 'paused', 'running'], 'only real state changes are reported');
loading.destroy();
assert.ok(!loadingHost.classList.contains('is-suspended') && !loadingHost.hasAttribute('class'), 'destroy() restores the host');

console.log('update-model OK — in-place update/recreate and explicit pause versus page visibility verified.');
process.exit(0);
